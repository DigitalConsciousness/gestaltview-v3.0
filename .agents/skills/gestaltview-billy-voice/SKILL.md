---
name: gestaltview-billy-voice
description: Build, debug, and extend Billy's spoken runtime in `gestaltview-v2`. Use this skill when work touches the Python voice worker, Billy Voice Studio, voice API bridging, interruption handling, or STT and TTS orchestration.
---

# Billy Voice

Last reviewed: 2026-03-29

Use this for spoken Billy flows, not general text intelligence. The voice runtime is split between the `billy_voice/` Python worker and the web app's voice studio and API bridge.

## Inspect first
- `billy_voice/app.py`
- `billy_voice/style_planner.py`
- `billy_voice/whisper_stt.py`
- `billy_voice/cosyvoice_tts.py`
- `client/src/pages/BillyVoiceStudioPage.tsx`
- `api/voice/billy.ts`

## Current integrations
- The Python voice worker handles STT, TTS, and session orchestration while the web app provides the user-facing voice studio surface.
- Voice flows meet Billy's main intelligence path through `/api/billy` and shared runtime assumptions.
- Supabase or user-tier context matters when voice access, saved sessions, or founder continuity cross into auth-backed behavior.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-billy-intelligence`
- `gestaltview-billy-api`
- `gestaltview-workflow-operations`

## Done when
- Voice guidance points at the current Python and web files rather than generic voice ideas.
- The bridge between voice runtime, Billy API, and any auth or persistence layer is explicit.
