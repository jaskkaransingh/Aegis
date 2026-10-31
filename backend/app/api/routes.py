"""
AEGIS REST API Routes.
Exposes endpoints for health, services catalog, raw logs, normalized logs,
dependency graphs, timelines, and investigation previews.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.graph.service_graph import ServiceGraphManager
from app.schemas.events import DataQualityWarning, NormalizedEvent
from app.schemas.investigation import (
    Claim,
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
    load_dependencies,
    load_logs,
    load_services,
    load_services_catalog,
)
from app.tools.evidence_normalizer import normalize_logs

router = APIRouter(prefix="/api", tags=["AEGIS Core API"])


# ---------------------------------------------------------
# Response Models
# ---------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "ok"})
    environment: str


class DependenciesResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    total_nodes: int
    total_edges: int
    critical_services: List[str]


class InvestigateRequest(BaseModel):
    incident_id: str = Field(..., description="Target incident identifier for investigation")


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
        status="ok",
        environment="simulation",
    )


@router.get(
    "/services",
    summary="Services Catalog",
    status_code=status.HTTP_200_OK,
)
async def get_services() -> Any:
    """
    Returns the parsed contents of services.json.
    Includes exception handling for missing or unreadable files.
    """
    try:
        return await load_services()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Services catalog not found: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load services catalog: {str(e)}",
        )


@router.get(
    "/logs",
    summary="Raw Incident Logs",
    status_code=status.HTTP_200_OK,
)
async def get_logs(
    service: Optional[str] = Query(None, description="Optional service name filter"),
    severity: Optional[str] = Query(None, description="Optional severity/level filter"),
) -> Any:
    """
    Returns the raw logs from logs.json.
    Includes basic exception handling and optional query filtering.
    """
    try:
        raw_logs = await load_logs()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Logs data source not found: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load logs: {str(e)}",
        )

    filtered = raw_logs
    if service:
        srv_lower = service.lower()
        filtered = [
            l for l in filtered
            if str(l.get("service", "")).lower() == srv_lower
            or str(l.get("service", "")).lower().replace("-service", "") == srv_lower.replace("-service", "")
        ]
    if severity:
        sev_upper = severity.upper()
        filtered = [
            l for l in filtered
            if str(l.get("level") or l.get("severity") or "").upper() == sev_upper
        ]

    return filtered


@router.get(
    "/logs/normalized",
    response_model=List[NormalizedEvent],
    summary="Normalized & Time-Corrected Logs",
    status_code=status.HTTP_200_OK,
)
async def get_normalized_logs() -> List[NormalizedEvent]:
    """
    Loads raw logs, passes them through normalize_logs, and returns
    the cleaned, deduplicated, and timestamp-corrected data.
    """
    try:
        raw_logs = await load_logs()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Logs data source not found: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load raw logs: {str(e)}",
        )

    try:
        normalized_events = normalize_logs(raw_logs)
        return normalized_events
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to normalize logs: {str(e)}",
        )


@router.get(
    "/dependencies",
    summary="Service Dependency Graph",
    status_code=status.HTTP_200_OK,
)
async def get_dependencies() -> Any:
    """
    Loads and returns the contents of dependencies.json using the data_loader utility.
    Includes exception handling for missing or unreadable files.
    """
    try:
        return await load_dependencies()
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dependencies file not found: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dependencies: {str(e)}",
        )


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

    # Hypothesis 1: Database Connection Pool Exhaustion
    hyp1_evidence_sup = []
    for eid in ["EVT-001", "EVT-002", "EVT-003", "EVT-004"]:
        if eid in events_by_id:
            ev = events_by_id[eid]
            hyp1_evidence_sup.append(
                EvidenceReference(
                    evidence_id=f"EVID-{eid}-01",
                    event_id=ev.id,
                    source_service=ev.service,
                    source=ev.service,
                    role="PRIMARY_OBSERVATION",
                    support_type="PRIMARY_OBSERVATION",
                    excerpt=ev.message,
                    timestamp=format_iso_timestamp(ev.corrected_datetime),
                    claim_type=ClaimType.OBSERVED_FACT,
                )
            )

    hypothesis_1 = Hypothesis(
        id="HYP-001",
        hypothesis_id="HYP-001",
        title="PostgreSQL Connection Pool Exhaustion Following Configuration Change",
        explanation=(
            "A database configuration update was followed by connection-pool exhaustion (100/100 "
            "connections) and downstream service timeouts. The available log evidence establishes the "
            "sequence but does not independently establish the full cause of the configuration change."
        ),
        description=(
            "A database configuration update was followed by connection-pool exhaustion (100/100 "
            "connections) and downstream service timeouts. The available log evidence establishes the "
            "sequence but does not independently establish the full cause of the configuration change."
        ),
        suspected_root_cause_service="postgresql-database",
        claim_type=ClaimType.HYPOTHESIS,
        confidence_score=0.88,
        supporting_evidence=hyp1_evidence_sup,
        contradicting_evidence=[],
        plausibility_reasoning=(
            "Chronologically earliest anomaly occurs at database (EVT-001 at 14:00:02Z). "
            "Preceded connection pool saturation (EVT-002 at 14:00:15Z), followed by "
            "synchronous caller timeouts at 14:00:22Z."
        ),
        status="under_investigation",
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
                source=ev.service,
                role="CORROBORATING",
                support_type="CORROBORATING",
                excerpt=ev.message,
                timestamp=format_iso_timestamp(ev.corrected_datetime),
                claim_type=ClaimType.OBSERVED_FACT,
            )
        )

    hypothesis_2 = Hypothesis(
        id="HYP-002",
        hypothesis_id="HYP-002",
        title="Authentication Token Revocation Cascade Failure",
        explanation=(
            "Auth Service experienced session revocation check timeouts against the database, "
            "which was evaluated as a possible initiator of widespread access rejections."
        ),
        description=(
            "Auth Service experienced session revocation check timeouts against the database, "
            "which was evaluated as a possible initiator of widespread access rejections."
        ),
        suspected_root_cause_service="auth-service",
        claim_type=ClaimType.HYPOTHESIS,
        confidence_score=0.28,
        supporting_evidence=hyp2_sup,
        contradicting_evidence=hyp2_contra,
        plausibility_reasoning=(
            "Auth Service session timeouts were a downstream symptom of DB exhaustion; "
            "local JWT validation remained operational."
        ),
        status="refuted",
    )

    graph_mgr = ServiceGraphManager()
    graph_mgr.attach_events(events)
    graph_summary = graph_mgr.to_dict()

    return InvestigationResult(
        investigation_id="INV-20261031-001",
        incident_id="INC-CIVICHEALTH-001",
        incident_name="CivicHealth Cascading Outage",
        status="COMPLETED",
        generated_at=format_iso_timestamp(datetime.now(timezone.utc)),
        total_raw_events=len(events),
        total_normalized_events=len(events),
        data_quality_warnings_count=len(warnings),
        hypotheses=[hypothesis_1, hypothesis_2],
        timeline=timeline,
        warnings=warnings,
        data_quality_issues=warnings,
        service_graph_summary=graph_summary,
    )


@router.post(
    "/investigate",
    response_model=InvestigationResult,
    summary="Trigger AI Investigation (Contract Stub)",
    status_code=status.HTTP_200_OK,
)
def trigger_investigation(payload: InvestigateRequest) -> InvestigationResult:
    """
    Synchronously triggers an AI incident investigation.
    Acts as a contract stub for the frontend interface. Returns a mock completed
    investigation containing a dummy timeline event, a dummy hypothesis,
    and a message indicating 'AI Integration Pending'.
    """
    now_iso = format_iso_timestamp(datetime.now(timezone.utc))

    dummy_timeline_event = TimelineEvent(
        timeline_id="TL-STUB-001",
        event_id="EVT-001",
        service="api-gateway",
        corrected_timestamp=now_iso,
        uncertainty_seconds=0.0,
        interval_start=now_iso,
        interval_end=now_iso,
        severity="INFO",
        summary="Simulated incident trigger received. AI integration pending.",
        claim_type=ClaimType.DERIVED_RESULT,
        correlated_trace_ids=["trace-stub-001"],
        uncertain_ordering_with=[],
    )

    dummy_hypothesis = Hypothesis(
        hypothesis_id="HYP-STUB-001",
        title="AI Investigation Placeholder",
        explanation="Automated root cause analysis pipeline pending AI integration.",
        supporting_evidence_ids=["EVT-001"],
        contradicting_evidence_ids=[],
        unresolved_questions=["Awaiting full LLM investigation agent integration."],
        status="under_investigation",
        confidence_score=0.50,
    )

    dummy_claim = Claim(
        claim_id="CLM-STUB-001",
        text="AI Integration Pending",
        claim_type=ClaimType.INFERENCE,
        evidence_ids=["EVT-001"],
        confidence=0.50,
        confidence_basis="Mock contract stub response for frontend integration",
    )

    return InvestigationResult(
        investigation_id="INV-STUB-001",
        incident_id=payload.incident_id,
        incident_name=f"Investigation for {payload.incident_id}",
        status="completed",
        message="AI Integration Pending",
        generated_at=now_iso,
        total_raw_events=1,
        total_normalized_events=1,
        data_quality_warnings_count=0,
        timeline=[dummy_timeline_event],
        hypotheses=[dummy_hypothesis],
        claims=[dummy_claim],
        data_quality_issues=[],
        warnings=[],
        service_graph_summary={},
    )
