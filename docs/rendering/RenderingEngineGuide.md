# Rendering Engine Guide

Last reviewed: 2026-07-02

This guide covers the GestaltView rendering layer: server-side renderers,
the client renderer registry, the shared UI panel system, and the environment
variables needed for PDF and audio export. It reflects the **live** repo state
as of this pass — several parts described in older specs were already
implemented and were intentionally left as-is because they are more capable
than the earlier proposals.

---

## 1. How to add a new renderer (server + client)

### Server side (`shared/rendering/`)

Each server renderer implements the `Renderer<TInput>` interface from
`shared/rendering/types.ts`:

```ts
export class MyRenderer implements Renderer<MyInput> {
  public readonly kind = "my-kind";
  public formats(): string[] {
    return ["html", "json"]; // formats this renderer can emit
  }
  public async render(input: MyInput, format: string): Promise<RenderedArtifact> {
    // return { format, data } — data is a string or a Buffer for binary formats
  }
}
```

Register it where the dispatch table is assembled (see the existing renderers:
`markdown.ts`, `mindmap.ts`, `slides.ts`, `pdf.ts`, `audio.ts`) and re-export
from `shared/rendering/index.ts`.

Notes on the current renderers:

- **MindMapRenderer** emits a self-contained Mermaid CDN HTML page for `html`,
  raw Mermaid for `mermaid`, `{ nodes, edges }` for `react-flow`, and JSON.
- **SlideRenderer** emits a self-contained Reveal.js 5.1 deck (markdown plugin,
  highlight, notes) for `html`; `pdf`/`png` return HTML bytes as a fallback.
- **PdfRenderer** renders via Puppeteer when a Chromium binary is resolvable
  (`PUPPETEER_EXECUTABLE_PATH` or `@sparticuz/chromium`), and falls back to HTML
  bytes so the pipeline never hard-blocks.
- **AudioRenderer** posts to a self-hosted TTS endpoint; when no TTS URL is set
  it returns a styled HTML script preview instead of failing.

### Client side (`client/src/lib/rendering/`)

1. Add a renderer component under `renderers/` (a React component receiving
   `RenderProps` from `types.ts`).
2. Register the format → component mapping in `registry.ts`.
3. Add any format aliasing rules in `dispatch.ts` (`resolveFormat`).
4. Rendering is driven through `<RenderingEngine artifact={...} />`, which
   resolves the format, selects the renderer, and wraps it in a
   `RendererErrorBoundary` so a single renderer failure never blanks the page.

---

## 2. Using `GlassPanel`, `SectionLabel`, and `RoomHeaderBar`

Import from `@/components/ui`:

```tsx
import { GlassPanel, SectionLabel, RoomHeaderBar } from "@/components/ui";
```

- **`RoomHeaderBar`** — the consistent room header shell (back-nav, dev-only
  room-state badge, optional action slot, optional DI presence toggle):

  ```tsx
  <RoomHeaderBar
    roomSlug="creation-corner"
    backLabel="← Home"
    diName={di.publicName}
    diReady={isReady}
    onDiToggle={() => setDiOpen((o) => !o)}
  />
  ```

- **`GlassPanel`** — a variant-tinted glassmorphic surface. Variants:
  `default | sky | purple | emerald | amber | void`. Optional `hover` and `glow`:

  ```tsx
  <GlassPanel variant="sky" hover glow className="p-5">…</GlassPanel>
  ```

  This is additive alongside the existing `GlassCard`; use `GlassPanel` for
  section-level containers where a tinted/glowing variant is wanted.

- **`SectionLabel`** — the small uppercase eyebrow heading above room sections.
  Variants: `sky | purple | emerald | amber | neutral`:

  ```tsx
  <SectionLabel variant="sky">Raw Material</SectionLabel>
  ```

---

## 3. The `renderArtifact()` client helper

`client/src/lib/renderingClient.ts` posts to `/api/render/decide` and returns
`Blob | string`:

- Text-like responses (`text/*`, `application/json`) resolve to a `string`.
- Everything else (pdf, png, wav, mp3) resolves to a `Blob`, ready for
  `URL.createObjectURL(blob)` downloads.

For Codex artifacts, the richer path is `ArtifactExportViewer`, which uses the
`useArtifactExport` hook to poll export jobs and resolve signed URLs. It already
renders binary formats correctly (PDF → iframe, audio → `<audio>`, image →
`<img>`, video → `<video>`) and downloads via the signed URL — prefer it over a
manual `renderArtifact()` download for `CodexArtifact` objects.

### The `gestaltview:height` bridge

Generated HTML shells (`shared/codex/templates/html-shell.ts`) post their
scroll height to the parent via `postMessage({ type: "gestaltview:height" })`
on load and on `ResizeObserver` changes. The `useIframeResize` hook consumes
these messages so embedded artifact iframes auto-size to their content.

---

## 4. Environment variables for PDF and TTS

These are required in Vercel for production PDF/audio export. They are **not**
required for the build to pass.

| Variable | Purpose | Required for |
|---|---|---|
| `PUPPETEER_EXECUTABLE_PATH` | Chromium binary path for Vercel serverless | PDF export |
| `ORPHEUS_TTS_URL` | Orpheus-FastAPI TTS endpoint URL | Audio export |
| `COQUI_TTS_URL` | Coqui TTS endpoint URL (fallback) | Audio export |
| `TTS_SERVICE_URL` | Generic TTS endpoint (final fallback) | Audio export |
| `CORS_ORIGINS` | Comma-separated allowed origins | All API routes |

`@sparticuz/chromium` is already a dependency in `package.json`; when
`PUPPETEER_EXECUTABLE_PATH` is unset, `PdfRenderer` attempts to resolve the
Chromium binary through it automatically.
