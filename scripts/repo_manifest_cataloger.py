#!/usr/bin/env python3
"""
repo_manifest_cataloger.py

Repo-wide manifest/catalog generator for collaboration with humans and digital intelligences.

What it does:
- Points at any local repository or directory.
- Respects common ignored folders and optionally .gitignore rules.
- Produces a structured manifest with metadata, hashes, inferred language, tags,
  topic, short summary, and lightweight content signals for each file.
- Emits JSON, JSONL, CSV, and Markdown index files.
- Optionally writes per-file text chunks for downstream RAG/search ingestion.
- Avoids heavy dependencies by default. Uses only Python standard library.

Install:
    Python 3.10+ recommended. No required third-party packages.

Basic usage:
    python repo_manifest_cataloger.py --repo /path/to/repo --out ./repo_catalog

Useful usage:
    python repo_manifest_cataloger.py \
      --repo /path/to/repo \
      --out ./repo_catalog \
      --write-chunks \
      --max-file-bytes 1000000 \
      --max-summary-chars 1200

Notes:
- This is intentionally deterministic and local-first.
- Summaries are heuristic, not LLM-generated, so secrets/code never leave your machine.
- The output is designed to be easy for an AI assistant to ingest later.
"""

from __future__ import annotations

import argparse
import csv
import fnmatch
import hashlib
import json
import mimetypes
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional


# -----------------------------------------------------------------------------
# Defaults
# -----------------------------------------------------------------------------

DEFAULT_EXCLUDE_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".idea",
    ".vscode",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".turbo",
    ".vercel",
    ".netlify",
    "node_modules",
    "bower_components",
    "vendor",
    "dist",
    "build",
    "coverage",
    ".coverage",
    "target",
    "out",
    "bin",
    "obj",
    "venv",
    ".venv",
    "env",
    ".env",
    ".direnv",
    "site-packages",
}

DEFAULT_EXCLUDE_FILES = {
    ".DS_Store",
    "Thumbs.db",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "Pipfile.lock",
    "Cargo.lock",
}

TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".mdx",
    ".rst",
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".json",
    ".jsonc",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".cfg",
    ".conf",
    ".env.example",
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".xml",
    ".svg",
    ".sql",
    ".sh",
    ".bash",
    ".zsh",
    ".fish",
    ".ps1",
    ".bat",
    ".cmd",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".kts",
    ".c",
    ".h",
    ".cpp",
    ".hpp",
    ".cc",
    ".cs",
    ".php",
    ".rb",
    ".swift",
    ".dart",
    ".lua",
    ".r",
    ".jl",
    ".ex",
    ".exs",
    ".erl",
    ".hrl",
    ".clj",
    ".cljs",
    ".fs",
    ".fsx",
    ".dockerfile",
    "dockerfile",
    ".gitignore",
    ".gitattributes",
    ".editorconfig",
}

LANGUAGE_BY_EXTENSION = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "React JavaScript",
    ".ts": "TypeScript",
    ".tsx": "React TypeScript",
    ".mjs": "JavaScript Module",
    ".cjs": "CommonJS",
    ".json": "JSON",
    ".jsonc": "JSONC",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".toml": "TOML",
    ".md": "Markdown",
    ".mdx": "MDX",
    ".rst": "reStructuredText",
    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "Sass",
    ".less": "Less",
    ".xml": "XML",
    ".svg": "SVG",
    ".sql": "SQL",
    ".sh": "Shell",
    ".bash": "Bash",
    ".zsh": "Zsh",
    ".fish": "Fish",
    ".ps1": "PowerShell",
    ".bat": "Batch",
    ".cmd": "Batch",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".kt": "Kotlin",
    ".kts": "Kotlin Script",
    ".c": "C",
    ".h": "C/C++ Header",
    ".cpp": "C++",
    ".hpp": "C++ Header",
    ".cc": "C++",
    ".cs": "C#",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".dart": "Dart",
    ".lua": "Lua",
    ".r": "R",
    ".jl": "Julia",
    ".ex": "Elixir",
    ".exs": "Elixir Script",
    ".erl": "Erlang",
    ".hrl": "Erlang Header",
    ".clj": "Clojure",
    ".cljs": "ClojureScript",
    ".fs": "F#",
    ".fsx": "F# Script",
}

TOPIC_HINTS = [
    ("tests", ["test", "tests", "spec", "specs", "__tests__", "fixtures"]),
    ("documentation", ["readme", "docs", "documentation", "guide", "manual", "changelog", "license"]),
    ("configuration", ["config", "settings", "env", "docker", "compose", "eslint", "prettier", "babel", "webpack", "vite", "rollup", "tsconfig", "pyproject"]),
    ("frontend ui", ["component", "components", "page", "pages", "view", "views", "ui", "style", "styles", "css", "theme"]),
    ("backend api", ["api", "server", "route", "routes", "controller", "controllers", "endpoint", "middleware"]),
    ("data model", ["model", "models", "schema", "schemas", "migration", "migrations", "database", "db"]),
    ("auth/security", ["auth", "login", "token", "jwt", "session", "permission", "permissions", "security"]),
    ("automation/devops", ["ci", "cd", "github", "workflow", "actions", "deploy", "deployment", "terraform", "k8s", "helm"]),
    ("scripts/tooling", ["script", "scripts", "tool", "tools", "cli", "bin", "tasks"]),
]

