"use client";

import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  Network,
  Scale,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import type {
  BaselineIncidentContext,
  CounterfactualScenario,
} from "@/types/counterfactual";

interface ScenarioComparisonProps {
  baseline: BaselineIncidentContext;
  scenario: Partial<CounterfactualScenario>;
}

export function ScenarioComparison({ baseline, scenario }: ScenarioComparisonProps) {
  const targetLabel = scenario.targetLabel || scenario.targetId || "Selected target";

  return (
    <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden text-xs text-white">
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white/10 border border-white/20 text-white">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Causal Delta Matrix // Baseline vs. Intervention
            </h3>
            <p className="text-[11px] text-white/60">
              Comparative telemetry impact across critical architectural dimensions.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded border border-white/15">
          DUAL-BRANCH TELEMETRY
        </span>
      </div>

      {/* Side-by-side Visual Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* Left: Recorded Incident Ground Truth */}
        <div className="p-4 space-y-3 bg-red-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
              <h4 className="font-mono text-xs font-bold text-[#ef4444] uppercase tracking-wider">
                Ground Truth Baseline [Observed]
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#ef4444] bg-[#ef4444]/15 px-2 py-0.5 rounded border border-[#ef4444]/40 font-bold">
              SEV-1 OUTAGE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Metric A1 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#ef4444]/25 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Target State</span>
              <span className="font-bold text-[#ef4444] text-xs block truncate">
                {targetLabel}
              </span>
              <span className="text-[10px] text-white/60 font-sans block">
                Held by unindexed lock
              </span>
            </div>

            {/* Metric A2 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#ef4444]/25 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Gateway Latency</span>
              <span className="font-bold text-[#ef4444] text-xs block">
                14,200 ms (P99)
              </span>
              <span className="text-[10px] text-white/60 font-sans block">
                504 Cascading Timeouts
              </span>
            </div>

            {/* Metric A3 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#ef4444]/25 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">DB Connections</span>
              <span className="font-bold text-[#ef4444] text-xs block">
                100 / 100 [Maxed]
              </span>
              <span className="text-[10px] text-white/60 font-sans block">
                Queue saturation
              </span>
            </div>

            {/* Metric A4 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#ef4444]/25 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Blast Radius</span>
              <span className="font-bold text-[#ef4444] text-xs block">
                {baseline.affectedServices.length} Microservices
              </span>
              <span className="text-[10px] text-white/60 font-sans block">
                Uncontained propagation
              </span>
            </div>
          </div>
        </div>

        {/* Right: Counterfactual Simulation Branch */}
        <div className="p-4 space-y-3 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <h4 className="font-mono text-xs font-bold text-[#22c55e] uppercase tracking-wider">
                Counterfactual Branch [Simulated]
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded border border-[#22c55e]/40 font-bold">
              NOMINAL RECOVERY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Metric B1 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#22c55e]/30 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Intervention</span>
              <span className="font-bold text-[#22c55e] text-xs block truncate">
                {scenario.action?.replace(/_/g, " ") || "ASSUME HEALTHY"}
              </span>
              <span className="text-[10px] text-white/60 font-sans block">
                Lock avoided at injection
              </span>
            </div>

            {/* Metric B2 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#22c55e]/30 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Gateway Latency</span>
              <span className="font-bold text-[#22c55e] text-xs block">
                128 ms (Nominal)
              </span>
              <span className="text-[10px] text-[#22c55e] font-sans block">
                -99.1% Latency Reduction
              </span>
            </div>

            {/* Metric B3 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#22c55e]/30 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">DB Connections</span>
              <span className="font-bold text-[#22c55e] text-xs block">
                14 / 100 (Nominal)
              </span>
              <span className="text-[10px] text-[#22c55e] font-sans block">
                86% Headroom Maintained
              </span>
            </div>

            {/* Metric B4 */}
            <div className="p-3 rounded-xl bg-black/40 border border-[#22c55e]/30 space-y-1">
              <span className="text-[10px] uppercase text-white/50 block">Blast Radius</span>
              <span className="font-bold text-[#22c55e] text-xs block">
                0 Microservices
              </span>
              <span className="text-[10px] text-[#22c55e] font-sans block">
                Full cascade containment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
