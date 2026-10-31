import React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ShieldAlert, Database, Radio } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface InvestigationHeaderProps {
  incidentId: string;
  incidentTitle: string;
  severity: string;
  status: string;
  environment: string;
  isBackendConnected: boolean;
  isDemoData: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function InvestigationHeader({
  incidentId,
  incidentTitle,
  severity,
  status,
  environment,
  isBackendConnected,
  isDemoData,
  onRefresh,
  isRefreshing = false,
}: InvestigationHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
        <Link
          href="/"
          className="hover:text-slate-200 transition flex items-center gap-1 text-slate-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Command Center</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <Link href="/investigations" className="hover:text-slate-200 transition">
          Investigations
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-200 font-semibold">{incidentId}</span>
      </nav>

      {/* Main Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/60">
                {incidentId}
              </span>
              <StatusBadge label={severity} variant="critical" />
              <StatusBadge label={status.replace(/_/g, " ")} variant="violet" />

              {/* Data Source Badge */}
              {isDemoData ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  DEMO DATA (SYNTHETIC FIXTURE)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  VERIFIED BACKEND API
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                {incidentTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Target Environment:</span>
                <span className="font-mono text-slate-200 font-medium">{environment}</span>
              </p>
            </div>
          </div>

          {/* Quick Connection Info & Actions */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white transition disabled:opacity-50"
              >
                {isRefreshing ? "Refreshing..." : "Probe Backend"}
              </button>
            )}
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
            >
              <span>Back to Command Center</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

