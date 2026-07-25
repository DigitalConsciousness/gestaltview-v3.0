# GestaltView Rendering & Generative Integration Specification (v0)

This document describes the initial blueprint for integrating a modular rendering pipeline into the
`gestaltview-v2.0` codebase.  It is informed by the **GestaltView Runtime Audit and Intelligent Rendering**
transcript and the **Synthesis/Rendering Prospects** research summary.  The goal is to
separate *synthesis* (content generation) from *rendering* (formatting and export), to
support a wide range of artifact formats, and to do so using a clear, incremental
architecture that can be extended by specialist Digital Intelligence agents.

## Background

The audit highlighted the need for an end‑to‑end rendering workflow.  When a user hits the
“synthesize” button in Creation Corner, the resulting artifact should be previewable and
exportable without exposing server‑side work‑in‑progress.  At present the system
generates content but does not have dedicated modules to turn that content into
high‑quality outputs such as PDFs, enhanced Markdown, slide decks or audio files.  The
research summary offered several concrete technology recommendations for each domain:

- **Markdown:** Use `Markon` or a `marked`/`remark` pipeline for enhanced rendering with CSS token
  injection and diagram support【25†L1-L18】.  Study **Markdown Preview Enhanced** as a reference.
- **PDF:** Convert HTML to PDF via **Puppeteer** or **Playwright**【25†L19-L28】.  For programmatic
  PDF construction, consider **PDF‑LIB**.
- **Slides:** Use **Slidev** for Markdown‑driven decks and **Reveal.js** for embedded preview【25†L32-L35】.
- **Audio:** Explore **Orpheus‑FastAPI** or **Coqui TTS** for text‑to‑speech and generate
  waveform previews【25†L39-L42】.
- **Mind maps:** Leverage Mermaid’s mindmap syntax or React Flow for interactive graphs【25†L44-L48】.
- **Memory/Checkpointing:** Model automatic state persistence based on the research into
  agentic memory【25†L49-L53】.

These recommendations form the foundation for the architecture below.

## High‑level Design

### Two‑Layer Pattern

Following the research, rendering is separated from generation.  A *Synthesis Digital
Intelligence* (DI) receives prompts, embodiment profiles and context and produces a
structured `Artifact` (e.g. a session recap or report).  A dedicated *Rendering Agent*
transforms this artifact into one or more end formats such as HTML, PDF or audio.

```
User Input → Synthesis DI → Artifact (textual/structured) → Rendering Agent → Output file(s)
```

This separation allows specialist renderers to be swapped independently from the LLM
generators, encourages caching and reuse, and supports future features like dynamic
styling or export parameters.

### Renderer Abstraction

Renderers share a common interface:

```ts
interface Renderer<TInput, TOutput> {
  /**
   * Unique name for this renderer, used for logging and diagnostics.
   */
  kind: string;

  /**
   * Return a list of formats this renderer can produce (e.g. 'html', 'pdf').
   */
  formats(): string[];

  /**
   * Render an input artifact into the requested format.  Throws if the format
   * is not supported.  Returns a buffer or string containing the rendered
   * output.  Renderers may persist intermediate files in the future.
   */
  render(input: TInput, format: string): Promise<RenderedArtifact>;
}
```

Where `RenderedArtifact` is:

```ts
type RenderedArtifact = {
  format: string;         // file extension or MIME subtype (e.g. 'pdf', 'html')
  data: Buffer | string;  // rendered content
  filename?: string;      // optional suggested filename for download
};
```

Implementations should be pure functions where possible; side effects such as disk
writes should be coordinated by the API layer (`api/render/decide.ts`).

### Renderers in this Package

This version introduces several basic renderers.  Each contains minimal logic and
placeholder implementations where full integration would require external
dependencies.  Real implementations should replace these stubs with calls to
appropriate packages (e.g. `marked`, `puppeteer`, or an audio service).  See
`shared/rendering/*.ts` for details.

1. **MarkdownRenderer**
   - Input: Markdown string.
   - Output formats: `html`, `json` (AST).
   - Uses `marked` to convert Markdown to HTML.  Hooks exist for injecting
     GestaltView CSS tokens into the HTML head.

2. **PdfRenderer**
   - Input: HTML string or Markdown.
   - Output formats: `pdf`.
   - Stubbed to return a dummy PDF buffer.  The real implementation should
     spin up Puppeteer/Playwright to render the HTML in headless Chromium and
     produce paged output【25†L19-L28】.

