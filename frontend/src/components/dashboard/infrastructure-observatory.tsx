"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Server,
  Database,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Box,
} from "lucide-react";
import { DEMO_SERVICES_STATUS } from "@/lib/demo-data";

// Dynamically import 3D Cluster to ensure client-only SSR safety
const Infrastructure3DCluster = dynamic(
  () => import("./infrastructure-3d-cluster"),
  { ssr: false }
);

interface ServiceNodeCoord {
  id: string;
  name: string;
  shortName: string;
  tier: string;
  status: "CRITICAL" | "DEGRADED" | "WARNING" | "OPERATIONAL";
  x: number; // percentage in canvas
  y: number; // percentage in canvas
  isAffected: boolean;
  connections: string[]; // target IDs
}

const TOPOLOGY_NODES: ServiceNodeCoord[] = [
  {
    id: "api-gateway",
    name: "API Gateway",
    shortName: "Gateway",
    tier: "edge",
    status: "CRITICAL",
    x: 18,
    y: 50,
    isAffected: true,
    connections: ["appointment-service", "hospital-records-service", "payment-service"],
  },
  {
    id: "appointment-service",
    name: "Appointment Service",
    shortName: "Appointments",
    tier: "core_business",
    status: "CRITICAL",
    x: 48,
    y: 28,
    isAffected: true,
    connections: ["postgresql-database", "notification-service"],
  },
  {
    id: "hospital-records-service",
    name: "Hospital Records",
    shortName: "EHR Records",
    tier: "core_business",
    status: "CRITICAL",
    x: 48,
    y: 50,
    isAffected: true,
    connections: ["postgresql-database", "redis-cache"],
  },
  {
    id: "payment-service",
    name: "Payment Service",
    shortName: "Payments",
    tier: "core_business",
    status: "DEGRADED",
    x: 48,
    y: 72,
    isAffected: true,
    connections: ["postgresql-database"],
  },
  {
    id: "postgresql-database",
    name: "PostgreSQL Database",
    shortName: "Postgres DB",
    tier: "data_persistence",
    status: "CRITICAL",
    x: 78,
    y: 40,
    isAffected: true,
    connections: [],
  },
  {
    id: "redis-cache",
    name: "Redis Cache",
    shortName: "Redis Cache",
    tier: "data_persistence",
    status: "OPERATIONAL",
    x: 78,
    y: 65,
    isAffected: false,
    connections: [],
  },
  {
    id: "notification-service",
    name: "Notification Worker",
    shortName: "Notifications",
    tier: "integration",
    status: "DEGRADED",
    x: 78,
    y: 18,
    isAffected: true,
    connections: [],
  },
];

