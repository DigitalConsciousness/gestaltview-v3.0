# GestaltView Gen-Render-Engine Powerhouse Specification

**Status**: Design checkpoint — July 13, 2026  
**Branch**: `feat/powerhouse-artifact-classes`  
**Base**: `main` (commit 311a322)

## Context

This specification extends the existing rendering engine skeleton at `packages/nextgen-rendering-engine/` with a comprehensive artifact generation system competitive with Claude Artifacts, Gemini Canvas, and V0.

The existing skeleton provides:
- `src/core/types.ts` — Scene graph, render job, backend, artifact contracts
- `src/core/validation.ts` — Scene graph validation rules
- `src/core/artifacts.ts` — MemoryArtifactSink, FileArtifactSink, SupabaseArtifactSink
- `src/adapters/` — Document, Diagram, Web, Native backends
- `src/adapters/orchestration.ts` — GestaltRenderEngine orchestrator
- `engine.manifest.json` — 22 source projects mapped (Mermaid, React Flow, Chart.js, etc.)

This spec folds in the **powerhouse design**: 17 artifact classes with sync/async rendering, free-first provider cascade, and subagent deployment.

## 17 Artifact Classes

| Class | Description | Formats | Sync/Async | Tier |
|-------|-------------|---------|------------|------|
| **document** | Enhanced Markdown, HTML, JSON, TXT | html, md, json, txt | Sync preview, async export | 1 |
| **slide** | Slide decks, pitch decks | html, pptx, pdf | Sync preview, async export | 1 |
| **chart** | Charts, graphs, data visualizations | html, svg, png | Sync | 1 |
| **mindmap** | Mermaid + React Flow hybrid | svg, png, html | Sync interactive, async static | 1 |
| **image** | Generated images | png, jpg, webp | Async | 1 |
| **video** | Generated videos | mp4, webm | Async | 2 |
| **audio** | Generated audio, speech | mp3, wav, m4a | Async | 2 |
| **wiki** | Dynamic wiki pages | html, md, json | Sync | 2 |
| **app** | Dynamic application builder | html, deployed URL | Sync preview, async deploy | 2 |
| **component** | Dynamic component builder | html, react | Sync | 2 |
| **agent-studio** | Embodiment agent config editor | json, md, html | Sync | 2 |
| **storybook** | Visual narrative / comic creator | html, pdf, png | Sync preview, async export | 2 |
| **canvas** | HTML5/Canvas/Three.js sketches | html, png, mp4 | Sync interactive, async export | 2 |
| **pitch** | Investor pitch decks | html, pptx, pdf | Sync preview, async export | 2 |
| **brand** | Logo, banner, business card | png, svg, html | Async | 2 |
| **prompt** | Agent prompt engineering workspace | md, json, yaml | Sync | 2 |
| **table** | Data tables, spreadsheets | html, csv, xlsx | Sync | 2 |

## Architecture

### Scene Graph Contract

Every artifact is a scene graph — a directed graph of nodes (content) and edges (relationships):

```typescript
interface SceneGraph {
  version: "gsvw-render.v1";
  artifact_class: ArtifactClass;
  title: string;
  description: string;
  nodes: SceneNode[];   // content: text, code, chart, image, diagram, table, media, interactive, container
  edges: SceneEdge[];   // relationships: flow, dependency, reference, containment
  templates: TemplateRef[];  // blueprint IDs, skill refs, style refs
  assets: AssetRef[];   // pre-existing images, audio, video, documents
  config: RenderConfig; // free_first, model_cascade, timeout, quality, targets, publish flags
}
```

### Orchestrator Request/Response

```typescript
interface OrchestratorRequest {
  source: "creation_corner" | "blackboard_room" | "capture_orb" | "tribunal" | "agent_trainer";
  source_id: string;
  prompt: string;
  artifact_class_hint?: ArtifactClass;
  formats?: OutputFormat[];
  consent: ConsentFlags;
  provenance: ProvenanceRecord[];
  scene_graph?: SceneGraph;
}

interface OrchestratorResponse {
  job_id: string;
  sync_result?: SyncArtifact;
  async_status: RenderStatus;
  targets: RenderTarget[];
  unsupported: UnsupportedTarget[];
  diagnostics: TargetDiagnostic[];
  polling_url: string;
  estimated_completion?: number;
}
```

### Sync vs Async Routing

- **Sync** (<30s): HTML, Markdown, JSON, TXT, React previews, interactive components
- **Async** (>30s): PDF, PPTX, PNG, SVG, MP4, MP3, deployed URLs

Per-target failure isolation: one format failure never blocks others.

## Subagent Deployment Model