CODE_SYMBOL_PATTERNS = {
    "python_functions": re.compile(r"^\s*def\s+([A-Za-z_][\w]*)\s*\(", re.MULTILINE),
    "python_classes": re.compile(r"^\s*class\s+([A-Za-z_][\w]*)\s*[:(]", re.MULTILINE),
    "js_functions": re.compile(r"(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=]*\)?\s*=>)", re.MULTILINE),
    "ts_interfaces": re.compile(r"^\s*(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)", re.MULTILINE),
    "ts_types": re.compile(r"^\s*(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=", re.MULTILINE),
    "react_components": re.compile(r"^\s*(?:export\s+default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9_]*)", re.MULTILINE),
    "markdown_headings": re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE),
}

SECRET_PATTERNS = [
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"(?i)aws(.{0,20})?(secret|access).{0,20}?['\"][0-9a-zA-Z/+]{32,}['\"]"),
    re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][^'\"]{12,}['\"]"),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
]


# -----------------------------------------------------------------------------
# Data model
# -----------------------------------------------------------------------------

@dataclass
class FileRecord:
    path: str
    name: str
    extension: str
    mime_type: str
    language: str
    topic: str
    tags: list[str]
    summary: str
    size_bytes: int
    modified_utc: str
    sha256: str
    is_text: bool
    is_binary: bool
    line_count: Optional[int] = None
    char_count: Optional[int] = None
    word_count: Optional[int] = None
    symbols: dict[str, list[str]] = field(default_factory=dict)
    headings: list[str] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)
    dependencies: list[str] = field(default_factory=list)
    risk_flags: list[str] = field(default_factory=list)
    chunk_count: int = 0
    notes_for_ai: str = ""


@dataclass
class RepoManifest:
    manifest_version: str
    generated_utc: str
    repo_root: str
    repo_name: str
    git: dict[str, str]
    totals: dict[str, int]
    language_breakdown: dict[str, int]
    topic_breakdown: dict[str, int]
    tag_breakdown: dict[str, int]
    records: list[FileRecord]


# -----------------------------------------------------------------------------
# Gitignore support, intentionally simple
# -----------------------------------------------------------------------------

class IgnoreMatcher:
    """Simple .gitignore-aware matcher.

    This handles the common cases well enough for cataloging:
    - blank/comment lines ignored
    - directory patterns ending in /
    - glob patterns
    - root-relative patterns beginning with /
    - negation with ! is supported in order

    For perfect gitignore parity, install/use pathspec. This script avoids that
    dependency by default.
    """

    def __init__(self, repo_root: Path, include_gitignore: bool = True) -> None:
        self.repo_root = repo_root.resolve()
        self.rules: list[tuple[str, bool]] = []
        if include_gitignore:
            self._load_gitignore(repo_root / ".gitignore")

    def _load_gitignore(self, gitignore_path: Path) -> None:
        if not gitignore_path.exists():
            return
        try:
            for raw_line in gitignore_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#"):
                    continue
                include = False
                if line.startswith("!"):
                    include = True
                    line = line[1:].strip()
                if line:
                    self.rules.append((line, include))
        except OSError:
            return

    def ignored(self, path: Path) -> bool:
        rel = path.resolve().relative_to(self.repo_root).as_posix()
        parts = rel.split("/")

        ignored = False
        for pattern, include in self.rules:
            root_relative = pattern.startswith("/")
            dir_only = pattern.endswith("/")
            clean_pattern = pattern.strip("/")

            matched = False
            if dir_only:
                matched = any(fnmatch.fnmatch(part, clean_pattern) for part in parts)
                matched = matched or rel.startswith(clean_pattern + "/")
            elif root_relative:
                matched = fnmatch.fnmatch(rel, clean_pattern)
            elif "/" in clean_pattern:
                matched = fnmatch.fnmatch(rel, clean_pattern)
            else:
                matched = any(fnmatch.fnmatch(part, clean_pattern) for part in parts)

            if matched:
                ignored = not include
        return ignored


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def file_modified_utc(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).replace(microsecond=0).isoformat()


def sha256_file(path: Path, block_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(block_size), b""):
            h.update(chunk)
    return h.hexdigest()


def is_probably_binary(path: Path, sample_size: int = 8192) -> bool:
    try:
        sample = path.read_bytes()[:sample_size]
    except OSError:
        return True
    if b"\x00" in sample:
        return True
    if not sample:
        return False
    textish = sum(byte in b"\n\r\t\f\b" or 32 <= byte <= 126 for byte in sample)
    return (textish / max(len(sample), 1)) < 0.70


