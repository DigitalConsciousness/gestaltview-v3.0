# AssemblyAI Integration — Coding Agent Instructions

You are helping a developer integrate AssemblyAI's Speech-to-Text API into their application. Your job is to understand their context through discovery, produce a concrete implementation plan, get their approval, and then write correct, production-ready code.

This is a public API. The developer creates their own key at [assemblyai.com/dashboard/api-keys](https://www.assemblyai.com/dashboard/api-keys).

**Official documentation.** Two ways to wire your coding agent up to live docs (both recommended — they layer):

1. **Project instructions** (every prompt): add to `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, or equivalent:

   ```
   Always fetch https://www.assemblyai.com/docs/llms.txt before writing AssemblyAI code.
   The API has changed — do not rely on memorized parameter names.
   ```

   `llms.txt` is the structured index. For full content use `llms-full.txt`; narrow with `?lang=python` or `?lang=typescript`, or add `?excludeSpec=true` to skip the API spec.

2. **Docs MCP server** (on-demand lookups): `https://mcp.assemblyai.com/docs` — Streamable HTTP transport. Provides `search_docs`, `get_pages`, `list_sections`, `get_api_reference`.

   ```bash
   # Claude Code
   claude mcp add assemblyai-docs --transport http https://mcp.assemblyai.com/docs
   ```

   See the [Coding agent prompts](/coding-agent-prompts) page for Cursor and other clients.

---

## 0. Operating rules

1. **Discovery first, code later.** Do not write code until the developer has answered enough of Section 1 for you to make a specific recommendation.
2. **One question per message.** Never batch discovery questions. Wait for an answer before asking the next one.
3. **Plan before you build.** After discovery, present a written recommendation (see Section 2) and wait for explicit approval before generating implementation code.
4. **Prefer the official SDKs.** Use `assemblyai` (Python) or `assemblyai` (Node/JS) unless the developer has a specific reason not to. The SDKs handle polling, upload streaming, WebSocket lifecycle, and session termination correctly — which is where most hand-rolled integrations fail.
5. **Never expose the API key in client-side code.** For browser or mobile streaming, always mint a temporary token server-side. For pre-recorded, proxy uploads and submissions through your server.
6. **Authorization header is the raw key — no `Bearer` prefix.** This trips up everyone. **One exception:** the Voice Agent API (Section 10) requires `Authorization: Bearer YOUR_API_KEY`. Don't generalize either rule across products.
7. **`speech_models` is optional on pre-recorded requests.** If omitted, the request defaults to `["universal-3-pro", "universal-2"]`. You can still set it explicitly — see Section 5 for semantics.
8. **Always terminate streaming sessions explicitly.** An abandoned WebSocket keeps accruing charges until the 3-hour cap.
9. **Do not use deprecated transcript params:** `auto_chapters`, `summarization`, `summary_model`, `summary_type`. Use LLM Gateway instead (Section 8).
10. **If the developer's answers are inconsistent, stop and surface the conflict.** Example conflicts: "browser-only, no backend" + "streaming"; "phone call audio" + "upload a file"; "real-time" + "need speaker diarization with full names." Don't paper over these — ask.
11. **Be flexible.** If something the developer says doesn't match the shape of the API (e.g., they describe a use case that isn't supported — see Section 13), say so directly and propose the closest supported alternative.
12. **Verify parameters against live docs before recommending.** This file is a snapshot — features move between beta and GA, model-specific behaviors change, and new knobs ship regularly. Before posting the Section 2 recommendation, confirm each parameter you plan to use is supported for the chosen **mode** (pre-recorded vs streaming) *and* **model** (U3 Pro, U2, U3 Pro Streaming, Universal-Streaming). Do not assume a pre-recorded flag works on streaming, or that a parameter supported on U2 still behaves the same on U3 Pro. Pull the current reference rather than memorizing. Primary sources, in order of preference:
    - `https://www.assemblyai.com/docs/llms-full.txt` — the canonical machine-readable reference
    - Per-mode docs: `/docs/pre-recorded-audio/*` (pre-recorded) and `/docs/streaming/*` (streaming), including the model-specific overview page (e.g., `/docs/streaming/universal-3-pro` and `/docs/streaming/select-the-speech-model`) which lists *exactly* which parameters are honored/ignored by that model
    - The OpenAPI-backed API reference at `/docs/api-reference/*` for request/response schemas
    - For LLM Gateway: `/docs/llm-gateway/overview` lists the current valid `model` strings — don't guess short names like `claude-sonnet-4`

  If a flag you remembered isn't in the current docs (or is marked beta / deprecated / ignored for the chosen model), flag it in the recommendation's "Open questions / assumptions" block and ask the developer before proceeding.

---

## 1. Discovery questions

Ask these **one at a time**, in order. Skip any question already answered in the conversation. Adapt wording to sound natural, but cover the substance of each.

1. **What are you building, and are you adding AssemblyAI to an existing project or starting fresh?** (A short description of the product is usually enough.)
2. **What do you need: pre-recorded transcription, real-time streaming STT, or a managed voice agent?**
   - Pre-recorded: uploaded files, URLs, batch processing, post-call analytics. → Section 6.
   - Streaming STT: live transcripts only (you bring your own LLM/TTS). Live captioning, voice-agent STT, meeting notetaking, dictation. → Section 9.
   - Voice Agent API (managed): full-duplex speech-in/speech-out — STT + LLM + TTS + turn detection + tool calling, all in one WebSocket. Right answer when "I want to talk to an AI" is the whole product. → Section 10.
