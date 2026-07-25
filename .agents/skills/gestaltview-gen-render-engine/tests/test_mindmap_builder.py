"""Contract tests for the standalone mind-map request builder."""

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
SCRIPT = SKILL_ROOT / "scripts/gestaltview_render_build_mindmap.py"
REQUEST_TS = ROOT / "api/render/request.ts"
TYPES_TS = ROOT / "shared/rendering/engine/core/types.ts"


def load_builder():
    spec = importlib.util.spec_from_file_location("mindmap_builder", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to import {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


builder = load_builder()


def rooted_api_results(requests: list[dict]) -> list[dict]:
    program = """
import { readFileSync } from "node:fs";
import { parseRequestBody } from "./api/render/request.ts";
const requests = JSON.parse(readFileSync(0, "utf8"));
const results = requests.map((body) => {
  try {
    return { ok: true, value: parseRequestBody({ body }) };
  } catch (error) {
    return { ok: false, code: error.code, message: error.message };
  }
});
process.stdout.write(JSON.stringify(results));
"""
    completed = subprocess.run(
        ["node", "--import", "tsx", "--input-type=module", "--eval", program],
        cwd=ROOT, input=json.dumps(requests),
        text=True, capture_output=True, check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(completed.stderr)
    return json.loads(completed.stdout)


def parse_with_rooted_api(request: dict) -> dict:
    result = rooted_api_results([request])[0]
    if not result["ok"]:
        raise AssertionError(result)
    return result["value"]


def api_target_fields() -> set[str]:
    source = REQUEST_TS.read_text(encoding="utf-8")
    match = re.search(r"const targetSchema = z\.object\(\{(.*?)\}\)\.strict", source, re.DOTALL)
    if match is None:
        raise AssertionError("Unable to parse targetSchema from rooted API request parser")
    return set(re.findall(r"^\s{2}([A-Za-z][A-Za-z0-9]*):", match.group(1), re.MULTILINE))


def api_source_families() -> set[str]:
    source = REQUEST_TS.read_text(encoding="utf-8")
    match = re.search(r"sourceFamily: z\.enum\(\[(.*?)\]\)", source, re.DOTALL)
    if match is None:
        raise AssertionError("Unable to parse sourceFamily enum from rooted API request parser")
    return set(re.findall(r'"([^"]+)"', match.group(1)))


class MindMapBuilderTests(unittest.TestCase):
    def valid_input(self) -> dict:
        return {
            "title": "Roadmap",
            "graphId": "roadmap-1",
            "branches": [
                {"id": "now", "label": "Now", "children": [{"id": "ship", "label": "Ship"}]},
                {"id": "later", "label": "Later", "children": []},
            ],
        }

    def assert_rejected(self, value: object) -> None:
        with self.assertRaises(ValueError):
            builder.build_request(value)

    def test_builds_current_scene_graph_and_api_request_envelope(self) -> None:
        request = builder.build_request(self.valid_input())
        self.assertIn(request["sourceFamily"], api_source_families())
        self.assertEqual(request["sourceFamily"], "scene_graph")
        self.assertEqual(set(request), {"sourceFamily", "sceneGraph", "targets", "idempotencyKey"})
        graph = request["sceneGraph"]
        schema = re.search(r'schema: "([^"]+)"', TYPES_TS.read_text(encoding="utf-8"))
        self.assertIsNotNone(schema)
        self.assertEqual(graph["schema"], schema.group(1))
        self.assertEqual([node["type"] for node in graph["nodes"]], ["Document", "Diagram", "ExportRequest"])
        for target in request["targets"]:
            self.assertLessEqual(set(target), api_target_fields())
            self.assertTrue({"format", "mimeType"} <= set(target))

    def test_default_and_custom_requests_round_trip_through_authoritative_parser(self) -> None:
        default_request = builder.build_request(self.valid_input())
        self.assertEqual(parse_with_rooted_api(default_request), default_request)

        defaults = builder.build_request(self.valid_input())["targets"]
        self.assertEqual([target["format"] for target in defaults], ["mmd", "svg"])
        custom = [
            {
                "format": " JSON ", "mimeType": " application/json ", "width": 800,
                "height": 600, "quality": 0.5, "destinationIntent": " archive ", "required": False,
            },
            {"format": " SVG ", "mimeType": " image/svg+xml "},
        ]
        value = self.valid_input()
        value["targets"] = custom
        value["idempotencyKey"] = " custom-key "
        custom_request = builder.build_request(value)
        self.assertEqual(parse_with_rooted_api(custom_request), custom_request)
        self.assertEqual(custom_request["targets"][0]["format"], "json")
        self.assertEqual(custom_request["targets"][0]["mimeType"], "application/json")
        self.assertEqual(custom_request["targets"][0]["destinationIntent"], "archive")
        self.assertEqual(custom_request["targets"][1]["destinationIntent"], "preview")
        self.assertTrue(custom_request["targets"][1]["required"])
        self.assertEqual(custom_request["idempotencyKey"], "custom-key")

    def test_output_is_deterministic(self) -> None:
        value = self.valid_input()
        self.assertEqual(builder.build_request(value), builder.build_request(value))

    def test_colliding_and_duplicate_ids_are_made_unique_deterministically(self) -> None:
        value = {
            "title": "Collisions",
            "branches": [
                {"id": "root", "label": "A", "children": [{"id": "same", "label": "1"}]},
                {"id": "root", "label": "B", "children": [{"id": "same", "label": "2"}]},
                {"id": "same", "label": "C", "children": [{"id": "root", "label": "3"}]},
            ],
        }
        source = builder.build_request(value)["sceneGraph"]["nodes"][1]["props"]["source"]
        declared = re.findall(r'^\s{2}([A-Za-z0-9_-]+)\["', source, re.MULTILINE)
        self.assertEqual(len(declared), len(set(declared)))
        self.assertEqual(declared, ["root", "root_2", "same", "root_3", "same_2", "same_3", "root_4"])
        self.assertEqual(source, builder.build_request(value)["sceneGraph"]["nodes"][1]["props"]["source"])

    def test_rejects_invalid_branch_and_child_shapes(self) -> None:
        invalid = [
            {"branches": {}},
            {"branches": ["branch"]},
            {"branches": [{"label": "ok", "children": {}}]},
            {"branches": [{"label": "ok", "children": ["child"]}]},
            {"branches": [{"label": []}]},
            {"branches": [{"id": 7}]},
            {"branches": [{"children": [{"label": {}}]}]},
        ]
        for value in invalid:
            with self.subTest(value=value):
                self.assert_rejected(value)

    def test_rejects_invalid_target_shapes_and_types(self) -> None:
        valid = self.valid_input()
        bad_targets = [
            {}, [], ["svg"], [{}],
            [{"format": "svg", "mimeType": "image/svg+xml", "extra": True}],
            [{"format": "", "mimeType": "image/svg+xml"}],
            [{"format": "x" * 33, "mimeType": "image/svg+xml"}],
            [{"format": "svg", "mimeType": 7}],
            [{"format": "svg", "mimeType": "x" * 129}],
            [{"format": "svg", "mimeType": "image/svg+xml", "width": 0}],
            [{"format": "svg", "mimeType": "image/svg+xml", "height": 16_385}],
            [{"format": "svg", "mimeType": "image/svg+xml", "quality": 2}],
            [{"format": "svg", "mimeType": "image/svg+xml", "destinationIntent": ""}],
            [{"format": "svg", "mimeType": "image/svg+xml", "destinationIntent": "x" * 65}],
            [{"format": "svg", "mimeType": "image/svg+xml", "required": 1}],
            [{"format": "svg", "mimeType": "image/svg+xml"}] * 9,
        ]
        base_request = builder.build_request(valid)
        parser_results = rooted_api_results(
            [dict(base_request, targets=targets) for targets in bad_targets]
        )
        self.assertTrue(all(not result["ok"] for result in parser_results), parser_results)
        for targets in bad_targets:
            with self.subTest(targets=targets):
                value = dict(valid, targets=targets)
                self.assert_rejected(value)

    def test_rejects_idempotency_keys_rejected_by_authoritative_parser(self) -> None:
        keys = ("", "   ", "x" * 161, 7)
        base_request = builder.build_request(self.valid_input())
        parser_results = rooted_api_results(
            [dict(base_request, idempotencyKey=key) for key in keys]
        )
        self.assertTrue(all(not result["ok"] for result in parser_results), parser_results)
        for key in keys:
            with self.subTest(key=key):
                self.assert_rejected(dict(self.valid_input(), idempotencyKey=key))

    def test_mermaid_labels_escape_control_syntax_without_losing_text(self) -> None:
        hostile = 'quote"]\n  injected --> root [x] `tick`\rcontrol'
        value = {"title": hostile, "branches": [{"label": hostile, "children": [{"label": hostile}]}]}
        source = builder.build_request(value)["sceneGraph"]["nodes"][1]["props"]["source"]
        self.assertNotIn('quote"]', source)
        self.assertNotIn("\n  injected", source)
        self.assertNotIn("[x]", source)
        self.assertNotIn("`tick`", source)
        self.assertIn("quote", source)
        self.assertIn("injected", source)
        self.assertIn("tick", source)
        self.assertEqual(source.count("-->"), 2)

    def test_rejects_non_json_safe_and_nonfinite_values(self) -> None:
        for unsafe in (math.nan, math.inf):
            with self.subTest(unsafe=repr(unsafe)):
                self.assert_rejected({
                    "title": "safe", "branches": [],
                    "targets": [{"format": "svg", "mimeType": "image/svg+xml", "quality": unsafe}],
                })

    def test_ignores_unconsumed_nonserializable_fields(self) -> None:
        request = builder.build_request({"title": "safe", "branches": [], "payload": {"set-value"}})
        self.assertNotIn("payload", request)

    def test_accepts_field_and_collection_boundaries(self) -> None:
        value = {
            "title": "t" * builder.MAX_TITLE_CHARS,
            "graphId": "g" * builder.MAX_GRAPH_ID_CHARS,
            "branches": [
                {
                    "id": "b" * builder.MAX_ITEM_ID_CHARS,
                    "label": "l" * builder.MAX_LABEL_CHARS,
                    "children": [
                        {
                            "id": "c" * builder.MAX_ITEM_ID_CHARS,
                            "label": "x" * builder.MAX_LABEL_CHARS,
                        }
                    ],
                }
            ],
        }
        request = builder.build_request(value)
        self.assertEqual(request["sceneGraph"]["graphId"], value["graphId"])

        child_boundary = builder.build_request({
            "branches": [{"children": [{"label": "x"}] * builder.MAX_CHILDREN_PER_BRANCH}],
        })
        self.assertEqual(
            child_boundary["sceneGraph"]["nodes"][1]["props"]["source"].count("branch_0 -->"),
            builder.MAX_CHILDREN_PER_BRANCH,
        )

        branch_boundary = builder.build_request({
            "branches": [{"label": "x"}] * builder.MAX_BRANCHES,
        })
        self.assertEqual(
            branch_boundary["sceneGraph"]["nodes"][1]["props"]["source"].count("root -->"),
            builder.MAX_BRANCHES,
        )

    def test_rejects_over_bound_fields_and_collections(self) -> None:
        invalid = [
            {"title": "x" * (builder.MAX_TITLE_CHARS + 1)},
            {"graphId": "x" * (builder.MAX_GRAPH_ID_CHARS + 1)},
            {"branches": [{"id": "x" * (builder.MAX_ITEM_ID_CHARS + 1)}]},
            {"branches": [{"label": "x" * (builder.MAX_LABEL_CHARS + 1)}]},
            {"branches": [{"children": [{"id": "x" * (builder.MAX_ITEM_ID_CHARS + 1)}]}]},
            {"branches": [{"children": [{"label": "x" * (builder.MAX_LABEL_CHARS + 1)}]}]},
            {"branches": [{}] * (builder.MAX_BRANCHES + 1)},
            {"branches": [{"children": [{}] * (builder.MAX_CHILDREN_PER_BRANCH + 1)}]},
            {"branches": [{"children": [{}] * 999}] * 4},
        ]
        for value in invalid:
            with self.subTest(field=list(value)):
                self.assert_rejected(value)

    def test_total_node_and_mermaid_source_limits_have_exact_boundaries(self) -> None:
        builder._validate_total_nodes(builder.MAX_MINDMAP_NODES)
        with self.assertRaises(ValueError):
            builder._validate_total_nodes(builder.MAX_MINDMAP_NODES + 1)
        builder._validate_mermaid_source("x" * builder.MAX_MERMAID_SOURCE_CHARS)
        with self.assertRaises(ValueError):
            builder._validate_mermaid_source("x" * (builder.MAX_MERMAID_SOURCE_CHARS + 1))

    def test_duplicate_id_allocator_has_bounded_constant_work_per_allocation(self) -> None:
        allocator = builder.IdAllocator()
        identifiers = [allocator.allocate("same", "fallback") for _ in range(10_000)]
        self.assertEqual(len(identifiers), len(set(identifiers)))
        self.assertEqual(identifiers[:3], ["same", "same_2", "same_3"])
        self.assertEqual(identifiers[-1], "same_10000")
        self.assertEqual(allocator.probe_count, len(identifiers))


class MindMapBuilderCliTests(unittest.TestCase):
    def run_cli(self, input_path: Path, output_path: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(input_path), "--output", str(output_path)],
            text=True, capture_output=True, check=False,
        )

    def test_missing_and_unreadable_inputs_use_generic_diagnostics(self) -> None:
        secret_path = ROOT / "TOP-SECRET-missing-input.json"
        completed = self.run_cli(secret_path, ROOT / "unused.json")
        self.assertEqual(completed.returncode, 1)
        self.assertEqual(json.loads(completed.stdout), {"ok": False, "error": "Unable to read input."})
        self.assertNotIn(str(secret_path), completed.stdout + completed.stderr)

    def test_invalid_json_does_not_echo_contents(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "input.json"
            output_path = Path(directory) / "output.json"
            input_path.write_text('{"secret":"TOP-SECRET-invalid-json', encoding="utf-8")
            completed = self.run_cli(input_path, output_path)
        self.assertEqual(json.loads(completed.stdout), {"ok": False, "error": "Invalid JSON input."})
        self.assertNotIn("TOP-SECRET", completed.stdout + completed.stderr)

    def test_oversized_input_is_rejected_without_path_or_content_leakage(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "TOP-SECRET-oversized.json"
            output_path = Path(directory) / "output.json"
            input_path.write_bytes(b"x" * (builder.MAX_INPUT_BYTES + 1))
            completed = self.run_cli(input_path, output_path)
        self.assertEqual(completed.returncode, 1)
        self.assertEqual(json.loads(completed.stdout), {"ok": False, "error": "Input is too large."})
        self.assertNotIn("TOP-SECRET", completed.stdout + completed.stderr)

    def test_read_and_write_errors_do_not_leak_secret_or_path(self) -> None:
        for operation, message in (("read", "Unable to read input."), ("write", "Unable to write output.")):
            with self.subTest(operation=operation):
                output = io.StringIO()
                argv = [str(SCRIPT), "TOP-SECRET-input", "--output", "TOP-SECRET-output"]
                if operation == "read":
                    read_mock = mock.Mock(side_effect=OSError("TOP-SECRET-detail"))
                    write_mock = mock.Mock()
                else:
                    read_mock = mock.Mock(return_value=b'{"branches": []}')
                    write_mock = mock.Mock(side_effect=OSError("TOP-SECRET-detail"))
                with mock.patch.object(sys, "argv", argv), mock.patch.object(builder, "_read_input_bytes", read_mock), mock.patch.object(Path, "write_text", write_mock), redirect_stdout(output):
                    code = builder.main()
                self.assertEqual(code, 1)
                self.assertEqual(json.loads(output.getvalue()), {"ok": False, "error": message})
                self.assertNotIn("TOP-SECRET", output.getvalue())


if __name__ == "__main__":
    unittest.main()
