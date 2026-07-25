# GestaltView — Codex Rendering Engine v2 SPEC
## End-to-End Interactive & Beautiful Artifact Output

**Version:** 2.1 (Decisions Incorporated)
**Date:** 2026-06-17
**Repo:** DigitalConsciousness/gestaltview-v2.0
**Status:** APPROVED — Ready for Implementation
**Preceding audit:** `docs/audits/codex-artifact-rendering-pipeline-audit.md`
**Preceding SPEC:** `GestaltView-RenderingEngine-v2-SPEC_Answered.md`

---

## 0. Motivation & Problem Statement

The GestaltView artifact pipeline is architecturally sound end-to-end: captures fuse into signals, PLK resonance scoring shapes output, Codex contracts validate structure, and the drain runner stores exports in Supabase. The gap is that the final kilometer — the thing a user actually *sees* — is `<pre>` tags and raw JSON dumps.

The audit confirmed this directly:

> "The rendering layer handles only a few formats: it iframes raw HTML, stringifies JSON and dumps everything else into a monospace `<pre>` element. No built-in support exists for richer formats like PDF-ready HTML, blueprint JSON/Markdown, media files or interactive components."

The existing `shared/codex/templates/html.ts` generates a basic HTML5 document with escaped content blocks — correct, safe, and structurally valid, but without visual design, interactivity, or kind-specific presentation. Every artifact kind produces the same generic shell regardless of whether it is a `mind_map`, a `session_recap`, a `spatial_scene`, or a `profile_portrait`.

This SPEC defines:

1. A **Codex HTML Template System v2** — per-kind, beautifully designed, interactive HTML output baked into the export runner.
2. A **Client Rendering Engine** — a modular React dispatcher that renders any artifact format with the right component, replacing every `<pre>` and raw-JSON display in the product.
3. A **Signed URL Retrieval Layer** — the missing GET endpoint plus a dual-mode viewer: immediate CDN-backed signed URL preview and durable persistent viewing in Dynamic Inner World.
4. A **Format Registry expansion** — resolving the kind/format mismatch found in the audit and adding structured support for `pdf`, `png`, `gltf`, and audio.
5. **No new Supabase migrations required** — all persistence is already in place from the profile portrait SPEC migrations and the existing `codex_artifacts`/`codex_jobs` tables. One index addition and one SQL view are recommended.

---

## 1. Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │         FORGE LAYER              │
                    │  POST /api/codex/forge           │
                    │  CodexArtifactSchema.parse()     │
                    │  acceptArtifact()                │
                    │  enqueueCodexExportJob()         │
                    └────────────────┬────────────────┘
                                     │ codex_jobs row
                    ┌────────────────▼────────────────┐
                    │         DRAIN LAYER              │
                    │  api/cron/codex-drain.ts         │
                    │  claim_codex_jobs RPC            │
                    │  renderCodexExport() [v2]        │ ← UPGRADED HERE
                    │  storeExport()                   │
                    └────────────────┬────────────────┘
                                     │ html/json/pdf bytes
                    ┌────────────────▼────────────────┐
                    │      SUPABASE STORAGE            │
                    │  codex/<artifactId>/<jobId>.ext  │
                    └────────────────┬────────────────┘
                                     │ signed URL (immediate) + persistent path
                    ┌────────────────▼────────────────┐
                    │     RETRIEVAL LAYER              │
                    │  GET /api/codex/artifacts/       │
                    │      [id]/exports/[format]       │ ← NEW ENDPOINT
                    │  mode: preview | persistent      │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │     CLIENT RENDERING ENGINE      │
                    │  <RenderingEngine artifact={} /> │ ← NEW COMPONENT
                    │  sandboxed iframe or React comp  │
                    └─────────────────────────────────┘
```

---

## 2. Codex HTML Template System v2

### 2.1 Design Philosophy

Every HTML artifact exported by GestaltView is a **self-contained, portable document** that:

- Renders beautifully with zero external dependencies (all CSS and JS inlined or CDN-loaded with fallbacks — see Appendix A)
- Ships a **bundled offline version** alongside the CDN version so users can download and view without network access (decision B1)
- Reflects the visual language of GestaltView: warm neutral surfaces, teal accent, Satoshi or system-sans body, generous whitespace
- Is kind-specific — a `mind_map` looks nothing like a `session_recap`
- Is interactive where appropriate — collapsible sections, tab navigation, animated entries, Mermaid diagrams
- Is safe — all user content is XSS-escaped before injection; no `innerHTML` of raw user strings
- Passes the `sandbox="allow-scripts allow-same-origin"` iframe test

### 2.2 Shared HTML Shell

All per-kind templates extend a shared shell defined in `shared/codex/templates/html-shell.ts`:

```typescript
// shared/codex/templates/html-shell.ts

