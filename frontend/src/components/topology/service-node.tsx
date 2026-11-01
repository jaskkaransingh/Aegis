"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  HelpCircle,
  Lock,
  Server,
  Zap,
} from "lucide-react";
import type { TopologyGraphNode, ServiceTier, TopologyNodeStatus } from "@/types/topology";

// Tier Icon Selector
function getTierIcon(tier: ServiceTier | string) {
  switch (tier?.toLowerCase()) {
    case "edge":
      return <Globe className="w-3.5 h-3.5 text-white" />;
    case "security":
      return <Lock className="w-3.5 h-3.5 text-emerald-400" />;
    case "core_business":
      return <Cpu className="w-3.5 h-3.5 text-white" />;
    case "integration":
      return <Bell className="w-3.5 h-3.5 text-amber-400" />;
    case "data_persistence":
      return <Database className="w-3.5 h-3.5 text-white" />;
    default:
      return <Server className="w-3.5 h-3.5 text-white/60" />;
  }
}

// Status Badge Config
function getStatusBadge(status: TopologyNodeStatus) {
  switch (status) {
    case "HEALTHY":
      return {
        label: "HEALTHY",
        bg: "bg-emerald-950/60 border-emerald-700/50 text-emerald-300",
        icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
      };
    case "DEGRADED":
      return {
        label: "DEGRADED",
        bg: "bg-amber-950/60 border-amber-700/50 text-amber-300",
        icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
      };
    case "CRITICAL":
      return {
        label: "CRITICAL",
        bg: "bg-rose-950/60 border-rose-700/50 text-rose-300 animate-pulse",
        icon: <AlertOctagon className="w-3 h-3 text-rose-400" />,
      };
    case "WARNING":
      return {
        label: "WARNING",
        bg: "bg-amber-950/60 border-amber-700/50 text-amber-300",
        icon: <AlertTriangle className="w-3 h-3 text-amber-400" />,
      };
    case "UNKNOWN":
    default:
      return {
        label: "UNKNOWN",
        bg: "bg-slate-900 border-white/20 text-white/60",
        icon: <HelpCircle className="w-3 h-3 text-white/60" />,
      };
  }
}

export const ServiceNodeComponent = memo(function ServiceNodeComponent({
  data,
  selected,
}: NodeProps<TopologyGraphNode>) {
  const statusConfig = getStatusBadge(data.status);
  const isSelected = selected || data.isSelected;
  const isNeighbor = data.isNeighbor;
  const isDimmed = data.isDimmed;

  return (
    <div
      className={`relative w-64 rounded-xl border p-3.5 transition-all duration-200 select-none ${
        isSelected
          ? "bg-black/60 backdrop-blur-xl border-white/50 shadow-xl shadow-white/10 ring-2 ring-white/50"
          : isNeighbor
          ? "bg-black/60 backdrop-blur-xl border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40"
          : isDimmed
          ? "bg-black/40 border-white/10 opacity-30 filter grayscale"
          : "bg-black/45 backdrop-blur-xl border-white/10 hover:border-white/20 hover:bg-slate-900 shadow-md"
      }`}
    >
      {/* Target handle (incoming / upstream callers) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-slate-950 !rounded-full -ml-1 transition-colors hover:!bg-white"
      />

      {/* Header row: Tier icon & status badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="p-1 rounded bg-white/10 border border-white/10 shrink-0">
            {getTierIcon(data.tier)}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 truncate">
            {data.tier?.replace("_", " ") || "Service"}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${statusConfig.bg}`}
        >
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Service Name */}
      <div className="mb-2">
        <h4 className="text-xs font-semibold text-white tracking-tight truncate">
          {data.name}
        </h4>
        <p className="text-[10px] font-mono text-white/60 truncate">{data.id}</p>
      </div>

      {/* Incident / Affected Indicator */}
      {data.isAffected && (
        <div className="flex items-center gap-1 px-2 py-1 mb-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium">
          <Zap className="w-3 h-3 text-rose-400 shrink-0 animate-pulse" />
          <span className="truncate">Active Incident Impact</span>
        </div>
      )}

      {/* Dependency metrics footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono text-white/60">
        <span title={`${data.incomingDependencies?.length || 0} Upstream callers depend on this`}>
          In: <strong className="text-white/80">{data.incomingDependencies?.length || 0}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span title={`${data.outgoingDependencies?.length || 0} Downstream dependencies called by this`}>
          Out: <strong className="text-white/80">{data.outgoingDependencies?.length || 0}</strong>
        </span>
        <span className="text-slate-600">•</span>
        <span title="Originating events count" className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-white/50" />
          <strong className="text-white/80">{data.eventCount || 0}</strong>
        </span>
      </div>

      {/* Source handle (outgoing / downstream callees) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-slate-500 !border-2 !border-slate-950 !rounded-full -mr-1 transition-colors hover:!bg-white"
      />
    </div>
  );
});

