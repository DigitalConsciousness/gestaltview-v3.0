#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "config" / "deepgram_voice_profiles.json"
MODEL_RE = re.compile(r"^aura-2-[a-z0-9-]+-en$")


def main() -> int:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    profiles = data.get("profiles", {})
    errors: list[str] = []
    warnings: list[str] = []
    if len(profiles) != 24:
        warnings.append(f"Expected 24 current profiles; found {len(profiles)}")
    seen_models: dict[str, str] = {}
    for slug, profile in sorted(profiles.items()):
        model = profile.get("tts_model", "")
        speed = profile.get("speed")
        if not MODEL_RE.match(model):
            errors.append(f"{slug}: invalid Aura-2 English model: {model!r}")
        if not isinstance(speed, (int, float)) or not 0.7 <= float(speed) <= 1.5:
            errors.append(f"{slug}: speed must be 0.7..1.5, got {speed!r}")
        if profile.get("review_status") not in {"proposed", "auditioned", "approved", "rejected"}:
            errors.append(f"{slug}: invalid review_status")
        if not profile.get("consent_boundary"):
            errors.append(f"{slug}: missing consent_boundary")
        if model in seen_models:
            warnings.append(f"{slug} and {seen_models[model]} share {model}")
        else:
            seen_models[model] = slug
    for warning in warnings:
        print(f"WARNING: {warning}")
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"Deepgram voice registry valid: {len(profiles)} profiles")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
