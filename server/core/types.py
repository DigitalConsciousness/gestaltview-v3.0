"""
GestaltView Core Types — Single source of truth for all dataclasses and enums.
Do not define these elsewhere. Import from here.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class ConsciousnessState(Enum):
    HYPERFOCUS   = "hyperfocus"    # ADHD superpower state
    OVERWHELMED  = "overwhelmed"   # Exploded picture mind
    CREATIVE_FLOW = "creative_flow" # Jazz improvisation mode
    SCATTERED    = "scattered"     # Information overload
    INTEGRATIVE  = "integrative"   # Beautiful tapestry weaving
    BREAKTHROUGH = "breakthrough"  # Lightning bolt insights
    REFLECTIVE   = "reflective"    # Meta-awareness state


@dataclass
class ConsciousnessMetrics:
    awareness_depth: float        # Metacognitive understanding
    empathetic_resonance: float   # Connection with others
    cognitive_flexibility: float  # Adaptability
    creative_consciousness: float # Innovation capacity
    spiritual_integration: float  # Transcendent awareness
    embodied_presence: float      # Mindful grounding
    collective_consciousness: float # Universal connection
    overall_coherence: float      # Tapestry integration score


@dataclass
class BucketDrop:
    id: str
    content: str
    urgency: str                        # random | regular | lightning | critical
    timestamp: datetime
    consciousness_state: ConsciousnessState
    emotional_intensity: float
    cognitive_complexity: float
    resonance_score: float
    connections: List[str] = field(default_factory=list)  # Connected drop IDs
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class PersonalLanguageKey:
    user_id: str
    metaphors: Dict[str, Any] = field(default_factory=dict)
    communication_patterns: Dict[str, float] = field(default_factory=dict)
    emotional_markers: Dict[str, Any] = field(default_factory=dict)
    cognitive_style: str = "detecting..."
    authenticity_score: float = 0.0
    resonance_history: List[float] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)


@dataclass
class TapestryThread:
    id: str
    user_id: str
    title: str
    summary: str
    related_drop_ids: List[str]
    coherence_score: float
    pattern_type: str               # adhd-flow | creative-burst | cognitive-block | etc.
    created_at: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)
