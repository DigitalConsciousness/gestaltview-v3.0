"""
synthesize_corpus.py
GestaltView Manifest Synthesis Runner

Two modes:

  1. SUPABASE-DIRECT (default)
     Reads knowledge_fragments from Supabase REST API.
     Generates summary + loom_annotation per fragment via LLM router.
     Writes annotations back to Supabase. No filesystem, no embedding, no chunking.
     Flags: --source-prefix, --package, --batch-size, --dry-run

  2. FILESYSTEM PIPELINE (--corpus-root)
     Runs the full ManifestPipeline from gestaltview_manifest_pipeline.py.
     Requires corpus directory on disk + psycopg2 + DATABASE_URL.
     Preserved for backward compatibility — behavior unchanged.

Free-first LLM chain (mirrors api/lib/llmrouter.py DEFAULT_CHAIN):
  1. Gemini  (free tier, 1M tokens/day)
  2. HuggingFace (free, rate-limited)
  3. OpenAI  (paid, gpt-4o-mini)
  4. Anthropic (paid)
  5. Ollama  (local, opportunistic)

Author: GestaltView / Keith Soyka
"""

from __future__ import annotations
import asyncio
import importlib.util
import json
import logging
import os
import pathlib
import sys
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import yaml

try:
    from gil_protocol import (
        GILProtocol,
        build_gil_context_block,
        build_gil_routing_overrides,
        infer_gil_retrieval_scope,
        load_gil_protocol,
        rank_fragments_for_protocol,
    )
except ModuleNotFoundError:
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    from gil_protocol import (  # type: ignore[no-redef]
        GILProtocol,
        build_gil_context_block,
        build_gil_routing_overrides,
        infer_gil_retrieval_scope,
        load_gil_protocol,
        rank_fragments_for_protocol,
    )

logger = logging.getLogger("synthesize_corpus")
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: Load llmrouter.py (handles hyphenated filenames via importlib)
# ─────────────────────────────────────────────────────────────────────────────

ROUTER_SEARCH_PATHS = [
    pathlib.Path(__file__).resolve().parent.parent / "api" / "lib" / "llmrouter.py",
    pathlib.Path(__file__).resolve().parent / "llm_router.py",
    pathlib.Path(__file__).resolve().parent / "llmrouter.py",
    pathlib.Path(__file__).resolve().parent.parent / "llmrouter.py",
]

def _load_router():
    for path in ROUTER_SEARCH_PATHS:
        if path.exists():
            try:
                spec = importlib.util.spec_from_file_location("llmrouter", path)
                mod  = importlib.util.module_from_spec(spec)       # type: ignore[arg-type]
                sys.modules[spec.name] = mod                       # type: ignore[index]
                spec.loader.exec_module(mod)                       # type: ignore[union-attr]
                logger.info("Loaded llmrouter from %s", path)
                return mod
            except Exception as exc:
                logger.warning("Failed to load llmrouter from %s: %s", path, exc)
    logger.warning("llmrouter.py not found — offline fallback only")
    return None

_router_mod       = _load_router()
_llm_router       = getattr(_router_mod, "llm_router", None)
_RouterLLMProvider = getattr(_router_mod, "LLMProvider", None)  # named to avoid shadow
_EmbedProvider    = getattr(_router_mod, "EmbedProvider", None)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: Load gestaltview_manifest_pipeline.py (filesystem pipeline — optional)
# ─────────────────────────────────────────────────────────────────────────────

MANIFEST_PIPELINE_PATHS = [
    pathlib.Path(__file__).parent / "gestaltview_manifest_pipeline.py",
    pathlib.Path(__file__).parent / "scripts" / "gestaltview_manifest_pipeline.py",
    # legacy name — kept for backward compat
    pathlib.Path(__file__).parent / "GestaltView-Manifest-Index-Layer.py",
    pathlib.Path(__file__).parent / "scripts" / "GestaltView-Manifest-Index-Layer.py",
]

