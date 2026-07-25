# engine_persistence_bridge.py
# Drop-in hooks that wire gestaltview_generative_engine.py endpoints to Supabase.
# Import this at the top of the engine file and call each hook inside the
# corresponding endpoint handler after the core operation completes.
#
# All hooks are fire-and-forget safe: they catch exceptions internally and
# never block the endpoint response.

from typing import List, Dict, Any, Optional
from server.supabase_integration import (
    BucketDropRepository,
    MemoryEntryRepository,
    BillySessionRepository,
    EmbodimentProfileRepository,
    UserPreferenceRepository,
    MusicalDNARepository,
    InnerWorldArtifactRepository,
    DISessionRepository,
    FounderContextRepository,
    InsightRepository,
    UserIDResolver,
)

# ---------------------------------------------------------------------------
# Fusion Pipeline
# ---------------------------------------------------------------------------

def persist_fusion_drop(
    user_id: str,
    fused_text: str,
    modalities: List[str],
    processing_steps: List[str],
    module_key: Optional[str] = None,
    plk_resonance_score: float = 0.0,
) -> Dict:
    """Call inside /api/fusion after processing."""
    try:
        return BucketDropRepository.create(
            user_id=user_id,
            content=fused_text,
            capture_context={"modalities": modalities, "processing_steps": processing_steps, "engine_version": "2.0.0"},
            module_key=module_key,
            plk_resonance_score=plk_resonance_score,
        )
    except Exception as e:
        print(f"[bridge] persist_fusion_drop failed: {e}")
        return {}

def promote_fusion_to_memory(
    drop_id: str,
    user_id: str,
    fused_text: str,
    title: str = "Fused Capture",
    tags: List[str] = None,
    embedding: Optional[List[float]] = None,
    auth_user_id: Optional[str] = None,
) -> Dict:
    """Promote a bucket drop to a memory entry."""
    try:
        memory = MemoryEntryRepository.create(
            user_id=user_id, content=fused_text, title=title,
            kind="note", source="fusion_engine",
            tags=tags or [], embedding=embedding, auth_user_id=auth_user_id,
        )
        if not memory.get("local_only"):
            BucketDropRepository.promote_to_memory(drop_id, memory["id"])
        return memory
    except Exception as e:
        print(f"[bridge] promote_fusion_to_memory failed: {e}")
        return {}

# ---------------------------------------------------------------------------
# Blackboard
# ---------------------------------------------------------------------------

def persist_blackboard_turn(
    user_id: str,
    message: str,
    response_text: str,
    persona_slug: str,
    source: str = "deterministic",
    resonance_score: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict:
    """Call inside /api/blackboard/respond before returning."""
    try:
        combined_metadata = {"persona_slug": persona_slug, "resonance_score": resonance_score}
        if metadata:
            combined_metadata.update(metadata)
        return BillySessionRepository.create(
            user_id=user_id,
            message=message,
            response=response_text,
            provider=source,
            mode="chat",
            metadata=combined_metadata,
        )
    except Exception as e:
        print(f"[bridge] persist_blackboard_turn failed: {e}")
        return {}

# ---------------------------------------------------------------------------
# Insights + Inner World
# ---------------------------------------------------------------------------

def persist_insight(
    user_id: str,
    insight_type: str,
    title: str,
    preview: str,
    payload: Dict,
    significance: float = 0.5,
    session_origin: str = "resonance_engine",
) -> Dict:
    """Call when the engine generates a pattern or connection."""
    try:
        return InsightRepository.create(
            user_id=user_id, type=insight_type, title=title,
            preview=preview, payload=payload,
            significance_score=significance, session_origin=session_origin,
        )
    except Exception as e:
        print(f"[bridge] persist_insight failed: {e}")
        return {}

def persist_inner_world_artifact(
    user_id: str,
    title: str,
    summary: str,
    html: str,
    tags: List[str] = None,
    origin_room: str = "dynamic_inner_world",
    blueprint_id: Optional[str] = None,
) -> Dict:
    """Call when synthesizing artifacts for the Dynamic Inner World."""
    try:
        return InnerWorldArtifactRepository.create(
            user_id=user_id, title=title, summary=summary, html=html,
            tags=tags, origin_room=origin_room, blueprint_id=blueprint_id,
        )
    except Exception as e:
        print(f"[bridge] persist_inner_world_artifact failed: {e}")
        return {}

# ---------------------------------------------------------------------------
# Musical DNA
# ---------------------------------------------------------------------------

def persist_musical_dna(
    user_id: str,
    song_title: str,
    artist: str,
    analysis_text: str,
    empowerment_score: float,
) -> Dict:
    """Call inside /api/actions/musical-dna/analyze."""
    try:
        return MusicalDNARepository.create(
            user_id=user_id, song_title=song_title, artist=artist,
            analysis=analysis_text, empowerment_score=empowerment_score,
        )
    except Exception as e:
        print(f"[bridge] persist_musical_dna failed: {e}")
        return {}

# ---------------------------------------------------------------------------
# DI Sessions
# ---------------------------------------------------------------------------

def get_or_create_di_session(auth_user_id: str, di_slug: str) -> Dict:
    """Call at the start of any DI interaction."""
    try:
        return DISessionRepository.get_or_create(user_id=auth_user_id, di_slug=di_slug)
    except Exception as e:
        print(f"[bridge] get_or_create_di_session failed: {e}")
        return {"id": f"local-{auth_user_id[:8]}", "local_only": True}

def log_di_memory(
    session_id: str,
    di_slug: str,
    auth_user_id: str,
    content: str,
    memory_type: str,
    significance: float = 0.5,
) -> Dict:
    """Call inside /api/learn to persist symbiotic feedback."""
    try:
        return DISessionRepository.log_memory_event(
            session_id=session_id, di_slug=di_slug,
            user_id=auth_user_id, content=content,
            memory_type=memory_type, significance=significance,
        )
    except Exception as e:
        print(f"[bridge] log_di_memory failed: {e}")
        return {}

# ---------------------------------------------------------------------------
# PLK (Founder Context)
# ---------------------------------------------------------------------------

def load_user_plk(user_id: str) -> Optional[Dict]:
    """Load PLK snapshot from founder_context for resonance scoring."""
    try:
        ctx = FounderContextRepository.get_by_user(user_id)
        return ctx.get("plk_snapshot") if ctx else None
    except Exception as e:
        print(f"[bridge] load_user_plk failed: {e}")
        return None

def save_user_plk(user_id: str, plk_snapshot: Dict) -> Dict:
    """Save updated PLK after learning interactions."""
    try:
        return FounderContextRepository.upsert_plk_snapshot(user_id, plk_snapshot)
    except Exception as e:
        print(f"[bridge] save_user_plk failed: {e}")
        return {}

def resolve_user_ids(app_user_id: str):
    """Resolve dual ID system. Returns (app_user_id, auth_user_id)."""
    try:
        auth_id = UserIDResolver.resolve_auth_user_id(app_user_id)
        return app_user_id, auth_id
    except Exception as e:
        print(f"[bridge] resolve_user_ids failed: {e}")
        return app_user_id, None
