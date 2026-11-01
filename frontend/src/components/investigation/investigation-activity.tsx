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
        return "bg-slate-800 text-white/80 border-white/20";
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/40/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Data Quality & Normalization Audit ({warnings.length})</span>
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5">
            Structured warnings captured by the normalization pipeline. Zero records were silently discarded.
          </p>
        </div>
        <span className="text-[10px] font-mono text-white/50">
          {isDemoData ? "Synthetic Audit Fixture" : "Live Normalizer Telemetry"}
        </span>
      </div>

      <div className="space-y-2.5">
        {warnings.map((w, idx) => (
          <div
            key={`${w.code}-${w.event_id || idx}`}
            className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${getSeverityBadge(w.severity)}`}>
                  {w.severity}
                </span>
                <span className="font-mono text-white font-medium">
                  {w.code}
                </span>
                {w.event_id && (
                  <span className="text-[11px] font-mono text-white/60">
                    Target: <code className="text-white/80">{w.event_id}</code>
                  </span>
                )}
              </div>
              {w.field_name && (
                <span className="text-[10px] font-mono text-white/50">
                  Field: {w.field_name}
                </span>
              )}
            </div>

            <p className="text-white/80 text-xs leading-relaxed">
              {w.message}
            </p>

            <div className="text-[11px] text-white/60 font-mono bg-black/40/80 px-2 py-1 rounded border border-white/10">
              <span className="text-white/50">Action: </span>
              <span className="text-white/80">{w.action_taken}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

