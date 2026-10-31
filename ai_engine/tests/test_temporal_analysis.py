"""
Unit Tests for AEGIS Deterministic Temporal Analysis Engine.
Tests timestamp parsing, interval construction, pairwise relationship evaluation,
pattern detection, and determinism without requiring Ollama.
"""

from datetime import datetime, timezone, timedelta
import pytest

from ai_engine.schemas.common import AnalysisStatus
from ai_engine.schemas.analyst import EvidenceInputRecord
from ai_engine.schemas.timeline import TemporalRelation
from ai_engine.core.temporal_analysis import (
    DeterministicTimelineAnalyzer,
    ParsedEventInterval,
    parse_iso_timestamp,
    construct_event_interval,
    compare_intervals,
)


# =============================================================================
# 1. TIMESTAMP PARSING TESTS
# =============================================================================

class TestTimestampParsing:
    def test_valid_timezone_aware_utc(self):
        dt, is_aware, err = parse_iso_timestamp("2026-10-31T14:00:00Z")
        assert err is None
        assert is_aware is True
        assert dt == datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)

    def test_valid_timezone_aware_offset(self):
        # 16:00:00+02:00 is exactly 14:00:00 UTC
        dt, is_aware, err = parse_iso_timestamp("2026-10-31T16:00:00+02:00")
        assert err is None
        assert is_aware is True
        assert dt == datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)

    def test_equivalent_instants_different_offsets(self):
        dt1, _, err1 = parse_iso_timestamp("2026-10-31T14:00:00Z")
        dt2, _, err2 = parse_iso_timestamp("2026-10-31T16:00:00+02:00")
        dt3, _, err3 = parse_iso_timestamp("2026-10-31T10:00:00-04:00")
        assert err1 is None and err2 is None and err3 is None
        assert dt1 == dt2 == dt3

    def test_naive_timestamp(self):
        dt, is_aware, err = parse_iso_timestamp("2026-10-31 14:00:00")
        assert err is None
        assert is_aware is False
        assert dt == datetime(2026, 10, 31, 14, 0, 0)

    def test_invalid_timestamp_format(self):
        dt, is_aware, err = parse_iso_timestamp("not-a-valid-timestamp")
        assert dt is None
        assert "Invalid ISO 8601" in err

    def test_missing_timestamp(self):
        dt, is_aware, err = parse_iso_timestamp(None)
        assert dt is None
        assert "missing" in err.lower()

        dt_empty, _, err_empty = parse_iso_timestamp("   ")
        assert dt_empty is None
        assert "missing" in err_empty.lower()


# =============================================================================
# 2. INTERVAL HANDLING TESTS
# =============================================================================

class TestIntervalHandling:
    def test_valid_uncertainty_seconds(self):
        rec = EvidenceInputRecord(
            evidence_id="TEST-001",
            service="database",
            timestamp="2026-10-31T14:00:10Z",
            uncertainty_seconds=2.5,
        )
        interval = construct_event_interval(rec)
        assert interval.is_valid_interval is True
        assert interval.has_uncertainty_bounds is True
        assert interval.start_dt == datetime(2026, 10, 31, 14, 0, 7, 500000, tzinfo=timezone.utc)
        assert interval.end_dt == datetime(2026, 10, 31, 14, 0, 12, 500000, tzinfo=timezone.utc)

    def test_explicit_interval_bounds(self):
        rec = EvidenceInputRecord(
            evidence_id="TEST-002",
            service="api",
            timestamp="2026-10-31T14:00:10Z",
            time_interval_start="2026-10-31T14:00:05Z",
            time_interval_end="2026-10-31T14:00:15Z",
        )
        interval = construct_event_interval(rec)
        assert interval.is_valid_interval is True
        assert interval.start_dt == datetime(2026, 10, 31, 14, 0, 5, tzinfo=timezone.utc)
        assert interval.end_dt == datetime(2026, 10, 31, 14, 0, 15, tzinfo=timezone.utc)
        assert interval.uncertainty_seconds == 5.0

    def test_invalid_interval_start_after_end(self):
        rec = EvidenceInputRecord(
            evidence_id="TEST-003",
            service="api",
            timestamp="2026-10-31T14:00:10Z",
            time_interval_start="2026-10-31T14:00:20Z",  # After end!
            time_interval_end="2026-10-31T14:00:05Z",
        )
        interval = construct_event_interval(rec)
        assert interval.is_valid_interval is False
        assert "start" in interval.parse_error and "occurs after end" in interval.parse_error

    def test_negative_uncertainty_seconds(self):
        rec = EvidenceInputRecord(
            evidence_id="TEST-004",
            service="api",
            timestamp="2026-10-31T14:00:10Z",
            uncertainty_seconds=-1.0,
        )
        interval = construct_event_interval(rec)
        assert interval.is_valid_interval is False
        assert "Negative uncertainty" in interval.parse_error

    def test_point_timestamp_without_bounds(self):
        rec = EvidenceInputRecord(
            evidence_id="TEST-005",
            service="api",
            timestamp="2026-10-31T14:00:10Z",
        )
        interval = construct_event_interval(rec)
        assert interval.is_valid_interval is True
        assert interval.has_uncertainty_bounds is False
        assert interval.start_dt == interval.estimated_dt == interval.end_dt


