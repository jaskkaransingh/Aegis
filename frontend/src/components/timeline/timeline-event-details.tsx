import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  GitBranch,
  Layers,
  FileSearch,
  ExternalLink,
  ShieldAlert,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { NormalizedEvent, TimelineEvent } from "@/types";

interface TimelineEventDetailsProps {
  event: NormalizedEvent | null;
  timelineMeta?: TimelineEvent;
  onClose: () => void;
}

export function TimelineEventDetails({
  event,
  timelineMeta,
  onClose,
}: TimelineEventDetailsProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!event) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(event.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const uncertainOrdering = timelineMeta?.uncertain_ordering_with || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col font-sans transition animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60">
            Event Inspector
          </span>
          <span className="font-mono text-sm font-bold text-slate-100">
            {event.id}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyId}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Copy Event ID"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Close Inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Core Attribution */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-200 font-mono font-medium border border-slate-800">
              {event.service}
            </span>
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
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">
              {event.event_type}
            </span>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed font-sans pt-1">
            {event.message}
          </p>
        </div>

        {/* Timestamps Comparison Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 font-mono">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Temporal Chronology
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Original Raw Ingest Time</span>
              <span className="text-slate-200 font-semibold block mt-0.5">
                {event.original_timestamp || event.recorded_datetime || "N/A"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-violet-400 block">Corrected Reference Time</span>
              <span className="text-violet-300 font-semibold block mt-0.5">
                {event.corrected_datetime || "N/A"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1 pt-1">
            <div className="flex justify-between">
              <span>Offset Applied:</span>
              <span className="text-slate-200 font-semibold">
                {event.clock_correction_applied
                  ? `${event.offset_applied_seconds} seconds`
                  : "0.0s (In Sync)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Uncertainty Margin:</span>
              <span className="text-slate-200 font-semibold">
                ±{event.uncertainty_seconds ?? 0}s
              </span>
            </div>
            {event.time_interval_start && event.time_interval_end && (
              <div className="flex justify-between">
                <span>Interval Bounds:</span>
                <span className="text-slate-300">
                  [{event.time_interval_start.slice(11, 23)} &rarr; {event.time_interval_end.slice(11, 23)}]
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Temporal Overlap / Concurrency Warning */}
        {uncertainOrdering.length > 0 && (
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-semibold text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Uncertain Temporal Ordering ({uncertainOrdering.length})</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              This event&apos;s timing interval intersects with the following events:{" "}
              <span className="font-mono text-amber-200">{uncertainOrdering.join(", ")}</span>.
            </p>
            <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300/90 font-mono">
              <strong>Epistemic Humility Note:</strong> Chronological order alone does NOT prove causality. Overlapping events must not be assumed to have caused one another without distributed trace correlation.
            </div>
          </div>
        )}

        {/* Distributed Trace Link */}
        {event.trace_id && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono block">
              Distributed Trace Association
            </span>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-2 text-violet-300">
                <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                <span>{event.trace_id}</span>
              </div>
              <span className="text-[10px] text-slate-500">Correlated</span>
            </div>
          </div>
        )}

        {/* Data Quality Warnings */}
        {event.data_quality_warnings && event.data_quality_warnings.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 font-mono block">
              Data Quality Warnings ({event.data_quality_warnings.length})
            </span>
            <div className="space-y-2">
              {event.data_quality_warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-amber-400 font-semibold">{w.code}</span>
                    <span className="text-slate-500 text-[10px]">{w.severity}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{w.message}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Action: {w.action_taken}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Record Metadata */}
        {event.is_duplicate && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1.5 font-mono text-xs">
            <span className="text-amber-400 font-semibold block">Duplicate Event Record</span>
            <p className="text-slate-400 text-[11px]">
              This record was flagged as a duplicate. Canonical re-keyed ID: <code className="text-slate-200">{event.id}</code> (original: <code className="text-slate-200">{event.raw_id}</code>).
            </p>
          </div>
        )}

        {/* Raw Metadata Payload */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono block">
              Raw Log Metadata Payload
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
        <Link
          href={`/evidence?eventId=${event.id}`}
          className="flex-1 py-2 px-3 rounded-lg border border-violet-800/60 bg-violet-950/40 hover:bg-violet-900/50 text-violet-200 text-xs font-mono text-center transition flex items-center justify-center gap-1.5"
        >
          <FileSearch className="h-3.5 w-3.5" />
          <span>Audit in Evidence Explorer</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-300 hover:text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

