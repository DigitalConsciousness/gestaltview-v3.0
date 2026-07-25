#!/usr/bin/env python3
"""Generic corpus ingestion scaffold for GestaltView Agent Trainer buyers.

This script is intentionally provider-agnostic at the corpus parsing layer and supports
Supabase and Redis vector backends through environment variables.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


def _load_dotenv(path: str = ".env.local") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


@dataclass
class Fragment:
    lane: str
    source: str
    chunk_id: str
    text: str


SUPPORTED_EXTENSIONS = {".md", ".txt", ".json", ".ts", ".tsx", ".js", ".py", ".sql"}


def iter_documents(root: Path) -> Iterable[tuple[Path, str]]:
    for path in root.rglob("*"):
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS or not path.is_file():
            continue
        try:
            yield path, path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue


def split_fragments(text: str, lane: str, source: str, chunk_size: int = 1200, overlap: int = 200) -> list[Fragment]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []
    chunks: list[Fragment] = []
    idx = 0
    start = 0
    stride = max(chunk_size - overlap, 200)
    while start < len(cleaned):
        piece = cleaned[start : start + chunk_size].strip()
        if not piece:
            break
        chunk_hash = hashlib.sha1(f"{source}:{idx}:{piece}".encode("utf-8")).hexdigest()[:16]
        chunks.append(Fragment(lane=lane, source=source, chunk_id=chunk_hash, text=piece))
        start += stride
        idx += 1
    return chunks


def embed_stub(text: str, dim: int = 768) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    vector = [((digest[i % len(digest)] / 255.0) * 2.0) - 1.0 for i in range(dim)]
    return vector


def write_supabase_jsonl(fragments: list[Fragment], out_file: Path) -> None:
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with out_file.open("w", encoding="utf-8") as handle:
        for frag in fragments:
            payload = {
                "chunk_id": frag.chunk_id,
                "lane": frag.lane,
                "source": frag.source,
                "text": frag.text,
                "embedding": embed_stub(frag.text),
            }
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")


def write_redis_json(fragments: list[Fragment], out_file: Path, index_name: str) -> None:
    out_file.parent.mkdir(parents=True, exist_ok=True)
    docs = []
    for frag in fragments:
        docs.append(
            {
                "id": f"frag:{frag.chunk_id}",
                "lane": frag.lane,
                "source": frag.source,
                "text": frag.text,
                "embedding": embed_stub(frag.text),
                "index": index_name,
            }
        )
    out_file.write_text(json.dumps(docs, ensure_ascii=False, indent=2), encoding="utf-8")


def resolve_lane(path: Path, repo_root: Path) -> str:
    rel = path.relative_to(repo_root).as_posix().lower()
    if rel.startswith(("docs/", "knowledge/", "wiki/")):
        return "knowledge"
    if rel.startswith(("src/", "api/", "server/", "client/", "scripts/")):
        return "code"
    if rel.startswith(("product/", "roadmap/", "spec/")):
        return "product"
    return "context"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generic corpus ingestion scaffold")
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--backend", choices=["supabase", "redis"], default=os.getenv("GV_VECTOR_BACKEND", "supabase"))
    parser.add_argument("--output", default="artifacts/ingestion/payload.json")
    parser.add_argument("--redis-index", default=os.getenv("GV_REDIS_INDEX", "gv_knowledge"))
    args = parser.parse_args()

    _load_dotenv()

    repo_root = Path(args.repo_root).resolve()
    fragments: list[Fragment] = []
    for path, content in iter_documents(repo_root):
        lane = resolve_lane(path, repo_root)
        source = path.relative_to(repo_root).as_posix()
        fragments.extend(split_fragments(content, lane=lane, source=source))

    output_path = Path(args.output)
    if args.backend == "supabase":
        write_supabase_jsonl(fragments, output_path)
    else:
        write_redis_json(fragments, output_path, index_name=args.redis_index)

    summary = {
        "backend": args.backend,
        "repo_root": str(repo_root),
        "fragments": len(fragments),
        "output": str(output_path),
        "note": "Payload generated. Connect this artifact to your own upsert job with buyer-owned credentials.",
    }
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
