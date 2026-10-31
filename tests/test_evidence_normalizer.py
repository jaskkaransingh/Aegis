"""
Unit Tests for Evidence Normalization Tool (app/tools/evidence_normalizer.py).
Tests:
- Parsing raw logs
- Duplicate event detection (both duplicate IDs and identical content)
- Invalid event IDs handling (synthetic ID generation)
- Missing fields identification
- Preservation of source provenance
- Structured data-quality warnings
- Verification that no records are silently discarded
"""

import pytest

from app.schemas.events import ClockOffsetEstimate
from app.tools.evidence_normalizer import EvidenceNormalizer, compute_content_fingerprint


def test_no_silent_discards():
    """Confirms every input raw record produces a corresponding normalized event."""
    raw_input = [
        {"id": "EVT-01", "service": "api-gateway", "timestamp": "2026-10-31T14:00:00Z", "severity": "INFO", "event_type": "REQ", "message": "Req 1"},
        {"id": "", "service": "auth-service", "timestamp": "2026-10-31T14:00:01Z", "severity": "WARN", "event_type": "AUTH", "message": "Missing ID event"},
        {"id": "EVT-03", "service": "postgresql-database", "timestamp": "INVALID_TIMESTAMP", "severity": "CRITICAL", "event_type": "CRASH", "message": "Bad ts"},
    ]

    normalizer = EvidenceNormalizer()
    normalized, warnings = normalizer.normalize_stream(raw_input)

    assert len(normalized) == len(raw_input)
    assert len(warnings) >= 2


def test_duplicate_event_detection_identical_content():
    """Detects re-emitted duplicate log messages with identical payload."""
    raw_input = [
        {
            "id": "EVT-100",
            "service": "payment-service",
            "timestamp": "2026-10-31T14:01:00Z",
            "severity": "WARN",
            "event_type": "LEDGER_FLUSH",
            "message": "Payment flush delayed",
        },
        {
            "id": "EVT-101",
            "service": "payment-service",
            "timestamp": "2026-10-31T14:01:00Z",
            "severity": "WARN",
            "event_type": "LEDGER_FLUSH",
            "message": "Payment flush delayed",
        },
    ]

    normalizer = EvidenceNormalizer()
    normalized, warnings = normalizer.normalize_stream(raw_input)

    assert len(normalized) == 2
    # Second event should be flagged duplicate
    assert normalized[1].is_duplicate is True
    assert normalized[1].duplicate_of == "EVT-100"

    # Warning must be logged
    dup_warnings = [w for w in warnings if w.code == "DUPLICATE_CONTENT_DETECTED"]
    assert len(dup_warnings) == 1
    assert "identical" in dup_warnings[0].message


def test_duplicate_event_id_collision():
    """Detects when different logs attempt to use the exact same event ID."""
    raw_input = [
        {
            "id": "EVT-COLLIDE",
            "service": "appointment-service",
            "timestamp": "2026-10-31T14:00:10Z",
            "severity": "ERROR",
            "event_type": "TIMEOUT",
            "message": "First event using this ID",
        },
        {
            "id": "EVT-COLLIDE",
            "service": "hospital-records-service",
            "timestamp": "2026-10-31T14:00:12Z",
            "severity": "ERROR",
            "event_type": "WRITE_FAIL",
            "message": "Different service reusing the same ID",
        },
    ]

    normalizer = EvidenceNormalizer()
    normalized, warnings = normalizer.normalize_stream(raw_input)

    assert len(normalized) == 2
    # The second record's canonical ID is adjusted to prevent collision while preserving raw_id
    assert normalized[1].id == "EVT-COLLIDE_dup_2"
    assert normalized[1].raw_id == "EVT-COLLIDE"
    assert normalized[1].is_duplicate is True
    assert normalized[1].duplicate_of == "EVT-COLLIDE"

    warn = next(w for w in warnings if w.code == "DUPLICATE_EVENT_ID")
    assert warn.event_id == "EVT-COLLIDE_dup_2"
    assert "already encountered" in warn.message


