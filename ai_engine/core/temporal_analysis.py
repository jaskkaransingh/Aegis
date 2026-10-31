"""
AEGIS Core: Deterministic Temporal Analysis Engine.
Implements timestamp parsing, interval construction, pairwise relationship evaluation,
temporal pattern extraction, and deterministic timeline reconstruction without LLM dependency.
"""

from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple

from ai_engine.schemas.common import AnalysisStatus
from ai_engine.schemas.analyst import EvidenceInputRecord
from ai_engine.schemas.timeline import (
    TemporalRelation,
    TimelineEntry,
    TemporalRelationshipRecord,
    TemporalPatternRecord,
    TimelineAnalysisResult,
)


@dataclass
class ParsedEventInterval:
    """
    Internal normalized representation of an event's temporal bounds.
    """
    event_id: str
    service: str
    raw_timestamp_str: Optional[str]
    corrected_timestamp_str: Optional[str]
    estimated_dt: Optional[datetime]       # Primary instant (UTC if aware)
    start_dt: Optional[datetime]           # Earliest plausible boundary
    end_dt: Optional[datetime]             # Latest plausible boundary
    uncertainty_seconds: Optional[float]
    has_uncertainty_bounds: bool
    is_valid_interval: bool
    is_timezone_aware: bool
    parse_error: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    message: Optional[str] = None


def parse_iso_timestamp(ts_str: Optional[str]) -> Tuple[Optional[datetime], bool, Optional[str]]:
    """
    Parses an ISO 8601 timestamp string.
    Returns:
        (datetime_obj, is_timezone_aware, error_message)
    Normalizes timezone-aware datetimes to UTC.
    """
    if not ts_str or not ts_str.strip():
        return None, False, "Timestamp is missing or empty."

    clean = ts_str.strip()
    try:
        # Standard ISO 8601 normalization (e.g. 'Z' -> '+00:00')
        normalized = clean.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
    except Exception as err:
        return None, False, f"Invalid ISO 8601 timestamp format: '{clean}' ({err})"

    is_aware = dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None
    if is_aware:
        dt = dt.astimezone(timezone.utc)

    return dt, is_aware, None


