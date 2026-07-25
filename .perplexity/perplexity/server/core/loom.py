"""
LoomProcessor — iterative refinement of raw BucketDrops into structured insights.
Writes loom_annotations to Supabase (if a run_id is available).
"""

import logging
from typing import Any, Dict, List, Optional

from supabase import AsyncClient

from .types import BucketDrop, ConsciousnessMetrics

logger = logging.getLogger(__name__)

MAX_ITERATIONS = 3


class LoomProcessor:
    """
    Runs iterative refinement passes over a BucketDrop + ConsciousnessMetrics
    to extract gaps, threads, motifs, and emergent patterns.
    """

    def __init__(self, supabase: AsyncClient):
        self.supabase = supabase

    async def process(
        self,
        drop: BucketDrop,
        metrics: ConsciousnessMetrics,
        run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Run up to MAX_ITERATIONS refinement passes. Return structured insight dict."""
        insight = {
            "drop_id":          drop.id,
            "patterns":         [],
            "gaps":             [],
            "threads":          [],
            "motifs":           [],
            "coherence_score":  0.0,
            "iteration_count":  0,
        }

        content = drop.content
        for i in range(MAX_ITERATIONS):
            insight["iteration_count"] = i + 1
            refined = self._refine_pass(content, metrics, i)
            insight["patterns"].extend(refined["patterns"])
            insight["gaps"].extend(refined["gaps"])
            insight["threads"].extend(refined["threads"])
            insight["motifs"].extend(refined["motifs"])

            coherence = self._calculate_coherence(insight, metrics)
            insight["coherence_score"] = coherence

            if coherence >= 0.8:
                break  # good enough — stop iterating

        if run_id:
            await self._persist_annotations(run_id, insight)

        return insight

    # ── Private helpers ──────────────────────────────────────────────────────

    def _refine_pass(
        self,
        content: str,
        metrics: ConsciousnessMetrics,
        iteration: int,
    ) -> Dict[str, List[str]]:
        content_lower = content.lower()
        result: Dict[str, List[str]] = {"patterns": [], "gaps": [], "threads": [], "motifs": []}

        # Pattern detection — gets stricter with each iteration
        pattern_markers = [
            "always", "never", "every time", "pattern", "cycle", "recurring"
        ]
        for marker in pattern_markers:
            if marker in content_lower:
                result["patterns"].append(f"recurring_{marker.replace(' ', '_')}")

        # Gap detection
        gap_markers = ["don't know", "unsure", "missing", "gap", "unclear", "need to figure"]
        for marker in gap_markers:
            if marker in content_lower:
                result["gaps"].append(f"gap_{marker.replace(' ', '_')}")

        # Thread detection — high coherence state signals thread potential
        if metrics.overall_coherence > 0.6:
            thread_markers = ["because", "therefore", "leads to", "connects", "related to"]
            for marker in thread_markers:
                if marker in content_lower:
                    result["threads"].append(f"thread_{marker.replace(' ', '_')}")

        # Motif detection — deeper on later iterations
        if iteration >= 1:
            motif_markers = ["again", "still", "back to", "reminds me", "like before"]
            for marker in motif_markers:
                if marker in content_lower:
                    result["motifs"].append(f"motif_{marker.replace(' ', '_')}")

        return result

    def _calculate_coherence(
        self,
        insight: Dict[str, Any],
        metrics: ConsciousnessMetrics,
    ) -> float:
        pattern_score = min(len(insight["patterns"]) * 0.1, 0.3)
        thread_score  = min(len(insight["threads"])  * 0.15, 0.4)
        motif_score   = min(len(insight["motifs"])   * 0.1,  0.2)
        base = metrics.overall_coherence * 0.1
        return round(min(1.0, base + pattern_score + thread_score + motif_score), 4)

    async def _persist_annotations(
        self,
        run_id: str,
        insight: Dict[str, Any],
    ) -> None:
        rows = []
        for annotation_type in ("patterns", "gaps", "threads", "motifs"):
            for item in insight.get(annotation_type, []):
                rows.append({
                    "run_id":           run_id,
                    "type":             annotation_type,
                    "content":          item,
                    "confidence_score": insight["coherence_score"],
                    "related_ids":      [insight["drop_id"]],
                })
        if rows:
            try:
                await self.supabase.table("loom_annotations").insert(rows).execute()
            except Exception as exc:
                logger.error("LoomProcessor annotation persist failed: %s", exc)
