"""Deepgram Nova-3 utterance STT adapter for the existing LiveKit worker."""
from __future__ import annotations

import asyncio
import io
import logging
import os
import wave
from typing import AsyncIterator

import httpx
import numpy as np
from livekit import rtc

from .voice_profile_registry import VoiceProfile

log = logging.getLogger("gestaltview-deepgram-stt")

TARGET_SAMPLE_RATE = 16_000
SILENCE_THRESHOLD_MS = int(os.environ.get("DEEPGRAM_SILENCE_THRESHOLD_MS", "700"))
MIN_UTTERANCE_MS = int(os.environ.get("DEEPGRAM_MIN_UTTERANCE_MS", "300"))
ENERGY_THRESHOLD = float(os.environ.get("DEEPGRAM_ENERGY_THRESHOLD", "0.005"))


class DeepgramSTT:
    def __init__(self, profile: VoiceProfile, api_key: str | None = None) -> None:
        self.profile = profile
        self.api_key = api_key or os.environ.get("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise RuntimeError("DEEPGRAM_API_KEY is required for Deepgram STT")
        timeout = float(os.environ.get("DEEPGRAM_TIMEOUT_SECONDS", "45"))
        self._client = httpx.AsyncClient(
            base_url="https://api.deepgram.com",
            headers={"Authorization": f"Token {self.api_key}"},
            timeout=timeout,
        )

    async def transcribe_stream(self, audio_stream: rtc.AudioStream) -> AsyncIterator[str]:
        audio_buffer: list[np.ndarray] = []
        silence_frames = 0
        silence_limit = max(1, int((SILENCE_THRESHOLD_MS / 1000) * 50))

        async for event in audio_stream:
            if not isinstance(event, rtc.AudioFrameEvent):
                continue
            frame = event.frame
            pcm = np.frombuffer(frame.data, dtype=np.int16)
            if getattr(frame, "num_channels", 1) > 1:
                pcm = pcm.reshape(-1, frame.num_channels).mean(axis=1).astype(np.int16)
            pcm_float = pcm.astype(np.float32) / 32768.0
            if frame.sample_rate != TARGET_SAMPLE_RATE:
                pcm_float = self._resample(pcm_float, frame.sample_rate, TARGET_SAMPLE_RATE)

            if float(np.abs(pcm_float).mean()) > ENERGY_THRESHOLD:
                audio_buffer.append(pcm_float)
                silence_frames = 0
            elif audio_buffer:
                silence_frames += 1
                if silence_frames >= silence_limit:
                    transcript = await self._transcribe(np.concatenate(audio_buffer))
                    if transcript:
                        yield transcript
                    audio_buffer = []
                    silence_frames = 0

        if audio_buffer:
            transcript = await self._transcribe(np.concatenate(audio_buffer))
            if transcript:
                yield transcript

    async def _transcribe(self, audio: np.ndarray) -> str:
        minimum_samples = int(TARGET_SAMPLE_RATE * (MIN_UTTERANCE_MS / 1000))
        if len(audio) < minimum_samples:
            return ""
        wav_bytes = self._to_wav(audio)
        params: list[tuple[str, str]] = [
            ("model", self.profile.stt_model),
            ("language", self.profile.language),
            ("smart_format", "true"),
            ("punctuate", "true"),
            ("utterances", "true"),
        ]
        for term in self.profile.keyterms[:100]:
            params.append(("keyterm", term))
        response = await self._client.post(
            "/v1/listen",
            params=params,
            content=wav_bytes,
            headers={"Content-Type": "audio/wav"},
        )
        response.raise_for_status()
        data = response.json()
        try:
            transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
        except (KeyError, IndexError, TypeError):
            log.warning("Deepgram STT returned no transcript: %s", data)
            return ""
        request_id = data.get("metadata", {}).get("request_id")
        if request_id:
            log.info("Deepgram STT request_id=%s", request_id)
        return str(transcript).strip()

    @staticmethod
    def _to_wav(audio: np.ndarray) -> bytes:
        pcm16 = np.clip(audio * 32767.0, -32768, 32767).astype(np.int16)
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(TARGET_SAMPLE_RATE)
            wav.writeframes(pcm16.tobytes())
        return buffer.getvalue()

    @staticmethod
    def _resample(audio: np.ndarray, source_rate: int, target_rate: int) -> np.ndarray:
        if source_rate == target_rate:
            return audio
        ratio = target_rate / source_rate
        output_length = max(1, int(len(audio) * ratio))
        return np.interp(
            np.linspace(0, len(audio) - 1, output_length),
            np.arange(len(audio)),
            audio,
        ).astype(np.float32)

    async def close(self) -> None:
        await self._client.aclose()
