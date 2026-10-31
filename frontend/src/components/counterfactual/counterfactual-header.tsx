"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  FlaskConical,
  HelpCircle,
  RefreshCw,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";

interface CounterfactualHeaderProps {
  isLive: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  scenarioStatus: "Ready to configure" | "Draft scenario" | "Simulation unavailable" | "Simulation completed";
}

export function CounterfactualHeader({
  isLive,
  isLoading,
  onRefresh,
  scenarioStatus,
}: CounterfactualHeaderProps) {
  return (
    <div className="space-y-3 pb-3 border-b border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-700/50 text-violet-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-mono">
              Counterfactual Lab
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                isLive
                  ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-amber-950/60 border-amber-700/60 text-amber-300"
              }`}
            >
              {isLive ? "LIVE DATA" : "DEMO DATA"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore alternative incident scenarios and assess hypothetical interventions against the observed cascade.
          </p>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Incident Context */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-slate-400 text-[11px]">Incident:</span>
            <span className="font-semibold text-slate-200">INC-2026-0881</span>
          </div>

          {/* Execution Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{scenarioStatus}</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 transition-colors font-medium text-xs shadow-sm"
            title="Reload baseline data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-violet-400" : "text-slate-400"}`} />
            <span>{isLoading ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

