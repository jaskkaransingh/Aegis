"use client";

import React from "react";
import {
  Clock,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  Zap,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import type { EvidenceFilterState } from "@/types/evidence";

interface EvidenceFiltersProps {
  filters: EvidenceFilterState;
  onFilterChange: (filters: EvidenceFilterState) => void;
  onResetFilters: () => void;
  availableServices: string[];
  availableEventTypes: string[];
  totalRecords: number;
  filteredCount: number;
}

export function EvidenceFilters({
  filters,
  onFilterChange,
  onResetFilters,
  availableServices,
  availableEventTypes,
  totalRecords,
  filteredCount,
}: EvidenceFiltersProps) {
  const hasActiveFilters =
    filters.searchQuery.trim() !== "" ||
    filters.selectedService !== "ALL" ||
    filters.selectedSeverity !== "ALL" ||
    filters.selectedEventType !== "ALL" ||
    filters.hasTraceOnly ||
    filters.hasWarningsOnly ||
    filters.clockSkewOnly;

  return (
    <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-sm text-xs">
      {/* Filters Title & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
          <span>Evidence Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Search Evidence
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Search ID, message, trace..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-xs transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Timestamp Mode Selection */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Timestamp Reference
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, timestampMode: "corrected" })}
            className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-medium transition-colors ${
              filters.timestampMode === "corrected"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="UTC normalized timestamp corrected for clock offset"
          >
            Corrected UTC
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, timestampMode: "raw" })}
            className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-medium transition-colors ${
              filters.timestampMode === "raw"
                ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Raw timestamp recorded by originating service clock"
          >
            Raw Recorded
          </button>
        </div>
      </div>

      {/* Originating Service Filter */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Service ({availableServices.length})
        </label>
        <select
          value={filters.selectedService}
          onChange={(e) =>
            onFilterChange({ ...filters, selectedService: e.target.value })
          }
          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 text-xs cursor-pointer"
        >
          <option value="ALL">All Services ({totalRecords})</option>
          {availableServices.map((svc) => (
            <option key={svc} value={svc}>
              {svc}
            </option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Severity Level
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {["ALL", "CRITICAL", "ERROR", "WARN", "INFO"].map((sev) => {
            const isSelected = filters.selectedSeverity === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    selectedSeverity: sev,
                  })
                }
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-mono font-medium transition-all text-center ${
                  isSelected
                    ? sev === "CRITICAL"
                      ? "bg-rose-950/70 border-rose-600 text-rose-300"
                      : sev === "ERROR"
                      ? "bg-rose-950/50 border-rose-500/70 text-rose-300"
                      : sev === "WARN"
                      ? "bg-amber-950/60 border-amber-600 text-amber-300"
                      : sev === "INFO"
                      ? "bg-blue-950/60 border-blue-600 text-blue-300"
                      : "bg-violet-950/60 border-violet-600 text-violet-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Type Filter */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Event Category
        </label>
        <select
          value={filters.selectedEventType}
          onChange={(e) =>
            onFilterChange({ ...filters, selectedEventType: e.target.value })
          }
          className="w-full py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 text-xs cursor-pointer font-mono"
        >
          <option value="ALL">All Event Types</option>
          {availableEventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Forensic Toggles */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Forensic Signals
        </span>

        {/* Has Distributed Trace */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300">Distributed Trace</span>
          </div>
          <input
            type="checkbox"
            checked={filters.hasTraceOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, hasTraceOnly: e.target.checked })
            }
            className="rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Clock Skew Drift */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-slate-300">Clock Skew Applied</span>
          </div>
          <input
            type="checkbox"
            checked={filters.clockSkewOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, clockSkewOnly: e.target.checked })
            }
            className="rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Data Quality Warnings */}
        <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] text-slate-300">Quality Warnings</span>
          </div>
          <input
            type="checkbox"
            checked={filters.hasWarningsOnly}
            onChange={(e) =>
              onFilterChange({ ...filters, hasWarningsOnly: e.target.checked })
            }
            className="rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Filter Stats Footnote */}
      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Matching Records:</span>
        <strong className="font-mono text-slate-200">
          {filteredCount} / {totalRecords}
        </strong>
      </div>
    </div>
  );
}

