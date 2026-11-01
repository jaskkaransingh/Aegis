"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, FileText, GitBranch, Loader2, Network } from "lucide-react";
import type { InvestigationReport } from "@/types/report";
import { assembleInvestigationReport } from "@/lib/report-adapter";
import { ReportHeader } from "@/components/reports/report-header";
import { ReportToc } from "@/components/reports/report-toc";
import { ReportPreview } from "@/components/reports/report-preview";
import { ReportVisualExecutive } from "@/components/reports/report-visual-executive";

type ReportViewMode = "VISUAL" | "FORMAL";

export function ReportsClient() {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ReportViewMode>("VISUAL");

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assembleInvestigationReport();
      setReport(data);
    } catch (err: any) {
      console.error("Failed to load investigation report:", err);
      setError(err?.message || "Failed to assemble report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="min-h-screen text-[#f8fafc] flex flex-col p-4 md:p-6 space-y-6">
      {/* Report Controls Header */}
      <ReportHeader
        report={report}
        isLoading={isLoading}
        onRefresh={loadReport}
      />

      {/* Main Content Area */}
      {isLoading && !report ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-sm font-mono text-white/60">
            Assembling forensic incident report from telemetry & hypotheses...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 max-w-xl mx-auto space-y-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 font-bold font-mono">
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
            <span>Failed to Generate Report</span>
          </div>
          <p className="text-xs text-red-300">{error}</p>
          <button
            onClick={loadReport}
            className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-xs font-mono font-medium border border-red-500/50 transition-colors"
          >
            Retry Assembly
          </button>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Dual-Mode Navigation Switcher */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode("VISUAL")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  viewMode === "VISUAL"
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Network className="w-4 h-4" />
                <span>01 // VISUAL POST-MORTEM (FLOW & CHARTS)</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded ${viewMode === "VISUAL" ? "bg-black text-white" : "bg-white/10 text-white"}`}>
                  INTERACTIVE
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("FORMAL")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  viewMode === "FORMAL"
                    ? "bg-white text-black shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>02 // FORMAL AUDIT DOCUMENT (10 SECTIONS)</span>
                <span className={`px-1.5 py-0.2 text-[9px] rounded ${viewMode === "FORMAL" ? "bg-black text-white" : "bg-white/10 text-slate-300"}`}>
                  AUDIT / PRINT
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 pr-3 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span>Evidence Grounded • SHA-256 Validated</span>
            </div>
          </div>

          {/* View Mode 1: Visual Executive Briefing with Flowdiagram & Progression Charts */}
          {viewMode === "VISUAL" && (
            <ReportVisualExecutive
              report={report}
              onViewFormalReport={() => setViewMode("FORMAL")}
            />
          )}

          {/* View Mode 2: Formal 10-Section Audit Document Preview */}
          {viewMode === "FORMAL" && (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Sticky Table of Contents (Desktop Only) */}
              <aside className="no-print hidden lg:block lg:col-span-3 xl:col-span-3">
                <ReportToc />
              </aside>

              {/* Full Report Document Preview */}
              <main className="col-span-12 lg:col-span-9 xl:col-span-9 print:col-span-12 w-full">
                <ReportPreview report={report} />
              </main>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
