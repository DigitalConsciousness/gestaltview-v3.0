# server/core/provenance_upgrade_job.py
# Background upgrade job — run on a cron schedule (every 2h is ideal).
#
# Finds all envelopes with ots_status='pending' older than 90 minutes
# (enough time for Bitcoin block confirmation) and attempts to upgrade them.
#
# Usage:
#   python -m server.core.provenance_upgrade_job
#   # or via cron / Supabase pg_cron / Vercel cron job at /api/cron/provenance-upgrade

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone, timedelta

from supabase import create_client
from . import provenance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONFIRM_WINDOW_MINUTES = 90  # Bitcoin block ~10min, wait 9 blocks
BATCH_SIZE = 20


def run_upgrade_batch() -> dict:
    """
    Fetch up to BATCH_SIZE pending envelopes older than CONFIRM_WINDOW_MINUTES,
    attempt upgrade on each, return a summary dict.
    """
    db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=CONFIRM_WINDOW_MINUTES)).isoformat()

    resp = (
        db.table("provenance_envelopes")
        .select("id, subject_type, subject_id, created_at")
        .eq("ots_status", "pending")
        .lt("created_at", cutoff)
        .limit(BATCH_SIZE)
        .execute()
    )

    rows = resp.data or []
    logger.info("[upgrade_job] found %d pending envelopes to attempt upgrade", len(rows))

    upgraded = []
    skipped = []
    failed = []

    for row in rows:
        envelope_id = row["id"]
        try:
            result = provenance.upgrade_envelope(envelope_id)
            if result.get("ots_status") == "upgraded":
                upgraded.append(envelope_id)
                logger.info("[upgrade_job] upgraded %s", envelope_id)
            else:
                skipped.append(envelope_id)
                logger.info("[upgrade_job] not yet confirmed %s", envelope_id)
        except Exception as exc:
            failed.append({"id": envelope_id, "error": str(exc)})
            logger.warning("[upgrade_job] failed %s: %s", envelope_id, exc)

    summary = {
        "ran_at": datetime.now(timezone.utc).isoformat(),
        "total": len(rows),
        "upgraded": len(upgraded),
        "skipped": len(skipped),
        "failed": len(failed),
        "failed_ids": failed,
    }
    logger.info("[upgrade_job] complete: %s", summary)
    return summary


if __name__ == "__main__":
    result = run_upgrade_batch()
    print(result)
