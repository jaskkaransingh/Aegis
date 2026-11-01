"use client";

import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  TrendingUp,
  Zap,
} from "lucide-react";

interface TelemetryPoint {
  timeStr: string;
  tSec: number;
  dbPool: number; // 0 - 100
  workerQueue: number; // 0 - 100
  gateway504: number; // 0 - 100
  paymentLag: number; // 0 - 100
}

const DATA_POINTS: TelemetryPoint[] = [
  { timeStr: "14:00:00", tSec: 0, dbPool: 14, workerQueue: 10, gateway504: 0, paymentLag: 0 },
  { timeStr: "14:00:05", tSec: 5, dbPool: 25, workerQueue: 12, gateway504: 0, paymentLag: 0 },
  { timeStr: "14:00:10", tSec: 10, dbPool: 68, workerQueue: 22, gateway504: 0, paymentLag: 0 },
  { timeStr: "14:00:15", tSec: 15, dbPool: 100, workerQueue: 48, gateway504: 5, paymentLag: 0 },
  { timeStr: "14:00:20", tSec: 20, dbPool: 100, workerQueue: 88, gateway504: 32, paymentLag: 0 },
  { timeStr: "14:00:25", tSec: 25, dbPool: 100, workerQueue: 100, gateway504: 76, paymentLag: 0 },
  { timeStr: "14:00:30", tSec: 30, dbPool: 100, workerQueue: 100, gateway504: 94, paymentLag: 0 },
  { timeStr: "14:00:40", tSec: 40, dbPool: 100, workerQueue: 100, gateway504: 94, paymentLag: 12 },
  { timeStr: "14:00:50", tSec: 50, dbPool: 100, workerQueue: 98, gateway504: 92, paymentLag: 45 },
  { timeStr: "14:01:00", tSec: 60, dbPool: 100, workerQueue: 95, gateway504: 90, paymentLag: 88 },
  { timeStr: "14:01:10", tSec: 70, dbPool: 98, workerQueue: 90, gateway504: 85, paymentLag: 80 },
];

export function HypothesisTelemetryChart() {
  const [hoverIndex, setHoverIndex] = useState<number>(3); // Default at 14:00:15 (Pool exhaustion)
  const [visibleSeries, setVisibleSeries] = useState({
    dbPool: true,
    workerQueue: true,
    gateway504: true,
    paymentLag: true,
  });

  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

  const toX = (idx: number) => paddingX + (idx / (DATA_POINTS.length - 1)) * (width - 2 * paddingX);
  const toY = (val: number) => height - paddingY - (val / 100) * (height - 2 * paddingY);

  const makePath = (key: keyof TelemetryPoint) => {
    return DATA_POINTS.map((pt, idx) => {
      const x = toX(idx);
      const y = toY(Number(pt[key]));
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const activePt = DATA_POINTS[hoverIndex];

  return (
    <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white">
      {/* Chart Header */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                Multi-Series Telemetry Correlation Graph
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-white border border-white/20">
                TIME-SERIES EVIDENCE
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              Correlated metrics prove DB connection saturation preceded all downstream timeouts by 6.7 seconds.
            </p>
          </div>
        </div>

        {/* Interactive Legend Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleSeries((p) => ({ ...p, dbPool: !p.dbPool }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              visibleSeries.dbPool
                ? "bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e] font-bold"
                : "bg-black/40 border-white/10 text-white/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>DB Pool Saturation</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((p) => ({ ...p, workerQueue: !p.workerQueue }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              visibleSeries.workerQueue
                ? "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b] font-bold"
                : "bg-black/40 border-white/10 text-white/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span>Worker Queue Depth</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((p) => ({ ...p, gateway504: !p.gateway504 }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              visibleSeries.gateway504
                ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444] font-bold"
                : "bg-black/40 border-white/10 text-white/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Gateway 504s</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((p) => ({ ...p, paymentLag: !p.paymentLag }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              visibleSeries.paymentLag
                ? "bg-white/20 border-white/30 text-white font-bold"
                : "bg-black/40 border-white/10 text-white/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white/70" />
            <span>Payment Delay</span>
          </button>
        </div>
      </div>

      {/* SVG Multi-Series Graph */}
      <div className="p-4 space-y-3">
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px] select-none">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = toY(val);
              return (
                <g key={val}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4" />
                  <text x={paddingX - 8} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* X-axis Timestamps */}
            {DATA_POINTS.map((pt, idx) => {
              if (idx % 2 !== 0 && idx !== DATA_POINTS.length - 1) return null;
              const x = toX(idx);
              return (
                <text key={idx} x={x} y={height - 6} fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {pt.timeStr}
                </text>
              );
            })}

            {/* Series 1: DB Pool (Green #22c55e) */}
            {visibleSeries.dbPool && (
              <path d={makePath("dbPool")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
            )}

            {/* Series 2: Worker Queue (Amber #f59e0b) */}
            {visibleSeries.workerQueue && (
              <path d={makePath("workerQueue")} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
            )}

            {/* Series 3: Gateway 504s (Red #ef4444) */}
            {visibleSeries.gateway504 && (
              <path d={makePath("gateway504")} fill="none" stroke="#ef4444" strokeWidth="2.5" />
            )}

            {/* Series 4: Payment Lag (White/Muted) */}
            {visibleSeries.paymentLag && (
              <path d={makePath("paymentLag")} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="3 3" />
            )}

            {/* Hover Scrubber Line */}
            <line
              x1={toX(hoverIndex)}
              y1={paddingY}
              x2={toX(hoverIndex)}
              y2={height - paddingY}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />

            {/* Key Event Flag at 14:00:15 (Pool Exhausted) */}
            <g transform={`translate(${toX(3)}, ${toY(100)})`}>
              <circle r="4" fill="#22c55e" />
              <circle r="7" fill="none" stroke="#22c55e" strokeWidth="1" className="animate-ping" />
            </g>

            {/* Interactive Click Zones */}
            {DATA_POINTS.map((_, idx) => (
              <rect
                key={idx}
                x={toX(idx) - 15}
                y={paddingY}
                width="30"
                height={height - 2 * paddingY}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            ))}
          </svg>
        </div>

        {/* Live Hover Telemetry Readout Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-center">
          <div className="p-1 rounded bg-white/5">
            <span className="text-[9px] text-white/50 block">Time (UTC)</span>
            <span className="font-bold text-white">{activePt.timeStr}</span>
          </div>

          <div className="p-1 rounded bg-[#22c55e]/10 border border-[#22c55e]/20">
            <span className="text-[9px] text-[#22c55e] block">DB Pool Saturation</span>
            <span className="font-bold text-[#22c55e]">{activePt.dbPool}%</span>
          </div>

          <div className="p-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20">
            <span className="text-[9px] text-[#f59e0b] block">Worker Queue</span>
            <span className="font-bold text-[#f59e0b]">{activePt.workerQueue}%</span>
          </div>

          <div className="p-1 rounded bg-[#ef4444]/10 border border-[#ef4444]/20">
            <span className="text-[9px] text-[#ef4444] block">Gateway 504 Errors</span>
            <span className="font-bold text-[#ef4444]">{activePt.gateway504}%</span>
          </div>

          <div className="p-1 rounded bg-white/10 border border-white/15 col-span-2 sm:col-span-1">
            <span className="text-[9px] text-white/60 block">Payment Lag</span>
            <span className="font-bold text-white">{activePt.paymentLag}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

