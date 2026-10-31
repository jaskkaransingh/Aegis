"""
Unit Tests for AEGIS Data Contracts and Epistemic Schemas.
Verifies validation rules, epistemic constraints, and serialization.
"""

import json
import pytest
from pydantic import ValidationError

from ai_engine.schemas import (
    ClaimType,
    EvidenceRole,
    EvidenceReference,
    EvidenceClaim,
    Hypothesis,
    InvestigationStatus,
)
from ai_engine.core.state import InvestigationState


class TestEvidenceReference:
    def test_valid_evidence_reference(self):
        ref = EvidenceReference(
            evidence_id="EVT-001",
            source="postgresql-database",
            role=EvidenceRole.PRIMARY,
            timestamp="2026-10-31T14:00:02Z",
            category="DB_POOL_EXHAUSTION",
            message="Connection pool exhausted: 100/100 active connections.",
        )
        assert ref.evidence_id == "EVT-001"
        assert ref.source == "postgresql-database"
        assert ref.role == EvidenceRole.PRIMARY
        assert ref.relevance == "high"

    def test_empty_evidence_id_rejected(self):
        with pytest.raises(ValidationError):
            EvidenceReference(evidence_id="   ", source="service-a")

    def test_invalid_characters_in_evidence_id_rejected(self):
        with pytest.raises(ValidationError):
            EvidenceReference(evidence_id="EVT!001@BAD", source="service-a")

    def test_empty_source_rejected(self):
        with pytest.raises(ValidationError):
            EvidenceReference(evidence_id="EVT-002", source="  ")


class TestEvidenceClaim:
    def test_valid_factual_claim(self):
        ref = EvidenceReference(evidence_id="EVT-001", source="database")
        claim = EvidenceClaim(
            claim_id="CLM-001",
            claim_text="Database pool saturation was observed.",
            claim_type=ClaimType.OBSERVED_FACT,
            evidence_references=[ref],
            explanation="EVT-001 directly records saturation.",
            confidence=0.98,
        )
        assert claim.claim_id == "CLM-001"
        assert len(claim.evidence_references) == 1
        assert claim.confidence == 0.98

    def test_factual_claim_without_evidence_rejected(self):
        """Epistemic rule: Factual claims must not be asserted without evidence citations."""
        with pytest.raises(ValidationError) as exc_info:
            EvidenceClaim(
                claim_id="CLM-002",
                claim_text="Payment service failed first.",
                claim_type=ClaimType.OBSERVED_FACT,
                evidence_references=[],
            )
        assert "must cite at least one verified evidence reference" in str(exc_info.value)

    def test_inference_claim_without_direct_evidence_allowed(self):
        """Inferences may be asserted as intermediate reasoning without direct telemetry."""
        claim = EvidenceClaim(
            claim_id="CLM-003",
            claim_text="Client retry amplification likely exacerbated database queue depth.",
            claim_type=ClaimType.INFERENCE,
            evidence_references=[],
            explanation="Inferred from architecture topology and queue growth dynamics.",
        )
        assert claim.claim_type == ClaimType.INFERENCE
        assert len(claim.evidence_references) == 0

    def test_confidence_capped_below_one(self):
        """Epistemic humility rule: Confidence cannot be 1.0 or greater."""
        ref = EvidenceReference(evidence_id="EVT-001", source="database")
        with pytest.raises(ValidationError):
            EvidenceClaim(
                claim_id="CLM-004",
                claim_text="Absolute certainty claim.",
                claim_type=ClaimType.OBSERVED_FACT,
                evidence_references=[ref],
                confidence=1.0,  # Must be <= 0.99
            )

    def test_negative_confidence_rejected(self):
        ref = EvidenceReference(evidence_id="EVT-001", source="database")
        with pytest.raises(ValidationError):
            EvidenceClaim(
                claim_id="CLM-005",
                claim_text="Negative confidence claim.",
                claim_type=ClaimType.OBSERVED_FACT,
                evidence_references=[ref],
                confidence=-0.1,
            )


class TestHypothesis:
    def test_valid_hypothesis(self):
        sup_ref = EvidenceReference(evidence_id="EVT-001", source="database")
        con_ref = EvidenceReference(evidence_id="EVT-010", source="payment")
        hyp = Hypothesis(
            hypothesis_id="HYP-001",
            title="Archival Query Lock Contention",
            explanation="Sequential scan query held RowShareLock on admissions archive table.",
            supporting_evidence=[sup_ref],
            contradicting_evidence=[con_ref],
            unresolved_questions=["Was chrony active during query execution?"],
            status="leading",
            confidence_score=0.91,
            suspected_service="postgresql-database",
        )
        assert hyp.hypothesis_id == "HYP-001"
        assert len(hyp.supporting_evidence) == 1
        assert len(hyp.contradicting_evidence) == 1
        assert hyp.confidence_score == 0.91

    def test_hypothesis_confidence_score_capped(self):
        with pytest.raises(ValidationError):
            Hypothesis(
                hypothesis_id="HYP-002",
                title="Invalid Confidence",
                explanation="Explanation text",
                confidence_score=1.0,  # Disallowed
            )

    def test_empty_hypothesis_fields_rejected(self):
        with pytest.raises(ValidationError):
            Hypothesis(hypothesis_id="   ", title="Title", explanation="Explanation")

        with pytest.raises(ValidationError):
            Hypothesis(hypothesis_id="HYP-003", title="  ", explanation="Explanation")

        with pytest.raises(ValidationError):
            Hypothesis(hypothesis_id="HYP-003", title="Title", explanation="  ")


class TestInvestigationState:
    def test_state_lifecycle_and_helpers(self):
        state = InvestigationState(
            investigation_id="INV-001",
            incident_context={"incident_id": "INC-2026-0881"},
            execution_status=InvestigationStatus.NOT_STARTED,
        )
        assert state.execution_status == InvestigationStatus.NOT_STARTED

        # Add evidence
        ev = EvidenceReference(evidence_id="EVT-001", source="db")
        state.add_evidence(ev)
        assert len(state.available_evidence) == 1

        # Duplicate evidence ID deduplication
        state.add_evidence(ev)
        assert len(state.available_evidence) == 1

        # Add claim
        cl = EvidenceClaim(
            claim_id="CLM-001",
            claim_text="Database pool exhausted.",
            claim_type=ClaimType.OBSERVED_FACT,
            evidence_references=[ev],
        )
        state.add_claim(cl)
        assert len(state.claims) == 1

        # Add hypothesis
        h = Hypothesis(
            hypothesis_id="HYP-001",
            title="Exhaustion",
            explanation="Lock contention cascade",
        )
        state.add_hypothesis(h)
        assert len(state.hypotheses) == 1

        # Add warning
        state.add_warning("Clock skew detected on payment service.")
        assert len(state.warnings) == 1

        # Verify serialization and deserialization
        raw_json = state.model_dump_json()
        assert "INV-001" in raw_json
        parsed = json.loads(raw_json)
        restored = InvestigationState.model_validate(parsed)
        assert restored.investigation_id == "INV-001"
        assert len(restored.available_evidence) == 1
        assert restored.claims[0].claim_id == "CLM-001"