export interface HtmlShellOptions {
  kind: ArtifactKind;
  title: string;
  subtitle?: string;
  accentColor?: string;        // defaults to #01696f (Hydra Teal)
  bodyContent: string;         // pre-rendered inner HTML (already escaped)
  inlineScripts?: string[];    // safe JS strings to append
  inlineStyles?: string[];     // additional CSS
  meta?: Record<string, string>; // open graph, provenance
  mermaidDiagram?: string;     // if present, injects mermaid CDN + diagram
  offline?: boolean;           // if true, inlines CDN resources instead of loading from network
}

export function buildHtmlShell(opts: HtmlShellOptions): string
```

The shell produces a complete HTML5 document with:

- Embedded GestaltView design tokens (CSS variables matching the Nexus palette)
- Satoshi font via Fontshare CDN with system-sans fallback
- Light/dark mode via `prefers-color-scheme`
- A `<header>` with kind badge, title, subtitle, and a GestaltView provenance watermark
- A `<main>` containing `bodyContent`
- A `<footer>` with artifact ID, created date, and export timestamp
- A minimal `base.css` reset inline
- Optional Mermaid CDN injection when `mermaidDiagram` is provided
- When `offline: true`, all CDN scripts and fonts are inlined as base64 or text blobs

### 2.3 Per-Kind Template Specifications

#### `session_recap`

**Layout:** Narrative scroll — chronological, editorial feel.

**Sections rendered:**
- Hero: session title + date range + PLK resonance score as an animated ring
- Summary callout (full-width teal-bordered card)
- Key themes: horizontal tag cloud with `--color-primary` chips
- Moments timeline: vertical timeline with alternating left/right entry cards, each with timestamp, content, and optional resonance badge
- Synthesis block: italicized insight paragraph with a left border in `--color-primary`
- Provenance drawer: collapsed `<details>` listing source capture IDs

**Interactivity:**
- Timeline entries animate in on scroll using `IntersectionObserver` (no external lib)
- Resonance ring uses SVG `stroke-dashoffset` animation on load
- Provenance drawer expands inline

**Mermaid:** Optional — if `timeline` block type is present, a Mermaid timeline diagram is generated alongside the HTML timeline

#### `blueprint`

**Layout:** Two-column document — outline tree on left, content on right (collapses to single column on mobile).

**Sections rendered:**
- Header: blueprint title + classification badge (private/workspace/public)
- Purpose statement block
- Outline navigator: collapsible `<nav>` tree generated from blueprint sections
- Body sections: each section renders its blocks (markdown, callout, list, timeline)
- Metadata panel: version, source captures, workspace scope
- Action bar: "Copy as Markdown" and "Copy as JSON" buttons (JS clipboard)

**Interactivity:**
- Outline nav highlights current section on scroll (IntersectionObserver)
- Copy buttons with animated checkmark confirmation
- Collapsible sub-sections

#### `report_document`

**Layout:** Long-form editorial — centered prose column, generous line height.

**Sections rendered:**
- Cover: title, subhead, author/date line
- Executive summary callout
- Body sections in order, with H2/H3 hierarchy
- Callout blocks rendered as styled asides with left border
- Timeline blocks rendered as numbered vertical lists
- Code blocks with syntax highlighting via `highlight.js` CDN (auto-loaded only if code blocks exist)
- Footnote/citation list at bottom

**Interactivity:**
- Table of contents generated from H2 sections, sticky on desktop
- Reading progress bar (thin teal line at top)
- "Back to top" button appears after 400px scroll

#### `mind_map`

**Layout:** Full-viewport interactive diagram.

**Primary render:** Mermaid `mindmap` diagram (or `graph LR` if mind_map body uses edge syntax) rendered via Mermaid CDN. The LLM is prompted to produce valid Mermaid syntax in the `body.mermaidSyntax` field (see Section 3.1).

**Fallback render:** If Mermaid fails to parse, a CSS-only radial tree using nested `<ul>` elements with `transform: rotate()` positioning.

**Interactivity:**
- Mermaid diagram is wrapped in a pannable/zoomable `<div>` using `transform: scale()` + pointer drag events (no external lib, ~40 lines of JS)
- "Download as SVG" button: extracts the rendered Mermaid SVG and triggers a download
- "Download as PNG" button: draws SVG to `<canvas>` and calls `canvas.toBlob()`

#### `share_card`

**Layout:** Dynamic aspect-ratio card centered on a dark background for preview. Renders at OG canonical dimensions (1200×630) on desktop, scales to maintain aspect ratio on mobile — no distortion, no letterboxing. Viewport-responsive via CSS `aspect-ratio: 1200/630` with `max-width: 100%`. (Decision B2: agnostic adaptability across device formats, no distortion.)

**Sections rendered:**
- Background: radial gradient using `--color-primary` tones
- GestaltView mark (SVG) top-left
- Large display headline (Satoshi 700, `--text-2xl`)
- Subhead or excerpt
- Bottom bar: user handle / workspace name + date
- Optional: resonance score badge

**Interactivity:**
- "Copy image" button: renders card to canvas via `html2canvas` CDN and copies as blob
- "Download PNG" button: same canvas path, triggers download

**Note:** The PNG export job path for `share_card` should call this same template and use Puppeteer to screenshot the rendered card at 1200×630.

#### `code_module`

**Layout:** Code-first IDE-like view.

**Sections rendered:**
- File header: language badge + filename + line count
- Syntax-highlighted code via `highlight.js` with the GestaltView theme (teal accent on dark surface or light neutral)
- If multiple files in the artifact body, tab bar for file switching
- Dependency list (if present in body metadata)
- Usage example block (if present)

**Interactivity:**
- Copy-to-clipboard on each code block with line numbers toggle
- Tab switching between files (pure CSS or minimal JS)
- "Download as ZIP" button: uses JSZip CDN to pack all file contents and trigger download

#### `spatial_scene`

**Layout:** Full-viewport immersive — the most interactive artifact type.

**CDN delivery:** Three.js is loaded from CDN for immediate online preview. The downloadable export bundles Three.js inline (base64 module) for offline use. Both modes are available — CDN for preview, bundled for download. (Decision B1.)

**Primary render:** Three.js CDN scene constructed from `body.nodes` (spatial coordinates + content labels). Each node is a labeled sphere or card floating in 3D space.

**Sections rendered:**
- Full-screen `<canvas>` with Three.js scene
- Control overlay: pan/zoom/reset controls (touch and mouse)
- Node detail panel: slides in from right when a node is clicked, showing node content
- Legend bar: node categories with color coding

**Interactivity:**
- Orbit controls (Three.js OrbitControls from CDN)
- Node click → detail panel
- Keyboard navigation (arrow keys for orbit, +/- for zoom)
- "Enter VR" button if `navigator.xr` is available (graceful fallback if not)

**Fallback:** If Three.js fails to load or no WebGL, render a 2D force-directed graph using D3 CDN.

#### `audio_narration`

**Layout:** Audio player + transcript view, with a persistent `audio_pending` state for artifacts whose TTS worker has not yet completed. (Decision B3.)

**States:**

1. **`audio_pending`** — TTS job not yet complete. Show: animated CSS waveform, transcript rendered in full, progress indicator ("Audio generating..."), and a bell/notification opt-in button so the user receives a push notification when audio is ready.
2. **`audio_ready`** — TTS complete. Show the full player.

**Sections rendered (audio_ready):**
- Waveform visualizer: SVG-based static waveform generated from amplitude data if available, or a decorative animated CSS waveform
- Play/pause/seek controls (native `<audio>` element styled)
- Speed control: 0.75×, 1×, 1.25×, 1.5×
- Transcript: the `body.script` field rendered as styled prose, with optional word-level highlighting if timestamps are provided
- Download button for the audio file

**Sections rendered (audio_pending):**
- Hero placeholder: animated CSS waveform with "Generating audio..." label
- Transcript preview rendered in full below
- Progress indicator row: spinner + estimated time if available
- "Notify me" opt-in button: registers a preference so the system can surface a notification when the TTS job completes

The `audio_pending` shell is stored as the HTML export immediately after forge. When the TTS worker completes, the job marks the `mp3`/`wav` export as `ready` and a lightweight postMessage or polling update transitions the viewer to `audio_ready` state without a page reload.

#### `profile_portrait`

**Layout:** Dimensional portrait — the highest-stakes artifact. Warm, personal, non-clinical.

**Raw quotes visibility:** Raw PLK-matched quotes ("supporting voices") are shown by default in the HTML export. Users can toggle them off per-section. A user consent acknowledgment is presented on first view: "This portrait contains your own words as evidence. You can hide or delete them at any time." Users have a clear per-session and per-export delete control for raw quotes. This consent layer is non-blocking — it does not prevent export generation. Language style or register is never a filter criterion for output generation. (Decision B4.)

**Sections rendered:**
- Hero: portrait title + tagline in large Satoshi display type, animated subtitle fade-in
- Confidence gauge: a 10-segment horizontal bar showing overall portrait confidence
- Dimension cards: a responsive grid of 10 cards, one per dimension. Each card shows: dimension name, synthesis paragraph, confidence score as a small arc, and a "supporting voices" collapsed section with 2–3 raw quotes from the user's own PLK-matched language. Quotes are togglable and deletable.
- Growth edges: rendered last, in a distinct warm amber section — framed as invitations, not deficits
- Portrait lineage: collapsed timeline showing previous portrait versions with delta badges ("stronger signal on X", "new edge on Y")
- Evidence provenance: collapsed drawer listing contributing source tables and record counts

**Interactivity:**
- Dimension cards expand to full detail on click (smooth height animation)
- "Supporting voices" section shows raw quotes with source context; per-quote hide and delete controls
- Portrait lineage timeline is interactive — clicking a past portrait loads a diff view
- "Share this portrait" button generates a sanitized share card (strips raw quotes, requires explicit user confirmation before share)

---

## 3. Gen-Engine Output Contract Changes

### 3.1 `mind_map` Body Schema Extension

The current `mind_map` body schema stores nodes as generic objects. To enable first-class Mermaid rendering, add a `mermaidSyntax` field:

```typescript
// shared/codex/contracts.ts — MindMapBody extension
export const MindMapBodySchema = z.object({
  title: z.string(),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    parentId: z.string().nullable(),
    depth: z.number().int().min(0),
    meta: z.record(z.unknown()).optional(),
  })),
  mermaidSyntax: z.string().optional(), // LLM-generated; validated before use
  renderHint: z.enum(['mindmap', 'graph_lr', 'radial_css']).default('mindmap'),
});
```

The forge LLM prompt for `mind_map` artifacts MUST include this system instruction:

> "After generating the nodes array, also produce a `mermaidSyntax` field containing a valid Mermaid `mindmap` diagram encoding the same structure. Use only alphanumeric node IDs. Do not use parentheses in node labels."

### 3.2 `spatial_scene` Body Schema Extension

Add coordinate and category fields to enable Three.js scene construction:

```typescript
export const SpatialSceneNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  category: z.string().optional(),
  color: z.string().optional(), // hex, defaults to --color-primary
  scale: z.number().min(0.1).max(5).default(1),
  linkedIds: z.array(z.string()).default([]),
});
```

### 3.3 `CreationCornerOutputFamily` HTML Quality Gate

The `html` member of `CreationCornerOutputFamily` (in `shared/gen-engine/types.ts`) currently produces generic HTML from the template. Add a quality gate: before storing the `html` export, the runner MUST verify the output contains `data-codex-artifact` and `data-kind` attributes and is parseable as UTF-8 HTML5. If not, mark the job `failed` rather than `ready`.

---

## 4. Format Registry Reconciliation

The audit identified format mismatches across kinds. The resolved registry is:

| kind | allowed formats | primary (auto-enqueued) | notes |
|---|---|---|---|
| `session_recap` | `html`, `pdf`, `json` | `html` | Remove `mp3` from registry until TTS worker ships |
| `blueprint` | `html`, `pdf`, `json` | `html`, `json` | JSON is valid for blueprints — it is the schema |
| `report_document` | `html`, `pdf` | `html` | Remove `json` — reports are not schema-structured data |
| `mind_map` | `html`, `png` | `html` | Remove `gltf`; `png` via canvas export in template |
| `share_card` | `html`, `png` | `html` | `png` via Puppeteer screenshot worker |
| `code_module` | `html`, `zip`, `json` | `html` | `zip` via JSZip in template; `json` for manifest |
| `spatial_scene` | `html`, `png` | `html` | `gltf` deferred; `png` via Puppeteer |
| `audio_narration` | `html`, `mp3`, `wav` | `html` | TTS worker required for audio; `html` always ships with `audio_pending` state |
| `profile_portrait` | `html`, `pdf`, `json` | `html` | `json` exports the structured portrait data |

**Implementation:** Update `shared/codex/router.ts` → `EXPORTER_REGISTRY` to match this table. Update `shared/codex/creationCorner.ts` to seed only `getAllowedExportFormats(kind)` on forge, not a hardcoded `['html', 'json']`.

---

## 5. Signed URL Retrieval Endpoint

### 5.1 Dual-Mode Design (Decision B5)

The retrieval endpoint supports two modes:

- **`preview` mode (default):** Returns a short-lived signed URL (1-hour TTL). Used for immediate rendering in Creation Corner and any active-session context. The client does not cache this URL beyond its TTL.
- **`persistent` mode:** Returns a long-lived proxied HTML response (not a redirect). The server fetches the export from Supabase Storage and streams it as the response body. This mode is used exclusively for Dynamic Inner World display, where artifacts need to remain viewable without signed URL expiry. Persistent mode carries server bandwidth cost; it is only activated for artifacts the user has explicitly pinned to Dynamic Inner World.

The `mode` query parameter selects between them: `?mode=preview` (default) | `?mode=persistent`.

### 5.2 New Route

```
GET /api/codex/artifacts/[artifactId]/exports/[format]?mode=preview|persistent
```

**Behavior:**

1. Authenticate user — verify `artifact.userId === auth.uid` or `artifact.securityClass === 'public'`
2. Load `codex_artifacts` row for `artifactId`
3. Find the export manifest item matching `format` where `status === 'ready'`
4. Extract `storagePath` from the manifest item
5. If `storagePath.startsWith('memory://')` → return `{ status: 'ephemeral', message: 'Export was not durably stored. Re-run export.' }`
6. **If `mode=preview`:** Call Supabase `createSignedUrl(storagePath, 3600)` → return `{ signedUrl, expiresAt, format, kind, title }`
7. **If `mode=persistent`:** Fetch the file from Supabase Storage server-side → stream as `Content-Type: text/html` response

**Error states:**
- `404` — artifact not found or no ready export for requested format
- `403` — user does not own artifact and it is not public
- `202` — export exists but status is `pending` or `running` (include `jobId` so client can poll)
- `500` — storage error

### 5.3 Polling Pattern

When the client receives `202`, it polls `GET /api/codex/jobs/[jobId]` every 2 seconds until status is `ready` or `failed`, then fetches the signed URL endpoint again.

---

## 6. Client Rendering Engine

### 6.1 Directory Structure

```
client/src/lib/rendering/
├── RenderingEngine.tsx          // Central dispatcher
├── renderers/
│   ├── HtmlArtifactRenderer.tsx  // Sandboxed iframe for stored HTML exports
│   ├── MarkdownRenderer.tsx      // react-markdown + remark-gfm
│   ├── JsonRenderer.tsx          // Collapsible tree (react-json-view)
│   ├── CodeRenderer.tsx          // Prism syntax highlighting
│   ├── AudioRenderer.tsx         // audio + waveform
│   ├── ImageRenderer.tsx         // img with zoom
│   └── LoadingRenderer.tsx       // Skeleton while export is pending/running
├── hooks/
│   ├── useArtifactExport.ts      // Fetches signed URL, handles polling
│   └── useIframeResize.ts        // Auto-height iframe from postMessage
├── ArtifactExportViewer.tsx      // Composed viewer: toolbar + renderer
└── index.ts
```

### 6.2 `RenderingEngine.tsx`

```typescript
interface RenderingEngineProps {
  artifact: CodexArtifact;
  preferredFormat?: ExportFormat;  // defaults to 'html'
  mode?: 'inline' | 'fullscreen';  // affects sizing
  retrievalMode?: 'preview' | 'persistent'; // maps to endpoint mode param
  onExportReady?: (url: string) => void;
}

