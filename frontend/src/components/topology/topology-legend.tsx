"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info, HelpCircle } from "lucide-react";

export function TopologyLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-10 w-72 rounded-xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md text-xs text-slate-300">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left border-b border-slate-800/80 hover:bg-slate-800/40 rounded-t-xl transition-colors"
      >
        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Info className="w-3.5 h-3.5 text-violet-400" />
          Graph Legend & Semantics
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Node Statuses */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Service Status
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span>Healthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span>Degraded / Warning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-sm shadow-rose-400/50" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span>Unknown</span>
              </div>
            </div>
          </div>

          {/* Relationship Types */}
          <div className="pt-2 border-t border-slate-800/60">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Relationship Edges (Caller → Callee)
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-slate-500" />
                <span>Known Architectural Dependency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 border-t border-dashed border-amber-400" />
                <span className="text-amber-300">Inferred Causal Propagation</span>
              </div>
            </div>
          </div>

          {/* Epistemic Note */}
          <div className="pt-2 border-t border-slate-800/60 flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>AEGIS Evidence Grounding:</strong> Static dependencies establish architectural connectivity. Inferred edges require corroborated incident telemetry. Graph adjacency alone does not prove failure causation.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