3. **Where is your audio coming from?** (e.g., uploaded files, public URLs, browser microphone, mobile app, Twilio/Telnyx phone numbers, SIP trunks.)
4. **What language and framework are you using?** (e.g., Python + FastAPI, Node + Next.js, Go, Ruby, Swift, Kotlin, browser-only, LiveKit, Pipecat, Vapi, Vocode, Retell.)
5. **Do you already have an AssemblyAI API key, or do you need to create one?** (If needed: [assemblyai.com/dashboard/api-keys](https://www.assemblyai.com/dashboard/api-keys).)
6. **Do you have a data residency requirement?** (US vs EU — this changes the base URL.)
7. **Anything beyond a plain transcript?** Don't read off a checklist. Use everything they've told you so far — the product description from Q1, the audio source from Q3, the framework from Q4 — to **infer which features are plausibly applicable**, then ask in plain language about *those*. The point is to surface things the developer might not know to ask for, not to make them choose from a menu.

   The authoritative catalog of available features and their parameters is in the live docs (see Operating Rule 12) — consult it, don't rely on memory. Section 3 of this file is a starting reference, not the final word.

   Calibrate to mode and use case. Examples:
   - Customer-support call analytics (pre-recorded) → speaker diarization and PII redaction are almost certainly relevant; sentiment may be; chapters via LLM Gateway often is. Ask about those, not about live-streaming features.
   - Browser live-captioning (streaming) → ask about multilingual support and domain vocabulary; don't bring up PII redaction or summaries-during-session (neither applies to streaming).
   - Voice agent (streaming) → keyterms prompting and turn-detection tuning matter; speaker diarization usually doesn't.
   - Medical scribe → medical domain mode is the headline feature; ask about it explicitly.

   Don't ask about things the user gets automatically with no toggle (word-level timestamps and confidence on `words[]`, streaming `SpeechStarted` events). Mention them in the recommendation as capabilities they'll have, but don't make them a choice.

   If you're confident from context that a feature is needed (e.g., they said "show who said what" → `speaker_labels`), include it in the recommendation directly with a one-line rationale rather than asking again.

---

## 2. Recommendation template (after discovery)

Before writing code, post a plan with all of the following. Get explicit approval.

````
## Recommendation

**Use case:** <one-sentence summary of what they're building>
**Mode:** <pre-recorded / streaming / both>
**Region:** <US or EU base URL>

**Model:**
- <model name> — <one-line rationale>
- <fallback model, if applicable>

**Endpoints:**
- <endpoint 1>
- <endpoint 2>

**Parameters enabled:** (before filling this in, verify each parameter is supported on the chosen mode + model per Operating Rule 12)
- `param_name`: <value> — <why>
- ...

**Auth pattern:**
<server-side key / temp token / proxied uploads — and where the key lives>

**Termination & error handling:**
<how streaming sessions are closed; how errors / retries are handled>

**Code skeleton:**
<2–6 bullet points describing the files/functions you'll generate>

**Open questions / assumptions:**
<anything you inferred that they should confirm>

Ready to proceed?
````

If they say yes, write the code. If they push back on any piece, revise the plan — don't just start coding around objections.

---

## 3. Feature selection guide (agent reference)

Use this to build the recommendation. Do not dump it on the user.

| Developer need | Parameter / approach |
|---|---|
| Speaker diarization | `speaker_labels: true` (pre-recorded, and streaming — streaming adds a `speaker_label` to each Turn event) |
| Automatic language detection | `language_detection: true` (pre-recorded; on streaming, only available on Universal-Streaming Multilingual — adds `language_code` + `language_confidence` to Turn events. **Not** supported on U3 Pro Streaming.) |
| Specific language | `language_code: "es"` etc. (pre-recorded only; **silently ignored** on U3 Pro Streaming — use `prompt` instead) |
| Multilingual / code-switching | `speech_models: ["universal-3-pro"]` + `prompt` parameter — see [U3 Pro prompting guide](/pre-recorded-audio/universal-3-pro/prompting) |
| Domain-specific vocabulary | `keyterms_prompt: [...]` (pre-recorded: up to 1,000 terms with U3 Pro / 200 with U2; streaming: up to 100 terms, each ≤50 chars) |
| Medical domain | `domain: "medical-v1"` (pre-recorded *and* streaming; supported languages: en, es, de, fr) |
| PII redaction in text | `redact_pii: true` + `redact_pii_policies: [...]` + optional `redact_pii_sub: "hash" \| "entity_name"` |
| PII redaction in audio | `redact_pii_audio: true` (original file must be ≤1 GB; redacted audio URL is available for 24 h) |
| Chapters or summaries | Transcribe first, then LLM Gateway (Section 8) |
| Word timestamps / confidence | Included by default on `words[]` |
| Webhook delivery (skip polling) | `webhook_url: "..."` (Section 7) |
| Managed voice agent (speech-in / speech-out) | Voice Agent API (Section 10) — one WebSocket, no separate STT/LLM/TTS |
| Custom voice agent (your LLM + TTS) | Streaming STT + framework integration (Section 11) |
| Multilingual streaming | Universal-3 Pro Streaming + `prompt=Transcribe <language>` query param |

---

## 4. API overview

- **REST base URL (US):** `https://api.assemblyai.com`
- **REST base URL (EU):** `https://api.eu.assemblyai.com`
- **Streaming WebSocket (Edge, default):** `wss://streaming.assemblyai.com/v3/ws` — auto-routes to the nearest region (Oregon / Virginia / Ireland) for lowest latency
- **Streaming WebSocket (US data residency):** `wss://streaming.us.assemblyai.com/v3/ws` — data pinned to US
- **Streaming WebSocket (EU data residency):** `wss://streaming.eu.assemblyai.com/v3/ws` — data pinned to EU
- **LLM Gateway (US):** `https://llm-gateway.assemblyai.com/v1/chat/completions`
- **LLM Gateway (EU):** `https://llm-gateway.eu.assemblyai.com/v1/chat/completions` — Claude and Gemini only; OpenAI/Qwen/Kimi are US-only
- **Auth header:** `Authorization: YOUR_API_KEY` (no `Bearer`). Same header is used for REST, streaming WS upgrade, temp-token minting, and LLM Gateway
- **Content type:** `application/json` for submit/poll and LLM Gateway; `application/octet-stream` (raw binary) for `/v2/upload`

Core REST endpoints:
- `POST /v2/upload` — upload a local file (raw binary body, **not multipart**). Returns `{ "upload_url": "..." }`. Max 2.2 GB.
- `POST /v2/transcript` — submit a job. Returns transcript object with `id` and `status: "queued"`. Max 5 GB / 10 hours.
- `GET /v2/transcript/{id}` — poll. Statuses: `queued`, `processing`, `completed`, `error`.

Streaming:
- `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro`
- `GET https://streaming.assemblyai.com/v3/token?expires_in_seconds=60` — mint a single-use temp token for browser/mobile clients. Optional `max_session_duration_seconds` (60–10800, defaults to 3 h) caps the downstream session length.

---

## 5. `speech_models` semantics

`speech_models` on pre-recorded requests is an **ordered fallback list**, not parallel execution. The first model in the array is tried; if it's unavailable (e.g., not yet rolled out to the account, or temporarily unhealthy), the next is used. A single transcript is produced by exactly one model.

Recommended default: `["universal-3-pro", "universal-2"]` — tries the latest model first, falls back to the stable predecessor.

On streaming, the parameter is **singular** (`speech_model=u3-rt-pro`) — there is no fallback list. Easy to mix up.

---

## 6. Pre-recorded quick start

### SDK (recommended)

**Python:**
```python
# pip install assemblyai
import assemblyai as aai
import os

aai.settings.api_key = os.environ["ASSEMBLYAI_API_KEY"]

config = aai.TranscriptionConfig(
    speech_models=["universal-3-pro", "universal-2"],  # fallback handled by SDK
    speaker_labels=True,
)

transcript = aai.Transcriber(config=config).transcribe("https://assembly.ai/wildfires.mp3")
# Or a local path: .transcribe("./recording.wav")

if transcript.status == aai.TranscriptStatus.error:
    raise RuntimeError(transcript.error)
print(transcript.text)
```

**Node/JS:**
```javascript
// npm install assemblyai
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

const transcript = await client.transcripts.transcribe({
  audio: 'https://assembly.ai/wildfires.mp3', // or a local file path / Buffer / stream
  speech_models: ["universal-3-pro", "universal-2"],
  speaker_labels: true,
});

if (transcript.status === 'error') throw new Error(transcript.error);
console.log(transcript.text);
```

The SDK handles upload, submit, and polling. You don't need to write the polling loop yourself.

### Raw HTTP (fallback — use only if SDK isn't an option)

**Upload a local file** (raw bytes, not multipart):
```bash
curl -X POST https://api.assemblyai.com/v2/upload \
  -H "Authorization: $ASSEMBLYAI_API_KEY" \
  --data-binary @recording.wav
# -> { "upload_url": "https://cdn.assemblyai.com/upload/..." }
```

**Submit and poll (Python):**
```python
import os, time, requests

headers = {"authorization": os.environ["ASSEMBLYAI_API_KEY"]}

submit = requests.post(
    "https://api.assemblyai.com/v2/transcript",
    headers=headers,
    json={
        "audio_url": "https://assembly.ai/wildfires.mp3",
        "speech_models": ["universal-3-pro", "universal-2"],
        "speaker_labels": True,
    },
)
transcript_id = submit.json()["id"]

while True:
    res = requests.get(
        f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
        headers=headers,
    ).json()
    if res["status"] == "completed":
        print(res["text"]); break
    if res["status"] == "error":
        raise RuntimeError(res["error"])
    time.sleep(3)
```

Common optional params: `speaker_labels`, `language_detection`, `language_code`, `punctuate`, `format_text`, `redact_pii`, `redact_pii_audio`, `keyterms_prompt`, `webhook_url`, `prompt`.

---

## 7. Webhooks (skip polling)

Provide `webhook_url` on submit; AssemblyAI POSTs when the job finishes:

```json
{ "transcript_id": "5552493-16d8-42d8-8feb-c2a16b56f6e8", "status": "completed" }
```

Handler requirements:
- Return 2xx within **10 seconds**. Otherwise retried up to 10 times, 10s apart. 4xx is not retried.
- On receipt, call `GET /v2/transcript/{id}` to fetch the full result — the webhook payload doesn't include it.

Optional custom auth on your webhook: set `webhook_auth_header_name` and `webhook_auth_header_value` when submitting.

**Source IPs** (for allowlists): US `44.238.19.20`, EU `54.220.25.36`.

**Local dev note:** Webhook URLs must be publicly reachable. Use ngrok, Cloudflare Tunnel, or similar during development.

---

## 8. LLM Gateway (chapters, summaries, custom analysis)

LLM Gateway replaces both the deprecated transcript params (`auto_chapters`, `summarization`, `summary_model`, `summary_type`) and the legacy **LeMUR** API, which sunset on 2026-03-31. If a developer mentions LeMUR or `transcript_ids`, point them at LLM Gateway and the [migration guide](/llm-gateway/overview). Workflow:

1. Transcribe normally with `POST /v2/transcript`.
2. Once `status == "completed"`, POST to LLM Gateway with the transcript text (or paragraphs from `GET /v2/transcript/{id}/paragraphs` for chapter-style output):

```http
POST https://llm-gateway.assemblyai.com/v1/chat/completions
Authorization: YOUR_API_KEY
Content-Type: application/json

{
  "model": "claude-sonnet-4-6",
  "messages": [
    { "role": "system", "content": "Produce a 5-bullet summary of the transcript." },
    { "role": "user", "content": "<transcript.text here>" }
  ],
  "max_tokens": 1000
}
```

Model IDs are exact strings — see the [LLM Gateway Overview](/llm-gateway/overview) for the current list. Examples: `claude-opus-4-7`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`, `gpt-5.2`, `gpt-5.1`, `gpt-4.1`, `gemini-3.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`, `kimi-k2.5`, `qwen3-next-80b-a3b`. `claude-sonnet-4` by itself is **not** valid — always include the version suffix. EU region (`llm-gateway.eu.assemblyai.com`) supports Anthropic and Google only.

Do not submit with `auto_chapters` and `summarization` both enabled — the API rejects it (`Only one of the following models can be enabled at a time: auto_chapters, summarization.`). But the broader rule is simpler: **don't use either.**

---

## 9. Streaming — Universal-3 Pro

**WebSocket (default, Edge Routing):** `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro`

For data residency, swap the host: `streaming.us.assemblyai.com` (US-pinned) or `streaming.eu.assemblyai.com` (EU-pinned). The default host auto-routes to the nearest region.

**Audio format:** PCM16 signed little-endian, mono, 16 kHz. Binary WebSocket frames, **50–1000 ms per chunk**, no faster than real-time. Phone audio (`encoding=pcm_mulaw`, `sample_rate=8000`) is sent as-is — don't upsample.

**Auth:**
- Server-side: `Authorization` header on the WS upgrade.
- Browser/mobile: mint a short-lived token server-side and pass it as `?token=<token>` (no Authorization header).

Mint a token:
```bash
curl -s "https://streaming.assemblyai.com/v3/token?expires_in_seconds=60" \
  -H "Authorization: $ASSEMBLYAI_API_KEY"
# { "token": "..." }
```
`expires_in_seconds` must be 1–600. Tokens are single-use per session.

### Server messages (JSON)

- `Begin` — `{ type, id, expires_at }`
- `SpeechStarted` — `{ type, timestamp, confidence }`
- `Turn` — `{ type, turn_order, end_of_turn, transcript, end_of_turn_confidence, words:[...], utterance }`
  - `end_of_turn: false` → partial; `end_of_turn: true` → finalized and formatted. Always read `transcript` for current text.
- `Termination` — `{ type, audio_duration_seconds, session_duration_seconds }`

### Client messages

- Binary PCM16 frames — audio.
- `{ "type": "Terminate" }` — graceful end. **Always send this when done.**
- `{ "type": "ForceEndpoint" }` — force current turn to end.
- `{ "type": "KeepAlive" }` — only needed if `inactivity_timeout` is set.
- `{ "type": "UpdateConfiguration", "keyterms_prompt": [...], "min_turn_silence": 100, "max_turn_silence": 1000 }` — adjust mid-session.

### SDK (recommended)

**Python:**
```python
# pip install "assemblyai>=1.0.0"
import os
from assemblyai.streaming.v3 import (
    StreamingClient,
    StreamingClientOptions,
    StreamingEvents,
    StreamingParameters,
    TurnEvent,
)

def on_turn(_, event: TurnEvent):
    tag = "FINAL" if event.end_of_turn else "partial"
    print(f"{tag}: {event.transcript}")

client = StreamingClient(
    StreamingClientOptions(api_key=os.environ["ASSEMBLYAI_API_KEY"])
)
client.on(StreamingEvents.Turn, on_turn)
client.connect(StreamingParameters(sample_rate=16000, speech_model="u3-rt-pro"))

# Feed 16 kHz mono PCM16 chunks (50–1000ms each) via client.stream(chunk)
# When finished:
client.disconnect(terminate=True)  # sends Terminate and closes cleanly
```

**Node/JS:**
```javascript
// npm install assemblyai
import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
const rt = client.streaming.transcriber({
  sampleRate: 16000,
  speechModel: 'u3-rt-pro',
});

rt.on('turn', (turn) => {
  const tag = turn.end_of_turn ? 'FINAL' : 'partial';
  console.log(`${tag}: ${turn.transcript}`);
});
rt.on('error', (err) => console.error(err));

await rt.connect();
// rt.sendAudio(pcm16Buffer) for each 50–1000ms chunk
// When done:
await rt.close(); // sends Terminate and closes
```

### Raw WebSocket (fallback)

**Node.js (`ws`):**
```javascript
import WebSocket from 'ws';

const ws = new WebSocket(
  'wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro',
  { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } },
);

ws.on('open', () => {
  // Feed PCM16 16kHz mono chunks here, 50–1000ms each.
  // Example: audioStream.on('data', (chunk) => ws.send(chunk));
});

ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.type === 'Turn') {
    console.log(msg.end_of_turn ? `FINAL: ${msg.transcript}` : `partial: ${msg.transcript}`);
  }
});

