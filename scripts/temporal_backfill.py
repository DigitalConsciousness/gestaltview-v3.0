#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from temporal.gestaltview_temporal import build_backfill_sql


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate or write the GestaltView temporal backfill SQL."
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write the generated SQL to temporal/gestaltview_backfill.sql.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=REPO_ROOT / "temporal" / "gestaltview_backfill.sql",
        help="Output file path when using --write.",
    )
    args = parser.parse_args()

    sql = build_backfill_sql()
    if args.write:
        args.output.write_text(sql + "\n", encoding="utf-8")
        print(f"Wrote {args.output}")
        return

    print(sql)


if __name__ == "__main__":
    main()

