# GestaltView Alignment Operations

## First real grab

Run this first:

```bash
npm run gsvw:env
npm run ingest:align:dry-run
```

The dry run writes a manifest into:

```text
.gsvw-ingestion/run-<uuid>.json
```

Review document and chunk counts before applying.

## CORS notes

Use this value:

```bash
CORS_ORIGINS="https://gestaltview-di-gsvw.vercel.app,http://localhost:5173,http://localhost:3000"
```

The helper accepts the user-provided trailing-slash version too, but storing clean origins prevents future mismatch.

## What to deploy where

### Vercel env

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not put service role keys or ingestion secrets in Vercel client-visible variables.

### Supabase secrets

```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
CORS_ORIGINS
GESTALTVIEW_INGEST_SECRET
```

## Safe run order

```bash
npx supabase db push
npm run supabase:functions:deploy:alignment
npm run gsvw:env
npm run ingest:align:dry-run
npm run ingest:align
```

## Rollback

Because this kit is additive, rollback means:

1. Stop invoking the new functions.
2. Remove package scripts if desired.
3. Leave data tables in place unless a deliberate migration says otherwise.

No migration in this package drops user/corpus data.

## Dormancy review

Dormancy is not deletion. It is a review queue:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/gsvw-dormancy-review" \
  -H "Content-Type: application/json" \
  -H "x-gsvw-operator-secret: $GESTALTVIEW_INGEST_SECRET" \
  -d '{"older_than_days": 120, "max_candidates": 25, "dry_run": true}'
```

Only set `dry_run:false` after reviewing candidate behavior.

## Runtime capture dual-write

The recommended first implementation is non-blocking:

```ts
try {
  await postGsvwCaptureEvent({
    module_key: 'blackboard-room',
    action: 'capture_saved',
    original_text: capture.text,
    metadata: { local_id: capture.id },
  }, { accessToken });
} catch (error) {
  console.warn('Supabase capture dual-write failed; local capture preserved.', error);
}
```

Local save should remain the primary success condition until the Supabase path has real production evidence.
