/**
 * AEGIS Hypothesis Arena Adapter.
 * Normalizes live backend investigation findings or provides grounded demonstration hypotheses.
 * Enforces strict evidence traceability and epistemic separation of facts vs inferences.
 */

import { apiClient } from "./api-client";
import type {
  ArenaHypothesis,
  EvidenceReferenceItem,
  HypothesisFilterState,
  HypothesisArenaSummary,
  HypothesisStatus,
} from "@/types/hypothesis";
import type { Hypothesis, InvestigationResult } from "@/types";

// ------------------------------------------------------------------
// Verified Demonstration Hypotheses (Grounding in logs.json)
// ------------------------------------------------------------------

export const DEMO_ARENA_HYPOTHESES: ArenaHypothesis[] = [
  {
    id: "DEMO-H1",
    title: "Retry Amplification Storm",
    explanation:
      "Repeated client and service requests without exponential backoff may be amplifying backend workload, contributing to cascade failures following initial database delays.",
    suspectedService: "appointment-service",
    origin: "Demo",
    status: "PLAUSIBLE",
    confidenceScore: 0.65,
    confidenceExplanation:
      "Plausible candidate: logs show 42 queries queued in backlog due to retry loops, but the exact amplification multiplier depends on unmeasured client backoff settings.",
    supportingEvidence: [
      {
        evidenceId: "EVT-002",
        eventId: "EVT-002",
        service: "postgresql-database",
        role: "SUPPORTING",
        excerpt: "42 client queries currently queued in backlog due to retry loop.",
        timestamp: "2026-10-31T14:00:15.000Z",
        claimType: "OBSERVED_FACT",
      },
      {
        evidenceId: "EVT-003",
        eventId: "EVT-003",
        service: "appointment-service",
        role: "SUPPORTING",
        excerpt: "Failed to acquire database connection from pool after 5000ms timeout for appointment booking query.",
        timestamp: "2026-10-31T14:00:22.000Z",
        claimType: "OBSERVED_FACT",
      },
    ],
    contradictingEvidence: [],
    unresolvedQuestions: [
      "Are mobile clients configuring zero-backoff retries on HTTP 504 timeouts?",
      "Does API Gateway rate-limiting throttle client ingress before worker pool exhaustion?",
    ],
    observedFacts: [
      "42 client queries queued in PostgreSQL connection backlog at 14:00:15 UTC.",
      "Appointment Service logged connection acquisition timeout after 5000ms at 14:00:22 UTC.",
    ],
    inferences: [
      "Rapid retry bursts from unthrottled clients exacerbated existing connection saturation.",
    ],
    assumptions: [
      "Client SDK default retry count is set to 3 without exponential backoff.",
    ],
    dataSource: "demo",
  },
  {
    id: "DEMO-H2",
    title: "Database Connection Pool Exhaustion",
    explanation:
      "An aggressive archival batch query locked table resources for >78 seconds, exhausting the 100-connection database pool and stalling upstream booking and records workers.",
    suspectedService: "postgresql-database",
    origin: "Demo",
    status: "UNDER_EVALUATION",
    confidenceScore: 0.88,
    confidenceExplanation:
      "High correlation: database pool saturation preceded all upstream microservice timeouts by 6.7 seconds.",
    supportingEvidence: [
      {
        evidenceId: "EVT-001",
        eventId: "EVT-001",
        service: "postgresql-database",
        role: "SUPPORTING",
        excerpt: "Configuration update applied: aggressive worker batching with zero backoff applied to archival queries.",
        timestamp: "2026-10-31T14:00:02.000Z",
        claimType: "OBSERVED_FACT",
      },
      {
        evidenceId: "EVT-002",
        eventId: "EVT-002",
        service: "postgresql-database",
        role: "SUPPORTING",
        excerpt: "Max connections reached: 100/100 connections allocated. 42 client queries currently queued in backlog.",
        timestamp: "2026-10-31T14:00:15.000Z",
        claimType: "OBSERVED_FACT",
      },
      {
        evidenceId: "EVT-004",
        eventId: "EVT-004",
        service: "hospital-records-service",
        role: "SUPPORTING",
        excerpt: "Could not persist patient triage admission record: connection pool timeout waiting for available connection.",
        timestamp: "2026-10-31T14:00:24.000Z",
        claimType: "OBSERVED_FACT",
      },
    ],
    contradictingEvidence: [],
    unresolvedQuestions: [
      "Was the aggressive worker batching update triggered automatically by a cron job or manual deployment?",
      "Why did statement timeout thresholds fail to terminate queries holding RowShareLocks?",
    ],
    observedFacts: [
      "Configuration update applied to archival queries with zero backoff at 14:00:02 UTC.",
      "PostgreSQL connection pool reached maximum 100/100 saturation at 14:00:15 UTC.",
      "Hospital Records Service experienced triage admission write failures at 14:00:24 UTC.",
    ],
    inferences: [
      "Upstream microservice worker threads starved because the primary database pool had 0 free connections.",
    ],
    assumptions: [
      "Primary database cluster connection limit is statically capped at 100 connections across all services.",
    ],
    dataSource: "demo",
  },
  {
    id: "DEMO-H3",
    title: "Downstream Dependency Degradation",
    explanation:
      "Payment Service was initially suspected of initiating the cascade, but time-corrected ordering indicates its delays were downstream consequences.",
    suspectedService: "payment-service",
    origin: "Demo",
    status: "REFUTED",
    confidenceScore: 0.18,
    confidenceExplanation:
      "Refuted: +120.0s clock skew on payment-service created an illusion of prior failure; corrected timestamp places payment timeouts after database failure.",
    supportingEvidence: [
      {
        evidenceId: "EVT-010",
        eventId: "EVT-010",
        service: "payment-service",
        role: "SUPPORTING",
        excerpt: "Payment processing delayed: appointment booking confirmation pending from appointment-service.",
        timestamp: "2026-10-31T14:01:00.000Z",
        claimType: "OBSERVED_FACT",
      },
    ],
    contradictingEvidence: [
      {
        evidenceId: "EVT-003",
        eventId: "EVT-003",
        service: "appointment-service",
        role: "CONTRADICTING",
        excerpt: "Appointment Service database connection timeout occurred at 14:00:22 UTC, preceding Payment Service delay at 14:01:00 UTC.",
        timestamp: "2026-10-31T14:00:22.000Z",
        claimType: "DERIVED_RESULT",
      },
    ],
    unresolvedQuestions: [
      "Did payment pre-auth timeouts trigger automatic transaction rollbacks in booking workers?",
      "Are payment gateway webhooks queued asynchronously or blocking the main HTTP handler thread?",
    ],
    observedFacts: [
      "Payment Service system clock had a +120.0s drift relative to UTC reference standard.",
      "Payment hold message was logged at raw 14:03:00Z, which normalizes to 14:01:00 UTC.",
    ],
    inferences: [
      "Payment Service delays were downstream effects caused by appointment booking stalls.",
    ],
    assumptions: [
      "Clock drift offset of +120.0s was stable across the entire incident window.",
    ],
    dataSource: "demo",
  },
];

