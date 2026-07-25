"""GestaltView multi-embodiment voice runtime using Deepgram + LiveKit."""
from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Coroutine, Optional

import httpx
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import AutoSubscribe, JobContext, JobRequest, WorkerOptions, cli

from .deepgram_stt import DeepgramSTT
from .deepgram_tts import DeepgramTTS
from .style_planner import StylePlanner
from .voice_profile_registry import VoiceProfile, VoiceProfileRegistry

load_dotenv()

log = logging.getLogger("gestaltview-voice")
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")

LIVEKIT_URL = os.environ["LIVEKIT_URL"]
LIVEKIT_API_KEY = os.environ["LIVEKIT_API_KEY"]
LIVEKIT_API_SECRET = os.environ["LIVEKIT_API_SECRET"]
BILLY_API_URL = os.environ.get("BILLY_API_URL", "http://localhost:3000").rstrip("/")
VOICE_TEXT_API_PATH = os.environ.get("VOICE_TEXT_API_PATH", "/api/billy")
DEFAULT_PROFILE_SLUG = os.environ.get("VOICE_PROFILE_SLUG", "billy")
DEFAULT_MODE = os.environ.get("BILLY_MODE", "chat")


@dataclass
class TextAPIResult:
    text: str
    session_context: Optional[dict] = None


async def call_text_api(
    message: str,
    profile: VoiceProfile,
    session_context: Optional[dict] = None,
    mode: str = DEFAULT_MODE,
) -> TextAPIResult:
    payload = {
        "message": message,
        "mode": mode,
        "section": "voice",
        "profileSlug": profile.slug,
        "diSlug": profile.slug,
    }
    if session_context:
        payload["sessionContext"] = session_context
    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(f"{BILLY_API_URL}{VOICE_TEXT_API_PATH}", json=payload)
        response.raise_for_status()
    try:
        data = response.json()
    except ValueError:
        return TextAPIResult(text=response.text.strip())
    if isinstance(data, str):
        return TextAPIResult(text=data)
    if isinstance(data, dict):
        text = data.get("response") or data.get("text") or data.get("message") or ""
        context = data.get("sessionContext") or data.get("session_context") or data.get("context")
        return TextAPIResult(
            text=str(text or data),
            session_context=context if isinstance(context, dict) else None,
        )
    return TextAPIResult(text=str(data))


def _metadata_slug(metadata: str | None) -> str | None:
    if not metadata:
        return None
    try:
        parsed = json.loads(metadata)
    except (json.JSONDecodeError, TypeError):
        return None
    if not isinstance(parsed, dict):
        return None
    value = parsed.get("embodimentSlug") or parsed.get("profileSlug") or parsed.get("diSlug")
    return str(value) if value else None


def resolve_profile_slug(ctx: JobContext) -> str:
    room_slug = _metadata_slug(getattr(ctx.room, "metadata", None))
    if room_slug:
        return room_slug
    for participant in ctx.room.remote_participants.values():
        participant_slug = _metadata_slug(getattr(participant, "metadata", None))
        if participant_slug:
            return participant_slug
    return DEFAULT_PROFILE_SLUG


