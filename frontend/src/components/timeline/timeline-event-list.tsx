import React from "react";
import { TimelineEventCard } from "./timeline-event-card";
import type { NormalizedEvent, TimelineEvent } from "@/types";
import type { TimestampMode } from "./timestamp-mode-toggle";
import { Layers, RotateCcw } from "lucide-react";

interface TimelineEventListProps {
  events: NormalizedEvent[];
  timelineMap: Map<string, TimelineEvent>;
  timestampMode: TimestampMode;
  selectedEventId: string | null;
  onSelectEvent: (event: NormalizedEvent) => void;
  onResetFilters?: () => void;
}

export function TimelineEventList({
  events,
  timelineMap,
  timestampMode,
  selectedEventId,
  onSelectEvent,
  onResetFilters,
}: TimelineEventListProps) {
  // Sort events chronologically according to active timestampMode
  const sortedEvents = [...events].sort((a, b) => {
    const timeA =
      timestampMode === "corrected"
        ? a.corrected_datetime || a.original_timestamp
        : a.original_timestamp || a.recorded_datetime;
    const timeB =
      timestampMode === "corrected"
        ? b.corrected_datetime || b.original_timestamp
        : b.original_timestamp || b.recorded_datetime;

    return new Date(timeA).getTime() - new Date(timeB).getTime();
  });

  if (sortedEvents.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40/30 p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-xl bg-slate-800 text-white/50 mx-auto flex items-center justify-center">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold font-mono text-white/90">
            No Incident Events Match Active Filters
          </h3>
          <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
            Try adjusting your service, severity, event type, or search query to broaden the timeline scope.
          </p>
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-xs font-mono text-white/80 hover:text-white transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sortedEvents.map((event) => (
        <TimelineEventCard
          key={event.id}
          event={event}
          timelineMeta={timelineMap.get(event.id)}
          timestampMode={timestampMode}
          isSelected={selectedEventId === event.id}
          onSelect={onSelectEvent}
        />
      ))}
    </div>
  );
}