def _load_manifest_pipeline():
    for path in MANIFEST_PIPELINE_PATHS:
        if path.exists():
            try:
                spec = importlib.util.spec_from_file_location("gestaltview_manifest_pipeline", path)
                mod  = importlib.util.module_from_spec(spec)       # type: ignore[arg-type]
                sys.modules[spec.name] = mod                       # type: ignore[index]
                spec.loader.exec_module(mod)                       # type: ignore[union-attr]
                logger.info("Loaded manifest pipeline from %s", path)
                return mod
            except Exception as exc:
                logger.warning("Failed to load manifest pipeline from %s: %s", path, exc)
    logger.warning(
        "gestaltview_manifest_pipeline.py not found — "
        "filesystem pipeline unavailable. Supabase-direct mode will still run."
    )
    return None

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: Supabase REST client
#         Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY already in env.
#         No psycopg2, no direct Postgres connection.
# ─────────────────────────────────────────────────────────────────────────────

class SupabaseRestClient:
    """
    Minimal Supabase REST client for reading knowledge_fragments and
    writing summaries + loom_annotations back. Pure stdlib urllib — no
    additional pip installs required.
    """

    def __init__(self):
        self.url = (
            os.getenv("SUPABASE_URL") or
            os.getenv("VITE_SUPABASE_URL") or ""
        ).rstrip("/")
        self.key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
            os.getenv("SUPABASE_SERVICE_KEY") or ""
        )
        if not self.url or not self.key:
            raise EnvironmentError(
                "SUPABASE_URL (or VITE_SUPABASE_URL) and "
                "SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are required."
            )
        self._headers = {
            "apikey":        self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type":  "application/json",
            "Prefer":        "return=representation",
        }
        logger.info("SupabaseRestClient ready → %s", self.url)

    def _get(self, endpoint: str, params: dict | None = None) -> list[dict]:
        import urllib.request, urllib.parse
        url = f"{self.url}/rest/v1/{endpoint}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers=self._headers, method="GET")
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())

    def _post(self, endpoint: str, payload: dict) -> dict:
        import urllib.request
        url  = f"{self.url}/rest/v1/{endpoint}"
        data = json.dumps(payload).encode()
        req  = urllib.request.Request(url, data=data, headers=self._headers, method="POST")
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return json.loads(raw)[0] if raw.startswith("[") else json.loads(raw)

    def _patch(self, endpoint: str, match_params: dict, payload: dict) -> None:
        import urllib.request, urllib.parse
        url  = f"{self.url}/rest/v1/{endpoint}?" + urllib.parse.urlencode(match_params)
        data = json.dumps(payload).encode()
        req  = urllib.request.Request(url, data=data, headers=self._headers, method="PATCH")
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()

    # ── knowledge_fragments ──────────────────────────────────────────────────

    def fetch_fragments(
        self,
        source_prefix: Optional[str] = None,
        package: Optional[str] = None,
        limit: int = 5000,
    ) -> list[dict]:
        """
        Fetch knowledge_fragments with optional source_file prefix and package filters.
        Returns: id, content, source_file, package, summary, loom_annotation
        """
        params: dict = {
            "select": "id,content,source_file,package,summary,loom_annotation",
            "limit":  limit,
        }
        if source_prefix:
            params["source_file"] = f"like.{source_prefix}%"
        if package:
            params["package"] = f"eq.{package}"

        rows = self._get("knowledge_fragments", params)
        logger.info("Fetched %d knowledge_fragments from Supabase", len(rows))
        return rows

    # ── summaries table ──────────────────────────────────────────────────────

    def write_summary(
        self,
        run_id: str,
        document_id: str,
        level: str,
        content: str,
    ) -> None:
        """
        Write a row to the summaries table.
        Schema: run_id, document_id, level, content (all NOT NULL per live schema).
        """
        self._post("summaries", {
            "summary_id":  str(uuid.uuid4()),
            "run_id":      run_id,
            "document_id": document_id,
            "level":       level,           # 'primary' | 'compounded' | 'corpus'
            "content":     content,
            "created_at":  datetime.now(timezone.utc).isoformat(),
        })

    # ── loom_annotations table ───────────────────────────────────────────────

    def write_loom_annotation(
        self,
        run_id: str,
        annotation_type: str,
        content: str,
        related_ids: list[str] | None = None,
        confidence_score: float | None = None,
    ) -> None:
        """
        Write a row to the loom_annotations table.
        Schema: run_id, type, content (all NOT NULL per live schema).
        """
        payload: dict = {
            "annotation_id":   str(uuid.uuid4()),
            "run_id":          run_id,
            "type":            annotation_type,
            "content":         content,
            "related_ids":     related_ids or [],
            "created_at":      datetime.now(timezone.utc).isoformat(),
        }
        if confidence_score is not None:
            payload["confidence_score"] = confidence_score
        self._post("loom_annotations", payload)

    # ── knowledge_fragments annotation patch ────────────────────────────────

    def patch_fragment_annotation(
        self,
        fragment_id: str,
        summary: str,
        loom_annotation: str,
    ) -> None:
        """
        Patch summary + loom_annotation back onto the source knowledge_fragment row.
        This is the denormalized fast-read path — the summaries table is the source of truth.
        """
        self._patch(
            endpoint="knowledge_fragments",
            match_params={"id": f"eq.{fragment_id}"},
            payload={"summary": summary, "loom_annotation": loom_annotation},
        )

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: Router-aware LLM provider (summarization only — no embed path)
# ─────────────────────────────────────────────────────────────────────────────

