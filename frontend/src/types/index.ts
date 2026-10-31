/**
 * AEGIS Frontend Type Definitions.
 * Strictly mirrors verified backend Pydantic models from backend/app/schemas/.
 * Undocumented or flexible payloads use explicit unknown types rather than any.
 */

// -------------------------------------------------------------
// Core System & Health Types
// -------------------------------------------------------------

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
}

export interface ApiClientError {
  name: string;
  message: string;
  status?: number;
  details?: unknown;
}

// -------------------------------------------------------------
// Telemetry & Evidence Normalization Types
// -------------------------------------------------------------

export interface DataQualityWarning {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | string;
  message: string;
  event_id: string | null;
  field_name: string | null;
  action_taken: string;
}

export interface NormalizedEvent {
  id: string;
  raw_id: string;
  service: string;
  original_timestamp: string;
  recorded_datetime: string;
  corrected_datetime: string;
  uncertainty_seconds: number;
  time_interval_start: string;
  time_interval_end: string;
  severity: "INFO" | "WARN" | "ERROR" | "CRITICAL" | string;
  event_type: string;
  message: string;
  trace_id: string | null;
  metadata: Record<string, unknown>;
  is_duplicate: boolean;
  duplicate_of: string | null;
  data_quality_warnings: DataQualityWarning[];
  clock_correction_applied: boolean;
  offset_applied_seconds: number;
}

export interface LogsResponse {
  total_count: number;
  returned_count: number;
  clock_correction_active: boolean;
  applied_offsets: Record<string, number>;
  warnings_count: number;
  data_quality_warnings: DataQualityWarning[];
  events: NormalizedEvent[];
}

export interface LogsFilterParams {
  service?: string;
  severity?: string;
  trace_id?: string;
  apply_clock_correction?: boolean;
}

// -------------------------------------------------------------
// Service Architecture & Dependency Topology Types
// -------------------------------------------------------------

export interface ServiceItem {
  id: string;
  name: string;
  tier: "edge" | "security" | "core_business" | "integration" | "data_persistence" | string;
  technology?: string;
  criticality?: string;
  description?: string;
}

export interface ServicesResponse {
  system_name: string;
  environment: string;
  total_services: number;
  services: ServiceItem[];
}

export interface ServiceNode {
  id: string;
  name: string;
  tier: string;
  description: string;
  event_count: number;
  highest_severity: "NORMAL" | "INFO" | "WARN" | "ERROR" | "CRITICAL" | string;
  event_ids: string[];
}

export type EdgeType = "KNOWN_DEPENDENCY" | "INFERRED_CAUSAL";

export interface DependencyEdge {
  source: string;
  target: string;
  edge_type: EdgeType;
  protocol: string | null;
  is_synchronous: boolean | null;
  inferred_confidence: number | null;
  reasoning: string | null;
}

export interface DependenciesResponse {
  nodes: ServiceNode[];
  edges: DependencyEdge[];
  total_nodes: number;
  total_edges: number;
  critical_services: string[];
}

// -------------------------------------------------------------
// Timeline & Investigation Types
// -------------------------------------------------------------

export type ClaimType =
  | "OBSERVED_FACT"
  | "DERIVED_RESULT"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "SIMULATED_RESULT";

export interface TimelineEvent {
  timeline_id: string;
  event_id: string;
  service: string;
  corrected_timestamp: string;
  uncertainty_seconds: number;
  interval_start: string;
  interval_end: string;
  severity: string;
  summary: string;
  claim_type: ClaimType | string;
  correlated_trace_ids: string[];
  uncertain_ordering_with: string[];
}

export interface EvidenceReference {
  evidence_id: string;
  event_id: string;
  source_service: string;
  support_type: "PRIMARY_OBSERVATION" | "CORROBORATING" | "CONTRADICTORY" | string;
  excerpt: string;
  timestamp: string;
  claim_type: ClaimType | string;
}

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  suspected_root_cause_service: string;
  claim_type: ClaimType | string;
  confidence_score: number;
  supporting_evidence: EvidenceReference[];
  contradicting_evidence: EvidenceReference[];
  plausibility_reasoning: string;
  status: "UNDER_EVALUATION" | "CONFIRMED_ROOT_CAUSE" | "REFUTED" | "PLAUSIBLE_CONTRIBUTOR" | string;
}

export interface InvestigationResult {
  investigation_id: string;
  incident_name: string;
  status: string;
  generated_at: string;
  total_raw_events: number;
  total_normalized_events: number;
  data_quality_warnings_count: number;
  hypotheses: Hypothesis[];
  timeline: TimelineEvent[];
  warnings: DataQualityWarning[];
  service_graph_summary: Record<string, unknown>;
}

