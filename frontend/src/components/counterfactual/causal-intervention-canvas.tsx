"use client";

import React, { useState, useEffect } from "react";
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
  Play,
  Pause,
  RotateCcw,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export interface CausalInterventionCanvasProps {
  selectedTargetId: string;
  onSelectTarget: (serviceId: string) => void;
  onApplyPreset: (preset: {
    name: string;
    targetId: string;
    action: string;
    assumptions: string;
  }) => void;
}

const PRESETS = [
  {
    id: "preset-lock",
    name: "Schema Index Lock Bypass",
    targetId: "postgresql-database",
    action: "PREVENT_EVENT",
    assumptions: "PostgreSQL unindexed schema migration executed with concurrent index creation without exclusive table lock.",
    badge: "TARGET: POSTGRESQL",
    desc: "Prevents exclusive row lock contention on patient table",
  },
  {
    id: "preset-cb",
    name: "Auth Circuit Breaker",
    targetId: "auth-service",
    action: "ADD_CIRCUIT_BREAKER",
    assumptions: "Auth service trips circuit breaker after 3 DB timeouts, fast-failing token verifications to prevent worker exhaustion.",
    badge: "TARGET: AUTH SERVICE",
    desc: "Isolates upstream gateway from thread exhaustion",
  },
  {
    id: "preset-pool",
    name: "Connection Pool Auto-Scaling",
    targetId: "postgresql-database",
    action: "SCALE_UP",
    assumptions: "Dynamic pool expansion increases pool capacity from 100 to 500 connections under sudden queue pressure.",
    badge: "TARGET: DB POOL",
    desc: "Buffers surge queue to maintain nominal query flow",
  },
  {
    id: "preset-timeout",
    name: "Gateway Graceful Degrade",
    targetId: "api-gateway",
    action: "ISOLATE",
    assumptions: "API Gateway returns cached degraded profiles instead of awaiting downstream timeout cascade.",
    badge: "TARGET: API GATEWAY",
    desc: "Sheds 504 errors at public edge tier",
  },
];

interface ServiceStage {
  id: string;
  name: string;
  role: string;
  icon: typeof Server;
  baseline: {
    status: "CRITICAL" | "DEGRADED" | "HEALTHY";
    metric: string;
    detail: string;
  };
  simulated: {
    status: "HEALTHY";
    metric: string;
    detail: string;
  };
}

const SERVICES: ServiceStage[] = [
  {
    id: "client-traffic",
    name: "Client Ingress",
    role: "Edge Entry",
    icon: Globe,
    baseline: {
      status: "DEGRADED",
      metric: "1,420 req/s",
      detail: "Elevated retry storms",
    },
    simulated: {
      status: "HEALTHY",
      metric: "1,420 req/s",
      detail: "Clean traffic stream",
    },
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    role: "Public Routing",
    icon: Network,
    baseline: {
      status: "CRITICAL",
      metric: "94.2% 504 Timeout",
      detail: "P99: 14,200 ms",
    },
    simulated: {
      status: "HEALTHY",
      metric: "0.0% Errors",
      detail: "P99: 128 ms",
    },
  },
  {
    id: "auth-service",
    name: "Auth Service",
    role: "Session & Token",
    icon: Lock,
    baseline: {
      status: "CRITICAL",
      metric: "Workers 100% Sat",
      detail: "Thread queue full",
    },
    simulated: {
      status: "HEALTHY",
      metric: "Workers 22% Sat",
      detail: "Active token validation",
    },
  },
  {
    id: "appointment-service",
    name: "Appointment Service",
    role: "Core Booking",
    icon: Cpu,
    baseline: {
      status: "DEGRADED",
      metric: "503 Backpressure",
      detail: "DB Pool drained",
    },
    simulated: {
      status: "HEALTHY",
      metric: "200 OK Nominal",
      detail: "DB calls non-blocking",
    },
  },
  {
    id: "postgresql-database",
    name: "PostgreSQL Database",
    role: "Data Persistence",
    icon: Database,
    baseline: {
      status: "CRITICAL",
      metric: "100/100 Pool Locked",
      detail: "Exclusive row lock",
    },
    simulated: {
      status: "HEALTHY",
      metric: "14/100 Pool Used",
      detail: "Intervention active",
    },
  },
];

