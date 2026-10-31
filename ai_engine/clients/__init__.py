"""
AEGIS AI Engine Client Modules.
"""

from .ollama_client import (
    OllamaClient,
    OllamaClientError,
    OllamaConnectionError,
    OllamaTimeoutError,
    OllamaModelNotFoundError,
    OllamaStructuredOutputError,
    OllamaAPIError,
)

__all__ = [
    "OllamaClient",
    "OllamaClientError",
    "OllamaConnectionError",
    "OllamaTimeoutError",
    "OllamaModelNotFoundError",
    "OllamaStructuredOutputError",
    "OllamaAPIError",
]

