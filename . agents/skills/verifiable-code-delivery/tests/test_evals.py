import json
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
EVALS_PATH = SKILL_ROOT / "evals" / "evals.json"


class EvalFixtureTests(unittest.TestCase):
    def test_each_eval_references_existing_grounding_files(self) -> None:
        evaluations = json.loads(EVALS_PATH.read_text(encoding="utf-8"))

        self.assertEqual(len(evaluations), 4)
        for evaluation in evaluations:
            with self.subTest(evaluation=evaluation["id"]):
                self.assertGreaterEqual(len(evaluation["files"]), 4)
                for relative_path in evaluation["files"]:
                    path = EVALS_PATH.parent / relative_path
                    self.assertTrue(path.is_file(), f"missing fixture: {relative_path}")

    def test_nonexistent_type_check_fixture_disproves_prompt_claim(self) -> None:
        evaluations = json.loads(EVALS_PATH.read_text(encoding="utf-8"))
        evaluation = next(item for item in evaluations if item["id"] == "nonexistent-type-check-script")
        package_path = EVALS_PATH.parent / evaluation["files"][0]
        output_path = EVALS_PATH.parent / evaluation["files"][-1]
        scripts = json.loads(package_path.read_text(encoding="utf-8"))["scripts"]

        self.assertIn("says `pnpm run type-check` exists", evaluation["prompt"])
        self.assertNotIn("type-check", scripts)
        self.assertIn("ERR_PNPM_NO_SCRIPT", output_path.read_text(encoding="utf-8"))