| Subagent | Role | Authorization | Domain |
|----------|------|---------------|--------|
| **Codex** | Deep researcher | Read-only | Analysis, schema design, API investigation, open-source awareness |
| **Builder** | Implementer | Full write | Writes code, opens PRs, runs validation, deploys |
| **Reviewer** | Quality gate | Read + comment | Reviews PRs, checks constitutional invariants, regression risk, security |

### Workstream Delegation

- **Phase 1 (Infrastructure)**: Builder + Reviewer — high-stakes, needs QA
- **Phase 2 (Core Artifacts)**: 5 Builders in parallel — one per artifact class
- **Phase 3 (Power Artifacts)**: 12 Builders in parallel — one per artifact class
- **Phase 4 (Integration)**: All three — integration is where invariants matter most

## Free-First Provider Cascade

| Provider | Cost | Rate Limit | Formats | Classes |
|----------|------|------------|---------|---------|
| Gemini Flash | Free | 15 req/min | html, md, json, txt | document, wiki, prompt, table |
| Gemini Flash Image | Free | 10 req/min | png, jpg, webp | image, brand |
| Gemini TTS | Free | 20 req/min | mp3, wav, m4a | audio |
| Veo 3 | Free | 2 req/min | mp4, webm | video, canvas |
| DALL-E 3 | Paid ($0.04) | 5 req/min | png, jpg, webp | image, brand |
| Ideogram | Paid ($0.01) | 10 req/min | png, jpg | image, brand |
| Claude Sonnet | Paid ($0.03) | 10 req/min | html, md, json, txt | document, wiki, prompt, table |

