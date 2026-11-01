"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Layers,
  Network,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { InvestigationReport } from "@/types/report";

interface ReportVisualExecutiveProps {
  report: InvestigationReport;
  onViewFormalReport?: () => void;
}

// Causal Flow Nodes
interface CausalNode {
  id: string;
  label: string;
  subtitle: string;
  status: "ROOT_CAUSE" | "CASCADE_FAIL" | "DEGRADED" | "DISPROVEN";
  evidenceId: string;
  timestamp: string;
  offsetSeconds: number;
  metric: string;
  metricValue: string;
  details: string;
  x: number;
  y: number;
}

const CAUSAL_NODES: CausalNode[] = [
  {
    id: "batch-query",
    label: "Archival Query",
    subtitle: "cron-worker-04",
    status: "CASCADE_FAIL",
    evidenceId: "EVT-001",
    timestamp: "14:00:02 UTC",
    offsetSeconds: 0,
    metric: "Lock Type",
    metricValue: "RowShareLock (Unindexed)",
    details: "Unindexed batch SELECT acquired table-wide read lock on appointments table with 0 backoff.",
    x: 80,
    y: 110,
  },
  {
    id: "db-pool",
    label: "PostgreSQL DB",
    subtitle: "db-primary-cluster",
    status: "ROOT_CAUSE",
    evidenceId: "EVT-002",
    timestamp: "14:00:15 UTC",
    offsetSeconds: 13,
    metric: "Pool Saturation",
    metricValue: "100 / 100 (Exhausted)",
    details: "All connection slots occupied by blocking query. New connection wait queue exceeded 5,000ms timeout.",
    x: 270,
    y: 110,
  },
  {
    id: "appointment-svc",
    label: "Appointment Svc",
    subtitle: "svc-appointment-worker",
    status: "CASCADE_FAIL",
    evidenceId: "EVT-004",
    timestamp: "14:00:20 UTC",
    offsetSeconds: 18,
    metric: "Queue Backlog",
    metricValue: "142 / 16 Workers",
    details: "Internal task queue backed up due to frozen DB transactions. Worker pool threads blocked.",
    x: 460,
    y: 110,
  },
  {
    id: "api-gateway",
    label: "API Gateway",
    subtitle: "envoy-ingress-01",
    status: "CASCADE_FAIL",
    evidenceId: "EVT-005",
    timestamp: "14:00:25 UTC",
    offsetSeconds: 23,
    metric: "504 Error Rate",
    metricValue: "48.6% of Ingress",
    details: "Ingress timeouts cascaded to end users; emergency triage admission requests aborted.",
    x: 650,
    y: 110,
  },
  {
    id: "payment-skew",
    label: "Payment Service",
    subtitle: "svc-payment-enclave",
    status: "DISPROVEN",
    evidenceId: "EVT-008",
    timestamp: "14:01:02 UTC (+120s raw)",
    offsetSeconds: 60,
    metric: "Clock Anomaly",
    metricValue: "+120.0s NTP Skew",
    details: "Appeared first in raw logs (13:59:02) due to clock desync, but verified downstream in true UTC timeline.",
    x: 460,
    y: 240,
  },
];

// Telemetry Progression Data Points
interface TelemetryPoint {
  timeOffset: number; // seconds from 14:00:00
  timeLabel: string;
  dbPoolSaturation: number; // 0 to 100
  workerQueueDepth: number; // 0 to 160
  gateway504Rate: number; // 0 to 100 (%)
  p99LatencyMs: number; // 100 to 4500
  phase: string;
}

