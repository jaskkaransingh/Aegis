# AEGIS Backend Integration Guide

Welcome to the AEGIS Backend API! This document provides frontend engineers with everything needed to connect, develop, and integrate against the local FastAPI simulation server.

---

## 1. Base URL

All REST API endpoints are exposed under the following local base URL:

```
http://localhost:8000
```

Interactive API documentation (Swagger UI) is available at:
- **Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

CORS is pre-configured to allow local frontend origins (including `http://localhost:3000` for Next.js / Vite).

---

## 2. Starting the FastAPI Server (Windows)

To start the backend development server on Windows:

1. Open your terminal (PowerShell or Command Prompt).
2. Navigate to the `backend` directory:
   ```powershell
   cd f:\project\aegis\backend
   ```
3. Launch Uvicorn with auto-reload:
   ```powershell
   uvicorn app.main:app --reload
   ```

The server will initialize on `http://127.0.0.1:8000` and automatically reload whenever backend source files change.

---

## 3. Available API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Simulation health status and environment |
| `GET` | `/api/services` | Catalog of 7 CivicHealth microservices and their operational states |
| `GET` | `/api/logs` | Raw, uncorrected incident log events (supports `?service=` and `?severity=` filters) |
| `GET` | `/api/logs/normalized` | Deduplicated, time-corrected log stream with uncertainty intervals |
| `POST` | `/api/investigate` | AI investigation trigger stub returning preliminary findings and hypotheses |

*(Note: `GET /api/dependencies` is also available for fetching the service communication graph edges).*

---

## 4. Exact Example JSON Responses

### A. `GET /api/logs/normalized`

Returns deduplicated, timestamp-corrected log events. Notice that payment logs reflect the 120-second clock skew correction (`clock_correction_applied: true`, `offset_applied_seconds: 120.0`).

```json
[
  {
    "event_id": "EVT-001",
    "incident_id": "INC-CIVICHEALTH-001",
    "service": "postgresql-database",
    "timestamp": "2026-10-31T14:00:02Z",
    "level": "WARN",
    "event_type": "CONFIG_CHANGE",
    "message": "Configuration update applied: aggressive worker batching with zero backoff applied to archival queries.",
    "source": "postgresql-database",
    "trace_id": null,
    "metadata": {},
    "id": "EVT-001",
    "severity": "WARN",
    "corrected_timestamp": "2026-10-31T14:00:02Z",
    "timestamp_uncertainty_ms": 0,
    "evidence_type": "observed_fact",
    "raw_id": "EVT-001",
    "original_timestamp": "2026-10-31T14:00:02.000Z",
    "recorded_datetime": "2026-10-31T14:00:02Z",
    "corrected_datetime": "2026-10-31T14:00:02Z",
    "uncertainty_seconds": 0.0,
    "time_interval_start": "2026-10-31T14:00:02Z",
    "time_interval_end": "2026-10-31T14:00:02Z",
    "is_duplicate": false,
    "duplicate_of": null,
    "data_quality_warnings": [],
    "clock_correction_applied": false,
    "offset_applied_seconds": 0.0
  },
  {
    "event_id": "EVT-010",
    "incident_id": "INC-CIVICHEALTH-001",
    "service": "payment-service",
    "timestamp": "2026-10-31T14:03:00Z",
    "level": "WARN",
    "event_type": "PAYMENT_HOLD",
    "message": "Payment processing delayed: appointment booking confirmation pending from appointment-service.",
    "source": "payment-service",
    "trace_id": "trace-pay-5011",
    "metadata": {},
    "id": "EVT-010",
    "severity": "WARN",
    "corrected_timestamp": "2026-10-31T14:01:00Z",
    "timestamp_uncertainty_ms": 0,
    "evidence_type": "observed_fact",
    "raw_id": "EVT-010",
    "original_timestamp": "2026-10-31T14:03:00.000Z",
    "recorded_datetime": "2026-10-31T14:03:00Z",
    "corrected_datetime": "2026-10-31T14:01:00Z",
    "uncertainty_seconds": 0.0,
    "time_interval_start": "2026-10-31T14:01:00Z",
    "time_interval_end": "2026-10-31T14:01:00Z",
    "is_duplicate": false,
    "duplicate_of": null,
    "data_quality_warnings": [],
    "clock_correction_applied": true,
    "offset_applied_seconds": 120.0
  }
]
```

