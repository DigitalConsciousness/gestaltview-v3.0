#!/usr/bin/env python3
"""
GestaltView Corpus Ingestion Pipeline
scripts/ingest_corpus.py

Discovers files across the repository, extracts text, generates vector embeddings,
and synchronizes data with the GestaltView Supabase instance.

Environment Variables:
  SUPABASE_URL                  - Target Supabase project URL (required)
  SUPABASE_SERVICE_ROLE_KEY     - Admin key for database writes (required)
  OPENAI_API_KEY                - Required only if --embedding-provider openai
  GESTALTVIEW_EMBED_MODEL       - HuggingFace model ID (default: google/embedding-gecko-300M)
  GESTALTVIEW_CHUNK_SIZE        - Character limit per fragment (default: 4500)
  GESTALTVIEW_DRY_RUN           - If "1", skips database writes (default: 0)
  GESTALTVIEW_PACKAGE_FILTER    - Limit run to a specific package slug (optional)

Usage:
  # Dry run — validate payloads without writing to Supabase
  GESTALTVIEW_DRY_RUN=1 python scripts/ingest_corpus.py

  # Filter to a specific package
  GESTALTVIEW_PACKAGE_FILTER=core-docs python scripts/ingest_corpus.py

  # Full production run
  python scripts/ingest_corpus.py
"""

import os
import sys
import json
import hashlib
import uuid
import re
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

# ---------------------------------------------------------------------------
# Optional heavy deps — imported lazily so dry-runs don't require GPU deps
# ---------------------------------------------------------------------------
try:
    import pdfplumber
    PDF_BACKEND = "pdfplumber"
except ImportError:
    pdfplumber = None
    PDF_BACKEND = None

try:
    from pypdf import PdfReader as PyPdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("gv_ingest")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

EMBED_MODEL = os.environ.get("GESTALTVIEW_EMBED_MODEL", "google/embedding-gecko-300M")
CHUNK_SIZE = int(os.environ.get("GESTALTVIEW_CHUNK_SIZE", "4500"))
CHUNK_OVERLAP = 200  # character overlap between adjacent chunks
DRY_RUN = os.environ.get("GESTALTVIEW_DRY_RUN", "0") == "1"
PACKAGE_FILTER = os.environ.get("GESTALTVIEW_PACKAGE_FILTER", "").strip()

REPO_ROOT = Path(__file__).resolve().parent.parent
CORPUS_MAP_PATH = REPO_ROOT / "config" / "corpus-map.json"

# ---------------------------------------------------------------------------
# Document type classification heuristics
# ---------------------------------------------------------------------------
DOCUMENT_TYPE_MAP: dict[str, str] = {
    "genesis-protocol": "Protocol",
    "plk": "PLK",
    "billy": "Billy",
    "context-weaver": "ContextWeaver",
    "contextweaver": "ContextWeaver",
    "loom": "Loom",
    "architecture": "Architecture",
    "diligence": "Diligence",
    "tribunal": "Tribunal",
    "manifesto": "Manifesto",
    "origin": "Origin",
    "playbook": "Playbook",
    "workflow": "Workflow",
    "schema": "Schema",
    "readme": "README",
    "skill": "Skill",
    "transcript": "Transcript",
    "timeline": "Timeline",
    "exhibit": "Exhibit",
    "operator": "Operator",
    "agent": "Agent",
    "memory": "Memory",
}

def classify_document_type(path: str) -> str:
    """Return a document type label based on filename/path heuristics."""
    lower = path.lower()
    for keyword, label in DOCUMENT_TYPE_MAP.items():
        if keyword in lower:
            return label
    return "General"

def derive_tags(path: str, content: str) -> list[str]:
    """Derive a small set of tags from path and content signals."""
    tags: list[str] = []
    lower_path = path.lower()
    tag_keywords = [
        "billy", "plk", "loom", "tribunal", "csi", "exhibit",
        "memory", "agent", "training", "schema", "corpus",
        "philosophy", "architecture", "workflow", "skill",
        "transcript", "timeline", "operator", "gestaltview",
    ]
    for kw in tag_keywords:
        if kw in lower_path or kw in content[:500].lower():
            tags.append(kw)
    return list(dict.fromkeys(tags))  # dedupe, preserve order

# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------
def extract_text_from_pdf(path: Path) -> str:
    """Extract text from a PDF using pdfplumber with pypdf fallback."""
    text = ""
    if pdfplumber is not None:
        try:
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            if text.strip():
                return text
        except Exception as exc:
            log.warning("pdfplumber failed on %s: %s — trying pypdf", path.name, exc)

    if PYPDF_AVAILABLE:
        try:
            reader = PyPdfReader(str(path))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as exc:
            log.warning("pypdf failed on %s: %s", path.name, exc)

    log.error("No PDF extraction backend available for %s", path.name)
    return ""

def extract_text(path: Path) -> str:
    """Extract text from .md, .txt, .json, .html, or .pdf files."""
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(path)
    if suffix in {".md", ".txt", ".py", ".ts", ".tsx", ".js", ".jsx",
                  ".json", ".yaml", ".yml", ".sql", ".html", ".csv"}:
        for encoding in ("utf-8", "latin-1"):
            try:
                return path.read_text(encoding=encoding)
            except UnicodeDecodeError:
                continue
        log.warning("Could not decode %s with any tried encoding", path.name)
        return ""
    return ""

# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    Split text into overlapping character-based chunks.
    Tries to break on paragraph or sentence boundaries near the chunk limit.
    """
    if not text.strip():
        return []

    chunks: list[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        if end < text_len:
            # Try to break on double newline (paragraph)
            break_pos = text.rfind("\n\n", start, end)
            if break_pos == -1 or break_pos <= start:
                # Fall back to single newline
                break_pos = text.rfind("\n", start, end)
            if break_pos == -1 or break_pos <= start:
                # Fall back to sentence boundary
                for sep in (". ", "! ", "? "):
                    bp = text.rfind(sep, start, end)
                    if bp > start:
                        break_pos = bp + 1
                        break
            if break_pos > start:
                end = break_pos

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < text_len else text_len

    return chunks

# ---------------------------------------------------------------------------
# Embeddings
# ---------------------------------------------------------------------------
_embed_model = None

def _load_local_embed_model():
    global _embed_model
    if _embed_model is not None:
        return _embed_model
    try:
        from sentence_transformers import SentenceTransformer
        log.info("Loading local embedding model: %s", EMBED_MODEL)
        _embed_model = SentenceTransformer(EMBED_MODEL)
        return _embed_model
    except ImportError:
        log.warning("sentence-transformers not installed — embeddings will be None")
        return None
    except Exception as exc:
        log.warning("Could not load embedding model %s: %s", EMBED_MODEL, exc)
        return None

def generate_embedding(text: str, provider: str = "local") -> Optional[list[float]]:
    """Generate a vector embedding for a text chunk."""
    if provider == "none" or DRY_RUN:
        return None

    if provider == "openai":
        if not OPENAI_API_KEY:
            log.warning("OPENAI_API_KEY not set — skipping embedding")
            return None
        try:
            resp = requests.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"input": text[:8191], "model": "text-embedding-3-small"},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()["data"][0]["embedding"]
        except Exception as exc:
            log.warning("OpenAI embedding failed: %s", exc)
            return None

    # Local HuggingFace via sentence-transformers
    model = _load_local_embed_model()
    if model is None:
        return None
    try:
        vec = model.encode(text, normalize_embeddings=True)
        return vec.tolist()
    except Exception as exc:
        log.warning("Local embedding failed: %s", exc)
        return None

# ---------------------------------------------------------------------------
# Supabase REST helpers
# ---------------------------------------------------------------------------
def _sb_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def sb_select(table: str, params: dict) -> list[dict]:
    """Run a SELECT query against a Supabase REST table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.get(url, headers=_sb_headers(), params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

def sb_insert(table: str, payload: dict | list) -> list[dict]:
    """Insert one or more rows into a Supabase table."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.post(url, headers=_sb_headers(), json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()

def sb_delete(table: str, params: dict) -> None:
    """Delete rows from a Supabase table matching params."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.delete(url, headers=_sb_headers(), params=params, timeout=30)
    resp.raise_for_status()

# ---------------------------------------------------------------------------
# Corpus map discovery
# ---------------------------------------------------------------------------
DEFAULT_CORPUS_MAP = {
    "packages": [
        {
            "slug": "core-docs",
            "label": "Core Documentation",
            "directories": ["docs", "Skills", "Knowledge Bases"],
            "extensions": [".md", ".txt", ".pdf"],
        },
        {
            "slug": "transcripts",
            "label": "Transcripts",
            "directories": ["Transcripts"],
            "extensions": [".md", ".txt", ".pdf", ".html"],
        },
        {
            "slug": "scripts",
            "label": "Scripts & Code",
            "directories": ["scripts", "src", "api"],
            "extensions": [".py", ".ts", ".tsx", ".js"],
        },
        {
            "slug": "config",
            "label": "Config & Schema",
            "directories": ["config", "supabase"],
            "extensions": [".json", ".yaml", ".yml", ".sql"],
        },
    ]
}

def load_corpus_map() -> dict:
    if CORPUS_MAP_PATH.exists():
        try:
            with open(CORPUS_MAP_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            log.info("Loaded corpus map from %s", CORPUS_MAP_PATH)
            return data
        except Exception as exc:
            log.warning("Could not parse corpus-map.json: %s — using defaults", exc)
    else:
        log.info("No corpus-map.json found at %s — using built-in defaults", CORPUS_MAP_PATH)
    return DEFAULT_CORPUS_MAP

def discover_files(corpus_map: dict) -> list[dict]:
    """
    Walk package directories defined in corpus_map and return a list of
    {path, package_slug, package_label} dicts for each qualifying file.
    """
    discovered: list[dict] = []
    packages = corpus_map.get("packages", [])

    for pkg in packages:
        slug = pkg.get("slug", "unknown")
        label = pkg.get("label", slug)

        if PACKAGE_FILTER and slug != PACKAGE_FILTER:
            continue

        dirs = pkg.get("directories", [])
        exts = {e.lower() for e in pkg.get("extensions", [".md", ".txt"])}
        exclude_patterns = pkg.get("exclude_patterns", [])

        for dir_name in dirs:
            dir_path = REPO_ROOT / dir_name
            if not dir_path.exists():
                log.debug("Directory not found, skipping: %s", dir_path)
                continue

            for file_path in dir_path.rglob("*"):
                if not file_path.is_file():
                    continue
                if file_path.suffix.lower() not in exts:
                    continue
                rel = str(file_path.relative_to(REPO_ROOT))
                # Apply exclusion patterns
                skip = False
                for pat in exclude_patterns:
                    if re.search(pat, rel):
                        skip = True
                        break
                if skip:
                    continue
                discovered.append({
                    "path": file_path,
                    "rel_path": rel,
                    "package_slug": slug,
                    "package_label": label,
                })

    log.info("Discovered %d files across %d packages", len(discovered),
             len({f["package_slug"] for f in discovered}))
    return discovered

# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------
def compute_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def check_existing_document(rel_path: str, content_hash: str) -> Optional[dict]:
    """
    Query the documents table for a matching path.
    Returns the existing row if found, else None.
    """
    if DRY_RUN:
        return None
    try:
        rows = sb_select("documents", {
            "path": f"eq.{rel_path}",
            "select": "documentid,hash",
            "limit": "1",
        })
        return rows[0] if rows else None
    except Exception as exc:
        log.warning("Could not query documents for %s: %s", rel_path, exc)
        return None

def delete_document_cascade(document_id: str) -> None:
    """Delete a document and its dependent rows (fragments, embeddings)."""
    log.info("Deleting stale document %s and its fragments/embeddings", document_id)
    for table in ("embeddings", "knowledgefragments", "skillfragments"):
        try:
            if table == "embeddings":
                sb_delete(table, {"documentid": f"eq.{document_id}"})
            else:
                sb_delete(table, {"documentid": f"eq.{document_id}"})
        except Exception as exc:
            log.debug("Delete from %s failed (may not have FK): %s", table, exc)
    try:
        sb_delete("documents", {"documentid": f"eq.{document_id}"})
    except Exception as exc:
        log.warning("Could not delete document %s: %s", document_id, exc)

# ---------------------------------------------------------------------------
# Processing run management
# ---------------------------------------------------------------------------
def create_processing_run(tenant_id: str) -> Optional[str]:
    """Insert a new processingruns row and return its runid."""
    if DRY_RUN:
        return str(uuid.uuid4())
    try:
        rows = sb_insert("processingruns", {
            "tenantid": tenant_id,
            "status": "running",
            "corpusroot": str(REPO_ROOT),
            "createdat": datetime.now(timezone.utc).isoformat(),
            "updatedat": datetime.now(timezone.utc).isoformat(),
        })
        run_id = rows[0]["runid"]
        log.info("Processing run created: %s", run_id)
        return run_id
    except Exception as exc:
        log.error("Could not create processing run: %s", exc)
        return None

def update_processing_run(run_id: str, status: str, docs_count: int, chunks_count: int) -> None:
    """Update the processingruns row with final counts and status."""
    if DRY_RUN:
        return
    try:
        url = f"{SUPABASE_URL}/rest/v1/processingruns"
        payload = {
            "status": status,
            "documentscount": docs_count,
            "chunkscount": chunks_count,
            "updatedat": datetime.now(timezone.utc).isoformat(),
        }
        resp = requests.patch(
            url,
            headers=_sb_headers(),
            params={"runid": f"eq.{run_id}"},
            json=payload,
            timeout=30,
        )
        resp.raise_for_status()
    except Exception as exc:
        log.warning("Could not update processing run %s: %s", run_id, exc)

# ---------------------------------------------------------------------------
# Core ingestion logic
# ---------------------------------------------------------------------------
def ingest_file(
    file_info: dict,
    run_id: str,
    tenant_id: str,
    embedding_provider: str = "local",
) -> tuple[int, int]:
    """
    Process a single file:
      1. Extract text
      2. Hash for deduplication
      3. Insert/update documents row
      4. Chunk text
      5. Insert knowledgefragments rows
      6. Generate + insert embeddings rows

    Returns (fragments_inserted, fragments_skipped).
    """
    file_path: Path = file_info["path"]
    rel_path: str = file_info["rel_path"]
    package_slug: str = file_info["package_slug"]

    log.info("Processing: %s [%s]", rel_path, package_slug)

    # --- Extract ---
    raw_text = extract_text(file_path)
    if not raw_text.strip():
        log.debug("No extractable text in %s — skipping", rel_path)
        return 0, 0

    content_hash = compute_hash(raw_text)
    file_size = file_path.stat().st_size

    # --- Deduplication check ---
    existing = check_existing_document(rel_path, content_hash)
    if existing:
        if existing["hash"] == content_hash:
            log.info("  Unchanged (hash match) — skipping: %s", rel_path)
            return 0, 1
        else:
            log.info("  Content changed — replacing: %s", rel_path)
            if not DRY_RUN:
                delete_document_cascade(existing["documentid"])

    doc_type = classify_document_type(rel_path)
    tags = derive_tags(rel_path, raw_text)
    chunks = chunk_text(raw_text)
    total_chunks = len(chunks)

    if not chunks:
        log.debug("No chunks produced for %s — skipping", rel_path)
        return 0, 0

    # --- Insert document record ---
    document_id = str(uuid.uuid4())
    if not DRY_RUN:
        try:
            doc_rows = sb_insert("documents", {
                "documentid": document_id,
                "runid": run_id,
                "tenantid": tenant_id,
                "path": rel_path,
                "filename": file_path.name,
                "hash": content_hash,
                "chunkindex": 0,
                "totalchunks": total_chunks,
                "filesizebytes": file_size,
                "content": raw_text[:65535],  # cap for storage; full text in fragments
                "mimetype": _mime_from_suffix(file_path.suffix),
                "extractedmetadata": json.dumps({
                    "package": package_slug,
                    "document_type": doc_type,
                    "tags": tags,
                    "char_count": len(raw_text),
                }),
                "provenance": json.dumps({
                    "source": "ingest_corpus.py",
                    "ingested_at": datetime.now(timezone.utc).isoformat(),
                }),
                "createdat": datetime.now(timezone.utc).isoformat(),
            })
            document_id = doc_rows[0]["documentid"]
        except Exception as exc:
            log.error("  Failed to insert document for %s: %s", rel_path, exc)
            return 0, 0
    else:
        log.info("  [DRY RUN] Would insert document: %s (%d chunks)", rel_path, total_chunks)

    # --- Insert fragments + embeddings ---
    fragments_inserted = 0
    for idx, chunk in enumerate(chunks):
        chunk_hash = compute_hash(chunk)

        if DRY_RUN:
            log.debug("  [DRY RUN] Chunk %d/%d: %d chars", idx + 1, total_chunks, len(chunk))
            fragments_inserted += 1
            continue

        # knowledgefragments
        fragment_id = str(uuid.uuid4())
        try:
            sb_insert("knowledgefragments", {
                "id": fragment_id,
                "content": chunk,
                "contenthash": chunk_hash,
                "sourcefile": rel_path,
                "documenttype": doc_type,
                "chunkindex": idx,
                "totalchunks": total_chunks,
                "charcount": len(chunk),
                "tags": tags,
                "createdat": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as exc:
            # contenthash UNIQUE violation = duplicate chunk, skip silently
            if "contenthash" in str(exc) or "unique" in str(exc).lower():
                log.debug("  Duplicate chunk %d for %s — skipping", idx, rel_path)
                continue
            log.warning("  Fragment insert failed (chunk %d, %s): %s", idx, rel_path, exc)
            continue

        # embeddings
        embedding = generate_embedding(chunk, provider=embedding_provider)
        if embedding is not None:
            try:
                sb_insert("embeddings", {
                    "documentid": document_id,
                    "model": EMBED_MODEL if embedding_provider == "local" else "text-embedding-3-small",
                    "embedding": embedding,
                    "runid": run_id,
                    "createdat": datetime.now(timezone.utc).isoformat(),
                })
            except Exception as exc:
                log.warning("  Embedding insert failed (chunk %d, %s): %s", idx, rel_path, exc)

        fragments_inserted += 1

    log.info("  ✓ %d/%d fragments written for %s", fragments_inserted, total_chunks, rel_path)
    return fragments_inserted, 0

def _mime_from_suffix(suffix: str) -> str:
    mime_map = {
        ".md": "text/markdown",
        ".txt": "text/plain",
        ".pdf": "application/pdf",
        ".html": "text/html",
        ".json": "application/json",
        ".yaml": "application/yaml",
        ".yml": "application/yaml",
        ".sql": "application/sql",
        ".py": "text/x-python",
        ".ts": "text/typescript",
        ".tsx": "text/typescript",
        ".js": "text/javascript",
        ".jsx": "text/javascript",
        ".csv": "text/csv",
    }
    return mime_map.get(suffix.lower(), "application/octet-stream")

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    # Validate env
    if not DRY_RUN:
        if not SUPABASE_URL:
            log.error("SUPABASE_URL is required. Set it in your environment.")
            sys.exit(1)
        if not SUPABASE_KEY:
            log.error("SUPABASE_SERVICE_ROLE_KEY is required. Set it in your environment.")
            sys.exit(1)

    log.info("=" * 60)
    log.info("GestaltView Corpus Ingestion Pipeline")
    log.info("Repo root  : %s", REPO_ROOT)
    log.info("Chunk size : %d chars", CHUNK_SIZE)
    log.info("Dry run    : %s", DRY_RUN)
    log.info("Package    : %s", PACKAGE_FILTER or "ALL")
    log.info("=" * 60)

    # Load corpus map
    corpus_map = load_corpus_map()

    # Discover files
    files = discover_files(corpus_map)
    if not files:
        log.warning("No files discovered. Check your corpus-map.json paths.")
        sys.exit(0)

    # Resolve tenant ID — use a stable UUID derived from the project name
    # or override via GESTALTVIEW_TENANT_ID env var
    tenant_id = os.environ.get(
        "GESTALTVIEW_TENANT_ID",
        str(uuid.uuid5(uuid.NAMESPACE_DNS, "gestaltview.ai"))
    )
    log.info("Tenant ID  : %s", tenant_id)

    # Resolve embedding provider
    embedding_provider = os.environ.get("GESTALTVIEW_EMBED_PROVIDER", "local")
    if embedding_provider not in {"local", "openai", "none"}:
        log.warning("Unknown embedding provider %r — defaulting to 'none'", embedding_provider)
        embedding_provider = "none"
    log.info("Embeddings : %s", embedding_provider)

    # Create processing run
    run_id = create_processing_run(tenant_id)
    if run_id is None:
        log.error("Could not create processing run — aborting.")
        sys.exit(1)

    # Run ingestion
    start_time = time.time()
    total_fragments = 0
    total_skipped = 0
    total_docs = 0
    errors = 0

    for file_info in files:
        try:
            inserted, skipped = ingest_file(
                file_info,
                run_id=run_id,
                tenant_id=tenant_id,
                embedding_provider=embedding_provider,
            )
            if inserted > 0:
                total_docs += 1
                total_fragments += inserted
            total_skipped += skipped
        except Exception as exc:
            log.error("Unexpected error processing %s: %s", file_info["rel_path"], exc)
            errors += 1

    elapsed = time.time() - start_time
    final_status = "completed" if errors == 0 else "partial"

    # Update run record
    update_processing_run(run_id, final_status, total_docs, total_fragments)

    log.info("=" * 60)
    log.info("Run complete in %.1fs", elapsed)
    log.info("  Documents processed : %d", total_docs)
    log.info("  Fragments written   : %d", total_fragments)
    log.info("  Files skipped       : %d (unchanged)", total_skipped)
    log.info("  Errors              : %d", errors)
    log.info("  Status              : %s", final_status)
    if DRY_RUN:
        log.info("  [DRY RUN] No data was written to Supabase.")
    log.info("=" * 60)

    sys.exit(0 if errors == 0 else 1)


if __name__ == "__main__":
    main()
