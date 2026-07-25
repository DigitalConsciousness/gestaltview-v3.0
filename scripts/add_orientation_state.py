#!/usr/bin/env python3
"""
add_orientation_state.py
========================
Adds the `orientation_state` block to all embodiment profile JSON files
that do not yet have it, as required by SPEC §12.

The orientation_state block uses the spine/delta/checkpoint pattern:
  - checkpoint_ref: points to the latest orientation checkpoint file
  - last_absorbed_checkpoint_id: the ID of the last absorbed checkpoint
  - absorption_status: "current" | "stale" | "pending"
  - needs_reorientation: boolean flag
  - orientation_confidence: 0.0 - 1.0 float

This script is safe to re-run: it skips profiles that already have
orientation_state.
"""
import json
import os
import sys

PROFILES_DIR = os.path.join(os.path.dirname(__file__), "..", "embodiment_profiles")
CHECKPOINT_REF = "orientation/orientation_checkpoint.latest.json"
DEFAULT_CHECKPOINT_ID = "orientation-checkpoint-latest"

DEFAULT_ORIENTATION_STATE = {
    "checkpoint_ref": CHECKPOINT_REF,
    "last_absorbed_checkpoint_id": DEFAULT_CHECKPOINT_ID,
    "absorption_status": "current",
    "needs_reorientation": False,
    "orientation_confidence": 0.92,
}

def process_profiles(profiles_dir: str) -> None:
    json_files = sorted(
        f for f in os.listdir(profiles_dir) if f.endswith(".json")
    )
    updated = 0
    skipped = 0
    for filename in json_files:
        filepath = os.path.join(profiles_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as fh:
                profile = json.load(fh)
        except (json.JSONDecodeError, OSError) as exc:
            print(f"  WARN: Could not read {filename}: {exc}", file=sys.stderr)
            continue

        if "orientation_state" in profile:
            print(f"  SKIP (already has orientation_state): {filename}")
            skipped += 1
            continue

        # Insert orientation_state after agentMeta if present, else at end
        new_profile = {}
        inserted = False
        for key, value in profile.items():
            new_profile[key] = value
            if key == "agentMeta" and not inserted:
                new_profile["orientation_state"] = DEFAULT_ORIENTATION_STATE
                inserted = True

        if not inserted:
            new_profile["orientation_state"] = DEFAULT_ORIENTATION_STATE

        with open(filepath, "w", encoding="utf-8") as fh:
            json.dump(new_profile, fh, indent=2, ensure_ascii=False)
            fh.write("\n")

        print(f"  UPDATED: {filename}")
        updated += 1

    print(f"\nDone. Updated: {updated}, Skipped (already had it): {skipped}")

if __name__ == "__main__":
    process_profiles(PROFILES_DIR)
