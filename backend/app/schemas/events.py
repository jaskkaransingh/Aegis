"""
AEGIS Schema: Events and Clock Offset Models.
Defines data structures for raw log entries, data quality warnings,
clock offset estimates, and normalized evidence events.
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, model_validator


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


class RawEvent(BaseModel):
    """
    RawEvent represents an unprocessed log event ingested from an originating service.
    """
    event_id: str = Field(..., description="Unique event identifier")
    incident_id: Optional[str] = Field(default=None, description="Optional incident correlation ID")
    service: str = Field(..., description="Originating service name")
    timestamp: datetime = Field(..., description="Timestamp of the event as datetime")
    level: str = Field(default="INFO", description="Log severity level (INFO, WARN, ERROR, CRITICAL)")
    event_type: str = Field(default="GENERAL_LOG", description="Domain event categorization")
    message: str = Field(default="", description="Human-readable event message or log line")
    source: str = Field(default="", description="Source system, collector, or file")
    trace_id: Optional[str] = Field(default=None, description="Distributed tracing correlation ID")
    metadata: Dict[str, Any] = Field(default_factory=dict, description=" supplemental metadata payload")

    # Backward compatibility fields
    id: Optional[str] = Field(default=None, description="Alias for event_id")
    severity: Optional[str] = Field(default=None, description="Alias for level")

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def _normalize_raw_inputs(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        # Handle aliased event ID (e.g. 'id' -> 'event_id')
        if "event_id" not in data and "id" in data:
            data["event_id"] = str(data["id"])
        # Handle severity -> level
        if "level" not in data and "severity" in data:
            data["level"] = str(data["severity"])
        # Default source to service if empty
        if not data.get("source"):
            data["source"] = str(data.get("service", ""))
        # Parse timestamp string to datetime if provided as string
        ts = data.get("timestamp")
        if isinstance(ts, str):
            try:
                clean_ts = ts.replace("Z", "+00:00")
                data["timestamp"] = datetime.fromisoformat(clean_ts)
            except Exception:
                # Fallback to current UTC datetime if unparseable
                data["timestamp"] = datetime.now(timezone.utc)
        return data

    @model_validator(mode="after")
    def _sync_raw_fields(self) -> "RawEvent":
        if self.id is None:
            self.id = self.event_id
        if self.severity is None:
            self.severity = self.level
        return self


class NormalizedEvent(RawEvent):
    """
    Normalized, time-corrected log event suitable for cross-service deterministic correlation.
    Inherits from RawEvent and adds timing uncertainty and evidence classification fields.
    """
    corrected_timestamp: datetime = Field(
        ...,
        description="Reference UTC datetime adjusted for clock offset"
    )
    timestamp_uncertainty_ms: int = Field(
        default=0,
        ge=0,
        description="Timestamp uncertainty interval half-width in milliseconds"
    )
    evidence_type: str = Field(
        default="observed_fact",
        description="Evidence type classification (e.g. 'observed_fact')"
    )

    # Supplemental / compatibility fields
    raw_id: Optional[str] = Field(default=None, description="Original raw event ID from source log")
    original_timestamp: Optional[str] = Field(default=None, description="Exact raw timestamp string preserved from source")
    recorded_datetime: Optional[datetime] = Field(default=None, description="Parsed datetime as recorded by source clock")
    corrected_datetime: Optional[datetime] = Field(default=None, description="Reference UTC datetime adjusted for clock offset")
    uncertainty_seconds: Optional[float] = Field(default=0.0, description="Timestamp uncertainty interval in seconds")
    time_interval_start: Optional[datetime] = Field(default=None, description="Lower bound of uncertainty interval")
    time_interval_end: Optional[datetime] = Field(default=None, description="Upper bound of uncertainty interval")
    is_duplicate: bool = Field(default=False, description="Flag indicating if record was a duplicate")
    duplicate_of: Optional[str] = Field(default=None, description="Canonical event ID if this is a duplicate")
    data_quality_warnings: List[DataQualityWarning] = Field(
        default_factory=list,
        description="List of data quality issues identified during normalization"
    )
    clock_correction_applied: bool = Field(default=False, description="Whether a clock offset was applied")
    offset_applied_seconds: float = Field(default=0.0, description="Offset in seconds subtracted from recorded time")

    model_config = ConfigDict(extra="ignore")
