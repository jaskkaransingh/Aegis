"""
AEGIS Schema: Events and Clock Offset Models.
Defines data structures for raw log entries, data quality warnings,
clock offset estimates, and normalized evidence events.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ClockOffsetEstimate(BaseModel):
    """
    Clock offset estimate for a specific service clock relative to reference time (UTC).
    Convention: Positive offset means source clock is ahead of reference time.
    Corrected time = recorded time - clock offset.
    """
    service: str = Field(..., description="Service identifier, e.g. 'payment-service'")
    offset_seconds: float = Field(
        ...,
        description="Clock offset in seconds. Positive means clock is ahead of UTC reference."
    )
    uncertainty_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Half-width delta representing timing uncertainty interval [t - delta, t + delta]."
    )
    method: str = Field(
        default="ntp_measurement",
        description="Method used to calculate or estimate offset (e.g. 'ntp_handshake', 'tcp_timestamp')"
    )
    reference_clock: str = Field(default="UTC", description="Reference time standard")
    notes: Optional[str] = Field(default=None, description="Contextual notes on clock drift")

    model_config = ConfigDict(extra="ignore")


class RawEvent(BaseModel):
    """
    Unprocessed, raw log record as ingested from source service.
    Preserves exact original strings and fields.
    """
    id: str = Field(..., description="Raw identifier from log emitter (may contain collisions or typos)")
    service: str = Field(..., description="Originating service name")
    timestamp: str = Field(..., description="Raw timestamp string from service log")
    severity: str = Field(default="INFO", description="Log severity level (INFO, WARN, ERROR, CRITICAL)")
    event_type: str = Field(..., description="Domain event categorization")
    message: str = Field(..., description="Human-readable event message or log line")
    trace_id: Optional[str] = Field(default=None, description="Distributed tracing correlation ID")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Raw supplemental key-value metadata")

    model_config = ConfigDict(extra="ignore")


class DataQualityWarning(BaseModel):
    """
    Structured warning identifying log anomalies, missing fields, or data quality risks.
    Ensures no malformed or duplicate record is silently dropped.
    """
    code: str = Field(..., description="Warning code, e.g. 'DUPLICATE_EVENT_ID', 'MISSING_TRACE_ID'")
    severity: str = Field(default="MEDIUM", description="Data quality risk severity: LOW, MEDIUM, HIGH")
    message: str = Field(..., description="Detailed description of the data quality anomaly")
    event_id: Optional[str] = Field(default=None, description="Associated event ID, if identifiable")
    field_name: Optional[str] = Field(default=None, description="Specific field affected")
    action_taken: str = Field(..., description="Action taken by the normalization pipeline")

    model_config = ConfigDict(extra="ignore")


class NormalizedEvent(BaseModel):
    """
    Normalized, time-corrected log event suitable for cross-service deterministic correlation.
    Carries original timestamps, corrected timestamps, and uncertainty intervals.
    """
    id: str = Field(..., description="Stable, unique canonical event ID in normalized dataset")
    raw_id: str = Field(..., description="Original raw event ID from source log")
    service: str = Field(..., description="Canonical service name")
    original_timestamp: str = Field(..., description="Exact raw timestamp string preserved from source")
    recorded_datetime: datetime = Field(..., description="Parsed datetime as recorded by source clock")
    corrected_datetime: datetime = Field(..., description="Reference UTC datetime adjusted for clock offset")
    uncertainty_seconds: float = Field(
        default=0.0,
        ge=0.0,
        description="Timestamp uncertainty interval half-width (+/- seconds)"
    )
    time_interval_start: datetime = Field(
        ...,
        description="Lower bound of uncertainty interval: corrected_datetime - uncertainty"
    )
    time_interval_end: datetime = Field(
        ...,
        description="Upper bound of uncertainty interval: corrected_datetime + uncertainty"
    )
    severity: str = Field(..., description="Standardized severity level (INFO, WARN, ERROR, CRITICAL)")
    event_type: str = Field(..., description="Standardized event category")
    message: str = Field(..., description="Event message")
    trace_id: Optional[str] = Field(default=None, description="Distributed trace ID")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Normalized metadata payload")
    is_duplicate: bool = Field(default=False, description="Flag indicating if record was a duplicate")
    duplicate_of: Optional[str] = Field(default=None, description="Canonical event ID if this is a duplicate")
    data_quality_warnings: List[DataQualityWarning] = Field(
        default_factory=list,
        description="List of data quality issues identified during normalization"
    )
    clock_correction_applied: bool = Field(default=False, description="Whether a clock offset was applied")
    offset_applied_seconds: float = Field(default=0.0, description="Offset in seconds subtracted from recorded time")

    model_config = ConfigDict(extra="ignore")
