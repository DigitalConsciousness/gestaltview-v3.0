#!/usr/bin/env python3
"""Submit a canonical GestaltView render request and optionally poll its ledger."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

MAX_REQUEST_BYTES = 1_048_576
MAX_RESPONSE_BYTES = 2_097_152
REQUEST_TIMEOUT_SECONDS = 30.0
TERMINAL_STATES = frozenset({"ready", "failed", "cancelled"})


class SafeError(Exception):
    """An operator-safe failure with a stable machine-readable code."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def api_origin(value: str) -> str:
    try:
        parsed = urllib.parse.urlsplit(value)
        valid_port = parsed.port
    except ValueError as exc:
        raise SafeError("INVALID_API_URL", "The API URL is invalid.") from exc
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
        or parsed.path not in {"", "/"}
        or valid_port is None and ":" in parsed.netloc.rsplit("]", 1)[-1]
    ):
        raise SafeError("INVALID_API_URL", "The API URL must be an HTTP(S) origin.")
    return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))


def request_json(
    url: str,
    token: str,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
    timeout_seconds: float = REQUEST_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    data = json.dumps(payload, allow_nan=False).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
    except urllib.error.HTTPError as exc:
        exc.close()
        raise SafeError("HTTP_ERROR", "The render API rejected the request.") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise SafeError("CONNECTION_ERROR", "The render API could not be reached.") from exc
    if len(raw) > MAX_RESPONSE_BYTES:
        raise SafeError("RESPONSE_TOO_LARGE", "The render API response exceeded the safety limit.")
    try:
        result = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SafeError("INVALID_RESPONSE", "The render API returned an invalid JSON response.") from exc
    if not isinstance(result, dict):
        raise SafeError("INVALID_RESPONSE", "The render API returned an invalid response envelope.")
    return result


def submit_render_job(request_payload: dict[str, Any], api_url: str, auth_token: str) -> dict[str, Any]:
    endpoint = f"{api_origin(api_url)}/api/render/engine"
    try:
        response = request_json(endpoint, auth_token, method="POST", payload=request_payload)
    except SafeError as exc:
        if exc.code == "INVALID_RESPONSE":
            raise SafeError("INVALID_SUBMIT_RESPONSE", "The render API returned an invalid submission receipt.") from exc
        raise
    job = response.get("job")
    if (
        not isinstance(response.get("ok"), bool)
        or not isinstance(job, dict)
        or not isinstance(job.get("id"), str)
        or not job["id"]
        or not isinstance(job.get("status"), str)
        or not job["status"]
    ):
        raise SafeError("INVALID_SUBMIT_RESPONSE", "The render API returned an invalid submission receipt.")
    return response


def poll_render_job(
    job_id: str,
    api_url: str,
    auth_token: str,
    max_attempts: int = 24,
    interval_seconds: float = 2.0,
) -> dict[str, Any]:
    if max_attempts <= 0 or interval_seconds < 0:
        raise SafeError("INVALID_POLL_ARGUMENT", "Polling attempts must be positive and interval non-negative.")
    query = urllib.parse.urlencode({"jobId": job_id})
    endpoint = f"{api_origin(api_url)}/api/render/status?{query}"
    last: dict[str, Any] = {}
    for attempt in range(max_attempts):
        last = request_json(endpoint, auth_token)
        job = last.get("job")
        status = job.get("status") if isinstance(job, dict) else None
        if status in TERMINAL_STATES:
            return last
        if attempt + 1 < max_attempts:
            time.sleep(interval_seconds)
    return {"ok": False, "error": {"code": "POLL_TIMEOUT", "message": "The job did not reach a terminal state within the polling window."}}


def read_request(path: Path) -> dict[str, Any]:
    try:
        if not path.exists():
            raise SafeError("REQUEST_FILE_NOT_FOUND", "The request file was not found.")
        if not path.is_file():
            raise SafeError("REQUEST_FILE_INVALID", "The request path is not a regular file.")
        with path.open("rb") as handle:
            raw = handle.read(MAX_REQUEST_BYTES + 1)
    except SafeError:
        raise
    except OSError as exc:
        raise SafeError("REQUEST_FILE_UNREADABLE", "The request file could not be read.") from exc
    if len(raw) > MAX_REQUEST_BYTES:
        raise SafeError("REQUEST_FILE_TOO_LARGE", "The request file exceeded the safety limit.")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except UnicodeDecodeError as exc:
        raise SafeError("REQUEST_FILE_ENCODING", "The request file must be UTF-8.") from exc
    except json.JSONDecodeError as exc:
        raise SafeError("REQUEST_JSON_INVALID", "The request file must contain valid JSON.") from exc
    if not isinstance(payload, dict):
        raise SafeError("REQUEST_JSON_INVALID", "The request JSON must be an object.")
    return payload


def print_error(error: SafeError) -> None:
    print(json.dumps({"ok": False, "error": {"code": error.code, "message": str(error)}}, indent=2))


def main() -> int:
    if "--token" in sys.argv[1:] or any(arg.startswith("--token=") for arg in sys.argv[1:]):
        print_error(SafeError("TOKEN_ARGUMENT_FORBIDDEN", "Authentication tokens are accepted only through an environment variable."))
        return 2
    parser = argparse.ArgumentParser(description=__doc__, allow_abbrev=False)
    parser.add_argument("request", type=Path, help="Canonical render-request JSON file.")
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--token-env", default="GESTALTVIEW_AUTH_TOKEN")
    parser.add_argument("--poll", action="store_true")
    parser.add_argument("--max-attempts", type=int, default=24)
    parser.add_argument("--interval", type=float, default=2.0)
    args = parser.parse_args()
    token = os.getenv(args.token_env, "")
    if not token:
        print_error(SafeError("AUTH_TOKEN_MISSING", "The configured authentication-token environment variable is empty."))
        return 2
    try:
        if args.max_attempts <= 0 or args.interval < 0:
            raise SafeError("INVALID_POLL_ARGUMENT", "Polling attempts must be positive and interval non-negative.")
        payload = read_request(args.request)
        submitted = submit_render_job(payload, args.api_url, token)
        result = submitted
        job = submitted["job"]
        if args.poll and job["status"] not in TERMINAL_STATES:
            result = poll_render_job(job["id"], args.api_url, token, args.max_attempts, args.interval)
        print(json.dumps(result, indent=2))
        return 0 if result.get("ok") else 1
    except SafeError as exc:
        print_error(exc)
        return 1
    except (TypeError, ValueError) as exc:
        print_error(SafeError("REQUEST_INVALID", "The request could not be safely encoded."))
        return 1


if __name__ == "__main__":
    sys.exit(main())