def test_invalid_event_id_replacement():
    """Replaces missing or empty event IDs with synthetic deterministic IDs."""
    raw_input = [
        {
            "id": "   ",
            "service": "api-gateway",
            "timestamp": "2026-10-31T14:00:00Z",
            "severity": "INFO",
            "event_type": "LOG",
            "message": "Empty ID message",
        }
    ]

    normalizer = EvidenceNormalizer()
    normalized, warnings = normalizer.normalize_stream(raw_input)

    assert len(normalized) == 1
    assert normalized[0].id.startswith("SYNTH-ID-")
    assert any(w.code == "MISSING_EVENT_ID" for w in warnings)


def test_missing_fields_handling():
    """Validates missing trace_id, missing severity, and empty message."""
    raw_input = [
        {
            "id": "EVT-200",
            "service": "notification-service",
            "timestamp": "2026-10-31T14:00:00Z",
            "severity": "NON_STANDARD_CRITICAL_BAD",
            "event_type": "ALERT",
            "message": "",  # Empty message
            "trace_id": None,  # Missing trace ID
        }
    ]

    normalizer = EvidenceNormalizer()
    normalized, warnings = normalizer.normalize_stream(raw_input)

    ev = normalized[0]
    # Severity normalized to INFO
    assert ev.severity == "INFO"
    # Empty message received placeholder
    assert ev.message == "<NO_MESSAGE_RECORDED>"
    # Trace ID preserved as None
    assert ev.trace_id is None

    warning_codes = [w.code for w in warnings]
    assert "INVALID_SEVERITY" in warning_codes
    assert "EMPTY_LOG_MESSAGE" in warning_codes
    assert "MISSING_TRACE_ID" in warning_codes


def test_source_provenance_preservation():
    """Ensures raw timestamps and original IDs are retained alongside normalized fields."""
    clock_offsets = {
        "payment-service": ClockOffsetEstimate(
            service="payment-service",
            offset_seconds=42.0,
            uncertainty_seconds=2.0,
            method="test_sync",
        )
    }

    raw_input = [
        {
            "id": "EVT-PAY-1",
            "service": "payment-service",
            "timestamp": "2026-10-31T14:01:42.000Z",
            "severity": "ERROR",
            "event_type": "PAYMENT_FAIL",
            "message": "Payment timeout",
            "trace_id": "tr-pay-1",
        }
    ]

    normalizer = EvidenceNormalizer(clock_offsets=clock_offsets)
    normalized, _ = normalizer.normalize_stream(raw_input)

    ev = normalized[0]
    assert ev.original_timestamp == "2026-10-31T14:01:42.000Z"
    assert ev.raw_id == "EVT-PAY-1"
    assert ev.clock_correction_applied is True
    assert ev.offset_applied_seconds == 42.0
    assert ev.corrected_datetime.strftime("%H:%M:%S") == "14:01:00"


def test_normalize_logs_removes_duplicates_and_applies_clock_skew():
    from app.tools.evidence_normalizer import normalize_logs

    raw_logs = [
        {
            "event_id": "EVT-DUP-1",
            "service": "auth-service",
            "timestamp": "2026-10-31T14:00:10.000Z",
            "level": "INFO",
            "event_type": "LOGIN",
            "message": "User login",
            "source": "auth-service",
            "offset_seconds": 10,
        },
        {
            "event_id": "EVT-DUP-1",  # Duplicate event_id
            "service": "auth-service",
            "timestamp": "2026-10-31T14:00:10.000Z",
            "level": "INFO",
            "event_type": "LOGIN",
            "message": "User login retransmission",
            "source": "auth-service",
        },
        {
            "event_id": "EVT-PAY-1",
            "service": "payment",  # Payment service gets 120s hardcoded skew
            "timestamp": "2026-10-31T14:05:00.000Z",
            "level": "ERROR",
            "event_type": "CHARGE_FAILED",
            "message": "Gateway timeout",
            "source": "payment",
        },
    ]

    normalized = normalize_logs(raw_logs)
    assert len(normalized) == 2
    assert normalized[0].event_id == "EVT-DUP-1"
    assert normalized[0].corrected_timestamp.strftime("%H:%M:%S") == "14:00:00"
    assert normalized[1].event_id == "EVT-PAY-1"
    assert normalized[1].offset_applied_seconds == 120.0
    assert normalized[1].corrected_timestamp.strftime("%H:%M:%S") == "14:03:00"

