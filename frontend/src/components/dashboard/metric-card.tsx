import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  sourceLabel?: string;
  description: string;
  icon: LucideIcon;
  accentColor?: "violet" | "rose" | "amber" | "cyan";
}

export function MetricCard({
  label,
  value,
  sourceLabel = "DEMO DATA",
  description,
  icon: Icon,
  accentColor = "violet",
}: MetricCardProps) {
  const iconColor = {
    violet: "text-violet-400 bg-violet-950/40 border-violet-800/40",
    rose: "text-rose-400 bg-rose-950/40 border-rose-800/40",
    amber: "text-amber-400 bg-amber-950/40 border-amber-800/40",
    cyan: "text-cyan-400 bg-cyan-950/40 border-cyan-800/40",
  }[accentColor];

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            {label}
          </span>
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-100 mt-1 block">
            {value}
          </span>
        </div>
        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
        <p className="text-slate-400 line-clamp-1 flex-1 mr-2">{description}</p>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50 shrink-0">
          {sourceLabel}
        </span>
      </div>
    </div>
  );
}

