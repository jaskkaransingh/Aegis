"""
AEGIS Agent: Evidence Analyst Agent.
Examines a supplied set of incident evidence and produces a structured,
evidence-grounded analysis with deterministic reference validation.
"""

import json
import time
from typing import Any, Dict, List, Optional, Set, Union
from pydantic import ValidationError

from ai_engine.config import AIEngineConfig, get_config
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaClientError,
    OllamaConnectionError,
    OllamaTimeoutError,
    OllamaModelNotFoundError,
    OllamaStructuredOutputError,
)
from ai_engine.schemas.common import AnalysisStatus, ClaimType
from ai_engine.schemas.evidence import EvidenceReference
from ai_engine.schemas.analyst import (
    EvidenceInputRecord,
    EvidenceAnalystLLMPayload,
    EvidenceAnalystResult,
)
from ai_engine.prompts.evidence_analyst import (
    EVIDENCE_ANALYST_SYSTEM_PROMPT,
    build_evidence_analyst_user_prompt,
)


class EvidenceAnalystError(Exception):
    """Base exception for all Evidence Analyst errors."""
    pass


class EvidenceValidationError(EvidenceAnalystError):
    """Raised when input evidence records violate constraints (e.g. duplicates, oversize)."""
    pass


class InvalidEvidenceReferenceError(EvidenceAnalystError):
    """Raised when the model output cites unknown, fabricated, or hallucinated evidence IDs."""
    pass


class OllamaInvocationError(EvidenceAnalystError):
    """Raised when the underlying LLM service fails or is unreachable."""
    pass


