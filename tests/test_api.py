"""
Integration Tests for AEGIS REST API (backend/app/api/routes.py).
Tests:
- GET /api/health
- GET /api/logs with and without clock correction
- GET /api/services catalog
- GET /api/dependencies NetworkX graph serialization
- CORS headers for Next.js dev server
- Query parameter filtering
- Structured data-quality warning validation
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Confirms health endpoint responds with 200 OK and expected structure."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["environment"] == "simulation"


def test_cors_headers_for_nextjs():
    """Verifies CORS origin allow headers for local Next.js client."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_raw_logs_endpoint():
    """Validates /api/logs returns raw logs from logs.json."""
    response = client.get("/api/logs")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 15

    # Check first record fields
    first = data[0]
    assert "event_id" in first
    assert "service" in first
    assert "timestamp" in first
    assert "level" in first


def test_normalized_logs_endpoint():
    """Validates /api/logs/normalized returns deduplicated, time-corrected events."""
    response = client.get("/api/logs/normalized")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 14  # 1 duplicate removed from 15

    # Check payment events have clock correction applied
    pay_events = [e for e in data if "payment" in e["service"]]
    assert len(pay_events) > 0
    for pe in pay_events:
        assert pe["clock_correction_applied"] is True
        assert pe["offset_applied_seconds"] == 120.0
        assert pe["corrected_timestamp"] is not None


def test_logs_endpoint_filtering():
    """Tests raw log filtering by service and severity."""
    # Filter by service
    resp_srv = client.get("/api/logs?service=postgresql-database")
    assert resp_srv.status_code == 200
    data_srv = resp_srv.json()
    assert len(data_srv) > 0
    for ev in data_srv:
        assert ev["service"] == "postgresql-database"

    # Filter by severity
    resp_sev = client.get("/api/logs?severity=CRITICAL")
    assert resp_sev.status_code == 200
    data_sev = resp_sev.json()
    assert len(data_sev) > 0
    for ev in data_sev:
        assert (ev.get("level") or ev.get("severity")) == "CRITICAL"


def test_services_endpoint():
    """Verifies /api/services returns catalog containing all 7 target services."""
    response = client.get("/api/services")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 7
    service_ids = {s["id"] for s in data}

    expected = {
        "api-gateway",
        "auth-service",
        "appointment-service",
        "payment-service",
        "hospital-records-service",
        "notification-service",
        "postgresql-database",
    }
    assert expected == service_ids


def test_dependencies_endpoint():
    """Validates /api/dependencies returns communication edges from dependencies.json."""
    response = client.get("/api/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert "edges" in data
    assert len(data["edges"]) >= 10

    # Ensure each edge has valid source and target
    for edge in data["edges"]:
        assert "source" in edge
        assert "target" in edge


def test_timeline_endpoint():
    """Verifies /api/timeline returns ordered events with uncertainty intervals."""
    response = client.get("/api/timeline")
    assert response.status_code == 200

    timeline = response.json()
    assert len(timeline) >= 15

    # Check attributes of timeline events
    for item in timeline:
        assert "timeline_id" in item
        assert "event_id" in item
        assert "service" in item
        assert "corrected_timestamp" in item
        assert "uncertainty_seconds" in item
        assert "interval_start" in item
        assert "interval_end" in item
        assert "uncertain_ordering_with" in item


def test_investigation_preview_endpoint():
    """Validates preliminary investigation endpoint with hypotheses and evidence references."""
    response = client.get("/api/investigation/preview")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "COMPLETED"
    assert len(data["hypotheses"]) >= 2

    # Check hypotheses schema and confidence limits
    for hyp in data["hypotheses"]:
        assert hyp["confidence_score"] < 1.00  # Epistemic limit
        assert len(hyp["supporting_evidence"]) > 0 or len(hyp["contradicting_evidence"]) > 0

        # Check evidence references
        for ev_ref in hyp["supporting_evidence"] + hyp["contradicting_evidence"]:
            assert ev_ref["event_id"] is not None
            assert ev_ref["excerpt"] is not None
            assert ev_ref["timestamp"] is not None


def test_missing_files_error_handling(monkeypatch):
    """Ensures endpoints return 404 when underlying JSON files are missing."""
    from app.tools import data_loader

    monkeypatch.setattr(data_loader, "DATA_DIR", data_loader.Path("/non/existent/directory"))

    resp_services = client.get("/api/services")
    assert resp_services.status_code == 404

    resp_logs = client.get("/api/logs")
    assert resp_logs.status_code == 404

    resp_norm = client.get("/api/logs/normalized")
    assert resp_norm.status_code == 404

    resp_dep = client.get("/api/dependencies")
    assert resp_dep.status_code == 404


def test_investigate_stub_endpoint():
    """Validates the POST /api/investigate stub endpoint contract."""
    payload = {"incident_id": "INC-CIVICHEALTH-001"}
    response = client.post("/api/investigate", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["incident_id"] == "INC-CIVICHEALTH-001"
    assert data["status"] == "completed"
    assert data["message"] == "AI Integration Pending"

    # Dummy timeline event
    assert len(data["timeline"]) >= 1
    t_ev = data["timeline"][0]
    assert t_ev["timeline_id"] == "TL-STUB-001"
    assert "corrected_timestamp" in t_ev

    # Dummy hypothesis
    assert len(data["hypotheses"]) >= 1
    hyp = data["hypotheses"][0]
    assert hyp["hypothesis_id"] == "HYP-STUB-001"
    assert hyp["status"] == "under_investigation"

    # Epistemic claim check
    assert len(data["claims"]) >= 1
    claim = data["claims"][0]
    assert claim["text"] == "AI Integration Pending"