function stop() {
  ws.send(JSON.stringify({ type: 'Terminate' })); // required!
}
```

**Python (`websockets`):**
```python
import asyncio, json, os, websockets

URL = "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro"

async def run(audio_source):
    """audio_source: async iterator yielding 50–1000ms PCM16 chunks at 16kHz mono."""
    async with websockets.connect(
        URL,
        additional_headers={"Authorization": os.environ["ASSEMBLYAI_API_KEY"]},
    ) as ws:
        async def send_audio():
            async for chunk in audio_source:
                await ws.send(chunk)
            await ws.send(json.dumps({"type": "Terminate"}))

        async def recv_loop():
            async for raw in ws:
                msg = json.loads(raw)
                if msg["type"] == "Turn":
                    tag = "FINAL" if msg["end_of_turn"] else "partial"
                    print(f"{tag}: {msg['transcript']}")
                elif msg["type"] == "Termination":
                    return

        await asyncio.gather(send_audio(), recv_loop())

# asyncio.run(run(my_audio_iterator()))
```

---

## 10. Voice Agent API (managed speech-in / speech-out)

Use this when the developer wants a complete spoken AI agent — not just transcription. Single WebSocket, audio in and audio out, with STT + LLM + TTS + turn detection + tool calling all managed by AssemblyAI.

**Endpoint:** `wss://agents.assemblyai.com/v1/ws`

