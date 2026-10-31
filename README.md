# AEGIS: Autonomous Evidence-Grounded Investigation System

AEGIS is an AI-powered diagnostic and incident correlation platform engineered to investigate complex, cascading cross-service failures in critical public infrastructure (such as municipal healthcare networks, regional transport grids, and utilities).

During cross-service cascading incidents, telemetry is often fragmented, clocks drift across server enclaves, logs duplicate or drop fields, and naive investigators confuse downstream symptoms with initiating root causes. AEGIS addresses these challenges through **deterministic evidence normalization**, **rigorous clock skew correction with timing uncertainty intervals**, **topological graph analysis**, and **strict epistemic tracking** before any AI reasoning takes place.

---

## Architecture & Technology Stack

- **Backend Web Framework:** FastAPI (asynchronous, OpenAPI 3.1, high-performance)
- **Data Validation & Schemas:** Pydantic v2 (strict type enforcement, validation boundaries)
- **Dependency Topology:** NetworkX (directed service dependency graph, cycle and path analysis)
- **Agent Orchestration Readiness:** LangGraph & LangChain (ready for subsequent multi-agent reasoning nodes)
- **Synthetic Incident Dataset:** Deterministic JSON logs with deliberate clock offsets, telemetry anomalies, and conflicting symptoms
- **Evaluation Isolation:** Ground-truth benchmarking dataset isolated from runtime context

---

## Project Structure

```
aegis/
├── backend/
│   └── app/
│       ├── main.py                  # FastAPI application entrypoint & CORS middleware
│       ├── api/
│       │   ├── __init__.py
│       │   └── routes.py            # REST API endpoints (/health, /logs, /services, /dependencies, /timeline)
│       ├── agents/                  # Reserved for LangGraph multi-agent orchestration
│       │   └── __init__.py
│       ├── graph/
│       │   ├── __init__.py
│       │   └── service_graph.py     # NetworkX service dependency graph manager
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── clock_correction.py  # Deterministic clock offset arithmetic & interval overlap detection
│       │   ├── evidence_normalizer.py # Ingestion pipeline, duplicate detection, warning emitter
│       │   └── data_loader.py       # Safe file loading with ground-truth isolation
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── events.py            # RawEvent, NormalizedEvent, ClockOffsetEstimate, DataQualityWarning
│       │   └── investigation.py     # ClaimType, EvidenceReference, Hypothesis, InvestigationResult
│       ├── data/
│       │   ├── logs.json            # Synthetic healthcare cascading incident log stream
│       │   ├── clock_metadata.json  # Reference NTP/PTP drift metadata per service
│       │   └── services.json        # Infrastructure service registry and technology tiers
│       └── evaluation/
│           ├── __init__.py
│           └── ground_truth.json    # Planted initiating failure, cascade chain & evaluation criteria
├── tests/
│   ├── __init__.py
│   ├── test_api.py                  # API endpoints, filtering, and CORS integration tests
│   ├── test_clock_correction.py     # Offset conventions, uncertainty intervals, ordering tests
│   ├── test_evidence_normalizer.py  # Deduplication, synthetic IDs, missing fields, zero-silent-drop tests
│   ├── test_evidence_reference_validation.py # Epistemic limits, evidence resolution to real event IDs
│   ├── test_ground_truth_isolation.py # Verifies ground truth is never leaked or referenced by runtime
│   └── test_service_graph.py        # Graph topology, node state aggregation, edge classification
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

---

## Core Deterministic Investigation Tools

### 1. Clock Skew Correction & Timing Uncertainty (`app/tools/clock_correction.py`)
- **Convention:** A positive offset means the source clock is *ahead* of UTC reference time.
  $$\text{Corrected Time} = \text{Recorded Time} - \text{Clock Offset}$$
- **Uncertainty Interval:** Rather than claiming exactness, each event is bounded by an uncertainty interval:
  $$[\text{Corrected Time} - \Delta, \text{Corrected Time} + \Delta]$$
- **Uncertain Ordering:** If two event intervals overlap and lack an explicit causal trace, AEGIS assigns them `CONCURRENT_OR_UNCERTAIN` status rather than fabricating a temporal sequence.

### 2. Evidence Normalization Pipeline (`app/tools/evidence_normalizer.py`)
- **Zero Silent Discards:** Malformed records, missing timestamps, and ID collisions are preserved in the normalized stream with explicit synthetic IDs and structured `DataQualityWarning` entries.
- **Duplicate Detection:** Differentiates identical payload re-transmissions from ID collisions across different services.
- **Source Provenance:** Preserves exact original raw timestamps and raw identifiers alongside normalized attributes.

### 3. Service Dependency Graph (`app/graph/service_graph.py`)
- **Rigid Edge Distinction:** Clearly separates `KNOWN_DEPENDENCY` (architectural, static service contracts) from `INFERRED_CAUSAL` (dynamically discovered incident failure propagation).
- **Incident Severity Aggregation:** Attaches normalized events to nodes, dynamically tracking event counts and highest severity (`CRITICAL`, `ERROR`, `WARN`, `INFO`).
- **Frontend Serialization:** Exports graph nodes and edges into JSON ready for interactive visualization.

---

## Synthetic Incident Scenario: Metro Health Cascade

The bundled scenario models a critical failure across 7 public healthcare services:
- **`postgresql-database` (Tier 0):** Unindexed bulk query on `patient_admissions_archive` holds locks for 78+ seconds, saturating the connection pool (`100/100` connections).
- **`appointment-service` (Tier 1):** Fails to acquire database connection, saturates its worker thread pool, and trips its circuit breaker into `OPEN` state.
- **`hospital-records-service` (Tier 1):** Emergency admission writes fail; admission retry queue overflows, forcing emergency walk-ins to paper fallback.
- **`payment-service` (Tier 2):** Experiences copay pre-authorization timeouts. *Skew Trap:* System clock is drifted **+42.0 seconds ahead** of UTC. In raw logs, it falsely appears to fail a minute later; clock correction reveals it failed synchronously with the appointment service.
- **`api-gateway` (Edge):** Mobile clients and web portals receive `504 Gateway Timeout` and `502 Bad Gateway`.
- **`notification-service` (Tier 3):** Booking confirmation message queue starves due to upstream circuit breaking.
- **`auth-service` (Tier 1):** *Conflicting Symptom Distractor:* Logs session revocation query timeouts against DB, but cached token validation continues to succeed (refuting auth crash).

---

## Windows Setup Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14 on Windows)
- PowerShell 5.1+ or PowerShell Core 7+

### Step 1: Clone and Navigate to Directory
```powershell
cd d:\aegis
```

### Step 2: Create and Activate Virtual Environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
*(If PowerShell execution policy restricts script execution, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

### Step 3: Install Backend Dependencies
```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
```powershell
Copy-Item .env.example .env
```