export function RenderingEngine({
  artifact,
  preferredFormat = 'html',
  mode = 'inline',
  retrievalMode = 'preview',
  onExportReady,
}: RenderingEngineProps)
```

The dispatcher:

1. Checks `artifact.exports` manifest for a `ready` entry matching `preferredFormat`
2. If found: calls `useArtifactExport(artifactId, format, retrievalMode)` → renders `HtmlArtifactRenderer`
3. If `pending`/`running`: renders `LoadingRenderer` with animated skeleton matching the artifact kind's expected layout
4. If `failed`: renders an error state with a "Retry export" button that calls `POST /api/codex/artifacts/:id/drain-exports`
5. If no export manifest entry exists: renders the artifact body as `MarkdownRenderer` fallback or `JsonRenderer` depending on body shape

### 6.3 `HtmlArtifactRenderer.tsx`

The primary renderer for all Codex HTML exports. Uses a sandboxed iframe:

```typescript
export function HtmlArtifactRenderer({ signedUrl, kind, title, mode }: HtmlArtifactRendererProps) {
  // ...
  return (
    <iframe
      src={signedUrl}
      sandbox="allow-scripts allow-same-origin allow-downloads"
      title={title}
      // NO allow-top-navigation, allow-forms, allow-popups
      style={{ width: '100%', height: iframeHeight, border: 'none' }}
      onLoad={handleLoad}
      ref={iframeRef}
    />
  );
}
```

The iframe communicates height back to the parent via `postMessage`:

```javascript
// injected by html-shell.ts into every exported HTML document
window.parent?.postMessage(
  { type: 'gestaltview:height', height: document.body.scrollHeight },
  '*'
);
```

The `useIframeResize` hook listens for this message and sets the iframe height, enabling seamless inline rendering without scroll bars.

### 6.4 Kind-Specific Loading Skeletons

| kind | skeleton shape |
|---|---|
| `session_recap` | Hero block + 3 timeline card stubs |
| `blueprint` | Two-column: left nav stubs + right content stubs |
| `report_document` | TOC stub + centered prose column stubs |
| `mind_map` | Full-width circle with radiating line stubs |
| `share_card` | Fixed 1200/630 aspect-ratio gradient placeholder |
| `code_module` | Editor pane with colored syntax stubs |
| `spatial_scene` | Dark canvas with floating node stubs |
| `audio_narration` | Waveform stub + transcript line stubs |
| `profile_portrait` | Hero + 3×3 dimension card stubs |

---

## 7. `ArtifactExportViewer` Component

This is the composed, product-ready viewer that replaces every current `<pre>` display in Creation Corner, External Scaffold, and Dynamic Inner World.

```typescript
interface ArtifactExportViewerProps {
  artifact: CodexArtifact;
  showToolbar?: boolean;  // default true
  defaultFormat?: ExportFormat;
  retrievalMode?: 'preview' | 'persistent';  // default: context-dependent (see below)
}
```

**Context-dependent `retrievalMode` defaulting:**
- Creation Corner and External Scaffold → `preview` (active session, signed URL acceptable)
- Dynamic Inner World → `persistent` (long-lived viewer, proxied HTML)

**Toolbar controls:**
- Format selector: tabs/buttons showing available export formats from the manifest
- "Open in new tab" button: opens signed URL directly
- "Download" button: triggers signed URL download; for `spatial_scene` and `mind_map`, offers both online (CDN) and offline (bundled) versions
- "Re-run export" button: `POST` to drain endpoint — only visible if status is `failed` or `pending` with no ready entry
- "Share" button: only visible for `share_card` kind or `securityClass === 'public'`

**Integration points — replace these existing patterns:**

| File | Current pattern | Replace with |
|---|---|---|
| `client/src/pages/CreationCornerPage.tsx` | Raw content in `<pre>` | `<ArtifactExportViewer artifact={codexArtifact} />` |
| `client/src/pages/ExternalScaffoldPage.tsx` | Direct scaffold artifact rendering | `<ArtifactExportViewer artifact={artifact} showToolbar={false} />` |
| `client/src/features/dynamic-inner-world/world-renderer/renderWorldNode.tsx` | artifact-pod node | `<ArtifactExportViewer artifact={artifact} mode="inline" showToolbar={false} retrievalMode="persistent" />` |

---

## 8. Codex Forge Prompt Upgrades

For each artifact kind, the forge LLM prompt in `api/codex/forge.ts` and the prompt templates it references must be upgraded to produce richer body schemas that the v2 templates can consume:

| kind | required body fields for v2 rendering | LLM instruction additions |
|---|---|---|
| `session_recap` | `summary: string`, `themes: string[]`, `moments: array` with `{timestamp, content, resonanceScore}`, `synthesis: string`, `resonanceScore: 0–1` | Structure moments chronologically. Each moment must have a timestamp (ISO string), content (string), and a resonanceScore (0–1). |
| `blueprint` | `purpose: string`, `sections: array` with `{id, title, depth, blocks}`, `version: string`, `scope: enum` | Generate a navigable outline structure. Each section must have a unique `id` for anchor linking. |
| `report_document` | `subhead: {headline}`, `sections: array` with `{heading, blocks}`, `citations?: array` | Use callout blocks for key insights. Use timeline blocks for sequential events. |
| `mind_map` | `nodes: array`, `mermaidSyntax: string` (valid Mermaid mindmap) | See Section 3.1. |
| `share_card` | `headline: string` (≤80 chars), `excerpt: string` (≤160 chars), `accentColor?: hex` | Produce a punchy headline under 80 characters. Write an excerpt that stands alone without context. |
| `code_module` | `files: array` with `{filename, language, content, description}`, `usageExample` | Always produce at least one file with filename and language. Include a usage example. |
| `spatial_scene` | `nodes: array` per `SpatialSceneNodeSchema`, `title`, `description` | Assign meaningful 3D positions. Use categories to group related nodes. Keep label strings under 40 chars. |
| `audio_narration` | `script: string`, `voice: enum(warm\|neutral\|expressive)`, `durationEstimate: seconds` | Write the script as spoken word — no markdown, no bullet points. Estimate duration at 150 words/minute. |
| `profile_portrait` | Defined in profile portrait SPEC | No change. |

---

## 9. Anti-Sycophancy Pass on HTML Output

The existing `stripEmbellishment` function in `shared/gen-engine/core.ts` removes performative phrases from generated text. This pass MUST be applied to all text content before injection into HTML templates. The v2 template builder calls it explicitly:

```typescript
// shared/codex/templates/html-v2.ts
import { stripEmbellishment } from '../../../gen-engine/core';

