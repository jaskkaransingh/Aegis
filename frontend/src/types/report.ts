/**
 * AEGIS Investigation Report Types.
 * Models the 10 formal sections of an evidence-grounded incident post-mortem report.
 * Strictly separates observed facts, evidence citations, hypotheses, and epistemic limitations.
 */

export interface ExecutiveSummaryData {
  incidentId: string;
  incidentTitle: string;
  summary: string;
  observedImpact: string;
  investigationStatus: string;
  isDraft: boolean;
}

export interface IncidentOverviewData {
  incidentId: string;
  title: string;
  environment: string;
  initialSymptoms: string;
  affectedServices: string[];
  detectionTimestamp: string;
  investigationStatus: string;
}

export interface EvidenceInventoryItem {
  id: string; // Canonical event ID (e.g. EVT-001)
  timestamp: string;
  service: string;
  severity: string;
  eventType: string;
  message: string;
}

export interface TimelineReportItem {
  timelineId: string;
  eventId: string;
  service: string;
  originalTimestamp: string;
  correctedTimestamp: string;
  uncertaintySeconds: number;
  isConcurrentOrUncertain: boolean;
  severity: string;
  summary: string;
}

export interface ServiceImpactItem {
  serviceId: string;
  serviceName: string;
  status: string;
  impactType: "OBSERVED_OUTAGE" | "DEGRADED_PERFORMANCE" | "HEALTHY_CALLER" | "UNKNOWN";
  evidenceIds: string[];
  directDependencies: string[];
}

export interface HypothesisReportItem {
  id: string;
  title: string;
  explanation: string;
  status: string;
  confidenceScore: number | null;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  unresolvedQuestions: string[];
  isDemo: boolean;
}

export interface RootCauseAssessmentData {
  classification: "UNDETERMINED" | "LEADING_HYPOTHESIS" | "POSSIBLE_CONTRIBUTOR" | "CONFIRMED";
  leadingHypothesisId: string | null;
  leadingHypothesisTitle: string | null;
  rationale: string;
  contributingFactors: string[];
  epistemicNotice: string;
}

export interface CounterfactualSummaryData {
  simulationExecuted: boolean;
  statusMessage: string;
  scenarios: Array<{
    name: string;
    target: string;
    action: string;
    assumptions: string;
  }>;
}

export interface LimitationsData {
  unresolvedAreas: string[];
  telemetryGaps: string[];
  simulationStatus: string;
}

export interface NextStepsData {
  recommendations: Array<{
    category: string;
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    rationale: string;
  }>;
}

export interface InvestigationReport {
  metadata: {
    reportId: string;
    generatedAt: string;
    incidentId: string;
    version: string;
    status: "Draft" | "Demo report" | "Awaiting investigation results" | "Ready to export";
    dataSource: "live" | "demo";
  };
  section1ExecutiveSummary: ExecutiveSummaryData;
  section2IncidentOverview: IncidentOverviewData;
  section3EvidenceInventory: EvidenceInventoryItem[];
  section4Timeline: TimelineReportItem[];
  section5ServiceImpact: ServiceImpactItem[];
  section6Hypotheses: HypothesisReportItem[];
  section7RootCause: RootCauseAssessmentData;
  section8Counterfactual: CounterfactualSummaryData;
  section9Limitations: LimitationsData;
  section10NextSteps: NextStepsData;
}

