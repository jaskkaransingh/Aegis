"use client";

import React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Clock,
  Database,
  ExternalLink,
  Layers,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import type { BaselineIncidentContext, BaselineIncidentEvent } from "@/types/counterfactual";

interface BaselinePanelProps {
  baseline: BaselineIncidentContext;
  selectedEventId: string | null;
  onSelectEvent: (event: BaselineIncidentEvent) => void;
}

export function BaselinePanel({
  baseline,
  selectedEventId,
  onSelectEvent,
}: BaselinePanelProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-sm overflow-hidden text-xs text-slate-200">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
            Observed Baseline Incident
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
          Ground Truth Baseline
        </span>
      </div>

      {/* Incident Summary Card */}
      <div className="p-4 space-y-3 border-b border-slate-800/60">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-mono text-slate-400 font-semibold">{baseline.incidentId}</span>
            <span className="text-slate-500 font-mono text-[10px]">{baseline.events.length} Events Logged</span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">
            {baseline.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
            {baseline.summary}
          </p>
        </div>

        {/* Affected Services */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            Affected Services ({baseline.affectedServices.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {baseline.affectedServices.map((svc) => (
              <span
                key={svc}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1"
              >
                <Server className="w-2.5 h-2.5 text-slate-500" />
                <span>{svc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Observed Events Stream */}
      <div className="p-3.5 space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Key Baseline Events (Click to target)
          </span>
          <Link
            href="/timeline"
            className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5 font-medium"
          >
            <span>Timeline</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>

        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {baseline.events.slice(0, 10).map((ev) => {
            const isSelected = selectedEventId === ev.id;
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500 text-slate-100 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-300 text-[11px]">
                      {ev.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                      {ev.service}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      ev.severity === "CRITICAL"
                        ? "bg-rose-950/70 border border-rose-700 text-rose-300"
                        : ev.severity === "ERROR"
                        ? "bg-rose-950/50 border border-rose-600 text-rose-300"
                        : "bg-amber-950/60 border border-amber-600 text-amber-300"
                    }`}
                  >
                    {ev.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                  {ev.message}
                </p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                  <span>{ev.timestamp.substring(11, 23)} UTC</span>
                  <Link
                    href={`/evidence?event=${encodeURIComponent(ev.id)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-0.5"
                    title="Inspect in Evidence Explorer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

