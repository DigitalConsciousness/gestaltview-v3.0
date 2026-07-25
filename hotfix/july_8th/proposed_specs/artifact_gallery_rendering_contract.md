# Artifact Gallery / Inner World Rendering Contract

## Problem

Rows and HTML exist, but artifacts are not consistently visible/meaningful in the gallery. Some remain drafts; some render as raw strings; the Inner World API 500s.

## Required viewer behavior

Create a single artifact viewer contract:

```ts
type ArtifactViewModel = {
  id: string;
  title: string;
  kind: "html" | "markdown" | "json_scene_graph" | "audio" | "image" | "pdf_ready_html" | "raw";
  status: "draft" | "queued" | "rendering" | "ready" | "failed";
  html?: string;
  markdown?: string;
  sceneGraph?: unknown;
  raw?: unknown;
  sourceIds: string[];
  provenance?: unknown;
};
```

Viewer routing:

- `html` → sandboxed iframe or sanitized HTML container
- `markdown` → markdown renderer
- `json_scene_graph` → scene graph renderer / fallback node cards
- `audio` → audio card + transcript/script preview
- `failed` → visible error card with retry
- `raw` → collapsed source inspector, not full-page blob

## Gallery ingestion

Artifact Gallery should read:

1. `inner_world_artifacts` ready/active rows.
2. `codex_artifacts` that have at least one ready `html` or `json` job.
3. LocalStorage artifacts while server sync is unhealthy.

## Never

Do not show full JSON or Markdown as the primary visual artifact unless the user explicitly opens raw source.