class EvidenceAnalystAgent:
    """
    Autonomous Evidence Analyst for AEGIS.
    Consumes verified evidence records, sends a prompt-injection hardened payload
    to local Ollama, and deterministically validates all cited evidence references.
    """

    def __init__(
        self,
        config: Optional[AIEngineConfig] = None,
        ollama_client: Optional[OllamaClient] = None,
    ):
        self.config = config or get_config()
        self._client = ollama_client or OllamaClient(config=self.config)

    def validate_and_normalize_inputs(
        self,
        raw_evidence: List[Union[EvidenceInputRecord, EvidenceReference, Dict[str, Any]]],
    ) -> List[EvidenceInputRecord]:
        """
        Validates the incoming evidence list against size, count, format, and duplicate constraints.
        Raises EvidenceValidationError on any violation.
        """
        # 1. Enforce maximum count limit
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
                    # Map possible alias fields
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

            # 2. Reject duplicate canonical event IDs
            if rec.evidence_id in seen_ids:
                raise EvidenceValidationError(
                    f"Duplicate canonical event ID detected: '{rec.evidence_id}'."
                )
            seen_ids.add(rec.evidence_id)
            validated.append(rec)

        # 3. Enforce maximum payload size limit (in bytes)
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

    def validate_reference_citations(
        self,
        payload: EvidenceAnalystLLMPayload,
        valid_ids: Set[str],
    ) -> List[str]:
        """
        Performs deterministic evidence reference validation.
        Verifies that every cited evidence ID belongs strictly to the supplied valid_ids set.
        Returns a list of validation error descriptions.
        """
        errors: List[str] = []

        # Validate Observations
        for obs in payload.observations:
            if obs.claim_type == ClaimType.OBSERVED_FACT and not obs.evidence_ids:
                errors.append(
                    f"Observation '{obs.statement[:50]}' is labeled OBSERVED_FACT but cites no evidence."
                )
            for eid in obs.evidence_ids:
                if eid not in valid_ids:
                    errors.append(
                        f"Observation '{obs.statement[:50]}' cites unknown/fabricated evidence ID: '{eid}'"
                    )

        # Validate Patterns
        for pat in payload.patterns:
            for eid in pat.evidence_ids:
                if eid not in valid_ids:
                    errors.append(
                        f"Pattern '{pat.pattern_name}' cites unknown/fabricated evidence ID: '{eid}'"
                    )

        # Validate Explanations
        for exp in payload.preliminary_explanations:
            for eid in exp.supporting_evidence_ids:
                if eid not in valid_ids:
                    errors.append(
                        f"Explanation '{exp.explanation[:50]}' cites unknown supporting evidence ID: '{eid}'"
                    )
            for eid in exp.contradicting_evidence_ids:
                if eid not in valid_ids:
                    errors.append(
                        f"Explanation '{exp.explanation[:50]}' cites unknown contradicting evidence ID: '{eid}'"
                    )

        return errors

    async def analyze(
        self,
        evidence: List[Union[EvidenceInputRecord, EvidenceReference, Dict[str, Any]]],
        custom_metadata: Optional[Dict[str, Any]] = None,
    ) -> EvidenceAnalystResult:
        """
        Main execution workflow:
        1. Validate inputs (empty check, duplicates, bounded limits).
        2. Format prompts with prompt injection defenses.
        3. Request structured JSON inference from local Ollama.
        4. Validate cited evidence references deterministically.
        5. Return validated EvidenceAnalystResult.
        """
        start_time = time.perf_counter()

        # Step 1: Empty input check
        if not evidence:
            return EvidenceAnalystResult(
                status=AnalysisStatus.INSUFFICIENT_EVIDENCE,
                observations=[],
                patterns=[],
                preliminary_explanations=[],
                information_gaps=["No evidence records were supplied for analysis."],
                limitations=["Analysis cannot proceed without input telemetry or log records."],
                metadata={
                    "input_count": 0,
                    "model": self.config.ollama_model,
                    "execution_time_ms": 0.0,
                    **(custom_metadata or {}),
                },
            )

        # Step 2: Validate and bound inputs
        validated_records = self.validate_and_normalize_inputs(evidence)
        valid_ids: Set[str] = {r.evidence_id for r in validated_records}

        # Step 3: Construct Prompts
        system_prompt = EVIDENCE_ANALYST_SYSTEM_PROMPT
        user_prompt = build_evidence_analyst_user_prompt(validated_records)

        # Step 4: Request Structured Output from Ollama
        try:
            raw_response = await self._client.generate_structured(
                prompt=user_prompt,
                schema=EvidenceAnalystLLMPayload,
                system=system_prompt,
            )
            llm_payload = EvidenceAnalystLLMPayload.model_validate(raw_response)
        except (OllamaConnectionError, OllamaTimeoutError, OllamaModelNotFoundError) as err:
            raise OllamaInvocationError(f"Ollama execution failed: {err}") from err
        except (OllamaStructuredOutputError, ValidationError) as err:
            return EvidenceAnalystResult(
                status=AnalysisStatus.INVALID_MODEL_OUTPUT,
                validation_errors=[f"Model output schema validation failed: {err}"],
                limitations=["Model output failed Pydantic schema validation or epistemic constraints."],
                metadata={
                    "input_count": len(validated_records),
                    "model": self.config.ollama_model,
                    **(custom_metadata or {}),
                },
            )
        except Exception as err:
            raise OllamaInvocationError(f"Unexpected error during model invocation: {err}") from err

        # Step 5: Deterministic Evidence Reference Validation
        validation_errors = self.validate_reference_citations(llm_payload, valid_ids)

        if validation_errors:
            if self.config.analyst_strict_mode:
                raise InvalidEvidenceReferenceError(
                    f"Model output failed evidence grounding validation: {'; '.join(validation_errors)}"
                )
            else:
                return EvidenceAnalystResult(
                    status=AnalysisStatus.INVALID_MODEL_OUTPUT,
                    observations=llm_payload.observations,
                    patterns=llm_payload.patterns,
                    preliminary_explanations=llm_payload.preliminary_explanations,
                    information_gaps=llm_payload.information_gaps,
                    limitations=llm_payload.limitations,
                    validation_errors=validation_errors,
                    metadata={
                        "input_count": len(validated_records),
                        "model": self.config.ollama_model,
                        **(custom_metadata or {}),
                    },
                )

        duration_ms = (time.perf_counter() - start_time) * 1000.0

        # Step 6: Return Validated Result
        return EvidenceAnalystResult(
            status=AnalysisStatus.SUCCESS,
            observations=llm_payload.observations,
            patterns=llm_payload.patterns,
            preliminary_explanations=llm_payload.preliminary_explanations,
            information_gaps=llm_payload.information_gaps,
            limitations=llm_payload.limitations,
            validation_errors=[],
            metadata={
                "input_count": len(validated_records),
                "model": self.config.ollama_model,
                "execution_time_ms": round(duration_ms, 2),
                **(custom_metadata or {}),
            },
        )
