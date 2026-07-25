# Build and Validation

## Prefer these checks

```bash
npm run build
npx tsc --noEmit
bash scripts/gv-health-check.sh
bash scripts/run-comprehensive-tests.sh --no-log
```

Use smaller targeted checks when the task is narrow, but always leave the repo with at least one meaningful validation pass.

## Runtime-specific reminders

- The root `package.json` is the active package manifest.
- Some older docs still mention `client/package.json`; treat that as historical.
- If a task changes Billy, also inspect `api/_lib/llmRouter.ts` and `.env.example`.
- If a task changes pricing or paid flows, inspect both frontend and `api/stripe/` handlers.
- If a task changes evidence or compendium sync, inspect `scripts/generate_repo_manifest.py`, `scripts/ingest_corpus.py`, and `scripts/test-manifest-sync.sh`.