export function CausalInterventionCanvas({
  selectedTargetId,
  onSelectTarget,
  onApplyPreset,
}: CausalInterventionCanvasProps) {
  const [mode, setMode] = useState<"baseline" | "fork">("fork");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeStep, setTimeStep] = useState<number>(25); // 0 to 45 seconds

  // Auto-playback simulation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeStep((prev) => (prev >= 45 ? 0 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden text-xs text-white">
      {/* Top HUD Control Bar */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-white shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                Causal Intervention & Cascade Simulator
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20">
                INTERACTIVE 2D HUD
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              Simulate hypothetical interventions against the observed microservice failure cascade.
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/60 border border-white/15">
          <button
            type="button"
            onClick={() => setMode("baseline")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              mode === "baseline"
                ? "bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/30"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>OBSERVED CASCADE</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("fork")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              mode === "fork"
                ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/30"
                : "text-white/60 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>COUNTERFACTUAL FORK</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Topology Pipeline Canvas */}
      <div className="p-5 space-y-5">
        {/* Playback Scrubber & Timeline Bar */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors shrink-0"
            title={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setTimeStep(0)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors shrink-0"
            title="Reset to T+00s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-[11px] font-bold text-white shrink-0 min-w-[56px]">
              T+{timeStep < 10 ? `0${timeStep}` : timeStep}s
            </span>
            <input
              type="range"
              min={0}
              max={45}
              value={timeStep}
              onChange={(e) => {
                setTimeStep(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full accent-white cursor-pointer h-1.5 bg-white/15 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-white/50 shrink-0 hidden sm:inline">
              T+45s (Cascade Peak)
            </span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border shrink-0 ${
              mode === "baseline"
                ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]"
                : "bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]"
            }`}
          >
            {mode === "baseline" ? "OUTAGE IN PROGRESS" : "CASCADE PREVENTED"}
          </div>
        </div>

        {/* Visual Node Chain */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
            {SERVICES.map((svc, idx) => {
              const isTarget = selectedTargetId === svc.id;
              const isDatabase = svc.id === "postgresql-database";
              const Icon = svc.icon;

              const state = mode === "baseline" ? svc.baseline : svc.simulated;
              const isCritical = state.status === "CRITICAL";
              const isDegraded = state.status === "DEGRADED";

              return (
                <div
                  key={svc.id}
                  onClick={() => onSelectTarget(svc.id)}
                  className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isTarget
                      ? "bg-white/10 border-white shadow-xl shadow-white/10 ring-2 ring-white/60"
                      : isCritical
                      ? "bg-red-950/30 border-[#ef4444]/50 hover:border-[#ef4444]"
                      : isDegraded
                      ? "bg-amber-950/20 border-[#f59e0b]/40 hover:border-[#f59e0b]"
                      : "bg-emerald-950/20 border-[#22c55e]/30 hover:border-[#22c55e]/70"
                  }`}
                >
                  {/* Top Row: Tier Icon & Step Indicator */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div
                      className={`p-1.5 rounded-lg border ${
                        mode === "baseline" && (isCritical || isDegraded)
                          ? "bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]"
                          : "bg-[#22c55e]/20 border-[#22c55e]/40 text-[#22c55e]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="font-mono text-[10px] text-white/50">
                      NODE 0{idx + 1}
                    </span>
                  </div>

                  {/* Service Title */}
                  <div className="space-y-0.5 mb-3">
                    <h3 className="font-bold text-white text-xs tracking-tight truncate">
                      {svc.name}
                    </h3>
                    <p className="font-mono text-[10px] text-white/60 truncate">
                      {svc.role}
                    </p>
                  </div>

                  {/* Telemetry Status Box */}
                  <div
                    className={`p-2.5 rounded-lg border font-mono text-[11px] space-y-1 ${
                      mode === "baseline" && isCritical
                        ? "bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]"
                        : mode === "baseline" && isDegraded
                        ? "bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#f59e0b]"
                        : "bg-[#22c55e]/15 border-[#22c55e]/30 text-[#22c55e]"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{state.metric}</span>
                      {mode === "baseline" && (isCritical || isDegraded) ? (
                        <AlertOctagon className="w-3 h-3 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-white/70 truncate font-sans">
                      {state.detail}
                    </div>
                  </div>

                  {/* Target Indicator Pill */}
                  {isTarget && (
                    <div className="mt-2.5 pt-2 border-t border-white/20 text-center">
                      <span className="font-mono text-[9px] uppercase font-bold text-white tracking-widest bg-white/20 px-2 py-0.5 rounded">
                        SELECTED INTERVENTION TARGET
                      </span>
                    </div>
                  )}

                  {/* Intervention Tag on Database */}
                  {isDatabase && mode === "fork" && (
                    <div className="mt-2.5 pt-2 border-t border-[#22c55e]/40 text-center">
                      <span className="font-mono text-[9px] uppercase font-bold text-[#22c55e] tracking-widest bg-[#22c55e]/20 px-2 py-0.5 rounded border border-[#22c55e]/40">
                        ⚡ FORK INJECTED
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Visual Telemetry Delta Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Gauge 1: P99 Latency */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 uppercase">P99 Gateway Latency</span>
              <span
                className={`font-bold ${
                  mode === "baseline" ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}
              >
                {mode === "baseline" ? "14,200 ms" : "128 ms"}
              </span>
            </div>
            {/* Split Bar */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === "baseline" ? "w-[100%] bg-[#ef4444]" : "w-[3%] bg-[#22c55e]"
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Nominal: 120ms</span>
              <span>{mode === "baseline" ? "TIMEOUT CASCADE" : "-99.1% LATENCY"}</span>
            </div>
          </div>

          {/* Gauge 2: Connection Pool Saturation */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 uppercase">DB Pool Saturation</span>
              <span
                className={`font-bold ${
                  mode === "baseline" ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}
              >
                {mode === "baseline" ? "100 / 100 (MAX)" : "14 / 100 (NOMINAL)"}
              </span>
            </div>
            {/* Split Bar */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === "baseline" ? "w-[100%] bg-[#ef4444]" : "w-[14%] bg-[#22c55e]"
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Cap: 100 conns</span>
              <span>{mode === "baseline" ? "THREAD STARVATION" : "86% HEADROOM"}</span>
            </div>
          </div>

          {/* Gauge 3: 504 Error Rate */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 uppercase">HTTP 504 Error Rate</span>
              <span
                className={`font-bold ${
                  mode === "baseline" ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}
              >
                {mode === "baseline" ? "94.2% FAILING" : "0.0% FAILING"}
              </span>
            </div>
            {/* Split Bar */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  mode === "baseline" ? "w-[94%] bg-[#ef4444]" : "w-[0%] bg-[#22c55e]"
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>SLO Target: &lt;0.05%</span>
              <span>{mode === "baseline" ? "SEV-1 OUTAGE" : "100% HEALTHY"}</span>
            </div>
          </div>

          {/* Gauge 4: Cascade Blast Radius */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60 uppercase">Blast Radius</span>
              <span
                className={`font-bold ${
                  mode === "baseline" ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}
              >
                {mode === "baseline" ? "4 SERVICES" : "0 SERVICES"}
              </span>
            </div>
            {/* Segmented Bar */}
            <div className="grid grid-cols-4 gap-1 h-2">
              {[0, 1, 2, 3].map((seg) => (
                <div
                  key={seg}
                  className={`h-full rounded-sm transition-all duration-500 ${
                    mode === "baseline" ? "bg-[#ef4444]" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Scope: Microservices</span>
              <span>{mode === "baseline" ? "UNCONTAINED" : "ISOLATED"}</span>
            </div>
          </div>
        </div>

        {/* 1-Click Tactical Intervention Preset Buttons */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              1-Click Tactical Intervention Scenarios (Click to Inject)
            </span>
            <span className="text-[10px] text-white/50 font-mono">
              Instantly simulates alternative causal pathway
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onApplyPreset({
                    name: preset.name,
                    targetId: preset.targetId,
                    action: preset.action,
                    assumptions: preset.assumptions,
                  });
                  setMode("fork");
                }}
                className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/30 text-left transition-all duration-150 flex flex-col justify-between space-y-2 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/80 border border-white/15">
                      {preset.badge}
                    </span>
                    <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="font-bold text-white text-xs group-hover:text-white tracking-tight">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed font-sans line-clamp-2">
                  {preset.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

