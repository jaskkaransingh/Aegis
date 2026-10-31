"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCode,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  Server,
  Shield,
  X,
  Zap,
} from "lucide-react";
import type { EvidenceRecord } from "@/types/evidence";
import { formatEvidenceTimestamp } from "@/lib/evidence-adapter";

interface EvidenceDetailsPanelProps {
  record: EvidenceRecord | null;
  onClose: () => void;
}

export function EvidenceDetailsPanel({ record, onClose }: EvidenceDetailsPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isMessageExpanded, setIsMessageExpanded] = useState<boolean>(false);

  if (!record) {
    return (
      <div className="w-full lg:w-96 shrink-0 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-slate-500" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Evidence Record Selected</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Select any row from the evidence table to perform deep forensic inspection and trace timing provenance.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const rawJsonString = JSON.stringify(
    {
      canonical_id: record.id,
      raw_id: record.raw_id,
      incident_id: record.incident_id,
      service: record.service,
      source: record.source,
      severity: record.severity,
      event_type: record.event_type,
      message: record.message,
      trace_id: record.trace_id,
      original_timestamp: record.original_timestamp,
      corrected_datetime: record.corrected_datetime,
      clock_correction_applied: record.clock_correction_applied,
      offset_applied_seconds: record.offset_applied_seconds,
      uncertainty_seconds: record.uncertainty_seconds,
      metadata: record.metadata,
      data_quality_warnings: record.data_quality_warnings,
    },
    null,
    2
  );

  return (
    <div className="w-full lg:w-96 shrink-0 flex flex-col rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden text-xs text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200 max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-100 flex items-center gap-1.5">
              {record.id}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(record.id, "id")}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy Canonical ID"
            >
              {copiedField === "id" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                record.severity === "CRITICAL"
                  ? "bg-rose-950/70 border-rose-600 text-rose-300"
                  : record.severity === "ERROR"
                  ? "bg-rose-950/50 border-rose-500 text-rose-300"
                  : record.severity === "WARN" || record.severity === "WARNING"
                  ? "bg-amber-950/60 border-amber-600 text-amber-300"
                  : "bg-blue-950/60 border-blue-600 text-blue-300"
              }`}
            >
              {record.severity}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Service: <strong className="text-slate-200 font-sans">{record.service}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Close details panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Forensic Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Timestamp Analysis Section */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              Timestamp Analysis
            </span>
            {record.clock_correction_applied && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                Drift: -{record.offset_applied_seconds}s
              </span>
            )}
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            {/* Corrected UTC Timestamp */}
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">
                Corrected Reference Time (UTC)
              </span>
              <span className="text-slate-200 font-medium">
                {formatEvidenceTimestamp(record.corrected_datetime)}
              </span>
            </div>

            {/* Original Recorded Timestamp */}
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-sans">
                Original Recorded Time (Source Clock)
              </span>
              <span className="text-slate-400">
                {formatEvidenceTimestamp(record.original_timestamp)}
              </span>
            </div>

            {/* Uncertainty Interval */}
            <div className="pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Timing Uncertainty Bounds:</span>
                <span className="text-slate-200 font-mono">
                  ±{(record.uncertainty_seconds * 1000).toFixed(0)} ms
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                [{formatEvidenceTimestamp(record.time_interval_start)} → {formatEvidenceTimestamp(record.time_interval_end)}]
              </div>
            </div>
          </div>
        </div>

        {/* Complete Event Message */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Complete Event Message
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(record.message, "msg")}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copiedField === "msg" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
            {record.message}
          </div>
        </div>

        {/* Distributed Trace & Identification */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Identification & Provenance
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Source Identifier</span>
              <strong className="text-slate-300 font-mono text-[10px]">{record.source}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Category</span>
              <strong className="text-slate-300 font-mono text-[10px]">{record.event_type}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Data Source</span>
              <strong className={record.dataSource === "live" ? "text-emerald-400" : "text-amber-400"}>
                {record.dataSource === "live" ? "Live Backend" : "Demo Fixture"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Incident Correlation</span>
              <strong className="text-slate-300 font-mono text-[10px]">
                {record.incident_id || "Uncorrelated"}
              </strong>
            </div>
          </div>

          {/* Trace ID */}
          {record.trace_id && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[10px]">Trace ID</span>
                <span className="font-mono text-cyan-400 text-[11px]">{record.trace_id}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(record.trace_id!, "trace")}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
                title="Copy Trace ID"
              >
                {copiedField === "trace" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Data Quality Warnings */}
        {record.data_quality_warnings.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Data Quality Warnings ({record.data_quality_warnings.length})</span>
            </div>
            <div className="space-y-1.5">
              {record.data_quality_warnings.map((w, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950/80 border border-amber-900/40 text-[11px]">
                  <div className="flex items-center justify-between font-mono text-[10px] text-amber-400 mb-0.5">
                    <span>{w.code}</span>
                    <span className="uppercase">{w.severity}</span>
                  </div>
                  <p className="text-slate-300">{w.message}</p>
                  <p className="text-slate-500 text-[10px] mt-1">Action: {w.action_taken}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Metadata & Payload Viewer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Raw Metadata & Forensic Payload
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(rawJsonString, "json")}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copiedField === "json" ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
            {rawJsonString}
          </pre>
        </div>

        {/* Epistemic Note */}
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
          <HelpCircle className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <span>
            <strong>Forensic Immutability:</strong> Original log records and timestamps are preserved in strict chronological sequence. AEGIS does not infer causality from temporal proximity alone.
          </span>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2">
        <Link
          href={`/timeline?service=${encodeURIComponent(record.service)}&event=${encodeURIComponent(record.id)}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition-colors shadow-md shadow-violet-600/20"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Inspect in Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

