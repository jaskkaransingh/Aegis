# AEGIS AI Engine — Foundation & Architecture

## 1. Purpose of the AI Engine

The **AEGIS AI Engine** provides the agentic investigation intelligence for the **Autonomous Evidence-Grounded Investigation System (AEGIS)**. Its primary mission is to autonomously reconstruct, analyze, and explain complex cascading infrastructure outages across distributed microservices.

Key capabilities of the engine:
- **Timestamp-Aware Reconstruction**: Reconciles clock-skewed log telemetry using deterministic clock offset intervals.
- **Service Dependency Graph Awareness**: Navigates topology dependencies to trace propagation paths from root causes to symptom gateways.
- **Competing Hypothesis Arena**: Evaluates multiple plausible candidate failure mechanisms, tracking both corroborating and refuting evidence.
- **Evidence-Grounded Rigor**: Enforces epistemic humility. Factual assertions must cite verified source event IDs; confidence is capped below 1.0; uninstrumented gaps are explicitly surfaced.
- **Structured Forensic Artifacts**: Generates post-mortem reports and counterfactual intervention proposals ready for engineering action.

---

## 2. Architecture & Ownership Boundaries

AEGIS operates with strict separation of ownership across the system:

```text
                  +-----------------------------------+
                  |          AEGIS System             |
                  +-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
   [ Fast API Backend ]    [ Next.js Frontend ]      [ AEGIS AI Engine ]
   - Ingestion & Normalizer  - Evidence Explorer       - Ollama Local LLM Client
   - Clock Skew Estimation   - Service Topology        - Typed Forensic Schemas
   - Graph & SQLite Engine   - Timeline Reconstruct    - Epistemic Validation
   - Tests & Benchmarks      - Hypothesis Arena        - Planned Agentic Workflows
   (Teammate Owned)          (Frontend Owned)          (AI Engine Owned)
```

- **Teammate Ownership**: `backend/`, `tests/`, `requirements.txt`, root environment.
- **AI Engine Ownership**: `ai_engine/` (isolated schemas, client, tests, and configuration).
- **Frontend Ownership**: `frontend/` (visualizations and operator controls).
- **Isolation Constraint**: The AI Engine does NOT import the FastAPI application runtime directly, does not modify backend databases, and NEVER accesses evaluation ground truth (`backend/app/evaluation/ground_truth.json`).

---

## 3. Windows Environment Setup

The AI Engine is designed to run in an isolated Python virtual environment inside `ai_engine/`.

### Prerequisites
- Python 3.14+ (Installed on Windows at `C:\Python314\python.exe` or accessible via `py -3.14`)
- Local Ollama daemon (Installed at `C:\Users\<User>\AppData\Local\Programs\Ollama\ollama.exe`)

### Step-by-Step PowerShell Setup
```powershell
# 1. Navigate to the AI Engine root directory
cd d:\aegis\ai_engine

# 2. Create an isolated virtual environment
py -3.14 -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install dedicated AI engine dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements-ai.txt
```

> **Note**: Do not install packages into or modify the root `d:\aegis\.venv` environment, which is reserved exclusively for the backend.

---

## 4. Installing Isolated Dependencies

Dependencies are specified in `ai_engine/requirements-ai.txt`:

```text
pydantic>=2.10.0,<3.0.0
httpx>=0.27.0,<1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
python-dotenv>=1.0.0
```

- **Pydantic**: Provides typed, strictly validated schemas for evidence references, claims, and hypotheses.
- **HTTPX**: High-performance asynchronous HTTP client communicating with Ollama's local endpoints.
- **Pytest**: Automated test execution for schema constraints and mocked client network calls.
- **Python-Dotenv**: Safe local environment variable loading.

---

## 5. Configuring Ollama

Configuration is managed via `ai_engine/config.py` using typed defaults or environment variables.

Copy `.env.example` to `.env` inside `ai_engine/` for local configuration overrides:

```bash
cp ai_engine/.env.example ai_engine/.env
```

| Environment Variable | Default Value | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Endpoint of the running Ollama HTTP server |
| `OLLAMA_MODEL` | `llama3.2:3b` | Target local model for reasoning and structured JSON |
| `OLLAMA_TIMEOUT_SECONDS` | `60.0` | Maximum request duration before raising timeout |
| `OLLAMA_MAX_RETRIES` | `2` | Number of retry attempts on transient network drops |
| `OLLAMA_TEMPERATURE` | `0.1` | Low sampling temperature for deterministic forensic output |

---

## 6. Discovering Installed Models

To inspect which local models are installed and running:

```powershell
# Using Ollama CLI
ollama list

# Or using the AEGIS AI Engine CLI
python ai_engine/main.py --list-models
```

Verified local models in this environment:
- **`llama3.2:3b`** (2.0 GB, Llama 3.2 family — Primary default model)
- **`qwen3:0.6b`** (522 MB, Qwen 3 family — Lightweight fallback option)

---

## 7. Running the Diagnostic Script

The diagnostic tool validates end-to-end connectivity, model readiness, basic text generation, and schema-constrained JSON inference without touching any incident data.

```powershell
python ai_engine/scripts/check_ollama.py
```

### Diagnostic Output Example:
```text
============================================================
AEGIS AI Engine -- Ollama Environment Diagnostic
============================================================
Target URL:         http://127.0.0.1:11434
Configured Model:   llama3.2:3b
Request Timeout:    60.0s
------------------------------------------------------------
[1/5] Checking Ollama service connectivity... [PASSED]
[2/5] Discovering installed models... [PASSED] (2 model(s) detected)
      - llama3.2:3b
      - qwen3:0.6b
[3/5] Validating configured model 'llama3.2:3b'... [PASSED]
[4/5] Testing basic generation with test prompt... [PASSED] (Response: 'PONG')
[5/5] Testing structured JSON schema output... [PASSED]
      Validated JSON: {'status': 'ok', 'probe_id': 'probe-001', 'confidence': 0.9}
============================================================
STATUS: ALL DIAGNOSTIC CHECKS PASSED [OK]
The AI Engine foundation is ready for agentic workflow implementation.
============================================================
```

If the Ollama daemon is offline, start it with:
```powershell
ollama serve
```

---

## 8. Running Unit Tests

The test suite validates data schemas, epistemic rules, and Ollama client error handling without requiring a live Ollama server or network connection (all HTTP calls are mocked via `httpx.MockTransport`).

```powershell
# Run all unit tests
pytest ai_engine/tests -v

# Run schema validation tests only
pytest ai_engine/tests/test_schemas.py -v

# Run client network & error handling tests only
pytest ai_engine/tests/test_ollama_client.py -v
```

### In-Memory CLI Schema Verification:
```powershell
python ai_engine/main.py --validate-schemas
```

### Live Smoke Test on Synthetic Evidence:
```powershell
# Evidence Analyst smoke test
python ai_engine/main.py --smoke-analyst

# Timeline Correlator smoke test
python ai_engine/main.py --smoke-timeline
```

---

## 9. Implemented Agents

### A. Evidence Analyst Agent (Phase 11)
Located in [`ai_engine/agents/evidence_analyst.py`](ai_engine/agents/evidence_analyst.py).
- Consumes verified evidence records and identifies factual observations (`OBSERVED_FACT`) and inferences (`INFERENCE`).
- Deterministically validates all model-cited evidence IDs.
- Cites exact canonical event IDs; rejects ungrounded claims.

### B. Timeline Correlator Agent (Phase 12)
Located in [`ai_engine/agents/timeline_correlator.py`](ai_engine/agents/timeline_correlator.py) with deterministic interval calculation in [`ai_engine/core/temporal_analysis.py`](ai_engine/core/temporal_analysis.py).

#### Responsibilities & Capabilities
- **Deterministic First**: Pairwise interval comparisons, ordering classifications, and pattern detection are computed in pure Python without LLM dependency.
- **Timestamp & Interval Interpretation**:
  - Handles raw vs. corrected timestamps and preserves both in timeline entries.
  - Normalizes timezone-aware timestamps to UTC. Flags timezone-naive comparisons as ambiguous when mixed.
  - Accounts for uncertainty intervals $[t - \Delta, t + \Delta]$. Rejects intervals where start occurs after end.
- **Temporal Relationships**:
  - `DEFINITELY_BEFORE`: Event A's latest plausible time strictly precedes Event B's earliest plausible time ($A_{end} < B_{start}$).
  - `DEFINITELY_AFTER`: Event A's earliest plausible time strictly succeeds Event B's latest plausible time ($B_{end} < A_{start}$).
  - `POSSIBLY_BEFORE` / `POSSIBLY_AFTER`: Uncertainty intervals intersect, but estimated instants differ; exact order is ambiguous.
  - `OVERLAPPING`: Uncertainty intervals intersect with equal or indeterminate estimated times; exact order cannot be determined.
  - `SAME_TIME_OR_INDETERMINATE`: Events occur at identical timestamps or intervals.
  - `UNKNOWN`: Missing, unparseable, or mixed naive/aware timestamps prevent comparison.
