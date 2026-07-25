#!/usr/bin/env python3
"""
supabase_corpus_cleanup.py
GestaltView - Supabase corpus garbage detection and cleanup
Version: 1.1 - March 2026

PURPOSE
-------
Scans the live Supabase corpus tables for content and ingestion issues.

Default scan targets:
  - knowledge_fragments
  - skill_fragments

Optional scan target:
  - embeddings (null/stale vectors only; no content checks)

Checks:
  1. Corrupted rows with heavy replacement/control-character damage
  2. Empty / whitespace-only content rows
  3. Suspiciously short content rows
  4. Duplicate fragment slots (same source_file + chunk_index)
  5. Rows with NULL embeddings older than STALE_EMBEDDING_DAYS

MODES
-----
  --dry-run   (default) - print report, zero deletions
  --delete              - DELETE flagged rows after user confirmation
  --report              - write CSV report to ./gestaltview_cleanup_report_<ts>.csv

REQUIREMENTS
------------
  pip install supabase python-dotenv rich

ENV VARS (from .env or environment)
-----------------------------------
  SUPABASE_URL               your project URL
  SUPABASE_SERVICE_ROLE_KEY  preferred service-role key
  SUPABASE_SERVICE_KEY       accepted fallback

SAFETY
------
  - Dry-run by default; --delete requires explicit flag + YES confirmation.
  - Logs every deleted row_id to cleanup_audit_<ts>.log before deletion.
  - Default tables are the actual text corpora, not the raw embeddings table.
"""

import argparse
import csv
import logging
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

try:
    from supabase import Client, create_client
