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
import { BaselinePanel } from "@/components/counterfactual/baseline-panel";
import { ScenarioBuilder } from "@/components/counterfactual/scenario-builder";
import { ScenarioComparison } from "@/components/counterfactual/scenario-comparison";
import { SimulationResults } from "@/components/counterfactual/simulation-results";
import { ScenarioHistory } from "@/components/counterfactual/scenario-history";

export function CounterfactualClient() {
  const searchParams = useSearchParams();
  const initialEventParam = searchParams.get("event") || null;

  const [baseline, setBaseline] = useState<BaselineIncidentContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<CounterfactualScenario[]>(INITIAL_DEMO_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>("DRAFT-01");

  // Current Working Scenario Form State
  const [formScenario, setFormScenario] = useState<Partial<CounterfactualScenario>>(INITIAL_DEMO_SCENARIOS[0]);
  const [errors, setErrors] = useState<ScenarioValidationErrors>({});
  const [scenarioStatus, setScenarioStatus] = useState<
    "Ready to configure" | "Draft scenario" | "Simulation unavailable" | "Simulation completed"
  >("Simulation unavailable");

  // Load Baseline Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBaselineContext();
      setBaseline(data);

      // If initial event query param provided, target it
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

  // Handle Event Selection from Baseline Panel
  const handleSelectEvent = useCallback(
    (ev: BaselineIncidentEvent) => {
      if (!baseline) return;
      const downstream = computeDownstreamServices(ev.service, baseline.downstreamGraph);
      setFormScenario((prev) => ({
        ...prev,
        targetType: "EVENT",
        targetId: ev.id,
        targetLabel: `${ev.id} (${ev.service}): ${ev.message.substring(0, 45)}...`,
        name: `Without ${ev.id} on ${ev.service}`,
        action: "PREVENT_EVENT",
        assumptions: `Hypothesize that ${ev.id} (${ev.message}) did not occur.`,
        downstreamServices: downstream,
      }));
      setErrors({});
      setScenarioStatus("Draft scenario");
    },
    [baseline]
  );

  // Handle Target Change in Form to re-calculate downstream scope
  const handleFormChange = useCallback(
    (updated: Partial<CounterfactualScenario>) => {
      if (!baseline) {
        setFormScenario(updated);
        return;
      }

      let downstream = updated.downstreamServices || [];
      if (updated.targetType === "SERVICE" && updated.targetId) {
        downstream = computeDownstreamServices(updated.targetId, baseline.downstreamGraph);
      } else if (updated.targetType === "EVENT" && updated.targetId) {
        const ev = baseline.events.find((e) => e.id === updated.targetId);
        if (ev) {
          downstream = computeDownstreamServices(ev.service, baseline.downstreamGraph);
        }
      }

      setFormScenario({
        ...updated,
        downstreamServices: downstream,
      });
      setScenarioStatus("Draft scenario");
    },
    [baseline]
  );

  // Handle Save Local Draft
  const handleSaveDraft = useCallback(() => {
    const valErrors = validateScenario(formScenario);
    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) return;

    const newId = `DRAFT-0${scenarios.length + 1}`;
    const newScenario: CounterfactualScenario = {
      id: newId,
      name: formScenario.name!.trim(),
      targetType: formScenario.targetType || "SERVICE",
      targetId: formScenario.targetId || "unknown",
      targetLabel: formScenario.targetLabel || formScenario.targetId || "target",
      action: formScenario.action || "ASSUME_HEALTHY",
      assumptions: formScenario.assumptions!.trim(),
      downstreamServices: formScenario.downstreamServices || [],
      status: "SIMULATION_UNAVAILABLE",
      createdAt: new Date().toLocaleTimeString(),
      isLocalDraft: true,
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setActiveScenarioId(newId);
    setFormScenario(newScenario);
    setScenarioStatus("Simulation unavailable");
  }, [formScenario, scenarios]);

  // Handle Reset Form
  const handleResetForm = useCallback(() => {
    if (!baseline) return;
    const defaultSvc = baseline.affectedServices[0] || "postgresql-database";
    const downstream = computeDownstreamServices(defaultSvc, baseline.downstreamGraph);

    setFormScenario({
      name: "",
      targetType: "SERVICE",
      targetId: defaultSvc,
      targetLabel: defaultSvc,
      action: "ASSUME_HEALTHY",
      assumptions: "",
      downstreamServices: downstream,
    });
    setErrors({});
    setActiveScenarioId(null);
    setScenarioStatus("Ready to configure");
  }, [baseline]);

  // Handle Select Scenario from History
  const handleSelectScenario = useCallback((scen: CounterfactualScenario) => {
    setActiveScenarioId(scen.id);
    setFormScenario(scen);
    setErrors({});
    setScenarioStatus("Simulation unavailable");
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <CounterfactualHeader
        isLive={baseline?.dataSource === "live"}
        isLoading={isLoading}
        onRefresh={loadData}
        scenarioStatus={scenarioStatus}
      />

      {/* Main Two-Panel Top Grid: Baseline Incident vs Scenario Builder */}
      {baseline && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Baseline Incident Panel */}
          <BaselinePanel
            baseline={baseline}
            selectedEventId={formScenario.targetType === "EVENT" ? formScenario.targetId || null : null}
            onSelectEvent={handleSelectEvent}
          />

          {/* Scenario Builder Form */}
          <ScenarioBuilder
            baseline={baseline}
            currentScenario={formScenario}
            onChange={handleFormChange}
            onSave={handleSaveDraft}
            onReset={handleResetForm}
            errors={errors}
          />
        </div>
      )}

      {/* Comparison Panel: Observed Baseline vs Hypothetical Scenario */}
      {baseline && (
        <ScenarioComparison
          baseline={baseline}
          scenario={formScenario}
        />
      )}

      {/* Simulation Results & Epistemic Boundaries */}
      <SimulationResults
        scenario={formScenario}
      />

      {/* Scenario History & Local Drafts */}
      <ScenarioHistory
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onClearHistory={() => {
          setScenarios([]);
          setActiveScenarioId(null);
        }}
      />
    </div>
  );
}

