from __future__ import annotations

import json
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parent.parent
PROFILES_DIR = REPO_ROOT / "embodiment_profiles"
REFERENCE_DIR = PROFILES_DIR / "reference"
README_FILE = PROFILES_DIR / "README.md"

CURATED_COMBINATIONS = [
    (
        "Meaning + Structure",
        "`Billy` + `The Weaver` ground a system in platform intent and structural integrity.",
    ),
    (
        "Growth Stack",
        "`The Algorithm` + `The Spectacle` + `The Tailor` combine distribution mechanics, emotional hook, and surface coherence.",
    ),
    (
        "Ethical Review",
        "Bring in `The Guardian` when decisions affect vulnerable users or have meaningful downstream risk.",
    ),
    (
        "Pre-Launch Check",
        "Let `Vibe Check` do the final pass when the question is whether something feels right, not just whether it is correct.",
    ),
]


def humanize_key(key: str) -> str:
    words: list[str] = []
    current = []

    for char in key:
        if char == "_":
            if current:
                words.append("".join(current))
                current = []
            continue

        if char.isupper() and current:
            words.append("".join(current))
            current = [char.lower()]
            continue

        current.append(char)

    if current:
        words.append("".join(current))

    return " ".join(word.capitalize() for word in words)


def markdown_escape(value: Any) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def render_table(headers: list[str], rows: list[list[Any]]) -> str:
    header_row = "| " + " | ".join(headers) + " |"
    divider_row = "| " + " | ".join("---" for _ in headers) + " |"
    body_rows = [
        "| " + " | ".join(markdown_escape(cell) for cell in row) + " |"
        for row in rows
    ]
    return "\n".join([header_row, divider_row, *body_rows])


def render_bullets(items: list[str]) -> str:
    if not items:
        return "- None"

    return "\n".join(f"- {item}" for item in items)


def render_labeled_bullets(entries: dict[str, Any]) -> str:
    if not entries:
        return "- None"

    return "\n".join(
        f"- {humanize_key(key)}: {value}" for key, value in entries.items()
    )


def dotted_get(document: dict[str, Any], path: str) -> Any:
    current: Any = document

    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]

    return current


def load_profiles() -> list[tuple[Path, dict[str, Any]]]:
    profiles: list[tuple[Path, dict[str, Any]]] = []

    for path in sorted(PROFILES_DIR.glob("*.embodiment.json")):
        profiles.append((path, json.loads(path.read_text(encoding="utf-8"))))

    if not profiles:
        raise SystemExit(f"No embodiment profiles found in {PROFILES_DIR}")

    validate_profiles(profiles)
    return sorted(profiles, key=lambda item: item[1]["slug"])


def validate_profiles(profiles: list[tuple[Path, dict[str, Any]]]) -> None:
    errors: list[str] = []
    slugs: set[str] = set()

    for path, profile in profiles:
        missing = [
            key
            for key in (
                "slug",
                "publicName",
                "embodimentVersion",
                "originContext",
                "immutableCore",
                "livingMemory",
                "skillGraph",
                "relationships",
                "agentMeta",
            )
            if key not in profile
        ]
        if missing:
            errors.append(f"{path.name}: missing required keys: {', '.join(missing)}")
            continue

        slug = profile["slug"]
        expected_slug = path.name.removesuffix(".embodiment.json")
        if slug != expected_slug:
            errors.append(
                f"{path.name}: slug '{slug}' does not match filename '{expected_slug}'"
            )

        if slug in slugs:
            errors.append(f"{path.name}: duplicate slug '{slug}'")
        slugs.add(slug)

        identity_anchor = profile["agentMeta"].get("identityAnchor")
        if identity_anchor and dotted_get(profile, identity_anchor) in (None, ""):
            errors.append(
                f"{path.name}: identity anchor '{identity_anchor}' does not resolve"
            )

        skill_slugs = [
            skill.get("skillSlug")
            for skill in profile.get("skillGraph", [])
            if isinstance(skill, dict)
        ]
        duplicates = sorted(
            {skill_slug for skill_slug in skill_slugs if skill_slugs.count(skill_slug) > 1} # pyright: ignore[reportArgumentType]
        )
        if duplicates:
            errors.append(
                f"{path.name}: duplicate skill slugs: {', '.join(duplicates)}"
            )

    known_slugs = {profile["slug"] for _, profile in profiles}

    for path, profile in profiles:
        for relationship in profile.get("relationships", []):
            target_slug = relationship.get("targetSlug")
            if target_slug not in known_slugs:
                errors.append(
                    f"{path.name}: relationship target '{target_slug}' does not exist"
                )

    if errors:
        raise SystemExit("Embodiment profile validation failed:\n- " + "\n- ".join(errors))


