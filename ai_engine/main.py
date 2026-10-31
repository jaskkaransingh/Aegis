"""
AEGIS AI Engine — Main Entry Point and CLI Utility.
Provides environment verification, schema validation, and diagnostics.
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Add repo root to path
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from ai_engine import __version__
from ai_engine.config import get_config
from ai_engine.clients.ollama_client import OllamaClient
from ai_engine.scripts.check_ollama import run_diagnostics
from ai_engine.schemas import (
    ClaimType,
    EvidenceRole,
    EvidenceReference,
    EvidenceClaim,
    Hypothesis,
    InvestigationStatus,
)
from ai_engine.core.state import InvestigationState


def validate_schemas() -> bool:
    """Performs in-memory schema validation tests."""
    print("Testing AEGIS Schema Contracts...")
    try:
        # 1. Valid EvidenceReference
        ref = EvidenceReference(
            evidence_id="EVT-001",
            source="postgresql-database",
            role=EvidenceRole.PRIMARY,
            timestamp="2026-10-31T14:00:02Z",
            message="Database connection pool saturated (100/100).",
        )

        # 2. Valid EvidenceClaim
        claim = EvidenceClaim(
            claim_id="CLM-001",
            claim_text="Database pool saturation preceded upstream microservice gateway timeouts.",
            claim_type=ClaimType.OBSERVED_FACT,
            evidence_references=[ref],
            explanation="EVT-001 timestamp confirms database exhaustion prior to HTTP 504 ingress errors.",
            confidence=0.95,
        )

        # 3. Factual claim without evidence must raise ValueError
        try:
            invalid_claim = EvidenceClaim(
                claim_id="CLM-BAD",
                claim_text="Unsupported assertion without evidence.",
                claim_type=ClaimType.OBSERVED_FACT,
                evidence_references=[],
            )
            print("[FAILED]: Factual claim without evidence was unexpectedly accepted.")
            return False
        except ValueError:
            pass  # Expected rejection

        # 4. Valid Hypothesis
        hyp = Hypothesis(
            hypothesis_id="HYP-001",
            title="Database Connection Pool Exhaustion",
            explanation="Unindexed archival query held long-running transaction locks.",
            supporting_evidence=[ref],
            contradicting_evidence=[],
            unresolved_questions=["Were statement timeouts configured?"],
            confidence_score=0.92,
            suspected_service="postgresql-database",
        )

        # 5. Valid InvestigationState
        state = InvestigationState(
            investigation_id="INV-2026-0881",
            incident_context={"incident_id": "INC-2026-0881"},
            execution_status=InvestigationStatus.IN_PROGRESS,
        )
        state.add_evidence(ref)
        state.add_claim(claim)
        state.add_hypothesis(hyp)

        print("[OK] EvidenceReference validation passed.")
        print("[OK] EvidenceClaim epistemic constraint passed (factual claims require evidence).")
        print("[OK] Hypothesis validation passed.")
        print("[OK] InvestigationState container passed.")
        print("All schema contracts are valid and compliant with epistemic humility principles.")
        return True
    except Exception as e:
        print(f"[FAILED]: Schema validation error: {e}")
        return False


async def list_models_cli() -> None:
    config = get_config()
    print(f"Connecting to Ollama at {config.ollama_base_url}...")
    async with OllamaClient(config=config) as client:
        try:
            models = await client.list_models()
            print(f"Locally available Ollama models ({len(models)}):")
            for m in models:
                indicator = " [CONFIGURED DEFAULT]" if m == config.ollama_model else ""
                print(f"  - {m}{indicator}")
        except Exception as e:
            print(f"Error querying Ollama models: {e}")
            sys.exit(1)


async def run_analyst_smoke_cli() -> None:
    from ai_engine.agents.evidence_analyst import EvidenceAnalystAgent
    from ai_engine.tests.fixtures.synthetic_evidence import SYNTHETIC_TEST_EVIDENCE

    config = get_config()
    print("=" * 60)
    print("AEGIS Evidence Analyst Agent -- Live Smoke Test")
    print("=" * 60)
    print(f"Target Model:       {config.ollama_model}")
    print(f"Input Evidence:     {len(SYNTHETIC_TEST_EVIDENCE)} synthetic records")
    print("-" * 60)

    agent = EvidenceAnalystAgent(config=config)
    try:
        result = await agent.analyze(SYNTHETIC_TEST_EVIDENCE)
        print(f"Analysis Status:    {result.status.value.upper()}")
        print(f"Observations:       {len(result.observations)}")
        for obs in result.observations:
            print(f"  [{obs.claim_type.value}] {obs.statement} (Citations: {obs.evidence_ids})")
        print(f"Patterns:           {len(result.patterns)}")
        for pat in result.patterns:
            print(f"  - {pat.pattern_name}: {pat.description}")
        print(f"Explanations:       {len(result.preliminary_explanations)}")
        for exp in result.preliminary_explanations:
            print(f"  - {exp.explanation}")
        print(f"Execution Time:     {result.metadata.get('execution_time_ms', 'N/A')}ms")
        print("=" * 60)
        print("STATUS: EVIDENCE ANALYST SMOKE TEST PASSED [OK]")
    except Exception as e:
        print(f"STATUS: EVIDENCE ANALYST SMOKE TEST FAILED [FAIL]: {e}")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AEGIS AI Engine — Autonomous Evidence-Grounded Investigation System"
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"AEGIS AI Engine v{__version__}",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Run Ollama environment diagnostic checks",
    )
    parser.add_argument(
        "--list-models",
        action="store_true",
        help="List available local Ollama models",
    )
    parser.add_argument(
        "--validate-schemas",
        action="store_true",
        help="Validate typed data contracts and epistemic constraints",
    )
    parser.add_argument(
        "--smoke-analyst",
        action="store_true",
        help="Run a live smoke test of the Evidence Analyst on synthetic evidence",
    )

    args = parser.parse_args()

    if args.check:
        success = asyncio.run(run_diagnostics())
        sys.exit(0 if success else 1)
    elif args.list_models:
        asyncio.run(list_models_cli())
    elif args.validate_schemas:
        success = validate_schemas()
        sys.exit(0 if success else 1)
    elif args.smoke_analyst:
        asyncio.run(run_analyst_smoke_cli())
    else:
        print(f"AEGIS AI Engine v{__version__}")
        print("Run with --check to verify Ollama environment.")
        print("Run with --validate-schemas to verify data contracts.")
        print("Run with --list-models to view installed Ollama models.")
        print("Run with --smoke-analyst to run live Evidence Analyst smoke test.")


if __name__ == "__main__":
    main()
