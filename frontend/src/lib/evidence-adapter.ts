/**
 * AEGIS Evidence Explorer Adapter.
 * Normalizes live backend logs (/api/logs/normalized or /api/logs) or falls back to labeled demo fixtures.
 * Enforces strict canonical ID preservation and evidence immutability.
 */

import { apiClient } from "./api-client";
import { DEMO_NORMALIZED_EVENTS } from "./demo-data";
import type { EvidenceFilterState, EvidenceRecord, EvidenceSummary } from "@/types/evidence";
import type { NormalizedEvent } from "@/types";

export interface EvidenceLoadResult {
  records: EvidenceRecord[];
  summary: EvidenceSummary;
  error: string | null;
}

export function normalizeEvidenceEvent(
  rawEvent: unknown,
  sourceType: "live" | "demo"
): EvidenceRecord {
  const ev = (rawEvent && typeof rawEvent === "object" ? rawEvent : {}) as Record<string, unknown>;
  const canonicalId = String(ev.id || ev.event_id || ev.raw_id || "UNKNOWN_ID");
  const rawId = String(ev.raw_id || ev.event_id || canonicalId);
  const service = String(ev.service || "unknown-service");
  const source = String(ev.source || service);
  const severity = String(ev.severity || ev.level || "INFO").toUpperCase();
  const eventType = String(ev.event_type || "LOG");
  const message = String(ev.message || "");
  const traceId = ev.trace_id ? String(ev.trace_id) : null;
  const incidentId = ev.incident_id ? String(ev.incident_id) : null;
  const metadata = (ev.metadata && typeof ev.metadata === "object") ? (ev.metadata as Record<string, unknown>) : {};
  const evidenceType = String(ev.evidence_type || "observed_fact");

  const originalTs = String(
    ev.original_timestamp || ev.recorded_datetime || ev.timestamp || new Date().toISOString()
  );
  const recordedDt = String(ev.recorded_datetime || ev.timestamp || originalTs);
  const correctedDt = String(
    ev.corrected_datetime || ev.corrected_timestamp || recordedDt
  );

  const uncertaintySeconds = typeof ev.uncertainty_seconds === "number"
    ? ev.uncertainty_seconds
    : typeof ev.timestamp_uncertainty_ms === "number"
    ? ev.timestamp_uncertainty_ms / 1000
    : 0.0;

  const timeIntervalStart = String(ev.time_interval_start || correctedDt);
  const timeIntervalEnd = String(ev.time_interval_end || correctedDt);

  const clockCorrectionApplied = Boolean(ev.clock_correction_applied);
  const offsetAppliedSeconds = typeof ev.offset_applied_seconds === "number"
    ? ev.offset_applied_seconds
    : 0.0;

  const isDuplicate = Boolean(ev.is_duplicate);
  const duplicateOf = ev.duplicate_of ? String(ev.duplicate_of) : null;
  const dataQualityWarnings = Array.isArray(ev.data_quality_warnings) ? ev.data_quality_warnings : [];

  return {
    id: canonicalId,
    raw_id: rawId,
    incident_id: incidentId,
    service,
    source,
    severity,
    event_type: eventType,
    message,
    trace_id: traceId,
    metadata,
    evidence_type: evidenceType,
    original_timestamp: originalTs,
    recorded_datetime: recordedDt,
    corrected_datetime: correctedDt,
    uncertainty_seconds: uncertaintySeconds,
    time_interval_start: timeIntervalStart,
    time_interval_end: timeIntervalEnd,
    clock_correction_applied: clockCorrectionApplied,
    offset_applied_seconds: offsetAppliedSeconds,
    is_duplicate: isDuplicate,
    duplicate_of: duplicateOf,
    data_quality_warnings: dataQualityWarnings,
    dataSource: sourceType,
  };
}

