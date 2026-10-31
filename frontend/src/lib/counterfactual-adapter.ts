/**
 * AEGIS Counterfactual Lab Adapter.
 * Loads observed baseline incident data from backend APIs or demo fixtures,
 * computes downstream topological impact scopes, and manages local draft scenarios.
 */

import { apiClient } from "./api-client";
import {
  PRIMARY_DEMO_INCIDENT,
  DEMO_NORMALIZED_EVENTS,
  DEMO_SERVICES_STATUS,
} from "./demo-data";
import type {
  BaselineIncidentContext,
  BaselineIncidentEvent,
  CounterfactualScenario,
  ScenarioValidationErrors,
} from "@/types/counterfactual";

// Initial illustrative draft scenarios
export const INITIAL_DEMO_SCENARIOS: CounterfactualScenario[] = [
  {
    id: "DRAFT-01",
    name: "Without PostgreSQL unindexed batch lock",
    targetType: "EVENT",
    targetId: "EVT-001",
    targetLabel: "EVT-001 (Configuration update applied: aggressive worker batching)",
    action: "PREVENT_EVENT",
    assumptions:
      "Assume the unindexed archival batch query was not executed during peak hospital triage hours, preventing RowShareLock table contention.",
    downstreamServices: ["appointment-service", "hospital-records-service", "payment-service", "api-gateway"],
    status: "SIMULATION_UNAVAILABLE",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
    isLocalDraft: true,
  },
  {
    id: "DRAFT-02",
    name: "Assume payment-service remained healthy",
    targetType: "SERVICE",
    targetId: "payment-service",
    targetLabel: "Payment Service",
    action: "ASSUME_HEALTHY",
    assumptions:
      "Hypothesize that Payment Service latency remained steady at <= 150ms and processed patient co-pays without delay.",
    downstreamServices: ["api-gateway"],
    status: "SIMULATION_UNAVAILABLE",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString(),
    isLocalDraft: true,
  },
  {
    id: "DRAFT-03",
    name: "Immediate Appointment circuit breaker trip",
    targetType: "DEPENDENCY",
    targetId: "appointment-service->postgresql-database",
    targetLabel: "Appointment Service → PostgreSQL Database",
    action: "ISOLATE_DEPENDENCY",
    assumptions:
      "Assume circuit breaker isolated database connection pool immediately upon detecting 2000ms query latency, failing fast to preserve worker threads.",
    downstreamServices: ["api-gateway", "notification-service"],
    status: "SIMULATION_UNAVAILABLE",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
    isLocalDraft: true,
  },
];

// Fallback architectural downstream adjacency
const CANONICAL_DOWNSTREAM: Record<string, string[]> = {
  "api-gateway": ["auth-service", "appointment-service", "payment-service", "hospital-records-service"],
  "appointment-service": ["auth-service", "postgresql-database", "payment-service", "notification-service"],
  "payment-service": ["auth-service", "postgresql-database"],
  "hospital-records-service": ["auth-service", "postgresql-database"],
  "notification-service": ["auth-service"],
  "auth-service": ["postgresql-database"],
  "postgresql-database": [],
};

export async function fetchBaselineContext(): Promise<BaselineIncidentContext> {
  let isLive = false;
  let events: BaselineIncidentEvent[] = [];
  const downstreamGraph: Record<string, string[]> = { ...CANONICAL_DOWNSTREAM };
  let affectedServices: string[] = [];

  try {
    const [logsRes, depsRes] = await Promise.allSettled([
      apiClient.getNormalizedLogs(),
      apiClient.getDependencies(),
    ]);

    if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value) && logsRes.value.length > 0) {
      events = logsRes.value.map((ev) => ({
        id: ev.id,
        service: ev.service,
        timestamp: ev.corrected_datetime || ev.recorded_datetime || ev.original_timestamp,
        severity: ev.severity,
        message: ev.message,
        isOriginating: ev.id === "EVT-001",
      }));

      // Extract unique services with critical or error logs
      const affectedSet = new Set<string>();
      logsRes.value.forEach((l) => {
        if (l.severity === "CRITICAL" || l.severity === "ERROR" || l.severity === "WARN") {
          affectedSet.add(l.service);
        }
      });
      affectedServices = Array.from(affectedSet);
      isLive = true;
    }

    if (depsRes.status === "fulfilled" && depsRes.value) {
      const val = depsRes.value as { edges?: Array<{ source: string; target: string }> };
      if (Array.isArray(val.edges)) {
        val.edges.forEach((e) => {
          if (!downstreamGraph[e.source]) downstreamGraph[e.source] = [];
          if (!downstreamGraph[e.source].includes(e.target)) {
            downstreamGraph[e.source].push(e.target);
          }
        });
      }
    }
  } catch {
    isLive = false;
  }

  // Fallback to demonstration fixtures
  if (!isLive || events.length === 0) {
    events = DEMO_NORMALIZED_EVENTS.map((ev) => ({
      id: ev.id,
      service: ev.service,
      timestamp: ev.corrected_datetime,
      severity: ev.severity,
      message: ev.message,
      isOriginating: ev.id === "EVT-001",
    }));

    affectedServices = DEMO_SERVICES_STATUS.filter((s) => s.isAffected).map((s) => s.id);
  }

  return {
    incidentId: "INC-2026-0881",
    title: "Hospital Booking System Outage",
    summary:
      "Database connection pool exhaustion cascaded upstream, causing 504 timeouts at API Gateway and disrupting emergency triage admissions.",
    affectedServices,
    events,
    downstreamGraph,
    dataSource: isLive ? "live" : "demo",
  };
}

export function computeDownstreamServices(
  targetService: string,
  downstreamGraph: Record<string, string[]>
): string[] {
  const visited = new Set<string>();
  const queue = [targetService];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const directCallees = downstreamGraph[current] || [];
    for (const callee of directCallees) {
      if (!visited.has(callee) && callee !== targetService) {
        visited.add(callee);
        queue.push(callee);
      }
    }
  }

  return Array.from(visited);
}

export function validateScenario(scenario: Partial<CounterfactualScenario>): ScenarioValidationErrors {
  const errors: ScenarioValidationErrors = {};

  if (!scenario.name || !scenario.name.trim()) {
    errors.name = "Scenario name is required.";
  } else if (scenario.name.trim().length < 5) {
    errors.name = "Scenario name must be at least 5 characters.";
  }

  if (!scenario.targetId || !scenario.targetId.trim()) {
    errors.target = "A valid target event or service must be selected.";
  }

  if (!scenario.assumptions || !scenario.assumptions.trim()) {
    errors.assumptions = "Description of hypothetical assumption is required.";
  } else if (scenario.assumptions.trim().length < 10) {
    errors.assumptions = "Assumption details must be at least 10 characters.";
  }

  return errors;
}

