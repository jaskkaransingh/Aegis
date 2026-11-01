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
    <div className="no-print space-y-3 pb-3 border-b border-white/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              Investigation Report
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                isLive
                  ? "bg-emerald-950/80 border-[#22c55e]/40 text-[#22c55e]"
                  : "bg-amber-950/80 border-[#f59e0b]/40 text-[#f59e0b]"
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="font-mono text-slate-400 text-[11px]">Incident:</span>
            <span className="font-semibold text-slate-200">
              {report?.metadata.incidentId || "INC-2026-0881"}
            </span>
          </div>

          {/* Report Status */}
          {report && (
            <span className="px-2.5 py-1 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 text-[11px] font-mono text-slate-300">
              Status: <strong className="text-slate-100">{report.metadata.status}</strong>
            </span>
          )}

          {/* Print / Save as PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs border border-white shadow-sm transition-colors"
            title="Open browser print preview to Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 text-white font-medium text-xs transition-colors"
            title="Download report as structured JSON"
          >
            <Download className="w-3.5 h-3.5 text-white/50" />
            <span>Export JSON</span>
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 text-white disabled:opacity-50 transition-colors"
            title="Reassemble report from current telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

