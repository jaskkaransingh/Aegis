"""
Deterministic Pytest Tests for Clock Correction Tool.
Verifies skew correction, payment service hardcoded offset of 120 seconds,
and temporal interval calculations.
"""

from datetime import datetime, timedelta, timezone
import pytest

from app.tools.clock_correction import apply_clock_skew


def test_payment_service_clock_skew_120_seconds():
    """
    Passes a mock Payment service log to apply_clock_skew and asserts that the
    corrected_timestamp is exactly 120 seconds less than the raw_timestamp.
    """
    raw_timestamp = datetime(2026, 10, 31, 14, 2, 0, tzinfo=timezone.utc)
    mock_payment_log = {
        "event_id": "EVT-PAY-MOCK-001",
        "incident_id": "INC-CIVICHEALTH-001",
        "service": "payment",
        "timestamp": raw_timestamp,
        "level": "INFO",
        "event_type": "PAYMENT_ATTEMPT",
        "message": "Mock payment transaction started",
        "source": "payment",
    }

    normalized = apply_clock_skew(mock_payment_log)

    corrected_timestamp = normalized["corrected_timestamp"]

    # Assert that corrected_timestamp is exactly 120 seconds less than raw_timestamp
    time_difference_seconds = (raw_timestamp - corrected_timestamp).total_seconds()
    assert time_difference_seconds == 120, (
        f"Expected corrected_timestamp to be 120s less than raw_timestamp, "
        f"got difference of {time_difference_seconds}s"
    )
    assert corrected_timestamp == raw_timestamp - timedelta(seconds=120)


def test_payment_service_variant_name_clock_skew():
    """
    Verifies that 'payment-service' also receives the deterministic 120-second skew offset.
    """
    raw_timestamp = datetime(2026, 10, 31, 14, 15, 0, tzinfo=timezone.utc)
    mock_payment_log = {
        "event_id": "EVT-PAY-MOCK-002",
        "incident_id": "INC-CIVICHEALTH-001",
        "service": "payment-service",
        "timestamp": raw_timestamp,
        "level": "WARN",
        "event_type": "PAYMENT_DELAY",
        "message": "Downstream payment delay mock",
        "source": "payment-service",
    }

    normalized = apply_clock_skew(mock_payment_log)
    corrected_timestamp = normalized["corrected_timestamp"]

    assert (raw_timestamp - corrected_timestamp).total_seconds() == 120
    assert corrected_timestamp == raw_timestamp - timedelta(seconds=120)


def test_non_payment_service_retains_standard_offset():
    """
    Verifies that non-payment services (e.g. auth-service) do not receive the 120s payment offset.
    """
    raw_timestamp = datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)
    mock_auth_log = {
        "event_id": "EVT-AUTH-MOCK-001",
        "incident_id": "INC-CIVICHEALTH-001",
        "service": "auth-service",
        "timestamp": raw_timestamp,
        "level": "INFO",
        "event_type": "AUTH_TOKEN_ISSUED",
        "message": "Authentication successful",
        "source": "auth-service",
    }

    normalized = apply_clock_skew(mock_auth_log, offset_seconds=0)
    corrected_timestamp = normalized["corrected_timestamp"]

    # With offset_seconds=0, timestamp remains unchanged
    assert (raw_timestamp - corrected_timestamp).total_seconds() == 0
    assert corrected_timestamp == raw_timestamp
