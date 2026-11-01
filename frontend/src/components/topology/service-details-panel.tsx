"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Layers,
  Server,
  Shield,
  X,
  Zap,
} from "lucide-react";
import type { TopologyNodeData, TopologyNodeStatus } from "@/types/topology";

interface ServiceDetailsPanelProps {
  service: TopologyNodeData | null;
  allNodes: TopologyNodeData[];
  onSelectService: (serviceId: string) => void;
  onClose: () => void;
}

function getStatusBadge(status: TopologyNodeStatus) {
  switch (status) {
    case "HEALTHY":
      return {
        label: "HEALTHY",
        bg: "bg-emerald-950/60 border-emerald-700/60 text-emerald-300",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      };
    case "DEGRADED":
      return {
        label: "DEGRADED",
        bg: "bg-amber-950/60 border-amber-700/60 text-amber-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      };
    case "CRITICAL":
      return {
        label: "CRITICAL",
        bg: "bg-rose-950/60 border-rose-700/60 text-rose-300 animate-pulse",
        icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
      };
    case "WARNING":
      return {
        label: "WARNING",
        bg: "bg-amber-950/60 border-amber-700/60 text-amber-300",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      };
    case "UNKNOWN":
    default:
      return {
        label: "UNKNOWN",
        bg: "bg-slate-900 border-white/20 text-white/60",
        icon: <HelpCircle className="w-3.5 h-3.5 text-white/60" />,
      };
  }
}

export function ServiceDetailsPanel({
  service,
  allNodes,
  onSelectService,
  onClose,
}: ServiceDetailsPanelProps) {
  if (!service) return null;

  const statusConfig = getStatusBadge(service.status);
  const nodeLookup = new Map(allNodes.map((n) => [n.id, n]));

  return (
    <div className="absolute top-4 right-4 z-20 w-88 max-w-[calc(100vw-2rem)] max-h-[calc(100%-2rem)] flex flex-col rounded-2xl bg-black/55 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white/90 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Panel Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/10 bg-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${statusConfig.bg}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10">
              {service.tier?.replace("_", " ") || "Tier: Unknown"}
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight pt-1">
            {service.name}
          </h3>
          <p className="text-[11px] font-mono text-white/60">{service.id}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close details panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Incident Impact Banner */}
        {service.isAffected ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300">
              <Zap className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
              <span>Incident Impact Detected</span>
            </div>
            {service.observedSymptom ? (
              <p className="text-[11px] text-rose-200/90 leading-relaxed font-sans">
                {service.observedSymptom}
              </p>
            ) : (
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                Service reports elevated error states or telemetry anomalies associated with the active incident.
              </p>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-white/60">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">No direct incident degradation recorded for this service.</span>
          </div>
        )}

        {/* Description */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1">
            Service Role & Description
          </span>
          <p className="text-[11px] text-white/80 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10">
            {service.description || "No architectural description provided in catalog."}
          </p>
        </div>

        {/* Telemetry & Provenance Details */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60">
            Telemetry & Evidence Status
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-white/50 block text-[10px]">Data Source</span>
              <strong className={service.dataSource === "live" ? "text-emerald-400" : "text-amber-400"}>
                {service.dataSource === "live" ? "Live Backend" : "Demo Fixture"}
              </strong>
            </div>
            <div>
              <span className="text-white/50 block text-[10px]">Associated Events</span>
              <strong className="text-white/90 flex items-center gap-1">
                <Activity className="w-3 h-3 text-white/60" />
                {service.eventCount || 0} events
              </strong>
            </div>
          </div>
        </div>

        {/* Upstream Callers (Incoming) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-white" />
              Upstream Callers ({service.incomingDependencies.length})
            </span>
            <span className="text-[10px] text-white/60">Depend on this</span>
          </div>

          {service.incomingDependencies.length === 0 ? (
            <p className="text-[11px] text-white/60 italic bg-black/40 p-2 rounded-lg border border-white/10/40">
              No registered incoming callers (Ingress or root caller)
            </p>
          ) : (
            <div className="space-y-1.5">
              {service.incomingDependencies.map((callerId) => {
                const caller = nodeLookup.get(callerId);
                return (
                  <button
                    key={callerId}
                    type="button"
                    onClick={() => onSelectService(callerId)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10/80 hover:border-white/40 hover:bg-white/[0.06] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                      <span className="font-medium text-white/80 group-hover:text-white truncate">
                        {caller?.name || callerId}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/60 shrink-0">
                      {caller?.status || "UNKNOWN"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Downstream Dependencies (Outgoing) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              Downstream Dependencies ({service.outgoingDependencies.length})
            </span>
            <span className="text-[10px] text-white/60">Called by this</span>
          </div>

          {service.outgoingDependencies.length === 0 ? (
            <p className="text-[11px] text-white/60 italic bg-black/40 p-2 rounded-lg border border-white/10/40">
              No registered downstream dependencies (Terminal persistence/leaf)
            </p>
          ) : (
            <div className="space-y-1.5">
              {service.outgoingDependencies.map((depId) => {
                const dep = nodeLookup.get(depId);
                return (
                  <button
                    key={depId}
                    type="button"
                    onClick={() => onSelectService(depId)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10/80 hover:border-white/40 hover:bg-white/[0.06] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                      <span className="font-medium text-white/80 group-hover:text-white truncate">
                        {dep?.name || depId}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/60 shrink-0">
                      {dep?.status || "UNKNOWN"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
        <Link
          href={`/timeline?service=${encodeURIComponent(service.id)}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-colors shadow-md"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Inspect Service in Timeline</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

