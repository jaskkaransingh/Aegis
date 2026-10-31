"""
AEGIS Schema: Timeline Correlator Models.
Defines typed models for timeline entries, interval-based pairwise relationships,
temporal patterns, and structured timeline analysis results.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from ai_engine.schemas.common import AnalysisStatus


class TemporalRelation(str, Enum):
    """
    Pairwise temporal ordering relationship between two events.
    Strictly accounts for uncertainty intervals and refuses forced total ordering.
    """
    DEFINITELY_BEFORE = "DEFINITELY_BEFORE"
    DEFINITELY_AFTER = "DEFINITELY_AFTER"
    POSSIBLY_BEFORE = "POSSIBLY_BEFORE"
    POSSIBLY_AFTER = "POSSIBLY_AFTER"
    OVERLAPPING = "OVERLAPPING"
    SAME_TIME_OR_INDETERMINATE = "SAME_TIME_OR_INDETERMINATE"
    UNKNOWN = "UNKNOWN"


class TimelineEntry(BaseModel):
    """
    A single reconstructed event along the incident timeline.
    Preserves raw vs. corrected timestamps and explicitly signals ordering uncertainty.
    """
    event_id: str = Field(..., description="Canonical event identifier.")
    service: str = Field(..., description="Originating service name.")
    severity: Optional[str] = Field(default=None, description="Event severity (INFO, WARN, ERROR, CRITICAL).")
    event_type: Optional[str] = Field(default=None, description="Event domain category.")
    summary: str = Field(default="", description="Brief summary of event occurrence.")
    raw_timestamp: Optional[str] = Field(default=None, description="Preserved original raw timestamp string.")
    corrected_timestamp: Optional[str] = Field(default=None, description="Corrected reference UTC timestamp.")
    earliest_time: Optional[str] = Field(default=None, description="Earliest plausible timestamp boundary (ISO 8601).")
    latest_time: Optional[str] = Field(default=None, description="Latest plausible timestamp boundary (ISO 8601).")
    uncertainty_seconds: Optional[float] = Field(default=None, description="Half-width uncertainty interval in seconds.")
    has_uncertainty_bounds: bool = Field(default=False, description="Whether interval bounds were supplied.")
    is_concurrent_or_uncertain: bool = Field(default=False, description="True if uncertainty overlaps with another event.")
    uncertain_ordering_with: List[str] = Field(
        default_factory=list,
        description="List of other event IDs whose uncertainty intervals overlap with this event."
    )

    model_config = ConfigDict(extra="ignore")


class TemporalRelationshipRecord(BaseModel):
    """
    Deterministic pairwise temporal evaluation between Event A and Event B.
    """
    event_a_id: str = Field(..., description="First event identifier.")
    event_b_id: str = Field(..., description="Second event identifier.")
    relationship: TemporalRelation = Field(..., description="Computed temporal relationship classification.")
    explanation: str = Field(..., description="Mathematical rationale supporting the classification.")
    interval_a: Optional[str] = Field(default=None, description="String representation of interval A.")
    interval_b: Optional[str] = Field(default=None, description="String representation of interval B.")

    model_config = ConfigDict(extra="ignore")


class TemporalPatternRecord(BaseModel):
    """
    Identified temporal pattern (e.g. error burst, repeated event, cross-service cluster).
    """
    pattern_name: str = Field(..., description="Title of the detected temporal pattern.")
    pattern_type: str = Field(
        ...,
        description="Type: 'error_burst', 'repeated_event', 'service_cluster', 'cross_service_cluster', 'timeline_gap', 'ambiguous_cluster'."
    )
    event_ids: List[str] = Field(default_factory=list, description="IDs of events participating in the pattern.")
    time_window_seconds: float = Field(..., description="Duration or sliding window size in seconds.")
    detection_criteria: str = Field(..., description="Deterministic criteria used to extract this pattern.")
    explanation: str = Field(..., description="Description of the observed temporal behavior.")

    model_config = ConfigDict(extra="ignore")


class TimelineAnalysisResult(BaseModel):
    """
    Comprehensive output produced by the Timeline Correlator Agent.
    """
    status: AnalysisStatus = Field(..., description="Operational status of the timeline analysis.")
    timeline_entries: List[TimelineEntry] = Field(
        default_factory=list,
        description="Chronologically sorted display timeline with preserved uncertainty flags."
    )
    temporal_relationships: List[TemporalRelationshipRecord] = Field(
        default_factory=list,
        description="Pairwise temporal relationship evaluations between events."
    )
    temporal_patterns: List[TemporalPatternRecord] = Field(
        default_factory=list,
        description="Identified temporal patterns, error bursts, and timeline gaps."
    )
    timeline_summary: str = Field(
        default="",
        description="Readable explanation of strongest supported temporal findings."
    )
    uncertainties_and_limitations: List[str] = Field(
        default_factory=list,
        description="Explicit enumeration of missing timestamps, overlapping intervals, and data limits."
    )
    causality_disclaimer: str = Field(
        default="Temporal correlation does not establish causation. An event occurring before another event does not prove it caused the later event.",
        description="Mandatory forensic epistemological notice."
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Execution metadata: total events, compared pairs, detected patterns, Ollama status."
    )

    model_config = ConfigDict(extra="ignore")