class RouterAwareLLMProvider:
    """
    Adapts the existing LLMRouter singleton for async summarization.
    Free-first chain enforced by the router. Offline stub on total failure.
    No embedding — this module does not write vectors.
    """

    FREE_FIRST_CHAIN = (
        ["gemini", "huggingface", "openai", "anthropic", "ollama"]
        if _RouterLLMProvider is None
        else [
            _RouterLLMProvider.GEMINI,
            _RouterLLMProvider.HUGGINGFACE,
            _RouterLLMProvider.OPENAI,
            _RouterLLMProvider.ANTHROPIC,
            _RouterLLMProvider.OLLAMA,
        ]
    )

    def __init__(
        self,
        model:       str   = "gemini-2.0-flash",
        max_tokens:  int   = 4096,
        temperature: float = 0.3,
    ):
        self.model       = model
        self.max_tokens  = max_tokens
        self.temperature = temperature
        self.router      = _llm_router

    async def complete(self, system_prompt: str, user_message: str) -> str:
        if self.router is None:
            logger.warning("No router available — returning offline stub")
            return self._offline_stub(user_message)
        try:
            response = await self.router.complete(
                system_prompt   = system_prompt,
                user_message    = user_message,
                temperature     = self.temperature,
                max_tokens      = self.max_tokens,
                preferred_chain = self.FREE_FIRST_CHAIN,
            )
            logger.info(
                "LLM  provider=%-12s  cost=$%.6f  fallback=%s",
                getattr(response, "provider", "unknown"),
                getattr(response, "cost_usd", 0.0),
                getattr(response, "fallback",  False),
            )
            return response.content
        except Exception as exc:
            logger.error("All providers exhausted: %s — offline stub", exc)
            return self._offline_stub(user_message)

    def _offline_stub(self, user_message: str) -> str:
        return (
            f"[offline-fallback] No LLM provider reachable. "
            f"Prompt excerpt: {user_message[:300].strip()}"
        )

    def provider_status(self) -> dict:
        return self.router.status() if self.router else {}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5: Prompts
#         Aligned to the LoomAnalyzer voice in gestaltview_manifest_pipeline.py
# ─────────────────────────────────────────────────────────────────────────────

SUMMARY_SYSTEM_PROMPT = """
You are the GestaltView Corpus Archivist.

Produce a concise PRIMARY SUMMARY (2–4 sentences) of the knowledge fragment below.
Capture: core thesis, key concepts, authorial intent, any open questions.
Maintain the author's voice. Preserve nuance over brevity.
If a GIL PROTOCOL CONTEXT block is present in the user message, treat it as the
primary interpretive frame for meaning, governance, and retrieval context.
""".strip()