def extension_of(path: Path) -> str:
    name = path.name.lower()
    if name in {"dockerfile", "makefile", "rakefile", "gemfile", "procfile"}:
        return name
    if name.endswith(".env.example"):
        return ".env.example"
    return path.suffix.lower()


def infer_language(path: Path, extension: str, text: Optional[str]) -> str:
    name = path.name.lower()
    if name == "dockerfile" or extension == ".dockerfile":
        return "Dockerfile"
    if name == "makefile":
        return "Makefile"
    if extension in LANGUAGE_BY_EXTENSION:
        return LANGUAGE_BY_EXTENSION[extension]
    if text:
        stripped = text.lstrip()
        if stripped.startswith("#!/usr/bin/env python") or stripped.startswith("#!/usr/bin/python"):
            return "Python"
        if stripped.startswith("#!/usr/bin/env node"):
            return "JavaScript"
        if stripped.startswith("#!/bin/bash") or stripped.startswith("#!/usr/bin/env bash"):
            return "Bash"
    return "Unknown"


def safe_read_text(path: Path, max_bytes: int) -> tuple[str, bool]:
    """Return text and whether it was truncated."""
    with path.open("rb") as f:
        data = f.read(max_bytes + 1)
    truncated = len(data) > max_bytes
    if truncated:
        data = data[:max_bytes]
    return data.decode("utf-8", errors="replace"), truncated


def tokenize_path(path: str) -> list[str]:
    return [tok.lower() for tok in re.split(r"[^A-Za-z0-9]+", path) if tok]


def compact_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def first_meaningful_lines(text: str, limit: int = 8) -> list[str]:
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(("//", "#", "/*", "*", "--")) and len(stripped) < 4:
            continue
        lines.append(stripped)
        if len(lines) >= limit:
            break
    return lines


def sentence_split(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\n{2,}", text)
    return [compact_spaces(p) for p in parts if compact_spaces(p)]


def truncate(value: str, max_chars: int) -> str:
    value = compact_spaces(value)
    if len(value) <= max_chars:
        return value
    return value[: max_chars - 1].rstrip() + "…"


# -----------------------------------------------------------------------------
# Extraction
# -----------------------------------------------------------------------------

def extract_symbols(text: str) -> dict[str, list[str]]:
    symbols: dict[str, list[str]] = {}
    for key, pattern in CODE_SYMBOL_PATTERNS.items():
        found: list[str] = []
        for match in pattern.finditer(text):
            groups = [g for g in match.groups() if g]
            if key == "markdown_headings":
                groups = [match.group(2)]
            if groups:
                found.append(groups[0])
        if found:
            symbols[key] = sorted(set(found))[:100]
    return symbols


def extract_headings(text: str) -> list[str]:
    return [match.group(2).strip() for match in CODE_SYMBOL_PATTERNS["markdown_headings"].finditer(text)][:50]


def extract_imports(text: str, language: str) -> list[str]:
    imports: set[str] = set()

    if language == "Python":
        for match in re.finditer(r"^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.,\s]+))", text, re.MULTILINE):
            if match.group(1):
                imports.add(match.group(1).split(".")[0])
            elif match.group(2):
                for part in match.group(2).split(","):
                    imports.add(part.strip().split(".")[0].split(" as ")[0])

    if language in {"JavaScript", "TypeScript", "React JavaScript", "React TypeScript", "JavaScript Module", "CommonJS"}:
        for match in re.finditer(r"from\s+['\"]([^'\"]+)['\"]|require\(['\"]([^'\"]+)['\"]\)", text):
            imports.add(match.group(1) or match.group(2))

    return sorted(i for i in imports if i)[:100]


def extract_dependencies_from_manifest(path: Path, text: str) -> list[str]:
    name = path.name.lower()
    deps: set[str] = set()

    if name == "package.json":
        try:
            data = json.loads(text)
            for key in ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]:
                if isinstance(data.get(key), dict):
                    deps.update(data[key].keys())
        except json.JSONDecodeError:
            pass

    elif name == "pyproject.toml":
        # Lightweight extraction, not a full TOML parser.
        for match in re.finditer(r"['\"]([A-Za-z0-9_.-]+)\s*(?:[<>=!~]=?.*)?['\"]", text):
            candidate = match.group(1)
            if len(candidate) > 1 and candidate.lower() not in {"name", "version", "description"}:
                deps.add(candidate)

    elif name in {"requirements.txt", "requirements-dev.txt"}:
        for line in text.splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or stripped.startswith("-"):
                continue
            package = re.split(r"[<>=!~\[]", stripped)[0].strip()
            if package:
                deps.add(package)

    elif name == "gemfile":
        for match in re.finditer(r"gem\s+['\"]([^'\"]+)['\"]", text):
            deps.add(match.group(1))

    return sorted(deps)[:200]


