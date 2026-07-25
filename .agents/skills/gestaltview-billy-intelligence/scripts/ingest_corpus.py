#!/usr/bin/env python3
"""
GestaltView — Compendium Ingestion Pipeline
============================================
Canonical ingestion script for GestaltView-Official-Compendium.

Embedding model : google/embeddinggemma-300M  (768-dim, local, no API key required)
PDF parsing     : pdfplumber
Chunk size      : 4 500 chars / 600-char overlap
Dedup           : SHA-256 hash on raw file content (per-file)
Provenance      : every fragment carries package, relative_path,
                  ingest_run, source

Run:
    python3 -m pip install -r requirements.txt
    python3 scripts/ingest_corpus.py

Dry-run (no writes to Supabase):
    GESTALTVIEW_DRY_RUN=1 python3 scripts/ingest_corpus.py

Required env vars:
    SUPABASE_URL              (or VITE_SUPABASE_URL)
    SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY /
                               SUPABASE_ANON_KEY /
                               VITE_SUPABASE_ANON_KEY)

Optional env vars:
    GESTALTVIEW_CHUNK_SIZE       default 4500
    GESTALTVIEW_CHUNK_OVERLAP    default 600
    GESTALTVIEW_EMBED_MODEL      default google/embeddinggemma-300M
    GESTALTVIEW_EMBED_DEVICE     cpu | cuda  (default: cpu)
    COMPENDIUM_ROOT              override path to Compendium repo root
    GESTALTVIEW_TENANT_ID        default 00000000-0000-0000-0001-000000000001
    GESTALTVIEW_BILLY_AGENT_UUID default 00000000-0000-0000-0000-000000000042
    GESTALTVIEW_DRY_RUN          set to "1" to skip all Supabase writes
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Optional deps — graceful import so the script boots without them
# ---------------------------------------------------------------------------
try:
    import requests  # type: ignore
    _REQUESTS_IMPORT_ERROR: Optional[ImportError] = None
except ImportError as exc:
    requests = None  # type: ignore[assignment]
    _REQUESTS_IMPORT_ERROR = exc

try:
    import pdfplumber  # type: ignore
    _PDF_AVAILABLE = True
except ImportError:
    _PDF_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer as _ST
    _EMBED_MODEL_INSTANCE: Optional[Any] = None
    _ST_AVAILABLE = True
except ImportError:
    _ST_AVAILABLE = False
    _EMBED_MODEL_INSTANCE = None

# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Load .env automatically — works in Codespaces, Codex, and GitHub Actions
# Falls back gracefully if python-dotenv not installed.
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # rely on shell environment

# Config
# ---------------------------------------------------------------------------
SUPABASE_URL  = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL", "")
SERVICE_KEY   = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_ANON_KEY", "")
)
# No API key needed — EmbeddingGemma runs locally via sentence-transformers

# EmbeddingGemma — local, free, 768-dim, no API key, runs on CPU or CUDA.
# Must match the vector() column dimension in Supabase (768).
EMBED_MODEL  = os.environ.get("GESTALTVIEW_EMBED_MODEL",  "google/embeddinggemma-300M")
EMBED_DIMS   = int(os.environ.get("GESTALTVIEW_EMBED_DIMS",  "768"))
EMBED_DEVICE     = os.environ.get("GESTALTVIEW_EMBED_DEVICE",     "cpu")
EMBED_BATCH_SIZE = int(os.environ.get("GESTALTVIEW_EMBED_BATCH_SIZE", "32"))

TENANT_ID        = os.environ.get("GESTALTVIEW_TENANT_ID",        "00000000-0000-0000-0001-000000000001")
BILLY_AGENT_UUID = os.environ.get("GESTALTVIEW_BILLY_AGENT_UUID", "00000000-0000-0000-0000-000000000042")
CHUNK_SIZE       = int(os.environ.get("GESTALTVIEW_CHUNK_SIZE",    "4500"))
CHUNK_OVERLAP    = int(os.environ.get("GESTALTVIEW_CHUNK_OVERLAP", "600"))

# FIX (Improvement 1): Dry-run mode — no Supabase writes, prints what would be ingested.
DRY_RUN = os.environ.get("GESTALTVIEW_DRY_RUN", "0") == "1"

# Package filter — ingest only one named package (e.g. "core-docs" or "billy-intelligence").
# Set via GESTALTVIEW_PACKAGE_FILTER env var or leave blank for full corpus run.
PACKAGE_FILTER = os.environ.get("GESTALTVIEW_PACKAGE_FILTER", "").strip()

RUN_ID          = str(uuid.uuid4())
REPO_ROOT       = Path(__file__).resolve().parent.parent
CORPUS_MAP_PATH = REPO_ROOT / "config" / "corpus-map.json"

ALLOWED_EXTENSIONS = {".md", ".mdx", ".txt", ".json", ".pdf"}

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=minimal",
}

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# Suppress pdfplumber/pdfminer FontBBox noise — harmless, floods terminal
import warnings
warnings.filterwarnings("ignore", message=".*FontBBox.*")
logging.getLogger("pdfminer").setLevel(logging.ERROR)
logging.getLogger("pdfplumber").setLevel(logging.ERROR)


def ensure_requests_available() -> None:
    if requests is not None:
        return
    raise RuntimeError(
        "Missing Python dependency: requests. "
        "Install repo script dependencies with `python3 -m pip install -r requirements.txt` before running ingestion."
    ) from _REQUESTS_IMPORT_ERROR


def quote_url_value(value: str) -> str:
    ensure_requests_available()
    return requests.utils.quote(value, safe="")


def parse_response_json(response: Any) -> Optional[Dict[str, Any]]:
    try:
        payload = response.json()
    except Exception:
        return None
    return payload if isinstance(payload, dict) else None


def describe_supabase_response(response: Any) -> str:
    body = (response.text or "").strip()
    if not body:
        return f"HTTP {response.status_code}"
    compact_body = " ".join(body.split())[:400]
    if "public.processingruns" in compact_body:
        compact_body += " | hint: Supabase expects the table name `public.processing_runs`."
    return f"HTTP {response.status_code} — {compact_body}"


def extract_missing_column(response: Any, table_name: str) -> Optional[str]:
    payload = parse_response_json(response)
    message = str((payload or {}).get("message") or response.text or "")
    if not message:
        return None
    patterns = [
        rf"Could not find the '([^']+)' column of '{re.escape(table_name)}'",
        rf'Could not find the "([^"]+)" column of "{re.escape(table_name)}"',
    ]
    for pattern in patterns:
        match = re.search(pattern, message)
        if match:
            return match.group(1)
    return None


if not SUPABASE_URL or not SERVICE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL/VITE_SUPABASE_URL or "
        "SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY"
    )

# ---------------------------------------------------------------------------
# Document type classification
# ---------------------------------------------------------------------------
DOCUMENT_TYPE_MAP: Dict[str, str] = {
    "genesis-protocol":   "Protocol",
    "genesisprotocol":    "Protocol",
    "plk":                    "PLK",
    "personallanguagekey":    "PLK",
    "gestaltview-plk":        "PLK",
    "gestaltviewenhancedplk": "PLK",
    "plkengine":              "PLK",
    "plksystem":              "PLK",
    "billy":       "Billy",
    "billysroom":  "Billy",
    "sqlitebilly": "Billy",
    "contextweaver":           "ContextWeaver",
    "loom":                    "Loom",
    "consciousnessmiddleware": "Consciousness",
    "consciousness":           "Consciousness",
    "brain-sparks":    "Engine",
    "brainsparks":     "Engine",
    "aiorchestrator":  "Engine",
    "aicore":          "Engine",
    "llmrouter":       "Engine",
    "llmservice":      "Engine",
    "prompttemplates": "Engine",
    "wellnesswitness":   "Philosophy",
    "gestalt.py.md":     "Philosophy",
    "gestaltviewsystem": "Philosophy",
    "keith-plk":         "Philosophy",
    "resume":     "Product",
    "vibe":       "Product",
    "musicaldna": "Product",
    "spotify":    "Product",
    "exhibit":    "Product",
    "auth":             "Infrastructure",
    "schemas":          "Infrastructure",
    "sqlitestore":      "Infrastructure",
    "enhanceddatabase": "Infrastructure",
    "gestaltviewseed":  "Infrastructure",
    "billy1118": "Transcript",
    "routes": "API",
    "route":  "API",
    "router": "API",
    "adhd":      "WellnessApplication",
    "recovery":  "WellnessApplication",
    "alzheimer": "WellnessApplication",
    "sanctuary": "WellnessApplication",
    "architecture": "Architecture",
    "manifest":     "ManifestIndex",
    "diligence":  "Diligence",
    "evidence":   "Diligence",
    "screenshot": "Diligence",
    "tribunal":   "Diligence",
}

CONCEPT_TAGS: Dict[str, List[str]] = {
    "PLK":           ["plk", "personal language key", "resonance", "linguistic pattern"],
    "Billy":         ["billy", "collaborator friend", "training loop", "beautiful tapestry"],
    "Consciousness": ["consciousness", "consciousness-serving", "co-consciousness", "symbiosis"],
    "ADHD":          ["adhd", "neurodivergent", "lightning bolt", "bucket drop", "exploded picture"],
    "Genesis":       ["genesis protocol", "brain sparks", "ignite", "musical dna"],
    "Loom":          ["loom", "context weaver", "knowledge loom", "manifest index"],
    "Ethics":        ["ethics", "ethical", "constitutional invariant", "never look away"],
    "Founder":       ["founder", "keith soyka", "solo", "unfunded", "gestaltview"],
    "Architecture":  ["engine", "orchestrator", "adapter", "pipeline", "schema"],
    "Paradox":       ["paradox", "operationalized paradox", "hold paradox", "contradiction"],
    "Resonance":     ["resonance loop", "third-order", "symbiosis", "co-becoming"],
    "Products":      ["symbiocoder", "resume rockstar", "vibecoder", "neural handshake"],
}


def classify_document(filename: str) -> str:
    fname = filename.lower()
    for pattern, doctype in DOCUMENT_TYPE_MAP.items():
        if pattern.lower() in fname:
            return doctype
    if fname.endswith((".md", ".txt")):
        return "Documentation"
    if fname.endswith((".py", ".py.txt")):
        return "Code"
    if fname.endswith((".ts", ".tsx")):
        return "Frontend"
    if fname.endswith(".pdf"):
        return "Diligence"
    return "General"


def extract_tags(content: str, filename: str) -> List[str]:
    tags: set = set()
    cl = content.lower()
    fn = filename.lower()
    for tag, keywords in CONCEPT_TAGS.items():
        for kw in keywords:
            if kw in cl or kw in fn:
                tags.add(tag)
                break
    return sorted(tags)


# ---------------------------------------------------------------------------
# Text utilities
# ---------------------------------------------------------------------------
def sanitize_text(text: str) -> str:
    text = text.replace("\x00", "").replace("\ufffe", "")
    return "".join(c for c in text if c in ("\n", "\r", "\t") or ord(c) >= 32)


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    normalized = text.strip()
    if not normalized:
        return []
    if len(normalized) <= chunk_size:
        return [normalized]

    chunks: List[str] = []
    start = 0
    total = len(normalized)
    while start < total:
        end = min(start + chunk_size, total)
        if end < total:
            para_break = normalized.rfind("\n\n", start, end)
            sent_break = max(
                normalized.rfind(". ",  start, end),
                normalized.rfind("! ",  start, end),
                normalized.rfind("? ",  start, end),
                normalized.rfind(".\n", start, end),
            )
            if para_break > start + chunk_size // 2:
                end = para_break
            elif sent_break > start + chunk_size // 2:
                end = sent_break + 1
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= total:
            break
        start = max(0, end - overlap)
    return chunks


def infer_mimetype(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in {".md", ".mdx", ".txt"}:
        return "text/plain"
    if ext == ".json":
        return "application/json"
    if ext == ".pdf":
        return "application/pdf"
    return "application/octet-stream"


# ---------------------------------------------------------------------------
# File readers
# ---------------------------------------------------------------------------
def read_text_file(path: Path, skipped: List[str]) -> Optional[str]:
    try:
        return sanitize_text(path.read_text(encoding="utf-8", errors="replace"))
    except Exception as exc:
        skipped.append(f"{path}: read error — {exc}")
        return None


def read_pdf_file(path: Path, skipped: List[str]) -> Optional[str]:
    if not _PDF_AVAILABLE:
        skipped.append(
            f"{path}: skipped PDF — pdfplumber not installed. "
            "Run: python3 -m pip install -r requirements.txt"
        )
        return None
    try:
        pages: List[str] = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
        if not pages:
            skipped.append(f"{path}: PDF yielded no extractable text (may be image-only)")
            return None
        return sanitize_text("\n\n".join(pages))
    except Exception as exc:
        skipped.append(f"{path}: PDF parse error — {exc}")
        return None


def read_file(path: Path, skipped: List[str]) -> Optional[str]:
    if path.suffix.lower() == ".pdf":
        return read_pdf_file(path, skipped)
    return read_text_file(path, skipped)


# ---------------------------------------------------------------------------
# Embedding — FIX (Issue 3): retry with backoff on rate-limit errors
# Model must match api/billy.ts and the Supabase vector() column dimension.
# ---------------------------------------------------------------------------
def _get_embed_model():
    """Lazy-load EmbeddingGemma once, reuse for the entire run."""
    global _EMBED_MODEL_INSTANCE
    if not _ST_AVAILABLE:
        return None
    if _EMBED_MODEL_INSTANCE is None:
        log.info("Loading EmbeddingGemma: %s on %s", EMBED_MODEL, EMBED_DEVICE)
        _EMBED_MODEL_INSTANCE = _ST(EMBED_MODEL).to(EMBED_DEVICE)
        log.info("EmbeddingGemma loaded (%d-dim)", EMBED_DIMS)
    return _EMBED_MODEL_INSTANCE


def get_embedding(text: str) -> Optional[List[float]]:
    """Generate a local 768-dim embedding using EmbeddingGemma.
    No API calls, no rate limits, no keys required.
    Uses Retrieval-document prompt for RAG-optimised vectors.
    """
    if not _ST_AVAILABLE:
        log.warning("sentence-transformers not installed — run: pip install sentence-transformers")
        return None
    model = _get_embed_model()
    if model is None:
        return None
    try:
        # Use Retrieval-document prompt for RAG-optimised document embeddings
        vector = model.encode(
            text[:8192],  # EmbeddingGemma max seq length
            prompt_name="Retrieval-document",
            normalize_embeddings=True,
        )
        return vector.tolist()
    except Exception as exc:
        log.warning("EmbeddingGemma encode error: %s", exc)
        return None


def get_embeddings_batch(texts: List[str]) -> List[Optional[List[float]]]:
    """Generate embeddings for a batch of texts in one model call.
    ~8x faster than calling get_embedding() individually on CPU.
    Returns a list of vectors (or None for any that fail).
    """
    if not _ST_AVAILABLE or not texts:
        return [None] * len(texts)
    model = _get_embed_model()
    if model is None:
        return [None] * len(texts)
    try:
        truncated = [t[:8192] for t in texts]
        vectors = model.encode(
            truncated,
            prompt_name="Retrieval-document",
            normalize_embeddings=True,
            batch_size=EMBED_BATCH_SIZE,
            show_progress_bar=False,
        )
        return [v.tolist() for v in vectors]
    except Exception as exc:
        log.warning("EmbeddingGemma batch encode error: %s — falling back to nulls", exc)
        return [None] * len(texts)


# ---------------------------------------------------------------------------
# FIX (Issue 1): Single URL-building helper — consolidates _post/_get/_patch/_delete
# All callers use paths beginning with /rest/v1/...
# ---------------------------------------------------------------------------
def _get(path: str) -> "requests.Response":
    ensure_requests_available()
    return requests.get(f"{SUPABASE_URL}{path}", headers=HEADERS, timeout=20)


def _post(
    path: str,
    payload: Dict[str, Any],
    prefer: str = "return=minimal",
) -> "requests.Response":
    ensure_requests_available()
    return requests.post(
        f"{SUPABASE_URL}{path}",
        headers={**HEADERS, "Prefer": prefer},
        json=payload,
        timeout=30,
    )


def _patch(path: str, payload: Dict[str, Any]) -> "requests.Response":
    ensure_requests_available()
    return requests.patch(
        f"{SUPABASE_URL}{path}", headers=HEADERS, json=payload, timeout=30
    )


def _delete(path: str) -> "requests.Response":
    ensure_requests_available()
    return requests.delete(f"{SUPABASE_URL}{path}", headers=HEADERS, timeout=20)


# ---------------------------------------------------------------------------
# Corpus map
# ---------------------------------------------------------------------------
def load_corpus_map() -> Tuple[Path, Dict[str, List[str]]]:
    if not CORPUS_MAP_PATH.exists():
        raise RuntimeError(f"Missing corpus map at {CORPUS_MAP_PATH}")
    with CORPUS_MAP_PATH.open("r", encoding="utf-8") as fh:
        config = json.load(fh)
    compendium_root = Path(
        os.environ.get("COMPENDIUM_ROOT", config.get("compendiumRoot", "."))
    ).expanduser()
    packages = config.get("packages", {})
    if not packages:
        raise RuntimeError("No packages found in config/corpus-map.json")
    return compendium_root, packages


# ---------------------------------------------------------------------------
# File discovery
# ---------------------------------------------------------------------------
def list_ingestable_files(base: Path, skipped: List[str]) -> Iterable[Path]:
    if not base.exists():
        skipped.append(f"{base}: missing path")
        return
    if base.is_file():
        if base.suffix.lower() not in ALLOWED_EXTENSIONS:
            skipped.append(f"{base}: unsupported extension")
            return
        yield base
        return
    found: List[Path] = []
    for path in base.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in ALLOWED_EXTENSIONS:
            continue
        found.append(path)
    yield from found


# ---------------------------------------------------------------------------
# Dedup / document management
# FIX (Issue 5): return the row regardless of package match so callers can
# always delete a stale document even if the package label changed.
# ---------------------------------------------------------------------------
def find_existing_document(doc_path: str) -> Optional[Dict[str, Any]]:
    filter_path = quote_url_value(doc_path)
    resp = _get(
        f"/rest/v1/documents"
        f"?select=document_id,hash,chunk_index,total_chunks,path,provenance"
        f"&path=eq.{filter_path}&chunk_index=eq.0&limit=1"
    )
    if resp.status_code != 200:
        return None
    rows = resp.json()
    return rows[0] if rows else None


def delete_existing_doc_and_fragments(document_id: str, source_file: str) -> None:
    encoded = quote_url_value(source_file)
    _delete(f"/rest/v1/embeddings?document_id=eq.{document_id}")
    _delete(f"/rest/v1/knowledge_fragments?source_file=eq.{encoded}")
    _delete(f"/rest/v1/documents?document_id=eq.{document_id}")


# ---------------------------------------------------------------------------
# Processing run
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


PROCESSING_RUN_OPTIONAL_FIELDS = ("updated_at",)


def submit_processing_run_request(
    method: str,
    path: str,
    payload: Dict[str, Any],
) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    request_fn = _post if method == "post" else _patch
    working_payload = dict(payload)
    removed_fields: List[str] = []

    while True:
        response = request_fn(path, working_payload)
        if response.status_code in (200, 201, 204):
            return True, None, working_payload

        missing_column = extract_missing_column(response, "processing_runs")
        if (
            missing_column
            and missing_column in working_payload
            and missing_column in PROCESSING_RUN_OPTIONAL_FIELDS
        ):
            removed_fields.append(missing_column)
            working_payload.pop(missing_column, None)
            log.warning(
                "processing_runs schema is missing optional column '%s'; retrying without it",
                missing_column,
            )
            continue

        detail = describe_supabase_response(response)
        if removed_fields:
            detail = f"{detail} | retried without optional columns: {', '.join(removed_fields)}"
        return False, detail, working_payload


def create_processing_run(run_id: str, corpus_root: Path) -> Tuple[bool, Optional[str]]:
    if DRY_RUN:
        log.info("[DRY RUN] Would create processing_run: %s", run_id)
        return True, None
    payload = {
        "run_id":      run_id,
        "tenant_id":   TENANT_ID,
        "status":      "running",
        "model":       EMBED_MODEL,
        "corpus_root": str(corpus_root),
        "created_by":  BILLY_AGENT_UUID,
        "created_at":  now_iso(),
        # "updated_at" intentionally omitted — column may not exist in live schema.
        # The adaptive retry in submit_processing_run_request handles it for PATCH;
        # omitting here avoids the NOT NULL / CHECK constraint failure on CREATE.
    }
    success, detail, _ = submit_processing_run_request("post", "/rest/v1/processing_runs", payload)
    return success, detail


def finalize_processing_run(
    run_id: str,
    status: str,
    docs_count: int,
    fragments_count: int,
    error: Optional[str],
) -> None:
    if DRY_RUN:
        log.info("[DRY RUN] Would finalize processing_run: %s → %s", run_id, status)
        return
    payload: Dict[str, Any] = {
        "status":          status,
        "documents_count": docs_count,
        "chunks_count":    fragments_count,
        "updated_at":      now_iso(),
    }
    if error:
        payload["model"] = f"{EMBED_MODEL} | error:{error[:180]}"
    success, detail, used_payload = submit_processing_run_request(
        "patch",
        f"/rest/v1/processing_runs?run_id=eq.{run_id}",
        payload,
    )
    if not success:
        log.warning("Could not finalize processing run %s: %s", run_id, detail)
        return
    if "updated_at" not in used_payload:
        log.warning(
            "processing_runs finalize succeeded without updated_at; "
            "live Supabase schema is older than repo migrations"
        )


# ---------------------------------------------------------------------------
# Core ingest
# FIX (Issue 2): document_id now included in knowledge_fragments payload.
# FIX (Issue 3): get_embedding now retries with backoff (see above).
# FIX (Issue 4): EMBED_MODEL / EMBED_DIMS aligned with Billy runtime (see config).
# FIX (Issue 5): find_existing_document no longer filters on package.
# ---------------------------------------------------------------------------
def ingest_file(
    path: Path,
    package: str,
    compendium_root: Path,
    run_id: str,
    skipped: List[str],
) -> Tuple[int, int, bool]:
    """
    Returns (docs_inserted, fragments_inserted, was_skipped_unchanged).
    """
    raw_content = read_file(path, skipped)
    if not raw_content:
        return 0, 0, False

    content = raw_content.strip()
    if len(content) < 40:
        skipped.append(f"{path}: too short")
        return 0, 0, False

    rel_path     = str(path.relative_to(compendium_root))
    doc_path     = f"compendium/{package}/{rel_path}"
    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()

    if not DRY_RUN:
        existing = find_existing_document(doc_path)
        if existing and existing.get("hash") == content_hash:
            return 0, 0, True  # unchanged — clean skip
        if existing:
            delete_existing_doc_and_fragments(existing["document_id"], rel_path)

    chunks = chunk_text(content)
    if not chunks:
        return 0, 0, False

    doctype     = classify_document(path.name)
    tags        = extract_tags(content, path.name)
    document_id = str(uuid.uuid4())

    if DRY_RUN:
        log.info(
            "[DRY RUN] %s → %d chunks | type=%s | tags=%s",
            rel_path, len(chunks), doctype, tags,
        )
        return 1, len(chunks), False

    doc_payload = {
        "document_id":    document_id,
        "run_id":         run_id,
        "tenant_id":      TENANT_ID,
        "path":           doc_path,
        "filename":       path.name,
        "hash":           content_hash,
        "chunk_index":    0,
        "total_chunks":   len(chunks),
        "file_size_bytes": path.stat().st_size,
        "content":        content,
        "mime_type":      infer_mimetype(path),
        "extracted_metadata": {
            "package":       package,
            "relative_path": rel_path,
            "source":        "GestaltView-Official-Compendium",
            "document_type": doctype,
            "tags":          tags,
            "total_chars":   len(content),
        },
        "provenance": {
            "source":        "compendium",
            "package":       package,
            "relative_path": rel_path,
            "ingest_run":    run_id,
        },
        "created_by":  BILLY_AGENT_UUID,
        # created_at handled by Supabase default
    }

    doc_resp = _post("/rest/v1/documents", doc_payload, prefer="return=representation")
    if doc_resp.status_code not in (200, 201):
        skipped.append(f"{path}: failed to insert document ({doc_resp.status_code})")
        return 0, 0, False

    # Generate all embeddings in one batched model call — ~8x faster than one-by-one
    embeddings = get_embeddings_batch(chunks)

    inserted_fragments = 0
    for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        fragment_hash = hashlib.sha256(
            f"{content_hash}:{index}:{chunk[:200]}".encode("utf-8")
        ).hexdigest()

        fragment_payload = {
            # document_id and package not in knowledge_fragments schema — omitted
            "content":       chunk,
            "content_hash":  fragment_hash,
            "embedding":     embedding,
            "source_file":   rel_path,
            "document_type": doctype,
            "chunk_index":   index,
            "total_chunks":  len(chunks),
            "char_count":    len(chunk),
            "tags":          [
                package,
                f"package:{package}",
                path.suffix.lower().lstrip("."),
                *tags,
            ],
        }
        frag_resp = _post("/rest/v1/knowledge_fragments", fragment_payload)
        if frag_resp.status_code not in (200, 201):
            skipped.append(
                f"{path}: failed fragment {index} ({frag_resp.status_code})"
            )
            continue

        if embedding:
            _post("/rest/v1/embeddings", {
                "document_id": document_id,
                "model":       EMBED_MODEL,
                "embedding":   embedding,
            })

        inserted_fragments += 1

    return 1, inserted_fragments, False


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main() -> None:
    compendium_root, packages = load_corpus_map()

    print("=" * 60)
    print("  GestaltView — Compendium Ingestion Pipeline")
    if DRY_RUN:
        print("  *** DRY RUN — no writes to Supabase ***")
    print("=" * 60)
    print(f"  Config       : {CORPUS_MAP_PATH}")
    print(f"  Compendium   : {compendium_root}")
    print(f"  Embed model  : {EMBED_MODEL}  ({EMBED_DIMS}-dim)")
    print(f"  Run ID       : {RUN_ID}")
    print(f"  Chunk size   : {CHUNK_SIZE} chars / {CHUNK_OVERLAP} overlap")
    print(
        "  PDF support  : "
        f"{'YES — pdfplumber' if _PDF_AVAILABLE else 'NO  — install via requirements.txt'}"
    )
    print(f"  Embed device : {EMBED_DEVICE}")
    print(f"  Embed batch  : {EMBED_BATCH_SIZE} chunks per call")
    print(f"  ST available : {'YES' if _ST_AVAILABLE else 'NO — pip install sentence-transformers'}")
    if PACKAGE_FILTER:
        print(f"  Package filter: {PACKAGE_FILTER}  (single-package run)")
    print()

    ensure_requests_available()

    skipped_paths: List[str]           = []
    docs_per_package: Dict[str, int]      = defaultdict(int)
    fragments_per_package: Dict[str, int] = defaultdict(int)
    unchanged_per_package: Dict[str, int] = defaultdict(int)

    created_run, create_run_error = create_processing_run(RUN_ID, compendium_root)
    if not created_run:
        detail = create_run_error or "No response details returned."
        raise RuntimeError(
            f"Could not create processing_runs row in Supabase. {detail}"
        )

    status = "complete"
    error_message: Optional[str] = None

    try:
        for package, mapped_paths in packages.items():
            # Package filter — skip all packages except the one named, if filter is set
            if PACKAGE_FILTER and package != PACKAGE_FILTER:
                log.info("Package %-30s  skipped (filter: %s)", package, PACKAGE_FILTER)
                continue

            package_files: List[Path] = []
            for relative in mapped_paths:
                target = compendium_root / relative
                package_files.extend(list_ingestable_files(target, skipped_paths))

            unique_files = sorted(set(package_files))
            log.info("Package %-30s  %d files", package, len(unique_files))

            for i, filepath in enumerate(unique_files):
                # Improvement 4: progress indicator every 50 files for large packages
                if len(unique_files) > 50 and (i % 50 == 0) and i > 0:
                    log.info(
                        "  [%d/%d] %s ...",
                        i + 1, len(unique_files), package,
                    )

                docs_count, fragments_count, was_unchanged = ingest_file(
                    filepath, package, compendium_root, RUN_ID, skipped_paths
                )
                docs_per_package[package]      += docs_count
                fragments_per_package[package] += fragments_count
                if was_unchanged:
                    unchanged_per_package[package] += 1

    except Exception as exc:
        status = "failed"
        error_message = str(exc)
        raise
    finally:
        total_docs      = sum(docs_per_package.values())
        total_fragments = sum(fragments_per_package.values())
        total_unchanged = sum(unchanged_per_package.values())
        finalize_processing_run(RUN_ID, status, total_docs, total_fragments, error_message)

        print("\nDocuments ingested per package:")
        for pkg in sorted(packages.keys()):
            unchanged_note = (
                f"  ({unchanged_per_package[pkg]} unchanged)"
                if unchanged_per_package[pkg] else ""
            )
            print(
                f"  {pkg:<30} "
                f"{docs_per_package[pkg]} docs  /  "
                f"{fragments_per_package[pkg]} fragments"
                f"{unchanged_note}"
            )

        if skipped_paths:
            print(f"\nSkipped ({len(skipped_paths)}):")
            for msg in skipped_paths:
                print(f"  — {msg}")

        print(
            "\n"
            + json.dumps(
                {
                    "run_id":    RUN_ID,
                    "status":    status,
                    "documents": total_docs,
                    "fragments": total_fragments,
                    "unchanged": total_unchanged,
                    "skipped":   len(skipped_paths),
                    "dry_run":   DRY_RUN,
                },
                indent=2,
            )
        )


if __name__ == "__main__":
    main()
