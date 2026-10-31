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
      {/* SECTION A — WORKSTATION HEADER & PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Command Center
            </h1>
            <AegisBadge variant="danger" dot pulse size="sm">
              ACTIVE SEV-1 TRIAGE
            </AegisBadge>
          </div>
          <p className="text-xs text-white/60 mt-1 max-w-xl font-sans">
            Forensic infrastructure surveillance, live anomaly telemetry, and incident correlation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/investigations">
            <AegisButton variant="secondary" size="sm">
              Directory
            </AegisButton>
          </Link>
          <AegisButton
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            New Investigation
          </AegisButton>
        </div>
      </div>

      {/* SECTION B — CRITICAL INCIDENT COMPACT SPOTLIGHT BANNER */}
      <div className="rounded-xl border border-[#f27886]/40 bg-gradient-to-r from-[#33151a]/60 via-[#101522] to-[#0b0e17] p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <AegisBadge variant="danger" size="xs">
              INC-001 // CRITICAL
            </AegisBadge>
            <span className="text-xs font-mono font-semibold text-white">
              {PRIMARY_DEMO_INCIDENT.title}
            </span>
            <span className="text-[11px] font-mono text-white/50">
              • {PRIMARY_DEMO_INCIDENT.environment}
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed font-sans">
            {PRIMARY_DEMO_INCIDENT.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-white/60 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-[#f2c66d]" />
              Reported: {PRIMARY_DEMO_INCIDENT.initialReportedTime}
            </span>
            <span className="flex items-center gap-1.5 text-[#7adcf5]">
              <Layers className="h-3 w-3" />
              {PRIMARY_DEMO_INCIDENT.evidenceCount} Correlated Evidence Spans
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <Link href={`/investigations/${PRIMARY_DEMO_INCIDENT.investigationId}`}>
            <AegisButton
              variant="primary"
              size="md"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              className="shadow-[0_0_20px_rgba(152,117,255,0.4)]"
            >
              Open Workspace
            </AegisButton>
          </Link>
        </div>
      </div>

      {/* SECTION C — PRIMARY VISUAL CENTERPIECE: INFRASTRUCTURE OBSERVATORY */}
      <InfrastructureObservatory />

      {/* SECTION D — SPLIT GRID: RESTRAINED METRICS & CHRONOLOGICAL SIGNAL STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 3 High-Signal Metrics */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40 pb-1">
            Telemetry Invariants
          </div>

          <AegisSurface elevation="card" border="default" className="p-4 space-y-1 bg-[#0b0e17]/90 border-white/10">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>ACTIVE INCIDENTS</span>
              <span className="h-2 w-2 rounded-full bg-[#f27886] animate-pulse" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">1 Critical</div>
            <p className="text-[11px] text-white/60">
              Downstream failure cascade active across 3 tiers.
            </p>
          </AegisSurface>

          <AegisSurface elevation="card" border="default" className="p-4 space-y-1 bg-[#0b0e17]/90 border-white/10">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>CLOCK SYNCHRONIZATION</span>
              <span className="h-2 w-2 rounded-full bg-[#76d6a4]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#76d6a4]">0.00s Calibrated</div>
            <p className="text-[11px] text-white/60">
              Synthetic drift corrected across all 7 monitored nodes.
            </p>
          </AegisSurface>

          <AegisSurface elevation="card" border="default" className="p-4 space-y-1 bg-[#0b0e17]/90 border-white/10">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
              <span>INVESTIGATION REASONING</span>
              <span className="h-2 w-2 rounded-full bg-[#b29aff]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#b29aff]">3 Hypotheses</div>
            <p className="text-[11px] text-white/60">
              Database connection starvation evaluated at 86% confidence.
            </p>
          </AegisSurface>
        </div>

        {/* Right Column (2 spans): Compact Forensic Signal Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40">
              Forensic Signal Stream
            </span>
            <Link
              href="/timeline"
              className="text-[11px] font-mono text-[#7adcf5] hover:underline flex items-center gap-1"
            >
              <span>View Full Timeline</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <AegisSurface elevation="raised" border="default" className="p-4 space-y-2.5 bg-[#0b0e17]/90 border-white/10">
            {DEMO_ACTIVITY_FEED.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 transition-colors group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      activity.severity === "critical"
                        ? "bg-[#f27886] shadow-[0_0_8px_#f27886]"
                        : activity.severity === "warning"
                        ? "bg-[#f2c66d]"
                        : "bg-[#7adcf5]"
                    }`}
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-mono font-medium text-white group-hover:text-[#7adcf5] transition-colors truncate">
                      {activity.title}
                    </div>
                    <div className="text-[11px] text-white/60 font-sans line-clamp-1">
                      {activity.description}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-white/40 shrink-0 text-right">
                  <div>{activity.timestamp}</div>
                  {activity.service && (
                    <div className="text-[#b29aff] truncate max-w-[120px]">
                      {activity.service}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </AegisSurface>
        </div>
      </div>

      {/* NEW INVESTIGATION MODAL */}
      <NewInvestigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
