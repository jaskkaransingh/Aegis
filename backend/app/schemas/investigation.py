"""
AEGIS Schema: Investigation Models.
Defines schemas for epistemic claims, evidence references, timeline events,
hypotheses, and overall investigation results.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.events import DataQualityWarning


class ClaimType(str, Enum):
    """
    Epistemic classification of statements and claims in the investigation.
    Distinguishes observed facts from derived computations, inferences, and hypotheses.
    """
    OBSERVED_FACT = "OBSERVED_FACT"          # Directly observed from logs, metrics, or telemetry
    DERIVED_RESULT = "DERIVED_RESULT"        # Deterministically calculated (e.g. clock correction)
    INFERENCE = "INFERENCE"                  # Logical conclusion supported by evidence
    HYPOTHESIS = "HYPOTHESIS"                # Plausible candidate explanation under active investigation
    SIMULATED_RESULT = "SIMULATED_RESULT"    # Counterfactual simulation or scenario projection


class OrderingRelation(str, Enum):
    """
    Temporal ordering relationship between two interval-corrected events.
    """
    STRICTLY_BEFORE = "STRICTLY_BEFORE"
    STRICTLY_AFTER = "STRICTLY_AFTER"
    CONCURRENT_OR_UNCERTAIN = "CONCURRENT_OR_UNCERTAIN"


class EvidenceReference(BaseModel):
    """
    Strict evidence reference connecting investigation claims back to concrete log evidence.
    """
    evidence_id: str = Field(..., description="Unique ID for this evidence association")
    source: str = Field(..., description="Originating service or source component")
    relevance: Union[str, float] = Field(default="high", description="Assessed relevance to investigation")
    role: str = Field(
        default="supporting",
        description="Role in argument: supporting, contradicting, primary"
    )

    # Backward compatibility fields
    event_id: Optional[str] = Field(default=None, description="Canonical ID of the referenced event")
    source_service: Optional[str] = Field(default=None, description="Service emitting the evidence")
    support_type: Optional[str] = Field(default=None, description="Support type classification")
    excerpt: Optional[str] = Field(default="", description="Excerpt or message from log evidence")
    timestamp: Optional[str] = Field(default=None, description="Timestamp string of the evidence event")
    claim_type: Optional[ClaimType] = Field(default=ClaimType.OBSERVED_FACT, description="Epistemic status")

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def _normalize_evidence_reference(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        if "evidence_id" not in data and "event_id" in data:
            data["evidence_id"] = str(data["event_id"])
        if "source" not in data and "source_service" in data:
            data["source"] = str(data["source_service"])
        if "role" not in data and "support_type" in data:
            data["role"] = str(data["support_type"])
        return data

    @model_validator(mode="after")
    def _sync_fields(self) -> "EvidenceReference":
        if self.event_id is None:
            self.event_id = self.evidence_id
        if self.source_service is None:
            self.source_service = self.source
        if self.support_type is None:
            self.support_type = self.role
        return self


class Claim(BaseModel):
    """
    Structured assertion or finding with epistemic classification, cited evidence IDs,
    and calibrated confidence score.
    """
    claim_id: str = Field(..., description="Unique identifier for the claim")
    text: str = Field(..., description="Assertion text of the claim")
    claim_type: Union[ClaimType, str] = Field(default=ClaimType.INFERENCE, description="Epistemic category of claim")
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of supporting evidence")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=0.99,
        description="Confidence score strictly < 1.0 per epistemic humility rules"
    )
    confidence_basis: Optional[str] = Field(
        default=None,
        description="Reasoning or empirical basis underpinning the confidence score"
    )

    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class TimelineEvent(BaseModel):
    """
    Represents an event on the reconstructed chronological timeline.
    """
    timeline_id: str = Field(..., description="Stable identifier for timeline node")
    event_id: str = Field(..., description="Reference to underlying NormalizedEvent ID")
    service: str = Field(..., description="Service name")
    corrected_timestamp: str = Field(..., description="UTC ISO 8601 corrected timestamp")
    uncertainty_seconds: float = Field(default=0.0, description="Uncertainty interval half-width (+/- seconds)")
    interval_start: str = Field(default="", description="ISO 8601 start of timing uncertainty interval")
    interval_end: str = Field(default="", description="ISO 8601 end of timing uncertainty interval")
    severity: str = Field(default="INFO", description="Event severity")
    summary: str = Field(default="", description="Brief summary of event occurrence")
    claim_type: ClaimType = Field(
        default=ClaimType.DERIVED_RESULT,
        description="Epistemic category: derived chronological placement"
    )
    correlated_trace_ids: List[str] = Field(default_factory=list, description="Associated trace IDs")
    uncertain_ordering_with: List[str] = Field(
        default_factory=list,
        description="List of event IDs whose uncertainty intervals overlap with this event"
    )

    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class Hypothesis(BaseModel):
    """
    A plausible candidate explanation for the incident or cascade root cause.
    Maintains rigorous evidence traceability with supporting and contradicting evidence lists.
    """
    hypothesis_id: str = Field(..., description="Unique hypothesis identifier, e.g. 'HYP-001'")
    title: str = Field(..., description="Short title describing the hypothesis")
    explanation: str = Field(..., description="Comprehensive technical explanation of failure mechanism")
    supporting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="List of evidence reference IDs supporting this hypothesis"
    )
    contradicting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="List of evidence reference IDs contradicting this hypothesis"
    )
    unresolved_questions: List[str] = Field(
        default_factory=list,
        description="List of open or unresolved questions regarding this hypothesis"
    )
    status: str = Field(
        default="under_investigation",
        description="Investigation state: 'under_investigation', 'confirmed', 'refuted'"
    )

    # Backward compatibility fields
    id: Optional[str] = Field(default=None, description="Alias for hypothesis_id")
    description: Optional[str] = Field(default=None, description="Alias for explanation")
    suspected_root_cause_service: Optional[str] = Field(default=None, description="Primary service suspected")
    claim_type: ClaimType = Field(default=ClaimType.HYPOTHESIS, description="Epistemic tag")
    confidence_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=0.99,
        description="Assessed confidence score between 0.0 and 0.99. Never 100% per epistemic humility rules."
    )
    supporting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Evidence objects supporting this hypothesis"
    )
    contradicting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Evidence objects contradicting this hypothesis"
    )
    plausibility_reasoning: Optional[str] = Field(
        default=None,
        description="Rationale for why this hypothesis is considered plausible"
    )

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def _normalize_hypothesis(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        if "hypothesis_id" not in data and "id" in data:
            data["hypothesis_id"] = str(data["id"])
        if "explanation" not in data and "description" in data:
            data["explanation"] = str(data["description"])
        return data

    @model_validator(mode="after")
    def _sync_fields(self) -> "Hypothesis":
        if self.id is None:
            self.id = self.hypothesis_id
        if self.description is None:
            self.description = self.explanation

        # Synchronize evidence IDs from evidence objects if not populated
        if not self.supporting_evidence_ids and self.supporting_evidence:
            self.supporting_evidence_ids = [
                ref.evidence_id if isinstance(ref, EvidenceReference) else str(ref)
                for ref in self.supporting_evidence
            ]
        if not self.contradicting_evidence_ids and self.contradicting_evidence:
            self.contradicting_evidence_ids = [
                ref.evidence_id if isinstance(ref, EvidenceReference) else str(ref)
                for ref in self.contradicting_evidence
            ]

        # Synchronize evidence objects from evidence IDs if needed
        if not self.supporting_evidence and self.supporting_evidence_ids:
            self.supporting_evidence = [
                EvidenceReference(evidence_id=eid, source="system", relevance="high", role="supporting")
                for eid in self.supporting_evidence_ids
            ]
        if not self.contradicting_evidence and self.contradicting_evidence_ids:
            self.contradicting_evidence = [
                EvidenceReference(evidence_id=eid, source="system", relevance="high", role="contradicting")
                for eid in self.contradicting_evidence_ids
            ]

        if self.plausibility_reasoning is None:
            self.plausibility_reasoning = self.explanation

        return self


class InvestigationResult(BaseModel):
    """
    Output model representing the complete investigation package.
    """
    investigation_id: str = Field(..., description="Unique investigation identifier")
    incident_id: str = Field(default="INC-001", description="Identifier of the incident investigated")
    status: str = Field(default="completed", description="Investigation execution status")
    timeline: List[TimelineEvent] = Field(
        default_factory=list,
        description="Time-corrected chronological sequence of significant incident events"
    )
    hypotheses: List[Hypothesis] = Field(
        default_factory=list,
        description="Plausible hypotheses evaluated with evidence citations"
    )
    claims: List[Claim] = Field(
        default_factory=list,
        description="Epistemic claims generated during investigation"
    )
    data_quality_issues: List[Any] = Field(
        default_factory=list,
        description="Data quality issues or warnings encountered during normalization"
    )

    # Backward compatibility fields
    incident_name: Optional[str] = Field(default=None, description="Human-readable incident title")
    generated_at: Optional[str] = Field(default=None, description="ISO 8601 timestamp of report generation")
    total_raw_events: int = Field(default=0, description="Count of raw ingested log entries")
    total_normalized_events: int = Field(default=0, description="Count of normalized events")
    data_quality_warnings_count: int = Field(default=0, description="Count of data quality warnings")
    warnings: List[DataQualityWarning] = Field(default_factory=list, description="Alias for data_quality_issues")
    service_graph_summary: Dict[str, Any] = Field(
        default_factory=dict,
        description="Summary metrics from service dependency graph"
    )

    model_config = ConfigDict(extra="ignore")
