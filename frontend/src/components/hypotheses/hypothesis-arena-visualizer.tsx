"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  FileCheck2,
  FileX2,
  Globe,
  Grid,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Network,
  RotateCcw,
  Scale,
  Server,
  Shield,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { ArenaHypothesis } from "@/types/hypothesis";

interface HypothesisArenaVisualizerProps {
  hypotheses: ArenaHypothesis[];
  selectedId: string | null;
  comparingIds: string[];
  onSelect: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

const MATRIX_SIGNALS = [
  {
    id: "EVT-001",
    time: "14:00:02",
    service: "postgresql-database",
    label: "Batch config update applied with zero backoff",
    h2: "SUPPORTING",
    h1: "NEUTRAL",
    h3: "NEUTRAL",
  },
  {
    id: "EVT-002",
    time: "14:00:15",
    service: "postgresql-database",
    label: "Max connections reached: 100/100 locked in backlog",
    h2: "SUPPORTING",
    h1: "SUPPORTING",
    h3: "NEUTRAL",
  },
  {
    id: "EVT-003",
    time: "14:00:22",
    service: "appointment-service",
    label: "Failed to acquire DB connection after 5000ms timeout",
    h2: "SUPPORTING",
    h1: "SUPPORTING",
    h3: "CONTRADICTING", // Occurs before payment, contradicting payment root cause
  },
  {
    id: "EVT-004",
    time: "14:00:24",
    service: "hospital-records",
    label: "Patient triage admission write failed: pool starved",
    h2: "SUPPORTING",
    h1: "NEUTRAL",
    h3: "NEUTRAL",
  },
  {
    id: "EVT-010",
    time: "14:01:00",
    service: "payment-service",
    label: "Payment delay: +120.0s clock skew corrected",
    h2: "NEUTRAL",
    h1: "NEUTRAL",
    h3: "CONTRADICTING",
  },
];

export function HypothesisArenaVisualizer({
  hypotheses,
  selectedId,
  comparingIds,
  onSelect,
  onToggleCompare,
}: HypothesisArenaVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"race" | "matrix" | "timeline">("race");

  // Sorted hypotheses by confidence descending
  const sortedHypotheses = [...hypotheses].sort(
    (a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0)
  );

  const leadingHypothesis = sortedHypotheses[0];

  return (
    <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white">
      {/* Top Arena Banner */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                Hypothesis Battle Arena & Diagnostic Matrix
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40">
                BAYESIAN EVALUATION ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              Empirical hypothesis ranking: 3 competing causal theories evaluated against verified telemetry spans.
            </p>
          </div>
        </div>

        {/* Visual View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/15 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("race")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "race"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>CONFIDENCE RANKING</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "matrix"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>EVIDENCE HEATMAP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "timeline"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>CLOCK SKEW PROOF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {/* ========================================================================= */}
        {/* TAB 1: CONFIDENCE RANKING & CAUSAL PROBABILITY SPECTRUM */}
        {/* ========================================================================= */}
        {activeTab === "race" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  Top Causal Candidate
                </span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span>{leadingHypothesis?.title || "DEMO-H2"}</span>
                </div>
                <span className="text-[10px] font-mono text-[#22c55e]">
                  88% Confidence • 3 Supporting Spans • 0 Contradictions
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  Leading Margin
                </span>
                <div className="text-sm font-bold text-white font-mono">
                  +23.0% Over Runner-up
                </div>
                <span className="text-[10px] font-mono text-white/60">
                  Statistically significant Bayesian likelihood delta
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/50 block">
                  Falsification Status
                </span>
                <div className="text-sm font-bold text-[#ef4444] font-mono flex items-center gap-1.5">
                  <FileX2 className="w-3.5 h-3.5" />
                  <span>1 Theory Disproven</span>
                </div>
                <span className="text-[10px] font-mono text-white/60">
                  DEMO-H3 refuted by timestamp skew correction
                </span>
              </div>
            </div>

            {/* Visual Probability Distribution Cards */}
            <div className="space-y-3">
              {sortedHypotheses.map((hyp, index) => {
                const confPercent = Math.round((hyp.confidenceScore || 0) * 100);
                const isSelected = selectedId === hyp.id;
                const isComparing = comparingIds.includes(hyp.id);
                const isWinner = index === 0 && confPercent >= 70;
                const isRefuted = hyp.status === "REFUTED";

                return (
                  <div
                    key={hyp.id}
                    onClick={() => onSelect(hyp.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-white/10 border-white shadow-xl shadow-white/10 ring-2 ring-white/60"
                        : isWinner
                        ? "bg-emerald-950/20 border-[#22c55e]/40 hover:border-[#22c55e]"
                        : isRefuted
                        ? "bg-red-950/15 border-[#ef4444]/30 hover:border-[#ef4444]/60 opacity-80"
                        : "bg-black/30 border-white/10 hover:border-white/25 hover:bg-black/40"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isWinner
                              ? "bg-[#22c55e] text-black"
                              : isRefuted
                              ? "bg-[#ef4444] text-white"
                              : "bg-white/20 text-white"
                          }`}
                        >
                          {index + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{hyp.title}</h3>
                            <span className="font-mono text-[10px] text-white/60 bg-white/10 px-1.5 py-0.2 rounded border border-white/15">
                              {hyp.id}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isWinner
                                  ? "bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]"
                                  : isRefuted
                                  ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]"
                                  : "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]"
                              }`}
                            >
                              {isWinner ? "LEADING ROOT CAUSE" : isRefuted ? "FALSIFIED" : "PLAUSIBLE"}
                            </span>
                          </div>
                          <span className="text-[11px] text-white/60 font-mono mt-0.5 block">
                            Target Service: <strong className="text-white font-sans">{hyp.suspectedService}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Right Telemetry Pill */}
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-base font-bold text-white block">
                            {confPercent}%
                          </span>
                          <span className="text-[10px] text-white/50 uppercase block">
                            Confidence
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(hyp.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors ${
                            isComparing
                              ? "bg-[#22c55e] text-black font-bold border-[#22c55e]"
                              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                          }`}
                        >
                          {isComparing ? "In Duel ✓" : "Compare"}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isWinner
                              ? "bg-[#22c55e] shadow-[0_0_12px_#22c55e]"
                              : isRefuted
                              ? "bg-[#ef4444]"
                              : "bg-[#f59e0b]"
                          }`}
                          style={{ width: `${confPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-white/60">
                        <div className="flex items-center gap-3">
                          <span className="text-[#22c55e] flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" />
                            {hyp.supportingEvidence.length} Supporting Spans
                          </span>
                          {hyp.contradictingEvidence.length > 0 && (
                            <span className="text-[#ef4444] flex items-center gap-1 font-bold">
                              <X className="w-3 h-3" />
                              {hyp.contradictingEvidence.length} Contradicted
                            </span>
                          )}
                          <span className="text-white/50">
                            {hyp.unresolvedQuestions.length} Open Gaps
                          </span>
                        </div>

                        <span className="italic font-sans text-white/70">
                          {hyp.confidenceExplanation}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EVIDENCE HEATMAP MATRIX */}
        {/* ========================================================================= */}
        {activeTab === "matrix" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-white/60 pb-1">
              <span>
                Verification Cross-Reference: Telemetry Spans vs. Competing Theories
              </span>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="flex items-center gap-1 text-[#22c55e]">
                  <Check className="w-3 h-3" />
                  Supporting Evidence (+Confidence)
                </span>
                <span className="flex items-center gap-1 text-[#ef4444]">
                  <X className="w-3 h-3" />
                  Contradicting Evidence (-Falsified)
                </span>
                <span className="flex items-center gap-1 text-white/40">
                  — Unrelated / Neutral
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/60 text-white/60 text-[10px] uppercase">
                    <th className="p-3 w-28">Event ID</th>
                    <th className="p-3 w-24">UTC Time</th>
                    <th className="p-3 w-40">Service</th>
                    <th className="p-3">Verified Log Telemetry</th>
                    <th className="p-3 w-36 text-center border-l border-white/10">
                      DEMO-H2 (DB Pool)
                    </th>
                    <th className="p-3 w-36 text-center border-l border-white/10">
                      DEMO-H1 (Retry Storm)
                    </th>
                    <th className="p-3 w-36 text-center border-l border-white/10">
                      DEMO-H3 (Payment Skew)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MATRIX_SIGNALS.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-bold text-white">{row.id}</td>
                      <td className="p-3 text-white/60">{row.time}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white/80 text-[10px]">
                          {row.service}
                        </span>
                      </td>
                      <td className="p-3 text-white/80 font-sans">{row.label}</td>

                      {/* H2 Cell */}
                      <td className="p-3 border-l border-white/10 text-center">
                        {row.h2 === "SUPPORTING" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e]">
                            <Check className="w-3 h-3" />
                            CONFIRMED
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      {/* H1 Cell */}
                      <td className="p-3 border-l border-white/10 text-center">
                        {row.h1 === "SUPPORTING" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e]">
                            <Check className="w-3 h-3" />
                            CONFIRMED
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>

                      {/* H3 Cell */}
                      <td className="p-3 border-l border-white/10 text-center">
                        {row.h3 === "CONTRADICTING" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444]">
                            <X className="w-3 h-3" />
                            FALSIFIED
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLOCK SKEW FALSIFICATION PROOF */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-red-950/20 border border-[#ef4444]/30 space-y-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#ef4444]" />
                <h3 className="font-bold text-white text-xs uppercase font-mono">
                  Why DEMO-H3 Was Falsified: Timing Uncertainty & Clock Drift Elimination
                </h3>
              </div>
              <p className="text-xs text-white/80 font-sans leading-relaxed">
                Initial uncorrected logs on <code className="text-white font-mono bg-white/10 px-1 rounded">payment-service</code> showed an error at 13:59:00 UTC, leading engineers to falsely believe Payment initiated the failure. AEGIS timestamp normalization identified a <strong>+120.0s clock skew</strong>. Corrected chronological replay proves Payment timeouts occurred at <strong>14:01:00 UTC</strong>, 38 seconds <em>after</em> the database pool was already exhausted.
              </p>
            </div>

            {/* Visual Chronological Proof Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-[#22c55e] font-bold">T+00s // 14:00:02 UTC</span>
                <div className="font-bold text-white">Batch Archival Job</div>
                <p className="text-[10px] text-white/60 font-sans">
                  Exclusive table lock acquired on PostgreSQL patients table.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-[#22c55e] font-bold">T+13s // 14:00:15 UTC</span>
                <div className="font-bold text-white">100/100 Pool Drained</div>
                <p className="text-[10px] text-white/60 font-sans">
                  Worker threads stall waiting for released DB connections.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-[#22c55e] font-bold">T+20s // 14:00:22 UTC</span>
                <div className="font-bold text-white">Appointment Timeout</div>
                <p className="text-[10px] text-white/60 font-sans">
                  Upstream service worker pool exhausted; 504s trigger.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-[#ef4444]/40 space-y-1 bg-red-950/15">
                <span className="text-[10px] text-[#ef4444] font-bold">T+58s // 14:01:00 UTC</span>
                <div className="font-bold text-[#ef4444]">Payment Lag (Consequence)</div>
                <p className="text-[10px] text-white/60 font-sans">
                  Payment delayed solely because appointment booking was pending.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