# =============================================================================
# 3. TEMPORAL RELATIONSHIP TESTS
# =============================================================================

class TestTemporalRelationships:
    def test_definitely_before_disjoint_intervals(self):
        # A: 10:00:00 to 10:00:04, B: 10:00:06 to 10:00:10
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:02Z",
            uncertainty_seconds=2.0,
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp="2026-10-31T10:00:08Z",
            uncertainty_seconds=2.0,
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel_ab, expl_ab = compare_intervals(int_a, int_b)
        assert rel_ab == TemporalRelation.DEFINITELY_BEFORE
        assert "strictly precedes" in expl_ab

        rel_ba, expl_ba = compare_intervals(int_b, int_a)
        assert rel_ba == TemporalRelation.DEFINITELY_AFTER
        assert "strictly succeeds" in expl_ba

    def test_overlapping_intervals_possibly_before(self):
        # A: 10:00:00 to 10:00:10 (est 10:00:05)
        # B: 10:00:06 to 10:00:16 (est 10:00:11)
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:05Z",
            uncertainty_seconds=5.0,
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp="2026-10-31T10:00:11Z",
            uncertainty_seconds=5.0,
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel, expl = compare_intervals(int_a, int_b)
        assert rel == TemporalRelation.POSSIBLY_BEFORE
        assert "overlap" in expl.lower()
        assert "ambiguous" in expl.lower()

    def test_identical_intervals_overlapping(self):
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:05Z",
            uncertainty_seconds=5.0,
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp="2026-10-31T10:00:05Z",
            uncertainty_seconds=5.0,
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel, _ = compare_intervals(int_a, int_b)
        assert rel == TemporalRelation.SAME_TIME_OR_INDETERMINATE

    def test_equal_point_timestamps(self):
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:05Z",
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp="2026-10-31T10:00:05Z",
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel, _ = compare_intervals(int_a, int_b)
        assert rel == TemporalRelation.SAME_TIME_OR_INDETERMINATE

    def test_missing_timestamp_returns_unknown(self):
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:05Z",
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp=None,
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel, expl = compare_intervals(int_a, int_b)
        assert rel == TemporalRelation.UNKNOWN
        assert "unparseable" in expl.lower() or "missing" in expl.lower()

    def test_mixed_aware_and_naive_returns_unknown(self):
        rec_a = EvidenceInputRecord(
            evidence_id="EVT-A",
            service="s1",
            timestamp="2026-10-31T10:00:05Z",  # Aware (UTC)
        )
        rec_b = EvidenceInputRecord(
            evidence_id="EVT-B",
            service="s2",
            timestamp="2026-10-31 10:00:05",   # Naive
        )
        int_a = construct_event_interval(rec_a)
        int_b = construct_event_interval(rec_b)

        rel, expl = compare_intervals(int_a, int_b)
        assert rel == TemporalRelation.UNKNOWN
        assert "timezone-aware" in expl and "timezone-naive" in expl


# =============================================================================
# 4. PATTERN DETECTION & DETERMINISM TESTS
# =============================================================================