except ImportError:
    print("ERROR: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

try:
    from rich import print as rprint
    from rich.console import Console
    from rich.table import Table

    RICH = True
except ImportError:
    RICH = False


@dataclass(frozen=True)
class TableConfig:
    name: str
    scan_columns: tuple[str, ...]
    null_embedding_columns: tuple[str, ...]
    content_field: str | None = None
    duplicate_key_fields: tuple[str, ...] = ()


TARGET_TABLES = [
    "knowledge_fragments",
    "skill_fragments",
]

CORRUPTION_THRESHOLD = 20
CORRUPTION_PATTERNS = [
    r"\ufffd{5,}",
    r"[□◆■]{8,}",
    r"[\x00-\x08\x0b\x0e-\x1f]{5,}",
    r"[\ud800-\udfff]{3,}",
]
CORRUPTION_RE = re.compile("|".join(CORRUPTION_PATTERNS))

MIN_CONTENT_CHARS = 40
STALE_EMBEDDING_DAYS = 30
PAGE_SIZE = 500
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

KNOWN_TABLES: dict[str, TableConfig] = {
    "knowledge_fragments": TableConfig(
        name="knowledge_fragments",
        scan_columns=(
            "id",
            "content",
            "source_file",
            "chunk_index",
            "created_at",
        ),
        null_embedding_columns=("id", "source_file", "chunk_index", "created_at"),
        content_field="content",
        duplicate_key_fields=("source_file", "chunk_index"),
    ),
    "skill_fragments": TableConfig(
        name="skill_fragments",
        scan_columns=(
            "id",
            "content",
            "source_file",
            "chunk_index",
            "created_at",
        ),
        null_embedding_columns=("id", "source_file", "chunk_index", "created_at"),
        content_field="content",
        duplicate_key_fields=("source_file", "chunk_index"),
    ),
    "embeddings": TableConfig(
        name="embeddings",
        scan_columns=("id", "document_id", "model", "created_at"),
        null_embedding_columns=("id", "document_id", "model", "created_at"),
    ),
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("gv-cleanup")
console = Console() if RICH else None


def out(msg: str) -> None:
    if RICH:
        rprint(msg)
    else:
        print(msg)


def get_client() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_SERVICE_KEY")
    )
    if not url or not key:
        log.error(
            "SUPABASE_URL and a service-role key must be set.\n"
            "Expected SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY."
        )
        sys.exit(1)
    return create_client(url, key)


def fetch_rows(
    sb: Client,
    table: str,
    columns: tuple[str, ...],
    *,
    page_size: int,
    null_embedding_only: bool = False,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    select_clause = ",".join(columns)

    while True:
        query = sb.table(table).select(select_clause).range(offset, offset + page_size - 1)
        if null_embedding_only:
            query = query.is_("embedding", "null")
        resp = query.execute()
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    return rows


def parse_row_timestamp(row: dict[str, Any]) -> datetime | None:
    for field in ("updated_at", "created_at"):
        raw = row.get(field)
        if not raw:
            continue
        try:
            return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        except ValueError:
            continue
    return None


def row_label(table: str, row: dict[str, Any]) -> str:
    if table in {"knowledge_fragments", "skill_fragments"}:
        source_file = row.get("source_file") or "<unknown source>"
        chunk_index = row.get("chunk_index")
        if chunk_index is None:
            return str(source_file)
        return f"{source_file}#{chunk_index}"

    if table == "embeddings":
        document_id = row.get("document_id") or "<unknown document>"
        model = row.get("model")
        if model:
            return f"{document_id} [{model}]"
        return str(document_id)

    return str(row.get("id", "<unknown row>"))


def content_preview(config: TableConfig, row: dict[str, Any], limit: int = 80) -> str:
    if not config.content_field:
        return ""
    content = row.get(config.content_field)
    if not content:
        return ""
    return str(content).replace("\n", " ")[:limit]


def inspect_content(
    content: str | None,
    *,
    min_content_chars: int,
    replacement_threshold: int,
) -> list[tuple[str, str]]:
    if content is None:
        return [("MISSING_CONTENT", "content is null")]

    stripped = content.strip()
    if not stripped:
        return [("EMPTY_CONTENT", "content is empty or whitespace")]

    flags: list[tuple[str, str]] = []
    if len(stripped) < min_content_chars:
        flags.append(("SHORT_CONTENT", f"{len(stripped)} chars < {min_content_chars}"))

    replacement_count = stripped.count("\ufffd")
    if replacement_count >= replacement_threshold:
        flags.append(
            ("CORRUPTED", f"{replacement_count} replacement chars (threshold {replacement_threshold})")
        )
    elif CORRUPTION_RE.search(stripped):
        flags.append(("CORRUPTED", "control/replacement character pattern"))

    return flags


def find_stale_null_embeddings(
    rows: list[dict[str, Any]],
    *,
    cutoff: datetime,
) -> list[tuple[dict[str, Any], str]]:
    stale: list[tuple[dict[str, Any], str]] = []
    for row in rows:
        created = parse_row_timestamp(row)
        if created is None or created >= cutoff:
            continue
        stale.append((row, f"null embedding since {created.isoformat()}"))
    return stale


def find_duplicate_rows(
    rows: list[dict[str, Any]],
    *,
    key_fields: tuple[str, ...],
) -> list[tuple[dict[str, Any], str]]:
    if not key_fields:
        return []

    groups: dict[tuple[Any, ...], list[dict[str, Any]]] = {}
    for row in rows:
        key = tuple(row.get(field) for field in key_fields)
        if any(value in (None, "") for value in key):
            continue
        groups.setdefault(key, []).append(row)

    duplicates: list[tuple[dict[str, Any], str]] = []
    for key, group in groups.items():
        if len(group) < 2:
            continue

        if key_fields == ("source_file", "chunk_index"):
            reason = f"duplicate fragment slot {key[0]}#{key[1]}"
        else:
            parts = ", ".join(f"{field}={value}" for field, value in zip(key_fields, key))
            reason = f"duplicate key: {parts}"

        for row in group[1:]:
            duplicates.append((row, reason))

    return duplicates


def add_flag(
    flagged: dict[str, dict[str, Any]],
    config: TableConfig,
    row: dict[str, Any],
    flag: str,
    reason: str,
) -> None:
    row_id = row.get("id")
    if row_id is None:
        return

    entry = flagged.setdefault(
        str(row_id),
        {
            "table": config.name,
            "id": row_id,
            "row_ref": row_label(config.name, row),
            "flags": [],
            "reasons": [],
            "content_preview": content_preview(config, row),
        },
    )

    if flag not in entry["flags"]:
        entry["flags"].append(flag)
    if reason not in entry["reasons"]:
        entry["reasons"].append(reason)


def report_rows(flagged: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    rows = list(flagged.values())
    rows.sort(key=lambda row: (row["table"], str(row["row_ref"]), str(row["id"])))
    for row in rows:
        row["flags"] = ", ".join(row["flags"])
        row["reasons"] = " | ".join(row["reasons"])
    return rows


def print_rich_table(rows: list[dict[str, Any]]) -> None:
    if not RICH:
        for row in rows:
            print(row)
        return

    table = Table(title="GestaltView Corpus Cleanup Report", show_lines=True)
    table.add_column("Table", style="cyan")
    table.add_column("ID", style="dim")
    table.add_column("Row")
    table.add_column("Flags", style="bold red")
    table.add_column("Reasons")
    table.add_column("Preview", style="dim")

    for row in rows:
        table.add_row(
            row["table"],
            str(row["id"]),
            row["row_ref"],
            row["flags"],
            row["reasons"],
            row["content_preview"],
        )

    console.print(table)


def write_csv(rows: list[dict[str, Any]], path: Path) -> None:
    fields = ["table", "id", "row_ref", "flags", "reasons", "content_preview"]
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    log.info("Report written -> %s", path)


def delete_rows(sb: Client, table: str, ids: list[str], audit_path: Path) -> None:
    with open(audit_path, "a", encoding="utf-8") as audit:
        audit.write(f"\n# DELETE from {table} - {datetime.now(timezone.utc).isoformat()}\n")
        for row_id in ids:
            audit.write(f"{row_id}\n")

    log.info("Deleting %s rows from %s...", len(ids), table)
    batch_size = 100
    for index in range(0, len(ids), batch_size):
        batch_ids = ids[index : index + batch_size]
        sb.table(table).delete().in_("id", batch_ids).execute()
    log.info("Deleted %s rows from %s.", len(ids), table)


def scan_table(
    sb: Client,
    config: TableConfig,
    *,
    cutoff: datetime,
    min_content_chars: int,
    replacement_threshold: int,
    page_size: int,
) -> list[dict[str, Any]]:
    log.info("Scanning table: %s ...", config.name)

    try:
        rows = fetch_rows(sb, config.name, config.scan_columns, page_size=page_size)
        null_embedding_rows = fetch_rows(
            sb,
            config.name,
            config.null_embedding_columns,
            page_size=page_size,
            null_embedding_only=True,
        )
    except Exception as exc:
        log.warning("Could not read %s: %s - skipping.", config.name, exc)
        return []

    flagged: dict[str, dict[str, Any]] = {}
    content_issue_ids: set[str] = set()
    stale_ids: set[str] = set()
    duplicate_ids: set[str] = set()

    if config.content_field:
        for row in rows:
            for flag, reason in inspect_content(
                row.get(config.content_field),
                min_content_chars=min_content_chars,
                replacement_threshold=replacement_threshold,
            ):
                add_flag(flagged, config, row, flag, reason)
                content_issue_ids.add(str(row["id"]))

    for row, reason in find_stale_null_embeddings(null_embedding_rows, cutoff=cutoff):
        add_flag(flagged, config, row, "STALE_EMBEDDING", reason)
        stale_ids.add(str(row["id"]))

    for row, reason in find_duplicate_rows(rows, key_fields=config.duplicate_key_fields):
        add_flag(flagged, config, row, "DUPLICATE", reason)
        duplicate_ids.add(str(row["id"]))

    log.info(
        "  fetched=%s | content_issues=%s | stale_null_embeddings=%s | duplicates=%s | flagged_rows=%s",
        len(rows),
        len(content_issue_ids),
        len(stale_ids),
        len(duplicate_ids),
        len(flagged),
    )

    return report_rows(flagged)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="GestaltView Supabase corpus garbage detector and cleaner."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Print report only, no deletions (default).",
    )
    parser.add_argument(
        "--delete",
        action="store_true",
        default=False,
        help="DELETE flagged rows after confirmation (overrides --dry-run).",
    )
    parser.add_argument(
        "--report",
        action="store_true",
        default=False,
        help="Write CSV report file.",
    )
    parser.add_argument(
        "--tables",
        nargs="+",
        default=TARGET_TABLES,
        choices=sorted(KNOWN_TABLES),
        help="Which supported tables to scan.",
    )
    parser.add_argument(
        "--stale-days",
        type=int,
        default=STALE_EMBEDDING_DAYS,
        help=f"Days before NULL-embedding rows are flagged (default {STALE_EMBEDDING_DAYS}).",
    )
    parser.add_argument(
        "--min-content-chars",
        type=int,
        default=MIN_CONTENT_CHARS,
        help=f"Flag content shorter than this many chars (default {MIN_CONTENT_CHARS}).",
    )
    parser.add_argument(
        "--replacement-threshold",
        type=int,
        default=CORRUPTION_THRESHOLD,
        help=f"Flag rows with at least this many U+FFFD chars (default {CORRUPTION_THRESHOLD}).",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=PAGE_SIZE,
        help=f"Supabase pagination size (default {PAGE_SIZE}).",
    )
    args = parser.parse_args()

    if args.delete:
        args.dry_run = False

    sb = get_client()
    cutoff = datetime.now(timezone.utc) - timedelta(days=args.stale_days)

    all_rows: list[dict[str, Any]] = []
    for table in args.tables:
        all_rows.extend(
            scan_table(
                sb,
                KNOWN_TABLES[table],
                cutoff=cutoff,
                min_content_chars=args.min_content_chars,
                replacement_threshold=args.replacement_threshold,
                page_size=args.page_size,
            )
        )

    if not all_rows:
        out("[bold green]No garbage found - corpus looks clean.[/bold green]" if RICH else "No garbage found - corpus looks clean.")
        return

    print_rich_table(all_rows)
    out(
        f"\n[bold yellow]Total flagged rows: {len(all_rows)}[/bold yellow]"
        if RICH
        else f"\nTotal flagged rows: {len(all_rows)}"
    )

    if args.report:
        report_path = Path(f"gestaltview_cleanup_report_{TIMESTAMP}.csv")
        write_csv(all_rows, report_path)

    if args.dry_run and not args.delete:
        out(
            "\n[dim]Dry-run mode - nothing deleted. Pass --delete to remove flagged rows.[/dim]"
            if RICH
            else "\nDry-run mode - nothing deleted."
        )
        return

    by_table: dict[str, set[str]] = {}
    for row in all_rows:
        by_table.setdefault(row["table"], set()).add(str(row["id"]))

    total_delete_count = sum(len(ids) for ids in by_table.values())
    out(
        f"\n[bold red]About to DELETE {total_delete_count} unique rows across {len(by_table)} table(s).[/bold red]"
        if RICH
        else f"\nAbout to DELETE {total_delete_count} unique rows across {len(by_table)} table(s)."
    )
    confirm = input("Type YES to confirm deletion: ").strip()
    if confirm != "YES":
        out("Aborted - nothing deleted.")
        return

    audit_path = Path(f"cleanup_audit_{TIMESTAMP}.log")
    for table, ids in by_table.items():
        delete_rows(sb, table, sorted(ids), audit_path)

    out(
        f"\n[bold green]Done. Audit log: {audit_path}[/bold green]"
        if RICH
        else f"\nDone. Audit log: {audit_path}"
    )


if __name__ == "__main__":
    main()
