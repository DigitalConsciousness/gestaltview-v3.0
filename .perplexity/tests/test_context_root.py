import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "context_root.py"


def load_module():
    spec = importlib.util.spec_from_file_location("context_root", SCRIPT)
    if spec is None or spec.loader is None:
        raise AssertionError(f"Unable to load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ContextRootTests(unittest.TestCase):
    def test_finds_collaboration_root_after_directory_is_renamed(self) -> None:
        module = load_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / ".any-collaborator"
            nested = root / "nested" / "working"
            nested.mkdir(parents=True)
            (root / "MANIFEST.json").write_text('{"contextContract": "gestaltview.di-context.v1"}')

            self.assertEqual(module.find_context_root(nested), root.resolve())

    def test_resolves_payload_root_without_assuming_its_folder_name(self) -> None:
        module = load_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "portable-context"
            payload = root / "snapshot"
            payload.mkdir(parents=True)
            (root / "MANIFEST.json").write_text('{"contextContract": "gestaltview.di-context.v1"}')
            (payload / "package.json").write_text("{}")

            self.assertEqual(module.find_payload_root(root), payload.resolve())

    def test_resolves_non_node_payload_from_repository_markers(self) -> None:
        module = load_module()
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory) / "portable-context"
            payload = root / "renamed-snapshot"
            for marker in ("api", "client", "shared"):
                (payload / marker).mkdir(parents=True, exist_ok=True)
            (root / "MANIFEST.json").write_text('{"contextContract": "gestaltview.di-context.v1"}')

            self.assertEqual(module.find_payload_root(root), payload.resolve())


if __name__ == "__main__":
    unittest.main()
