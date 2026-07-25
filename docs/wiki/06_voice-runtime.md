<!-- PAGE_ID: gestaltview_v2_06_voice-runtime -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [billy_voice/app.py:1-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L1-L21)
- [billy_voice/app.py:77-122](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L77-L122)
- [billy_voice/app.py:128-258](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L128-L258)
- [billy_voice/cosyvoice_tts.py:35-126](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/cosyvoice_tts.py#L35-L126)
- [api/voice/billy.ts:11-86](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/voice/billy.ts#L11-L86)
- [api/session/dashboard.ts:250-269](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L250-L269)

</details>

# Voice Runtime

> **Related Pages**: [[Billy Runtime|04_billy-runtime.md]], [[Data, Memory, And Retrieval|05_data-memory-retrieval.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_pipeline -->
## Voice Pipeline

The Python voice worker now describes the end-to-end path explicitly: LiveKit worker, Deepgram Nova-3 STT, `api/billy.ts`, Billy style planning, Deepgram Aura-2 TTS, then audio back to the caller. Each voice session owns a lifecycle object that subscribes to participant audio, streams transcripts through STT, interrupts in-flight responses when the user starts speaking again, and preserves a session-context object that can be passed back into the Billy text API on later turns.

That design means the voice stack is still not a separate assistant. It is a transport and turn-management layer wrapped around the same Billy text runtime.

Sources: [billy_voice/app.py:1-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L1-L21), [billy_voice/app.py:77-122](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L77-L122), [billy_voice/app.py:128-258](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L128-L258)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_pipeline -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_tts -->
## Speech Synthesis Paths

There are two TTS surfaces in the repo. The Python worker uses Deepgram Aura-2 in voice-profile mode, streaming 24kHz mono PCM back to LiveKit in 40 ms frames. That path is optimized for the conversational worker and can shape delivery using a style plan before synthesis.

Separately, `api/voice/billy.ts` is now a serverless Deepgram proxy. It requires a Deepgram API key and Billy voice profile configuration, accepts text, forwards it to the Deepgram TTS API, and returns `audio/wav` with `no-store` caching. In other words, the repo supports both a LiveKit worker voice stack and a direct serverless Deepgram playback endpoint.

Sources: [billy_voice/cosyvoice_tts.py:35-126](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/cosyvoice_tts.py#L35-L126), [api/voice/billy.ts:11-86](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/voice/billy.ts#L11-L86)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_tts -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_06_voice-runtime_requirements -->
## Runtime Requirements And Mode Flags

The worker depends on `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `BILLY_API_URL`, `DEEPGRAM_API_KEY`, and `VOICE_PROFILE_SLUG`. The dashboard payload reports whether Deepgram, LiveKit, the Billy worker path, and the voice-profile selection appear configured, which gives the authenticated control plane a cheap runtime-health view without needing a separate voice admin UI.

Operationally, voice is still best read as an overlay on the Billy runtime rather than a separate product lane. The required env and dashboard flags are about transport availability, while the actual conversational intelligence still comes from the Billy API.

Sources: [billy_voice/app.py:13-20](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/billy_voice/app.py#L13-L20), [api/session/dashboard.ts:250-269](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L250-L269)
<!-- END:AUTOGEN gestaltview_v2_06_voice-runtime_requirements -->

---
