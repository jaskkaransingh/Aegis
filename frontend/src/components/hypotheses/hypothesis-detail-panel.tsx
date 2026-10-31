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
        bg: "bg-violet-950/60 border-violet-700/60 text-violet-300",
        icon: <HelpCircle className="w-3.5 h-3.5 text-violet-400" />,
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
    <div className="w-full lg:w-96 xl:w-[420px] shrink-0 flex flex-col rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden text-xs text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {hypothesis.id}
            </span>
            <span
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${statusConfig.bg}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {hypothesis.origin}
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-100 tracking-tight pt-1">
            {hypothesis.title}
          </h2>
          {hypothesis.suspectedService && (
            <p className="text-[11px] font-mono text-slate-400">
              Suspected: <strong className="text-slate-200 font-sans">{hypothesis.suspectedService}</strong>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Forensic Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Confidence Assessment Section */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Assessed Epistemic Confidence
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-slate-100 text-sm">
                {confidencePercent !== null ? `${confidencePercent}%` : "Not assessed"}
              </span>
              {hypothesis.origin === "Demo" && (
                <span className="text-[10px] text-amber-400 font-sans">(Illustrative)</span>
              )}
            </div>
          </div>

          {confidencePercent !== null && (
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
            {hypothesis.confidenceExplanation}
          </p>
        </div>

        {/* Section A: Complete Explanation & Reasoning Breakdown */}
        <div className="space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Section A — Statement & Reasoning Breakdown
          </span>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
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
              <div className="p-2.5 rounded-xl bg-violet-950/20 border border-violet-900/40 space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-violet-400 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Inferences & Inferred Causality
                </span>
                <ul className="list-disc list-inside text-[11px] text-violet-200/90 space-y-0.5">
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
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              Section B — Supporting Evidence ({hypothesis.supportingEvidence.length})
            </span>
          </div>

          {hypothesis.supportingEvidence.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
              No verified supporting evidence is linked to this hypothesis.
            </p>
          ) : (
            <div className="space-y-2">
              {hypothesis.supportingEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-emerald-300 text-[11px]">
                        {ev.eventId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {ev.service}
                      </span>
                    </div>
                    <Link
                      href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                      className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 font-medium"
                      title="Inspect in Evidence Explorer"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {ev.excerpt}
                  </p>
                  {ev.timestamp && (
                    <span className="text-[9px] font-mono text-slate-500 block">
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
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileX2 className="w-3.5 h-3.5 text-rose-400" />
              Section C — Contradicting Evidence ({hypothesis.contradictingEvidence.length})
            </span>
          </div>

          {hypothesis.contradictingEvidence.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-1">
              <p className="text-[11px] text-slate-400 italic">
                No verified contradicting evidence is linked to this hypothesis.
              </p>
              <p className="text-[10px] text-slate-500">
                Notice: Absence of contradictory logs does not constitute definitive proof of root cause.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {hypothesis.contradictingEvidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-rose-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-rose-300 text-[11px]">
                        {ev.eventId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {ev.service}
                      </span>
                    </div>
                    <Link
                      href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                      className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 font-medium"
                      title="Inspect in Evidence Explorer"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {ev.excerpt}
                  </p>
                  {ev.timestamp && (
                    <span className="text-[9px] font-mono text-slate-500 block">
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
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            Section D — Unknowns & Investigation Gaps ({hypothesis.unresolvedQuestions.length})
          </span>

          {hypothesis.unresolvedQuestions.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
              No open investigation gaps registered for this hypothesis.
            </p>
          ) : (
            <ul className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-amber-900/30 text-[11px] text-amber-200/90 list-disc list-inside">
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
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs transition-colors shadow-md ${
            isComparing
              ? "bg-cyan-950 border border-cyan-600 text-cyan-200 hover:bg-cyan-900"
              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isComparing ? "Remove from Comparison" : "Compare this Hypothesis"}</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
