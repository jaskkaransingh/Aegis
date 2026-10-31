"""
Unit Tests for AEGIS Evidence Analyst Agent.
Covers valid analysis workflows, strict deterministic citation validation,
input bounding, empty inputs, duplicate detection, and prompt injection defense.
All tests use deterministic mocks without requiring a running Ollama daemon.
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, patch

from ai_engine.config import AIEngineConfig
from ai_engine.schemas.common import AnalysisStatus, ClaimType
from ai_engine.schemas.analyst import (
    EvidenceInputRecord,
    AnalystObservation,
    AnalystPattern,
    AnalystExplanation,
    EvidenceAnalystLLMPayload,
    EvidenceAnalystResult,
)
from ai_engine.agents.evidence_analyst import (
    EvidenceAnalystAgent,
    EvidenceValidationError,
    InvalidEvidenceReferenceError,
    OllamaInvocationError,
)
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaStructuredOutputError,
)
from ai_engine.tests.fixtures.synthetic_evidence import (
    SYNTHETIC_TEST_EVIDENCE,
    SYNTHETIC_PROMPT_INJECTION_EVIDENCE,
    SYNTHETIC_OVERSIZED_EVIDENCE_GENERATOR,
)


@pytest.fixture
def mock_config():
    return AIEngineConfig(
        ollama_base_url="http://127.0.0.1:11434",
        ollama_model="llama3.2:3b",
        max_evidence_count=50,
        max_payload_bytes=131072,
        analyst_strict_mode=True,
    )


@pytest.fixture
def valid_llm_payload_dict():
    """Deterministic valid LLM response matching SYNTHETIC_TEST_EVIDENCE."""
    return {
        "observations": [
            {
                "statement": "Synthetic DB pool reached maximum capacity (100%).",
                "claim_type": "OBSERVED_FACT",
                "evidence_ids": ["TEST-EVT-001"],
                "explanation": "TEST-EVT-001 logs 100% capacity saturation.",
            },
            {
                "statement": "Gateway timeouts were likely caused by database exhaustion.",
                "claim_type": "INFERENCE",
                "evidence_ids": ["TEST-EVT-001", "TEST-EVT-002"],
                "explanation": "Timeout at synthetic-api correlates with DB pool saturation.",
            },
        ],
        "patterns": [
            {
                "pattern_name": "Cascade Saturation Pattern",
                "pattern_type": "cascading_failure",
                "description": "DB saturation triggered upstream gateway timeouts.",
                "evidence_ids": ["TEST-EVT-001", "TEST-EVT-002"],
            }
        ],
        "preliminary_explanations": [
            {
                "explanation": "Database connection exhaustion cascaded to API ingress timeouts.",
                "supporting_evidence_ids": ["TEST-EVT-001", "TEST-EVT-002"],
                "contradicting_evidence_ids": [],
                "assumptions": ["Network connectivity between API and DB was normal."],
                "unresolved_questions": ["What caused the initial worker retry storm?"],
            }
        ],
        "information_gaps": ["Worker queue depth telemetry is uninstrumented."],
        "limitations": ["Only 3 synthetic records analyzed in this session."],
    }


# =============================================================================
# VALID BEHAVIOR TESTS (1 - 5)
# =============================================================================

def test_valid_evidence_produces_valid_analysis(mock_config, valid_llm_payload_dict):
    """Case 1: Valid evidence produces a valid structured analysis."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = valid_llm_payload_dict

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert len(result.observations) == 2
        assert len(result.patterns) == 1
        assert len(result.preliminary_explanations) == 1
        assert result.metadata["input_count"] == 3
        assert mock_client.generate_structured.called

    asyncio.run(_test())


