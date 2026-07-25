# GestaltView Rendering v0

This directory contains the initial implementation of a modular rendering pipeline
for the GestaltView project.  It is intended to accompany the existing
generation (Codex) infrastructure by providing dedicated renderers for
Markdown, PDF, slide decks, audio and mind map artifacts.  These renderers are
designed to be called from a Digital Intelligence (DI) after content
generation is complete, ensuring that users see only final or pending
artifacts in the UI.

The core concepts introduced here are:

* **Renderer Interface** – a generic interface that describes how to convert
  input data into a particular format.
* **Domain‑Specific Renderers** – implementations for Markdown, PDFs,
  slides, audio and mind maps, each living under `shared/rendering`.
* **Rendering API** – an API route (`api/render/decide.ts`) that chooses the
  correct renderer based on the `artifactKind` and `format` supplied by the
  client.
* **Client Helper** – a front‑end helper (`client/src/lib/renderingClient.ts`) for
  invoking the new API from React components.

Because this is a v0 release, many of the implementations are stubs or
placeholders.  The accompanying specification
(`SPEC_Rendering_Integration.md`) describes how to replace these stubs with
real rendering logic using recommended open‑source libraries.

## File Overview

* `SPEC_Rendering_Integration.md` – high‑level specification and design notes.
* `MANIFEST.json` – metadata listing the files included in this package.
* `CODEX_APPLY_PROMPT.md` – a succinct set of instructions for Codex on how to
  merge this package into the monorepo.
* `shared/rendering/types.ts` – TypeScript definitions for renderers and
  rendered artifacts.
* `shared/rendering/markdown.ts` – Markdown renderer implementation (stub).
* `shared/rendering/pdf.ts` – PDF renderer implementation (stub).
* `shared/rendering/slides.ts` – Slide deck renderer implementation (stub).
* `shared/rendering/audio.ts` – Audio renderer implementation (stub).
* `shared/rendering/mindmap.ts` – Mind map renderer implementation.
* `shared/rendering/index.ts` – Barrel file exporting all renderers.
* `api/render/decide.ts` – API route that dispatches rendering requests to the
  correct renderer.
* `client/src/lib/renderingClient.ts` – Front‑end helper for calling the
  rendering API.
* `tests/rendering/decide.test.ts` – Basic unit tests for the dispatch logic.

## Usage

1. **Install dependencies:** See the specification for a list of required
   packages.  You can install them with `npm install` or `pnpm install`.
2. **Import the renderers:** The renderers are exported from
   `shared/rendering/index.ts` and can be used directly by your DIs or other
   backend modules.
3. **Call the API:** The `/api/render/decide` endpoint accepts a POST request
   with JSON containing `artifactKind`, `content` and `format`.  It
   responds with the rendered artifact.
4. **Front‑end integration:** Use the helper in
   `client/src/lib/renderingClient.ts` to invoke the API from React components.
5. **Run tests:** Execute `npm test` or `pnpm vitest run` to run the unit tests
   in `tests/rendering`.

## Limitations

This package is intentionally conservative and does not include heavy
dependencies or host external services.  To make the renderers fully
operational you will need to:

* Replace stubbed code with calls to real rendering libraries (see the
  specification for suggestions).
* Configure your deployment environment to allow headless Chromium for PDF
  generation.
* Deploy or embed a TTS engine for audio synthesis.
* Update the codex contracts and front‑end selectors to surface new export
  formats to users.

Nevertheless, this v0 provides the skeleton and clear extension points for a
robust, modular rendering pipeline.