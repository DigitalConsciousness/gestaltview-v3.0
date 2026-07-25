#!/usr/bin/env python3
"""
Billy Knowledge Repository — Supabase Ingestion Pipeline
=========================================================
Reads the entire GestaltView corpus (/home/ubuntu/gv_corpus),
chunks each document, generates embeddings (Google/OpenAI), and seeds
the Supabase `knowledge_fragments` table.

Usage:
    python3 scripts/seed_billy_knowledge.py

Required environment variables (set in .env or CI secrets — NEVER hardcode):
    SUPABASE_URL          - your project URL (https://xxxx.supabase.co)
    SUPABASE_KEY          - anon or service-role key
    GEMINI_API_KEY        - (optional, preferred) Google embedding provider
    OPENAI_API_KEY        - (optional, fallback) OpenAI embedding provider

Example .env (this file is gitignored — never commit it):
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_KEY=eyJ...
    GEMINI_API_KEY=AIza...
"""

import os
import sys
import json
import time
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import requests

# ─── Configuration ────────────────────────────────────────────────────────────

# Load from environment — hard fail if missing
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_KEY must be set as environment variables.")
    print("  Never hardcode credentials in source files.")
    print("  Add them to your .env file (which is gitignored) or set them in CI secrets.")
    sys.exit(1)

CORPUS_DIR    = Path(os.environ.get("CORPUS_DIR", "/home/ubuntu/gv_corpus"))
CHUNK_SIZE    = int(os.environ.get("CHUNK_SIZE", "600"))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "80"))
BATCH_SIZE    = int(os.environ.get("BATCH_SIZE", "20"))

# Embeddings Models
EMBED_MODEL_OPENAI = "text-embedding-3-small"
EMBED_MODEL_GEMINI = "models/text-embedding-004"

# ─── Document type classification ─────────────────────────────────────────────

DOCUMENT_TYPE_MAP = {
    # Protocols
    "genesis-protocol": "Protocol",
    "genesis_protocol": "Protocol",
    # PLK / Personalization
    "plk": "PLK",
    "personal_language_key": "PLK",
    "gestaltview-plk": "PLK",
    "gestaltview_enhanced_plk": "PLK",
    "plk_engine": "PLK",
    "plk_system": "PLK",
    # Billy
    "billy": "Billy",
    "Billy": "Billy",
    "billys_room": "Billy",
    "SQLITE_Billy": "Billy",
    # Context / Loom
    "context_weaver": "ContextWeaver",
    "loom": "Loom",
    "consciousness_middleware": "Consciousness",
    "consciousness": "Consciousness",
    # Engines
    "brain-sparks": "Engine",
    "brain_sparks": "Engine",
    "ai_orchestrator": "Engine",
    "ai_core": "Engine",
    "llm_router": "Engine",
    "llmrouter": "Engine",
    "llm_service": "Engine",
    "prompt_templates": "Engine",
    # Philosophy / Narrative
    "Wellness_Witness": "Philosophy",
    "gestalt.py.md": "Philosophy",
    "gestaltview_system": "Philosophy",
    "keith-plk": "Philosophy",
    # Products
    "resume": "Product",
    "vibe": "Product",
    "musical_dna": "Product",
    "spotify": "Product",
    "exhibit": "Product",
    # Infrastructure
    "auth": "Infrastructure",
    "schemas": "Infrastructure",
    "sqlite_store": "Infrastructure",
    "enhanced_database": "Infrastructure",
    "gestaltview_seed": "Infrastructure",
    # Transcripts
    "Billy_11_18": "Transcript",
    "11_18": "Transcript",
    # Routes / API
    "routes": "API",
    "route": "API",
    "router": "API",
    "api": "API",
}

# ─── Tag extraction ────────────────────────────────────────────────────────────

