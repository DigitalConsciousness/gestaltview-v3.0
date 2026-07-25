"""Contract tests for the standalone scene-graph validator."""

from __future__ import annotations

import importlib.util
import io
import json
import math
import re
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock


SKILL_ROOT = Path(__file__).resolve().parents[1]
ROOT = SKILL_ROOT.parents[2]
SCRIPT = SKILL_ROOT / "scripts/gestaltview_render_validate_scene_graph.py"
TYPES_TS = ROOT / "shared/rendering/engine/core/types.ts"
VALIDATION_TS = ROOT / "shared/rendering/engine/core/validation.ts"


def quoted_values(source: str) -> set[str]:
    return set(re.findall(r'["\']([^"\']+)["\']', source))


def static_typescript_types(type_name: str) -> set[str]:
    source = TYPES_TS.read_text(encoding="utf-8")
    match = re.search(rf"export type {type_name}\s*=\s*(.*?);", source, re.DOTALL)
    if match is None:
        raise AssertionError(f"Unable to parse {type_name} from {TYPES_TS}")
    return quoted_values(match.group(1))


def runtime_typescript_types(variable_name: str) -> set[str]:
    source = VALIDATION_TS.read_text(encoding="utf-8")
    match = re.search(
        rf"const {variable_name}:.*?new Set\(\[(.*?)\]\);", source, re.DOTALL
    )
    if match is None:
        raise AssertionError(f"Unable to parse {variable_name} from {VALIDATION_TS}")
    return quoted_values(match.group(1))