export function InfrastructureObservatory() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("postgresql-database");
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");

  const activeService = TOPOLOGY_NODES.find((s) => s.id === selectedServiceId);
  const activeServiceData = DEMO_SERVICES_STATUS.find((s) => s.id === selectedServiceId);

  // Check if a node is connected to the selected node
  const isConnected = (id: string) => {
    if (!selectedServiceId) return false;
    if (id === selectedServiceId) return true;
    const current = TOPOLOGY_NODES.find((s) => s.id === selectedServiceId);
    if (current?.connections.includes(id)) return true;
    const parent = TOPOLOGY_NODES.find((s) => s.id === id);
    if (parent?.connections.includes(selectedServiceId)) return true;
    return false;
  };

  return (
    <div className="relative rounded-xl border border-white/10 bg-[#07090f]/90 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Top Header Bar with Mode Toggle & Telemetry Badges */}
      <div className="px-5 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444] animate-ping" />
          <div>
            <div className="text-sm font-mono font-bold tracking-wider text-white flex items-center gap-2">
              <span>CIVICHEALTH INFRASTRUCTURE OBSERVATORY</span>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-[#ef4444] border border-red-500/40 font-bold">
                SEV-1 ACTIVE
              </span>
            </div>
            <p className="text-xs text-white/60 font-sans mt-0.5">
              Live spatial topology & causal propagation telemetry across 7 monitored tiers.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Pill & Legend */}
        <div className="flex items-center gap-4">
          {/* Mode Switcher: 3D Spatial vs 2D Schematic */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode("3D")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "3D"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D SPATIAL</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("2D")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === "2D"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>2D SCHEMATIC</span>
            </button>
          </div>

          {/* Telemetry Status Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-white/70">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Outage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Degraded
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Nominal
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Render 3D Spatial Mesh or 2D Schematic */}
      {viewMode === "3D" ? (
        <Infrastructure3DCluster
          selectedId={selectedServiceId}
          onSelectNode={(id) => setSelectedServiceId(id)}
        />
      ) : (
        /* 2D Schematic Canvas */
        <div className="relative w-full h-[460px] bg-[#000000]/60 overflow-hidden">
          {/* Grid lines background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* SVG Connection Lines & Signal Pulses */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {TOPOLOGY_NODES.map((source) =>
              source.connections.map((targetId) => {
                const target = TOPOLOGY_NODES.find((s) => s.id === targetId);
                if (!target) return null;

                const isHighlighted =
                  selectedServiceId === source.id ||
                  selectedServiceId === target.id ||
                  (hoveredServiceId === source.id && target.id === selectedServiceId);

                const isCriticalPath =
                  source.isAffected && target.isAffected && isHighlighted;

                return (
                  <g key={`${source.id}-${target.id}`}>
                    <line
                      x1={`${source.x}%`}
                      y1={`${source.y}%`}
                      x2={`${target.x}%`}
                      y2={`${target.y}%`}
                      stroke={
                        isCriticalPath
                          ? "#ef4444"
                          : isHighlighted
                          ? "#22c55e"
                          : "#252d40"
                      }
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      strokeDasharray={isHighlighted ? "none" : "3 4"}
                      opacity={isHighlighted ? 0.95 : 0.4}
                      className="transition-all duration-300"
                    />

                    {isHighlighted && (
                      <circle r="4" fill={isCriticalPath ? "#ef4444" : "#22c55e"}>
                        <animateMotion
                          path={`M ${source.x * 4} ${source.y * 4} L ${target.x * 4} ${target.y * 4}`}
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })
            )}
          </svg>

          {/* Interactive Service Nodes */}
          {TOPOLOGY_NODES.map((node) => {
            const isSelected = selectedServiceId === node.id;
            const isDimmed = selectedServiceId && !isConnected(node.id);

            let statusBg = "bg-[#22c55e]";
            let statusBorder = "border-[#22c55e]/40";

            if (node.status === "CRITICAL") {
              statusBg = "bg-[#ef4444]";
              statusBorder = "border-[#ef4444]/60 shadow-[0_0_16px_rgba(239,68,68,0.4)]";
            } else if (node.status === "DEGRADED" || node.status === "WARNING") {
              statusBg = "bg-[#f59e0b]";
              statusBorder = "border-[#f59e0b]/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]";
            }

            return (
              <div
                key={node.id}
                onClick={() => setSelectedServiceId(node.id)}
                onMouseEnter={() => setHoveredServiceId(node.id)}
                onMouseLeave={() => setHoveredServiceId(null)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute cursor-pointer transition-all duration-300 z-10 ${
                  isDimmed ? "opacity-30 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <div
                  className={`p-3.5 rounded-xl border bg-[#0b0e17]/95 backdrop-blur-md flex items-center gap-3 transition-all shadow-lg ${
                    isSelected
                      ? "ring-2 ring-white border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.35)]"
                      : `${statusBorder} hover:border-white/40`
                  }`}
                >
                  <span className="relative flex shrink-0 items-center justify-center">
                    {node.isAffected && (
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${statusBg}`}
                      />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusBg}`} />
                  </span>

                  <div className="flex flex-col text-left">
                    <span className="font-mono text-sm font-bold text-white tracking-tight">
                      {node.shortName}
                    </span>
                    <span className="text-xs font-mono text-white/50 uppercase">
                      {node.tier.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Selected Service Detail Drawer Overlay */}
          {activeService && activeServiceData && (
            <div className="absolute top-4 right-4 w-80 rounded-xl border border-white/20 bg-[#07090f]/95 backdrop-blur-xl p-4 shadow-2xl z-20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      activeService.status === "CRITICAL"
                        ? "bg-[#ef4444]"
                        : activeService.status === "DEGRADED"
                        ? "bg-[#f59e0b]"
                        : "bg-[#22c55e]"
                    }`}
                  />
                  <span className="font-mono text-sm font-bold text-white truncate">
                    {activeService.name}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                  {activeService.status}
                </span>
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-sans">
                {activeServiceData.description}
              </p>

              {activeServiceData.observedSymptom && (
                <div className="p-2.5 rounded bg-black/60 border border-white/10 text-xs font-mono text-[#f59e0b] space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                    Observed Telemetry Symptom
                  </div>
                  <div>{activeServiceData.observedSymptom}</div>
                </div>
              )}

              {/* Quick Action Links */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10 text-xs font-mono">
                <Link
                  href={`/evidence?service=${activeService.id}`}
                  className="text-white hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Evidence Records</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/timeline"
                  className="text-white/60 hover:text-white flex items-center gap-1"
                >
                  <span>Timeline</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InfrastructureObservatory;
