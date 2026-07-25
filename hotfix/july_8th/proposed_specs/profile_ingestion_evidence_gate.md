# Profile ingestion patch directive

## Problem

The ingestion run says `complete`, but it has no chunks, no embeddings, and no evidence fragments. The source insert also failed because `profile_upload` violated the live DB check constraint.

## Required changes

### DB

Apply `proposed_sql/20260708_not_good_runtime_hotfix.sql`.

### API

In `api/_lib/profileIngestion.ts`:

1. Normalize all source types through a shared allowlist.
2. If source persistence fails, set response metadata `persistence = "partial"` and include a warning.
3. Do not report `status: complete` as meaningful unless:
   - sources processed > 0,
   - at least one source row stored or persistence is explicitly skipped,
   - evidence fragments exist for dimensions above salience 0.75.
4. Extract evidence fragments from raw profile text using literal quotes, not generic trait templates.
5. For long JSON/profile uploads, chunk sections before dimension synthesis.

## Guardrail

A dimension like this must fail validation:

```json
{
  "dimensionKey": "music_dna_resonance",
  "evidenceFragments": [],
  "summary": "present, but needs more directly quoted source material"
}
```

If it needs evidence, it is not ready to steer runtime behavior.