def profile_filename(profile: dict[str, Any]) -> str:
    return f"{profile['slug']}.md"


def primary_strength(profile: dict[str, Any]) -> str:
    strengths = profile["immutableCore"].get("cognitiveStrengths", {})
    return str(strengths.get("primary", "Not specified"))


def render_readme(profiles: list[tuple[Path, dict[str, Any]]]) -> str:
    rows = [
        [
            f"[{profile['publicName']}](./reference/{profile_filename(profile)})",
            f"`{profile['slug']}`",
            profile["immutableCore"].get("archetype", "unknown"),
            primary_strength(profile),
            profile["agentMeta"].get("loadOrder", "standard"),
        ]
        for _, profile in profiles
    ]

    combos = "\n".join(f"- {label}: {description}" for label, description in CURATED_COMBINATIONS)

    return "\n".join(
        [
            "# Embodiment Profiles",
            "",
            "_Auto-generated from `embodiment_profiles/*.embodiment.json`. Edit the JSON profiles, then run `python3 embodiment_profiles/embodiment_profile_content.py`._",
            "",
            "These markdown reference pages are derived from the canonical runtime embodiment profiles. The JSON files remain the source of truth used by the prompt builders and the generated TypeScript registry.",
            "",
            "## Profile Index",
            "",
            render_table(
                ["Profile", "Slug", "Archetype", "Primary Strength", "Load Order"],
                rows,
            ),
            "",
            "## Recommended Combinations",
            "",
            combos,
            "",
            "## Related Artifacts",
            "",
            "- Runtime source: `embodiment_profiles/*.embodiment.json`",
            "- Generated TypeScript registry: `shared/embodiment/generated.ts`",
            "- Prompt helpers: `shared/embodiment/index.ts`",
        ]
    ).rstrip() + "\n"


