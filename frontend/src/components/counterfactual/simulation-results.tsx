"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  Cpu,
  HelpCircle,
  Layers,
  Network,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import type { CounterfactualScenario } from "@/types/counterfactual";

interface SimulationResultsProps {
  scenario: Partial<CounterfactualScenario>;
}

export function SimulationResults({ scenario }: SimulationResultsProps) {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden text-xs text-slate-200 space-y-4 p-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-violet-950/70 border border-violet-700/50 text-violet-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
              Simulation Results & Impact Assessment
            </h3>
            <p className="text-[11px] text-slate-400">
              Execution output contracts for counterfactual causal engine integration.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
          Simulation Engine Offline
        </span>
      </div>

      {/* Section A: Outcome Summary */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Section A — Outcome Summary
        </span>
        <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Simulation has not been executed. Configure a scenario and connect a simulation engine to calculate outcomes.
          </p>
        </div>
      </div>

      {/* Two Column Subsections: Timeline Difference & Service Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Section B: Timeline Difference */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            Section B — Timeline Differential
          </span>
          <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/50 text-[11px] text-slate-400 italic leading-relaxed">
            No calculated counterfactual timeline exists. AEGIS strictly avoids generating artificial timestamps or imaginary clock offsets without a validated simulation execution.
          </div>
        </div>

        {/* Section C: Service Impact Scope */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            Section C — Topological Reach
          </span>
          {scenario.downstreamServices && scenario.downstreamServices.length > 0 ? (
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/50 space-y-1.5">
              <span className="text-[10px] text-slate-400 block font-sans">
                Potential downstream services reachable via architectural graph:
              </span>
              <div className="flex flex-wrap gap-1">
                {scenario.downstreamServices.map((svc) => (
                  <span
                    key={svc}
                    className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {svc}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Determining whether downstream services would recover requires dynamic causal replay.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/50 text-[11px] text-slate-400 italic">
              Select a target entity in the Scenario Builder to compute downstream architectural reach.
            </div>
          )}
        </div>
      </div>

      {/* Section D: Assumptions and Epistemic Limitations */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          Section D — Assumptions & Epistemic Boundaries
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-cyan-400 block font-semibold mb-0.5">
              1. Observed Baseline
            </span>
            <span className="text-slate-300 font-sans">
              Concrete incident logs, timestamps, and error codes recorded by service collectors.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-amber-400 block font-semibold mb-0.5">
              2. User-Defined Assumptions
            </span>
            <span className="text-slate-300 font-sans">
              Hypothetical interventions specified by the investigator (unverified hypotheses).
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-violet-400 block font-semibold mb-0.5">
              3. Computed Results
            </span>
            <span className="text-slate-300 font-sans">
              Requires deterministic causal engine execution. Currently unavailable.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <span className="text-[10px] font-mono text-rose-400 block font-semibold mb-0.5">
              4. Epistemic Rule
            </span>
            <span className="text-slate-300 font-sans">
              AEGIS does not manufacture numerical improvement percentages or arbitrary recovery probability scores.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

