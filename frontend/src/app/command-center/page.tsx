"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Activity,
  Layers,
  Search,
  Server,
  AlertTriangle,
  Clock,
  CheckCircle2,
  GitBranch,
  Shield,
  Terminal,
  Cpu,
  Database,
  ExternalLink,
} from "lucide-react";
import { PRIMARY_DEMO_INCIDENT, DEMO_ACTIVITY_FEED } from "@/lib/demo-data";
import { InfrastructureObservatory } from "@/components/dashboard/infrastructure-observatory";
import { NewInvestigationModal } from "@/components/dashboard/new-investigation-modal";
import { AegisButton } from "@/components/ui/aegis-button";
import { AegisBadge } from "@/components/ui/aegis-badge";
import { AegisSurface } from "@/components/ui/aegis-surface";

export default function CommandCenterPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SECTION 1 — HIGH-SIGNAL WORKSTATION HEADER
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              COMMAND CENTER
            </h1>
            <AegisBadge variant="danger" dot pulse size="sm">
              SEV-1 ACTIVE TRIAGE
            </AegisBadge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-white/40" />
              <span>Cluster: civic-prod-east</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-white/40" />
              <span>7 Nodes Monitored</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#22c55e]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Clock Synced (±0.00ms)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/investigations">
            <AegisButton variant="secondary" size="md">
              Directory
            </AegisButton>
          </Link>
          <AegisButton
            variant="primary"
            size="md"
            onClick={() => setModalOpen(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Investigation
          </AegisButton>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 — TACTICAL INCIDENT SPOTLIGHT BAR
          Spacious, high-legibility telemetry overview for SRE / AI Engineers
          ========================================================================= */}
      <div className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-[#07090f]/90 to-[#07090f]/95 p-5 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-red-900/60 text-[#ef4444] border border-red-500/50 text-xs font-mono font-bold tracking-wider">
              SEV-1 INCIDENT
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
              {PRIMARY_DEMO_INCIDENT.title}
            </span>
          </div>

          {/* Scannable Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 space-y-0.5">
              <div className="text-[10px] uppercase text-white/40 font-bold">Identified Root Anomaly</div>
              <div className="text-white font-semibold truncate">DB Connection Pool Limit (100/100)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 space-y-0.5">
              <div className="text-[10px] uppercase text-white/40 font-bold">Propagation Impact</div>
              <div className="text-[#f59e0b] font-semibold truncate">3 Tiers Cascaded (504 Timeout)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 space-y-0.5">
              <div className="text-[10px] uppercase text-white/40 font-bold">Incident Timeline</div>
              <div className="text-white/80 font-semibold truncate">Reported: {PRIMARY_DEMO_INCIDENT.initialReportedTime}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/investigations/${PRIMARY_DEMO_INCIDENT.investigationId}`}>
            <AegisButton
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              className="shadow-[0_0_20px_rgba(255,255,255,0.3)] font-bold text-sm px-6 py-3"
            >
              Enter Forensic Workspace
            </AegisButton>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3 — VISUAL CENTERPIECE: 3D INFRASTRUCTURE OBSERVATORY
          Interactive 3D WebGL Mesh with Rotating Perspective & Telemetry HUD
          ========================================================================= */}
      <InfrastructureObservatory />

      {/* =========================================================================
          SECTION 4 — 4 HIGH-CONTRAST TELEMETRY INVARIANT CARDS
          Bold numbers, clear labels, zero microscopic paragraphs
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incident State */}
        <AegisSurface elevation="card" border="default" className="p-4.5 space-y-2 bg-[#07090f]/90 border-white/15">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span className="font-bold uppercase tracking-wider">Incident Severity</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#ef4444]">SEV-1 ACTIVE</div>
          <div className="text-xs font-mono text-white/70">
            4 Spans Correlated // 3 Tiers Blocked
          </div>
        </AegisSurface>

        {/* Card 2: Cluster Health Percentage */}
        <AegisSurface elevation="card" border="default" className="p-4.5 space-y-2 bg-[#07090f]/90 border-white/15">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span className="font-bold uppercase tracking-wider">Cluster Health</span>
            <span className="text-xs text-[#22c55e] font-bold">6/7 UP</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">85.7% NOMINAL</div>
          {/* 7-Segment Visual Status Bar */}
          <div className="flex items-center gap-1 pt-1">
            <span className="h-2 flex-1 rounded-sm bg-[#22c55e]" title="api-gateway" />
            <span className="h-2 flex-1 rounded-sm bg-[#22c55e]" title="appointment-service" />
            <span className="h-2 flex-1 rounded-sm bg-[#22c55e]" title="hospital-records" />
            <span className="h-2 flex-1 rounded-sm bg-[#f59e0b]" title="payment-service" />
            <span className="h-2 flex-1 rounded-sm bg-[#ef4444] animate-pulse" title="postgres-db (Critical)" />
            <span className="h-2 flex-1 rounded-sm bg-[#22c55e]" title="redis-cache" />
            <span className="h-2 flex-1 rounded-sm bg-[#f59e0b]" title="notification-worker" />
          </div>
        </AegisSurface>

        {/* Card 3: Clock Synchronization */}
        <AegisSurface elevation="card" border="default" className="p-4.5 space-y-2 bg-[#07090f]/90 border-white/15">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span className="font-bold uppercase tracking-wider">Clock Calibration</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#22c55e]">±0.00ms SYNCED</div>
          <div className="text-xs font-mono text-white/70">
            Synthetic drift calibrated across all nodes
          </div>
        </AegisSurface>

        {/* Card 4: AI Hypothesis Engine */}
        <AegisSurface elevation="card" border="default" className="p-4.5 space-y-2 bg-[#07090f]/90 border-white/15">
          <div className="flex items-center justify-between text-xs font-mono text-white/50">
            <span className="font-bold uppercase tracking-wider">Hypothesis Engine</span>
            <span className="text-xs text-white font-bold">86% CONFIDENCE</span>
          </div>
          <div className="text-xl font-bold font-mono text-white truncate">
            POOL EXHAUSTION
          </div>
          <div className="text-xs font-mono text-white/70">
            Supported by 4 spans // 0 contradictions
          </div>
        </AegisSurface>
      </div>

      {/* =========================================================================
          SECTION 5 — REAL-TIME FORENSIC SIGNAL STREAM (TERMINAL TABLE)
          Scannable, clean, engineered telemetry logs with instant readability
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-white/60" />
            <span className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              LIVE FORENSIC SIGNAL STREAM ({DEMO_ACTIVITY_FEED.length} TELEMETRY RECORDS)
            </span>
          </div>
          <Link
            href="/timeline"
            className="text-xs font-mono text-white/80 hover:text-white hover:underline flex items-center gap-1.5"
          >
            <span>Open Complete Chronology</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <AegisSurface elevation="raised" border="default" className="overflow-hidden bg-[#07090f]/95 border-white/15">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-white/50 text-[11px] uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4 w-32">UTC Timestamp</th>
                  <th className="py-3 px-4 w-40">Service Node</th>
                  <th className="py-3 px-4">Telemetry Signal Log</th>
                  <th className="py-3 px-4 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEMO_ACTIVITY_FEED.map((activity) => {
                  const isCritical = activity.severity === "critical";
                  const isWarning = activity.severity === "warning";

                  return (
                    <tr
                      key={activity.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Status Column */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? "bg-red-950/80 text-[#ef4444] border border-red-500/40"
                              : isWarning
                              ? "bg-amber-950/80 text-[#f59e0b] border border-amber-500/40"
                              : "bg-emerald-950/80 text-[#22c55e] border border-emerald-500/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isCritical
                                ? "bg-[#ef4444] animate-pulse"
                                : isWarning
                                ? "bg-[#f59e0b]"
                                : "bg-[#22c55e]"
                            }`}
                          />
                          {activity.severity.toUpperCase()}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-white/60">
                        {activity.timestamp}
                      </td>

                      {/* Service Origin */}
                      <td className="py-3 px-4 font-bold text-white">
                        {activity.service || "system-kernel"}
                      </td>

                      {/* Signal Log & Title */}
                      <td className="py-3 px-4 text-white/90">
                        <span className="font-semibold text-white mr-2">
                          {activity.title}:
                        </span>
                        <span className="text-white/70">
                          {activity.description}
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/timeline?event=${activity.id}`}
                          className="text-white/50 group-hover:text-white inline-flex items-center gap-1 text-[11px] hover:underline"
                        >
                          <span>Track</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AegisSurface>
      </div>

      {/* NEW INVESTIGATION MODAL */}
      <NewInvestigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
