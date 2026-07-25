#!/usr/bin/env python3
"""
GestaltView Corpus Ingestor v2
- Reads corpus_map.json for section definitions
- Uses HuggingFace sentence-transformers (CPU-only, no NVIDIA)
- Embeds at 768-dim with Snowflake/snowflake-arctic-embed-m
- Writes to knowledge_fragments with document_id + source_path FKs
- Fails hard on fragment count mismatch (no silent skips)
- Run one section at a time via --section flag
"""

import os
import sys
import json
import hashlib
import argparse
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

# ── Config ──────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
HF_TOKEN = os.environ.get("HF_TOKEN")

CORPUS_MAP_PATH = Path(__file__).parent / "corpus_map.json"
REPO_ROOT = Path(__file__).parent.parent

MODEL_NAME = "Snowflake/snowflake-arctic-embed-m"
EMBEDDING_DIM = 768
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64
BATCH_SIZE = 32

# ── Model loader (CPU-only, no CUDA install triggered) ──────────────────────

_model = None

def get_model():
    global _model
    if _model is None:
        log.info(f"Loading embedding model: {MODEL_NAME}")
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            log.error("sentence-transformers not installed. Run: pip install sentence-transformers")
            sys.exit(1)
        kwargs = {"device": "cpu"}
        if HF_TOKEN:
            kwargs["token"] = HF_TOKEN
        _model = SentenceTransformer(MODEL_NAME, **kwargs)
        log.info("Model loaded on CPU.")
    return _model


# ── Chunking ─────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start += chunk_size - overlap
    return chunks


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ── Supabase helpers ──────────────────────────────────────────────────────────

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def ensure_processing_run(sb: Client, section_id: str, tenant_id: str) -> str:
    result = sb.table("processing_runs").insert({
        "tenant_id": tenant_id,
        "status": "running",
        "model": MODEL_NAME,
        "corpus_root": f"corpus/{section_id}",
        "documents_count": 0,
        "chunks_count": 0,
        "created_by": None,
    }).execute()
    run_id = result.data[0]["run_id"]
    log.info(f"Created processing_run {run_id} for section '{section_id}'")
    return run_id


