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
        bg: "bg-white/10 border-white/20 text-white",
        icon: <HelpCircle className="w-3 h-3 text-white" />,
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
          ? "bg-black/60 backdrop-blur-xl border-white/50 shadow-xl shadow-white/5 ring-1 ring-white/50"
          : isComparing
          ? "bg-black/55 backdrop-blur-xl border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/40"
          : "bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/25 hover:bg-black/50 shadow-md"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white">
            {hypothesis.id}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
              hypothesis.origin === "Demo"
                ? "bg-amber-950/40 border-amber-800/40 text-amber-300"
                : hypothesis.origin === "AI-generated"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-emerald-950/40 border-emerald-500/40 text-[#22c55e]"
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
      <h3 className="text-sm font-bold text-white tracking-tight mb-1.5">
        {hypothesis.title}
      </h3>

      {/* Suspected Service Pill */}
      {hypothesis.suspectedService && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <Server className="w-3 h-3 text-white/60" />
          <span className="text-[11px] font-mono text-white/60">Suspected Service:</span>
          <span className="text-[11px] font-mono font-semibold text-slate-200 bg-white/10 px-1.5 py-0.5 rounded border border-white/15 text-white">
            {hypothesis.suspectedService}
          </span>
        </div>
      )}

      {/* Concise Explanation */}
      <p className="text-white/80 text-xs leading-relaxed line-clamp-2 mb-3 flex-1 font-sans">
        {hypothesis.explanation}
      </p>

      {/* Confidence Score Bar */}
      <div className="mb-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-white/60 font-mono text-[10px] uppercase tracking-wider">
            Assessed Confidence
          </span>
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold text-white">
              {confidencePercent !== null ? `${confidencePercent}%` : "Not assessed"}
            </span>
            {hypothesis.origin === "Demo" && (
              <span className="text-[9px] text-amber-400 font-sans">(Illustrative)</span>
            )}
          </div>
        </div>

        {confidencePercent !== null ? (
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
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
          <div className="text-[10px] text-white/50 italic">No confidence calculated</div>
        )}
      </div>

      {/* Citations Metric Strip */}
      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 mb-3 rounded-xl bg-black/40 border border-white/10 text-center font-mono">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-white/50">
            Supporting
          </span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
            <FileCheck2 className="w-3 h-3" />
            {hypothesis.supportingEvidence.length}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-white/50">
            Contradicting
          </span>
          <span className="text-xs font-bold text-rose-400 flex items-center justify-center gap-0.5 mt-0.5">
            <FileX2 className="w-3 h-3" />
            {hypothesis.contradictingEvidence.length}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-white/50">
            Gaps / Unknowns
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
            <HelpCircle className="w-3 h-3" />
            {hypothesis.unresolvedQuestions.length}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            isComparing
              ? "bg-emerald-950/60 border-emerald-500/40 text-[#22c55e]"
              : "bg-black/40 border-white/10 text-white/70 hover:text-white hover:border-white/20"
          }`}
          title="Select this hypothesis for side-by-side comparison"
        >
          <Scale className="w-3 h-3" />
          <span>{isComparing ? "In Comparison" : "Compare"}</span>
        </button>

        <span className="text-white hover:text-white font-medium flex items-center gap-1">
          <span>Inspect Details</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