LOOM_SYSTEM_PROMPT = """
You are performing LOOM ANALYSIS for GestaltView.

The Loom reveals what is missing, recurring, or unresolved in a knowledge fragment:
- Gaps: concepts introduced but not explored
- Threads: recurring motifs or subtle contradictions
- Weak Connections: adjacent ideas not explicitly linked
- Unresolved: open loops that invite completion
- Emergent: what wants to exist but hasn't been articulated

If a GIL PROTOCOL CONTEXT block is present, use it to shape the interpretive
frame for gaps, threads, weak connections, unresolved loops, and emergent form.

Write a single LOOM ANNOTATION sentence in GestaltView voice.
It should capture the connective tissue: what this fragment echoes,
what it anchors, what it implies about the system it belongs to.
Be specific. Trust your intuition.
""".strip()

def _build_fragment_message(fragment: dict) -> str:
    return (
        f"source_file: {fragment.get('source_file', 'unknown')}\n"
        f"package: {fragment.get('package', 'unknown')}\n\n"
        f"--- FRAGMENT CONTENT ---\n"
        f"{(fragment.get('content') or '').strip()[:6000]}"
    )

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6: Supabase-direct summarization pipeline
# ─────────────────────────────────────────────────────────────────────────────

async def run_summarization(
    source_prefix: Optional[str] = None,
    package:       Optional[str] = None,
    batch_size:    int  = 20,
    dry_run:       bool = False,
    gil_protocol_path: Optional[str] = None,
    time_budget_minutes: Optional[int] = None,
    max_fragments: Optional[int] = None,
    manifest_out: Optional[str] = None,
    run_label: Optional[str] = None,
) -> None:
    """
    Reads knowledge_fragments from Supabase, generates summary + loom_annotation
    for each fragment via the LLM router, then writes:
      - summaries table (run_id, document_id, level='primary', content)
      - loom_annotations table (run_id, type, content)
      - knowledge_fragments.summary + loom_annotation (denormalized patch)

    Skips fragments already annotated unless FORCE_RESUMMARY=1 is set.
    """
    gil = load_gil_protocol(gil_protocol_path)
    if gil:
        logger.info("Loaded GIL protocol from %s", gil.path)
    else:
        logger.info("No GIL protocol loaded — using corpus-only prompts")

    routing_overrides = build_gil_routing_overrides(gil)
    retrieval_scope = infer_gil_retrieval_scope(gil)
    effective_source_prefix = source_prefix or retrieval_scope.get("source_prefix")
    effective_package = package or retrieval_scope.get("package")
    if gil:
        logger.info(
            "GIL retrieval scope | source_prefix=%s | package=%s | source_candidates=%s | package_candidates=%s",
            effective_source_prefix or "*",
            effective_package or "*",
            retrieval_scope.get("source_prefix_candidates", []),
            retrieval_scope.get("package_candidates", []),
        )
    db       = SupabaseRestClient()
    provider = RouterAwareLLMProvider(
        model       = os.getenv("LLM_MODEL", "gemini-2.0-flash"),
        max_tokens  = int(os.getenv("MAX_TOKENS", str(routing_overrides.get("max_tokens", 4096)))),
        temperature = float(os.getenv("LLM_TEMPERATURE", str(routing_overrides.get("temperature", 0.3)))),
    )
    run_id = str(uuid.uuid4())
    logger.info("Summarization run_id=%s", run_id)

    # Log router health
    status = provider.provider_status()
    for name, info in status.items():
        tier = "FREE" if name in ("gemini", "huggingface", "ollama") else "PAID"
        logger.info(
            "Provider %-14s  configured=%-5s  healthy=%-5s  [%s]",
            name,
            info.get("configured", False),
            info.get("healthy",    False),
            tier,
        )

    gil_context = build_gil_context_block(
        gil,
        scope=f"source_prefix={source_prefix or '*'} package={package or '*'}",
    )

    try:
        fragments = db.fetch_fragments(
            source_prefix = effective_source_prefix,
            package       = effective_package,
            limit         = int(os.getenv("SUMMARIZE_MAX_FRAGMENTS", "5000")),
        )
    except Exception as exc:
        logger.error("Failed to fetch knowledge_fragments from Supabase: %s", exc)
        raise SystemExit(1) from exc

    fragments = rank_fragments_for_protocol(fragments, gil)
    if max_fragments is not None:
        fragments = fragments[:max_fragments]
    deadline = (
        datetime.now(timezone.utc) + timedelta(minutes=time_budget_minutes)
        if time_budget_minutes is not None
        else None
    )

    force = os.getenv("FORCE_RESUMMARY", "0") == "1"
    to_process = [
        f for f in fragments
        if force or not (f.get("summary") or "").strip()
    ]
    skipped = len(fragments) - len(to_process)

    logger.info(
        "Fragments: %d total | %d to summarize | %d already annotated (skipped)",
        len(fragments), len(to_process), skipped,
    )

    if dry_run:
        logger.info("[DRY RUN] Would summarize %d fragments. No writes.", len(to_process))
        for i, f in enumerate(to_process[:10], 1):
            logger.info(
                "  [%d/%d] id=%-36s  source=%-40s  package=%s",
                i, min(10, len(to_process)),
                f.get("id", "?"),
                f.get("source_file", "?"),
                f.get("package", "?"),
            )
        if len(to_process) > 10:
            logger.info("  ... and %d more", len(to_process) - 10)
        _write_manifest(
            run_id,
            effective_source_prefix,
            effective_package,
            len(fragments),
            skipped,
            0,
            0,
            gil,
            manifest_out=manifest_out,
            time_budget_minutes=time_budget_minutes,
            max_fragments=max_fragments,
            run_label=run_label,
        )
        return

    total     = len(to_process)
    succeeded = 0
    failed    = 0

    for batch_start in range(0, total, batch_size):
        if deadline and datetime.now(timezone.utc) >= deadline:
            logger.info("Time budget reached before batch %d", batch_start + 1)
            break
        batch = to_process[batch_start : batch_start + batch_size]
        logger.info(
            "Batch %d–%d / %d",
            batch_start + 1,
            min(batch_start + batch_size, total),
            total,
        )

        # Run summary + loom concurrently per fragment in batch
        async def _annotate(fragment: dict) -> tuple[dict, str, str] | None:
            fid     = fragment.get("id", "?")
            message = "\n\n".join(
                block
                for block in [
                    gil_context,
                    _build_fragment_message(fragment),
                ]
                if block
            )
            try:
                summary_text, loom_text = await asyncio.gather(
                    provider.complete(SUMMARY_SYSTEM_PROMPT, message),
                    provider.complete(LOOM_SYSTEM_PROMPT,    message),
                )
                return fragment, summary_text.strip(), loom_text.strip()
            except Exception as exc:
                logger.error("Fragment %s — LLM error: %s", fid, exc)
                return None

        results = await asyncio.gather(*[_annotate(f) for f in batch])

        for result in results:
            if deadline and datetime.now(timezone.utc) >= deadline:
                logger.info("Time budget reached during processing")
                break
            if result is None:
                failed += 1
                continue

            fragment, summary_text, loom_text = result
            fid = fragment.get("id", "?")

            if not summary_text:
                logger.warning("Fragment %s — empty summary returned", fid)
                failed += 1
                continue

            try:
                # Write to summaries table
                db.write_summary(
                    run_id      = run_id,
                    document_id = fid,
                    level       = "primary",
                    content     = summary_text,
                )
                # Write to loom_annotations table
                if loom_text:
                    db.write_loom_annotation(
                        run_id          = run_id,
                        annotation_type = "thread",
                        content         = loom_text,
                        related_ids     = [fid],
                    )
                # Patch denormalized fields back onto knowledge_fragments row
                db.patch_fragment_annotation(fid, summary_text, loom_text)

                logger.info("Annotated fragment %s ✓", fid)
                succeeded += 1

            except Exception as exc:
                logger.error("Fragment %s — Supabase write failed: %s", fid, exc)
                failed += 1

    logger.info(
        "Summarization complete — succeeded: %d | failed: %d | skipped: %d",
        succeeded, failed, skipped,
    )
    _write_manifest(
        run_id,
        effective_source_prefix,
        effective_package,
        len(fragments),
        skipped,
        succeeded,
        failed,
        gil,
        manifest_out=manifest_out,
        time_budget_minutes=time_budget_minutes,
        max_fragments=max_fragments,
        run_label=run_label,
    )