def test_multiple_evidence_records_cited(mock_config, valid_llm_payload_dict):
    """Case 2: Multiple evidence records can be cited in a single observation or pattern."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = valid_llm_payload_dict

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        multi_cite_obs = result.observations[1]
        assert len(multi_cite_obs.evidence_ids) == 2
        assert "TEST-EVT-001" in multi_cite_obs.evidence_ids
        assert "TEST-EVT-002" in multi_cite_obs.evidence_ids

    asyncio.run(_test())


def test_observations_preserve_canonical_event_ids(mock_config, valid_llm_payload_dict):
    """Case 3: Observations preserve exact canonical event identifiers."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = valid_llm_payload_dict

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        cited_ids = {eid for obs in result.observations for eid in obs.evidence_ids}
        assert cited_ids.issubset({"TEST-EVT-001", "TEST-EVT-002", "TEST-EVT-003"})

    asyncio.run(_test())


def test_inferences_labeled_correctly(mock_config, valid_llm_payload_dict):
    """Case 4: Inferences are explicitly distinguished from observed facts."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = valid_llm_payload_dict

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        obs_fact = result.observations[0]
        obs_inf = result.observations[1]

        assert obs_fact.claim_type == ClaimType.OBSERVED_FACT
        assert obs_inf.claim_type == ClaimType.INFERENCE

    asyncio.run(_test())


def test_missing_optional_fields_do_not_crash(mock_config, valid_llm_payload_dict):
    """Case 5: Sparse evidence records with missing optional fields validate cleanly."""
    async def _test():
        sparse_evidence = [
            EvidenceInputRecord(evidence_id="TEST-EVT-001", service="minimal-svc"),
            EvidenceInputRecord(evidence_id="TEST-EVT-002", service="other-svc"),
        ]

        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = valid_llm_payload_dict

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(sparse_evidence)

        assert result.status == AnalysisStatus.SUCCESS
        assert result.metadata["input_count"] == 2

    asyncio.run(_test())


# =============================================================================
# INVALID BEHAVIOR & REJECTION TESTS (6 - 15)
# =============================================================================

def test_unknown_evidence_id_rejected(mock_config, valid_llm_payload_dict):
    """Case 6: Unknown evidence ID not in the input set is strictly rejected."""
    async def _test():
        # Model hallucinates TEST-EVT-999
        bad_payload = dict(valid_llm_payload_dict)
        bad_payload["observations"] = [
            {
                "statement": "Fabricated observation.",
                "claim_type": "OBSERVED_FACT",
                "evidence_ids": ["TEST-EVT-999"],  # NOT IN INPUT
                "explanation": "No basis",
            }
        ]

        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = bad_payload

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        with pytest.raises(InvalidEvidenceReferenceError) as exc_info:
            await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert "unknown/fabricated evidence ID: 'TEST-EVT-999'" in str(exc_info.value)

    asyncio.run(_test())


def test_fabricated_evidence_reference_rejected(mock_config, valid_llm_payload_dict):
    """Case 7: Completely fabricated evidence reference in explanations is rejected."""
    async def _test():
        bad_payload = dict(valid_llm_payload_dict)
        bad_payload["preliminary_explanations"] = [
            {
                "explanation": "Fabricated hypothesis.",
                "supporting_evidence_ids": ["EVT-NON-EXISTENT-XYZ"],
                "contradicting_evidence_ids": [],
            }
        ]

        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = bad_payload

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        with pytest.raises(InvalidEvidenceReferenceError) as exc_info:
            await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert "EVT-NON-EXISTENT-XYZ" in str(exc_info.value)

    asyncio.run(_test())


def test_observed_fact_without_citations_rejected(mock_config, valid_llm_payload_dict):
    """Case 8: An observed fact claim without citations is rejected by schema validator."""
    async def _test():
        bad_payload = dict(valid_llm_payload_dict)
        bad_payload["observations"] = [
            {
                "statement": "Observed fact with no evidence.",
                "claim_type": "OBSERVED_FACT",
                "evidence_ids": [],  # Violates rule
                "explanation": "None",
            }
        ]

        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = bad_payload

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        # Fails schema validation inside generate_structured / model_validate
        assert result.status == AnalysisStatus.INVALID_MODEL_OUTPUT

    asyncio.run(_test())


def test_malformed_model_json_handled_cleanly(mock_config):
    """Case 9: Malformed model JSON does not crash the agent; returns INVALID_MODEL_OUTPUT."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.side_effect = OllamaStructuredOutputError("Invalid JSON syntax")

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.INVALID_MODEL_OUTPUT
        assert len(result.validation_errors) > 0
        assert "Invalid JSON syntax" in result.validation_errors[0]

    asyncio.run(_test())


