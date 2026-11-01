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
      <span className="text-xs font-mono text-white/60 hidden sm:inline">
        Timestamp Mode:
      </span>
      <div className="inline-flex rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs font-mono">
        <button
          type="button"
          onClick={() => onChange("corrected")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            mode === "corrected"
              ? "bg-white text-black border border-white font-semibold shadow-sm font-semibold"
              : "text-white/60 hover:text-white/90"
          }`}
          title="Display timestamps adjusted for estimated service clock skew"
        >
          <Clock className="h-3.5 w-3.5 text-white" />
          <span>Corrected Time</span>
          {mode === "corrected" && <Check className="h-3 w-3 text-white ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => onChange("raw")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
            mode === "raw"
              ? "bg-slate-800 text-white/90 border border-white/20 shadow-sm font-semibold"
              : "text-white/60 hover:text-white/90"
          }`}
          title="Display unadjusted original raw timestamps exactly as ingested"
        >
          <span>Raw Timestamps</span>
          {mode === "raw" && <Check className="h-3 w-3 text-white/80 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

