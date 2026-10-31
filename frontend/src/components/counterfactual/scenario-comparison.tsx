"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
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
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden text-xs text-slate-200">
      {/* Comparison Top Banner */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-950/70 border border-cyan-700/50 text-cyan-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
              Baseline vs. Hypothetical Scenario Comparison
            </h3>
            <p className="text-[11px] text-slate-400">
              Contrasting recorded ground-truth telemetry with unvalidated user intervention assumptions.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          Side-by-Side Review
        </span>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Left Column: Observed Baseline */}
        <div className="p-4 space-y-3 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Observed Baseline
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Ground Truth
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Target Entity in Baseline
              </span>
              <span className="font-mono font-semibold text-slate-200 text-xs">
                {targetLabel}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Observed Operational State
              </span>
              <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                {scenario.targetType === "EVENT"
                  ? "Event occurred at recorded timestamp and triggered downstream timeout cascade."
                  : "Service experienced degraded throughput and connection pool saturation."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Timeline & Concurrency
              </span>
              <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                {baseline.events.length} canonical events recorded with verified clock offsets and timing bounds.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Cascade Scope
              </span>
              <p className="text-rose-300 font-sans leading-relaxed text-[11px]">
                {baseline.affectedServices.length} microservices disrupted across public entrance and booking flows.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hypothetical Scenario */}
        <div className="p-4 space-y-3 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h4 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                Hypothetical Scenario
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              User Assumption
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Proposed Intervention
              </span>
              <span className="font-mono font-semibold text-amber-200 text-xs">
                {scenario.action?.replace("_", " ") || "ASSUME HEALTHY"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Investigator Assumption Details
              </span>
              <p className="text-amber-100/90 font-sans leading-relaxed text-[11px]">
                {scenario.assumptions || "No assumption details configured yet."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                Hypothetical Timeline Effect
              </span>
              <p className="text-slate-400 italic font-sans leading-relaxed text-[11px]">
                Not computed — requires connected counterfactual simulation engine.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                Hypothetical Cascade Mitigation
              </span>
              <p className="text-slate-400 italic font-sans leading-relaxed text-[11px]">
                Outcome not yet determined. No artificial recovery percentages are manufactured.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

