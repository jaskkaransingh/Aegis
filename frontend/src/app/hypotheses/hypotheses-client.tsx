"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchArenaHypotheses,
  filterHypotheses,
} from "@/lib/hypothesis-adapter";
import type {
  ArenaHypothesis,
  HypothesisFilterState,
  HypothesisArenaSummary,
} from "@/types/hypothesis";
import { HypothesisHeader } from "@/components/hypotheses/hypothesis-header";
import { HypothesisOverview } from "@/components/hypotheses/hypothesis-overview";
import { HypothesisToolbar } from "@/components/hypotheses/hypothesis-toolbar";
import { HypothesisCard } from "@/components/hypotheses/hypothesis-card";
import { HypothesisDetailPanel } from "@/components/hypotheses/hypothesis-detail-panel";
import { HypothesisComparison } from "@/components/hypotheses/hypothesis-comparison";
import { AlertCircle, RotateCcw } from "lucide-react";

const INITIAL_FILTERS: HypothesisFilterState = {
  searchQuery: "",
  statusFilter: "ALL",
  serviceFilter: "ALL",
  sortBy: "id",
};

export function HypothesesClient() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || null;
  const initialService = searchParams.get("service") || "ALL";

  const [hypotheses, setHypotheses] = useState<ArenaHypothesis[]>([]);
  const [summary, setSummary] = useState<HypothesisArenaSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<HypothesisFilterState>({
    ...INITIAL_FILTERS,
    serviceFilter: initialService,
  });

  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(initialId);
  const [comparingIds, setComparingIds] = useState<string[]>([]);

  // Load Hypotheses
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchArenaHypotheses();
      setHypotheses(res.hypotheses);
      setSummary(res.summary);

      if (initialId && res.hypotheses.some((h) => h.id === initialId)) {
        setSelectedHypothesisId(initialId);
      } else if (!selectedHypothesisId && res.hypotheses.length > 0) {
        setSelectedHypothesisId(res.hypotheses[0].id);
      }
    } catch {
      // Fallback handled in adapter
    } finally {
      setIsLoading(false);
    }
  }, [initialId, selectedHypothesisId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract distinct services from hypotheses
  const availableServices = useMemo(() => {
    const s = new Set<string>();
    hypotheses.forEach((h) => {
      if (h.suspectedService) s.add(h.suspectedService);
    });
    return Array.from(s).sort();
  }, [hypotheses]);

  // Filter hypotheses
  const filteredHypotheses = useMemo(() => {
    return filterHypotheses(hypotheses, filters);
  }, [hypotheses, filters]);

  // Selected hypothesis object
  const selectedHypothesis = useMemo(() => {
    if (!selectedHypothesisId) return null;
    return hypotheses.find((h) => h.id === selectedHypothesisId) || null;
  }, [selectedHypothesisId, hypotheses]);

  // Comparison hypotheses objects
  const comparisonPair = useMemo(() => {
    if (comparingIds.length < 2) return null;
    const hypA = hypotheses.find((h) => h.id === comparingIds[0]);
    const hypB = hypotheses.find((h) => h.id === comparingIds[1]);
    if (!hypA || !hypB) return null;
    return { hypA, hypB };
  }, [comparingIds, hypotheses]);

  // Handle Toggle Compare
  const handleToggleCompare = useCallback((hypId: string) => {
    setComparingIds((prev) => {
      if (prev.includes(hypId)) {
        return prev.filter((id) => id !== hypId);
      }
      if (prev.length >= 2) {
        // Replace second with new
        return [prev[0], hypId];
      }
      return [...prev, hypId];
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <HypothesisHeader
        summary={summary}
        isLoading={isLoading}
        onRefresh={loadData}
        isComparing={comparingIds.length > 0}
        onExitComparison={() => setComparingIds([])}
      />

      {/* Metrics Overview */}
      <HypothesisOverview
        summary={summary}
        comparingIds={comparingIds}
      />

      {/* Active Side-by-Side Comparison Matrix */}
      {comparisonPair && (
        <HypothesisComparison
          hypothesisA={comparisonPair.hypA}
          hypothesisB={comparisonPair.hypB}
          onExit={() => setComparingIds([])}
        />
      )}

      {/* Filters Toolbar */}
      <HypothesisToolbar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(INITIAL_FILTERS)}
        availableServices={availableServices}
        totalVisible={filteredHypotheses.length}
        totalAvailable={hypotheses.length}
      />

      {/* Main Grid and Detail Drawer Area */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Hypotheses Grid */}
        <div className="flex-1 w-full space-y-4">
          {filteredHypotheses.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                No matching hypotheses found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Adjust your search or status filter to restore candidate explanations.
              </p>
              <button
                type="button"
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHypotheses.map((hyp) => (
                <HypothesisCard
                  key={hyp.id}
                  hypothesis={hyp}
                  isSelected={selectedHypothesisId === hyp.id}
                  isComparing={comparingIds.includes(hyp.id)}
                  onSelect={() => setSelectedHypothesisId(hyp.id)}
                  onToggleCompare={() => handleToggleCompare(hyp.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Hypothesis Detail Drawer */}
        {selectedHypothesis && (
          <HypothesisDetailPanel
            hypothesis={selectedHypothesis}
            onClose={() => setSelectedHypothesisId(null)}
            isComparing={comparingIds.includes(selectedHypothesis.id)}
            onToggleCompare={() => handleToggleCompare(selectedHypothesis.id)}
          />
        )}
      </div>
    </div>
  );
}

