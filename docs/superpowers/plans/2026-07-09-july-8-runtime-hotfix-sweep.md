# July 8 Runtime Hotfix Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the July 8 runtime spine by fixing render deployment failures, truthful processing states, artifact viewer routing, meaning guardrails, Musical DNA upload honesty, and hotfix-specific env diagnostics.

**Architecture:** Apply the bounded render swaps first, then repair schema-sensitive and stateful backend flows, then normalize artifact/viewer behavior and meaning-routing guardrails, and finally land local-first upload and environment diagnostics. The work stays within the hotfix bundle boundaries, but uses small shared helpers when a single cross-cutting contract is clearly broken in multiple places.

**Tech Stack:** Vercel serverless API routes, Vitest, TypeScript, React, Supabase, existing `scripts/codex-env.sh` env loader, localStorage-backed client persistence.

---

## File Map

- `docs/superpowers/specs/2026-07-09-july-8-runtime-hotfix-sweep-design.md`
  Hotfix spec approved by the user. Use this as the source of truth for scope and degraded-mode env policy.
- `scripts/check-hotfix-env.mjs`
  New env audit entrypoint. Reports required, degraded, and optional runtime capabilities by subsystem.
- `package.json`
  Optional script wiring for the env audit so the wrapper can be run consistently.
- `api/render/decide.ts`
  Replace with the bounded render decision handler from the hotfix package.
- `api/render/engine.ts`
  Replace with the shared-renderer fallback handler from the hotfix package.
- `vercel.json`
  Add explicit `api/render/*.ts` `includeFiles`.
- `supabase/migrations/20260709000000_july_8_runtime_hotfix.sql`
  New migration derived from `hotfix/july_8th/proposed_sql/20260708_not_good_runtime_hotfix.sql`.
- `api/inner-world/artifacts.ts`
  Make artifact reads resilient to `origin_di_id` schema drift.
- `api/transcriptory/captures.ts`
  Force truthful initial capture status.
- `api/transcriptory/transcribe.ts`
  Add stale-processing recovery claim logic and honest provider diagnostics.
- `api/_lib/profileIngestion.ts`
  Tighten evidence and persistence gating.
- `client/src/lib/innerWorldFiles.ts`
  Add normalized artifact-view routing metadata and raw-source behavior.
- `client/src/components/inner-world/InnerWorldArtifactGallery.tsx`
  Respect the normalized artifact viewer contract.
- `client/src/pages/ArtifactGalleryPage.tsx`
  Surface structured artifact states instead of assuming every artifact is ready HTML.
- `client/src/lib/rendering/fromArtifacts.ts`
  Extend artifact-to-scene/view mapping to recognize explicit raw/scene-graph contracts.
- `shared/runtime/culturalSignal.ts`
  New helper for lyric/quote preflight detection.
- `shared/billy/toneGuard.ts`
  New helper for Billy filler rewriting in non-distress contexts.
- `api/_lib/actionsHandler.ts`
  Add Tribunal cultural preflight before generic interpretation.
- `api/billy.ts`
  Apply Billy tone guard after the LLM response returns.
- `client/src/lib/musicalDnaTracks.ts`
  Add upload sync-state typing helpers for manual tracks.
- `client/src/hooks/useTrackUpload.ts`
  Convert upload flow to local-first sync.
- `client/src/components/MusicalDnaTrackUploadPanel.tsx`
  Surface sync state, retry, and degraded remote messaging.

## Task 1: Add Hotfix Env Audit and Degraded-Mode Rules

**Files:**
- Create: `scripts/check-hotfix-env.mjs`
- Modify: `package.json`
- Test: `api/__tests__/keep-alive.test.ts`

- [ ] **Step 1: Write the failing env-audit expectation in the keep-alive diagnostics test area**

```ts
it("reports session secret as required locally while keeping Billy diagnose optional", async () => {
  const { summarizeHotfixEnv } = await import("../../scripts/check-hotfix-env.mjs");

  const result = summarizeHotfixEnv({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon",
    SESSION_SECRET: "",
    BILLY_API_SECRET: "",
    ASSEMBLYAI_API_KEY: "",
    BILLY_TRANSCRIPTION_URL: "",
    GROQ_API_KEY: "groq-key",
  });

  expect(result.coreRuntime.status).toBe("ready");
  expect(result.session.status).toBe("action_required");
  expect(result.billyDiagnose.status).toBe("disabled");
  expect(result.transcriptory.status).toBe("ready");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm vitest run api/__tests__/keep-alive.test.ts`