def construct_event_interval(record: EvidenceInputRecord) -> ParsedEventInterval:
    """
    Constructs a ParsedEventInterval from an EvidenceInputRecord.
    Respects corrected timestamps, clock offset metadata, and uncertainty intervals.
    Never invents missing timestamps or bounds.
    """
    # 1. Determine primary timestamp string
    raw_ts_str = record.raw_timestamp or record.timestamp
    corr_ts_str = record.corrected_timestamp

    # Choose primary instant: prefer corrected_timestamp if supplied, else raw
    primary_str = corr_ts_str if corr_ts_str else raw_ts_str

    est_dt, is_aware, err = parse_iso_timestamp(primary_str)
    if err or est_dt is None:
        return ParsedEventInterval(
            event_id=record.evidence_id,
            service=record.service,
            raw_timestamp_str=raw_ts_str,
            corrected_timestamp_str=corr_ts_str,
            estimated_dt=None,
            start_dt=None,
            end_dt=None,
            uncertainty_seconds=record.uncertainty_seconds,
            has_uncertainty_bounds=False,
            is_valid_interval=False,
            is_timezone_aware=False,
            parse_error=err or "Missing timestamp",
            severity=record.severity,
            category=record.category,
            message=record.message,
        )

    # 2. Check for explicit interval bounds
    start_dt = est_dt
    end_dt = est_dt
    has_uncertainty = False
    unc_seconds = record.uncertainty_seconds

    if record.time_interval_start and record.time_interval_end:
        s_dt, s_aware, s_err = parse_iso_timestamp(record.time_interval_start)
        e_dt, e_aware, e_err = parse_iso_timestamp(record.time_interval_end)
        if s_err or e_err or s_dt is None or e_dt is None:
            return ParsedEventInterval(
                event_id=record.evidence_id,
                service=record.service,
                raw_timestamp_str=raw_ts_str,
                corrected_timestamp_str=corr_ts_str,
                estimated_dt=est_dt,
                start_dt=None,
                end_dt=None,
                uncertainty_seconds=unc_seconds,
                has_uncertainty_bounds=False,
                is_valid_interval=False,
                is_timezone_aware=is_aware,
                parse_error=f"Malformed interval bounds: {s_err or e_err}",
                severity=record.severity,
                category=record.category,
                message=record.message,
            )

        if s_dt > e_dt:
            return ParsedEventInterval(
                event_id=record.evidence_id,
                service=record.service,
                raw_timestamp_str=raw_ts_str,
                corrected_timestamp_str=corr_ts_str,
                estimated_dt=est_dt,
                start_dt=s_dt,
                end_dt=e_dt,
                uncertainty_seconds=unc_seconds,
                has_uncertainty_bounds=True,
                is_valid_interval=False,
                is_timezone_aware=is_aware,
                parse_error=f"Invalid interval: start ({s_dt.isoformat()}) occurs after end ({e_dt.isoformat()}).",
                severity=record.severity,
                category=record.category,
                message=record.message,
            )

        start_dt = s_dt
        end_dt = e_dt
        has_uncertainty = True
        if unc_seconds is None:
            unc_seconds = (e_dt - s_dt).total_seconds() / 2.0

    elif unc_seconds is not None:
        if unc_seconds < 0.0:
            return ParsedEventInterval(
                event_id=record.evidence_id,
                service=record.service,
                raw_timestamp_str=raw_ts_str,
                corrected_timestamp_str=corr_ts_str,
                estimated_dt=est_dt,
                start_dt=None,
                end_dt=None,
                uncertainty_seconds=unc_seconds,
                has_uncertainty_bounds=False,
                is_valid_interval=False,
                is_timezone_aware=is_aware,
                parse_error=f"Negative uncertainty interval: {unc_seconds}s.",
                severity=record.severity,
                category=record.category,
                message=record.message,
            )
        delta = timedelta(seconds=unc_seconds)
        start_dt = est_dt - delta
        end_dt = est_dt + delta
        has_uncertainty = unc_seconds > 0.0

    return ParsedEventInterval(
        event_id=record.evidence_id,
        service=record.service,
        raw_timestamp_str=raw_ts_str,
        corrected_timestamp_str=corr_ts_str,
        estimated_dt=est_dt,
        start_dt=start_dt,
        end_dt=end_dt,
        uncertainty_seconds=unc_seconds,
        has_uncertainty_bounds=has_uncertainty,
        is_valid_interval=True,
        is_timezone_aware=is_aware,
        parse_error=None,
        severity=record.severity,
        category=record.category,
        message=record.message,
    )