def load_validator():
    spec = importlib.util.spec_from_file_location("scene_graph_validator", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to import {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


validator = load_validator()


def graph(*, node_type: str = "Document", edge_type: str = "contains") -> dict:
    return {
        "schema": "nextgen.scene-graph.v1",
        "graphId": "graph-1",
        "nodes": [
            {"id": "root", "type": node_type, "props": {}},
            {"id": "child", "type": "Document", "props": {}},
        ],
        "edges": [
            {
                "id": "edge-1",
                "type": edge_type,
                "from": "root",
                "to": "child",
                "props": {},
            }
        ],
    }


class SceneGraphValidatorTests(unittest.TestCase):
    def assert_invalid(self, value: object, fragment: str) -> dict:
        result = validator.validate_scene_graph(value)
        self.assertFalse(result["valid"])
        self.assertTrue(any(fragment in error for error in result["errors"]), result)
        return result

    def test_accepts_valid_current_schema(self) -> None:
        result = validator.validate_scene_graph(graph())
        self.assertTrue(result["valid"], result)
        self.assertEqual(result["nodeCount"], 2)
        self.assertEqual(result["edgeCount"], 1)

    def test_rejects_wrong_schema(self) -> None:
        value = graph()
        value["schema"] = "gsvw-render.v1"
        self.assert_invalid(value, "schema")

    def test_rejects_duplicate_node_and_edge_ids(self) -> None:
        secret = "TOP-SECRET-duplicate-id-123"
        value = graph()
        value["nodes"][0]["id"] = secret
        value["nodes"].append({"id": secret, "type": "Document", "props": {}})
        value["edges"][0]["id"] = secret
        value["edges"].append(dict(value["edges"][0]))
        result = validator.validate_scene_graph(value)
        self.assertTrue(any("nodes[2].id duplicates" in error for error in result["errors"]))
        self.assertTrue(any("edges[1].id duplicates" in error for error in result["errors"]))
        self.assertNotIn(secret, json.dumps(result))

    def test_rejects_missing_edge_endpoints(self) -> None:
        secret = "TOP-SECRET-missing-endpoint-123"
        value = graph()
        value["edges"][0]["from"] = secret
        value["edges"][0]["to"] = secret
        value["edges"][0]["type"] = secret
        result = validator.validate_scene_graph(value)
        self.assertTrue(any(".from references a missing node" in error for error in result["errors"]))
        self.assertTrue(any(".to references a missing node" in error for error in result["errors"]))
        self.assertTrue(any(".type is not recognized" in error for error in result["errors"]))
        self.assertNotIn(secret, json.dumps(result))

    def test_node_types_match_rooted_runtime_validator(self) -> None:
        node_types = runtime_typescript_types("nodeTypes")
        self.assertEqual(validator.NODE_TYPES, node_types)
        for node_type in node_types:
            self.assertTrue(validator.validate_scene_graph(graph(node_type=node_type))["valid"], node_type)

    def test_edge_types_match_rooted_runtime_validator(self) -> None:
        edge_types = runtime_typescript_types("edgeTypes")
        self.assertEqual(validator.EDGE_TYPES, edge_types)
        for edge_type in edge_types:
            self.assertTrue(validator.validate_scene_graph(graph(edge_type=edge_type))["valid"], edge_type)

    def test_static_node_union_has_fifteen_runtime_unsupported_types(self) -> None:
        static_types = static_typescript_types("NodeType")
        runtime_types = runtime_typescript_types("nodeTypes")
        self.assertEqual(len(static_types), 29)
        self.assertEqual(len(runtime_types), 14)
        self.assertEqual(
            static_types - runtime_types,
            {
                "Slide", "MindMap", "Image", "Video", "Audio", "Wiki", "App",
                "Component", "AgentStudio", "Storybook", "Canvas", "Pitch",
                "Brand", "Prompt", "Table",
            },
        )
        for node_type in static_types - runtime_types:
            self.assertFalse(
                validator.validate_scene_graph(graph(node_type=node_type))["valid"],
                node_type,
            )

    def test_static_and_runtime_edge_types_agree(self) -> None:
        self.assertEqual(
            static_typescript_types("EdgeType"),
            runtime_typescript_types("edgeTypes"),
        )

    def test_rejects_missing_or_non_object_props(self) -> None:
        for collection in ("nodes", "edges"):
            for bad_props in (None, [], "secret-value"):
                with self.subTest(collection=collection, bad_props=bad_props):
                    value = graph()
                    value[collection][0]["props"] = bad_props
                    self.assert_invalid(value, ".props must be an object")
            with self.subTest(collection=collection, bad_props="missing"):
                value = graph()
                del value[collection][0]["props"]
                self.assert_invalid(value, ".props must be an object")

    def test_rejects_non_finite_and_non_json_serializable_data(self) -> None:
        for unsafe in (math.nan, math.inf, {"not-json"}):
            with self.subTest(unsafe=type(unsafe).__name__):
                value = graph()
                value["nodes"][0]["props"] = {"payload": unsafe}
                self.assert_invalid(value, "not safely JSON serializable")

    def test_diagnostics_do_not_echo_arbitrary_values_or_secrets(self) -> None:
        secret = "TOP-SECRET-api-token-123"
        value = graph()
        value["nodes"][0]["props"] = {"token": secret, "unsafe": math.nan}
        result = self.assert_invalid(value, "not safely JSON serializable")
        self.assertNotIn(secret, json.dumps(result))


class SceneGraphValidatorCliTests(unittest.TestCase):
    def run_cli(self, path: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(path)],
            text=True,
            capture_output=True,
            check=False,
        )

    def test_missing_file_returns_two_and_json_error(self) -> None:
        completed = self.run_cli(ROOT / "does-not-exist.scene.json")
        self.assertEqual(completed.returncode, 2)
        self.assertEqual(json.loads(completed.stdout)["errors"], ["File not found."])

    def test_invalid_json_returns_two_without_echoing_contents(self) -> None:
        secret = "TOP-SECRET-invalid-json-value"
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "invalid.json"
            path.write_text('{"token": "' + secret, encoding="utf-8")
            completed = self.run_cli(path)
        self.assertEqual(completed.returncode, 2)
        payload = json.loads(completed.stdout)
        self.assertIn("Invalid JSON:", payload["errors"][0])
        self.assertNotIn(secret, completed.stdout)

    def test_directory_returns_two_without_traceback_or_path(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            completed = self.run_cli(Path(directory))
            path_text = directory
        self.assertEqual(completed.returncode, 2)
        self.assertEqual(json.loads(completed.stdout)["errors"], ["Unable to read scene graph file."])
        self.assertNotIn("Traceback", completed.stderr)
        self.assertNotIn(path_text, completed.stdout + completed.stderr)

    def test_invalid_utf8_returns_two_without_traceback_or_contents(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "invalid-utf8.json"
            path.write_bytes(b"\xff\xfeTOP-SECRET-binary")
            completed = self.run_cli(path)
        self.assertEqual(completed.returncode, 2)
        self.assertEqual(json.loads(completed.stdout)["errors"], ["Unable to read scene graph file."])
        self.assertNotIn("Traceback", completed.stderr)
        self.assertNotIn("TOP-SECRET", completed.stdout + completed.stderr)

    def test_permission_error_is_generic_and_returns_two(self) -> None:
        secret = "TOP-SECRET-permission-detail"
        output = io.StringIO()
        with (
            mock.patch.object(sys, "argv", [str(SCRIPT), "secret-path.json"]),
            mock.patch.object(Path, "read_text", side_effect=PermissionError(secret)),
            redirect_stdout(output),
        ):
            return_code = validator.main()
        self.assertEqual(return_code, 2)
        self.assertEqual(json.loads(output.getvalue())["errors"], ["Unable to read scene graph file."])
        self.assertNotIn(secret, output.getvalue())


if __name__ == "__main__":
    unittest.main()
