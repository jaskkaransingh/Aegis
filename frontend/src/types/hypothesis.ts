/**
 * AEGIS Hypothesis Arena Types.
 * Models competing incident explanations, epistemic evidence citations,
 * uncertainty bounds, and side-by-side comparison matrices.
 */

export type HypothesisOrigin = "Demo" | "Investigator" | "AI-generated";

export type HypothesisStatus =
  | "UNDER_EVALUATION"
  | "PLAUSIBLE"
  | "REFUTED"
  | "CONFIRMED";

export type EpistemicClaimType =
  | "OBSERVED_FACT"
  | "DERIVED_RESULT"
  | "INFERENCE"
  | "HYPOTHESIS"
  | "SIMULATED_RESULT";

export interface EvidenceReferenceItem {
  evidenceId: string;
  eventId: string;
  service: string;
  role: "SUPPORTING" | "CONTRADICTING" | "PRIMARY";
  excerpt: string;
  timestamp?: string | null;
  claimType: EpistemicClaimType | string;
}

export interface ArenaHypothesis {
  id: string; // e.g. DEMO-H1, HYP-01
  title: string;
  explanation: string;
  suspectedService: string | null;
  origin: HypothesisOrigin;
  status: HypothesisStatus;
  confidenceScore: number | null; // Calibrated score (e.g. 0.88, never 1.0)
  confidenceExplanation: string;
  supportingEvidence: EvidenceReferenceItem[];
  contradictingEvidence: EvidenceReferenceItem[];
  unresolvedQuestions: string[];
  observedFacts: string[];
  inferences: string[];
  assumptions: string[];
  dataSource: "live" | "demo";
}

export interface HypothesisFilterState {
  searchQuery: string;
  statusFilter: "ALL" | HypothesisStatus;
  serviceFilter: "ALL" | string;
  sortBy: "id" | "confidence" | "supporting_count";
}

export interface HypothesisArenaSummary {
  totalHypotheses: number;
  totalEvidenceExamined: number;
  totalUnresolvedQuestions: number;
  investigationStatus: "Awaiting analysis" | "Demo hypotheses" | "Hypotheses available";
  dataSource: "live" | "demo";
}

