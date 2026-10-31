import React from "react";
import { AlertCircle, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import type { DataQualityWarning } from "@/types";

interface InvestigationActivityProps {
  warnings: DataQualityWarning[];
  isDemoData: boolean;
}

export function InvestigationActivity({
  warnings,
  isDemoData,
}: InvestigationActivityProps) {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case "HIGH":
        return "bg-rose-950/60 text-rose-300 border-rose-800/60";
      case "MEDIUM":
        return "bg-amber-950/60 text-amber-300 border-amber-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Data Quality & Normalization Audit ({warnings.length})</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Structured warnings captured by the normalization pipeline. Zero records were silently discarded.
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {isDemoData ? "Synthetic Audit Fixture" : "Live Normalizer Telemetry"}
        </span>
      </div>

      <div className="space-y-2.5">
        {warnings.map((w, idx) => (
          <div
            key={`${w.code}-${w.event_id || idx}`}
            className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${getSeverityBadge(w.severity)}`}>
                  {w.severity}
                </span>
                <span className="font-mono text-violet-300 font-medium">
                  {w.code}
                </span>
                {w.event_id && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Target: <code className="text-slate-300">{w.event_id}</code>
                  </span>
                )}
              </div>
              {w.field_name && (
                <span className="text-[10px] font-mono text-slate-500">
                  Field: {w.field_name}
                </span>
              )}
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {w.message}
            </p>

            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60">
              <span className="text-slate-500">Action: </span>
              <span className="text-slate-300">{w.action_taken}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

