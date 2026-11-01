"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Layers,
  GitBranch,
  Lightbulb,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Server,
  ArrowRight,
  Shield,
  Activity,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useBackend } from "@/lib/backend-context";
import {
  PRIMARY_DEMO_INCIDENT,
  DEMO_INVESTIGATION_PREVIEW,
  DEMO_NORMALIZED_EVENTS,
} from "@/lib/demo-data";
import type { InvestigationResult, LogsResponse, NormalizedEvent } from "@/types";
import { AegisButton } from "@/components/ui/aegis-button";
import { AegisBadge } from "@/components/ui/aegis-badge";
import { AegisSurface } from "@/components/ui/aegis-surface";

interface WorkspaceClientProps {
  id: string;
}

export function InvestigationWorkspaceClient({ id }: WorkspaceClientProps) {
  const rawId = (id || "INV-001").toUpperCase();
  const { status: backendStatus } = useBackend();

  const [investigationData, setInvestigationData] = useState<InvestigationResult | null>(null);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>("EV-1042");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [preview, logs] = await Promise.all([
        apiClient.getInvestigationPreview(),
        apiClient.getNormalizedLogs(),
      ]);
      setInvestigationData(preview);
      setEvents(logs || []);
      setIsDemoFallback(false);
    } catch {
      setInvestigationData(DEMO_INVESTIGATION_PREVIEW);
      setEvents(DEMO_NORMALIZED_EVENTS);
      setIsDemoFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, backendStatus]);

  const incident = PRIMARY_DEMO_INCIDENT;
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Filter events when a service is selected
  const displayEvents = selectedService
    ? events.filter((e) => e.service === selectedService)
    : events;

  return (
    <div className="space-y-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/investigations"
              className="text-xs font-mono text-white/50 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Investigations Directory</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-xs font-mono text-[#b29aff] font-bold">{rawId}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              {incident.title}
            </h1>
            <AegisBadge variant="danger" size="xs" dot pulse>
              {incident.severity}
            </AegisBadge>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
              {incident.status}
            </span>
          </div>
        </div>

        {/* Quick Nav Action Shortcuts */}
        <div className="flex items-center gap-2">
          <Link href="/timeline">
            <AegisButton variant="secondary" size="xs" icon={<Layers className="h-3 w-3" />}>
              Timeline
            </AegisButton>
          </Link>
          <Link href="/topology">
            <AegisButton variant="secondary" size="xs" icon={<GitBranch className="h-3 w-3" />}>
              Topology
            </AegisButton>
          </Link>
          <Link href="/hypotheses">
            <AegisButton variant="secondary" size="xs" icon={<Lightbulb className="h-3 w-3" />}>
              Hypotheses
            </AegisButton>
          </Link>
          <Link href="/reports">
            <AegisButton variant="primary" size="xs" icon={<FileText className="h-3 w-3" />}>
              Report
            </AegisButton>
          </Link>
        </div>
      </div>

      {/* LAYER A — INCIDENT OVERVIEW & INTERACTIVE SERVICE MAP */}
      <div className="rounded-xl border border-white/10 bg-[#07090f]/90 backdrop-blur-md p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              LAYER A // INCIDENT INFRASTRUCTURE MAP
            </div>
            <p className="text-xs text-white/80 mt-0.5 max-w-2xl font-sans">
              {incident.description}
            </p>
          </div>
          {selectedService && (
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="text-[11px] font-mono text-[#7adcf5] hover:underline self-start md:self-center"
            >
              Reset Service Filter [All Events]
            </button>
          )}
        </div>

        {/* Interactive Affected Services Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-mono text-white/40">Affected Nodes:</span>
          {incident.affectedServices.map((serviceId) => {
            const isSelected = selectedService === serviceId;
            const isServiceActiveInSelectedEvent = selectedEvent?.service === serviceId;

            return (
              <button
                key={serviceId}
                type="button"
                onClick={() => setSelectedService(isSelected ? null : serviceId)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-white text-black border-white font-semibold shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                    : isServiceActiveInSelectedEvent
                    ? "bg-white/15 border-white/40 text-white font-medium"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    serviceId.includes("database")
                      ? "bg-[#ef4444]"
                      : serviceId.includes("appointment") || serviceId.includes("gateway")
                      ? "bg-[#f59e0b]"
                      : "bg-[#22c55e]"
                  }`}
                />
                <span>{serviceId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LAYER B — EVIDENCE PROGRESSION & DETAIL DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Event Progression List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-white/40">
              LAYER B // EVIDENCE PROGRESSION ({displayEvents.length} RECORDS)
            </span>
            <span className="text-[10px] font-mono text-[#22c55e]">
              CLOCK DRIFT CALIBRATED
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {displayEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isCritical = evt.severity === "CRITICAL" || evt.severity === "ERROR";

              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    setSelectedService(evt.service);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/15 border-white/50 shadow-lg scale-[1.01]"
                      : "bg-[#0b0e17]/80 border-white/5 hover:border-white/20 hover:bg-[#101522]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isCritical ? "bg-[#ef4444] animate-pulse" : "bg-[#f59e0b]"
                        }`}
                      />
                      <span className="font-bold text-white">{evt.id}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white/80">{evt.service}</span>
                    </div>

                    <span className="text-[10px] text-white/40 font-mono">
                      {evt.corrected_datetime?.slice(11, 19) || evt.original_timestamp?.slice(11, 19)}
                    </span>
                  </div>

                  <p className="text-xs text-white/80 font-mono mt-1.5 truncate">
                    {evt.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Selected Evidence Inspector Panel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-white/40 pb-1">
            EVIDENCE RECORD INSPECTOR
          </div>

          {selectedEvent ? (
            <AegisSurface elevation="card" border="accent" className="p-5 space-y-4 bg-[#0b0e17]/95 border-white/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-sm font-bold text-white">{selectedEvent.id}</span>
                  <AegisBadge
                    variant={selectedEvent.severity === "CRITICAL" ? "danger" : "warning"}
                    size="xs"
                  >
                    {selectedEvent.severity}
                  </AegisBadge>
                </div>
                <span className="text-[10px] font-mono text-white/40">PROVENANCE ANCHOR</span>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/40">Raw Signal Log</span>
                <p className="text-xs font-mono text-white/90 p-3 rounded bg-black/60 border border-white/10 leading-relaxed break-words">
                  {selectedEvent.message}
                </p>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-0.5">
                  <div className="text-[9px] uppercase text-white/40">Service Origin</div>
                  <div className="text-white font-semibold truncate">{selectedEvent.service}</div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-0.5">
                  <div className="text-[9px] uppercase text-white/40">Corrected UTC Time</div>
                  <div className="text-white font-semibold truncate">
                    {selectedEvent.corrected_datetime?.slice(11, 23) || "14:22:04.120"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-0.5">
                  <div className="text-[9px] uppercase text-white/40">Skew Offset</div>
                  <div className="text-[#22c55e] font-semibold">
                    {selectedEvent.uncertainty_seconds ? `±${selectedEvent.uncertainty_seconds}s` : "0.00ms"}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-white/5 space-y-0.5">
                  <div className="text-[9px] uppercase text-white/40">Trace Correlated</div>
                  <div className="text-white/80 font-semibold truncate">
                    {selectedEvent.trace_id ? selectedEvent.trace_id.slice(0, 12) + "..." : "trace-auth-421"}
                  </div>
                </div>
              </div>

              {/* Cross-Link Action */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <Link
                  href={`/evidence?id=${selectedEvent.id}`}
                  className="text-white/80 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>Inspect in Evidence Vault</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href={`/timeline?event=${selectedEvent.id}`}
                  className="text-white/60 hover:text-white flex items-center gap-1"
                >
                  <span>Track in Timeline</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </AegisSurface>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-white/40 rounded-xl border border-white/10">
              Select an event to view full forensic telemetry.
            </div>
          )}
        </div>
      </div>

      {/* LAYER C — EPISTEMIC ASSESSMENT MATRIX */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono uppercase tracking-widest text-white/40">
          LAYER C // EPISTEMIC INVESTIGATION VERDICT MATRIX
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Observed Facts */}
          <AegisSurface elevation="card" border="default" className="p-4 space-y-2 bg-[#0b0e17]/90 border-emerald-500/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#22c55e]">[OBSERVED FACTS]</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              PostgreSQL connection pool reached 100/100 limit. 20 worker threads held by unindexed schema migration query.
            </p>
          </AegisSurface>

          {/* 2. Supported Inferences */}
          <AegisSurface elevation="card" border="default" className="p-4 space-y-2 bg-[#0b0e17]/90 border-white/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white">[INFERENCES]</span>
              <Activity className="h-3.5 w-3.5 text-white/80" />
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Worker starvation in auth-service cascaded 504 Gateway Timeouts to civic-api-gateway after 4,210ms timeout.
            </p>
          </AegisSurface>

          {/* 3. Competing Hypotheses */}
          <AegisSurface elevation="card" border="default" className="p-4 space-y-2 bg-[#0b0e17]/90 border-white/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white/90">[HYPOTHESES]</span>
              <Lightbulb className="h-3.5 w-3.5 text-white/80" />
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Theory A (DB Pool Exhaustion) supported by 4 spans. Theory B (Network Partition) refuted by TCP ping telemetry.
            </p>
          </AegisSurface>

          {/* 4. Unresolved Questions */}
          <AegisSurface elevation="card" border="default" className="p-4 space-y-2 bg-[#0b0e17]/90 border-amber-500/30">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#f59e0b]">[UNRESOLVED]</span>
              <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Upstream client retry jitter boundary: why did client backoff exceed 500ms during automated container restarts?
            </p>
          </AegisSurface>
        </div>
      </div>
    </div>
  );
}
