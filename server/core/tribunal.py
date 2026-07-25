"""
TribunalValidator — AI consensus validation layer.
Persists validation events to Supabase public.tribunal_events + public.tribunal_evidence.
"""

import uuid
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from supabase import AsyncClient

from .types import ConsciousnessMetrics

logger = logging.getLogger(__name__)


class TribunalValidator:
    """
    Validates AI responses against consciousness metrics and user PLK.
    Writes tribunal_events + tribunal_evidence rows when validation occurs.
    """

    VALIDATION_DIMENSIONS = [
        "authenticity",
        "consciousness_alignment",
        "plk_resonance",
        "ethical_coherence",
        "user_sovereignty",
    ]

    def __init__(self, supabase: AsyncClient):
        self.supabase = supabase
        self._consensus_memory: Dict[str, Any] = {}

    async def validate(
        self,
        user_input: str,
        ai_response: str,
        metrics: ConsciousnessMetrics,
        plk_resonance: float,
        fragment_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Validate an AI response. Returns validation result dict.
        Persists to Supabase only if validation score is noteworthy (< 0.7 or > 0.95).
        """
        scores = self._score_dimensions(ai_response, metrics, plk_resonance)
        overall = sum(scores.values()) / len(scores)
        passed  = overall >= 0.7

        result = {
            "validation_score": round(overall, 4),
            "dimension_scores": scores,
            "passed":           passed,
            "timestamp":        datetime.now().isoformat(),
        }

        self._consensus_memory["validation_score"] = overall
        self._consensus_memory["last_validated"]   = result["timestamp"]

        # Persist edge cases — failures and high-confidence passes
        if overall < 0.7 or overall > 0.95:
            await self._persist_event(
                question=user_input,
                verdict_summary=ai_response[:500],
                scores=scores,
                overall=overall,
                fragment_ids=fragment_ids or [],
            )

        return result

    def get_consensus_score(self) -> float:
        return self._consensus_memory.get("validation_score", 0.0)

    # ── Private helpers ──────────────────────────────────────────────────────

    def _score_dimensions(
        self,
        response: str,
        metrics: ConsciousnessMetrics,
        plk_resonance: float,
    ) -> Dict[str, float]:
        response_lower = response.lower()

        authenticity = 0.5
        if any(w in response_lower for w in ["i understand", "i hear", "that makes sense"]):
            authenticity += 0.2
        if any(w in response_lower for w in ["absolutely!", "great question!"]):
            authenticity -= 0.2  # hollow affirmation penalty

        return {
            "authenticity":             round(max(0.0, min(1.0, authenticity)), 4),
            "consciousness_alignment":  round(metrics.overall_coherence, 4),
            "plk_resonance":            round(plk_resonance, 4),
            "ethical_coherence":        round(metrics.empathetic_resonance, 4),
            "user_sovereignty":         round(metrics.embodied_presence, 4),
        }

    async def _persist_event(
        self,
        question: str,
        verdict_summary: str,
        scores: Dict[str, float],
        overall: float,
        fragment_ids: List[str],
    ) -> None:
        event_id = str(uuid.uuid4())
        try:
            await self.supabase.table("tribunal_events").insert({
                "id":              event_id,
                "question":        question,
                "candidate_answers": [{"score": overall, "summary": verdict_summary}],
                "verdict_summary": verdict_summary,
                "triggering_agent": "GestaltViewCore",
            }).execute()

            if fragment_ids:
                evidence_rows = [
                    {
                        "tribunal_event_id": event_id,
                        "fragment_id":       fid,
                        "weight":            round(scores.get("plk_resonance", 1.0), 4),
                    }
                    for fid in fragment_ids[:10]  # cap at 10
                ]
                await self.supabase.table("tribunal_evidence").insert(evidence_rows).execute()

        except Exception as exc:
            logger.error("TribunalValidator persist failed: %s", exc)