// ------------------------------------------------------------------
// Live Backend Normalization
// ------------------------------------------------------------------

function normalizeLiveHypothesis(rawH: unknown, idx: number): ArenaHypothesis {
  const h = (rawH && typeof rawH === "object" ? rawH : {}) as Record<string, any>;
  const hypId = String(h.id || h.hypothesis_id || `HYP-${idx + 1}`);
  const title = String(h.title || `Hypothesis ${hypId}`);
  const explanation = String(h.description || h.explanation || "No explanation provided.");
  const suspected = h.suspected_root_cause_service ? String(h.suspected_root_cause_service) : null;

  let status: HypothesisStatus = "UNDER_EVALUATION";
  const stUpper = String(h.status || "").toUpperCase();
  if (stUpper.includes("CONFIRM")) status = "CONFIRMED";
  else if (stUpper.includes("REFUT")) status = "REFUTED";
  else if (stUpper.includes("PLAUSIB")) status = "PLAUSIBLE";

  const rawSupporting = Array.isArray(h.supporting_evidence) ? h.supporting_evidence : [];
  const supporting: EvidenceReferenceItem[] = rawSupporting.map((e: any) => ({
    evidenceId: String(e.evidence_id || e.event_id || "EVT-UNKNOWN"),
    eventId: String(e.event_id || e.evidence_id || "EVT-UNKNOWN"),
    service: String(e.source_service || e.source || "unknown"),
    role: "SUPPORTING",
    excerpt: String(e.excerpt || ""),
    timestamp: e.timestamp ? String(e.timestamp) : null,
    claimType: String(e.claim_type || "OBSERVED_FACT"),
  }));

  const rawContradicting = Array.isArray(h.contradicting_evidence) ? h.contradicting_evidence : [];
  const contradicting: EvidenceReferenceItem[] = rawContradicting.map((e: any) => ({
    evidenceId: String(e.evidence_id || e.event_id || "EVT-UNKNOWN"),
    eventId: String(e.event_id || e.evidence_id || "EVT-UNKNOWN"),
    service: String(e.source_service || e.source || "unknown"),
    role: "CONTRADICTING",
    excerpt: String(e.excerpt || ""),
    timestamp: e.timestamp ? String(e.timestamp) : null,
    claimType: String(e.claim_type || "DERIVED_RESULT"),
  }));

  const unresolved = Array.isArray(h.unresolved_questions) ? h.unresolved_questions.map(String) : [];

  return {
    id: hypId,
    title,
    explanation,
    suspectedService: suspected,
    origin: "AI-generated",
    status,
    confidenceScore: typeof h.confidence_score === "number" ? h.confidence_score : null,
    confidenceExplanation: String(h.plausibility_reasoning || "Preliminary model plausibility score."),
    supportingEvidence: supporting,
    contradictingEvidence: contradicting,
    unresolvedQuestions: unresolved,
    observedFacts: [],
    inferences: [explanation],
    assumptions: [],
    dataSource: "live",
  };
}

