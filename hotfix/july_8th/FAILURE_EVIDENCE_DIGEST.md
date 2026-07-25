# Not Good July 8 — Failure Evidence Digest

Source inspected: `/mnt/data/not_good_July_8th.zip`

## Production log signals

Hard failures from the Vercel export:

| Surface | Endpoint | Symptom |
|---|---|---|
| Render decision | `/api/render/decide` | 500: `ERR_MODULE_NOT_FOUND`, cannot resolve `@shared/rendering` in deployed function |
| Render engine | `/api/render/engine` | 500: `ERR_MODULE_NOT_FOUND`, cannot resolve `packages/nextgen-rendering-engine/src/index` in deployed function |
| Inner World gallery | `/api/inner-world/artifacts` | repeated 500s |
| Creation Corner blueprints | `/api/creation-corner/blueprints` | 500 |
| Transcriptory | `/api/transcriptory/transcribe` | 409 after capture creation; capture remains stuck in `processing` |
| Profile ingestion | `/api/profile/ingest` | returns 200, but logs skipped source persistence due check constraint on `profile_ingestion_sources.source_type` |
| Profile personality read | `/api/profile/personality` | 401 during verification window |

## Database export signals

### Render/artifact issues

- `codex_jobs_rows.json`: 9 jobs.
- 5 jobs are `ready`.
- 4 jobs are `failed` because `pdf`, `png`, `mp3`, and `wav` exports are routed to a missing dedicated durable worker adapter.
- `codex_artifacts_rows.json`: 4 artifacts, all still `draft`.
- `inner_world_artifacts_rows.json`: 4 artifacts marked `ready`, but gallery API fails.
- HTML exists inside `inner_world_artifacts.html`, which means data exists but the runtime is not reliably rendering/surfacing it.

### Inner World likely schema mismatch

The live API selects `origin_di_id`, but exported `inner_world_artifacts_rows.json` did not include that column. That is a classic Supabase select failure path: table exists, rows exist, selected column does not.

### Profile ingestion issue

The ingestion run says `complete`, but:

- `chunk_count = 0`
- `embed_model = null`
- `embed_backend = null`
- every `evidenceFragments` array is empty
- summaries say the dimension needs more directly quoted source material
- logs show `profile_ingestion_sources` insert skipped because `source_type = profile_upload` violates DB check constraint

That means the profile pipeline is “complete” in status only. It is not complete in meaning.

### Transcriptory issue

`transcriptory_captures_rows.json` shows:

- status: `processing`
- transcript_status: `processing`
- raw_transcript: `null`
- transcript_text: `null`
- processing_started_at: `null`
- error_message: `null`

The transcribe route only claims captures with status `pending` or `failed`, so a capture prematurely created as `processing` cannot be claimed and returns 409 forever.

### Cultural recognition issue

The “Would?” / Alice in Chains failure is not merely a knowledge miss. It is a routing failure:
the Tribunal treated the input as psychological content rather than checking whether it was a cultural/music signal first.

## Severity order

1. Stop render endpoints from 500ing.
2. Fix Inner World artifact API schema mismatch.
3. Reset/repair Transcriptory stuck-processing captures and route claim logic.
4. Make profile ingestion evidence-gated: no `complete` without stored sources/evidence fragments.
5. Make artifact gallery consume rendered HTML + ready jobs.
6. Add cultural recognition preflight before Tribunal interpretation.
7. Add Billy tone guard to block canned therapeutic phrases.
8. Make Musical DNA uploads local-first with explicit remote-sync state.
9. Replace tame pending animation with visible, energetic pending queue.
