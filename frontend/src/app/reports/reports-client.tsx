"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { InvestigationReport } from "@/types/report";
import { assembleInvestigationReport } from "@/lib/report-adapter";
import { ReportHeader } from "@/components/reports/report-header";
import { ReportToc } from "@/components/reports/report-toc";
import { ReportPreview } from "@/components/reports/report-preview";

export function ReportsClient() {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 space-y-6">
      {/* Report Controls Header */}
      <ReportHeader
        report={report}
        isLoading={isLoading}
        onRefresh={loadReport}
      />

      {/* Main Content Area */}
      {isLoading && !report ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-sm font-mono text-slate-400">
            Assembling forensic incident report from telemetry & hypotheses...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 max-w-xl mx-auto space-y-3">
          <div className="flex items-center gap-2 font-bold font-mono">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>Failed to Generate Report</span>
          </div>
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={loadReport}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-mono font-medium border border-rose-700 transition-colors"
          >
            Retry Assembly
          </button>
        </div>
      ) : report ? (
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
      ) : null}
    </div>
  );
}

