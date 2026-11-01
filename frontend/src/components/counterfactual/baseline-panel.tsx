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
    <div className="flex flex-col rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden text-xs text-white">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
            Observed Incident Telemetry // Ground Truth
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#ef4444] bg-[#ef4444]/15 px-2 py-0.5 rounded border border-[#ef4444]/40 font-bold">
          {baseline.incidentId}
        </span>
      </div>

      {/* Visual Telemetry Summary Strip */}
      <div className="p-4 space-y-3 border-b border-white/10">
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[9px] uppercase text-white/50 block">Status</span>
            <span className="text-xs font-bold text-[#ef4444] block mt-0.5">CRITICAL OUTAGE</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[9px] uppercase text-white/50 block">Blast Radius</span>
            <span className="text-xs font-bold text-[#f59e0b] block mt-0.5">{baseline.affectedServices.length} SERVICES</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[9px] uppercase text-white/50 block">Logged Events</span>
            <span className="text-xs font-bold text-[#22c55e] block mt-0.5">{baseline.events.length} SPANS</span>
          </div>
        </div>

        {/* Affected Services Visual Chips */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Affected Infrastructure Nodes ({baseline.affectedServices.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {baseline.affectedServices.map((svc) => (
              <span
                key={svc}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] text-white/90 border border-white/15 flex items-center gap-1.5"
              >
                <Server className="w-2.5 h-2.5 text-white/50" />
                <span>{svc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Observed Events Stream */}
      <div className="p-3.5 space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
            Chronological Signals (Click to target intervention)
          </span>
          <Link
            href="/timeline"
            className="text-[10px] text-white/80 hover:text-white flex items-center gap-0.5 font-medium font-mono"
          >
            <span>Timeline</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {baseline.events.slice(0, 8).map((ev) => {
            const isSelected = selectedEventId === ev.id;
            const isCritical = ev.severity === "CRITICAL";
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                  isSelected
                    ? "bg-white/10 border-white text-white shadow-md ring-1 ring-white/50"
                    : "bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-white text-[11px]">
                      {ev.id}
                    </span>
                    <span className="text-[10px] font-mono text-white/70 bg-white/10 px-1.5 py-0.2 rounded border border-white/10">
                      {ev.service}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      isCritical
                        ? "bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444]"
                        : "bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b]"
                    }`}
                  >
                    {ev.severity}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed font-sans line-clamp-1">
                  {ev.message}
                </p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/10 text-[10px] text-white/50 font-mono">
                  <span>{ev.timestamp.substring(11, 19)} UTC</span>
                  <span className="text-white/60 hover:text-white flex items-center gap-0.5">
                    Select Event Target →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
