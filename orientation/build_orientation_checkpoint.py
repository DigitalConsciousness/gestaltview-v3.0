#!/usr/bin/env python3
"""
GestaltView v2 — Orientation Checkpoint Builder
© 2026 Keith Soyka / GestaltView

Rebuilds orientation/orientation_checkpoint.latest.json from:
  - orientation/orientation_spine.v2.json   (stable — rarely changes)
  - orientation/orientation_delta.current.json  (living — updated often)

Usage:
  python3 orientation/build_orientation_checkpoint.py

When to run:
  - After any update to orientation_delta.current.json
  - After resolving a blocker (move it out of active_blockers first)
  - After any changed_assumptions or what_to_forget entries are added
  - Before syncing orientation state into embodiment profiles

Output:
  orientation/orientation_checkpoint.latest.json
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SPINE_PATH = ROOT / "orientation_spine.v2.json"
DELTA_PATH = ROOT / "orientation_delta.current.json"
CHECKPOINT_PATH = ROOT / "orientation_checkpoint.latest.json"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def build_checkpoint(spine: dict, delta: dict) -> dict:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    active_blockers = delta.get("active_blockers", [])
    resolved_items = delta.get("resolved_or_stabilized", [])

    load_first = [
        "source_of_truth",
        "constitutional_layers",
        "active_blockers",
        "trainer_dashboard_workflows",
        "table_boundary_guidance",
        "knowledge_distribution_hub_v1",
    ]

    # Build priority changes from blockers + changed assumptions
    priority_changes: list[str] = []
    for blocker in active_blockers[:3]:
        title = blocker.get("title", "Unnamed blocker")
        priority_changes.append(f"Active blocker: {title}")
    for assumption in delta.get("changed_assumptions", [])[:3]:
        priority_changes.append(f"Changed assumption: {assumption}")

    # Only pull resolved (not just stable) items for removal list
    resolved_items_removed = [
        item.get("title", "Unnamed resolved item")
        for item in resolved_items
        if item.get("status") == "resolved"
    ]

    # Embodiment profile shape — kept in checkpoint for agent sync reference
    embodiment_profile_shape = {
        "orientation_state": {
            "last_absorbed_checkpoint_id": "orientation-checkpoint-latest",
            "checkpoint_ref": str(CHECKPOINT_PATH.relative_to(ROOT.parent)),
            "absorption_status": "current",
            "needs_reorientation": False,
            "orientation_confidence": 0.92,
            "priority_changes_last_seen": priority_changes[:2],
        }
    }

    return {
        "packet_type": "gestaltview_orientation_checkpoint",
        "packet_version": spine.get("packet_version", "2.0.0"),
        "checkpoint_id": "orientation-checkpoint-latest",
        "generated_at_utc": now,
        "spine_ref": str(SPINE_PATH.relative_to(ROOT.parent)),
        "delta_ref": str(DELTA_PATH.relative_to(ROOT.parent)),
        "priority_changes": priority_changes,
        "resolved_items_removed": resolved_items_removed,
        "load_first": load_first,
        "absorption_guidance": {
            "read_mode": "delta-first",
            "when_stale": (
                "If the checkpoint timestamp is older than the latest "
                "BugWalkBoard or CurrentState update, re-absorb before acting."
            ),
            "goal": (
                "Fast current-state orientation without requiring a full reread "
                "of the entire packet."
            ),
        },
        "embodiment_profile_shape": embodiment_profile_shape,
    }


def main() -> None:
    print()
    print("  Building orientation checkpoint...")
    print(f"  Spine:  {SPINE_PATH}")
    print(f"  Delta:  {DELTA_PATH}")

    if not SPINE_PATH.exists():
        print(f"  \u274c Spine not found: {SPINE_PATH}")
        raise SystemExit(1)
    if not DELTA_PATH.exists():
        print(f"  \u274c Delta not found: {DELTA_PATH}")
        raise SystemExit(1)

    spine = load_json(SPINE_PATH)
    delta = load_json(DELTA_PATH)
    checkpoint = build_checkpoint(spine, delta)
    save_json(CHECKPOINT_PATH, checkpoint)

    blockers = delta.get("active_blockers", [])
    resolved = [i for i in delta.get("resolved_or_stabilized", []) if i.get("status") == "resolved"]

    print()
    print(f"  \u2713 Checkpoint written: {CHECKPOINT_PATH}")
    print(f"  Active blockers : {len(blockers)}")
    print(f"  Resolved items  : {len(resolved)}")
    print(f"  Priority changes: {len(checkpoint['priority_changes'])}")
    print()
    print("  Next steps:")
    print("    1. Review orientation_checkpoint.latest.json")
    print("    2. Commit all four orientation files together")
    print("    3. Sync checkpoint ref into any embodiment profiles that need reorientation")
    print()


if __name__ == "__main__":
    main()
