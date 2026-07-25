#!/usr/bin/env python3
"""
GestaltView repo alignment ingestion script.

Purpose:
- scan GestaltView runtime + corpus repos
- preserve original text
- chunk deterministically
- build a machine-readable run manifest
- optionally send batches to Supabase Edge Function gsvw-ingest-batch

Safety:
- dry-run unless --apply is passed
- no delete operations
- content-hash dedupe is handled server-side
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import mimetypes
import os
import re
import sys
import time
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import request, error

TEXT_EXTENSIONS = {
    ".md", ".txt", ".json", ".yaml", ".yml", ".csv", ".py", ".ts", ".tsx",
    ".js", ".jsx", ".sql", ".html", ".css", ".toml", ".xml", ".ipynb", ".pdf",
}

DEFAULT_EXCLUDE = [
    ".git/**", "node_modules/**", "dist/**", ".next/**", ".vercel/**", "coverage/**",
    "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.mp3", "*.wav", "*.mp4", "*.mov",
    "*.zip", "*.tar", "*.gz", "*.sqlite", "*.db",
]

@dataclass
class Chunk:
    chunk_index: int
    total_chunks: int
    content: str
    content_hash: str
    char_count: int
    token_estimate: int
    tags: list[str]
    metadata: dict[str, Any]

@dataclass
class Document:
    source_repo: str
    source_label: str
    source_branch: str | None
    source_commit: str | None
    source_path: str
    source_url: str | None
    lane: str
    document_type: str
    title: str | None
    mime_type: str
    file_size_bytes: int
    char_count: int
    content_hash: str
    raw_text: str
    tags: list[str]
    metadata: dict[str, Any]
    chunks: list[dict[str, Any]]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize_rel(path: Path) -> str:
    return path.as_posix().lstrip("./")


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def is_match(path: str, patterns: list[str]) -> bool:
    path = path.replace("\\", "/")
    for pattern in patterns:
        p = pattern.replace("\\", "/")
        if fnmatch.fnmatch(path, p) or fnmatch.fnmatch(Path(path).name, p):
            return True
        if p.endswith("/**") and path.startswith(p[:-3]):
            return True
    return False


def flatten_legacy_corpus_map(config: dict[str, Any], runtime_root: Path) -> dict[str, Any]:
    """Accept both the current object-shaped corpus-map and the new sources[] map."""
    if "sources" in config:
        return config

    packages = config.get("packages")
    if isinstance(packages, list):
        return {
            "schema_version": config.get("schema_version", "legacy-list"),
            "sources": [
                {
                    "source_repo": "DigitalConsciousness/gestaltview-v2.0",
                    "source_label": "runtime",
                    "local_path": str(runtime_root),
                    "lane": "runtime",
                    "include": [item for pkg in packages for item in pkg.get("directories", [])],
                }
            ],
        }

    if isinstance(packages, dict):
        include: list[str] = []
        for _slug, paths in packages.items():
            if isinstance(paths, list):
                include.extend(paths)
        return {
            "schema_version": "legacy-object",
            "chunking": config.get("chunking", {}),
            "exclude": config.get("exclude", DEFAULT_EXCLUDE),
            "sources": [
                {
                    "source_repo": "DigitalConsciousness/gestaltview-v2.0",
                    "source_label": "runtime",
                    "local_path": str(runtime_root),
                    "lane": "runtime",
                    "include": include,
                }
            ],
        }

    raise ValueError("Map file must contain either sources[] or packages.")


def extract_ipynb(path: Path) -> str:
    try:
        data = load_json(path)
    except Exception:
        return ""
    parts: list[str] = []
    for cell in data.get("cells", []):
        cell_type = cell.get("cell_type", "cell")
        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)
        if str(source).strip():
            parts.append(f"\n\n--- {cell_type} cell ---\n{source}")
    return "".join(parts).strip()


def extract_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception:
        try:
            import pdfplumber  # type: ignore
            parts: list[str] = []
            with pdfplumber.open(str(path)) as pdf:
                for page in pdf.pages:
                    parts.append(page.extract_text() or "")
            return "\n".join(parts).strip()
        except Exception:
            return ""


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".ipynb":
        return extract_ipynb(path)
    if suffix == ".pdf":
        return extract_pdf(path)

    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            text = path.read_text(encoding=encoding)
            return text.replace("\r\n", "\n")
        except UnicodeDecodeError:
            continue
        except Exception:
            return ""
    return ""


def chunk_text(text: str, max_chars: int, overlap_chars: int) -> list[str]:
    if not text.strip():
        return []
    chunks: list[str] = []
    start = 0
    length = len(text)
    while start < length:
        end = min(start + max_chars, length)
        if end < length:
            break_at = text.rfind("\n\n", start, end)
            if break_at <= start:
                break_at = text.rfind("\n", start, end)
            if break_at <= start:
                candidates = [text.rfind(sep, start, end) for sep in [". ", "! ", "? ", "; "]]
                break_at = max(candidates)
                if break_at > start:
                    break_at += 1
            if break_at > start:
                end = break_at
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = max(end - overlap_chars, end) if end >= length else max(0, end - overlap_chars)
        if start >= length:
            break
        # prevent pathological zero progress
        if chunks and start < length and len(chunks) > 1_000_000:
            raise RuntimeError("chunking runaway detected")
    return chunks


def classify_document(path: str, hints: dict[str, str] | None = None) -> str:
    lower = path.lower()
    if hints:
        for needle, label in hints.items():
            if needle.lower() in lower:
                return label
    rules = {
        "orientation": "orientation",
        "invariant": "governance",
        "constitution": "governance",
        "schema": "schema",
        "migration": "schema",
        "supabase": "database_or_edge_function",
        "embodiment": "embodiment_source",
        "profile": "profile_source",
        "plk": "plk_source",
        "billy": "billy_source",
        "transcript": "transcript",
        "currentstate": "state_log",
        "readme": "readme",
        "spec": "implementation_spec",
        "api/": "runtime_api",
    }
    for needle, label in rules.items():
        if needle in lower:
            return label
    return "general"


def derive_tags(path: str, text: str, lane: str) -> list[str]:
    lower_path = path.lower()
    lower_head = text[:1500].lower()
    tags = [lane]
    keywords = [
        "gestaltview", "billy", "bucket", "plk", "loom", "memory", "supabase", "edge-function",
        "embodiment", "agent", "trainer", "dynamic-inner-world", "external-scaffold", "creation-corner",
        "sanctuary", "blackboard", "schema", "migration", "orientation", "invariant", "codex",
    ]
    for kw in keywords:
        needle = kw.replace("-", "_")
        if kw in lower_path or kw in lower_head or needle in lower_path or needle in lower_head:
            tags.append(kw)
    return list(dict.fromkeys(tags))


def source_url(source_repo: str, branch: str | None, path: str) -> str | None:
    if not source_repo or "/" not in source_repo:
        return None
    ref = branch or "main"
    return f"https://github.com/{source_repo}/blob/{ref}/{path}"


def discover_source(source: dict[str, Any], global_exclude: list[str], runtime_root: Path) -> list[Path]:
    base = Path(source.get("local_path") or ".")
    if not base.is_absolute():
        base = (runtime_root / base).resolve()
    if not base.exists():
        print(f"[warn] Source path does not exist, skipping: {base}", file=sys.stderr)
        return []

    include = source.get("include") or ["**/*"]
    exclude = global_exclude + source.get("exclude", [])
    found: dict[str, Path] = {}

    for pattern in include:
        pattern = str(pattern).replace("\\", "/")
        # Existing files/directories from legacy maps are supported.
        candidate = (base / pattern).resolve()
        if candidate.exists() and candidate.is_file():
            rel = normalize_rel(candidate.relative_to(base))
            if not is_match(rel, exclude):
                found[rel] = candidate
            continue
        if candidate.exists() and candidate.is_dir():
            glob_pattern = "**/*"
            root = candidate
        else:
            root = base
            glob_pattern = pattern

        for path in root.glob(glob_pattern):
            if not path.is_file():
                continue
            rel = normalize_rel(path.relative_to(base))
            if is_match(rel, exclude):
                continue
            if path.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            found[rel] = path

    return [found[key] for key in sorted(found)]


def build_document(path: Path, source: dict[str, Any], runtime_root: Path, max_chars: int, overlap: int) -> Document | None:
    base = Path(source.get("local_path") or ".")
    if not base.is_absolute():
        base = (runtime_root / base).resolve()
    rel = normalize_rel(path.relative_to(base))
    raw = extract_text(path)
    if not raw.strip():
        return None

    source_repo = source.get("source_repo", "unknown/unknown")
    branch = source.get("source_branch") or source.get("branch")
    lane = source.get("lane", "corpus")
    tags = derive_tags(rel, raw, lane)
    doc_type = classify_document(rel, source.get("document_type_hints"))
    content_hash = sha256_text(raw)
    chunks_raw = chunk_text(raw, max_chars=max_chars, overlap_chars=overlap)
    chunks: list[dict[str, Any]] = []
    for idx, chunk in enumerate(chunks_raw):
        chunks.append(asdict(Chunk(
            chunk_index=idx,
            total_chunks=len(chunks_raw),
            content=chunk,
            content_hash=sha256_text(chunk),
            char_count=len(chunk),
            token_estimate=max(1, len(chunk) // 4),
            tags=tags,
            metadata={
                "preserve_original": True,
                "chunking": {"max_chars": max_chars, "overlap_chars": overlap},
            },
        )))

    mime_type = mimetypes.guess_type(path.name)[0] or "text/plain"
    title = path.stem.replace("_", " ").replace("-", " ").strip() or path.name
    return Document(
        source_repo=source_repo,
        source_label=source.get("source_label", lane),
        source_branch=branch,
        source_commit=source.get("source_commit"),
        source_path=rel,
        source_url=source_url(source_repo, branch, rel),
        lane=lane,
        document_type=doc_type,
        title=title,
        mime_type=mime_type,
        file_size_bytes=path.stat().st_size,
        char_count=len(raw),
        content_hash=content_hash,
        raw_text=raw,
        tags=tags,
        metadata={
            "ingested_by": "scripts/gsvw_align_ingest.py",
            "local_path": str(path),
            "file_sha256": sha256_bytes(path.read_bytes()),
            "preserve_original": True,
        },
        chunks=chunks,
    )


def post_json(url: str, payload: dict[str, Any], secret: str, timeout: int = 120) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-gsvw-ingest-secret": secret,
        },
    )
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {"ok": True}
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {body}") from exc


def batched(items: list[Any], batch_size: int) -> list[list[Any]]:
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]


def write_run_manifest(output_dir: Path, run_payload: dict[str, Any]) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"run-{run_payload['run_id']}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(run_payload, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description="GestaltView repo alignment ingestion")
    parser.add_argument("--map", default="config/gsvw-ingestion-map.example.json", help="Path to ingestion map JSON")
    parser.add_argument("--runtime-root", default=".", help="Runtime repo root")
    parser.add_argument("--edge-url", default=os.environ.get("GESTALTVIEW_INGEST_EDGE_URL") or (os.environ.get("SUPABASE_URL", "").rstrip("/") + "/functions/v1/gsvw-ingest-batch" if os.environ.get("SUPABASE_URL") else ""))
    parser.add_argument("--secret", default=os.environ.get("GESTALTVIEW_INGEST_SECRET", ""), help="Shared secret for Edge Function")
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument("--dry-run", action="store_true", help="Build manifest only; do not write")
    parser.add_argument("--apply", action="store_true", help="Actually write to Supabase Edge Function")
    parser.add_argument("--output-dir", default=".gsvw-ingestion")
    parser.add_argument("--max-docs", type=int, default=0, help="Limit documents for testing")
    args = parser.parse_args()

    runtime_root = Path(args.runtime_root).resolve()
    map_path = Path(args.map)
    if not map_path.is_absolute():
        map_path = (runtime_root / map_path).resolve()

    config = flatten_legacy_corpus_map(load_json(map_path), runtime_root)
    chunk_cfg = config.get("chunking", {})
    max_chars = int(chunk_cfg.get("max_chars", 4500))
    overlap = int(chunk_cfg.get("overlap_chars", 300))
    global_exclude = list(dict.fromkeys(DEFAULT_EXCLUDE + config.get("exclude", [])))

    run_id = str(uuid.uuid4())
    documents: list[dict[str, Any]] = []
    source_repos: list[str] = []
    started = time.time()

    for source in config.get("sources", []):
      source_repos.append(source.get("source_repo", "unknown/unknown"))
      paths = discover_source(source, global_exclude, runtime_root)
      print(f"[scan] {source.get('source_repo')} -> {len(paths)} candidate files")
      for path in paths:
          doc = build_document(path, source, runtime_root, max_chars=max_chars, overlap=overlap)
          if doc is None:
              continue
          documents.append(asdict(doc))
          if args.max_docs and len(documents) >= args.max_docs:
              break
      if args.max_docs and len(documents) >= args.max_docs:
          break

    manifest = {
        "schema_version": "1.0.0",
        "run_id": run_id,
        "created_at": utc_now(),
        "runtime_root": str(runtime_root),
        "map_path": str(map_path),
        "source_repos": sorted(set(source_repos)),
        "document_count": len(documents),
        "chunk_count": sum(len(doc.get("chunks", [])) for doc in documents),
        "content_hash": sha256_text(json.dumps([{ "p": d["source_path"], "h": d["content_hash"] } for d in documents], sort_keys=True)),
        "mode": "apply" if args.apply else "dry_run",
    }

    run_payload = {
        "run_id": run_id,
        "run_label": f"GestaltView alignment {utc_now()}",
        "source_repos": sorted(set(source_repos)),
        "dry_run": not args.apply,
        "manifest": manifest,
        "documents": documents,
    }

    out = write_run_manifest(Path(args.output_dir), run_payload)
    print(f"[manifest] wrote {out}")
    print(f"[summary] documents={manifest['document_count']} chunks={manifest['chunk_count']} mode={manifest['mode']}")

    if not args.apply:
        print("[safe] dry run complete. Re-run with --apply to write through the Edge Function.")
        return 0

    if args.dry_run:
        print("[error] --dry-run and --apply conflict. Choose one.", file=sys.stderr)
        return 2
    if not args.edge_url:
        print("[error] --edge-url or SUPABASE_URL is required for --apply", file=sys.stderr)
        return 2
    if not args.secret:
        print("[error] --secret or GESTALTVIEW_INGEST_SECRET is required for --apply", file=sys.stderr)
        return 2

    total_docs = 0
    total_chunks = 0
    responses: list[dict[str, Any]] = []
    for idx, batch in enumerate(batched(documents, args.batch_size), start=1):
        payload = {
            "run_label": run_payload["run_label"],
            "source_repos": run_payload["source_repos"],
            "dry_run": False,
            "manifest": {**manifest, "batch_index": idx},
            "documents": batch,
        }
        print(f"[write] batch {idx}: {len(batch)} docs")
        resp = post_json(args.edge_url, payload, args.secret)
        responses.append(resp)
        total_docs += int(resp.get("documents_written", 0)) + int(resp.get("documents_seen", 0))
        total_chunks += int(resp.get("chunks_written", 0))

    elapsed = time.time() - started
    result_path = Path(args.output_dir) / f"run-{run_id}-responses.json"
    with result_path.open("w", encoding="utf-8") as f:
        json.dump({"run_id": run_id, "responses": responses}, f, indent=2)
        f.write("\n")
    print(f"[done] docs_seen_or_written={total_docs} chunks_written={total_chunks} elapsed={elapsed:.1f}s")
    print(f"[responses] wrote {result_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
