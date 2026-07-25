# GestaltView Agent Trainer Current State

## Purpose

This file tracks the current package state for `agent_trainer/gv_operator_kit` only. It should not be treated as the source of truth for the parent repository.

## Status

- package name standardized to `GestaltView Agent Trainer`
- package scaffold is self-contained and zip-ready
- package includes shell, Windows, Docker, and browser-first setup paths
- package includes starter-pack previews, source bundles, import-manifest generation, and a CLI layer
- package home page is centered on the Agent Trainer rather than a generic dashboard
- package now includes a generic, buyer-owned corpus ingest automation path (local Python scaffold + GitHub Actions)
- package now includes optional Redis scaffolding and starter sub-agent/multi-agent templates
- package now includes explicit corpus import/export operator surfaces and a voice integration checklist
- packaging now excludes internal build notes from the distributable zip

## Implemented This Round

- added generic ingest script at `scripts/corpus_ingest.py` to parse a manifest, chunk sources, optionally embed, and write to Supabase `knowledge_fragments`
- added GitHub Actions workflow at `.github/workflows/corpus-ingest.yml` for manual ingest runs using repository secrets
- added optional Redis scaffold in `compose.yaml` plus environment variables in `setup/env.example`
- added reusable sub-agent and multi-agent topology templates under `templates/agents/`
- added `docs/CORPUS_INGEST_AUTOMATION.md` and updated README links to make BYOK ingestion setup operational
- added UI-level corpus operations surfaces and a dedicated `docs/VOICE_INTEGRATION.md` rollout checklist
- updated package scripts to exclude internal build artifacts and stale root zip files from shipped archives

## Why These Changes

- Wednesday priorities requested a generic/agnostic corpus ingest file that customers can drop into their own repo
- Wednesday priorities requested automation via GitHub Actions with environment-secret usage (BYOK model)
- Wednesday priorities requested broader multi-agent/sub-agent support and optional Redis organization scaffold
- these changes keep the package buyer-safe while moving from planning artifacts into runnable onboarding assets
- Wednesday priorities requested explicit upload/download/import/export affordances plus a voice path without leaking buyer secrets

## Verification

- `python3 agent_trainer/gv_operator_kit/scripts/corpus_ingest.py --help`
- `python3 agent_trainer/gv_operator_kit/scripts/corpus_ingest.py /tmp/gv_manifest.json --user-id 00000000-0000-0000-0000-000000000000 --supabase-url https://example.supabase.co --service-role-key demo --dry-run`
- `cd agent_trainer/gv_operator_kit && npm run typecheck`
- `cd agent_trainer/gv_operator_kit && npx vitest run --config vitest.config.ts`

## Known Boundaries

- the React package shell is still not wired into a live runtime framework
- real pack application requires buyer-owned Supabase credentials and a real `userId`
- no founder-specific corpus or protected internal runtime logic is included
- the `/api/packs` flow exists as a framework-neutral adapter and execution contract, not yet as a deployed HTTP endpoint
- the ingest scaffold is intentionally generic; production teams may want provider-specific chunkers/parsers for PDFs and docs
- live TTS/STT transport still requires buyer-selected providers and deployment-specific runtime wiring

## Overall Repo State & Recommendations

1. Add a runtime endpoint that wraps `scripts/corpus_ingest.py` behavior (or equivalent TS service) with auth and audit logs.
2. Add provider adapters for document parsing (PDF/Docx/Notion/Confluence) and lane-aware chunk strategies.
3. Wire Redis into the API layer for assistant response caching and short-lived orchestration state.
4. Consider shipping the agent templates through the UI as selectable presets during onboarding.
5. Add provider adapters for concrete speech runtimes once a buyer deployment target is chosen.