function safeInject(text: string): string {
  return escapeHtml(stripEmbellishment(text));
}
```

Every `bodyContent` string is passed through `safeInject` before entering the HTML shell.

---

## 10. PDF Export Path

**Short-term (no Puppeteer worker yet):** For `session_recap`, `report_document`, and `blueprint`, the HTML export already produces print-optimized CSS via `@media print` rules in the shell. The "Download as PDF" button in the viewer triggers `window.print()` in the sandboxed iframe via `postMessage`. This gives immediate PDF capability without a worker.

**Long-term (Puppeteer worker):** Add a `codex-pdf-worker` Vercel function that:
1. Receives `artifactId`, `jobId`
2. Fetches the signed URL for the `html` export
3. Launches Playwright Chromium (available via `playwright-core` / `@vercel/playwright`)
4. Navigates to the signed URL
5. Calls `page.pdf()` with A4 format, generous margins
6. Uploads to `CODEX_EXPORT_BUCKET` at the job's storage path
7. Calls `updateCodexJob` with `status: 'ready'`

The Playwright approach is preferred over server-side HTML-to-PDF libraries because it respects the full CSS cascade — fonts, gradients, grid layouts — that makes the v2 templates look correct.

---

## 11. Implementation Order

Each phase is independently deployable and minimizes regression risk.

### Phase 1 — Format Registry Fix (1–2 days, zero risk)
- Update `EXPORTER_REGISTRY` in `shared/codex/router.ts` per Section 4 table
- Update `shared/codex/creationCorner.ts` to seed formats from `getAllowedExportFormats(kind)` not hardcoded `['html', 'json']`
- Run backfill SQL from audit Section 7 to clean existing artifacts
- **Verification:** `pnpm exec tsc --noEmit` passes; forge test for each kind returns valid pending manifest

### Phase 2 — HTML Shell v2 (3–4 days)
- Create `shared/codex/templates/html-shell.ts` (Section 2.2) with `offline` flag support
- Replace `shared/codex/templates/html.ts` render path in `workers/codex/activities.ts` to call per-kind template builder
- Implement per-kind templates in `shared/codex/templates/kinds/`:
  - `session-recap.ts`
  - `blueprint.ts`
  - `report-document.ts`
  - `mind-map.ts` (with Mermaid injection)
  - `share-card.ts` (dynamic aspect-ratio layout per B2)
  - `code-module.ts`
  - `spatial-scene.ts` (CDN online + offline bundled per B1)
  - `audio-narration.ts` (with `audio_pending` state per B3)
  - `profile-portrait.ts` (with consent + raw quote controls per B4)
- **Verification:** Run drain locally for one artifact of each kind; open output HTML in browser; confirm visual quality

### Phase 3 — Retrieval Endpoint (1 day)
- Implement `GET /api/codex/artifacts/[artifactId]/exports/[format]` with `?mode=preview|persistent` (Section 5)
- **Verification:** Forge an artifact, drain it, hit the new endpoint in both modes, confirm signed URL loads the HTML and persistent mode streams correctly

### Phase 4 — Client Rendering Engine (3–4 days)
- Create `client/src/lib/rendering/` directory (Section 6.1)
- Implement `RenderingEngine.tsx`, `HtmlArtifactRenderer.tsx`, `useArtifactExport.ts`, `useIframeResize.ts`
- Implement kind-specific loading skeletons (Section 6.4)
- Implement `ArtifactExportViewer.tsx` with toolbar and context-dependent `retrievalMode` defaulting
- Replace `<pre>` patterns in `CreationCornerPage.tsx`, `ExternalScaffoldPage.tsx`, `renderWorldNode.tsx`
- **Verification:** Creation Corner synthesis → stored export → signed URL → sandboxed iframe render; confirm no XSS, no overflow, no broken height; Dynamic Inner World persistent viewer loads and stays visible across sessions

### Phase 5 — Forge Prompt Upgrades (2–3 days)
- Update LLM prompts per Section 8 table
- Update body schemas in `shared/codex/contracts.ts` for `mind_map` (Section 3.1) and `spatial_scene` (Section 3.2)
- **Verification:** Forge one artifact of each kind; confirm body fields match v2 template requirements; run Zod parse on each output

### Phase 6 — Print-to-PDF (1 day)
- Add `@media print` rules to HTML shell (Section 10 short-term path)
- Add "Print / Save as PDF" button to `ArtifactExportViewer` toolbar that posts `{ type: 'gestaltview:print' }` to the iframe

---

## 12. Supabase — No New Migrations Required

All persistence tables from the profile portrait SPEC migrations are already in place. Two optional additions are recommended but not blocking:

### 12.1 Index (recommended)

```sql
-- Speeds up the retrieval endpoint query on format + status
CREATE INDEX IF NOT EXISTS idx_codex_artifacts_exports_gin
  ON codex_artifacts USING gin (exports);