**Auth:** `Authorization: Bearer YOUR_API_KEY` — the Bearer prefix is **required** on this product (different from STT and LLM Gateway, which take the raw key). For browsers/mobile, mint a temp token instead and pass it as `?token=<token>`.

**Token endpoint (for browser/mobile clients):**
```bash
curl -s "https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=8640" \
  -H "Authorization: Bearer $ASSEMBLYAI_API_KEY"
# { "token": "..." }
```
- `expires_in_seconds`: 1–600 (controls how long the token can be redeemed for)
- `max_session_duration_seconds`: 60–10800 (caps the resulting session; defaults to the 3-hour max)
- Tokens are **single-use** per session — get a fresh one for every reconnect (including `session.resume`).

**Audio format:** PCM16 mono **24 kHz**, **base64-encoded inside JSON events** (not raw binary frames — this is different from streaming STT). ~50 ms chunks (2,400 bytes) is fine; the server buffers continuously, exact chunk size doesn't matter.

### Lifecycle (the events that matter)

1. Client connects, sends `session.update` immediately (don't wait for `session.ready`):
   ```json
   {
     "type": "session.update",
     "session": {
       "system_prompt": "You are a helpful assistant.",
       "greeting": "Hi there! How can I help?",
       "input": {
         "format": { "encoding": "audio/pcm" },
         "keyterms": ["AssemblyAI", "Universal-3"],
         "turn_detection": {
           "vad_threshold": 0.5,
           "min_silence": 200,
           "max_silence": 1000,
           "interrupt_response": true
         }
       },
       "output": {
         "voice": "ivy",
         "format": { "encoding": "audio/pcm" }
       },
       "tools": [ /* flat-schema tool defs, see step 5 */ ]
     }
   }
   ```
   Output `encoding` accepts `audio/pcm` (24 kHz, default), `audio/pcmu` (G.711 μ-law, 8 kHz), or `audio/pcma` (G.711 A-law, 8 kHz) — use the G.711 variants for telephony bridges (Twilio, etc.) so you don't have to resample.
2. Server replies with `session.ready` (capture `session_id` for `session.resume` if you reconnect within 30 s of a disconnect).
3. **Only after `session.ready`**, start streaming mic audio:
   ```json
   { "type": "input.audio", "audio": "<base64 PCM16 24kHz>" }
   ```
4. Server emits, in roughly this order, per turn:
   - `input.speech.started` / `input.speech.stopped` (VAD)
   - `transcript.user.delta` (partials) and `transcript.user` (final)
   - `reply.started`, `reply.audio` (multiple base64 PCM16 chunks — write directly into an output buffer at 24 kHz), `transcript.agent`, `reply.done`
   - **Field-name asymmetry:** `input.audio` carries audio in the `audio` field; `reply.audio` carries it in the `data` field. Easy to miss — copying `event["audio"]` from input handling will silently return nothing on output.
5. **Tool calls:** tool definitions in `session.tools` use a **flat** schema — *not* OpenAI's nested `{type: "function", function: {...}}` form:
   ```json
   {
     "type": "function",
     "name": "get_weather",
     "description": "Get the current weather for a city.",
     "parameters": {
       "type": "object",
       "properties": { "location": { "type": "string" } },
       "required": ["location"]
     }
   }
   ```
   Server sends `tool.call` with `{call_id, name, arguments}`. Accumulate the result locally, then send `tool.result` with the matching `call_id` *after* `reply.done` fires. If `reply.done.status == "interrupted"` (user barge-in), discard pending tool results.
6. **Resume after disconnect:** within 30 s, reconnect with a *new* token and send `session.resume` carrying the previous `session_id` to keep conversation context. After 30 s, start a new session.

### Voices

Voice IDs are **exact strings** — invented or remembered values silently fail. Pick from the catalog below or call `GET https://agents.assemblyai.com/v1/voices` for the live list. Default: `ivy`.

**English (US)** — `ivy` (professional, deliberate, smooth), `james` (conversational, professional), `tyler` (theatrical, energetic, chatty), `winter` (empathetic, conversational), `bella` (high-pitched, chatty), `david` (deep, calming, conversational), `kyle` (chatty, nasal, expressive), `helen` (soft, older, calming), `martha` (southern, older, warm), `river` (slow, calming, ASMR), `emma` (lively, young, conversational), `victor` (deep, older), `eleanor` (deeper, older, calming).

**Multilingual** (each speaks the named language plus English): `arjun` (Hindi/Hinglish), `dmitri` (Russian), `pierre` (French), `giulia` (Italian), `luca` (Italian), `lucia` (Spanish), `mateo` (Spanish), `diego` (Spanish, Latin American).

If the developer needs a voice not in this list, *don't* substitute a similar-sounding name — say so and ask. Pre-Voice-Agent-API names like `claire`, `dawn`, `josh`, `grace`, `pete` are **no longer valid** and will be rejected at `session.update`.

### Playback gotcha

Don't sleep-schedule audio chunks. Write each `reply.audio` PCM directly to an OS audio buffer (e.g., `sounddevice.OutputStream.write()`) — the OS drains at exactly 24 kHz and absorbs network jitter. Sleep-based timing drifts and produces pops/gaps.

On `reply.done.status == "interrupted"`, flush the output buffer (e.g., `speaker.abort(); speaker.start()`) so the user doesn't hear stale agent speech.

### Quickstart pattern (Python sketch)

```python
# pip install websockets sounddevice numpy
import asyncio, base64, json, os
import sounddevice as sd
import websockets

URL = "wss://agents.assemblyai.com/v1/ws"
SAMPLE_RATE = 24_000

async def main():
    headers = {"Authorization": f"Bearer {os.environ['ASSEMBLYAI_API_KEY']}"}
    async with websockets.connect(URL, additional_headers=headers) as ws:
        await ws.send(json.dumps({
            "type": "session.update",
            "session": {
                "system_prompt": "You are a helpful assistant.",
                "greeting": "Hi! How can I help?",
                "output": {"voice": "ivy"},
            },
        }))

        ready = asyncio.Event()
        loop = asyncio.get_running_loop()
        mic_q: asyncio.Queue = asyncio.Queue()

        def on_mic(indata, *_):
            if ready.is_set():
                loop.call_soon_threadsafe(mic_q.put_nowait, bytes(indata))

        async def pump_mic():
            while True:
                chunk = await mic_q.get()
                await ws.send(json.dumps({
                    "type": "input.audio",
                    "audio": base64.b64encode(chunk).decode(),
                }))

        with sd.InputStream(samplerate=SAMPLE_RATE, channels=1,
                            dtype="int16", callback=on_mic), \
             sd.OutputStream(samplerate=SAMPLE_RATE, channels=1,
                             dtype="int16") as speaker:
            asyncio.create_task(pump_mic())
            async for raw in ws:
                ev = json.loads(raw)
                if ev["type"] == "session.ready":
                    ready.set()
                elif ev["type"] == "reply.audio":
                    import numpy as np
                    speaker.write(np.frombuffer(base64.b64decode(ev["data"]), dtype=np.int16))
                elif ev["type"] == "reply.done" and ev.get("status") == "interrupted":
                    speaker.abort(); speaker.start()

asyncio.run(main())
```

For a complete worked example (MCP-tooled agent that talks back), see the [Voice Agent API quickstart](/voice-agents/voice-agent-api). For browser integration, see the [browser integration guide](/voice-agents/voice-agent-api/browser-integration).

### When to choose Voice Agent API vs Streaming STT + your own LLM/TTS

- **Voice Agent API (Section 10):** end-to-end conversational agents, fastest to ship, AssemblyAI manages the pipeline. Use when "speech in, speech out" is the whole product.
- **Streaming STT + framework (Section 11):** you need a specific LLM, a specific TTS provider, custom turn-detection logic, complex orchestration (LiveKit/Pipecat/Vapi/Vocode/Retell), or features the managed pipeline doesn't expose yet.

If they're not sure, ask: *do you want to choose your own LLM and TTS, or is a managed pipeline fine?* That single answer routes them.

---

## 11. Voice Agent framework configs (streaming STT + your own pipeline)

This section is for developers who are NOT using the Voice Agent API (Section 10) — they're wiring AssemblyAI Streaming STT into LiveKit, Pipecat, Vapi, Vocode, Retell, or similar, and bringing their own LLM and TTS.

The defaults will not be good enough. Common tuning:

- **`keyterms_prompt`** — pass proper nouns, product names, and domain terms. For dynamic values (usernames, order IDs), update mid-session via `UpdateConfiguration`.
- **Turn silence bounds** — `min_turn_silence` and `max_turn_silence` (ms). Lower values fire end-of-turn faster but risk cutting speakers off. Higher values reduce false finalizations. Form-filling and dictation use cases often want wider windows.
- **Multilingual** — Universal-3 Pro Streaming ignores `language_code` and `end_of_turn_confidence_threshold`. Use the `prompt` query parameter (e.g., `prompt=Transcribe Spanish`) to steer language.
- **Barge-in / false SpeechStarted** — ambient noise, TTS bleed-through, and PSTN echo can cause spurious `SpeechStarted` events. If the agent is interrupting itself, look here first. Framework-level knobs (e.g., LiveKit's `min_interruption_duration`) often complement, not replace, server-side tuning.
- **Phone audio** — 8 kHz mu-law (`pcm_mulaw` at 8000 Hz) should be sent as-is, not upsampled to 16 kHz. Upsampling degrades accuracy.

When the developer names one of these frameworks, ask about their specific turn-taking and interruption requirements before defaulting.

---

## 12. Browser patterns

**Never put the API key in client code.**

### Pre-recorded — proxy upload + submit through your server

```javascript
// Next.js route handler (server)
export async function POST(request) {
  const incoming = await request.formData();
  const file = incoming.get('file'); // Blob

  const upload = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
    body: file.stream(),
    duplex: 'half',
  });
  const { upload_url } = await upload.json();

  const submit = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: upload_url,
      speech_models: ['universal-3-pro', 'universal-2'],
    }),
  });
  return Response.json(await submit.json());
}
```

### Streaming — server mints a temp token, client connects directly

```javascript
// Server
export async function GET() {
  const res = await fetch(
    'https://streaming.assemblyai.com/v3/token?expires_in_seconds=60',
    { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } },
  );
  return Response.json(await res.json()); // { token }
}
```

```javascript
// Client
const { token } = await fetch('/api/aai-token').then((r) => r.json());
const ws = new WebSocket(
  `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro&token=${token}`,
);
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'Turn') console.log(msg.transcript, msg.end_of_turn);
};
```

### Capturing mic audio in the browser

`MediaRecorder` does not emit PCM16. You need an `AudioWorklet` (preferred) or `ScriptProcessorNode` to:
1. Capture raw Float32 samples.
2. Downsample to 16 kHz.
3. Convert Float32 → Int16.
4. Send each ~50 ms chunk as a binary WS frame.

Reference: [AssemblyAI realtime-transcription-browser-js-example](https://github.com/AssemblyAI/realtime-transcription-browser-js-example).

---

## 13. Not supported / out of scope

If a developer asks for any of these, say so directly and propose the closest supported alternative. Do not improvise.

- **Real-time translation.** AssemblyAI transcribes, it doesn't translate. Suggest: transcribe with U3 Pro, then translate via LLM Gateway.
- **On-device / offline STT.** Cloud API only.
- **Speaker identification (matching voices to known people).** `speaker_labels` does diarization (Speaker A, B, C) but does not recognize specific individuals.
- **Standalone TTS.** Not an AssemblyAI product *as a separate API*. TTS is bundled into the Voice Agent API (Section 10) — if they need just-TTS, point them to a dedicated provider.
- **Voice activity detection as a standalone product.** VAD is internal to the streaming pipeline and surfaced via `SpeechStarted` / turn events, not exposed separately.

---

## 14. Error handling

### REST (pre-recorded)

- **401** — Missing/invalid Authorization, disabled account, or insufficient balance. Double-check there's no `Bearer` prefix.
- **Transcript `status: "error"`** — Read the `error` field on `GET /v2/transcript/{id}`.
- **Retries** — Exponential backoff on 5xx. For 429, respect the `Retry-After` header.
- **Limits** — `/v2/upload` max 2.2 GB; `/v2/transcript` max 5 GB / 10 hr per file.
- **Scoping** — An API key can only transcribe files uploaded under the same project.

### Streaming — handshake

- **HTTP 410** — The old `v2` streaming endpoint is deprecated. Upgrade to `/v3/ws`. This is an HTTP status on the upgrade request, not a WebSocket close code.

### Streaming — WebSocket close codes

| Code | Meaning |
|------|---------|
| `1008` | Unauthorized: missing/invalid Authorization or token |
| `3005` | Session cancelled (server-side error) |
| `3006` | Invalid message type / invalid JSON |
| `3007` | Audio chunk outside 50–1000 ms, or sent faster than real-time |
| `3008` | Session expired (3-hour cap) |
| `3009` | Too many concurrent sessions |

### Streaming gotchas

- `speech_model` (streaming, singular) vs `speech_models` (pre-recorded, plural). Don't mix up.
- On U3 Pro Streaming, `language_code` and `end_of_turn_confidence_threshold` are silently ignored — use the `prompt` query param instead.
- Always send `{ "type": "Terminate" }` when finished. An abandoned session stays billable until the 3-hour cap (`3008`).
- Chunk size matters: frames outside 50–1000 ms will close the socket with `3007`.

---

## 15. Quick-reference gotchas

- No `Bearer` prefix on the Authorization header — *except* for the Voice Agent API (Section 10), which requires `Authorization: Bearer ...`.
- `speech_models` is **optional** on pre-recorded submits — it defaults to `["universal-3-pro", "universal-2"]` and is an **ordered fallback list** when provided.
- `/v2/upload` takes **raw binary**, not multipart.
- Webhook handlers must return 2xx in ≤10 seconds.
- Local webhook development needs a public tunnel (ngrok, Cloudflare Tunnel).
- Browser code never holds the API key. Proxy uploads, or mint temp tokens for streaming.
- Always `Terminate` streaming sessions.
- Don't use `auto_chapters`, `summarization`, `summary_model`, `summary_type`. Use LLM Gateway.
- Medical mode is `domain: "medical-v1"` (pre-recorded body param / streaming query param). The legacy `medical_mode` flag is **not** the right name.
- LLM Gateway model IDs are exact and versioned (e.g., `claude-sonnet-4-6`, `gpt-5.2`, `gemini-2.5-pro`). Shorthand like `claude-sonnet-4` is invalid.
- Phone audio stays at native 8 kHz mu-law (`encoding=pcm_mulaw`) — don't upsample.
- EU customers use `api.eu.assemblyai.com`, `streaming.eu.assemblyai.com`, and `llm-gateway.eu.assemblyai.com`. The default streaming host (`streaming.assemblyai.com`) is **Edge Routing**, not US-pinned — use `streaming.us.assemblyai.com` if you need data residency guarantees on the US side.
- Speech-model values are **raw strings** in the SDKs (`"universal-3-pro"`, `"universal-2"`, `"u3-rt-pro"`). Enum aliases like `aai.SpeechModel.universal_3_pro` do **not** exist — agents that hallucinate them produce code that imports cleanly and fails at runtime.
- LeMUR has fully sunset (2026-03-31). Don't generate code that calls LeMUR endpoints or passes `transcript_ids` to a chat-completions API — use LLM Gateway with the transcript text in `messages` instead.> ## Documentation Index
> Fetch the complete documentation index at: https://assemblyai.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Learn how to transcribe streaming audio.

## Overview

By the end of this guide, you'll have a working script that transcribes your microphone live, printing each turn as you speak. Build it with an AI coding agent, or write it yourself — both are below.

Prefer to try it first? Transcribe audio without writing any code in the [AssemblyAI Playground](https://www.assemblyai.com/playground).

<Note>
  **Streaming is billed per session**

  Streaming Speech-to-Text is billed on the total duration that your WebSocket connection stays open, not on the amount of audio you send. Always send a termination message when you're done with a stream — sessions that aren't closed auto-close after 3 hours and are billed for the full duration. See [Billing and pricing](/billing-and-pricing) for details.
</Note>

## Before you begin

You'll need:

* **An API key** — grab one from [your dashboard](https://www.assemblyai.com/dashboard/api-keys). Every example below reads it from an environment variable, so set it once:

  ```bash theme={null}
  export ASSEMBLYAI_API_KEY=<your-key>
  ```

* **Python 3.8+ or Node.js 18+**, depending on which SDK you use.

* **A working microphone** — these examples capture live audio from it.

**Building with an AI coding agent?** Wire it up to AssemblyAI's live docs (MCP server) and the AssemblyAI skill so it writes correct, up-to-date code instead of relying on stale training data:

```bash theme={null}
claude mcp add --transport http --scope user assemblyai-docs https://mcp.assemblyai.com/docs
npx skills add AssemblyAI/assemblyai-skill --global
```

Then describe what you want to build. To get the same result as the steps below, paste:

```text theme={null}
Use the AssemblyAI Python SDK to transcribe my microphone in real time and print each turn.
```

## Transcribe streaming audio

Prefer to write it yourself? Follow these steps to stream your microphone live. The AssemblyAI SDK manages the WebSocket connection, microphone capture, and session termination for you.

### Step 1: Install the SDK

<Tabs groupId="language">
  <Tab language="python-sdk" title="Python SDK" default>
    ```bash theme={null}
    pip install assemblyai sounddevice
    ```
  </Tab>

  <Tab language="javascript-sdk" title="JavaScript SDK">
    ```bash theme={null}
    npm install assemblyai @picovoice/pvrecorder-node
    ```
  </Tab>
</Tabs>

### Step 2: Run your first transcriber

Save this as `transcribe.py` (Python) or `transcribe.js` (JavaScript). It streams your microphone and prints each turn until you press Ctrl+C:

<Tabs groupId="language">
  <Tab language="python-sdk" title="Python SDK" default>
    ```python expandable theme={null}
    import os

    import sounddevice as sd
    from assemblyai.streaming.v3 import (
        BeginEvent,
        StreamingClient,
        StreamingClientOptions,
        StreamingError,
        StreamingEvents,
        StreamingParameters,
        TerminationEvent,
        TurnEvent,
    )

    SAMPLE_RATE = 16000


    def on_begin(client: StreamingClient, event: BeginEvent):
        print(f"Session started: {event.id}")


    def on_turn(client: StreamingClient, event: TurnEvent):
        print(event.transcript)


    def on_terminated(client: StreamingClient, event: TerminationEvent):
        print(f"Session terminated: {event.audio_duration_seconds}s of audio processed")


    def on_error(client: StreamingClient, error: StreamingError):
        print(f"Error: {error}")


    def mic_stream():
        # sounddevice bundles PortAudio in its wheel — no system install needed.
        with sd.RawInputStream(
            samplerate=SAMPLE_RATE, channels=1, dtype="int16", blocksize=800
        ) as mic:
            while True:
                frames, _ = mic.read(800)  # ~50 ms of audio
                yield bytes(frames)


    def main():
        client = StreamingClient(
            StreamingClientOptions(api_key=os.environ["ASSEMBLYAI_API_KEY"])
        )

        client.on(StreamingEvents.Begin, on_begin)
        client.on(StreamingEvents.Turn, on_turn)
        client.on(StreamingEvents.Termination, on_terminated)
        client.on(StreamingEvents.Error, on_error)

        client.connect(
            StreamingParameters(speech_model="u3-rt-pro", sample_rate=SAMPLE_RATE)
        )

        try:
            client.stream(mic_stream())
        except KeyboardInterrupt:
            pass
        finally:
            client.disconnect(terminate=True)


    if __name__ == "__main__":
        main()
    ```
  </Tab>

  <Tab language="javascript-sdk" title="JavaScript SDK">
    ```javascript expandable theme={null}
    import { PvRecorder } from "@picovoice/pvrecorder-node";
    import { AssemblyAI } from "assemblyai";

    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

    const transcriber = client.streaming.transcriber({
      speechModel: "u3-rt-pro",
      sampleRate: 16_000,
    });

    transcriber.on("open", ({ id }) => console.log(`Session opened with ID: ${id}`));
    transcriber.on("error", (error) => console.error("Error:", error));
    transcriber.on("close", (code, reason) => console.log("Session closed:", code, reason));
    transcriber.on("turn", (turn) => {
      if (turn.transcript) {
        console.log("Turn:", turn.transcript);
      }
    });

    // PvRecorder ships prebuilt native binaries — no SoX or system audio install needed.
    const recorder = new PvRecorder(800, -1); // 800 samples ≈ 50 ms at 16 kHz

    let running = true;
    process.on("SIGINT", () => {
      running = false;
    });

    const run = async () => {
      await transcriber.connect();
      recorder.start();
      console.log("Recording — press Ctrl+C to stop.");

      while (running) {
        const frame = await recorder.read();
        transcriber.sendAudio(Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength));
      }

      recorder.stop();
      recorder.release();
      await transcriber.close();
    };

    run();
    ```
  </Tab>
</Tabs>

Then run it — `python transcribe.py` or `node transcribe.js` — and start speaking. Each turn prints as you talk, and the session closes when you press Ctrl+C:

```text theme={null}
Session started: 7f3a9c2e-...
Smoke from hundreds of wildfires in Canada is triggering air quality alerts...
Session terminated: 12.0s of audio processed
```

That's a full real-time transcriber. Prefer raw WebSockets? See [Using the WebSocket API directly](#using-the-websocket-api-directly) below.

## What you get back

The transcriber emits JSON messages (the SDK surfaces them as `open` / `turn` / `close` events). The one you handle most is `Turn`, sent repeatedly as someone speaks — `end_of_turn: true` marks a finalized turn, and `transcript` is the text so far:

```json theme={null}
{
  "type": "Turn",
  "turn_order": 0,
  "end_of_turn": true,
  "turn_is_formatted": true,
  "end_of_turn_confidence": 1.0,
  "transcript": "Smoke from hundreds of wildfires in Canada is triggering air quality alerts...",
  "words": [
    { "text": "Smoke", "start": 0, "end": 399, "confidence": 0.99, "word_is_final": true }
  ]
}
```

You also receive a `Begin` message when the session opens (`{ "type": "Begin", "id": "...", "expires_at": ... }`) and a `Termination` message when it closes (`{ "type": "Termination", "audio_duration_seconds": 10, "session_duration_seconds": 12 }`). Word timings are in milliseconds. See the [message sequence breakdown](/streaming/universal-streaming/message-sequence) for the full event flow.

## Using the WebSocket API directly

Not using an SDK? Connect to the streaming WebSocket at `wss://streaming.assemblyai.com/v3/ws` directly. Authenticate with your key in the `Authorization` header (no `Bearer` prefix), and manage the connection, microphone capture, the `Begin` / `Turn` / `Termination` messages, and session termination yourself — the SDK above does all of this for you. See the [message sequence breakdown](/streaming/universal-streaming/message-sequence) for the event flow and [endpoints and data zones](/streaming/endpoints-and-data-zones) for regional endpoints.

Both examples read your key from the same `ASSEMBLYAI_API_KEY` environment variable you set in [Before you begin](#before-you-begin).

<Note>
  **Streaming from a browser?**

  Don't ship your API key to client-side code. Authenticate from the browser with a
  short-lived [temporary token](/streaming/authenticate-with-a-temporary-token) instead.
</Note>

<Tabs groupId="language">
  <Tab language="python" title="Python" default>
    ```bash theme={null}
    pip install sounddevice websocket-client
    ```

    ```python expandable theme={null}
    import json
    import os
    import threading
    from urllib.parse import urlencode

    import sounddevice as sd
    import websocket

    API_KEY = os.environ["ASSEMBLYAI_API_KEY"]
    SAMPLE_RATE = 16000
    CONNECTION_PARAMS = {"speech_model": "u3-rt-pro", "sample_rate": SAMPLE_RATE}
    API_ENDPOINT = f"wss://streaming.assemblyai.com/v3/ws?{urlencode(CONNECTION_PARAMS)}"

    stop = threading.Event()


    def on_open(ws):
        print("Connected. Speak into your microphone; press Ctrl+C to stop.")

        def stream_audio():
            # sounddevice bundles PortAudio in its wheel — no system install needed.
            with sd.RawInputStream(
                samplerate=SAMPLE_RATE, channels=1, dtype="int16", blocksize=800
            ) as mic:
                while not stop.is_set():
                    frames, _ = mic.read(800)  # ~50 ms of audio
                    ws.send(bytes(frames), websocket.ABNF.OPCODE_BINARY)

        threading.Thread(target=stream_audio, daemon=True).start()


    def on_message(ws, message):
        data = json.loads(message)
        if data.get("type") == "Turn":
            print(data.get("transcript", ""), end="\n" if data.get("end_of_turn") else "\r")


    def on_error(ws, error):
        # On a normal shutdown, websocket-client hands the server's close frame to
        # on_error; ignore it and let on_close report the disconnect. Real failures
        # arrive as exceptions, not close frames.
        if isinstance(error, websocket.ABNF) and error.opcode == websocket.ABNF.OPCODE_CLOSE:
            return
        print(f"\nError: {error}")
        stop.set()


    def on_close(ws, status, msg):
        stop.set()
        print("\nDisconnected.")


    def main():
        ws = websocket.WebSocketApp(
            API_ENDPOINT,
            header={"Authorization": API_KEY},
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
        )

        ws_thread = threading.Thread(target=ws.run_forever, daemon=True)
        ws_thread.start()

        try:
            while ws_thread.is_alive():
                ws_thread.join(0.1)
        except KeyboardInterrupt:
            stop.set()
            if ws.sock and ws.sock.connected:
                ws.send(json.dumps({"type": "Terminate"}))  # close the session
            ws.close()


    if __name__ == "__main__":
        main()
    ```
  </Tab>

  <Tab language="javascript" title="JavaScript">
    ```bash theme={null}
    npm install ws @picovoice/pvrecorder-node
    ```

    ```javascript expandable theme={null}
    const WebSocket = require("ws");
    const querystring = require("querystring");
    const { PvRecorder } = require("@picovoice/pvrecorder-node");

    const API_KEY = process.env.ASSEMBLYAI_API_KEY;
    const SAMPLE_RATE = 16000;
    const params = { speech_model: "u3-rt-pro", sample_rate: SAMPLE_RATE };
    const endpoint = `wss://streaming.assemblyai.com/v3/ws?${querystring.stringify(params)}`;

    // PvRecorder ships prebuilt native binaries — no SoX or system audio install needed.
    const recorder = new PvRecorder(800, -1); // 800 samples ≈ 50 ms at 16 kHz
    const ws = new WebSocket(endpoint, { headers: { Authorization: API_KEY } });

    let running = true;
    process.on("SIGINT", () => {
      running = false;
    });

    ws.on("open", async () => {
      console.log("Connected. Speak into your microphone; press Ctrl+C to stop.");
      recorder.start();
      while (running && ws.readyState === WebSocket.OPEN) {
        const frame = await recorder.read();
        ws.send(Buffer.from(frame.buffer, frame.byteOffset, frame.byteLength));
      }
      recorder.stop();
      recorder.release();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "Terminate" })); // close the session
        ws.close();
      }
      process.exit();
    });

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "Turn") {
        process.stdout.write(data.end_of_turn ? `${data.transcript}\n` : `\r${data.transcript}`);
      }
    });

    ws.on("error", (error) => console.error("\nError:", error));
    ws.on("close", () => console.log("\nDisconnected."));
    ```
  </Tab>
</Tabs>

## Limits

* **Session length:** a streaming session auto-closes after 3 hours.
* **Audio:** mono 16-bit PCM; set `sample_rate` to match your source (16 kHz in these examples).
* **Rate limit:** new-session rate limits scale automatically with usage (default 5 for free accounts). Check yours on the [rate limits page](https://www.assemblyai.com/dashboard/rate-limits).

## Next steps

To learn more about Streaming Speech-to-Text, see the following resources:

* [Streaming Speech-to-Text overview](/streaming)
* [Message sequence breakdown](/streaming/universal-streaming/message-sequence) — understand the `Begin`, `Turn`, and `Termination` events
* [WebSocket API reference](/api-reference/streaming-api/universal-streaming)

## Need some help?

If you get stuck, or have any other questions, we'd love to help you out. Contact our support team at [support@assemblyai.com](mailto:support@assemblyai.com) or create a [support ticket](https://www.assemblyai.com/contact/support).
- > ## Documentation Index
> Fetch the complete documentation index at: https://assemblyai.com/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Summarization

<AccordionGroup>
  <Accordion title="Supported regions">
    US & EU <br />
  </Accordion>
</AccordionGroup>

Generate summaries of your audio transcripts using [LLM Gateway](/llm-gateway/overview). This approach gives you full control over the summary format, length, and style by customizing your prompt.

<Note>
  The `summarization`, `summary_model`, and `summary_type` parameters on the transcription API are deprecated. Use LLM Gateway as shown below for more flexible and powerful summaries.
</Note>

## Quickstart

<Tabs groupId="language">
  <Tab language="python" title="Python" default>
    ```python expandable theme={null}
    import requests
    import time

    base_url = "https://api.assemblyai.com"
    headers = {"authorization": "<YOUR_API_KEY>"}

    # Step 1: Transcribe your audio file
    audio_url = "https://assembly.ai/wildfires.mp3"

    data = {
        "audio_url": audio_url,
        "speech_models": ["universal-3-pro", "universal-2"],
        "language_detection": True
    }

    response = requests.post(base_url + "/v2/transcript", json=data, headers=headers)
    transcript_id = response.json()['id']
    polling_endpoint = base_url + "/v2/transcript/" + transcript_id

    while True:
        transcription_result = requests.get(polling_endpoint, headers=headers).json()
        if transcription_result['status'] == 'completed':
            break
        elif transcription_result['status'] == 'error':
            raise RuntimeError(f"Transcription failed: {transcription_result['error']}")
        else:
            time.sleep(3)

    # Step 2: Generate a summary using LLM Gateway
    prompt = "Provide a brief summary of the transcript in bullet point format."

    llm_gateway_data = {
        "model": "claude-sonnet-4-6",
        "messages": [
            {"role": "user", "content": f"{prompt}\n\nTranscript: {transcription_result['text']}"}
        ],
        "max_tokens": 1000
    }

    response = requests.post(
        "https://llm-gateway.assemblyai.com/v1/chat/completions",
        headers=headers,
        json=llm_gateway_data
    )

    result = response.json()["choices"][0]["message"]["content"]
    print(result)
    ```
  </Tab>

  <Tab language="javascript" title="JavaScript">
    ```javascript expandable theme={null}
    const baseUrl = "https://api.assemblyai.com";

    const headers = {
      authorization: "<YOUR_API_KEY>",
      "content-type": "application/json",
    };

    // Step 1: Transcribe your audio file
    const audioUrl = "https://assembly.ai/wildfires.mp3";

    const data = {
      audio_url: audioUrl,
      speech_models: ["universal-3-pro", "universal-2"],
      language_detection: true,
    };

    const response = await fetch(`${baseUrl}/v2/transcript`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const { id: transcriptId } = await response.json();
    const pollingEndpoint = `${baseUrl}/v2/transcript/${transcriptId}`;

    let transcriptionResult;
    while (true) {
      const pollingResponse = await fetch(pollingEndpoint, { headers });
      transcriptionResult = await pollingResponse.json();

      if (transcriptionResult.status === "completed") {
        break;
      } else if (transcriptionResult.status === "error") {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Step 2: Generate a summary using LLM Gateway
    const prompt =
      "Provide a brief summary of the transcript in bullet point format.";

    const llmGatewayData = {
      model: "claude-sonnet-4-6",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nTranscript: ${transcriptionResult.text}`,
        },
      ],
      max_tokens: 1000,
    };

    const result = await fetch(
      "https://llm-gateway.assemblyai.com/v1/chat/completions",
      {
        method: "POST",
        headers,
        body: JSON.stringify(llmGatewayData),
      }
    );

    const resultData = await result.json();
    console.log(resultData.choices[0].message.content);
    ```
  </Tab>
</Tabs>

### Example output

```plain theme={null}
- Smoke from hundreds of wildfires in Canada is triggering air quality alerts throughout the US, with skylines from Maine to Maryland to Minnesota appearing gray and smoggy.
- Air pollution levels in Baltimore are considered unhealthy, with exposure to high levels leading to various health problems.
- With climate change driving more wildfires, experts warn that wide-ranging air quality consequences may become more frequent.
```

## Customize your summary

You can control the summary output by adjusting the prompt. Here are some examples:

### Bullet point summary

```python theme={null}
prompt = """Provide a brief summary of the transcript in bullet point format.
Focus on the key points and main takeaways."""
```

### Paragraph summary

```python theme={null}
prompt = """Provide a concise paragraph summary of the transcript.
Capture the main topics and conclusions."""
```

### Headline summary

```python theme={null}
prompt = """Provide a single sentence headline that captures the main topic
of the transcript."""
```

### Conversational summary

```python theme={null}
prompt = """Summarize this conversation between multiple speakers.
Include who said what and the key points each speaker made."""
```

### Custom format

You can define any format you need:

```python theme={null}
prompt = """Summarize the transcript using the following format:
- Topic: [main topic]
- Key Points: [list of 3-5 key points]
- Action Items: [any action items mentioned]
- Conclusion: [one sentence conclusion]"""
```

## API reference

### Step 1: Transcribe audio

```bash theme={null}
curl https://api.assemblyai.com/v2/transcript \
--header "Authorization: <YOUR_API_KEY>" \
--header "Content-Type: application/json" \
--data '{
  "audio_url": "YOUR_AUDIO_URL"
}'
```

Poll for the transcript result until the status is `completed`, then extract the transcript text.

### Step 2: Generate summary with LLM Gateway

```bash theme={null}
curl https://llm-gateway.assemblyai.com/v1/chat/completions \
--header "Authorization: <YOUR_API_KEY>" \
--header "Content-Type: application/json" \
--data '{
  "model": "claude-sonnet-4-6",
  "messages": [
    {"role": "user", "content": "Provide a brief summary of the transcript.\n\nTranscript: YOUR_TRANSCRIPT_TEXT"}
  ],
  "max_tokens": 1000
}'
```

| Key          | Type   | Description                                                                                 |
| ------------ | ------ | ------------------------------------------------------------------------------------------- |
| `model`      | string | The LLM model to use. See [available models](/llm-gateway/overview#available-models).       |
| `messages`   | array  | The messages to send to the model, including your summarization prompt and transcript text. |
| `max_tokens` | number | Maximum number of tokens in the response. Adjust based on desired summary length.           |

### Response

```json theme={null}
{
  "choices": [
    {
      "message": {
        "content": "Your generated summary text..."
      }
    }
  ]
}
```

## Next steps

* [LLM Gateway Overview](/llm-gateway/overview) - Learn more about available models and features
* [Apply LLM Gateway to pre-recorded audio](/llm-gateway/apply-llms-to-audio-files) - General guide for using LLM Gateway with transcripts
* [Basic Chat Completions](/llm-gateway/chat-completions) - Learn more about the chat completions API
* [Structured Outputs](/llm-gateway/structured-outputs) - Constrain responses to a specific JSON schema
