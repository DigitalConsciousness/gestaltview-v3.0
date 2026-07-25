# supabase_integration.py
# Repository pattern for every live table the Generative Engine touches.
# Tables: bucket_drops, memory_entries, insights, inner_world_artifacts,
#         billy_sessions, musical_dna_analyses, embodiment_profiles,
#         user_preferences, di_sessions / di_memory_events,
#         founder_context, gestaltview_modules
# Graceful degradation: returns local-only dict if Supabase is unreachable.

import os
import uuid
import hashlib
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timezone

try:
    from supabase import create_client, Client
    _SUPABASE_SDK_AVAILABLE = True
except ImportError:
    _SUPABASE_SDK_AVAILABLE = False

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class SupabaseConfig:
    URL:         str = os.getenv("SUPABASE_URL", "")
    SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

class ConnectionPool:
    """Singleton connection manager with lazy init."""
    _client: Optional[Any] = None

    @classmethod
    def get_client(cls) -> Optional[Any]:
        if not _SUPABASE_SDK_AVAILABLE:
            return None
        cfg = SupabaseConfig()
        if cls._client is None and cfg.URL and cfg.SERVICE_KEY:
            cls._client = create_client(cfg.URL, cfg.SERVICE_KEY)
        return cls._client

    @classmethod
    def reset(cls):
        cls._client = None

def _local_id(prefix: str = "local") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"

# ---------------------------------------------------------------------------
# Base Repository
# ---------------------------------------------------------------------------

class BaseRepository:
    @classmethod
    def _client(cls) -> Optional[Any]:
        return ConnectionPool.get_client()

    @classmethod
    def is_connected(cls) -> bool:
        return cls._client() is not None

    @classmethod
    def _err(cls, op: str, e: Exception, fallback: Any = None) -> Any:
        print(f"[Supabase] {op} failed: {e}")
        return fallback

# ---------------------------------------------------------------------------
# User ID Resolver (dual-ID system: app_users.id text <-> auth.users.id uuid)
# ---------------------------------------------------------------------------

class UserIDResolver(BaseRepository):
    @classmethod
    def resolve_auth_user_id(cls, app_user_id: str) -> Optional[str]:
        c = cls._client()
        if not c: return None
        try:
            r = c.table("app_users").select("auth_user_id").eq("id", app_user_id).limit(1).execute()
            return r.data[0]["auth_user_id"] if r.data else None
        except Exception as e:
            return cls._err("resolve_auth_user_id", e)

    @classmethod
    def resolve_app_user_id(cls, auth_user_id: str) -> Optional[str]:
        c = cls._client()
        if not c: return None
        try:
            r = c.table("app_users").select("id").eq("auth_user_id", auth_user_id).limit(1).execute()
            return r.data[0]["id"] if r.data else None
        except Exception as e:
            return cls._err("resolve_app_user_id", e)

# ---------------------------------------------------------------------------
# Bucket Drops
# ---------------------------------------------------------------------------

