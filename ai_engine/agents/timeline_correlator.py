"""
AEGIS Agent: Timeline Correlator Agent.
Reconstructs an incident timeline from supplied evidence using deterministic interval mathematics
and optional Ollama summarization.
"""

import json
import re
import time
from typing import Any, Dict, List, Optional, Set, Union
from pydantic import ValidationError

from ai_engine.config import AIEngineConfig, get_config
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaClientError,
    OllamaConnectionError,
    OllamaTimeoutError,
)
from ai_engine.schemas.common import AnalysisStatus
from ai_engine.schemas.evidence import EvidenceReference
from ai_engine.schemas.analyst import EvidenceInputRecord
from ai_engine.schemas.timeline import (
    TemporalRelation,
    TimelineEntry,
    TemporalRelationshipRecord,
    TemporalPatternRecord,
    TimelineAnalysisResult,
)
from ai_engine.core.temporal_analysis import DeterministicTimelineAnalyzer
from ai_engine.prompts.timeline_correlator import (
    TIMELINE_CORRELATOR_SYSTEM_PROMPT,
    build_timeline_correlator_user_prompt,
)
from ai_engine.agents.evidence_analyst import (
    EvidenceValidationError,
    InvalidEvidenceReferenceError,
)

# Regex to detect cited event identifiers in LLM text (e.g. EVT-001, TEST-EVT-001)
CITED_EVENT_REGEX = re.compile(r"\b(?:TEST-)?EVT-[A-Za-z0-9_-]+\b")


