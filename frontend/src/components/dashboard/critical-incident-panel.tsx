import React from "react";
import Link from "next/link";
import {
  AlertOctagon,
  ArrowRight,
  Clock,
  Layers,
  MapPin,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { PRIMARY_DEMO_INCIDENT } from "@/lib/demo-data";
import { StatusBadge } from "@/components/ui/status-badge";

export function CriticalIncidentPanel() {
  const inc = PRIMARY_DEMO_INCIDENT;

  return (
    <div className="rounded-xl border border-rose-900/40 bg-gradient-to-b from-[#160d14] via-[#101422] to-[#0d101a] p-5 shadow-lg relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-900/30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-rose-400 shadow-sm shadow-rose-950/50">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm text-slate-100">
                {inc.id}
              </span>
              <StatusBadge label={inc.severity} variant="critical" />
              <StatusBadge label={inc.status} variant="violet" />
            </div>
            <h2 className="text-base font-semibold text-slate-100 mt-1">
              {inc.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
            {inc.syntheticLabel}
          </span>
        </div>
      </div>

      {/* Incident Description */}
      <div className="py-4">
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {inc.description}
        </p>

        {/* Metadata Grid */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/60">
            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500">Env:</span>
            <span className="text-slate-200 truncate">{inc.environment}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/60">
            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500">Detected:</span>
            <span className="text-slate-200 truncate">{inc.initialReportedTime}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/60">
            <Layers className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-500">Evidence Count:</span>
            <span className="text-violet-300 font-bold">{inc.evidenceCount} Events</span>
          </div>
        </div>
      </div>

      {/* Affected Services & Action */}
      <div className="pt-3.5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 shrink-0">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            Affected Services:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {inc.affectedServices.map((srv) => (
              <span
                key={srv}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
              >
                {srv}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/investigations/${inc.investigationId}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition shadow-sm shadow-violet-950/60 shrink-0"
        >
          <span>Open Investigation Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

