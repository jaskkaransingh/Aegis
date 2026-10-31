"""
Unit Tests for AEGIS Timeline Correlator Agent.
Tests agent orchestration, deterministic execution, LLM summarization with mocked Ollama,
Ollama offline fallback, evidence citation validation, input bounding, and prompt-injection defense.
"""

import asyncio
import pytest
from unittest.mock import AsyncMock

from ai_engine.config import AIEngineConfig
from ai_engine.schemas.common import AnalysisStatus
from ai_engine.schemas.analyst import EvidenceInputRecord
from ai_engine.schemas.timeline import TemporalRelation, TimelineAnalysisResult
from ai_engine.agents.timeline_correlator import TimelineCorrelatorAgent
from ai_engine.agents.evidence_analyst import (
    EvidenceValidationError,
    InvalidEvidenceReferenceError,
)
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaTimeoutError,
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
        enable_llm_timeline_summary=True,
    )


def test_valid_evidence_correlator_orchestration(mock_config):
    """Test standard correlation with mocked LLM summary."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = True
        mock_client.generate.return_value = (
            "Chronological analysis indicates TEST-EVT-001 occurred first, followed by TEST-EVT-002 and TEST-EVT-003. "
            "Temporal correlation does not imply causation."
        )

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert len(result.timeline_entries) == 3
        assert len(result.temporal_relationships) == 3  # (1,2), (1,3), (2,3)
        assert result.metadata["ollama_summarized"] is True
        assert "TEST-EVT-001" in result.timeline_summary
        assert "causation" in result.causality_disclaimer.lower()

    asyncio.run(_test())


def test_preserves_raw_and_corrected_timestamps(mock_config):
    """Test that both raw and corrected timestamps are preserved in timeline entries."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = False  # Deterministic mode

        records = [
            EvidenceInputRecord(
                evidence_id="TEST-EVT-001",
                service="payment",
                raw_timestamp="2026-10-31T14:02:00Z",
                corrected_timestamp="2026-10-31T14:00:00Z",
                clock_offset_seconds=120.0,
                uncertainty_seconds=0.1,
                message="Payment processed.",
            ),
            EvidenceInputRecord(
                evidence_id="TEST-EVT-002",
                service="database",
                raw_timestamp="2026-10-31T14:00:05Z",
                corrected_timestamp="2026-10-31T14:00:05Z",
                uncertainty_seconds=0.1,
                message="Database query logged.",
            ),
        ]

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(records)

        entry_payment = next(e for e in result.timeline_entries if e.event_id == "TEST-EVT-001")
        assert entry_payment.raw_timestamp == "2026-10-31T14:02:00Z"
        assert entry_payment.corrected_timestamp == "2026-10-31T14:00:00Z"

        # Corrected time placed payment (14:00:00) before database (14:00:05)
        assert result.timeline_entries[0].event_id == "TEST-EVT-001"
        assert result.timeline_entries[1].event_id == "TEST-EVT-002"

    asyncio.run(_test())


def test_overlapping_intervals_preserve_ambiguity_no_forced_total_order(mock_config):
    """Test that overlapping uncertainty intervals flag ambiguity and avoid forced total ordering."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = False

        records = [
            EvidenceInputRecord(
                evidence_id="TEST-EVT-A",
                service="service-a",
                timestamp="2026-10-31T10:00:00Z",
                uncertainty_seconds=5.0,  # 09:59:55 to 10:00:05
            ),
            EvidenceInputRecord(
                evidence_id="TEST-EVT-B",
                service="service-b",
                timestamp="2026-10-31T10:00:02Z",
                uncertainty_seconds=5.0,  # 09:59:57 to 10:00:07
            ),
        ]

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(records)

        assert result.timeline_entries[0].is_concurrent_or_uncertain is True
        assert "TEST-EVT-B" in result.timeline_entries[0].uncertain_ordering_with
        assert result.timeline_entries[1].is_concurrent_or_uncertain is True
        assert "TEST-EVT-A" in result.timeline_entries[1].uncertain_ordering_with

        rel = result.temporal_relationships[0]
        assert rel.relationship == TemporalRelation.POSSIBLY_BEFORE
        assert "ambiguous" in rel.explanation.lower()

    asyncio.run(_test())


def test_ollama_offline_falls_back_to_deterministic_summary(mock_config):
    """Test that agent falls back to deterministic summary when Ollama is offline."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = False  # Ollama offline

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert result.metadata["ollama_summarized"] is False
        assert "Deterministic Chronological Analysis" in result.timeline_summary
        assert not mock_client.generate.called

    asyncio.run(_test())


