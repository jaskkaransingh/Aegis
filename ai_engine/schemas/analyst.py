"""
AEGIS Schema: Evidence Analyst Models.
Defines input payloads, intermediate LLM response structures, and validated
analysis results for the Evidence Analyst Agent.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ai_engine.schemas.common import AnalysisStatus, ClaimType
from ai_engine.schemas.evidence import CANONICAL_ID_REGEX


class EvidenceInputRecord(BaseModel):
    """
    Validated input evidence record accepted by the Evidence Analyst.
    Represents an ingested, normalized, or observed telemetry record.
    """
    evidence_id: str = Field(
        ...,
        description="Canonical evidence identifier (e.g. 'EVT-001', 'TEST-EVT-001')."
    )
    service: str = Field(
        ...,
        description="Originating service or infrastructure component."
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="ISO 8601 recorded or corrected timestamp string."
    )
    category: Optional[str] = Field(
        default=None,
        description="Telemetry domain or error categorization."
    )
    severity: Optional[str] = Field(
        default=None,
        description="Severity level (INFO, WARN, ERROR, CRITICAL)."
    )
    message: Optional[str] = Field(
        default="",
        description="Original log line or event message text."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Supplemental tracing or payload metadata."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("evidence_id")
    @classmethod
    def _validate_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Evidence ID cannot be empty.")
        if not CANONICAL_ID_REGEX.match(clean):
            raise ValueError(
                f"Evidence ID '{clean}' contains invalid characters. Must be alphanumeric with '-' or '_'."
            )
        return clean

    @field_validator("service")
    @classmethod
    def _validate_service(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Service name cannot be empty.")
        return clean


class AnalystObservation(BaseModel):
    """
    Specific observed event or pattern identified by the analyst.
    Enforces epistemic rule: OBSERVED_FACT must cite at least one evidence ID.
    """
    statement: str = Field(
        ...,
        description="Concise description of the observed event or finding."
    )
    claim_type: ClaimType = Field(
        default=ClaimType.OBSERVED_FACT,
        description="Epistemic status: OBSERVED_FACT or INFERENCE."
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Canonical event IDs directly supporting this observation."
    )
    explanation: str = Field(
        default="",
        description="Brief explanation of how the cited evidence supports the observation."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("statement")
    @classmethod
    def _validate_statement(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Observation statement cannot be empty.")
        return clean

    @model_validator(mode="after")
    def _validate_factual_citations(self) -> "AnalystObservation":
        if self.claim_type == ClaimType.OBSERVED_FACT and not self.evidence_ids:
            raise ValueError(
                f"Observed fact '{self.statement}' must cite at least one evidence ID."
            )
        return self


class AnalystPattern(BaseModel):
    """
    Recurring error, cross-service cascade symptom, or anomaly pattern.
    """
    pattern_name: str = Field(
        ...,
        description="Descriptive title of the identified pattern."
    )
    pattern_type: str = Field(
        ...,
        description="Classification (e.g. 'repeated_error', 'cross_service_symptom', 'temporal_sequence')."
    )
    description: str = Field(
        ...,
        description="Detailed explanation of the recurring behavior or relationship."
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Set of evidence records used to identify this pattern."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("pattern_name", "pattern_type", "description")
    @classmethod
    def _validate_non_empty(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Field cannot be empty.")
        return clean


class AnalystExplanation(BaseModel):
    """
    Preliminary candidate explanation formulated from the evidence.
    Must never be labeled as a confirmed root cause.
    """
    explanation: str = Field(
        ...,
        description="Plausible explanation of failure propagation or behavior."
    )
    supporting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="Evidence records corroborating this explanation."
    )
    contradicting_evidence_ids: List[str] = Field(
        default_factory=list,
        description="Evidence records challenging this explanation."
    )
    assumptions: List[str] = Field(
        default_factory=list,
        description="Unverified conditions or assumptions underpinning this explanation."
    )
    unresolved_questions: List[str] = Field(
        default_factory=list,
        description="Information gaps or questions requiring further investigation."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("explanation")
    @classmethod
    def _validate_explanation(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Explanation text cannot be empty.")
        return clean


class EvidenceAnalystLLMPayload(BaseModel):
    """
    Expected JSON schema for direct model generation via Ollama structured output.
    """
    observations: List[AnalystObservation] = Field(
        default_factory=list,
        description="Key factual observations and preliminary inferences."
    )
    patterns: List[AnalystPattern] = Field(
        default_factory=list,
        description="Identified recurring patterns or anomaly clusters."
    )
    preliminary_explanations: List[AnalystExplanation] = Field(
        default_factory=list,
        description="Plausible preliminary candidate hypotheses with assumptions."
    )
    information_gaps: List[str] = Field(
        default_factory=list,
        description="Missing information or uninstrumented logs that limit the analysis."
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Analytical boundaries, unexamined services, or timing ambiguities."
    )

    model_config = ConfigDict(extra="ignore")


class EvidenceAnalystResult(BaseModel):
    """
    Final validated analysis output returned by the Evidence Analyst Agent.
    """
    status: AnalysisStatus = Field(
        ...,
        description="Execution status of the analysis."
    )
    observations: List[AnalystObservation] = Field(
        default_factory=list,
        description="Validated observations grounded in supplied evidence."
    )
    patterns: List[AnalystPattern] = Field(
        default_factory=list,
        description="Validated recurring patterns and relationships."
    )
    preliminary_explanations: List[AnalystExplanation] = Field(
        default_factory=list,
        description="Preliminary explanations with explicit assumptions and questions."
    )
    information_gaps: List[str] = Field(
        default_factory=list,
        description="Information gaps supported by the input."
    )
    limitations: List[str] = Field(
        default_factory=list,
        description="Explicit limitations of this analysis session."
    )
    validation_errors: List[str] = Field(
        default_factory=list,
        description="Records of any rejected or invalid evidence references."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Execution metadata: model name, record counts, execution time."
    )

    model_config = ConfigDict(extra="ignore")