const TELEMETRY_TIMELINE: TelemetryPoint[] = [
  { timeOffset: 0, timeLabel: "14:00:00", dbPoolSaturation: 18, workerQueueDepth: 4, gateway504Rate: 0, p99LatencyMs: 140, phase: "Nominal" },
  { timeOffset: 5, timeLabel: "14:00:05", dbPoolSaturation: 35, workerQueueDepth: 8, gateway504Rate: 0, p99LatencyMs: 180, phase: "Batch Started" },
  { timeOffset: 10, timeLabel: "14:00:10", dbPoolSaturation: 72, workerQueueDepth: 22, gateway504Rate: 0.8, p99LatencyMs: 420, phase: "Pool Rising" },
  { timeOffset: 15, timeLabel: "14:00:15", dbPoolSaturation: 100, workerQueueDepth: 56, gateway504Rate: 8.4, p99LatencyMs: 1250, phase: "Pool Starvation" },
  { timeOffset: 20, timeLabel: "14:00:20", dbPoolSaturation: 100, workerQueueDepth: 118, gateway504Rate: 24.1, p99LatencyMs: 2800, phase: "Queue Overflow" },
  { timeOffset: 25, timeLabel: "14:00:25", dbPoolSaturation: 100, workerQueueDepth: 142, gateway504Rate: 48.6, p99LatencyMs: 4400, phase: "504 Cascades" },
  { timeOffset: 35, timeLabel: "14:00:35", dbPoolSaturation: 100, workerQueueDepth: 156, gateway504Rate: 52.0, p99LatencyMs: 4600, phase: "Peak Outage" },
  { timeOffset: 45, timeLabel: "14:00:45", dbPoolSaturation: 98, workerQueueDepth: 148, gateway504Rate: 46.2, p99LatencyMs: 4100, phase: "Circuit Tripped" },
  { timeOffset: 60, timeLabel: "14:01:00", dbPoolSaturation: 82, workerQueueDepth: 94, gateway504Rate: 28.5, p99LatencyMs: 2400, phase: "Payment Event" },
  { timeOffset: 70, timeLabel: "14:01:10", dbPoolSaturation: 44, workerQueueDepth: 36, gateway504Rate: 11.2, p99LatencyMs: 820, phase: "Recovery Begun" },
];

