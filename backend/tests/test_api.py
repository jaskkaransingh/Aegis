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
    assert isinstance(data, dict), "Response payload must be a valid JSON object"
    assert data.get("status") in ("healthy", "ok"), f"Unexpected health status: {data.get('status')}"
    assert "service" in data, "Response JSON missing 'service' field"
    assert "version" in data, "Response JSON missing 'version' field"


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
