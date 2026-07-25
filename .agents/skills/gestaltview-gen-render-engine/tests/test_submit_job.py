import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = Path(os.environ.get("SUBMIT_JOB_SCRIPT", SKILL_ROOT / "scripts/gestaltview_render_submit_job.py"))
TOKEN = "token-that-must-never-be-printed"


def load_script():
    spec = importlib.util.spec_from_file_location("submit_job", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


@contextmanager
def serve(responses):
    seen = []
    queue = list(responses)

    class Handler(BaseHTTPRequestHandler):
        def _handle(self):
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length)
            seen.append((self.command, self.path, dict(self.headers), body))
            status, payload = queue.pop(0)
            raw = payload if isinstance(payload, bytes) else json.dumps(payload).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        do_GET = do_POST = _handle
        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", seen
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
        if thread.is_alive():
            raise RuntimeError("loopback server did not stop")


class SubmitJobTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mod = load_script()

    def run_cli(self, request, *args, token=TOKEN):
        env = os.environ.copy()
        if token is None:
            env.pop("GESTALTVIEW_AUTH_TOKEN", None)
        else:
            env["GESTALTVIEW_AUTH_TOKEN"] = token
        return subprocess.run(
            [sys.executable, str(SCRIPT), str(request), *args],
            text=True, capture_output=True, env=env, timeout=5,
        )

    def test_exact_submit_endpoint_body_and_headers(self):
        payload = {"sourceFamily": "scene_graph", "sceneGraph": {"graphId": "g"}}
        with serve([(200, {"ok": True, "job": {"id": "j", "status": "ready"}})]) as (url, seen):
            result = self.mod.submit_render_job(payload, url + "/", TOKEN)
        self.assertTrue(result["ok"])
        method, path, headers, body = seen[0]
        self.assertEqual(("POST", "/api/render/engine"), (method, path))
        self.assertEqual(payload, json.loads(body))
        self.assertEqual("application/json", headers["Content-Type"])
        self.assertEqual("application/json", headers["Accept"])
        self.assertEqual(f"Bearer {TOKEN}", headers["Authorization"])
        self.assertNotIn(TOKEN, json.dumps(result))

    def test_poll_transitions_and_terminal_states(self):
        for terminal in ("ready", "failed", "cancelled"):
            with self.subTest(terminal=terminal), serve([
                (200, {"ok": False, "job": {"id": "a/b ?", "status": "rendering"}}),
                (200, {"ok": terminal == "ready", "job": {"id": "a/b ?", "status": terminal}}),
            ]) as (url, seen):
                result = self.mod.poll_render_job("a/b ?", url, TOKEN, 2, 0)
                self.assertEqual(terminal, result["job"]["status"])
                self.assertEqual("/api/render/status?jobId=a%2Fb+%3F", seen[0][1])

    def test_poll_timeout_and_invalid_arguments(self):
        with serve([(200, {"ok": False, "job": {"id": "j", "status": "rendering"}})]) as (url, _):
            result = self.mod.poll_render_job("j", url, TOKEN, 1, 0)
        self.assertEqual("POLL_TIMEOUT", result["error"]["code"])
        for attempts, interval in ((0, 0), (-1, 0), (1, -1)):
            with self.subTest(attempts=attempts, interval=interval), self.assertRaises(self.mod.SafeError) as caught:
                self.mod.poll_render_job("j", "http://127.0.0.1", TOKEN, attempts, interval)
            self.assertEqual("INVALID_POLL_ARGUMENT", caught.exception.code)

    def test_http_malformed_oversized_and_connection_errors_are_redacted(self):
        cases = [
            ([(503, b'{"secret":"server-secret"}')], "HTTP_ERROR"),
            ([(200, b"not-json")], "INVALID_RESPONSE"),
            ([(200, b"{" + b"x" * (self.mod.MAX_RESPONSE_BYTES + 1))], "RESPONSE_TOO_LARGE"),
        ]
        for responses, code in cases:
            with self.subTest(code=code), serve(responses) as (url, _), self.assertRaises(self.mod.SafeError) as caught:
                self.mod.request_json(url + "/private/provider/path", TOKEN)
            self.assertEqual(code, caught.exception.code)
            rendered = str(caught.exception)
            self.assertNotIn("server-secret", rendered)
            self.assertNotIn(TOKEN, rendered)
            self.assertNotIn("private", rendered)
        with self.assertRaises(self.mod.SafeError) as caught:
            self.mod.request_json("http://127.0.0.1:1/secret", TOKEN, timeout_seconds=0.1)
        self.assertEqual("CONNECTION_ERROR", caught.exception.code)
        self.assertNotIn("127.0.0.1", str(caught.exception))

    def test_url_and_submission_envelope_validation(self):
        for url in ("x", "file:///tmp/x", "http:///missing", "https://host/path?secret=x"):
            with self.subTest(url=url), self.assertRaises(self.mod.SafeError) as caught:
                self.mod.submit_render_job({}, url, TOKEN)
            self.assertEqual("INVALID_API_URL", caught.exception.code)
        with serve([(200, {"ok": True}), (200, [])]) as (url, _):
            for _ in range(2):
                with self.assertRaises(self.mod.SafeError) as caught:
                    self.mod.submit_render_job({}, url, TOKEN)
                self.assertEqual("INVALID_SUBMIT_RESPONSE", caught.exception.code)

    def test_cli_rejects_missing_bad_and_large_request_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            missing = root / "missing.json"
            for request, expected in (
                (missing, "REQUEST_FILE_NOT_FOUND"),
                (root, "REQUEST_FILE_INVALID"),
            ):
                result = self.run_cli(request, "--api-url", "http://example.test")
                self.assertEqual(expected, json.loads(result.stdout)["error"]["code"])
                self.assertNotIn(str(request), result.stdout + result.stderr)
            nonutf = root / "bad.json"
            nonutf.write_bytes(b"\xff")
            malformed = root / "malformed.json"
            malformed.write_text("{", encoding="utf-8")
            large = root / "large.json"
            large.write_bytes(b" " * (self.mod.MAX_REQUEST_BYTES + 1))
            for request, expected in (
                (nonutf, "REQUEST_FILE_ENCODING"),
                (malformed, "REQUEST_JSON_INVALID"),
                (large, "REQUEST_FILE_TOO_LARGE"),
            ):
                result = self.run_cli(request, "--api-url", "http://example.test")
                self.assertEqual(expected, json.loads(result.stdout)["error"]["code"])

    def test_cli_missing_token_and_no_token_argument(self):
        with tempfile.TemporaryDirectory() as tmp:
            request = Path(tmp) / "request.json"
            request.write_text("{}", encoding="utf-8")
            result = self.run_cli(request, "--api-url", "http://example.test", token=None)
            self.assertEqual(2, result.returncode)
            self.assertEqual("AUTH_TOKEN_MISSING", json.loads(result.stdout)["error"]["code"])
            help_result = self.run_cli(request, "--api-url", "http://example.test", "--token", TOKEN)
            self.assertNotEqual(0, help_result.returncode)
            self.assertNotIn(TOKEN, help_result.stdout + help_result.stderr)


if __name__ == "__main__":
    unittest.main()
