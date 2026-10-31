"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Server, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { useBackend } from "@/lib/backend-context";
import { config } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const { status, refresh } = useBackend();

  function getBreadcrumb() {
    if (pathname === "/") return "Command Center";
    if (pathname === "/investigations") return "Investigations Directory";
    if (pathname.startsWith("/investigations/")) return "Investigation Workspace";
    if (pathname === "/timeline") return "Timeline Explorer";
    if (pathname === "/topology") return "Service Topology";
    if (pathname === "/evidence") return "Evidence Explorer";
    if (pathname === "/hypotheses") return "Hypothesis Arena";
    if (pathname === "/counterfactual") return "Counterfactual Lab";
    if (pathname === "/reports") return "Reports";
    return "Workstation";
  }

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0a0e17]/90 backdrop-blur px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Breadcrumb Section */}
      <div className="flex items-center gap-2.5 text-xs">
        <span className="font-mono font-bold text-slate-300 tracking-wider">
          {config.appName}
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 font-mono">CivicHealth Incidents</span>
        <span className="text-slate-600">/</span>
        <span className="text-violet-300 font-semibold font-mono">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Badges & Real Connectivity Indicator */}
      <div className="flex items-center gap-3">
        {/* Demo Environment Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[10px] font-mono font-medium">
          <AlertTriangle className="h-3 w-3 text-amber-400" />
          <span>DEMO ENVIRONMENT</span>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
          <Server className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 hidden sm:inline">Backend:</span>
          {status === "connected" && (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected (8000)
            </span>
          )}
          {status === "disconnected" && (
            <span className="inline-flex items-center gap-1 text-amber-400 text-[11px]" title="FastAPI server offline; running demo mode">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline (Demo Mode)
            </span>
          )}
          {status === "checking" && (
            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Checking...
            </span>
          )}
          <button
            type="button"
            onClick={() => refresh()}
            title="Probe backend health"
            className="text-slate-400 hover:text-slate-200 transition ml-0.5"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>
    </header>
  );
}
