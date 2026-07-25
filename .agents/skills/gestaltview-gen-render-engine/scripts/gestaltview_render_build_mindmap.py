#!/usr/bin/env python3
"""Build a nextgen.scene-graph.v1 Mermaid mind-map request."""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Any


DEFAULT_TARGETS = [
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
]
TARGET_FIELDS = {
    "format", "mimeType", "width", "height", "quality",
    "destinationIntent", "required",
}

# Helper-specific resource limits keep local request generation predictable.
MAX_INPUT_BYTES = 1_048_576
MAX_TITLE_CHARS = 4_096
MAX_GRAPH_ID_CHARS = 256
MAX_ITEM_ID_CHARS = 256
MAX_LABEL_CHARS = 4_096
MAX_BRANCHES = 1_000
MAX_CHILDREN_PER_BRANCH = 1_000
MAX_MINDMAP_NODES = 4_000
MAX_MERMAID_SOURCE_CHARS = 500_000


def safe_id(value: str, fallback: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9_-]+", "_", value.strip()).strip("_")
    return normalized or fallback


def mermaid_label(value: str) -> str:
    """Encode Mermaid-significant label characters while retaining visible text."""
    value = re.sub(r"[\x00-\x20\x7f]", " ", value).strip()
    replacements = {
        "&": "&#38;", '"': "&#34;", "[": "&#91;", "]": "&#93;",
        "`": "&#96;", "<": "&#60;", ">": "&#62;",
    }
    return "".join(replacements.get(character, character) for character in value)


class IdAllocator:
    """Allocate deterministic IDs with amortized constant work per candidate."""

    def __init__(self, reserved: set[str] | None = None) -> None:
        self.used = set(reserved or ())
        self.next_suffix = {identifier: 2 for identifier in self.used}
        self.probe_count = 0

    def allocate(self, requested: str, fallback: str) -> str:
        base = safe_id(requested, fallback)
        if base not in self.used:
            candidate = base
            self.probe_count += 1
        else:
            suffix = self.next_suffix.get(base, 2)
            candidate = f"{base}_{suffix}"
            self.probe_count += 1
            while candidate in self.used:
                suffix += 1
                candidate = f"{base}_{suffix}"
                self.probe_count += 1
            self.next_suffix[base] = suffix + 1
        self.used.add(candidate)
        self.next_suffix.setdefault(candidate, 2)
        self.next_suffix.setdefault(base, 2)
        return candidate


def _optional_string(
    record: dict[str, Any], field: str, fallback: str, max_chars: int | None = None
) -> str:
    value = record.get(field, fallback)
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string.")
    if max_chars is not None and len(value) > max_chars:
        raise ValueError(f"{field} is too long.")
    return value


def _validate_branches(value: object) -> list[dict[str, Any]]:
    if not isinstance(value, list) or len(value) > MAX_BRANCHES:
        raise ValueError("branches must be an array.")
    total_nodes = 1 + len(value)
    for branch in value:
        if not isinstance(branch, dict):
            raise ValueError("branches must contain objects.")
        _optional_string(branch, "id", "", MAX_ITEM_ID_CHARS)
        _optional_string(branch, "label", "", MAX_LABEL_CHARS)
        children = branch.get("children", [])
        if not isinstance(children, list) or len(children) > MAX_CHILDREN_PER_BRANCH:
            raise ValueError("children must be an array.")
        total_nodes += len(children)
        for child in children:
            if not isinstance(child, dict):
                raise ValueError("children must contain objects.")
            _optional_string(child, "id", "", MAX_ITEM_ID_CHARS)
            _optional_string(child, "label", "", MAX_LABEL_CHARS)
    _validate_total_nodes(total_nodes)
    return value


def _validate_total_nodes(count: int) -> None:
    if count > MAX_MINDMAP_NODES:
        raise ValueError("mind map has too many nodes.")


def _validate_mermaid_source(source: str) -> None:
    if len(source) > MAX_MERMAID_SOURCE_CHARS:
        raise ValueError("generated Mermaid source is too large.")


