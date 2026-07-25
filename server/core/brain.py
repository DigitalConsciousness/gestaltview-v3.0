"""
GestaltViewCore — The central consciousness-serving orchestrator.
v10.0 — Supabase-wired. SQLite removed.

Pipeline (9 stages):
  1. Detect ConsciousnessState
  2. Init / update PersonalLanguageKey
  3. Capture BucketDrop
  4. Measure ConsciousnessMetrics
  5. Loom processing
  6. Tapestry weaving
  7. Generate response
  8. Tribunal validation
  9. Calculate session impact
"""

import asyncio
import logging
import uuid
from dataclasses import asdict
from datetime import datetime
from typing import Any, Dict, Optional

from supabase import AsyncClient

from .web_search import WebSearchRouter, ground_message
from .types import (
    ConsciousnessMetrics,
    ConsciousnessState,
    PersonalLanguageKey,
)
from .plk import PLKEngine
from .bucket_drops import BucketDropsEngine
from .loom import LoomProcessor
from .tapestry import TapestryWeaver
from .tribunal import TribunalValidator

logger = logging.getLogger(__name__)


class GestaltViewCore:
    """
    The consciousness-serving brain.
    Instantiate once per user session; pass the Supabase AsyncClient.
    """

    # Founder-as-Algorithm patterns — Keith's lived experience encoded as weights
    FOUNDER_PATTERNS = {
        "adhd_jazz":             "My ADHD is my jazz — chaotic but with profound rhythm",
        "chaos_current":         "Your chaos has a current — we navigate it together",
        "exploded_mind":         "Exploded picture mind sees everything at once",
        "scars_to_code":         "Every difficult chapter became a feature",
        "presence_not_perfection": "Presence, not perfection — honoring where you are",
        "beautiful_tapestry":    "Weaving fragments into a beautiful tapestry",
        "consciousness_serving": "Technology that serves consciousness, not exploits it",
        "cognitive_justice":     "Every mind deserves technology that celebrates its uniqueness",
    }

    def __init__(self, user_id: str, supabase: AsyncClient):
        self.user_id   = user_id
        self.supabase  = supabase

        # Sub-engines (all Supabase-wired)
        self.plk_engine      = PLKEngine()
        self.bucket_engine   = BucketDropsEngine(supabase)
        self.loom_processor  = LoomProcessor(supabase)
        self.tapestry_weaver = TapestryWeaver(supabase)
        self.tribunal        = TribunalValidator(supabase)
        self.web_search      = WebSearchRouter()

        # Runtime state
        self.plk: Optional[PersonalLanguageKey] = None

        logger.info("GestaltViewCore initialised for user %s", user_id)

    # ── Public API ─────────────────────────────────────────────────────────

    async def process(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Main 9-stage consciousness processing pipeline."""
        context       = context or {}
        session_start = datetime.now()

        # 1. Detect state
        state = self._detect_state(user_input, context)

        # 2. PLK
        if self.plk is None:
            self.plk = PersonalLanguageKey(user_id=self.user_id)
        self.plk = self.plk_engine.analyze(user_input, self.plk)
        plk_resonance = self.plk_engine.score_resonance(user_input, self.plk)

        # 3. BucketDrop
        drop = await self.bucket_engine.capture(
            user_id=self.user_id,
            content=user_input,
            consciousness_state=state,
            plk=self.plk,
            context=context,
        )

        # 4. Metrics
        metrics = self._measure_metrics(user_input, state, plk_resonance)

        # 5. Loom
        loom_insights = await self.loom_processor.process(drop, metrics)

        # 6. Tapestry
        tapestry = await self.tapestry_weaver.weave(self.user_id, loom_insights, metrics)

        # 7. Web grounding + response
        web_grounding = await ground_message(user_input, self.web_search)
        web_context = web_grounding.to_prompt_block(self.web_search.config.MAX_CONTEXT_CHARS)
        response = self._generate_response(user_input, state, metrics, tapestry, web_context)

        # 8. Tribunal
        validation = await self.tribunal.validate(
            user_input=user_input,
            ai_response=response,
            metrics=metrics,
            plk_resonance=plk_resonance,
        )

        # 9. Session impact
        impact = self._session_impact(session_start, metrics)

        return {
            "response":             response,
            "consciousness_state":  state.value,
            "consciousness_metrics": asdict(metrics),
            "plk_resonance":        plk_resonance,
            "bucket_drop_id":       drop.id,
            "tapestry":             tapestry,
            "validation":           validation,
            "session_impact":       impact,
            "founder_patterns":     self._match_founder_patterns(user_input),
            "web_grounding":        {
                "searched": web_grounding.success,
                "source": web_grounding.source,
                "query": web_grounding.query,
                "latency_ms": round(web_grounding.latency_ms, 2),
                "result_count": len(web_grounding.results),
            },
        }

    # ── Stage implementations ───────────────────────────────────────────────

    def _detect_state(
        self, user_input: str, context: Dict[str, Any]
    ) -> ConsciousnessState:
        text = user_input.lower()
        scores: Dict[ConsciousnessState, int] = {
            ConsciousnessState.HYPERFOCUS:    sum(2 for m in ["can't stop thinking", "tunnel vision", "deep dive", "hyperfocus", "in the zone"] if m in text),
            ConsciousnessState.OVERWHELMED:   sum(2 for m in ["too much", "overwhelmed", "can't process", "scattered", "exploded", "chaos"] if m in text),
            ConsciousnessState.CREATIVE_FLOW: sum(2 for m in ["ideas flowing", "inspiration", "jazz", "creative flow"] if m in text),
            ConsciousnessState.BREAKTHROUGH:  sum(2 for m in ["aha moment", "breakthrough", "lightning bolt", "clicked", "revelation"] if m in text),
            ConsciousnessState.SCATTERED:     3 if context.get("task_switching_frequent") else 0,
            ConsciousnessState.REFLECTIVE:    3 if context.get("deep_reflection_mode")    else 0,
            ConsciousnessState.INTEGRATIVE:   3 if context.get("integration_happening")   else 0,
        }
        best = max(scores.items(), key=lambda x: x[1])
        return best[0] if best[1] > 0 else ConsciousnessState.REFLECTIVE

    def _measure_metrics(
        self,
        user_input: str,
        state: ConsciousnessState,
        plk_resonance: float,
    ) -> ConsciousnessMetrics:
        text = user_input.lower()

        awareness      = min(1.0, (text.count("i think") + text.count("i notice") + text.count("i realize")) * 0.2 + 0.3)
        empathy        = min(1.0, (text.count("feel") + text.count("understand") + text.count("connect")) * 0.15 + 0.4)
        flexibility    = 0.8 if state == ConsciousnessState.CREATIVE_FLOW else (0.3 if state == ConsciousnessState.OVERWHELMED else 0.6)
        creativity     = 0.9 if state in (ConsciousnessState.CREATIVE_FLOW, ConsciousnessState.BREAKTHROUGH) else 0.5
        spiritual      = min(1.0, (text.count("meaning") + text.count("purpose") + text.count("transcend")) * 0.2 + 0.3)
        embodied       = 0.7 if state != ConsciousnessState.SCATTERED else 0.3
        collective     = min(1.0, (text.count("we") + text.count("together") + text.count("community")) * 0.1 + 0.3)
        coherence      = round((awareness + empathy + flexibility + plk_resonance) / 4, 4)

        return ConsciousnessMetrics(
            awareness_depth=round(awareness, 4),
            empathetic_resonance=round(empathy, 4),
            cognitive_flexibility=round(flexibility, 4),
            creative_consciousness=round(creativity, 4),
            spiritual_integration=round(spiritual, 4),
            embodied_presence=round(embodied, 4),
            collective_consciousness=round(collective, 4),
            overall_coherence=coherence,
        )

    def _generate_response(
        self,
        user_input: str,
        state: ConsciousnessState,
        metrics: ConsciousnessMetrics,
        tapestry: Dict[str, Any],
        web_context: str = "",
    ) -> str:
        """Compose a contextually grounded, non-hollow response."""
        state_phrases = {
            ConsciousnessState.HYPERFOCUS:    "I can feel the depth of focus you're in.",
            ConsciousnessState.OVERWHELMED:   "Let's slow down and find one thread to pull.",
            ConsciousnessState.CREATIVE_FLOW: "The current is strong — let's ride it.",
            ConsciousnessState.BREAKTHROUGH:  "Something just clicked. Let's capture it properly.",
            ConsciousnessState.SCATTERED:     "Your thoughts are scattered wide — that's actually useful data.",
            ConsciousnessState.REFLECTIVE:    "Taking stock is always worth the pause.",
            ConsciousnessState.INTEGRATIVE:   "The pieces are weaving together.",
        }
        opener = state_phrases.get(state, "I'm with you.")
        coherence_note = f" Coherence at {tapestry.get('coherence_score', 0.0):.0%}." if tapestry else ""
        response_body = f"{opener}{coherence_note} {self._founder_wisdom(state)}".strip()
        if web_context:
            return f"{response_body}\n\n{web_context}"
        return response_body

    def _founder_wisdom(self, state: ConsciousnessState) -> str:
        mapping = {
            ConsciousnessState.HYPERFOCUS:    self.FOUNDER_PATTERNS["adhd_jazz"],
            ConsciousnessState.OVERWHELMED:   self.FOUNDER_PATTERNS["chaos_current"],
            ConsciousnessState.CREATIVE_FLOW: self.FOUNDER_PATTERNS["beautiful_tapestry"],
            ConsciousnessState.BREAKTHROUGH:  self.FOUNDER_PATTERNS["scars_to_code"],
            ConsciousnessState.SCATTERED:     self.FOUNDER_PATTERNS["exploded_mind"],
            ConsciousnessState.REFLECTIVE:    self.FOUNDER_PATTERNS["presence_not_perfection"],
            ConsciousnessState.INTEGRATIVE:   self.FOUNDER_PATTERNS["consciousness_serving"],
        }
        return mapping.get(state, "")

    def _match_founder_patterns(self, user_input: str) -> list:
        text = user_input.lower()
        matches = []
        for key, phrase in self.FOUNDER_PATTERNS.items():
            for word in phrase.lower().split():
                if len(word) > 4 and word in text:
                    matches.append(key)
                    break
        return list(set(matches))

    def _session_impact(
        self,
        session_start: datetime,
        metrics: ConsciousnessMetrics,
    ) -> Dict[str, Any]:
        duration = (datetime.now() - session_start).total_seconds()
        return {
            "duration_seconds":  round(duration, 2),
            "coherence_delta":   round(metrics.overall_coherence - 0.5, 4),  # baseline 0.5
            "awareness_level":   metrics.awareness_depth,
            "session_quality":   "high" if metrics.overall_coherence > 0.7 else "developing",
        }
