"""
GestaltView Core Brain — Python module package
Extracted from GestaltView_Brain_Logic_9_15_25.py (v10.0)
Wired to Supabase. SQLite removed.
"""

from .types import (
    ConsciousnessState,
    ConsciousnessMetrics,
    BucketDrop,
    PersonalLanguageKey,
    TapestryThread,
)
from .brain import GestaltViewCore

__all__ = [
    "ConsciousnessState",
    "ConsciousnessMetrics",
    "BucketDrop",
    "PersonalLanguageKey",
    "TapestryThread",
    "GestaltViewCore",
]