export async function fetchArenaHypotheses(): Promise<{
  hypotheses: ArenaHypothesis[];
  summary: HypothesisArenaSummary;
  isLive: boolean;
}> {
  let isLive = false;
  let hypotheses: ArenaHypothesis[] = [];

  try {
    const previewRes = await apiClient.getInvestigationPreview();
    if (previewRes && Array.isArray(previewRes.hypotheses) && previewRes.hypotheses.length > 0) {
      hypotheses = previewRes.hypotheses.map(normalizeLiveHypothesis);
      isLive = true;
    }
  } catch {
    isLive = false;
  }

  // Fallback to grounded demonstration hypotheses
  if (!isLive || hypotheses.length === 0) {
    hypotheses = DEMO_ARENA_HYPOTHESES;
  }

  let totalEvidenceExamined = 0;
  let totalUnresolvedQuestions = 0;

  hypotheses.forEach((h) => {
    totalEvidenceExamined += h.supportingEvidence.length + h.contradictingEvidence.length;
    totalUnresolvedQuestions += h.unresolvedQuestions.length;
  });

  const summary: HypothesisArenaSummary = {
    totalHypotheses: hypotheses.length,
    totalEvidenceExamined,
    totalUnresolvedQuestions,
    investigationStatus: isLive ? "Hypotheses available" : "Demo hypotheses",
    dataSource: isLive ? "live" : "demo",
  };

  return {
    hypotheses,
    summary,
    isLive,
  };
}

export function filterHypotheses(
  hypotheses: ArenaHypothesis[],
  filters: HypothesisFilterState
): ArenaHypothesis[] {
  const query = filters.searchQuery.trim().toLowerCase();

  const filtered = hypotheses.filter((h) => {
    // 1. Search filter
    if (query) {
      const matchId = h.id.toLowerCase().includes(query);
      const matchTitle = h.title.toLowerCase().includes(query);
      const matchExp = h.explanation.toLowerCase().includes(query);
      const matchSrv = h.suspectedService ? h.suspectedService.toLowerCase().includes(query) : false;
      if (!matchId && !matchTitle && !matchExp && !matchSrv) return false;
    }

    // 2. Status filter
    if (filters.statusFilter !== "ALL" && h.status !== filters.statusFilter) {
      return false;
    }

    // 3. Service filter
    if (filters.serviceFilter !== "ALL" && h.suspectedService !== filters.serviceFilter) {
      return false;
    }

    return true;
  });

  // Sort
  if (filters.sortBy === "confidence") {
    filtered.sort((a, b) => (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0));
  } else if (filters.sortBy === "supporting_count") {
    filtered.sort((a, b) => b.supportingEvidence.length - a.supportingEvidence.length);
  } else {
    filtered.sort((a, b) => a.id.localeCompare(b.id));
  }

  return filtered;
}
