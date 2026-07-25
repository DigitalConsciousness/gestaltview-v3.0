"""Deepgram Aura-2 TTS adapter that yields LiveKit AudioFrames."""
from __future__ import annotations

import asyncio
import io
import logging
import os
import re
import wave
from typing import AsyncIterator

import httpx
from livekit import rtc

from .voice_profile_registry import VoiceProfile

log = logging.getLogger("gestaltview-deepgram-tts")

CHANNELS = 1
MAX_TEXT_CHARS = 1800
FRAME_MS = 40


class DeepgramTTS:
    def __init__(self, profile: VoiceProfile, api_key: str | None = None) -> None:
        self.profile = profile
        self.api_key = api_key or os.environ.get("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise RuntimeError("DEEPGRAM_API_KEY is required for Deepgram TTS")
        timeout = float(os.environ.get("DEEPGRAM_TIMEOUT_SECONDS", "45"))
        self._client = httpx.AsyncClient(
            base_url="https://api.deepgram.com",
            headers={"Authorization": f"Token {self.api_key}"},
            timeout=timeout,
        )

    async def synthesize(self, text: str, style_plan=None) -> AsyncIterator[rtc.AudioFrame]:
        speed = self._resolve_speed(style_plan)
        for text_chunk in self._chunk_text(self._apply_pronunciations(text)):
            params = {
                "model": self.profile.tts_model,
                "encoding": "linear16",
                "container": "wav",
                "sample_rate": str(self.profile.sample_rate),
                "speed": f"{speed:.2f}",
            }
            response = await self._client.post(
                "/v1/speak",
                params=params,
                json={"text": text_chunk},
            )
            response.raise_for_status()
            request_id = response.headers.get("dg-request-id")
            char_count = response.headers.get("dg-char-count")
            log.info(
                "Deepgram TTS profile=%s model=%s request_id=%s chars=%s",
                self.profile.slug,
                self.profile.tts_model,
                request_id,
                char_count,
            )
            for frame in self._wav_to_frames(response.content):
                yield frame
                await asyncio.sleep(0)

    def _resolve_speed(self, style_plan) -> float:
        speed = self.profile.speed
        if style_plan is not None and hasattr(style_plan, "pace"):
            # StylePlanner uses roughly 0.6–1.0. Blend, do not let transient
            # affect completely replace the reviewed profile voice.
            pace = float(getattr(style_plan, "pace"))
            speed = (self.profile.speed * 0.75) + (pace * 0.25)
        return max(0.7, min(1.5, speed))

    def _apply_pronunciations(self, text: str) -> str:
        result = text
        for word, ipa in self.profile.pronunciations.items():
            pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
            replacement = rf'\{{"word": "{word}", "pronounce": "{ipa}"\}}'
            result = pattern.sub(lambda _match: replacement, result)
        return result

    @staticmethod
    def _chunk_text(text: str) -> list[str]:
        text = text.strip()
        if len(text) <= MAX_TEXT_CHARS:
            return [text] if text else []
        sentences = re.split(r"(?<=[.!?])\s+", text)
        chunks: list[str] = []
        current = ""
        for sentence in sentences:
            candidate = f"{current} {sentence}".strip()
            if len(candidate) <= MAX_TEXT_CHARS:
                current = candidate
                continue
            if current:
                chunks.append(current)
            while len(sentence) > MAX_TEXT_CHARS:
                chunks.append(sentence[:MAX_TEXT_CHARS])
                sentence = sentence[MAX_TEXT_CHARS:]
            current = sentence.strip()
        if current:
            chunks.append(current)
        return chunks

    def _wav_to_frames(self, wav_bytes: bytes) -> list[rtc.AudioFrame]:
        frames: list[rtc.AudioFrame] = []
        with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
            sample_rate = wav.getframerate()
            channels = wav.getnchannels()
            sample_width = wav.getsampwidth()
            if channels != 1 or sample_width != 2:
                raise ValueError(
                    f"Expected mono 16-bit PCM from Deepgram, got channels={channels}, sample_width={sample_width}"
                )
            samples_per_frame = max(1, int(sample_rate * (FRAME_MS / 1000)))
            frame_bytes = samples_per_frame * 2
            pcm = wav.readframes(wav.getnframes())
        for offset in range(0, len(pcm), frame_bytes):
            chunk = pcm[offset:offset + frame_bytes]
            if len(chunk) < frame_bytes:
                chunk += b"\x00" * (frame_bytes - len(chunk))
            frames.append(
                rtc.AudioFrame(
                    data=chunk,
                    sample_rate=sample_rate,
                    num_channels=CHANNELS,
                    samples_per_channel=samples_per_frame,
                )
            )
        return frames

    async def close(self) -> None:
        await self._client.aclose()