class TestPatternDetectionAndDeterminism:
    def test_error_burst_detected(self):
        analyzer = DeterministicTimelineAnalyzer(error_burst_window_seconds=10.0)
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                severity="ERROR",
                timestamp="2026-10-31T14:00:00Z",
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="api",
                severity="CRITICAL",
                timestamp="2026-10-31T14:00:04Z",
            ),
            EvidenceInputRecord(
                evidence_id="EVT-3",
                service="worker",
                severity="INFO",
                timestamp="2026-10-31T14:00:08Z",
            ),
        ]
        result = analyzer.analyze(records)
        burst_patterns = [p for p in result.temporal_patterns if p.pattern_type == "error_burst"]
        assert len(burst_patterns) == 1
        assert burst_patterns[0].event_ids == ["EVT-1", "EVT-2"]

    def test_no_error_burst_when_outside_window(self):
        analyzer = DeterministicTimelineAnalyzer(error_burst_window_seconds=5.0)
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                severity="ERROR",
                timestamp="2026-10-31T14:00:00Z",
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="api",
                severity="ERROR",
                timestamp="2026-10-31T14:00:20Z",  # 20s gap > 5s window
            ),
        ]
        result = analyzer.analyze(records)
        burst_patterns = [p for p in result.temporal_patterns if p.pattern_type == "error_burst"]
        assert len(burst_patterns) == 0

    def test_cross_service_cluster_detected(self):
        analyzer = DeterministicTimelineAnalyzer(cluster_window_seconds=15.0)
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                timestamp="2026-10-31T14:00:00Z",
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="cache",
                timestamp="2026-10-31T14:00:05Z",
            ),
        ]
        result = analyzer.analyze(records)
        cross_patterns = [p for p in result.temporal_patterns if p.pattern_type == "cross_service_cluster"]
        assert len(cross_patterns) == 1
        assert "database" in cross_patterns[0].pattern_name and "cache" in cross_patterns[0].pattern_name

    def test_timeline_gap_detected(self):
        analyzer = DeterministicTimelineAnalyzer(gap_threshold_seconds=30.0)
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                timestamp="2026-10-31T14:00:00Z",
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="database",
                timestamp="2026-10-31T14:01:00Z",  # 60s gap > 30s threshold
            ),
        ]
        result = analyzer.analyze(records)
        gap_patterns = [p for p in result.temporal_patterns if p.pattern_type == "timeline_gap"]
        assert len(gap_patterns) == 1
        assert gap_patterns[0].time_window_seconds == 60.0

    def test_ambiguous_cluster_detected(self):
        analyzer = DeterministicTimelineAnalyzer()
        # Overlapping intervals
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                timestamp="2026-10-31T14:00:05Z",
                uncertainty_seconds=4.0,  # 14:00:01 to 14:00:09
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="api",
                timestamp="2026-10-31T14:00:07Z",
                uncertainty_seconds=4.0,  # 14:00:03 to 14:00:11
            ),
        ]
        result = analyzer.analyze(records)
        amb_patterns = [p for p in result.temporal_patterns if p.pattern_type == "ambiguous_cluster"]
        assert len(amb_patterns) == 1
        assert set(amb_patterns[0].event_ids) == {"EVT-1", "EVT-2"}

        # Verify entry flags preserve ambiguity
        assert result.timeline_entries[0].is_concurrent_or_uncertain is True
        assert "EVT-2" in result.timeline_entries[0].uncertain_ordering_with

    def test_deterministic_identical_runs(self):
        analyzer = DeterministicTimelineAnalyzer()
        records = [
            EvidenceInputRecord(
                evidence_id="EVT-1",
                service="database",
                severity="ERROR",
                timestamp="2026-10-31T14:00:00Z",
                uncertainty_seconds=1.0,
            ),
            EvidenceInputRecord(
                evidence_id="EVT-2",
                service="api",
                severity="CRITICAL",
                timestamp="2026-10-31T14:00:05Z",
                uncertainty_seconds=2.0,
            ),
        ]
        res1 = analyzer.analyze(records)
        res2 = analyzer.analyze(records)
        assert res1.model_dump() == res2.model_dump()

