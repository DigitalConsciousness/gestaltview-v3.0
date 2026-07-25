#!/usr/bin/env python3
"""
GestaltView — Agent Trainer Package Corpus Ingestion
====================================================

Builds a Supabase-backed source library from the repo-local `agent_trainer/`
package assets so the package builder and trainer surfaces can retrieve the
actual deliverable scaffold instead of relying on generic Compendium material.

Default scope:
  - agent_trainer/gestaltview_agent_trainer/**
  - root package specs: README, MASTER_SPEC, PLAYBOOK, CONSULTING, summary,
    onboarding manual, and Stripe setup notes

Generated ZIPs, dist/build artifacts, caches, node_modules, and root marketing
calendar/email content are excluded by default. Use --include-marketing to opt
those in.

Dry-run:
  python3 scripts/ingest_agent_trainer_corpus.py --dry-run

Live ingest:
  python3 scripts/ingest_agent_trainer_corpus.py

Required for live ingest:
  SUPABASE_URL or VITE_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY

Optional:
  AGENT_TRAINER_CORPUS_ROOT      default agent_trainer
  AGENT_TRAINER_PACKAGE          default agent-trainer-package
  AGENT_TRAINER_SOURCE_PREFIX    default agent_trainer
  GESTALTVIEW_CHUNK_SIZE         default 3000
  GESTALTVIEW_CHUNK_OVERLAP      default 400
  GESTALTVIEW_EMBED_MODEL        default google/embeddinggemma-300M
  GESTALTVIEW_EMBED_DEVICE       default cpu
  GESTALTVIEW_EMBED_BATCH_SIZE   default 32
  GESTALTVIEW_TENANT_ID          default 00000000-0000-0000-0001-000000000001
  GESTALTVIEW_BILLY_AGENT_UUID   default 00000000-0000-0000-0000-000000000042
"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

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

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("agent-trainer-ingest")

REPO_ROOT = Path(__file__).resolve().parent.parent

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL", "")
SERVICE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or os.environ.get("VITE_SUPABASE_ANON_KEY", "")
)

EMBED_MODEL = os.environ.get("GESTALTVIEW_EMBED_MODEL", "google/embeddinggemma-300M")
EMBED_DIMS = int(os.environ.get("GESTALTVIEW_EMBED_DIMS", "768"))
EMBED_DEVICE = os.environ.get("GESTALTVIEW_EMBED_DEVICE", "cpu")
EMBED_BATCH_SIZE = int(os.environ.get("GESTALTVIEW_EMBED_BATCH_SIZE", "32"))

TENANT_ID = os.environ.get("GESTALTVIEW_TENANT_ID", "00000000-0000-0000-0001-000000000001")
BILLY_AGENT_UUID = os.environ.get("GESTALTVIEW_BILLY_AGENT_UUID", "00000000-0000-0000-0000-000000000042")

DEFAULT_PACKAGE = os.environ.get("AGENT_TRAINER_PACKAGE", "agent-trainer-package")
DEFAULT_SOURCE_PREFIX = os.environ.get("AGENT_TRAINER_SOURCE_PREFIX", "agent_trainer")
DEFAULT_ROOT = os.environ.get("AGENT_TRAINER_CORPUS_ROOT", "agent_trainer")

SUPPORTED_EXTENSIONS = {
    ".css",
    ".env",
    ".example",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mdx",
    ".ps1",
    ".py",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
    ".pdf",
}

EXCLUDED_DIR_NAMES = {
    ".git",
    ".next",
    ".turbo",
    ".venv",
    "__pycache__",
    "build",
    "dist",
    "node_modules",
    "out",
}

ROOT_PACKAGE_DOCS = {
    "CONSULTING.md",
    "GestaltView Agent Trainer Summary.md",
    "GestaltView Agent Trainer — Stripe Product Setup Script v0.1.0.md",
    "GestaltView_Onboarding_Manual.pdf",
    "MASTER_SPEC.md",
    "PLAYBOOK.md",
    "README.md",
}

MARKETING_NAME_MARKERS = (
    "content calendar",
    "email template",
    "follow-up",
    "marketing",
    "social media",
)


@dataclass(frozen=True)
class IngestCandidate:
    path: Path
    source_file: str
    package: str
    document_type: str
    tags: List[str]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_requests_available() -> None:
    if requests is not None:
        return
    raise RuntimeError(
        "Missing Python dependency: requests. Install repo script dependencies before live ingest."
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
    return f"HTTP {response.status_code} — {' '.join(body.split())[:400]}"


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


def supabase_headers(prefer: str = "return=minimal") -> Dict[str, str]:
    return {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }


def _get(path: str) -> "requests.Response":
    ensure_requests_available()
    return requests.get(f"{SUPABASE_URL}{path}", headers=supabase_headers(), timeout=20)


def _post(path: str, payload: Dict[str, Any], prefer: str = "return=minimal") -> "requests.Response":
    ensure_requests_available()
    return requests.post(
        f"{SUPABASE_URL}{path}",
        headers=supabase_headers(prefer),
        json=payload,
        timeout=30,
    )


def _patch(path: str, payload: Dict[str, Any]) -> "requests.Response":
    ensure_requests_available()
    return requests.patch(
        f"{SUPABASE_URL}{path}",
        headers=supabase_headers(),
        json=payload,
        timeout=30,
    )


def _delete(path: str) -> "requests.Response":
    ensure_requests_available()
    return requests.delete(f"{SUPABASE_URL}{path}", headers=supabase_headers(), timeout=20)


def sanitize_text(value: str) -> str:
    value = value.replace("\x00", "")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{4,}", "\n\n\n", value)
    return value.strip()


def infer_mimetype(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in {".md", ".mdx", ".txt", ".sh", ".ps1", ".py", ".ts", ".tsx", ".js", ".css", ".sql", ".yaml", ".yml", ".toml", ".example"}:
        return "text/plain"
    if ext == ".json":
        return "application/json"
    if ext == ".html":
        return "text/html"
    if ext == ".pdf":
        return "application/pdf"
    return "application/octet-stream"


def read_text_file(path: Path, skipped: List[str]) -> Optional[str]:
    try:
        return sanitize_text(path.read_text(encoding="utf-8", errors="replace"))
    except Exception as exc:
        skipped.append(f"{path}: read error — {exc}")
        return None


def read_pdf_file(path: Path, skipped: List[str]) -> Optional[str]:
    if not _PDF_AVAILABLE:
        skipped.append(f"{path}: skipped PDF — pdfplumber not installed")
        return None
    try:
        pages: List[str] = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
        if not pages:
            skipped.append(f"{path}: PDF yielded no extractable text")
            return None
        return sanitize_text("\n\n".join(pages))
    except Exception as exc:
        skipped.append(f"{path}: PDF parse error — {exc}")
        return None


def read_file(path: Path, skipped: List[str]) -> Optional[str]:
    if path.suffix.lower() == ".pdf":
        return read_pdf_file(path, skipped)
    return read_text_file(path, skipped)


def chunk_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    cleaned = sanitize_text(text)
    if not cleaned:
        return []

    chunks: List[str] = []
    start = 0
    stride = max(chunk_size - overlap, 400)
    while start < len(cleaned):
        end = min(start + chunk_size, len(cleaned))
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(cleaned):
            break
        start += stride
    return chunks


def _get_embed_model():
    global _EMBED_MODEL_INSTANCE
    if not _ST_AVAILABLE:
        return None
    if _EMBED_MODEL_INSTANCE is None:
        log.info("Loading embedding model: %s on %s", EMBED_MODEL, EMBED_DEVICE)
        _EMBED_MODEL_INSTANCE = _ST(EMBED_MODEL).to(EMBED_DEVICE)
        log.info("Embedding model loaded (%d-dim)", EMBED_DIMS)
    return _EMBED_MODEL_INSTANCE


def get_embeddings_batch(texts: List[str], disable_embeddings: bool) -> List[Optional[List[float]]]:
    if disable_embeddings or not texts:
        return [None] * len(texts)
    if not _ST_AVAILABLE:
        log.warning("sentence-transformers not installed; inserting fragments without embeddings")
        return [None] * len(texts)
    model = _get_embed_model()
    if model is None:
        return [None] * len(texts)
    try:
        vectors = model.encode(
            [text[:8192] for text in texts],
            prompt_name="Retrieval-document",
            normalize_embeddings=True,
            batch_size=EMBED_BATCH_SIZE,
            show_progress_bar=False,
        )
        return [vector.tolist() for vector in vectors]
    except Exception as exc:
        log.warning("Embedding batch failed: %s; inserting fragments without embeddings", exc)
        return [None] * len(texts)


def has_excluded_part(path: Path, root: Path) -> bool:
    try:
        rel_parts = path.relative_to(root).parts
    except ValueError:
        rel_parts = path.parts
    return any(part in EXCLUDED_DIR_NAMES for part in rel_parts)


def is_supported_file(path: Path) -> bool:
    if not path.is_file():
        return False
    suffix = path.suffix.lower()
    return suffix in SUPPORTED_EXTENSIONS or path.name in {"Dockerfile", ".dockerignore", "compose.yaml", "gv.sh"}


def is_marketing_root_file(path: Path, root: Path) -> bool:
    try:
        rel = path.relative_to(root)
    except ValueError:
        return False
    if len(rel.parts) != 1:
        return False
    lowered = path.name.lower()
    return any(marker in lowered for marker in MARKETING_NAME_MARKERS)


def should_include(path: Path, root: Path, include_marketing: bool) -> bool:
    if has_excluded_part(path, root) or not is_supported_file(path):
        return False

    rel = path.relative_to(root)
    if rel.parts and rel.parts[0] == "gestaltview_agent_trainer":
        return True

    if path.name in ROOT_PACKAGE_DOCS:
        return True

    return include_marketing and not is_marketing_root_file(path, root)


def classify_document_type(source_file: str, path: Path) -> str:
    lowered = source_file.lower()
    if "/api/" in lowered or lowered.endswith("/api_reference.md"):
        return "API"
    if "/docs/" in lowered or lowered.endswith((".md", ".pdf")):
        return "Documentation"
    if "/config/" in lowered or "/templates/" in lowered or "/setup/" in lowered:
        return "Product"
    if "/components/" in lowered or "/pages/" in lowered:
        return "Product"
    if "/scripts/" in lowered or "/supabase/" in lowered or lowered.endswith(("dockerfile", "compose.yaml")):
        return "Architecture"
    if path.suffix.lower() in {".ts", ".tsx", ".js", ".py", ".sql", ".sh", ".ps1"}:
        return "Architecture"
    return "Product"


def build_tags(source_file: str, package: str, document_type: str, path: Path) -> List[str]:
    tags = {
        package,
        f"package:{package}",
        "agent-trainer",
        "agent_trainer",
        "package-builder",
        "source-library",
        document_type.lower(),
    }
    suffix = path.suffix.lower().lstrip(".")
    if suffix:
        tags.add(suffix)
    if "/docs/" in source_file:
        tags.add("docs")
    if "/config/" in source_file:
        tags.add("config")
    if "/components/" in source_file:
        tags.add("components")
    if "/scripts/" in source_file:
        tags.add("scripts")
    return sorted(tags)


def list_candidates(root: Path, source_prefix: str, package: str, include_marketing: bool) -> List[IngestCandidate]:
    candidates: List[IngestCandidate] = []
    for path in sorted(root.rglob("*")):
        if not should_include(path, root, include_marketing):
            continue
        rel = path.relative_to(root).as_posix()
        source_file = f"{source_prefix.strip('/')}/{rel}"
        document_type = classify_document_type(source_file, path)
        candidates.append(
            IngestCandidate(
                path=path,
                source_file=source_file,
                package=package,
                document_type=document_type,
                tags=build_tags(source_file, package, document_type, path),
            )
        )
    return candidates


def find_existing_document(doc_path: str) -> Optional[Dict[str, Any]]:
    response = _get(
        f"/rest/v1/documents"
        f"?select=document_id,hash,path"
        f"&path=eq.{quote_url_value(doc_path)}"
        f"&chunk_index=eq.0&limit=1"
    )
    if response.status_code != 200:
        return None
    rows = response.json()
    return rows[0] if rows else None


def delete_existing_doc_and_fragments(document_id: str, source_file: str) -> None:
    encoded_source = quote_url_value(source_file)
    _delete(f"/rest/v1/embeddings?document_id=eq.{document_id}")
    _delete(f"/rest/v1/knowledge_fragments?source_file=eq.{encoded_source}")
    _delete(f"/rest/v1/documents?document_id=eq.{document_id}")


PROCESSING_RUN_OPTIONAL_FIELDS = ("updated_at",)


def submit_processing_run_request(
    method: str,
    path: str,
    payload: Dict[str, Any],
) -> Tuple[bool, Optional[str], Dict[str, Any]]:
    request_fn = _post if method == "post" else _patch
    working_payload = dict(payload)

    while True:
        response = request_fn(path, working_payload)
        if response.status_code in (200, 201, 204):
            return True, None, working_payload

        missing_column = extract_missing_column(response, "processing_runs")
        if missing_column in PROCESSING_RUN_OPTIONAL_FIELDS and missing_column in working_payload:
            working_payload.pop(missing_column, None)
            continue

        return False, describe_supabase_response(response), working_payload


def create_processing_run(run_id: str, root: Path, dry_run: bool) -> Tuple[bool, Optional[str]]:
    if dry_run:
        return True, None
    payload = {
        "run_id": run_id,
        "tenant_id": TENANT_ID,
        "status": "running",
        "model": EMBED_MODEL,
        "corpus_root": str(root),
        "created_by": BILLY_AGENT_UUID,
        "created_at": now_iso(),
    }
    success, detail, _ = submit_processing_run_request("post", "/rest/v1/processing_runs", payload)
    return success, detail


def finalize_processing_run(
    run_id: str,
    status: str,
    docs_count: int,
    fragments_count: int,
    dry_run: bool,
    error: Optional[str] = None,
) -> None:
    if dry_run:
        return
    payload: Dict[str, Any] = {
        "status": status,
        "documents_count": docs_count,
        "chunks_count": fragments_count,
        "updated_at": now_iso(),
    }
    if error:
        payload["model"] = f"{EMBED_MODEL} | error:{error[:180]}"
    success, detail, _ = submit_processing_run_request(
        "patch",
        f"/rest/v1/processing_runs?run_id=eq.{run_id}",
        payload,
    )
    if not success:
        log.warning("Could not finalize processing run %s: %s", run_id, detail)


def ingest_candidate(
    candidate: IngestCandidate,
    run_id: str,
    *,
    chunk_size: int,
    overlap: int,
    dry_run: bool,
    disable_embeddings: bool,
    skipped: List[str],
) -> Tuple[int, int, bool]:
    raw_content = read_file(candidate.path, skipped)
    if not raw_content:
        return 0, 0, False

    content = raw_content.strip()
    if len(content) < 40:
        skipped.append(f"{candidate.path}: too short")
        return 0, 0, False

    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
    chunks = chunk_text(content, chunk_size, overlap)
    if not chunks:
        return 0, 0, False

    if dry_run:
        log.info("[DRY RUN] %s -> %d chunks | type=%s", candidate.source_file, len(chunks), candidate.document_type)
        return 1, len(chunks), False

    existing = find_existing_document(candidate.source_file)
    if existing and existing.get("hash") == content_hash:
        return 0, 0, True
    if existing:
        delete_existing_doc_and_fragments(existing["document_id"], candidate.source_file)

    document_id = str(uuid.uuid4())
    doc_payload = {
        "document_id": document_id,
        "run_id": run_id,
        "tenant_id": TENANT_ID,
        "path": candidate.source_file,
        "filename": candidate.path.name,
        "hash": content_hash,
        "chunk_index": 0,
        "total_chunks": len(chunks),
        "file_size_bytes": candidate.path.stat().st_size,
        "content": content,
        "mime_type": infer_mimetype(candidate.path),
        "extracted_metadata": {
            "package": candidate.package,
            "relative_path": candidate.source_file,
            "source": "agent_trainer",
            "document_type": candidate.document_type,
            "tags": candidate.tags,
            "total_chars": len(content),
            "package_builder_source": True,
        },
        "provenance": {
            "source": "agent_trainer",
            "package": candidate.package,
            "relative_path": candidate.source_file,
            "ingest_run": run_id,
            "purpose": "gate_package_builder_source_library",
        },
        "created_by": BILLY_AGENT_UUID,
    }

    response = _post("/rest/v1/documents", doc_payload, prefer="return=representation")
    if response.status_code not in (200, 201):
        skipped.append(f"{candidate.path}: failed to insert document ({describe_supabase_response(response)})")
        return 0, 0, False

    embeddings = get_embeddings_batch(chunks, disable_embeddings)
    inserted_fragments = 0
    for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        fragment_hash = hashlib.sha256(f"{content_hash}:{index}:{chunk[:200]}".encode("utf-8")).hexdigest()
        fragment_payload = {
            "content": chunk,
            "content_hash": fragment_hash,
            "embedding": embedding,
            "source_file": candidate.source_file,
            "document_type": candidate.document_type,
            "chunk_index": index,
            "total_chunks": len(chunks),
            "char_count": len(chunk),
            "tags": candidate.tags,
        }
        fragment_response = _post("/rest/v1/knowledge_fragments", fragment_payload)
        if fragment_response.status_code not in (200, 201):
            skipped.append(
                f"{candidate.path}: failed fragment {index} ({describe_supabase_response(fragment_response)})"
            )
            continue

        if embedding:
            embedding_response = _post(
                "/rest/v1/embeddings",
                {
                    "document_id": document_id,
                    "run_id": run_id,
                    "model": EMBED_MODEL,
                    "embedding": embedding,
                },
            )
            if embedding_response.status_code not in (200, 201):
                skipped.append(
                    f"{candidate.path}: failed embedding {index} ({describe_supabase_response(embedding_response)})"
                )

        inserted_fragments += 1

    return 1, inserted_fragments, False


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest Agent Trainer package source files into Supabase corpus tables.")
    parser.add_argument("--root", default=DEFAULT_ROOT, help="Agent Trainer corpus root. Default: agent_trainer")
    parser.add_argument("--package", default=DEFAULT_PACKAGE, help="Package tag for retrieval filtering.")
    parser.add_argument("--source-prefix", default=DEFAULT_SOURCE_PREFIX, help="Prefix stored in knowledge_fragments.source_file.")
    parser.add_argument("--chunk-size", type=int, default=int(os.environ.get("GESTALTVIEW_CHUNK_SIZE", "3000")))
    parser.add_argument("--chunk-overlap", type=int, default=int(os.environ.get("GESTALTVIEW_CHUNK_OVERLAP", "400")))
    parser.add_argument("--include-marketing", action="store_true", help="Include root marketing calendars/email/social files.")
    parser.add_argument("--no-embed", action="store_true", help="Skip local embedding generation and insert fragment text only.")
    parser.add_argument("--dry-run", action="store_true", default=os.environ.get("GESTALTVIEW_DRY_RUN", "0") == "1")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root)
    if not root.is_absolute():
        root = REPO_ROOT / root
    root = root.resolve()

    if not root.exists():
        raise RuntimeError(f"Agent Trainer corpus root does not exist: {root}")

    candidates = list_candidates(root, args.source_prefix, args.package, args.include_marketing)
    run_id = str(uuid.uuid4())
    skipped: List[str] = []
    docs_inserted = 0
    fragments_inserted = 0
    unchanged = 0

    print("=" * 68)
    print("  GestaltView — Agent Trainer Package Corpus Ingestion")
    if args.dry_run:
        print("  *** DRY RUN — no writes to Supabase ***")
    print("=" * 68)
    print(f"  Root          : {root}")
    print(f"  Package tag   : {args.package} / package:{args.package}")
    print(f"  Source prefix : {args.source_prefix}")
    print(f"  Candidates    : {len(candidates)}")
    print(f"  Chunking      : {args.chunk_size} chars / {args.chunk_overlap} overlap")
    print(f"  Embeddings    : {'disabled' if args.no_embed else ('available' if _ST_AVAILABLE else 'not installed; null embeddings')}")
    print(f"  PDF support   : {'available' if _PDF_AVAILABLE else 'not installed'}")
    print()

    if not args.dry_run and (not SUPABASE_URL or not SERVICE_KEY):
        raise RuntimeError("Live ingest requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY.")

    if not args.dry_run:
        ensure_requests_available()

    created_run, create_run_error = create_processing_run(run_id, root, args.dry_run)
    if not created_run:
        raise RuntimeError(f"Could not create processing run: {create_run_error}")

    try:
        for candidate in candidates:
            doc_count, fragment_count, was_unchanged = ingest_candidate(
                candidate,
                run_id,
                chunk_size=args.chunk_size,
                overlap=args.chunk_overlap,
                dry_run=args.dry_run,
                disable_embeddings=args.no_embed,
                skipped=skipped,
            )
            docs_inserted += doc_count
            fragments_inserted += fragment_count
            unchanged += 1 if was_unchanged else 0

        finalize_processing_run(run_id, "completed", docs_inserted, fragments_inserted, args.dry_run)
    except Exception as exc:
        finalize_processing_run(run_id, "failed", docs_inserted, fragments_inserted, args.dry_run, str(exc))
        raise

    summary = {
        "run_id": run_id,
        "root": str(root),
        "package": args.package,
        "source_prefix": args.source_prefix,
        "candidates": len(candidates),
        "documents_inserted_or_changed": docs_inserted,
        "fragments_inserted": fragments_inserted,
        "unchanged_documents": unchanged,
        "skipped": skipped[:50],
        "skipped_count": len(skipped),
        "dry_run": args.dry_run,
    }
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
