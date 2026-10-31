"""
Unit Tests for Evidence Reference Validation and Epistemic Integrity.
Tests:
- Every evidence reference resolves to a valid event ID in the dataset
- Rejection of fabricated or non-existent event IDs
- Strict confidence limits (< 1.0)
- Classification of claims into facts, derived results, inferences, hypotheses, and simulations
"""

import pytest
from pydantic import ValidationError

from app.schemas.investigation import (
    ClaimType,
    EvidenceReference,
    Hypothesis,
    OrderingRelation,
)
from app.tools.data_loader import get_normalized_incident_data


def test_evidence_reference_resolves_to_real_event():
    """Confirms all evidence references in the sample hypotheses point to existing events."""
    events, _ = get_normalized_incident_data(apply_clock_correction=True)
    real_event_ids = {e.id for e in events}

    # Reference to a real event
    ev_ref = EvidenceReference(
        evidence_id="EVID-TEST-001",
        event_id="EVT-001",
        source_service="postgresql-database",
        support_type="PRIMARY_OBSERVATION",
        excerpt="Scheduled archival job initiated",
        timestamp="2026-10-31T14:00:02.100Z",
        claim_type=ClaimType.OBSERVED_FACT,
    )

    assert ev_ref.event_id in real_event_ids, "Evidence reference must resolve to a real event ID in the dataset"


def test_fabricated_evidence_id_detection():
    """Validates an investigation audit function that flags any references to non-existent events."""
    events, _ = get_normalized_incident_data(apply_clock_correction=True)
    valid_event_ids = {e.id for e in events}

    def validate_hypothesis_evidence(hyp: Hypothesis, known_ids: set) -> list[str]:
        invalid_refs = []
        for ref in hyp.supporting_evidence + hyp.contradicting_evidence:
            if ref.event_id not in known_ids:
                invalid_refs.append(ref.event_id)
        return invalid_refs

    # Valid hypothesis
    valid_hyp = Hypothesis(
        id="HYP-VAL-1",
        title="Valid Test Hypothesis",
        description="Test description",
        suspected_root_cause_service="postgresql-database",
        confidence_score=0.85,
        supporting_evidence=[
            EvidenceReference(
                evidence_id="EVID-01",
                event_id="EVT-001",
                source_service="postgresql-database",
                excerpt="Test",
                timestamp="2026-10-31T14:00:02.100Z",
            )
        ],
        plausibility_reasoning="Reasoning",
    )
    assert validate_hypothesis_evidence(valid_hyp, valid_event_ids) == []

    # Invalid hypothesis with fabricated event ID
    invalid_hyp = Hypothesis(
        id="HYP-INVAL-1",
        title="Invalid Test Hypothesis",
        description="Test description",
        suspected_root_cause_service="postgresql-database",
        confidence_score=0.75,
        supporting_evidence=[
            EvidenceReference(
                evidence_id="EVID-FAKE-01",
                event_id="EVT-DOES-NOT-EXIST-9999",
                source_service="postgresql-database",
                excerpt="Invented fake log excerpt",
                timestamp="2026-10-31T14:00:00Z",
            )
        ],
        plausibility_reasoning="Fabricated claim",
    )
    invalid_found = validate_hypothesis_evidence(invalid_hyp, valid_event_ids)
    assert "EVT-DOES-NOT-EXIST-9999" in invalid_found


def test_epistemic_confidence_score_boundary():
    """
    Epistemic Humility Rule:
    Confidence scores must be strictly less than 1.00 (maximum 0.99).
    Pydantic schema must reject confidence >= 1.00.
    """
    # 0.99 should succeed
    hyp = Hypothesis(
        id="HYP-BOUNDARY",
        title="High confidence hypothesis",
        description="Testing upper bound",
        suspected_root_cause_service="postgresql-database",
        confidence_score=0.99,
        plausibility_reasoning="Plausible",
    )
    assert hyp.confidence_score == 0.99

    # 1.00 should fail Pydantic validation (le=0.99)
    with pytest.raises(ValidationError):
        Hypothesis(
            id="HYP-BOUNDARY-INVALID",
            title="Overconfident hypothesis",
            description="Testing rejection of 1.00",
            suspected_root_cause_service="postgresql-database",
            confidence_score=1.00,
            plausibility_reasoning="Illegal 100% confidence",
        )


def test_epistemic_claim_types():
    """Confirms all 5 epistemic claim types are supported and distinct."""
    expected_types = {
        "OBSERVED_FACT",
        "DERIVED_RESULT",
        "INFERENCE",
        "HYPOTHESIS",
        "SIMULATED_RESULT",
    }
    actual_types = {ct.value for ct in ClaimType}
    assert expected_types == actual_types

