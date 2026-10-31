/**
 * AEGIS Service Topology Adapter.
 * Normalizes live backend catalog/dependency responses or falls back to labeled demo data.
 * Computes deterministic hierarchical layout and selection-aware graph states.
 */

import { apiClient } from "./api-client";
import { DEMO_SERVICES_STATUS } from "./demo-data";
import type {
  BackendDependenciesRaw,
  BackendDependencyEdgeRaw,
  BackendDependencyNodeRaw,
  BackendServiceRaw,
  ServiceTier,
  TopologyEdgeData,
  TopologyEdgeType,
  TopologyFilters,
  TopologyGraphEdge,
  TopologyGraphNode,
  TopologyNodeData,
  TopologyNodeStatus,
  TopologySummary,
} from "../types/topology";

// ------------------------------------------------------------------
// Architectural Ground Truth Metadata
// ------------------------------------------------------------------

const CANONICAL_TIERS: Record<string, ServiceTier> = {
  "api-gateway": "edge",
  "appointment-service": "core_business",
  "payment-service": "core_business",
  "hospital-records-service": "core_business",
  "notification-service": "integration",
  "auth-service": "security",
  "postgresql-database": "data_persistence",
};

const CANONICAL_DESCRIPTIONS: Record<string, string> = {
  "api-gateway": "Ingress reverse proxy, TLS termination, and rate limiting",
  "auth-service": "OAuth2 / JWT issuance, token revocation verification, and RBAC",
  "appointment-service": "Doctor schedules, slot reservations, and clinic booking",
  "payment-service": "Patient insurance co-pay processing and billing transactions",
  "hospital-records-service": "Electronic health record (EHR) queries, patient history, admissions",
  "notification-service": "SMS and Email dispatch for patient appointment alerts",
  "postgresql-database": "Primary relational database cluster storing bookings, EHR, and ledgers",
};

// Canonical edge protocols matching backend/app/graph/service_graph.py
const CANONICAL_EDGE_METADATA: Record<string, { protocol: string; isSync: boolean }> = {
  "api-gateway->auth-service": { protocol: "HTTPS/gRPC", isSync: true },
  "api-gateway->appointment-service": { protocol: "HTTPS", isSync: true },
  "api-gateway->payment-service": { protocol: "HTTPS", isSync: true },
  "api-gateway->hospital-records-service": { protocol: "HTTPS", isSync: true },
  "appointment-service->auth-service": { protocol: "gRPC", isSync: true },
  "appointment-service->postgresql-database": { protocol: "PostgreSQL Wire", isSync: true },
  "appointment-service->payment-service": { protocol: "HTTPS", isSync: true },
  "appointment-service->notification-service": { protocol: "RabbitMQ/Async", isSync: false },
  "payment-service->auth-service": { protocol: "gRPC", isSync: true },
  "payment-service->postgresql-database": { protocol: "PostgreSQL Wire", isSync: true },
  "hospital-records-service->auth-service": { protocol: "gRPC", isSync: true },
  "hospital-records-service->postgresql-database": { protocol: "PostgreSQL Wire", isSync: true },
  "notification-service->auth-service": { protocol: "gRPC", isSync: true },
  "auth-service->postgresql-database": { protocol: "PostgreSQL Wire", isSync: true },
};

// ------------------------------------------------------------------
// Demo Architectural Edges (Verified from dependencies.json)
// ------------------------------------------------------------------

