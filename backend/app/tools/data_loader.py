"""
AEGIS Deterministic Data Loader.

Safely loads synthetic logs, services catalog, and clock metadata.
Enforces strict isolation: NEVER loads ground_truth.json into memory.
"""

from pathlib import Path
import json
from typing import Any, Dict, List, Tuple

from app.schemas.events import ClockOffsetEstimate, DataQualityWarning, NormalizedEvent
from app.tools.evidence_normalizer import EvidenceNormalizer

APP_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = APP_DIR / "data"


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
    """Loads raw synthetic log records from data/logs.json."""
    file_path = DATA_DIR / "logs.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Logs file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_services_catalog() -> Dict[str, Any]:
    """Loads service architecture catalog from data/services.json."""
    file_path = DATA_DIR / "services.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Services file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_normalized_incident_data(
    apply_clock_correction: bool = True,
) -> Tuple[List[NormalizedEvent], List[DataQualityWarning]]:
    """
    Loads raw logs and normalizes them with clock correction and validation.
    """
    clock_offsets = load_clock_metadata() if apply_clock_correction else {}
    normalizer = EvidenceNormalizer(clock_offsets=clock_offsets)
    raw_logs = load_raw_logs()
    return normalizer.normalize_stream(raw_logs)

