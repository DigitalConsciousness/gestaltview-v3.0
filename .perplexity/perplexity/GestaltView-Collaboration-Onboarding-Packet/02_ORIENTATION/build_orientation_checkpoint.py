#!/usr/bin/env python3
from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parent
SPINE_PATH = ROOT / "orientation_spine.v2.json"
DELTA_PATH = ROOT / "orientation_delta.current.json"
CHECKPOINT_PATH = ROOT / "orientation_checkpoint.latest.json"
def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))
def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
def build_checkpoint(spine: dict, delta: dict) -> dict:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    return {"packet_type":"gestaltview_orientation_checkpoint","packet_version":spine.get("packet_version","2.0.0"),"checkpoint_id":"orientation-checkpoint-latest","generated_at_utc":now,"spine_ref":"02_ORIENTATION/orientation_spine.v2.json","delta_ref":"02_ORIENTATION/orientation_delta.current.json","priority_changes":[*(f"Active blocker: {b.get('title','Unnamed blocker')}" for b in delta.get("active_blockers",[])[:3]),*(f"Changed assumption: {a}" for a in delta.get("changed_assumptions",[])[:3])],"load_first":["source_of_truth","constitutional_layers","active_blockers","memory_model","system_domains"]}
if __name__ == "__main__":
    save_json(CHECKPOINT_PATH, build_checkpoint(load_json(SPINE_PATH), load_json(DELTA_PATH)))
