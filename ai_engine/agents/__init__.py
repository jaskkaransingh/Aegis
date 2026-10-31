"""
AEGIS Agent Modules.
Contains specialized autonomous forensic agents for incident investigation.
"""

from .evidence_analyst import (
    EvidenceAnalystAgent,
    EvidenceAnalystError,
    EvidenceValidationError,
    InvalidEvidenceReferenceError,
    OllamaInvocationError,
)
from .timeline_correlator import (
    TimelineCorrelatorAgent,
)

__all__ = [
    "EvidenceAnalystAgent",
    "EvidenceAnalystError",
    "EvidenceValidationError",
    "InvalidEvidenceReferenceError",
    "OllamaInvocationError",
    "TimelineCorrelatorAgent",
]

