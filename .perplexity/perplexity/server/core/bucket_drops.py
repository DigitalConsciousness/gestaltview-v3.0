"""
BucketDropsEngine — captures, scores, and finds connections for a BucketDrop.
Writes to Supabase public.bucket_drops.

Provenance: after every successful insert, a provenance envelope is created
and stamped via OpenTimestamps in a fire-and-forget asyncio task.
The user action is never blocked on the provenance write.
"""

import asyncio
import uuid
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from supabase import AsyncClient

from .types import BucketDrop, ConsciousnessState, PersonalLanguageKey
from . import provenance as _provenance

logger = logging.getLogger(__name__)


class BucketDropsEngine:
    """
    Handles capture and persistence of BucketDrops.
    Pass a Supabase AsyncClient at construction time.
    """

    URGENCY_KEYWORDS = {
        "lightning": ["urgent", "critical", "immediately", "right now", "asap", "lightning"],
        "critical":  ["important", "must", "essential", "priority", "deadline"],
        "regular":   ["should", "need to", "want to", "plan to"],
        "random":    [],  # fallback
    }

    def __init__(self, supabase: AsyncClient):
        self.supabase = supabase

    async def capture(
        self,
        user_id: str,
        content: str,
        consciousness_state: ConsciousnessState,
        plk: Optional[PersonalLanguageKey],
        context: Dict[str, Any] = None,
    ) -> BucketDrop:
        """Create a BucketDrop, score it, find connections, persist to Supabase."""
        context = context or {}
        urgency              = self._classify_urgency(content)
        emotional_intensity  = self._score_emotional_intensity(content)
        cognitive_complexity = self._score_cognitive_complexity(content)
        resonance_score      = plk.authenticity_score if plk else 0.5

        drop = BucketDrop(
            id=str(uuid.uuid4()),
            content=content,
            urgency=urgency,
            timestamp=datetime.now(),
            consciousness_state=consciousness_state,
            emotional_intensity=emotional_intensity,
            cognitive_complexity=cognitive_complexity,
            resonance_score=resonance_score,
            connections=[],
            metadata=context,
        )

        await self._persist(user_id, drop)
        return drop

    async def find_connections(self, drop: BucketDrop, recent_drops: List[BucketDrop]) -> List[str]:
        """Return IDs of recent drops that share significant word overlap (Jaccard ≥ 0.15)."""
        words_a = set(drop.content.lower().split())
        connected = []
        for other in recent_drops:
            if other.id == drop.id:
                continue
            words_b = set(other.content.lower().split())
            union = words_a | words_b
            intersection = words_a & words_b
            jaccard = len(intersection) / len(union) if union else 0.0
            if jaccard >= 0.15:
                connected.append(other.id)
        return connected

    # ── Private helpers ───────────────────────────────────────────────────────

    def _classify_urgency(self, content: str) -> str:
        content_lower = content.lower()
        for urgency_level, keywords in self.URGENCY_KEYWORDS.items():
            if any(kw in content_lower for kw in keywords):
                return urgency_level
        return "random"

    def _score_emotional_intensity(self, content: str) -> float:
        high_intensity = ["!!!", "!!", "absolutely", "incredible", "devastating", "amazing"]
        low_intensity  = ["maybe", "perhaps", "possibly", "somewhat", "slightly"]
        content_lower  = content.lower()
        score = 50.0
        score += sum(10.0 for w in high_intensity if w in content_lower)
        score -= sum(5.0  for w in low_intensity  if w in content_lower)
        return max(0.0, min(100.0, score))

    def _score_cognitive_complexity(self, content: str) -> float:
        words     = content.split()
        sentences = content.count(".") + content.count("?") + content.count("!") or 1
        avg_words_per_sentence = len(words) / sentences
        complexity_markers = ["however", "therefore", "consequently", "moreover", "furthermore"]
        marker_count = sum(1 for m in complexity_markers if m in content.lower())
        return min(100.0, (avg_words_per_sentence * 2) + (marker_count * 5))

    async def _persist(self, user_id: str, drop: BucketDrop) -> None:
        """
        Insert the BucketDrop row, then fire-and-forget a provenance seal.
        The seal runs in a background thread so it never delays the response.
        """
        payload = {
            "id":              drop.id,
            "user_id":         user_id,
            "content":         drop.content,
            "raw_text":        drop.content,
            "capture_context": {
                "urgency":              drop.urgency,
                "consciousness_state":  drop.consciousness_state.value,
                "emotional_intensity":  drop.emotional_intensity,
                "cognitive_complexity": drop.cognitive_complexity,
                "resonance_score":      drop.resonance_score,
                "connections":          drop.connections,
                **drop.metadata,
            },
        }

        try:
            await self.supabase.table("bucket_drops").insert(payload).execute()
        except Exception as exc:
            logger.error("BucketDrop persist failed: %s", exc)
            return  # Don't attempt provenance if the primary write failed

        # ── Provenance: fire-and-forget seal after confirmed insert ────────────
        # We seal a sanitised version of the payload: same shape as what was
        # stored, but with user_id replaced by a stable reference so the hash
        # is consistent across re-canonicalisations.
        seal_obj = {
            "schema":   "gsvw.bucket-drop.v1",
            "id":       drop.id,
            "content":  drop.content,
            "urgency":  drop.urgency,
            "consciousness_state": drop.consciousness_state.value,
            "emotional_intensity":  drop.emotional_intensity,
            "cognitive_complexity": drop.cognitive_complexity,
            "resonance_score":      drop.resonance_score,
            "timestamp": drop.timestamp.isoformat(),
        }

        def _seal_in_background() -> None:
            try:
                _provenance.seal(
                    subject_type="bucket_drop",
                    subject_id=drop.id,
                    obj=seal_obj,
                    privacy_class="private",
                    user_id=user_id,
                    auto_stamp=True,
                )
                logger.info("[provenance] sealed bucket_drop %s", drop.id)
            except Exception as exc:
                # Provenance failure must never surface to the user
                logger.warning("[provenance] seal failed for bucket_drop %s: %s", drop.id, exc)

        # asyncio.to_thread keeps this off the event loop without blocking it
        asyncio.create_task(
            asyncio.to_thread(_seal_in_background)
        )
