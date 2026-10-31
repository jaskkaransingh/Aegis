"""
AEGIS Diagnostic Script: Local Ollama Verification.
Validates connectivity, model availability, basic text generation,
and schema-constrained JSON output without touching incident data or downloading models.
"""

import asyncio
import sys
from typing import Dict, Any
from pydantic import BaseModel, Field

# Ensure root directory is on PYTHONPATH if run as a script
from pathlib import Path
repo_root = Path(__file__).resolve().parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from ai_engine.config import get_config
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaClientError,
    OllamaConnectionError,
    OllamaModelNotFoundError,
    OllamaStructuredOutputError,
)


class DiagnosticProbeResponse(BaseModel):
    """Simple test schema for structured output verification."""
    status: str = Field(description="Operational status string (e.g. 'ok')")
    probe_id: str = Field(description="Diagnostic identifier")
    confidence: float = Field(default=0.9, ge=0.0, le=1.0)


async def run_diagnostics() -> bool:
    """
    Executes the 7 diagnostic steps and prints a structured summary.
    Returns True if all steps pass, False otherwise.
    """
    config = get_config()
    print("=" * 60)
    print("AEGIS AI Engine -- Ollama Environment Diagnostic")
    print("=" * 60)
    print(f"Target URL:         {config.ollama_base_url}")
    print(f"Configured Model:   {config.ollama_model}")
    print(f"Request Timeout:    {config.timeout_seconds}s")
    print("-" * 60)

    all_passed = True

    async with OllamaClient(config=config) as client:
        # Step 1: Health Check
        print("[1/5] Checking Ollama service connectivity...", end=" ", flush=True)
        is_healthy = await client.health_check()
        if not is_healthy:
            print("[FAILED]")
            print("\nError: Ollama service is not reachable at", config.ollama_base_url)
            print("To start Ollama, run:")
            print("  ollama serve")
            return False
        print("[PASSED]")

        # Step 2: Model Discovery
        print("[2/5] Discovering installed models...", end=" ", flush=True)
        try:
            models = await client.list_models()
            print(f"[PASSED] ({len(models)} model(s) detected)")
            for m in models:
                print(f"      - {m}")
        except Exception as e:
            print(f"[FAILED] ({e})")
            return False

        # Step 3: Model Validation
        print(f"[3/5] Validating configured model '{config.ollama_model}'...", end=" ", flush=True)
        is_valid = await client.validate_model()
        if not is_valid:
            print("[FAILED]")
            print(f"\nWarning: Model '{config.ollama_model}' is not present in local Ollama.")
            print("Available models:", ", ".join(models) if models else "None")
            print("To select an available model, set OLLAMA_MODEL environment variable.")
            return False
        print("[PASSED]")

        # Step 4: Harmless Basic Generation
        print("[4/5] Testing basic generation with test prompt...", end=" ", flush=True)
        try:
            response = await client.generate(
                prompt="Respond with the single word PONG.",
                temperature=0.0,
            )
            clean_resp = response.strip()
            print(f"[PASSED] (Response: '{clean_resp[:30]}')")
        except Exception as e:
            print(f"[FAILED] ({e})")
            all_passed = False

        # Step 5: Structured JSON Output
        print("[5/5] Testing structured JSON schema output...", end=" ", flush=True)
        try:
            structured = await client.generate_structured(
                prompt="Return a JSON object with status 'ok', probe_id 'probe-001', and confidence 0.9.",
                schema=DiagnosticProbeResponse,
                temperature=0.0,
            )
            print("[PASSED]")
            print(f"      Validated JSON: {structured}")
        except OllamaStructuredOutputError as e:
            print(f"[FAILED] (Schema validation error: {e})")
            all_passed = False
        except Exception as e:
            print(f"[FAILED] ({e})")
            all_passed = False

    print("=" * 60)
    if all_passed:
        print("STATUS: ALL DIAGNOSTIC CHECKS PASSED [OK]")
        print("The AI Engine foundation is ready for agentic workflow implementation.")
    else:
        print("STATUS: ONE OR MORE CHECKS FAILED [FAIL]")
    print("=" * 60)

    return all_passed


def main() -> None:
    try:
        success = asyncio.run(run_diagnostics())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\nDiagnostic interrupted by user.")
        sys.exit(130)


if __name__ == "__main__":
    main()
