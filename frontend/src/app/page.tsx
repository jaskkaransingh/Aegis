import React from "react";
import {
  Activity,
  Layers,
  GitBranch,
  FileSearch,
  Lightbulb,
  FlaskConical,
  FileText,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { BackendStatusCard } from "@/components/ui/backend-status-card";
import { config } from "@/lib/config";

interface ModulePlaceholder {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  phase: string;
}

const MODULES: ModulePlaceholder[] = [
  {
    title: "Command Center",
    description: "Executive incident overview, active telemetry metrics, and triage status.",
    icon: Activity,
    phase: "Phase 3",
  },
  {
    title: "Timeline",
    description: "Chronological event sequence with clock skew correction and uncertainty bands.",
    icon: Layers,
    phase: "Phase 3",
  },
  {
    title: "Service Topology",
    description: "Interactive NetworkX graph separating known dependencies from inferred causal links.",
    icon: GitBranch,
    phase: "Phase 3",
  },
  {
    title: "Evidence Explorer",
    description: "Validated event logs with zero-silent-drop deduplication and provenance tracking.",
    icon: FileSearch,
    phase: "Phase 3",
  },
  {
    title: "Hypotheses",
    description: "Candidate root cause evaluations grounded strictly in immutable log evidence.",
    icon: Lightbulb,
    phase: "Phase 4",
  },
  {
    title: "Counterfactual Lab",
    description: "What-if simulations testing alternative cascade interventions.",
    icon: FlaskConical,
    phase: "Phase 5",
  },
  {
    title: "Reports",
    description: "Exportable investigation briefs and compliance audit trails.",
    icon: FileText,
    phase: "Phase 5",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Welcome Panel */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0f1422] to-[#0a0e18] p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-100">
                {config.appName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-[11px] font-mono text-violet-300 font-medium">
                Foundation Initialized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {config.appSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Frontend Workspace Isolated</span>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 text-[11px] font-mono block">Stack</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              Next.js 15 + React 19 + TypeScript
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 text-[11px] font-mono block">Styling</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              Tailwind CSS + Lucide Icons
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500 text-[11px] font-mono block">Integration Boundary</span>
            <span className="font-semibold text-slate-200 mt-0.5 block">
              REST Client / Clean Contract
            </span>
          </div>
        </div>
      </div>

      {/* Backend Connectivity Status Probe */}
      <BackendStatusCard />

      {/* Planned Investigation Modules (Placeholders) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
              Investigation Modules
            </h2>
            <p className="text-xs text-slate-400">
              Planned UI modules to be built in subsequent controlled phases.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {MODULES.length} Modules Planned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/60 transition-colors relative"
              >
                <div className="flex items-start justify-between">
                  <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {mod.phase}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-200 mt-3">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

