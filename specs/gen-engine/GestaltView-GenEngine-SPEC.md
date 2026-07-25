# GestaltView GenEngine SPEC
## For Codex — Work Center-Outward

**Version:** 1.0 — June 2, 2026
**Source:** `deep-research-report-2.md`, live `gestaltview-v2.0` repo

***

## Problem Statement

GestaltView's generative layer currently has no hard boundary between "the model produced a structured draft" and "the user received a finished artifact." The gen-engine touches content, emits scaffolding (markdown, HTML, PDF template, image prompt, code export), and then nothing deterministically renders those outputs into a finished thing. What hit Dynamic Inner World in the June 1 session was raw summary markdown — the wrong thing landing in the wrong place because the wiring between the gen-engine's output types and actual renderers doesn't exist yet. Codex is that missing boundary. 

The central rule: **generation is probabilistic, rendering is deterministic.** The LLM proposes content structure as a validated artifact contract. Validators, registries, and renderers decide whether it's valid, how it appears, where it lives, and what export formats are authorized.

***

## Center: The Artifact Contract

Everything else in this SPEC exists to serve this one guarantee: no artifact reaches a user-facing surface unless it passed schema validation against a versioned discriminated union contract.

**File to create:** `shared/codex/contracts.ts`

This is the single schema source of truth. Use Zod 4, which can export JSON Schema directly — giving you one stack for TypeScript inference, runtime validation, Supabase `jsonb` column checks, and OpenAI Structured Outputs.

The base envelope (all artifact kinds share this):

```typescript
import * as z from "zod";

const Uuid = z.string().uuid();
const IsoDatetime = z.string().datetime({ offset: true });

const ArtifactKind = z.enum([
  "session_recap",
  "blueprint",
  "report_document",
  "mind_map",
  "share_card",
  "code_module",
  "spatial_scene",
  "audio_narration",
]);

const SecurityClass = z.enum(["private", "workspace", "public"]);
const ExportFormat = z.enum(["html", "pdf", "png", "mp3", "wav", "gltf", "json", "zip"]);

const ProvenanceEdgeSchema = z.strictObject({
  sourceType: z.enum(["capture", "artifact", "file", "session", "message"]),
  sourceId: z.string().min(1).max(128),
  hash: z.string().regex(/^[a-f0-9]{16,128}$/i),
  transform: z.enum(["preserve", "extract", "summarize", "synthesize", "render", "export"]),
  confidence: z.number().min(0).max(1).optional(),
});

const ExportManifestItemSchema = z.strictObject({
  format: ExportFormat,
  status: z.enum(["pending", "ready", "failed"]),
  storagePath: z.string().min(1).max(512).optional(),
  mimeType: z.string().min(1).max(120).optional(),
  bytes: z.number().int().nonnegative().optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
});

const BaseArtifactSchema = z.strictObject({
  id: Uuid,
  contractVersion: z.literal("codex.v1"),
  kind: ArtifactKind,
  title: z.string().min(1).max(160),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  userId: Uuid,
  workspaceId: Uuid.optional(),
  securityClass: SecurityClass,        // ALWAYS "private" by default
  templateKey: z.string().min(1).max(80),
  templateVersion: z.string().regex(/^v\d+$/),
  createdAt: IsoDatetime,
  updatedAt: IsoDatetime,
  sourceIds: z.array(z.string().min(1).max(128)).min(1).max(256),
  provenance: z.array(ProvenanceEdgeSchema).min(1).max(512),
  exports: z.array(ExportManifestItemSchema).max(16).default([]),
  meta: z.record(z.string(), z.unknown()).default({}),
});
```

The discriminated union of body shapes:

