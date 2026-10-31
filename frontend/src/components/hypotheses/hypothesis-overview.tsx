"use client";

import React from "react";
import {
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Scale,
  Shield,
  Zap,
} from "lucide-react";
import type { HypothesisArenaSummary } from "@/types/hypothesis";

interface HypothesisOverviewProps {
  summary: HypothesisArenaSummary | null;
  comparingIds: string[];
}

export function HypothesisOverview({ summary, comparingIds }: HypothesisOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Hypotheses */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Competing Hypotheses
          </span>
          <div className="text-lg font-bold text-slate-100 mt-0.5 font-mono">
            {summary ? summary.totalHypotheses : "—"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
          <Lightbulb className="w-4 h-4" />
        </div>
      </div>

      {/* Evidence References Examined */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Evidence Citations
          </span>
          <div className="text-lg font-bold text-slate-100 mt-0.5 font-mono">
            {summary ? summary.totalEvidenceExamined : "—"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <FileText className="w-4 h-4" />
        </div>
      </div>

      {/* Unresolved Questions */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Investigation Gaps
          </span>
          <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono">
            {summary ? summary.totalUnresolvedQuestions : "—"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>

      {/* Comparison Arena Status */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
        <div className="overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Comparison Mode
          </span>
          <div className="text-xs font-semibold text-slate-100 mt-1 truncate">
            {comparingIds.length === 2
              ? `Comparing ${comparingIds[0]} vs ${comparingIds[1]}`
              : comparingIds.length === 1
              ? `1 selected (${comparingIds[0]})`
              : "Select 2 to compare"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Scale className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

