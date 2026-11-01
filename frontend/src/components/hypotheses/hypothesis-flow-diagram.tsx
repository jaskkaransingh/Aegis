"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  Layers,
  Lock,
  Network,
  RotateCcw,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export function HypothesisFlowDiagram() {
  const [activeTheory, setActiveTheory] = useState<"H2" | "H1" | "H3">("H2");
  const [selectedNode, setSelectedNode] = useState<string | null>("db");

  return (
    <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white">
      {/* Top Header & Theory Switcher */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
            <Network className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                Interactive Causal Propagation Flowdiagram
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                WORKING FLOW SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-white/60">
              Select a competing hypothesis to simulate its causal path through the service mesh.
            </p>
          </div>
        </div>

        {/* 3 Theory Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/15">
          <button
            type="button"
            onClick={() => {
              setActiveTheory("H2");
              setSelectedNode("db");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTheory === "H2"
                ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span>H2: DB POOL LOCK</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 text-black">88%</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTheory("H1");
              setSelectedNode("ingress");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTheory === "H1"
                ? "bg-[#f59e0b] text-black shadow-lg shadow-[#f59e0b]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span>H1: RETRY STORM</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 text-black">65%</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTheory("H3");
              setSelectedNode("payment");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTheory === "H3"
                ? "bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/20"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span>H3: PAYMENT SKEW</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-white/20 text-white">18%</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Flow Canvas */}
      <div className="p-5 space-y-4">
        {/* Working Flowdiagram Canvas */}
        <div className="relative w-full h-[280px] rounded-xl bg-black/40 border border-white/10 overflow-hidden select-none">
          {/* Animated SVG Connection Lines & Data Flow Packets */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="flow-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="flow-red" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="flow-amber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Path 1: Client Ingress -> API Gateway */}
            <path
              d="M 120 130 L 250 130"
              stroke={activeTheory === "H1" ? "#f59e0b" : "rgba(255,255,255,0.2)"}
              strokeWidth={activeTheory === "H1" ? "3" : "1.5"}
              strokeDasharray={activeTheory === "H1" ? "4 4" : "none"}
              className={activeTheory === "H1" ? "animate-pulse" : ""}
            />

            {/* Path 2: API Gateway -> Auth Service */}
            <path
              d="M 330 110 C 370 70, 420 70, 460 70"
              fill="none"
              stroke={activeTheory === "H2" ? "#ef4444" : "rgba(255,255,255,0.2)"}
              strokeWidth={activeTheory === "H2" ? "2.5" : "1.5"}
            />

            {/* Path 3: API Gateway -> Appointment Service */}
            <path
              d="M 330 150 C 370 190, 420 190, 460 190"
              fill="none"
              stroke={activeTheory === "H2" ? "#ef4444" : activeTheory === "H1" ? "#f59e0b" : "rgba(255,255,255,0.2)"}
              strokeWidth={activeTheory === "H2" || activeTheory === "H1" ? "2.5" : "1.5"}
            />

            {/* Path 4: Auth Service -> PostgreSQL DB */}
            <path
              d="M 560 70 C 600 70, 650 110, 690 120"
              fill="none"
              stroke={activeTheory === "H2" ? "#ef4444" : "rgba(255,255,255,0.2)"}
              strokeWidth={activeTheory === "H2" ? "3" : "1.5"}
            />

            {/* Path 5: Appointment Service -> PostgreSQL DB */}
            <path
              d="M 560 190 C 600 190, 650 150, 690 140"
              fill="none"
              stroke={activeTheory === "H2" ? "#ef4444" : "rgba(255,255,255,0.2)"}
              strokeWidth={activeTheory === "H2" ? "3" : "1.5"}
            />

            {/* Path 6: Appointment Service -> Payment Service (Branch) */}
            <path
              d="M 560 190 L 700 230"
              fill="none"
              stroke={activeTheory === "H3" ? "#ef4444" : "rgba(255,255,255,0.15)"}
              strokeWidth={activeTheory === "H3" ? "2.5" : "1"}
              strokeDasharray={activeTheory === "H3" ? "3 3" : "2 2"}
            />
          </svg>

          {/* Interactive Flow Nodes */}
          {/* Node 1: Client Ingress */}
          <div
            onClick={() => setSelectedNode("ingress")}
            style={{ left: "20px", top: "95px" }}
            className={`absolute w-24 p-2.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "ingress"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H1"
                ? "bg-amber-950/40 border-[#f59e0b] shadow-lg shadow-[#f59e0b]/20"
                : "bg-black/60 border-white/15 hover:border-white/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-white/60">
              <Globe className="w-3 h-3 text-white" />
              <span>INGRESS</span>
            </div>
            <div className="font-bold text-white text-[11px] truncate">Client Traffic</div>
            <div className="font-mono text-[9px] text-white/50 mt-0.5">1,420 req/s</div>
          </div>

          {/* Node 2: API Gateway */}
          <div
            onClick={() => setSelectedNode("gateway")}
            style={{ left: "240px", top: "95px" }}
            className={`absolute w-28 p-2.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "gateway"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H2"
                ? "bg-red-950/40 border-[#ef4444] shadow-lg shadow-[#ef4444]/20"
                : "bg-black/60 border-white/15 hover:border-white/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-white/60">
              <Network className="w-3 h-3 text-white" />
              <span>EDGE ROUTER</span>
            </div>
            <div className="font-bold text-white text-[11px] truncate">API Gateway</div>
            <div className="font-mono text-[9px] text-[#ef4444] mt-0.5">504 Cascading</div>
          </div>

          {/* Node 3: Auth Service */}
          <div
            onClick={() => setSelectedNode("auth")}
            style={{ left: "450px", top: "35px" }}
            className={`absolute w-32 p-2.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "auth"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H2"
                ? "bg-red-950/30 border-[#ef4444]/60"
                : "bg-black/60 border-white/15 hover:border-white/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-white/60">
              <Lock className="w-3 h-3 text-white" />
              <span>SESSION / AUTH</span>
            </div>
            <div className="font-bold text-white text-[11px] truncate">Auth Service</div>
            <div className="font-mono text-[9px] text-[#f59e0b] mt-0.5">Workers 100% Sat</div>
          </div>

          {/* Node 4: Appointment Service */}
          <div
            onClick={() => setSelectedNode("appointment")}
            style={{ left: "450px", top: "155px" }}
            className={`absolute w-32 p-2.5 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "appointment"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H2"
                ? "bg-red-950/30 border-[#ef4444]/60"
                : "bg-black/60 border-white/15 hover:border-white/40"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-white/60">
              <Cpu className="w-3 h-3 text-white" />
              <span>CORE SERVICE</span>
            </div>
            <div className="font-bold text-white text-[11px] truncate">Appointment Svc</div>
            <div className="font-mono text-[9px] text-[#f59e0b] mt-0.5">DB Pool Timeout</div>
          </div>

          {/* Node 5: PostgreSQL Database (ROOT CAUSE) */}
          <div
            onClick={() => setSelectedNode("db")}
            style={{ left: "680px", top: "95px" }}
            className={`absolute w-36 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "db"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H2"
                ? "bg-emerald-950/40 border-[#22c55e] shadow-xl shadow-[#22c55e]/20 ring-2 ring-[#22c55e]/60"
                : "bg-black/60 border-white/15 hover:border-white/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/60">
                <Database className="w-3.5 h-3.5 text-white" />
                <span>PERSISTENCE</span>
              </div>
              {activeTheory === "H2" && (
                <span className="font-mono text-[8px] font-bold px-1 rounded bg-[#22c55e] text-black">
                  ROOT
                </span>
              )}
            </div>
            <div className="font-bold text-white text-xs truncate">PostgreSQL DB</div>
            <div className="font-mono text-[10px] text-[#ef4444] mt-0.5 font-bold">100/100 Locked</div>
          </div>

          {/* Node 6: Payment Service (Branch) */}
          <div
            onClick={() => setSelectedNode("payment")}
            style={{ left: "680px", top: "205px" }}
            className={`absolute w-36 p-2 rounded-xl border cursor-pointer transition-all ${
              selectedNode === "payment"
                ? "bg-white/20 border-white ring-2 ring-white/50"
                : activeTheory === "H3"
                ? "bg-red-950/50 border-[#ef4444] shadow-lg shadow-[#ef4444]/20"
                : "bg-black/40 border-white/10 opacity-70 hover:opacity-100"
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-white/50">LEAF SERVICE</span>
              <span className="text-[8px] font-mono px-1 rounded bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 font-bold">
                +120s SKEW
              </span>
            </div>
            <div className="font-bold text-white text-[11px] truncate">Payment Service</div>
            <div className="font-mono text-[9px] text-white/50 mt-0.5">Lag at 14:01:00 UTC</div>
          </div>
        </div>

        {/* Dynamic Telemetry HUD Bar based on Selected Node & Theory */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white/50 uppercase text-[10px]">Causal Diagnosis:</span>
            {activeTheory === "H2" && (
              <span className="text-white flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <span>H2 Validated: Schema lock at PostgreSQL DB exhausted pool $\rightarrow$ propagated upstream in 6.7s</span>
              </span>
            )}
            {activeTheory === "H1" && (
              <span className="text-white flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                <span>H1 Plausible: Unthrottled client retries amplified backlog, but secondary to DB lock</span>
              </span>
            )}
            {activeTheory === "H3" && (
              <span className="text-white flex items-center gap-1.5 font-bold">
                <AlertOctagon className="w-4 h-4 text-[#ef4444]" />
                <span>H3 Falsified: Payment delay occurred at 14:01:00 UTC (38s after DB failure), disproving causation</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-white/60">
            <span>Click any node in graph to inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
}