```

### 12.2 Export Status View (recommended, not blocking)

```sql
CREATE OR REPLACE VIEW codex_export_status AS
SELECT
  a.id           AS artifact_id,
  a.kind,
  a.title,
  a.user_id,
  a.status       AS artifact_status,
  item ->> 'format'      AS format,
  item ->> 'status'      AS export_status,
  item ->> 'storagePath' AS storage_path,
  item ->> 'updatedAt'   AS export_updated_at
FROM codex_artifacts a,
     jsonb_array_elements(a.exports) AS item
WHERE a.exports IS NOT NULL
  AND jsonb_array_length(a.exports) > 0;
```

Useful for monitoring and for admin tooling to find `memory://` paths or stuck exports.

---

## 13. Security Constraints

- All user-generated text is passed through `escapeHtml` before injection into HTML templates. No exceptions.
- `stripEmbellishment` is applied before `escapeHtml` so it operates on the raw string, not escaped HTML entities.
- Sandboxed iframes use `sandbox="allow-scripts allow-same-origin allow-downloads"`. `allow-forms`, `allow-popups`, `allow-top-navigation` are explicitly excluded.
- Signed URLs have a 1-hour TTL. The client does not cache them beyond that window.
- `spatial_scene` Three.js scenes must not load external URLs from artifact body content. The template's CDN imports are whitelisted; node content is text-only.
- `mermaidSyntax` from the LLM is parsed by Mermaid's own parser inside the sandboxed iframe. If Mermaid throws, the fallback CSS tree renders instead. No `eval` of the mermaid syntax string occurs outside the iframe.
- `profile_portrait` raw quotes in HTML exports are protected by: (a) consent acknowledgment on first view; (b) per-quote hide/delete controls in the viewer; (c) sanitized share card strips all raw quotes before any public share action.
- Persistent mode proxying is restricted to artifacts owned by the authenticated user or with `securityClass === 'public'`. The server validates ownership before streaming.

