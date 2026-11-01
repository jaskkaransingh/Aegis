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
import { HypothesisFlowDiagram } from "@/components/hypotheses/hypothesis-flow-diagram";
import { HypothesisTelemetryChart } from "@/components/hypotheses/hypothesis-telemetry-chart";
import { HypothesisArenaVisualizer } from "@/components/hypotheses/hypothesis-arena-visualizer";
import { HypothesisToolbar } from "@/components/hypotheses/hypothesis-toolbar";
import { HypothesisCard } from "@/components/hypotheses/hypothesis-card";
import { HypothesisDetailPanel } from "@/components/hypotheses/hypothesis-detail-panel";
import { HypothesisComparison } from "@/components/hypotheses/hypothesis-comparison";
import {
  AlertCircle,
  BarChart3,
  GitBranch,
  Grid,
  Network,
  RotateCcw,
  Scale,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

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

  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(initialId || "DEMO-H2");
  const [comparingIds, setComparingIds] = useState<string[]>(["DEMO-H2", "DEMO-H1"]);
  const [viewMode, setViewMode] = useState<"flow" | "graphs" | "arena" | "duel">("flow");

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
        setSelectedHypothesisId("DEMO-H2");
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

      {/* Visual Navigation Bar */}
      <div className="rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 p-3 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Mode 1: Working Flowdiagram */}
          <button
            type="button"
            onClick={() => setViewMode("flow")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              viewMode === "flow"
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15 border border-white/15"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>01 // WORKING FLOWDIAGRAM</span>
          </button>

          {/* Mode 2: Multi-Series Telemetry Graphs */}
          <button
            type="button"
            onClick={() => setViewMode("graphs")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              viewMode === "graphs"
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15 border border-white/15"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>02 // CORRELATION GRAPHS</span>
          </button>

          {/* Mode 3: Arena Leaderboard & Evidence Matrix */}
          <button
            type="button"
            onClick={() => setViewMode("arena")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              viewMode === "arena"
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15 border border-white/15"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>03 // EVIDENCE HEATMAP & LEADERBOARD</span>
          </button>

          {/* Mode 4: Duel Battle */}
          <button
            type="button"
            onClick={() => setViewMode("duel")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
              viewMode === "duel"
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15 border border-white/15"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>04 // SIDE-BY-SIDE DUEL</span>
          </button>
        </div>

        {/* Selected Candidate Quick Status Tag */}
        {selectedHypothesis && (
          <div className="flex items-center gap-2 text-xs font-mono text-white/70 self-end sm:self-auto shrink-0">
            <span className="text-white/40 hidden md:inline">Top Pick:</span>
            <span className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[#22c55e] font-bold">
              {selectedHypothesis.id} (88% Confidence)
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: WORKING CAUSAL FLOWDIAGRAM */}
      {/* ========================================================================= */}
      {viewMode === "flow" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <HypothesisFlowDiagram />

          {/* Quick Metrics & Time-Correlation Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-1 font-mono">
              <span className="text-[10px] text-white/50 uppercase block">Causal Origin Hop</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span>postgresql-database</span>
              </div>
              <span className="text-[10px] text-[#22c55e]">
                Preceded all service timeouts by 6.7 seconds
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-1 font-mono">
              <span className="text-[10px] text-white/50 uppercase block">Propagation Velocity</span>
              <div className="text-sm font-bold text-white">
                4.2 ms / Microservice Hop
              </div>
              <span className="text-[10px] text-white/60">
                DB Pool Exhaustion $\rightarrow$ Appointment $\rightarrow$ Auth $\rightarrow$ Gateway
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-1 font-mono">
              <span className="text-[10px] text-white/50 uppercase block">Falsification Verdict</span>
              <div className="text-sm font-bold text-[#ef4444] flex items-center gap-1.5">
                <span>Payment Lag Disproven</span>
              </div>
              <span className="text-[10px] text-white/60">
                +120.0s clock skew on payment-service eliminated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MULTI-SERIES TELEMETRY CORRELATION GRAPHS */}
      {/* ========================================================================= */}
      {viewMode === "graphs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <HypothesisTelemetryChart />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ARENA LEADERBOARD & EVIDENCE HEATMAP MATRIX */}
      {/* ========================================================================= */}
      {viewMode === "arena" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <HypothesisArenaVisualizer
            hypotheses={hypotheses}
            selectedId={selectedHypothesisId}
            comparingIds={comparingIds}
            onSelect={(id) => setSelectedHypothesisId(id)}
            onToggleCompare={handleToggleCompare}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SIDE-BY-SIDE DUEL */}
      {/* ========================================================================= */}
      {viewMode === "duel" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {comparisonPair ? (
            <HypothesisComparison
              hypothesisA={comparisonPair.hypA}
              hypothesisB={comparisonPair.hypB}
              onExit={() => setViewMode("flow")}
            />
          ) : (
            <div className="p-8 text-center rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 space-y-3">
              <Scale className="w-8 h-8 text-white/50 mx-auto" />
              <h3 className="text-sm font-bold text-white font-mono">Select Two Candidates for the Duel</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Compare two hypotheses head-to-head across empirical confidence, verified spans, and falsification tests.
              </p>
              <button
                type="button"
                onClick={() => setComparingIds(["DEMO-H2", "DEMO-H1"])}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs font-mono"
              >
                Compare DEMO-H2 (DB Pool) vs. DEMO-H1 (Retry Storm)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