---

## Running the Backend

Start the FastAPI development server with hot-reload enabled:

```powershell
$env:PYTHONPATH = "d:\aegis\backend"
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```

Once running:
- **Interactive Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## Running Tests

Execute the comprehensive 34-test test suite:

```powershell
$env:PYTHONPATH = "d:\aegis\backend"
.\.venv\Scripts\pytest.exe tests -v
```

### Test Coverage Highlights
| Test Module | Tests | Verifications |
| :--- | :---: | :--- |
| `tests/test_clock_correction.py` | 7 | Positive/negative skew, Payment Service +42s offset, uncertainty bounds, uncertain ordering |
| `tests/test_evidence_normalizer.py` | 6 | Duplicate detection (content & ID), synthetic ID fallback, missing fields, zero silent drops |
| `tests/test_service_graph.py` | 5 | All 7 services present, known vs causal edge distinction, severity aggregation, serialization |
| `tests/test_evidence_reference_validation.py` | 4 | Evidence references resolve to real events, epistemic limits ($\le 0.99$ confidence), 5 claim types |
| `tests/test_ground_truth_isolation.py` | 4 | Codebase scan ensures `ground_truth.json` is never loaded into runtime; APIs do not expose secrets |
| `tests/test_api.py` | 8 | Health, logs (with/without clock correction), services, dependencies, timeline, CORS headers |

---

## REST API Reference & Example Responses

### 1. `GET /api/health`
Checks operational status and API version.

```json
{
  "status": "healthy",
  "service": "AEGIS Backend Engine",
  "version": "0.1.0",
  "timestamp": "2026-10-31T14:35:10.120Z",
  "environment": "development"
}
```

---

### 2. `GET /api/logs?apply_clock_correction=true`
Retrieves normalized, validated events with clock correction and data quality warnings.

**Query Parameters:**
- `service` (string, optional): Filter by service name (e.g. `postgresql-database`)
- `severity` (string, optional): Filter by severity (`INFO`, `WARN`, `ERROR`, `CRITICAL`)
- `trace_id` (string, optional): Filter by distributed trace ID
- `apply_clock_correction` (boolean, default: `true`): Apply NTP/PTP offset adjustments