def compare_intervals(a: ParsedEventInterval, b: ParsedEventInterval) -> Tuple[TemporalRelation, str]:
    """
    Evaluates pairwise temporal relationship between Event A and Event B.
    Enforces strict mathematical interval semantics.
    Does NOT force total ordering when uncertainty intervals overlap.
    """
    # 1. Invalid or missing intervals
    if not a.is_valid_interval or a.estimated_dt is None or a.start_dt is None or a.end_dt is None:
        return (
            TemporalRelation.UNKNOWN,
            f"Cannot evaluate: {a.event_id} has invalid or unparseable temporal data ({a.parse_error})."
        )
    if not b.is_valid_interval or b.estimated_dt is None or b.start_dt is None or b.end_dt is None:
        return (
            TemporalRelation.UNKNOWN,
            f"Cannot evaluate: {b.event_id} has invalid or unparseable temporal data ({b.parse_error})."
        )

    # 2. Mixed timezone-aware and timezone-naive timestamps
    if a.is_timezone_aware != b.is_timezone_aware:
        return (
            TemporalRelation.UNKNOWN,
            f"Cannot evaluate: {a.event_id} is timezone-{'aware' if a.is_timezone_aware else 'naive'} "
            f"while {b.event_id} is timezone-{'aware' if b.is_timezone_aware else 'naive'}."
        )

    # 3. Disjoint non-overlapping intervals
    if a.end_dt < b.start_dt:
        return (
            TemporalRelation.DEFINITELY_BEFORE,
            f"{a.event_id} latest bound ({a.end_dt.isoformat()}) strictly precedes {b.event_id} earliest bound ({b.start_dt.isoformat()})."
        )
    if b.end_dt < a.start_dt:
        return (
            TemporalRelation.DEFINITELY_AFTER,
            f"{a.event_id} earliest bound ({a.start_dt.isoformat()}) strictly succeeds {b.event_id} latest bound ({b.end_dt.isoformat()})."
        )

    # 4. Point timestamp comparisons (both lack uncertainty intervals)
    if not a.has_uncertainty_bounds and not b.has_uncertainty_bounds:
        if a.estimated_dt < b.estimated_dt:
            return (
                TemporalRelation.DEFINITELY_BEFORE,
                f"{a.event_id} point timestamp ({a.estimated_dt.isoformat()}) precedes {b.event_id} ({b.estimated_dt.isoformat()}) without supplied uncertainty bounds."
            )
        elif a.estimated_dt > b.estimated_dt:
            return (
                TemporalRelation.DEFINITELY_AFTER,
                f"{a.event_id} point timestamp ({a.estimated_dt.isoformat()}) succeeds {b.event_id} ({b.estimated_dt.isoformat()}) without supplied uncertainty bounds."
            )
        else:
            return (
                TemporalRelation.SAME_TIME_OR_INDETERMINATE,
                f"{a.event_id} and {b.event_id} occurred at identical point timestamp ({a.estimated_dt.isoformat()})."
            )

    # 5. Overlapping uncertainty intervals
    overlap_start = max(a.start_dt, b.start_dt)
    overlap_end = min(a.end_dt, b.end_dt)
    overlap_info = f"overlap window [{overlap_start.isoformat()} to {overlap_end.isoformat()}]"

    if a.start_dt == b.start_dt and a.end_dt == b.end_dt:
        if a.estimated_dt == b.estimated_dt:
            return (
                TemporalRelation.SAME_TIME_OR_INDETERMINATE,
                f"{a.event_id} and {b.event_id} have identical interval bounds and estimated time; order is indeterminate."
            )
        return (
            TemporalRelation.OVERLAPPING,
            f"{a.event_id} and {b.event_id} have identical uncertainty intervals [{a.start_dt.isoformat()} to {a.end_dt.isoformat()}]; order cannot be determined."
        )

    if a.estimated_dt < b.estimated_dt:
        return (
            TemporalRelation.POSSIBLY_BEFORE,
            f"{a.event_id} estimated time precedes {b.event_id}, but intervals intersect ({overlap_info}); exact order is ambiguous."
        )
    elif a.estimated_dt > b.estimated_dt:
        return (
            TemporalRelation.POSSIBLY_AFTER,
            f"{a.event_id} estimated time succeeds {b.event_id}, but intervals intersect ({overlap_info}); exact order is ambiguous."
        )
    else:
        return (
            TemporalRelation.OVERLAPPING,
            f"{a.event_id} and {b.event_id} have overlapping uncertainty intervals ({overlap_info}) and identical estimated times; order cannot be determined."
        )


