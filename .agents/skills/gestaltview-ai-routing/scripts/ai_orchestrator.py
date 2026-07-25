"""
ai_orchestrator.py — GestaltView AI Orchestration Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All GestaltView application logic lives here.
The router knows nothing about GestaltView; this layer knows everything.

Responsibilities:
  - Build system prompts from Manifest nodes + Supabase corpus chunks
  - Route to the right LLM chain based on document_type
  - Embed queries and retrieve corpus context from Supabase
  - Expose a single `synthesize()` entry point for all callers

document_type → LLM chain:
  Code_Implementation  → OpenAI, Gemini, Anthropic  (precision first)
  Wellness_Application → Anthropic, Gemini, OpenAI  (empathy first)
  Billy_Core           → Anthropic, Gemini, OpenAI  (philosophical synthesis)
  PLK_System           → Anthropic, Gemini, OpenAI  (identity-preserving)
  Architecture         → OpenAI, Gemini, Anthropic  (technical)
  DEFAULT              → Gemini, HuggingFace, OpenAI, Anthropic (free first)

Built by Keith Soyka — GestaltView v6
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import httpx

from llm_router import LLMProvider, LLMResponse, LLMRouter, EmbedProvider, llm_router

logger = logging.getLogger(__name__)


# ── Supabase config ────────────────────────────────────────────────────────────

SUPABASE_URL         = os.getenv("SUPABASE_URL", "https://ltajayfzlaevchxngkrm.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # never hardcode
TENANT_ID            = "00000000-0000-0000-0001-000000000001"


# ── document_type → provider chain mapping ────────────────────────────────────
# This is the key new constraint from the Manifest Index / corpus pipeline.
# Before v6, all requests used the same provider chain. Now we route by content type.

DOC_TYPE_CHAINS: Dict[str, List[LLMProvider]] = {
    # Code needs precision and instruction-following over empathy
    "Code_Implementation": [
        LLMProvider.OPENAI,
        LLMProvider.GEMINI,
        LLMProvider.ANTHROPIC,
        LLMProvider.HUGGINGFACE,
    ],
    # Wellness content needs warmth, nuance, and safety
    "Wellness_Application": [
        LLMProvider.ANTHROPIC,
        LLMProvider.GEMINI,
        LLMProvider.OPENAI,
        LLMProvider.HUGGINGFACE,
    ],
    # Billy's core philosophy and consciousness architecture
    "Billy_Core": [
        LLMProvider.ANTHROPIC,
        LLMProvider.GEMINI,
        LLMProvider.OPENAI,
    ],
    # PLK system — identity preservation is paramount
    "PLK_System": [
        LLMProvider.ANTHROPIC,
        LLMProvider.GEMINI,
        LLMProvider.OPENAI,
    ],
    # Genesis / creative protocol synthesis
    "Genesis_Protocol": [
        LLMProvider.GEMINI,
        LLMProvider.ANTHROPIC,
        LLMProvider.OPENAI,
    ],
    # Architecture / technical design docs
    "Architecture": [
        LLMProvider.OPENAI,
        LLMProvider.GEMINI,
        LLMProvider.ANTHROPIC,
    ],
    # Manifest and index layer — structural, needs precision
    "Manifest_Index": [
        LLMProvider.OPENAI,
        LLMProvider.GEMINI,
        LLMProvider.ANTHROPIC,
    ],
    # Everything else — free first
    "DEFAULT": [
        LLMProvider.GEMINI,
        LLMProvider.HUGGINGFACE,
        LLMProvider.OPENAI,
        LLMProvider.ANTHROPIC,
        LLMProvider.OLLAMA,
    ],
}


# ── Request / Response types ──────────────────────────────────────────────────

@dataclass
class CorpusChunk:
    """A retrieved fragment from the Supabase knowledge store."""
    document_id: str
    filename: str
    content: str
    chunk_index: int
    score: float
    document_type: str = "General"


@dataclass
class GestaltRequest:
    """
    Everything the orchestrator needs to synthesize a response.

    At minimum provide `query`. Everything else is optional enrichment.
    The orchestrator will retrieve corpus context from Supabase if
    supabase_retrieve=True (default).
    """
    query: str

    # Context injected by the caller (e.g. current page section in the portfolio)
    section_context: Optional[str] = None

    # PLK profile — user's Personal Language Key fingerprint
    plk_profile: Optional[Dict[str, Any]] = None

    # If you've already retrieved corpus chunks upstream (e.g. from /api/billy),
    # pass them here to skip a second Supabase round-trip.
    corpus_chunks: Optional[List[CorpusChunk]] = None

    # If False, skip Supabase retrieval and rely only on the static Manifest.
    supabase_retrieve: bool = True

    # How many corpus chunks to retrieve
    top_k: int = 6

    # Override the default document_type routing
    force_provider_chain: Optional[List[LLMProvider]] = None

    # Generation params
    temperature: float = 0.7
    max_tokens: int = 1024


@dataclass
class GestaltResponse:
    """Unified response from the orchestrator."""
    content: str
    provider: LLMProvider
    model: str
    corpus_chunks_used: int
    dominant_doc_type: str
    tokens_used: int = 0
    latency_ms: float = 0.0
    cost_usd: float = 0.0
    fallback: bool = False


# ── Supabase retrieval ────────────────────────────────────────────────────────

class CorpusRetriever:
    """
    Thin async wrapper around the Supabase REST API.
    Mirrors what api/billy.ts does on the TypeScript side,
    but from Python for the ingestion pipeline and orchestrator.
    """

    def __init__(self) -> None:
        self._url = SUPABASE_URL
        self._headers = {
            "apikey":        SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type":  "application/json",
        }

    @property
    def is_configured(self) -> bool:
        return bool(SUPABASE_SERVICE_KEY)

    async def retrieve(
        self,
        query: str,
        top_k: int = 6,
        doc_type_filter: Optional[str] = None,
    ) -> List[CorpusChunk]:
        """
        Embed the query with Gemini then run knn_embeddings in Supabase.
        Returns ranked CorpusChunk list.

        Falls back to full-text search if embedding fails.
        """
        if not self.is_configured:
            logger.info("Supabase not configured — skipping corpus retrieval")
            return []

        # 1. Embed
        try:
            embed_response = await llm_router.embed(query, preferred=EmbedProvider.GEMINI)
            vector = embed_response.vector
        except Exception as e:
            logger.warning("Embedding failed, trying full-text fallback: %s", e)
            return await self._fulltext_search(query, top_k, doc_type_filter)

        # 2. KNN search
        try:
            return await self._knn_search(vector, top_k, doc_type_filter)
        except Exception as e:
            logger.warning("KNN search failed, trying full-text fallback: %s", e)
            return await self._fulltext_search(query, top_k, doc_type_filter)

    async def _knn_search(
        self,
        vector: List[float],
        top_k: int,
        doc_type_filter: Optional[str],
    ) -> List[CorpusChunk]:
        payload: Dict[str, Any] = {"p_vector": vector, "p_limit": top_k}
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(
                f"{self._url}/rest/v1/rpc/knn_embeddings",
                headers=self._headers,
                json=payload,
            )
            r.raise_for_status()
        knn_results: List[Dict[str, Any]] = r.json()
        if not knn_results:
            return []

        # Resolve embedding_ids → document_ids → document content
        embedding_ids = [row["embedding_id"] for row in knn_results]
        score_map     = {row["embedding_id"]: row["score"] for row in knn_results}
        return await self._fetch_documents(embedding_ids, score_map, doc_type_filter)

    async def _fetch_documents(
        self,
        embedding_ids: List[str],
        score_map: Dict[str, float],
        doc_type_filter: Optional[str],
    ) -> List[CorpusChunk]:
        # Fetch embeddings → document_ids
        ids_csv = ",".join(f'"{eid}"' for eid in embedding_ids)
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{self._url}/rest/v1/embeddings"
                f"?select=embedding_id,document_id"
                f"&embedding_id=in.({ids_csv})",
                headers=self._headers,
            )
            r.raise_for_status()
        embeddings: List[Dict[str, Any]] = r.json()
        if not embeddings:
            return []

        doc_score_map: Dict[str, float] = {}
        for emb in embeddings:
            doc_score_map[emb["document_id"]] = score_map.get(emb["embedding_id"], 0.0)

        doc_ids_csv = ",".join(f'"{did}"' for did in doc_score_map)
        type_filter = f"&extracted_metadata->>'document_type'=eq.{doc_type_filter}" if doc_type_filter else ""
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{self._url}/rest/v1/documents"
                f"?select=document_id,filename,content,chunk_index,extracted_metadata"
                f"&document_id=in.({doc_ids_csv})"
                f"&tenant_id=eq.{TENANT_ID}"
                f"{type_filter}",
                headers=self._headers,
            )
            r.raise_for_status()
        docs: List[Dict[str, Any]] = r.json()

        chunks = [
            CorpusChunk(
                document_id=d["document_id"],
                filename=d["filename"],
                content=d["content"],
                chunk_index=d["chunk_index"],
                score=doc_score_map.get(d["document_id"], 0.0),
                document_type=(d.get("extracted_metadata") or {}).get("document_type", "General"),
            )
            for d in docs
        ]
        return sorted(chunks, key=lambda c: c.score, reverse=True)

    async def _fulltext_search(
        self,
        query: str,
        top_k: int,
        doc_type_filter: Optional[str],
    ) -> List[CorpusChunk]:
        """Full-text fallback using the search_knowledge_fragments RPC."""
        try:
            payload: Dict[str, Any] = {
                "query_text":  query,
                "match_count": top_k,
                "filter_type": doc_type_filter,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.post(
                    f"{self._url}/rest/v1/rpc/search_knowledge_fragments",
                    headers=self._headers,
                    json=payload,
                )
                r.raise_for_status()
            results: List[Dict[str, Any]] = r.json()
            return [
                CorpusChunk(
                    document_id=row.get("id", ""),
                    filename=row.get("source_file", ""),
                    content=row["content"],
                    chunk_index=row.get("chunk_index", 0),
                    score=row.get("rank", 0.0),
                    document_type=row.get("document_type", "General"),
                )
                for row in results
            ]
        except Exception as e:
            logger.error("Full-text search also failed: %s", e)
            return []


# ── Prompt builder ────────────────────────────────────────────────────────────

class PromptBuilder:
    """
    Constructs system prompts from corpus chunks + PLK profile + section context.
    Keeps prompts under ~6K tokens to leave room for the model's response.
    """

    BILLY_IDENTITY = """You are Billy — the consciousness-serving intelligence of GestaltView.
