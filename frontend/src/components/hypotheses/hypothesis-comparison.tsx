"use client";

import React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileX2,
  HelpCircle,
  Scale,
  Server,
  X,
} from "lucide-react";
import type { ArenaHypothesis } from "@/types/hypothesis";

interface HypothesisComparisonProps {
  hypothesisA: ArenaHypothesis;
  hypothesisB: ArenaHypothesis;
  onExit: () => void;
}

export function HypothesisComparison({
  hypothesisA,
  hypothesisB,
  onExit,
}: HypothesisComparisonProps) {
  const confA = hypothesisA.confidenceScore !== null ? Math.round(hypothesisA.confidenceScore * 100) : null;
  const confB = hypothesisB.confidenceScore !== null ? Math.round(hypothesisB.confidenceScore * 100) : null;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden text-xs text-slate-200">
      {/* Comparison Top Banner */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/50 text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              Side-by-Side Hypothesis Comparison
            </h3>
            <p className="text-[11px] text-slate-400">
              Contrasting competing causal mechanisms without declaring an automated winner.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Comparison</span>
        </button>
      </div>

      {/* Comparison Table / Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 font-mono text-[11px]">
              <th className="p-3.5 w-1/5 text-slate-400 uppercase tracking-wider">Dimension</th>
              <th className="p-3.5 w-2/5 border-l border-slate-800 text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-violet-300">
                    {hypothesisA.id}
                  </span>
                  <span className="font-semibold">{hypothesisA.title}</span>
                </div>
              </th>
              <th className="p-3.5 w-2/5 border-l border-slate-800 text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                    {hypothesisB.id}
                  </span>
                  <span className="font-semibold">{hypothesisB.title}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
            {/* Status & Origin */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Status & Origin</td>
              <td className="p-3.5 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-200">
                    {hypothesisA.status}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400">{hypothesisA.origin}</span>
                </div>
              </td>
              <td className="p-3.5 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-200">
                    {hypothesisB.status}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400">{hypothesisB.origin}</span>
                </div>
              </td>
            </tr>

            {/* Suspected Service */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Suspected Service</td>
              <td className="p-3.5 border-l border-slate-800 font-mono text-slate-200">
                {hypothesisA.suspectedService || "Not specified"}
              </td>
              <td className="p-3.5 border-l border-slate-800 font-mono text-slate-200">
                {hypothesisB.suspectedService || "Not specified"}
              </td>
            </tr>

            {/* Explanation */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Technical Statement</td>
              <td className="p-3.5 border-l border-slate-800 leading-relaxed text-slate-300">
                {hypothesisA.explanation}
              </td>
              <td className="p-3.5 border-l border-slate-800 leading-relaxed text-slate-300">
                {hypothesisB.explanation}
              </td>
            </tr>

            {/* Supporting Evidence */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Supporting Evidence</td>
              <td className="p-3.5 border-l border-slate-800 space-y-2">
                {hypothesisA.supportingEvidence.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">No supporting evidence linked</span>
                ) : (
                  hypothesisA.supportingEvidence.map((ev, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/70 border border-emerald-900/40 text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-emerald-400">{ev.eventId}</span>
                        <Link
                          href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                        >
                          <span>Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                      <p className="text-slate-300">{ev.excerpt}</p>
                    </div>
                  ))
                )}
              </td>
              <td className="p-3.5 border-l border-slate-800 space-y-2">
                {hypothesisB.supportingEvidence.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">No supporting evidence linked</span>
                ) : (
                  hypothesisB.supportingEvidence.map((ev, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/70 border border-emerald-900/40 text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-emerald-400">{ev.eventId}</span>
                        <Link
                          href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                        >
                          <span>Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                      <p className="text-slate-300">{ev.excerpt}</p>
                    </div>
                  ))
                )}
              </td>
            </tr>

            {/* Contradicting Evidence */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Contradicting Evidence</td>
              <td className="p-3.5 border-l border-slate-800 space-y-2">
                {hypothesisA.contradictingEvidence.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">No contradicting evidence linked</span>
                ) : (
                  hypothesisA.contradictingEvidence.map((ev, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/70 border border-rose-900/40 text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-rose-400">{ev.eventId}</span>
                        <Link
                          href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                        >
                          <span>Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                      <p className="text-slate-300">{ev.excerpt}</p>
                    </div>
                  ))
                )}
              </td>
              <td className="p-3.5 border-l border-slate-800 space-y-2">
                {hypothesisB.contradictingEvidence.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">No contradicting evidence linked</span>
                ) : (
                  hypothesisB.contradictingEvidence.map((ev, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/70 border border-rose-900/40 text-[11px]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono font-bold text-rose-400">{ev.eventId}</span>
                        <Link
                          href={`/evidence?event=${encodeURIComponent(ev.eventId)}`}
                          className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                        >
                          <span>Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                      <p className="text-slate-300">{ev.excerpt}</p>
                    </div>
                  ))
                )}
              </td>
            </tr>

            {/* Confidence Assessment */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Assessed Confidence</td>
              <td className="p-3.5 border-l border-slate-800">
                <div className="font-mono font-bold text-sm text-slate-100 mb-1">
                  {confA !== null ? `${confA}%` : "Not assessed"}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {hypothesisA.confidenceExplanation}
                </p>
              </td>
              <td className="p-3.5 border-l border-slate-800">
                <div className="font-mono font-bold text-sm text-slate-100 mb-1">
                  {confB !== null ? `${confB}%` : "Not assessed"}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {hypothesisB.confidenceExplanation}
                </p>
              </td>
            </tr>

            {/* Unknowns & Gaps */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3.5 font-mono text-slate-400 font-semibold text-[11px]">Unknowns & Gaps</td>
              <td className="p-3.5 border-l border-slate-800">
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90">
                  {hypothesisA.unresolvedQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </td>
              <td className="p-3.5 border-l border-slate-800">
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90">
                  {hypothesisB.unresolvedQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

