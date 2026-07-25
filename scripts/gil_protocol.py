"""
Shared loader and formatter for the GestaltView GIL protocol.

GIL ("GestaltView Intent Layer") is treated as the official synthesis and
retrieval envelope for meaning-bearing work. It carries intent, governance,
routing, and corpus-context signals that should inform summarization and
retrieval prompts.
"""

from __future__ import annotations

import os
import pathlib
import re
from dataclasses import dataclass
from typing import Any, Iterable

import yaml


@dataclass(frozen=True)
class GILProtocol:
    path: pathlib.Path
    data: dict[str, Any]

    @property
    def envelope(self) -> dict[str, Any]:
        return self.data.get("envelope", {})

    @property
    def normalized(self) -> dict[str, Any]:
        return self.data.get("normalized", {})

    @property
    def context(self) -> dict[str, Any]:
        return self.data.get("context", {})

    @property
    def governance(self) -> dict[str, Any]:
        return self.data.get("governance", {})

    @property
    def routing(self) -> dict[str, Any]:
        return self.data.get("routing", {})


def _repo_root() -> pathlib.Path:
    return pathlib.Path(__file__).resolve().parent.parent


def _candidate_paths(explicit: str | os.PathLike[str] | None) -> list[pathlib.Path]:
    candidates: list[pathlib.Path] = []

    raw = explicit or os.getenv("GIL_PROTOCOL_PATH")
    if raw:
        root = pathlib.Path(raw).expanduser()
        if root.is_dir():
            yaml_files = sorted(root.glob("*.yml")) + sorted(root.glob("*.yaml"))
            candidates.extend(yaml_files)
        else:
            candidates.append(root)

    candidates.extend(
        [
            _repo_root() / "gil" / "rough-draft-ratification.yaml",
            _repo_root() / "gil" / "examples" / "agent-trainer-timeout.yaml",
        ]
    )
    return candidates


