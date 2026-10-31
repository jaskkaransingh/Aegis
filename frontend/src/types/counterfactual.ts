/**
 * AEGIS Counterfactual Lab Types.
 * Models hypothetical "what-if" intervention scenarios, baseline comparative dimensions,
 * and future simulation result contracts without synthetic outcome fabrication.
 */

export type CounterfactualTargetType =
  | "SERVICE"
  | "EVENT"
  | "CONFIGURATION"
  | "DEPENDENCY";

export type CounterfactualAction =
  | "ASSUME_HEALTHY"
  | "PREVENT_EVENT"
  | "REDUCE_LATENCY"
  | "REVERT_CONFIG"
  | "ISOLATE_DEPENDENCY";

export interface CounterfactualScenario {
  id: string;
  name: string;
  targetType: CounterfactualTargetType;
  targetId: string;
  targetLabel: string;
  action: CounterfactualAction;
  assumptions: string;
  downstreamServices: string[];
  status: "DRAFT" | "READY" | "SIMULATION_UNAVAILABLE" | "SIMULATED";
  createdAt: string;
  isLocalDraft: boolean;
}

export interface BaselineIncidentEvent {
  id: string;
  service: string;
  timestamp: string;
  severity: string;
  message: string;
  isOriginating?: boolean;
}

export interface BaselineIncidentContext {
  incidentId: string;
  title: string;
  summary: string;
  affectedServices: string[];
  events: BaselineIncidentEvent[];
  downstreamGraph: Record<string, string[]>; // Service -> callees
  dataSource: "live" | "demo";
}

export interface ScenarioValidationErrors {
  name?: string;
  target?: string;
  assumptions?: string;
}