```typescript
// Only the two most critical bodies shown in full; all others follow the same pattern.

const SessionRecapBodySchema = z.strictObject({
  summary: z.string().min(1).max(5_000),
  decisions: z.array(z.string().min(1).max(500)).max(50),
  nextActions: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    owner: z.string().max(120).optional(),
    text: z.string().min(1).max(500),
    dueAt: IsoDatetime.optional(),
  })).max(50),
  openLoops: z.array(z.string().min(1).max(500)).max(50),
  sections: z.array(BlockSchema).min(1).max(50),
});

const SpatialSceneBodySchema = z.strictObject({
  sceneVersion: z.literal("1"),
  nodes: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(120),
    position: z.tuple([z.number(), z.number(), z.number()]),
    radius: z.number().positive().max(100),
    nodeType: z.enum(["artifact", "capture", "cluster", "callout"]),
    sourceIds: z.array(z.string().min(1).max(128)).min(1).max(32),
  })).min(1).max(500),
  edges: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    from: z.string().min(1).max(64),
    to: z.string().min(1).max(64),
    weight: z.number().min(0).max(1),
    label: z.string().max(120).optional(),
  })).max(1_000),
  camera: z.strictObject({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
  }),
});

export const CodexArtifactSchema = z.discriminatedUnion("kind", [
  BaseArtifactSchema.extend({ kind: z.literal("session_recap"), body: SessionRecapBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("blueprint"), body: BlueprintBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("spatial_scene"), body: SpatialSceneBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("audio_narration"), body: AudioNarrationBodySchema }),
  // report_document, mind_map, share_card, code_module: follow same pattern
]);

export type CodexArtifact = z.infer<typeof CodexArtifactSchema>;
export const CodexArtifactJsonSchema = z.toJSONSchema(CodexArtifactSchema);
```

Validation rules are strict and boring on purpose: unknown keys rejected, bounded arrays, bounded strings, explicit privacy class, provenance required, template version required. These are the three gates: OpenAI Structured Outputs with `strict: true` (outer gate), Zod `.parse()` (runtime gate), optional `pg_jsonschema` on the Supabase `jsonb` column (persistence gate).
***

## Layer 1 — Forge Endpoint

**File to create:** `api/codex/forge.ts` (Vercel Node.js Function, not Edge)

The forge route owns the LLM call, schema validation, initial persistence, and job enqueueing. It must never return raw LLM output to the client. It returns either an accepted artifact envelope or a `422 artifact_contract_invalid` error.

```typescript
import OpenAI from "openai";
import { CodexArtifactSchema, CodexArtifactJsonSchema } from "@shared/codex/contracts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function forgeArtifact(prompt: string) {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "codex_artifact",
        schema: CodexArtifactJsonSchema,
        strict: true,
      },
    },
  });

  const raw = JSON.parse(response.output_text);
  const artifact = CodexArtifactSchema.parse(raw); // throws if invalid
  return artifact;
}
```

After `CodexArtifactSchema.parse()` succeeds, the route must: insert a `codex_artifacts` row at `status: "draft"`, then enqueue export jobs — do not await them.

**Endpoint surface:**

| Endpoint | Purpose |
|---|---|
| `POST /api/codex/forge` | Create, validate, persist, enqueue |
| `GET /api/codex/artifacts/:artifactId` | Return artifact envelope + manifest |
| `POST /api/codex/artifacts/:artifactId/exports` | Trigger an additional export format |
| `GET /api/codex/jobs/:jobId` | Inspect async render/export status |
| `POST /api/codex/hooks/export-complete` | Internal worker callback for finalization |
| `POST /api/codex/legacy/creation-corner-synthesize` | Compat adapter for existing Creation Corner payloads |

***

## Layer 2 — Deterministic Render Pipeline

**Files to create:** `shared/codex/templates/*.tsx`

The router picks a known template from a registry. The model never authors final HTML. Templates are React components typed to their artifact kind — `Extract<CodexArtifact, { kind: "session_recap" }>` style.