def load_gil_protocol(
    path: str | os.PathLike[str] | None = None,
) -> GILProtocol | None:
    for candidate in _candidate_paths(path):
        if not candidate.exists() or candidate.is_dir():
            continue
        data = yaml.safe_load(candidate.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError(f"GIL protocol must parse to a mapping: {candidate}")
        return GILProtocol(path=candidate.resolve(), data=data)
    return None


def _stringify(value: Any) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    if isinstance(value, dict):
        items = ", ".join(
            f"{k}={_stringify(v)}"
            for k, v in value.items()
            if v not in (None, "", [], {})
        )
        return items or "n/a"
    if isinstance(value, (list, tuple, set)):
        return ", ".join(_stringify(item) for item in value) or "n/a"
    return str(value)


def _format_block(title: str, items: Iterable[tuple[str, Any]]) -> str:
    lines = [f"{title}:"]
    for key, value in items:
        rendered = _stringify(value)
        if rendered != "n/a":
            lines.append(f"- {key}: {rendered}")
    return "\n".join(lines)


def build_gil_context_block(
    protocol: GILProtocol | None,
    *,
    scope: str | None = None,
) -> str:
    if protocol is None:
        return ""

    envelope = protocol.envelope
    normalized = protocol.normalized
    governance = protocol.governance
    routing = protocol.routing
    context = protocol.context

    parts = [
        "GIL PROTOCOL CONTEXT",
        f"- protocol_path: {protocol.path}",
    ]
    if scope:
        parts.append(f"- scope: {scope}")

    parts.append(
        _format_block(
            "Envelope",
            [
                ("id", envelope.get("id")),
                ("createdAt", envelope.get("createdAt")),
                ("source", envelope.get("source")),
                ("channel", envelope.get("channel")),
                ("tags", envelope.get("tags")),
                ("gravityScore", envelope.get("gravityScore")),
            ],
        )
    )
    parts.append(
        _format_block(
            "Normalized intent",
            [
                ("kind", normalized.get("kind")),
                ("domainLane", normalized.get("domainLane")),
                ("who", normalized.get("who")),
                ("what", normalized.get("what")),
                ("where", normalized.get("where")),
                ("when", normalized.get("when")),
                ("why", normalized.get("why")),
                ("how", normalized.get("how")),
                ("summary", normalized.get("summary")),
                ("narrative", normalized.get("narrative")),
            ],
        )
    )
    parts.append(
        _format_block(
            "Governance",
            [
                ("doctrineStatus", governance.get("doctrineStatus")),
                ("doctrineLinks", governance.get("doctrineLinks")),
                ("safetyFlags", governance.get("safetyFlags")),
            ],
        )
    )
    parts.append(
        _format_block(
            "Routing",
            [
                ("requireTribunal", routing.get("requireTribunal")),
                ("offlineCapable", routing.get("offlineCapable")),
                ("providerTier", routing.get("providerTier")),
                ("requireHighSafetyModel", routing.get("requireHighSafetyModel")),
                ("temperature", routing.get("temperature")),
                ("maxTokens", routing.get("maxTokens")),
                ("preferredExhibit", routing.get("preferredExhibit")),
            ],
        )
    )

    corpus = context.get("corpus", {})
    parts.append(
        _format_block(
            "Corpus context",
            [
                ("manifestNodes", corpus.get("manifestNodes")),
                ("corpusFiles", corpus.get("corpusFiles")),
                ("repoAreas", context.get("repo", {}).get("repoAreas")),
            ],
        )
    )

    return "\n".join(parts)


def build_gil_routing_overrides(protocol: GILProtocol | None) -> dict[str, Any]:
    if protocol is None:
        return {}
    routing = protocol.routing
    overrides: dict[str, Any] = {}
    if "temperature" in routing:
        overrides["temperature"] = routing["temperature"]
    if "maxTokens" in routing:
        overrides["max_tokens"] = routing["maxTokens"]
    if "providerTier" in routing:
        overrides["provider_tier"] = routing["providerTier"]
    if "requireHighSafetyModel" in routing:
        overrides["require_high_safety_model"] = routing["requireHighSafetyModel"]
    if "preferredExhibit" in routing:
        overrides["preferred_exhibit"] = routing["preferredExhibit"]
    if "requireTribunal" in routing:
        overrides["require_tribunal"] = routing["requireTribunal"]
    if "offlineCapable" in routing:
        overrides["offline_capable"] = routing["offlineCapable"]
    return overrides


def _tokenize(text: str) -> list[str]:
    return [token for token in re.split(r"[^a-z0-9]+", text.lower()) if token]


def _path_candidates(value: str) -> set[str]:
    parts = [part for part in re.split(r"[\\/]+", value) if part]
    candidates: set[str] = set()
    for part in parts:
        tokens = _tokenize(part)
        if part:
            candidates.add(part.lower())
        if tokens:
            candidates.update(tokens)
        if "-" in part:
            candidates.add(part.lower())
    return {candidate for candidate in candidates if candidate}


def infer_gil_retrieval_scope(protocol: GILProtocol | None) -> dict[str, Any]:
    if protocol is None:
        return {
            "source_prefix": None,
            "package": None,
            "source_prefix_candidates": [],
            "package_candidates": [],
            "retrieval_terms": [],
        }

    normalized = protocol.normalized
    context = protocol.context
    routing = protocol.routing

    corpus = context.get("corpus", {}) if isinstance(context, dict) else {}
    repo = context.get("repo", {}) if isinstance(context, dict) else {}

    manifest_nodes = corpus.get("manifestNodes", []) if isinstance(corpus, dict) else []
    corpus_files = corpus.get("corpusFiles", []) if isinstance(corpus, dict) else []
    repo_areas = repo.get("repoAreas", []) if isinstance(repo, dict) else []

    source_prefix_candidates: set[str] = set()
    package_candidates: set[str] = set()
    retrieval_terms: set[str] = set()

    for path_value in list(corpus_files) + list(manifest_nodes) + list(repo_areas):
        if isinstance(path_value, str):
            lowered = path_value.lower()
            if ":" in lowered:
                source_prefix_candidates.add(lowered.split(":", 1)[0].strip())
            if "/" in lowered:
                source_prefix_candidates.add(lowered.split("/", 1)[0].strip())

            for segment in re.split(r"[\\/]+", lowered):
                if "-" in segment or "_" in segment:
                    package_candidates.add(segment.strip())

            retrieval_terms.update(_tokenize(path_value))

    for field in ("kind", "domainLane", "summary", "who", "what", "why", "how", "where"):
        value = normalized.get(field)
        if isinstance(value, str):
            retrieval_terms.update(_tokenize(value))

    tags = protocol.envelope.get("tags", []) if isinstance(protocol.envelope, dict) else []
    if isinstance(tags, list):
        for tag in tags:
            if isinstance(tag, str):
                retrieval_terms.update(_tokenize(tag))

    preferred_exhibit = routing.get("preferredExhibit")
    if isinstance(preferred_exhibit, str):
        retrieval_terms.update(_tokenize(preferred_exhibit))
        package_candidates.add(preferred_exhibit.lower())

    # Prefer a single unambiguous source prefix when all candidates agree.
    source_prefix = None
    if len(source_prefix_candidates) == 1:
        source_prefix = next(iter(source_prefix_candidates))
    elif "docs" in source_prefix_candidates and len(source_prefix_candidates) <= 2:
        source_prefix = "docs"

    package = None
    if len(package_candidates) == 1:
        package = next(iter(package_candidates))

    return {
        "source_prefix": source_prefix,
        "package": package,
        "source_prefix_candidates": sorted(source_prefix_candidates),
        "package_candidates": sorted(package_candidates),
        "retrieval_terms": sorted(retrieval_terms),
        "manifest_nodes": manifest_nodes,
        "corpus_files": corpus_files,
        "repo_areas": repo_areas,
    }


def score_fragment_for_protocol(fragment: dict[str, Any], protocol: GILProtocol | None) -> int:
    if protocol is None:
        return 0

    scope = infer_gil_retrieval_scope(protocol)
    source_file = str(fragment.get("source_file", "")).lower()
    package = str(fragment.get("package", "")).lower()
    content = str(fragment.get("content", "")).lower()
    score = 0

    for candidate in scope.get("source_prefix_candidates", []):
        if candidate and (source_file.startswith(candidate) or f"/{candidate}/" in source_file):
            score += 6
    for candidate in scope.get("package_candidates", []):
        if candidate and candidate == package:
            score += 5
        elif candidate and candidate in package:
            score += 3

    for file_ref in scope.get("corpus_files", []):
        if isinstance(file_ref, str):
            stem = pathlib.Path(file_ref).stem.lower()
            if stem and stem in source_file:
                score += 4

    for node_ref in scope.get("manifest_nodes", []):
        if isinstance(node_ref, str):
            node_tokens = _tokenize(node_ref)
            if any(token in source_file for token in node_tokens):
                score += 2
            if any(token in content for token in node_tokens):
                score += 1

    for term in scope.get("retrieval_terms", []):
        if term and term in source_file:
            score += 1
        if term and term in package:
            score += 1
        if term and term in content:
            score += 1

    return score


def rank_fragments_for_protocol(
    fragments: list[dict[str, Any]],
    protocol: GILProtocol | None,
) -> list[dict[str, Any]]:
    if protocol is None:
        return fragments
    return sorted(
        fragments,
        key=lambda fragment: (
            score_fragment_for_protocol(fragment, protocol),
            str(fragment.get("source_file", "")),
            str(fragment.get("id", "")),
        ),
        reverse=True,
    )
