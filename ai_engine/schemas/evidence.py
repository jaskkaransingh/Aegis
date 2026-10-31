"""
AEGIS Schema: Evidence Reference and Claim Models.
Enforces evidence grounding: factual assertions require verified telemetry citations.
"""

import re
from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ai_engine.schemas.common import ClaimType, EvidenceRole

# Canonical AEGIS event identifier pattern (e.g. EVT-001, EVT-2026-001, or alphanumeric IDs)
CANONICAL_ID_REGEX = re.compile(r"^[A-Za-z0-9_-]{2,64}$")


class EvidenceReference(BaseModel):
    """
    Validated citation pointing directly to concrete log evidence or telemetry.
    Strictly forbids fabricated or empty identifiers.
    """
    evidence_id: str = Field(
        ...,
        description="Canonical evidence or event identifier (e.g. 'EVT-001')."
    )
    source: str = Field(
        ...,
        description="Originating service or telemetry source (e.g. 'postgresql-database')."
    )
    role: EvidenceRole = Field(
        default=EvidenceRole.SUPPORTING,
        description="Role in argumentation (supporting, contradicting, primary, contextual)."
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="Recorded or corrected ISO 8601 timestamp string if available."
    )
    category: Optional[str] = Field(
        default=None,
        description="Event categorization (e.g. 'DB_POOL_EXHAUSTION', 'TIMEOUT')."
    )
    message: Optional[str] = Field(
        default=None,
        description="Summary or log excerpt corresponding to the evidence event."
    )
    relevance: Union[str, float] = Field(
        default="high",
        description="Assessed relevance to the investigation."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("evidence_id")
    @classmethod
    def _validate_evidence_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Evidence ID cannot be empty.")
        if not CANONICAL_ID_REGEX.match(clean):
            raise ValueError(
                f"Evidence ID '{clean}' contains invalid characters. Must be alphanumeric with '-' or '_'."
            )
        return clean

    @field_validator("source")
    @classmethod
    def _validate_source(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Evidence source service cannot be empty.")
        return clean


class EvidenceClaim(BaseModel):
    """
    A structured factual assertion or forensic inference.
    Factual claims (OBSERVED_FACT) MUST cite at least one verified evidence reference.
    """
    claim_id: str = Field(
        ...,
        description="Unique identifier for the claim (e.g. 'CLM-001')."
    )
    claim_text: str = Field(
        ...,
        description="Statement of the assertion or finding."
    )
    claim_type: ClaimType = Field(
        default=ClaimType.INFERENCE,
        description="Epistemic category of claim."
    )
    evidence_references: List[EvidenceReference] = Field(
        default_factory=list,
        description="Citations supporting or substantiating this claim."
    )
    explanation: str = Field(
        default="",
        description="Reasoning explaining the logical relationship between evidence and assertion."
    )
    confidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=0.99,
        description="Assessed confidence score. Strictly capped at 0.99 per epistemic humility rules."
    )

    model_config = ConfigDict(extra="ignore")

    @field_validator("claim_id")
    @classmethod
    def _validate_claim_id(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Claim ID cannot be empty.")
        return clean

    @field_validator("claim_text")
    @classmethod
    def _validate_claim_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Claim text cannot be empty.")
        return clean

    @model_validator(mode="after")
    def _enforce_factual_grounding(self) -> "EvidenceClaim":
        """
        Enforce epistemic grounding:
        Factual claims (OBSERVED_FACT) cannot be asserted without supporting evidence.
        """
        if self.claim_type == ClaimType.OBSERVED_FACT:
            if not self.evidence_references:
                raise ValueError(
                    f"Factual claim '{self.claim_id}' must cite at least one verified evidence reference."
                )
        return self

