"""
GestaltView Manifest Index Layer – Production-Aligned Implementation
Author: Keith Soyka / GestaltView Platform
Updated: 2026-04-13 — Schema-aligned to live Supabase project (ltajayfzlaevchxngkrm)

Architecture Philosophy:
  Consciousness-serving: respects narrative continuity & semantic depth
  Resilient:            handles failures gracefully with exponential backoff
  Observable:           comprehensive logging for auditability
  Parallel:             async operations where beneficial
  Type-safe:            comprehensive type hints
  Testable:             dependency injection & clear contracts

Design Principles:
  ✓ Correctness over optimization
  ✓ Traceability over convenience
  ✓ Human-readable over clever
  ✓ Graceful degradation over brittle perfection

Live Schema Notes (ltajayfzlaevchxngkrm):
  - documents:          requires run_id, tenant_id, filename, content (NOT NULL)
  - summaries:          requires run_id, document_id, level, content
  - loom_annotations:   requires run_id, type, content
  - processing_runs:    tracks pipeline lifecycle with status, counts, timestamps
  - knowledge_fragments: 27,737 rows — primary ingestion target (use ingest_corpus.py)
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import pathlib
import random
import re
import sys
import time
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from enum import Enum
from functools import wraps
from typing import Any, Callable, Dict, Iterable, List, Optional

import psycopg2
from psycopg2.extras import Json, execute_values
from psycopg2.pool import ThreadedConnectionPool

try:
    from gil_protocol import (
        GILProtocol,
        build_gil_context_block,
        build_gil_routing_overrides,
        load_gil_protocol,
    )
except ModuleNotFoundError:
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    from gil_protocol import (  # type: ignore[no-redef]
        GILProtocol,
        build_gil_context_block,
        build_gil_routing_overrides,
        load_gil_protocol,
    )


# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class Config:
    """Immutable configuration ensuring deterministic behavior."""
    corpus_root: pathlib.Path
    manifest_out: pathlib.Path
    llm_model: str = "gpt-4o"
    max_tokens: int = 4096
    chunk_size: int = 8000
    chunk_overlap: int = 500
    db_dsn: str = "postgresql://localhost/gestaltview"
    db_pool_min: int = 2
    db_pool_max: int = 10
    retry_max_attempts: int = 3
    retry_base_delay: float = 1.0
    retry_max_delay: float = 60.0
    log_level: str = "INFO"
    parallel_workers: int = 4
    supported_extensions: tuple = (".txt", ".md", ".pdf")
    tenant_id: str = "00000000-0000-0000-0001-000000000001"
    created_by: Optional[str] = None

    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables."""
        return cls(
            corpus_root=pathlib.Path(os.getenv("CORPUS_ROOT", "./corpus")),
            manifest_out=pathlib.Path(os.getenv("MANIFEST_OUT", "./manifest_index.json")),
            llm_model=os.getenv("LLM_MODEL", "gpt-4o"),
            max_tokens=int(os.getenv("MAX_TOKENS", "4096")),
            db_dsn=os.getenv("DATABASE_URL", "postgresql://localhost/gestaltview"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            tenant_id=os.getenv("TENANT_ID", "00000000-0000-0000-0001-000000000001"),
            created_by=os.getenv("CREATED_BY") or None,
        )

    def validate(self) -> None:
        """Fail fast on missing required config."""
        if not self.tenant_id:
            raise ValueError(
                "TENANT_ID is required. Set via env var TENANT_ID or Config(tenant_id=...)."
            )
        if not self.corpus_root.exists():
            raise ValueError(f"CORPUS_ROOT does not exist: {self.corpus_root}")


# ─────────────────────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────────────────────

class LogContext(Enum):
    """Structured log contexts for observability."""
    INGEST    = "ingest"
    SUMMARIZE = "summarize"
    COMPOUND  = "compound"
    SNOWBALL  = "snowball"
    LOOM      = "loom"
    PERSIST   = "persist"
    LLM       = "llm"
    ERROR     = "error"
    PIPELINE  = "pipeline"


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure structured logging."""
    logger = logging.getLogger("gestaltview.manifest")
    logger.setLevel(getattr(logging, level.upper()))
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(getattr(logging, level.upper()))
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(name)s | %(levelname)s | %(context)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


logger = setup_logging()


def log_context(context: LogContext):
    """Decorator to tag functions with a log context."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator


# ─────────────────────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def stable_hash(text: str) -> str:
    """Generate deterministic SHA-256 hash."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def now() -> datetime:
    """UTC timestamp for auditability."""
    return datetime.now(timezone.utc)


def chunk_text(text: str, chunk_size: int, overlap: int = 0) -> List[str]:
    """Split large text into overlapping chunks preserving narrative flow."""
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def exponential_backoff(
    attempt: int,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: bool = True,
) -> float:
    """Calculate exponential backoff delay with optional jitter."""
    delay = min(base_delay * (2 ** attempt), max_delay)
    if jitter:
        delay *= 0.5 + random.random() * 0.5
    return delay


def retry_with_backoff(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: tuple = (Exception,),
):
    """Decorator: retry with exponential backoff on specified exceptions."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        delay = exponential_backoff(attempt, base_delay, max_delay)
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_attempts} failed for "
                            f"{func.__name__}: {e}. Retrying in {delay:.2f}s...",
                            extra={"context": LogContext.ERROR.value},
                        )
                        time.sleep(delay)
                    else:
                        logger.error(
                            f"All {max_attempts} attempts failed for {func.__name__}: {e}",
                            extra={"context": LogContext.ERROR.value},
                        )
            raise last_exception
        return wrapper
    return decorator