def test_empty_evidence_input_does_not_call_ollama(mock_config):
    """Case 10: Empty evidence input immediately returns INSUFFICIENT_EVIDENCE without LLM call."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze([])

        assert result.status == AnalysisStatus.INSUFFICIENT_EVIDENCE
        assert result.metadata["input_count"] == 0
        assert len(result.information_gaps) > 0
        assert not mock_client.generate_structured.called

    asyncio.run(_test())


def test_duplicate_event_ids_rejected(mock_config):
    """Case 11: Duplicate canonical event IDs in input raise EvidenceValidationError."""
    async def _test():
        duplicate_evidence = [
            EvidenceInputRecord(evidence_id="TEST-EVT-001", service="svc-a"),
            EvidenceInputRecord(evidence_id="TEST-EVT-001", service="svc-b"),  # Duplicate!
        ]

        mock_client = AsyncMock(spec=OllamaClient)
        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)

        with pytest.raises(EvidenceValidationError) as exc_info:
            await agent.analyze(duplicate_evidence)

        assert "Duplicate canonical event ID detected: 'TEST-EVT-001'" in str(exc_info.value)
        assert not mock_client.generate_structured.called

    asyncio.run(_test())


def test_oversized_input_count_rejected(mock_config):
    """Case 12: Evidence count exceeding max_evidence_count is rejected explicitly."""
    async def _test():
        oversized = SYNTHETIC_OVERSIZED_EVIDENCE_GENERATOR(55)  # Limit is 50

        mock_client = AsyncMock(spec=OllamaClient)
        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)

        with pytest.raises(EvidenceValidationError) as exc_info:
            await agent.analyze(oversized)

        assert "Evidence count (55) exceeds maximum" in str(exc_info.value)
        assert not mock_client.generate_structured.called

    asyncio.run(_test())


def test_ollama_connection_failure_produces_actionable_error(mock_config):
    """Case 13: Ollama connection failure produces understandable OllamaInvocationError."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.side_effect = OllamaConnectionError("Failed to connect on 127.0.0.1:11434")

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)

        with pytest.raises(OllamaInvocationError) as exc_info:
            await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert "Ollama execution failed" in str(exc_info.value)

    asyncio.run(_test())


def test_unexpected_model_output_does_not_leak_invalid_claims(mock_config):
    """Case 14: Unexpected output with missing required fields does not leak unvalidated claims."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        # LLM returns unexpected structure missing required observation fields
        mock_client.generate_structured.return_value = {
            "observations": [{"wrong_key": "some text"}],
        }

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.INVALID_MODEL_OUTPUT

    asyncio.run(_test())


def test_prompt_injection_text_treated_as_evidence_data(mock_config, valid_llm_payload_dict):
    """Case 15: Prompt-injection instructions inside log lines are treated as passive data."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.generate_structured.return_value = {
            "observations": [
                {
                    "statement": "Auth service reported user login failures with embedded override text.",
                    "claim_type": "OBSERVED_FACT",
                    "evidence_ids": ["TEST-EVT-001"],
                    "explanation": "TEST-EVT-001 contains injection attempts in message string.",
                }
            ],
            "patterns": [],
            "preliminary_explanations": [],
            "information_gaps": [],
            "limitations": [],
        }

        agent = EvidenceAnalystAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.analyze(SYNTHETIC_PROMPT_INJECTION_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert len(result.observations) == 1
        assert result.observations[0].evidence_ids == ["TEST-EVT-001"]

        # Verify that prompt formatting sent injection text inside delimited <evidence_dataset>
        call_args = mock_client.generate_structured.call_args
        prompt = call_args.kwargs["prompt"]
        assert "<evidence_dataset>" in prompt
        assert "</evidence_dataset>" in prompt
        assert "SYSTEM OVERRIDE" in prompt  # passive literal string
        assert call_args.kwargs["system"] is not None

    asyncio.run(_test())