CONCEPT_TAGS = {
    "PLK": ["plk", "personal language key", "resonance", "linguistic pattern"],
    "Billy": ["billy", "collaborator friend", "training loop", "beautiful tapestry"],
    "Consciousness": ["consciousness", "consciousness-serving", "co-consciousness", "symbiosis"],
    "ADHD": ["adhd", "neurodivergent", "lightning bolt", "bucket drop", "exploded picture"],
    "Genesis": ["genesis protocol", "brain sparks", "ignite", "musical dna"],
    "Loom": ["loom", "context weaver", "knowledge loom", "manifest index"],
    "Ethics": ["ethics", "ethical", "constitutional invariant", "never look away"],
    "Founder": ["founder", "keith soyka", "solo", "unfunded", "gestaltview"],
    "Architecture": ["engine", "orchestrator", "adapter", "pipeline", "schema"],
    "Paradox": ["paradox", "operationalized paradox", "hold paradox", "contradiction"],
    "Resonance": ["resonance loop", "third-order", "symbiosis", "co-becoming"],
    "Products": ["symbiocoder", "resume rockstar", "vibecoder", "neural handshake"],
}

def extract_tags(content: str, filename: str) -> List[str]:
    """Extract relevant concept tags from content and filename."""
    tags = set()
    content_lower = content.lower()
    fname_lower = filename.lower()

    for tag, keywords in CONCEPT_TAGS.items():
        for kw in keywords:
            if kw in content_lower or kw in fname_lower:
                tags.add(tag)
                break

    return sorted(list(tags))

def classify_document(filename: str) -> str:
    """Classify a document into a type based on its filename."""
    fname = filename.lower()
    for pattern, doc_type in DOCUMENT_TYPE_MAP.items():
        if pattern.lower() in fname:
            return doc_type
    # Extension-based fallback
    if fname.endswith(('.md', '.txt')):
        return "Documentation"
    if fname.endswith('.py') or fname.endswith('.py.txt'):
        return "Code"
    if fname.endswith('.ts') or fname.endswith('.tsx'):
        return "Frontend"
    return "General"

# ─── Chunking ─────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks, respecting sentence boundaries."""
    text = re.sub(r'\n{3,}', '\n\n', text.strip())

    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        if end < len(text):
            search_start = max(start, end - 150)
            boundary = -1
            for sep in ['. ', '.\n', '! ', '? ', '\n\n']:
                pos = text.rfind(sep, search_start, end)
                if pos > boundary:
                    boundary = pos + len(sep)

            if boundary > start + chunk_size // 2:
                end = boundary

        chunk = text[start:end].strip()
        if len(chunk) > 50:
            chunks.append(chunk)

        start = end - overlap

    return chunks

# ─── Embedding ────────────────────────────────────────────────────────────────

def get_embeddings(texts: List[str]) -> List[Optional[List[float]]]:
    """Generate embeddings using available provider (Google priority for free tier)."""

    # 1. Try Google Gemini first
    google_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if google_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{EMBED_MODEL_GEMINI}:batchEmbedContents?key={google_key}"
            payload = {
                "requests": [
                    {"model": EMBED_MODEL_GEMINI, "content": {"parts": [{"text": t}]}, "taskType": "RETRIEVAL_DOCUMENT"}
                    for t in texts
                ]
            }
            resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                if "embeddings" in data:
                    return [e.get("values") for e in data["embeddings"]]
        except Exception as e:
            print(f"  ⚠ Google Embedding failed: {e}")

    # 2. Fallback to OpenAI
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            resp = requests.post(
                "https://api.openai.com/v1/embeddings",
                headers=headers,
                json={"model": EMBED_MODEL_OPENAI, "input": texts},
                timeout=30,
            )
            if resp.status_code == 200:
                return [item["embedding"] for item in resp.json()["data"]]
        except Exception as e:
            print(f"  ⚠ OpenAI Embedding failed: {e}")

    print("  ⚠ No embedding provider available or all failed.")
    return [None] * len(texts)

# ─── Supabase insertion ────────────────────────────────────────────────────────

def insert_fragments(fragments: List[Dict[str, Any]]) -> int:
    """Insert a batch of fragments into Supabase. Returns count inserted."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/knowledge_fragments",
        headers=headers,
        json=fragments,
        timeout=30,
    )

    if resp.status_code in (200, 201):
        return len(fragments)
    else:
        print(f"  ✗ Insert failed ({resp.status_code}): {resp.text[:200]}")
        return 0

def table_exists() -> bool:
    """Check if the knowledge_fragments table exists."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/knowledge_fragments?limit=1",
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
        timeout=10,
    )
    return resp.status_code == 200

