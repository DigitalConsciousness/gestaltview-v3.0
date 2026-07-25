# Diagram Graph Backend Adapter Specification

## Scope

Adapter contract for graph and diagram renderers that transform Mermaid diagrams and XYFlow node-edge documents into SVG, raster images, HTML previews, or graph metadata.

## Required Input Format

Adapters MUST accept a normalized `RenderJob` JSON document:

```json
{
  "jobId": "string",
  "backend": "diagram-graph-backend",
  "diagram": {
    "type": "mermaid|xyflow",
    "uri": "optional workspace-relative source path",
    "source": "optional inline Mermaid text or XYFlow JSON string",
    "data": {
      "nodes": [],
      "edges": [],
      "viewport": {}
    }
  },
  "render": {
    "theme": "default|dark|neutral|custom",
    "layout": "auto|elk|dagre|manual",
    "viewport": { "width": 1280, "height": 720, "deviceScaleFactor": 1 }
  },
  "outputs": { "directory": "workspace-relative path", "formats": ["svg", "png", "html", "json"] },
  "metadata": { "requester": "string", "traceId": "string" }
}
```

At least one of `diagram.uri`, `diagram.source`, or `diagram.data` MUST be present. Mermaid jobs SHOULD use `diagram.source`; XYFlow jobs SHOULD use `diagram.data.nodes` and `diagram.data.edges`.

## Output Artifacts

The adapter MUST produce:

- Requested SVG, PNG, HTML preview, or graph JSON artifact.
- `render-manifest.json` with job ID, backend ID, diagram type, layout engine, theme, viewport, source hash, output file list, and package versions.
- `diagnostics.json` with parser warnings, layout warnings, browser console messages, and unsupported feature notices.

Optional artifacts include layout coordinates, accessibility text, and extracted graph metrics.

## Runtime Dependencies

- Mermaid parser/renderer and optional Mermaid CLI-compatible runtime for Mermaid jobs.
- React, React DOM, and XYFlow packages for XYFlow jobs.
- Browser automation runtime for DOM-based capture and PNG export.
- Optional graph layout engines such as ELK or Dagre when requested.
- Optional SVG optimizer for stable artifact output.

The adapter MUST publish capability data for supported diagram types, layout engines, themes, and export formats.

## Error Model

Errors MUST use the shared JSON shape:

```json
{
  "ok": false,
  "code": "DIAGRAM_BACKEND_ERROR_CODE",
  "message": "human-readable summary",
  "severity": "fatal|retryable|warning",
  "stage": "validate|parse|layout|render|capture|export|write-artifacts",
  "details": {},
  "artifacts": ["diagnostics.json"]
}
```

Standard error codes:

- `DIAGRAM_INPUT_INVALID`
- `DIAGRAM_SOURCE_UNRESOLVED`
- `DIAGRAM_DEPENDENCY_UNAVAILABLE`
- `DIAGRAM_PARSE_FAILED`
- `DIAGRAM_LAYOUT_FAILED`
- `DIAGRAM_RENDER_FAILED`
- `DIAGRAM_EXPORT_FAILED`
- `DIAGRAM_OUTPUT_WRITE_FAILED`

Unsupported diagram syntax MUST be reported during parse or validation, not silently dropped.

## Cross-Backend Compatibility Contract

The backend MUST:

- Preserve the shared `RenderJob` envelope and common artifact names.
- Normalize Mermaid text and XYFlow node-edge graphs into manifest-addressable artifacts.
- Emit deterministic filenames: `{jobId}.{extension}` and optional `{jobId}-graph.json`.
- Include graph source hashes, layout selection, and package/runtime versions in `render-manifest.json`.
- Map parser, layout, render, capture, and export failures into the shared error object.

## Candidate Source Directories and Key Package Manifests

- `mermaid-develop/mermaid-develop` — Mermaid parser and rendering candidate.
  - `mermaid-develop/mermaid-develop/package.json`
  - `mermaid-develop/mermaid-develop/packages/mermaid/src/docs/package.json`
  - `mermaid-develop/mermaid-develop/tests/webpack/package.json`
- `xyflow-main/xyflow-main` — XYFlow graph rendering candidate.
  - `xyflow-main/xyflow-main/package.json`
