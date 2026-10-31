/**
 * AEGIS Evidence Explorer Types.
 * Strictly models canonical log and telemetry evidence emitted by the backend.
 * Distinguishes recorded sensor timestamps from clock-corrected reference timestamps.
 */

import type { DataQualityWarning } from "./index";

export type EvidenceSeverity = "CRITICAL" | "ERROR" | "WARN" | "INFO" | "NORMAL" | string;

export interface EvidenceRecord {
  id: string; // Canonical event ID (e.g. EVT-001)
  raw_id: string;
  incident_id: string | null;
  service: string;
  source: string;
  severity: EvidenceSeverity;
  event_type: string;
  message: string;
  trace_id: string | null;
  metadata: Record<string, unknown>;
  evidence_type: string;
  original_timestamp: string;
  recorded_datetime: string;
  corrected_datetime: string;
  uncertainty_seconds: number;
  time_interval_start: string;
  time_interval_end: string;
  clock_correction_applied: boolean;
  offset_applied_seconds: number;
  is_duplicate: boolean;
  duplicate_of: string | null;
  data_quality_warnings: DataQualityWarning[];
  dataSource: "live" | "demo";
}

export interface EvidenceFilterState {
  searchQuery: string;
  selectedService: string;
  selectedSeverity: string;
  selectedEventType: string;
  timestampMode: "raw" | "corrected";
  hasTraceOnly: boolean;
  hasWarningsOnly: boolean;
  clockSkewOnly: boolean;
}

export interface EvidenceSummary {
  totalCount: number;
  filteredCount: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  skewedCount: number;
  dataSource: "live" | "demo";
  lastLoaded: string | null;
}

