import React from "react";
import Link from "next/link";
import { ArrowLeft, Construction, Clock, Sparkles } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  phase: string;
  description: string;
  plannedCapabilities: string[];
}

export function ModulePlaceholder({
  title,
  phase,
  description,
  plannedCapabilities,
}: ModulePlaceholderProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Command Center</span>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/30 text-violet-400 mx-auto flex items-center justify-center shadow-sm shadow-violet-950/60">
          <Clock className="h-6 w-6" />
        </div>

        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/60">
            {phase} Module
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono mt-2">
            {title}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 max-w-lg mx-auto text-left">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            Planned Capabilities for this Module
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {plannedCapabilities.map((cap) => (
              <li key={cap} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

