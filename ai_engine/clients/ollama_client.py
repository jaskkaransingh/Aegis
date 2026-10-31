"""
AEGIS Ollama Asynchronous HTTP Client.
Directly interfaces with the local Ollama daemon for text generation,
model discovery, and structured schema-constrained JSON inference.
"""

import json
from typing import Any, Dict, List, Optional, Type, Union
import httpx
from pydantic import BaseModel

from ai_engine.config import AIEngineConfig, get_config


class OllamaClientError(Exception):
    """Base exception for all Ollama client failures."""
    pass


class OllamaConnectionError(OllamaClientError):
    """Raised when the Ollama service cannot be reached (e.g. server offline)."""
    pass


class OllamaTimeoutError(OllamaClientError):
    """Raised when an Ollama request times out."""
    pass


class OllamaModelNotFoundError(OllamaClientError):
    """Raised when the requested model is not installed or available."""
    pass


class OllamaStructuredOutputError(OllamaClientError):
    """Raised when the model fails to return valid or schema-conforming JSON."""
    pass


class OllamaAPIError(OllamaClientError):
    """Raised when Ollama returns an unexpected HTTP error code or response."""
    def __init__(self, status_code: int, message: str):
        super().__init__(f"Ollama API error ({status_code}): {message}")
        self.status_code = status_code
        self.message = message


class OllamaClient:
    """
    Asynchronous client for interacting with a local Ollama daemon.
    Designed for testability with explicit connection lifecycle management.
    """

    def __init__(
        self,
        config: Optional[AIEngineConfig] = None,
        http_client: Optional[httpx.AsyncClient] = None,
    ):
        self.config = config or get_config()
        self._custom_client = http_client is not None
        self._client: Optional[httpx.AsyncClient] = http_client

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.config.ollama_base_url,
                timeout=httpx.Timeout(self.config.timeout_seconds),
            )
        return self._client

    async def close(self) -> None:
        """Closes the underlying HTTP client session if owned by this instance."""
        if not self._custom_client and self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "OllamaClient":
        await self._get_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        await self.close()

    async def health_check(self) -> bool:
        """
        Determines whether the Ollama service is reachable.
        Returns True if reachable, False otherwise. Does not throw.
        """
        try:
            client = await self._get_client()
            res = await client.get("/api/tags")
            return res.status_code == 200
        except (httpx.ConnectError, httpx.TimeoutException, OSError):
            return False

    async def list_models(self) -> List[str]:
        """
        Retrieves names of locally available models from Ollama.
        Raises OllamaConnectionError if service is unreachable.
        """
        try:
            client = await self._get_client()
            res = await client.get("/api/tags")
        except httpx.ConnectError as err:
            raise OllamaConnectionError(
                f"Failed to connect to Ollama at {self.config.ollama_base_url}. "
                f"Ensure the daemon is started using 'ollama serve'."
            ) from err
        except httpx.TimeoutException as err:
            raise OllamaTimeoutError(
                f"Request to list Ollama models timed out after {self.config.timeout_seconds}s."
            ) from err
        except Exception as err:
            raise OllamaClientError(f"Unexpected error communicating with Ollama: {err}") from err

        if res.status_code != 200:
            raise OllamaAPIError(res.status_code, res.text)

        data = res.json()
        models = data.get("models", [])
        return [m.get("name") for m in models if m.get("name")]

    async def validate_model(self, model_name: Optional[str] = None) -> bool:
        """
        Verifies that the configured or requested model is available locally.
        """
        target = model_name or self.config.ollama_model
        available = await self.list_models()
        # Direct match or tag prefix match (e.g. 'llama3.2:3b' vs 'llama3.2:3b')
        return target in available or any(m.startswith(f"{target}:") for m in available)

    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Sends a basic text generation prompt to Ollama.
        """
        target_model = model or self.config.ollama_model
        gen_options: Dict[str, Any] = {
            "temperature": temperature if temperature is not None else self.config.temperature,
        }
        if self.config.max_tokens:
            gen_options["num_predict"] = self.config.max_tokens
        if options:
            gen_options.update(options)

        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "options": gen_options,
        }
        if system:
            payload["system"] = system

        try:
            client = await self._get_client()
            res = await client.post("/api/generate", json=payload)
        except httpx.ConnectError as err:
            raise OllamaConnectionError(
                f"Failed to connect to Ollama at {self.config.ollama_base_url}."
            ) from err
        except httpx.TimeoutException as err:
            raise OllamaTimeoutError(
                f"Generation request timed out after {self.config.timeout_seconds}s."
            ) from err
        except Exception as err:
            raise OllamaClientError(f"Generation request failed: {err}") from err

        if res.status_code == 404:
            raise OllamaModelNotFoundError(
                f"Model '{target_model}' not found on Ollama server. "
                f"Available models can be checked with 'ollama list'."
            )
        if res.status_code != 200:
            raise OllamaAPIError(res.status_code, res.text)

        result = res.json()
        return result.get("response", "")

    async def generate_structured(
        self,
        prompt: str,
        schema: Union[Dict[str, Any], Type[BaseModel]],
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Requests structured output from Ollama adhering to a JSON schema or Pydantic model.
        Returns the parsed and validated dictionary payload.
        """
        target_model = model or self.config.ollama_model
        pydantic_cls: Optional[Type[BaseModel]] = None

        if isinstance(schema, type) and issubclass(schema, BaseModel):
            pydantic_cls = schema
            json_schema = schema.model_json_schema()
        elif isinstance(schema, dict):
            json_schema = schema
        else:
            raise ValueError("Schema must be a Pydantic model class or a JSON schema dictionary.")

        gen_options: Dict[str, Any] = {
            "temperature": temperature if temperature is not None else self.config.temperature,
        }
        if self.config.max_tokens:
            gen_options["num_predict"] = self.config.max_tokens

        payload: Dict[str, Any] = {
            "model": target_model,
            "prompt": prompt,
            "stream": False,
            "format": json_schema,
            "options": gen_options,
        }
        if system:
            payload["system"] = system

        try:
            client = await self._get_client()
            res = await client.post("/api/generate", json=payload)
        except httpx.ConnectError as err:
            raise OllamaConnectionError(
                f"Failed to connect to Ollama at {self.config.ollama_base_url}."
            ) from err
        except httpx.TimeoutException as err:
            raise OllamaTimeoutError(
                f"Structured generation timed out after {self.config.timeout_seconds}s."
            ) from err
        except Exception as err:
            raise OllamaClientError(f"Structured generation request failed: {err}") from err

        if res.status_code == 404:
            raise OllamaModelNotFoundError(f"Model '{target_model}' not found on Ollama server.")
        if res.status_code != 200:
            raise OllamaAPIError(res.status_code, res.text)

        body = res.json()
        raw_text = body.get("response", "").strip()

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as err:
            raise OllamaStructuredOutputError(
                f"Model response was not valid JSON: {err}\nResponse text: {raw_text[:200]}"
            ) from err

        if pydantic_cls is not None:
            try:
                validated = pydantic_cls.model_validate(parsed)
                return validated.model_dump()
            except Exception as err:
                raise OllamaStructuredOutputError(
                    f"Parsed JSON failed Pydantic schema validation: {err}"
                ) from err

        return parsed

