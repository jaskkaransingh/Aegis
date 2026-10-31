"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EvidenceHeader } from "@/components/evidence/evidence-header";
import { EvidenceFilters } from "@/components/evidence/evidence-filters";
import { EvidenceList } from "@/components/evidence/evidence-list";
import { EvidenceDetailsPanel } from "@/components/evidence/evidence-details-panel";
import {
  fetchEvidenceDataset,
  filterEvidenceRecords,
} from "@/lib/evidence-adapter";
import type {
  EvidenceFilterState,
  EvidenceRecord,
  EvidenceSummary,
} from "@/types/evidence";

const INITIAL_FILTERS: EvidenceFilterState = {
  searchQuery: "",
  selectedService: "ALL",
  selectedSeverity: "ALL",
  selectedEventType: "ALL",
  timestampMode: "corrected",
  hasTraceOnly: false,
  hasWarningsOnly: false,
  clockSkewOnly: false,
};

export function EvidenceClient() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "ALL";
  const initialEvent = searchParams.get("event") || null;

  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [summary, setSummary] = useState<EvidenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<EvidenceFilterState>({
    ...INITIAL_FILTERS,
    selectedService: initialService,
  });

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(initialEvent);

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchEvidenceDataset();
      setRecords(res.records);
      setSummary(res.summary);
      setError(res.error);

      // Select initial event if specified in query params or default to first record
      if (initialEvent && res.records.some((r) => r.id === initialEvent)) {
        setSelectedRecordId(initialEvent);
      } else if (!selectedRecordId && res.records.length > 0) {
        setSelectedRecordId(res.records[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load evidence dataset");
    } finally {
      setIsLoading(false);
    }
  }, [initialEvent, selectedRecordId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract distinct services from dataset
  const availableServices = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.service) s.add(r.service);
    });
    return Array.from(s).sort();
  }, [records]);

  // Extract distinct event types from dataset
  const availableEventTypes = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.event_type) s.add(r.event_type);
    });
    return Array.from(s).sort();
  }, [records]);

  // Filter records locally
  const filteredRecords = useMemo(() => {
    return filterEvidenceRecords(records, filters);
  }, [records, filters]);

  // Selected record object
  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) return null;
    return records.find((r) => r.id === selectedRecordId) || null;
  }, [selectedRecordId, records]);

  // Reset Filters
  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <EvidenceHeader
        summary={summary}
        isLoading={isLoading}
        onRefresh={loadData}
      />

      {/* Three-Panel Investigation Workspace */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Left Panel: Compact Filter Sidebar */}
        <EvidenceFilters
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          availableServices={availableServices}
          availableEventTypes={availableEventTypes}
          totalRecords={records.length}
          filteredCount={filteredRecords.length}
        />

        {/* Center Panel: Dense Forensic Evidence Table */}
        <EvidenceList
          records={filteredRecords}
          selectedRecordId={selectedRecordId}
          onSelectRecord={setSelectedRecordId}
          isLoading={isLoading}
          error={error}
          onRetry={loadData}
          onResetFilters={handleResetFilters}
          timestampMode={filters.timestampMode}
        />

        {/* Right Panel: Deep Evidence Inspection Drawer */}
        <EvidenceDetailsPanel
          record={selectedRecord}
          onClose={() => setSelectedRecordId(null)}
        />
      </div>
    </div>
  );
}

