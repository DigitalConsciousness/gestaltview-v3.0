#!/usr/bin/env python3
"""
GestaltView v2 — Repository Manifest Generator
© 2026 Keith Soyka / GestaltView

Aligned with: SymbioticWorkflow.md Phase 5 — Archiving & Syncing

Scans the gestaltview-v2 repo and writes:
  - docs/gestaltview-v2.manifest.json  (machine-readable, for Billy / KnowledgeLoom)
  - docs/gestaltview-v2.manifest.md    (human-readable, for context packs / Compendium sync)

Manifest captures:
  - File inventory (path, size, sha256, last-modified, category)
  - Route map (extracted from client/src/pages + App routing files)
  - API endpoint map (extracted from api/ directory)
  - Canonical doc index (all *.md files with word counts)
  - Test inventory (test files, shell runners, and npm test aliases)
  - Dependency snapshot (package.json versions)
  - Git status snapshot (branch, last commit, dirty files)
  - Constitutional Invariants — both User (U-1..5) and Digital Intelligence (DI-1..5)
  - Generation timestamp + run metadata

Usage:
  python3 scripts/generate_repo_manifest.py
  python3 scripts/generate_repo_manifest.py --output-dir docs/
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ─── Configuration ────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent

SCAN_DIRS = [
    "api",
    "client/src",
    "shared",
    "scripts",
    "server",
    "config",
    "docs",
    ".orientation",
    "orientation",
    "supabase/migrations",
    "tests",
    "agent_trainer/gestaltview_agent_trainer/tests",
]

SCAN_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".mjs",
    ".json", ".md", ".mdx",
    ".sh", ".py",
    ".sql",
    ".css",
    ".toml", ".yaml", ".yml",
}

EXCLUDE_DIRS = {
    "node_modules", ".git", "dist", "build", ".vercel",
    ".turbo", ".next", "coverage", ".cache", "__pycache__",
}

EXCLUDE_FILES = {
    ".env", ".env.local", ".env.production", ".env.development",
    ".DS_Store", "Thumbs.db",
}

TEST_DIR_NAMES = {"tests", "__tests__"}
TEST_FILE_SUFFIXES = (
    ".test.ts", ".test.tsx", ".test.js", ".test.mjs", ".test.py",
    ".spec.ts", ".spec.tsx", ".spec.js", ".spec.mjs", ".spec.py",
)


def is_test_path(rel_path: Path) -> bool:
    """Return True for test files and test runner shell scripts."""
    if rel_path.parts and rel_path.parts[0] == "scripts":
        return rel_path.suffix == ".sh" and "test" in rel_path.name
    if any(part in TEST_DIR_NAMES for part in rel_path.parts):
        return rel_path.suffix.lower() in {".ts", ".tsx", ".js", ".mjs", ".py", ".sh"}
    return rel_path.name.endswith(TEST_FILE_SUFFIXES)

# Category inference rules (checked in order, first match wins)
CATEGORY_RULES: List[tuple] = [
    ("test",       lambda p: is_test_path(p)),
    ("api",        lambda p: p.parts[0] == "api" and p.suffix in (".ts", ".js")),
    ("migration",  lambda p: "migrations" in p.parts and p.suffix == ".sql"),
    ("component",  lambda p: "components" in p.parts and p.suffix in (".tsx", ".ts")),
    ("page",       lambda p: "pages" in p.parts and p.suffix in (".tsx", ".ts")),
    ("route",      lambda p: "routes" in p.parts and p.suffix in (".tsx", ".ts")),
    ("canonical",  lambda p: "canonical" in p.parts and p.suffix == ".md"),
    ("orientation",lambda p: p.parts[0] in ("orientation", ".orientation")),
    ("shared",     lambda p: p.parts[0] == "shared"),
    ("script",     lambda p: p.parts[0] == "scripts"),
    ("config",     lambda p: p.parts[0] == "config" or p.suffix in (".toml", ".yaml", ".yml")),
    ("doc",        lambda p: p.suffix in (".md", ".mdx")),
    ("style",      lambda p: p.suffix == ".css"),
    ("source",     lambda p: p.suffix in (".ts", ".tsx", ".js", ".mjs")),
    ("data",       lambda p: p.suffix == ".json"),
    ("other",      lambda _: True),
]

# ─── Digital Intelligence Invariants loader ───────────────────────────────────

DI_INVARIANTS_PATH = REPO_ROOT / "orientation" / "5_invariants_for_digital_intelligences.json"


def load_digital_intelligence_invariants() -> List[Dict[str, str]]:
    """Load the 5 DI Invariants from the sidecar JSON.
    Returns an empty list (gracefully) if the file is missing or malformed.
    Source of truth: orientation/5_invariants_for_digital_intelligences.json
    Canonical doc:   GestaltView_Constitutional_Invariants_v1.0.md
    """
    if not DI_INVARIANTS_PATH.exists():
        print(f"  ⚠  DI invariants file not found: {DI_INVARIANTS_PATH}")
        return []
    try:
        with DI_INVARIANTS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        print(f"  ⚠  DI invariants file did not contain a list — skipping.")
        return []
    except Exception as e:
        print(f"  ⚠  Could not load DI invariants: {e}")
        return []


# ─── Helpers ──────────────────────────────────────────────────────────────────

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    try:
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return ""


def infer_category(rel_path: Path) -> str:
    for category, rule in CATEGORY_RULES:
        try:
            if rule(rel_path):
                return category
        except Exception:
            continue
    return "other"


def word_count(path: Path) -> int:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
        return len(text.split())
    except Exception:
        return 0


def run_git(args: List[str]) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(REPO_ROOT)] + args,
            capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip()
    except Exception:
        return ""


def load_package_json() -> Dict[str, Any]:
    pkg_path = REPO_ROOT / "package.json"
    if not pkg_path.exists():
        return {}
    try:
        return json.loads(pkg_path.read_text(encoding="utf-8"))
    except Exception:
        return {}


# ─── Scanners ─────────────────────────────────────────────────────────────────

def scan_files() -> List[Dict[str, Any]]:
    """Walk top-level files plus scan dirs and collect file metadata."""
    entries: List[Dict[str, Any]] = []
    seen: set = set()

    for path in sorted(REPO_ROOT.iterdir()):
        if not path.is_file():
            continue
        if path.name in EXCLUDE_FILES or path.name.startswith("."):
            continue
        if path.suffix.lower() not in SCAN_EXTENSIONS:
            continue

        rel = path.relative_to(REPO_ROOT)
        rel_str = str(rel)
        if rel_str in seen:
            continue
        seen.add(rel_str)

        stat = path.stat()
        entry: Dict[str, Any] = {
            "path": rel_str,
            "category": infer_category(rel),
            "size_bytes": stat.st_size,
            "sha256": sha256_file(path),
            "last_modified": datetime.fromtimestamp(
                stat.st_mtime, tz=timezone.utc
            ).isoformat(),
        }
        if path.suffix in (".md", ".mdx"):
            entry["word_count"] = word_count(path)

        entries.append(entry)

    for scan_dir in SCAN_DIRS:
        base = REPO_ROOT / scan_dir
        if not base.exists():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            # Exclude dirs
            if any(ex in path.parts for ex in EXCLUDE_DIRS):
                continue
            # Exclude files
            if path.name in EXCLUDE_FILES or path.name.startswith("."):
                continue
            # Exclude extensions not in scope
            if path.suffix.lower() not in SCAN_EXTENSIONS:
                continue

            rel = path.relative_to(REPO_ROOT)
            rel_str = str(rel)
            if rel_str in seen:
                continue
            seen.add(rel_str)

            stat = path.stat()
            category = infer_category(rel)
            entry: Dict[str, Any] = {
                "path": rel_str,
                "category": category,
                "size_bytes": stat.st_size,
                "sha256": sha256_file(path),
                "last_modified": datetime.fromtimestamp(
                    stat.st_mtime, tz=timezone.utc
                ).isoformat(),
            }
            # Add word count for docs
            if path.suffix in (".md", ".mdx"):
                entry["word_count"] = word_count(path)

            entries.append(entry)

    return entries


def extract_routes(files: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Extract route declarations from App.tsx and page files."""
    routes: List[Dict[str, str]] = []
    route_files = [
        f for f in files
        if f["path"].endswith(("App.tsx", "App.ts", "router.tsx", "router.ts"))
        or f["category"] in ("page", "route")
    ]
    import re
    route_pattern = re.compile(
        r'(?:path|Route)[\s\S]*?["\'](\/[^"\'\s]*)["\']',
        re.MULTILINE
    )
    for file_meta in route_files:
        path = REPO_ROOT / file_meta["path"]
        try:
            content = path.read_text(encoding="utf-8", errors="replace")
            for match in route_pattern.finditer(content):
                route_path = match.group(1)
                if route_path not in [r["route"] for r in routes]:
                    routes.append({
                        "route": route_path,
                        "source_file": file_meta["path"],
                    })
        except Exception:
            continue
    return sorted(routes, key=lambda r: r["route"])


