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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 shadow-md text-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
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
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90 placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2 py-1">
          <Filter className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/60 text-[11px]">Status:</span>
          <select
            value={filters.statusFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                statusFilter: e.target.value as "ALL" | TopologyNodeStatus,
              })
            }
            className="bg-transparent text-white/90 focus:outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="CRITICAL" className="bg-slate-900">Critical</option>
            <option value="DEGRADED" className="bg-slate-900">Degraded</option>
            <option value="HEALTHY" className="bg-slate-900">Healthy</option>
            <option value="UNKNOWN" className="bg-slate-900">Unknown</option>
          </select>
        </div>

        {/* Edge / Relationship Filter */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2 py-1">
          <span className="text-white/60 text-[11px]">Edge:</span>
          <select
            value={filters.edgeTypeFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                edgeTypeFilter: e.target.value as "ALL" | TopologyEdgeType,
              })
            }
            className="bg-transparent text-white/90 focus:outline-none cursor-pointer text-[11px]"
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
              : "bg-black/40 border-white/10 text-white/60 hover:text-white/90"
          }`}
          title="Toggle affected services filter"
        >
          <Zap className={`w-3.5 h-3.5 ${filters.affectedOnly ? "text-rose-400 fill-rose-400/30" : "text-white/50"}`} />
          <span className="text-[11px] font-medium">Affected Only</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/40 text-white/60 hover:text-white/90 hover:border-white/20 transition-colors"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors font-medium ml-1"
          title="Reload topology from backend API"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : "text-white/60"}`} />
          <span className="text-[11px]">{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Filter summary counter */}
      {hasActiveFilters && (
        <div className="w-full flex items-center justify-between text-[11px] text-white/60 pt-1 border-t border-white/10">
          <span>
            Showing <strong className="text-white/90">{totalVisible}</strong> of{" "}
            <strong className="text-white/90">{totalAvailable}</strong> services
          </span>
          <span className="text-white">Filters active</span>
        </div>
      )}
    </div>
  );
}

