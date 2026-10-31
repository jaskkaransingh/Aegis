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
  Sparkles,
} from "lucide-react";
import { DEMO_METRICS } from "@/lib/demo-data";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CriticalIncidentPanel } from "@/components/dashboard/critical-incident-panel";
import { AffectedServicesList } from "@/components/dashboard/affected-services-list";
import { RecentInvestigationsTable } from "@/components/dashboard/recent-investigations-table";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { NewInvestigationModal } from "@/components/dashboard/new-investigation-modal";

export default function CommandCenterPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  function getMetricIcon(id: string) {
    switch (id) {
      case "active-incidents":
        return Activity;
      case "investigations":
        return Search;
      case "monitored-services":
        return Server;
      case "evidence-events":
      default:
        return Layers;
    }
  }

  function getMetricAccent(id: string): "rose" | "violet" | "cyan" | "amber" {
    switch (id) {
      case "active-incidents":
        return "rose";
      case "investigations":
        return "violet";
      case "monitored-services":
        return "cyan";
      case "evidence-events":
      default:
        return "amber";
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SECTION A — PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono">
              Command Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-950/80 text-violet-300 border border-violet-800/50">
              Active Triage
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor critical incidents, inspect affected services, and launch evidence-grounded investigations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <Link
            href="/investigations"
            className="px-3.5 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition"
          >
            View Investigations
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition shadow-sm shadow-violet-950/60"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* SECTION B — SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_METRICS.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            sourceLabel={metric.sourceLabel}
            description={metric.description}
            icon={getMetricIcon(metric.id)}
            accentColor={getMetricAccent(metric.id)}
          />
        ))}
      </div>

      {/* SECTION C — CRITICAL INCIDENT */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Active Priority Incident
          </span>
          <span className="text-[10px] font-mono text-rose-400">
            SEV-1 Critical Escalation
          </span>
        </div>
        <CriticalIncidentPanel />
      </div>

      {/* TWO-COLUMN LAYOUT: SERVICES & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION D — AFFECTED SERVICES (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-2">
          <AffectedServicesList />
        </div>

        {/* SECTION F — RECENT ACTIVITY (1 Column wide) */}
        <div className="space-y-2">
          <RecentActivityFeed />
        </div>
      </div>

      {/* SECTION E — RECENT INVESTIGATIONS */}
      <div className="space-y-2 pt-2">
        <RecentInvestigationsTable showHeaderLink={true} />
      </div>

      {/* New Investigation Modal Dialog */}
      <NewInvestigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
