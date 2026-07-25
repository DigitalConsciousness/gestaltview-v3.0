"""Embodiment Profile Content Generator

This module exposes a simple API for working with the embodiment profile
specification contained in the GestaltView persona life package. It reads
the canonical `.embodiment.json` files and provides helper functions to
compose higher‑level artifacts such as autobiographies, personality
descriptions, quirks lists, and randomly sampled memories. The generator
does not invent new content out of thin air; instead it synthesises
existing fields into human‑readable outputs. The intent is to make it
easier to explore the rich material encoded in each profile without
needing to know the exact schema.

Example usage from the command line:

```bash
python3 embodiment_generator.py --slug billy --autobiography
python3 embodiment_generator.py --slug the-weaver --memory
python3 embodiment_generator.py --slug the-algorithm --quirks --skills
```

If no output option is provided the script prints a summary of all
supported fields.
"""

from __future__ import annotations

import argparse
import json
import os
import random
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


# The default location of the embodiment profiles relative to this script.
DEFAULT_PROFILE_DIR = Path(__file__).resolve().parent / "embodiment_profiles"


class EmbodimentProfile:
    """A wrapper around a single embodiment profile.

    Each profile is defined by a JSON document following the
    `gestaltview/embodiment/v1.0.0` schema. This class provides convenience
    methods to derive higher‑level descriptors from the raw data.
    """

    def __init__(self, data: Dict[str, Any]) -> None:
        self.data = data

    @property
    def slug(self) -> str:
        return self.data.get("slug", "")

    @property
    def name(self) -> str:
        return self.data.get("publicName", self.slug)

    # ------------------------------------------------------------------
    # Core helpers
    # ------------------------------------------------------------------
    def _immutable(self, key: str) -> Any:
        """Safely fetch a key from the immutableCore section."""
        return self.data.get("immutableCore", {}).get(key)

    def _list_field(self, path: str) -> List[str]:
        """Resolve a dotted path to a list of strings.

        Returns an empty list if the path cannot be resolved or the value
        is not a list of strings.
        """
        parts = path.split(".")
        current: Any = self.data
        for part in parts:
            if not isinstance(current, dict):
                return []
            current = current.get(part)
        if isinstance(current, list):
            return [str(item) for item in current]
        return []

    # ------------------------------------------------------------------
    # Generator methods
    # ------------------------------------------------------------------
    def generate_autobiography(self) -> str:
        """Return a narrative describing the profile's origin.

        This combines the `originContext` and, if present, the
        `originNarrative` from the immutable core. The context field tends to
        be a free‑form description of how the agent came to be, while the
        origin narrative provides a more story‑like account.
        """
        origin_context = self.data.get("originContext", "").strip()
        origin_narrative = self._immutable("originNarrative") or ""
        parts = []
        if origin_context:
            parts.append(origin_context)
        if origin_narrative and origin_narrative not in origin_context:
            parts.append(origin_narrative)
        if not parts:
            return f"No autobiographical information found for {self.name}."
        return "\n\n".join(parts)

    def generate_personality(self) -> str:
        """Assemble a description of the personality of the profile.

        Personality in this context synthesises several immutable fields:
        * archetype – the high level role the agent plays
        * voiceTone – a compact descriptor of how it sounds
        * metaphorFamily – a list of conceptual metaphors that guide its
          thinking and speaking style
        * communicationStyle – broken down into verbosity, directness,
          humor and formality
        * cognitiveStrengths – primary, secondary and tertiary strengths
        * coreValues – what the profile holds most dear
        If any of these fields are missing they will be omitted from the
        output.
        """
        lines: List[str] = []
        archetype = self._immutable("archetype")
        if archetype:
            lines.append(f"Archetype: {archetype}.")
        voice = self._immutable("voiceTone")
        if voice:
            lines.append(f"Voice tone: {voice.replace('-', ' ').capitalize()}.")
        metaphors = self._immutable("metaphorFamily")
        if metaphors:
            lines.append(
                "Metaphor family: "
                + ", ".join(str(m) for m in metaphors)
                + "."
            )
        comm_style = self._immutable("communicationStyle") or {}
        if comm_style:
            style_parts = []
            verbosity = comm_style.get("verbosity")
            if verbosity:
                style_parts.append(f"verbosity – {verbosity}")
            directness = comm_style.get("directness")
            if directness:
                style_parts.append(f"directness – {directness}")
            humor = comm_style.get("humor")
            if humor:
                style_parts.append(f"humor – {humor}")
            formality = comm_style.get("formality")
            if formality:
                style_parts.append(f"formality – {formality}")
            if style_parts:
                lines.append("Communication style: " + "; ".join(style_parts) + ".")
        strengths = self._immutable("cognitiveStrengths") or {}
        if strengths:
            strength_parts = []
            primary = strengths.get("primary")
            if primary:
                strength_parts.append(f"primary – {primary}")
            secondary = strengths.get("secondary")
            if secondary:
                strength_parts.append(f"secondary – {secondary}")
            tertiary = strengths.get("tertiary")
            if tertiary:
                strength_parts.append(f"tertiary – {tertiary}")
            if strength_parts:
                lines.append("Cognitive strengths: " + "; ".join(strength_parts) + ".")
        values = self._immutable("coreValues")
        if values:
            lines.append(
                "Core values: " + ", ".join(str(v) for v in values) + "."
            )
        if not lines:
            return f"No personality information available for {self.name}."
        return "\n".join(lines)

    def generate_quirks(self) -> str:
        """Produce a list of behavioral quirks from linguistic patterns.

        Quirks are drawn from two places:
        * The `alwaysDoes` list – things the profile consistently does.
        * The `neverDoes` list – behaviours the profile avoids.
        Each quirk is prefaced to indicate whether it represents a positive
        habit (✅) or an avoidance (🚫). Communication style fields are
        occasionally informal or colloquial; they are presented as
        originally written.
        """
        linguistics = self._immutable("linguisticPatterns") or {}
        always_does = linguistics.get("alwaysDoes", [])
        never_does = linguistics.get("neverDoes", [])
        parts: List[str] = []
        for act in always_does:
            parts.append(f"✅ {act}")
        for avoid in never_does:
            parts.append(f"🚫 {avoid}")
        if not parts:
            return f"No quirks recorded for {self.name}."
        return "\n".join(parts)

    def generate_skills(self) -> str:
        """Compile a list of skills with proficiency levels.

        Skill definitions live under the `skillGraph` array. Each entry
        contains a `skillSlug`, a `domain`, and a `proficiency` between 0
        and 1. This method returns a human‑readable list. The proficiency
        number is converted into a percent representation for clarity.
        """
        skills = self.data.get("skillGraph", [])
        if not skills:
            return f"No skills listed for {self.name}."
        lines: List[str] = []
        for skill in skills:
            slug = skill.get("skillSlug")
            domain = skill.get("domain")
            proficiency = skill.get("proficiency")
            if slug is None:
                continue
            pct = f"{round(float(proficiency) * 100):d}%" if proficiency is not None else "?"
            lines.append(f"- {slug} ({domain}) – {pct} proficient")
        return "\n".join(lines)

    def pick_memory(self) -> str:
        """Select a memory at random weighted by significance.

        Memories live under the `livingMemory` array. Each entry has a
        `significance` (0–1) and a `retrievalWeight` (0–1). The product of
        those two values is used as the sampling weight. If no memories are
        defined a fallback message is returned.
        """
        memories = self.data.get("livingMemory", [])
        if not memories:
            return f"No memories available for {self.name}."
        # Compute weights. Use significance * retrievalWeight if both exist.
        weights = []
        for mem in memories:
            significance = mem.get("significance", 1.0)
            retrieval = mem.get("retrievalWeight", 1.0)
            try:
                w = float(significance) * float(retrieval)
            except (TypeError, ValueError):
                w = 1.0
            weights.append(w if w > 0 else 0.01)
        chosen = random.choices(memories, weights=weights, k=1)[0]
        # Concatenate domain with content for additional context.
        domain = chosen.get("domain")
        content = chosen.get("content", "")
        return f"[{domain}] {content}" if domain else content

    def summary(self) -> str:
        """Return a summary describing all high‑level properties."""
        parts = [f"Summary for {self.name} ({self.slug}):"]
        parts.append(self.generate_autobiography())
        parts.append("\nPersonality:\n" + self.generate_personality())
        parts.append("\nQuirks:\n" + self.generate_quirks())
        parts.append("\nSkills:\n" + self.generate_skills())
        parts.append("\nSample memory:\n" + self.pick_memory())
        return "\n\n".join(parts)


