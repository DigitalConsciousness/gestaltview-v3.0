#!/usr/bin/env python3
"""Resolve the portable GestaltView collaborator context and payload roots."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


CONTEXT_CONTRACT = "gestaltview.di-context.v1"
MARKER = "MANIFEST.json"


def _is_context_root(path: Path) -> bool:
    marker = path / MARKER
    if not marker.is_file():
        return False
    try:
        return json.loads(marker.read_text(encoding="utf-8")).get("contextContract") == CONTEXT_CONTRACT
    except (OSError, json.JSONDecodeError):
        return False


def find_context_root(start: str | Path | None = None) -> Path:
    override = os.environ.get("GESTALTVIEW_COLLABORATOR_ROOT")
    candidate = Path(override or start or Path.cwd()).expanduser().resolve()
    if candidate.is_file():
        candidate = candidate.parent
    for path in (candidate, *candidate.parents):
        if _is_context_root(path):
            return path
    raise FileNotFoundError(
        f"Could not find {MARKER} with contextContract={CONTEXT_CONTRACT!r} above {candidate}"
    )


def find_payload_root(context_root: str | Path | None = None) -> Path:
    root = find_context_root(context_root)

    def is_payload(path: Path) -> bool:
        if (path / "package.json").is_file():
            return True
        return sum((path / marker).is_dir() for marker in ("api", "client", "shared", "server")) >= 3

    if is_payload(root):
        return root
    candidates = sorted(
        child.resolve()
        for child in root.iterdir()
        if child.is_dir() and is_payload(child)
    )
    if len(candidates) == 1:
        return candidates[0]
    raise FileNotFoundError(
        f"Expected exactly one repository payload under {root}; found {len(candidates)}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", default=None, help="Path to begin searching from.")
    parser.add_argument("--payload", action="store_true", help="Print the repository payload root.")
    args = parser.parse_args()
    root = find_payload_root(args.start) if args.payload else find_context_root(args.start)
    print(root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