3. **SlideRenderer**
   - Input: Markdown string representing a slide deck (`---` separators for slides).
   - Output formats: `html`, `pdf`, `png`.
   - Stubbed implementation returns placeholder HTML.  Real implementation should
     call Slidev (`slidev build`) or embed Reveal.js to generate interactive decks【25†L32-L35】.

4. **AudioRenderer**
   - Input: Plain text.
   - Output formats: `wav`, `mp3`.
   - Stubbed implementation returns an empty buffer.  Real implementation should
     call a self‑hosted TTS service like Orpheus‑FastAPI or Coqui TTS【25†L39-L42】.

5. **MindMapRenderer**
   - Input: A mind map data structure (nodes and edges).
   - Output formats: `mermaid`, `json`.
   - Converts the node tree into Mermaid mindmap syntax or returns JSON.  This
     renderer demonstrates how a DI can hand off a graph to the front‑end for
     interactive rendering via React Flow【25†L44-L48】.

### API Surface

A new endpoint `POST /api/render/decide` has been added.  This route accepts
three parameters:

```json
{
  "artifactKind": "report_document" | "mind_map" | ...,
  "content": string | object,
  "format": "html" | "pdf" | ...
}
```

It looks up the appropriate renderer based on the `artifactKind` and delegates
the `render()` call.  The rendered output is returned as a binary
response with appropriate content type headers.  See `api/render/decide.ts`.

### Client Library

`client/src/lib/renderingClient.ts` provides a small wrapper around the new API
endpoint for the front end.  It exposes a `renderArtifact` function that
takes the same parameters as the API.  The Creation Corner page can use this
client to request previews and downloads in different formats without
extending the existing generation pipeline.

### Test Plan

Tests have been added under `tests/rendering` to validate the routing logic of
the new endpoint.  Because many renderers are stubs, these tests focus on
ensuring the correct renderer is chosen for a given `artifactKind` and that
error conditions (unsupported format, unknown kind) are handled gracefully.

## Migration and Integration Steps

1. **Install Dependencies.**  In addition to existing dependencies, you will
   need to add the following packages when implementing the real renderers:

   ```bash
   npm install --save marked remark remark-html puppeteer playright pdf-lib slidev
   npm install --save @vue/compiler-sfc  # required by slidev if used
   ```

   For audio: choose between `coqui-tts` or deploying a TTS service such as
   Orpheus‑FastAPI; then add a wrapper client.

2. **Merge the `shared/rendering` namespace into your monorepo.**  This package
   introduces a new top‑level folder `shared/rendering`.  It mirrors the
   structure of the existing `shared/codex` folder: everything is written in
   TypeScript, uses ES modules, and is compiled via the existing build
   pipeline.

3. **Update the `codex` contract** to ensure that any artifact types requiring
   new formats are reflected in the allowed export formats.  For example,
   `report_document` now clearly supports `pdf` and `html`.  You may need to
   update the manifest or contract schema accordingly.

4. **Expose the new API route.**  The file `api/render/decide.ts` registers a
   default export for Vercel style routes.  Depending on your hosting
   environment you may need to wrap this in your existing API routing
   infrastructure.

5. **Adjust front‑end pages.**  The Creation Corner should call
   `renderArtifact` after synthesis to obtain a preview.  Only show the user
   the preview when rendering is complete.  Offer export options for
   supported formats.

6. **Introduce Digital Intelligence agents.**  This package defines
   renderers as functions.  To embed them into an agentic workflow, you should
   create specialist DIs whose burst prompts instruct them to call the
   appropriate renderer after generating content.  Each DI should have its
   own embodiment profile, memory checkpoint logic and operational playbook.

## Future Work

This v0 release intentionally provides only the scaffolding and stubs.  Real
rendering is delegated to specialist modules which should be selected and
configured according to the research recommendations:

* Replace the Markdown stubs with a pipeline of `remark` transforms and
  `rehype` to inject GestaltView CSS tokens and dark/light theme support.
* Integrate Puppeteer or Playwright to produce true PDFs with page
  headers/footers.
* Embed Slidev or Reveal.js into your build to support deck generation and
  preview.
* Deploy a TTS service such as Orpheus‑FastAPI and call it from the
  `AudioRenderer`.
* Expand the mind map renderer to output React Flow node/edge structures and
  create a dedicated DI to generate mind maps from session recaps.

By following this specification, the GestaltView runtime will have a
deterministic and modular rendering pipeline capable of producing the rich
artifact formats envisioned in the audit【25†L1-L18】【25†L19-L28】.