# ─────────────────────────────────────────────────────────────────────────────
# DATA MODELS
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class DocumentText:
    """Ingested document with full production-schema metadata."""
    document_id: str
    path: str
    filename: str
    content: str
    hash: str
    created_at: datetime
    run_id: Optional[str] = None
    tenant_id: Optional[str] = None
    chunk_index: int = 0
    total_chunks: int = 1
    file_size_bytes: int = 0
    mime_type: Optional[str] = None
    extracted_metadata: Dict[str, Any] = field(default_factory=dict)
    provenance: Dict[str, Any] = field(default_factory=dict)
    source_created_at: Optional[datetime] = None
    temporal_period: Optional[str] = None
    timeline_folder: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["created_at"] = self.created_at.isoformat()
        if self.source_created_at:
            d["source_created_at"] = self.source_created_at.isoformat()
        return d


@dataclass
class Summary:
    """AI-generated summary at various hierarchy levels."""
    summary_id: str
    document_id: Optional[str]
    level: str          # 'primary' | 'compounded' | 'corpus'
    content: str
    model: str
    created_at: datetime
    run_id: Optional[str] = None
    token_count: Optional[int] = None
    processing_time_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["created_at"] = self.created_at.isoformat()
        return d


@dataclass
class LoomAnnotation:
    """Loom analysis capturing gaps, threads, and emergent patterns."""
    annotation_id: str
    type: str           # 'gap' | 'thread' | 'weak_connection' | 'unresolved' | 'emergent' | 'global_analysis'
    related_ids: List[str]
    content: str
    created_at: datetime
    run_id: Optional[str] = None
    confidence_score: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["created_at"] = self.created_at.isoformat()
        return d


@dataclass
class ProcessingMetrics:
    """Telemetry for observability — maps directly to processing_runs table."""
    documents_processed: int = 0
    chunks_processed: int = 0
    summaries_generated: int = 0
    annotations_created: int = 0
    total_tokens: int = 0
    start_time: datetime = field(default_factory=now)
    end_time: Optional[datetime] = None
    errors: List[str] = field(default_factory=list)

    def finalize(self):
        self.end_time = now()

    def duration_seconds(self) -> float:
        end = self.end_time or now()
        return (end - self.start_time).total_seconds()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "documents_processed": self.documents_processed,
            "chunks_processed": self.chunks_processed,
            "summaries_generated": self.summaries_generated,
            "annotations_created": self.annotations_created,
            "total_tokens": self.total_tokens,
            "duration_seconds": self.duration_seconds(),
            "errors_count": len(self.errors),
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
        }


# ─────────────────────────────────────────────────────────────────────────────
# INGESTOR
# ─────────────────────────────────────────────────────────────────────────────

