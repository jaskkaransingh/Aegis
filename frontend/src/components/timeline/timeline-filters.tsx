import React from "react";
import { Search, RotateCcw, Filter, X } from "lucide-react";

export interface TimelineFilterState {
  searchQuery: string;
  selectedService: string;
  selectedSeverity: string;
  selectedEventType: string;
}

interface TimelineFiltersProps {
  filters: TimelineFilterState;
  onFilterChange: (filters: TimelineFilterState) => void;
  availableServices: string[];
  availableSeverities: string[];
  availableEventTypes: string[];
  totalCount: number;
  filteredCount: number;
}

export function TimelineFilters({
  filters,
  onFilterChange,
  availableServices,
  availableSeverities,
  availableEventTypes,
  totalCount,
  filteredCount,
}: TimelineFiltersProps) {
  const isFilterActive =
    filters.searchQuery.trim() !== "" ||
    filters.selectedService !== "ALL" ||
    filters.selectedSeverity !== "ALL" ||
    filters.selectedEventType !== "ALL";

  const handleReset = () => {
    onFilterChange({
      searchQuery: "",
      selectedService: "ALL",
      selectedSeverity: "ALL",
      selectedEventType: "ALL",
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search event messages, event IDs, trace IDs, or metadata..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70 transition"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: "" })}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Service Dropdown */}
        <div className="w-full md:w-52">
          <select
            value={filters.selectedService}
            onChange={(e) =>
              onFilterChange({ ...filters, selectedService: e.target.value })
            }
            className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500/70 transition"
          >
            <option value="ALL">All Services ({availableServices.length})</option>
            {availableServices.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Dropdown */}
        <div className="w-full md:w-36">
          <select
            value={filters.selectedSeverity}
            onChange={(e) =>
              onFilterChange({ ...filters, selectedSeverity: e.target.value })
            }
            className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500/70 transition"
          >
            <option value="ALL">All Severities</option>
            {availableSeverities.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type Dropdown */}
        {availableEventTypes.length > 0 && (
          <div className="w-full md:w-48">
            <select
              value={filters.selectedEventType}
              onChange={(e) =>
                onFilterChange({ ...filters, selectedEventType: e.target.value })
              }
              className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono text-slate-200 focus:outline-none focus:border-violet-500/70 transition truncate"
            >
              <option value="ALL">All Event Types</option>
              {availableEventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Button */}
        {isFilterActive && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shrink-0"
            title="Reset all active filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter Summary & Result Count */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
        <div>
          <span>Showing </span>
          <span className="font-semibold text-slate-300">{filteredCount}</span>
          <span> of </span>
          <span className="font-semibold text-slate-300">{totalCount}</span>
          <span> events</span>
          {isFilterActive && (
            <span className="text-violet-400 ml-2">(Filtered)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filters.selectedService !== "ALL" && (
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[10px]">
              Service: {filters.selectedService}
            </span>
          )}
          {filters.selectedSeverity !== "ALL" && (
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[10px]">
              Severity: {filters.selectedSeverity}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

