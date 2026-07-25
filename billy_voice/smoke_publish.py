from __future__ import annotations

import argparse
import asyncio
import os
import uuid
from pathlib import Path

import av
import numpy as np
from livekit import api, rtc

SAMPLE_RATE = 48_000
CHANNELS = 1
SAMPLES_PER_FRAME = 960  # 20ms at 48kHz


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish a local audio file into a LiveKit room for Billy voice smoke tests.")
    parser.add_argument(
        "--audio",
        default="/workspaces/gestaltview-v2/client/public/audio/welcome-to-gestaltview.mp3",
        help="Path to the local audio file to publish.",
    )
    parser.add_argument(
        "--second-audio",
        default=None,
        help="Optional second audio file for interruption testing. Defaults to the first audio file when --interrupt-delay is set.",
    )
    parser.add_argument(
        "--interrupt-delay",
        type=float,
        default=None,
        help="Seconds to wait after the first utterance starts before publishing the second one.",
    )
    parser.add_argument(
        "--room",
        default=None,
        help="Optional room name. If omitted, a random room is created.",
    )
    parser.add_argument(
        "--join-timeout",
        type=float,
        default=25.0,
        help="Seconds to wait for Billy to join the room.",
    )
    parser.add_argument(
        "--settle-time",
        type=float,
        default=12.0,
        help="Seconds to stay in the room after publishing audio.",
    )
    return parser.parse_args()


def build_token(room_name: str) -> str:
    api_key = os.environ.get("LIVEKIT_API_KEY", "devkey")
    api_secret = os.environ.get("LIVEKIT_API_SECRET", "secret")
    return (
        api.AccessToken(api_key, api_secret)
        .with_identity("codex-smoke-user")
        .with_name("Codex Smoke User")
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )
        .to_jwt()
    )


async def ensure_room(room_name: str) -> None:
    url = os.environ.get("LIVEKIT_URL", "ws://127.0.0.1:7880").replace("ws://", "http://").replace("wss://", "https://")
    api_key = os.environ.get("LIVEKIT_API_KEY", "devkey")
    api_secret = os.environ.get("LIVEKIT_API_SECRET", "secret")
    async with api.LiveKitAPI(url, api_key, api_secret) as lk:
        await lk.room.create_room(api.CreateRoomRequest(name=room_name))


def iter_audio_frames(audio_path: Path):
    container = av.open(str(audio_path))
    stream = container.streams.audio[0]
    resampler = av.AudioResampler(format="s16", layout="mono", rate=SAMPLE_RATE)
    chunk_bytes = SAMPLES_PER_FRAME * CHANNELS * 2
    pcm_buffer = bytearray()

    try:
        for frame in container.decode(stream):
            resampled = resampler.resample(frame)
            if resampled is None:
                continue
            resampled_frames = resampled if isinstance(resampled, list) else [resampled]
            for resampled_frame in resampled_frames:
                pcm = np.asarray(resampled_frame.to_ndarray()).reshape(-1).astype(np.int16, copy=False)
                pcm_buffer.extend(pcm.tobytes())

                while len(pcm_buffer) >= chunk_bytes:
                    chunk = bytes(pcm_buffer[:chunk_bytes])
                    del pcm_buffer[:chunk_bytes]
                    yield rtc.AudioFrame(
                        data=chunk,
                        sample_rate=SAMPLE_RATE,
                        num_channels=CHANNELS,
                        samples_per_channel=SAMPLES_PER_FRAME,
                    )
    finally:
        container.close()

    if pcm_buffer:
        padded = bytes(pcm_buffer) + (b"\x00" * (chunk_bytes - len(pcm_buffer)))
        yield rtc.AudioFrame(
            data=padded[:chunk_bytes],
            sample_rate=SAMPLE_RATE,
            num_channels=CHANNELS,
            samples_per_channel=SAMPLES_PER_FRAME,
        )


async def publish_audio(audio_source: rtc.AudioSource, audio_path: Path) -> None:
    print({"publishing": str(audio_path)})
    for frame in iter_audio_frames(audio_path):
        await audio_source.capture_frame(frame)
        await asyncio.sleep(SAMPLES_PER_FRAME / SAMPLE_RATE)


async def wait_for_billy(room: rtc.Room, timeout: float) -> None:
    start = asyncio.get_running_loop().time()
    while not room.remote_participants:
        if asyncio.get_running_loop().time() - start > timeout:
            raise TimeoutError("Billy did not join the room in time.")
        await asyncio.sleep(0.2)


async def main() -> None:
    args = parse_args()
    audio_path = Path(args.audio)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    second_audio_path = Path(args.second_audio) if args.second_audio else audio_path
    if args.interrupt_delay is not None and not second_audio_path.exists():
        raise FileNotFoundError(f"Second audio file not found: {second_audio_path}")

    room_name = args.room or f"codex-billy-smoke-{uuid.uuid4().hex[:8]}"
    await ensure_room(room_name)

    ws_url = os.environ.get("LIVEKIT_URL", "ws://127.0.0.1:7880")
    room = rtc.Room()
    await room.connect(ws_url, build_token(room_name))
    print({"connected": True, "room": room.name, "local_identity": room.local_participant.identity})

    audio_source = rtc.AudioSource(sample_rate=SAMPLE_RATE, num_channels=CHANNELS)
    track = rtc.LocalAudioTrack.create_audio_track("codex-smoke-input", audio_source)
    publication = await room.local_participant.publish_track(
        track,
        rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE),
    )

    try:
        await wait_for_billy(room, args.join_timeout)
        print({"remote_participants": list(room.remote_participants.keys())})

        first_task = asyncio.create_task(publish_audio(audio_source, audio_path))
        second_task = None
        if args.interrupt_delay is not None:
            async def delayed_second_publish() -> None:
                await asyncio.sleep(args.interrupt_delay)
                await publish_audio(audio_source, second_audio_path)

            second_task = asyncio.create_task(delayed_second_publish())

        await first_task
        if second_task is not None:
            await second_task

        await asyncio.sleep(args.settle_time)
    finally:
        await room.local_participant.unpublish_track(publication.sid)
        await room.disconnect()
        print({"disconnected": True})


if __name__ == "__main__":
    asyncio.run(main())
