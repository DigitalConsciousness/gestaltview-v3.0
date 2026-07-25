#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "config" / "deepgram_voice_profiles.json"
OUTPUT = ROOT / "supabase" / "generated" / "deepgram_voice_profile_seed.sql"


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    rows = []
    for slug, p in sorted(data["profiles"].items()):
        config = {
            "speed": p["speed"],
            "live_stt_model": p["live_stt_model"],
            "voice_traits": p["voice_traits"],
            "keyterms": p["keyterms"],
            "pronunciations": p["pronunciations"],
            "selection_rationale": p["selection_rationale"],
            "review_status": p["review_status"],
            "consent_boundary": p["consent_boundary"],
            "greeting": p["greeting"],
        }
        values = [
            sql_literal(slug), sql_literal(p["display_name"]), "'deepgram'",
            sql_literal(p["tts_model"]), sql_literal(p["stt_model"]),
            sql_literal(p["tts_model"].replace("aura-2-", "").replace("-en", "")),
            sql_literal(json.dumps(p["style_preset"])), "true",
            sql_literal(p["consent_boundary"]), sql_literal(json.dumps(config)),
            sql_literal(p["review_status"]),
        ]
        rows.append("(" + ", ".join(values) + ")")
    sql = """insert into public.voice_profiles
(profile_slug, display_name, provider_preference, tts_model, stt_model, speaker_id,
 style_preset, fallback_text_only, consent_notes, provider_config, review_status)
values
""" + ",\n".join(rows) + "\non conflict (profile_slug) do update set\n" + \
        "display_name=excluded.display_name, provider_preference=excluded.provider_preference, " + \
        "tts_model=excluded.tts_model, stt_model=excluded.stt_model, speaker_id=excluded.speaker_id, " + \
        "style_preset=excluded.style_preset, fallback_text_only=excluded.fallback_text_only, " + \
        "consent_notes=excluded.consent_notes, provider_config=excluded.provider_config, " + \
        "review_status=excluded.review_status, updated_at=now();\n"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(sql, encoding="utf-8")
    print(OUTPUT)


if __name__ == "__main__":
    main()