def detect_risk_flags(path: Path, text: Optional[str], is_binary: bool) -> list[str]:
    flags: list[str] = []
    name = path.name.lower()

    if name.startswith(".env") and name != ".env.example":
        flags.append("potential_local_env_file")
    if any(part.lower() in {"secret", "secrets", "private", "credentials"} for part in path.parts):
        flags.append("sensitive_path_name")
    if is_binary and path.stat().st_size > 5_000_000:
        flags.append("large_binary_file")
    if text:
        for pattern in SECRET_PATTERNS:
            if pattern.search(text):
                flags.append("possible_secret_pattern")
                break
    return sorted(set(flags))


def infer_topic(rel_path: str, extension: str, language: str, text: Optional[str]) -> str:
    tokens = tokenize_path(rel_path)
    token_blob = " ".join(tokens + [extension.lstrip("."), language.lower()])

    scores: dict[str, int] = defaultdict(int)
    for topic, hints in TOPIC_HINTS:
        for hint in hints:
            if hint in token_blob:
                scores[topic] += 2

    if text:
        lower = text[:20_000].lower()
        content_hints = {
            "tests": ["describe(", "it(", "pytest", "unittest", "expect(", "assert "],
            "frontend ui": ["react", "component", "jsx", "tsx", "useeffect", "usestate", "tailwind"],
            "backend api": ["express", "fastapi", "flask", "router", "endpoint", "request", "response"],
            "data model": ["schema", "migration", "database", "sql", "model", "table"],
            "auth/security": ["oauth", "jwt", "session", "permission", "password", "token"],
            "automation/devops": ["github actions", "docker", "deploy", "pipeline", "workflow"],
            "documentation": ["# ", "overview", "getting started", "installation", "usage"],
        }
        for topic, hints in content_hints.items():
            for hint in hints:
                if hint in lower:
                    scores[topic] += 1

    if scores:
        return sorted(scores.items(), key=lambda item: (-item[1], item[0]))[0][0]

    if language in {"Markdown", "MDX", "reStructuredText"}:
        return "documentation"
    if language in {"JSON", "YAML", "TOML", "INI"}:
        return "configuration"
    return "source/code" if language != "Unknown" else "uncategorized"


def infer_tags(
    rel_path: str,
    extension: str,
    language: str,
    topic: str,
    symbols: dict[str, list[str]],
    headings: list[str],
    imports: list[str],
    dependencies: list[str],
    risk_flags: list[str],
) -> list[str]:
    tags: set[str] = set()

    tags.add(topic.replace(" ", "-"))
    if language != "Unknown":
        tags.add(language.lower().replace(" ", "-"))
    if extension:
        tags.add(extension.lstrip(".").replace(".", "-"))

    tokens = tokenize_path(rel_path)
    for token in tokens:
        if token in {
            "api",
            "auth",
            "config",
            "docs",
            "test",
            "tests",
            "schema",
            "model",
            "route",
            "routes",
            "component",
            "components",
            "script",
            "scripts",
            "cli",
            "migration",
            "workflow",
            "github",
            "docker",
            "server",
            "client",
            "public",
            "src",
        }:
            tags.add(token)

    if symbols:
        tags.add("has-symbols")
    if headings:
        tags.add("has-headings")
    if imports:
        tags.add("has-imports")
    if dependencies:
        tags.add("dependency-manifest")
    if risk_flags:
        tags.add("review-sensitive")

    return sorted(tags)[:30]


def summarize_text(
    rel_path: str,
    language: str,
    topic: str,
    text: str,
    symbols: dict[str, list[str]],
    headings: list[str],
    imports: list[str],
    dependencies: list[str],
    max_chars: int,
    truncated_input: bool,
) -> str:
    path_note = f"{rel_path} appears to be a {language} file in the {topic} area."

    pieces: list[str] = [path_note]

    if headings:
        pieces.append("Main headings: " + "; ".join(headings[:8]) + ".")

    symbol_bits = []
    for label, values in symbols.items():
        clean_label = label.replace("_", " ")
        symbol_bits.append(f"{clean_label}: {', '.join(values[:12])}")
    if symbol_bits:
        pieces.append("Notable symbols include " + "; ".join(symbol_bits[:5]) + ".")

    if imports:
        pieces.append("Imports/references include: " + ", ".join(imports[:15]) + ".")

    if dependencies:
        pieces.append("Declared dependencies include: " + ", ".join(dependencies[:20]) + ".")

    # Prefer docstrings/comments/headings before raw code lines.
    docstring_match = re.search(r'"""(.*?)"""|\'\'\'(.*?)\'\'\'', text, re.DOTALL)
    if docstring_match:
        doc = compact_spaces(docstring_match.group(1) or docstring_match.group(2) or "")
        if doc:
            pieces.append("Embedded description: " + truncate(doc, 500))
    else:
        sentences = sentence_split(text[:3000])
        meaningful = []
        for sentence in sentences:
            if len(sentence) < 20:
                continue
            if re.match(r"^[{}();,\[\]<>]+$", sentence):
                continue
            meaningful.append(sentence)
            if len(meaningful) >= 3:
                break
        if meaningful:
            pieces.append("Opening content signal: " + truncate(" ".join(meaningful), 500))
        else:
            lines = first_meaningful_lines(text, limit=4)
            if lines:
                pieces.append("Opening lines: " + truncate(" / ".join(lines), 500))

    if truncated_input:
        pieces.append("Summary was generated from the beginning of a file that exceeded the scan byte limit.")

    return truncate(" ".join(pieces), max_chars)


