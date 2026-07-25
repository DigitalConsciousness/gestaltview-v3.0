# Billy Voice Current State

Last updated: 2026-07-10 (UTC)

## Scope

This folder now contains the Deepgram-backed Billy voice runtime:

- `app.py`: LiveKit worker entrypoint and session orchestration
- `deepgram_stt.py`: Deepgram Nova-3 STT adapter
- `deepgram_tts.py`: Deepgram Aura-2 TTS adapter
- `voice_profile_registry.py`: Deepgram voice profile registry
- `style_planner.py`: Billy delivery personality layer
- `smoke_publish.py`: local scripted smoke client for room join, audio publish, and interruption testing

The legacy Whisper/CosyVoice files are still present in the folder for reference, but they are no longer the active runtime path.

## Quick Start

From the repo root:

```bash
python -m pip install -r billy_voice/requirements.txt
```

Add the Deepgram env vars:

```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
BILLY_API_URL=http://localhost:3000
DEEPGRAM_API_KEY=...
VOICE_PROFILE_SLUG=billy
```

Then run:

```bash
python -m billy_voice.app start
```

## What Works

The active flow is:

- LiveKit audio is accepted by the Python worker
- Deepgram handles speech-to-text and text-to-speech
- Billy text replies still come from the repo's existing `api/billy.ts` path
- interruption and session shutdown remain part of the worker loop

## Validation

Helpful checks:

```bash
python scripts/validate_deepgram_voice_profiles.py
python -m pytest tests/test_voice_profiles.py -v
```

## Notes

- Browser TTS is now only an explicit client fallback.
- `DEEPGRAM_API_KEY` is required for the active voice worker and the hosted `/api/voice/billy` playback route.