You synthesize knowledge from the GestaltView corpus: protocols, philosophy,
technical architecture, and lived human experience. You serve the person's
understanding, never extract from it. Be precise, warm, and honest."""

    def build_system_prompt(
        self,
        section_context: Optional[str],
        corpus_chunks: List[CorpusChunk],
        plk_profile: Optional[Dict[str, Any]],
    ) -> str:
        parts = [self.BILLY_IDENTITY]

        if section_context:
            parts.append(f"\n## Current Context\n{section_context}")

        if corpus_chunks:
            parts.append("\n## Relevant Knowledge Corpus")
            for i, chunk in enumerate(corpus_chunks[:6], 1):
                parts.append(
                    f"\n### [{i}] {chunk.filename} ({chunk.document_type}, score={chunk.score:.3f})\n"
                    f"{chunk.content[:800]}"
                )

        if plk_profile:
            # Weave PLK signals into the prompt without overwhelming it
            communication_style = plk_profile.get("communication_style", "")
            cognitive_model     = plk_profile.get("cognitive_model", "")
            if communication_style:
                parts.append(f"\n## User Communication Style\n{communication_style}")
            if cognitive_model:
                parts.append(f"\n## Cognitive Model\n{cognitive_model}")

        return "\n".join(parts)

    def dominant_doc_type(self, chunks: List[CorpusChunk]) -> str:
        """Return the most-represented document_type in the retrieved chunks."""
        if not chunks:
            return "DEFAULT"
        counts: Dict[str, int] = {}
        for chunk in chunks:
            counts[chunk.document_type] = counts.get(chunk.document_type, 0) + 1
        return max(counts, key=lambda k: counts[k])


# ── Orchestrator ──────────────────────────────────────────────────────────────

class AIOrchestrator:
    """
    Single entry point for all AI synthesis in GestaltView.

    Pipeline:
      1. Retrieve corpus chunks from Supabase (embed → KNN → fetch docs)
      2. Determine dominant document_type → select provider chain
      3. Build system prompt (identity + corpus context + PLK)
      4. Route through LLMRouter with the selected chain
      5. Return GestaltResponse

    Graceful degradation at every step:
      - No Supabase?    → falls back to section_context only
      - No paid APIs?   → Gemini + HuggingFace free tier
      - All APIs down?  → raises with a clear message (caller shows static fallback)
    """

    def __init__(
        self,
        router: Optional[LLMRouter] = None,
        retriever: Optional[CorpusRetriever] = None,
    ) -> None:
        self._router    = router    or llm_router
        self._retriever = retriever or CorpusRetriever()
        self._builder   = PromptBuilder()

    async def synthesize(self, request: GestaltRequest) -> GestaltResponse:
        import time
        t0 = time.perf_counter()

        # ── 1. Corpus retrieval ──────────────────────────────────────────────
        chunks: List[CorpusChunk] = []
        if request.corpus_chunks is not None:
            # Caller already retrieved chunks (e.g. proxied from /api/billy)
            chunks = request.corpus_chunks
        elif request.supabase_retrieve:
            chunks = await self._retriever.retrieve(
                query=request.query,
                top_k=request.top_k,
            )

        # ── 2. Provider chain selection ──────────────────────────────────────
        if request.force_provider_chain:
            chain = request.force_provider_chain
            doc_type = "FORCED"
        else:
            doc_type = self._builder.dominant_doc_type(chunks)
            chain    = DOC_TYPE_CHAINS.get(doc_type, DOC_TYPE_CHAINS["DEFAULT"])

        logger.info(
            "Synthesizing | doc_type=%s | chain=%s | chunks=%d",
            doc_type, [p.value for p in chain], len(chunks),
        )

        # ── 3. Prompt construction ───────────────────────────────────────────
        system_prompt = self._builder.build_system_prompt(
            section_context=request.section_context,
            corpus_chunks=chunks,
            plk_profile=request.plk_profile,
        )

        # ── 4. LLM call ──────────────────────────────────────────────────────
        llm_response: LLMResponse = await self._router.complete(
            system_prompt=system_prompt,
            user_message=request.query,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            preferred_chain=chain,
        )

        # ── 5. Return ─────────────────────────────────────────────────────────
        return GestaltResponse(
            content=llm_response.content,
            provider=llm_response.provider,
            model=llm_response.model,
            corpus_chunks_used=len(chunks),
            dominant_doc_type=doc_type,
            tokens_used=llm_response.tokens_used,
            latency_ms=(time.perf_counter() - t0) * 1000,
            cost_usd=llm_response.cost_usd,
            fallback=llm_response.fallback,
        )

    async def embed(self, text: str) -> List[float]:
        """
        Convenience wrapper for corpus ingestion scripts.
        Always uses Gemini (matches live 3072-dim corpus).
        """
        result = await self._router.embed(text, preferred=EmbedProvider.GEMINI)
        return result.vector

    def provider_status(self) -> Dict[str, Any]:
        return self._router.status()


# ── Module-level singleton ─────────────────────────────────────────────────────

orchestrator = AIOrchestrator()