---

### B. `POST /api/investigate`

#### Request Payload
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "incident_id": "INC-CIVICHEALTH-001"
}
```

#### Response (`200 OK`)
```json
{
  "investigation_id": "INV-STUB-001",
  "incident_id": "INC-CIVICHEALTH-001",
  "status": "completed",
  "timeline": [
    {
      "timeline_id": "TL-STUB-001",
      "event_id": "EVT-001",
      "service": "api-gateway",
      "corrected_timestamp": "2026-10-31T13:02:50.186Z",
      "uncertainty_seconds": 0.0,
      "interval_start": "2026-10-31T13:02:50.186Z",
      "interval_end": "2026-10-31T13:02:50.186Z",
      "severity": "INFO",
      "summary": "Simulated incident trigger received. AI integration pending.",
      "claim_type": "DERIVED_RESULT",
      "correlated_trace_ids": [
        "trace-stub-001"
      ],
      "uncertain_ordering_with": []
    }
  ],
  "hypotheses": [
    {
      "hypothesis_id": "HYP-STUB-001",
      "title": "AI Investigation Placeholder",
      "explanation": "Automated root cause analysis pipeline pending AI integration.",
      "supporting_evidence_ids": [
        "EVT-001"
      ],
      "contradicting_evidence_ids": [],
      "unresolved_questions": [
        "Awaiting full LLM investigation agent integration."
      ],
      "status": "under_investigation",
      "id": "HYP-STUB-001",
      "description": "Automated root cause analysis pipeline pending AI integration.",
      "suspected_root_cause_service": null,
      "claim_type": "HYPOTHESIS",
      "confidence_score": 0.5,
      "supporting_evidence": [
        {
          "evidence_id": "EVT-001",
          "source": "system",
          "relevance": "high",
          "role": "supporting",
          "event_id": "EVT-001",
          "source_service": "system",
          "support_type": "supporting",
          "excerpt": "",
          "timestamp": null,
          "claim_type": "OBSERVED_FACT"
        }
      ],
      "contradicting_evidence": [],
      "plausibility_reasoning": "Automated root cause analysis pipeline pending AI integration."
    }
  ],
  "claims": [
    {
      "claim_id": "CLM-STUB-001",
      "text": "AI Integration Pending",
      "claim_type": "INFERENCE",
      "evidence_ids": [
        "EVT-001"
      ],
      "confidence": 0.5,
      "confidence_basis": "Mock contract stub response for frontend integration"
    }
  ],
  "data_quality_issues": [],
  "message": "AI Integration Pending",
  "incident_name": "Investigation for INC-CIVICHEALTH-001",
  "generated_at": "2026-10-31T13:02:50.186Z",
  "total_raw_events": 1,
  "total_normalized_events": 1,
  "data_quality_warnings_count": 0,
  "warnings": [],
  "service_graph_summary": {}
}
```

---

## 5. Important Note on Clock Skew Simulation

> **Payment Service Clock Skew:**
> In our simulation scenario, the **Payment** service (`payment-service` / `payment`) has an **intentional +120-second clock skew** (its server clock ran 2 minutes fast).
>
> - When fetching raw logs via `GET /api/logs`, Payment events appear 120 seconds ahead of reality (e.g. `timestamp: "2026-10-31T14:03:00Z"`).
> - When fetching normalized logs via `GET /api/logs/normalized`, the engine deterministically subtracts 120 seconds:
>   - `corrected_timestamp` is adjusted backwards to `"2026-10-31T14:01:00Z"`.
>   - `original_timestamp` preserves the raw uncorrected value (`"2026-10-31T14:03:00.000Z"`).
>   - `clock_correction_applied` is set to `true`.
>   - `offset_applied_seconds` is `120.0`.
>
> Use `corrected_timestamp` for all frontend timeline sorting and causal sequence rendering.