def _write_manifest(
    run_id: str,
    source_prefix: Optional[str],
    package: Optional[str],
    total: int,
    skipped: int,
    succeeded: int,
    failed: int,
    gil: GILProtocol | None,
    manifest_out: Optional[str] = None,
    time_budget_minutes: Optional[int] = None,
    max_fragments: Optional[int] = None,
    run_label: Optional[str] = None,
) -> None:
    manifest_path = pathlib.Path(manifest_out or os.getenv("MANIFEST_OUT", "./manifest_index.json"))
    manifest_path.write_text(json.dumps({
        "run_id":         run_id,
        "generated_at":   datetime.now(timezone.utc).isoformat(),
        "source_prefix":  source_prefix,
        "package":        package,
        "total_fetched":  total,
        "skipped":        skipped,
        "succeeded":      succeeded,
        "failed":         failed,
        "run_label":      run_label,
        "time_budget_minutes": time_budget_minutes,
        "max_fragments":  max_fragments,
        "gil_protocol": {
            "path": str(gil.path) if gil else None,
            "envelope_id": gil.envelope.get("id") if gil else None,
            "normalized": gil.normalized if gil else None,
            "routing": gil.routing if gil else None,
        },
    }, indent=2))
    logger.info("Manifest written → %s", manifest_path)


