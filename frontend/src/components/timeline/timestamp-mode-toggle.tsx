import React from "react";
import { Clock, Check } from "lucide-react";

export type TimestampMode = "corrected" | "raw";

interface TimestampModeToggleProps {
  mode: TimestampMode;
  onChange: (mode: TimestampMode) => void;
  offsetSeconds?: number;
}

export function TimestampModeToggle({
  mode,
  onChange,
  offsetSeconds = 42,
}: TimestampModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-slate-400 hidden sm:inline">
        Timestamp Mode:
      </span>
      <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-xs font-mono">
        <button
          type="button"
          onClick={() => onChange("corrected")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            mode === "corrected"
              ? "bg-violet-950 text-violet-200 border border-violet-800/60 shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Display timestamps adjusted for estimated service clock skew"
        >
          <Clock className="h-3.5 w-3.5 text-violet-400" />
          <span>Corrected Time</span>
          {mode === "corrected" && <Check className="h-3 w-3 text-violet-300 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => onChange("raw")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            mode === "raw"
              ? "bg-slate-800 text-slate-200 border border-slate-700 shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Display unadjusted original raw timestamps exactly as ingested"
        >
          <span>Raw Timestamps</span>
          {mode === "raw" && <Check className="h-3 w-3 text-slate-300 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

