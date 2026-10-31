"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { InvestigationReport } from "@/types/report";

interface ReportPreviewProps {
  report: InvestigationReport;
}

export function ReportPreview({ report }: ReportPreviewProps) {
  const isDemo = report.metadata.dataSource === "demo";

  return (
    <article className="report-document space-y-10 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 md:p-10 shadow-xl font-sans text-slate-200">
      {/* Document Header Banner */}
      <div className="border-b border-slate-800/90 pb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-violet-400 font-semibold">
                AEGIS Forensic Investigation Report
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-slate-400">
                Doc ID: {report.metadata.reportId}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-mono">
              {report.section1ExecutiveSummary.incidentTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                isDemo
                  ? "bg-amber-950/60 border-amber-600/60 text-amber-300"
                  : "bg-emerald-950/60 border-emerald-600/60 text-emerald-300"
              }`}
            >
              {isDemo ? "DEMO REPORT (PREVIEW)" : "LIVE FORENSIC REPORT"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
              v{report.metadata.version}
            </span>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
          <div>
            <div className="text-slate-500 font-mono text-[10px] uppercase">Incident ID</div>
            <div className="font-mono font-semibold text-slate-200 mt-0.5">
              {report.metadata.incidentId}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-mono text-[10px] uppercase">Generated At</div>
            <div className="font-mono text-slate-300 mt-0.5">{report.metadata.generatedAt}</div>
          </div>
          <div>
            <div className="text-slate-500 font-mono text-[10px] uppercase">Investigation State</div>
            <div className="font-medium text-slate-200 mt-0.5">
              {report.section1ExecutiveSummary.investigationStatus}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-mono text-[10px] uppercase">Evidence Items</div>
            <div className="font-mono font-semibold text-violet-300 mt-0.5">
              {report.section3EvidenceInventory.length} Verified Records
            </div>
          </div>
        </div>

        {isDemo && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/25 border border-amber-800/50 text-amber-200 text-xs">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> This report is grounded in the AEGIS demonstration dataset.
              All timestamp offsets, lock events, and microservice topologies reflect realistic
              investigation fixtures. When a live cluster investigation completes, this preview
              populates automatically.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXECUTIVE SUMMARY */}
      {/* ========================================================================= */}
      <section id="section-1" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            1. Executive Summary
          </h2>
        </div>

        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-3">
          <p>{report.section1ExecutiveSummary.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-semibold uppercase text-slate-400">
              Observed Impact
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.section1ExecutiveSummary.observedImpact}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-semibold uppercase text-slate-400">
              Epistemic Status
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                {report.section1ExecutiveSummary.investigationStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Identified root cause represents the highest confidence hypothesis under verified clock-corrected evidence.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: INCIDENT OVERVIEW */}
      {/* ========================================================================= */}
      <section id="section-2" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            2. Incident Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500">Incident Identifier</span>
            <div className="font-mono font-bold text-slate-100">{report.section2IncidentOverview.incidentId}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500">Target Environment</span>
            <div className="font-medium text-slate-200">{report.section2IncidentOverview.environment}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500">Initial Detection Time</span>
            <div className="font-mono text-slate-200">{report.section2IncidentOverview.detectionTimestamp}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <span className="text-xs font-mono font-semibold uppercase text-slate-400">Initial Symptoms</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.section2IncidentOverview.initialSymptoms}
          </p>
        </div>

        <div>
          <span className="text-xs font-mono font-semibold uppercase text-slate-400 block mb-2">
            Affected Services ({report.section2IncidentOverview.affectedServices.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {report.section2IncidentOverview.affectedServices.map((svc) => (
              <span
                key={svc}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: EVIDENCE INVENTORY */}
      {/* ========================================================================= */}
      <section id="section-3" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-mono">
              3. Evidence Inventory
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {report.section3EvidenceInventory.length} Total Verified Evidence Records
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Each record below has been ingested, verified, and mapped to canonical telemetry events. Click any event ID to inspect full provenance in the Evidence Explorer.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Evidence ID</th>
                <th className="py-2.5 px-3">Corrected Timestamp</th>
                <th className="py-2.5 px-3">Source Service</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Forensic Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {report.section3EvidenceInventory.map((item) => {
                const isCrit = item.severity.toUpperCase() === "CRITICAL" || item.severity.toUpperCase() === "ERROR";
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Link
                        href={`/evidence?event=${item.id}`}
                        className="inline-flex items-center gap-1 font-bold text-violet-400 hover:text-violet-300 hover:underline"
                        title="Inspect in Evidence Explorer"
                      >
                        <span>{item.id}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 no-print" />
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                      {item.timestamp || "—"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-200">
                      {item.service}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isCrit
                            ? "bg-rose-950/70 border border-rose-800/70 text-rose-300"
                            : "bg-amber-950/70 border border-amber-800/70 text-amber-300"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {item.eventType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans max-w-md truncate">
                      {item.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: TIMELINE OF EVENTS */}
      {/* ========================================================================= */}
      <section id="section-4" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            4. Timeline of Events
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Chronological sequence reconstructed after applying clock drift correction models. Corrected timestamps resolve apparent causality inversions.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Event Ref</th>
                <th className="py-2.5 px-3">Raw Timestamp</th>
                <th className="py-2.5 px-3">Corrected Timestamp</th>
                <th className="py-2.5 px-3">Uncertainty</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Observed Event Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {report.section4Timeline.map((item, idx) => (
                <tr key={item.timelineId || idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Link
                      href={`/timeline?event=${item.eventId}`}
                      className="inline-flex items-center gap-1 font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                    >
                      <span>{item.eventId}</span>
                      <ExternalLink className="w-3 h-3 opacity-60 no-print" />
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 line-through text-[11px]">
                    {item.originalTimestamp.split(" ")[1] || item.originalTimestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-emerald-300 text-[11px]">
                    {item.correctedTimestamp.split(" ")[1] || item.correctedTimestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                    ±{(item.uncertaintySeconds * 1000).toFixed(0)}ms
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-200">
                    {item.service}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans max-w-md">
                    {item.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: SERVICE IMPACT */}
      {/* ========================================================================= */}
      <section id="section-5" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            5. Service Impact Analysis
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Classification of affected infrastructure nodes based on observed telemetry and topology dependency paths.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.section5ServiceImpact.map((svc) => {
            let badgeBg = "bg-emerald-950/50 border-emerald-800/60 text-emerald-300";
            if (svc.impactType === "OBSERVED_OUTAGE") {
              badgeBg = "bg-rose-950/60 border-rose-800/60 text-rose-300";
            } else if (svc.impactType === "DEGRADED_PERFORMANCE") {
              badgeBg = "bg-amber-950/60 border-amber-800/60 text-amber-300";
            }

            return (
              <div
                key={svc.serviceId}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-semibold text-slate-200 text-xs truncate">
                      {svc.serviceName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeBg}`}>
                      {svc.impactType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Node ID: {svc.serviceId}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Linked Evidence ({svc.evidenceIds.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {svc.evidenceIds.length > 0 ? (
                      svc.evidenceIds.map((eid) => (
                        <Link
                          key={eid}
                          href={`/evidence?event=${eid}`}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 font-mono text-[10px] text-violet-300 hover:underline"
                        >
                          {eid}
                        </Link>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">None logged directly</span>
                    )}
                  </div>
                </div>

                {svc.directDependencies.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-500">
                    Calls downstream: {svc.directDependencies.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: HYPOTHESES & ASSESSMENT */}
      {/* ========================================================================= */}
      <section id="section-6" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            6. Hypotheses & Forensic Assessment
          </h2>
        </div>

        <p className="text-xs text-slate-400">
          Explanations evaluated during investigation. Hypotheses are tested against both supporting and contradicting evidence citations.
        </p>

        <div className="space-y-4">
          {report.section6Hypotheses.map((h) => {
            const isLeading = h.status === "LEADING";
            const isDisproven = h.status === "DISPROVEN";

            return (
              <div
                key={h.id}
                className={`p-4 md:p-5 rounded-xl border transition-colors ${
                  isLeading
                    ? "bg-violet-950/20 border-violet-700/60"
                    : isDisproven
                    ? "bg-slate-900/40 border-slate-800/60 opacity-80"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-violet-400">[{h.id}]</span>
                    <h3 className="font-semibold text-sm text-slate-100">{h.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        isLeading
                          ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                          : isDisproven
                          ? "bg-rose-950/60 border-rose-800 text-rose-300"
                          : "bg-amber-950/60 border-amber-800 text-amber-300"
                      }`}
                    >
                      {h.status}
                    </span>
                    {h.confidenceScore !== null && (
                      <span className="font-mono text-xs text-slate-400">
                        Confidence: <strong className="text-slate-200">{(h.confidenceScore * 100).toFixed(0)}%</strong>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                  {h.explanation}
                </p>

                {/* Evidence citations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 block mb-1">
                      Supporting Evidence ({h.supportingEvidenceIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {h.supportingEvidenceIds.map((eid) => (
                        <Link
                          key={eid}
                          href={`/evidence?event=${eid}`}
                          className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-mono text-[10px] hover:underline"
                        >
                          {eid}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-rose-400 block mb-1">
                      Contradicting Evidence ({h.contradictingEvidenceIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {h.contradictingEvidenceIds.length > 0 ? (
                        h.contradictingEvidenceIds.map((eid) => (
                          <Link
                            key={eid}
                            href={`/evidence?event=${eid}`}
                            className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-[10px] hover:underline"
                          >
                            {eid}
                          </Link>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No direct contradictions identified</span>
                      )}
                    </div>
                  </div>
                </div>

                {h.unresolvedQuestions.length > 0 && (
                  <div className="mt-3 pt-2 text-[11px] text-slate-400 font-sans">
                    <span className="font-mono text-[10px] uppercase text-slate-500 block mb-0.5">
                      Open Questions:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {h.unresolvedQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: ROOT-CAUSE ASSESSMENT */}
      {/* ========================================================================= */}
      <section id="section-7" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            7. Root-Cause Assessment
          </h2>
        </div>

        <div className="p-5 rounded-xl border border-violet-700/50 bg-violet-950/20 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400 font-semibold block">
                Primary Root Cause Classification
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950/80 border border-amber-600 text-amber-300">
                  {report.section7RootCause.classification}
                </span>
                <span className="text-xs text-slate-400">
                  Ref: <strong className="font-mono text-slate-200">[{report.section7RootCause.leadingHypothesisId}]</strong>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] text-slate-400">Epistemic Level</span>
              <div className="text-xs font-semibold text-slate-200">High Confidence Hypothesis</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              {report.section7RootCause.leadingHypothesisTitle}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.section7RootCause.rationale}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-400 block">
              Contributing Cascade Factors:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
              {report.section7RootCause.contributingFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Epistemic Integrity Notice</span>
            </div>
            <p>{report.section7RootCause.epistemicNotice}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: COUNTERFACTUAL ANALYSIS */}
      {/* ========================================================================= */}
      <section id="section-8" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            8. Counterfactual Analysis
          </h2>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-300 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Simulation Engine Status: Offline</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {report.section8Counterfactual.statusMessage} Scenarios listed represent investigator-formulated interventions proposed for subsequent validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {report.section8Counterfactual.scenarios.map((sc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] uppercase text-violet-400 font-semibold block">
                  Scenario #{idx + 1}
                </span>
                <h4 className="font-semibold text-xs text-slate-200 mt-0.5">{sc.name}</h4>
                <div className="mt-1 text-[11px] text-slate-400">
                  Target: <strong className="text-slate-300 font-mono">{sc.target}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                <span className="font-mono text-[10px] text-slate-500 uppercase block">Hypothetical Intervention:</span>
                <p className="text-slate-300">{sc.action}</p>
                <span className="font-mono text-[10px] text-slate-500 uppercase block mt-1">Assumptions:</span>
                <p className="text-slate-400 italic">{sc.assumptions}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: UNCERTAINTY & LIMITATIONS */}
      {/* ========================================================================= */}
      <section id="section-9" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            9. Uncertainty & Forensic Limitations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase text-amber-400 block">
              Telemetry & Instrumentation Gaps
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
              {report.section9Limitations.telemetryGaps.map((gap, idx) => (
                <li key={idx}>{gap}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase text-violet-400 block">
              Unresolved Analytical Areas
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
              {report.section9Limitations.unresolvedAreas.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
          <strong className="text-slate-300">Simulation Status: </strong>
          {report.section9Limitations.simulationStatus}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: RECOMMENDED NEXT STEPS */}
      {/* ========================================================================= */}
      <section id="section-10" className="report-section scroll-mt-20 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <div className="p-1 rounded bg-violet-950/80 border border-violet-700/60 text-violet-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-slate-100 font-mono">
            10. Recommended Next Steps
          </h2>
        </div>

        <div className="space-y-3">
          {report.section10NextSteps.recommendations.map((rec, idx) => {
            const isHigh = rec.priority === "HIGH";
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase text-violet-400 font-semibold">
                      {rec.category}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                        isHigh
                          ? "bg-rose-950/60 border border-rose-800 text-rose-300"
                          : "bg-blue-950/60 border border-blue-800 text-blue-300"
                      }`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100">{rec.action}</h4>
                  <p className="text-slate-400 text-[11px]">{rec.rationale}</p>
                </div>

                <div className="no-print self-end md:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                    <span>Task Planned</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Document Footer */}
      <footer className="border-t border-slate-800/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div>
          AEGIS Autonomous Evidence-Grounded Investigation System • Confidential Incident Post-Mortem
        </div>
        <div>
          Generated from verified telemetry • Integrity Check: SHA-256 Passed
        </div>
      </footer>
    </article>
  );
}

