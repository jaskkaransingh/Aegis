"use client";

import React, { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBackend } from "@/lib/backend-context";

interface NavItem {
  name: string;
  shortName: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Command Center", shortName: "Command", href: "/command-center", icon: Activity },
  { name: "Investigations", shortName: "Triage", href: "/investigations", icon: Search },
  { name: "Timeline Explorer", shortName: "Timeline", href: "/timeline", icon: Layers },
  { name: "Service Topology", shortName: "Topology", href: "/topology", icon: GitBranch },
  { name: "Evidence Explorer", shortName: "Evidence", href: "/evidence", icon: FileSearch },
  { name: "Hypothesis Arena", shortName: "Hypotheses", href: "/hypotheses", icon: Lightbulb },
  { name: "Counterfactual Lab", shortName: "Lab", href: "/counterfactual", icon: FlaskConical },
  { name: "Investigation Reports", shortName: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { status: backendStatus, refresh } = useBackend();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <aside
      className={`border-r border-white/10 bg-black/45 backdrop-blur-2xl flex flex-col shrink-0 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 select-none ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <Link
          href="/command-center"
          className="flex items-center gap-3 group overflow-hidden"
          title="AEGIS Workstation"
        >
          <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] group-hover:border-white/40 transition-colors shrink-0">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold tracking-wider text-base text-white">
                  AEGIS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/80 border border-white/15">
                  v0.1
                </span>
              </div>
              <p className="text-xs text-white/50 truncate font-mono">
                Incident Intelligence
              </p>
            </div>
          )}
        </Link>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Links with Increased Font Size */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-xs font-mono uppercase tracking-widest text-white/40">
            Workstation
          </div>
        )}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/command-center"
                ? pathname === "/command-center"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5"
                } rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      isActive ? "text-[#22c55e]" : "text-white/50 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {isActive && !collapsed && (
                  <span className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Connectivity Strip with Clearer Typography */}
      <div className="p-3.5 border-t border-white/10 bg-black/60">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} text-xs font-mono`}>
          {!collapsed && <span className="text-white/45">Backend Service</span>}
          <div className="flex items-center gap-2">
            {backendStatus === "connected" && (
              <span className="inline-flex items-center gap-1.5 text-[#22c55e]" title="FastAPI live">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {!collapsed && "Connected"}
              </span>
            )}
            {backendStatus === "disconnected" && (
              <span className="inline-flex items-center gap-1.5 text-[#f59e0b]" title="Demo offline mode">
                <XCircle className="h-3.5 w-3.5" />
                {!collapsed && "Demo Enclave"}
              </span>
            )}
            {backendStatus === "checking" && (
              <span className="inline-flex items-center gap-1.5 text-white/45">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              </span>
            )}
            <button
              type="button"
              onClick={() => refresh()}
              title="Refresh connection"
              className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
