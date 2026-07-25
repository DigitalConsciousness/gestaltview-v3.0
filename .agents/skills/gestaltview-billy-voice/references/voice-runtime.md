# Billy Voice Runtime Map

`billy_voice/` is the Python voice worker that wraps Billy's existing text brain in a realtime spoken loop.

## Voice path

1. Browser audio enters a LiveKit room.
2. `billy_voice/app.py` subscribes to remote audio and drives the session lifecycle.
3. `billy_voice/whisper_stt.py` buffers PCM, applies simple silence detection, and emits transcript text.
4. `/api/billy` remains the source of response content.
5. `billy_voice/style_planner.py` converts Billy's text into delivery dimensions and per-segment cues.
6. `billy_voice/cosyvoice_tts.py` maps the style plan into a CosyVoice instruct prompt and streams audio back into the room.

## Source-of-truth file map

- `billy_voice/app.py`: room connection, turn loop, interruption behavior, Billy API bridge
- `billy_voice/whisper_stt.py`: buffering, resampling, silence detection, Whisper transcription
- `billy_voice/style_planner.py`: Billy vocal affect model, presets, heuristics, CosyVoice prompt translation
- `billy_voice/cosyvoice_tts.py`: CosyVoice HTTP client, audio frame streaming, fallback behavior
- `billy_voice/README.md`: local bring-up and milestone checklist
- `client/src/pages/BillyVoiceStudioPage.tsx`: browser-side staging surface for the voice runtime

## Invariants

- Billy's wording still comes from `/api/billy`; the voice runtime should not invent its own response layer.
- Voice feel belongs in `StylePlanner`, not in scattered one-off prompt strings.
- Interruption matters as much as correctness. If Billy cannot stop speaking promptly, the experience is broken.
- Setup docs must match the actual package layout. Drift here blocks everyone before runtime debugging even starts.

## Pairing guidance

- If you change spoken style because Billy's persona should change, pair this skill with `gestaltview-billy-intelligence`.
- If you change the Billy request or response payload, pair this skill with `gestaltview-billy-api`.
- If you are touching deployment, validation, or rollout mechanics, pair this skill with `gestaltview-workflow-operations`.
