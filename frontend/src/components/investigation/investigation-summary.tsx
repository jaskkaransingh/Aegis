import React from "react";
import { Server, AlertTriangle, Layers, Clock, ShieldCheck } from "lucide-react";

interface InvestigationSummaryProps {
  description: string;
  affectedServices: string[];
  totalEvents: number | null;
  warningsCount: number | null;
  status: string;
  clockOffsetActive: boolean;
  isDemoData: boolean;
}

export function InvestigationSummary({
  description,
  affectedServices,
  totalEvents,
  warningsCount,
  status,
  clockOffsetActive,
  isDemoData,
}: InvestigationSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Description Callout */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Incident Grounding Synopsis
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {isDemoData ? "Source: Centralized Demo Spec" : "Source: Live Normalized Telemetry"}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          {description}
        </p>

        {/* Compact Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Server className="h-3 w-3" />
              <span>Affected Services</span>
            </div>
            <div className="text-base font-bold text-slate-100 font-mono mt-1">
              {affectedServices.length > 0 ? affectedServices.length : "Unavailable"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Layers className="h-3 w-3" />
              <span>Evidence Events</span>
            </div>
            <div className="text-base font-bold text-violet-300 font-mono mt-1">
              {totalEvents !== null ? totalEvents : "Unavailable"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>Data Warnings</span>
            </div>
            <div className="text-base font-bold text-amber-300 font-mono mt-1">
              {warningsCount !== null ? warningsCount : "Unavailable"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Clock className="h-3 w-3 text-cyan-400" />
              <span>Clock Correction</span>
            </div>
            <div className="text-xs font-semibold text-cyan-300 font-mono mt-1.5">
              {clockOffsetActive ? "Active (-42.0s Applied)" : "Synchronized"}
            </div>
          </div>
        </div>
      </div>

      {/* Affected Services Tags */}
      {affectedServices.length > 0 && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            In-Scope Monitored Services ({affectedServices.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {affectedServices.map((srv) => (
              <span
                key={srv}
                className="px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span>{srv}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

