# Setup Guide

## Goal

Bring up a first working GestaltView Agent Trainer instance without relying on the parent GestaltView repository.

## Prerequisites

- Node.js 20+
- npm
- a Supabase project
- at least one LLM provider key
- one embedding provider key

## Platform Entry Paths

- Linux or macOS: `npm run bootstrap:sh`
- Windows: `npm run bootstrap:windows`
- Browser-first planning: `npm run wizard`
- Docker: `docker compose run --rm trainer npm run cli -- status`

## Steps

1. Copy `setup/env.example` to `.env.local`.
2. Fill in the Supabase and provider variables.
3. Run `npm install`.
4. Run `npm run verify-setup`.
5. Apply `supabase/seed.sql` in Supabase SQL Editor.
6. Review `setup/setup-wizard.html`.
7. Load initial corpus fragments into `knowledge_fragments`.
8. Review `docs/VOICE_INTEGRATION.md` before enabling live microphone capture.

## iOS and iPadOS

iOS support should be treated as browser-first and remote-first:

- use the setup wizard in Safari
- use a remote desktop, cloud workspace, or hosted deployment for CLI and packaging tasks
- do not promise local iOS Docker or terminal execution

## First Corpus Recommendations

Start small:

- 10 to 25 fragments
- one corpus target
- clear titles
- simple metadata
- a buyer-owned import manifest when possible

Do not start with a full dump of every internal file.

## Environment Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` only in browser code.
- Set `EMBEDDING_DIMENSION=768` when using Gemini `text-embedding-004`.
- Keep voice or telephony secrets in buyer-owned runtime configuration rather than the client bundle.

## Packaging

When the scaffold is ready to distribute:

```bash
npm run package
```