export async function fetchEvidenceDataset(): Promise<EvidenceLoadResult> {
  let records: EvidenceRecord[] = [];
  let isLive = false;
  let loadError: string | null = null;

  try {
    // 1. Try normalized logs endpoint first (documented in backend/INTEGRATION.md)
    try {
      const normalized = await apiClient.getNormalizedLogs();
      if (Array.isArray(normalized) && normalized.length > 0) {
        records = normalized.map((ev) => normalizeEvidenceEvent(ev, "live"));
        isLive = true;
      }
    } catch {
      // Endpoint fallback
    }

    // 2. If normalized logs didn't return, try general logs endpoint
    if (!isLive) {
      const logsRes = await apiClient.getLogs({ apply_clock_correction: true });
      if (logsRes && Array.isArray(logsRes.events) && logsRes.events.length > 0) {
        records = logsRes.events.map((ev) => normalizeEvidenceEvent(ev, "live"));
        isLive = true;
      } else if (Array.isArray(logsRes) && logsRes.length > 0) {
        records = (logsRes as Record<string, unknown>[]).map((ev) =>
          normalizeEvidenceEvent(ev, "live")
        );
        isLive = true;
      }
    }
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to connect to backend logs service";
    isLive = false;
  }

  // 3. Fallback to centralized demonstration fixtures
  if (!isLive || records.length === 0) {
    records = DEMO_NORMALIZED_EVENTS.map((ev) => normalizeEvidenceEvent(ev, "demo"));
  }

  const criticalCount = records.filter((r) => r.severity === "CRITICAL").length;
  const errorCount = records.filter((r) => r.severity === "ERROR").length;
  const warningCount = records.filter((r) => r.severity === "WARN" || r.severity === "WARNING").length;
  const skewedCount = records.filter((r) => r.clock_correction_applied || r.offset_applied_seconds !== 0).length;

  const summary: EvidenceSummary = {
    totalCount: records.length,
    filteredCount: records.length,
    criticalCount,
    errorCount,
    warningCount,
    skewedCount,
    dataSource: isLive ? "live" : "demo",
    lastLoaded: new Date().toLocaleTimeString(),
  };

  return {
    records,
    summary,
    error: isLive ? null : (loadError || "Backend offline; displaying demonstration evidence."),
  };
}

export function filterEvidenceRecords(
  records: EvidenceRecord[],
  filters: EvidenceFilterState
): EvidenceRecord[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return records.filter((rec) => {
    // 1. Text Search across message, ID, service, event_type, trace_id, source
    if (query) {
      const matchId = rec.id.toLowerCase().includes(query) || rec.raw_id.toLowerCase().includes(query);
      const matchMsg = rec.message.toLowerCase().includes(query);
      const matchSrv = rec.service.toLowerCase().includes(query);
      const matchType = rec.event_type.toLowerCase().includes(query);
      const matchSource = rec.source.toLowerCase().includes(query);
      const matchTrace = rec.trace_id ? rec.trace_id.toLowerCase().includes(query) : false;

      if (!matchId && !matchMsg && !matchSrv && !matchType && !matchSource && !matchTrace) {
        return false;
      }
    }

    // 2. Service Filter
    if (filters.selectedService !== "ALL" && rec.service !== filters.selectedService) {
      return false;
    }

    // 3. Severity Filter
    if (filters.selectedSeverity !== "ALL") {
      const target = filters.selectedSeverity.toUpperCase();
      const actual = rec.severity.toUpperCase();
      if (target === "WARN" && (actual === "WARN" || actual === "WARNING")) {
        // match
      } else if (actual !== target) {
        return false;
      }
    }

    // 4. Event Type Filter
    if (filters.selectedEventType !== "ALL" && rec.event_type !== filters.selectedEventType) {
      return false;
    }

    // 5. Has Traces Only
    if (filters.hasTraceOnly && !rec.trace_id) {
      return false;
    }

    // 6. Has Warnings Only
    if (filters.hasWarningsOnly && rec.data_quality_warnings.length === 0) {
      return false;
    }

    // 7. Clock Skew Only
    if (filters.clockSkewOnly && !rec.clock_correction_applied && rec.offset_applied_seconds === 0) {
      return false;
    }

    return true;
  });
}

export function formatEvidenceTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().replace("T", " ").replace("Z", " UTC");
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().substring(11, 23);
  } catch {
    return isoString;
  }
}