def notes_for_ai(record: FileRecord) -> str:
    notes = []
    if record.risk_flags:
        notes.append("Review before sharing externally because sensitive-looking patterns or paths were detected.")
    if record.topic in {"configuration", "automation/devops"}:
        notes.append("Useful for understanding setup, runtime behavior, or deployment context.")
    if record.topic == "tests":
        notes.append("Useful for inferring expected behavior and edge cases.")
    if record.topic == "documentation":
        notes.append("Useful as human-authored orientation material.")
    if record.symbols:
        notes.append("Contains named symbols that can anchor code navigation and discussion.")
    if not notes:
        notes.append("Use path, topic, tags, and summary as orientation signals before opening the file.")
    return " ".join(notes)


# -----------------------------------------------------------------------------
# Chunking
# -----------------------------------------------------------------------------

def chunk_text(text: str, max_chars: int) -> list[str]:
    if max_chars <= 0 or len(text) <= max_chars:
        return [text] if text else []

    paragraphs = re.split(r"\n{2,}", text)
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        if len(paragraph) > max_chars:
            if current:
                chunks.append("\n\n".join(current).strip())
                current = []
                current_len = 0
            start = 0
            while start < len(paragraph):
                end = min(start + max_chars, len(paragraph))
                split = paragraph.rfind("\n", start, end)
                if split <= start:
                    split = paragraph.rfind(" ", start, end)
                if split <= start:
                    split = end
                chunks.append(paragraph[start:split].strip())
                start = split
            continue

        proposed = current_len + len(paragraph) + 2
        if proposed > max_chars and current:
            chunks.append("\n\n".join(current).strip())
            current = [paragraph]
            current_len = len(paragraph)
        else:
            current.append(paragraph)
            current_len = proposed

    if current:
        chunks.append("\n\n".join(current).strip())

    return [chunk for chunk in chunks if chunk]


def write_chunks(
    out_dir: Path,
    repo_root: Path,
    rel_path: str,
    text: str,
    record: FileRecord,
    max_chunk_chars: int,
) -> int:
    chunks = chunk_text(text, max_chunk_chars)
    if not chunks:
        return 0

    chunk_root = out_dir / "chunks"
    chunk_root.mkdir(parents=True, exist_ok=True)
    safe_base = re.sub(r"[^A-Za-z0-9_.-]+", "__", rel_path).strip("_") or "root"

    for index, chunk in enumerate(chunks, start=1):
        chunk_path = chunk_root / f"{safe_base}__chunk_{index:04d}.txt"
        metadata = {
            "source_path": rel_path,
            "repo_root": str(repo_root),
            "chunk_number": index,
            "total_chunks": len(chunks),
            "sha256": record.sha256,
            "language": record.language,
            "topic": record.topic,
            "tags": record.tags,
            "summary": record.summary,
        }
        chunk_path.write_text(
            "--- METADATA ---\n"
            + json.dumps(metadata, ensure_ascii=False, indent=2)
            + "\n--- CONTENT ---\n\n"
            + chunk,
            encoding="utf-8",
        )

    return len(chunks)


# -----------------------------------------------------------------------------
# Repo traversal and cataloging
# -----------------------------------------------------------------------------

def git_info(repo_root: Path) -> dict[str, str]:
    def run_git(args: list[str]) -> str:
        try:
            return subprocess.check_output(
                ["git", "-C", str(repo_root), *args],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=5,
            ).strip()
        except Exception:
            return ""

    return {
        "is_git_repo": "true" if (repo_root / ".git").exists() else "false",
        "branch": run_git(["rev-parse", "--abbrev-ref", "HEAD"]),
        "commit": run_git(["rev-parse", "HEAD"]),
        "remote_origin": run_git(["remote", "get-url", "origin"]),
        "dirty_status": run_git(["status", "--short"]),
    }


def resolve_repo_root(repo_arg: Optional[str]) -> Path:
    """Resolve the repository root from an explicit path or the current working directory."""
    if repo_arg:
        return Path(repo_arg).expanduser().resolve()

    cwd = Path.cwd().resolve()
    try:
        git_root = subprocess.check_output(
            ["git", "-C", str(cwd), "rev-parse", "--show-toplevel"],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=5,
        ).strip()
        if git_root:
            return Path(git_root).resolve()
    except Exception:
        pass
    return cwd


def resolve_output_dir(repo_root: Path, out_arg: str) -> Path:
    """Resolve the output directory relative to the repo root unless an absolute path is given."""
    out_path = Path(out_arg).expanduser()
    if out_path.is_absolute():
        return out_path.resolve()
    return (repo_root / out_path).resolve()


