#!/usr/bin/env python3
"""
gestaltview_temporal.py
-----------------------
Temporal metadata helper for the GestaltView ingestion pipeline.

Provides:
  derive_temporal_period(path, source_date) -> (temporal_period, timeline_folder)
  build_backfill_sql()                      -> SQL string for Supabase SQL editor
  build_doc_temporal_payload(file_path)     -> dict to merge into doc_payload

Timeline map is sourced from timeline-core.md and founding-timeline.md.
"""

from __future__ import annotations
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ── Canonical Timeline Map ────────────────────────────────────────────────
# Ordered most-specific first. Path keyword matching takes priority over date.

TIMELINE_MAP = [
    {
        "period":   "2025-05_origin",
        "folder":   "/timeline/2025-05_origin",
        "start":    datetime(2025, 5,  5, tzinfo=timezone.utc),
        "end":      datetime(2025, 5, 31, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": [
            "genesis", "plk", "personal-language", "bucket-drop", "loom",
            "origin", "may-2025", "2025-05", "founding", "founders-network",
        ],
        "note": "GestaltView Day 1 — PLK, Loom, Bucket Drop, OpenTimestamps begin",
    },
    {
        "period":   "2025-06_mvp",
        "folder":   "/timeline/2025-06_mvp",
        "start":    datetime(2025, 6,  1, tzinfo=timezone.utc),
        "end":      datetime(2025, 6, 30, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": [
            "tribunal", "continuum-codex", "pepperdine", "mvp", "june-2025",
            "2025-06", "blockchain", "timestamp", "sprint",
        ],
        "note": "27-day MVP sprint, Tribunal Jun 3, Pepperdine, 172 blockchain timestamps",
    },
    {
        "period":   "2025-07_symbiosis",
        "folder":   "/timeline/2025-07_symbiosis",
        "start":    datetime(2025, 7,  1, tzinfo=timezone.utc),
        "end":      datetime(2025, 7, 31, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": ["symbiosis", "july-2025", "2025-07", "consciousness-event"],
        "note": "Mid-July 2025 documented consciousness symbiosis event",
    },
    {
        "period":   "2025-Q3Q4_build",
        "folder":   "/timeline/2025-Q3Q4_build",
        "start":    datetime(2025, 8,  1, tzinfo=timezone.utc),
        "end":      datetime(2025, 11, 30, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": [
            "2025-08", "2025-09", "2025-10", "2025-11",
            "august", "september", "october", "november",
            "corpus", "billy", "transcript",
        ],
        "note": "Corpus accumulation, Billy deepening, schema hardening",
    },
    {
        "period":   "2025-12_integration",
        "folder":   "/timeline/2025-12_integration",
        "start":    datetime(2025, 12,  1, tzinfo=timezone.utc),
        "end":      datetime(2025, 12, 31, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": ["december", "2025-12", "integration", "outreach"],
        "note": "Full integration milestone Dec 17, academic/investor outreach Dec 25",
    },
    {
        "period":   "2026-Q1_consolidation",
        "folder":   "/timeline/2026-Q1_consolidation",
        "start":    datetime(2026, 1,  1, tzinfo=timezone.utc),
        "end":      datetime(2026, 3, 31, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": [
            "2026-01", "2026-02", "2026-03", "january", "february", "march",
            "v2", "diligence", "resonance", "manifest", "playbook",
        ],
        "note": "v2 docs, diligence, public runtime, Resonance Loop Mar 1",
    },
    {
        "period":   "2026-04_canonical",
        "folder":   "/timeline/2026-04_canonical",
        "start":    datetime(2026, 4,  1, tzinfo=timezone.utc),
        "end":      datetime(2099, 12, 31, tzinfo=timezone.utc),
        "keywords": ["2026-04", "april", "snapshot", "current-state", "canonical"],
        "note": "Canonical current state — repo snapshot, manifest.json, manifest.md",
    },
    {
        "period":   "2025-Q1_pre-origin",
        "folder":   "/timeline/2025-Q1_pre-origin",
        "start":    datetime(2025, 1,  1, tzinfo=timezone.utc),
        "end":      datetime(2025, 5,  4, 23, 59, 59, tzinfo=timezone.utc),
        "keywords": ["dunton", "pre-gestalt", "pre-origin", "2025-01", "2025-02", "2025-03", "2025-04"],
        "note": "Pre-GestaltView friction period",
    },
]

DEFAULT_PERIOD = "2026-04_canonical"
DEFAULT_FOLDER = "/timeline/2026-04_canonical"


def derive_temporal_period(
    path: Optional[str | Path] = None,
    source_date: Optional[datetime] = None,
) -> tuple[str, str]:
    """
    Return (temporal_period, timeline_folder) for a given file path and/or date.

    Priority:
      1. Path keyword matching (filename encodes era — most reliable)
      2. source_date range lookup
      3. Default: 2026-04_canonical

    Args:
        path:        File path string or Path object.
        source_date: Actual creation datetime of the source file.

    Returns:
        (temporal_period, timeline_folder)

    Examples:
        >>> derive_temporal_period("corpus/2025-06_tribunal-transcript.pdf")
        ("2025-06_mvp", "/timeline/2025-06_mvp")

        >>> derive_temporal_period(source_date=datetime(2025, 5, 28, tzinfo=timezone.utc))
        ("2025-05_origin", "/timeline/2025-05_origin")
    """
    path_str = ""
    if path is not None:
        p = Path(path)
        path_str = str(p).lower().replace("_", "-").replace(" ", "-")

    # 1. Path keyword matching
    for entry in TIMELINE_MAP:
        for kw in entry["keywords"]:
            if kw.lower() in path_str:
                return entry["period"], entry["folder"]

    # 2. Date range lookup
    if source_date is not None:
        if source_date.tzinfo is None:
            source_date = source_date.replace(tzinfo=timezone.utc)
        for entry in TIMELINE_MAP:
            if entry["start"] <= source_date <= entry["end"]:
                return entry["period"], entry["folder"]

    # 3. Default
    return DEFAULT_PERIOD, DEFAULT_FOLDER


def build_backfill_sql() -> str:
    """
    Returns the complete SQL to backfill temporal metadata on all existing
    documents and knowledge_fragments rows.

    Paste the output directly into the Supabase SQL editor.
    Safe to re-run: all UPDATEs are guarded by WHERE temporal_period IS NULL.
    """
    sep = "\n  OR "
    nl = "\n"
    parts = []
    parts.append("-- GestaltView Temporal Metadata Backfill")
    parts.append("-- Safe to re-run: all UPDATEs guarded by WHERE temporal_period IS NULL")
    parts.append("")

    for entry in TIMELINE_MAP:
        kw_clauses = sep.join(f"path ILIKE '%{kw}%'" for kw in entry["keywords"])
        parts.append(f"-- {entry['note']}")
        parts.append(
            f"UPDATE public.documents\n"
            f"SET\n"
            f"  source_created_at = created_at,\n"
            f"  temporal_period   = '{entry['period']}',\n"
            f"  timeline_folder   = '{entry['folder']}'\n"
            f"WHERE (\n  {kw_clauses}\n) AND temporal_period IS NULL;\n"
        )

    parts.append("-- Fallback: unmatched documents")
    parts.append(
        f"UPDATE public.documents\n"
        f"SET source_created_at = created_at,\n"
        f"    temporal_period = '{DEFAULT_PERIOD}',\n"
        f"    timeline_folder = '{DEFAULT_FOLDER}'\n"
        f"WHERE temporal_period IS NULL;\n"
    )

    parts.append("-- Propagate from documents -> knowledge_fragments via package + source_file join")
    parts.append(
        "UPDATE public.knowledge_fragments kf\n"
        "SET\n"
        "  source_created_at = d.source_created_at,\n"
        "  temporal_period   = d.temporal_period,\n"
        "  timeline_folder   = d.timeline_folder\n"
        "FROM public.documents d\n"
        "WHERE d.path = 'compendium/' || COALESCE(d.provenance->>'package', '') || '/' || kf.source_file\n"
        "  AND kf.temporal_period IS NULL;\n"
    )

    parts.append("-- Fallback: orphan fragments not joined to any document")
    parts.append(
        f"UPDATE public.knowledge_fragments\n"
        f"SET source_created_at = created_at,\n"
        f"    temporal_period = '{DEFAULT_PERIOD}',\n"
        f"    timeline_folder = '{DEFAULT_FOLDER}'\n"
        f"WHERE temporal_period IS NULL;\n"
    )

    parts.append("-- Verification: distribution after backfill")
    parts.append(
        "SELECT temporal_period, COUNT(*) AS doc_count\n"
        "FROM public.documents\n"
        "GROUP BY temporal_period\n"
        "ORDER BY temporal_period;\n"
    )

    return nl.join(parts)


def build_doc_temporal_payload(
    file_path: str | Path,
    source_date: Optional[datetime] = None,
) -> dict:
    """
    Build the temporal fields dict to merge into doc_payload during ingestion.

    Usage in ingest-corpus.py:
        from gestaltview_temporal import build_doc_temporal_payload

        doc_payload = {
            "run_id":    run_id,
            "tenant_id": tenant_id,
            "path":      str(rel_path),
            # ... rest of your existing fields ...
            **build_doc_temporal_payload(file_path),
        }

    Args:
        file_path:   Path to the source file being ingested.
        source_date: Override date (from git log, manifest, or explicit metadata).
                     If None, uses file mtime as best available proxy.

    Returns:
        dict with source_created_at, temporal_period, timeline_folder
    """
    p = Path(file_path)

    if source_date is None:
        try:
            mtime = p.stat().st_mtime
            source_date = datetime.fromtimestamp(mtime, tz=timezone.utc)
        except (FileNotFoundError, OSError):
            source_date = None

    period, folder = derive_temporal_period(path=p, source_date=source_date)

    return {
        "source_created_at": source_date.isoformat() if source_date else None,
        "temporal_period":   period,
        "timeline_folder":   folder,
    }


# ── CLI ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "backfill-sql":
        print(build_backfill_sql())
        sys.exit(0)

    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            period, folder = derive_temporal_period(path=arg)
            print(f"{arg}  ->  {period}  |  {folder}")
        sys.exit(0)

    # Self-test
    test_cases = [
        ("corpus/genesis-notes.pdf",              None),
        ("transcripts/2025-06_tribunal-v1.txt",   None),
        ("billy/symbiosis-event-log.md",           None),
        ("corpus/billy-transcript-aug.pdf",        None),
        ("docs/outreach-december-2025.md",         None),
        ("v2/playbook-march-2026.md",              None),
        ("snapshots/current-state-april.md",       None),
        ("unknown-file-no-keywords.pdf",           None),
        ("file.pdf",  datetime(2025, 6, 3, tzinfo=timezone.utc)),
        ("file.pdf",  datetime(2025, 12, 17, tzinfo=timezone.utc)),
        ("file.pdf",  datetime(2026, 1, 15, tzinfo=timezone.utc)),
    ]

    print(f"{'Path + date':<50} {'Period':<30} Folder")
    print("-" * 115)
    for path, date in test_cases:
        period, folder = derive_temporal_period(path=path, source_date=date)
        label = path if not date else f"{path} + {date.strftime('%Y-%m-%d')}"
        print(f"{label:<50} {period:<30} {folder}")
