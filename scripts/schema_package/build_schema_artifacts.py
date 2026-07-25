#!/usr/bin/env python3
"""
Build schema visualization artifacts from a Postgres-style schema.sql file.

Inputs:
  - supabase/FULL_PUBLIC_SCHEMA_4_29_26.sql (or any schema SQL path)
Optional inputs:
  - domain_map.yml (table -> domain) to enforce stable grouping

Outputs (into ./schema_out by default):
  - schema_table_summary.csv
  - schema_relationships.csv
  - schema_graph.json
  - schema_erd.mmd
  - schema_tour_15.mmd
  - schema_interactive.html
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple


CREATE_TABLE_RE = re.compile(
    r"CREATE\s+TABLE\s+(?P<schema>\w+)\.(?P<table>\w+)\s*\((?P<body>.*?)\);\s*",
    re.IGNORECASE | re.DOTALL,
)

# Column line heuristic: "name type [NOT NULL] [DEFAULT ...] [CHECK ...] [UNIQUE] ..."
COLUMN_RE = re.compile(
    r"^\s*(?P<name>[a-zA-Z_][a-zA-Z0-9_]*)\s+(?P<type>[^,]+?)(?P<tail>,\s*)?$"
)

FK_INLINE_RE = re.compile(
    r"FOREIGN\s+KEY\s*\((?P<from_cols>[^)]+)\)\s+REFERENCES\s+(?P<to_schema>\w+)\.(?P<to_table>\w+)\s*\((?P<to_cols>[^)]+)\)",
    re.IGNORECASE,
)

PK_RE = re.compile(r"PRIMARY\s+KEY\s*\((?P<cols>[^)]+)\)", re.IGNORECASE)
UNIQUE_RE = re.compile(r"\bUNIQUE\b", re.IGNORECASE)


@dataclass
class Column:
    name: str
    raw_type: str
    not_null: bool
    default: Optional[str]


@dataclass
class ForeignKey:
    from_table: str
    from_cols: List[str]
    to_table: str
    to_cols: List[str]
    constraint_name: Optional[str] = None


@dataclass
class Table:
    name: str
    columns: List[Column]
    primary_key: List[str]
    uniques: List[List[str]]
    foreign_keys: List[ForeignKey]


def split_sql_items(body: str) -> List[str]:
    # Split by commas, but keep commas inside parens (e.g., CHECK (...), ENUMs, arrays)
    items = []
    buf = []
    depth = 0
    for ch in body:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        if ch == "," and depth == 0:
            item = "".join(buf).strip()
            if item:
                items.append(item)
            buf = []
        else:
            buf.append(ch)
    tail = "".join(buf).strip()
    if tail:
        items.append(tail)
    return items


def parse_table(table_name: str, body: str) -> Table:
    columns: List[Column] = []
    primary_key: List[str] = []
    uniques: List[List[str]] = []
    fks: List[ForeignKey] = []

    items = split_sql_items(body)

    for item in items:
        up = item.upper()

        # Table-level PRIMARY KEY constraint
        pk = PK_RE.search(item)
        if pk and "CONSTRAINT" in up or up.startswith("PRIMARY KEY"):
            primary_key = [c.strip().strip('"') for c in pk.group("cols").split(",")]
            continue

        # Table-level FOREIGN KEY constraint
        fk = FK_INLINE_RE.search(item)
        if fk:
            from_cols = [c.strip().strip('"') for c in fk.group("from_cols").split(",")]
            to_cols = [c.strip().strip('"') for c in fk.group("to_cols").split(",")]
            fks.append(
                ForeignKey(
                    from_table=table_name,
                    from_cols=from_cols,
                    to_table=f"{fk.group('to_schema')}.{fk.group('to_table')}",
                    to_cols=to_cols,
                )
            )
            continue

        # Column-ish line
        m = COLUMN_RE.match(item)
        if m:
            col_name = m.group("name")
            raw_type = m.group("type").strip()

            not_null = "NOT NULL" in up
            default = None
            # Very simple DEFAULT capture; keeps raw SQL fragment
            d = re.search(r"\bDEFAULT\b\s+(.*?)(?:\s+\bCHECK\b|\s+\bCONSTRAINT\b|\s+\bUNIQUE\b|\s*$)", item, re.IGNORECASE)
            if d:
                default = d.group(1).strip()

            columns.append(Column(name=col_name, raw_type=raw_type, not_null=not_null, default=default))

            # Inline UNIQUE (single-column)
            if UNIQUE_RE.search(item):
                uniques.append([col_name])

            # Inline PRIMARY KEY (single-column)
            if "PRIMARY KEY" in up:
                primary_key = [col_name]

            continue

    return Table(name=table_name, columns=columns, primary_key=primary_key, uniques=uniques, foreign_keys=fks)


def table_to_mermaid_entity(t: Table) -> str:
    # Mermaid ERD entity block is optional; relationships can stand alone.
    # We keep it minimal to reduce diagram size.
    lines = [f"  {t.name.replace('.', '_')} {{"]  # Mermaid identifiers can't contain '.'
    for c in t.columns[:8]:
        # Keep first few columns only; full list belongs in CSV.
        lines.append(f"    {c.raw_type} {c.name}")
    if len(t.columns) > 8:
        lines.append("    ... ...")
    lines.append("  }")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--schema", required=True, help="Path to schema.sql")
    ap.add_argument("--out", default="schema_out", help="Output directory")
    args = ap.parse_args()

    schema_path = Path(args.schema)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    sql = schema_path.read_text(encoding="utf-8", errors="replace")

    tables: Dict[str, Table] = {}
    for m in CREATE_TABLE_RE.finditer(sql):
        fq = f"{m.group('schema')}.{m.group('table')}"
        tables[fq] = parse_table(fq, m.group("body"))

    # Relationships CSV
    rel_csv = out_dir / "schema_relationships.csv"
    with rel_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["from_table", "from_cols", "to_table", "to_cols", "constraint_name"])
        for t in tables.values():
            for fk in t.foreign_keys:
                w.writerow([fk.from_table, ",".join(fk.from_cols), fk.to_table, ",".join(fk.to_cols), fk.constraint_name or ""])

    # Table summary CSV
    tbl_csv = out_dir / "schema_table_summary.csv"
    with tbl_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["table", "columns", "pk_cols", "unique_constraints", "fk_out"])
        for t in sorted(tables.values(), key=lambda x: x.name):
            w.writerow([t.name, len(t.columns), ",".join(t.primary_key), len(t.uniques), len(t.foreign_keys)])

    # Graph JSON (nodes/edges)
    graph = {
        "nodes": [{"id": t.name, "label": t.name} for t in tables.values()],
        "edges": [
            {"from": fk.from_table, "to": fk.to_table, "label": ",".join(fk.from_cols)}
            for t in tables.values()
            for fk in t.foreign_keys
        ],
    }
    (out_dir / "schema_graph.json").write_text(json.dumps(graph, indent=2), encoding="utf-8")

    # Mermaid ERD (full relationships; lightweight entity blocks)
    mermaid_lines = ["erDiagram"]
    for t in tables.values():
        mermaid_lines.append(table_to_mermaid_entity(t))
    for t in tables.values():
        for fk in t.foreign_keys:
            # Cardinality is not inferable from DDL alone without uniqueness analysis.
            # Use a neutral default and refine later if desired.
            a = fk.from_table.replace(".", "_")
            b = fk.to_table.replace(".", "_")
            mermaid_lines.append(f"  {b} ||--o{{ {a} : FK")
    (out_dir / "schema_erd.mmd").write_text("\n".join(mermaid_lines), encoding="utf-8")

    # Placeholder “tour” file: you will curate the list; script can be extended to accept it.
    (out_dir / "schema_tour_15.mmd").write_text("erDiagram\n  %% TODO: curated 15-table tour\n", encoding="utf-8")

    # Minimal interactive HTML using vis-network from CDN.
    # Embed the graph so the output works as a standalone file.
    graph_json = json.dumps(graph, separators=(",", ":"))
    html = """<!doctype html>
<html>
<head><meta charset="utf-8"/>
<title>GestaltView Schema Graph</title>
<style>
  body { font-family: Arial, sans-serif; margin: 16px; }
  #net { width: 100%; height: 82vh; border: 1px solid #d0d7de; border-radius: 12px; }
</style>
</head>
<body>
<h2>GestaltView Schema Graph</h2>
<p>Pan/zoom, click a node to highlight neighbors.</p>
<div id="net"></div>
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
<script>
const g = __GRAPH_JSON__;
const nodes = new vis.DataSet(g.nodes);
const edges = new vis.DataSet(g.edges);
const container = document.getElementById('net');
const net = new vis.Network(container, {nodes, edges}, {
  interaction: {hover: true},
  physics: {stabilization: true}
});
</script>
</body>
</html>
""".replace("__GRAPH_JSON__", graph_json)
    (out_dir / "schema_interactive.html").write_text(html, encoding="utf-8")

    print(f"Built {len(tables)} tables into {out_dir}/")

if __name__ == "__main__":
    main()
