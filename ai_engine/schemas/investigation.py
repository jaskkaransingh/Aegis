"""
AEGIS Schema: Investigation and Hypothesis Models.
Models competing explanations for system incidents with bi-directional evidence citations.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from ai_engine.schemas.evidence import EvidenceReference


class Hypothesis(BaseModel):
    """
    Candidate explanation for an incident or cascading failure mechanism.
    Tracks both supporting and contradicting evidence citations with epistemic humility.
    """
    hypothesis_id: str = Field(
        ...,
        description="Unique identifier for the hypothesis (e.g. 'HYP-001')."
    )
    title: str = Field(
        ...,
        description="Concise description of the suspected failure mechanism."
    )
    explanation: str = Field(
        ...,
        description="Comprehensive technical analysis of the failure chain."
    )
    supporting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Verified evidence citations corroborating this hypothesis."
    )
    contradicting_evidence: List[EvidenceReference] = Field(
        default_factory=list,
        description="Verified evidence citations challenging or refuting this hypothesis."
    )
    unresolved_questions: List[str] = Field(
        default_factory=list,
        description="Specific gaps or questions that remain unverified."
    )
    status: str = Field(
        default="under_investigation",
        description="Current evaluation status ('leading', 'plausible', 'refuted', 'under_investigation')."
    )
    confidence_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=0.99,
        description="Optional confidence score between 0.0 and 0.99. Never 1.0 per epistemic rules."
    )
    suspected_service: Optional[str] = Field(
        default=None,
        description="Primary infrastructure or service component suspected as the origin."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("hypothesis_id")
    @classmethod
    def _validate_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Hypothesis ID cannot be empty.")
        return clean

    @field_validator("title")
    @classmethod
    def _validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Hypothesis title cannot be empty.")
        return clean

    @field_validator("explanation")
    @classmethod
    def _validate_explanation(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Hypothesis explanation cannot be empty.")
        return clean