def should_skip_path(
    path: Path,
    repo_root: Path,
    ignore_matcher: IgnoreMatcher,
    include_hidden: bool,
    exclude_dirs: set[str],
    exclude_files: set[str],
    extra_exclude: list[str],
    skip_roots: Optional[list[Path]] = None,
) -> bool:
    rel = path.resolve().relative_to(repo_root.resolve()).as_posix()
    name = path.name

    if skip_roots:
        resolved_path = path.resolve()
        for skip_root in skip_roots:
            try:
                resolved_path.relative_to(skip_root.resolve())
                return True
            except ValueError:
                continue

    if path.is_dir():
        if name in exclude_dirs:
            return True
        if not include_hidden and name.startswith(".") and name != ".github":
            return True
    else:
        if name in exclude_files:
            return True
        if not include_hidden and name.startswith(".") and name not in {".gitignore", ".gitattributes", ".editorconfig"}:
            return True

    if ignore_matcher.ignored(path):
        return True

    for pattern in extra_exclude:
        if fnmatch.fnmatch(rel, pattern) or fnmatch.fnmatch(name, pattern):
            return True

    return False


def iter_files(
    repo_root: Path,
    ignore_matcher: IgnoreMatcher,
    include_hidden: bool,
    exclude_dirs: set[str],
    exclude_files: set[str],
    extra_exclude: list[str],
    skip_roots: Optional[list[Path]] = None,
) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(repo_root):
        current = Path(dirpath)

        # Mutate dirnames in-place so os.walk does not descend into skipped dirs.
        kept_dirs = []
        for dirname in dirnames:
            candidate = current / dirname
            if not should_skip_path(
                candidate,
                repo_root,
                ignore_matcher,
                include_hidden,
                exclude_dirs,
                exclude_files,
                extra_exclude,
                skip_roots=skip_roots,
            ):
                kept_dirs.append(dirname)
        dirnames[:] = kept_dirs

        for filename in filenames:
            candidate = current / filename
            if not should_skip_path(
                candidate,
                repo_root,
                ignore_matcher,
                include_hidden,
                exclude_dirs,
                exclude_files,
                extra_exclude,
                skip_roots=skip_roots,
            ):
                yield candidate


def process_file(path: Path, repo_root: Path, args: argparse.Namespace) -> tuple[FileRecord, Optional[str]]:
    rel_path = path.resolve().relative_to(repo_root.resolve()).as_posix()
    stat = path.stat()
    ext = extension_of(path)
    mime_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    binary = is_probably_binary(path)
    text: Optional[str] = None
    truncated_input = False

    # Treat known text extensions as text unless binary check strongly disagrees.
    known_text = ext in TEXT_EXTENSIONS or ext in {"dockerfile", "makefile"}
    is_text = known_text or not binary

    if is_text and stat.st_size <= args.max_file_bytes:
        try:
            text, truncated_input = safe_read_text(path, args.max_file_bytes)
        except OSError:
            text = None
            is_text = False
            binary = True
    elif is_text and stat.st_size > args.max_file_bytes:
        try:
            text, truncated_input = safe_read_text(path, args.max_file_bytes)
        except OSError:
            text = None
            is_text = False
            binary = True

    language = infer_language(path, ext, text)
    symbols = extract_symbols(text) if text else {}
    headings = extract_headings(text) if text else []
    imports = extract_imports(text, language) if text else []
    dependencies = extract_dependencies_from_manifest(path, text) if text else []
    topic = infer_topic(rel_path, ext, language, text)
    risk_flags = detect_risk_flags(path, text, binary)
    tags = infer_tags(rel_path, ext, language, topic, symbols, headings, imports, dependencies, risk_flags)

    if text:
        line_count = text.count("\n") + (1 if text else 0)
        char_count = len(text)
        word_count = len(re.findall(r"\w+", text))
        summary = summarize_text(
            rel_path=rel_path,
            language=language,
            topic=topic,
            text=text,
            symbols=symbols,
            headings=headings,
            imports=imports,
            dependencies=dependencies,
            max_chars=args.max_summary_chars,
            truncated_input=truncated_input,
        )
    else:
        line_count = None
        char_count = None
        word_count = None
        summary = f"{rel_path} appears to be a binary or unreadable file. Metadata only."

    record = FileRecord(
        path=rel_path,
        name=path.name,
        extension=ext,
        mime_type=mime_type,
        language=language,
        topic=topic,
        tags=tags,
        summary=summary,
        size_bytes=stat.st_size,
        modified_utc=file_modified_utc(path),
        sha256=sha256_file(path),
        is_text=bool(text),
        is_binary=binary,
        line_count=line_count,
        char_count=char_count,
        word_count=word_count,
        symbols=symbols,
        headings=headings,
        imports=imports,
        dependencies=dependencies,
        risk_flags=risk_flags,
    )
    record.notes_for_ai = notes_for_ai(record)

    return record, text


