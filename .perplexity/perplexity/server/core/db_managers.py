# db_managers.py
# Drop-in database-backed overrides for the engine's in-memory singletons.
# Replace the global instances in gestaltview_generative_engine.py with these:
#
#   embodiment_manager = DatabaseEmbodimentManager()
#
# And pass di_slug when constructing DatabaseSymbioticCore instead of
# SymbioticFeedbackCore.

from __future__ import annotations
from typing import List, Optional, Dict, Any
import numpy as np

from server.gestaltview_generative_engine import (
    EmbodimentProfileManager,
    EmbodimentProfileRecord,
    Config,
    SymbioticFeedbackCore,
    FusionInput,
    Modality,
    InteractionRecord,
)
from server.supabase_integration import (
    EmbodimentProfileRepository,
    UserPreferenceRepository,
    MemoryEntryRepository,
    DISessionRepository,
)

config = Config()


class DatabaseEmbodimentManager(EmbodimentProfileManager):
    """
    Overrides in-memory profile store with live Supabase queries.
    Maintains a local write-through cache for performance.
    """

    def _load_builtin_profiles(self):
        """Skip hardcoded builtins — load from DB instead."""
        for p in EmbodimentProfileRepository.list_all(include_founder_only=True):
            record = self._dict_to_record(p)
            self.profiles[record.slug] = record

    def list_profiles(self, include_founder_only: bool = False) -> List[EmbodimentProfileRecord]:
        """Fresh from DB on every call (add TTL cache if needed)."""
        rows = EmbodimentProfileRepository.list_all(include_founder_only=include_founder_only)
        return [self._dict_to_record(p) for p in rows]

    def get_profile(self, slug: str) -> Optional[EmbodimentProfileRecord]:
        """Cache-first, then DB fallback."""
        if slug in self.profiles:
            return self.profiles[slug]
        p = EmbodimentProfileRepository.get_by_slug(slug)
        if p:
            record = self._dict_to_record(p)
            self.profiles[slug] = record
            return record
        return None

    def upsert_profile(self, profile: EmbodimentProfileRecord) -> EmbodimentProfileRecord:
        """Write-through to DB, update local cache."""
        EmbodimentProfileRepository.upsert(
            slug=profile.slug,
            public_name=profile.public_name,
            profile_json=profile.profile_json,
            status=profile.status,
            visibility_scope=profile.visibility_scope,
            readiness_score=profile.readiness_score,
            founder_notes=profile.founder_notes,
            internal_designation=profile.internal_designation,
        )
        self.profiles[profile.slug] = profile
        return profile

    @staticmethod
    def _dict_to_record(p: Dict) -> EmbodimentProfileRecord:
        return EmbodimentProfileRecord(
            id=p.get("id"),
            slug=p["slug"],
            public_name=p.get("public_name", p["slug"]),
            internal_designation=p.get("internal_designation"),
            status=p.get("status", "draft"),
            visibility_scope=p.get("visibility_scope", "founder-only"),
            profile_json=p.get("profile_json", {}),
            readiness_score=p.get("readiness_score"),
            founder_notes=p.get("founder_notes"),
            created_at=p.get("created_at"),
            updated_at=p.get("updated_at"),
        )


class DatabaseSymbioticCore(SymbioticFeedbackCore):
    """
    Extends SymbioticFeedbackCore to:
    - Persist memory events to di_memory_events after each interaction
    - Bootstrap historical interactions from memory_entries on init
    """

    def __init__(self, user_id: str, config: Config = Config(), di_slug: str = "billy"):
        super().__init__(user_id, config)
        self.di_slug = di_slug
        self.session = DISessionRepository.get_or_create(user_id, di_slug)

    def learn_from_interaction(
        self,
        inputs: List[FusionInput],
        ai_output: str,
        user_feedback: float,
        input_vector: Optional[np.ndarray] = None,
    ):
        # In-memory learning (parent)
        super().learn_from_interaction(inputs, ai_output, user_feedback, input_vector)

        # Persist to di_memory_events
        if not self.session.get("local_only"):
            summary = ai_output[:500] if len(ai_output) > 500 else ai_output
            DISessionRepository.log_memory_event(
                session_id=self.session["id"],
                di_slug=self.di_slug,
                user_id=self.user_id,
                content=f"Feedback={user_feedback:.2f}. Output: {summary}",
                memory_type="symbiotic_feedback",
                significance=user_feedback,
            )

    def load_historical_memories(self, limit: int = 100):
        """
        Bootstrap the symbiotic core from persisted memory_entries.
        Call once after construction for returning users.
        """
        memories = MemoryEntryRepository.get_by_user(self.user_id, limit=limit)
        for mem in memories:
            if mem.get("embedding"):
                record = InteractionRecord(
                    multi_input=[FusionInput(modality=Modality.TEXT, raw_data=mem.get("content", ""))],
                    ai_output=mem.get("summary", ""),
                    user_feedback=(mem.get("importance", 3) / 5.0),
                    input_vector=np.array(mem["embedding"]),
                )
                self.user_history.append(record)
