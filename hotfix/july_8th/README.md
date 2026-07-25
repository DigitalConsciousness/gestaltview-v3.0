# Not Good July 8 Runtime Hotfix Package

This package turns the July 8 failure report into an implementation-ready hotfix sweep.

## Files

- `CODEX_HOTFIX_HANDOFF.md` — main handoff prompt
- `FAILURE_EVIDENCE_DIGEST.md` — extracted evidence from the uploaded zip
- `proposed_full_file_swaps/api/render/decide.ts` — full file replacement
- `proposed_full_file_swaps/api/render/engine.ts` — full file replacement / safe fallback
- `proposed_sql/20260708_not_good_runtime_hotfix.sql` — Supabase repair migration
- `proposed_specs/*.md` — targeted fix specs for Transcriptory, profile ingestion, Billy tone, cultural recognition, Musical DNA, pending animation, and gallery rendering
- `checks/REGRESSION_CHECKLIST.md` — manual QA gates

## Intended use

Hand this to Codex and tell it:

1. Apply the bounded full-file swaps first.
2. Apply the SQL migration in Supabase.
3. Then work through the targeted specs in priority order.
4. Do not broaden into a redesign until these failures are closed.