- **No Forced Total Ordering**: Overlapping events are flagged with `is_concurrent_or_uncertain = True` and list all overlapping counterpart IDs in `uncertain_ordering_with`.
- **Temporal Pattern Detection**:
  - **Error Bursts**: Dense clusters of `>= 2` ERROR/CRITICAL events within `timeline_error_burst_window_seconds` (default 10s).
  - **Cross-Service Clusters**: Events spanning `>= 2` distinct services occurring within `timeline_cluster_window_seconds` (default 15s).
  - **Timeline Gaps**: Elapsed time between consecutive events exceeding `timeline_gap_threshold_seconds` (default 30s).
  - **Ambiguous Clusters**: Groups of `>= 2` events whose uncertainty intervals mutually intersect.
- **Optional Ollama Summarization**:
  - If Ollama is available, synthesizes a readable narrative of deterministic findings.
  - Validates that every event ID in the LLM summary exists in the input set. Unknown IDs trigger `InvalidEvidenceReferenceError`.
  - If Ollama is offline or times out, falls back cleanly to the deterministic timeline summary without failing the pipeline.
- **Explicit Epistemic Humility**:
  - **Causality Disclaimer**: *"Temporal correlation does not establish causation. An event occurring before another event does not prove it caused the later event."*

#### Synthetic Example
```python
from ai_engine.agents.timeline_correlator import TimelineCorrelatorAgent
from ai_engine.schemas.analyst import EvidenceInputRecord

records = [
    EvidenceInputRecord(
        evidence_id="TEST-EVT-001",
        service="database",
        timestamp="2026-10-31T14:00:00Z",
        uncertainty_seconds=1.0,
        message="Connection pool exhausted.",
    ),
    EvidenceInputRecord(
        evidence_id="TEST-EVT-002",
        service="api-gateway",
        timestamp="2026-10-31T14:00:05Z",
        uncertainty_seconds=1.0,
        message="HTTP 504 Gateway Timeout.",
    ),
]

agent = TimelineCorrelatorAgent()
result = await agent.correlate(records)

print(result.status)  # AnalysisStatus.SUCCESS
for entry in result.timeline_entries:
    print(entry.event_id, entry.corrected_timestamp, entry.is_concurrent_or_uncertain)
```

---

## 10. Current Limitations

1. **Standalone Correlation**: The Timeline Correlator operates directly on provided evidence records. Connecting output from the Evidence Analyst into the Timeline Correlator as an integrated multi-agent graph will be introduced in subsequent phases.
2. **Bounded Window**: Configured for up to 50 records / 128 KB payload per correlation call to ensure fast, deterministic local inference without exceeding context boundaries.
3. **Local Latency**: LLM summarization with `llama3.2:3b` takes approximately 4-6 seconds locally. Deterministic analysis alone executes in under 5 milliseconds.

---

## 11. Planned Agent Workflow

In upcoming phases, the engine will implement a specialized multi-agent forensic workflow:

1. **Evidence Analyst** (Implemented): Ingests normalized log events, extracts timing intervals, identifies anomalies, and filters telemetry noise.
2. **Timeline Correlator** (Implemented): Reconstructs cross-service chronological event ordering, accounting for clock offset uncertainty intervals (+/- delta t).
3. **Hypothesis Engine**: Formulates competing explanations for the failure cascade (e.g., query lock exhaustion vs. upstream client retry storms).
4. **Adversarial Critic**: Systematically probes each hypothesis against contradicting telemetry, challenging ungrounded claims and confirmation bias.
5. **Evidence Auditor**: Re-checks that every asserted claim cites verified canonical event IDs (`EVT-xxx`) and rejects unsupported factual assertions.
6. **Investigation Report Generator**: Synthesizes the final 10-section post-mortem report preview and exports machine-readable JSON.

---

## 12. Proposed Backend Integration Boundary

When connecting the AI Engine with my teammate's FastAPI backend in a future phase, communication will proceed over well-defined HTTP interfaces:

| Action | Proposed Backend Route | Method | Payload / Response |
|---|---|---|---|
| Fetch Normalized Logs | `/api/logs/normalized` | `GET` | Returns list of verified `NormalizedEvent` records |
| Query Service Topology | `/api/topology` | `GET` | Returns graph nodes and directed dependency edges |
| Post Investigation Results | `/api/investigations/{id}/results` | `POST` | Submits finalized claims, hypotheses, and report |
| Trigger Simulation Engine | `/api/counterfactual/simulate` | `POST` | Submits intervention scenario for causal projection |

