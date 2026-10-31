"""
AEGIS Service Dependency Graph.

Constructs and serializes a NetworkX-based directed graph representing
the service architecture, dependency hierarchy, and incident event associations.
Rigidly distinguishes known architectural dependencies from inferred causal links.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Set
import networkx as nx

from app.schemas.events import NormalizedEvent


class EdgeType(str, Enum):
    """Classification of graph edges."""
    KNOWN_DEPENDENCY = "KNOWN_DEPENDENCY"      # Pre-existing static architectural dependency
    INFERRED_CAUSAL = "INFERRED_CAUSAL"        # Dynamically inferred failure propagation path


class ServiceGraphManager:
    """
    Manages the directed graph of microservices and infrastructure components.
    Integrates incident evidence without corrupting known architectural ground truth.
    """

    def __init__(self):
        self.graph = nx.DiGraph()
        self._initialize_default_topology()

    def _initialize_default_topology(self) -> None:
        """
        Initializes the canonical healthcare infrastructure topology.
        Edge (A, B) means 'A depends on B' (calls or requires B to function).
        """
        services = [
            {
                "id": "api-gateway",
                "name": "API Gateway",
                "tier": "edge",
                "description": "Ingress reverse proxy, TLS termination, and rate limiting",
            },
            {
                "id": "auth-service",
                "name": "Authentication Service",
                "tier": "security",
                "description": "OAuth2 / JWT issuance, token revocation verification, and RBAC",
            },
            {
                "id": "appointment-service",
                "name": "Appointment Service",
                "tier": "core_business",
                "description": "Doctor schedules, slot reservations, and clinic booking",
            },
            {
                "id": "payment-service",
                "name": "Payment Service",
                "tier": "core_business",
                "description": "Patient insurance co-pay processing and billing transactions",
            },
            {
                "id": "hospital-records-service",
                "name": "Hospital Records Service",
                "tier": "core_business",
                "description": "Electronic health record (EHR) queries, patient history, admissions",
            },
            {
                "id": "notification-service",
                "name": "Notification Service",
                "tier": "integration",
                "description": "SMS and Email dispatch for patient appointment alerts",
            },
            {
                "id": "postgresql-database",
                "name": "PostgreSQL Database",
                "tier": "data_persistence",
                "description": "Primary relational database cluster storing bookings, EHR, and ledgers",
            },
        ]

        for s in services:
            self.graph.add_node(
                s["id"],
                name=s["name"],
                tier=s["tier"],
                description=s["description"],
                event_ids=[],
                event_count=0,
                highest_severity="NORMAL",
            )

        # Architectural Dependencies: (caller, callee)
        known_edges = [
            ("api-gateway", "auth-service", {"protocol": "HTTPS/gRPC", "sync": True}),
            ("api-gateway", "appointment-service", {"protocol": "HTTPS", "sync": True}),
            ("api-gateway", "payment-service", {"protocol": "HTTPS", "sync": True}),
            ("api-gateway", "hospital-records-service", {"protocol": "HTTPS", "sync": True}),
            ("appointment-service", "auth-service", {"protocol": "gRPC", "sync": True}),
            ("appointment-service", "postgresql-database", {"protocol": "PostgreSQL Wire", "sync": True}),
            ("appointment-service", "payment-service", {"protocol": "HTTPS", "sync": True}),
            ("appointment-service", "notification-service", {"protocol": "RabbitMQ/Async", "sync": False}),
            ("payment-service", "auth-service", {"protocol": "gRPC", "sync": True}),
            ("payment-service", "postgresql-database", {"protocol": "PostgreSQL Wire", "sync": True}),
            ("hospital-records-service", "auth-service", {"protocol": "gRPC", "sync": True}),
            ("hospital-records-service", "postgresql-database", {"protocol": "PostgreSQL Wire", "sync": True}),
            ("notification-service", "auth-service", {"protocol": "gRPC", "sync": True}),
            ("auth-service", "postgresql-database", {"protocol": "PostgreSQL Wire", "sync": True}),
        ]

        for u, v, data in known_edges:
            self.graph.add_edge(
                u,
                v,
                edge_type=EdgeType.KNOWN_DEPENDENCY.value,
                protocol=data.get("protocol", "TCP"),
                is_synchronous=data.get("sync", True),
                inferred_confidence=None,
            )

    def attach_events(self, events: List[NormalizedEvent]) -> None:
        """
        Associates normalized incident events with their originating service nodes,
        updating node event counters and severity flags.
        """
        # Clear existing associations
        for node in self.graph.nodes:
            self.graph.nodes[node]["event_ids"] = []
            self.graph.nodes[node]["event_count"] = 0
            self.graph.nodes[node]["highest_severity"] = "NORMAL"

        severity_rank = {"NORMAL": 0, "INFO": 1, "WARN": 2, "ERROR": 3, "CRITICAL": 4}

        for ev in events:
            srv = ev.service
            if srv not in self.graph:
                # Add unknown service dynamically if seen in logs
                self.graph.add_node(
                    srv,
                    name=srv,
                    tier="dynamic",
                    description="Dynamically discovered service from log stream",
                    event_ids=[],
                    event_count=0,
                    highest_severity="NORMAL",
                )

            node_data = self.graph.nodes[srv]
            node_data["event_ids"].append(ev.id)
            node_data["event_count"] += 1

            current_sev = node_data.get("highest_severity", "NORMAL")
            ev_sev = ev.severity.upper()
            if severity_rank.get(ev_sev, 0) > severity_rank.get(current_sev, 0):
                node_data["highest_severity"] = ev_sev

    def add_inferred_causal_edge(
        self,
        source_cause: str,
        target_effect: str,
        confidence: float,
        reasoning: str,
    ) -> None:
        """
        Adds an inferred causal propagation edge.
        Never conflates inferred failure propagation with static architectural dependencies.
        """
        if confidence > 0.99:
            confidence = 0.99  # Epistemic limitation rule

        self.graph.add_edge(
            source_cause,
            target_effect,
            edge_type=EdgeType.INFERRED_CAUSAL.value,
            inferred_confidence=confidence,
            reasoning=reasoning,
            is_synchronous=None,
        )

    def get_upstream_dependents(self, service_id: str) -> List[str]:
        """Returns all services that directly depend on service_id."""
        if service_id not in self.graph:
            return []
        return [u for u, v in self.graph.in_edges(service_id)]

    def get_downstream_dependencies(self, service_id: str) -> List[str]:
        """Returns all services that service_id directly depends upon."""
        if service_id not in self.graph:
            return []
        return [v for u, v in self.graph.out_edges(service_id)]

    def to_dict(self) -> Dict[str, Any]:
        """
        Serializes the graph into a JSON-compatible dictionary optimized for the frontend UI.
        Distinguishes node tiers, incident severity, and edge types (known vs inferred).
        """
        nodes = []
        for node_id, data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "name": data.get("name", node_id),
                "tier": data.get("tier", "unknown"),
                "description": data.get("description", ""),
                "event_count": data.get("event_count", 0),
                "highest_severity": data.get("highest_severity", "NORMAL"),
                "event_ids": data.get("event_ids", []),
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "edge_type": data.get("edge_type", EdgeType.KNOWN_DEPENDENCY.value),
                "protocol": data.get("protocol"),
                "is_synchronous": data.get("is_synchronous"),
                "inferred_confidence": data.get("inferred_confidence"),
                "reasoning": data.get("reasoning"),
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "critical_services": [n["id"] for n in nodes if n["highest_severity"] == "CRITICAL"],
        }

