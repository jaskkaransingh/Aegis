/**
 * AEGIS Service Topology Explorer Types.
 * Strictly separates raw backend API response contracts from React Flow rendering state.
 */

import type { Node, Edge } from "@xyflow/react";

// ------------------------------------------------------------------
// Raw Backend Contracts
// ------------------------------------------------------------------

export interface BackendServiceRaw {
  id: string;
  name: string;
  status?: string;
  tier?: string;
  description?: string;
}

export interface BackendDependencyEdgeRaw {
  source: string;
  target: string;
  edge_type?: string;
  protocol?: string | null;
  is_synchronous?: boolean | null;
  inferred_confidence?: number | null;
  reasoning?: string | null;
}

export interface BackendDependencyNodeRaw {
  id: string;
  name?: string;
  tier?: string;
  description?: string;
  highest_severity?: string;
  event_count?: number;
  event_ids?: string[];
}

export interface BackendDependenciesRaw {
  nodes?: BackendDependencyNodeRaw[];
  edges?: BackendDependencyEdgeRaw[];
  total_nodes?: number;
  total_edges?: number;
  critical_services?: string[];
}

// ------------------------------------------------------------------
// Normalized Graph Domain Models
// ------------------------------------------------------------------

export type TopologyNodeStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "CRITICAL"
  | "WARNING"
  | "UNKNOWN";

export type ServiceTier =
  | "edge"
  | "security"
  | "core_business"
  | "integration"
  | "data_persistence"
  | "dynamic"
  | "unknown";

export type TopologyEdgeType =
  | "KNOWN_DEPENDENCY"
  | "INFERRED_CAUSAL"
  | "UNSPECIFIED";

export interface TopologyNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  tier: ServiceTier | string;
  status: TopologyNodeStatus;
  isAffected: boolean;
  description: string;
  observedSymptom?: string;
  eventCount: number;
  highestSeverity: string;
  incomingDependencies: string[]; // Caller services (who depends on this)
  outgoingDependencies: string[]; // Callee services (what this depends on)
  isSelected: boolean;
  isNeighbor: boolean;
  isDimmed: boolean;
  dataSource: "live" | "demo";
}

export interface TopologyEdgeData extends Record<string, unknown> {
  id: string;
  source: string;
  target: string;
  edgeType: TopologyEdgeType;
  protocol?: string | null;
  isSynchronous?: boolean | null;
  inferredConfidence?: number | null;
  reasoning?: string | null;
  evidenceCitation?: string | null;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export type TopologyGraphNode = Node<TopologyNodeData, "serviceNode">;
export type TopologyGraphEdge = Edge<TopologyEdgeData>;

// ------------------------------------------------------------------
// UI State & Filter Models
// ------------------------------------------------------------------

export interface TopologyFilters {
  searchQuery: string;
  statusFilter: "ALL" | TopologyNodeStatus;
  affectedOnly: boolean;
  edgeTypeFilter: "ALL" | TopologyEdgeType;
  tierFilter: "ALL" | ServiceTier | string;
}

export interface TopologySummary {
  totalServices: number;
  totalDependencies: number;
  affectedServicesCount: number;
  degradedOrCriticalCount: number;
  dataSource: "live" | "demo";
  lastFetched: string | null;
}

