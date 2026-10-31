"""
Unit Tests for AEGIS Ollama HTTP Client.
Uses mocked HTTP transports to verify request formatting, response parsing,
error mapping, and structured JSON output without requiring a live Ollama daemon.
"""

import asyncio
import json
import pytest
import httpx
from pydantic import BaseModel, Field

from ai_engine.config import AIEngineConfig
from ai_engine.clients.ollama_client import (
    OllamaClient,
    OllamaConnectionError,
    OllamaTimeoutError,
    OllamaModelNotFoundError,
    OllamaStructuredOutputError,
)


class SampleOutputSchema(BaseModel):
    category: str = Field(description="Category")
    confidence: float = Field(ge=0.0, le=1.0)


@pytest.fixture
def test_config():
    return AIEngineConfig(
        ollama_base_url="http://127.0.0.1:11434",
        ollama_model="llama3.2:3b",
        timeout_seconds=5.0,
    )


def test_health_check_success(test_config):
    async def _test():
        def handler(request: httpx.Request):
            assert request.url.path == "/api/tags"
            return httpx.Response(200, json={"models": []})

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            is_healthy = await client.health_check()
            assert is_healthy is True

    asyncio.run(_test())


def test_health_check_failure(test_config):
    async def _test():
        def handler(request: httpx.Request):
            raise httpx.ConnectError("Connection refused")

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            is_healthy = await client.health_check()
            assert is_healthy is False

    asyncio.run(_test())


def test_list_models_success(test_config):
    async def _test():
        def handler(request: httpx.Request):
            return httpx.Response(
                200,
                json={
                    "models": [
                        {"name": "llama3.2:3b", "size": 2000000},
                        {"name": "qwen3:0.6b", "size": 500000},
                    ]
                },
            )

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            models = await client.list_models()
            assert models == ["llama3.2:3b", "qwen3:0.6b"]

    asyncio.run(_test())


def test_validate_model(test_config):
    async def _test():
        def handler(request: httpx.Request):
            return httpx.Response(200, json={"models": [{"name": "llama3.2:3b"}]})

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            assert await client.validate_model("llama3.2:3b") is True
            assert await client.validate_model("nonexistent-model") is False

    asyncio.run(_test())


def test_generate_success(test_config):
    async def _test():
        def handler(request: httpx.Request):
            assert request.url.path == "/api/generate"
            body = json.loads(request.content)
            assert body["model"] == "llama3.2:3b"
            assert body["prompt"] == "Hello"
            return httpx.Response(200, json={"response": "World", "done": True})

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            resp = await client.generate(prompt="Hello")
            assert resp == "World"

    asyncio.run(_test())


def test_generate_structured_success(test_config):
    async def _test():
        def handler(request: httpx.Request):
            assert request.url.path == "/api/generate"
            body = json.loads(request.content)
            assert "format" in body
            return httpx.Response(
                200,
                json={"response": json.dumps({"category": "database_exhaustion", "confidence": 0.95})},
            )

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            result = await client.generate_structured(
                prompt="Analyze category",
                schema=SampleOutputSchema,
            )
            assert result["category"] == "database_exhaustion"
            assert result["confidence"] == 0.95

    asyncio.run(_test())


def test_generate_structured_invalid_json(test_config):
    async def _test():
        def handler(request: httpx.Request):
            return httpx.Response(200, json={"response": "Not valid JSON at all"})

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            with pytest.raises(OllamaStructuredOutputError) as exc_info:
                await client.generate_structured(
                    prompt="Prompt",
                    schema=SampleOutputSchema,
                )
            assert "Model response was not valid JSON" in str(exc_info.value)

    asyncio.run(_test())


def test_model_not_found_error(test_config):
    async def _test():
        def handler(request: httpx.Request):
            return httpx.Response(404, text="model not found")

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            with pytest.raises(OllamaModelNotFoundError):
                await client.generate(prompt="Hello")

    asyncio.run(_test())


def test_timeout_error_handling(test_config):
    async def _test():
        def handler(request: httpx.Request):
            raise httpx.ReadTimeout("Request timed out")

        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport, base_url="http://127.0.0.1:11434") as mock_http:
            client = OllamaClient(config=test_config, http_client=mock_http)
            with pytest.raises(OllamaTimeoutError):
                await client.generate(prompt="Hello")

    asyncio.run(_test())


def test_config_defaults_and_validation():
    cfg = AIEngineConfig(ollama_base_url="http://localhost:11434/")
    assert cfg.ollama_base_url == "http://localhost:11434"  # Trailing slash stripped
    assert cfg.ollama_model == "llama3.2:3b"
    assert cfg.timeout_seconds == 60.0
