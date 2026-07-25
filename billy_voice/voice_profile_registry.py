"""Load and validate GestaltView's Deepgram voice-profile projection."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class VoiceProfile:
    slug: str
    display_name: str
    tts_model: str
    stt_model: str
    live_stt_model: str
    language: str
    speed: float
    encoding: str
    sample_rate: int
    voice_traits: list[str] = field(default_factory=list)
    keyterms: list[str] = field(default_factory=list)
    pronunciations: dict[str, str] = field(default_factory=dict)
    greeting: str = "I'm here."
    selection_rationale: str = ""
    review_status: str = "proposed"
    fallback_text_only: bool = True
    consent_boundary: str = ""


class VoiceProfileRegistry:
    def __init__(self, path: str | Path | None = None) -> None:
        default_path = Path(__file__).resolve().parents[1] / "config" / "deepgram_voice_profiles.json"
        configured = path or os.environ.get("VOICE_PROFILE_REGISTRY") or default_path
        candidate = Path(configured)
        if not candidate.is_absolute():
            candidate = Path(__file__).resolve().parents[1] / candidate
        self.path = candidate.resolve()
        self._raw = self._load()
        self._defaults = self._raw.get("defaults", {})
        self._profiles = self._raw.get("profiles", {})
        if not isinstance(self._profiles, dict) or not self._profiles:
            raise ValueError(f"No voice profiles found in {self.path}")

    def _load(self) -> dict[str, Any]:
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Voice profile registry not found: {self.path}") from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in voice profile registry {self.path}: {exc}") from exc

    @property
    def slugs(self) -> tuple[str, ...]:
        return tuple(sorted(self._profiles))

    def get(self, slug: str) -> VoiceProfile:
        chosen_slug = slug if slug in self._profiles else "billy"
        if chosen_slug not in self._profiles:
            chosen_slug = next(iter(sorted(self._profiles)))
        payload = {**self._defaults, **self._profiles[chosen_slug]}
        speed = float(payload.get("speed", 1.0))
        if not 0.7 <= speed <= 1.5:
            raise ValueError(f"Voice speed for {chosen_slug} must be between 0.7 and 1.5")
        return VoiceProfile(
            slug=chosen_slug,
            display_name=str(payload.get("display_name", chosen_slug)),
            tts_model=str(payload.get("tts_model", "aura-2-arcas-en")),
            stt_model=str(payload.get("stt_model", "nova-3")),
            live_stt_model=str(payload.get("live_stt_model", "flux-general-en")),
            language=str(payload.get("language", "en-US")),
            speed=speed,
            encoding=str(payload.get("encoding", "linear16")),
            sample_rate=int(payload.get("sample_rate", 24000)),
            voice_traits=list(payload.get("voice_traits", [])),
            keyterms=list(payload.get("keyterms", [])),
            pronunciations=dict(payload.get("pronunciations", {})),
            greeting=str(payload.get("greeting", "I'm here.")),
            selection_rationale=str(payload.get("selection_rationale", "")),
            review_status=str(payload.get("review_status", "proposed")),
            fallback_text_only=bool(payload.get("fallback_text_only", True)),
            consent_boundary=str(payload.get("consent_boundary", "")),
        )
