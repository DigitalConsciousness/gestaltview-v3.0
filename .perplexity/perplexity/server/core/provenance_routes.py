# server/core/provenance_routes.py
# Express-style route handlers for the provenance API.
# Mount these in server/index.ts or the FastAPI/Flask router.
#
# Routes:
#   POST   /api/provenance/envelopes                        — create
#   GET    /api/provenance/envelopes/:id                    — get by id
#   POST   /api/provenance/envelopes/:id/stamp              — stamp
#   POST   /api/provenance/envelopes/:id/upgrade            — upgrade
#   POST   /api/provenance/envelopes/:id/verify             — verify
#   GET    /api/provenance/subjects/:subject_type/:subject_id — get summary

from __future__ import annotations

import logging
from typing import Any

from . import provenance

logger = logging.getLogger(__name__)


def handle_create(body: dict) -> tuple[dict, int]:
    """
    POST /api/provenance/envelopes
    Body: { subject_type, subject_id, obj, privacy_class?, context_objects?,
            interpretation_bounds?, di_id?, user_id?, workspace_id? }
    """
    required = ["subject_type", "subject_id", "obj"]
    missing = [k for k in required if k not in body]
    if missing:
        return {"error": f"missing fields: {missing}"}, 400

    try:
        row = provenance.create_envelope(
            subject_type=body["subject_type"],
            subject_id=body["subject_id"],
            obj=body["obj"],
            privacy_class=body.get("privacy_class", "private"),
            context_objects=body.get("context_objects"),
            interpretation_bounds=body.get("interpretation_bounds"),
            di_id=body.get("di_id"),
            user_id=body.get("user_id"),
            workspace_id=body.get("workspace_id"),
        )
        return row, 201
    except Exception as exc:
        logger.exception("[provenance_routes] create failed")
        return {"error": str(exc)}, 500


def handle_get(envelope_id: str) -> tuple[dict, int]:
    """GET /api/provenance/envelopes/:id"""
    from supabase import create_client
    import os
    db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    resp = db.table("provenance_envelopes").select("*").eq("id", envelope_id).single().execute()
    if not resp.data:
        return {"error": "not found"}, 404
    return resp.data, 200


def handle_stamp(envelope_id: str) -> tuple[dict, int]:
    """POST /api/provenance/envelopes/:id/stamp"""
    try:
        row = provenance.stamp_envelope(envelope_id)
        return row, 200
    except ValueError as exc:
        return {"error": str(exc)}, 404
    except RuntimeError as exc:
        return {"error": str(exc)}, 503
    except Exception as exc:
        logger.exception("[provenance_routes] stamp failed for %s", envelope_id)
        return {"error": str(exc)}, 500


def handle_upgrade(envelope_id: str) -> tuple[dict, int]:
    """POST /api/provenance/envelopes/:id/upgrade"""
    try:
        row = provenance.upgrade_envelope(envelope_id)
        return row, 200
    except ValueError as exc:
        return {"error": str(exc)}, 404
    except Exception as exc:
        logger.exception("[provenance_routes] upgrade failed for %s", envelope_id)
        return {"error": str(exc)}, 500


def handle_verify(envelope_id: str, body: dict) -> tuple[dict, int]:
    """
    POST /api/provenance/envelopes/:id/verify
    Body: { obj } — the original object to verify against stored hash
    """
    if "obj" not in body:
        return {"error": "missing field: obj"}, 400
    try:
        result = provenance.verify_envelope(envelope_id, body["obj"])
        return result, 200
    except ValueError as exc:
        return {"error": str(exc)}, 404
    except Exception as exc:
        logger.exception("[provenance_routes] verify failed for %s", envelope_id)
        return {"error": str(exc)}, 500


def handle_get_subject_summary(subject_type: str, subject_id: str) -> tuple[dict, int]:
    """GET /api/provenance/subjects/:subject_type/:subject_id"""
    try:
        summary = provenance.get_summary(subject_type, subject_id)  # type: ignore[arg-type]
        if summary is None:
            return {"error": "no provenance envelope found for this subject"}, 404
        return summary, 200
    except Exception as exc:
        logger.exception("[provenance_routes] subject summary failed")
        return {"error": str(exc)}, 500
