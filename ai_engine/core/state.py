"""
AEGIS Core: Investigation State.
Models the typed state container for evidence-grounded agentic workflows.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai_engine.schemas.common import InvestigationStatus
from ai_engine.schemas.evidence import EvidenceClaim, EvidenceReference
from ai_engine.schemas.investigation import Hypothesis


class InvestigationState(BaseModel):
    """
    Initial typed state container for an AEGIS forensic investigation.
    Maintains clean boundaries between observed telemetry, derived inferences,
    and candidate hypotheses.
    """
    investigation_id: str = Field(
        ...,
        description="Unique identifier for this investigation session."
    )
    incident_context: Dict[str, Any] = Field(
        default_factory=dict,
        description="High-level metadata regarding the incident (e.g. incident_id, environment)."
    )
    available_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Pool of verified canonical evidence records ingested for this incident."
    )
    claims: List[EvidenceClaim] = Field(
        default_factory=list,
        description="Structured assertions and inferences formulated during the investigation."
    )
    hypotheses: List[Hypothesis] = Field(
        default_factory=list,
        description="Evaluated competing explanations for failure mechanisms."
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Data quality anomalies, timing ambiguities, or epistemic warnings."
    )
    execution_status: InvestigationStatus = Field(
        default=InvestigationStatus.NOT_STARTED,
        description="Current operational lifecycle state of the investigation."
    )
    current_stage: str = Field(
        default="initialization",
        description="Current investigative pipeline stage (e.g. 'evidence_collection', 'hypothesis_testing')."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Supplemental runtime metadata or audit log annotations."
    )

    model_config = ConfigDict(extra="ignore")

    def add_evidence(self, evidence: EvidenceReference) -> None:
        """Adds a verified evidence record, preventing duplicate evidence IDs."""
        if not any(e.evidence_id == evidence.evidence_id for e in self.available_evidence):
            self.available_evidence.append(evidence)

    def add_claim(self, claim: EvidenceClaim) -> None:
        """Appends a validated claim."""
        self.claims.append(claim)

    def add_hypothesis(self, hypothesis: Hypothesis) -> None:
        """Appends or updates a candidate hypothesis."""
        for idx, h in enumerate(self.hypotheses):
            if h.hypothesis_id == hypothesis.hypothesis_id:
                self.hypotheses[idx] = hypothesis
                return
        self.hypotheses.append(hypothesis)

    def add_warning(self, warning_message: str) -> None:
        """Records a forensic limitation or data quality warning."""
        if warning_message and warning_message not in self.warnings:
            self.warnings.append(warning_message)