class Ingestor:
    """
    Discovers and normalizes corpus documents.
    Preserves provenance, mime type, file timestamps, and timeline metadata.
    """

    _MIME_MAP = {
        ".md":  "text/markdown",
        ".txt": "text/plain",
        ".pdf": "application/pdf",
    }

    def __init__(self, root: pathlib.Path, cfg: Config):
        self.root = root
        self.cfg = cfg
        self.metrics = ProcessingMetrics()

    @log_context(LogContext.INGEST)
    def ingest(self) -> List[DocumentText]:
        """Recursively discover and ingest documents, chunking oversized files."""
        logger.info(f"Starting ingestion from {self.root}", extra={"context": "ingest"})
        docs: List[DocumentText] = []

        for path in sorted(self.root.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix.lower() not in self.cfg.supported_extensions:
                logger.debug(f"Skipping unsupported: {path}", extra={"context": "ingest"})
                continue

            try:
                text = self._read_file(path)
                stat = path.stat()
                file_size = stat.st_size
                h = stable_hash(text)
                chunks = chunk_text(text, self.cfg.chunk_size, self.cfg.chunk_overlap)
                total_chunks = len(chunks)

                for idx, chunk in enumerate(chunks):
                    doc = DocumentText(
                        document_id=str(uuid.uuid4()),
                        path=str(path),
                        filename=path.name,
                        content=chunk,
                        hash=h if total_chunks == 1 else stable_hash(chunk),
                        created_at=now(),
                        chunk_index=idx,
                        total_chunks=total_chunks,
                        file_size_bytes=file_size,
                        mime_type=self._MIME_MAP.get(path.suffix.lower()),
                        extracted_metadata={
                            "extension": path.suffix.lower(),
                            "ingestor": "gestaltview_manifest_pipeline",
                            "version": "2026-04-13",
                        },
                        provenance={
                            "source_path": str(path),
                            "ingested_at": now().isoformat(),
                            "corpus_root": str(self.cfg.corpus_root),
                        },
                        source_created_at=datetime.fromtimestamp(
                            stat.st_mtime, tz=timezone.utc
                        ),
                        timeline_folder=self._infer_timeline_folder(path),
                        temporal_period=self._infer_temporal_period(path),
                    )
                    docs.append(doc)
                    self.metrics.chunks_processed += 1

                self.metrics.documents_processed += 1
                logger.info(
                    f"Ingested: {path.name} ({total_chunks} chunk(s), {file_size} bytes)",
                    extra={"context": "ingest"},
                )

            except Exception as e:
                error_msg = f"Failed to ingest {path}: {e}"
                logger.error(error_msg, extra={"context": "ingest"})
                self.metrics.errors.append(error_msg)

        logger.info(
            f"Ingestion complete: {self.metrics.documents_processed} docs, "
            f"{self.metrics.chunks_processed} chunks",
            extra={"context": "ingest"},
        )
        return docs

    def _read_file(self, path: pathlib.Path) -> str:
        try:
            return path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            logger.warning(
                f"UTF-8 decode failed for {path}, trying latin-1",
                extra={"context": "ingest"},
            )
            return path.read_text(encoding="latin-1")

    def _infer_timeline_folder(self, path: pathlib.Path) -> Optional[str]:
        """Use the first directory component under corpus_root as timeline_folder."""
        try:
            rel = path.relative_to(self.root)
            parts = list(rel.parts)
            return parts[0] if len(parts) > 1 else None
        except ValueError:
            return None

    def _infer_temporal_period(self, path: pathlib.Path) -> Optional[str]:
        """Infer a temporal period from folder names containing year-like tokens."""
        for part in path.parts:
            if re.search(r"(19|20)\d{2}", part):
                return part
        return None


# ─────────────────────────────────────────────────────────────────────────────
# LLM PROVIDER
# ─────────────────────────────────────────────────────────────────────────────

class LLMProvider:
    """
    Abstract LLM interface. Override generate() with your backend.
    Provided concrete subclass: OpenAIProvider.
    """

    def __init__(self, model: str, max_tokens: int, cfg: Config):
        self.model = model
        self.max_tokens = max_tokens
        self.cfg = cfg

    @retry_with_backoff(max_attempts=3, base_delay=2.0, exceptions=(Exception,))
    @log_context(LogContext.LLM)
    def generate(self, prompt: str, temperature: float = 0.7) -> tuple:
        """
        Generate completion from prompt. Returns (content: str, token_count: int).
        Override this in a subclass — do not call the base directly.
        """
        raise NotImplementedError(
            "LLM backend not implemented. "
            "Use OpenAIProvider or subclass LLMProvider and override generate()."
        )

    def estimate_tokens(self, text: str) -> int:
        return len(text) // 4


class OpenAIProvider(LLMProvider):
    """Production OpenAI provider. Requires OPENAI_API_KEY in environment."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            import openai
            self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        except ImportError:
            logger.warning(
                "openai package not installed. Run: pip install openai",
                extra={"context": "llm"},
            )
            self.client = None

    @retry_with_backoff(max_attempts=3, base_delay=2.0, exceptions=(Exception,))
    def generate(self, prompt: str, temperature: float = 0.7) -> tuple:
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=self.max_tokens,
        )
        content = response.choices[0].message.content
        tokens = response.usage.total_tokens
        return content, tokens


# ─────────────────────────────────────────────────────────────────────────────
# INCHWORM SUMMARIZER (primary + compound)
# ─────────────────────────────────────────────────────────────────────────────

class InchwormSummarizer:
    """
    Progressive summarization maintaining narrative continuity.
    Each summary preserves what came before while integrating the new.
    """

    def __init__(self, llm: LLMProvider, cfg: Config, protocol_context: str = ""):
        self.llm = llm
        self.cfg = cfg
        self.metrics = ProcessingMetrics()
        self.protocol_context = protocol_context

    @log_context(LogContext.SUMMARIZE)
    def primary_summary(self, doc: DocumentText) -> Summary:
        """Generate primary conceptual summary from a raw document chunk."""
        start_time = time.time()
        protocol_prefix = f"{self.protocol_context}\n\n" if self.protocol_context else ""
        prompt = f"""You are analyzing a document from the GestaltView corpus.
Treat the GIL protocol context below as the primary interpretive frame if present.
{protocol_prefix}

Read the following document and produce a high-level conceptual summary that captures:
- Core Thesis: What is the central argument or purpose?
- Key Concepts: What ideas, frameworks, or methodologies are introduced?
- Authorial Intent: What is the author trying to achieve or communicate?
- Open Questions: What remains unresolved or invites further exploration?

Maintain the author's voice and perspective. Preserve nuance over brevity.

DOCUMENT:
{doc.content}

SUMMARY:"""

        try:
            content, tokens = self.llm.generate(prompt, temperature=0.5)
            processing_time = int((time.time() - start_time) * 1000)
            summary = Summary(
                summary_id=str(uuid.uuid4()),
                document_id=doc.document_id,
                level="primary",
                content=content,
                model=self.llm.model,
                created_at=now(),
                token_count=tokens,
                processing_time_ms=processing_time,
            )
            self.metrics.summaries_generated += 1
            self.metrics.total_tokens += tokens
            logger.info(
                f"Primary summary: doc {doc.document_id[:8]} ({tokens} tokens, {processing_time}ms)",
                extra={"context": "summarize"},
            )
            return summary
        except Exception as e:
            self.metrics.errors.append(str(e))
            raise

    @log_context(LogContext.COMPOUND)
    def compound(self, summary: Summary, accumulator: str) -> Summary:
        """Compound a new summary with existing narrative context."""
        start_time = time.time()
        prompt = f"""You are compounding summaries in the GestaltView corpus.
Treat the GIL protocol context below as the primary interpretive frame if present.

Given the PRIOR SEMANTIC CONTEXT and a NEW SUMMARY, produce a COMPOUNDED SUMMARY that:
- Preserves narrative continuity from prior context
- Integrates new insights and concepts
- Identifies thematic resonances or divergences
- Maintains temporal flow (what came before → what comes now)

Think of this as weaving a new thread into an existing tapestry.

PRIOR CONTEXT:
{accumulator if accumulator else "(none — this is the first document)"}

NEW SUMMARY:
{summary.content}

COMPOUNDED SUMMARY:"""

        try:
            content, tokens = self.llm.generate(prompt, temperature=0.6)
            processing_time = int((time.time() - start_time) * 1000)
            compounded = Summary(
                summary_id=str(uuid.uuid4()),
                document_id=summary.document_id,
                level="compounded",
                content=content,
                model=self.llm.model,
                created_at=now(),
                token_count=tokens,
                processing_time_ms=processing_time,
            )
            self.metrics.summaries_generated += 1
            self.metrics.total_tokens += tokens
            logger.info(
                f"Compounded summary ({tokens} tokens, {processing_time}ms)",
                extra={"context": "compound"},
            )
            return compounded
        except Exception as e:
            self.metrics.errors.append(str(e))
            raise


# ─────────────────────────────────────────────────────────────────────────────
# SNOWBALL SUMMARIZER (corpus synthesis)
# ─────────────────────────────────────────────────────────────────────────────

class SnowballSummarizer:
    """
    Corpus-level synthesis identifying emergent themes and concept lineages.
    Meaning emerges from patterns across time — the corpus as living knowledge graph.
    """

    def __init__(self, llm: LLMProvider, cfg: Config, protocol_context: str = ""):
        self.llm = llm
        self.cfg = cfg
        self.metrics = ProcessingMetrics()
        self.protocol_context = protocol_context

    @log_context(LogContext.SNOWBALL)
    def corpus_summary(self, compounded: Iterable[Summary]) -> Summary:
        """Generate corpus-level synthesis from compounded summaries."""
        start_time = time.time()
        joined = "\n\n---\n\n".join(s.content for s in compounded)
        protocol_prefix = f"{self.protocol_context}\n\n" if self.protocol_context else ""
        prompt = f"""You are synthesizing the complete GestaltView corpus.
Treat the GIL protocol context below as the primary interpretive frame if present.
{protocol_prefix}

From the following COMPOUNDED SUMMARIES, produce a CORPUS-LEVEL SYNTHESIS that identifies:
- Emergent Themes: What patterns emerge across documents?
- Concept Lineages: How do ideas evolve or compound over time?
- Knowledge Clusters: What conceptual territories does the corpus cover?
- Narrative Arc: What is the through-line or meta-narrative?
- Consciousness Signature: What does this corpus reveal about its creator's way of thinking?

This is not a summary of summaries — it's a meta-analysis revealing what emerges
when all pieces are viewed as a unified whole.

COMPOUNDED SUMMARIES:
{joined}

CORPUS SYNTHESIS:"""

        try:
            content, tokens = self.llm.generate(prompt, temperature=0.7)
            processing_time = int((time.time() - start_time) * 1000)
            synthesis = Summary(
                summary_id=str(uuid.uuid4()),
                document_id=None,
                level="corpus",
                content=content,
                model=self.llm.model,
                created_at=now(),
                token_count=tokens,
                processing_time_ms=processing_time,
            )
            self.metrics.summaries_generated += 1
            self.metrics.total_tokens += tokens
            logger.info(
                f"Corpus synthesis complete ({tokens} tokens, {processing_time}ms)",
                extra={"context": "snowball"},
            )
            return synthesis
        except Exception as e:
            self.metrics.errors.append(str(e))
            raise


# ─────────────────────────────────────────────────────────────────────────────
# LOOM ANALYZER
# ─────────────────────────────────────────────────────────────────────────────

class LoomAnalyzer:
    """
    Detects gaps, threads, and emergent patterns in the knowledge tapestry.
    The Loom reveals what's missing — the unspoken, the unresolved.
    """

    def __init__(self, llm: LLMProvider, cfg: Config, protocol_context: str = ""):
        self.llm = llm
        self.cfg = cfg
        self.metrics = ProcessingMetrics()
        self.protocol_context = protocol_context

    @log_context(LogContext.LOOM)
    def analyze(self, summaries: Iterable[Summary]) -> List[LoomAnnotation]:
        """Perform Loom analysis detecting gaps and emergent patterns."""
        start_time = time.time()
        joined = "\n\n---\n\n".join(s.content for s in summaries)
        protocol_prefix = f"{self.protocol_context}\n\n" if self.protocol_context else ""
        prompt = f"""You are performing LOOM ANALYSIS on the GestaltView corpus.
Treat the GIL protocol context below as the primary interpretive frame if present.
{protocol_prefix}

The Loom reveals:
- Gaps: Concepts introduced but never fully explored
- Threads: Recurring motifs with subtle variations or contradictions
- Weak Connections: Important ideas that are adjacent but not explicitly linked
- Unresolved Questions: Open loops that invite completion
- Emergent Patterns: What wants to exist but hasn't been articulated yet

Analyze the following summaries and produce structured findings in JSON format:
[
  {{
    "type": "gap|thread|weak_connection|unresolved|emergent",
    "title": "Brief title",
    "description": "Detailed finding",
    "related_concepts": ["concept1", "concept2"],
    "confidence": 0.0-1.0
  }}
]

Be specific. Point to concrete examples. Trust your intuition about what matters.

SUMMARIES:
{joined}

LOOM FINDINGS:"""

        try:
            content, tokens = self.llm.generate(prompt, temperature=0.8)
            processing_time = int((time.time() - start_time) * 1000)
            annotations = self._parse_loom_output(content)
            self.metrics.annotations_created += len(annotations)
            self.metrics.total_tokens += tokens
            logger.info(
                f"Loom analysis: {len(annotations)} annotations ({tokens} tokens, {processing_time}ms)",
                extra={"context": "loom"},
            )
            return annotations
        except Exception as e:
            error_msg = f"Loom analysis failed: {e}"
            logger.error(error_msg, extra={"context": "loom"})
            self.metrics.errors.append(error_msg)
            return [
                LoomAnnotation(
                    annotation_id=str(uuid.uuid4()),
                    type="global_analysis",
                    related_ids=[],
                    content=f"Loom analysis error: {e}",
                    created_at=now(),
                )
            ]

    def _parse_loom_output(self, content: str) -> List[LoomAnnotation]:
        try:
            json_match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", content, re.DOTALL)
            raw = json_match.group(1) if json_match else content
            findings = json.loads(raw)
            return [
                LoomAnnotation(
                    annotation_id=str(uuid.uuid4()),
                    type=f.get("type", "finding"),
                    related_ids=f.get("related_concepts", []),
                    content=json.dumps(
                        {"title": f.get("title", ""), "description": f.get("description", "")},
                        indent=2,
                    ),
                    created_at=now(),
                    confidence_score=f.get("confidence"),
                )
                for f in findings
            ]
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(
                f"Could not parse structured Loom output: {e}",
                extra={"context": "loom"},
            )
            return [
                LoomAnnotation(
                    annotation_id=str(uuid.uuid4()),
                    type="global_analysis",
                    related_ids=[],
                    content=content,
                    created_at=now(),
                )
            ]


# ─────────────────────────────────────────────────────────────────────────────
# MANIFEST STORE (production-aligned persistence)
# ─────────────────────────────────────────────────────────────────────────────

class ManifestStore:
    """
    PostgreSQL persistence aligned to live Supabase schema (ltajayfzlaevchxngkrm).
    Uses connection pooling. All writes are tied to a single run_id.

    Live table notes:
      documents:        run_id, tenant_id, filename, content are NOT NULL
      summaries:        run_id, document_id, level, content are NOT NULL
      loom_annotations: run_id, type, content are NOT NULL
      processing_runs:  status defaults to 'running'; updated to 'complete' or 'failed'
    """

    def __init__(self, dsn: str, cfg: Config):
        self.dsn = dsn
        self.cfg = cfg
        self.pool = ThreadedConnectionPool(cfg.db_pool_min, cfg.db_pool_max, dsn)

    # ── Run lifecycle ────────────────────────────────────────────────────────

    @log_context(LogContext.PERSIST)
    def start_run(self, run_id: str) -> None:
        """Register pipeline run in processing_runs at start."""
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO processing_runs (
                        run_id, tenant_id, status, model, corpus_root,
                        documents_count, chunks_count, created_by
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        run_id,
                        self.cfg.tenant_id,
                        "running",
                        self.cfg.llm_model,
                        str(self.cfg.corpus_root),
                        0,
                        0,
                        self.cfg.created_by,
                    ),
                )
        finally:
            self.pool.putconn(conn)

    @log_context(LogContext.PERSIST)
    def finish_run(
        self,
        run_id: str,
        status: str,
        documents_count: int,
        chunks_count: int,
    ) -> None:
        """Update processing_runs on completion or failure."""
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE processing_runs
                    SET status = %s,
                        documents_count = %s,
                        chunks_count = %s,
                        updated_at = now()
                    WHERE run_id = %s
                    """,
                    (status, documents_count, chunks_count, run_id),
                )
        finally:
            self.pool.putconn(conn)

    # ── Documents ────────────────────────────────────────────────────────────

    @log_context(LogContext.PERSIST)
    def save_document(self, doc: DocumentText) -> None:
        """Save a single document. Skips on duplicate document_id."""
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO documents (
                        document_id, run_id, tenant_id, path, filename, hash,
                        chunk_index, total_chunks, file_size_bytes, content,
                        mime_type, extracted_metadata, provenance, created_by,
                        created_at, source_created_at, temporal_period, timeline_folder
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (document_id) DO NOTHING
                    """,
                    (
                        doc.document_id,
                        doc.run_id,
                        doc.tenant_id,
                        doc.path,
                        doc.filename,
                        doc.hash,
                        doc.chunk_index,
                        doc.total_chunks,
                        doc.file_size_bytes,
                        doc.content,
                        doc.mime_type,
                        Json(doc.extracted_metadata or {}),
                        Json(doc.provenance or {}),
                        self.cfg.created_by,
                        doc.created_at,
                        doc.source_created_at,
                        doc.temporal_period,
                        doc.timeline_folder,
                    ),
                )
        finally:
            self.pool.putconn(conn)

    @log_context(LogContext.PERSIST)
    def batch_save_documents(self, docs: List[DocumentText]) -> None:
        """Batch insert documents for efficiency."""
        if not docs:
            return
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                values = [
                    (
                        d.document_id,
                        d.run_id,
                        d.tenant_id,
                        d.path,
                        d.filename,
                        d.hash,
                        d.chunk_index,
                        d.total_chunks,
                        d.file_size_bytes,
                        d.content,
                        d.mime_type,
                        Json(d.extracted_metadata or {}),
                        Json(d.provenance or {}),
                        self.cfg.created_by,
                        d.created_at,
                        d.source_created_at,
                        d.temporal_period,
                        d.timeline_folder,
                    )
                    for d in docs
                ]
                execute_values(
                    cur,
                    """
                    INSERT INTO documents (
                        document_id, run_id, tenant_id, path, filename, hash,
                        chunk_index, total_chunks, file_size_bytes, content,
                        mime_type, extracted_metadata, provenance, created_by,
                        created_at, source_created_at, temporal_period, timeline_folder
                    ) VALUES %s
                    ON CONFLICT (document_id) DO NOTHING
                    """,
                    values,
                )
            logger.info(
                f"Batch saved {len(docs)} documents",
                extra={"context": "persist"},
            )
        finally:
            self.pool.putconn(conn)

    # ── Summaries ────────────────────────────────────────────────────────────

    @log_context(LogContext.PERSIST)
    def save_summary(self, summary: Summary) -> None:
        """Save a summary. Only writes columns present in the live schema."""
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO summaries (
                        summary_id, run_id, document_id, level, content, created_at
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        summary.summary_id,
                        summary.run_id,
                        summary.document_id,
                        summary.level,
                        summary.content,
                        summary.created_at,
                    ),
                )
        finally:
            self.pool.putconn(conn)

    # ── Loom Annotations ─────────────────────────────────────────────────────

    @log_context(LogContext.PERSIST)
    def save_loom(self, ann: LoomAnnotation) -> None:
        """Save a Loom annotation. Only writes columns present in the live schema."""
        conn = self.pool.getconn()
        try:
            with conn, conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO loom_annotations (
                        annotation_id, run_id, type, content, created_at
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        ann.annotation_id,
                        ann.run_id,
                        ann.type,
                        ann.content,
                        ann.created_at,
                    ),
                )
        finally:
            self.pool.putconn(conn)

    def close(self):
        """Close all pooled connections."""
        self.pool.closeall()


# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE ORCHESTRATOR
# ─────────────────────────────────────────────────────────────────────────────

class ManifestPipeline:
    """
    Main orchestrator: ingest → summarize → compound → synthesize → analyze → persist.
    Generates a single run_id at startup and threads it through every record.
    """

    def __init__(
        self,
        cfg: Config,
        llm_provider: Optional[LLMProvider] = None,
        gil_protocol: GILProtocol | None = None,
    ):
        cfg.validate()
        self.cfg = cfg
        self.run_id = str(uuid.uuid4())
        self.gil_protocol = gil_protocol or load_gil_protocol()
        self.gil_context = build_gil_context_block(
            self.gil_protocol,
            scope=f"corpus_root={cfg.corpus_root}",
        )
        routing_overrides = build_gil_routing_overrides(self.gil_protocol)
        self.ingestor = Ingestor(cfg.corpus_root, cfg)
        self.llm = llm_provider or OpenAIProvider(
            routing_overrides.get("llm_model", cfg.llm_model),
            int(routing_overrides.get("max_tokens", cfg.max_tokens)),
            cfg,
        )
        self.inchworm = InchwormSummarizer(self.llm, cfg, protocol_context=self.gil_context)
        self.snowball = SnowballSummarizer(self.llm, cfg, protocol_context=self.gil_context)
        self.loom = LoomAnalyzer(self.llm, cfg, protocol_context=self.gil_context)
        self.store = ManifestStore(cfg.db_dsn, cfg)
        self.metrics = ProcessingMetrics()
        logger.info(
            f"Pipeline initialized | run_id={self.run_id} | tenant={cfg.tenant_id}",
            extra={"context": "pipeline"},
        )

    def run(self) -> ProcessingMetrics:
        """Execute the full pipeline. Returns metrics for observability."""
        logger.info("=" * 70, extra={"context": "pipeline"})
        logger.info("GestaltView Manifest Pipeline Starting", extra={"context": "pipeline"})
        logger.info("=" * 70, extra={"context": "pipeline"})

        self.store.start_run(self.run_id)

        try:
            # Step 1: Ingest
            logger.info("Step 1: Ingesting documents...", extra={"context": "pipeline"})
            docs = self.ingestor.ingest()
            for d in docs:
                d.run_id = self.run_id
                d.tenant_id = self.cfg.tenant_id
            self.metrics.documents_processed = self.ingestor.metrics.documents_processed
            self.metrics.chunks_processed = self.ingestor.metrics.chunks_processed

            if not docs:
                logger.warning("No documents found.", extra={"context": "pipeline"})
                self.store.finish_run(self.run_id, "complete", 0, 0)
                return self.metrics

            # Batch save all documents
            self.store.batch_save_documents(docs)

            # Step 2: Primary summaries + compounding
            logger.info(
                "Step 2: Generating primary summaries and compounding...",
                extra={"context": "pipeline"},
            )
            accumulator = ""
            compounded: List[Summary] = []

            for idx, doc in enumerate(docs):
                logger.info(
                    f"  [{idx + 1}/{len(docs)}] {doc.filename}",
                    extra={"context": "pipeline"},
                )
                primary = self.inchworm.primary_summary(doc)
                primary.run_id = self.run_id
                self.store.save_summary(primary)

                compounded_summary = self.inchworm.compound(primary, accumulator)
                compounded_summary.run_id = self.run_id
                self.store.save_summary(compounded_summary)

                accumulator = compounded_summary.content
                compounded.append(compounded_summary)

            self.metrics.summaries_generated += self.inchworm.metrics.summaries_generated
            self.metrics.total_tokens += self.inchworm.metrics.total_tokens

            # Step 3: Corpus synthesis
            logger.info("Step 3: Synthesizing corpus...", extra={"context": "pipeline"})
            corpus = self.snowball.corpus_summary(compounded)
            corpus.run_id = self.run_id
            self.store.save_summary(corpus)
            self.metrics.summaries_generated += self.snowball.metrics.summaries_generated
            self.metrics.total_tokens += self.snowball.metrics.total_tokens

            # Step 4: Loom analysis
            logger.info("Step 4: Performing Loom analysis...", extra={"context": "pipeline"})
            loom_annotations = self.loom.analyze([corpus] + compounded)
            for ann in loom_annotations:
                ann.run_id = self.run_id
                self.store.save_loom(ann)
            self.metrics.annotations_created += self.loom.metrics.annotations_created
            self.metrics.total_tokens += self.loom.metrics.total_tokens

            # Step 5: Export manifest JSON
            logger.info("Step 5: Exporting manifest...", extra={"context": "pipeline"})
            self._export_manifest(docs, compounded, corpus, loom_annotations)

            self.metrics.finalize()
            self.store.finish_run(
                self.run_id,
                "complete",
                self.metrics.documents_processed,
                self.metrics.chunks_processed,
            )

            logger.info("=" * 70, extra={"context": "pipeline"})
            logger.info("Pipeline Complete!", extra={"context": "pipeline"})
            logger.info(
                f"Metrics: {json.dumps(self.metrics.to_dict(), indent=2)}",
                extra={"context": "pipeline"},
            )
            logger.info("=" * 70, extra={"context": "pipeline"})

            return self.metrics

        except Exception as e:
            self.metrics.errors.append(str(e))
            self.metrics.finalize()
            self.store.finish_run(
                self.run_id,
                "failed",
                self.metrics.documents_processed,
                self.metrics.chunks_processed,
            )
            logger.error(f"Pipeline failed: {e}", extra={"context": "pipeline"}, exc_info=True)
            raise
        finally:
            self.store.close()

    def _export_manifest(
        self,
        docs: List[DocumentText],
        compounded: List[Summary],
        corpus: Summary,
        loom: List[LoomAnnotation],
    ) -> None:
        manifest = {
            "metadata": {
                "generated_at": now().isoformat(),
                "run_id": self.run_id,
                "tenant_id": self.cfg.tenant_id,
                "model": self.cfg.llm_model,
                "corpus_root": str(self.cfg.corpus_root),
                "document_count": len(docs),
                "chunk_count": self.metrics.chunks_processed,
                "gil_protocol": {
                    "path": str(self.gil_protocol.path) if self.gil_protocol else None,
                    "envelope_id": self.gil_protocol.envelope.get("id") if self.gil_protocol else None,
                    "normalized": self.gil_protocol.normalized if self.gil_protocol else None,
                    "routing": self.gil_protocol.routing if self.gil_protocol else None,
                },
            },
            "metrics": self.metrics.to_dict(),
            "documents": [d.to_dict() for d in docs],
            "compounded_summaries": [s.to_dict() for s in compounded],
            "corpus_summary": corpus.to_dict(),
            "loom_annotations": [a.to_dict() for a in loom],
        }
        self.cfg.manifest_out.write_text(json.dumps(manifest, indent=2))
        logger.info(
            f"Manifest exported to {self.cfg.manifest_out}",
            extra={"context": "pipeline"},
        )


# ─────────────────────────────────────────────────────────────────────────────
# CLI ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def main():
    import argparse
    import dataclasses

    parser = argparse.ArgumentParser(
        description="GestaltView Manifest Index Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with defaults (reads from env vars)
  python gestaltview_manifest_pipeline.py

  # Explicit corpus directory
  python gestaltview_manifest_pipeline.py --corpus /path/to/corpus

  # Full env-var usage
  DATABASE_URL=postgresql://... TENANT_ID=... OPENAI_API_KEY=sk-... \
      python gestaltview_manifest_pipeline.py
        """,
    )
    parser.add_argument("--corpus", type=pathlib.Path, help="Path to corpus root")
    parser.add_argument("--output", type=pathlib.Path, help="Path for manifest JSON output")
    parser.add_argument("--log-level", choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    parser.add_argument(
        "--gil-protocol",
        default=None,
        help="Path to a GIL YAML protocol file or directory (defaults to GIL_PROTOCOL_PATH or gil/rough-draft-ratification.yaml)",
    )
    args = parser.parse_args()

    cfg = Config.from_env()
    if args.corpus:
        cfg = dataclasses.replace(cfg, corpus_root=args.corpus)
    if args.output:
        cfg = dataclasses.replace(cfg, manifest_out=args.output)
    if args.log_level:
        cfg = dataclasses.replace(cfg, log_level=args.log_level)
        global logger
        logger = setup_logging(args.log_level)

    pipeline = ManifestPipeline(cfg, gil_protocol=load_gil_protocol(args.gil_protocol))
    try:
        metrics = pipeline.run()
        print("\n" + "=" * 70)
        print("GESTALTVIEW MANIFEST PIPELINE COMPLETE")
        print("=" * 70)
        print(f"  Run ID:              {pipeline.run_id}")
        print(f"  Documents processed: {metrics.documents_processed}")
        print(f"  Chunks processed:    {metrics.chunks_processed}")
        print(f"  Summaries generated: {metrics.summaries_generated}")
        print(f"  Annotations created: {metrics.annotations_created}")
        print(f"  Total tokens:        {metrics.total_tokens:,}")
        print(f"  Duration:            {metrics.duration_seconds():.2f}s")
        if metrics.errors:
            print(f"  Errors:              {len(metrics.errors)}")
        print("=" * 70)
        sys.exit(0 if not metrics.errors else 1)
    except KeyboardInterrupt:
        print("\nPipeline interrupted by user.")
        sys.exit(130)
    except Exception as e:
        print(f"\nPipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
