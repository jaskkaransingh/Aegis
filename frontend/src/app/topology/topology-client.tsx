"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  Network,
  RefreshCw,
  RotateCcw,
  Shield,
  Zap,
} from "lucide-react";

import {
  fetchTopologyGraph,
  computeHierarchicalLayout,
  applyFiltersAndSelection,
} from "@/lib/topology-adapter";
import type {
  TopologyEdgeData,
  TopologyFilters,
  TopologyNodeData,
  TopologySummary,
} from "@/types/topology";
import { TopologyToolbar } from "@/components/topology/topology-toolbar";
import { TopologyCanvas } from "@/components/topology/topology-canvas";
import { TopologyLegend } from "@/components/topology/topology-legend";
import { ServiceDetailsPanel } from "@/components/topology/service-details-panel";

const INITIAL_FILTERS: TopologyFilters = {
  searchQuery: "",
  statusFilter: "ALL",
  affectedOnly: false,
  edgeTypeFilter: "ALL",
  tierFilter: "ALL",
};

export function TopologyClient() {
  const searchParams = useSearchParams();
  const initialServiceParam = searchParams.get("service") || null;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawNodes, setRawNodes] = useState<TopologyNodeData[]>([]);
  const [rawEdges, setRawEdges] = useState<TopologyEdgeData[]>([]);
  const [summary, setSummary] = useState<TopologySummary | null>(null);

  const [filters, setFilters] = useState<TopologyFilters>(INITIAL_FILTERS);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialServiceParam);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Load Topology Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchTopologyGraph();
      setRawNodes(payload.nodes);
      setRawEdges(payload.edges);
      setSummary(payload.summary);

      // If initial URL service param is present and exists in nodes, select it
      if (initialServiceParam && payload.nodes.some((n) => n.id === initialServiceParam)) {
        setSelectedNodeId(initialServiceParam);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service topology");
    } finally {
      setIsLoading(false);
    }
  }, [initialServiceParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply Filtering and Selection
  const { filteredNodes, filteredEdges } = useMemo(() => {
    return applyFiltersAndSelection(rawNodes, rawEdges, filters, selectedNodeId);
  }, [rawNodes, rawEdges, filters, selectedNodeId]);

  // Compute Layout Coordinates
  const { graphNodes, graphEdges } = useMemo(() => {
    return computeHierarchicalLayout(filteredNodes, filteredEdges);
  }, [filteredNodes, filteredEdges]);

  // Currently Selected Node Object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return rawNodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, rawNodes]);

  // Handle Select Node
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Handle Deselect Node
  const handleDeselect = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Handle Reset Filters & View
  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSelectedNodeId(null);
    setResetTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Service Topology
            </h1>
            {summary && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  summary.dataSource === "live"
                    ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                    : "bg-amber-950/60 border-amber-700/60 text-amber-300"
                }`}
                title={
                  summary.dataSource === "live"
                    ? "Live data from FastAPI backend"
                    : "Backend offline/unreachable. Rendering verified demonstration architecture."
                }
              >
                {summary.dataSource === "live" ? "LIVE DATA" : "DEMO DATA"}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive service dependency graph distinguishing static architectural contracts from inferred failure propagation routes.
          </p>
        </div>

        {/* Current Incident Context Indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-slate-400 text-[11px]">Active Incident:</span>
            <span className="font-medium text-slate-200">INC-2026-0881</span>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Services */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Total Services
            </span>
            <div className="text-lg font-bold text-slate-100 mt-0.5">
              {summary ? summary.totalServices : "—"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Total Dependencies */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Dependencies
            </span>
            <div className="text-lg font-bold text-slate-100 mt-0.5">
              {summary ? summary.totalDependencies : "—"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Network className="w-4 h-4" />
          </div>
        </div>

        {/* Affected Services */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Affected Services
            </span>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {summary ? summary.affectedServicesCount : "—"}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        {/* Selected Service Focus */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Selected Service
            </span>
            <div className="text-xs font-semibold text-slate-100 truncate mt-1">
              {selectedNode ? selectedNode.name : "None (Click any node)"}
            </div>
          </div>
          {selectedNode ? (
            <button
              type="button"
              onClick={handleDeselect}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400">
              <Shield className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <TopologyToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        onRefresh={loadData}
        isLoading={isLoading}
        totalVisible={graphNodes.length}
        totalAvailable={rawNodes.length}
      />

      {/* Main Canvas Area */}
      <div className="relative">
        <TopologyCanvas
          nodes={graphNodes}
          edges={graphEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
          onDeselect={handleDeselect}
          resetTrigger={resetTrigger}
        />

        {/* Collapsible Legend */}
        <TopologyLegend />

        {/* Inspector Details Panel */}
        <ServiceDetailsPanel
          service={selectedNode}
          allNodes={rawNodes}
          onSelectService={handleSelectNode}
          onClose={handleDeselect}
        />
      </div>
    </div>
  );
}

