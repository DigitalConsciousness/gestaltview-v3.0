import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
VERIFY_DELIVERY = SKILL_ROOT / "scripts" / "verify_delivery.py"
CHECK_SCRIPTS = SKILL_ROOT / "scripts" / "check_scripts.py"


class ValidatorTests(unittest.TestCase):
    def run_validator(self, script: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
        self.assertTrue(
            script.is_file(),
            f"validator script does not exist: {script}",
        )
        return subprocess.run(
            [sys.executable, str(script), *arguments],
            capture_output=True,
            text=True,
            check=False,
        )

    def write_package_json(self, directory: Path) -> None:
        (directory / "package.json").write_text(
            json.dumps({"scripts": {"build": "tsc", "test": "vitest run"}}),
            encoding="utf-8",
        )

    def write_complete_handoff(self, handoff: Path, referenced_path: str = "src/example.ts") -> None:
        handoff.parent.mkdir(parents=True, exist_ok=True)
        handoff.write_text(
            f"""### Files Changed
- `{referenced_path}` — adds the verified example.

### Contracts
- Public API remains compatible.

### Verification
```bash
pnpm run build
pnpm test
```

### Regression Risk
- Focused behavior and build are covered.

### Recovery
- Revert the applied change.
""",
            encoding="utf-8",
        )

    def test_complete_handoff_passes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text(
                'export const example = "verified";\n', encoding="utf-8"
            )
            handoff = project / "handoff.md"
            handoff.write_text(
                """### Files Changed
- `src/example.ts` — adds the verified example.

### Contracts
- Breaking changes: None.

### Verification
```bash
pnpm run build
pnpm test
git diff --check
```

Evidence:
- `src/example.ts` exists in the project.
- `package.json` defines `build` and `test`.

### Regression Risk
- The focused behavior and build are covered.

### Recovery
- Revert `src/example.ts`.
""",
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_missing_each_required_report_section_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            complete = project / "complete.md"
            self.write_complete_handoff(complete)
            content = complete.read_text(encoding="utf-8")

            for section in (
                "Files Changed",
                "Contracts",
                "Verification",
                "Regression Risk",
                "Recovery",
            ):
                with self.subTest(section=section):
                    handoff = project / f"missing-{section.lower().replace(' ', '-')}.md"
                    handoff.write_text(
                        content.replace(f"### {section}", f"### Omitted {section}"),
                        encoding="utf-8",
                    )
                    result = self.run_validator(VERIFY_DELIVERY, str(handoff))
                    self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
                    output = result.stdout + result.stderr
                    self.assertIn("Missing delivery sections", output)
                    self.assertIn(section, output)

    def test_verification_requires_executable_commands(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8").replace(
                    "```bash\npnpm run build\npnpm test\n```",
                    "- Tests were not run.",
                ),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("Verification", result.stdout + result.stderr)
            self.assertIn("executable commands", result.stdout + result.stderr)

    def test_compact_inline_report_labels_pass(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            handoff.write_text(
                """**Files Changed:**
- `src/example.ts` — bounded fix.
**Contracts:**
- No public contract changes.
**Verification:**
```bash
pnpm test
```
**Regression Risk:**
- Focused test only.
**Recovery:**
- Revert `src/example.ts`.
""",
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_skill_delivery_template_passes_validator(self) -> None:
        skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        template = skill_text.split("````markdown\n", 1)[1].split("\n````", 1)[0]

        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            handoff.write_text(
                template.replace("`path`", "`src/example.ts`"),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_nonexistent_referenced_path_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff, "src/missing.ts")

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("src/missing.ts", result.stdout + result.stderr)
            self.assertIn("not found", (result.stdout + result.stderr).lower())

    def test_handoff_finds_nearest_package_json_upward(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "docs" / "handoff.md"
            self.write_complete_handoff(handoff)

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_explicit_project_root_resolves_referenced_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            project = root / "project"
            project.mkdir()
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = root / "handoff.md"
            self.write_complete_handoff(handoff)

            result = self.run_validator(
                VERIFY_DELIVERY, str(handoff), "--project-root", str(project)
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_package_command_without_manifest_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("package.json", result.stdout + result.stderr)

    def test_missing_package_command_is_a_hard_gate(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps({"scripts": {"test": "vitest run"}}), encoding="utf-8"
            )
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("build", result.stdout + result.stderr)

    def test_missing_pnpm_shorthand_in_handoff_is_a_hard_gate(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps({"scripts": {"build": "tsc"}}), encoding="utf-8"
            )
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8").replace("pnpm run build\n", ""),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("test", result.stdout + result.stderr)

    def test_unparsed_package_command_in_handoff_is_a_hard_gate(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8")
                .replace("pnpm run build", "pnpm exec tsc")
                .replace("pnpm test", "git diff --check"),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unparsed", (result.stdout + result.stderr).lower())

    def test_handoff_accepts_env_prefixes_and_forwarded_arguments(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8")
                .replace("pnpm run build", "CI=true pnpm run build -- --verbose")
                .replace("pnpm test", "env NODE_ENV=test pnpm test -- --coverage"),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("Script 'build' exists", result.stdout + result.stderr)
            self.assertIn("Script 'test' exists", result.stdout + result.stderr)

    def test_handoff_rejects_package_management_command(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps({"scripts": {"install": "echo unsafe"}}), encoding="utf-8"
            )
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8")
                .replace("pnpm run build", "pnpm install")
                .replace("pnpm test", "git diff --check"),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unparsed", (result.stdout + result.stderr).lower())

    def test_handoff_rejects_ambiguous_shorthand_but_accepts_explicit_run(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps({"scripts": {"deploy": "echo deploy", "test": "vitest run"}}),
                encoding="utf-8",
            )
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            explicit_handoff = project / "explicit.md"
            self.write_complete_handoff(explicit_handoff)
            explicit_handoff.write_text(
                explicit_handoff.read_text(encoding="utf-8").replace(
                    "pnpm run build", "pnpm run deploy"
                ),
                encoding="utf-8",
            )
            shorthand_handoff = project / "shorthand.md"
            shorthand_handoff.write_text(
                explicit_handoff.read_text(encoding="utf-8").replace(
                    "pnpm run deploy", "pnpm deploy"
                ),
                encoding="utf-8",
            )

            explicit = self.run_validator(VERIFY_DELIVERY, str(explicit_handoff))
            shorthand = self.run_validator(VERIFY_DELIVERY, str(shorthand_handoff))

            self.assertEqual(explicit.returncode, 0, explicit.stdout + explicit.stderr)
            self.assertNotEqual(shorthand.returncode, 0, shorthand.stdout + shorthand.stderr)
            self.assertIn("unparsed", (shorthand.stdout + shorthand.stderr).lower())

    def test_handoff_rejects_chained_package_command(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            handoff = project / "handoff.md"
            self.write_complete_handoff(handoff)
            handoff.write_text(
                handoff.read_text(encoding="utf-8").replace(
                    "pnpm run build", "pnpm test && pnpm run missing"
                ),
                encoding="utf-8",
            )

            result = self.run_validator(VERIFY_DELIVERY, str(handoff))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsafe", (result.stdout + result.stderr).lower())

    def test_directory_with_handoff_and_source_secret_exits_nonzero_without_value(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)
            (project / "src").mkdir()
            (project / "src" / "example.ts").write_text("export {};\n", encoding="utf-8")
            secret_value = "do-not-print-this-secret-value"
            (project / "src" / "secret.ts").write_text(
                f'const api_key = "{secret_value}";\n', encoding="utf-8"
            )
            self.write_complete_handoff(project / "handoff.md")

            result = self.run_validator(VERIFY_DELIVERY, str(project))

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            output = result.stdout + result.stderr
            self.assertIn("credential", output.lower())
            self.assertNotIn(secret_value, output)

    def test_missing_package_script_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                "pnpm run build, pnpm run type-check",
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            output = result.stdout + result.stderr
            self.assertIn("type-check", output)
            self.assertIn("missing", output.lower())

    def test_pnpm_shorthand_succeeds(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                "pnpm run build, pnpm test",
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_make_and_just_targets_are_validated(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "Makefile").write_text("build:\n\t@true\n", encoding="utf-8")
            (project / "justfile").write_text("test:\n    true\n", encoding="utf-8")

            passing = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "make build, just test"
            )
            missing = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "make deploy, just lint"
            )

            self.assertEqual(passing.returncode, 0, passing.stdout + passing.stderr)
            self.assertNotEqual(missing.returncode, 0, missing.stdout + missing.stderr)
            self.assertIn("deploy", missing.stdout + missing.stderr)
            self.assertIn("lint", missing.stdout + missing.stderr)

    def test_npm_and_yarn_scripts_are_supported(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                "npm run build, npm test, yarn run build, yarn test",
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_package_scripts_accept_env_prefixes_and_forwarded_arguments(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                "CI=true pnpm run test -- --coverage, "
                "env NODE_ENV=test pnpm test --watch, "
                "npm run build -- --pretty, yarn test --coverage",
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_package_management_command_is_unsupported_even_if_named_script_exists(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps({"scripts": {"install": "echo unsafe"}}), encoding="utf-8"
            )

            result = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "pnpm install"
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsupported", (result.stdout + result.stderr).lower())

    def test_ambiguous_shorthand_is_rejected_but_explicit_run_is_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            (project / "package.json").write_text(
                json.dumps(
                    {"scripts": {"deploy": "echo deploy", "version": "echo version"}}
                ),
                encoding="utf-8",
            )

            explicit = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "pnpm run deploy"
            )
            ambiguous = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "pnpm deploy, yarn version"
            )

            self.assertEqual(explicit.returncode, 0, explicit.stdout + explicit.stderr)
            self.assertNotEqual(ambiguous.returncode, 0, ambiguous.stdout + ambiguous.stderr)
            self.assertIn("unsupported", (ambiguous.stdout + ambiguous.stderr).lower())

    def test_check_scripts_rejects_chained_package_command(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                "pnpm test && pnpm run missing",
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsafe", (result.stdout + result.stderr).lower())

    def test_check_scripts_rejects_pipe(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "pnpm test | tee result.txt"
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsafe", (result.stdout + result.stderr).lower())

    def test_check_scripts_rejects_semicolon(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "pnpm test; pnpm run missing"
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsafe", (result.stdout + result.stderr).lower())

    def test_quoted_harmless_argument_is_supported(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            self.write_package_json(project)

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                'pnpm run test -- --grep "ordinary quoted argument"',
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_check_scripts_never_prints_script_bodies_or_env_secrets(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)
            secret_value = "supersecretvalue123"
            (project / "package.json").write_text(
                json.dumps(
                    {"scripts": {"test": f"API_KEY={secret_value} vitest run"}}
                ),
                encoding="utf-8",
            )

            result = self.run_validator(
                CHECK_SCRIPTS,
                str(project),
                "--commands",
                f"API_KEY={secret_value} pnpm test",
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertNotIn(secret_value, result.stdout + result.stderr)

    def test_unsupported_command_exits_nonzero(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory)

            result = self.run_validator(
                CHECK_SCRIPTS, str(project), "--commands", "cargo test"
            )

            self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("unsupported", (result.stdout + result.stderr).lower())


if __name__ == "__main__":
    unittest.main()
