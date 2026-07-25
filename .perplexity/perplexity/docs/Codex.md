# Codex Artifact Boundary

Codex is the deterministic boundary between generated structure and user-facing artifacts.

The canonical contract lives in `shared/codex/contracts.ts`. It is a strict Zod discriminated union over `kind`, with `contractVersion: "codex.v1"`, private-by-default security class, required provenance, bounded arrays/strings, and explicit export manifests.

The first API lane is additive:

- `POST /api/codex/forge` validates a supplied artifact draft or uses OpenAI Structured Outputs when `OPENAI_API_KEY` is configured.
- `GET /api/codex/artifacts/:artifactId` returns the artifact envelope and export manifest.
- `POST /api/codex/artifacts/:artifactId/exports` queues an additional allowed export.
- `GET /api/codex/jobs/:jobId` returns export job state.
- `POST /api/codex/hooks/export-complete` records worker completion.
- `POST /api/codex/legacy/creation-corner-synthesize` preserves the existing Creation Corner compatibility route.

Creation Corner now builds a deterministic gen-engine draft in the browser and submits the resulting Codex artifact contract to `/api/codex/forge`. The legacy synthesize route remains as an adapter for older callers.

HTML and JSON jobs can be rendered through `POST /api/codex/jobs/:jobId/run`. The lightweight runner uses deterministic templates, records ready manifest metadata, and falls back to `memory://` storage paths when Supabase Storage is not configured.

Artifact-scoped export draining is available through `POST /api/codex/artifacts/:artifactId/drain-exports`. It runs retryable HTML/JSON jobs, preserves partial completion, and returns refreshed artifact, manifest, job, and result state.

Generation is probabilistic; rendering is deterministic. User-facing renderers should consume only `CodexArtifact` contracts and registry-approved templates/export formats.
