# Codex SPEC — GestaltView Supabase + Repository Alignment Pass

## Goal

Install the alignment kit into `DigitalConsciousness/gestaltview-v2.0` so the runtime, Supabase database, and corpus repository can stay in sync without replacing the existing localStorage/custom-event prototype seam prematurely.

## Repos

- Runtime: `DigitalConsciousness/gestaltview-v2.0`
- Corpus: `DigitalConsciousness/GestaltView_Corpus_-_Knowledge_Repository`

## Runtime origin

```text
https://gestaltview-di-gsvw.vercel.app
```

Set `CORS_ORIGINS` without a trailing slash:

```bash
CORS_ORIGINS="https://gestaltview-di-gsvw.vercel.app,http://localhost:5173,http://localhost:3000"
```

## Existing repo facts to preserve

The runtime already has ingestion scripts in `package.json`:

- `ingest`
- `ingest:agent-trainer`
- `manifest`
- `health`
- `migrate`

Do not remove or replace them. Add the alignment scripts alongside them.

The existing `scripts/ingest_corpus.py` expects a package list shape, while the current `config/corpus-map.json` may use an object-of-packages shape. The new `gsvw_align_ingest.py` accepts both forms.

## Install steps

1. Copy kit files into repo root.
2. Run:

```bash
node scripts/gsvw_patch_package_json.mjs
```

3. Append function config if needed:

```bash
cat supabase/config.functions.fragment.toml >> supabase/config.toml
```

4. Apply migration:

```bash
npx supabase db push
```

5. Set secrets:

```bash
npx supabase secrets set \
  CORS_ORIGINS="https://gestaltview-di-gsvw.vercel.app,http://localhost:5173,http://localhost:3000" \
  GESTALTVIEW_INGEST_SECRET="replace-with-long-random-secret"
```

6. Deploy functions:

```bash
npm run supabase:functions:deploy:alignment
```

7. Validate env:

```bash
npm run gsvw:env
```

8. Dry run ingestion:

```bash
npm run ingest:align:dry-run
```

9. Apply ingestion:

```bash
npm run ingest:align
```

## Required validation

```bash
git diff --check
npm exec -- tsc --noEmit
npm run health || true
```

If `npm run build` exits 143 in a constrained Codespace, do not treat that alone as a code regression. Confirm with `tsc`, focused tests, and CI/Vercel.

## Non-negotiables

- Do not delete existing corpus rows.
- Do not rewrite the app into backend persistence in one pass.
- Do not store service role keys in client code.
- Do not send `GESTALTVIEW_INGEST_SECRET` to the browser.
- Do not auto-dormant or auto-delete user/corpus material.
- Preserve original text, source path, hash, and timestamp.
- Dormancy review is proposal-only.

## Edge Functions installed

### `gsvw-ingest-batch`

Operator/script-only ingestion endpoint. Uses `x-gsvw-ingest-secret`. Writes:

- `gsvw_ingestion_runs`
- `gsvw_ingestion_documents`
- `gsvw_ingestion_chunks`

### `gsvw-runtime-health`

Health endpoint for runtime/DB alignment counts.

### `gsvw-capture-event`

Authenticated runtime capture bridge. Use for dual-write from Blackboard, Sanctuary, Dynamic Inner World, External Scaffold, and Creation Corner.

### `gsvw-dormancy-review`

Operator-only proposal endpoint for fall-away-but-not-lost review. Uses `x-gsvw-operator-secret`; same value can be `GESTALTVIEW_INGEST_SECRET` unless you choose to split secrets.

## Suggested first wiring slice

Add a quiet dual-write to the existing capture routing seam:

1. Keep current localStorage/custom-event behavior.
2. After local save succeeds, call `postGsvwCaptureEvent()`.
3. If Edge write fails, log non-blocking warning and keep local behavior intact.
4. Once dual-write is stable, add a read path behind a feature flag.

## Feature flag suggestion

```bash
VITE_GSVW_EDGE_CAPTURE_ENABLED=true
```

Browser code should only call `gsvw-capture-event`, never `gsvw-ingest-batch`.
