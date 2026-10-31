# AEGIS Forensic Prompt Design Principles

This directory will house prompt templates for AEGIS agentic investigation components.

All prompts designed for AEGIS must strictly conform to the following forensic and epistemic principles:

## 1. Strict Evidence Grounding
- Prompts must instruct models to operate exclusively over provided telemetry and evidence records.
- Models must never fabricate, extrapolate, or invent canonical event identifiers (e.g. `EVT-xxx`).
- Every assertion of observed fact must cite the exact `evidence_id` from which it was derived.

## 2. Epistemic Humility
- Models must never declare 100% certainty on complex cascade interactions.
- Confidence scores must be capped at 0.99 (`< 1.0`).
- Ambiguities in timing, clock drift, or uninstrumented services must be explicitly highlighted in an `unresolved_questions` or `limitations` section.

## 3. Separation of Epistemic Categories
Prompts must separate output into explicit categories:
- **Observed Facts**: Directly witnessed in verified log events.
- **Derived Results**: Reconstructed or calculated (e.g. interval-corrected timestamps).
- **Inferences**: Deductions supported by evidence.
- **Hypotheses**: Plausible candidate failure mechanisms under evaluation.
- **Assumptions**: Stated conditions not directly verified by logs.

## 4. Evaluation Ground Truth Isolation
- Ground truth evaluation datasets (`ground_truth.json`) must NEVER be included in any prompt or system instruction.
- The investigation workflow must demonstrate independent, evidence-grounded deduction.

