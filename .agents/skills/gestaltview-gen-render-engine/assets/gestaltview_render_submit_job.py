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


def request_json(
    url: str,
    token: str,
    method: str = "GET",
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
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
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Request failed: {exc.reason}") from exc


def submit_render_job(
    request_payload: dict[str, Any],
    api_url: str,
    auth_token: str,
) -> dict[str, Any]:
    endpoint = f"{api_url.rstrip('/')}/api/render/engine"
    return request_json(endpoint, auth_token, method="POST", payload=request_payload)


def poll_render_job(
    job_id: str,
    api_url: str,
    auth_token: str,
    max_attempts: int = 24,
    interval_seconds: float = 2.0,
) -> dict[str, Any]:
    query = urllib.parse.urlencode({"jobId": job_id})
    endpoint = f"{api_url.rstrip('/')}/api/render/status?{query}"
    last: dict[str, Any] = {}
    for _ in range(max_attempts):
        last = request_json(endpoint, auth_token)
        status = str(last.get("job", {}).get("status", ""))
        if status in {"ready", "failed", "cancelled"}:
            return last
        time.sleep(interval_seconds)
    return {
        "ok": False,
        "error": {
            "code": "POLL_TIMEOUT",
            "message": "The job did not reach a terminal state within the polling window.",
        },
        "last": last,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request", type=Path, help="Canonical render-request JSON file.")
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--token-env", default="GESTALTVIEW_AUTH_TOKEN")
    parser.add_argument("--poll", action="store_true")
    parser.add_argument("--max-attempts", type=int, default=24)
    parser.add_argument("--interval", type=float, default=2.0)
    args = parser.parse_args()

    token = os.getenv(args.token_env, "")
    if not token:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": {
                        "code": "AUTH_TOKEN_MISSING",
                        "message": f"Set {args.token_env}; tokens are intentionally not accepted on the command line.",
                    },
                },
                indent=2,
            )
        )
        return 2

    try:
        payload = json.loads(args.request.read_text(encoding="utf-8"))
        submitted = submit_render_job(payload, args.api_url, token)
        result = submitted
        job_id = str(submitted.get("job", {}).get("id", ""))
        status = str(submitted.get("job", {}).get("status", ""))
        if args.poll and job_id and status not in {"ready", "failed", "cancelled"}:
            result = poll_render_job(
                job_id,
                args.api_url,
                token,
                max_attempts=args.max_attempts,
                interval_seconds=args.interval,
            )
        print(json.dumps(result, indent=2))
        return 0 if result.get("ok") else 1
    except (OSError, json.JSONDecodeError, RuntimeError) as exc:
        print(json.dumps({"ok": False, "error": {"code": "SUBMIT_FAILED", "message": str(exc)}}, indent=2))
        return 1


if __name__ == "__main__":
    sys.exit(main())
