# GestaltView Agent Trainer

> A standalone, white-label AI assistant scaffold that buyers can aim at their own code, product context, documents, and vocabulary.

## What This Package Is

The GestaltView Agent Trainer packages the client-safe layer of GestaltView into a self-contained folder that can be inspected, zipped, and handed off for deeper implementation without exposing protected internal runtime logic.

This scaffold includes:

- a setup flow and environment templates
- a Supabase schema with migrations, RLS, and retrieval RPCs
- a configurable tier system and domain presets
- preloadable agnostic starter packs for skills, tools, agent sources, and memory posture
- placeholder API modules for assistant, knowledge, skills, memory, analytics, and vocabulary profiles
- a CLI layer for technical operators
- cross-platform entrypoints for shell, Windows, Docker, and browser-first setup
- client-facing React component and page scaffolds
- packaging scripts and smoke tests
- generic Python corpus ingestion scaffold with Supabase/Redis payload targets
- a GitHub Actions workflow template for lane-aware ingestion runs
- sub-agent and multi-agent orchestration templates for buyer customization
- explicit corpus import/export controls and a buyer-owned voice integration checklist

This package intentionally does not include:

- internal GestaltView constitutional/runtime code
- internal knowledge fragments or skill corpus content
- founder-specific prompts, policies, or governance logic
- the full multi-provider routing and RRF retrieval stack used in the core product

## Current State

This is a commercially usable package scaffold, not a finished hosted product. It is structured so a buyer or engineer can:

1. review the deliverable
2. configure environment variables
3. bootstrap a Supabase project
4. package the folder into a distributable zip
5. continue implementation without depending on the parent repo

## Quick Start

```bash
cd agent_trainer/gv_operator_kit
cp setup/env.example .env.local
npm install
npm run verify-setup
npm run cli -- status
npm run wizard
npm run typecheck
npm run package
```

The generated archive lands in `dist/`.

## Package Layout

```text
gv_operator_kit/
├── api/                 Framework-agnostic endpoint scaffold
├── components/          Client-facing UI components
├── config/              Tiers, features, prompts, domain presets
├── docs/                Setup and operator documentation
├── pages/               Route-level React page scaffolds
├── scripts/             Validation, demo seeding, packaging helpers
├── templates/           Sub-agent and multi-agent starter templates
├── setup/               Setup wizard and environment templates
├── supabase/            Seed SQL, migrations, RLS, retrieval RPCs
└── tests/               Smoke tests for setup and API contracts
```

## Commands

```bash
npm run validate-env
npm run verify-setup
npm run cli -- status
npm run wizard
npm run typecheck
npm run package
```

## Platform Paths

- Shell: `npm run bootstrap:sh`
- Windows: `npm run bootstrap:windows`
- Docker: `docker compose run --rm trainer npm run cli -- status`
- Redis scaffold (optional): `docker compose up -d redis`
- Browser/iOS planning flow: `npm run wizard`

## Buyer-Owned Imports

The package should help buyers load their own material without bundling any founder-specific or GestaltView-internal corpus.

- Generate an import manifest: `npm run import-template ./buyer-import.template.json`
- Review platform-specific guidance in [docs/PLATFORM_GUIDE.md](docs/PLATFORM_GUIDE.md)
- Review import boundaries in [docs/IMPORT_GUIDE.md](docs/IMPORT_GUIDE.md)
- Automate generic BYOK ingestion with [docs/CORPUS_INGEST_AUTOMATION.md](docs/CORPUS_INGEST_AUTOMATION.md)
- Review the voice rollout checklist in [docs/VOICE_INTEGRATION.md](docs/VOICE_INTEGRATION.md)


## Generic Corpus Ingestion (BYOK)

Use the agnostic ingestion scaffold to generate lane-tagged payloads from your own repository:

```bash
python scripts/ingest_generic_corpus.py --repo-root . --backend supabase --output artifacts/ingestion/supabase.jsonl
python scripts/ingest_generic_corpus.py --repo-root . --backend redis --output artifacts/ingestion/redis.json
```

For CI automation, copy/adapt `.github/workflows/generic-corpus-ingestion.yml` and wire buyer-owned secrets (`GROQ_API_KEY`, `SUPABASE_*`, `REDIS_*`).

## White-Label Controls

The package is driven by environment variables rather than hardcoded product naming:

- `KIT_NAME`
- `KIT_DOMAIN`
- `KIT_TIER`
- `KIT_PRIMARY_COLOR`

## Packaging Notes

`scripts/package-kit.sh` creates a self-contained zip while excluding `node_modules`, local env files, and build noise.

The packaging scripts now also exclude internal build notes such as `SPEC.md`, `CODEX_PROMPT.md`, `CurrentState.md`, and stray root-level zip artifacts from the distributable archive.

`scripts/bootstrap.sh` is a conservative bootstrap helper. It sets up `.env.local`, installs dependencies, and runs the setup verifier. It does not auto-open browsers or run privileged commands.

## Commercial Positioning

This kit is designed to be the productized floor:

- self-serve buyers can deploy and configure it themselves
- agencies and consultants can adapt it per client
- deeper verticalization naturally opens consulting and custom deployment work

See [PLAYBOOK.md](PLAYBOOK.md), [CONSULTING.md](CONSULTING.md), and [docs/PRICING_TIERS.md](docs/PRICING_TIERS.md) for the operator-facing material.
See [docs/PLATFORM_GUIDE.md](docs/PLATFORM_GUIDE.md) for platform-specific setup paths.