def test_ollama_timeout_falls_back_gracefully(mock_config):
    """Test that LLM timeout does not fail the timeline correlation."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = True
        mock_client.generate.side_effect = OllamaTimeoutError("Timed out after 60s")

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(SYNTHETIC_TEST_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert result.metadata["ollama_summarized"] is False
        assert "Deterministic Chronological Analysis" in result.timeline_summary

    asyncio.run(_test())


def test_summary_citing_unknown_event_id_raises_strict_error(mock_config):
    """Test that LLM summary hallucinating an unknown event ID is strictly caught."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = True
        # Hallucinated ID: TEST-EVT-999
        mock_client.generate.return_value = "Event TEST-EVT-999 caused the outage before TEST-EVT-001."

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        with pytest.raises(InvalidEvidenceReferenceError) as exc_info:
            await agent.correlate(SYNTHETIC_TEST_EVIDENCE)

        assert "unknown event IDs: TEST-EVT-999" in str(exc_info.value)

    asyncio.run(_test())


def test_empty_evidence_input_returns_insufficient_evidence(mock_config):
    """Test that empty input returns INSUFFICIENT_EVIDENCE without LLM call."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate([])

        assert result.status == AnalysisStatus.INSUFFICIENT_EVIDENCE
        assert len(result.timeline_entries) == 0
        assert not mock_client.health_check.called
        assert not mock_client.generate.called

    asyncio.run(_test())


def test_duplicate_event_ids_rejected(mock_config):
    """Test that duplicate canonical event IDs raise EvidenceValidationError."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        duplicates = [
            EvidenceInputRecord(evidence_id="TEST-EVT-001", service="svc1", timestamp="2026-10-31T10:00:00Z"),
            EvidenceInputRecord(evidence_id="TEST-EVT-001", service="svc2", timestamp="2026-10-31T10:00:05Z"),
        ]

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        with pytest.raises(EvidenceValidationError) as exc_info:
            await agent.correlate(duplicates)

        assert "Duplicate canonical event ID detected: 'TEST-EVT-001'" in str(exc_info.value)

    asyncio.run(_test())


def test_oversized_input_count_rejected(mock_config):
    """Test that input exceeding max_evidence_count raises EvidenceValidationError."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        oversized = SYNTHETIC_OVERSIZED_EVIDENCE_GENERATOR(55)  # Limit is 50

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        with pytest.raises(EvidenceValidationError) as exc_info:
            await agent.correlate(oversized)

        assert "Evidence count (55) exceeds maximum" in str(exc_info.value)

    asyncio.run(_test())


def test_prompt_injection_in_event_message_treated_as_data(mock_config):
    """Test that prompt injection directives in log messages are treated as passive data."""
    async def _test():
        mock_client = AsyncMock(spec=OllamaClient)
        mock_client.health_check.return_value = True
        mock_client.generate.return_value = (
            "Analysis of TEST-EVT-001 and TEST-EVT-002 shows authentication errors followed by gateway drops."
        )

        agent = TimelineCorrelatorAgent(config=mock_config, ollama_client=mock_client)
        result = await agent.correlate(SYNTHETIC_PROMPT_INJECTION_EVIDENCE)

        assert result.status == AnalysisStatus.SUCCESS
        assert mock_client.generate.called
        call_prompt = mock_client.generate.call_args.kwargs["prompt"]
        assert "<deterministic_timeline_analysis>" in call_prompt
        assert "SYSTEM OVERRIDE" in call_prompt  # Passive string

    asyncio.run(_test())

