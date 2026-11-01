import React, { useState } from "react";
import {
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  GitBranch,
  Layers,
  HelpCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { NormalizedEvent, TimelineEvent } from "@/types";
import type { TimestampMode } from "./timestamp-mode-toggle";

interface TimelineEventCardProps {
  event: NormalizedEvent;
  timelineMeta?: TimelineEvent;
  timestampMode: TimestampMode;
  isSelected: boolean;
  onSelect: (event: NormalizedEvent) => void;
}

export function TimelineEventCard({
  event,
  timelineMeta,
  timestampMode,
  isSelected,
  onSelect,
}: TimelineEventCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "postgresql-database":
        return "text-white bg-white/10 border-white/20";
      case "appointment-service":
        return "text-white bg-white/10 border-white/20";
      case "hospital-records-service":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-900/60";
      case "payment-service":
        return "text-amber-400 bg-amber-950/40 border-amber-900/60";
      case "api-gateway":
        return "text-white bg-white/10 border-white/20";
      case "notification-service":
        return "text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-900/60";
      case "auth-service":
        return "text-indigo-400 bg-indigo-950/40 border-indigo-900/60";
      default:
        return "text-white/60 bg-black/40 border-white/10";
    }
  };

  // Format timestamp for display
  const displayTimestamp =
    timestampMode === "corrected"
      ? event.corrected_datetime || event.original_timestamp
      : event.original_timestamp || event.recorded_datetime;

  // Format concise time: HH:MM:SS.mmm
  const formatTimeConcise = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const mins = String(d.getUTCMinutes()).padStart(2, "0");
      const secs = String(d.getUTCSeconds()).padStart(2, "0");
      const ms = String(d.getUTCMilliseconds()).padStart(3, "0");
      return `${hours}:${mins}:${secs}.${ms} UTC`;
    } catch {
      return iso;
    }
  };

  const uncertainOrdering = timelineMeta?.uncertain_ordering_with || [];
  const hasUncertainty = (event.uncertainty_seconds ?? 0) > 0;
  const hasWarnings = (event.data_quality_warnings?.length ?? 0) > 0;

  return (
    <div
      onClick={() => onSelect(event)}
      className={`rounded-xl border transition cursor-pointer text-xs ${
        isSelected
          ? "border-white/50 bg-white/[0.06] shadow-md shadow-white/5"
          : "border-white/10 bg-black/40/40 hover:bg-black/40/80 hover:border-white/20/80"
      }`}
    >
      {/* Compact Event Row */}
      <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Timestamp, Event ID, Service */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeline ID if available */}
          {timelineMeta?.timeline_id && (
            <span className="text-[10px] font-mono font-bold text-white/50 bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
              {timelineMeta.timeline_id}
            </span>
          )}

          {/* Canonical Event ID */}
          <button
            type="button"
            onClick={handleCopyId}
            title="Click to copy canonical event ID"
            className="group/id flex items-center gap-1 font-mono text-white/90 font-semibold hover:text-white transition"
          >
            <span>{event.id}</span>
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3 text-slate-600 group-hover/id:text-white/60" />
            )}
          </button>

          {/* Time Display */}
          <div className="flex items-center gap-1 font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded border border-white/10">
            <Clock className="h-3 w-3 text-white/50" />
            <span>{formatTimeConcise(displayTimestamp)}</span>
            {timestampMode === "corrected" && event.clock_correction_applied && (
              <span className="text-[10px] text-amber-400 font-semibold ml-0.5">
                ({event.offset_applied_seconds > 0 ? `+${event.offset_applied_seconds}` : event.offset_applied_seconds}s)
              </span>
            )}
          </div>

          {/* Service Tag */}
          <span
            className={`px-2 py-0.5 rounded font-mono text-[11px] border font-medium ${getServiceColor(
              event.service
            )}`}
          >
            {event.service}
          </span>

          {/* Severity Badge */}
          <StatusBadge
            label={event.severity}
            variant={
              event.severity === "CRITICAL"
                ? "critical"
                : event.severity === "ERROR"
                ? "critical"
                : event.severity === "WARN"
                ? "warning"
                : "neutral"
            }
          />

          {/* Event Type */}
          <span className="text-[11px] font-mono text-white/60 bg-black/40/80 px-2 py-0.5 rounded border border-white/10">
            {event.event_type}
          </span>
        </div>

        {/* Right: Badges, Uncertainty, Trace ID & Expand */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono self-end md:self-auto">
          {/* Uncertainty Half-width Interval */}
          {hasUncertainty && (
            <span
              className="px-1.5 py-0.5 rounded bg-black/40 text-white/60 border border-white/10 text-[10px]"
              title={`Timing uncertainty interval: ±${event.uncertainty_seconds}s`}
            >
              ±{event.uncertainty_seconds}s
            </span>
          )}

          {/* Concurrency / Overlap Warning */}
          {uncertainOrdering.length > 0 && (
            <span
              className="px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-900/50 text-[10px] flex items-center gap-1"
              title={`Temporal interval overlaps with: ${uncertainOrdering.join(", ")}. Ordering is not causal proof.`}
            >
              <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
              <span>Overlap ({uncertainOrdering.length})</span>
            </span>
          )}

          {/* Distributed Trace ID */}
          {event.trace_id && (
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-white border border-white/20 text-[10px] flex items-center gap-1">
              <GitBranch className="h-2.5 w-2.5 text-white" />
              <span>{event.trace_id}</span>
            </span>
          )}

          {/* Data Quality Warning Flag */}
          {hasWarnings && (
            <span
              className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[10px]"
              title={event.data_quality_warnings.map((w) => w.message).join("\n")}
            >
              {event.is_duplicate ? "DUPLICATE" : "DQ WARNING"}
            </span>
          )}

          {/* Expand Details Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-slate-800 text-white/60 hover:text-white/90 transition ml-1"
            title={isExpanded ? "Collapse inline details" : "Expand inline details"}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Message Preview */}
      <div className="px-3 pb-3 sm:px-4 text-xs text-white/80 leading-relaxed font-sans">
        <p className="line-clamp-2">{event.message}</p>
      </div>

      {/* Expanded Inline Drawer */}
      {isExpanded && (
        <div className="border-t border-white/10 bg-black/40 p-4 space-y-3 font-mono text-[11px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-white/60">
            <div>
              <span className="text-white/50 block text-[10px]">Raw Timestamp</span>
              <span className="text-white/90">{event.original_timestamp || "N/A"}</span>
            </div>
            <div>
              <span className="text-white/50 block text-[10px]">Corrected Timestamp</span>
              <span className="text-white">{event.corrected_datetime || "N/A"}</span>
            </div>
            <div>
              <span className="text-white/50 block text-[10px]">Offset Applied</span>
              <span className="text-white/90">
                {event.clock_correction_applied
                  ? `${event.offset_applied_seconds} seconds`
                  : "0.0s (In Sync)"}
              </span>
            </div>
            <div>
              <span className="text-white/50 block text-[10px]">Uncertainty Interval</span>
              <span className="text-white/90">
                [{event.time_interval_start?.slice(11, 23)} - {event.time_interval_end?.slice(11, 23)}]
              </span>
            </div>
          </div>

          {/* Overlapping Event IDs */}
          {uncertainOrdering.length > 0 && (
            <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs">
              <span className="font-semibold block mb-1">
                Temporal Overlap Warning (Epistemic Limitation):
              </span>
              <p className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
                This event&apos;s timing interval intersects with:{" "}
                <span className="font-mono text-amber-200">{uncertainOrdering.join(", ")}</span>.
                Chronological placement on the timeline does not establish causal direction without explicit trace propagation links.
              </p>
            </div>
          )}

          {/* Full Metadata Payload */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <span className="text-white/50 text-[10px] block mb-1">Telemetry Metadata:</span>
              <pre className="p-2 rounded bg-black/40 border border-white/10 text-[10px] text-white/80 overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

