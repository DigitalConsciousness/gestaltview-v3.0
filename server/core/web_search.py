"""
server/core/web_search.py
GestaltView Web Search Router — Free-First Tier Ladder

Tier ladder (matches LLMRouter philosophy):
  1. DuckDuckGo Instant Answer API  — no key, always available, limited scope
  2. Brave Search API               — BRAVE_SEARCH_API_KEY, 2 000 req/month free
  3. Perplexity API                 — PERPLEXITY_API_KEY, cited answers, pay-per-use
  4. Silent passthrough             — logs a flag, LLM continues without web context

Design rules:
  - Mirror LLMRouter pattern: Config → Router → graceful degradation
  - No exception is fatal; every failure returns WebSearchResult(success=False)
  - Inject-ready: result.to_prompt_block() returns a string for PLK-style injection
  - Trigger detection: should_search() scans message for question signals
"""

from __future__ import annotations

import logging
import os
import re
import time
import urllib.parse
from typing import List, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config (reads from env, degrades gracefully when keys absent)
# ---------------------------------------------------------------------------

class WebSearchConfig:
    BRAVE_SEARCH_API_KEY:  Optional[str] = os.getenv("BRAVE_SEARCH_API_KEY")
    PERPLEXITY_API_KEY:    Optional[str] = os.getenv("PERPLEXITY_API_KEY")

    ENABLE_BRAVE:          bool = bool(BRAVE_SEARCH_API_KEY)
    ENABLE_PERPLEXITY:     bool = bool(PERPLEXITY_API_KEY)

    # Brave free tier: 2 000/month — cap individual result count low to save quota
    BRAVE_RESULT_COUNT:    int  = 5
    # Timeout for all external search calls
    SEARCH_TIMEOUT:        float = 8.0
    # Max characters of web context injected into prompt
    MAX_CONTEXT_CHARS:     int  = 1200

web_search_config = WebSearchConfig()
default_web_search_router: Optional["WebSearchRouter"] = None

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

class SearchResult(BaseModel):
    title:   str
    snippet: str
    url:     str = ""

class WebSearchResult(BaseModel):
    query:        str
    success:      bool
    source:       str  # "duckduckgo" | "brave" | "perplexity" | "none"
    results:      List[SearchResult] = Field(default_factory=list)
    raw_answer:   str = ""           # Perplexity / DDG abstract
    latency_ms:   float = 0.0
    error:        Optional[str] = None

    def to_prompt_block(self, max_chars: int = 1200) -> str:
        """Returns a compact, inject-ready string for prompt enrichment."""
        if not self.success:
            return ""
        lines = [f"[WEB_GROUNDING — {self.source}]"]
        if self.raw_answer:
            lines.append(self.raw_answer[:max_chars])
        else:
            char_budget = max_chars
            for r in self.results:
                entry = f"• {r.title}: {r.snippet}"
                if len(entry) > char_budget:
                    entry = entry[:char_budget]
                lines.append(entry)
                char_budget -= len(entry)
                if char_budget <= 0:
                    break
        lines.append("[/WEB_GROUNDING]")
        return "\n".join(lines)

# ---------------------------------------------------------------------------
# Trigger detection
# ---------------------------------------------------------------------------

# Signals that suggest the message benefits from live external grounding
_SEARCH_TRIGGERS = re.compile(
    r"\b("
    r"what is|what are|what was|what were|who is|who are|who was"
    r"|when did|when is|when was|where is|where was"
    r"|how does|how do|how did|how is"
    r"|latest|current|recent|news|today|right now|update"
    r"|price|cost|release|version|vs\b|compare|difference"
    r"|define|definition|explain|overview|example"
    r"|2025|2026|2027"
    r")\b",
    re.IGNORECASE,
)

def should_search(message: str) -> bool:
    """
    Returns True if the message contains signals that live web grounding
    would meaningfully improve the DI response.
    Keeps false-positive rate low — creative / reflective prompts are excluded.
    """
    if len(message.strip()) < 8:
        return False
    if message.strip().endswith("?"):
        return True
    return bool(_SEARCH_TRIGGERS.search(message))


def extract_query(message: str) -> str:
    """Strip PLK/system tokens and return a clean search query string."""
    # Remove any injected context blocks
    clean = re.sub(r"\[PLK_CONTEXT\].*?\[/PLK_CONTEXT\]", "", message, flags=re.DOTALL)
    clean = re.sub(r"\[WEB_GROUNDING.*?\[/WEB_GROUNDING\]", "", clean, flags=re.DOTALL)
    # Collapse whitespace
    clean = " ".join(clean.split())
    # Truncate to reasonable search query length
    return clean[:200].strip()


def _has_meaningful_query(query: str) -> bool:
    return len(query.strip()) >= 3


# ---------------------------------------------------------------------------
# WebSearchRouter
# ---------------------------------------------------------------------------

