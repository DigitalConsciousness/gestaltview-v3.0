# Voice Integration Checklist

## Goal

Add voice to the Agent Trainer without shipping founder-owned keys, hidden providers, or silent transcript retention.

## What the package now covers

- assistant UI affordances for voice capture and transcript export
- a buyer-owned checklist for capture, transcription, audio return, and retention policy
- optional voice environment placeholders in `setup/env.example`

## Recommended rollout

1. Pick a capture path: browser recorder, WebRTC, or telephony gateway.
2. Send audio to a buyer-owned server or edge function for speech-to-text.
3. Pass the transcript into the existing assistant path for retrieval and response generation.
4. Decide whether the response returns text, audio, or both.
5. Export transcripts for review before promoting anything into long-lived memory.

## Environment posture

These variables are intentionally generic so the buyer can map them to their preferred provider stack:

- `VOICE_INPUT_PROVIDER`
- `VOICE_OUTPUT_PROVIDER`
- `VOICE_CAPTURE_MODE`
- `VOICE_TRANSCRIPT_BUCKET`
- `VOICE_WEBHOOK_SECRET`

## Shipping rule

Do not place speech provider credentials in the browser bundle or the distributable zip. Keep them in the buyer's deployment environment, GitHub secrets, or hosted function configuration.
