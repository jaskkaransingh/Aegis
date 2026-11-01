"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Search,
  Plus,
  Lock,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { useBackend } from "@/lib/backend-context";
import { useAuth } from "@/lib/auth-context";
import { config } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const { status, refresh } = useBackend();
  const { isAdmin, adminProfile, user, openLoginModal, logout } = useAuth();

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
    if (pathname === "/login") return "Admin Terminal";
    return "Workstation";
  }

  return (
    <header className="h-14 border-b border-white/10 bg-black/35 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 select-none">
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

      {/* Right Strip: Admin Auth, Connectivity & Environment */}
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

        {/* Admin Authentication Status & Trigger */}
        {isAdmin ? (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[#22c55e] font-bold text-[11px] max-w-[130px] truncate">
              {adminProfile?.displayName || user?.email?.split("@")[0] || "ADMIN"}
            </span>
            <span className="text-white/40 text-[9px] hidden md:inline">
              LVL-5
            </span>
            <button
              onClick={() => logout()}
              title="Sign Out of Admin"
              className="ml-1 p-0.5 text-white/50 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono transition-colors shadow-sm"
            title="Authenticate with Firebase for Admin Permissions"
          >
            <Lock className="w-3 h-3 text-white/70" />
            <span>Admin Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
