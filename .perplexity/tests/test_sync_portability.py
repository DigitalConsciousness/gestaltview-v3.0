import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts" / "sync-perplexity-collaboration.mjs"


class SyncPortabilityTests(unittest.TestCase):
    def test_sync_target_can_be_renamed_and_invoked_from_any_cwd(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            context_root = Path(temporary_directory) / ".any-digital-intelligence"
            payload = context_root / "renamed-payload"
            for marker in ("api", "client", "shared"):
                (payload / marker).mkdir(parents=True, exist_ok=True)

            result = subprocess.run(
                ["node", str(SCRIPT), "--print-config"],
                cwd=temporary_directory,
                env={
                    **os.environ,
                    "GESTALTVIEW_COLLABORATOR_ROOT": str(context_root),
                },
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            config = json.loads(result.stdout)
            self.assertEqual(config["contextRoot"], str(context_root.resolve()))
            self.assertEqual(config["payloadRoot"], str(payload.resolve()))
            self.assertNotIn(".perplexity", config["manifestPath"])


if __name__ == "__main__":
    unittest.main()
