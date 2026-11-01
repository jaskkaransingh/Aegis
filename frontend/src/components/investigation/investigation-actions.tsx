import React from "react";
import Link from "next/link";
import { Clock, FileSearch, ArrowLeft, Bot, ShieldCheck } from "lucide-react";

interface InvestigationActionsProps {
  incidentId: string;
}

export function InvestigationActions({ incidentId }: InvestigationActionsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40/50 p-5 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
        Investigation Navigation & Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href={`/timeline?incident=${incidentId}`}
          className="p-3.5 rounded-lg border border-violet-800/50 bg-white/10 text-white/20 hover:bg-white/10 text-white/40 text-white transition group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white group-hover:scale-105 transition" />
            <span className="text-xs font-bold font-mono">Open Timeline Explorer</span>
          </div>
          <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
            Inspect clock-skew corrected event sequencing and timing uncertainty intervals.
          </p>
        </Link>

        <Link
          href="/evidence"
          className="p-3.5 rounded-lg border border-white/10 bg-black/40/40 hover:bg-black/40 text-white/80 transition group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-white/60 group-hover:scale-105 transition" />
            <span className="text-xs font-bold font-mono">View Evidence Explorer</span>
          </div>
          <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
            Audit raw log provenance, telemetry integrity, and data quality flags.
          </p>
        </Link>

        <Link
          href="/"
          className="p-3.5 rounded-lg border border-white/10 bg-black/40/40 hover:bg-black/40 text-white/80 transition group flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-white/60 group-hover:scale-105 transition" />
            <span className="text-xs font-bold font-mono">Return to Command Center</span>
          </div>
          <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
            Return to global infrastructure overview and active incident monitoring.
          </p>
        </Link>
      </div>

      {/* Honest Architectural Status Note */}
      <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white/60 flex items-start gap-2.5">
        <Bot className="h-4 w-4 text-white shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="text-white/80 font-semibold font-mono">Autonomous Engine Status: </span>
          The deterministic evidence layer and timeline explorer are active. The multi-agent investigation workflow (LangGraph + Ollama / Gemini) will be connected in Phase 5. No automated hypothesis claims are generated without user-directed verification.
        </p>
      </div>
    </div>
  );
}