## Open-Source Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `@xyflow/react` | ^12.0.0 | Interactive node/edge diagrams for mind maps | MIT |
| `mermaid` | ^10.9.0 | Text-to-diagram for flowcharts, sequence diagrams | MIT |
| `chart.js` | ^4.4.0 | Chart rendering for data visualizations | MIT |
| `echarts` | ^5.5.0 | Advanced chart rendering | Apache-2.0 |
| `reveal.js` | ^5.0.0 | HTML slide presentations | MIT |
| `pptxgenjs` | ^3.12.0 | PowerPoint generation in browser/Node | MIT |
| `xlsx` | ^0.18.5 | Spreadsheet read/write for CSV/XLSX | Apache-2.0 |
| `puppeteer-core` | ^22.0.0 | Headless browser for PDF/PNG/SVG on Vercel | Apache-2.0 |
| `@sparticuz/chromium` | ^119.0.0 | Chromium binary for Vercel serverless Puppeteer | MIT |
| `@codesandbox/sandpack-react` | ^2.13.0 | Live React component sandbox | MIT |
| `p5` | ^1.9.0 | Generative art and canvas sketches | LGPL-2.1 |
| `three` | ^0.164.0 | 3D rendering for Inner World and canvas artifacts | MIT |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orchestrator/render` | Submit render request |
| GET | `/api/render/status/:job_id` | Poll job status |
| POST | `/api/render/worker` | Trigger async worker (cron/edge) |
| GET | `/api/gallery` | List user's artifacts |
| GET | `/api/gallery/:id` | Get artifact metadata |
| DELETE | `/api/gallery/:id` | Soft delete artifact |

## Database Schema

### `render_jobs`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | null | Auth user |
| source_room | text | null | Origin room |
| graph_id | text | NOT NULL | Scene graph ID |
| scene_graph | jsonb | NOT NULL | Full scene graph |
| status | text | 'queued' | queued \| running \| completed \| failed \| cancelled |
| diagnostics | jsonb | '[]' | Per-target diagnostics array |
| manifest | jsonb | '{}' | Job metadata + targets |
| created_at | timestamptz | now() | — |
| updated_at | timestamptz | now() | — |

### `render_artifacts`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| render_job_id | uuid | NOT NULL | FK to render_jobs |
| user_id | uuid | null | Auth user |
| uri | text | NOT NULL | Supabase storage URI |
| format | text | NOT NULL | Output format |
| backend | text | null | Renderer backend used |
| bytes | bigint | null | File size |
| metadata | jsonb | '{}' | Provenance, render params |
| created_at | timestamptz | now() | — |

**Current state**: Both tables exist but have 0 rows. The render pipeline has never been exercised.

## Failure Isolation Rules

1. One target format failure never blocks other formats in the same job
2. Puppeteer failure falls back to library-based export (e.g., PPTX for slides)
3. Free provider exhaustion triggers honest `unsupported_target` with reason
4. Timeout is per-target, not per-job
5. All diagnostics are per-target with phase (enqueue \| render \| persist \| publish)

## Browser-Safe vs Server-Only Split

- **`browser.ts`** — Runs in browser. No Node.js imports. Validation, preview generation, request assembly, polling. Serializable across environments.
- **`server.ts`** — Runs in Node.js / Vercel serverless. Puppeteer, media APIs, DB writes, storage uploads. Dynamic imports with `typeof process` guard.

Never import `server.ts` in browser bundles. Never import Node.js modules in `browser.ts`.

## Acceptance Criteria (Per Artifact Class)

Every artifact class must pass:

1. **Generation** — Prompt → artifact in < 30s sync or < 5min async
2. **Preview** — Renders correctly in Creation Corner live preview
3. **Export** — Valid output file in all declared formats
4. **Persist** — Writes to DB + storage, appears in Gallery
5. **Publish** — Can publish to Inner World (rendered, not raw) and External Scaffold
6. **Provenance** — Full source trace from capture → generation → artifact
7. **Consent** — Respects all consent flags
8. **Failure Isolation** — One format failure doesn't block others
9. **Unsupported Honesty** — Returns `unsupported_target` with reason, never fake success

## Implementation Phases

### Phase 1: Infrastructure (Week 1-2)

- [ ] Wire `render_jobs` + `render_artifacts` to Supabase with service-role writes
- [ ] Implement `SupabaseArtifactSink` to `codex-exports` bucket
- [ ] Build AI Orchestrator with sync/async routing and timeout ceilings
- [ ] Implement per-target failure isolation
- [ ] Add polling API (`/api/render/status/:job_id`)
- [ ] Integrate free-first provider cascade

### Phase 2: Core Artifacts (Week 3-4)

- [ ] Document generator (Markdown, HTML, JSON, TXT)
- [ ] Slide generator (Reveal.js + PptxGenJS)
- [ ] Chart generator (Chart.js + ECharts + Mermaid)
- [ ] Mind Map generator (Mermaid + React Flow hybrid)
- [ ] Image generator (Gemini Flash → DALL-E 3 → Ideogram)

### Phase 3: Power Artifacts (Week 5-7)

- [ ] Video generator (Veo 3)
- [ ] Audio generator (Gemini TTS)
- [ ] Wiki generator (multi-page with linking)
- [ ] App generator (Sandpack live preview)
- [ ] Component generator (isolated sandbox)
- [ ] Agent Studio generator (visual agent builder)
- [ ] Storybook generator (visual narrative)
- [ ] Canvas generator (p5.js, Three.js)
- [ ] Pitch Deck generator (investor pitch)
- [ ] Brand Assets generator (logo, banner, business card)
- [ ] Prompt generator (prompt engineering workspace)
- [ ] Table generator (interactive data table)

### Phase 4: Integration (Week 8)

- [ ] Artifact Gallery v2 (browse, search, filter)
- [ ] Dynamic Inner World rendering (museum display)
- [ ] External Scaffold linking (graph connections)
- [ ] Provenance chain (capture → generation → artifact)
- [ ] Subagent delegation framework (Codex/Builder/Reviewer)
- [ ] Acceptance tests for all 17 artifact classes

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Service role key for DB + storage writes |
| `MAX_SYNC_TIMEOUT_MS` | 30000 | Sync render timeout ceiling (30s) |
| `MAX_ASYNC_TIMEOUT_MS` | 300000 | Async render timeout ceiling (5min) |
| `ENABLE_PUPPETEER` | true | Enable headless browser rendering |
| `ENABLE_MEDIA_GENERATION` | true | Enable video/audio/image generation |
| `FREE_FIRST_BUDGET` | 0 | Max cost per request in cents (0 = free only) |
| `GEMINI_API_KEY` | — | Gemini Flash / Veo 3 / TTS API key |
| `OPENAI_API_KEY` | — | DALL-E 3 fallback API key |
| `IDEOGRAM_API_KEY` | — | Ideogram fallback API key |

## Next Steps

1. **Fold-in**: Integrate this powerhouse design into the existing skeleton without breaking the adapter pattern
2. **Phase 1**: Wire the render pipeline (render_jobs + render_artifacts + SupabaseArtifactSink)
3. **Phase 2**: Build the 5 core artifact classes
4. **Phase 3**: Build the 12 power artifact classes
5. **Phase 4**: Integration with Creation Corner, Artifact Gallery, Dynamic Inner World

## References

- Existing skeleton: `packages/nextgen-rendering-engine/src/`
- Engine manifest: `packages/nextgen-rendering-engine/engine.manifest.json`
- Scene graph spec: `packages/nextgen-rendering-engine/specs/scene-graph.md`
- Orchestration spec: `packages/nextgen-rendering-engine/specs/orchestration.md`
- Source map: `packages/nextgen-rendering-engine/docs/source-map.md`

---

**Author**: The Symbiote  
**Date**: July 13, 2026  
**Status**: Design checkpoint — ready for fold-in
