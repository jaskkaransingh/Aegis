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
    assert data["status"] == "healthy"
    assert data["service"] == "AEGIS Backend Engine"
    assert "version" in data
    assert "timestamp" in data
    assert data["environment"] == "development"


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


def test_logs_endpoint_with_clock_correction():
    """Validates /api/logs returns normalized events, applied offsets, and data quality warnings."""
    response = client.get("/api/logs?apply_clock_correction=true")
    assert response.status_code == 200

    data = response.json()
    assert data["clock_correction_active"] is True
    assert "payment-service" in data["applied_offsets"]
    assert data["applied_offsets"]["payment-service"] == 42.0

    # Ensure events are present
    events = data["events"]
    assert len(events) >= 20

    # Locate Payment Service event and confirm offset was applied
    pay_events = [e for e in events if e["service"] == "payment-service"]
    assert len(pay_events) > 0
    for pe in pay_events:
        assert pe["clock_correction_applied"] is True
        assert pe["offset_applied_seconds"] == 42.0
        assert pe["original_timestamp"] is not None

    # Check that data quality warnings are returned
    assert data["warnings_count"] > 0
    warning_codes = [w["code"] for w in data["data_quality_warnings"]]
    assert "DUPLICATE_EVENT_ID" in warning_codes or "DUPLICATE_CONTENT_DETECTED" in warning_codes
    assert "CLOCK_OFFSET_APPLIED" in warning_codes


def test_logs_endpoint_filtering():
    """Tests log filtering by service and severity."""
    # Filter by service
    resp_srv = client.get("/api/logs?service=postgresql-database")
    assert resp_srv.status_code == 200
    data_srv = resp_srv.json()
    for ev in data_srv["events"]:
        assert ev["service"] == "postgresql-database"

    # Filter by severity
    resp_sev = client.get("/api/logs?severity=CRITICAL")
    assert resp_sev.status_code == 200
    data_sev = resp_sev.json()
    for ev in data_sev["events"]:
        assert ev["severity"] == "CRITICAL"


def test_services_endpoint():
    """Verifies /api/services returns catalog containing all 7 target services."""
    response = client.get("/api/services")
    assert response.status_code == 200

    data = response.json()
    assert data["total_services"] == 7
    service_ids = {s["id"] for s in data["services"]}

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
    """Validates /api/dependencies returns NetworkX serialized graph with nodes and edges."""
    response = client.get("/api/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert data["total_nodes"] >= 7
    assert data["total_edges"] >= 10

    # Ensure nodes carry incident severity metrics
    node_map = {n["id"]: n for n in data["nodes"]}
    assert "postgresql-database" in node_map
    assert node_map["postgresql-database"]["highest_severity"] == "CRITICAL"
    assert node_map["postgresql-database"]["event_count"] > 0

    # Ensure edges have edge_type
    for edge in data["edges"]:
        assert "source" in edge
        assert "target" in edge
        assert "edge_type" in edge
        assert edge["edge_type"] in ["KNOWN_DEPENDENCY", "INFERRED_CAUSAL"]


def test_timeline_endpoint():
    """Verifies /api/timeline returns ordered events with uncertainty intervals."""
    response = client.get("/api/timeline")
    assert response.status_code == 200

    timeline = response.json()
    assert len(timeline) >= 20

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

