"""
AEGIS Deterministic Tool: Clock Correction and Temporal Uncertainty.

Implements clock skew correction, interval calculation, and partial ordering.
Conventions:
- Positive offset means source clock is ahead of reference time (UTC).
- Corrected time = recorded time - clock offset.
- Preserves original raw timestamps.
- Never asserts strict ordering on overlapping uncertainty intervals without causal proof.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Union
import re

from app.schemas.events import ClockOffsetEstimate, NormalizedEvent
from app.schemas.investigation import OrderingRelation


def parse_iso_timestamp(ts: Union[str, datetime]) -> datetime:
    """
    Parse an ISO 8601 timestamp string into a timezone-aware UTC datetime.
    Supports fractional seconds and 'Z' or '+00:00' offsets.
    """
    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            return ts.replace(tzinfo=timezone.utc)
        return ts.astimezone(timezone.utc)

    ts_str = ts.strip()
    # Normalize 'Z' to '+00:00'
    if ts_str.endswith("Z") or ts_str.endswith("z"):
        ts_str = ts_str[:-1] + "+00:00"

    try:
        dt = datetime.fromisoformat(ts_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception as e:
        raise ValueError(f"Invalid ISO 8601 timestamp '{ts}': {e}") from e


def format_iso_timestamp(dt: datetime) -> str:
    """Format a UTC datetime into standardized ISO 8601 string."""
    utc_dt = dt.astimezone(timezone.utc)
    return utc_dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def calculate_corrected_interval(
    recorded_time: Union[str, datetime],
    offset_seconds: float = 0.0,
    uncertainty_seconds: float = 0.0,
) -> Tuple[datetime, datetime, datetime, float]:
    """
    Calculates corrected reference time and uncertainty intervals.

    Convention:
        positive offset = source clock is ahead of reference clock.
        corrected_time = recorded_time - offset_seconds.
        uncertainty interval = [corrected_time - uncertainty, corrected_time + uncertainty].

    Returns:
        (recorded_dt, corrected_dt, interval_start, interval_end)
    """
    recorded_dt = parse_iso_timestamp(recorded_time)
    corrected_dt = recorded_dt - timedelta(seconds=offset_seconds)

    if uncertainty_seconds < 0:
        uncertainty_seconds = abs(uncertainty_seconds)

    interval_start = corrected_dt - timedelta(seconds=uncertainty_seconds)
    interval_end = corrected_dt + timedelta(seconds=uncertainty_seconds)

    return recorded_dt, corrected_dt, interval_start, interval_end


def determine_ordering_relation(
    interval_a: Tuple[datetime, datetime],
    interval_b: Tuple[datetime, datetime],
) -> OrderingRelation:
    """
    Determines deterministic temporal relation between two events with uncertainty intervals.

    interval: (interval_start, interval_end)
    - If interval_a.end < interval_b.start: STRICTLY_BEFORE (A happened before B with certainty)
    - If interval_a.start > interval_b.end: STRICTLY_AFTER (A happened after B with certainty)
    - Otherwise (intervals overlap): CONCURRENT_OR_UNCERTAIN (strict ordering cannot be established solely from clocks)
    """
    start_a, end_a = interval_a
    start_b, end_b = interval_b

    if end_a < start_b:
        return OrderingRelation.STRICTLY_BEFORE
    elif start_a > end_b:
        return OrderingRelation.STRICTLY_AFTER
    else:
        return OrderingRelation.CONCURRENT_OR_UNCERTAIN


def identify_uncertain_orderings(events: List[NormalizedEvent]) -> Dict[str, List[str]]:
    """
    Builds a bidirectional map of event IDs that have overlapping uncertainty intervals,
    indicating uncertain temporal ordering where causal sequence cannot be assumed from timestamps alone.
    """
    overlap_map: Dict[str, List[str]] = {ev.id: [] for ev in events}

    for i in range(len(events)):
        ev_i = events[i]
        int_i = (ev_i.time_interval_start, ev_i.time_interval_end)

        for j in range(i + 1, len(events)):
            ev_j = events[j]
            int_j = (ev_j.time_interval_start, ev_j.time_interval_end)

            relation = determine_ordering_relation(int_i, int_j)
            if relation == OrderingRelation.CONCURRENT_OR_UNCERTAIN:
                overlap_map[ev_i.id].append(ev_j.id)
                overlap_map[ev_j.id].append(ev_i.id)

    return overlap_map
