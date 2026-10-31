"use client";

import React from "react";
import {
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  X,
  Zap,
} from "lucide-react";
import type { TopologyFilters, TopologyNodeStatus, TopologyEdgeType } from "@/types/topology";

interface TopologyToolbarProps {
  filters: TopologyFilters;
  onFilterChange: (filters: TopologyFilters) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalVisible: number;
  totalAvailable: number;
}

export function TopologyToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  isLoading,
  totalVisible,
  totalAvailable,
}: TopologyToolbarProps) {
  const hasActiveFilters =
    filters.searchQuery.trim() !== "" ||
    filters.statusFilter !== "ALL" ||
    filters.affectedOnly ||
    filters.edgeTypeFilter !== "ALL" ||
    filters.tierFilter !== "ALL";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              searchQuery: e.target.value,
            })
          }
          placeholder="Search service name, id, or tier..."
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Status:</span>
          <select
            value={filters.statusFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                statusFilter: e.target.value as "ALL" | TopologyNodeStatus,
              })
            }
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="CRITICAL" className="bg-slate-900">Critical</option>
            <option value="DEGRADED" className="bg-slate-900">Degraded</option>
            <option value="HEALTHY" className="bg-slate-900">Healthy</option>
            <option value="UNKNOWN" className="bg-slate-900">Unknown</option>
          </select>
        </div>

        {/* Edge / Relationship Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
          <span className="text-slate-400 text-[11px]">Edge:</span>
          <select
            value={filters.edgeTypeFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                edgeTypeFilter: e.target.value as "ALL" | TopologyEdgeType,
              })
            }
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL" className="bg-slate-900">All Relationships</option>
            <option value="KNOWN_DEPENDENCY" className="bg-slate-900">Architectural Only</option>
            <option value="INFERRED_CAUSAL" className="bg-slate-900">Inferred Causal Only</option>
          </select>
        </div>

        {/* Affected Only Toggle */}
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              ...filters,
              affectedOnly: !filters.affectedOnly,
            })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
            filters.affectedOnly
              ? "bg-rose-950/60 border-rose-600/70 text-rose-300 shadow-sm shadow-rose-900/30"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle affected services filter"
        >
          <Zap className={`w-3.5 h-3.5 ${filters.affectedOnly ? "text-rose-400 fill-rose-400/30" : "text-slate-500"}`} />
          <span className="text-[11px] font-medium">Affected Only</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Reset all filters and view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Reset</span>
          </button>
        )}

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 transition-colors font-medium ml-1"
          title="Reload topology from backend API"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-violet-400" : "text-slate-400"}`} />
          <span className="text-[11px]">{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Filter summary counter */}
      {hasActiveFilters && (
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Showing <strong className="text-slate-200">{totalVisible}</strong> of{" "}
            <strong className="text-slate-200">{totalAvailable}</strong> services
          </span>
          <span className="text-violet-400">Filters active</span>
        </div>
      )}
    </div>
  );
}

