"""
Strict Ground Truth Isolation Tests.
Ensures that runtime API endpoints, particularly GET /api/logs,
do NOT leak the hidden evaluation ground truth ('retry-policy').
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_ground_truth_not_in_raw_logs():
    """
    Strict test calling GET /api/logs to assert that the string 'retry-policy'
    (the hidden root-cause ground truth) does NOT exist anywhere in the API response.
    """
    response = client.get("/api/logs")
    assert response.status_code == 200, f"Expected 200 OK from /api/logs, got {response.status_code}"

    raw_response_text = response.text
    lower_response_text = raw_response_text.lower()

    # Assert 'retry-policy' does NOT exist anywhere in the API response
    assert "retry-policy" not in lower_response_text, (
        "Ground truth violation: 'retry-policy' leaked in GET /api/logs response!"
    )
    assert "retry_policy" not in lower_response_text, (
        "Ground truth violation: 'retry_policy' leaked in GET /api/logs response!"
    )

    # Detailed inspection of every log entry
    logs = response.json()
    assert isinstance(logs, list)
    for entry in logs:
        for key, value in entry.items():
            if isinstance(value, str):
                assert "retry-policy" not in value.lower(), (
                    f"Ground truth leak in log field '{key}': {value}"
                )


def test_ground_truth_not_in_normalized_logs():
    """
    Ensures normalized logs endpoint also preserves ground truth isolation.
    """
    response = client.get("/api/logs/normalized")
    assert response.status_code == 200

    lower_text = response.text.lower()
    assert "retry-policy" not in lower_text, (
        "Ground truth violation: 'retry-policy' found in GET /api/logs/normalized!"
    )


def test_ground_truth_not_in_services_or_dependencies():
    """
    Ensures services catalog and dependency graph do not leak the hidden ground truth.
    """
    for endpoint in ["/api/services", "/api/dependencies"]:
        resp = client.get(endpoint)
        assert resp.status_code == 200
        assert "retry-policy" not in resp.text.lower()


def test_ground_truth_not_in_any_investigation_response():
    responses = [
        client.get("/api/timeline"),
        client.get("/api/investigation/preview"),
        client.post("/api/investigate", json={"incident_id": "INC-CIVICHEALTH-001"}),
    ]

    for response in responses:
        assert response.status_code == 200
        assert "retry-policy" not in response.text.lower()


def test_runtime_codebase_isolation():
    """
    Static audit ensuring runtime app files do not reference the ground truth file name.
    """
    app_root = Path(__file__).resolve().parent.parent / "app"
    runtime_dirs = [
        app_root / "api",
        app_root / "tools",
        app_root / "schemas",
        app_root / "graph",
    ]

    forbidden_token = "ground_truth.json"

    for r_dir in runtime_dirs:
        for py_file in r_dir.rglob("*.py"):
            content = py_file.read_text(encoding="utf-8")
            assert forbidden_token not in content, (
                f"Runtime code file {py_file.name} references '{forbidden_token}'! "
                "Ground truth must remain isolated in evaluation modules."
            )
