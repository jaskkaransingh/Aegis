"""
Deterministic Pytest Tests for AEGIS REST API Endpoints.
Verifies status codes, JSON schema compliance, and response payloads
using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_health():
    """
    Verifies that GET /api/health returns HTTP 200 and valid JSON.
    """
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    data = response.json()
    assert data == {"status": "ok", "environment": "simulation"}


def test_get_services():
    """
    Verifies that GET /api/services returns HTTP 200 and a valid JSON array of services.
    """
    response = client.get("/api/services")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    services = response.json()
    assert isinstance(services, list), "Response payload must be a valid JSON array"
    assert len(services) == 7, f"Expected 7 services in catalog, got {len(services)}"

    # Validate schema of each service in the catalog
    expected_keys = {"id", "name", "status"}
    for svc in services:
        assert isinstance(svc, dict), "Each service entry must be a JSON object"
        assert expected_keys.issubset(svc.keys()), f"Service missing required keys: {svc}"

    service_ids = {s["id"] for s in services}
    assert "payment-service" in service_ids or "payment" in service_ids
    assert "postgresql-database" in service_ids


def test_raw_logs_keep_duplicate_and_future_payment_timestamps():
    response = client.get("/api/logs")
    assert response.status_code == 200

    logs = response.json()
    event_ids = [entry["event_id"] for entry in logs]
    assert len(logs) == 15
    assert event_ids.count("EVT-010") == 2

    payment_times = [
        entry["timestamp"]
        for entry in logs
        if entry["service"] == "payment-service"
    ]
    assert payment_times
    assert max(payment_times) > "2026-10-31T14:02:10.000Z"


def test_get_logs_normalized():
    """
    Verifies that GET /api/logs/normalized returns HTTP 200 and valid JSON
    with deduplication and timestamp corrections applied.
    """
    response = client.get("/api/logs/normalized")
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    logs = response.json()
    assert isinstance(logs, list), "Response payload must be a valid JSON array"
    assert len(logs) > 0, "Normalized logs array must not be empty"
    assert len(logs) == 14
    assert len({entry["event_id"] for entry in logs}) == len(logs)

    for entry in logs:
        assert isinstance(entry, dict), "Log entry must be a JSON object"
        assert "event_id" in entry or "id" in entry, "Log entry missing event ID"
        assert "service" in entry, "Log entry missing 'service' field"
        assert "corrected_timestamp" in entry, "Log entry missing 'corrected_timestamp'"
        assert "timestamp" in entry, "Log entry missing 'timestamp'"

    # Verify payment service events have clock skew corrected
    payment_entries = [e for e in logs if "payment" in e.get("service", "").lower()]
    assert len(payment_entries) > 0, "Expected at least one payment event in normalized logs"
    for pe in payment_entries:
        assert pe.get("clock_correction_applied") is True or pe.get("offset_applied_seconds") == 120.0
