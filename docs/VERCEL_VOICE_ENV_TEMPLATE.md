# Vercel Voice Env Template

Use this as the voice-specific subset when adding environment variables in Vercel.

## Server-side

```env
DEEPGRAM_API_KEY=
DEEPGRAM_BILLY_TTS_MODEL=aura-2-aries-en
DEEPGRAM_BILLY_TTS_SPEED=0.98
VOICE_PROFILE_SLUG=billy
VOICE_PROFILE_REGISTRY=config/deepgram_voice_profiles.json
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
BILLY_API_URL=
```

## Browser-visible

```env
VITE_BILLY_VOICE=deepgram
VITE_BILLY_BROWSER_VOICE_NAME=
```

## Notes

- `VITE_BILLY_VOICE=deepgram` keeps hosted Deepgram playback as the default.
- Set `VITE_BILLY_VOICE=browser` only if you want the explicit browser fallback.
- Keep `DEEPGRAM_API_KEY` server-only.