def load_run_spec(path: str | os.PathLike[str]) -> dict:
    spec_path = pathlib.Path(path).expanduser()
    data = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"Run spec must parse to a mapping: {spec_path}")
    return data


async def run_targeted_profiles(run_spec_path: str) -> None:
    spec = load_run_spec(run_spec_path)
    defaults = spec.get("defaults", {})
    runs = spec.get("runs", [])
    if not isinstance(runs, list) or not runs:
        raise ValueError(f"Run spec must contain a non-empty 'runs' list: {run_spec_path}")

    results_dir = pathlib.Path(spec.get("results_dir", "./targeted_summaries")).expanduser()
    results_dir.mkdir(parents=True, exist_ok=True)

    for index, run in enumerate(runs, 1):
        if not isinstance(run, dict):
            raise ValueError(f"Run spec entry {index} must be a mapping")
        merged = {**defaults, **run}
        label = str(merged.get("label") or f"run-{index}")
        manifest_out = str(merged.get("manifest_out") or (results_dir / f"{label}.json"))
        logger.info("Starting targeted run %s -> %s", label, manifest_out)
        await run_summarization(
            source_prefix=merged.get("source_prefix"),
            package=merged.get("package"),
            batch_size=int(merged.get("batch_size", 20)),
            dry_run=bool(merged.get("dry_run", False)),
            gil_protocol_path=merged.get("gil_protocol"),
            time_budget_minutes=merged.get("time_budget_minutes"),
            max_fragments=merged.get("max_fragments"),
            manifest_out=manifest_out,
            run_label=label,
        )


# ─────────────────────────────────────────────────────────────────────────────
# STEP 7: Filesystem pipeline bridge (--corpus-root, backward compat)
# ─────────────────────────────────────────────────────────────────────────────

