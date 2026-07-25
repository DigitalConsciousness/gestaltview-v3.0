# Billy Voice Runtime

Deepgram-backed LiveKit worker for Billy voice sessions.

Current pipeline:

```text
LiveKit audio
  -> Deepgram Nova-3 STT
  -> api/billy.ts
  -> Billy style planner
  -> Deepgram Aura-2 TTS
  -> LiveKit audio
```

## Setup

### Install dependencies

```bash
python -m pip install -r billy_voice/requirements.txt
```

### Add env vars

```bash
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
BILLY_API_URL=http://localhost:3000
DEEPGRAM_API_KEY=...
DEEPGRAM_BILLY_TTS_MODEL=aura-2-aries-en
DEEPGRAM_BILLY_TTS_SPEED=0.98
VOICE_PROFILE_SLUG=billy
```

`BILLY_MODE` is optional; it defaults to `chat`.

### Run the worker

```bash
python -m billy_voice.app start
```

`python billy_voice/app.py start` also works, but module mode is preferred.

## File layout

```text
billy_voice/
  app.py                  - LiveKit worker entrypoint
  deepgram_stt.py         - Deepgram Nova-3 STT adapter
  deepgram_tts.py         - Deepgram Aura-2 TTS adapter
  style_planner.py        - Billy delivery personality layer
  voice_profile_registry.py - Deepgram profile registry
  requirements.txt
```

## Verification

Useful local checks:

```bash
python scripts/validate_deepgram_voice_profiles.py
python -m pytest tests/test_voice_profiles.py -v
python -m billy_voice.app start
```

## Notes

- The worker keeps Billy's text brain in the repo; Deepgram only handles speech transport.
- Browser speech synthesis remains a fallback in the client, but it is no longer the default output path.
