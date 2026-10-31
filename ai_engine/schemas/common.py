"""
AEGIS Schema: Common Enums and Base Types.
Establishes epistemic classifications and shared status definitions.
"""

from enum import Enum


class ClaimType(str, Enum):
    """
    Epistemic classification of statements in the forensic investigation.
    Enforces strict distinction between observed telemetry, derived mathematics,
    and inferences/hypotheses.
    """
    OBSERVED_FACT = "OBSERVED_FACT"          # Directly observed from logs, metrics, or telemetry
    DERIVED_RESULT = "DERIVED_RESULT"        # Deterministically calculated (e.g. clock offset correction)
    INFERENCE = "INFERENCE"                  # Logical deduction backed by evidence
    HYPOTHESIS = "HYPOTHESIS"                # Plausible candidate explanation under active investigation
    SIMULATED_RESULT = "SIMULATED_RESULT"    # Counterfactual scenario projection


class EvidenceRole(str, Enum):
    """
    Role of an evidence reference in an argumentative claim or hypothesis.
    """
    SUPPORTING = "supporting"
    CONTRADICTING = "contradicting"
    PRIMARY = "primary"
    CONTEXTUAL = "contextual"


class InvestigationStatus(str, Enum):
    """
    Operational status of an ongoing or completed investigation.
    """
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    AWAITING_VALIDATION = "awaiting_validation"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisStatus(str, Enum):
    """
    Operational status of an evidence analyst execution.
    """
    SUCCESS = "success"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"
    INVALID_MODEL_OUTPUT = "invalid_model_output"
    FAILED = "failed"