def build_pipeline_config(corpus_root: str, pipeline_mod=None):
    """Build Config for the filesystem ManifestPipeline from env vars."""
    _pipeline_mod = pipeline_mod or _load_manifest_pipeline()
    PipelineConfig = getattr(_pipeline_mod, "Config", None) if _pipeline_mod else None
    if PipelineConfig is None:
        raise RuntimeError(
            "gestaltview_manifest_pipeline.py not found — "
            "cannot run filesystem pipeline."
        )
    import dataclasses
    cfg = PipelineConfig.from_env()
    cfg = dataclasses.replace(
        cfg,
        corpus_root  = pathlib.Path(corpus_root),
        llm_model    = os.getenv("LLM_MODEL", cfg.llm_model),
        manifest_out = pathlib.Path(os.getenv("MANIFEST_OUT", str(cfg.manifest_out))),
    )
    return cfg


async def run_filesystem_pipeline(corpus_root: str, gil_protocol_path: Optional[str] = None) -> None:
    _pipeline_mod = _load_manifest_pipeline()
    ManifestPipeline = getattr(_pipeline_mod, "ManifestPipeline", None) if _pipeline_mod else None
    if ManifestPipeline is None:
        logger.error(
            "gestaltview_manifest_pipeline.py not found — cannot run filesystem pipeline."
        )
        sys.exit(1)

    gil = load_gil_protocol(gil_protocol_path)
    cfg      = build_pipeline_config(corpus_root, pipeline_mod=_pipeline_mod)
    routing_overrides = build_gil_routing_overrides(gil)
    provider = RouterAwareLLMProvider(
        max_tokens  = int(routing_overrides.get("max_tokens", cfg.max_tokens)),
        temperature = float(routing_overrides.get("temperature", 0.3)),
    )
    pipeline = ManifestPipeline(cfg=cfg, llm_provider=provider, gil_protocol=gil)
    # ManifestPipeline.run() is synchronous — run in executor to avoid blocking
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, pipeline.run)
    logger.info("Filesystem pipeline complete → %s", cfg.manifest_out)


# ─────────────────────────────────────────────────────────────────────────────
# STEP 8: Entrypoint
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="GestaltView Manifest Synthesis Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Summarize all un-annotated fragments
  python synthesize_corpus.py

  # Scope to a source prefix
  python synthesize_corpus.py --source-prefix corpus_files

  # Scope to a package, dry run first
  python synthesize_corpus.py --package agent_trainer --dry-run

  # Force re-summarize everything in a package
  FORCE_RESUMMARY=1 python synthesize_corpus.py --package embodiment

  # Filesystem pipeline (legacy)
  python synthesize_corpus.py --corpus-root ./corpus
        """,
    )

    # Supabase-direct flags
    parser.add_argument(
        "--source-prefix",
        default=None,
        help="Filter knowledge_fragments by source_file prefix (e.g. corpus_files, agent_trainer)",
    )
    parser.add_argument(
        "--package",
        default=None,
        help="Filter knowledge_fragments by package tag",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=int(os.getenv("SUMMARIZE_BATCH_SIZE", "20")),
        help="Fragments per async LLM batch (default: 20)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Preview what would be summarized — no writes to Supabase",
    )

    # Filesystem pipeline flag (legacy)
    parser.add_argument(
        "--corpus-root",
        default=None,
        help="Run filesystem ManifestPipeline instead of Supabase-direct mode",
    )
    parser.add_argument(
        "--gil-protocol",
        default=None,
        help="Path to a GIL YAML protocol file or directory (defaults to GIL_PROTOCOL_PATH or gil/rough-draft-ratification.yaml)",
    )
    parser.add_argument(
        "--run-spec",
        default=None,
        help="Path to a YAML run spec defining one or more targeted summarization runs",
    )

    args = parser.parse_args()

    if args.run_spec:
        asyncio.run(run_targeted_profiles(args.run_spec))
    elif args.corpus_root:
        asyncio.run(run_filesystem_pipeline(args.corpus_root, args.gil_protocol))
    else:
        asyncio.run(run_summarization(
            source_prefix = args.source_prefix,
            package       = args.package,
            batch_size    = args.batch_size,
            dry_run       = args.dry_run,
            gil_protocol_path = args.gil_protocol,
        ))
