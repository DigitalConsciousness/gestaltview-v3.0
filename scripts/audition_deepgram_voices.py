#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "config" / "deepgram_voice_profiles.json"
DEFAULT_TEXT = "This is not a performance. It is a first listen: enough voice to notice the fit, the drag, and what still needs room."


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render Deepgram Aura-2 auditions for GestaltView embodiment profiles")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--profile", help="Single profile slug")
    group.add_argument("--all", action="store_true", help="Render every profile")
    parser.add_argument("--text", help="Override audition text")
    parser.add_argument("--out", default="voice_development/auditions", help="Output directory")
    return parser.parse_args()


async def render(client: httpx.AsyncClient, slug: str, profile: dict, text: str, out_dir: Path) -> None:
    params = {
        "model": profile["tts_model"],
        "encoding": "linear16",
        "container": "wav",
        "sample_rate": str(profile.get("sample_rate", 24000)),
        "speed": str(profile.get("speed", 1.0)),
    }
    response = await client.post("/v1/speak", params=params, json={"text": text})
    response.raise_for_status()
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{slug}__{profile['tts_model']}.wav"
    path.write_bytes(response.content)
    metadata = {
        "profile_slug": slug,
        "tts_model": profile["tts_model"],
        "speed": profile.get("speed", 1.0),
        "request_id": response.headers.get("dg-request-id"),
        "character_count": response.headers.get("dg-char-count"),
        "text": text,
        "review_status": profile.get("review_status", "proposed"),
    }
    path.with_suffix(".json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(path)


async def main_async(args: argparse.Namespace) -> None:
    load_dotenv()
    api_key = os.environ.get("DEEPGRAM_API_KEY")
    if not api_key:
        raise SystemExit("DEEPGRAM_API_KEY is not set")
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    profiles = registry["profiles"]
    selected = profiles if args.all else {args.profile: profiles[args.profile]}
    out_dir = ROOT / args.out
    async with httpx.AsyncClient(
        base_url="https://api.deepgram.com",
        headers={"Authorization": f"Token {api_key}"},
        timeout=60,
    ) as client:
        for slug, profile in selected.items():
            text = args.text or profile.get("greeting") or DEFAULT_TEXT
            await render(client, slug, profile, text, out_dir)


if __name__ == "__main__":
    asyncio.run(main_async(parse_args()))
