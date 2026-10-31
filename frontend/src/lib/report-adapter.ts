/**
 * AEGIS Investigation Report Assembly Adapter.
 * Integrates evidence, timeline, topology, hypotheses, and counterfactual scenarios
 * into 10 structured post-mortem sections with rigorous evidence grounding.
 */

import { apiClient } from "./api-client";
import {
  PRIMARY_DEMO_INCIDENT,
  DEMO_NORMALIZED_EVENTS,
  DEMO_SERVICES_STATUS,
  DEMO_TIMELINE_EVENTS,
} from "./demo-data";
import { DEMO_ARENA_HYPOTHESES } from "./hypothesis-adapter";
import { INITIAL_DEMO_SCENARIOS } from "./counterfactual-adapter";
import type {
  EvidenceInventoryItem,
  InvestigationReport,
  ServiceImpactItem,
  TimelineReportItem,
} from "@/types/report";

export async function assembleInvestigationReport(): Promise<InvestigationReport> {
  let isLive = false;
  let rawServices: Array<{ id: string; name: string; status?: string }> = [];
  let rawDependencies: Array<{ source: string; target: string }> = [];
  let rawEvents: Array<{
    id: string;
    service: string;
    timestamp: string;
    corrected_datetime?: string;
    recorded_datetime?: string;
    original_timestamp?: string;
    severity: string;
    event_type: string;
    message: string;
    uncertainty_seconds?: number;
  }> = [];

  try {
    const [servicesRes, depsRes, logsRes] = await Promise.allSettled([
      apiClient.getServices(),
      apiClient.getDependencies(),
      apiClient.getNormalizedLogs(),
    ]);

    if (servicesRes.status === "fulfilled" && servicesRes.value) {
      const val = servicesRes.value as any;
      if (Array.isArray(val)) rawServices = val;
      else if (Array.isArray(val.services)) rawServices = val.services;
    }

    if (depsRes.status === "fulfilled" && depsRes.value) {
      const val = depsRes.value as any;
      if (Array.isArray(val.edges)) rawDependencies = val.edges;
      else if (Array.isArray(val)) rawDependencies = val;
    }

    if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value) && logsRes.value.length > 0) {
      rawEvents = logsRes.value as any;
      isLive = true;
    }
  } catch {
    isLive = false;
  }

  // 1. Evidence Inventory Items
  const evidenceInventory: EvidenceInventoryItem[] = (
    isLive && rawEvents.length > 0 ? rawEvents : DEMO_NORMALIZED_EVENTS
  ).map((ev) => ({
    id: ev.id,
    timestamp: ev.corrected_datetime || ev.recorded_datetime || ev.original_timestamp || "",
    service: ev.service,
    severity: ev.severity,
    eventType: ev.event_type,
    message: ev.message,
  }));

  // 2. Timeline Report Items
  const timelineItems: TimelineReportItem[] = (
    isLive && rawEvents.length > 0 ? rawEvents : DEMO_TIMELINE_EVENTS
  ).map((ev: any, idx) => ({
    timelineId: ev.timeline_id || `TL-${idx + 1}`,
    eventId: ev.event_id || ev.id,
    service: ev.service,
    originalTimestamp: ev.original_timestamp || ev.recorded_datetime || ev.corrected_timestamp || "",
    correctedTimestamp: ev.corrected_datetime || ev.corrected_timestamp || "",
    uncertaintySeconds: typeof ev.uncertainty_seconds === "number" ? ev.uncertainty_seconds : 0.1,
    isConcurrentOrUncertain: Array.isArray(ev.uncertain_ordering_with) && ev.uncertain_ordering_with.length > 0,
    severity: ev.severity,
    summary: ev.summary || ev.message || "",
  }));

  // 3. Service Impact Items
  const depMap: Record<string, string[]> = {};
  rawDependencies.forEach((d) => {
    if (!depMap[d.source]) depMap[d.source] = [];
    depMap[d.source].push(d.target);
  });

  const serviceImpact: ServiceImpactItem[] = DEMO_SERVICES_STATUS.map((s) => {
    let impactType: ServiceImpactItem["impactType"] = "HEALTHY_CALLER";
    if (s.status === "CRITICAL") impactType = "OBSERVED_OUTAGE";
    else if (s.status === "DEGRADED" || s.status === "WARNING") impactType = "DEGRADED_PERFORMANCE";

    const linkedEvidence = evidenceInventory
      .filter((e) => e.service === s.id)
      .map((e) => e.id);

    return {
      serviceId: s.id,
      serviceName: s.name,
      status: s.status,
      impactType,
      evidenceIds: linkedEvidence,
      directDependencies: depMap[s.id] || [],
    };
  });

  // 4. Hypotheses Report Items
  const hypothesisItems = DEMO_ARENA_HYPOTHESES.map((h) => ({
    id: h.id,
    title: h.title,
    explanation: h.explanation,
    status: h.status,
    confidenceScore: h.confidenceScore,
    supportingEvidenceIds: h.supportingEvidence.map((e) => e.eventId),
    contradictingEvidenceIds: h.contradictingEvidence.map((e) => e.eventId),
    unresolvedQuestions: h.unresolvedQuestions,
    isDemo: h.origin === "Demo",
  }));

  const reportId = `REP-${new Date().toISOString().substring(0, 10)}-0881`;
  const generatedAt = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  }) + " UTC";

  return {
    metadata: {
      reportId,
      generatedAt,
      incidentId: "INC-2026-0881",
      version: "1.0-draft",
      status: isLive ? "Ready to export" : "Demo report",
      dataSource: isLive ? "live" : "demo",
    },
    section1ExecutiveSummary: {
      incidentId: "INC-2026-0881",
      incidentTitle: "Hospital Booking & Triage System Outage",
      summary:
        "On October 31, 2026, an unindexed archival batch query in the primary database cluster triggered maximum connection pool exhaustion (100/100 connections). This cascaded upstream to the Appointment and Hospital Records services, resulting in HTTP 504 Gateway Timeouts at the API Gateway and disruption of emergency triage bookings.",
      observedImpact:
        "Emergency triage registrations and appointment bookings stalled. 6 microservices experienced degraded or critical error states. Downstream Payment Service appeared to fail early under raw timestamps, but was verified to be a secondary symptom upon applying the +120.0s NTP clock drift correction.",
      investigationStatus: "UNDER_INVESTIGATION (Epistemic Root Cause Leading Hypothesis Identified)",
      isDraft: !isLive,
    },
    section2IncidentOverview: {
      incidentId: "INC-2026-0881",
      title: "Hospital Booking & Triage System Outage",
      environment: "CivicHealth Regional Production (Enclave 4)",
      initialSymptoms:
        "Elevated HTTP 504 error rates at API Gateway ingress; triage admission write failures on hospital-records-service.",
      affectedServices: [
        "postgresql-database",
        "appointment-service",
        "hospital-records-service",
        "payment-service",
        "api-gateway",
        "notification-service",
      ],
      detectionTimestamp: "2026-10-31 14:00:02 UTC",
      investigationStatus: "Draft Forensic Post-Mortem",
    },
    section3EvidenceInventory: evidenceInventory,
    section4Timeline: timelineItems,
    section5ServiceImpact: serviceImpact,
    section6Hypotheses: hypothesisItems,
    section7RootCause: {
      classification: "LEADING_HYPOTHESIS",
      leadingHypothesisId: "DEMO-H2",
      leadingHypothesisTitle: "Database Connection Pool Exhaustion via Unindexed Archival Query",
      rationale:
        "Temporal sequence analysis confirms that database connection pool exhaustion (EVT-002) preceded upstream microservice timeouts (EVT-003, EVT-004) by 6.7 seconds. An archival query with zero worker backoff (EVT-001) acquired prolonged RowShareLocks, saturating all 100 client connection slots.",
      contributingFactors: [
        "Zero-backoff client retry storm from appointment booking workers amplified queue saturation (EVT-002).",
        "Absence of statement timeout thresholds allowed long-running transactions to block available connection pool capacity indefinitely.",
        "System clock drift (+120.0s on payment-service) initially obscured true failure ordering, creating an illusion of primary payment enclave failure.",
      ],
      epistemicNotice:
        "AEGIS Forensic Policy: This finding represents the leading evidence-grounded hypothesis. In accordance with epistemic humility principles, root cause is classified as leading rather than definitive until formal transaction lock logs are corroborated.",
    },
    section8Counterfactual: {
      simulationExecuted: false,
      statusMessage: "Counterfactual simulation has not been executed.",
      scenarios: INITIAL_DEMO_SCENARIOS.map((s) => ({
        name: s.name,
        target: s.targetLabel,
        action: s.action,
        assumptions: s.assumptions,
      })),
    },
    section9Limitations: {
      unresolvedAreas: [
        "Statement-level PostgreSQL lock contention logs (pg_stat_activity query duration) were not collected at sub-second granularity.",
        "Mobile client retry telemetry lacked distributed trace context, preventing precise measurement of client retry amplification multipliers.",
      ],
      telemetryGaps: [
        "Clock uncertainty: Payment service clock offset (+120.0s) has an uncertainty interval of ±100ms, establishing strict posteriority relative to database failure.",
        "Absence of cryptographic HMAC audit logs across raw server collectors.",
      ],
      simulationStatus:
        "Causal counterfactual simulation engine is offline. Scenarios reflect investigator assumptions rather than verified computed outcomes.",
    },
    section10NextSteps: {
      recommendations: [
        {
          category: "Database Engineering",
          action: "Deploy index on patient_admissions_archive(archived_at) and configure 30s statement timeout.",
          priority: "HIGH",
          rationale: "Prevents sequential scan query locks from holding database connections indefinitely.",
        },
        {
          category: "Resilience & Architecture",
          action: "Configure exponential backoff and jitter on Appointment Service database client pools.",
          priority: "HIGH",
          rationale: "Mitigates retry amplification storms when pool slots become temporarily scarce.",
        },
        {
          category: "Telemetry Infrastructure",
          action: "Synchronize chrony NTP daemons across payment enclave to eliminate clock drift > 5ms.",
          priority: "MEDIUM",
          rationale: "Ensures cross-service log sequences can be correlated without requiring manual clock skew models.",
        },
        {
          category: "Forensic Readiness",
          action: "Connect causal simulation engine to Counterfactual Lab to validate circuit breaker isolation runbooks.",
          priority: "MEDIUM",
          rationale: "Allows SRE teams to mathematically verify proposed cascade mitigations prior to production rollout.",
        },
      ],
    },
  };
}

export function exportReportAsJson(report: InvestigationReport): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `AEGIS-Incident-Report-${report.metadata.incidentId}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