def get_existing_hashes() -> set:
    """Get content hashes of already-ingested fragments to avoid duplicates."""
    hashes = set()
    offset = 0
    while True:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/knowledge_fragments?select=content_hash&limit=1000&offset={offset}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=15,
        )
        if resp.status_code != 200:
            break
        data = resp.json()
        if not data:
            break
        for row in data:
            if row.get("content_hash"):
                hashes.add(row["content_hash"])
        if len(data) < 1000:
            break
        offset += 1000
    return hashes

# ─── Main pipeline ────────────────────────────────────────────────────────────

def main():
    print("🧠 Billy Knowledge Repository — Supabase Ingestion Pipeline")
    print("=" * 60)
    print(f"Project URL: {SUPABASE_URL}")
    print(f"Corpus dir:  {CORPUS_DIR}")
    print()

    if not table_exists():
        print("✗ Table 'knowledge_fragments' not found in Supabase.")
        print("  Please run the SQL migration first (scripts/run_migration.py)")
        sys.exit(1)

    print(f"✓ Connected to Supabase")

    print("  Checking for existing fragments...")
    existing_hashes = get_existing_hashes()
    print(f"  Found {len(existing_hashes)} existing fragments")

    corpus_files = sorted(CORPUS_DIR.glob("**/*"))
    corpus_files = [f for f in corpus_files if f.is_file()]
    print(f"\n📂 Found {len(corpus_files)} files in corpus")

    SKIP_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.pyc', '.db', '.sqlite'}
    corpus_files = [f for f in corpus_files if f.suffix.lower() not in SKIP_EXTENSIONS]
    print(f"  Processing {len(corpus_files)} text files")

    total_fragments = 0
    total_inserted = 0
    batch = []

    for i, filepath in enumerate(corpus_files):
        try:
            content = filepath.read_text(encoding='utf-8', errors='replace')
        except Exception as e:
            print(f"  ⚠ Could not read {filepath.name}: {e}")
            continue

        if len(content.strip()) < 100:
            continue

        doc_type = classify_document(filepath.name)
        tags = extract_tags(content, filepath.name)
        chunks = chunk_text(content)

        print(f"  [{i+1}/{len(corpus_files)}] {filepath.name} → {len(chunks)} chunks ({doc_type})")

        for chunk_idx, chunk in enumerate(chunks):
            content_hash = hashlib.sha256(chunk.encode()).hexdigest()

            if content_hash in existing_hashes:
                continue

            fragment = {
                "content": chunk,
                "content_hash": content_hash,
                "source_file": filepath.name,
                "document_type": doc_type,
                "chunk_index": chunk_idx,
                "total_chunks": len(chunks),
                "char_count": len(chunk),
                "tags": tags,
            }
            batch.append(fragment)
            total_fragments += 1

            if len(batch) >= BATCH_SIZE:
                texts = [f["content"] for f in batch]
                embeddings = get_embeddings(texts)

                for j, emb in enumerate(embeddings):
                    if emb is not None:
                        batch[j]["embedding"] = emb

                valid_batch = [b for b in batch if "embedding" in b]

                if valid_batch:
                    inserted = insert_fragments(valid_batch)
                    total_inserted += inserted
                    print(f"    ✓ Inserted batch of {inserted} fragments (total: {total_inserted})")

                batch = []
                time.sleep(1.0)

    # Flush remaining
    if batch:
        texts = [f["content"] for f in batch]
        embeddings = get_embeddings(texts)
        for j, emb in enumerate(embeddings):
            if emb is not None:
                batch[j]["embedding"] = emb

        valid_batch = [b for b in batch if "embedding" in b]
        if valid_batch:
            inserted = insert_fragments(valid_batch)
            total_inserted += inserted

    print(f"\n✅ Pipeline complete!")
    print(f"   Total fragments processed: {total_fragments}")
    print(f"   Total fragments inserted:  {total_inserted}")
    print(f"   Skipped (duplicates):      {total_fragments - total_inserted}")

if __name__ == "__main__":
    main()