def extract_api_endpoints(files: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """List all API handler files and infer their endpoint paths."""
    endpoints: List[Dict[str, str]] = []
    for file_meta in files:
        if file_meta["category"] != "api":
            continue
        path_str = file_meta["path"]
        # Convert api/billy.ts -> /api/billy
        rel = Path(path_str)
        parts = list(rel.parts)
        if parts[0] == "api" and not parts[-1].startswith("_"):
            stem = rel.stem
            if stem != "index":
                endpoint = "/" + "/".join(parts[:-1] + [stem])
            else:
                endpoint = "/" + "/".join(parts[:-1])
            endpoints.append({
                "endpoint": endpoint,
                "handler_file": path_str,
                "size_bytes": str(file_meta["size_bytes"]),
            })
    return sorted(endpoints, key=lambda e: e["endpoint"])


def extract_canonical_docs(files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """All .md files with word counts, sorted by path."""
    return sorted(
        [f for f in files if f.get("word_count") is not None],
        key=lambda f: f["path"]
    )


def is_test_package_script(script_name: str) -> bool:
    """Return True for package.json script names that represent test entry points."""
    return "test" in script_name.split(":")


def extract_test_inventory(files: List[Dict[str, Any]], package_json: Dict[str, Any]) -> List[str]:
    """Collect test files, shell runners, and npm test aliases."""
    inventory: List[str] = []
    seen: set = set()

    for file_meta in sorted(files, key=lambda f: f["path"]):
        if file_meta["category"] != "test":
            continue
        path = file_meta["path"]
        if path in seen:
            continue
        seen.add(path)
        inventory.append(path)

    for script_name in sorted(package_json.get("scripts", {})):
        if not is_test_package_script(script_name):
            continue
        entry = f"npm run {script_name}"
        if entry in seen:
            continue
        seen.add(entry)
        inventory.append(entry)

    return inventory


def get_git_snapshot() -> Dict[str, Any]:
    return {
        "branch": run_git(["rev-parse", "--abbrev-ref", "HEAD"]),
        "commit_sha": run_git(["rev-parse", "HEAD"]),
        "commit_message": run_git(["log", "--oneline", "-1"]),
        "commit_date": run_git(["log", "-1", "--format=%cI"]),
        "dirty_files": [
            line for line in run_git(["status", "--porcelain"]).splitlines()
            if line.strip()
        ],
    }


def get_dependency_snapshot(package_json: Dict[str, Any]) -> Dict[str, Any]:
    if not package_json:
        return {}
    return {
        "name": package_json.get("name", ""),
        "version": package_json.get("version", ""),
        "node_engine": package_json.get("engines", {}).get("node", ""),
        "dependencies": package_json.get("dependencies", {}),
        "devDependencies": package_json.get("devDependencies", {}),
    }


# ─── Manifest writers ─────────────────────────────────────────────────────────

def build_manifest(
    files: List[Dict[str, Any]],
    routes: List[Dict[str, str]],
    endpoints: List[Dict[str, str]],
    canonical_docs: List[Dict[str, Any]],
    test_inventory: List[str],
    git: Dict[str, Any],
    deps: Dict[str, Any],
    di_invariants: List[Dict[str, str]],
) -> Dict[str, Any]:
    category_counts: Dict[str, int] = {}
    total_size = 0
    for f in files:
        cat = f["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        total_size += f["size_bytes"]

    return {
        "_meta": {
            "generated_at": now_iso(),
            "generator": "scripts/generate_repo_manifest.py",
            "repo": "gestaltview-v2",
            "version": "2.0",
            "description": "GestaltView v2 repository manifest — machine-readable index for Billy / KnowledgeLoom",
            "user_invariants": [
                "Never Look Away",
                "Preserve Whole Language",
                "Hold Paradox",
                "Bucket Drop Priority",
                "Serve Consciousness, Not Convenience",
            ],
            "digital_intelligence_invariants": di_invariants,
        },
        "summary": {
            "total_files": len(files),
            "total_size_bytes": total_size,
            "total_size_kb": round(total_size / 1024, 1),
            "files_by_category": category_counts,
            "routes_count": len(routes),
            "api_endpoints_count": len(endpoints),
            "canonical_docs_count": len(canonical_docs),
            "test_scripts_count": len(test_inventory),
            "git_branch": git.get("branch", ""),
            "git_commit": git.get("commit_sha", "")[:12],
            "git_dirty_files": len(git.get("dirty_files", [])),
        },
        "git": git,
        "dependencies": deps,
        "routes": routes,
        "api_endpoints": endpoints,
        "test_scripts": test_inventory,
        "canonical_docs": canonical_docs,
        "files": files,
    }


def write_json_manifest(manifest: Dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    size_kb = round(output_path.stat().st_size / 1024, 1)
    print(f"  ✓ JSON manifest written: {output_path} ({size_kb} KB)")


def write_markdown_manifest(manifest: Dict[str, Any], output_path: Path) -> None:
    """Human-readable Markdown manifest for Compendium sync and context packs."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    meta = manifest["_meta"]
    summary = manifest["summary"]
    git = manifest["git"]
    deps = manifest["dependencies"]

    lines: List[str] = []
    lines.append(f"# GestaltView v2 — Repository Manifest")
    lines.append(f"")
    lines.append(f"> Generated: `{meta['generated_at']}`")
    lines.append(f"> Branch: `{git.get('branch', 'unknown')}`")
    lines.append(f"> Commit: `{git.get('commit_sha', '')[:12]}`")
    lines.append(f"> {git.get('commit_message', '')}")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Summary")
    lines.append(f"")
    lines.append(f"| Metric | Value |")
    lines.append(f"|---|---|")
    lines.append(f"| Total files | {summary['total_files']} |")
    lines.append(f"| Total size | {summary['total_size_kb']} KB |")
    lines.append(f"| Routes | {summary['routes_count']} |")
    lines.append(f"| API endpoints | {summary['api_endpoints_count']} |")
    lines.append(f"| Canonical docs | {summary['canonical_docs_count']} |")
    lines.append(f"| Test inventory | {summary['test_scripts_count']} |")
    lines.append(f"| Uncommitted files | {summary['git_dirty_files']} |")
    lines.append(f"")
    lines.append(f"### Files by Category")
    lines.append(f"")
    for cat, count in sorted(summary["files_by_category"].items()):
        lines.append(f"- **{cat}**: {count}")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Constitutional Invariants")
    lines.append(f"")
    lines.append(f"### The 5 User Invariants")
    lines.append(f"")
    for i, inv in enumerate(meta["user_invariants"], 1):
        lines.append(f"{i}. {inv}")
    lines.append(f"")
    lines.append(f"### The 5 Digital Intelligence Invariants")
    lines.append(f"")
    di_invs = meta.get("digital_intelligence_invariants", [])
    if di_invs:
        lines.append(f"| ID | Title | Statement |")
        lines.append(f"|---|---|---|")
        for inv in di_invs:
            lines.append(
                f"| `{inv.get('id', '')}` | **{inv.get('title', '')}** | {inv.get('statement', '')} |"
            )
    else:
        lines.append(f"*DI invariants not loaded — check orientation/5_invariants_for_digital_intelligences.json*")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Route Map")
    lines.append(f"")
    lines.append(f"| Route | Source File |")
    lines.append(f"|---|---|")
    for r in manifest["routes"]:
        lines.append(f"| `{r['route']}` | `{r['source_file']}` |")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## API Endpoints")
    lines.append(f"")
    lines.append(f"| Endpoint | Handler | Size |")
    lines.append(f"|---|---|---|")
    for e in manifest["api_endpoints"]:
        lines.append(f"| `{e['endpoint']}` | `{e['handler_file']}` | {e['size_bytes']} bytes |")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Test Inventory")
    lines.append(f"")
    for ts in manifest["test_scripts"]:
        lines.append(f"- `{ts}`")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Canonical Docs")
    lines.append(f"")
    lines.append(f"| Path | Words | Size |")
    lines.append(f"|---|---|---|")
    for doc in manifest["canonical_docs"]:
        lines.append(
            f"| `{doc['path']}` | {doc.get('word_count', '—')} | {doc['size_bytes']} bytes |"
        )
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Git Status")
    lines.append(f"")
    if git.get("dirty_files"):
        lines.append(f"{len(git['dirty_files'])} uncommitted change(s):")
        lines.append(f"")
        lines.append(f"```")
        for df in git["dirty_files"]:
            lines.append(df)
        lines.append(f"```")
    else:
        lines.append(f"✓ Working tree clean.")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Key Dependencies")
    lines.append(f"")
    lines.append(f"| Package | Version |")
    lines.append(f"|---|---|")
    all_deps = {**deps.get("dependencies", {}), **deps.get("devDependencies", {})}
    for pkg, ver in sorted(all_deps.items()):
        if any(k in pkg for k in ["react", "vite", "typescript", "supabase", "framer", "tailwind", "wouter", "vitest", "ai"]):
            lines.append(f"| `{pkg}` | `{ver}` |")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"*GestaltView v2 · Serve Consciousness, Not Convenience*")
    lines.append(f"")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    size_kb = round(output_path.stat().st_size / 1024, 1)
    print(f"  ✓ Markdown manifest written: {output_path} ({size_kb} KB)")


# ─── Entry point ──────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="GestaltView v2 — Repository Manifest Generator"
    )
    parser.add_argument(
        "--output-dir",
        default=str(REPO_ROOT / "docs"),
        help="Directory to write manifest files (default: docs/)",
    )
    parser.add_argument(
        "--json-only",
        action="store_true",
        help="Only write JSON manifest, skip Markdown",
    )
    parser.add_argument(
        "--md-only",
        action="store_true",
        help="Only write Markdown manifest, skip JSON",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir).expanduser().resolve()
    json_out = output_dir / "gestaltview-v2.manifest.json"
    md_out = output_dir / "gestaltview-v2.manifest.md"

    print("")
    print("\033[1m\033[36m╔══════════════════════════════════════════════════════════════╗\033[0m")
    print("\033[1m\033[36m║  GestaltView v2 — Manifest Generator                        ║\033[0m")
    print("\033[1m\033[36m║  Serve Consciousness, Not Convenience                        ║\033[0m")
    print("\033[1m\033[36m╚══════════════════════════════════════════════════════════════╝\033[0m")
    print(f"  Repo root: {REPO_ROOT}")
    print(f"  Output:    {output_dir}")
    print("")

    print("  Loading Digital Intelligence Invariants...")
    di_invariants = load_digital_intelligence_invariants()
    if di_invariants:
        print(f"  Loaded {len(di_invariants)} DI invariants from {DI_INVARIANTS_PATH.relative_to(REPO_ROOT)}")
    else:
        print(f"  ⚠  No DI invariants loaded — manifest will have empty DI invariants block")

    print("  Scanning files...")
    files = scan_files()
    print(f"  Found {len(files)} files")

    print("  Extracting routes...")
    routes = extract_routes(files)
    print(f"  Found {len(routes)} routes")

    print("  Extracting API endpoints...")
    endpoints = extract_api_endpoints(files)
    print(f"  Found {len(endpoints)} endpoints")

    canonical_docs = extract_canonical_docs(files)
    package_json = load_package_json()
    test_inventory = extract_test_inventory(files, package_json)

    print("  Reading git snapshot...")
    git = get_git_snapshot()
    print(f"  Branch: {git.get('branch', 'unknown')} @ {git.get('commit_sha', '')[:12]}")

    deps = get_dependency_snapshot(package_json)

    manifest = build_manifest(
        files, routes, endpoints, canonical_docs,
        test_inventory, git, deps, di_invariants
    )

    print("")
    print("  Writing manifests...")
    if not args.md_only:
        write_json_manifest(manifest, json_out)
    if not args.json_only:
        write_markdown_manifest(manifest, md_out)

    print("")
    print("\033[32m\033[1m  ✓ Manifest generation complete\033[0m")
    print(f"  Files: {manifest['summary']['total_files']}")
    print(f"  Routes: {manifest['summary']['routes_count']}")
    print(f"  API endpoints: {manifest['summary']['api_endpoints_count']}")
    print(f"  Canonical docs: {manifest['summary']['canonical_docs_count']}")
    print(f"  Test inventory: {manifest['summary']['test_scripts_count']}")
    print(f"  DI invariants: {len(di_invariants)}")
    print("")
    print("  Next steps:")
    print("    1. Review docs/gestaltview-v2.manifest.md")
    print("    2. Commit both manifest files")
    print("    3. Copy docs/gestaltview-v2.manifest.md to GestaltView-Official-Compendium for sync")
    print("")


if __name__ == "__main__":
    main()
