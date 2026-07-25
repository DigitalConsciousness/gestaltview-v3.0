#!/usr/bin/env python3
"""Generic corpus ingest scaffold for buyer-owned repositories.

Reads a manifest JSON file, chunks source text, optionally embeds chunks,
computes a Two-Pass Gravity evaluation, and inserts rows into Supabase
`gravity_reports`, `gravity_report_fragments`, and `knowledge_fragments`.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import textwrap
import uuid
import urllib.request
from dataclasses import dataclass
from collections import Counter
from pathlib import Path
from typing import Iterable

VALID_LANES = {"knowledge", "code", "product", "context"}


@dataclass
class ManifestEntry:
    title: str
    lane: str
    source_type: str
    source_uri: str
    notes: str


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    words = text.split()
    if not words:
        return []

    stride = max(1, chunk_size - overlap)
    chunks: list[str] = []
    for i in range(0, len(words), stride):
        segment = words[i : i + chunk_size]
        if not segment:
            continue
        chunks.append(" ".join(segment).strip())
        if i + chunk_size >= len(words):
            break
    return chunks


def _read_source(entry: ManifestEntry, manifest_dir: Path) -> str:
    if entry.source_type == "text":
        return entry.source_uri

    if entry.source_type == "file":
        source_path = (manifest_dir / entry.source_uri).resolve()
        return source_path.read_text(encoding="utf-8")

    if entry.source_type == "url":
        with urllib.request.urlopen(entry.source_uri) as response:  # nosec B310
            raw = response.read().decode("utf-8", errors="ignore")
        return re.sub(r"<[^>]+>", " ", raw)

    raise ValueError(f"Unsupported sourceType: {entry.source_type}")


def _embed_openai(text: str, model: str, api_key: str) -> list[float]:
    payload = json.dumps({"input": text, "model": model}).encode("utf-8")
    request = urllib.request.Request(
        url="https://api.openai.com/v1/embeddings",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request) as response:  # nosec B310
        data = json.loads(response.read().decode("utf-8"))
    return data["data"][0]["embedding"]


INTENSIFIER_WORDS = {
    "revolutionary",
    "unprecedented",
    "transformative",
    "game-changing",
    "breakthrough",
    "category-defining",
    "best-in-class",
    "world-class",
    "next-generation",
    "market-leading",
    "massive",
    "dramatically",
    "seamless",
    "effortless",
    "guaranteed",
    "proven",
    "always",
    "never",
    "ultimate",
}

CLAIM_VERB_PATTERNS = [
    re.compile(r"\b(can|will|does|adds?|delivers|links?|stores?|reduces|improves|accelerates|simplifies|solves|replaces|automates|enables|supports|detects|measures|prioritizes|tags)\b", re.IGNORECASE),
    re.compile(r"\b(better than|more than|less than|faster than|ahead of)\b", re.IGNORECASE),
]

SUPPORT_PATTERNS = [
    re.compile(r"\b\d+(?:\.\d+)?%?\b"),
    re.compile(r"\b(?:because|by|through|using|via|with|when|if|so that)\b", re.IGNORECASE),
    re.compile(r"\b(?:schema|table|function|workflow|metric|dataset|benchmark|evidence|citation|example|implementation|vector|embedding|rpc|api|sql|join|index|priority)\b", re.IGNORECASE),
]

FRAME_PATTERNS = [
    (re.compile(r"\b(?:better than|vs\.?|versus|compared to)\b", re.IGNORECASE), "comparison frame"),
    (re.compile(r"\b(?:revolutionary|transformative|game-changing|breakthrough)\b", re.IGNORECASE), "transformation frame"),
    (re.compile(r"\b(?:platform|ecosystem|end-to-end|stack)\b", re.IGNORECASE), "platform frame"),
    (re.compile(r"\b(?:best-in-class|category-defining|market-leading|industry standard)\b", re.IGNORECASE), "category-leadership frame"),
    (re.compile(r"\b(?:benchmark|evidence|proof|falsifiable|measurement)\b", re.IGNORECASE), "evidence frame"),
]

STOP_WORDS = {
    "the",
    "and",
    "that",
    "with",
    "from",
    "this",
    "there",
    "their",
    "have",
    "will",
    "been",
    "into",
    "about",
    "would",
    "could",
    "should",
    "for",
    "your",
    "what",
    "when",
    "where",
    "which",
    "while",
    "than",
    "then",
    "they",
    "them",
    "these",
    "those",
    "its",
    "our",
    "out",
    "can",
    "not",
    "just",
    "more",
    "less",
}


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _split_sentences(text: str) -> list[str]:
    normalized = text.replace("\r\n", "\n").strip()
    if not normalized:
        return []
    parts = re.findall(r"[^.!?\n]+[.!?]?", normalized) or [normalized]
    return [_normalize_text(part) for part in parts if _normalize_text(part)]


def _unique(values: Iterable[str]) -> list[str]:
    seen: dict[str, None] = {}
    for value in values:
        normalized = value.strip()
        if normalized:
            seen.setdefault(normalized, None)
    return list(seen.keys())


def _extract_pattern_matches(text: str, patterns: Iterable[re.Pattern[str]]) -> list[str]:
    matches: list[str] = []
    for pattern in patterns:
        for match in pattern.finditer(text):
            matches.append(_normalize_text(match.group(0)))
    return _unique(matches)


def _extract_loud_claims(sentences: Iterable[str]) -> list[str]:
    claims: list[str] = []
    for sentence in sentences:
        if len(sentence) < 12:
            continue
        has_claim_verb = any(pattern.search(sentence) for pattern in CLAIM_VERB_PATTERNS)
        has_intensity = any(word in sentence.lower() for word in INTENSIFIER_WORDS)
        if has_claim_verb or has_intensity or "!" in sentence:
            claims.append(sentence)
    return _unique(claims)


def _detect_repetition_patterns(text: str) -> list[str]:
    words = re.findall(r"\b[a-z][a-z0-9-]{2,}\b", text.lower())
    counts = Counter(word for word in words if word not in STOP_WORDS)
    repeated = [
        f"{word} (x{count})"
        for word, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
        if count >= 3
    ]
    return repeated[:5]


def _detect_implied_frame(text: str) -> str:
    for pattern, frame in FRAME_PATTERNS:
        if pattern.search(text):
            return frame
    return "claim-to-evidence frame"


def _detect_notable_absences(text: str) -> list[str]:
    absences: list[str] = []
    if not re.search(r"\b\d+(?:\.\d+)?%?\b", text):
        absences.append("No measurable thresholds or counts are stated.")
    if not re.search(r"\b(?:cite|citation|source|according to|reference|references)\b", text, re.IGNORECASE):
        absences.append("No citations or source references are named.")
    if not re.search(r"\b(?:tradeoff|limitation|constraint|risk|failure mode|counterexample|counterpoint)\b", text, re.IGNORECASE):
        absences.append("No tradeoffs, limits, or failure modes are acknowledged.")
    if not re.search(r"\b(?:example|for example|case study|demo|walkthrough)\b", text, re.IGNORECASE):
        absences.append("No concrete example is supplied.")
    return absences


def _has_specificity(sentence: str) -> bool:
    return any(pattern.search(sentence) for pattern in SUPPORT_PATTERNS)


def _collapse_sentence(sentence: str) -> str:
    collapsed = re.sub(
        r"\b(revolutionary|unprecedented|transformative|game-changing|breakthrough|best-in-class|world-class|next-generation|market-leading|category-defining|massive|dramatically|seamless|effortless|guaranteed?|proven|always|never)\b",
        "",
        sentence,
        flags=re.IGNORECASE,
    )
    return _normalize_text(collapsed)


def _short_sentence(sentence: str) -> str:
    parts = [
        _normalize_text(part)
        for part in re.split(r"[,;]\s*|\s+\band\b\s+|\s+\bbut\b\s+", sentence, flags=re.IGNORECASE)
        if _normalize_text(part)
    ]
    return parts[0] if parts else _normalize_text(sentence)


def _select_actual_delta(load_bearing_claims: list[str], sentences: list[str]) -> str:
    candidates = sorted(load_bearing_claims, key=lambda item: (len(item), item))
    if candidates:
        candidate = candidates[0]
    else:
        candidate = next((sentence for sentence in sentences if _has_specificity(sentence)), sentences[0] if sentences else "")
    return _short_sentence(_collapse_sentence(candidate)) if candidate else "Nothing load-bearing survives the second pass."


def _build_incentive_distortion(text: str, source_type: str) -> str:
    lowered = text.lower()
    if source_type and any(token in source_type.lower() for token in ("marketing", "announcement", "launch", "sales", "product")):
        return "Commercial framing rewards novelty, urgency, and category stretch."
    if re.search(r"\b(launch|announce|market|sell|buyers?|users?|customers?|growth|revenue|platform|category|disrupt)\b", lowered):
        return "The source is rewarded for sounding larger, newer, and more inevitable than the evidence warrants."
    return "The source may benefit from being believed before it is demonstrated."


def _confidence_from_counts(load_bearing_count: int, collapse_count: int, intensity_count: int) -> str:
    if load_bearing_count == 0:
        return "noise"
    if load_bearing_count >= 2 and collapse_count == 0 and intensity_count <= 2:
        return "high"
    if collapse_count > load_bearing_count or intensity_count >= 5:
        return "low"
    return "medium"


def _signal_weight_from_counts(
    confidence: str,
    load_bearing_count: int,
    collapse_count: int,
    repetition_count: int,
    intensity_count: int,
) -> float:
    confidence_base = {
        "high": 0.86,
        "medium": 0.62,
        "low": 0.34,
        "noise": 0.1,
    }
    raw = (
        confidence_base[confidence]
        + min(0.12, load_bearing_count * 0.03)
        - min(0.08, collapse_count * 0.025)
        - min(0.06, intensity_count * 0.01)
        + min(0.05, repetition_count * 0.008)
    )
    return max(0.05, min(0.98, round(raw, 3)))


def _analyze_gravity(entry: ManifestEntry, source_text: str) -> dict:
    normalized = _normalize_text(source_text)
    sentences = _split_sentences(normalized)
    loud_claims = _extract_loud_claims(sentences)
    intensifiers = _extract_pattern_matches(
        normalized,
        [re.compile(re.escape(word), re.IGNORECASE) for word in sorted(INTENSIFIER_WORDS)],
    )
    repetition_patterns = _detect_repetition_patterns(normalized)
    implied_frame = _detect_implied_frame(normalized)
    notable_absences = _detect_notable_absences(normalized)
    load_bearing_claims = [
        claim for claim in loud_claims if _has_specificity(claim) or re.search(r"\b(?:because|by|through|using|via|with|when|if)\b", claim, re.IGNORECASE)
    ]
    claims_that_collapse = [
        claim
        for claim in loud_claims
        if not (_has_specificity(claim) or re.search(r"\b(?:because|by|through|using|via|with|when|if)\b", claim, re.IGNORECASE))
        or any(word in claim.lower() for word in INTENSIFIER_WORDS)
    ]
    actual_delta = _select_actual_delta(load_bearing_claims, sentences)
    confidence = _confidence_from_counts(len(load_bearing_claims), len(claims_that_collapse), len(intensifiers))
    signal_weight = _signal_weight_from_counts(
        confidence,
        len(load_bearing_claims),
        len(claims_that_collapse),
        len(repetition_patterns),
        len(intensifiers),
    )

    return {
        "surface_map": {
            "loud_claims": loud_claims,
            "intensifiers": intensifiers,
            "repetition_patterns": repetition_patterns,
            "implied_frame": implied_frame,
            "notable_absences": notable_absences,
        },
        "gravity_report": {
            "load_bearing_claims": load_bearing_claims,
            "claims_that_collapse_under_scrutiny": claims_that_collapse,
            "actual_delta": actual_delta,
            "incentive_distortion": _build_incentive_distortion(normalized, entry.source_type),
            "signal": actual_delta,
            "confidence": confidence,
        },
        "signal_weight": signal_weight,
        "source_fingerprint": hashlib.sha256(normalized.encode("utf-8")).hexdigest(),
    }


def _build_report_row(
    *,
    entry: ManifestEntry,
    user_id: str,
    report_id: str,
    analysis: dict,
    chunk_count: int,
) -> dict:
    return {
        "id": report_id,
        "user_id": user_id,
        "source_title": entry.title,
        "source_uri": entry.source_uri,
        "source_type": entry.source_type,
        "source_kind": entry.lane,
        "source_fingerprint": analysis["source_fingerprint"],
        "surface_map": analysis["surface_map"],
        "gravity_report": analysis["gravity_report"],
        "signal_weight": analysis["signal_weight"],
        "confidence": analysis["gravity_report"]["confidence"],
        "metadata": {
            "notes": entry.notes,
            "chunk_count": chunk_count,
            "analysis_version": "two-pass-gravity-v1",
            "source_fingerprint": analysis["source_fingerprint"],
        },
    }


def _build_fragment_rows(
    *,
    entry: ManifestEntry,
    user_id: str,
    report_id: str,
    chunks: list[str],
    embedding_provider: str,
    embedding_model: str,
    openai_api_key: str | None,
    analysis: dict,
) -> tuple[list[dict], list[dict]]:
    scored_chunks: list[dict] = []

    for chunk_index, chunk in enumerate(chunks):
        chunk_signal_weight = analysis["signal_weight"]
        if analysis["gravity_report"]["load_bearing_claims"]:
            lowered = chunk.lower()
            if any(claim.lower() in lowered for claim in analysis["gravity_report"]["load_bearing_claims"]):
                chunk_signal_weight = min(0.98, round(chunk_signal_weight + 0.1, 3))
        if analysis["gravity_report"]["actual_delta"].lower() in chunk.lower():
            chunk_signal_weight = min(0.98, round(chunk_signal_weight + 0.08, 3))

        scored_chunks.append(
            {
                "chunk_index": chunk_index,
                "chunk": chunk,
                "signal_weight": chunk_signal_weight,
            }
        )

    scored_chunks.sort(key=lambda item: (-item["signal_weight"], item["chunk_index"]))

    fragments: list[dict] = []
    links: list[dict] = []

    for priority_rank, item in enumerate(scored_chunks):
        chunk_index = item["chunk_index"]
        chunk = item["chunk"]
        fragment_id = str(uuid.uuid4())
        embedding = None
        if embedding_provider == "openai":
            if not openai_api_key:
                raise ValueError("OPENAI_API_KEY is required when embedding-provider=openai")
            embedding = _embed_openai(chunk, embedding_model, openai_api_key)

        metadata = {
            "notes": entry.notes,
            "ingest_scaffold": "gv_operator_kit/scripts/corpus_ingest.py",
            "gravity_report_id": report_id,
            "signal_weight": item["signal_weight"],
            "gravity_confidence": analysis["gravity_report"]["confidence"],
            "gravity_signal": analysis["gravity_report"]["signal"],
            "priority_rank": priority_rank,
        }

        fragments.append(
            {
                "id": fragment_id,
                "user_id": user_id,
                "namespace": entry.lane,
                "title": entry.title,
                "content": chunk,
                "source_uri": entry.source_uri,
                "source_type": entry.source_type,
                "chunk_index": chunk_index,
                "metadata": metadata,
                "embedding": embedding,
            }
        )

        links.append(
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "gravity_report_id": report_id,
                "knowledge_fragment_id": fragment_id,
                "chunk_index": chunk_index,
                "priority_rank": priority_rank,
                "signal_weight": item["signal_weight"],
                "metadata": {
                    "analysis_version": "two-pass-gravity-v1",
                    "gravity_signal": analysis["gravity_report"]["signal"],
                },
            }
        )

    return fragments, links


def _build_ingest_payload(
    entries: Iterable[ManifestEntry],
    manifest_dir: Path,
    user_id: str,
    chunk_size: int,
    chunk_overlap: int,
    embedding_provider: str,
    embedding_model: str,
    openai_api_key: str | None,
) -> tuple[list[dict], list[dict], list[dict]]:
    gravity_reports: list[dict] = []
    fragments: list[dict] = []
    links: list[dict] = []

    for entry in entries:
        source_text = _read_source(entry, manifest_dir)
        analysis = _analyze_gravity(entry, source_text)
        report_id = str(uuid.uuid4())
        chunks = _chunk_text(source_text, chunk_size=chunk_size, overlap=chunk_overlap)
        chunk_count = len(chunks)
        gravity_reports.append(
            _build_report_row(
                entry=entry,
                user_id=user_id,
                report_id=report_id,
                analysis=analysis,
                chunk_count=chunk_count,
            )
        )

        entry_fragments, entry_links = _build_fragment_rows(
            entry=entry,
            user_id=user_id,
            report_id=report_id,
            chunks=chunks,
            embedding_provider=embedding_provider,
            embedding_model=embedding_model,
            openai_api_key=openai_api_key,
            analysis=analysis,
        )
        fragments.extend(entry_fragments)
        links.extend(entry_links)

    return gravity_reports, fragments, links


def _insert_supabase_rows(url: str, service_role_key: str, table: str, rows: list[dict]) -> None:
    if not rows:
        return

    endpoint = f"{url.rstrip('/')}/rest/v1/{table}"
    encoded = json.dumps(rows).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=encoded,
        headers={
            "Content-Type": "application/json",
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Prefer": "return=minimal",
        },
        method="POST",
    )

    with urllib.request.urlopen(request) as response:  # nosec B310
        if response.status >= 300:
            raise RuntimeError(f"Supabase insert failed: HTTP {response.status}")


def _parse_entries(manifest: dict) -> list[ManifestEntry]:
    parsed: list[ManifestEntry] = []
    for raw in manifest.get("entries", []):
        lane = raw.get("lane", "knowledge")
        if lane not in VALID_LANES:
            raise ValueError(f"Unsupported lane '{lane}'. Expected one of {sorted(VALID_LANES)}")

        parsed.append(
            ManifestEntry(
                title=raw["title"],
                lane=lane,
                source_type=raw["sourceType"],
                source_uri=raw["sourceUri"],
                notes=raw.get("notes", ""),
            )
        )
    return parsed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Ingest buyer-owned corpus from a manifest into Supabase gravity_reports and knowledge_fragments."
    )
    parser.add_argument("manifest", help="Path to import manifest JSON file")
    parser.add_argument("--user-id", required=True, help="kit_users.id target for inserted fragments")
    parser.add_argument("--supabase-url", default=os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""))
    parser.add_argument("--service-role-key", default=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))
    parser.add_argument(
        "--embedding-provider",
        choices=["none", "openai"],
        default=os.getenv("EMBEDDING_PROVIDER", "none").lower() or "none",
    )
    parser.add_argument(
        "--embedding-model",
        default=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small"),
    )
    parser.add_argument("--chunk-size", type=int, default=350)
    parser.add_argument("--chunk-overlap", type=int, default=60)
    parser.add_argument("--dry-run", action="store_true", help="Print summary only, no inserts")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.supabase_url or not args.service_role_key:
        parser.error("Missing Supabase credentials. Set --supabase-url and --service-role-key or env vars.")

    manifest_path = Path(args.manifest).resolve()
    manifest = _load_json(manifest_path)
    entries = _parse_entries(manifest)

    openai_api_key = os.getenv("OPENAI_API_KEY")
    gravity_reports, rows, links = _build_ingest_payload(
        entries=entries,
        manifest_dir=manifest_path.parent,
        user_id=args.user_id,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
        embedding_provider=args.embedding_provider,
        embedding_model=args.embedding_model,
        openai_api_key=openai_api_key,
    )

    by_lane: dict[str, int] = {}
    for row in rows:
        lane = row["namespace"]
        by_lane[lane] = by_lane.get(lane, 0) + 1

    summary = textwrap.dedent(
        f"""
        Manifest: {manifest_path}
        Entries: {len(entries)}
        Gravity reports: {len(gravity_reports)}
        Chunks: {len(rows)}
        Gravity links: {len(links)}
        Lanes: {json.dumps(by_lane, sort_keys=True)}
        Embeddings: {args.embedding_provider}
        Dry run: {args.dry_run}
        """
    ).strip()
    print(summary)

    if args.dry_run:
        return 0

    _insert_supabase_rows(
        url=args.supabase_url,
        service_role_key=args.service_role_key,
        table="gravity_reports",
        rows=gravity_reports,
    )
    _insert_supabase_rows(
        url=args.supabase_url,
        service_role_key=args.service_role_key,
        table="knowledge_fragments",
        rows=rows,
    )
    _insert_supabase_rows(
        url=args.supabase_url,
        service_role_key=args.service_role_key,
        table="gravity_report_fragments",
        rows=links,
    )
    print("Ingest complete.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
