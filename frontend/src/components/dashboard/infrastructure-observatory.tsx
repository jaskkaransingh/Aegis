"use client";

import React, { useState } from "react";
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
  X,
  ExternalLink,
} from "lucide-react";
import { DEMO_SERVICES_STATUS, DemoServiceStatus } from "@/lib/demo-data";

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

  const activeService = TOPOLOGY_NODES.find((s) => s.id === selectedServiceId);
  const activeServiceData = DEMO_SERVICES_STATUS.find((s) => s.id === selectedServiceId);

  // Check if a node is connected to the selected node (either upstream or downstream)
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
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#f27886] animate-ping" />
          <div>
            <div className="text-xs font-mono font-semibold tracking-wider text-white flex items-center gap-2">
              <span>CIVICHEALTH INFRASTRUCTURE OBSERVATORY</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                CASCADE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Select a service node to trace propagation paths and telemetry anomalies.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f27886]" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f2c66d]" /> Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#76d6a4]" /> Nominal
          </span>
          <Link
            href="/topology"
            className="ml-2 text-white/70 hover:text-white flex items-center gap-1 text-[11px] font-mono border-b border-white/20 hover:border-white transition"
          >
            <span>Full Graph</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#000000]/60 overflow-hidden">
        {/* Subtle grid lines background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
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
              <stop offset="0%" stopColor="#7adcf5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f27886" stopOpacity="0.9" />
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
                  {/* Base connection wire */}
                  <line
                    x1={`${source.x}%`}
                    y1={`${source.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke={
                      isCriticalPath
                        ? "#f27886"
                        : isHighlighted
                        ? "#7adcf5"
                        : "#252d40"
                    }
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={isHighlighted ? "none" : "3 4"}
                    opacity={isHighlighted ? 0.9 : 0.4}
                    className="transition-all duration-300"
                  />

                  {/* Animated Signal Pulse along highlighted paths */}
                  {isHighlighted && (
                    <circle r="3.5" fill={isCriticalPath ? "#f27886" : "#7adcf5"}>
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

          let statusBg = "bg-[#76d6a4]";
          let statusBorder = "border-[#76d6a4]/40";
          let statusText = "text-[#76d6a4]";

          if (node.status === "CRITICAL") {
            statusBg = "bg-[#f27886]";
            statusBorder = "border-[#f27886]/60 shadow-[0_0_16px_rgba(242,120,134,0.4)]";
            statusText = "text-[#f27886]";
          } else if (node.status === "DEGRADED" || node.status === "WARNING") {
            statusBg = "bg-[#f2c66d]";
            statusBorder = "border-[#f2c66d]/60 shadow-[0_0_12px_rgba(242,198,109,0.3)]";
            statusText = "text-[#f2c66d]";
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
                className={`p-3 rounded-xl border bg-[#0b0e17]/95 backdrop-blur-md flex items-center gap-2.5 transition-all shadow-lg ${
                  isSelected
                    ? "ring-2 ring-white/60 border-white/40 scale-105"
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
                  <span className="font-mono text-xs font-semibold text-white tracking-tight">
                    {node.shortName}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 uppercase">
                    {node.tier.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Service Detail Drawer Overlay */}
        {activeService && activeServiceData && (
          <div className="absolute top-4 right-4 w-72 sm:w-80 rounded-xl border border-white/20 bg-[#07090f]/95 backdrop-blur-xl p-4 shadow-2xl z-20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    activeService.status === "CRITICAL"
                      ? "bg-[#f27886]"
                      : activeService.status === "DEGRADED"
                      ? "bg-[#f2c66d]"
                      : "bg-[#76d6a4]"
                  }`}
                />
                <span className="font-mono text-xs font-semibold text-white truncate">
                  {activeService.name}
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                {activeService.status}
              </span>
            </div>

            <p className="text-[11px] text-white/70 leading-relaxed font-sans">
              {activeServiceData.description}
            </p>

            {activeServiceData.observedSymptom && (
              <div className="p-2.5 rounded bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#f2c66d] space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-white/40">
                  Observed Telemetry Symptom
                </div>
                <div>{activeServiceData.observedSymptom}</div>
              </div>
            )}

            {/* Quick Action Links */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10 text-xs font-mono">
              <Link
                href={`/evidence?service=${activeService.id}`}
                className="text-[#7adcf5] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Evidence Records</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/timeline"
                className="text-white/60 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <span>Timeline</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