export function ReportVisualExecutive({ report, onViewFormalReport }: ReportVisualExecutiveProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("db-pool");
  const [scrubIndex, setScrubIndex] = useState<number>(3); // 14:00:15 by default (Root cause)
  const [activeChartMetric, setActiveChartMetric] = useState<"ALL" | "DB_POOL" | "QUEUE" | "GATEWAY_504">("ALL");

  const selectedNode = CAUSAL_NODES.find((n) => n.id === selectedNodeId) || CAUSAL_NODES[1];
  const currentTelemetry = TELEMETRY_TIMELINE[scrubIndex];

  // SVG Chart Dimensions
  const chartW = 760;
  const chartH = 170;
  const paddingX = 40;
  const paddingY = 25;
  const innerW = chartW - paddingX * 2;
  const innerH = chartH - paddingY * 2;

  // Build SVG Path helper
  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, "");
  };

  const dbSaturationPoints = TELEMETRY_TIMELINE.map((p, i) => ({
    x: paddingX + (i / (TELEMETRY_TIMELINE.length - 1)) * innerW,
    y: paddingY + innerH - (p.dbPoolSaturation / 100) * innerH,
  }));

  const queuePoints = TELEMETRY_TIMELINE.map((p, i) => ({
    x: paddingX + (i / (TELEMETRY_TIMELINE.length - 1)) * innerW,
    y: paddingY + innerH - (p.workerQueueDepth / 160) * innerH,
  }));

  const gatewayPoints = TELEMETRY_TIMELINE.map((p, i) => ({
    x: paddingX + (i / (TELEMETRY_TIMELINE.length - 1)) * innerW,
    y: paddingY + innerH - (p.gateway504Rate / 60) * innerH,
  }));

  const activeCursorX = paddingX + (scrubIndex / (TELEMETRY_TIMELINE.length - 1)) * innerW;

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Incident Severity</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-sm font-mono font-bold text-white">CRITICAL (P0)</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Triage Outage</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Time to Detect (MTTD)</div>
          <div className="text-sm font-mono font-bold text-[#22c55e]">42 SECONDS</div>
          <div className="text-[10px] text-slate-500 font-mono">Synthetics Trigger</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Peak Ingress Failure</div>
          <div className="text-sm font-mono font-bold text-[#ef4444]">48.6% OF REQS</div>
          <div className="text-[10px] text-slate-500 font-mono">HTTP 504 Gateway</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Blast Radius</div>
          <div className="text-sm font-mono font-bold text-[#f59e0b]">5 OF 6 SERVICES</div>
          <div className="text-[10px] text-slate-500 font-mono">Cascading Backpressure</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Root Cause Confidence</div>
          <div className="text-sm font-mono font-bold text-white">88% (BAYESIAN)</div>
          <div className="text-[10px] text-[#22c55e] font-mono">4 Verified Citations</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Clock Skew Audit</div>
          <div className="text-sm font-mono font-bold text-white">+120.0s SKEW</div>
          <div className="text-[10px] text-[#22c55e] font-mono">Normalized & Disproven</div>
        </div>
      </div>

      {/* 2. WORKING FORENSIC CAUSAL FLOWDIAGRAM */}
      <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#22c55e] font-bold">
                01 // INTERACTIVE FORENSIC FLOWDIAGRAM
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
                LIVE PROPAGATION GRAPH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual causal propagation chain reconstructed from timestamp-corrected telemetry. Click any node to inspect evidence citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Root Cause
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 ml-2">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Cascade
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 ml-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> Disproven Skew
            </span>
          </div>
        </div>

        {/* SVG Flow Canvas */}
        <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4">
          <svg viewBox="0 0 760 300" className="w-full min-w-[720px] h-[300px] select-none">
            <defs>
              <linearGradient id="grad-active-link" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad-disproven-link" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow-root" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Pattern */}
            <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={`v-${i}`} x1={i * 55} y1={0} x2={i * 55} y2={300} />
              ))}
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={`h-${i}`} x1={0} y1={i * 50} x2={760} y2={i * 50} />
              ))}
            </g>

            {/* Connecting Causal Paths */}
            {/* Path 1: Archival Query -> Postgres DB */}
            <path
              d="M 140 110 L 210 110"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-[dash_1.2s_linear_infinite]"
            />
            {/* Path 2: Postgres DB -> Appointment Service */}
            <path
              d="M 330 110 L 400 110"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="5 3"
              className="animate-[dash_1s_linear_infinite]"
            />
            {/* Path 3: Appointment Service -> API Gateway */}
            <path
              d="M 520 110 L 590 110"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-[dash_1.5s_linear_infinite]"
            />
            {/* Path 4 (Disproven branch): Appointment Svc -> Payment Svc */}
            <path
              d="M 460 145 L 460 205"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.5"
            />

            {/* Path Direction Arrowheads */}
            <polygon points="210,110 200,105 200,115" fill="#ef4444" />
            <polygon points="400,110 390,105 390,115" fill="#ef4444" />
            <polygon points="590,110 580,105 580,115" fill="#f59e0b" />
            <polygon points="460,205 455,195 465,195" fill="#64748b" opacity="0.6" />

            {/* Causal Delay Labels */}
            <text x="175" y="100" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">
              +13.0s
            </text>
            <text x="365" y="100" fill="#f87171" fontSize="9" fontFamily="monospace" textAnchor="middle">
              +5.0s
            </text>
            <text x="555" y="100" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">
              +5.0s
            </text>
            <text x="495" y="175" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
              +120s SKEW
            </text>

            {/* Nodes */}
            {CAUSAL_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isRoot = node.status === "ROOT_CAUSE";
              const isDisproven = node.status === "DISPROVEN";

              let borderColor = isSelected ? "#ffffff" : isRoot ? "#ef4444" : isDisproven ? "#64748b" : "#f59e0b";
              let bgFill = isSelected ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.85)";

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform hover:scale-105"
                  transform={`translate(${node.x - 60}, ${node.y - 35})`}
                >
                  {/* Outer Pulsing Halo for Root Cause */}
                  {isRoot && (
                    <rect
                      x="-4"
                      y="-4"
                      width="128"
                      height="78"
                      rx="12"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Background Container */}
                  <rect
                    x="0"
                    y="0"
                    width="120"
                    height="70"
                    rx="10"
                    fill={bgFill}
                    stroke={borderColor}
                    strokeWidth={isSelected ? "2" : "1.2"}
                    filter={isRoot ? "url(#glow-root)" : undefined}
                  />

                  {/* Top Status Dot */}
                  <circle
                    cx="15"
                    cy="16"
                    r="4"
                    fill={isRoot ? "#ef4444" : isDisproven ? "#64748b" : "#f59e0b"}
                  />

                  {/* Node Title */}
                  <text
                    x="26"
                    y="19"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>

                  {/* Node Subtitle */}
                  <text
                    x="12"
                    y="35"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {node.subtitle}
                  </text>

                  {/* Metric Value */}
                  <rect
                    x="8"
                    y="43"
                    width="104"
                    height="19"
                    rx="5"
                    fill={isRoot ? "rgba(239,68,68,0.2)" : isDisproven ? "rgba(100,116,139,0.2)" : "rgba(245,158,11,0.2)"}
                  />
                  <text
                    x="60"
                    y="56"
                    fill={isRoot ? "#fca5a5" : isDisproven ? "#cbd5e1" : "#fde68a"}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.metricValue}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Telemetry Inspector */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-white uppercase">
                [{selectedNode.id.toUpperCase()}] {selectedNode.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  selectedNode.status === "ROOT_CAUSE"
                    ? "bg-red-950/80 border border-red-500/50 text-[#ef4444]"
                    : selectedNode.status === "DISPROVEN"
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-amber-950/80 border border-amber-500/50 text-[#f59e0b]"
                }`}
              >
                {selectedNode.status.replace("_", " ")}
              </span>
              <span className="text-slate-500 font-mono text-xs">
                Offset: +{selectedNode.offsetSeconds}s
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.details}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase text-slate-500 block">Grounding Event</span>
              <Link
                href={`/evidence?event=${selectedNode.evidenceId}`}
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#22c55e] hover:underline"
              >
                <span>{selectedNode.evidenceId}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase text-slate-500 block">Logged Timestamp</span>
              <span className="font-mono text-xs text-slate-300">{selectedNode.timestamp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-SERIES INCIDENT PROGRESSION TELEMETRY CHART */}
      <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#22c55e] font-bold">
                02 // INCIDENT PROGRESSION TELEMETRY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
                MULTI-STREAM TIME-SERIES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Correlated metrics across the 70-second incident onset window. Drag the scrubber to observe propagation order.
            </p>
          </div>

          {/* Metric Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setActiveChartMetric("ALL")}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                activeChartMetric === "ALL"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-black/40 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              ALL METRICS
            </button>
            <button
              onClick={() => setActiveChartMetric("DB_POOL")}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                activeChartMetric === "DB_POOL"
                  ? "bg-[#ef4444] text-white font-bold border-[#ef4444]"
                  : "bg-black/40 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              DB POOL (%)
            </button>
            <button
              onClick={() => setActiveChartMetric("QUEUE")}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                activeChartMetric === "QUEUE"
                  ? "bg-[#f59e0b] text-black font-bold border-[#f59e0b]"
                  : "bg-black/40 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              QUEUE DEPTH
            </button>
            <button
              onClick={() => setActiveChartMetric("GATEWAY_504")}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                activeChartMetric === "GATEWAY_504"
                  ? "bg-[#ef4444] text-white font-bold border-[#ef4444]"
                  : "bg-black/40 text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              504 ERRORS (%)
            </button>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="relative rounded-xl border border-white/10 bg-black/60 p-4">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44 select-none">
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={chartW - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" />
            <line x1={paddingX} y1={paddingY + innerH * 0.5} x2={chartW - paddingX} y2={paddingY + innerH * 0.5} stroke="rgba(255,255,255,0.06)" />
            <line x1={paddingX} y1={paddingY + innerH} x2={chartW - paddingX} y2={paddingY + innerH} stroke="rgba(255,255,255,0.12)" />

            {/* Y Axis Labels */}
            <text x={paddingX - 8} y={paddingY + 4} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">100%</text>
            <text x={paddingX - 8} y={paddingY + innerH * 0.5 + 4} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">50%</text>
            <text x={paddingX - 8} y={paddingY + innerH + 4} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">0%</text>

            {/* Threshold Warning Line (80% Saturation) */}
            <line
              x1={paddingX}
              y1={paddingY + innerH * 0.2}
              x2={chartW - paddingX}
              y2={paddingY + innerH * 0.2}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.4"
            />
            <text x={chartW - paddingX - 4} y={paddingY + innerH * 0.2 - 4} fill="#f87171" fontSize="8" fontFamily="monospace" textAnchor="end">
              CRITICAL SATURATION THRESHOLD (80%)
            </text>

            {/* Metric Series Lines */}
            {(activeChartMetric === "ALL" || activeChartMetric === "DB_POOL") && (
              <path
                d={buildSvgPath(dbSaturationPoints)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {(activeChartMetric === "ALL" || activeChartMetric === "QUEUE") && (
              <path
                d={buildSvgPath(queuePoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {(activeChartMetric === "ALL" || activeChartMetric === "GATEWAY_504") && (
              <path
                d={buildSvgPath(gatewayPoints)}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
            )}

            {/* Active Time Cursor Line */}
            <line
              x1={activeCursorX}
              y1={paddingY}
              x2={activeCursorX}
              y2={paddingY + innerH}
              stroke="#22c55e"
              strokeWidth="2"
            />
            <circle
              cx={activeCursorX}
              cy={paddingY}
              r="4"
              fill="#22c55e"
            />
          </svg>

          {/* Interactive Timeline Scrubber Slider */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Drag Scrubber:</span>
              <span className="font-bold text-[#22c55e]">
                {currentTelemetry.timeLabel} UTC (T+{currentTelemetry.timeOffset}s) — Phase: {currentTelemetry.phase}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={TELEMETRY_TIMELINE.length - 1}
              step="1"
              value={scrubIndex}
              onChange={(e) => setScrubIndex(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              {TELEMETRY_TIMELINE.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setScrubIndex(idx)}
                  className={`hover:text-white transition-colors ${scrubIndex === idx ? "text-[#22c55e] font-bold" : ""}`}
                >
                  +{p.timeOffset}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Scrubber Telemetry Metrics Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">DB Pool Saturation</span>
            <div className="text-base font-mono font-bold text-[#ef4444]">
              {currentTelemetry.dbPoolSaturation}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Capacity: 100 conns</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Worker Queue Depth</span>
            <div className="text-base font-mono font-bold text-[#f59e0b]">
              {currentTelemetry.workerQueueDepth} jobs
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Max Concurrency: 16</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">Gateway 504 Errors</span>
            <div className="text-base font-mono font-bold text-white">
              {currentTelemetry.gateway504Rate}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Ingress Timeouts</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400">P99 Latency</span>
            <div className="text-base font-mono font-bold text-slate-200">
              {currentTelemetry.p99LatencyMs} ms
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Baseline: 140ms</div>
          </div>
        </div>
      </div>

      {/* 4. BLAST RADIUS MICROSERVICE IMPACT MATRIX */}
      <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#22c55e] font-bold">
                03 // BLAST RADIUS INFRASTRUCTURE MATRIX
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
                6 SERVICES MONITORED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Microservices categorized by verified telemetry degradation and dependency propagation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.section5ServiceImpact.map((svc) => {
            const isOutage = svc.impactType === "OBSERVED_OUTAGE";
            const isDegraded = svc.impactType === "DEGRADED_PERFORMANCE";

            return (
              <div
                key={svc.serviceId}
                className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-white text-xs truncate">
                      {svc.serviceName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        isOutage
                          ? "bg-red-950/70 border-red-500/50 text-[#ef4444]"
                          : isDegraded
                          ? "bg-amber-950/70 border-amber-500/50 text-[#f59e0b]"
                          : "bg-emerald-950/70 border-emerald-500/50 text-[#22c55e]"
                      }`}
                    >
                      {svc.impactType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    ID: {svc.serviceId}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Linked Evidence:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {svc.evidenceIds.length > 0 ? (
                      svc.evidenceIds.map((eid) => (
                        <Link
                          key={eid}
                          href={`/evidence?event=${eid}`}
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[10px] text-[#22c55e] hover:underline"
                        >
                          {eid}
                        </Link>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">None logged</span>
                    )}
                  </div>
                </div>

                {svc.directDependencies.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    Downstream: {svc.directDependencies.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. REMEDIATION ACTION MATRIX & EPILOGUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Remediation Priorities */}
        <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#22c55e] font-bold">
                04 // ACTIONABLE REMEDIATION ROADMAP
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {report.section10NextSteps.recommendations.length} Tasks
            </span>
          </div>

          <div className="space-y-3">
            {report.section10NextSteps.recommendations.map((rec, idx) => {
              const isHigh = rec.priority === "HIGH";
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-white">
                      {rec.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isHigh
                          ? "bg-red-950/80 border border-red-500/40 text-[#ef4444]"
                          : "bg-emerald-950/80 border border-emerald-500/40 text-[#22c55e]"
                      }`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100">{rec.action}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rec.rationale}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Epistemic Root Cause Verdict */}
        <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-xl p-5 md:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#22c55e] font-bold">
                  05 // FORENSIC ROOT CAUSE VERDICT
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-[#22c55e] font-bold">
                VERIFIED BY TELEMETRY
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/15 space-y-2">
              <div className="font-mono text-[10px] uppercase text-slate-400">Primary Classification</div>
              <h3 className="text-sm font-mono font-bold text-white">
                {report.section7RootCause.leadingHypothesisTitle}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.section7RootCause.rationale}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Contributing Cascade Factors:
              </span>
              <ul className="space-y-1 text-xs text-slate-300 font-mono">
                {report.section7RootCause.contributingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#ef4444] mt-0.5 font-bold">›</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-500">
              Epistemic Status: High Confidence Hypothesis (88%)
            </div>
            {onViewFormalReport && (
              <button
                onClick={onViewFormalReport}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:text-[#22c55e] transition-colors"
              >
                <span>Read Formal 10-Section Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

