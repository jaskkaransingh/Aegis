import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { TimestampModeToggle, type TimestampMode } from "./timestamp-mode-toggle";

interface TimelineHeaderProps {
  incidentId: string;
  incidentTitle: string;
  totalEvents: number;
  filteredEventsCount: number;
  isDemoData: boolean;
  timestampMode: TimestampMode;
  onTimestampModeChange: (mode: TimestampMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TimelineHeader({
  incidentId,
  incidentTitle,
  totalEvents,
  filteredEventsCount,
  isDemoData,
  timestampMode,
  onTimestampModeChange,
  onRefresh,
  isRefreshing = false,
}: TimelineHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-white/60">
        <Link href="/" className="hover:text-white/90 transition flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Command Center</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <Link href={`/investigations/${incidentId}`} className="hover:text-white/90 transition">
          {incidentId} Workspace
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-white/90 font-semibold">Timeline Explorer</span>
      </nav>

      {/* Main Title & Mode Switcher Bar */}
      <div className="rounded-xl border border-white/10 bg-black/40/60 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                {incidentId}
              </span>
              <span className="text-xs font-mono text-white/80">
                {incidentTitle}
              </span>

              {/* Data Source Badge */}
              {isDemoData ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  DEMO FIXTURE DATA
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  VERIFIED BACKEND API
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Timeline Explorer</span>
              <span className="text-xs font-mono font-normal text-white/60 bg-slate-800/70 px-2 py-0.5 rounded border border-white/10">
                {filteredEventsCount} / {totalEvents} Events
              </span>
            </h1>
          </div>

          {/* Timestamp Mode Segmented Toggle */}
          <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
            <TimestampModeToggle
              mode={timestampMode}
              onChange={onTimestampModeChange}
            />

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-xs font-mono text-white/80 hover:bg-slate-800 hover:text-white transition disabled:opacity-50"
              >
                {isRefreshing ? "Refreshing..." : "Re-sync"}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Clock Skew Context Explainer */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-white/60">
            <Clock className="h-3.5 w-3.5 text-white shrink-0" />
            {timestampMode === "corrected" ? (
              <span>
                <strong className="text-white font-semibold">Active Mode: Corrected Timestamps. </strong>
                Service clock drift is neutralized (Payment Service: -42.00s UTC offset). Sequence reflects chronological reality.
              </span>
            ) : (
              <span>
                <strong className="text-amber-300 font-semibold">Active Mode: Raw Ingest Timestamps. </strong>
                Displaying uncorrected local clocks. Payment Service telemetry appears 42 seconds delayed due to clock drift.
              </span>
            )}
          </div>

          <div className="text-white/50 shrink-0">
            Reference Standard: <span className="text-white/80">UTC (PTP / Chrony)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