```typescript
// shared/codex/router.ts
export const TEMPLATE_REGISTRY: Record<ArtifactKind, string> = {
  session_recap:    "session-recap-v1",
  blueprint:        "blueprint-v1",
  report_document:  "report-document-v1",
  mind_map:         "mind-map-v1",
  share_card:       "share-card-v1",
  code_module:      "code-module-v1",
  spatial_scene:    "spatial-scene-v1",
  audio_narration:  "audio-narration-v1",
};

export const EXPORTER_REGISTRY: Record<ArtifactKind, ExportFormat[]> = {
  session_recap:    ["html", "pdf", "mp3", "json"],
  blueprint:        ["html", "pdf", "json"],
  report_document:  ["html", "pdf"],
  mind_map:         ["html", "png", "gltf"],
  share_card:       ["png", "html"],
  code_module:      ["zip", "html", "json"],
  spatial_scene:    ["html", "png", "gltf"],
  audio_narration:  ["mp3", "wav", "json"],
};
```

**Schema field → deterministic UI component mapping** (never skip this registry — this is what prevents model-invented UI):

| Schema field | Component | Export behavior |
|---|---|---|
| `title` | `ArtifactHeroTitle` | H1 in HTML/PDF, overlay in share image |
| `body.summary` | `LeadParagraph` | Included in HTML/PDF, used as audio intro |
| `body.sections[].type=markdown` | `MarkdownSection` | Trusted markdown pipeline, never raw model HTML |
| `body.sections[].type=callout` | `CalloutCard` | Styled consistently across HTML/PDF/image |
| `body.sections[].type=timeline` | `TimelineBlock` | Ordered layout in HTML/PDF, vertical graphic in PNG |
| `body.decisions` | `DecisionList` | Checklist or pill stack per template |
| `body.nextActions` | `ActionTable` | HTML/PDF table, optional CSV side export |
| `provenance` | `ProvenanceDrawer` | Visible in inspect mode, hidden in public share |
| `exports[]` | `ArtifactManifestPanel` | Job state, download links, failures, retries |
| `body.nodes / body.edges` | `SpatialSceneCanvas` | R3F scene and optional glTF export |
| `body.script / body.segments` | `NarrationPanel` | TTS input and transcript UI |

***

## Layer 3 — Exporters

**Files to create:** `shared/codex/exporters/pdf.ts`, `shared/codex/exporters/audio.ts`, `shared/codex/exporters/image.ts`

**PDF:** Puppeteer renders trusted HTML then calls `page.pdf()`. Never pass raw LLM HTML to Puppeteer — only template-rendered output.

```typescript
import puppeteer from "puppeteer";

export async function exportPdfFromHtml(html: string, outputPath: string) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    await page.pdf({
      path: outputPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
    });
  } finally {
    await browser.close();
  }
}
```

**Audio:** ElevenLabs (or OpenAI TTS) as a primary adapter. FFmpeg handles transcoding, loudness normalization, and trimming. Both are adapter-wrapped — not hardcoded in the forge route.

**Spatial:** React Three Fiber for all new Codex artifact scenes. Keep existing Babylon infrastructure for room ambience in `DynamicInnerWorldPage.tsx`. The boundary is a `SceneRendererAdapter` interface. Feed Codex `spatial_scene` contracts through the R3F backend only. Do not touch the Babylon room layer.

***

## Layer 4 — Storage and Distribution

**File to create:** `shared/codex/storage.ts`

