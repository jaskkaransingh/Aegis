"""
AEGIS REST API Routes.
Exposes endpoints for health, logs, services catalog, and dependency graphs.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.graph.service_graph import ServiceGraphManager
from app.schemas.events import DataQualityWarning, NormalizedEvent
from app.schemas.investigation import (
    ClaimType,
    EvidenceReference,
    Hypothesis,
    InvestigationResult,
    TimelineEvent,
)
from app.tools.clock_correction import (
    determine_ordering_relation,
    format_iso_timestamp,
    identify_uncertain_orderings,
)
from app.tools.data_loader import (
    get_normalized_incident_data,
    load_clock_metadata,
    load_services_catalog,
)

router = APIRouter(prefix="/api", tags=["AEGIS Core API"])


# ---------------------------------------------------------
# Response Models
# ---------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="AEGIS Backend Engine")
    version: str = Field(..., example="0.1.0")
    timestamp: str
    environment: str


class LogsResponse(BaseModel):
    total_count: int
    returned_count: int
    clock_correction_active: bool
    applied_offsets: Dict[str, float]
    warnings_count: int
    data_quality_warnings: List[DataQualityWarning]
    events: List[NormalizedEvent]


class ServicesResponse(BaseModel):
    system_name: str
    environment: str
    total_services: int
    services: List[Dict[str, Any]]


class DependenciesResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    total_nodes: int
    total_edges: int
    critical_services: List[str]


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    status_code=status.HTTP_200_OK,
)
def get_health() -> HealthResponse:
    """Returns the operational status of the AEGIS backend."""
    return HealthResponse(
        status="healthy",
        service="AEGIS Backend Engine",
        version="0.1.0",
        timestamp=format_iso_timestamp(datetime.now(timezone.utc)),
        environment="development",
    )


@router.get(
    "/logs",
    response_model=LogsResponse,
    summary="Normalized Incident Logs",
    status_code=status.HTTP_200_OK,
)
def get_logs(
    service: Optional[str] = Query(None, description="Filter logs by service name"),
    severity: Optional[str] = Query(None, description="Filter logs by severity (INFO, WARN, ERROR, CRITICAL)"),
    trace_id: Optional[str] = Query(None, description="Filter logs by distributed trace ID"),
    apply_clock_correction: bool = Query(True, description="Whether to apply known clock skew corrections"),
) -> LogsResponse:
    """
    Returns validated and normalized incident logs with clock corrections applied.
    Preserves raw timestamps and details all data quality warnings.
    """
    try:
        events, warnings = get_normalized_incident_data(
            apply_clock_correction=apply_clock_correction
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Log data source inaccessible: {str(e)}",
        )

    # Apply filters
    filtered_events = events
    if service:
        filtered_events = [ev for ev in filtered_events if ev.service.lower() == service.lower()]
    if severity:
        filtered_events = [ev for ev in filtered_events if ev.severity.upper() == severity.upper()]
    if trace_id:
        filtered_events = [ev for ev in filtered_events if ev.trace_id == trace_id]

    clock_offsets = load_clock_metadata() if apply_clock_correction else {}
    applied_offsets = {k: v.offset_seconds for k, v in clock_offsets.items()}

    return LogsResponse(
        total_count=len(events),
        returned_count=len(filtered_events),
        clock_correction_active=apply_clock_correction,
        applied_offsets=applied_offsets,
        warnings_count=len(warnings),
        data_quality_warnings=warnings,
        events=filtered_events,
    )


@router.get(
    "/services",
    response_model=ServicesResponse,
    summary="Services Catalog",
    status_code=status.HTTP_200_OK,
)
def get_services() -> ServicesResponse:
    """Returns the registered microservice and infrastructure components."""
    try:
        catalog = load_services_catalog()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Services catalog not found: {str(e)}",
        )

    services_list = catalog.get("services", [])
    return ServicesResponse(
        system_name=catalog.get("system_name", "Unknown System"),
        environment=catalog.get("environment", "production"),
        total_services=len(services_list),
        services=services_list,
    )


@router.get(
    "/dependencies",
    response_model=DependenciesResponse,
    summary="Service Dependency Graph",
    status_code=status.HTTP_200_OK,
)
def get_dependencies() -> DependenciesResponse:
    """
    Returns the NetworkX-constructed directed service dependency graph serialized as JSON.
    Associates incident events and severities to graph nodes.
    Distinguishes static architectural dependencies from inferred causal links.
    """
    try:
        events, _ = get_normalized_incident_data(apply_clock_correction=True)
    except Exception:
        events = []

    graph_mgr = ServiceGraphManager()
    graph_mgr.attach_events(events)
    serialized = graph_mgr.to_dict()

    return DependenciesResponse(**serialized)


@router.get(
    "/timeline",
    response_model=List[TimelineEvent],
    summary="Time-Corrected Chronological Timeline",
    status_code=status.HTTP_200_OK,
)
def get_timeline() -> List[TimelineEvent]:
    """
    Constructs the chronological timeline of incident events with clock correction,
    uncertainty bounds, and cross-event concurrency/overlap markers.
    """
    events, _ = get_normalized_incident_data(apply_clock_correction=True)
    overlap_map = identify_uncertain_orderings(events)

    # Sort primarily by corrected timestamp
    sorted_events = sorted(events, key=lambda e: e.corrected_datetime)

    timeline: List[TimelineEvent] = []
    for idx, ev in enumerate(sorted_events):
        t_event = TimelineEvent(
            timeline_id=f"TL-{idx + 1:03d}",
            event_id=ev.id,
            service=ev.service,
            corrected_timestamp=format_iso_timestamp(ev.corrected_datetime),
            uncertainty_seconds=ev.uncertainty_seconds,
            interval_start=format_iso_timestamp(ev.time_interval_start),
            interval_end=format_iso_timestamp(ev.time_interval_end),
            severity=ev.severity,
            summary=ev.message[:120] + ("..." if len(ev.message) > 120 else ""),
            claim_type=ClaimType.DERIVED_RESULT,
            correlated_trace_ids=[ev.trace_id] if ev.trace_id else [],
            uncertain_ordering_with=overlap_map.get(ev.id, []),
        )
        timeline.append(t_event)

    return timeline


@router.get(
    "/investigation/preview",
    response_model=InvestigationResult,
    summary="Deterministic Investigation Preview",
    status_code=status.HTTP_200_OK,
)
def get_investigation_preview() -> InvestigationResult:
    """
    Generates a deterministic preliminary investigation package.
    Presents plausible candidate hypotheses linked strictly to verified log evidence.
    Conforms to epistemic humility rules (never assigns 100% confidence).
    """
    events, warnings = get_normalized_incident_data(apply_clock_correction=True)
    events_by_id = {ev.id: ev for ev in events}
    overlap_map = identify_uncertain_orderings(events)

    # Build timeline
    sorted_events = sorted(events, key=lambda e: e.corrected_datetime)
    timeline: List[TimelineEvent] = []
    for idx, ev in enumerate(sorted_events):
        timeline.append(
            TimelineEvent(
                timeline_id=f"TL-{idx + 1:03d}",
                event_id=ev.id,
                service=ev.service,
                corrected_timestamp=format_iso_timestamp(ev.corrected_datetime),
                uncertainty_seconds=ev.uncertainty_seconds,
                interval_start=format_iso_timestamp(ev.time_interval_start),
                interval_end=format_iso_timestamp(ev.time_interval_end),
                severity=ev.severity,
                summary=ev.message[:120] + ("..." if len(ev.message) > 120 else ""),
                claim_type=ClaimType.DERIVED_RESULT,
                correlated_trace_ids=[ev.trace_id] if ev.trace_id else [],
                uncertain_ordering_with=overlap_map.get(ev.id, []),
            )
        )

    # Hypothesis 1: Database Connection Pool Starvation
    hyp1_evidence_sup = []
    for eid in ["EVT-001", "EVT-002", "EVT-003", "EVT-004"]:
        if eid in events_by_id:
            ev = events_by_id[eid]
            hyp1_evidence_sup.append(
                EvidenceReference(
                    evidence_id=f"EVID-{eid}-01",
                    event_id=ev.id,
                    source_service=ev.service,
                    support_type="PRIMARY_OBSERVATION",
                    excerpt=ev.message,
                    timestamp=format_iso_timestamp(ev.corrected_datetime),
                    claim_type=ClaimType.OBSERVED_FACT,
                )
            )

    hypothesis_1 = Hypothesis(
        id="HYP-001",
        title="PostgreSQL Connection Pool Exhaustion from Archival Batch",
        description=(
            "An unindexed archival query acquired row locks and held worker connections "
            "for 78+ seconds, saturating the database pool (100/100 connections). Downstream "
            "Appointment Service and Hospital Records Service timed out on connection checkout."
        ),
        suspected_root_cause_service="postgresql-database",
        claim_type=ClaimType.HYPOTHESIS,
        confidence_score=0.88,  # Epistemic limitation: < 1.00
        supporting_evidence=hyp1_evidence_sup,
        contradicting_evidence=[],
        plausibility_reasoning=(
            "Chronologically earliest anomaly occurs at database (EVT-001 at 14:00:02Z). "
            "Immediately preceded connection pool saturation (EVT-002 at 14:00:15Z), followed "
            "by synchronous caller timeouts at 14:00:22Z and 14:00:24Z."
        ),
        status="UNDER_EVALUATION",
    )

    # Hypothesis 2: Authentication Service Token Cascade (Plausible distractor)
    hyp2_sup = []
    hyp2_contra = []
    if "EVT-009" in events_by_id:
        ev = events_by_id["EVT-009"]
        hyp2_sup.append(
            EvidenceReference(
                evidence_id="EVID-EVT-009-01",
                event_id=ev.id,
                source_service=ev.service,
                support_type="CORROBORATING",
                excerpt=ev.message,
                timestamp=format_iso_timestamp(ev.corrected_datetime),
                claim_type=ClaimType.OBSERVED_FACT,
            )
        )
    if "EVT-016" in events_by_id:
        ev = events_by_id["EVT-016"]
        hyp2_contra.append(
            EvidenceReference(
                evidence_id="EVID-EVT-016-01",
                event_id=ev.id,
                source_service=ev.service,
                support_type="CONTRADICTORY",
                excerpt=ev.message,
                timestamp=format_iso_timestamp(ev.corrected_datetime),
                claim_type=ClaimType.OBSERVED_FACT,
            )
        )

    hypothesis_2 = Hypothesis(
        id="HYP-002",
        title="Authentication Token Revocation Cascade Failure",
        description=(
            "Auth Service experienced session revocation check timeouts against the database, "
            "which could plausibly reject downstream requests across all services."
        ),
        suspected_root_cause_service="auth-service",
        claim_type=ClaimType.HYPOTHESIS,
        confidence_score=0.28,
        supporting_evidence=hyp2_sup,
        contradicting_evidence=hyp2_contra,
        plausibility_reasoning=(
            "While Auth Service logged timeout warnings, token verification fell back to "
            "cached entries (EVT-016 confirmed tokens continued to issue and validate). "
            "Auth degradation was a symptom of DB latency rather than the initiating root cause."
        ),
        status="REFUTED",
    )

    # Graph summary
    graph_mgr = ServiceGraphManager()
    graph_mgr.attach_events(events)
    graph_summary = graph_mgr.to_dict()

    return InvestigationResult(
        investigation_id="INV-20261031-001",
        incident_name="Metro Health Cross-Service Cascading Outage",
        status="COMPLETED",
        generated_at=format_iso_timestamp(datetime.now(timezone.utc)),
        total_raw_events=len(events),
        total_normalized_events=len(events),
        data_quality_warnings_count=len(warnings),
        hypotheses=[hypothesis_1, hypothesis_2],
        timeline=timeline,
        warnings=warnings,
        service_graph_summary=graph_summary,
    )
