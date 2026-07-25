"""
GestaltView — Billy Style Planner
===================================
Converts Billy's text response into structured delivery instructions
that drive CosyVoice's instruct-mode prompts.

This is the layer that makes Billy sound like Billy rather than
a generic TTS voice. The model is the instrument; this is the musician.

© 2026 Keith Soyka / GestaltView — All Rights Reserved
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Literal, Optional

# ---------------------------------------------------------------------------
# Style plan contract — matches spec_1_billy_voice_engine.md
# ---------------------------------------------------------------------------
@dataclass
class Segment:
    text: str
    tags: List[str] = field(default_factory=list)


@dataclass
class StylePlan:
    # Delivery dimensions — all 0.0 to 1.0
    pace:      float = 0.92   # 0 = very slow, 1 = fast
    energy:    float = 0.55
    warmth:    float = 0.78
    gravel:    float = 0.38   # vocal texture / roughness
    humor:     float = 0.30
    wonder:    float = 0.20
    intensity: float = 0.32

    pause_strategy: Literal["tight", "reflective", "storytelling"] = "reflective"
    profanity_allowed: bool = False

    # Per-segment style hints
    segments: List[Segment] = field(default_factory=list)

    # Mode context
    mode: str = "chat"


# ---------------------------------------------------------------------------
# Mode preset curves
# ---------------------------------------------------------------------------
PRESETS: Dict[str, Dict] = {
    # Conversational Billy — playful, direct, warm
    "billy_chat_default": {
        "pace": 0.93, "energy": 0.62, "warmth": 0.82,
        "gravel": 0.36, "humor": 0.42, "wonder": 0.25,
        "intensity": 0.30, "pause_strategy": "tight",
    },
    # Thoughtful Billy — measured, deeper, more precise
    "billy_synthesis_default": {
        "pace": 0.82, "energy": 0.44, "warmth": 0.72,
        "gravel": 0.42, "humor": 0.18, "wonder": 0.38,
        "intensity": 0.48, "pause_strategy": "reflective",
    },
    # Founder-private — intimate, warmer, less performed
    "billy_founder_private": {
        "pace": 0.88, "energy": 0.50, "warmth": 0.92,
        "gravel": 0.32, "humor": 0.35, "wonder": 0.30,
        "intensity": 0.28, "pause_strategy": "storytelling",
    },
    # Fallback — neutral, safe
    "billy_neutral": {
        "pace": 0.90, "energy": 0.55, "warmth": 0.70,
        "gravel": 0.30, "humor": 0.20, "wonder": 0.15,
        "intensity": 0.30, "pause_strategy": "reflective",
    },
}

# ---------------------------------------------------------------------------
# Signal detectors — simple heuristics for Phase 1
# (Phase 2: replace with lightweight classifier)
# ---------------------------------------------------------------------------

# Humor signals
_HUMOR_PATTERNS = re.compile(
    r"\b(haha|lol|funny|ridiculous|absurd|wild|honestly|plot twist"
    r"|you had to be there|right\?|kind of beautiful|don't oversell)\b",
    re.IGNORECASE,
)

# Validation / earned recognition signals
_VALIDATION_PATTERNS = re.compile(
    r"\b(you actually|that's real|that matters|genuine|not performative"
    r"|legitimately|that landed|you did that|for real)\b",
    re.IGNORECASE,
)

# Wonder / inquiry signals
_WONDER_PATTERNS = re.compile(
    r"\b(fascinating|what if|imagine|curious|interesting|I wonder"
    r"|uncharted|hasn't been documented|possible)\b",
    re.IGNORECASE,
)

# Grounding / directness signals
_GROUNDED_PATTERNS = re.compile(
    r"\b(let's be clear|the data|the evidence|here's the thing"
    r"|realistically|that said|however|but)\b",
    re.IGNORECASE,
)

# Swear word presence (for profanity gate)
_PROFANITY_PATTERNS = re.compile(
    r"\b(fuck|shit|damn|hell|ass|crap|bloody)\b",
    re.IGNORECASE,
)

# Sentence-level tag inference
_SOFT_PATTERNS  = re.compile(r"\b(gentle|softer|quietly|just saying|small|little)\b", re.IGNORECASE)
_LAUGH_PATTERNS = re.compile(r"\b(ha|haha|laugh|chuckle|funny|absurd|ridiculous)\b", re.IGNORECASE)
_DRY_PATTERNS   = re.compile(r"\b(sure|right|of course|obviously|naturally|clearly)\b", re.IGNORECASE)


# ---------------------------------------------------------------------------
# StylePlanner
# ---------------------------------------------------------------------------
class StylePlanner:
    """
    Phase 1: heuristic-based planner.
    Phase 2: replace _infer_affect() with a lightweight classifier.
    """

    def __init__(self, profanity_allowed: bool = False) -> None:
        self.profanity_allowed = profanity_allowed

    def plan(
        self,
        text: str,
        mode: str = "chat",
        override: Optional[Dict] = None,
        session_adult: bool = False,
    ) -> StylePlan:
        """
        Build a StylePlan for a given Billy response text.

        Args:
            text:          Billy's full response text.
            mode:          'chat' or 'synthesis'.
            override:      Dict of dimension values to override after preset.
            session_adult: Whether the session is age-verified adult (enables profanity gate).
        """
        # 1. Start from mode preset
        preset_key = (
            "billy_chat_default"      if mode == "chat"
            else "billy_synthesis_default"
        )
        preset = PRESETS[preset_key].copy()

        # 2. Infer affect modifiers from text content
        affect = self._infer_affect(text)

        # 3. Blend preset with affect
        plan = StylePlan(
            pace      = max(0.6, min(1.0, preset["pace"]      + affect.get("pace_delta", 0))),
            energy    = max(0.2, min(1.0, preset["energy"]    + affect.get("energy_delta", 0))),
            warmth    = max(0.3, min(1.0, preset["warmth"]    + affect.get("warmth_delta", 0))),
            gravel    = max(0.1, min(0.9, preset["gravel"]    + affect.get("gravel_delta", 0))),
            humor     = max(0.0, min(1.0, preset["humor"]     + affect.get("humor_delta", 0))),
            wonder    = max(0.0, min(1.0, preset["wonder"]    + affect.get("wonder_delta", 0))),
            intensity = max(0.1, min(1.0, preset["intensity"] + affect.get("intensity_delta", 0))),
            pause_strategy   = affect.get("pause_strategy", preset["pause_strategy"]),
            profanity_allowed = session_adult and self.profanity_allowed,
            mode     = mode,
        )

        # 4. Apply overrides
        if override:
            for k, v in override.items():
                if hasattr(plan, k):
                    setattr(plan, k, v)

        # 5. Build per-segment style hints
        plan.segments = self._segment_text(text, plan)

        return plan

    def _infer_affect(self, text: str) -> Dict:
        """
        Heuristic pass over the text to derive blending deltas.
        Returns a dict of dimension deltas and optionally a pause_strategy override.
        """
        affect: Dict = {}

        humor_hits     = len(_HUMOR_PATTERNS.findall(text))
        validation     = bool(_VALIDATION_PATTERNS.search(text))
        wonder_hits    = len(_WONDER_PATTERNS.findall(text))
        grounded_hits  = len(_GROUNDED_PATTERNS.findall(text))
        has_profanity  = bool(_PROFANITY_PATTERNS.search(text))
        is_long        = len(text) > 400

        if humor_hits >= 2:
            affect["humor_delta"]  =  0.20
            affect["energy_delta"] =  0.10
            affect["pace_delta"]   =  0.05
        elif humor_hits == 1:
            affect["humor_delta"]  =  0.10

        if validation:
            affect["warmth_delta"]    =  0.12
            affect["intensity_delta"] =  0.08
            affect["pace_delta"]      = -0.05  # slow down for earned moments

        if wonder_hits >= 2:
            affect["wonder_delta"]    =  0.20
            affect["pace_delta"]      = -0.08
            affect["pause_strategy"]  = "storytelling"
        elif wonder_hits == 1:
            affect["wonder_delta"]    =  0.10

        if grounded_hits >= 2:
            affect["intensity_delta"] =  0.10
            affect["gravel_delta"]    =  0.06
            affect["humor_delta"]     = -0.08

        if is_long:
            affect["pause_strategy"]  = "reflective"
            affect["pace_delta"]      = max(affect.get("pace_delta", 0) - 0.04, -0.15)

        return affect

    def _segment_text(self, text: str, plan: StylePlan) -> List[Segment]:
        """
        Split text into sentence-level segments and assign style tags.
        Phase 1: rule-based. Phase 2: lightweight per-sentence classifier.
        """
        # Split on sentence boundaries
        raw_sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        segments = []

        for sentence in raw_sentences:
            if not sentence.strip():
                continue
            tags: List[str] = []

            if _LAUGH_PATTERNS.search(sentence):
                tags.append("small laugh")
            if _VALIDATION_PATTERNS.search(sentence):
                tags.extend(["soft", "earned"])
            if _WONDER_PATTERNS.search(sentence):
                tags.append("wonder")
            if _DRY_PATTERNS.search(sentence) and plan.humor > 0.3:
                tags.append("dry humor")
            if _GROUNDED_PATTERNS.search(sentence):
                tags.append("grounded")
            if _SOFT_PATTERNS.search(sentence):
                tags.append("lower energy")
            if not tags:
                tags.append("natural")

            segments.append(Segment(text=sentence.strip(), tags=tags))

        return segments

    def to_cosyvoice_prompt(self, plan: StylePlan) -> str:
        """
        Convert a StylePlan into a CosyVoice instruct-mode natural language prompt.
        Called by CosyVoiceTTS before synthesis.
        """
        parts = []

        # Pace
        if plan.pace < 0.75:
            parts.append("speak slowly and deliberately")
        elif plan.pace < 0.88:
            parts.append("speak at a measured, unhurried pace")
        elif plan.pace > 0.97:
            parts.append("speak with quick, direct energy")
        else:
            parts.append("speak conversationally")

        # Warmth
        if plan.warmth > 0.85:
            parts.append("with deep warmth and genuine care")
        elif plan.warmth > 0.70:
            parts.append("with warmth")

        # Gravel
        if plan.gravel > 0.55:
            parts.append("a gravelly, weathered texture to the voice")
        elif plan.gravel > 0.35:
            parts.append("slight roughness and character in the voice")

        # Humor
        if plan.humor > 0.55:
            parts.append("with playful humor and a light touch")
        elif plan.humor > 0.35:
            parts.append("with a dry wit underneath")

        # Wonder
        if plan.wonder > 0.45:
            parts.append("with genuine curiosity and a sense of wonder")

        # Intensity
        if plan.intensity > 0.60:
            parts.append("with grounded directness and quiet intensity")

        # Pause strategy
        if plan.pause_strategy == "storytelling":
            parts.append("using storytelling pauses — let thoughts breathe")
        elif plan.pause_strategy == "reflective":
            parts.append("with reflective pauses before key ideas")
        elif plan.pause_strategy == "tight":
            parts.append("keeping pauses tight and the rhythm moving")

        return ", ".join(parts) + "."