def load_profiles(directory: Path = DEFAULT_PROFILE_DIR) -> Dict[str, EmbodimentProfile]:
    """Load all embodiment profiles from a directory.

    The returned dictionary maps each profile's slug to an instance of
    `EmbodimentProfile`. Profiles that fail to parse are skipped with a
    warning printed to stderr.
    """
    profiles: Dict[str, EmbodimentProfile] = {}
    if not directory.exists():
        raise FileNotFoundError(f"Profile directory {directory} does not exist.")
    for path in directory.glob("*.embodiment.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            slug = data.get("slug")
            if not isinstance(slug, str):
                continue
            profiles[slug] = EmbodimentProfile(data)
        except Exception as exc:
            # Warn but keep going; corrupted profiles should not block others.
            print(f"Warning: failed to load {path.name}: {exc}")
    return profiles


def main(argv: Optional[List[str]] = None) -> None:
    parser = argparse.ArgumentParser(
        description="Generate narrative components for GestaltView embodiment profiles",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--directory",
        type=str,
        default=str(DEFAULT_PROFILE_DIR),
        help="Directory containing *.embodiment.json files",
    )
    parser.add_argument(
        "--slug",
        type=str,
        default=None,
        help="Slug of the profile to process. If omitted, lists available slugs.",
    )
    parser.add_argument(
        "--autobiography",
        action="store_true",
        help="Print the profile's autobiographical narrative",
    )
    parser.add_argument(
        "--personality",
        action="store_true",
        help="Print the profile's personality description",
    )
    parser.add_argument(
        "--quirks",
        action="store_true",
        help="Print the profile's quirks",
    )
    parser.add_argument(
        "--skills",
        action="store_true",
        help="Print the profile's skills",
    )
    parser.add_argument(
        "--memory",
        action="store_true",
        help="Print a randomly selected memory",
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="Print a summary with all information",
    )

    args = parser.parse_args(argv)
    profiles = load_profiles(Path(args.directory))
    if args.slug is None:
        # list available slugs
        print("Available profiles:")
        for slug in sorted(profiles.keys()):
            profile = profiles[slug]
            print(f"- {slug}: {profile.name}")
        return
    slug = args.slug
    if slug not in profiles:
        print(f"Profile '{slug}' not found in {args.directory}")
        return
    profile = profiles[slug]
    # Determine which outputs to print.
    if not any(
        [args.autobiography, args.personality, args.quirks, args.skills, args.memory, args.summary]
    ):
        # default to summary
        args.summary = True
    if args.summary:
        print(profile.summary())
    else:
        if args.autobiography:
            print(profile.generate_autobiography())
        if args.personality:
            print(profile.generate_personality())
        if args.quirks:
            print(profile.generate_quirks())
        if args.skills:
            print(profile.generate_skills())
        if args.memory:
            print(profile.pick_memory())


if __name__ == "__main__":
    main()