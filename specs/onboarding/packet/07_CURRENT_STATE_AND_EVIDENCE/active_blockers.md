# Active Blockers

- **LAUNCH-2026-06-10-BASELINE** — Baseline full-suite and continuity/orientation blockers remain open: `npm test` has 3 pre-existing failures; `.orientation/` packet files are missing; `artifacts/latest.zip` is missing; `README.md` lacks the expected handoff-bundle pattern.
- **LAUNCH-2026-06-11-RPC-MIGRATION** — Apply `supabase/migrations/20260611000100_codex_job_claim_rpc.sql` before production Codex drain relies on `claim_codex_jobs`.
- **LAUNCH-2026-06-11-MANUAL-QA** — Manual browser QA remains open for final launch flow: Home -> Welcome, Masterclass selected-DI session behavior, Tribunal select-all, Analytics gating, Dynamic Inner World, External Scaffold, and Creation Corner export/send/archive paths.
- **BW-2026-04-13** — Agent Trainer Page API Errors (critical) — Trainer study-source recommendations path is failing before a normal response returns.
