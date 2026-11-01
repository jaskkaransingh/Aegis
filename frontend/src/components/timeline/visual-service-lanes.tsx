"use client";

import React, { useMemo } from "react";
import type { NormalizedEvent, TimelineEvent } from "@/types";
import type { TimestampMode } from "./timestamp-mode-toggle";
import { AlertTriangle, Clock, Layers, Shield } from "lucide-react";

interface VisualServiceLanesProps {
  events: NormalizedEvent[];
  timelineMap: Map<string, TimelineEvent>;
  timestampMode: TimestampMode;
  selectedEventId: string | null;
  onSelectEvent: (event: NormalizedEvent) => void;
}

export function VisualServiceLanes({
  events,
  timelineMap,
  timestampMode,
  selectedEventId,
  onSelectEvent,
}: VisualServiceLanesProps) {
  // Extract unique services present in events
  const services = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.service) set.add(e.service);
    });
    return Array.from(set).sort();
  }, [events]);

  // Compute time bounds for horizontal mapping
  const { minTime, maxTime, duration } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    events.forEach((e) => {
      const timeStr =
        timestampMode === "corrected"
          ? e.corrected_datetime || e.original_timestamp
          : e.original_timestamp || e.recorded_datetime;
      const t = new Date(timeStr).getTime();
      if (!isNaN(t)) {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    });

    if (min === Infinity || max === -Infinity || min === max) {
      min = Date.now() - 3600000;
      max = Date.now();
    }

    return { minTime: min, maxTime: max, duration: Math.max(1, max - min) };
  }, [events, timestampMode]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#07090f]/90 backdrop-blur-md p-5 space-y-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <span className="text-xs font-mono font-semibold tracking-wider text-white flex items-center gap-2">
            <span>SERVICE CHRONOLOGY LANES</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white font-medium">
              {timestampMode === "corrected" ? "CORRECTED TIMESTAMPS" : "RAW TELEMETRY"}
            </span>
          </span>
          <p className="text-[11px] text-white/50 font-sans mt-0.5">
            Horizontal time progression mapped across dependent infrastructure tiers.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Nominal Telemetry
          </span>
        </div>
      </div>

      {/* Swimlanes Canvas Container */}
      <div className="space-y-3 overflow-x-auto pt-2 pb-4">
        {/* Horizontal Time Ruler */}
        <div className="flex justify-between text-[10px] font-mono text-white/40 border-b border-white/10 pb-1.5 min-w-[640px]">
          <span>{new Date(minTime).toISOString().slice(11, 19)} UTC</span>
          <span>T+ 중간 (PROGRESSION)</span>
          <span>{new Date(maxTime).toISOString().slice(11, 19)} UTC</span>
        </div>

        {/* Lanes by Service */}
        <div className="space-y-2 min-w-[640px]">
          {services.map((svc) => {
            const serviceEvents = events.filter((e) => e.service === svc);

            return (
              <div
                key={svc}
                className="relative h-12 rounded-lg bg-black/40 border border-white/5 flex items-center px-3 group hover:border-white/20 transition-colors"
              >
                {/* Lane Label */}
                <div className="w-44 shrink-0 font-mono text-xs font-medium text-white/70 truncate pr-2 border-r border-white/10">
                  {svc}
                </div>

                {/* Timeline Track Area */}
                <div className="relative flex-1 h-full mx-3">
                  {/* Subtle horizontal guide line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />

                  {/* Plotted Event Beacons */}
                  {serviceEvents.map((ev) => {
                    const timeStr =
                      timestampMode === "corrected"
                        ? ev.corrected_datetime || ev.original_timestamp
                        : ev.original_timestamp || ev.recorded_datetime;
                    const t = new Date(timeStr).getTime();
                    const percent = Math.min(
                      98,
                      Math.max(2, ((t - minTime) / duration) * 100)
                    );

                    const isSelected = selectedEventId === ev.id;
                    const isCritical =
                      ev.severity === "critical" ||
                      ev.severity === "error" ||
                      ev.severity === "CRITICAL";

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        style={{ left: `${percent}%` }}
                        title={`${ev.id} [${ev.severity}]: ${ev.message}`}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-200 z-10 ${
                          isSelected ? "scale-125 z-20" : "hover:scale-125"
                        }`}
                      >
                        <span
                          className={`relative flex items-center justify-center rounded-full transition-all ${
                            isSelected
                              ? "ring-2 ring-white h-4 w-4"
                              : "h-3 w-3 hover:ring-2 hover:ring-white/50"
                          } ${
                            isCritical
                              ? "bg-[#ef4444] shadow-[0_0_8px_#ef4444]"
                              : ev.severity === "warning" || ev.severity === "WARNING"
                              ? "bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"
                              : "bg-[#22c55e] shadow-[0_0_6px_#22c55e]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

