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
      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
            Competing Hypotheses
          </span>
          <div className="text-lg font-bold text-white mt-0.5 font-mono">
            {summary ? summary.totalHypotheses : "—"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/10 border border-white/20 text-white">
          <Lightbulb className="w-4 h-4" />
        </div>
      </div>

      {/* Evidence References Examined */}
      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
            Evidence Citations
          </span>
          <div className="text-lg font-bold text-white mt-0.5 font-mono">
            {summary ? summary.totalEvidenceExamined : "—"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e]">
          <FileText className="w-4 h-4" />
        </div>
      </div>

      {/* Unresolved Questions */}
      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
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
      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-sm flex items-center justify-between">
        <div className="overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
            Comparison Mode
          </span>
          <div className="text-xs font-semibold text-white mt-1 truncate">
            {comparingIds.length === 2
              ? `Comparing ${comparingIds[0]} vs ${comparingIds[1]}`
              : comparingIds.length === 1
              ? `1 selected (${comparingIds[0]})`
              : "Select 2 to compare"}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/10 border border-white/20 text-white">
          <Scale className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

