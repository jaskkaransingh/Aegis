"""
AEGIS AI Engine Configuration.
Provides typed, validated configuration parameters loaded from environment variables
or local .env configuration without mutating external backend configuration.
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field, field_validator

# Attempt to load .env from ai_engine directory if python-dotenv is available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
except ImportError:
    pass


class AIEngineConfig(BaseModel):
    """
    Configuration parameters for the AEGIS AI Engine and Ollama LLM integration.
    """
    ollama_base_url: str = Field(
        default="http://127.0.0.1:11434",
        description="Base URL for the local Ollama HTTP service."
    )
    ollama_model: str = Field(
        default="llama3.2:3b",
        description="Model name to use for reasoning and structured JSON output."
    )
    timeout_seconds: float = Field(
        default=60.0,
        ge=1.0,
        le=600.0,
        description="HTTP request timeout in seconds."
    )
    max_retries: int = Field(
        default=2,
        ge=0,
        le=5,
        description="Maximum retry attempts on transient network or rate errors."
    )
    temperature: float = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Sampling temperature (low values preferred for forensic reasoning)."
    )
    max_tokens: Optional[int] = Field(
        default=None,
        ge=1,
        description="Optional maximum generation token limit."
    )
    max_evidence_count: int = Field(
        default=50,
        ge=1,
        le=500,
        description="Maximum number of evidence records allowed in a single analyst session."
    )
    max_payload_bytes: int = Field(
        default=131072,
        ge=1024,
        le=10485760,
        description="Maximum serialized evidence payload size in bytes (128 KB default)."
    )
    analyst_strict_mode: bool = Field(
        default=True,
        description="When True, raises an exception on fabricated references; when False, flags them in results."
    )

    @field_validator("ollama_base_url")
    @classmethod
    def _strip_trailing_slash(cls, v: str) -> str:
        clean = v.strip()
        if clean.endswith("/"):
            clean = clean[:-1]
        return clean

    @field_validator("ollama_model")
    @classmethod
    def _validate_model_name(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Model name cannot be empty.")
        return clean


def get_config() -> AIEngineConfig:
    """
    Constructs an AIEngineConfig instance by reading current environment variables.
    Supports both standard OLLAMA_* and AEGIS_OLLAMA_* environment variable keys.
    """
    base_url = (
        os.getenv("AEGIS_OLLAMA_BASE_URL")
        or os.getenv("OLLAMA_BASE_URL")
        or "http://127.0.0.1:11434"
    )
    model = (
        os.getenv("AEGIS_OLLAMA_MODEL")
        or os.getenv("OLLAMA_MODEL")
        or "llama3.2:3b"
    )
    timeout_raw = (
        os.getenv("AEGIS_OLLAMA_TIMEOUT_SECONDS")
        or os.getenv("OLLAMA_TIMEOUT_SECONDS")
    )
    timeout = float(timeout_raw) if timeout_raw else 60.0

    retries_raw = os.getenv("OLLAMA_MAX_RETRIES")
    max_retries = int(retries_raw) if retries_raw else 2

    temp_raw = os.getenv("OLLAMA_TEMPERATURE")
    temperature = float(temp_raw) if temp_raw else 0.1

    tokens_raw = os.getenv("OLLAMA_MAX_TOKENS")
    max_tokens = int(tokens_raw) if tokens_raw else None

    max_ev_raw = os.getenv("AEGIS_MAX_EVIDENCE_COUNT") or os.getenv("MAX_EVIDENCE_COUNT")
    max_evidence_count = int(max_ev_raw) if max_ev_raw else 50

    max_bytes_raw = os.getenv("AEGIS_MAX_PAYLOAD_BYTES") or os.getenv("MAX_PAYLOAD_BYTES")
    max_payload_bytes = int(max_bytes_raw) if max_bytes_raw else 131072

    strict_raw = os.getenv("AEGIS_ANALYST_STRICT_MODE")
    analyst_strict_mode = strict_raw.lower() not in ("0", "false", "no") if strict_raw else True

    return AIEngineConfig(
        ollama_base_url=base_url,
        ollama_model=model,
        timeout_seconds=timeout,
        max_retries=max_retries,
        temperature=temperature,
        max_tokens=max_tokens,
        max_evidence_count=max_evidence_count,
        max_payload_bytes=max_payload_bytes,
        analyst_strict_mode=analyst_strict_mode,
    )