class WebSearchRouter:
    """
    Free-first web search router.
    Call .search(query) — returns WebSearchResult regardless of tier used.
    """

    def __init__(self, config: WebSearchConfig = web_search_config):
        self.config = config

    async def search_message(self, message: str) -> WebSearchResult:
        """
        Convenience wrapper used by response pipelines.
        Applies trigger detection, query extraction, and tiered search in one call.
        """
        query = extract_query(message)
        if not should_search(message) or not _has_meaningful_query(query):
            return WebSearchResult(
                query=query,
                success=False,
                source="none",
                latency_ms=0.0,
                error="Message did not require web grounding.",
            )

        return await self.search(query)

    async def search(self, query: str) -> WebSearchResult:
        """Try each tier in order; return first success."""
        start = time.time()

        # Tier 1 — DuckDuckGo (no key required)
        result = await self._try_duckduckgo(query, start)
        if result and result.success:
            return result

        # Tier 2 — Brave Search (free tier, key optional)
        if self.config.ENABLE_BRAVE:
            result = await self._try_brave(query, start)
            if result and result.success:
                return result

        # Tier 3 — Perplexity (cited answers, pay-per-use)
        if self.config.ENABLE_PERPLEXITY:
            result = await self._try_perplexity(query, start)
            if result and result.success:
                return result

        # Tier 4 — Silent passthrough
        logger.info("[web_search] No provider succeeded for query: %s", query[:80])
        return WebSearchResult(
            query=query,
            success=False,
            source="none",
            latency_ms=(time.time() - start) * 1000,
            error="All search providers unavailable or returned no results.",
        )

    # ── Tier 1: DuckDuckGo Instant Answer ──────────────────────────────────

    async def _try_duckduckgo(self, query: str, start: float) -> Optional[WebSearchResult]:
        """
        Uses DuckDuckGo Instant Answer API (no authentication required).
        Returns best-effort results; not a full web index.
        """
        try:
            import httpx
            encoded = urllib.parse.quote_plus(query)
            url = f"https://api.duckduckgo.com/?q={encoded}&format=json&no_redirect=1&no_html=1"
            async with httpx.AsyncClient(timeout=self.config.SEARCH_TIMEOUT) as client:
                resp = await client.get(url, timeout=self.config.SEARCH_TIMEOUT)
            if resp.status_code != 200:
                return None
            data = resp.json()
            results: List[SearchResult] = []
            # Abstract (best single-answer)
            abstract = data.get("AbstractText", "").strip()
            # RelatedTopics (list results)
            for topic in data.get("RelatedTopics", [])[:self.config.BRAVE_RESULT_COUNT]:
                if isinstance(topic, dict) and topic.get("Text"):
                    first_url = topic.get("FirstURL", "")
                    results.append(SearchResult(
                        title=first_url.split("/")[-1].replace("_", " ") or query,
                        snippet=topic["Text"],
                        url=first_url,
                    ))
            if not abstract and not results:
                return None
            return WebSearchResult(
                query=query,
                success=True,
                source="duckduckgo",
                results=results,
                raw_answer=abstract,
                latency_ms=(time.time() - start) * 1000,
            )
        except Exception as e:
            logger.debug("[web_search] DuckDuckGo failed: %s", e)
            return None

    # ── Tier 2: Brave Search API ────────────────────────────────────────────

    async def _try_brave(self, query: str, start: float) -> Optional[WebSearchResult]:
        """Brave Search API — 2 000 free requests/month with BRAVE_SEARCH_API_KEY."""
        try:
            import httpx
            params = {
                "q":     query,
                "count": self.config.BRAVE_RESULT_COUNT,
                "text_decorations": False,
                "search_lang": "en",
            }
            async with httpx.AsyncClient(timeout=self.config.SEARCH_TIMEOUT) as client:
                resp = await client.get(
                    "https://api.search.brave.com/res/v1/web/search",
                    params=params,
                    headers={
                        "Accept":              "application/json",
                        "Accept-Encoding":     "gzip",
                        "X-Subscription-Token": self.config.BRAVE_SEARCH_API_KEY,
                    },
                    timeout=self.config.SEARCH_TIMEOUT,
                )
            if resp.status_code != 200:
                logger.warning("[web_search] Brave returned %s", resp.status_code)
                return None
            data = resp.json()
            web_results = data.get("web", {}).get("results", [])
            results = [
                SearchResult(
                    title=r.get("title", ""),
                    snippet=r.get("description", ""),
                    url=r.get("url", ""),
                )
                for r in web_results
            ]
            if not results:
                return None
            return WebSearchResult(
                query=query,
                success=True,
                source="brave",
                results=results,
                latency_ms=(time.time() - start) * 1000,
            )
        except Exception as e:
            logger.debug("[web_search] Brave failed: %s", e)
            return None

    # ── Tier 3: Perplexity API ──────────────────────────────────────────────

    async def _try_perplexity(self, query: str, start: float) -> Optional[WebSearchResult]:
        """
        Perplexity sonar-pro — returns a cited, grounded answer.
        Uses PERPLEXITY_API_KEY. Pay-per-use.
        """
        try:
            import httpx
            async with httpx.AsyncClient(timeout=self.config.SEARCH_TIMEOUT) as client:
                resp = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.config.PERPLEXITY_API_KEY}",
                        "Content-Type":  "application/json",
                    },
                    json={
                        "model":       "sonar",
                        "messages":    [{"role": "user", "content": query}],
                        "max_tokens":  400,
                        "temperature": 0.2,
                    },
                    timeout=self.config.SEARCH_TIMEOUT,
                )
            if resp.status_code != 200:
                logger.warning("[web_search] Perplexity returned %s", resp.status_code)
                return None
            data = resp.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if not answer:
                return None
            return WebSearchResult(
                query=query,
                success=True,
                source="perplexity",
                raw_answer=answer,
                latency_ms=(time.time() - start) * 1000,
            )
        except Exception as e:
            logger.debug("[web_search] Perplexity failed: %s", e)
            return None


def get_default_web_search_router() -> WebSearchRouter:
    """Return a process-wide router so callers don't create extra clients."""
    global default_web_search_router
    if default_web_search_router is None:
        default_web_search_router = WebSearchRouter()
    return default_web_search_router


async def ground_message(message: str, router: Optional[WebSearchRouter] = None) -> WebSearchResult:
    """
    Search the web only when the message looks like it benefits from grounding.
    This is the end-to-end entrypoint used by chat surfaces.
    """
    resolved_router = router or get_default_web_search_router()
    return await resolved_router.search_message(message)
