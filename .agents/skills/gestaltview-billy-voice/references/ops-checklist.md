# Billy Voice Ops Checklist

## Bring-up order

1. Install `billy_voice/requirements.txt`.
2. Start a local LiveKit server.
3. Start the CosyVoice inference server.
4. Confirm the main app and `/api/billy` endpoint are reachable.
5. Launch the worker with `python -m billy_voice.app start`.

## Required environment

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `BILLY_API_URL`
- `COSYVOICE_URL`
- `COSYVOICE_SPEAKER`
- `WHISPER_MODEL`
- `WHISPER_DEVICE`
- `WHISPER_LANGUAGE`
- `BILLY_MODE`

## Fast sanity checks

- `python3 -m compileall billy_voice`
- Boot the worker and confirm it connects to LiveKit without import errors.
- Speak one short utterance and check for a transcript log line.
- Confirm `/api/billy` returns a response string or JSON with `response`/`text`.
- Confirm audio frames are published back to the room and interruption stops playback early.

## Common failure modes

- Import drift: docs say one package layout, code uses another.
- Whisper startup drag: model size or device choice makes local bring-up look hung.
- CosyVoice endpoint mismatch: wrong path, speaker name, or server mode.
- API shape drift: `/api/billy` returns a new payload shape not handled by `call_billy_api`.
- Playback lag: chunking or publish/unpublish behavior causes slow turn-taking.