Expected: FAIL with a module-not-found or missing export error for `../../scripts/check-hotfix-env.mjs` or `summarizeHotfixEnv`.

- [ ] **Step 3: Implement the env audit script and script wiring**

```js
// scripts/check-hotfix-env.mjs
const REQUIRED_CORE = [
  ["SUPABASE_URL", "VITE_SUPABASE_URL"],
  ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"],
  ["VITE_SUPABASE_URL"],
  ["VITE_SUPABASE_ANON_KEY"],
];

function firstPresent(env, keys) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function summarizeHotfixEnv(env = process.env) {
  const coreReady = REQUIRED_CORE.every((group) => Boolean(firstPresent(env, group)));
  const hasSessionSecret = Boolean(firstPresent(env, ["SESSION_SECRET"]));
  const hasBillySecret = Boolean(firstPresent(env, ["BILLY_API_SECRET"]));
  const hasTranscriptoryProvider = Boolean(
    firstPresent(env, [
      "ASSEMBLYAI_API_KEY",
      "BILLY_TRANSCRIPTION_URL",
      "GROQ_API_KEY",
      "HUGGINGFACE_API_KEY",
      "HF_API_TOKEN",
    ]),
  );

  return {
    coreRuntime: {
      status: coreReady ? "ready" : "blocked",
      missing: coreReady ? [] : ["SUPABASE runtime keys"],
    },
    session: {
      status: hasSessionSecret ? "ready" : "action_required",
      message: hasSessionSecret
        ? "Session signing available."
        : "Set a dev-only SESSION_SECRET for local session-backed flows.",
    },
    billyDiagnose: {
      status: hasBillySecret ? "ready" : "disabled",
      message: hasBillySecret ? "Billy diagnose mode enabled." : "Billy diagnose mode disabled without BILLY_API_SECRET.",
    },
    transcriptory: {
      status: hasTranscriptoryProvider ? "ready" : "degraded",
      message: hasTranscriptoryProvider
        ? "At least one transcription provider is available."
        : "Audio capture may persist, but server-side transcription will not complete.",
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(summarizeHotfixEnv(), null, 2));
}
```

```json
// package.json
{
  "scripts": {
    "hotfix:env": "bash scripts/codex-env.sh node scripts/check-hotfix-env.mjs"
  }
}
```

- [ ] **Step 4: Run the env-audit test and script**

Run: `pnpm vitest run api/__tests__/keep-alive.test.ts`
Expected: PASS

Run: `pnpm run hotfix:env`
Expected: JSON summary with `coreRuntime`, `session`, `billyDiagnose`, and `transcriptory` keys.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-hotfix-env.mjs package.json api/__tests__/keep-alive.test.ts
git commit -m "fix: add july 8 hotfix env audit"
```

### Task 2: Restore Render Routes and Vercel Packaging

**Files:**
- Modify: `api/render/decide.ts`
- Modify: `api/render/engine.ts`
- Modify: `vercel.json`
- Test: `api/__tests__/render-decide.test.ts`
- Test: `api/__tests__/production-fix.test.ts`

- [ ] **Step 1: Add failing tests for the bounded render behavior**

```ts
it("returns 422 for unsupported renderer formats", async () => {
  const { default: handler } = await import("../render/decide.js");
  const res = makeRes();

  await handler(makeReq({ artifactKind: "markdown", format: "pdf", content: "# nope" }), res);

  expect(res.statusCode).toBe(422);
  expect(String(res.body)).toContain("supportedFormats");
});