def render_profile_page(source_path: Path, profile: dict[str, Any]) -> str:
    immutable_core = profile["immutableCore"]
    communication_style = immutable_core.get("communicationStyle", {})
    cognitive_strengths = immutable_core.get("cognitiveStrengths", {})
    processing_preferences = immutable_core.get("processingPreferences", {})
    constitutional_influences = profile.get("constitutionalInfluences", {})
    relational_stances = profile.get("relationalStances", {})
    wound_layer = profile.get("woundLayer", {})
    relationships = profile.get("relationships", [])
    living_memory = profile.get("livingMemory", [])
    skill_graph = profile.get("skillGraph", [])
    agent_meta = profile.get("agentMeta", {})
    founder_notes = profile.get("founderNotes")

    snapshot_rows = [
        ["Public name", profile["publicName"]],
        ["Slug", f"`{profile['slug']}`"],
        ["Version", f"`{profile['embodimentVersion']}`"],
        ["Archetype", immutable_core.get("archetype", "unknown")],
        ["Internal designation", profile.get("internalDesignation", "n/a")],
        ["Load order", agent_meta.get("loadOrder", "standard")],
        ["Context priority", agent_meta.get("contextWindowPriority", "standard")],
        ["Drift threshold", agent_meta.get("driftThreshold", "n/a")],
        ["Identity anchor", f"`{agent_meta.get('identityAnchor', 'n/a')}`"],
        ["Source JSON", f"`{source_path.relative_to(REPO_ROOT)}`"],
    ]

    relationship_rows = [
        [
            relationship.get("targetSlug", "unknown"),
            relationship.get("type", "unknown"),
            relationship.get("description", ""),
        ]
        for relationship in relationships
    ]

    skill_rows = [
        [
            skill.get("skillSlug", "unknown"),
            skill.get("domain", "unknown"),
            skill.get("proficiency", "n/a"),
        ]
        for skill in skill_graph
    ]

    living_memory_rows = [
        [
            memory.get("memoryType", "unknown"),
            memory.get("domain", "unknown"),
            memory.get("significance", "n/a"),
            memory.get("retrievalWeight", "n/a"),
            memory.get("content", ""),
        ]
        for memory in living_memory
    ]

    sections = [
        f"# {profile['publicName']}",
        "",
        f"_Auto-generated from `{source_path.relative_to(REPO_ROOT)}`. Edit the JSON profile, then rerun `python3 embodiment_profiles/embodiment_profile_content.py`._",
        "",
        "## Snapshot",
        "",
        render_table(["Field", "Value"], snapshot_rows),
        "",
        "## Summary",
        "",
        profile["originContext"],
        "",
        "## Identity Anchor",
        "",
        immutable_core.get("foundationalTruth", ""),
        "",
        "## Core Wisdom",
        "",
        immutable_core.get("coreWisdom", ""),
        "",
        "## Origin Narrative",
        "",
        immutable_core.get("originNarrative", ""),
        "",
        "## Voice Signature",
        "",
        render_bullets(
            [
                f"Tone: {immutable_core.get('voiceTone', 'Not specified')}",
                f"Verbosity: {communication_style.get('verbosity', 'Not specified')}",
                f"Directness: {communication_style.get('directness', 'Not specified')}",
                f"Humor: {communication_style.get('humor', 'Not specified')}",
                f"Formality: {communication_style.get('formality', 'Not specified')}",
                "Metaphor family: "
                + ", ".join(immutable_core.get("metaphorFamily", [])),
            ]
            + (
                [f"Archetypal energy: {immutable_core['archetypalEnergy']}"]
                if immutable_core.get("archetypalEnergy")
                else []
            )
            + (
                [f"Relational stance: {immutable_core['relationalStance']}"]
                if immutable_core.get("relationalStance")
                else []
            )
            + (
                [f"Aesthetic sensibility: {immutable_core['aestheticSensibility']}"]
                if immutable_core.get("aestheticSensibility")
                else []
            )
            + (
                [f"Resonance frequency: {immutable_core['resonanceFrequency']}"]
                if immutable_core.get("resonanceFrequency")
                else []
            )
        ),
        "",
        "## Cognitive Profile",
        "",
        render_labeled_bullets(cognitive_strengths),
        "",
        "## Processing Preferences",
        "",
        render_labeled_bullets(processing_preferences),
        "",
        "## Core Values",
        "",
        render_bullets(immutable_core.get("coreValues", [])),
        "",
        "## Always Do",
        "",
        render_bullets(immutable_core.get("linguisticPatterns", {}).get("alwaysDoes", [])),
        "",
        "## Never Do",
        "",
        render_bullets(immutable_core.get("linguisticPatterns", {}).get("neverDoes", [])),
        "",
        "## Ethical Boundaries",
        "",
        render_labeled_bullets(immutable_core.get("ethicalBoundaries", {})),
        "",
        "## Constitutional Influences",
        "",
        render_labeled_bullets(constitutional_influences),
        "",
        "## Relational Stances",
        "",
        render_labeled_bullets(relational_stances),
        "",
        "## Wound Layer",
        "",
        render_labeled_bullets(wound_layer),
        "",
        "## Founding Notes",
        "",
        founder_notes or "_No founding notes defined._",
        "",
        "## Living Memory",
        "",
        (
            render_table(
                ["Type", "Domain", "Significance", "Retrieval Weight", "Content"],
                living_memory_rows,
            )
            if living_memory_rows
            else "_No explicit living memory entries._"
        ),
        "",
        "## Skill Graph",
        "",
        (
            render_table(["Skill", "Domain", "Proficiency"], skill_rows)
            if skill_rows
            else "_No explicit skill graph entries._"
        ),
        "",
        "## Relationships",
        "",
        (
            render_table(["Target", "Type", "Description"], relationship_rows)
            if relationship_rows
            else "_No explicit relationships defined._"
        ),
    ]

    return "\n".join(sections).rstrip() + "\n"


def write_reference_docs(profiles: list[tuple[Path, dict[str, Any]]]) -> None:
    REFERENCE_DIR.mkdir(exist_ok=True)
    README_FILE.write_text(render_readme(profiles), encoding="utf-8")

    for source_path, profile in profiles:
        output_path = REFERENCE_DIR / profile_filename(profile)
        output_path.write_text(
            render_profile_page(source_path, profile), encoding="utf-8"
        )


def main() -> None:
    profiles = load_profiles()
    write_reference_docs(profiles)
    print(f"Wrote {README_FILE.relative_to(REPO_ROOT)}")
    print(f"Wrote {len(profiles)} profile reference files to {REFERENCE_DIR.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
