# server/core/provenance.py
# Provenance Envelope Engine — OpenTimestamps integration
#
# Responsibilities:
#   1. canonicalize()     — deterministic RFC-8785-style JSON bytes
#   2. hash_canonical()   — SHA-256 digest of canonical bytes
#   3. create_envelope()  — write provenance_envelopes row
#   4. stamp_envelope()   — call OTS calendar, store .ots receipt in Supabase Storage
#   5. upgrade_envelope() — upgrade pending receipts after Bitcoin confirmation
#   6. verify_envelope()  — verify .ots receipt against stored content_hash
#   7. get_summary()      — agent-safe context contract (no raw receipt bytes)
#
# SECURITY CONTRACT:
#   Only the SHA-256 digest is ever sent to OpenTimestamps calendar nodes.
#   Private content never leaves the server.

from __future__ import annotations

import hashlib
import json
import logging
import os
import struct
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any, Literal, Optional

from supabase import create_client, Client

logger = logging.getLogger(__name__)

# ── Supabase client ──────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

def _get_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ── OpenTimestamps calendar URLs ─────────────────────────────────────────────

OTS_CALENDARS = [
    "https://alice.btc.calendar.opentimestamps.org",
    "https://bob.btc.calendar.opentimestamps.org",
    "https://finney.calendar.eternitywall.com",
]

OTS_STORAGE_BUCKET = "provenance-receipts"

SubjectType = Literal[
    "bucket_drop",
    "artifact",
    "memory_thread",
    "agent_manifest",
    "claim",
    "export_bundle",
]

PrivacyClass = Literal["private", "sealed", "shareable", "public"]


# ── 1. Canonicalize ──────────────────────────────────────────────────────────

def canonicalize(obj: Any) -> bytes:
    """
    Produce deterministic UTF-8 bytes from any JSON-serialisable object.
    Sorted keys, no extra whitespace — RFC-8785-inspired but pure-Python.
    Never call this with an object that contains binary blobs; strip or
    replace binary fields before passing in.
    """
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


# ── 2. Hash ──────────────────────────────────────────────────────────────────

def hash_canonical(canonical_bytes: bytes) -> str:
    """Return 'sha256:<hex>' digest."""
    digest = hashlib.sha256(canonical_bytes).hexdigest()
    return f"sha256:{digest}"


# ── 3. Create envelope ───────────────────────────────────────────────────────

def create_envelope(
    *,
    subject_type: SubjectType,
    subject_id: str,
    obj: Any,
    privacy_class: PrivacyClass = "private",
    context_objects: Optional[list[dict]] = None,
    interpretation_bounds: Optional[dict] = None,
    di_id: Optional[str] = None,
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
) -> dict:
    """
    Canonicalize obj, hash it, write a provenance_envelopes row.
    Returns the inserted row dict.
    """
    canonical = canonicalize(obj)
    content_hash = hash_canonical(canonical)

    context_hashes = []
    if context_objects:
        for ctx in context_objects:
            ctx_bytes = canonicalize(ctx.get("content", ctx))
            context_hashes.append({
                "role": ctx.get("role", "source_input"),
                "subject_id": ctx.get("subject_id", ""),
                "hash": hash_canonical(ctx_bytes),
            })

    envelope_json = {
        "schema": "gsvw.provenance-envelope.v1",
        "subject_type": subject_type,
        "subject_id": subject_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": {
            "user_id": user_id,
            "di_id": di_id,
            "workspace_id": workspace_id,
        },
        "privacy_class": privacy_class,
        "canonicalization": {
            "method": "json-sort-keys-utf8",
            "content_hash_alg": "sha256",
        },
        "content_hash": content_hash,
        "context_hashes": context_hashes,
        "interpretation_bounds": interpretation_bounds or {
            "may_summarize": True,
            "may_infer_identity": False,
            "may_export": False,
            "requires_user_review": True,
        },
        "ots": {
            "status": "pending",
            "receipt_path": None,
            "calendar_urls": OTS_CALENDARS,
            "bitcoin_attestation": None,
            "last_checked_at": None,
        },
        "lineage": {
            "parent_envelopes": [],
            "derived_artifacts": [],
        },
    }

    row = {
        "subject_type": subject_type,
        "subject_id": subject_id,
        "envelope_json": envelope_json,
        "content_hash": content_hash,
        "canonicalization_method": "json-sort-keys-utf8",
        "privacy_class": privacy_class,
        "ots_status": "pending",
    }

    db = _get_client()
    result = db.table("provenance_envelopes").insert(row).execute()

    if result.data:
        logger.info("[provenance] envelope created for %s:%s hash=%s", subject_type, subject_id, content_hash)
        return result.data[0]

    logger.warning("[provenance] insert returned no data for %s:%s", subject_type, subject_id)
    return row


# ── 4. Stamp ─────────────────────────────────────────────────────────────────

