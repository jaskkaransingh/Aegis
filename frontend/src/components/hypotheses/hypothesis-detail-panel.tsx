"use client";

import React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  FileSearch,
  FileText,
  FileX2,
  HelpCircle,
  Lightbulb,
  Scale,
  Server,
  Shield,
  X,
  Zap,
} from "lucide-react";
import type { ArenaHypothesis, HypothesisStatus } from "@/types/hypothesis";

interface HypothesisDetailPanelProps {
  hypothesis: ArenaHypothesis | null;
  onClose: () => void;
  isComparing: boolean;
  onToggleCompare: () => void;
}

function getStatusBadge(status: HypothesisStatus) {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "CONFIRMED",
        bg: "bg-emerald-950/60 border-emerald-700/60 text-emerald-300",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      };
    case "PLAUSIBLE":
      return {
        label: "PLAUSIBLE",
        bg: "bg-amber-950/60 border-amber-700/60 text-amber-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      };
    case "REFUTED":
      return {
        label: "REFUTED",
        bg: "bg-rose-950/60 border-rose-700/60 text-rose-300",
        icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
      };
    case "UNDER_EVALUATION":
    default:
      return {
        label: "UNDER EVALUATION",
        bg: "bg-white/10 border-white/20 text-white",
        icon: <HelpCircle className="w-3.5 h-3.5 text-white" />,
      };
  }
}

export function HypothesisDetailPanel({
  hypothesis,
  onClose,
  isComparing,
  onToggleCompare,
}: HypothesisDetailPanelProps) {
  if (!hypothesis) return null;

  const statusConfig = getStatusBadge(hypothesis.status);
  const confidencePercent =
    hypothesis.confidenceScore !== null
      ? Math.round(hypothesis.confidenceScore * 100)
      : null;

  return (
    <div className="w-full lg:w-96 xl:w-[420px] shrink-0 flex flex-col rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white/90 animate-in fade-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/10 bg-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white">
              {hypothesis.id}
            </span>
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${statusConfig.bg}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-[10px] font-mono text-white/60 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white">
              {hypothesis.origin}
            </span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight pt-1">
            {hypothesis.title}
          </h2>
          {hypothesis.suspectedService && (
            <p className="text-[11px] font-mono text-white/60">
              Suspected: <strong className="text-white/90 font-sans">{hypothesis.suspectedService}</strong>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Forensic Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Confidence Assessment Section */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              Assessed Epistemic Confidence
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-white text-sm">
                {confidencePercent !== null ? `${confidencePercent}%` : "Not assessed"}
              </span>
              {hypothesis.origin === "Demo" && (
                <span className="text-[10px] text-amber-400 font-sans">(Illustrative)</span>
              )}
            </div>
          </div>

          {confidencePercent !== null && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  confidencePercent >= 75
                    ? "bg-emerald-500"
                    : confidencePercent >= 40
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          )}

          <p className="text-[11px] text-white/80 leading-relaxed font-sans pt-1">
            {hypothesis.confidenceExplanation}
          </p>
        </div>

        {/* Section A: Complete Explanation & Reasoning Breakdown */}
        <div className="space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
            Causal Mechanism & Reasoning Breakdown
          </span>
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white/90 leading-relaxed font-sans">
            {hypothesis.explanation}
          </div>

          {/* Epistemic Distinctions */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {/* Observed Facts */}
            {hypothesis.observedFacts.length > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Observed Facts
                </span>
                <ul className="list-disc list-inside text-[11px] text-emerald-200/90 space-y-0.5">
                  {hypothesis.observedFacts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inferences */}
            {hypothesis.inferences.length > 0 && (
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/15 space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-white flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Inferences & Inferred Causality
                </span>
                <ul className="list-disc list-inside text-[11px] text-white/80 space-y-0.5">
                  {hypothesis.inferences.map((inf, idx) => (
                    <li key={idx}>{inf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assumptions */}
            {hypothesis.assumptions.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-amber-400 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Unverified Assumptions
                </span>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 space-y-0.5">
                  {hypothesis.assumptions.map((assump, idx) => (
                    <li key={idx}>{assump}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Section B: Supporting Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Supporting Telemetry Spans ({hypothesis.supportingEvidence.length})
            </span>
          </div>

          {hypothesis.supportingEvidence.length === 0 ? (
            <p className="text-[11px] text-white/60 italic bg-black/40/50 p-2.5 rounded-xl border border-slate-800/50">
              No verified supporting evidence is linked to this hypothesis.
            </p>
          ) : (
            <div className="space-y-2">
              {hypothesis.supportingEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-emerald-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-emerald-300 text-[11px]">
                        {ev.eventId}
                      </span>
                      <span className="text-[10px] font-mono text-white/60 bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
                        {ev.service}
                      </span>
                    </div>
                    <Link
                      href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                      className="text-[10px] text-white hover:text-white flex items-center gap-0.5 font-medium"
                      title="Inspect in Evidence Explorer"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans">
                    {ev.excerpt}
                  </p>
                  {ev.timestamp && (
                    <span className="text-[9px] font-mono text-white/50 block">
                      Time: {ev.timestamp}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C: Contradicting Evidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <FileX2 className="w-3.5 h-3.5 text-rose-400" />
              Contradicting Telemetry Spans ({hypothesis.contradictingEvidence.length})
            </span>
          </div>

          {hypothesis.contradictingEvidence.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
              <p className="text-[11px] text-white/60 italic">
                No verified contradicting evidence is linked to this hypothesis.
              </p>
              <p className="text-[10px] text-white/50">
                Notice: Absence of contradictory logs does not constitute definitive proof of root cause.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {hypothesis.contradictingEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-rose-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-rose-300 text-[11px]">
                        {ev.eventId}
                      </span>
                      <span className="text-[10px] font-mono text-white/60 bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
                        {ev.service}
                      </span>
                    </div>
                    <Link
                      href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                      className="text-[10px] text-white hover:text-white flex items-center gap-0.5 font-medium"
                      title="Inspect in Evidence Explorer"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-sans">
                    {ev.excerpt}
                  </p>
                  {ev.timestamp && (
                    <span className="text-[9px] font-mono text-white/50 block">
                      Time: {ev.timestamp}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section D: Unknowns & Investigation Gaps */}
        <div className="space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            Analytical Investigation Gaps ({hypothesis.unresolvedQuestions.length})
          </span>

          {hypothesis.unresolvedQuestions.length === 0 ? (
            <p className="text-[11px] text-white/60 italic bg-black/40/50 p-2.5 rounded-xl border border-slate-800/50">
              No open investigation gaps registered for this hypothesis.
            </p>
          ) : (
            <ul className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-amber-900/30 text-[11px] text-amber-200/90 list-disc list-inside">
              {hypothesis.unresolvedQuestions.map((q, idx) => (
                <li key={idx} className="leading-relaxed">
                  {q}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer Comparison Action */}
      <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs transition-colors shadow-md ${
            isComparing
              ? "bg-emerald-950 border border-emerald-500/50 text-[#22c55e]"
              : "bg-white hover:bg-slate-200 text-black font-semibold"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isComparing ? "Remove from Comparison" : "Compare this Hypothesis"}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