class EmbodimentVoiceSession:
    def __init__(self, ctx: JobContext, profile: VoiceProfile) -> None:
        self.ctx = ctx
        self.profile = profile
        self.stt = DeepgramSTT(profile)
        self.tts = DeepgramTTS(profile)
        self.planner = StylePlanner()
        self.mode = DEFAULT_MODE
        self.session_context: dict = {}
        self.turn_count = 0
        self._interrupted = False
        self._response_task: Optional[asyncio.Task[None]] = None
        self._audio_tasks: set[asyncio.Task[None]] = set()
        self._turn_lock = asyncio.Lock()
        self._shutdown_event = asyncio.Event()

    async def run(self) -> None:
        room = self.ctx.room
        log.info("Voice session started room=%s profile=%s", room.name, self.profile.slug)
        room.on("track_subscribed", self._on_track_subscribed)
        room.on("participant_disconnected", self._on_disconnect)
        try:
            self._spawn_response_task(self._speak(self.profile.greeting), "greeting")
            await self._shutdown_event.wait()
        finally:
            await self._shutdown()

    def _on_disconnect(self, participant: rtc.RemoteParticipant) -> None:
        log.info("Participant disconnected: %s", participant.identity)
        self._shutdown_event.set()
        self.ctx.shutdown()

    def _on_track_subscribed(self, track, publication, participant) -> None:
        if track.kind != rtc.TrackKind.KIND_AUDIO:
            return
        task = asyncio.create_task(
            self._handle_audio_track(track, participant),
            name=f"voice-audio:{participant.identity}",
        )
        self._audio_tasks.add(task)
        task.add_done_callback(self._audio_tasks.discard)
        task.add_done_callback(self._log_task_result)

    async def _handle_audio_track(self, track: rtc.AudioTrack, participant: rtc.RemoteParticipant) -> None:
        audio_stream = rtc.AudioStream(track)
        try:
            async for transcript in self.stt.transcribe_stream(audio_stream):
                if transcript.strip():
                    await self._start_turn(transcript, participant.identity)
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Audio handler failed participant=%s", participant.identity)

    async def _start_turn(self, user_text: str, user_id: str) -> None:
        async with self._turn_lock:
            self.turn_count += 1
            if self._response_task and not self._response_task.done():
                self._interrupted = True
                self._response_task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await self._response_task
            self._interrupted = False
            self._spawn_response_task(
                self._respond(user_text, user_id),
                f"turn-{self.turn_count}",
            )

    async def _respond(self, user_text: str, user_id: str) -> None:
        started = time.monotonic()
        try:
            result = await call_text_api(
                message=user_text,
                profile=self.profile,
                session_context=self.session_context,
                mode=self.mode,
            )
            if result.session_context is not None:
                self.session_context = result.session_context
            response_text = result.text.strip()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            log.error("Text API failure profile=%s error=%s", self.profile.slug, exc)
            response_text = "Something slipped at the handoff. The thread is still here."
        if not response_text:
            response_text = "I'm here. Try that once more."
        log.info(
            "Text response profile=%s user=%s latency=%.2fs",
            self.profile.slug,
            user_id,
            time.monotonic() - started,
        )
        await self._speak(response_text)

    async def _speak(self, text: str) -> None:
        style_plan = self.planner.plan(text, mode=self.mode)
        audio_source = rtc.AudioSource(sample_rate=self.profile.sample_rate, num_channels=1)
        track = rtc.LocalAudioTrack.create_audio_track(
            f"{self.profile.slug}-voice-{int(time.time() * 1000)}",
            audio_source,
        )
        options = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
        publication = None
        try:
            publication = await self.ctx.room.local_participant.publish_track(track, options)
            async for frame in self.tts.synthesize(text, style_plan):
                if self._interrupted:
                    break
                await audio_source.capture_frame(frame)
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("TTS failure profile=%s; leaving text response intact", self.profile.slug)
        finally:
            if publication is not None:
                with contextlib.suppress(Exception):
                    await asyncio.shield(
                        self.ctx.room.local_participant.unpublish_track(publication.sid)
                    )

    async def _shutdown(self) -> None:
        if self._response_task and not self._response_task.done():
            self._response_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._response_task
        for task in tuple(self._audio_tasks):
            task.cancel()
        for task in tuple(self._audio_tasks):
            with contextlib.suppress(asyncio.CancelledError):
                await task
        await self.stt.close()
        await self.tts.close()

    def _spawn_response_task(self, coro: Coroutine[object, object, None], label: str) -> None:
        task = asyncio.create_task(coro, name=f"voice-response:{self.profile.slug}:{label}")
        self._response_task = task
        task.add_done_callback(self._clear_response_task)
        task.add_done_callback(self._log_task_result)

    def _clear_response_task(self, task: asyncio.Task[None]) -> None:
        if self._response_task is task:
            self._response_task = None

    @staticmethod
    def _log_task_result(task: asyncio.Task[None]) -> None:
        with contextlib.suppress(asyncio.CancelledError):
            error = task.exception()
            if error:
                log.error("Background voice task failed: %s", error)


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    registry = VoiceProfileRegistry()
    requested_slug = resolve_profile_slug(ctx)
    profile = registry.get(requested_slug)
    if profile.slug != requested_slug:
        log.warning("Unknown voice profile %s; using %s", requested_slug, profile.slug)
    await EmbodimentVoiceSession(ctx, profile).run()


async def request_handler(req: JobRequest) -> None:
    log.info("Incoming voice room=%s", req.room.name)
    await req.accept()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=request_handler,
            worker_type=agents.WorkerType.ROOM,
            initialize_process_timeout=30.0,
        )
    )