class BucketDropRepository(BaseRepository):
    TABLE = "bucket_drops"

    @classmethod
    def create(cls, user_id: str, content: str, raw_text: str = None,
               capture_context: Dict = None, module_key: str = None,
               intensity: int = 5, tags: List[str] = None,
               plk_resonance_score: float = 0.0, subject_id: str = None) -> Dict:
        c = cls._client()
        data = dict(
            user_id=user_id, content=content,
            raw_text=raw_text or content,
            capture_context=capture_context or {},
            module_key=module_key, intensity=max(1, min(10, intensity)),
            tags=tags or [], specialized_apps=[], stage="raw",
            plk_resonance_score=plk_resonance_score, subject_id=subject_id,
        )
        if not c:
            return {**data, "id": _local_id("drop"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("drop")}
        except Exception as e:
            return cls._err("bucket_drops.create", e, {**data, "id": _local_id("drop")})

    @classmethod
    def get_by_user(cls, user_id: str, limit: int = 100) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return r.data or []
        except Exception as e:
            return cls._err("bucket_drops.get_by_user", e, [])

    @classmethod
    def promote_to_memory(cls, drop_id: str, memory_id: str) -> bool:
        c = cls._client()
        if not c: return False
        try:
            c.table(cls.TABLE).update({
                "stage": "promoted",
                "promoted_memory_id": memory_id,
                "promoted_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", drop_id).execute()
            return True
        except Exception as e:
            return cls._err("bucket_drops.promote", e, False)

# ---------------------------------------------------------------------------
# Memory Entries
# ---------------------------------------------------------------------------

class MemoryEntryRepository(BaseRepository):
    TABLE = "memory_entries"

    @classmethod
    def create(cls, user_id: str, content: str, title: str = None,
               summary: str = None, kind: str = "note", source: str = "generative_engine",
               source_ref: str = None, tags: List[str] = None, importance: int = 3,
               embedding: List[float] = None, emotional_valence: float = None,
               provenance: Dict = None, subject_id: str = None,
               auth_user_id: str = None) -> Dict:
        c = cls._client()
        content_hash = hashlib.sha256(content.encode()).hexdigest()[:32]
        data = dict(
            user_id=user_id, title=title or "Untitled Memory",
            summary=summary or content[:200], content=content,
            content_hash=content_hash, kind=kind, source=source,
            source_ref=source_ref, tags=tags or [], importance=max(1, min(5, importance)),
            embedding=embedding, scope="personal", entry_state="active",
            consent_required=True, emotional_valence=emotional_valence,
            provenance=provenance or {}, subject_id=subject_id, auth_user_id=auth_user_id,
        )
        if not c:
            return {**data, "id": _local_id("mem"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("mem")}
        except Exception as e:
            return cls._err("memory_entries.create", e, {**data, "id": _local_id("mem")})

    @classmethod
    def get_by_user(cls, user_id: str, limit: int = 100) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return r.data or []
        except Exception as e:
            return cls._err("memory_entries.get_by_user", e, [])

    @classmethod
    def search_by_embedding(cls, user_id: str, embedding: List[float],
                            threshold: float = 0.7, limit: int = 10) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.rpc("match_memories", {
                "query_embedding": embedding,
                "match_threshold": threshold,
                "match_count": limit,
                "user_id_filter": user_id,
            }).execute()
            return r.data or []
        except Exception as e:
            return cls._err("memory_entries.search_by_embedding", e, [])

# ---------------------------------------------------------------------------
# Insights
# ---------------------------------------------------------------------------

class InsightRepository(BaseRepository):
    TABLE = "insights"

    @classmethod
    def create(cls, user_id: str, type: str, title: str, preview: str,
               payload: Dict = None, significance_score: float = 0.5,
               linked_to: List[str] = None, session_origin: str = None,
               highlighted_text: str = None) -> Dict:
        c = cls._client()
        data = dict(
            user_id=user_id, type=type, title=title, preview=preview,
            payload=payload or {}, significance_score=max(0.0, min(1.0, significance_score)),
            linked_to=linked_to or [], status="active",
            session_origin=session_origin, highlighted_text=highlighted_text,
            linked_orb_ids=[],
        )
        if not c:
            return {**data, "id": _local_id("ins"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("ins")}
        except Exception as e:
            return cls._err("insights.create", e, {**data, "id": _local_id("ins")})

# ---------------------------------------------------------------------------
# Inner World Artifacts
# ---------------------------------------------------------------------------

class InnerWorldArtifactRepository(BaseRepository):
    TABLE = "inner_world_artifacts"

    @classmethod
    def create(cls, user_id: str, title: str, summary: str, html: str,
               tags: List[str] = None, origin_room: str = "dynamic_inner_world",
               content_type: str = None, content_ref: Dict = None,
               blueprint_id: str = None, source_ref: str = None) -> Dict:
        c = cls._client()
        data = dict(
            user_id=user_id, title=title, summary=summary, html=html,
            tags=tags or [], origin_room=origin_room,
            content_type=content_type, content_ref=content_ref,
            blueprint_id=blueprint_id, source_ref=source_ref,
            status="active", display_order=0,
        )
        if not c:
            return {**data, "id": _local_id("art"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("art")}
        except Exception as e:
            return cls._err("inner_world_artifacts.create", e, {**data, "id": _local_id("art")})

    @classmethod
    def get_by_user(cls, user_id: str, limit: int = 100) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).order("display_order").limit(limit).execute()
            return r.data or []
        except Exception as e:
            return cls._err("inner_world_artifacts.get_by_user", e, [])

# ---------------------------------------------------------------------------
# Billy Sessions
# ---------------------------------------------------------------------------

class BillySessionRepository(BaseRepository):
    TABLE = "billy_sessions"

    @classmethod
    def create(cls, user_id: str, message: str, response: str,
               provider: str = "deterministic", mode: str = "chat",
               metadata: Dict = None) -> Dict:
        c = cls._client()
        data = dict(user_id=user_id, message=message, response=response,
                    provider=provider, mode=mode, metadata=metadata or {})
        if not c:
            return {**data, "id": _local_id("sess"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("sess")}
        except Exception as e:
            return cls._err("billy_sessions.create", e, {**data, "id": _local_id("sess")})

    @classmethod
    def get_history(cls, user_id: str, limit: int = 50) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return r.data or []
        except Exception as e:
            return cls._err("billy_sessions.get_history", e, [])

# ---------------------------------------------------------------------------
# Musical DNA
# ---------------------------------------------------------------------------

class MusicalDNARepository(BaseRepository):
    TABLE = "musical_dna_analyses"

    @classmethod
    def create(cls, user_id: str, song_title: str, artist: str,
               analysis: str, empowerment_score: float = None) -> Dict:
        c = cls._client()
        data = dict(user_id=user_id, song_title=song_title, artist=artist,
                    analysis=analysis, empowerment_score=empowerment_score)
        if not c:
            return {**data, "id": _local_id("dna"), "local_only": True}
        try:
            r = c.table(cls.TABLE).insert(data).execute()
            return r.data[0] if r.data else {**data, "id": _local_id("dna")}
        except Exception as e:
            return cls._err("musical_dna_analyses.create", e, {**data, "id": _local_id("dna")})

# ---------------------------------------------------------------------------
# Embodiment Profiles
# ---------------------------------------------------------------------------

class EmbodimentProfileRepository(BaseRepository):
    TABLE = "embodiment_profiles"

    @classmethod
    def list_all(cls, include_founder_only: bool = False) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            q = c.table(cls.TABLE).select("*")
            if not include_founder_only:
                q = q.neq("visibility_scope", "founder-only")
            r = q.order("readiness_score", desc=True).execute()
            return r.data or []
        except Exception as e:
            return cls._err("embodiment_profiles.list_all", e, [])

    @classmethod
    def get_by_slug(cls, slug: str) -> Optional[Dict]:
        c = cls._client()
        if not c: return None
        try:
            r = c.table(cls.TABLE).select("*").eq("slug", slug).limit(1).execute()
            return r.data[0] if r.data else None
        except Exception as e:
            return cls._err("embodiment_profiles.get_by_slug", e)

    @classmethod
    def upsert(cls, slug: str, public_name: str, profile_json: Dict,
               status: str = "draft", visibility_scope: str = "founder-only",
               readiness_score: float = None, founder_notes: str = None,
               internal_designation: str = None) -> Dict:
        c = cls._client()
        now  = datetime.now(timezone.utc).isoformat()
        data = dict(
            slug=slug, public_name=public_name, internal_designation=internal_designation,
            status=status, visibility_scope=visibility_scope, profile_json=profile_json,
            readiness_score=readiness_score, founder_notes=founder_notes, updated_at=now,
        )
        local_fallback = {**data, "id": _local_id("emb"), "local_only": True}
        if not c: return local_fallback
        try:
            r = c.table(cls.TABLE).update(data).eq("slug", slug).execute()
            if r.data: return r.data[0]
            data["created_at"] = now
            r2 = c.table(cls.TABLE).insert(data).execute()
            return r2.data[0] if r2.data else local_fallback
        except Exception as e:
            return cls._err("embodiment_profiles.upsert", e, local_fallback)

# ---------------------------------------------------------------------------
# User Preferences
# ---------------------------------------------------------------------------

class UserPreferenceRepository(BaseRepository):
    TABLE = "user_preferences"

    @classmethod
    def get(cls, user_id: str) -> Optional[Dict]:
        c = cls._client()
        if not c: return None
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).limit(1).execute()
            return r.data[0] if r.data else None
        except Exception as e:
            return cls._err("user_preferences.get", e)

    @classmethod
    def upsert(cls, user_id: str, preferences: Dict) -> Dict:
        c = cls._client()
        now  = datetime.now(timezone.utc).isoformat()
        data = dict(user_id=user_id, updated_at=now, **preferences)
        local = {**data, "local_only": True}
        if not c: return local
        try:
            r = c.table(cls.TABLE).update(data).eq("user_id", user_id).execute()
            if r.data: return r.data[0]
            defaults = dict(
                user_id=user_id, updated_at=now,
                room_renames={}, theme="void", position_overrides={},
                display_name="", avatar_url="", embodiment_profile_slug="billy",
            )
            defaults.update(data)
            r2 = c.table(cls.TABLE).insert(defaults).execute()
            return r2.data[0] if r2.data else local
        except Exception as e:
            return cls._err("user_preferences.upsert", e, local)

# ---------------------------------------------------------------------------
# DI Sessions + DI Memory Events
# ---------------------------------------------------------------------------

class DISessionRepository(BaseRepository):
    TABLE        = "di_sessions"
    MEMORY_TABLE = "di_memory_events"

    @classmethod
    def get_or_create(cls, user_id: str, di_slug: str) -> Dict:
        c = cls._client()
        fallback = {"id": _local_id("di"), "user_id": user_id,
                    "di_slug": di_slug, "local_only": True}
        if not c: return fallback
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).eq("di_slug", di_slug)\
                 .order("created_at", desc=True).limit(1).execute()
            if r.data: return r.data[0]
            r2 = c.table(cls.TABLE).insert({
                "user_id": user_id, "di_slug": di_slug,
                "mode_preference": "synthesis", "relational_depth": 0.0,
                "quirk_activations": {},
            }).execute()
            return r2.data[0] if r2.data else fallback
        except Exception as e:
            return cls._err("di_sessions.get_or_create", e, fallback)

    @classmethod
    def log_memory_event(cls, session_id: str, di_slug: str, user_id: str,
                         content: str, memory_type: str, domain: str = "general",
                         significance: float = 0.5, retrieval_weight: float = 0.5) -> Dict:
        c = cls._client()
        data = dict(
            session_id=session_id, di_slug=di_slug, user_id=user_id,
            domain=domain, content=content, memory_type=memory_type,
            significance=significance, retrieval_weight=retrieval_weight,
            source="generative_engine",
        )
        local = {**data, "id": _local_id("ev"), "local_only": True}
        if not c: return local
        try:
            r = c.table(cls.MEMORY_TABLE).insert(data).execute()
            return r.data[0] if r.data else local
        except Exception as e:
            return cls._err("di_memory_events.create", e, local)

# ---------------------------------------------------------------------------
# Founder Context
# ---------------------------------------------------------------------------

class FounderContextRepository(BaseRepository):
    TABLE = "founder_context"

    @classmethod
    def get_by_user(cls, user_id: str) -> Optional[Dict]:
        c = cls._client()
        if not c: return None
        try:
            r = c.table(cls.TABLE).select("*").eq("user_id", user_id).limit(1).execute()
            return r.data[0] if r.data else None
        except Exception as e:
            return cls._err("founder_context.get_by_user", e)

    @classmethod
    def upsert_plk_snapshot(cls, user_id: str, plk_snapshot: Dict) -> Dict:
        c = cls._client()
        now  = datetime.now(timezone.utc).isoformat()
        data = dict(user_id=user_id, plk_snapshot=plk_snapshot, updated_at=now)
        local = {**data, "local_only": True}
        if not c: return local
        try:
            r = c.table(cls.TABLE).update(data).eq("user_id", user_id).execute()
            if r.data: return r.data[0]
            data.update(dict(
                created_at=now, mode_preference="synthesis",
                confirmed_adult=False, continuity_profile={},
                cognition_profile={}, personality_profile={},
                memory_profile={}, identity_profile={},
                context_manifest={}, consent_policy={},
            ))
            r2 = c.table(cls.TABLE).insert(data).execute()
            return r2.data[0] if r2.data else local
        except Exception as e:
            return cls._err("founder_context.upsert", e, local)

# ---------------------------------------------------------------------------
# Module Registry
# ---------------------------------------------------------------------------

class ModuleRegistry(BaseRepository):
    TABLE         = "gestaltview_modules"
    PROFILE_TABLE = "gestaltview_module_profiles"

    @classmethod
    def list_active(cls) -> List[Dict]:
        c = cls._client()
        if not c: return []
        try:
            r = c.table(cls.TABLE).select("*").eq("is_active", True).order("module_index").execute()
            return r.data or []
        except Exception as e:
            return cls._err("gestaltview_modules.list_active", e, [])

    @classmethod
    def get_profile(cls, subject_id: str, module_key: str) -> Optional[Dict]:
        c = cls._client()
        if not c: return None
        try:
            mr = c.table(cls.TABLE).select("module_id").eq("module_key", module_key).limit(1).execute()
            if not mr.data: return None
            module_id = mr.data[0]["module_id"]
            r = c.table(cls.PROFILE_TABLE).select("*")\
                 .eq("subject_id", subject_id).eq("module_id", module_id).limit(1).execute()
            return r.data[0] if r.data else None
        except Exception as e:
            return cls._err("gestaltview_module_profiles.get", e)
