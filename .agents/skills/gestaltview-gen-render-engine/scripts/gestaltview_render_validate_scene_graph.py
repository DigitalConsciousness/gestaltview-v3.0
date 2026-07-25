#!/usr/bin/env python3
"""Validate a GestaltView nextgen.scene-graph.v1 document."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

NODE_TYPES = {
    "Scene3D", "Mesh", "Material", "Light", "Camera", "Atmosphere",
    "Document", "Markdown", "Diagram", "Chart", "DOMSnapshot",
    "VideoTrack", "AgentArtifact", "ExportRequest",
}
EDGE_TYPES = {
    "contains",
    "referencesAsset",
    "rendersTo",
    "derivedFrom",
    "controls",
    "annotates",
    "composes",
}


def validate_scene_graph(graph: Any) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    if not isinstance(graph, dict):
        return {"valid": False, "errors": ["Scene graph must be an object."], "warnings": []}

    if graph.get("schema") != "nextgen.scene-graph.v1":
        errors.append("schema must equal 'nextgen.scene-graph.v1'.")
    if not isinstance(graph.get("graphId"), str) or not graph["graphId"].strip():
        errors.append("graphId must be a non-empty string.")

    nodes = graph.get("nodes")
    if not isinstance(nodes, list):
        errors.append("nodes must be an array.")
        nodes = []
    edges = graph.get("edges")
    if not isinstance(edges, list):
        errors.append("edges must be an array.")
        edges = []

    node_ids: set[str] = set()
    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"nodes[{index}] must be an object.")
            continue
        node_id = node.get("id")
        if not isinstance(node_id, str) or not node_id.strip():
            errors.append(f"nodes[{index}].id must be a non-empty string.")
        elif node_id in node_ids:
            errors.append(f"nodes[{index}].id duplicates another node id.")
        else:
            node_ids.add(node_id)
        if node.get("type") not in NODE_TYPES:
            errors.append(f"nodes[{index}].type is not recognized.")
        if not isinstance(node.get("props"), dict):
            errors.append(f"nodes[{index}].props must be an object.")

    edge_ids: set[str] = set()
    for index, edge in enumerate(edges):
        if not isinstance(edge, dict):
            errors.append(f"edges[{index}] must be an object.")
            continue
        edge_id = edge.get("id")
        if not isinstance(edge_id, str) or not edge_id.strip():
            errors.append(f"edges[{index}].id must be a non-empty string.")
        elif edge_id in edge_ids:
            errors.append(f"edges[{index}].id duplicates another edge id.")
        else:
            edge_ids.add(edge_id)
        if edge.get("type") not in EDGE_TYPES:
            errors.append(f"edges[{index}].type is not recognized.")
        if edge.get("from") not in node_ids:
            errors.append(f"edges[{index}].from references a missing node.")
        if edge.get("to") not in node_ids:
            errors.append(f"edges[{index}].to references a missing node.")
        if not isinstance(edge.get("props"), dict):
            errors.append(f"edges[{index}].props must be an object.")

    try:
        json.dumps(graph, allow_nan=False)
    except (TypeError, ValueError):
        errors.append("Scene graph is not safely JSON serializable.")

    diagram_nodes = [node for node in nodes if isinstance(node, dict) and node.get("type") == "Diagram"]
    if diagram_nodes:
        warnings.append(
            "Diagram SVG is partial until a server-capable Mermaid renderer is installed and verified."
        )

    return {
        "valid": not errors,
        "schema": graph.get("schema"),
        "graphId": graph.get("graphId"),
        "nodeCount": len(nodes),
        "edgeCount": len(edges),
        "errors": errors,
        "warnings": warnings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scene_graph", type=Path)
    args = parser.parse_args()
    try:
        source = args.scene_graph.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(json.dumps({"valid": False, "errors": ["File not found."]}, indent=2))
        return 2
    except (UnicodeDecodeError, OSError):
        print(
            json.dumps(
                {"valid": False, "errors": ["Unable to read scene graph file."]},
                indent=2,
            )
        )
        return 2
    try:
        graph = json.loads(source)
    except json.JSONDecodeError as exc:
        print(json.dumps({"valid": False, "errors": [f"Invalid JSON: {exc}"]}, indent=2))
        return 2

    result = validate_scene_graph(graph)
    print(json.dumps(result, indent=2))
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