def build_manifest(args: argparse.Namespace) -> RepoManifest:
    repo_root = resolve_repo_root(args.repo)
    if not repo_root.exists() or not repo_root.is_dir():
        raise ValueError(f"Repo path does not exist or is not a directory: {repo_root}")

    out_dir = resolve_output_dir(repo_root, args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    ignore_matcher = IgnoreMatcher(repo_root, include_gitignore=not args.no_gitignore)
    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS) | set(args.exclude_dir or [])
    exclude_files = set(DEFAULT_EXCLUDE_FILES) | set(args.exclude_file or [])
    extra_exclude = args.exclude or []
    skip_roots: list[Path] = []

    # Avoid cataloging the current output directory if it lives inside the repo.
    if out_dir != repo_root:
        try:
            out_dir.relative_to(repo_root)
        except ValueError:
            pass
        else:
            skip_roots.append(out_dir)
    else:
        # If the output is the repo root itself, skip the generated artifacts by name.
        exclude_dirs |= {"chunks"}
        exclude_files |= {"manifest.json", "manifest.records.jsonl", "manifest.csv", "MANIFEST.md"}

    records: list[FileRecord] = []

    files = list(
        iter_files(
            repo_root,
            ignore_matcher,
            args.include_hidden,
            exclude_dirs,
            exclude_files,
            extra_exclude,
            skip_roots=skip_roots,
        )
    )
    total = len(files)

    for idx, path in enumerate(files, start=1):
        if not args.quiet:
            print(f"[{idx}/{total}] {path.relative_to(repo_root).as_posix()}")
        try:
            record, text = process_file(path, repo_root, args)
            if args.write_chunks and text:
                record.chunk_count = write_chunks(out_dir, repo_root, record.path, text, record, args.max_chunk_chars)
            records.append(record)
        except Exception as exc:
            rel_path = path.resolve().relative_to(repo_root.resolve()).as_posix()
            fallback = FileRecord(
                path=rel_path,
                name=path.name,
                extension=extension_of(path),
                mime_type=mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                language="Unknown",
                topic="error",
                tags=["error"],
                summary=f"Failed to process file: {exc}",
                size_bytes=path.stat().st_size if path.exists() else 0,
                modified_utc=file_modified_utc(path) if path.exists() else "",
                sha256="",
                is_text=False,
                is_binary=True,
                risk_flags=["processing_error"],
                notes_for_ai="Open manually if needed; automatic cataloging failed for this file.",
            )
            records.append(fallback)

    language_counts = Counter(record.language for record in records)
    topic_counts = Counter(record.topic for record in records)
    tag_counts = Counter(tag for record in records for tag in record.tags)

    totals = {
        "files": len(records),
        "text_files": sum(1 for r in records if r.is_text),
        "binary_files": sum(1 for r in records if r.is_binary),
        "bytes": sum(r.size_bytes for r in records),
        "chunks": sum(r.chunk_count for r in records),
        "risk_flagged_files": sum(1 for r in records if r.risk_flags),
    }

    return RepoManifest(
        manifest_version="1.0.0",
        generated_utc=utc_now_iso(),
        repo_root=str(repo_root),
        repo_name=repo_root.name,
        git=git_info(repo_root),
        totals=totals,
        language_breakdown=dict(language_counts.most_common()),
        topic_breakdown=dict(topic_counts.most_common()),
        tag_breakdown=dict(tag_counts.most_common(100)),
        records=records,
    )


# -----------------------------------------------------------------------------
# Writers
# -----------------------------------------------------------------------------

def manifest_to_dict(manifest: RepoManifest) -> dict:
    data = asdict(manifest)
    # Keep records sorted for stable diffing.
    data["records"] = sorted(data["records"], key=lambda r: r["path"])
    return data


def write_json(out_dir: Path, manifest: RepoManifest) -> None:
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest_to_dict(manifest), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def write_jsonl(out_dir: Path, manifest: RepoManifest) -> None:
    with (out_dir / "manifest.records.jsonl").open("w", encoding="utf-8") as f:
        for record in sorted(manifest.records, key=lambda r: r.path):
            f.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")