---

## 14. Quality Bar

A Codex HTML export passes quality review when:

- It loads with zero console errors in Chrome and Firefox
- It is visually distinct from other artifact kinds — a `mind_map` cannot be confused with a `session_recap`
- All text is legible: body 16px, labels 12px, adequate contrast in both light and dark mode
- Interactive elements (accordions, copy buttons, timeline reveals) work without a network connection after initial CDN load
- Mermaid diagram renders for `mind_map` on first load
- Three.js scene renders for `spatial_scene` with at least 2 nodes
- Printing the HTML (Ctrl+P) produces a clean, readable PDF without nav chrome
- The document is self-describing — a reader with no GestaltView context can understand what it is from the header and footer alone
- `data-codex-artifact` and `data-kind` attributes are present on `<main>`
- No GestaltView-internal IDs or service-role data appear in the rendered output
- `share_card` renders without distortion on both desktop (1200×630) and mobile (scaled, aspect-ratio preserved)
- `audio_narration` exports in `audio_pending` state show a progress indicator and "Notify me" button
- `profile_portrait` raw quotes are hideable/deletable without a page reload

---

## 15. Appendix A — CDN Dependencies

All CDN loads use `defer` and are wrapped in `try/catch` with a `window.onerror` handler that activates the fallback path. No CDN failure should produce a blank page. When the `offline` flag is set on the HTML shell, all dependencies below are inlined instead of loaded from CDN.

