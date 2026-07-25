#!/usr/bin/env python3
"""Build a nextgen.scene-graph.v1 Mermaid mind-map request."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


def safe_id(value: str, fallback: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_")
    return normalized or fallback


def mermaid_label(value: str) -> str:
    return value.replace('"', "'").replace("\n", " ").strip()


def build_mermaid_source(title: str, branches: list[dict[str, Any]]) -> str:
    lines = ["flowchart TD", f'  root["{mermaid_label(title)}"]']
    for index, branch in enumerate(branches):
        branch_id = safe_id(str(branch.get("id", "")), f"branch_{index}")
        lines.append(f'  {branch_id}["{mermaid_label(str(branch.get("label", branch_id)))}"]')
        lines.append(f"  root --> {branch_id}")
        for child_index, child in enumerate(branch.get("children", [])):
            child_record = child if isinstance(child, dict) else {"label": str(child)}
            child_id = safe_id(
                str(child_record.get("id", "")),
                f"{branch_id}_child_{child_index}",
            )
            lines.append(
                f'  {child_id}["{mermaid_label(str(child_record.get("label", child_id)))}"]'
            )
            lines.append(f"  {branch_id} --> {child_id}")
    return "\n".join(lines)


def build_request(data: dict[str, Any]) -> dict[str, Any]:
    title = str(data.get("title", "Mind Map"))
    branches = data.get("branches", [])
    if not isinstance(branches, list):
        raise ValueError("branches must be an array.")
    graph_id = safe_id(str(data.get("graphId", title)), "mind_map")
    source = build_mermaid_source(title, branches)
    graph = {
        "schema": "nextgen.scene-graph.v1",
        "graphId": graph_id,
        "nodes": [
            {
                "id": "document",
                "type": "Document",
                "name": title,
                "props": {"title": title},
            },
            {
                "id": "diagram",
                "type": "Diagram",
                "name": title,
                "props": {"source": source, "diagramType": "flowchart"},
            },
            {
                "id": "export",
                "type": "ExportRequest",
                "name": "Mind-map export",
                "props": {
                    "roots": ["diagram"],
                    "targets": [
                        {"format": "mmd", "required": True},
                        {"format": "svg", "required": False},
                    ],
                },
            },
        ],
        "edges": [
            {
                "id": "document-contains-diagram",
                "type": "contains",
                "from": "document",
                "to": "diagram",
                "props": {},
            },
            {
                "id": "diagram-renders-to-export",
                "type": "rendersTo",
                "from": "diagram",
                "to": "export",
                "props": {},
            },
        ],
        "metadata": {
            "artifactClass": "mind_map",
            "sourcePreserved": True,
        },
    }
    targets = data.get(
        "targets",
        [
            {
                "format": "mmd",
                "mimeType": "text/plain",
                "destinationIntent": "export",
                "required": True,
            },
            {
                "format": "svg",
                "mimeType": "image/svg+xml",
                "destinationIntent": "preview",
                "required": False,
            },
        ],
    )
    return {
        "sourceFamily": "scene_graph",
        "sceneGraph": graph,
        "targets": targets,
        "idempotencyKey": str(data.get("idempotencyKey", graph_id)),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        request = build_request(data)
        args.output.write_text(json.dumps(request, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"ok": True, "output": str(args.output)}, indent=2))
        return 0
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, indent=2))
        return 1


if __name__ == "__main__":
    sys.exit(main())
