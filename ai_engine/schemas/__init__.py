"""
AEGIS AI Engine Data Schemas.
Exports typed contracts for evidence references, claims, hypotheses, and analyst models.
"""

from .common import ClaimType, EvidenceRole, InvestigationStatus, AnalysisStatus
from .evidence import EvidenceReference, EvidenceClaim
from .investigation import Hypothesis
from .analyst import (
    EvidenceInputRecord,
    AnalystObservation,
    AnalystPattern,
    AnalystExplanation,
    EvidenceAnalystLLMPayload,
    EvidenceAnalystResult,
)

__all__ = [
    "ClaimType",
    "EvidenceRole",
    "InvestigationStatus",
    "AnalysisStatus",
    "EvidenceReference",
    "EvidenceClaim",
    "Hypothesis",
    "EvidenceInputRecord",
    "AnalystObservation",
    "AnalystPattern",
    "AnalystExplanation",
    "EvidenceAnalystLLMPayload",
    "EvidenceAnalystResult",
]