class TimelineCorrelatorAgent:
    """
    Autonomous Timeline Correlator for AEGIS.
    Performs deterministic interval comparisons first, extracts patterns,
    and optionally invokes local Ollama to synthesize a grounded timeline narrative.
    """

    def __init__(
        self,
        config: Optional[AIEngineConfig] = None,
        ollama_client: Optional[OllamaClient] = None,
        deterministic_analyzer: Optional[DeterministicTimelineAnalyzer] = None,
    ):
        self.config = config or get_config()
        self._client = ollama_client or OllamaClient(config=self.config)
        self.analyzer = deterministic_analyzer or DeterministicTimelineAnalyzer(
            error_burst_window_seconds=self.config.timeline_error_burst_window_seconds,
            cluster_window_seconds=self.config.timeline_cluster_window_seconds,
            gap_threshold_seconds=self.config.timeline_gap_threshold_seconds,
        )

    def validate_and_normalize_inputs(
        self,
        raw_evidence: List[Union[EvidenceInputRecord, EvidenceReference, Dict[str, Any]]],
    ) -> List[EvidenceInputRecord]:
        """
        Validates input records against size, count, format, and duplicate constraints.
        Raises EvidenceValidationError on any violation.
        """
        if len(raw_evidence) > self.config.max_evidence_count:
            raise EvidenceValidationError(
                f"Evidence count ({len(raw_evidence)}) exceeds maximum configured limit "
                f"({self.config.max_evidence_count})."
            )

        validated: List[EvidenceInputRecord] = []
        seen_ids: Set[str] = set()

        for idx, item in enumerate(raw_evidence):
            try:
                if isinstance(item, EvidenceInputRecord):
                    rec = item
                elif isinstance(item, EvidenceReference):
                    rec = EvidenceInputRecord(
                        evidence_id=item.evidence_id,
                        service=item.source,
                        timestamp=item.timestamp,
                        category=item.category,
                        message=item.message or "",
                    )
                elif isinstance(item, dict):
                    data = dict(item)
                    if "event_id" in data and "evidence_id" not in data:
                        data["evidence_id"] = data["event_id"]
                    if "source" in data and "service" not in data:
                        data["service"] = data["source"]
                    rec = EvidenceInputRecord.model_validate(data)
                else:
                    raise EvidenceValidationError(
                        f"Unsupported record type at index {idx}: {type(item)}"
                    )
            except ValidationError as err:
                raise EvidenceValidationError(
                    f"Evidence record at index {idx} failed schema validation: {err}"
                ) from err

            if rec.evidence_id in seen_ids:
                raise EvidenceValidationError(
                    f"Duplicate canonical event ID detected: '{rec.evidence_id}'."
                )
            seen_ids.add(rec.evidence_id)
            validated.append(rec)

        # Enforce maximum payload size limit (in bytes)
        serialized_bytes = json.dumps(
            [r.model_dump() for r in validated]
        ).encode("utf-8")
        payload_size = len(serialized_bytes)

        if payload_size > self.config.max_payload_bytes:
            raise EvidenceValidationError(
                f"Serialized evidence payload size ({payload_size} bytes) exceeds limit "
                f"({self.config.max_payload_bytes} bytes)."
            )

        return validated

    async def correlate(
        self,
        evidence: List[Union[EvidenceInputRecord, EvidenceReference, Dict[str, Any]]],
        custom_metadata: Optional[Dict[str, Any]] = None,
    ) -> TimelineAnalysisResult:
        """
        Executes timeline correlation:
        1. Validates and bounds input evidence.
        2. Executes deterministic interval comparisons & pattern detection.
        3. Optionally requests an LLM narrative summary from local Ollama.
        4. Validates all cited event IDs deterministically.
        5. Returns structured TimelineAnalysisResult.
        """
        start_time = time.perf_counter()

        # Step 1: Empty check
        if not evidence:
            return TimelineAnalysisResult(
                status=AnalysisStatus.INSUFFICIENT_EVIDENCE,
                timeline_entries=[],
                temporal_relationships=[],
                temporal_patterns=[],
                timeline_summary="No evidence records were supplied for timeline correlation.",
                uncertainties_and_limitations=["No input records provided."],
                metadata={
                    "total_records": 0,
                    "ollama_summarized": False,
                    **(custom_metadata or {}),
                },
            )

        # Step 2: Validate inputs
        validated_records = self.validate_and_normalize_inputs(evidence)
        valid_ids: Set[str] = {r.evidence_id for r in validated_records}

        # Step 3: Run Deterministic Analysis
        det_result = self.analyzer.analyze(validated_records)

        # Step 4: Optional Ollama Narrative Summarization
        ollama_ran = False
        summary_text = det_result.timeline_summary

        if self.config.enable_llm_timeline_summary and det_result.timeline_entries:
            system_prompt = TIMELINE_CORRELATOR_SYSTEM_PROMPT
            user_prompt = build_timeline_correlator_user_prompt(
                entries=det_result.timeline_entries,
                relationships=det_result.temporal_relationships,
                patterns=det_result.temporal_patterns,
                limitations=det_result.uncertainties_and_limitations,
            )

            try:
                # Check health before generation
                is_healthy = await self._client.health_check()
                if is_healthy:
                    raw_summary = await self._client.generate(
                        prompt=user_prompt,
                        system=system_prompt,
                        temperature=self.config.temperature,
                    )
                    clean_summary = raw_summary.strip()
                    if clean_summary:
                        # Validate that any cited event ID belongs strictly to valid_ids
                        cited_in_summary = set(CITED_EVENT_REGEX.findall(clean_summary))
                        unknown_in_summary = cited_in_summary - valid_ids

                        if unknown_in_summary:
                            if self.config.analyst_strict_mode:
                                raise InvalidEvidenceReferenceError(
                                    f"LLM timeline summary cited unknown event IDs: {', '.join(unknown_in_summary)}"
                                )
                            else:
                                det_result.uncertainties_and_limitations.append(
                                    f"LLM timeline summary attempted to cite unverified IDs ({', '.join(unknown_in_summary)}); "
                                    f"summary was discarded in favor of deterministic findings."
                                )
                        else:
                            summary_text = clean_summary
                            ollama_ran = True
            except InvalidEvidenceReferenceError:
                raise
            except (OllamaConnectionError, OllamaTimeoutError, OllamaClientError, Exception) as err:
                # Fall back gracefully to deterministic summary without failing the pipeline
                det_result.uncertainties_and_limitations.append(
                    f"Ollama summarization unavailable or failed ({err}); using deterministic timeline summary."
                )

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # Step 5: Construct Final Result
        metadata = {
            **det_result.metadata,
            "ollama_summarized": ollama_ran,
            "execution_time_ms": round(duration_ms, 2),
            "model": self.config.ollama_model if ollama_ran else None,
            **(custom_metadata or {}),
        }

        return TimelineAnalysisResult(
            status=det_result.status,
            timeline_entries=det_result.timeline_entries,
            temporal_relationships=det_result.temporal_relationships,
            temporal_patterns=det_result.temporal_patterns,
            timeline_summary=summary_text,
            uncertainties_and_limitations=det_result.uncertainties_and_limitations,
            causality_disclaimer=det_result.causality_disclaimer,
            metadata=metadata,
        )

