"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchBaselineContext,
  INITIAL_DEMO_SCENARIOS,
  computeDownstreamServices,
  validateScenario,
} from "@/lib/counterfactual-adapter";
import type {
  BaselineIncidentContext,
  BaselineIncidentEvent,
  CounterfactualScenario,
  ScenarioValidationErrors,
} from "@/types/counterfactual";
import { CounterfactualHeader } from "@/components/counterfactual/counterfactual-header";
import { CausalInterventionCanvas } from "@/components/counterfactual/causal-intervention-canvas";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe,
  Layers,
  Lock,
  Network,
  RotateCcw,
  Save,
  Server,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

const STRATEGY_PRESETS = [
  {
    id: "preset-index",
    title: "Schema Index Lock Bypass",
    targetId: "postgresql-database",
    action: "PREVENT_EVENT",
    badge: "ROOT CAUSE FIX",
    shortDesc: "Forces concurrent index creation to avoid exclusive table locks during active traffic.",
    assumptions: "PostgreSQL unindexed schema migration executed with concurrent index creation without exclusive table lock.",
    expectedOutcome: "-99.1% latency, 0 connection pool timeouts",
  },
  {
    id: "preset-circuit",
    title: "Auth Service Circuit Breaker",
    targetId: "auth-service",
    action: "CIRCUIT_BREAKER",
    badge: "UPSTREAM ISOLATION",
    shortDesc: "Trips circuit breaker after 3 DB timeouts, fast-failing tokens instead of exhausting worker threads.",
    assumptions: "Auth service trips circuit breaker after 3 DB timeouts, fast-failing token verifications to prevent worker exhaustion.",
    expectedOutcome: "Worker threads protected, isolates downstream DB lock",
  },
  {
    id: "preset-scale",
    title: "Dynamic Pool Auto-Scaling",
    targetId: "postgresql-database",
    action: "SCALE_UP",
    badge: "CAPACITY BUFFER",
    shortDesc: "Dynamically expands connection pool from 100 to 500 connections under sudden queue pressure.",
    assumptions: "Dynamic pool expansion increases pool capacity from 100 to 500 connections under sudden queue pressure.",
    expectedOutcome: "86% pool headroom maintained, prevents thread starvation",
  },
  {
    id: "preset-shed",
    title: "Edge Traffic Graceful Degrade",
    targetId: "api-gateway",
    action: "ISOLATE",
    badge: "EDGE PROTECTION",
    shortDesc: "API Gateway returns cached read-only profiles instead of waiting for 14.2s timeout cascade.",
    assumptions: "API Gateway returns cached degraded profiles instead of awaiting downstream timeout cascade.",
    expectedOutcome: "0 public 504 errors, degrades to read-only mode",
  },
];

const TARGET_SERVICES = [
  {
    id: "postgresql-database",
    name: "PostgreSQL Database",
    role: "Data Persistence",
    icon: Database,
    badge: "PRIMARY CHOKE POINT",
    metric: "100/100 Pool Exhausted",
    detail: "Exclusive row lock held by unindexed schema migration",
  },
  {
    id: "auth-service",
    name: "Auth Service",
    role: "Session & Token",
    icon: Lock,
    badge: "THREAD STARVATION",
    metric: "100% Worker Saturation",
    detail: "Worker queue backed up waiting for DB connections",
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    role: "Public Routing",
    icon: Network,
    badge: "PUBLIC TIMEOUT CASCADE",
    metric: "94.2% 504 Timeouts",
    detail: "P99 latency spiked to 14,200 ms",
  },
  {
    id: "appointment-service",
    name: "Appointment Service",
    role: "Core Booking",
    icon: Cpu,
    badge: "DATABASE DRAIN",
    metric: "503 Backpressure",
    detail: "Patient table queries stalled",
  },
];

