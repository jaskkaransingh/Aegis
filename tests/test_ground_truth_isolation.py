"""
Unit Tests for Ground Truth Isolation.
Ensures:
- ground_truth.json exists for evaluation/benchmarking
- ground_truth.json is NEVER loaded into runtime context
- No API route serves ground truth
- Neither tools nor API route files contain references to ground_truth.json
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app

APP_ROOT = Path(__file__).resolve().parent.parent / "backend" / "app"


def test_ground_truth_file_exists():
    """Ground truth file must exist for offline evaluation."""
    gt_path = APP_ROOT / "evaluation" / "ground_truth.json"
    assert gt_path.exists(), f"Ground truth file missing at {gt_path}"


def test_no_code_references_to_ground_truth_in_runtime():
    """
    Code audit: ensures neither main, api routes, nor tools reference ground_truth.json.
    Only evaluation scripts may access ground truth.
    """
    runtime_dirs = [
        APP_ROOT / "api",
        APP_ROOT / "tools",
        APP_ROOT / "graph",
        APP_ROOT / "schemas",
        APP_ROOT / "main.py",
    ]

    forbidden_token = "ground_truth.json"

    for target in runtime_dirs:
        if target.is_file():
            files = [target]
        else:
            files = list(target.rglob("*.py"))

        for py_file in files:
            content = py_file.read_text(encoding="utf-8")
            assert forbidden_token not in content, (
                f"Ground truth file isolation violation in {py_file}: "
                f"Runtime code must never load or reference ground_truth.json!"
            )


def test_api_routes_do_not_expose_ground_truth():
    """
    Simulates requests to all public endpoints and asserts that evaluation-only
    ground truth secrets (e.g. 'planted_initiating_event', 'HIDDEN_EVALUATION_GROUND_TRUTH')
    are never returned.
    """
    client = TestClient(app)

    endpoints = [
        "/api/health",
        "/api/logs",
        "/api/services",
        "/api/dependencies",
        "/api/timeline",
        "/api/investigation/preview",
    ]

    forbidden_signatures = [
        "HIDDEN_EVALUATION_GROUND_TRUTH",
        "deliberate_traps_and_evaluation_criteria",
        "expected_chronological_ordering",
    ]

    for ep in endpoints:
        resp = client.get(ep)
        assert resp.status_code == 200, f"Endpoint {ep} failed with status {resp.status_code}"
        text_body = resp.text

        for sig in forbidden_signatures:
            assert sig not in text_body, (
                f"Endpoint {ep} leaked ground truth signature '{sig}'!"
            )


def test_direct_access_to_evaluation_path_returns_404():
    """Confirms no route exposes /api/evaluation or /evaluation directly."""
    client = TestClient(app)

    assert client.get("/api/evaluation").status_code == 404
    assert client.get("/api/ground_truth").status_code == 404
    assert client.get("/api/evaluation/ground_truth.json").status_code == 404