def _validate_targets(value: object) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value or len(value) > 8:
        raise ValueError("targets must be a non-empty array of at most eight objects.")
    normalized_targets = []
    for target in value:
        if not isinstance(target, dict) or set(target) - TARGET_FIELDS:
            raise ValueError("targets must contain only supported fields.")
        for field, limit in (("format", 32), ("mimeType", 128)):
            field_value = target.get(field)
            if not isinstance(field_value, str) or not field_value.strip() or len(field_value.strip()) > limit:
                raise ValueError(f"target {field} must be a non-empty string.")
        if "destinationIntent" in target:
            intent = target["destinationIntent"]
            if not isinstance(intent, str) or not intent.strip() or len(intent.strip()) > 64:
                raise ValueError("target destinationIntent must be a non-empty string.")
        for field in ("width", "height"):
            if field in target:
                dimension = target[field]
                if isinstance(dimension, bool) or not isinstance(dimension, int) or not 0 < dimension <= 16_384:
                    raise ValueError(f"target {field} must be a positive integer.")
        if "quality" in target:
            quality = target["quality"]
            if (
                isinstance(quality, bool)
                or not isinstance(quality, (int, float))
                or not math.isfinite(quality)
                or not 0 <= quality <= 1
            ):
                raise ValueError("target quality must be between zero and one.")
        if "required" in target and not isinstance(target["required"], bool):
            raise ValueError("target required must be boolean.")
        normalized = dict(target)
        normalized["format"] = target["format"].strip().lower()
        normalized["mimeType"] = target["mimeType"].strip()
        normalized["destinationIntent"] = target.get("destinationIntent", "preview").strip()
        normalized["required"] = target.get("required", True)
        normalized_targets.append(normalized)
    return normalized_targets


def build_mermaid_source(title: str, branches: list[dict[str, Any]]) -> str:
    allocator = IdAllocator({"root"})
    lines = ["flowchart TD", f'  root["{mermaid_label(title)}"]']
    for index, branch in enumerate(branches):
        branch_id = allocator.allocate(branch.get("id", ""), f"branch_{index}")
        branch_label = branch.get("label", branch_id)
        lines.append(f'  {branch_id}["{mermaid_label(branch_label)}"]')
        lines.append(f"  root --> {branch_id}")
        for child_index, child in enumerate(branch.get("children", [])):
            child_id = allocator.allocate(
                child.get("id", ""), f"{branch_id}_child_{child_index}"
            )
            child_label = child.get("label", child_id)
            lines.append(f'  {child_id}["{mermaid_label(child_label)}"]')
            lines.append(f"  {branch_id} --> {child_id}")
    source = "\n".join(lines)
    _validate_mermaid_source(source)
    return source


def build_request(data: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(data, dict):
        raise ValueError("input must be an object.")

    title = _optional_string(data, "title", "Mind Map", MAX_TITLE_CHARS)
    graph_id_value = _optional_string(data, "graphId", title, MAX_GRAPH_ID_CHARS)
    default_idempotency = safe_id(graph_id_value, "mind_map")[:160]
    idempotency_value = _optional_string(data, "idempotencyKey", default_idempotency).strip()
    if not idempotency_value or len(idempotency_value) > 160:
        raise ValueError("idempotencyKey must contain between one and 160 characters.")
    branches = _validate_branches(data.get("branches", []))
    targets = _validate_targets(data["targets"]) if "targets" in data else [dict(target) for target in DEFAULT_TARGETS]
    graph_id = safe_id(graph_id_value, "mind_map")
    source = build_mermaid_source(title, branches)
    graph = {
        "schema": "nextgen.scene-graph.v1",
        "graphId": graph_id,
        "nodes": [
            {"id": "document", "type": "Document", "name": title, "props": {"title": title}},
            {"id": "diagram", "type": "Diagram", "name": title, "props": {"source": source, "diagramType": "flowchart"}},
            {
                "id": "export", "type": "ExportRequest", "name": "Mind-map export",
                "props": {
                    "roots": ["diagram"],
                    "targets": [
                        {"format": target["format"], "required": target.get("required", True)}
                        for target in targets
                    ],
                },
            },
        ],
        "edges": [
            {"id": "document-contains-diagram", "type": "contains", "from": "document", "to": "diagram", "props": {}},
            {"id": "diagram-renders-to-export", "type": "rendersTo", "from": "diagram", "to": "export", "props": {}},
        ],
        "metadata": {"artifactClass": "mind_map", "sourcePreserved": True},
    }
    return {
        "sourceFamily": "scene_graph", "sceneGraph": graph, "targets": targets,
        "idempotencyKey": idempotency_value,
    }


def _print_error(message: str) -> int:
    print(json.dumps({"ok": False, "error": message}, indent=2))
    return 1


class InputTooLargeError(ValueError):
    pass


def _read_input_bytes(path: Path) -> bytes:
    with path.open("rb") as input_file:
        raw = input_file.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        raise InputTooLargeError
    return raw


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        raw_bytes = _read_input_bytes(args.input)
    except InputTooLargeError:
        return _print_error("Input is too large.")
    except (OSError, UnicodeError):
        return _print_error("Unable to read input.")
    try:
        data = json.loads(raw_bytes.decode("utf-8"))
    except (UnicodeError, json.JSONDecodeError):
        return _print_error("Invalid JSON input.")
    try:
        request = build_request(data)
    except ValueError:
        return _print_error("Invalid mind-map input.")
    try:
        args.output.write_text(json.dumps(request, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    except (OSError, UnicodeError, ValueError):
        return _print_error("Unable to write output.")
    print(json.dumps({"ok": True, "output": str(args.output)}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
