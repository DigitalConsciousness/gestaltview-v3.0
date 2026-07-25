"""
llm_router.py — GestaltView Provider Abstraction Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pure provider routing. No GestaltView application logic lives here.
The orchestrator calls this; this calls APIs.

Provider chain (free-first):
  1. Gemini        — free tier (1M tokens/day), also owns embedding
  2. HuggingFace   — free inference API, weaker models, good fallback
  3. OpenAI        — paid, but best for code/structured tasks
  4. Anthropic     — paid, best for synthesis + philosophical content
  5. Ollama        — local only, opportunistic (never guaranteed in cloud)

Embedding chain (separate from LLM routing):
  1. text-embedding-004  → 768 dims  (matches live Supabase corpus)
  2. text-embedding-3-small → 1536 dims  (matches create_knowledge_table.sql schema)
  NOTE: Pick ONE and standardize. The dimension mismatch between these two
        is the active bug described in the audit. Default here is Gemini (3072).

Built by Keith Soyka — GestaltView v6
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)


# ── Enums ─────────────────────────────────────────────────────────────────────

class LLMProvider(str, Enum):
    GEMINI      = "gemini"
    HUGGINGFACE = "huggingface"
    OPENAI      = "openai"
    ANTHROPIC   = "anthropic"
    OLLAMA      = "ollama"


class EmbedProvider(str, Enum):
    GEMINI = "gemini"   # 768 dims — text-embedding-004
    OPENAI = "openai"   # 1536 dims — text-embedding-3-small


# ── Data types ────────────────────────────────────────────────────────────────

@dataclass
class LLMResponse:
    content: str
    provider: LLMProvider
    model: str
    tokens_used: int = 0
    latency_ms: float = 0.0
    cost_usd: float = 0.0        # 0.0 for free-tier providers
    fallback: bool = False       # True if this wasn't the first-choice provider


@dataclass
class EmbedResponse:
    vector: List[float]
    provider: EmbedProvider
    model: str
    dimensions: int
    latency_ms: float = 0.0


@dataclass
class ProviderHealth:
    healthy: bool = True
    consecutive_failures: int = 0
    last_failure_ts: float = 0.0
    last_success_ts: float = field(default_factory=time.time)

    # Circuit breaker: after 3 failures, mark unhealthy.
    # Auto-reset after 60s so transient outages don't permanently disable.
    FAILURE_THRESHOLD: int = 3
    RESET_AFTER_SECS: float = 60.0

    def record_success(self) -> None:
        self.healthy = True
        self.consecutive_failures = 0
        self.last_success_ts = time.time()

    def record_failure(self) -> None:
        self.consecutive_failures += 1
        self.last_failure_ts = time.time()
        if self.consecutive_failures >= self.FAILURE_THRESHOLD:
            self.healthy = False
            logger.warning(
                "Provider circuit breaker OPEN after %d consecutive failures",
                self.consecutive_failures,
            )

    def is_available(self) -> bool:
        if self.healthy:
            return True
        # Auto-reset check
        if time.time() - self.last_failure_ts > self.RESET_AFTER_SECS:
            logger.info("Provider circuit breaker resetting after cooldown")
            self.healthy = True
            self.consecutive_failures = 0
            return True
        return False


# ── Provider adapter interface ────────────────────────────────────────────────

class ProviderAdapter(ABC):
    """Each provider implements this. Router only calls this interface."""

    @property
    @abstractmethod
    def provider_id(self) -> LLMProvider: ...

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """True if the required env vars / local service is present."""
        ...

    @abstractmethod
    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float,
        max_tokens: int,
    ) -> LLMResponse: ...


# ── Gemini adapter ────────────────────────────────────────────────────────────

class GeminiAdapter(ProviderAdapter):
    CHAT_MODEL  = "gemini-2.0-flash"         # free tier generous quota
    EMBED_MODEL = "text-embedding-004"
    EMBED_DIMS  = 768
    BASE_URL    = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self) -> None:
        self._api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

    @property
    def provider_id(self) -> LLMProvider:
        return LLMProvider.GEMINI

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        t0 = time.perf_counter()
        url = f"{self.BASE_URL}/models/{self.CHAT_MODEL}:generateContent?key={self._api_key}"
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_message}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(url, json=payload)
            r.raise_for_status()
        data = r.json()
        content = data["candidates"][0]["content"]["parts"][0]["text"]
        tokens  = data.get("usageMetadata", {}).get("totalTokenCount", 0)
        return LLMResponse(
            content=content,
            provider=LLMProvider.GEMINI,
            model=self.CHAT_MODEL,
            tokens_used=tokens,
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=0.0,  # free tier
        )

    async def embed(self, text: str) -> EmbedResponse:
        t0 = time.perf_counter()
        url = f"{self.BASE_URL}/models/{self.EMBED_MODEL}:embedContent?key={self._api_key}"
        payload = {
            "model": f"models/{self.EMBED_MODEL}",
            "content": {"parts": [{"text": text[:25_000]}]},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(url, json=payload)
            r.raise_for_status()
        vector = r.json()["embedding"]["values"]
        return EmbedResponse(
            vector=vector,
            provider=EmbedProvider.GEMINI,
            model=self.EMBED_MODEL,
            dimensions=len(vector),
            latency_ms=(time.perf_counter() - t0) * 1000,
        )


# ── HuggingFace adapter ───────────────────────────────────────────────────────

class HuggingFaceAdapter(ProviderAdapter):
    # Use a hosted inference model that supports chat-style prompts well.
    # HF free tier works without a key but is heavily rate-limited.
    MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

    def __init__(self) -> None:
        self._api_key = os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_API_TOKEN")

    @property
    def provider_id(self) -> LLMProvider:
        return LLMProvider.HUGGINGFACE

    @property
    def is_configured(self) -> bool:
        # Works without a key (rate-limited) — always considered configured.
        return True

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 512,
    ) -> LLMResponse:
        t0 = time.perf_counter()
        # Mistral instruct format
        prompt = f"<s>[INST] {system_prompt}\n\n{user_message} [/INST]"
        headers: Dict[str, str] = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"

        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(
                f"https://api-inference.huggingface.co/models/{self.MODEL}",
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": max_tokens,
                        "temperature": temperature,
                        "return_full_text": False,
                    },
                },
            )
            r.raise_for_status()

        data = r.json()
        # HF returns a list; guard both shapes
        if isinstance(data, list) and data:
            content = data[0].get("generated_text", "")
        elif isinstance(data, dict):
            content = data.get("generated_text", str(data))
        else:
            content = ""

        return LLMResponse(
            content=content.strip(),
            provider=LLMProvider.HUGGINGFACE,
            model=self.MODEL,
            tokens_used=len(content.split()),
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=0.0,
        )


# ── OpenAI adapter ────────────────────────────────────────────────────────────

class OpenAIAdapter(ProviderAdapter):
    CHAT_MODEL  = "gpt-4o-mini"           # cheapest capable model
    EMBED_MODEL = "text-embedding-3-small"
    EMBED_DIMS  = 1536

    def __init__(self) -> None:
        self._api_key = os.getenv("OPENAI_API_KEY")

    @property
    def provider_id(self) -> LLMProvider:
        return LLMProvider.OPENAI

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.CHAT_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_message},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            r.raise_for_status()
        data = r.json()
        # Correct index: choices is a list
        content = data["choices"][0]["message"]["content"]
        tokens  = data["usage"]["total_tokens"]
        return LLMResponse(
            content=content,
            provider=LLMProvider.OPENAI,
            model=self.CHAT_MODEL,
            tokens_used=tokens,
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=tokens * 0.00000015,  # gpt-4o-mini pricing (output ~$0.60/1M)
        )

    async def embed(self, text: str) -> EmbedResponse:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {self._api_key}"},
                json={"model": self.EMBED_MODEL, "input": text[:8_000]},
            )
            r.raise_for_status()
        vector = r.json()["data"][0]["embedding"]
        return EmbedResponse(
            vector=vector,
            provider=EmbedProvider.OPENAI,
            model=self.EMBED_MODEL,
            dimensions=len(vector),
            latency_ms=(time.perf_counter() - t0) * 1000,
        )


# ── Anthropic adapter ─────────────────────────────────────────────────────────

class AnthropicAdapter(ProviderAdapter):
    MODEL = "claude-sonnet-4-6"  # current Sonnet — best synthesis/philosophical quality

    def __init__(self) -> None:
        self._api_key = os.getenv("ANTHROPIC_API_KEY")

    @property
    def provider_id(self) -> LLMProvider:
        return LLMProvider.ANTHROPIC

    @property
    def is_configured(self) -> bool:
        return bool(self._api_key)

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        t0 = time.perf_counter()
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self._api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.MODEL,
                    "system": system_prompt,
                    "messages": [{"role": "user", "content": user_message}],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            r.raise_for_status()
        data = r.json()
        # content is a list of blocks; text block is first
        content = data["content"][0]["text"]
        tokens  = data["usage"]["input_tokens"] + data["usage"]["output_tokens"]
        return LLMResponse(
            content=content,
            provider=LLMProvider.ANTHROPIC,
            model=self.MODEL,
            tokens_used=tokens,
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=tokens * 0.000003,  # Sonnet input ~$3/1M
        )


# ── Ollama adapter (local / opportunistic) ────────────────────────────────────

class OllamaAdapter(ProviderAdapter):
    PREFERRED_MODELS = ["phi3:mini", "mistral", "llama3.2", "llama2"]

    def __init__(self) -> None:
        self._base_url = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self._model: Optional[str] = None  # resolved on first use

    @property
    def provider_id(self) -> LLMProvider:
        return LLMProvider.OLLAMA

    @property
    def is_configured(self) -> bool:
        # Ollama is opportunistic — treated as configured; health check decides availability.
        return True

    async def _resolve_model(self) -> Optional[str]:
        if self._model:
            return self._model
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self._base_url}/api/tags")
                if r.status_code == 200:
                    names = [m["name"] for m in r.json().get("models", [])]
                    for pref in self.PREFERRED_MODELS:
                        match = next((n for n in names if pref in n), None)
                        if match:
                            self._model = match
                            return self._model
                    self._model = names[0] if names else None
                    return self._model
        except Exception:
            return None

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        model = await self._resolve_model()
        if not model:
            raise RuntimeError("No Ollama models available")
        t0 = time.perf_counter()
        prompt = f"System: {system_prompt}\n\nUser: {user_message}\n\nAssistant:"
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.post(
                f"{self._base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "options": {"temperature": temperature, "num_predict": max_tokens},
                    "stream": False,
                },
            )
            r.raise_for_status()
        content = r.json().get("response", "")
        return LLMResponse(
            content=content,
            provider=LLMProvider.OLLAMA,
            model=model,
            tokens_used=len(content.split()),
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=0.0,
        )


# ── LLM Router ────────────────────────────────────────────────────────────────

class LLMRouter:
    """
    Routes a (system_prompt, user_message) pair through the provider chain.
    Handles health tracking and fallback automatically.

    Usage:
        router = LLMRouter()
        response = await router.complete(
            system_prompt="...",
            user_message="...",
            preferred_chain=[LLMProvider.GEMINI, LLMProvider.ANTHROPIC],
        )
    """

    # Default free-first chain. Orchestrator can override per request.
    DEFAULT_CHAIN: List[LLMProvider] = [
        LLMProvider.GEMINI,
        LLMProvider.HUGGINGFACE,
        LLMProvider.OPENAI,
        LLMProvider.ANTHROPIC,
        LLMProvider.OLLAMA,
    ]

    def __init__(self) -> None:
        self._adapters: Dict[LLMProvider, ProviderAdapter] = {
            LLMProvider.GEMINI:      GeminiAdapter(),
            LLMProvider.HUGGINGFACE: HuggingFaceAdapter(),
            LLMProvider.OPENAI:      OpenAIAdapter(),
            LLMProvider.ANTHROPIC:   AnthropicAdapter(),
            LLMProvider.OLLAMA:      OllamaAdapter(),
        }
        self._health: Dict[LLMProvider, ProviderHealth] = {
            p: ProviderHealth() for p in LLMProvider
        }

    def _available(self, provider: LLMProvider) -> bool:
        adapter = self._adapters[provider]
        return adapter.is_configured and self._health[provider].is_available()

    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        preferred_chain: Optional[List[LLMProvider]] = None,
    ) -> LLMResponse:
        chain = preferred_chain or self.DEFAULT_CHAIN
        first_choice = next((p for p in chain if self._available(p)), None)

        last_err: Optional[Exception] = None
        for i, provider in enumerate(chain):
            if not self._available(provider):
                continue
            try:
                response = await self._adapters[provider].complete(
                    system_prompt=system_prompt,
                    user_message=user_message,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                self._health[provider].record_success()
                response.fallback = provider != first_choice
                if response.fallback:
                    logger.info("Used fallback provider: %s (position %d in chain)", provider, i)
                return response
            except Exception as e:
                logger.warning("Provider %s failed: %s", provider, e)
                self._health[provider].record_failure()
                last_err = e

        raise RuntimeError(
            f"All providers in chain {chain} exhausted. Last error: {last_err}"
        )

    async def embed(
        self,
        text: str,
        preferred: EmbedProvider = EmbedProvider.GEMINI,
    ) -> EmbedResponse:
        """
        Embed text. Primary is Gemini (3072 dims, matches live corpus).
        Falls back to OpenAI (1536 dims) if Gemini unavailable.

        IMPORTANT: Do not mix dimensions in the same Supabase table.
        Once you standardize on one model, use only that model for all ingestion.
        """
        gemini: GeminiAdapter = self._adapters[LLMProvider.GEMINI]   # type: ignore[assignment]
        openai: OpenAIAdapter  = self._adapters[LLMProvider.OPENAI]   # type: ignore[assignment]

        if preferred == EmbedProvider.GEMINI and gemini.is_configured:
            try:
                return await gemini.embed(text)
            except Exception as e:
                logger.warning("Gemini embed failed, falling back to OpenAI: %s", e)

        if openai.is_configured:
            return await openai.embed(text)

        raise RuntimeError("No embedding provider available (need GOOGLE_API_KEY or OPENAI_API_KEY)")

    def status(self) -> Dict[str, Any]:
        return {
            p.value: {
                "configured": self._adapters[p].is_configured,
                "healthy":    self._health[p].is_available(),
                "failures":   self._health[p].consecutive_failures,
            }
            for p in LLMProvider
        }


# ── Module-level singleton ─────────────────────────────────────────────────────
# Import this in the orchestrator rather than instantiating a new router per request.

llm_router = LLMRouter()