| Library | CDN URL | Fallback |
|---|---|---|
| Mermaid | `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js` | CSS radial tree |
| highlight.js | `https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js` | `<pre>` with monospace |
| Three.js | `https://cdn.jsdelivr.net/npm/three@0.165/build/three.module.min.js` | D3 force graph |
| D3 fallback | `https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js` | Static node list |
| html2canvas | `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js` | Omit copy-image button |
| JSZip | `https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js` | Omit ZIP download |
| Satoshi font | `https://api.fontshare.com/v2/css?f=satoshi@400,500,700&display=swap` | System sans-serif |

---

## 16. Appendix B — Open Questions (All Resolved)

| ID | Question | Decision |
|---|---|---|
| **B1** | Should `spatial_scene` HTML exports embed Three.js inline (~600KB) or load from CDN? | **Both.** CDN for immediate preview; bundled inline for downloaded offline exports. Both options are accessible to users. |
| **B2** | Should `share_card` render at OG dimensions (1200×630) or scale to viewport? | **Dynamic aspect ratio.** Maintains 1200/630 aspect ratio via CSS `aspect-ratio` with `max-width: 100%`. No distortion. Agnostic adaptability across device formats. |
| **B3** | Should `audio_narration` HTML export show an `audio_pending` state or defer until TTS is complete? | **`audio_pending` state.** Establish the pending shell immediately. Show progress indicator, full transcript preview, and a notification opt-in. Notify user on completion. |
| **B4** | Should raw PLK-matched quotes be visible in `profile_portrait` HTML exports, or opt-in? | **Visible by default, with user control.** Consent acknowledgment on first view. Per-quote hide and delete controls. User consent and data control are paramount. Language register is never a filter criterion for output generation. |
| **B5** | Should the export retrieval endpoint proxy HTML content directly or redirect to a signed URL? | **Both modes.** `?mode=preview` returns a 1-hour signed URL for active-session viewing. `?mode=persistent` streams proxied HTML for Dynamic Inner World long-lived display. |
