#!/usr/bin/env python3
"""Lightweight diligence exporter for local debugging."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "Diligence_Reports"


def read_csv(name: str) -> list[dict[str, str]]:
    path = REPORTS / name
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def main() -> None:
    payload = {
        "claims": read_csv("claim_ledger.csv"),
        "chronology": read_csv("chronology.csv"),
        "skepticism": read_csv("skepticism_register.csv"),
        "evidence_index": read_csv("evidence_index.csv"),
        "architecture_map": read_csv("architecture_map.csv"),
        "bundle_summary": json.loads((REPORTS / "bundle_summary.json").read_text(encoding="utf-8")),
    }
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
