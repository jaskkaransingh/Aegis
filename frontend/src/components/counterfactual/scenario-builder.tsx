"use client";

import React from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  Network,
  RotateCcw,
  Save,
  Server,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  BaselineIncidentContext,
  CounterfactualAction,
  CounterfactualScenario,
  CounterfactualTargetType,
  ScenarioValidationErrors,
} from "@/types/counterfactual";

interface ScenarioBuilderProps {
  baseline: BaselineIncidentContext;
  currentScenario: Partial<CounterfactualScenario>;
  onChange: (updated: Partial<CounterfactualScenario>) => void;
  onSave: () => void;
  onReset: () => void;
  errors: ScenarioValidationErrors;
}

export function ScenarioBuilder({
  baseline,
  currentScenario,
  onChange,
  onSave,
  onReset,
  errors,
}: ScenarioBuilderProps) {
  const targetType = currentScenario.targetType || "SERVICE";

  return (
    <div className="flex flex-col rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden text-xs text-white/90">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-bold text-white/90">
            Scenario Builder
          </h2>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
          Hypothetical Intervention
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Scenario Name */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Scenario Name *
          </label>
          <input
            type="text"
            value={currentScenario.name || ""}
            onChange={(e) => onChange({ ...currentScenario, name: e.target.value })}
            placeholder="e.g. Without PostgreSQL unindexed query lock"
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 placeholder:text-white/50 focus:outline-none focus:border-white/50 text-xs transition-colors"
          />
          {errors.name && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-sans">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Target Type Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Intervention Target Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px]">
            {(["SERVICE", "EVENT", "CONFIGURATION", "DEPENDENCY"] as CounterfactualTargetType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  let defaultId = "";
                  let defaultLabel = "";
                  if (type === "SERVICE") {
                    defaultId = baseline.affectedServices[0] || "postgresql-database";
                    defaultLabel = defaultId;
                  } else if (type === "EVENT") {
                    defaultId = baseline.events[0]?.id || "EVT-001";
                    defaultLabel = `${defaultId} (${baseline.events[0]?.service || "event"})`;
                  } else if (type === "DEPENDENCY") {
                    defaultId = "appointment-service->postgresql-database";
                    defaultLabel = "Appointment Service → PostgreSQL Database";
                  } else {
                    defaultId = "CONFIG_MAX_CONNECTIONS";
                    defaultLabel = "PostgreSQL max_connections setting";
                  }

                  onChange({
                    ...currentScenario,
                    targetType: type,
                    targetId: defaultId,
                    targetLabel: defaultLabel,
                  });
                }}
                className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                  targetType === type
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white/90"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Target Entity Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Target Selection *
          </label>

          {targetType === "SERVICE" ? (
            <select
              value={currentScenario.targetId || ""}
              onChange={(e) =>
                onChange({
                  ...currentScenario,
                  targetId: e.target.value,
                  targetLabel: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs cursor-pointer font-mono"
            >
              {baseline.affectedServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc} (Affected in baseline)
                </option>
              ))}
            </select>
          ) : targetType === "EVENT" ? (
            <select
              value={currentScenario.targetId || ""}
              onChange={(e) => {
                const found = baseline.events.find((ev) => ev.id === e.target.value);
                onChange({
                  ...currentScenario,
                  targetId: e.target.value,
                  targetLabel: found ? `${found.id} (${found.service}): ${found.message.substring(0, 40)}...` : e.target.value,
                });
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs cursor-pointer font-mono"
            >
              {baseline.events.slice(0, 15).map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.id} [{ev.service}] — {ev.message.substring(0, 50)}...
                </option>
              ))}
            </select>
          ) : targetType === "DEPENDENCY" ? (
            <select
              value={currentScenario.targetId || ""}
              onChange={(e) =>
                onChange({
                  ...currentScenario,
                  targetId: e.target.value,
                  targetLabel: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs cursor-pointer font-mono"
            >
              <option value="appointment-service->postgresql-database">
                appointment-service → postgresql-database (Synchronous DB)
              </option>
              <option value="payment-service->postgresql-database">
                payment-service → postgresql-database (Synchronous DB)
              </option>
              <option value="api-gateway->appointment-service">
                api-gateway → appointment-service (Edge Ingress)
              </option>
            </select>
          ) : (
            <select
              value={currentScenario.targetId || ""}
              onChange={(e) =>
                onChange({
                  ...currentScenario,
                  targetId: e.target.value,
                  targetLabel: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs cursor-pointer font-mono"
            >
              <option value="CONFIG_BATCH_WORKERS">
                Aggressive Worker Batching (PostgreSQL Archival)
              </option>
              <option value="CONFIG_POOL_SIZE">
                Database Max Connection Pool Size (100 → 250)
              </option>
              <option value="CONFIG_CLIENT_RETRY">
                Client SDK Retry Policy (Exponential Backoff vs Zero-backoff)
              </option>
            </select>
          )}

          {errors.target && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-sans">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.target}</span>
            </p>
          )}
        </div>

        {/* Hypothetical Action Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Hypothetical Intervention Action
          </label>
          <select
            value={currentScenario.action || "ASSUME_HEALTHY"}
            onChange={(e) =>
              onChange({
                ...currentScenario,
                action: e.target.value as CounterfactualAction,
              })
            }
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs cursor-pointer font-mono"
          >
            <option value="ASSUME_HEALTHY">Assume target remained healthy (nominal latency)</option>
            <option value="PREVENT_EVENT">Assume target event was prevented from occurring</option>
            <option value="REDUCE_LATENCY">Assume response latency was reduced by 80%</option>
            <option value="REVERT_CONFIG">Revert configuration to safe default parameters</option>
            <option value="ISOLATE_DEPENDENCY">Simulate immediate circuit breaker isolation</option>
          </select>
        </div>

        {/* Assumption Description */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
            Hypothetical Assumption Details *
          </label>
          <textarea
            value={currentScenario.assumptions || ""}
            onChange={(e) =>
              onChange({ ...currentScenario, assumptions: e.target.value })
            }
            rows={3}
            placeholder="Describe the precise hypothesis (e.g. Assume the batch query used an index scan so row locks were held for <10ms instead of 78s)..."
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white/90 placeholder:text-white/50 focus:outline-none focus:border-white/50 text-xs font-sans transition-colors resize-none"
          />
          {errors.assumptions && (
            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-sans">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.assumptions}</span>
            </p>
          )}
        </div>

        {/* Computed Downstream Scope Preview */}
        {currentScenario.downstreamServices && currentScenario.downstreamServices.length > 0 && (
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-[#22c55e] flex items-center gap-1">
              <Network className="w-3 h-3" />
              Computed Downstream Scope ({currentScenario.downstreamServices.length} Services)
            </span>
            <div className="flex flex-wrap gap-1">
              {currentScenario.downstreamServices.map((svc) => (
                <span
                  key={svc}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-[#22c55e] border border-emerald-500/40"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold font-medium text-xs transition-colors shadow-md shadow-white/10"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save as Local Draft</span>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors"
          title="Reset scenario configuration form"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}

