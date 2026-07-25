# Deepgram Voice Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Billy voice runtime with the Deepgram-backed package so LiveKit voice sessions, server-side TTS, profile validation, and repo docs all point at the same operational stack.

**Architecture:** Keep Billy's text brain and style planner intact, but swap the speech transport from Whisper/CosyVoice/ElevenLabs to Deepgram in the worker and the hosted voice API. Use the new Deepgram profile registry as the runtime contract source, and keep browser speech synthesis only as an explicit fallback rather than the default path.

**Tech Stack:** Python 3.11, LiveKit agents, Deepgram REST APIs, Vercel serverless routes, Supabase migrations, Vitest.

---

### Task 1: Replace the Python voice worker

**Files:**
- Modify: `billy_voice/app.py`
- Create: `billy_voice/deepgram_stt.py`
- Create: `billy_voice/deepgram_tts.py`
- Create: `billy_voice/voice_profile_registry.py`
- Modify: `billy_voice/requirements.txt`
- Modify: `billy_voice/README.md`

- [ ] **Step 1: Write the failing test**

```python
def test_registry_loads_billy_profile() -> None:
    registry = VoiceProfileRegistry()
    profile = registry.get("billy")
    assert profile.slug == "billy"
    assert profile.tts_model.startswith("aura-2-")
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `python -m pytest billy_voice/tests/test_voice_profiles.py -v`
Expected: import or file-not-found failure until the Deepgram registry lands.

- [ ] **Step 3: Implement the Deepgram worker path**

```python
async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    registry = VoiceProfileRegistry()
    requested_slug = resolve_profile_slug(ctx)
    profile = registry.get(requested_slug)
    await EmbodimentVoiceSession(ctx, profile).run()
```

- [ ] **Step 4: Run the test again**

Run: `python -m pytest billy_voice/tests/test_voice_profiles.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add billy_voice docs/superpowers/plans/2026-07-10-deepgram-voice-swap.md
git commit -m "feat: swap Billy voice runtime to Deepgram"
```

### Task 2: Add the Deepgram registry and profile seed path

**Files:**
- Create: `config/deepgram_voice_profiles.json`
- Create: `scripts/validate_deepgram_voice_profiles.py`
- Create: `scripts/export_deepgram_voice_seed_sql.py`
- Create: `scripts/audition_deepgram_voices.py`
- Create: `tests/test_voice_profiles.py`

- [ ] **Step 1: Write the failing test**

```python
def test_all_current_profiles_are_mapped() -> None:
    data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    assert len(data["profiles"]) == 24
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `python -m pytest tests/test_voice_profiles.py -v`
Expected: registry file missing until the bundle is added.

- [ ] **Step 3: Implement validation and export helpers**

```python
def main() -> int:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    profiles = data.get("profiles", {})
    errors: list[str] = []
    # validate model shape, speed range, consent boundary, review status
```

- [ ] **Step 4: Run the test and helper**

Run:
`python scripts/validate_deepgram_voice_profiles.py`
`python -m pytest tests/test_voice_profiles.py -v`
Expected: validation succeeds and the profile count test passes.

- [ ] **Step 5: Commit**

```bash
git add config scripts tests
git commit -m "feat: add Deepgram voice registry"
```

### Task 3: Switch the hosted Billy voice API to Deepgram

**Files:**
- Modify: `api/voice/billy.ts`
- Modify: `api/_lib/billyVoice.ts`
- Modify: `api/billy-health.ts`
- Modify: `api/session/dashboard.ts`
- Modify: `api/__tests__/billy-voice-health.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("reports Deepgram voice and missing env values", () => {
  const health = buildBillyVoiceHealth({
    DEEPGRAM_API_KEY: "secret",
    VOICE_PROFILE_SLUG: "billy",
  });
  expect(health.output.provider).toBe("deepgram");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run api/__tests__/billy-voice-health.test.ts`
Expected: the current ElevenLabs assertions fail.

- [ ] **Step 3: Implement the Deepgram server route and health contract**

```ts
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // accept text
  // resolve Deepgram voice model from env or profile config
  // fetch Deepgram TTS audio
  // return audio/mpeg with no-store
}
```

- [ ] **Step 4: Run the test again**

Run: `pnpm vitest run api/__tests__/billy-voice-health.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api docs
git commit -m "feat: route Billy voice output through Deepgram"
```

### Task 4: Update repo docs and operator guidance

**Files:**
- Modify: `docs/CurrentState.md`
- Modify: `docs/ArchitecturalStructure.md`
- Modify: `docs/VERCEL_ENV_CHECKLIST.md`
- Modify: `billy_voice/CurrentState.md`
- Modify: `client/src/pages/BillyVoiceStudioPage.tsx`

- [ ] **Step 1: Write the failing test**

```ts
expect(voiceStack.deepgram).toBe(true);
expect(voiceStack.elevenLabs).toBe(false);
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm vitest run api/__tests__/billy-voice-health.test.ts`
Expected: the dashboard health shape still references ElevenLabs.

- [ ] **Step 3: Update the docs and surfaced copy**

```md
Voice stack:
- LiveKit worker: Deepgram STT + Deepgram TTS
- Browser speech synthesis: fallback only
- Hosted playback: Deepgram-backed `/api/voice/billy`
```

- [ ] **Step 4: Re-run tests and a production build**

Run:
`pnpm vitest run api/__tests__/billy-voice-health.test.ts`
`pnpm run build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add docs client billy_voice
git commit -m "docs: update Billy voice integration guidance"
```
