# Corpus Ingest Automation (Generic / BYOK)

This package now includes a generic ingest scaffold so buyers can load their own corpus without inheriting GestaltView-internal content.

## Included Artifacts

- `scripts/corpus_ingest.py`: manifest-driven ingestion into `knowledge_fragments`
- `.github/workflows/corpus-ingest.yml`: manual GitHub Actions workflow for repeatable ingest runs
- `templates/agents/*.template.json`: starter sub-agent and multi-agent topology templates

## 1) Prepare environment

Set these variables in your runtime or GitHub Secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (used by the non-embedding workflow scaffolds)
- `OPENAI_API_KEY` (only required if using `--embedding-provider openai`)

## 2) Create the repo corpus container

Before editing a manifest, stage the GitHub repo and buyer files inside the generated container:

```bash
./gv.sh repo stage owner/repo
```

This creates a scaffold like:

```text
.gsvw/repo-corpus/owner-repo/
  incoming/github/
  incoming/files/
  staged/knowledge/
  staged/code/
  staged/product/
  staged/context/
  review/seed-plan.md
  manifests/import-manifest.template.json
```

Use `incoming/` for raw material and only move reviewed, high-signal files into `staged/` for the first batch.

## 3) Generate/fill a manifest

Use the existing manifest generator:

```bash
npm run import-template ./buyer-import.template.json
```

Or edit the scaffolded manifest created in `manifests/import-manifest.template.json`.

Then edit each entry and point `sourceUri` to your own files/URLs/text.

## 4) Review the first batch

Turn the manifest into a reviewed first-batch plan before live ingest:

```bash
./gv.sh import review ./.gsvw/repo-corpus/owner-repo/manifests/import-manifest.template.json
```

This keeps the operator focused on a small, legible first pass instead of dumping the whole corpus in one run.

## 5) Run local ingest

```bash
python scripts/corpus_ingest.py ./buyer-import.template.json \
  --user-id <KIT_USER_ID_UUID> \
  --embedding-provider none \
  --dry-run
```

Remove `--dry-run` to write rows into Supabase.

### Notes

- `sourceType=file` reads from local paths relative to the manifest.
- `sourceType=url` fetches page text and strips HTML tags.
- `sourceType=text` uses the string directly as source content.
- Valid lanes are `knowledge`, `code`, `product`, and `context`.

## 6) Run GitHub Actions ingest

Use **Actions → Corpus Ingest → Run workflow** and fill:

- `manifest_path`
- `user_id`
- `embedding_provider` (`none` or `openai`)
- `dry_run` (`true` or `false`)

This keeps BYOK ingest repeatable and avoids hardcoding secrets.

## Redis Scaffold (Optional)

`compose.yaml` now includes a Redis service for teams that want a shared cache/session layer.

```bash
docker compose up redis -d
```

Set `REDIS_URL=redis://localhost:6379/0` in `.env.local` if your runtime uses Redis.
