"""
TapestryWeaver — weaves Loom insights + ConsciousnessMetrics into coherent TapestryThreads.
Persists to Supabase public.consciousness_profiles (snapshot field).
"""

import uuid
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from supabase import AsyncClient

from .types import ConsciousnessMetrics, TapestryThread

logger = logging.getLogger(__name__)


class TapestryWeaver:
    """
    Takes Loom insights and synthesises them into a TapestryThread.
    Optionally upserts the user's consciousness_profiles snapshot.
    """

    def __init__(self, supabase: AsyncClient):
        self.supabase = supabase

    async def weave(
        self,
        user_id: str,
        loom_insights: Dict[str, Any],
        metrics: ConsciousnessMetrics,
    ) -> Dict[str, Any]:
        """Produce a TapestryThread dict and update the user's profile snapshot."""
        thread = self._build_thread(user_id, loom_insights, metrics)
        await self._update_profile_snapshot(user_id, thread, metrics)
        return {
            "thread_id":      thread.id,
            "title":          thread.title,
            "summary":        thread.summary,
            "pattern_type":   thread.pattern_type,
            "coherence_score": thread.coherence_score,
        }

    # ── Private helpers ──────────────────────────────────────────────────────

    def _build_thread(
        self,
        user_id: str,
        loom_insights: Dict[str, Any],
        metrics: ConsciousnessMetrics,
    ) -> TapestryThread:
        pattern_type = self._classify_pattern(loom_insights, metrics)
        coherence    = loom_insights.get("coherence_score", metrics.overall_coherence)

        patterns = loom_insights.get("patterns", [])
        threads  = loom_insights.get("threads",  [])
        title    = self._generate_title(pattern_type, patterns)
        summary  = self._generate_summary(patterns, threads, coherence)

        return TapestryThread(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            summary=summary,
            related_drop_ids=[loom_insights.get("drop_id", "")],
            coherence_score=coherence,
            pattern_type=pattern_type,
        )

    def _classify_pattern(
        self,
        loom_insights: Dict[str, Any],
        metrics: ConsciousnessMetrics,
    ) -> str:
        if metrics.cognitive_flexibility > 0.7 and loom_insights.get("threads"):
            return "integrative-synthesis"
        if metrics.creative_consciousness > 0.7:
            return "creative-burst"
        if metrics.awareness_depth > 0.7:
            return "deep-reflection"
        if len(loom_insights.get("gaps", [])) > 2:
            return "cognitive-block"
        return "adhd-flow"

    def _generate_title(self, pattern_type: str, patterns: list) -> str:
        base = pattern_type.replace("-", " ").title()
        if patterns:
            return f"{base}: {patterns[0].replace('_', ' ').title()}"
        return base

    def _generate_summary(
        self, patterns: list, threads: list, coherence: float
    ) -> str:
        parts = []
        if patterns:
            parts.append(f"Patterns detected: {', '.join(patterns[:3])}")
        if threads:
            parts.append(f"Threads emerging: {', '.join(threads[:2])}")
        parts.append(f"Coherence: {coherence:.2f}")
        return " | ".join(parts)

    async def _update_profile_snapshot(
        self,
        user_id: str,
        thread: TapestryThread,
        metrics: ConsciousnessMetrics,
    ) -> None:
        snapshot = {
            "latest_thread":     {"id": thread.id, "title": thread.title, "pattern_type": thread.pattern_type},
            "coherence_score":   thread.coherence_score,
            "awareness_depth":   metrics.awareness_depth,
            "overall_coherence": metrics.overall_coherence,
            "updated_at":        datetime.now().isoformat(),
        }
        try:
            await self.supabase.table("consciousness_profiles").upsert(
                {"user_id": user_id, "snapshot": snapshot},
                on_conflict="user_id",
            ).execute()
        except Exception as exc:
            logger.error("TapestryWeaver snapshot upsert failed: %s", exc)
