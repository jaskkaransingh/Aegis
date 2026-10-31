import React from "react";
import {
  Activity,
  GitBranch,
  Layers,
  FileSearch,
  Lightbulb,
  FlaskConical,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "placeholder";
}

const NAV_ITEMS: NavItem[] = [
  { name: "Command Center", icon: Activity, status: "active" },
  { name: "Timeline", icon: Layers, status: "placeholder" },
  { name: "Service Topology", icon: GitBranch, status: "placeholder" },
  { name: "Evidence Explorer", icon: FileSearch, status: "placeholder" },
  { name: "Hypotheses", icon: Lightbulb, status: "placeholder" },
  { name: "Counterfactual Lab", icon: FlaskConical, status: "placeholder" },
  { name: "Reports", icon: FileText, status: "placeholder" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0a0e17] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-sm shadow-violet-900/30">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold tracking-wider text-base text-slate-100 flex items-center gap-1.5">
              AEGIS
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-400 border border-violet-800/40 font-semibold">
                PHASE 2
              </span>
            </span>
            <p className="text-[10px] text-slate-400 leading-tight">
              Evidence-Grounded Investigation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Investigation Modules
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.status === "active";

            return (
              <div
                key={item.name}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-violet-600/15 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-900/40 opacity-70 cursor-not-allowed"
                }`}
                title={item.status === "placeholder" ? "Module planned for subsequent phase" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-violet-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.status === "placeholder" && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    Phase 3+
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">Engine Status</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Initialized
          </span>
        </div>
      </div>
    </aside>
  );
}

