"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Server, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Search, Plus } from "lucide-react";
import { useBackend } from "@/lib/backend-context";
import { config } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const { status, refresh } = useBackend();

  function getBreadcrumb() {
    if (pathname === "/" || pathname === "/command-center") return "Command Center";
    if (pathname === "/design-system") return "Design System";
    if (pathname === "/investigations") return "Investigations";
    if (pathname.startsWith("/investigations/")) return "Incident Workspace";
    if (pathname === "/timeline") return "Timeline Explorer";
    if (pathname === "/topology") return "Service Topology";
    if (pathname === "/evidence") return "Evidence Explorer";
    if (pathname === "/hypotheses") return "Hypothesis Arena";
    if (pathname === "/counterfactual") return "Counterfactual Lab";
    if (pathname === "/reports") return "Forensic Reports";
    return "Workstation";
  }

  return (
    <header className="h-14 border-b border-white/10 bg-[#07090f]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 select-none">
      {/* Current Workspace Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="font-semibold text-white/50 tracking-wider">
          AEGIS
        </span>
        <span className="text-white/20">/</span>
        <span className="text-white font-medium">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right Strip: Connectivity & Environment */}
      <div className="flex items-center gap-3">
        {/* Environment Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f2c66d]" />
          <span>CIVICHEALTH CLUSTER</span>
        </div>

        {/* Backend Status Beacon */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono">
          <Server className="h-3 w-3 text-white/50" />
          {status === "connected" && (
            <span className="inline-flex items-center gap-1 text-[#76d6a4] text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#76d6a4] animate-pulse" />
              <span>Live API</span>
            </span>
          )}
          {status === "disconnected" && (
            <span className="inline-flex items-center gap-1 text-[#f2c66d] text-[11px]" title="FastAPI server offline; running demo telemetry">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f2c66d]" />
              <span>Demo Mode</span>
            </span>
          )}
          {status === "checking" && (
            <span className="inline-flex items-center gap-1 text-white/50 text-[11px]">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Probing</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