export function CounterfactualClient() {
  const searchParams = useSearchParams();
  const initialEventParam = searchParams.get("event") || null;

  const [baseline, setBaseline] = useState<BaselineIncidentContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<CounterfactualScenario[]>(INITIAL_DEMO_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>("DRAFT-01");

  // Workflow State: Step 1 (Target) -> Step 2 (Action) -> Step 3 (Simulation)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(3); // Default to Step 3 so interactive simulator is immediately visible!
  const [viewLayout, setViewLayout] = useState<"guided" | "workbench">("guided");

  // Current Working Scenario Form State
  const [formScenario, setFormScenario] = useState<Partial<CounterfactualScenario>>(INITIAL_DEMO_SCENARIOS[0]);
  const [errors, setErrors] = useState<ScenarioValidationErrors>({});
  const [activePresetId, setActivePresetId] = useState<string>("preset-index");

  // Load Baseline Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBaselineContext();
      setBaseline(data);

      if (initialEventParam) {
        const found = data.events.find((e) => e.id === initialEventParam);
        if (found) {
          const downstream = computeDownstreamServices(found.service, data.downstreamGraph);
          setFormScenario((prev) => ({
            ...prev,
            targetType: "EVENT",
            targetId: found.id,
            targetLabel: `${found.id} (${found.service})`,
            downstreamServices: downstream,
          }));
          setCurrentStep(2);
        }
      }
    } catch {
      // Fallback handled in adapter
    } finally {
      setIsLoading(false);
    }
  }, [initialEventParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Target Selection in Step 1
  const handleSelectTargetService = useCallback(
    (serviceId: string) => {
      if (!baseline) return;
      const downstream = computeDownstreamServices(serviceId, baseline.downstreamGraph);
      setFormScenario((prev) => ({
        ...prev,
        targetType: "SERVICE",
        targetId: serviceId,
        targetLabel: serviceId,
        downstreamServices: downstream,
      }));
    },
    [baseline]
  );

  // Handle Event Selection in Step 1
  const handleSelectEvent = useCallback(
    (ev: BaselineIncidentEvent) => {
      if (!baseline) return;
      const downstream = computeDownstreamServices(ev.service, baseline.downstreamGraph);
      setFormScenario((prev) => ({
        ...prev,
        targetType: "EVENT",
        targetId: ev.id,
        targetLabel: `${ev.id} (${ev.service}): ${ev.message.substring(0, 40)}...`,
        name: `Without ${ev.id} on ${ev.service}`,
        action: "PREVENT_EVENT",
        assumptions: `Hypothesize that event ${ev.id} did not occur.`,
        downstreamServices: downstream,
      }));
    },
    [baseline]
  );

  // Handle Preset Selection in Step 2
  const handleSelectPreset = useCallback(
    (preset: (typeof STRATEGY_PRESETS)[0]) => {
      if (!baseline) return;
      setActivePresetId(preset.id);
      const downstream = computeDownstreamServices(preset.targetId, baseline.downstreamGraph);
      setFormScenario({
        name: preset.title,
        targetType: "SERVICE",
        targetId: preset.targetId,
        targetLabel: preset.targetId,
        action: preset.action as any,
        assumptions: preset.assumptions,
        downstreamServices: downstream,
      });
      setErrors({});
    },
    [baseline]
  );

  // Save Scenario to session history
  const handleSaveDraft = useCallback(() => {
    const valErrors = validateScenario(formScenario);
    setErrors(valErrors);
    if (Object.keys(valErrors).length > 0) return;

    const newId = `DRAFT-0${scenarios.length + 1}`;
    const newScenario: CounterfactualScenario = {
      id: newId,
      name: formScenario.name || "Hypothetical Scenario",
      targetType: formScenario.targetType || "SERVICE",
      targetId: formScenario.targetId || "postgresql-database",
      targetLabel: formScenario.targetLabel || formScenario.targetId || "target",
      action: formScenario.action || "ASSUME_HEALTHY",
      assumptions: formScenario.assumptions || "Simulated intervention applied.",
      downstreamServices: formScenario.downstreamServices || [],
      status: "SIMULATION_UNAVAILABLE",
      createdAt: new Date().toLocaleTimeString(),
      isLocalDraft: true,
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setActiveScenarioId(newId);
    setFormScenario(newScenario);
  }, [formScenario, scenarios]);

  return (
    <div className="space-y-4">
      {/* Persistent Page Header */}
      <CounterfactualHeader
        isLive={baseline?.dataSource === "live"}
        isLoading={isLoading}
        onRefresh={loadData}
        scenarioStatus={currentStep === 3 ? "Simulation completed" : "Draft scenario"}
      />

      {/* Guided 3-Step Tactical Workflow Navigation Bar */}
      <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 p-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stepper Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                currentStep === 1
                  ? "bg-white text-black shadow-lg"
                  : formScenario.targetId
                  ? "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 1
                    ? "bg-black text-white"
                    : formScenario.targetId
                    ? "bg-[#22c55e] text-black"
                    : "bg-white/20 text-white"
                }`}
              >
                {formScenario.targetId && currentStep !== 1 ? "✓" : "1"}
              </span>
              <span>01 // SELECT TARGET</span>
            </button>

            <span className="text-white/30 hidden sm:inline">→</span>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                currentStep === 2
                  ? "bg-white text-black shadow-lg"
                  : formScenario.action
                  ? "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 2
                    ? "bg-black text-white"
                    : formScenario.action
                    ? "bg-[#22c55e] text-black"
                    : "bg-white/20 text-white"
                }`}
              >
                {formScenario.action && currentStep !== 2 ? "✓" : "2"}
              </span>
              <span>02 // CONFIGURE ACTION</span>
            </button>

            <span className="text-white/30 hidden sm:inline">→</span>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                currentStep === 3
                  ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20"
                  : "bg-white/10 text-white hover:bg-white/15 border border-white/15"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 3
                    ? "bg-black text-[#22c55e]"
                    : "bg-white/20 text-white"
                }`}
              >
                3
              </span>
              <span>03 // SIMULATE & COMPARE</span>
            </button>
          </div>

          {/* Right Mode Switch: Guided Wizard vs Studio Workbench */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-white/50 hidden md:inline">
              Layout:
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setViewLayout("guided")}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  viewLayout === "guided"
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Guided Steps
              </button>
              <button
                type="button"
                onClick={() => setViewLayout("workbench")}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  viewLayout === "workbench"
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                All-in-One Studio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKFLOW VIEW 1: GUIDED 3-STEP MODE */}
      {/* ========================================================================= */}
      {viewLayout === "guided" && (
        <div>
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: SELECT TARGET */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 p-5 shadow-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10 border border-white/20">
                      STEP 01 OF 03
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Select Intervention Target
                    </h2>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Choose which microservice or specific logged event in the cascade you want to modify.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition shadow-md"
                >
                  <span>Next: Configure Countermeasure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Microservice Target Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TARGET_SERVICES.map((svc) => {
                  const isSelected = formScenario.targetId === svc.id;
                  const Icon = svc.icon;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => handleSelectTargetService(svc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 select-none ${
                        isSelected
                          ? "bg-white/10 border-white shadow-xl shadow-white/10 ring-2 ring-white/60"
                          : "bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-white">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-mono text-[9px] uppercase font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                            {svc.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-xs">{svc.name}</h3>
                          <p className="text-[10px] text-white/50 font-mono">{svc.role}</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-0.5 font-mono text-[11px]">
                        <div className="font-bold text-[#ef4444]">{svc.metric}</div>
                        <div className="text-[10px] text-white/60 font-sans">{svc.detail}</div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-white/60">
                          {isSelected ? "Selected Target" : "Click to select"}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#22c55e]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Canonical Event Picker Alternative */}
              {baseline && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-white/70 block">
                    Or Target A Concrete Root-Cause Event:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {baseline.events.slice(0, 3).map((ev) => {
                      const isSelected = formScenario.targetId === ev.id;
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => handleSelectEvent(ev)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "bg-white/15 border-white text-white ring-1 ring-white"
                              : "bg-black/40 border-white/10 hover:border-white/20 text-white/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-xs text-white">
                              {ev.id}
                            </span>
                            <span className="text-[9px] font-mono text-white/60 bg-white/10 px-1.5 py-0.2 rounded">
                              {ev.service}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/70 font-sans line-clamp-1">
                            {ev.message}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: CONFIGURE ACTION */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 p-5 shadow-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-white/10 border border-white/20">
                      STEP 02 OF 03
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Configure Countermeasure Strategy
                    </h2>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Target: <strong className="text-white font-mono">{formScenario.targetLabel || formScenario.targetId}</strong>. Pick a tactical countermeasure to simulate.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition border border-white/20"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs transition shadow-lg shadow-[#22c55e]/20"
                  >
                    <span>Run Causal Simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Strategy Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STRATEGY_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 select-none ${
                        isSelected
                          ? "bg-white/10 border-white shadow-xl shadow-white/10 ring-2 ring-white/60"
                          : "bg-black/30 border-white/10 hover:border-white/30 hover:bg-black/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] uppercase font-bold text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded border border-[#22c55e]/30">
                            {preset.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#22c55e]" />}
                        </div>

                        <h3 className="font-bold text-white text-xs">{preset.title}</h3>
                        <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                          {preset.shortDesc}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1 font-mono text-[10px]">
                        <span className="text-white/50 uppercase block">Expected Impact:</span>
                        <span className="text-[#22c55e] font-bold block">{preset.expectedOutcome}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compact Parameters Strip */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60 uppercase">Intervention Parameters:</span>
                  <span className="text-[#22c55e] font-bold">READY TO SIMULATE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Scenario Name
                    </label>
                    <input
                      type="text"
                      value={formScenario.name || ""}
                      onChange={(e) => setFormScenario({ ...formScenario, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-white/50 block mb-1">
                      Core Assumption
                    </label>
                    <input
                      type="text"
                      value={formScenario.assumptions || ""}
                      onChange={(e) => setFormScenario({ ...formScenario, assumptions: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white font-sans text-xs focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: SIMULATION & IMPACT COMPARISON */}
          {/* ------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Interactive Simulation Pipeline & Telemetry Gauges */}
              <CausalInterventionCanvas
                selectedTargetId={formScenario.targetId || "postgresql-database"}
                onSelectTarget={(svcId) => {
                  handleSelectTargetService(svcId);
                  setCurrentStep(2);
                }}
                onApplyPreset={(p) => {
                  if (!baseline) return;
                  const ds = computeDownstreamServices(p.targetId, baseline.downstreamGraph);
                  setFormScenario({
                    name: p.name,
                    targetType: "SERVICE",
                    targetId: p.targetId,
                    targetLabel: p.targetId,
                    action: p.action as any,
                    assumptions: p.assumptions,
                    downstreamServices: ds,
                  });
                }}
              />

              {/* Bottom Quick-Action Dock */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/80 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <span>Simulation: <strong>{formScenario.name || "Custom Fork"}</strong></span>
                  </div>
                  <span className="text-white/30">•</span>
                  <span className="text-xs text-white/60 font-mono">
                    Target: <strong className="text-white">{formScenario.targetLabel || formScenario.targetId}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition border border-white/15"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Change Action</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition border border-white/15"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Target</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Scenario ({scenarios.length})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW VIEW 2: ALL-IN-ONE STUDIO WORKBENCH (SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      {viewLayout === "workbench" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start animate-in fade-in duration-200">
          {/* Left Column (5 cols): Guided Configuration Studio */}
          <div className="lg:col-span-5 space-y-4">
            {/* Target Selector */}
            <div className="p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-3">
              <span className="font-mono text-[10px] uppercase font-bold text-white/60 block">
                01 // Select Target
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_SERVICES.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleSelectTargetService(svc.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formScenario.targetId === svc.id
                        ? "bg-white/15 border-white text-white ring-1 ring-white"
                        : "bg-black/30 border-white/10 hover:border-white/20 text-white/70"
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{svc.name}</div>
                    <div className="text-[10px] text-white/50 font-mono truncate">{svc.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Preset Selector */}
            <div className="p-4 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-3">
              <span className="font-mono text-[10px] uppercase font-bold text-white/60 block">
                02 // Inject Countermeasure
              </span>
              <div className="space-y-2">
                {STRATEGY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                      activePresetId === preset.id
                        ? "bg-white/15 border-white text-white ring-1 ring-white"
                        : "bg-black/30 border-white/10 hover:border-white/20 text-white/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-white">{preset.title}</span>
                      <span className="text-[9px] font-mono text-[#22c55e] font-bold">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 font-sans line-clamp-1">
                      {preset.shortDesc}
                    </p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Local Drafts ({scenarios.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column (7 cols): Interactive Simulation Canvas */}
          <div className="lg:col-span-7">
            <CausalInterventionCanvas
              selectedTargetId={formScenario.targetId || "postgresql-database"}
              onSelectTarget={handleSelectTargetService}
              onApplyPreset={(p) => {
                if (!baseline) return;
                const ds = computeDownstreamServices(p.targetId, baseline.downstreamGraph);
                setFormScenario({
                  name: p.name,
                  targetType: "SERVICE",
                  targetId: p.targetId,
                  targetLabel: p.targetId,
                  action: p.action as any,
                  assumptions: p.assumptions,
                  downstreamServices: ds,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