const DEMO_DEPENDENCY_EDGES: BackendDependencyEdgeRaw[] = [
  { source: "api-gateway", target: "auth-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "api-gateway", target: "appointment-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "api-gateway", target: "payment-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "api-gateway", target: "hospital-records-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "appointment-service", target: "auth-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "appointment-service", target: "postgresql-database", edge_type: "KNOWN_DEPENDENCY" },
  { source: "appointment-service", target: "payment-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "appointment-service", target: "notification-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "payment-service", target: "auth-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "payment-service", target: "postgresql-database", edge_type: "KNOWN_DEPENDENCY" },
  { source: "hospital-records-service", target: "auth-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "hospital-records-service", target: "postgresql-database", edge_type: "KNOWN_DEPENDENCY" },
  { source: "notification-service", target: "auth-service", edge_type: "KNOWN_DEPENDENCY" },
  { source: "auth-service", target: "postgresql-database", edge_type: "KNOWN_DEPENDENCY" },
  // Explicitly labeled inferred causal link from investigation preview
  {
    source: "postgresql-database",
    target: "appointment-service",
    edge_type: "INFERRED_CAUSAL",
    inferred_confidence: 0.94,
    reasoning: "Unindexed table lock on PostgreSQL caused thread exhaustion cascade in Appointment Service.",
  },
];

// ------------------------------------------------------------------
// Normalization Helpers
// ------------------------------------------------------------------

export function normalizeNodeStatus(rawStatus?: string): TopologyNodeStatus {
  if (!rawStatus) return "UNKNOWN";
  const upper = rawStatus.toUpperCase();
  if (upper === "HEALTHY") return "HEALTHY";
  if (upper === "DEGRADED") return "DEGRADED";
  if (upper === "CRITICAL") return "CRITICAL";
  if (upper === "WARNING" || upper === "WARN") return "WARNING";
  return "UNKNOWN";
}

export function normalizeEdgeType(rawType?: string): TopologyEdgeType {
  if (!rawType) return "UNSPECIFIED";
  const upper = rawType.toUpperCase();
  if (upper === "KNOWN_DEPENDENCY") return "KNOWN_DEPENDENCY";
  if (upper === "INFERRED_CAUSAL") return "INFERRED_CAUSAL";
  return "UNSPECIFIED";
}

// ------------------------------------------------------------------
// Fetch and Assemble Graph
// ------------------------------------------------------------------

export interface RawTopologyPayload {
  nodes: TopologyNodeData[];
  edges: TopologyEdgeData[];
  summary: TopologySummary;
}

export async function fetchTopologyGraph(): Promise<RawTopologyPayload> {
  let isLive = false;
  let rawServices: BackendServiceRaw[] = [];
  let rawDependencies: BackendDependencyEdgeRaw[] = [];
  let previewGraph: BackendDependenciesRaw | null = null;

  try {
    const [servicesRes, depsRes] = await Promise.allSettled([
      apiClient.getServices(),
      apiClient.getDependencies(),
    ]);

    // Parse Services Response
    if (servicesRes.status === "fulfilled" && servicesRes.value) {
      const val = servicesRes.value as unknown as Record<string, unknown>;
      if (Array.isArray(val)) {
        rawServices = val as BackendServiceRaw[];
        isLive = true;
      } else if (Array.isArray(val.services)) {
        rawServices = val.services as BackendServiceRaw[];
        isLive = true;
      }
    }

    // Parse Dependencies Response
    if (depsRes.status === "fulfilled" && depsRes.value) {
      const val = depsRes.value as unknown as BackendDependenciesRaw & { edges?: BackendDependencyEdgeRaw[] };
      if (Array.isArray(val.edges)) {
        rawDependencies = val.edges;
        isLive = true;
      } else if (Array.isArray(depsRes.value as unknown)) {
        rawDependencies = depsRes.value as unknown as BackendDependencyEdgeRaw[];
        isLive = true;
      }
    }

    // Optionally attempt preview for enriched incident stats
    try {
      const previewRes = await apiClient.getInvestigationPreview();
      if (previewRes && previewRes.service_graph_summary) {
        previewGraph = previewRes.service_graph_summary as unknown as BackendDependenciesRaw;
      }
    } catch {
      // preview endpoint is optional
    }
  } catch {
    isLive = false;
  }

  // Fallback to Demonstration Graph if live fetch yielded no valid services or edges
  if (!isLive || rawServices.length === 0 || rawDependencies.length === 0) {
    return assembleDemonstrationGraph();
  }

  return assembleLiveGraph(rawServices, rawDependencies, previewGraph);
}

function assembleDemonstrationGraph(): RawTopologyPayload {
  const nodes: TopologyNodeData[] = DEMO_SERVICES_STATUS.map((s) => {
    return {
      id: s.id,
      name: s.name,
      tier: s.tier,
      status: normalizeNodeStatus(s.status),
      isAffected: s.isAffected,
      description: s.description || CANONICAL_DESCRIPTIONS[s.id] || "Monitored microservice",
      observedSymptom: s.observedSymptom,
      eventCount: s.isAffected ? 5 : 1,
      highestSeverity: s.status,
      incomingDependencies: [],
      outgoingDependencies: [],
      isSelected: false,
      isNeighbor: false,
      isDimmed: false,
      dataSource: "demo",
    };
  });

  const nodeMap = new Map<string, TopologyNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const edges: TopologyEdgeData[] = DEMO_DEPENDENCY_EDGES.map((e, index) => {
    const key = `${e.source}->${e.target}`;
    const meta = CANONICAL_EDGE_METADATA[key];
    const edgeType = normalizeEdgeType(e.edge_type);

    // Populate incoming/outgoing dependencies for connected nodes
    const srcNode = nodeMap.get(e.source);
    const tgtNode = nodeMap.get(e.target);
    if (srcNode && !srcNode.outgoingDependencies.includes(e.target)) {
      srcNode.outgoingDependencies.push(e.target);
    }
    if (tgtNode && !tgtNode.incomingDependencies.includes(e.source)) {
      tgtNode.incomingDependencies.push(e.source);
    }

    return {
      id: `edge-${index}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      edgeType,
      protocol: meta?.protocol || e.protocol || "TCP/Internal",
      isSynchronous: meta?.isSync ?? e.is_synchronous ?? true,
      inferredConfidence: e.inferred_confidence ?? null,
      reasoning: e.reasoning ?? null,
      evidenceCitation:
        edgeType === "INFERRED_CAUSAL"
          ? "EVID-DB-001 (PostgreSQL lock contention trace)"
          : null,
      isHighlighted: false,
      isDimmed: false,
    };
  });

  const affectedCount = nodes.filter((n) => n.isAffected).length;
  const criticalCount = nodes.filter((n) => n.status === "CRITICAL" || n.status === "DEGRADED").length;

  return {
    nodes,
    edges,
    summary: {
      totalServices: nodes.length,
      totalDependencies: edges.length,
      affectedServicesCount: affectedCount,
      degradedOrCriticalCount: criticalCount,
      dataSource: "demo",
      lastFetched: new Date().toLocaleTimeString(),
    },
  };
}

function assembleLiveGraph(
  rawServices: BackendServiceRaw[],
  rawDependencies: BackendDependencyEdgeRaw[],
  previewGraph: BackendDependenciesRaw | null
): RawTopologyPayload {
  const previewNodeMap = new Map<string, BackendDependencyNodeRaw>();
  if (previewGraph?.nodes) {
    previewGraph.nodes.forEach((pn) => previewNodeMap.set(pn.id, pn));
  }

  const nodes: TopologyNodeData[] = rawServices.map((s) => {
    const pNode = previewNodeMap.get(s.id);
    const normalizedStatus = normalizeNodeStatus(s.status);
    const isDegradedOrCritical = normalizedStatus === "DEGRADED" || normalizedStatus === "CRITICAL";

    return {
      id: s.id,
      name: s.name || s.id,
      tier: s.tier || CANONICAL_TIERS[s.id] || "unknown",
      status: normalizedStatus,
      isAffected: isDegradedOrCritical || (pNode?.highest_severity && pNode.highest_severity !== "NORMAL") || false,
      description: s.description || CANONICAL_DESCRIPTIONS[s.id] || pNode?.description || "Registered service",
      observedSymptom: undefined,
      eventCount: pNode?.event_count ?? 0,
      highestSeverity: pNode?.highest_severity ?? normalizedStatus,
      incomingDependencies: [],
      outgoingDependencies: [],
      isSelected: false,
      isNeighbor: false,
      isDimmed: false,
      dataSource: "live",
    };
  });

  const nodeMap = new Map<string, TopologyNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const edges: TopologyEdgeData[] = rawDependencies.map((e, index) => {
    const key = `${e.source}->${e.target}`;
    const meta = CANONICAL_EDGE_METADATA[key];
    const edgeType = normalizeEdgeType(e.edge_type);

    const srcNode = nodeMap.get(e.source);
    const tgtNode = nodeMap.get(e.target);
    if (srcNode && !srcNode.outgoingDependencies.includes(e.target)) {
      srcNode.outgoingDependencies.push(e.target);
    }
    if (tgtNode && !tgtNode.incomingDependencies.includes(e.source)) {
      tgtNode.incomingDependencies.push(e.source);
    }

    return {
      id: `edge-live-${index}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      edgeType,
      protocol: e.protocol || meta?.protocol || "TCP/Internal",
      isSynchronous: e.is_synchronous ?? meta?.isSync ?? true,
      inferredConfidence: e.inferred_confidence ?? null,
      reasoning: e.reasoning ?? null,
      evidenceCitation: null, // Only canonical backend evidence references, no inventions
      isHighlighted: false,
      isDimmed: false,
    };
  });

  const affectedCount = nodes.filter((n) => n.isAffected).length;
  const criticalCount = nodes.filter((n) => n.status === "CRITICAL" || n.status === "DEGRADED").length;

  return {
    nodes,
    edges,
    summary: {
      totalServices: nodes.length,
      totalDependencies: edges.length,
      affectedServicesCount: affectedCount,
      degradedOrCriticalCount: criticalCount,
      dataSource: "live",
      lastFetched: new Date().toLocaleTimeString(),
    },
  };
}

// ------------------------------------------------------------------
// Deterministic Hierarchical Layout
// ------------------------------------------------------------------

const TIER_COLUMNS: Record<string, number> = {
  edge: 0,
  core_business: 1,
  integration: 2,
  security: 2,
  data_persistence: 3,
};

const COLUMN_X_POSITIONS = [60, 420, 780, 1140, 1500];
const NODE_HEIGHT = 110;
const NODE_SPACING_Y = 32;
const CANVAS_BASE_HEIGHT = 580;

export function computeHierarchicalLayout(
  nodes: TopologyNodeData[],
  edges: TopologyEdgeData[]
): { graphNodes: TopologyGraphNode[]; graphEdges: TopologyGraphEdge[] } {
  // Group nodes into deterministic columns by tier
  const columns: TopologyNodeData[][] = [[], [], [], [], []];

  nodes.forEach((n) => {
    const tierKey = (n.tier || "unknown").toLowerCase();
    const colIdx = TIER_COLUMNS[tierKey] !== undefined ? TIER_COLUMNS[tierKey] : 4;
    columns[colIdx].push(n);
  });

  const graphNodes: TopologyGraphNode[] = [];

  columns.forEach((colNodes, colIndex) => {
    // Sort deterministically by node id
    colNodes.sort((a, b) => a.id.localeCompare(b.id));

    const count = colNodes.length;
    if (count === 0) return;

    const totalColumnHeight = count * NODE_HEIGHT + (count - 1) * NODE_SPACING_Y;
    const startY = Math.max(40, (CANVAS_BASE_HEIGHT - totalColumnHeight) / 2);
    const posX = COLUMN_X_POSITIONS[colIndex] || 60 + colIndex * 360;

    colNodes.forEach((node, nodeIndex) => {
      const posY = startY + nodeIndex * (NODE_HEIGHT + NODE_SPACING_Y);
      graphNodes.push({
        id: node.id,
        type: "serviceNode",
        position: { x: posX, y: posY },
        data: node,
      });
    });
  });

  const graphEdges: TopologyGraphEdge[] = edges.map((e) => {
    const isInferred = e.edgeType === "INFERRED_CAUSAL";
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      animated: isInferred,
      data: e,
      style: {
        stroke: isInferred
          ? "#f59e0b"
          : e.isHighlighted
          ? "#818cf8"
          : e.isDimmed
          ? "#334155"
          : "#64748b",
        strokeWidth: e.isHighlighted ? 2.5 : isInferred ? 2 : 1.5,
        strokeDasharray: isInferred ? "5,5" : undefined,
        opacity: e.isDimmed ? 0.2 : 1,
        transition: "stroke 0.2s, stroke-width 0.2s, opacity 0.2s",
      },
    };
  });

  return { graphNodes, graphEdges };
}

// ------------------------------------------------------------------
// Selection & Filtering Application
// ------------------------------------------------------------------

export function applyFiltersAndSelection(
  rawNodes: TopologyNodeData[],
  rawEdges: TopologyEdgeData[],
  filters: TopologyFilters,
  selectedNodeId: string | null
): { filteredNodes: TopologyNodeData[]; filteredEdges: TopologyEdgeData[] } {
  const query = filters.searchQuery.trim().toLowerCase();

  // 1. Filter Nodes
  const filteredNodes = rawNodes.filter((node) => {
    // Search query matches id or name
    if (query) {
      const matchesSearch =
        node.id.toLowerCase().includes(query) ||
        node.name.toLowerCase().includes(query) ||
        node.tier.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statusFilter !== "ALL" && node.status !== filters.statusFilter) {
      return false;
    }

    // Affected only toggle
    if (filters.affectedOnly && !node.isAffected) {
      return false;
    }

    // Tier filter
    if (filters.tierFilter !== "ALL" && node.tier.toLowerCase() !== filters.tierFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));

  // 2. Filter Edges (Both source and target must be in visible nodes)
  const filteredEdges = rawEdges.filter((edge) => {
    if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) {
      return false;
    }
    if (filters.edgeTypeFilter !== "ALL" && edge.edgeType !== filters.edgeTypeFilter) {
      return false;
    }
    return true;
  });

  // 3. Apply Selection Highlighting and Neighbor Dimming
  const neighborIds = new Set<string>();
  if (selectedNodeId) {
    filteredEdges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        neighborIds.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        neighborIds.add(edge.source);
      }
    });
  }

  const enhancedNodes = filteredNodes.map((node) => {
    const isSelected = selectedNodeId === node.id;
    const isNeighbor = neighborIds.has(node.id);
    const isDimmed = Boolean(selectedNodeId && !isSelected && !isNeighbor);

    return {
      ...node,
      isSelected,
      isNeighbor,
      isDimmed,
    };
  });

  const enhancedEdges = filteredEdges.map((edge) => {
    const isConnected = selectedNodeId
      ? edge.source === selectedNodeId || edge.target === selectedNodeId
      : false;
    const isDimmed = Boolean(selectedNodeId && !isConnected);

    return {
      ...edge,
      isHighlighted: isConnected,
      isDimmed,
    };
  });

  return {
    filteredNodes: enhancedNodes,
    filteredEdges: enhancedEdges,
  };
}
