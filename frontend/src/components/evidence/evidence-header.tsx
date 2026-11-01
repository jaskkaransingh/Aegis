"use client";

import React from "react";
import {
  Activity,
  AlertOctagon,
  Clock,
  Database,
  FileSearch,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import type { EvidenceSummary } from "@/types/evidence";

interface EvidenceHeaderProps {
  summary: EvidenceSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function EvidenceHeader({ summary, isLoading, onRefresh }: EvidenceHeaderProps) {
  const isLive = summary?.dataSource === "live";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
            <FileSearch className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">
            Evidence Explorer
          </h1>
          {summary && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                isLive
                  ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-amber-950/60 border-amber-700/60 text-amber-300"
              }`}
              title={
                isLive
                  ? "Streaming normalized telemetry directly from FastAPI backend"
                  : "Backend offline/unreachable. Displaying verified demonstration evidence fixtures."
              }
            >
              {isLive ? "LIVE DATA" : "DEMO DATA"}
            </span>
          )}
        </div>
        <p className="text-xs text-white/60 mt-1">
          Inspect evidence, verify provenance, and trace incident signals with timestamp uncertainty analysis.
        </p>
      </div>

      {/* Metadata Badges & Refresh */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Incident Context */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-mono text-white/60 text-[11px]">Incident:</span>
          <span className="font-semibold text-white/90">INC-2026-0881</span>
        </div>

        {/* Quick Stats */}
        {summary && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
            <span className="text-white/60 text-[11px]">Records:</span>
            <span className="font-mono font-bold text-white">{summary.filteredCount}</span>
            {summary.filteredCount !== summary.totalCount && (
              <span className="text-[10px] text-white/50 font-mono">/ {summary.totalCount}</span>
            )}
            <span className="text-slate-600 mx-1">•</span>
            <span className="flex items-center gap-1 text-rose-400 text-[11px]">
              <AlertOctagon className="w-3 h-3" />
              {summary.criticalCount} Critical
            </span>
          </div>
        )}

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors font-medium text-xs shadow-sm"
          title="Reload evidence logs from backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : "text-white/60"}`} />
          <span>{isLoading ? "Syncing..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}

