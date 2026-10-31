"""
Unit Tests for Service Dependency Graph (app/graph/service_graph.py).
Tests:
- Service nodes creation for all 7 required healthcare infrastructure components
- Known architectural dependency edges
- Distinction between known dependencies and inferred causal links
- Confidence score bounding on causal edges
- Event attachment and node severity aggregation
- JSON serialization for frontend consumption
"""

from datetime import datetime, timezone
import pytest

from app.graph.service_graph import EdgeType, ServiceGraphManager
from app.schemas.events import NormalizedEvent


def test_required_services_present():
    """Confirms all 7 healthcare infrastructure services exist as nodes."""
    mgr = ServiceGraphManager()
    required = [
        "api-gateway",
        "auth-service",
        "appointment-service",
        "payment-service",
        "hospital-records-service",
        "notification-service",
        "postgresql-database",
    ]

    for srv in required:
        assert srv in mgr.graph.nodes, f"Service node '{srv}' missing from graph"


def test_architectural_dependencies_present():
    """Verifies expected static dependencies exist as KNOWN_DEPENDENCY edges."""
    mgr = ServiceGraphManager()

    # appointment-service depends on postgresql-database
    assert mgr.graph.has_edge("appointment-service", "postgresql-database")
    edge_data = mgr.graph.get_edge_data("appointment-service", "postgresql-database")
    assert edge_data["edge_type"] == EdgeType.KNOWN_DEPENDENCY.value
    assert edge_data["is_synchronous"] is True

    # appointment-service depends on payment-service
    assert mgr.graph.has_edge("appointment-service", "payment-service")

    # api-gateway depends on appointment-service
    assert mgr.graph.has_edge("api-gateway", "appointment-service")


def test_inferred_causal_edge_distinction():
    """
    Tests adding an inferred causal propagation edge.
    Must have edge_type=INFERRED_CAUSAL and confidence <= 0.99.
    """
    mgr = ServiceGraphManager()

    # Add causal edge from DB to Appointment Service
    mgr.add_inferred_causal_edge(
        source_cause="postgresql-database",
        target_effect="appointment-service",
        confidence=1.00,  # Deliberately attempt 1.00 to verify capping
        reasoning="Connection pool exhaustion directly caused downstream thread starvation",
    )

    edge_data = mgr.graph.get_edge_data("postgresql-database", "appointment-service")
    assert edge_data is not None
    assert edge_data["edge_type"] == EdgeType.INFERRED_CAUSAL.value
    # Epistemic limitation check: confidence must be <= 0.99
    assert edge_data["inferred_confidence"] <= 0.99
    assert edge_data["inferred_confidence"] == 0.99


def test_attach_events_updates_node_state():
    """Confirms attaching normalized incident events updates node metrics and severity."""
    mgr = ServiceGraphManager()
    base_time = datetime(2026, 10, 31, 14, 0, 0, tzinfo=timezone.utc)

    events = [
        NormalizedEvent(
            id="EVT-DB-1",
            raw_id="EVT-DB-1",
            service="postgresql-database",
            original_timestamp="2026-10-31T14:00:00.000Z",
            recorded_datetime=base_time,
            corrected_datetime=base_time,
            uncertainty_seconds=0.1,
            time_interval_start=base_time,
            time_interval_end=base_time,
            severity="CRITICAL",
            event_type="POOL_EXHAUSTED",
            message="Database pool full",
        ),
        NormalizedEvent(
            id="EVT-DB-2",
            raw_id="EVT-DB-2",
            service="postgresql-database",
            original_timestamp="2026-10-31T14:00:05.000Z",
            recorded_datetime=base_time,
            corrected_datetime=base_time,
            uncertainty_seconds=0.1,
            time_interval_start=base_time,
            time_interval_end=base_time,
            severity="WARN",
            event_type="SLOW_QUERY",
            message="Slow query executing",
        ),
    ]

    mgr.attach_events(events)
    db_node = mgr.graph.nodes["postgresql-database"]

    assert db_node["event_count"] == 2
    assert "EVT-DB-1" in db_node["event_ids"]
    assert "EVT-DB-2" in db_node["event_ids"]
    assert db_node["highest_severity"] == "CRITICAL"


def test_graph_serialization_structure():
    """Verifies that to_dict produces valid frontend serialization."""
    mgr = ServiceGraphManager()
    data = mgr.to_dict()

    assert "nodes" in data
    assert "edges" in data
    assert "total_nodes" in data
    assert "total_edges" in data
    assert "critical_services" in data

    assert data["total_nodes"] >= 7
    assert data["total_edges"] >= 10

    # Ensure each node has required frontend attributes
    for node in data["nodes"]:
        assert "id" in node
        assert "name" in node
        assert "tier" in node
        assert "event_count" in node
        assert "highest_severity" in node