def finalize_run(sb: Client, run_id: str, doc_count: int, chunk_count: int, status: str = "completed"):
    sb.table("processing_runs").update({
        "status": status,
        "documents_count": doc_count,
        "chunks_count": chunk_count,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("run_id", run_id).execute()


def upsert_document(sb: Client, run_id: str, tenant_id: str, file_path: Path,
                    content: str, chunk_index: int, total_chunks: int) -> str:
    file_hash = content_hash(content + str(file_path))
    result = sb.table("documents").upsert({
        "run_id": run_id,
        "tenant_id": tenant_id,
        "path": str(file_path.parent.relative_to(REPO_ROOT)),
        "filename": file_path.name,
        "hash": file_hash,
        "chunk_index": chunk_index,
        "total_chunks": total_chunks,
        "file_size_bytes": file_path.stat().st_size,
        "content": content,
        "mime_type": "text/plain",
        "extracted_metadata": {"section": str(file_path.parent.name)},
        "provenance": {"source": "ingest_corpus_v2"},
    }, on_conflict="hash").execute()
    return result.data[0]["document_id"]


def fragment_exists(sb: Client, chash: str) -> bool:
    r = sb.table("knowledge_fragments").select("id").eq("content_hash", chash).limit(1).execute()
    return len(r.data) > 0


def insert_fragment(sb: Client, document_id: str, content: str, embedding: list[float],
                    source_file: str, source_path: str, document_type: str,
                    chunk_index: int, total_chunks: int, tags: list[str]) -> str:
    chash = content_hash(content)
    result = sb.table("knowledge_fragments").upsert({
        "content": content,
        "content_hash": chash,
        "embedding": embedding,
        "source_file": source_file,
        "source_path": source_path,
        "document_id": document_id,
        "document_type": document_type,
        "chunk_index": chunk_index,
        "total_chunks": total_chunks,
        "char_count": len(content),
        "tags": tags,
    }, on_conflict="content_hash").execute()
    return result.data[0]["id"]


# ── Core ingestion ────────────────────────────────────────────────────────────

def ingest_file(sb: Client, run_id: str, tenant_id: str, file_path: Path,
                section: dict, dry_run: bool = False) -> tuple[int, int]:
    """Returns (documents_inserted, fragments_inserted)."""
    try:
        raw = file_path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        log.warning(f"Could not read {file_path}: {e}")
        return 0, 0

    raw = raw.strip()
    if not raw:
        log.debug(f"Skipping empty file: {file_path.name}")
        return 0, 0

    chunks = chunk_text(raw)
    if not chunks:
        return 0, 0

    total_chunks = len(chunks)
    source_path = str(file_path.relative_to(REPO_ROOT))
    document_type = section["document_type"]
    tags = section.get("tags", [])

    if dry_run:
        log.info(f"[DRY RUN] {file_path.name}: {total_chunks} chunks")
        return 1, total_chunks

    log.info(f"  Embedding {file_path.name} → {total_chunks} chunks")
    model = get_model()

    # Batch embed all chunks at once
    embeddings = model.encode(chunks, batch_size=BATCH_SIZE, show_progress_bar=False, normalize_embeddings=True)

    inserted_docs = 0
    inserted_frags = 0

    for i, (chunk_text_str, embedding) in enumerate(zip(chunks, embeddings)):
        chash = content_hash(chunk_text_str)

        # Skip already-ingested fragments
        if fragment_exists(sb, chash):
            log.debug(f"    Fragment {i} already exists, skipping.")
            continue

        doc_id = upsert_document(
            sb, run_id, tenant_id, file_path,
            chunk_text_str, i, total_chunks
        )
        if i == 0:
            inserted_docs += 1

        insert_fragment(
            sb, doc_id, chunk_text_str,
            embedding.tolist(), file_path.name,
            source_path, document_type, i, total_chunks, tags
        )
        inserted_frags += 1

    # Invariant check — hard fail if we expected fragments and got none
    expected_new = sum(
        1 for c in chunks if not fragment_exists(sb, content_hash(c))
    )
    # After insert, all should exist now
    actually_present = sum(
        1 for c in chunks if fragment_exists(sb, content_hash(c))
    )
    if actually_present != total_chunks:
        raise RuntimeError(
            f"FRAGMENT INVARIANT FAILED for {file_path.name}: "
            f"expected {total_chunks}, found {actually_present} in DB"
        )

    log.info(f"  ✓ {file_path.name}: {inserted_docs} docs, {inserted_frags} new fragments ({total_chunks} total)")
    return inserted_docs, inserted_frags


def ingest_section(section: dict, tenant_id: str, dry_run: bool = False,
                   limit: Optional[int] = None) -> dict:
    sb = get_supabase()
    section_id = section["id"]
    extensions = set(section.get("extensions", [".md", ".txt"]))

    files: list[Path] = []
    for path_str in section["paths"]:
        search_path = REPO_ROOT / path_str
        if not search_path.exists():
            log.warning(f"Path does not exist: {search_path}")
            continue
        for ext in extensions:
            files.extend(search_path.rglob(f"*{ext}"))

    files = sorted(set(files))
    if limit:
        files = files[:limit]

    if not files:
        log.warning(f"No files found for section '{section_id}'")
        return {"section": section_id, "files": 0, "documents": 0, "fragments": 0}

    log.info(f"\n{'='*60}")
    log.info(f"Section: {section['label']}  ({len(files)} files)")
    log.info(f"{'='*60}")

    run_id = None if dry_run else ensure_processing_run(sb, section_id, tenant_id)
    total_docs = 0
    total_frags = 0

    for file_path in files:
        d, f = ingest_file(sb, run_id, tenant_id, file_path, section, dry_run)
        total_docs += d
        total_frags += f

    if not dry_run and run_id:
        finalize_run(sb, run_id, total_docs, total_frags)

    log.info(f"\n✓ Section '{section_id}' complete: {total_docs} docs, {total_frags} fragments")
    return {"section": section_id, "files": len(files), "documents": total_docs, "fragments": total_frags}


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="GestaltView Corpus Ingestor v2")
    parser.add_argument("--section", type=str, help="Section ID to ingest (from corpus_map.json). Omit for all.")
    parser.add_argument("--tenant-id", type=str, default=os.environ.get("TENANT_ID", "00000000-0000-0000-0000-000000000001"))
    parser.add_argument("--dry-run", action="store_true", help="Scan files and count chunks without writing to DB")
    parser.add_argument("--limit", type=int, help="Max files per section (for testing)")
    parser.add_argument("--list-sections", action="store_true", help="Print available section IDs and exit")
    args = parser.parse_args()

    corpus_map = json.loads(CORPUS_MAP_PATH.read_text())
    sections = corpus_map["sections"]

    if args.list_sections:
        for s in sections:
            paths = ", ".join(s["paths"])
            print(f"  {s['id']:25s} → {paths}")
        return

    if args.section:
        target = next((s for s in sections if s["id"] == args.section), None)
        if not target:
            log.error(f"Unknown section '{args.section}'. Use --list-sections to see available.")
            sys.exit(1)
        sections = [target]

    results = []
    for section in sections:
        result = ingest_section(section, args.tenant_id, args.dry_run, args.limit)
        results.append(result)

    print("\n\n── INGEST SUMMARY ─────────────────────────────────────────")
    for r in results:
        print(f"  {r['section']:25s}  files={r['files']:4d}  docs={r['documents']:5d}  fragments={r['fragments']:6d}")
    print("──────────────────────────────────────────────────────────")


if __name__ == "__main__":
    main()
