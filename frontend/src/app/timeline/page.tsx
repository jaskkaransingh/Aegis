"use client";

import React, { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TimelineHeader } from "@/components/timeline/timeline-header";
import {
  TimelineFilters,
  type TimelineFilterState,
} from "@/components/timeline/timeline-filters";
import { TimelineEventList } from "@/components/timeline/timeline-event-list";
import { TimelineEventDetails } from "@/components/timeline/timeline-event-details";
import type { TimestampMode } from "@/components/timeline/timestamp-mode-toggle";
import { apiClient } from "@/lib/api-client";
import { useBackend } from "@/lib/backend-context";
import {
  PRIMARY_DEMO_INCIDENT,
  DEMO_NORMALIZED_EVENTS,
  DEMO_TIMELINE_EVENTS,
} from "@/lib/demo-data";
import type { NormalizedEvent, TimelineEvent } from "@/types";

function TimelineExplorerContent() {
  const { status: backendStatus } = useBackend();
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "ALL";

  // State
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [timelineMetaList, setTimelineMetaList] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active Modes & Selection
  const [timestampMode, setTimestampMode] = useState<TimestampMode>("corrected");
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);

  // Filters State
  const [filters, setFilters] = useState<TimelineFilterState>({
    searchQuery: "",
    selectedService: initialService,
    selectedSeverity: "ALL",
    selectedEventType: "ALL",
  });

  // Fetch data from real backend or fall back to centralized demo fixtures
  const loadTimelineData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const [logsRes, timelineRes] = await Promise.all([
        apiClient.getLogs({ apply_clock_correction: true }),
        apiClient.getTimeline(),
      ]);

      if (logsRes && Array.isArray(logsRes.events) && logsRes.events.length > 0) {
        setEvents(logsRes.events);
        setTimelineMetaList(timelineRes || []);
        setIsDemoFallback(false);
      } else {
        throw new Error("Backend returned empty logs list.");
      }
    } catch (err) {
      // Fallback safely to demo data
      setEvents(DEMO_NORMALIZED_EVENTS);
      setTimelineMetaList(DEMO_TIMELINE_EVENTS);
      setIsDemoFallback(true);
      setFetchError(
        err instanceof Error
          ? err.message
          : "Backend unavailable; serving offline demonstration fixtures."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData, backendStatus]);

  // Index timeline metadata by event_id for fast lookup
  const timelineMap = useMemo(() => {
    const map = new Map<string, TimelineEvent>();
    for (const t of timelineMetaList) {
      map.set(t.event_id, t);
    }
    return map;
  }, [timelineMetaList]);

  // Extract distinct filter options
  const availableServices = useMemo(() => {
    const s = new Set<string>();
    for (const ev of events) {
      if (ev.service) s.add(ev.service);
    }
    return Array.from(s).sort();
  }, [events]);

  const availableSeverities = useMemo(() => {
    const s = new Set<string>();
    for (const ev of events) {
      if (ev.severity) s.add(ev.severity.toUpperCase());
    }
    return Array.from(s).sort();
  }, [events]);

  const availableEventTypes = useMemo(() => {
    const s = new Set<string>();
    for (const ev of events) {
      if (ev.event_type) s.add(ev.event_type);
    }
    return Array.from(s).sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Service filter
      if (
        filters.selectedService !== "ALL" &&
        ev.service !== filters.selectedService
      ) {
        return false;
      }

      // Severity filter
      if (
        filters.selectedSeverity !== "ALL" &&
        ev.severity.toUpperCase() !== filters.selectedSeverity.toUpperCase()
      ) {
        return false;
      }

      // Event type filter
      if (
        filters.selectedEventType !== "ALL" &&
        ev.event_type !== filters.selectedEventType
      ) {
        return false;
      }

      // Free text search
      if (filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const msg = (ev.message || "").toLowerCase();
        const svc = (ev.service || "").toLowerCase();
        const id = (ev.id || "").toLowerCase();
        const trace = (ev.trace_id || "").toLowerCase();
        const type = (ev.event_type || "").toLowerCase();

        return (
          msg.includes(q) ||
          svc.includes(q) ||
          id.includes(q) ||
          trace.includes(q) ||
          type.includes(q)
        );
      }

      return true;
    });
  }, [events, filters]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <TimelineHeader
        incidentId={PRIMARY_DEMO_INCIDENT.id}
        incidentTitle={PRIMARY_DEMO_INCIDENT.title}
        totalEvents={events.length}
        filteredEventsCount={filteredEvents.length}
        isDemoData={isDemoFallback}
        timestampMode={timestampMode}
        onTimestampModeChange={setTimestampMode}
        onRefresh={loadTimelineData}
        isRefreshing={isLoading}
      />

      {/* Backend Offline Callout */}
      {isDemoFallback && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              Backend Server Offline: Rendering 25 normalized events from synthetic demonstration dataset.
            </span>
          </div>
          <button
            type="button"
            onClick={loadTimelineData}
            className="px-2.5 py-1 rounded bg-amber-900/50 border border-amber-700/60 text-amber-200 hover:bg-amber-800 transition text-[11px] self-start sm:self-auto shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <TimelineFilters
        filters={filters}
        onFilterChange={setFilters}
        availableServices={availableServices}
        availableSeverities={availableSeverities}
        availableEventTypes={availableEventTypes}
        totalCount={events.length}
        filteredCount={filteredEvents.length}
      />

      {/* Event List */}
      <TimelineEventList
        events={filteredEvents}
        timelineMap={timelineMap}
        timestampMode={timestampMode}
        selectedEventId={selectedEvent?.id || null}
        onSelectEvent={(ev) => setSelectedEvent(ev)}
        onResetFilters={() =>
          setFilters({
            searchQuery: "",
            selectedService: "ALL",
            selectedSeverity: "ALL",
            selectedEventType: "ALL",
          })
        }
      />

      {/* Slide-over Detail Inspector Drawer */}
      {selectedEvent && (
        <TimelineEventDetails
          event={selectedEvent}
          timelineMeta={timelineMap.get(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default function TimelineExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs font-mono text-slate-400">
          Loading Timeline Explorer...
        </div>
      }
    >
      <TimelineExplorerContent />
    </Suspense>
  );
}