it("renders scene-graph payloads through the shared markdown fallback instead of the package src import", async () => {
  const { default: handler } = await import("../render/engine.js");
  const res = makeRes();

  await handler(
    makeReq({ graphId: "graph-1", nodes: [{ id: "n1", name: "Node One", props: { source: "Hello world" } }] }),
    res,
  );

  expect(res.statusCode).toBe(200);
  expect(String(res.body)).toContain("Node One");
});
```

```ts
it("includes render route files in vercel packaging", () => {
  const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"));
  expect(config.functions["api/render/*.ts"]).toEqual({
    includeFiles: "api/_lib/**,shared/rendering/**,packages/nextgen-rendering-engine/**",
  });
});
```

- [ ] **Step 2: Run the render tests to verify they fail**

Run: `pnpm vitest run api/__tests__/render-decide.test.ts api/__tests__/production-fix.test.ts`
Expected: FAIL because `decide.ts` currently returns `400` for unsupported formats and `vercel.json` has no `api/render/*.ts` entry.

- [ ] **Step 3: Replace the render handlers and patch Vercel config**

```ts
// api/render/decide.ts
import { getRenderer, SUPPORTED_ARTIFACT_KINDS } from "../../shared/rendering/index.js";

const MIME_BY_FORMAT = {
  html: "text/html; charset=utf-8",
  pdf: "application/pdf",
  json: "application/json; charset=utf-8",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mermaid: "text/plain; charset=utf-8",
  png: "image/png",
} as const;

if (!supportedFormats.includes(format)) {
  res.status(422).json({
    ok: false,
    error: `Renderer ${artifactKind} does not support format ${format}.`,
    supportedFormats,
  });
  return;
}

try {
  const artifact = await renderer.render(content as never, format);
  const contentType = MIME_BY_FORMAT[artifact.format] ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  if (Buffer.isBuffer(artifact.data)) {
    res.status(200).send(artifact.data);
    return;
  }
  if (artifact.format === "json") {
    res.status(200).json(JSON.parse(String(artifact.data)));
    return;
  }
  res.status(200).send(String(artifact.data));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ ok: false, error: "render_failed", message, artifactKind, format });
}
```

```ts
// api/render/engine.ts
import { getRenderer } from "../../shared/rendering/index.js";

function graphToMarkdown(graph) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const renderedNodes = nodes.map((node) => {
    const name = node.name ?? node.id ?? "Untitled";
    const props = node.props ?? {};
    if (typeof props.source === "string") return `## ${name}\n\n${props.source}`;
    return `## ${name}\n\n\`\`\`json\n${JSON.stringify(props, null, 2)}\n\`\`\``;
  });
  return [`# ${graph.graphId ?? "GestaltView Render Package"}`, "", renderedNodes.join("\n\n---\n\n")].join("\n").trim();
}

const markdown = graphToMarkdown(graph);
const renderer = getRenderer("markdown");

if (!renderer) {
  res.status(200).json({
    ok: true,
    jobId,
    fallback: true,
    outputs: { markdown },
    diagnostics: [{ level: "warn", message: "Markdown renderer unavailable; returned normalized graph markdown." }],
  });
  return;
}

const rendered = await renderer.render(markdown as never, format === "json" ? "json" : "html");
res.setHeader("Content-Type", rendered.format === "json" ? "application/json; charset=utf-8" : "text/html; charset=utf-8");
res.status(200).send(Buffer.isBuffer(rendered.data) ? rendered.data : String(rendered.data));
```

```json
// vercel.json
{
  "functions": {
    "api/render/*.ts": {
      "includeFiles": "api/_lib/**,shared/rendering/**,packages/nextgen-rendering-engine/**"
    }
  }
}
```

- [ ] **Step 4: Run the render tests and a type check**

Run: `pnpm vitest run api/__tests__/render-decide.test.ts api/__tests__/production-fix.test.ts`
Expected: PASS

Run: `pnpm exec tsc --noEmit`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/render/decide.ts api/render/engine.ts vercel.json api/__tests__/render-decide.test.ts api/__tests__/production-fix.test.ts
git commit -m "fix: restore july 8 render routes"
```

### Task 3: Land the SQL Hotfix and Make Inner World Artifact Reads Resilient

**Files:**
- Create: `supabase/migrations/20260709000000_july_8_runtime_hotfix.sql`
- Modify: `api/inner-world/artifacts.ts`
- Test: `api/__tests__/production-fix.test.ts`

- [ ] **Step 1: Add a failing artifact-route regression test**

```ts
it("falls back to a select list without origin_di_id when the live table rejects that column", async () => {
  const rangeMock = vi
    .fn()
    .mockResolvedValueOnce({ data: null, error: { message: 'column "origin_di_id" does not exist' } })
    .mockResolvedValueOnce({ data: [{ id: "artifact-2", title: "Recovered Artifact" }], error: null });
  const orderMock = vi.fn(() => ({ range: rangeMock }));
  const eqMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));

  mocks.requireAuthMock.mockReturnValue({ id: "user-1", email: "user@example.com", tier: "free", isAdmin: false });
  mocks.getInnerWorldSupabaseAdminMock.mockReturnValue({ from: vi.fn(() => ({ select: selectMock })) });

  const artifactsModule = await import("../inner-world/artifacts");
  const res = createRes();

  await artifactsModule.default({ method: "GET", headers: {}, query: {} } as never, res as never);

  expect(selectMock).toHaveBeenNthCalledWith(2, expect.not.stringContaining("origin_di_id"));
  expect(res.statusCode).toBe(200);
});
```

- [ ] **Step 2: Run the production-fix test file**

Run: `pnpm vitest run api/__tests__/production-fix.test.ts`
Expected: FAIL because the handler performs a single brittle select.

- [ ] **Step 3: Add the migration and schema-resilient select fallback**

```sql
-- supabase/migrations/20260709000000_july_8_runtime_hotfix.sql
alter table public.profile_ingestion_sources
  drop constraint if exists profile_ingestion_sources_source_type_check;

alter table public.profile_ingestion_sources
  add constraint profile_ingestion_sources_source_type_check
  check (source_type in ('journal', 'transcript', 'resume', 'music_dna', 'profile_upload', 'lived_experience'));

alter table public.inner_world_artifacts
  add column if not exists origin_di_id text;

update public.transcriptory_captures
set
  status = 'pending',
  transcript_status = 'pending',
  error_message = 'Capture was marked processing before the transcriber could claim it. Reset by runtime hotfix; upload can be retried.'
where status = 'processing'
  and processing_started_at is null
  and raw_transcript is null;
```

```ts
// api/inner-world/artifacts.ts
const PRIMARY_SELECT =
  "id,source_ref,user_id,title,summary,source_file_id,source_file_ref,html,thumbnail_url,origin_room,origin_di_id,evidence_node_ids,tags,status,created_at,updated_at";
const FALLBACK_SELECT =
  "id,source_ref,user_id,title,summary,source_file_id,source_file_ref,html,thumbnail_url,origin_room,evidence_node_ids,tags,status,created_at,updated_at";

async function listArtifacts(builderFactory, userId, offset, limit) {
  let query = builderFactory().select(PRIMARY_SELECT).eq("user_id", userId).order("created_at", { ascending: false });
  let result = await query.range(offset, offset + limit - 1);
  if (result.error?.message?.includes("origin_di_id")) {
    query = builderFactory().select(FALLBACK_SELECT).eq("user_id", userId).order("created_at", { ascending: false });
    result = await query.range(offset, offset + limit - 1);
  }
  return result;
}
```

- [ ] **Step 4: Run the artifact regression test**

Run: `pnpm vitest run api/__tests__/production-fix.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260709000000_july_8_runtime_hotfix.sql api/inner-world/artifacts.ts api/__tests__/production-fix.test.ts
git commit -m "fix: harden inner world artifact reads for july 8 hotfix"
```

### Task 4: Make Transcriptory Statuses Truthful and Recoverable

**Files:**
- Modify: `api/transcriptory/captures.ts`
- Modify: `api/transcriptory/transcribe.ts`
- Test: `api/__tests__/transcriptory.test.ts`

- [ ] **Step 1: Add failing Transcriptory tests**

```ts
it("forces upload captures into pending unless raw transcript text is already present", async () => {
  const builder = createBuilder({
    singleData: {
      id: "capture-3",
      user_id: "user-1",
      title: "Pending upload",
      audio_storage_path: "user-1/pending.webm",
      raw_transcript: null,
      transcript_text: null,
      status: "pending",
      transcript_status: "pending",
      created_at: "2026-06-09T00:00:00.000Z",
      updated_at: "2026-06-09T00:00:00.000Z",
    },
  });
  getTranscriptorySupabaseAdminMock.mockReturnValue({
    from: vi.fn((table: string) => (table === "transcriptory_captures" ? builder : createBuilder())),
  });

  const module = await import("../transcriptory/captures");
  const res = createRes();

  await module.default(
    {
      method: "POST",
      headers: {},
      body: { title: "Pending upload", audioStoragePath: "user-1/pending.webm", status: "processing" },
    } as never,
    res as never,
  );

  expect(builder.calls.insert[0]?.status).toBe("pending");
});
```

```ts
it("reclaims zombie processing captures that were never actually started", async () => {
  const pendingBuilder = createBuilder({ singleData: null });
  const zombieBuilder = createBuilder({
    singleData: {
      id: "capture-zombie",
      user_id: "user-1",
      title: "Zombie",
      status: "processing",
      transcript_status: "processing",
      processing_started_at: null,
      raw_transcript: null,
      created_at: "2026-06-09T00:00:00.000Z",
      updated_at: "2026-06-09T00:00:00.000Z",
    },
  });
  getTranscriptorySupabaseAdminMock.mockReturnValue({
    from: vi.fn(() => ({
      update: vi.fn(() => zombieBuilder),
      select: vi.fn(() => pendingBuilder),
      eq: zombieBuilder.eq,
      in: pendingBuilder.in,
      is: zombieBuilder.is,
      single: zombieBuilder.single,
    })),
  });

  const module = await import("../transcriptory/transcribe");
  const res = createRes();

  await module.default({ method: "POST", headers: { "x-capture-id": "capture-zombie" } } as never, res as never);

  expect(res.statusCode).not.toBe(409);
});
```

- [ ] **Step 2: Run the Transcriptory test file**

Run: `pnpm vitest run api/__tests__/transcriptory.test.ts`
Expected: FAIL because `captures.ts` currently preserves client-provided `processing` and `transcribe.ts` only claims `pending` or `failed`.

- [ ] **Step 3: Implement truthful create-state and zombie-claim recovery**

```ts
// api/transcriptory/captures.ts
const requestedStatus = body.status?.trim();
const status = rawTranscript
  ? "ready"
  : requestedStatus === "failed"
    ? "failed"
    : "pending";
```

```ts
// api/transcriptory/transcribe.ts
async function claimTranscriptoryCapture(supabase, captureId, provider) {
  const primary = await supabase
    .from("transcriptory_captures")
    .update({
      status: "processing",
      transcript_status: "processing",
      processing_provider: provider,
      processing_started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", captureId)
    .in("status", ["pending", "failed"])
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();

  if (primary.data) return primary;

  return await supabase
    .from("transcriptory_captures")
    .update({
      status: "processing",
      transcript_status: "processing",
      processing_provider: provider,
      processing_started_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", captureId)
    .eq("status", "processing")
    .is("processing_started_at", null)
    .is("raw_transcript", null)
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();
}
```

- [ ] **Step 4: Run the Transcriptory tests**

Run: `pnpm vitest run api/__tests__/transcriptory.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/transcriptory/captures.ts api/transcriptory/transcribe.ts api/__tests__/transcriptory.test.ts
git commit -m "fix: repair transcriptory processing state flow"
```

### Task 5: Gate Profile Ingestion on Evidence and Honest Persistence

**Files:**
- Modify: `api/_lib/profileIngestion.ts`
- Test: `api/__tests__/profile-ingestion.test.ts`

- [ ] **Step 1: Add failing profile-ingestion tests**

```ts
it("returns partial persistence when source inserts fail", async () => {
  insertRowMock.mockImplementation(async (table: string) => table !== "profile_ingestion_sources");
  const { runProfileIngestion } = await loadPipeline();

  const result = await runProfileIngestion({
    userId: "11111111-1111-4111-8111-111111111111",
    sources: {
      profileUpload: {
        fileName: "Profile.md",
        content: "Music matters because it preserves memory and identity through direct quoted material.",
        mimeType: "text/markdown",
      },
    },
  });

  expect(result.metadata.persistence).toBe("partial");
});
```

```ts
it("does not keep high-salience dimensions without evidence fragments", async () => {
  const { runProfileIngestion } = await loadPipeline();

  const result = await runProfileIngestion(
    {
      userId: "11111111-1111-4111-8111-111111111111",
      sources: {
        profileUpload: {
          fileName: "Thin.md",
          content: "music_dna_resonance is present but needs more directly quoted source material",
          mimeType: "text/markdown",
        },
      },
    },
    { persist: false },
  );

  expect(
    result.personalityProfile.dimensions.every(
      (dimension) => dimension.salience < 0.75 || dimension.evidenceFragments.length > 0,
    ),
  ).toBe(true);
});
```

- [ ] **Step 2: Run the profile-ingestion test file**

Run: `pnpm vitest run api/__tests__/profile-ingestion.test.ts`
Expected: FAIL because the current pipeline marks the run `complete` with `stored` semantics too eagerly and does not explicitly gate high-salience evidence-empty dimensions.

- [ ] **Step 3: Implement persistence and evidence gating**

```ts
// api/_lib/profileIngestion.ts
const SOURCE_TYPE_ALLOWLIST = new Set([
  "journal",
  "transcript",
  "resume",
  "music_dna",
  "profile_upload",
  "lived_experience",
]);

function isMeaningfullyComplete(profile: PersonalityProfile, sourcesProcessed: number, persistence: "stored" | "skipped" | "partial") {
  return (
    sourcesProcessed > 0 &&
    (persistence === "stored" || persistence === "skipped") &&
    profile.dimensions.every((dimension) => dimension.salience < 0.75 || dimension.evidenceFragments.length > 0)
  );
}

// normalize source types through SOURCE_TYPE_ALLOWLIST
// set metadata.persistence = "partial" when source persistence fails
// filter out high-salience evidence-empty dimensions before returning the final profile
```

- [ ] **Step 4: Run the profile-ingestion tests**

Run: `pnpm vitest run api/__tests__/profile-ingestion.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/_lib/profileIngestion.ts api/__tests__/profile-ingestion.test.ts
git commit -m "fix: gate profile ingestion on evidence and persistence"
```

### Task 6: Normalize Artifact Viewer Routing

**Files:**
- Modify: `client/src/lib/innerWorldFiles.ts`
- Modify: `client/src/lib/rendering/fromArtifacts.ts`
- Modify: `client/src/components/inner-world/InnerWorldArtifactGallery.tsx`
- Modify: `client/src/pages/ArtifactGalleryPage.tsx`
- Test: `client/src/tests/inner-world-files.test.ts`
- Test: `client/src/tests/rendering-contract.test.ts`

- [ ] **Step 1: Add failing viewer-contract tests**

```ts
it("classifies raw json blobs as raw artifacts instead of museum-visible html", async () => {
  const { classifyInnerWorldArtifactView } = await import("@/lib/innerWorldFiles");
  const result = classifyInnerWorldArtifactView(
    artifact("raw-json", { html: "{\"raw\":true}", tags: ["scene-graph"] }),
  );

  expect(result.kind).toBe("raw");
  expect(result.primaryRenderable).toBe(false);
});
```

```ts
it("maps scene graph export artifacts to json_scene_graph instead of markdown fallback", async () => {
  const { artifactViewModelFromArtifact } = await import("@/lib/rendering/fromArtifacts");
  const result = artifactViewModelFromArtifact({
    id: "artifact-1",
    title: "Graph",
    format: "json",
    data: { schema: "nextgen.scene-graph.v1", nodes: [] },
  });

  expect(result.kind).toBe("json_scene_graph");
});
```

- [ ] **Step 2: Run the client rendering tests**

Run: `pnpm vitest run client/src/tests/inner-world-files.test.ts client/src/tests/rendering-contract.test.ts`
Expected: FAIL because no explicit artifact-view classification helper exists yet.

- [ ] **Step 3: Implement the viewer-classification helper and wire it into gallery surfaces**

```ts
// client/src/lib/innerWorldFiles.ts
export type ArtifactViewKind = "html" | "markdown" | "json_scene_graph" | "audio" | "image" | "raw";

export function classifyInnerWorldArtifactView(artifact: InnerWorldArtifactRecord) {
  const html = artifact.html.trim();
  const looksLikeHtml = /^</.test(html);
  const looksLikeJson = /^[\[{]/.test(html);
  const isSceneGraph = artifact.tags.includes("scene-graph") || html.includes('"nextgen.scene-graph.v1"');

  if (looksLikeHtml) return { kind: "html" as const, primaryRenderable: true };
  if (isSceneGraph) return { kind: "json_scene_graph" as const, primaryRenderable: true };
  if (looksLikeJson) return { kind: "raw" as const, primaryRenderable: false };
  return { kind: "markdown" as const, primaryRenderable: true };
}
```

```ts
// client/src/components/inner-world/InnerWorldArtifactGallery.tsx
const view = classifyInnerWorldArtifactView(selectedArtifact);

// only render HtmlArtifactRenderer when view.kind === "html"
// show a collapsed raw-source card with “Open raw” copy when view.kind === "raw"
```

```ts
// client/src/lib/rendering/fromArtifacts.ts
if (format.includes("json") && artifact.data && artifact.data.schema === "nextgen.scene-graph.v1") {
  return {
    id: artifact.id ?? "artifact",
    title: label,
    kind: "json_scene_graph",
    sceneGraph: artifact.data,
  };
}
```

- [ ] **Step 4: Run the client rendering tests**

Run: `pnpm vitest run client/src/tests/inner-world-files.test.ts client/src/tests/rendering-contract.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/innerWorldFiles.ts client/src/lib/rendering/fromArtifacts.ts client/src/components/inner-world/InnerWorldArtifactGallery.tsx client/src/pages/ArtifactGalleryPage.tsx client/src/tests/inner-world-files.test.ts client/src/tests/rendering-contract.test.ts
git commit -m "fix: normalize artifact viewer routing"
```

### Task 7: Add Billy Tone Guard and Tribunal Cultural Preflight

**Files:**
- Create: `shared/billy/toneGuard.ts`
- Create: `shared/runtime/culturalSignal.ts`
- Modify: `api/billy.ts`
- Modify: `api/_lib/actionsHandler.ts`
- Test: `api/__tests__/billy.test.ts`
- Test: `api/__tests__/actions.test.ts`

- [ ] **Step 1: Add failing Billy and Tribunal tests**

```ts
it("rewrites banned Billy filler in runtime bug contexts", async () => {
  const { applyBillyToneGuard } = await import("../../shared/billy/toneGuard.js");

  const result = applyBillyToneGuard({
    response: "I know this is hard. This is a courageous step.",
    userMessage: "The system treated my lyric like a therapy prompt.",
    context: "runtime_bug",
  });

  expect(result).toContain("That’s the bug");
  expect(result).not.toContain("I know this is hard");
});
```

```ts
it("routes recognized Alice in Chains lyric fragments to ask_user instead of direct tribunal synthesis", async () => {
  process.env.SESSION_SECRET = "actions-test-secret";
  const req = {
    method: "POST",
    query: { path: ["tribunal", "run"] },
    headers: { cookie: authCookie("core") },
    body: { question: "Into the flood again, same old trip it was back then my way" },
  };
  const res = createRes();

  await actionsHandler(req as never, res as never);

  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({
    provider: "cultural-preflight",
  });
  expect(JSON.stringify(res.body)).toContain("Alice in Chains");
});
```

- [ ] **Step 2: Run the Billy and actions tests**

Run: `pnpm vitest run api/__tests__/billy.test.ts api/__tests__/actions.test.ts`
Expected: FAIL because neither helper exists and the Tribunal path still runs straight to the AI envelope.

- [ ] **Step 3: Implement the helpers and wire them into runtime paths**

```ts
// shared/runtime/culturalSignal.ts
const ALICE_IN_CHAINS_WOULD_TOKENS = ["flood", "same old trip", "big mistake", "my way"];

export function detectCulturalSignal(input: string) {
  const normalized = input.toLowerCase();
  const matches = ALICE_IN_CHAINS_WOULD_TOKENS.filter((token) => normalized.includes(token)).length;
  if (matches >= 2) {
    return {
      kind: "song_lyric",
      confidence: 0.94,
      title: "Would?",
      artist: "Alice in Chains",
      route: "ask_user",
    } as const;
  }
  return { kind: "unknown", confidence: 0, route: "tribunal" } as const;
}
```

```ts
// shared/billy/toneGuard.ts
const BANNED_BILLY_FILLER = [
  "I know this is hard",
  "That sounds hard",
  "I'm sorry you're going through this",
  "This is a courageous step",
  "journey of self-discovery",
  "no judgment",
];

export function applyBillyToneGuard({ response, context }) {
  if (context !== "runtime_bug") return response;
  let next = response;
  for (const phrase of BANNED_BILLY_FILLER) next = next.replaceAll(phrase, "").trim();
  return next || "This didn’t land. The system treated your input like a therapy prompt. That’s the bug.";
}
```

```ts
// api/_lib/actionsHandler.ts
const signal = detectCulturalSignal(question);
if (signal.route === "ask_user") {
  sendJson(res, 200, envelope(
    `That pings as ${signal.artist} — “${signal.title}”. Do you want this treated as Musical DNA, a lyric-memory capture, or Tribunal discussion?`,
    "cultural-preflight",
    { free: true, tokensUsed: null, processingTime: 0, metadata: { signal } },
  ));
  return;
}
```

```ts
// api/billy.ts
const guardedResponse = applyBillyToneGuard({
  response: result.response,
  userMessage: rawMessage,
  context: /\bbug|runtime|therapy prompt|lyric\b/i.test(rawMessage) ? "runtime_bug" : "normal",
});
```

- [ ] **Step 4: Run the Billy and actions tests**

Run: `pnpm vitest run api/__tests__/billy.test.ts api/__tests__/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/billy/toneGuard.ts shared/runtime/culturalSignal.ts api/billy.ts api/_lib/actionsHandler.ts api/__tests__/billy.test.ts api/__tests__/actions.test.ts
git commit -m "fix: add billy tone guard and tribunal cultural preflight"
```

### Task 8: Make Musical DNA Upload Local-First and Sync-Honest

**Files:**
- Modify: `client/src/lib/musicalDnaTracks.ts`
- Modify: `client/src/hooks/useTrackUpload.ts`
- Modify: `client/src/components/MusicalDnaTrackUploadPanel.tsx`
- Test: `client/src/tests/musical-dna-tracks.test.ts`

- [ ] **Step 1: Add failing local-first upload tests**

```ts
it("preserves a failed remote upload as a local_ready or failed_remote track record", async () => {
  const { buildMusicalDnaTrackRecord } = await import("@/lib/musicalDnaTracks");
  const record = buildMusicalDnaTrackRecord(
    createAudioFileRecord({ tags: ["audio", "musical-dna-track", "sync:failed_remote"] }),
  );

  expect(record.syncState).toBe("failed_remote");
});
```

- [ ] **Step 2: Run the Musical DNA test file**

Run: `pnpm vitest run client/src/tests/musical-dna-tracks.test.ts`
Expected: FAIL because no `syncState` metadata is exposed yet.

- [ ] **Step 3: Implement sync-state typing and local-first upload flow**

```ts
// client/src/lib/musicalDnaTracks.ts
export type UploadSyncState =
  | "selected"
  | "local_ready"
  | "syncing"
  | "synced"
  | "failed_remote"
  | "rejected";

export function parseTrackSyncState(tags: string[]): UploadSyncState {
  const tag = tags.find((value) => value.startsWith("sync:"));
  return (tag?.slice(5) as UploadSyncState) || "synced";
}
```

```ts
// client/src/hooks/useTrackUpload.ts
appendUserFile({ ...trackFile, tags: [...trackFile.tags, "sync:local_ready"] });

try {
  const persisted = userId ? await uploadUserFileToServer({ file: trackFile, base64DataUrl: dataUrl }) : null;
  if (persisted) {
    removeUserFile(trackFile.id);
    appendUserFile({ ...persisted, tags: [...persisted.tags, "sync:synced"] });
  }
} catch (uploadError) {
  updateUserFile(trackFile.id, (file) => ({ ...file, tags: [...file.tags.filter((tag) => !tag.startsWith("sync:")), "sync:failed_remote"] }));
  setError("Track is saved locally for this browser. Cloud sync failed. Retry sync or export local copy.");
}
```

```tsx
// client/src/components/MusicalDnaTrackUploadPanel.tsx
<p className="dna-track-upload-hint">
  {selectedFile
    ? "The track lands locally first, then syncs to the server when available."
    : "Pick one track to preload its title, artist, and note. If cloud sync fails, the local track stays visible here."}
</p>
```

- [ ] **Step 4: Run the Musical DNA tests**

Run: `pnpm vitest run client/src/tests/musical-dna-tracks.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/musicalDnaTracks.ts client/src/hooks/useTrackUpload.ts client/src/components/MusicalDnaTrackUploadPanel.tsx client/src/tests/musical-dna-tracks.test.ts
git commit -m "fix: make musical dna uploads local first"
```

### Task 9: Final Validation Sweep

**Files:**
- Modify: `docs/CurrentState.md` if the implementation updates runtime status notes
- Test: `api/__tests__/render-decide.test.ts`
- Test: `api/__tests__/production-fix.test.ts`
- Test: `api/__tests__/transcriptory.test.ts`
- Test: `api/__tests__/profile-ingestion.test.ts`
- Test: `api/__tests__/billy.test.ts`
- Test: `api/__tests__/actions.test.ts`
- Test: `client/src/tests/inner-world-files.test.ts`
- Test: `client/src/tests/rendering-contract.test.ts`
- Test: `client/src/tests/musical-dna-tracks.test.ts`

- [ ] **Step 1: Run the focused hotfix test suite**

Run:

```bash
pnpm vitest run \
  api/__tests__/keep-alive.test.ts \
  api/__tests__/render-decide.test.ts \
  api/__tests__/production-fix.test.ts \
  api/__tests__/transcriptory.test.ts \
  api/__tests__/profile-ingestion.test.ts \
  api/__tests__/billy.test.ts \
  api/__tests__/actions.test.ts \
  client/src/tests/inner-world-files.test.ts \
  client/src/tests/rendering-contract.test.ts \
  client/src/tests/musical-dna-tracks.test.ts
```

Expected: PASS

- [ ] **Step 2: Run the build and type checks**

Run: `pnpm exec tsc --noEmit`
Expected: PASS

Run: `pnpm run build`
Expected: PASS

- [ ] **Step 3: Run the env audit through the canonical wrapper**

Run: `pnpm run hotfix:env`
Expected: JSON capability report with an `action_required` session state if `SESSION_SECRET` is still missing locally.

- [ ] **Step 4: Update runtime notes if required by the repo’s process**

```md
## July 8 runtime hotfix sweep

- Render endpoints now use shared render paths instead of package source imports.
- Transcriptory capture creation and claim logic now preserve truthful state transitions.
- Artifact gallery routes raw JSON behind explicit inspection rather than treating it as the final exhibit.
- Billy and Tribunal now guard against generic runtime-bug filler and lyric misrouting.
- Musical DNA manual uploads now land locally before remote sync succeeds.
```

- [ ] **Step 5: Commit**

```bash
git add docs/CurrentState.md
git commit -m "docs: record july 8 runtime hotfix validation"
```
