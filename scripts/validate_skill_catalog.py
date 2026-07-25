#!/usr/bin/env python3
"""Validate the curated GestaltView skills catalog."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = ROOT / ".agents" / "skills"
MANIFEST = SKILLS_ROOT / "manifest.json"
INDEX = SKILLS_ROOT / "INDEX.md"
AGENTS = SKILLS_ROOT / "agents" / "AGENTS.md"


def fail(message: str) -> None:
    print(f"skill catalog validation failed: {message}", file=sys.stderr)
    raise SystemExit(1)


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if not text.startswith("---"):
        fail(f"{path.relative_to(ROOT)} is missing YAML frontmatter")
    match = re.match(r"---\n(.*?)\n---", text, flags=re.DOTALL)
    if not match:
        fail(f"{path.relative_to(ROOT)} has malformed YAML frontmatter")
    values: dict[str, str] = {}
    current: str | None = None
    for line in match.group(1).splitlines():
        key_match = re.match(r"([A-Za-z0-9_-]+):\s*(.*)$", line)
        if key_match:
            current = key_match.group(1)
            values[current] = key_match.group(2).strip().strip('"')
        elif current and line.startswith((" ", "\t")):
            values[current] += " " + line.strip()
    return values


def has_child(folder: str, names: tuple[str, ...]) -> bool:
    skill_dir = SKILLS_ROOT / folder
    return any((skill_dir / name).exists() for name in names)


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    skills = manifest.get("skills", [])
    folders = [skill["folder"] for skill in skills]

    if len(folders) != len(set(folders)):
        fail("manifest.skills contains duplicate folders")

    for folder in folders:
        skill_path = SKILLS_ROOT / folder / "SKILL.md"
        if not skill_path.exists():
            fail(f"manifest skill {folder} has no SKILL.md")
        meta = frontmatter(skill_path)
        if not meta.get("name") or not meta.get("description"):
            fail(f"{skill_path.relative_to(ROOT)} must declare name and description")

    category_members = [folder for items in manifest["categories"].values() for folder in items]
    if sorted(category_members) != sorted(folders):
        fail("manifest categories do not exactly match manifest.skills")

    highlighted = manifest["highlighted_core"]["skills"]
    missing_highlighted = sorted(set(highlighted) - set(folders))
    if missing_highlighted:
        fail(f"highlighted skills missing from manifest.skills: {missing_highlighted}")

    summary = manifest["summary"]
    top_level = sorted(path.parent.name for path in SKILLS_ROOT.glob("*/SKILL.md"))
    expected = {
        "top_level_skill_count": len(folders),
        "highlighted_core_skill_count": len(highlighted),
        "skills_with_agents": sum(has_child(folder, ("agents",)) for folder in folders),
        "skills_with_scripts": sum(has_child(folder, ("scripts",)) for folder in folders),
        "skills_with_references": sum(has_child(folder, ("references", "reference")) for folder in folders),
        "skills_with_assets": sum(has_child(folder, ("assets",)) for folder in folders),
        "skills_with_nested_skill_dirs": sum(bool(list((SKILLS_ROOT / folder).glob("*/SKILL.md"))) for folder in folders),
        "all_top_level_skill_count_on_disk": len(top_level),
        "uncataloged_top_level_skill_count": len(set(top_level) - set(folders)),
        "all_top_level_skills_with_agents": sum(has_child(folder, ("agents",)) for folder in top_level),
        "all_top_level_skills_with_scripts": sum(has_child(folder, ("scripts",)) for folder in top_level),
        "all_top_level_skills_with_references": sum(has_child(folder, ("references", "reference")) for folder in top_level),
        "all_top_level_skills_with_assets": sum(has_child(folder, ("assets",)) for folder in top_level),
    }
    for key, value in expected.items():
        if summary.get(key) != value:
            fail(f"summary.{key} is {summary.get(key)!r}, expected {value!r}")

    index_text = INDEX.read_text(encoding="utf-8")
    agents_text = AGENTS.read_text(encoding="utf-8")
    for folder in folders:
        if f"`{folder}`" not in index_text:
            fail(f"INDEX.md does not mention canonical skill {folder}")
        if f'"{folder}/SKILL.md"' not in agents_text:
            fail(f"agents/AGENTS.md does not expose canonical skill {folder}")

    print(f"validated {len(folders)} canonical skills and {len(highlighted)} highlighted skills")


if __name__ == "__main__":
    main()
