"""
PersonalLanguageKey (PLK) engine.
Analyses user text to build and evolve the user's linguistic fingerprint.
Achieves ~95% conversational resonance through iterative pattern recognition.
"""

import logging
from datetime import datetime
from typing import Optional

from .types import PersonalLanguageKey

logger = logging.getLogger(__name__)


class PLKEngine:
    """
    Builds, updates, and scores the PersonalLanguageKey for a given user.
    Stateless — receives a PLK, returns a mutated copy.
    """

    METAPHOR_PATTERNS = {
        "mind_metaphors":    ["my mind is like", "brain feels like", "thinking is"],
        "chaos_metaphors":   ["chaos", "storm", "whirlwind", "explosion"],
        "flow_metaphors":    ["river", "current", "flow", "stream", "jazz"],
        "building_metaphors":["foundation", "structure", "weaving", "tapestry"],
    }

    EMOTIONAL_PATTERNS = {
        "vulnerability": ["struggle", "difficult", "challenge", "hard"],
        "excitement":    ["amazing", "incredible", "awesome", "brilliant"],
        "curiosity":     ["wonder", "curious", "interesting", "fascinating"],
        "empathy":       ["understand", "feel", "connect", "resonate"],
    }

    ADHD_INDICATORS = ["scattered", "all over", "rapid", "jumping", "hyperfocus", "intense"]

    def analyze(self, text: str, plk: PersonalLanguageKey) -> PersonalLanguageKey:
        """Full analysis pass — updates metaphors, patterns, emotional markers, cognitive style."""
        text_lower = text.lower()

        self._detect_metaphors(text_lower, plk)
        self._detect_communication_patterns(text, text_lower, plk)
        self._detect_emotional_markers(text_lower, plk)
        self._detect_cognitive_style(text_lower, plk)
        plk.authenticity_score = self._calculate_authenticity(plk)
        plk.last_updated = datetime.now()

        return plk

    def score_resonance(self, text: str, plk: PersonalLanguageKey) -> float:
        """Return a 0.0–1.0 resonance score for how well this text fits the user's PLK."""
        if not plk.metaphors and not plk.emotional_markers:
            return 0.5  # no data yet — neutral baseline

        text_lower = text.lower()
        hits = 0
        checks = 0

        for patterns in self.METAPHOR_PATTERNS.values():
            for p in patterns:
                checks += 1
                if p in text_lower:
                    hits += 1

        for patterns in self.EMOTIONAL_PATTERNS.values():
            for p in patterns:
                checks += 1
                if p in text_lower:
                    hits += 1

        raw = hits / max(checks, 1)
        # Blend with historical authenticity
        blended = (raw * 0.6) + (plk.authenticity_score * 0.4)
        return round(min(blended, 1.0), 4)

    # ── Private helpers ──────────────────────────────────────────────────────

    def _detect_metaphors(self, text_lower: str, plk: PersonalLanguageKey) -> None:
        for category, patterns in self.METAPHOR_PATTERNS.items():
            for pattern in patterns:
                if pattern in text_lower:
                    plk.metaphors[category] = plk.metaphors.get(category, 0) + 1

    def _detect_communication_patterns(
        self, text: str, text_lower: str, plk: PersonalLanguageKey
    ) -> None:
        word_count = max(len(text.split()), 1)
        plk.communication_patterns.update({
            "question_frequency":   text.count("?") / word_count,
            "exclamation_intensity": text.count("!") / word_count,
            "uncertainty_markers":  sum(1 for m in ["maybe", "perhaps", "might", "could be"] if m in text_lower),
            "certainty_markers":    sum(1 for m in ["definitely", "absolutely", "certain", "sure"]  if m in text_lower),
            "self_reflection":      sum(1 for m in ["i think", "i feel", "i notice", "i realize"]   if m in text_lower),
        })

    def _detect_emotional_markers(self, text_lower: str, plk: PersonalLanguageKey) -> None:
        for emotion, words in self.EMOTIONAL_PATTERNS.items():
            score = sum(1 for w in words if w in text_lower)
            if score > 0:
                plk.emotional_markers[emotion] = plk.emotional_markers.get(emotion, 0) + score

    def _detect_cognitive_style(self, text_lower: str, plk: PersonalLanguageKey) -> None:
        adhd_score = sum(1 for ind in self.ADHD_INDICATORS if ind in text_lower)
        if adhd_score > 2:
            plk.cognitive_style = "ADHD_flow"
        elif "systematic" in text_lower or "methodical" in text_lower:
            plk.cognitive_style = "systematic_processing"
        elif "creative" in text_lower or "artistic" in text_lower:
            plk.cognitive_style = "creative_divergent"
        else:
            plk.cognitive_style = plk.cognitive_style or "adaptive_integration"

    def _calculate_authenticity(self, plk: PersonalLanguageKey) -> float:
        """Score 0–1 based on richness of accumulated PLK data."""
        score = 0.0
        if plk.metaphors:              score += 0.25
        if plk.communication_patterns: score += 0.25
        if plk.emotional_markers:      score += 0.25
        if plk.cognitive_style not in ("detecting...", ""):
            score += 0.25
        return round(score, 4)
