"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  GitBranch,
  FileSearch,
  Lightbulb,
  FlaskConical,
  FileText,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useBackend } from "@/lib/backend-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isReady: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Command Center", href: "/", icon: Activity, isReady: true },
  { name: "Investigations", href: "/investigations", icon: Search, isReady: true },
  { name: "Timeline Explorer", href: "/timeline", icon: Layers, isReady: true },
  { name: "Service Topology", href: "/topology", icon: GitBranch, isReady: true },
  { name: "Evidence Explorer", href: "/evidence", icon: FileSearch, isReady: true },
  { name: "Hypothesis Arena", href: "/hypotheses", icon: Lightbulb, isReady: true },
  { name: "Counterfactual Lab", href: "/counterfactual", icon: FlaskConical, isReady: true },
  { name: "Reports", href: "/reports", icon: FileText, isReady: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { status: backendStatus, refresh } = useBackend();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#090d16] flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-violet-950/70 border border-violet-600/40 flex items-center justify-center text-violet-400 shadow-sm shadow-violet-950/80 group-hover:border-violet-500 transition">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-base text-slate-100 font-mono">
                AEGIS
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-950/80 text-violet-300 border border-violet-800/50 font-semibold">
                v0.1
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-tight">
              Incident Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Workstation Navigation
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (item.isReady) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-sm shadow-violet-950/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-violet-400" : "text-slate-500"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </Link>
              );
            }

            // Placeholder route with clear status indicator
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-slate-200 border border-slate-700"
                    : "text-slate-400 hover:text-slate-300 hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  Phase 4+
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Environment & Live Connectivity */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070a12] space-y-3">
        {/* Environment Tag */}
        <div className="text-[10px] font-mono p-2 rounded bg-slate-950 border border-slate-800/80 text-slate-400">
          <div className="text-slate-400 uppercase tracking-wider text-[9px]">
            Active Environment
          </div>
          <div className="text-slate-300 font-semibold truncate mt-0.5">
            CivicHealth Public Services
          </div>
        </div>

        {/* Live Backend Connection Status */}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="font-mono text-slate-400 text-[10px]">Backend Link</span>

          <div className="flex items-center gap-1.5">
            {backendStatus === "connected" && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
            {backendStatus === "disconnected" && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[10px]" title="FastAPI server offline; running demo mode">
                <XCircle className="h-3 w-3" />
                Demo Mode
              </span>
            )}
            {backendStatus === "checking" && (
              <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Probing...
              </span>
            )}
            <button
              type="button"
              onClick={() => refresh()}
              title="Refresh connection status"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
