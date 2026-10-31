"""
Unit Tests for AEGIS Clock Correction Tool (app/tools/clock_correction.py).
Tests:
- Timestamp correction with known offsets
- Clock offset conventions (positive = clock is ahead)
- Uncertainty intervals
- Uncertain ordering and overlap detection
- Preservation of original timestamps
"""

from datetime import datetime, timezone, timedelta
import pytest

from app.schemas.events import ClockOffsetEstimate, NormalizedEvent
from app.schemas.investigation import OrderingRelation
from app.tools.clock_correction import (
    calculate_corrected_interval,
    determine_ordering_relation,
    format_iso_timestamp,
    identify_uncertain_orderings,
    parse_iso_timestamp,
)


def test_positive_offset_convention():
    """
    Convention: Positive offset means source clock is ahead of reference time.
    Corrected time = recorded time - clock offset.
    """
    # Recorded time is 14:01:42.000Z. Clock is ahead by 42.0s.
    recorded = "2026-10-31T14:01:42.000Z"
    offset_seconds = 42.0
    uncertainty = 1.0

    recorded_dt, corrected_dt, int_start, int_end = calculate_corrected_interval(
        recorded, offset_seconds=offset_seconds, uncertainty_seconds=uncertainty
    )

    expected_recorded = datetime(2026, 10, 31, 14, 1, 42, tzinfo=timezone.utc)
    expected_corrected = datetime(2026, 10, 31, 14, 1, 0, tzinfo=timezone.utc)

    assert recorded_dt == expected_recorded
    assert corrected_dt == expected_corrected
    assert int_start == expected_corrected - timedelta(seconds=1.0)
    assert int_end == expected_corrected + timedelta(seconds=1.0)


def test_negative_offset_convention():
    """
    A negative offset means source clock is behind reference time.
    Corrected time = recorded time - (-offset) = recorded time + offset.
    """
    recorded = "2026-10-31T14:00:00.000Z"
    offset_seconds = -15.0  # 15 seconds behind
    _, corrected_dt, _, _ = calculate_corrected_interval(recorded, offset_seconds=offset_seconds)

    expected_corrected = datetime(2026, 10, 31, 14, 0, 15, tzinfo=timezone.utc)
    assert corrected_dt == expected_corrected


def test_payment_service_specific_correction():
    """
    Validates specific scenario: Payment Service recorded EVT-013 at 14:01:10.120Z.
    With +42.0s offset, reference time must be 14:00:28.120Z.
    """
    recorded_raw = "2026-10-31T14:01:10.120Z"
    _, corrected_dt, int_start, int_end = calculate_corrected_interval(
        recorded_raw, offset_seconds=42.0, uncertainty_seconds=2.0
    )

    assert format_iso_timestamp(corrected_dt) == "2026-10-31T14:00:28.120Z"
    assert format_iso_timestamp(int_start) == "2026-10-31T14:00:26.120Z"
    assert format_iso_timestamp(int_end) == "2026-10-31T14:00:30.120Z"


def test_determine_ordering_relation_strictly_before():
    """Interval A finishes strictly before Interval B starts."""
    dt_a = datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)
    dt_b = datetime(2026, 10, 31, 14, 0, 10, tzinfo=timezone.utc)

    interval_a = (dt_a - timedelta(seconds=1), dt_a + timedelta(seconds=1))  # [13:59:59, 14:00:01]
    interval_b = (dt_b - timedelta(seconds=1), dt_b + timedelta(seconds=1))  # [14:00:09, 14:00:11]

    relation = determine_ordering_relation(interval_a, interval_b)
    assert relation == OrderingRelation.STRICTLY_BEFORE


def test_determine_ordering_relation_strictly_after():
    """Interval A starts strictly after Interval B finishes."""
    dt_a = datetime(2026, 10, 31, 14, 0, 20, tzinfo=timezone.utc)
    dt_b = datetime(2026, 10, 31, 14, 0, 5, tzinfo=timezone.utc)

    interval_a = (dt_a - timedelta(seconds=1), dt_a + timedelta(seconds=1))
    interval_b = (dt_b - timedelta(seconds=1), dt_b + timedelta(seconds=1))

    relation = determine_ordering_relation(interval_a, interval_b)
    assert relation == OrderingRelation.STRICTLY_AFTER


def test_determine_ordering_relation_uncertain_overlap():
    """
    Rule requirement: Do not impose a strict causal ordering on events whose
    corrected intervals overlap. Must be CONCURRENT_OR_UNCERTAIN.
    """
    dt_a = datetime(2026, 10, 31, 14, 0, 22, tzinfo=timezone.utc)  # Appointment timeout
    dt_b = datetime(2026, 10, 31, 14, 0, 24, tzinfo=timezone.utc)  # Hospital Records timeout

    # If uncertainty is +/- 2 seconds, intervals [20s, 24s] and [22s, 26s] overlap!
    interval_a = (dt_a - timedelta(seconds=2), dt_a + timedelta(seconds=2))
    interval_b = (dt_b - timedelta(seconds=2), dt_b + timedelta(seconds=2))

    relation = determine_ordering_relation(interval_a, interval_b)
    assert relation == OrderingRelation.CONCURRENT_OR_UNCERTAIN


def test_identify_uncertain_orderings_bidirectional():
    """Checks that overlap detection correctly marks mutual uncertainty across events."""
    base = datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)

    ev1 = NormalizedEvent(
        id="EVT-A",
        raw_id="EVT-A",
        service="appointment-service",
        original_timestamp="2026-10-31T14:00:00.000Z",
        recorded_datetime=base,
        corrected_datetime=base,
        uncertainty_seconds=2.0,
        time_interval_start=base - timedelta(seconds=2.0),
        time_interval_end=base + timedelta(seconds=2.0),
        severity="ERROR",
        event_type="TIMEOUT",
        message="Test event A",
    )

    ev2 = NormalizedEvent(
        id="EVT-B",
        raw_id="EVT-B",
        service="hospital-records-service",
        original_timestamp="2026-10-31T14:00:01.000Z",
        recorded_datetime=base + timedelta(seconds=1),
        corrected_datetime=base + timedelta(seconds=1),
        uncertainty_seconds=2.0,
        time_interval_start=(base + timedelta(seconds=1)) - timedelta(seconds=2.0),
        time_interval_end=(base + timedelta(seconds=1)) + timedelta(seconds=2.0),
        severity="ERROR",
        event_type="TIMEOUT",
        message="Test event B",
    )

    ev3 = NormalizedEvent(
        id="EVT-C",
        raw_id="EVT-C",
        service="api-gateway",
        original_timestamp="2026-10-31T14:05:00.000Z",
        recorded_datetime=base + timedelta(minutes=5),
        corrected_datetime=base + timedelta(minutes=5),
        uncertainty_seconds=0.1,
        time_interval_start=(base + timedelta(minutes=5)) - timedelta(seconds=0.1),
        time_interval_end=(base + timedelta(minutes=5)) + timedelta(seconds=0.1),
        severity="INFO",
        event_type="RECOVERED",
        message="Test event C far in future",
    )

    overlap_map = identify_uncertain_orderings([ev1, ev2, ev3])

    # EVT-A and EVT-B overlap each other
    assert "EVT-B" in overlap_map["EVT-A"]
    assert "EVT-A" in overlap_map["EVT-B"]

    # EVT-C does NOT overlap with EVT-A or EVT-B
    assert "EVT-C" not in overlap_map["EVT-A"]
    assert "EVT-A" not in overlap_map["EVT-C"]