Storage is Supabase-native. Default is always `private`. Public assets require an explicit share action — never automatic.

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function storeExport(params: {
  bucket: string;
  path: string;
  bytes: Buffer;
  contentType: string;
  isPublic: boolean;
}) {
  const { bucket, path, bytes, contentType, isPublic } = params;

  await supabase.storage.from(bucket).upload(path, bytes, {
    contentType,
    cacheControl: "3600",
    upsert: false,
    metadata: { producedBy: "codex" },
  });

  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, signed: false };
  }

  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  return { url: data.signedUrl, signed: true };
}
```

Bucket strategy: private bucket for raw and sensitive derivatives, public bucket only for explicitly shared outputs. Public buckets benefit from CDN cache behavior.
***

## Layer 5 — Async Export Orchestration

**Files to create:** `workers/codex/workflows.ts`, `workers/codex/activities.ts`

**Primary path:** Temporal workflows with `proxyActivities()`. Each export job (PDF, audio, spatial, image) is a separate activity, keyed by `(artifactId, format, templateVersion)` for idempotency. Activities may retry; storage writes must be safe to repeat.

**Fallback path (lighter first-ship lane):** `render_jobs` table plus a worker loop. Supabase database webhooks trigger on row insert. Sufficient for HTML/PDF initially, but not ergonomic enough for multi-step durable export recovery. Upgrade to Temporal when audio and spatial ship.

**Execution lanes:**

- **Fast synchronous lane** (Vercel Node.js Function): schema validation, initial persistence, HTML preview. Under 4s.
- **Durable async lane** (Temporal worker or jobs runner): PDF printing, multi-export fan-out, spatial rendering, audio generation, provider retries. Do not push this work to Edge Functions — Vercel's Edge Function path is deprecated for this kind of workload in favor of Node.js.

***

## Layer 6 — Database Schema (Supabase Migration)

**File to create:** `supabase/migrations/*_codex.sql`

```sql
create table codex_artifacts (
  id              uuid primary key default gen_random_uuid(),
  contract_version text not null default 'codex.v1',
  kind            text not null,
  title           text not null,
  slug            text not null,
  user_id         uuid not null references auth.users(id),
  workspace_id    uuid,
  security_class  text not null default 'private',
  template_key    text not null,
  template_version text not null,
  body            jsonb not null,
  provenance      jsonb not null default '[]',
  source_ids      jsonb not null default '[]',
  exports         jsonb not null default '[]',
  meta            jsonb not null default '{}',
  status          text not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table codex_jobs (
  id              uuid primary key default gen_random_uuid(),
  artifact_id     uuid not null references codex_artifacts(id),
  format          text not null,
  status          text not null default 'pending',
  storage_path    text,
  error           text,
  retry_count     int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table codex_artifacts enable row level security;
alter table codex_jobs enable row level security;

create policy "users_select_own_codex_artifacts"
  on codex_artifacts for select
  using ((select auth.uid()) = user_id);

create policy "users_insert_own_codex_artifacts"
  on codex_artifacts for insert
  with check ((select auth.uid()) = user_id);

create policy "users_update_own_codex_artifacts"
  on codex_artifacts for update
  using ((select auth.uid()) = user_id);
```

***

## Layer 7 — UI Surface Changes

**Files to modify:** `client/src/components/BlueprintGenerativeWorkbench.tsx`, `client/src/pages/CreationCornerPage.tsx`, `client/src/pages/DynamicInnerWorldPage.tsx`

`BlueprintGenerativeWorkbench.tsx`: Replace raw output-family string tabs with Codex renderer previews and `ArtifactManifestPanel` showing export job status.
`CreationCornerPage.tsx`: Replace the `ArtifactResult` raw content rendering pane with an artifact status display and tabbed renderer views (HTML preview, PDF download, Spatial, Audio).

`DynamicInnerWorldPage.tsx`: Accept typed `spatial_scene` contracts from the Codex manifest. Do not accept inferred artifact HTML blobs or raw summary markdown. This is the fix for what happened in the June 1 session.

Surface visibility rules mirror the council SPEC: show what's `ready`, show manifest state for what's `pending`, show a partial-failure notice if some exports failed but others succeeded. Never hide a partial artifact entirely — the rule is **always surface partial completion without total loss**.

***

## Operational Behavior

| Condition | System action |
|---|---|
| LLM output fails schema validation | Return `422 artifact_contract_invalid`; optionally run one repair prompt; do not persist |
| Artifact valid but one exporter fails | Persist artifact; mark only that export as `failed`; others continue |
| Exporter transient failure | Retry with idempotency key and exponential backoff |
| Storage write failure | Retry storage activity only; never rerun the LLM |
| Provider timeout | Mark exporter `pending_retry`; preserve draft artifact row |
| Sanitization failure | Block share/public export; record security error |
| Partial completion | Surface manifest with mixed `ready` / `failed` states |

**Security:** Never trust raw model HTML. Sanitize any stored HTML artifact with DOMPurify before rendering. Use sandboxed iframes for previews. Set CSP, `X-Frame-Options`, and `X-Content-Type-Options` headers. Private-by-default storage, explicit share action required for public.

***

## Target SLAs

| Operation | p95 target |
|---|---|
| Forge request accepted and validated | ≤ 2.5s |
| HTML preview available | ≤ 4s |
| PDF export ready | ≤ 12s |
| Spatial scene ready | ≤ 10s |
| Audio narration ready | ≤ 20s |
| Full multi-export artifact family ready | ≤ 25s |
| Schema validation rejection rate | < 2% after hardening |
| End-to-end success rate (HTML/PDF) | ≥ 99% |
| End-to-end success rate (audio/spatial) | ≥ 97% |
| Signed URL issuance | ≤ 300ms |

These are rollout targets to validate in CI and staging, not current measured figures.

***

## Files Touched Summary

| File | Action |
|---|---|
| `shared/gen-engine/types.ts` | Replace coarse `GeneratedArtifact` with Codex discriminated union |
| `shared/gen-engine/core.ts` | Split into `contracts`, `router`, `renderers`, `exporters`, `manifest`, `provenance` |
| `shared/gen-engine/index.ts` | Re-export Codex registry instead of monolithic helpers |
| `api/gen-engine/artifacts.ts` | Turn into compatibility shim → `POST /api/codex/forge` |
| `api/creation-corner/synthesize.ts` | Legacy adapter mapping old payloads into Codex requests |
| `api/creation-corner/blueprints.ts` | Store Codex artifact reference + export manifest fields |
| `api/inner-world/artifacts.ts` | Extend for Codex manifests, spatial/audio derivative refs |
| `client/src/components/BlueprintGenerativeWorkbench.tsx` | Replace string tabs with contract-aware renderer previews |
| `client/src/pages/CreationCornerPage.tsx` | Replace raw result pane with artifact manifest UI |
| `client/src/pages/DynamicInnerWorldPage.tsx` | Accept typed `spatial_scene` contracts only |
| **`shared/codex/contracts.ts`** | **Create** — canonical Zod + JSON Schema registry |
| **`shared/codex/router.ts`** | **Create** — kind/template/export routing |
| **`shared/codex/templates/*.tsx`** | **Create** — deterministic React templates per kind |
| **`shared/codex/exporters/pdf.ts`** | **Create** — Puppeteer PDF exporter |
| **`shared/codex/exporters/audio.ts`** | **Create** — TTS adapter + FFmpeg normalization |
| **`shared/codex/exporters/image.ts`** | **Create** — PNG/share-card renderer |
| **`shared/codex/storage.ts`** | **Create** — Supabase upload/signed URL logic |
| **`shared/codex/manifest.ts`** | **Create** — export manifest normalization |
| **`workers/codex/workflows.ts`** | **Create** — Temporal workflows |
| **`workers/codex/activities.ts`** | **Create** — export/storage activities |
| **`supabase/migrations/*_codex.sql`** | **Create** — tables, indexes, RLS, storage policies |
| **`docs/Codex.md`** | **Create** — canonical implementation spec |

***

## What Codex Must NOT Do

Do not rewrite `DynamicInnerWorldPage.tsx`'s Babylon room ambience layer — only the artifact scene surface changes. Do not let the model author final HTML or CSS at any point — templates own all presentation. Do not push PDF, audio, or spatial export work to Vercel Edge Functions. Do not make any artifact `public` by default — the share action must be an explicit user gesture. Do not split the Codex package into a separate repo until `gestaltview-v2.0` is confirmed to be the wrong home for it.
***

## Validation Commands

```bash
supabase migration new codex_artifacts
supabase migration up
supabase db pull
npm run build
git diff --check
npx playwright test --trace on
npx playwright show-report
npm run health   # if present
```
