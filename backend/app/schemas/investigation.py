"""
AEGIS Schema: Investigation Models.
Defines schemas for epistemic claims (facts, derived results, inferences,
hypotheses, simulations), evidence references, timeline events, hypotheses,
and overall investigation results.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.events import DataQualityWarning


class ClaimType(str, Enum):
    """
    Epistemic classification of statements and claims in the investigation.
    Distinguishes observed facts from derived computations, inferences, and hypotheses.
    """
    OBSERVED_FACT = "OBSERVED_FACT"          # Directly observed from logs, metrics, or telemetry
    DERIVED_RESULT = "DERIVED_RESULT"        # Deterministically calculated (e.g. clock correction, graph shortest path)
    INFERENCE = "INFERENCE"                  # Logical conclusion supported by evidence
    HYPOTHESIS = "HYPOTHESIS"                # Plausible candidate explanation under active investigation
    SIMULATED_RESULT = "SIMULATED_RESULT"    # Counterfactual simulation or scenario projection


class OrderingRelation(str, Enum):
    """
    Temporal ordering relationship between two interval-corrected events.
    """
    STRICTLY_BEFORE = "STRICTLY_BEFORE"              # interval_A.end < interval_B.start
    STRICTLY_AFTER = "STRICTLY_AFTER"                # interval_A.start > interval_B.end
    CONCURRENT_OR_UNCERTAIN = "CONCURRENT_OR_UNCERTAIN"  # intervals overlap: no strict ordering can be asserted


class EvidenceReference(BaseModel):
    """
    Strict evidence pointer tying any claim or hypothesis back to an immutable event in the dataset.
    Every evidence reference must resolve to a valid event ID.
    """
    evidence_id: str = Field(..., description="Unique ID for this evidence association")
    event_id: str = Field(..., description="Canonical ID of the referenced event in the normalized log dataset")
    source_service: str = Field(..., description="Service emitting the evidence")
    support_type: str = Field(
        default="PRIMARY_OBSERVATION",
        description="Role in argument: 'PRIMARY_OBSERVATION', 'CORROBORATING', 'CONTRADICTORY'"
    )
    excerpt: str = Field(..., description="Direct message or relevant excerpt from the evidence log")
    timestamp: str = Field(..., description="Corrected timestamp string of the evidence event")
    claim_type: ClaimType = Field(
        default=ClaimType.OBSERVED_FACT,
        description="Epistemic status of the evidence itself"
    )

    model_config = ConfigDict(extra="ignore")


class TimelineEvent(BaseModel):
    """
    Represents an event on the reconstructed chronological timeline.
    Highlights uncertainty intervals and identifies events with overlapping (uncertain) ordering.
    """
    timeline_id: str = Field(..., description="Stable identifier for timeline node")
    event_id: str = Field(..., description="Reference to underlying NormalizedEvent ID")
    service: str = Field(..., description="Service name")
    corrected_timestamp: str = Field(..., description="UTC ISO 8601 corrected timestamp")
    uncertainty_seconds: float = Field(..., description="Uncertainty interval half-width (+/- seconds)")
    interval_start: str = Field(..., description="ISO 8601 start of timing uncertainty interval")
    interval_end: str = Field(..., description="ISO 8601 end of timing uncertainty interval")
    severity: str = Field(..., description="Event severity")
    summary: str = Field(..., description="Brief summary of event occurrence")
    claim_type: ClaimType = Field(
        default=ClaimType.DERIVED_RESULT,
        description="Epistemic category: derived chronological placement"
    )
    correlated_trace_ids: List[str] = Field(default_factory=list, description="Associated trace IDs")
    uncertain_ordering_with: List[str] = Field(
        default_factory=list,
        description="List of event IDs whose uncertainty intervals overlap with this event"
    )

    model_config = ConfigDict(extra="ignore")


class Hypothesis(BaseModel):
    """
    A plausible candidate explanation for the incident or cascade root cause.
    Maintains rigorous evidence traceability with supporting and contradicting evidence.
    """
    id: str = Field(..., description="Stable hypothesis identifier, e.g. 'HYP-001'")
    title: str = Field(..., description="Short title describing the hypothesis")
    description: str = Field(..., description="Comprehensive technical explanation of failure mechanism")
    suspected_root_cause_service: str = Field(..., description="Primary service suspected in this hypothesis")
    claim_type: ClaimType = Field(default=ClaimType.HYPOTHESIS, description="Epistemic tag")
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=0.99,
        description="Assessed confidence score between 0.0 and 0.99. Never 100% per epistemic humility rules."
    )
    supporting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Evidence records supporting this hypothesis"
    )
    contradicting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Evidence records contradicting or casting doubt on this hypothesis"
    )
    plausibility_reasoning: str = Field(..., description="Rationale for why this hypothesis is considered plausible")
    status: str = Field(
        default="UNDER_EVALUATION",
        description="Investigation state: 'UNDER_EVALUATION', 'CONFIRMED_ROOT_CAUSE', 'REFUTED', 'PLAUSIBLE_CONTRIBUTOR'"
    )

    model_config = ConfigDict(extra="ignore")


class InvestigationResult(BaseModel):
    """
    Output model representing the complete deterministic investigation package.
    """
    investigation_id: str = Field(..., description="Unique investigation identifier")
    incident_name: str = Field(..., description="Human-readable incident title")
    status: str = Field(default="COMPLETED", description="Investigation execution status")
    generated_at: str = Field(..., description="ISO 8601 timestamp of report generation")
    total_raw_events: int = Field(..., description="Count of raw ingested log entries")
    total_normalized_events: int = Field(..., description="Count of validated and normalized events")
    data_quality_warnings_count: int = Field(..., description="Number of data quality issues flagged")
    hypotheses: List[Hypothesis] = Field(
        default_factory=list,
        description="Plausible hypotheses evaluated with evidence citations"
    )
    timeline: List[TimelineEvent] = Field(
        default_factory=list,
        description="Time-corrected chronological sequence of significant incident events"
    )
    warnings: List[DataQualityWarning] = Field(
        default_factory=list,
        description="Data quality warnings encountered during normalization"
    )
    service_graph_summary: Dict[str, Any] = Field(
        default_factory=dict,
        description="Summary metrics and topology from the service dependency graph"
    )

    model_config = ConfigDict(extra="ignore")

