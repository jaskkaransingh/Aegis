"""
AEGIS Deterministic Data Loader.

Safely loads synthetic logs, services catalog, and clock metadata.
Enforces strict isolation: NEVER loads evaluation ground truth into memory.
"""

from pathlib import Path
import json
import asyncio
from typing import Any, Dict, List, Tuple, Union

from app.schemas.events import ClockOffsetEstimate, DataQualityWarning, NormalizedEvent
from app.tools.evidence_normalizer import EvidenceNormalizer

APP_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = APP_DIR / "data"


async def load_logs() -> List[Dict[str, Any]]:
    """
    Asynchronously loads raw log records from data/logs.json using Python's json and pathlib.
    Raises FileNotFoundError if the file is missing.
    """
    file_path = DATA_DIR / "logs.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Logs file not found at {file_path}")

    def _read_file() -> List[Dict[str, Any]]:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return await asyncio.to_thread(_read_file)


async def load_services() -> Any:
    """
    Asynchronously loads the services catalog from data/services.json using Python's json and pathlib.
    Raises FileNotFoundError if the file is missing.
    """
    file_path = DATA_DIR / "services.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Services file not found at {file_path}")

    def _read_file() -> Any:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return await asyncio.to_thread(_read_file)


async def load_dependencies() -> Any:
    """
    Asynchronously loads the service dependencies from data/dependencies.json using Python's json and pathlib.
    Raises FileNotFoundError if the file is missing.
    """
    file_path = DATA_DIR / "dependencies.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Dependencies file not found at {file_path}")

    def _read_file() -> Any:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return await asyncio.to_thread(_read_file)


# Async aliases
async def load_raw_logs_async() -> List[Dict[str, Any]]:
    """Alias for load_logs."""
    return await load_logs()


async def load_services_catalog_async() -> Any:
    """Alias for load_services."""
    return await load_services()


async def load_dependencies_catalog_async() -> Any:
    """Alias for load_dependencies."""
    return await load_dependencies()



# Synchronous utilities for backward compatibility and startup lifespan
def load_clock_metadata() -> Dict[str, ClockOffsetEstimate]:
    """Loads clock offset estimates per service from data/clock_metadata.json."""
    file_path = DATA_DIR / "clock_metadata.json"
    if not file_path.exists():
        return {}

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    services_data = data.get("services", {})
    estimates: Dict[str, ClockOffsetEstimate] = {}
    for srv_name, item in services_data.items():
        estimates[srv_name] = ClockOffsetEstimate(**item)
    return estimates


def load_raw_logs() -> List[Dict[str, Any]]:
    """Synchronously loads raw synthetic log records from data/logs.json."""
    file_path = DATA_DIR / "logs.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Logs file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_services_catalog() -> Any:
    """Synchronously loads service architecture catalog from data/services.json."""
    file_path = DATA_DIR / "services.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Services file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_dependencies_catalog() -> Any:
    """Synchronously loads dependencies from data/dependencies.json."""
    file_path = DATA_DIR / "dependencies.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Dependencies file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)



def get_normalized_incident_data(
    apply_clock_correction: bool = True,
) -> Tuple[List[NormalizedEvent], List[DataQualityWarning]]:
    """
    Loads raw logs and normalizes them with clock correction and validation.
    """
    raw_logs = load_raw_logs()
    clock_offsets = load_clock_metadata() if apply_clock_correction else {}
    normalizer = EvidenceNormalizer(clock_offsets=clock_offsets)
    return normalizer.normalize_stream(raw_logs)
