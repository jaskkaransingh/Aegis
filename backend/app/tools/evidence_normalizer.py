"""
AEGIS Deterministic Tool: Evidence Normalization Pipeline.

Parses raw log feeds, validates event IDs, flags duplicates, applies clock correction,
identifies missing telemetry fields, preserves source provenance, and yields
structured DataQualityWarning records.
"""

from datetime import datetime, timezone, timedelta
import hashlib
from typing import Any, Dict, List, Optional, Set, Tuple

from app.schemas.events import (
    ClockOffsetEstimate,
    DataQualityWarning,
    NormalizedEvent,
    RawEvent,
)
from app.tools.clock_correction import (
    calculate_corrected_interval,
    format_iso_timestamp,
    identify_uncertain_orderings,
    parse_iso_timestamp,
)


def compute_content_fingerprint(event_data: Dict[str, Any]) -> str:
    """Computes deterministic hash of event content for duplicate detection."""
    content = f"{event_data.get('service', '')}|{event_data.get('timestamp', '')}|{event_data.get('event_type', '')}|{event_data.get('message', '')}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]


class EvidenceNormalizer:
    """
    Normalizes raw log streams into validated, time-corrected events.
    Guarantees zero silent discards: every anomaly generates a structured warning
    and is preserved in the normalized stream.
    """

    def __init__(
        self,
        clock_offsets: Optional[Dict[str, ClockOffsetEstimate]] = None,
        default_uncertainty_seconds: float = 0.5,
    ):
        self.clock_offsets = clock_offsets or {}
        self.default_uncertainty_seconds = default_uncertainty_seconds

    def normalize_stream(
        self,
        raw_records: List[Dict[str, Any]],
    ) -> Tuple[List[NormalizedEvent], List[DataQualityWarning]]:
        """
        Processes a list of raw log record dictionaries.
        Returns:
            (normalized_events, collected_warnings)
        """
        normalized_events: List[NormalizedEvent] = []
        all_warnings: List[DataQualityWarning] = []

        seen_raw_ids: Dict[str, str] = {}  # raw_id -> canonical_id
        seen_fingerprints: Dict[str, str] = {}  # content_hash -> canonical_id

        for index, item in enumerate(raw_records):
            warnings: List[DataQualityWarning] = []

            # 1. Validate ID
            raw_id = item.get("id")
            if not raw_id or not isinstance(raw_id, str) or not raw_id.strip():
                generated_id = f"SYNTH-ID-{index + 1:04d}"
                warning = DataQualityWarning(
                    code="MISSING_EVENT_ID",
                    severity="HIGH",
                    message=f"Log record at index {index} lacked a valid ID. Assigned synthetic ID {generated_id}.",
                    field_name="id",
                    event_id=generated_id,
                    action_taken="Assigned deterministic fallback ID and retained record.",
                )
                warnings.append(warning)
                canonical_id = generated_id
                raw_id = generated_id
            else:
                raw_id = raw_id.strip()
                canonical_id = raw_id

            # 2. Check for Duplicate IDs or Duplicate Content
            is_duplicate = False
            duplicate_of = None
            fingerprint = compute_content_fingerprint(item)

            if raw_id in seen_raw_ids:
                is_duplicate = True
                duplicate_of = seen_raw_ids[raw_id]
                canonical_id = f"{raw_id}_dup_{index + 1}"
                warning = DataQualityWarning(
                    code="DUPLICATE_EVENT_ID",
                    severity="HIGH",
                    message=f"Event ID '{raw_id}' was already encountered for event '{duplicate_of}'.",
                    field_name="id",
                    event_id=canonical_id,
                    action_taken=f"Renamed canonical ID to '{canonical_id}', flagged is_duplicate=True, preserved record.",
                )
                warnings.append(warning)
            elif fingerprint in seen_fingerprints:
                is_duplicate = True
                duplicate_of = seen_fingerprints[fingerprint]
                warning = DataQualityWarning(
                    code="DUPLICATE_CONTENT_DETECTED",
                    severity="MEDIUM",
                    message=f"Event '{raw_id}' has identical service, timestamp, and message to '{duplicate_of}'.",
                    field_name="message",
                    event_id=canonical_id,
                    action_taken="Flagged is_duplicate=True, preserved record.",
                )
                warnings.append(warning)
            else:
                seen_raw_ids[raw_id] = canonical_id
                seen_fingerprints[fingerprint] = canonical_id

            # 3. Validate Service Name
            service = item.get("service")
            if not service or not isinstance(service, str):
                service = "unknown-service"
                warning = DataQualityWarning(
                    code="MISSING_SERVICE_NAME",
                    severity="HIGH",
                    message="Service name was missing or not a string.",
                    field_name="service",
                    event_id=canonical_id,
                    action_taken="Defaulted service to 'unknown-service'.",
                )
                warnings.append(warning)

            # 4. Validate and Parse Timestamp
            raw_timestamp = item.get("timestamp")
            if not raw_timestamp or not isinstance(raw_timestamp, str):
                # Fallback timestamp with high uncertainty
                fallback_dt = datetime.now(timezone.utc)
                raw_timestamp_str = "MISSING_TIMESTAMP"
                recorded_dt = fallback_dt
                corrected_dt = fallback_dt
                unc = 300.0  # 5 minutes uncertainty
                int_start = fallback_dt - timedelta(seconds=unc)
                int_end = fallback_dt + timedelta(seconds=unc)
                warning = DataQualityWarning(
                    code="MALFORMED_TIMESTAMP",
                    severity="HIGH",
                    message="Timestamp field was missing or invalid. Assigned fallback time with wide uncertainty.",
                    field_name="timestamp",
                    event_id=canonical_id,
                    action_taken="Assigned current UTC timestamp with +/- 300s uncertainty window.",
                )
                warnings.append(warning)
                offset_applied = 0.0
                clock_applied = False
            else:
                try:
                    recorded_dt = parse_iso_timestamp(raw_timestamp)
                    # Check clock offset for this service
                    clock_info = self.clock_offsets.get(service)
                    if clock_info:
                        offset_applied = clock_info.offset_seconds
                        unc = clock_info.uncertainty_seconds
                        clock_applied = True
                        if offset_applied != 0.0:
                            warnings.append(
                                DataQualityWarning(
                                    code="CLOCK_OFFSET_APPLIED",
                                    severity="LOW",
                                    message=(
                                        f"Applied clock offset of {offset_applied:+.2f}s for service '{service}' "
                                        f"(uncertainty +/-{unc:.2f}s, method: {clock_info.method})."
                                    ),
                                    field_name="timestamp",
                                    event_id=canonical_id,
                                    action_taken=f"Shifted recorded time by {-offset_applied:+.2f}s to align with UTC.",
                                )
                            )
                    else:
                        offset_applied = 0.0
                        unc = self.default_uncertainty_seconds
                        clock_applied = False

                    _, corrected_dt, int_start, int_end = calculate_corrected_interval(
                        recorded_dt,
                        offset_seconds=offset_applied,
                        uncertainty_seconds=unc,
                    )
                except Exception as e:
                    recorded_dt = datetime.now(timezone.utc)
                    corrected_dt = recorded_dt
                    unc = 120.0
                    int_start = recorded_dt
                    int_end = recorded_dt
                    warning = DataQualityWarning(
                        code="UNPARSEABLE_TIMESTAMP",
                        severity="HIGH",
                        message=f"Failed to parse timestamp string '{raw_timestamp}': {e}",
                        field_name="timestamp",
                        event_id=canonical_id,
                        action_taken="Used current timestamp with +/- 120s uncertainty.",
                    )
                    warnings.append(warning)
                    offset_applied = 0.0
                    clock_applied = False

            # 5. Severity Validation
            severity = item.get("severity")
            if not severity or severity not in ("INFO", "WARN", "WARNING", "ERROR", "CRITICAL"):
                orig_sev = str(severity)
                severity = "INFO"
                warning = DataQualityWarning(
                    code="INVALID_SEVERITY",
                    severity="LOW",
                    message=f"Unrecognized severity '{orig_sev}'. Normalized to 'INFO'.",
                    field_name="severity",
                    event_id=canonical_id,
                    action_taken="Set severity to 'INFO'.",
                )
                warnings.append(warning)
            elif severity == "WARNING":
                severity = "WARN"

            # 6. Event Type & Message
            event_type = item.get("event_type", "GENERAL_LOG")
            message = item.get("message", "")
            if not message:
                warning = DataQualityWarning(
                    code="EMPTY_LOG_MESSAGE",
                    severity="MEDIUM",
                    message="Event has an empty or missing log message.",
                    field_name="message",
                    event_id=canonical_id,
                    action_taken="Preserved event with empty message placeholder.",
                )
                warnings.append(warning)
                message = "<NO_MESSAGE_RECORDED>"

            # 7. Trace ID Provenance
            trace_id = item.get("trace_id")
            if not trace_id:
                # Many systems drop trace context on network timeouts or background cron jobs
                warnings.append(
                    DataQualityWarning(
                        code="MISSING_TRACE_ID",
                        severity="LOW",
                        message=f"Event '{canonical_id}' lacks a distributed trace ID; correlation must rely on timestamps and service topology.",
                        field_name="trace_id",
                        event_id=canonical_id,
                        action_taken="Preserved record with trace_id=None.",
                    )
                )

            metadata = item.get("metadata", {})
            if not isinstance(metadata, dict):
                metadata = {"raw_metadata": str(metadata)}

            normalized_event = NormalizedEvent(
                id=canonical_id,
                raw_id=raw_id,
                service=service,
                original_timestamp=str(raw_timestamp),
                recorded_datetime=recorded_dt,
                corrected_datetime=corrected_dt,
                uncertainty_seconds=unc,
                time_interval_start=int_start,
                time_interval_end=int_end,
                severity=severity,
                event_type=event_type,
                message=message,
                trace_id=trace_id,
                metadata=metadata,
                is_duplicate=is_duplicate,
                duplicate_of=duplicate_of,
                data_quality_warnings=warnings,
                clock_correction_applied=clock_applied,
                offset_applied_seconds=offset_applied,
            )

            normalized_events.append(normalized_event)
            all_warnings.extend(warnings)

        return normalized_events, all_warnings
