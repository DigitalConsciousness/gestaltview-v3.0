# Regression Checklist

## Render

- [ ] `/api/render/decide` returns 200/422/400, never module-resolution 500.
- [ ] `/api/render/engine` returns rendered HTML or structured fallback, never module-resolution 500.
- [ ] Scene graph JSON renders as a visible report/graph fallback, not raw blob.

## Inner World / Gallery

- [ ] `/api/inner-world/artifacts` returns artifact rows.
- [ ] Artifact Gallery shows server artifacts from `inner_world_artifacts`.
- [ ] Codex artifacts with ready HTML/JSON jobs are visible or marked ready.
- [ ] Raw JSON source is collapsed behind “Open raw.”

## Transcriptory

- [ ] New audio captures start as `pending`.
- [ ] Transcribe claims pending captures.
- [ ] Stale `processing` rows can be retried or reset.
- [ ] Failure state is visible and retryable.

## Profile ingestion

- [ ] `profile_upload` persists to `profile_ingestion_sources`.
- [ ] Long profile uploads create chunks/evidence fragments.
- [ ] No high-salience dimension is accepted with empty evidence.
- [ ] Response does not pretend generic profile traits are meaningful ingestion.

## Cultural recognition / Tribunal

- [ ] Alice in Chains “Would?” signal is recognized before Tribunal interpretation.
- [ ] Tribunal asks route choice: Musical DNA / lyric memory / discussion.
- [ ] No generic self-growth panel appears for known lyric fragments.

## Billy

- [ ] Billy does not say “I know this is hard” in ordinary product failure contexts.
- [ ] Billy names the actual bug/state.
- [ ] Billy preserves exact user words when quoting.

## Musical DNA

- [ ] Manual track upload appears locally immediately after validation.
- [ ] Remote sync failure is visible.
- [ ] User can retry sync or export local track reference.
