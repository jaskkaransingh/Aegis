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
          className="text-xs text-white/60 hover:text-white/90 transition flex items-center gap-1 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Command Center</span>
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40/60 p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-violet-600/10 border border-violet-500/30 text-white mx-auto flex items-center justify-center shadow-sm shadow-white/5">
          <Clock className="h-6 w-6" />
        </div>

        <div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white text-white border border-violet-800/60">
            {phase} Module
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono mt-2">
            {title}
          </h1>
          <p className="text-xs text-white/60 max-w-md mx-auto mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 max-w-lg mx-auto text-left">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/60 font-semibold block mb-2">
            Planned Capabilities for this Module
          </span>
          <ul className="space-y-1.5 text-xs text-white/80">
            {plannedCapabilities.map((cap) => (
              <li key={cap} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

