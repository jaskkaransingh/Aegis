"use client";

import React from "react";
import {
  ArrowUpDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { HypothesisFilterState, HypothesisStatus } from "@/types/hypothesis";

interface HypothesisToolbarProps {
  filters: HypothesisFilterState;
  onFilterChange: (filters: HypothesisFilterState) => void;
  onResetFilters: () => void;
  availableServices: string[];
  totalVisible: number;
  totalAvailable: number;
}

export function HypothesisToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  availableServices,
  totalVisible,
  totalAvailable,
}: HypothesisToolbarProps) {
  const hasActiveFilters =
    filters.searchQuery.trim() !== "" ||
    filters.statusFilter !== "ALL" ||
    filters.serviceFilter !== "ALL" ||
    filters.sortBy !== "id";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm text-xs">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) =>
            onFilterChange({ ...filters, searchQuery: e.target.value })
          }
          placeholder="Search hypotheses, IDs, or services..."
          className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 text-xs transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Filters Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Status:</span>
          <select
            value={filters.statusFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                statusFilter: e.target.value as "ALL" | HypothesisStatus,
              })
            }
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="UNDER_EVALUATION" className="bg-slate-900">Under Evaluation</option>
            <option value="PLAUSIBLE" className="bg-slate-900">Plausible</option>
            <option value="REFUTED" className="bg-slate-900">Refuted</option>
            <option value="CONFIRMED" className="bg-slate-900">Confirmed</option>
          </select>
        </div>

        {/* Service Filter */}
        {availableServices.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Service:</span>
            <select
              value={filters.serviceFilter}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  serviceFilter: e.target.value,
                })
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="ALL" className="bg-slate-900">All Services</option>
              {availableServices.map((svc) => (
                <option key={svc} value={svc} className="bg-slate-900">
                  {svc}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400 text-[11px]">Sort:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as "id" | "confidence" | "supporting_count",
              })
            }
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
          >
            <option value="id" className="bg-slate-900">Hypothesis ID</option>
            <option value="confidence" className="bg-slate-900">Confidence Score</option>
            <option value="supporting_count" className="bg-slate-900">Supporting Citations</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px]">Reset</span>
          </button>
        )}
      </div>

      {/* Counter */}
      {hasActiveFilters && (
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Showing <strong className="text-slate-200">{totalVisible}</strong> of{" "}
            <strong className="text-slate-200">{totalAvailable}</strong> hypotheses
          </span>
          <span className="text-violet-400">Filters Active</span>
        </div>
      )}
    </div>
  );
}