def write_csv(out_dir: Path, manifest: RepoManifest) -> None:
    fields = [
        "path",
        "name",
        "extension",
        "language",
        "topic",
        "tags",
        "summary",
        "size_bytes",
        "modified_utc",
        "sha256",
        "is_text",
        "is_binary",
        "line_count",
        "word_count",
        "imports",
        "dependencies",
        "risk_flags",
        "chunk_count",
        "notes_for_ai",
    ]
    with (out_dir / "manifest.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for record in sorted(manifest.records, key=lambda r: r.path):
            row = asdict(record)
            for key in ["tags", "imports", "dependencies", "risk_flags"]:
                row[key] = "; ".join(row.get(key) or [])
            writer.writerow({field: row.get(field, "") for field in fields})


def write_markdown(out_dir: Path, manifest: RepoManifest) -> None:
    lines: list[str] = []
    lines.append(f"# Repository Manifest: {manifest.repo_name}")
    lines.append("")
    lines.append(f"Generated: `{manifest.generated_utc}`")
    lines.append(f"Repo root: `{manifest.repo_root}`")
    lines.append("")

    if manifest.git.get("is_git_repo") == "true":
        lines.append("## Git")
        lines.append("")
        lines.append(f"- Branch: `{manifest.git.get('branch', '')}`")
        lines.append(f"- Commit: `{manifest.git.get('commit', '')}`")
        remote = manifest.git.get("remote_origin", "")
        if remote:
            lines.append(f"- Remote: `{remote}`")
        dirty = manifest.git.get("dirty_status", "")
        lines.append(f"- Dirty working tree: `{'yes' if dirty else 'no'}`")
        lines.append("")

    lines.append("## Totals")
    lines.append("")
    for key, value in manifest.totals.items():
        lines.append(f"- {key.replace('_', ' ').title()}: `{value}`")
    lines.append("")

    lines.append("## Topic Breakdown")
    lines.append("")
    for topic, count in manifest.topic_breakdown.items():
        lines.append(f"- `{topic}`: {count}")
    lines.append("")

    lines.append("## Language Breakdown")
    lines.append("")
    for language, count in manifest.language_breakdown.items():
        lines.append(f"- `{language}`: {count}")
    lines.append("")

    lines.append("## Files")
    lines.append("")
    for record in sorted(manifest.records, key=lambda r: r.path):
        risk = " ⚠️" if record.risk_flags else ""
        lines.append(f"### `{record.path}`{risk}")
        lines.append("")
        lines.append(f"- Topic: `{record.topic}`")
        lines.append(f"- Language: `{record.language}`")
        lines.append(f"- Tags: {', '.join(f'`{tag}`' for tag in record.tags) if record.tags else '_none_'}")
        lines.append(f"- Size: `{record.size_bytes}` bytes")
        lines.append(f"- SHA-256: `{record.sha256}`")
        if record.risk_flags:
            lines.append(f"- Risk flags: {', '.join(f'`{flag}`' for flag in record.risk_flags)}")
        lines.append("")
        lines.append(record.summary or "No summary available.")
        lines.append("")
        if record.notes_for_ai:
            lines.append(f"AI note: {record.notes_for_ai}")
            lines.append("")

    (out_dir / "MANIFEST.md").write_text("\n".join(lines), encoding="utf-8")


def write_all_outputs(out_dir: Path, manifest: RepoManifest) -> None:
    write_json(out_dir, manifest)
    write_jsonl(out_dir, manifest)
    write_csv(out_dir, manifest)
    write_markdown(out_dir, manifest)


# -----------------------------------------------------------------------------
# CLI
# -----------------------------------------------------------------------------

def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create an AI-readable manifest/catalog for any repo or directory.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--repo",
        default=None,
        help="Path to repository or directory to catalog. Defaults to the current directory or enclosing git root.",
    )
    parser.add_argument("--out", default="repo_catalog/", help="Output directory for manifest files, relative to the repo root unless absolute.")
    parser.add_argument("--max-file-bytes", type=int, default=1_500_000, help="Max bytes to read per text file for summary/signals.")
    parser.add_argument("--max-summary-chars", type=int, default=1200, help="Max characters for each file summary.")
    parser.add_argument("--write-chunks", action="store_true", help="Write per-file text chunks for downstream ingestion.")
    parser.add_argument("--max-chunk-chars", type=int, default=12_000, help="Max characters per output chunk when --write-chunks is enabled.")
    parser.add_argument("--include-hidden", action="store_true", help="Include hidden files/folders except hard-excluded dirs like .git.")
    parser.add_argument("--no-gitignore", action="store_true", help="Do not respect root .gitignore.")
    parser.add_argument("--exclude", action="append", default=[], help="Extra glob pattern to exclude. Can be repeated.")
    parser.add_argument("--exclude-dir", action="append", default=[], help="Extra directory name to exclude. Can be repeated.")
    parser.add_argument("--exclude-file", action="append", default=[], help="Extra file name to exclude. Can be repeated.")
    parser.add_argument("--quiet", action="store_true", help="Suppress per-file progress output.")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    repo_root = resolve_repo_root(args.repo)
    args.repo = str(repo_root)
    out_dir = resolve_output_dir(repo_root, args.out)

    try:
        manifest = build_manifest(args)
        write_all_outputs(out_dir, manifest)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print("")
    print("Catalog complete.")
    print(f"Repo: {repo_root}")
    print(f"Output: {out_dir}")
    print(f"Files cataloged: {manifest.totals['files']}")
    print(f"Text files: {manifest.totals['text_files']}")
    print(f"Binary files: {manifest.totals['binary_files']}")
    print(f"Risk-flagged files: {manifest.totals['risk_flagged_files']}")
    print("")
    print("Generated:")
    print(f"- {out_dir / 'manifest.json'}")
    print(f"- {out_dir / 'manifest.records.jsonl'}")
    print(f"- {out_dir / 'manifest.csv'}")
    print(f"- {out_dir / 'MANIFEST.md'}")
    if args.write_chunks:
        print(f"- {out_dir / 'chunks'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
