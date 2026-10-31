"use client";

import React from "react";
import {
  Download,
  FileCheck2,
  FileText,
  Printer,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import type { InvestigationReport } from "@/types/report";
import { exportReportAsJson } from "@/lib/report-adapter";

interface ReportHeaderProps {
  report: InvestigationReport | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ReportHeader({ report, isLoading, onRefresh }: ReportHeaderProps) {
  const isLive = report?.metadata.dataSource === "live";

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (report) {
      exportReportAsJson(report);
    }
  };

  return (
    <div className="no-print space-y-3 pb-3 border-b border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-950/70 border border-violet-700/50 text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight font-mono">
              Investigation Report
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                isLive
                  ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                  : "bg-amber-950/60 border-amber-700/60 text-amber-300"
              }`}
            >
              {isLive ? "LIVE DATA" : "DEMO DATA"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Structured forensic post-mortem document with complete evidence traceability and epistemic integrity.
          </p>
        </div>

        {/* Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Incident Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-slate-400 text-[11px]">Incident:</span>
            <span className="font-semibold text-slate-200">
              {report?.metadata.incidentId || "INC-2026-0881"}
            </span>
          </div>

          {/* Report Status */}
          {report && (
            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              Status: <strong className="text-slate-100">{report.metadata.status}</strong>
            </span>
          )}

          {/* Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-600/20 transition-colors"
            title="Open browser print preview to Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
            title="Download report as structured JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
            title="Reassemble report from current telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

