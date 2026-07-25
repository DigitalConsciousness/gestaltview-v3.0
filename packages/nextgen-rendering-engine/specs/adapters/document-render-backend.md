# Document Render Backend Adapter Specification

## Scope

Adapter contract for document and report renderers that transform Markdown, Vue markdown, RenderCV data, DOM capture targets, and Chart.js charts into portable visual artifacts.

## Required Input Format

Adapters MUST accept a normalized `RenderJob` JSON document:

```json
{
  "jobId": "string",
  "backend": "document-render-backend",
  "document": {
    "type": "markdown|vue-markdown|rendercv|dom-capture|chartjs",
    "uri": "workspace-relative source path or local URL",
    "content": "optional inline source",
    "data": {},
    "template": "optional workspace-relative template path"
  },
  "render": {
    "page": { "width": 816, "height": 1056, "margin": 48 },
    "viewport": { "width": 1280, "height": 720, "deviceScaleFactor": 1 },
    "theme": "default|dark|print|custom"
  },
  "outputs": { "directory": "workspace-relative path", "formats": ["pdf", "png", "svg", "html", "json"] },
  "metadata": { "requester": "string", "traceId": "string" }
}
```

At least one of `document.uri` or `document.content` MUST be present. `document.data` MUST be JSON-serializable.

## Output Artifacts

The adapter MUST produce:

- Requested document artifact: PDF, image capture, SVG, HTML, or structured JSON.
- `render-manifest.json` with job ID, backend ID, document type, source hash, output file list, dimensions, theme, and package versions.
- `diagnostics.json` with parse warnings, missing assets, layout warnings, browser console messages for DOM capture, and chart rendering warnings.

Optional artifacts include extracted assets, intermediate HTML, accessibility summaries, and per-page thumbnails.

## Runtime Dependencies

- Markdown parser/runtime for Markdown documents.
- Vue and Vue markdown renderer dependencies for Vue markdown entries.
- Python runtime and RenderCV package dependencies for CV/resume generation.
- Browser automation runtime for DOM capture.
- Chart.js and node-canvas or browser canvas runtime for chart rendering.
- Optional PDF engine such as Chromium print-to-PDF, LaTeX, Typst, or RenderCV-supported generators.

The adapter MUST declare whether each document type is available in its capability probe.

## Error Model

Errors MUST use the shared JSON shape:

```json
{
  "ok": false,
  "code": "DOCUMENT_BACKEND_ERROR_CODE",
  "message": "human-readable summary",
  "severity": "fatal|retryable|warning",
  "stage": "validate|parse|hydrate-data|layout|capture|export|write-artifacts",
  "details": {},
  "artifacts": ["diagnostics.json"]
}
```

Standard error codes:

- `DOCUMENT_INPUT_INVALID`
- `DOCUMENT_SOURCE_UNRESOLVED`
- `DOCUMENT_DEPENDENCY_UNAVAILABLE`
- `DOCUMENT_PARSE_FAILED`
- `DOCUMENT_LAYOUT_FAILED`
- `DOCUMENT_CAPTURE_FAILED`
- `DOCUMENT_EXPORT_FAILED`
- `DOCUMENT_OUTPUT_WRITE_FAILED`

Warnings MUST be recorded for unsupported CSS, missing fonts, and non-fatal chart option fallbacks.

## Cross-Backend Compatibility Contract

The backend MUST:

- Preserve the shared `RenderJob` envelope and artifact conventions.
- Normalize all source types to artifact files addressable by workspace-relative paths.
- Emit deterministic filenames: `{jobId}.{extension}` for single documents and `{jobId}-page-{pageNumber}.{extension}` for paginated outputs.
- Include source hashes and package/runtime versions in `render-manifest.json`.
- Map parser, layout, capture, and export failures into the shared error object.

## Candidate Source Directories and Key Package Manifests

- `markdown-preview-enhanced-master/markdown-preview-enhanced-master` — Markdown rendering candidate.
  - `markdown-preview-enhanced-master/markdown-preview-enhanced-master/package.json`
- `vue-markdown-renderer-main/vue-markdown-renderer-main` — Vue markdown rendering candidate.
  - `vue-markdown-renderer-main/vue-markdown-renderer-main/package.json`
- `rendercv-main/rendercv-main` — RenderCV document generation candidate.
  - `rendercv-main/rendercv-main/pyproject.toml`
  - `rendercv-main/rendercv-main/scripts/ats_proof/pyproject.toml`
- `dom-to-image-master/dom-to-image-master` — DOM capture candidate.
  - `dom-to-image-master/dom-to-image-master/package.json`
- `ChartjsNodeCanvas-master/ChartjsNodeCanvas-master` — Chart.js server-side canvas candidate.
  - `ChartjsNodeCanvas-master/ChartjsNodeCanvas-master/package.json`
