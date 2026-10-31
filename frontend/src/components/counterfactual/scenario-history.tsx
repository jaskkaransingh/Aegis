"use client";

import React from "react";
import {
  Clock,
  FileCode,
  Layers,
  RotateCcw,
  Sliders,
  Trash2,
  Zap,
} from "lucide-react";
import type { CounterfactualScenario } from "@/types/counterfactual";

interface ScenarioHistoryProps {
  scenarios: CounterfactualScenario[];
  activeScenarioId: string | null;
  onSelectScenario: (scenario: CounterfactualScenario) => void;
  onClearHistory: () => void;
}

export function ScenarioHistory({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onClearHistory,
}: ScenarioHistoryProps) {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden text-xs text-slate-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-950/70 border border-amber-700/50 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
              Scenario History & Local Drafts ({scenarios.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Locally configured scenario configurations saved in active session memory.
            </p>
          </div>
        </div>

        {scenarios.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 text-[11px] transition-colors"
            title="Clear local drafts"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Drafts</span>
          </button>
        )}
      </div>

      {/* Drafts List */}
      <div className="p-3.5 space-y-2">
        {scenarios.length === 0 ? (
          <div className="p-6 text-center text-slate-500 italic">
            No local scenario drafts created yet. Configure a scenario above and save it.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {scenarios.map((scen) => {
              const isActive = activeScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => onSelectScenario(scen)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all select-none flex flex-col justify-between ${
                    isActive
                      ? "bg-violet-950/40 border-violet-500 shadow-md shadow-violet-500/10 ring-1 ring-violet-500"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-slate-300 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {scen.id}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40">
                        LOCAL DRAFT
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs tracking-tight line-clamp-1">
                      {scen.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                      {scen.assumptions}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Target: {scen.targetId}</span>
                    <span>{scen.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Epistemic Storage Notice */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>Active Session Memory (In-Memory Drafts)</span>
        <span>Drafts will reset on full page reload</span>
      </div>
    </div>
  );
}

