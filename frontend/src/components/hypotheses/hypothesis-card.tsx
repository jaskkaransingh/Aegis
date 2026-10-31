"use client";

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileX2,
  HelpCircle,
  Scale,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import type { ArenaHypothesis, HypothesisStatus } from "@/types/hypothesis";

interface HypothesisCardProps {
  hypothesis: ArenaHypothesis;
  isSelected: boolean;
  isComparing: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
}

function getStatusBadge(status: HypothesisStatus) {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "CONFIRMED",
        bg: "bg-emerald-950/60 border-emerald-700/60 text-emerald-300",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
      };
    case "PLAUSIBLE":
      return {
        label: "PLAUSIBLE",
        bg: "bg-amber-950/60 border-amber-700/60 text-amber-300",
        icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
      };
    case "REFUTED":
      return {
        label: "REFUTED",
        bg: "bg-rose-950/60 border-rose-700/60 text-rose-300",
        icon: <AlertOctagon className="w-3 h-3 text-rose-400" />,
      };
    case "UNDER_EVALUATION":
    default:
      return {
        label: "UNDER EVALUATION",
        bg: "bg-violet-950/60 border-violet-700/60 text-violet-300",
        icon: <HelpCircle className="w-3 h-3 text-violet-400" />,
      };
  }
}

export function HypothesisCard({
  hypothesis,
  isSelected,
  isComparing,
  onSelect,
  onToggleCompare,
}: HypothesisCardProps) {
  const statusConfig = getStatusBadge(hypothesis.status);
  const confidencePercent =
    hypothesis.confidenceScore !== null
      ? Math.round(hypothesis.confidenceScore * 100)
      : null;

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none text-xs relative ${
        isSelected
          ? "bg-slate-900/95 border-violet-500 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500"
          : isComparing
          ? "bg-slate-900/95 border-cyan-500/70 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40"
          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-md"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-mono text-xs font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {hypothesis.id}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              hypothesis.origin === "Demo"
                ? "bg-amber-950/40 border-amber-800/40 text-amber-300"
                : hypothesis.origin === "AI-generated"
                ? "bg-violet-950/40 border-violet-800/40 text-violet-300"
                : "bg-cyan-950/40 border-cyan-800/40 text-cyan-300"
            }`}
          >
            {hypothesis.origin}
          </span>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${statusConfig.bg}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-100 tracking-tight mb-1.5">
        {hypothesis.title}
      </h3>

      {/* Suspected Service Pill */}
      {hypothesis.suspectedService && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <Server className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-mono text-slate-400">Suspected Service:</span>
          <span className="text-[11px] font-mono font-semibold text-slate-200 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
            {hypothesis.suspectedService}
          </span>
        </div>
      )}

      {/* Concise Explanation */}
      <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-3 flex-1 font-sans">
        {hypothesis.explanation}
      </p>

      {/* Confidence Score Bar */}
      <div className="mb-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            Assessed Confidence
          </span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold text-slate-100">
              {confidencePercent !== null ? `${confidencePercent}%` : "Not assessed"}
            </span>
            {hypothesis.origin === "Demo" && (
              <span className="text-[9px] text-amber-400 font-sans">(Illustrative)</span>
            )}
          </div>
        </div>

        {confidencePercent !== null ? (
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                confidencePercent >= 75
                  ? "bg-emerald-500"
                  : confidencePercent >= 40
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 italic">No confidence calculated</div>
        )}
      </div>

      {/* Citations Metric Strip */}
      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 mb-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center font-mono">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-slate-500">
            Supporting
          </span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
            <FileCheck2 className="w-3 h-3" />
            {hypothesis.supportingEvidence.length}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-slate-500">
            Contradicting
          </span>
          <span className="text-xs font-bold text-rose-400 flex items-center justify-center gap-0.5 mt-0.5">
            <FileX2 className="w-3 h-3" />
            {hypothesis.contradictingEvidence.length}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-slate-500">
            Gaps / Unknowns
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
            <HelpCircle className="w-3 h-3" />
            {hypothesis.unresolvedQuestions.length}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            isComparing
              ? "bg-cyan-950/70 border-cyan-600 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
          title="Select this hypothesis for side-by-side comparison"
        >
          <Scale className="w-3 h-3" />
          <span>{isComparing ? "In Comparison" : "Compare"}</span>
        </button>

        <span className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
          <span>Inspect Details</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

