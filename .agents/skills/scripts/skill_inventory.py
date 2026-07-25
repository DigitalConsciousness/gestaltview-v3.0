#!/usr/bin/env python3
"""Shared discovery for curated skills plus repo-local helper skills.

Policy:
- `manifest.json` is the curated top-level skill allowlist used by generators.
- The curated allowlist is intentionally strict: repo-specific GestaltView skills
  and direct skill-library stewardship only.
- Top-level `SKILL.md` folders on disk that are not listed in `manifest.json`
  are treated as auxiliary and excluded from generated outputs.
- Repo-local helper skills under `skills/skills/*/SKILL.md` are always included.
- When multiple discovered folders declare the same skill `name:`, the first
  discovered path wins and later duplicates are skipped.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = ROOT / "manifest.json"
LOCAL_SKILLS_DIR = ROOT / "skills"


def parse_frontmatter(text: str) -> dict[str, str]:
    """Parse a minimal YAML-ish frontmatter block without external deps."""
    match = re.search(r"^---\s*\n(.*?)\n---\s*", text, re.DOTALL)
    if not match:
        return {}

    def normalize_scalar(value: str) -> str:
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            return value[1:-1]
        return value

    data: dict[str, str] = {}
    lines = match.group(1).splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        if ":" not in line:
            index += 1
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.lstrip()

        if value in {">", "|"}:
            block: list[str] = []
            index += 1
            while index < len(lines):
                next_line = lines[index]
                if next_line.startswith((" ", "\t")):
                    block.append(next_line.strip())
                    index += 1
                    continue
                if not next_line.strip():
                    block.append("")
                    index += 1
                    continue
                break
            data[key] = " ".join(part for part in block if part).strip()
            continue

        data[key] = normalize_scalar(value)
        index += 1

    return data


def _manifest_skill_dirs() -> list[Path]:
    """Return curated top-level skills explicitly tracked in manifest.json."""
    if not MANIFEST_PATH.exists():
        return []

    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    skill_dirs: list[Path] = []
    for entry in data.get("skills", []):
        folder = entry.get("folder")
        if not isinstance(folder, str) or not folder:
            continue
        skill_dir = ROOT / folder
        if (skill_dir / "SKILL.md").exists():
            skill_dirs.append(skill_dir)
    return skill_dirs


def _fallback_top_level_skill_dirs() -> list[Path]:
    """Return every top-level skill only when manifest.json is unavailable."""
    skill_dirs: list[Path] = []
    for child in sorted(ROOT.iterdir()):
        if child.name.startswith(".") or not child.is_dir():
            continue
        if (child / "SKILL.md").exists():
            skill_dirs.append(child)
    return skill_dirs


def _repo_local_skill_dirs() -> list[Path]:
    """Return repo-local helper skills nested under skills/skills/."""
    if not LOCAL_SKILLS_DIR.exists():
        return []
    return sorted(path.parent for path in LOCAL_SKILLS_DIR.glob("*/SKILL.md"))


def uncataloged_top_level_skill_dirs() -> list[Path]:
    """Return top-level skills that exist on disk but are outside the manifest."""
    curated = {path.resolve() for path in _manifest_skill_dirs()}
    return [
        path for path in _fallback_top_level_skill_dirs() if path.resolve() not in curated
    ]


def iter_skill_dirs() -> list[Path]:
    """Return curated top-level skills plus repo-local helper skills.

    When manifest.json exists, uncataloged top-level folders are intentionally
    excluded so generators stay aligned with the curated catalog.
    """
    discovered = _manifest_skill_dirs() or _fallback_top_level_skill_dirs()
    seen = {path.resolve() for path in discovered}

    for path in _repo_local_skill_dirs():
        resolved = path.resolve()
        if resolved in seen:
            continue
        discovered.append(path)
        seen.add(resolved)

    return discovered


def collect_skills() -> list[dict[str, str]]:
    skills: list[dict[str, str]] = []
    seen_names: set[str] = set()

    for skill_dir in iter_skill_dirs():
        skill_md = skill_dir / "SKILL.md"
        meta = parse_frontmatter(skill_md.read_text(encoding="utf-8"))
        name = meta.get("name", "").strip()
        description = meta.get("description", "").strip()
        if not name or not description:
            continue
        if name in seen_names:
            continue

        skills.append(
            {
                "name": name,
                "description": description,
                "path": str(skill_dir.relative_to(ROOT)),
            }
        )
        seen_names.add(name)

    return skills