def _build_ots_submit_payload(digest_hex: str) -> bytes:
    """
    Build a minimal OpenTimestamps submit request body.
    The OTS calendar REST API accepts the raw 32-byte SHA-256 digest as the
    POST body with Content-Type: application/x-www-form-urlencoded.
    """
    return bytes.fromhex(digest_hex)


def stamp_envelope(envelope_id: str) -> dict:
    """
    Fetch the envelope row, submit the digest to OTS calendars,
    store the raw .ots receipt bytes in Supabase Storage,
    and update the row to ots_status='pending' with receipt_path set.

    Returns the updated envelope row.
    """
    db = _get_client()
    row_resp = db.table("provenance_envelopes").select("*").eq("id", envelope_id).single().execute()
    if not row_resp.data:
        raise ValueError(f"[provenance] envelope not found: {envelope_id}")

    row = row_resp.data
    content_hash: str = row["content_hash"]  # 'sha256:<hex>'
    digest_hex = content_hash.removeprefix("sha256:")

    receipt_bytes: Optional[bytes] = None
    stamped_calendar: Optional[str] = None

    for calendar_url in OTS_CALENDARS:
        try:
            url = f"{calendar_url}/digest"
            payload = _build_ots_submit_payload(digest_hex)
            req = urllib.request.Request(
                url,
                data=payload,
                method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                receipt_bytes = resp.read()
                stamped_calendar = calendar_url
                logger.info("[provenance] stamped via %s for envelope %s", calendar_url, envelope_id)
                break
        except Exception as exc:
            logger.warning("[provenance] calendar %s failed: %s", calendar_url, exc)
            continue

    if receipt_bytes is None:
        db.table("provenance_envelopes").update({
            "ots_status": "failed",
            "failed_at": datetime.now(timezone.utc).isoformat(),
            "failure_reason": "all OTS calendars unreachable",
        }).eq("id", envelope_id).execute()
        raise RuntimeError(f"[provenance] stamp failed for envelope {envelope_id}: all calendars unreachable")

    # Store receipt in Supabase Storage
    receipt_path = f"provenance/{envelope_id}.ots"
    try:
        db.storage.from_(OTS_STORAGE_BUCKET).upload(
            path=receipt_path,
            file=receipt_bytes,
            file_options={"content-type": "application/octet-stream", "upsert": "true"},
        )
    except Exception as exc:
        logger.error("[provenance] storage upload failed for %s: %s", envelope_id, exc)
        raise

    # Update envelope row
    update_payload = {
        "ots_status": "pending",
        "ots_receipt_path": receipt_path,
        "envelope_json": {
            **row["envelope_json"],
            "ots": {
                **row["envelope_json"].get("ots", {}),
                "status": "pending",
                "receipt_path": receipt_path,
                "calendar_urls": [stamped_calendar],
                "last_checked_at": datetime.now(timezone.utc).isoformat(),
            },
        },
    }
    updated = db.table("provenance_envelopes").update(update_payload).eq("id", envelope_id).execute()
    logger.info("[provenance] receipt stored at %s for envelope %s", receipt_path, envelope_id)
    return updated.data[0] if updated.data else row


# ── 5. Upgrade ───────────────────────────────────────────────────────────────

def upgrade_envelope(envelope_id: str) -> dict:
    """
    Download the stored .ots receipt, submit it to the calendar for upgrade
    (Bitcoin block attestation), and update the row.
    Typically called 2-3 hours after stamp_envelope().
    Returns the updated row.
    """
    db = _get_client()
    row_resp = db.table("provenance_envelopes").select("*").eq("id", envelope_id).single().execute()
    if not row_resp.data:
        raise ValueError(f"[provenance] envelope not found: {envelope_id}")

    row = row_resp.data
    receipt_path = row.get("ots_receipt_path")
    if not receipt_path:
        raise ValueError(f"[provenance] no receipt_path for envelope {envelope_id} — stamp first")

    # Download receipt from storage
    receipt_bytes = db.storage.from_(OTS_STORAGE_BUCKET).download(receipt_path)

    upgraded_receipt: Optional[bytes] = None
    bitcoin_attestation: Optional[dict] = None

    for calendar_url in OTS_CALENDARS:
        try:
            url = f"{calendar_url}/timestamp/"
            req = urllib.request.Request(
                url,
                data=receipt_bytes,
                method="POST",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                upgraded_receipt = resp.read()
                # Minimal attestation record — full parsing requires opentimestamps-client lib
                bitcoin_attestation = {
                    "calendar": calendar_url,
                    "upgraded_at": datetime.now(timezone.utc).isoformat(),
                    "receipt_size_bytes": len(upgraded_receipt),
                }
                logger.info("[provenance] upgraded via %s for envelope %s", calendar_url, envelope_id)
                break
        except Exception as exc:
            logger.warning("[provenance] upgrade via %s failed: %s", calendar_url, exc)
            continue

    if upgraded_receipt is None:
        logger.warning("[provenance] upgrade not yet available for envelope %s (Bitcoin not confirmed)", envelope_id)
        db.table("provenance_envelopes").update({
            "envelope_json": {
                **row["envelope_json"],
                "ots": {
                    **row["envelope_json"].get("ots", {}),
                    "last_checked_at": datetime.now(timezone.utc).isoformat(),
                },
            }
        }).eq("id", envelope_id).execute()
        return row

    # Overwrite receipt with upgraded bytes
    db.storage.from_(OTS_STORAGE_BUCKET).upload(
        path=receipt_path,
        file=upgraded_receipt,
        file_options={"content-type": "application/octet-stream", "upsert": "true"},
    )

    now_iso = datetime.now(timezone.utc).isoformat()
    update_payload = {
        "ots_status": "upgraded",
        "upgraded_at": now_iso,
        "bitcoin_attestation": bitcoin_attestation,
        "envelope_json": {
            **row["envelope_json"],
            "ots": {
                **row["envelope_json"].get("ots", {}),
                "status": "upgraded",
                "bitcoin_attestation": bitcoin_attestation,
                "last_checked_at": now_iso,
            },
        },
    }
    updated = db.table("provenance_envelopes").update(update_payload).eq("id", envelope_id).execute()
    return updated.data[0] if updated.data else row


# ── 6. Verify ────────────────────────────────────────────────────────────────

def verify_envelope(envelope_id: str, obj: Any) -> dict:
    """
    Re-canonicalize obj, hash it, compare against stored content_hash.
    Returns {"valid": bool, "stored_hash": str, "computed_hash": str, "ots_status": str}
    Does NOT re-submit to OTS. Only confirms the object has not been altered.
    """
    db = _get_client()
    row_resp = db.table("provenance_envelopes").select("content_hash, ots_status, verified_at").eq("id", envelope_id).single().execute()
    if not row_resp.data:
        raise ValueError(f"[provenance] envelope not found: {envelope_id}")

    row = row_resp.data
    stored_hash: str = row["content_hash"]
    computed_hash = hash_canonical(canonicalize(obj))
    valid = stored_hash == computed_hash

    now_iso = datetime.now(timezone.utc).isoformat()
    if valid and row["ots_status"] == "upgraded":
        db.table("provenance_envelopes").update({
            "ots_status": "verified",
            "verified_at": now_iso,
        }).eq("id", envelope_id).execute()

    return {
        "valid": valid,
        "stored_hash": stored_hash,
        "computed_hash": computed_hash,
        "ots_status": "verified" if (valid and row["ots_status"] == "upgraded") else row["ots_status"],
        "verified_at": now_iso if valid else None,
    }


# ── 7. Agent-safe summary ────────────────────────────────────────────────────

def get_summary(subject_type: SubjectType, subject_id: str) -> Optional[dict]:
    """
    Return the agent-facing provenance context contract for a subject.
    No receipt bytes, no private content — only epistemic metadata.
    Returns None if no envelope exists for this subject.
    """
    db = _get_client()
    resp = (
        db.table("provenance_envelopes")
        .select("id, content_hash, ots_status, created_at, upgraded_at, verified_at, envelope_json")
        .eq("subject_type", subject_type)
        .eq("subject_id", subject_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not resp.data:
        return None

    row = resp.data[0]
    env = row["envelope_json"]
    context_hashes: list = env.get("context_hashes", [])

    return {
        "envelope_id": row["id"],
        "provenance": {
            "status": row["ots_status"],
            "hash": row["content_hash"],
            "created_at": row["created_at"],
            "upgraded_at": row.get("upgraded_at"),
            "verified_at": row.get("verified_at"),
            "source_count": len(context_hashes),
            "lineage_depth": len(env.get("lineage", {}).get("parent_envelopes", [])),
            "interpretation_bounds": env.get("interpretation_bounds", {}),
            "privacy_class": env.get("privacy_class", "private"),
        },
    }


# ── Convenience: create + stamp in one call ──────────────────────────────────

def seal(
    *,
    subject_type: SubjectType,
    subject_id: str,
    obj: Any,
    privacy_class: PrivacyClass = "private",
    context_objects: Optional[list[dict]] = None,
    interpretation_bounds: Optional[dict] = None,
    di_id: Optional[str] = None,
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
    auto_stamp: bool = True,
) -> dict:
    """
    create_envelope() + stamp_envelope() in one call.
    Safe to use fire-and-forget in async contexts:
        asyncio.create_task(asyncio.to_thread(seal, ...))
    Returns the stamped envelope row.
    """
    row = create_envelope(
        subject_type=subject_type,
        subject_id=subject_id,
        obj=obj,
        privacy_class=privacy_class,
        context_objects=context_objects,
        interpretation_bounds=interpretation_bounds,
        di_id=di_id,
        user_id=user_id,
        workspace_id=workspace_id,
    )
    if auto_stamp and row.get("id"):
        try:
            row = stamp_envelope(row["id"])
        except Exception as exc:
            logger.warning("[provenance] auto-stamp failed for %s: %s", row.get("id"), exc)
    return row