class DeterministicTimelineAnalyzer:
    """
    Deterministic chronological analysis engine for AEGIS.
    Performs parsing, pairwise comparisons, and temporal pattern extraction in pure Python.
    """

    def __init__(
        self,
        error_burst_window_seconds: float = 10.0,
        cluster_window_seconds: float = 15.0,
        gap_threshold_seconds: float = 30.0,
    ):
        self.error_burst_window_seconds = error_burst_window_seconds
        self.cluster_window_seconds = cluster_window_seconds
        self.gap_threshold_seconds = gap_threshold_seconds

    def analyze(self, records: List[EvidenceInputRecord]) -> TimelineAnalysisResult:
        """
        Runs complete deterministic temporal analysis on supplied evidence records.
        """
        if not records:
            return TimelineAnalysisResult(
                status=AnalysisStatus.INSUFFICIENT_EVIDENCE,
                timeline_entries=[],
                temporal_relationships=[],
                temporal_patterns=[],
                timeline_summary="No evidence records supplied for temporal analysis.",
                uncertainties_and_limitations=["No input records provided."],
                metadata={"total_records": 0},
            )

        # 1. Parse and construct intervals
        intervals: List[ParsedEventInterval] = [
            construct_event_interval(r) for r in records
        ]

        uncertainties_and_limitations: List[str] = []
        valid_intervals = [i for i in intervals if i.is_valid_interval and i.estimated_dt is not None]
        invalid_intervals = [i for i in intervals if not i.is_valid_interval or i.estimated_dt is None]

        for inv in invalid_intervals:
            uncertainties_and_limitations.append(
                f"Event {inv.event_id} ({inv.service}) has invalid or missing timestamp: {inv.parse_error}"
            )

        points_without_bounds = [i for i in valid_intervals if not i.has_uncertainty_bounds]
        if points_without_bounds:
            uncertainties_and_limitations.append(
                f"{len(points_without_bounds)} event(s) have point timestamps without supplied uncertainty intervals "
                f"({', '.join(i.event_id for i in points_without_bounds[:5])}{'...' if len(points_without_bounds) > 5 else ''})."
            )

        # Check for mixed timezone awareness
        aware_count = sum(1 for i in valid_intervals if i.is_timezone_aware)
        naive_count = len(valid_intervals) - aware_count
        if aware_count > 0 and naive_count > 0:
            uncertainties_and_limitations.append(
                f"Dataset contains mixed timezone formats ({aware_count} timezone-aware, {naive_count} timezone-naive). "
                f"Cross-format comparisons cannot establish definite ordering."
            )

        # 2. Pairwise relationship evaluation
        relationships: List[TemporalRelationshipRecord] = []
        overlapping_pairs_count = 0
        overlap_map: Dict[str, Set[str]] = {i.event_id: set() for i in intervals}

        for i in range(len(intervals)):
            for j in range(i + 1, len(intervals)):
                ev_a = intervals[i]
                ev_b = intervals[j]
                rel, expl = compare_intervals(ev_a, ev_b)

                int_a_str = f"[{ev_a.start_dt.isoformat()} to {ev_a.end_dt.isoformat()}]" if ev_a.start_dt and ev_a.end_dt else None
                int_b_str = f"[{ev_b.start_dt.isoformat()} to {ev_b.end_dt.isoformat()}]" if ev_b.start_dt and ev_b.end_dt else None

                relationships.append(
                    TemporalRelationshipRecord(
                        event_a_id=ev_a.event_id,
                        event_b_id=ev_b.event_id,
                        relationship=rel,
                        explanation=expl,
                        interval_a=int_a_str,
                        interval_b=int_b_str,
                    )
                )

                if rel in (TemporalRelation.OVERLAPPING, TemporalRelation.POSSIBLY_BEFORE, TemporalRelation.POSSIBLY_AFTER):
                    overlapping_pairs_count += 1
                    overlap_map[ev_a.event_id].add(ev_b.event_id)
                    overlap_map[ev_b.event_id].add(ev_a.event_id)

        if overlapping_pairs_count > 0:
            uncertainties_and_limitations.append(
                f"Detected {overlapping_pairs_count} overlapping event pair(s) where timing intervals intersect. "
                f"Exact chronological order is ambiguous and total ordering cannot be guaranteed."
            )

        # 3. Sort for display timeline
        # Valid events sorted by estimated_dt, invalid placed at the end
        sorted_valid = sorted(valid_intervals, key=lambda x: x.estimated_dt)  # type: ignore
        all_sorted = sorted_valid + invalid_intervals

        timeline_entries: List[TimelineEntry] = []
        for ev in all_sorted:
            overlapping_with = sorted(list(overlap_map.get(ev.event_id, set())))
            timeline_entries.append(
                TimelineEntry(
                    event_id=ev.event_id,
                    service=ev.service,
                    severity=ev.severity,
                    event_type=ev.category,
                    summary=ev.message or "",
                    raw_timestamp=ev.raw_timestamp_str,
                    corrected_timestamp=ev.corrected_timestamp_str or (ev.estimated_dt.isoformat() if ev.estimated_dt else None),
                    earliest_time=ev.start_dt.isoformat() if ev.start_dt else None,
                    latest_time=ev.end_dt.isoformat() if ev.end_dt else None,
                    uncertainty_seconds=ev.uncertainty_seconds,
                    has_uncertainty_bounds=ev.has_uncertainty_bounds,
                    is_concurrent_or_uncertain=len(overlapping_with) > 0,
                    uncertain_ordering_with=overlapping_with,
                )
            )

        # 4. Pattern detection
        patterns = self._detect_patterns(sorted_valid)

        # 5. Formulate deterministic summary
        summary = self._generate_deterministic_summary(
            sorted_valid=sorted_valid,
            relationships=relationships,
            patterns=patterns,
            invalid_count=len(invalid_intervals),
            overlapping_count=overlapping_pairs_count,
        )

        status = AnalysisStatus.SUCCESS
        if invalid_intervals and not sorted_valid:
            status = AnalysisStatus.INVALID_MODEL_OUTPUT
        elif invalid_intervals:
            status = AnalysisStatus.SUCCESS  # Partial success with explicit warnings

        return TimelineAnalysisResult(
            status=status,
            timeline_entries=timeline_entries,
            temporal_relationships=relationships,
            temporal_patterns=patterns,
            timeline_summary=summary,
            uncertainties_and_limitations=uncertainties_and_limitations,
            causality_disclaimer=(
                "Temporal correlation does not establish causation. An event occurring before another event "
                "does not prove it caused the later event."
            ),
            metadata={
                "total_records": len(records),
                "valid_records": len(sorted_valid),
                "invalid_records": len(invalid_intervals),
                "compared_pairs": len(relationships),
                "overlapping_pairs": overlapping_pairs_count,
                "detected_patterns": len(patterns),
            },
        )

    def _detect_patterns(self, sorted_events: List[ParsedEventInterval]) -> List[TemporalPatternRecord]:
        """
        Extracts deterministic temporal patterns: error bursts, repeated events,
        service clusters, cross-service clusters, timeline gaps, and ambiguous clusters.
        """
        patterns: List[TemporalPatternRecord] = []
        if len(sorted_events) < 2:
            return patterns

        # Pattern 1: Error Bursts (>= 2 ERROR/CRITICAL within error_burst_window_seconds)
        error_events = [
            e for e in sorted_events
            if e.severity and e.severity.upper() in ("ERROR", "CRITICAL")
        ]
        burst_clusters: List[List[ParsedEventInterval]] = []
        for i, ev in enumerate(error_events):
            cluster = [ev]
            for j in range(i + 1, len(error_events)):
                diff = (error_events[j].estimated_dt - ev.estimated_dt).total_seconds()  # type: ignore
                if diff <= self.error_burst_window_seconds:
                    cluster.append(error_events[j])
                else:
                    break
            if len(cluster) >= 2:
                # Check if cluster is not a sub-cluster of already found burst
                c_ids = {c.event_id for c in cluster}
                if not any(c_ids.issubset({x.event_id for x in prev}) for prev in burst_clusters):
                    burst_clusters.append(cluster)

        for b in burst_clusters:
            span_s = (b[-1].estimated_dt - b[0].estimated_dt).total_seconds()  # type: ignore
            patterns.append(
                TemporalPatternRecord(
                    pattern_name=f"Error Burst ({len(b)} errors in {span_s:.1f}s)",
                    pattern_type="error_burst",
                    event_ids=[x.event_id for x in b],
                    time_window_seconds=span_s,
                    detection_criteria=f">= 2 ERROR/CRITICAL events within {self.error_burst_window_seconds}s window",
                    explanation=f"Identified {len(b)} critical/error events occurring in close temporal succession across {', '.join(set(x.service for x in b))}.",
                )
            )

        # Pattern 2: Cross-Service Clusters (>= 2 distinct services within cluster_window_seconds)
        cross_clusters: List[List[ParsedEventInterval]] = []
        for i, ev in enumerate(sorted_events):
            cluster = [ev]
            for j in range(i + 1, len(sorted_events)):
                diff = (sorted_events[j].estimated_dt - ev.estimated_dt).total_seconds()  # type: ignore
                if diff <= self.cluster_window_seconds:
                    cluster.append(sorted_events[j])
                else:
                    break
            services = {c.service for c in cluster}
            if len(services) >= 2 and len(cluster) >= 2:
                c_ids = {c.event_id for c in cluster}
                if not any(c_ids.issubset({x.event_id for x in prev}) for prev in cross_clusters):
                    cross_clusters.append(cluster)

        for c in cross_clusters:
            span_s = (c[-1].estimated_dt - c[0].estimated_dt).total_seconds()  # type: ignore
            services = sorted(list({x.service for x in c}))
            patterns.append(
                TemporalPatternRecord(
                    pattern_name=f"Cross-Service Temporal Cluster ({', '.join(services)})",
                    pattern_type="cross_service_cluster",
                    event_ids=[x.event_id for x in c],
                    time_window_seconds=span_s,
                    detection_criteria=f"Events across >= 2 distinct services within {self.cluster_window_seconds}s window",
                    explanation=f"Events in services {', '.join(services)} clustered within a {span_s:.1f}s window.",
                )
            )

        # Pattern 3: Timeline Gaps (> gap_threshold_seconds between consecutive events)
        for i in range(len(sorted_events) - 1):
            curr_ev = sorted_events[i]
            next_ev = sorted_events[i + 1]
            gap_s = (next_ev.estimated_dt - curr_ev.estimated_dt).total_seconds()  # type: ignore
            if gap_s > self.gap_threshold_seconds:
                patterns.append(
                    TemporalPatternRecord(
                        pattern_name=f"Observation Gap ({gap_s:.1f}s between {curr_ev.event_id} and {next_ev.event_id})",
                        pattern_type="timeline_gap",
                        event_ids=[curr_ev.event_id, next_ev.event_id],
                        time_window_seconds=gap_s,
                        detection_criteria=f"Elapsed time between consecutive events exceeds {self.gap_threshold_seconds}s",
                        explanation=f"An uninstrumented or quiet interval of {gap_s:.1f}s elapsed between {curr_ev.event_id} and {next_ev.event_id}.",
                    )
                )

        # Pattern 4: Ambiguous Ordering Clusters (>= 2 events with mutually overlapping intervals)
        ambiguous_groups: List[List[ParsedEventInterval]] = []
        for i in range(len(sorted_events)):
            group = [sorted_events[i]]
            for j in range(i + 1, len(sorted_events)):
                rel, _ = compare_intervals(sorted_events[i], sorted_events[j])
                if rel in (TemporalRelation.OVERLAPPING, TemporalRelation.POSSIBLY_BEFORE, TemporalRelation.POSSIBLY_AFTER):
                    group.append(sorted_events[j])
            if len(group) >= 2:
                g_ids = {x.event_id for x in group}
                if not any(g_ids.issubset({x.event_id for x in prev}) for prev in ambiguous_groups):
                    ambiguous_groups.append(group)

        for g in ambiguous_groups:
            span_s = (g[-1].estimated_dt - g[0].estimated_dt).total_seconds()  # type: ignore
            patterns.append(
                TemporalPatternRecord(
                    pattern_name=f"Ambiguous Ordering Cluster ({', '.join(x.event_id for x in g)})",
                    pattern_type="ambiguous_cluster",
                    event_ids=[x.event_id for x in g],
                    time_window_seconds=span_s,
                    detection_criteria="Multiple events with intersecting uncertainty intervals",
                    explanation=f"Events {', '.join(x.event_id for x in g)} have overlapping uncertainty bounds; their relative order cannot be definitively proven.",
                )
            )

        return patterns

    def _generate_deterministic_summary(
        self,
        sorted_valid: List[ParsedEventInterval],
        relationships: List[TemporalRelationshipRecord],
        patterns: List[TemporalPatternRecord],
        invalid_count: int,
        overlapping_count: int,
    ) -> str:
        """
        Constructs a concise, strictly factual summary of temporal findings.
        """
        if not sorted_valid:
            return "No valid temporal events could be ordered."

        first_ev = sorted_valid[0]
        last_ev = sorted_valid[-1]
        t_span = (last_ev.estimated_dt - first_ev.estimated_dt).total_seconds()  # type: ignore

        definite_before = sum(1 for r in relationships if r.relationship == TemporalRelation.DEFINITELY_BEFORE)

        summary_lines = [
            f"Deterministic Chronological Analysis: Reconstructed sequence of {len(sorted_valid)} valid events "
            f"spanning {t_span:.1f}s (from {first_ev.estimated_dt.isoformat()} to {last_ev.estimated_dt.isoformat()}).",
            f"Identified {definite_before} definite ordering relationship(s) and {overlapping_count} ambiguous overlapping pair(s).",
        ]

        if patterns:
            pattern_summaries = [f"{p.pattern_name}" for p in patterns[:3]]
            summary_lines.append(f"Detected {len(patterns)} temporal pattern(s): {'; '.join(pattern_summaries)}.")

        if invalid_count > 0:
            summary_lines.append(f"Notice: {invalid_count} record(s) had unparseable or missing timestamps.")

        summary_lines.append(
            "Epistemic notice: Temporal precedence alone does not establish causation."
        )

        return " ".join(summary_lines)

