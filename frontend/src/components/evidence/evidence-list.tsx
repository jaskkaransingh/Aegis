"use client";

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCode,
  FileSearch,
  HelpCircle,
  RotateCcw,
  Shield,
  Zap,
} from "lucide-react";
import type { EvidenceRecord } from "@/types/evidence";
import { formatTimeOnly, formatEvidenceTimestamp } from "@/lib/evidence-adapter";

interface EvidenceListProps {
  records: EvidenceRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onResetFilters: () => void;
  timestampMode: "raw" | "corrected";
}

function getSeverityBadge(severity: string) {
  const upper = severity.toUpperCase();
  switch (upper) {
    case "CRITICAL":
      return {
        bg: "bg-rose-950/70 border-rose-700/60 text-rose-300",
        dot: "bg-rose-400 animate-pulse",
      };
    case "ERROR":
      return {
        bg: "bg-rose-950/40 border-rose-700/50 text-rose-300",
        dot: "bg-rose-400",
      };
    case "WARN":
    case "WARNING":
      return {
        bg: "bg-amber-950/60 border-amber-700/50 text-amber-300",
        dot: "bg-amber-400",
      };
    case "INFO":
      return {
        bg: "bg-blue-950/60 border-blue-700/50 text-blue-300",
        dot: "bg-blue-400",
      };
    default:
      return {
        bg: "bg-slate-900 border-slate-700 text-slate-400",
        dot: "bg-slate-400",
      };
  }
}

export function EvidenceList({
  records,
  selectedRecordId,
  onSelectRecord,
  isLoading,
  error,
  onRetry,
  onResetFilters,
  timestampMode,
}: EvidenceListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-mono text-slate-400">Loading evidence logs...</span>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
          <AlertOctagon className="w-6 h-6 text-rose-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">Failed to load evidence</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3">
          <FileSearch className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">No matching evidence found</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          No log or telemetry records match your current search and filter parameters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-sm overflow-hidden min-h-[500px]">
      {/* Table Header Row */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 select-none">
        <div className="col-span-2">Event ID</div>
        <div className="col-span-2">
          {timestampMode === "corrected" ? "Time (Corrected UTC)" : "Time (Raw Clock)"}
        </div>
        <div className="col-span-2">Service</div>
        <div className="col-span-1">Severity</div>
        <div className="col-span-5">Message & Metadata</div>
      </div>

      {/* Virtual / Dense Evidence List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {records.map((rec) => {
          const isSelected = selectedRecordId === rec.id;
          const sevConfig = getSeverityBadge(rec.severity);
          const displayTs =
            timestampMode === "corrected" ? rec.corrected_datetime : rec.original_timestamp;

          return (
            <div
              key={rec.id}
              onClick={() => onSelectRecord(rec.id)}
              className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center cursor-pointer text-xs transition-colors select-none group ${
                isSelected
                  ? "bg-violet-950/40 border-l-2 border-violet-500 shadow-inner"
                  : "hover:bg-slate-800/40 border-l-2 border-transparent"
              }`}
            >
              {/* Event ID with copy */}
              <div className="col-span-2 flex items-center gap-1.5 overflow-hidden">
                <span className="font-mono font-semibold text-slate-200 group-hover:text-violet-300 truncate">
                  {rec.id}
                </span>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(rec.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-200 transition-opacity p-0.5"
                  title="Copy Canonical Event ID"
                >
                  {copiedId === rec.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Timestamp */}
              <div className="col-span-2 flex flex-col font-mono text-[11px] text-slate-300">
                <span>{formatTimeOnly(displayTs)}</span>
                {rec.clock_correction_applied && (
                  <span className="text-[9px] text-amber-400 font-sans flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    Skew: -{rec.offset_applied_seconds}s
                  </span>
                )}
              </div>

              {/* Service */}
              <div className="col-span-2 truncate">
                <span className="text-[11px] font-medium text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 truncate block">
                  {rec.service}
                </span>
              </div>

              {/* Severity */}
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${sevConfig.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sevConfig.dot}`} />
                  <span>{rec.severity}</span>
                </span>
              </div>

              {/* Message, Category & Trace Badges */}
              <div className="col-span-5 flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex-1 truncate">
                  <span className="text-slate-300 font-sans truncate text-[11px] block">
                    {rec.message}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Category Pill */}
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {rec.event_type}
                  </span>

                  {/* Trace indicator */}
                  {rec.trace_id && (
                    <span
                      title={`Trace: ${rec.trace_id}`}
                      className="p-1 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400"
                    >
                      <FileCode className="w-3 h-3" />
                    </span>
                  )}

                  {/* Quality Warnings indicator */}
                  {rec.data_quality_warnings.length > 0 && (
                    <span
                      title={`${rec.data_quality_warnings.length} Data Quality Warning(s)`}
                      className="p-1 rounded bg-rose-950/60 border border-rose-800/50 text-rose-400"
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status Strip */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span>
          Showing <strong className="text-slate-200">{records.length}</strong> canonical evidence record(s)
        </span>
        <span className="text-[10px] text-slate-400 font-sans">
          Click any record to inspect forensic payload & provenance
        </span>
      </div>
    </div>
  );
}