**Example Response Excerpt:**
```json
{
  "total_count": 22,
  "returned_count": 22,
  "clock_correction_active": true,
  "applied_offsets": {
    "payment-service": 42.0,
    "postgresql-database": 0.0,
    "api-gateway": 0.0,
    "auth-service": 0.0,
    "appointment-service": 0.0,
    "hospital-records-service": 0.0,
    "notification-service": 0.0
  },
  "warnings_count": 5,
  "data_quality_warnings": [
    {
      "code": "CLOCK_OFFSET_APPLIED",
      "severity": "LOW",
      "message": "Applied clock offset of +42.00s for service 'payment-service' (uncertainty +/-2.00s, method: ntp_drift_estimate_ingress).",
      "event_id": "EVT-013",
      "field_name": "timestamp",
      "action_taken": "Shifted recorded time by -42.00s to align with UTC."
    },
    {
      "code": "DUPLICATE_CONTENT_DETECTED",
      "severity": "MEDIUM",
      "message": "Event 'EVT-014' has identical service, timestamp, and message to 'EVT-014'.",
      "field_name": "message",
      "event_id": "EVT-014",
      "action_taken": "Flagged is_duplicate=True, preserved record."
    }
  ],
  "events": [
    {
      "id": "EVT-013",
      "raw_id": "EVT-013",
      "service": "payment-service",
      "original_timestamp": "2026-10-31T14:01:10.120Z",
      "recorded_datetime": "2026-10-31T14:01:10.120000Z",
      "corrected_datetime": "2026-10-31T14:00:28.120000Z",
      "uncertainty_seconds": 2.0,
      "time_interval_start": "2026-10-31T14:00:26.120000Z",
      "time_interval_end": "2026-10-31T14:00:30.120000Z",
      "severity": "ERROR",
      "event_type": "PAYMENT_TRANSACTION_FAILED",
      "message": "Payment processing aborted: could not resolve booking reference against Appointment Service.",
      "trace_id": "trace-booking-99130",
      "is_duplicate": false,
      "clock_correction_applied": true,
      "offset_applied_seconds": 42.0
    }
  ]
}
```

---

### 3. `GET /api/services`
Lists all registered components with infrastructure tier and description.

**Example Response:**
```json
{
  "system_name": "Metro Health Public Infrastructure",
  "environment": "production",
  "total_services": 7,
  "services": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "tier": "edge",
      "technology": "Kong / OpenResty",
      "criticality": "TIER_1",
      "description": "Public entrance gateway handling patient portal and mobile clinic requests."
    },
    {
      "id": "postgresql-database",
      "name": "PostgreSQL Database",
      "tier": "data_persistence",
      "technology": "PostgreSQL 16 High-Availability Cluster",
      "criticality": "TIER_0",
      "description": "Shared primary relational database holding appointment, patient, and billing state."
    }
  ]
}
```

---

### 4. `GET /api/dependencies`
Returns the serialized NetworkX dependency topology with incident severity annotations.

**Example Response Excerpt:**
```json
{
  "nodes": [
    {
      "id": "postgresql-database",
      "name": "PostgreSQL Database",
      "tier": "data_persistence",
      "description": "Primary relational database cluster storing bookings, EHR, and ledgers",
      "event_count": 5,
      "highest_severity": "CRITICAL",
      "event_ids": ["EVT-000", "EVT-001", "EVT-002", "EVT-017", "EVT-018"]
    }
  ],
  "edges": [
    {
      "source": "appointment-service",
      "target": "postgresql-database",
      "edge_type": "KNOWN_DEPENDENCY",
      "protocol": "PostgreSQL Wire",
      "is_synchronous": true,
      "inferred_confidence": null,
      "reasoning": null
    }
  ],
  "total_nodes": 7,
  "total_edges": 14,
  "critical_services": ["postgresql-database", "appointment-service", "hospital-records-service"]
}
```

---

### 5. `GET /api/timeline`
Chronologically ordered incident events with uncertainty windows and detected concurrency overlaps.

```json
[
  {
    "timeline_id": "TL-002",
    "event_id": "EVT-001",
    "service": "postgresql-database",
    "corrected_timestamp": "2026-10-31T14:00:02.100Z",
    "uncertainty_seconds": 0.1,
    "interval_start": "2026-10-31T14:00:02.000Z",
    "interval_end": "2026-10-31T14:00:02.200Z",
    "severity": "WARN",
    "summary": "Scheduled archival job initiated: 'SELECT * FROM patient_admissions_archive WHERE archived_at < NOW() - INTERVAL '90 days'...",
    "claim_type": "DERIVED_RESULT",
    "correlated_trace_ids": [],
    "uncertain_ordering_with": []
  }
]
```

---

## Ground Truth & Epistemic Guidelines

1. **Strict Evaluation Isolation:** `backend/app/evaluation/ground_truth.json` describes the hidden truth (planted initiating event, downstream cascade, evaluation criteria). It is strictly quarantined for automated benchmarking and is never loaded into runtime investigation or exposed via any API.
2. **Epistemic Humility:** Hypotheses and inferred causal edges never claim 100% confidence ($0.0 \le \text{confidence} \le 0.99$).
3. **Evidence Traceability:** Every evidence reference resolves strictly to a real event ID present in the normalized dataset; fabricated IDs are rejected.
4. **No LLMs for Arithmetic:** Timestamp math, offset subtraction, and interval comparison are executed deterministically in Python.

