# Import Guide

The GestaltView Agent Trainer should make it easy for buyers to load their own material without ever bundling founder-specific data into the package.

## Rule One

Only import buyer-owned or buyer-authorized material.

Do not ship:

- founder archives
- internal GestaltView corpus
- private prompt collections
- hidden reference libraries that belong only to the core product

## Import Flow

1. Generate an empty manifest:

```bash
npm run import-template ./buyer-import.template.json
```

2. Fill in the manifest using buyer-owned sources only.
3. Assign each source to one lane:

- `knowledge`
- `code`
- `product`
- `context`

4. Start small and curated.
5. Review weak answers and improve the manifest over time.

You can also generate a pack-shaped starter manifest:

```bash
npm run cli -- manifest general-operator-foundation buyer-project buyer-owner
```

Or apply the pack and write the manifest in one execution path:

```bash
npm run apply-pack -- buyer-user-id general-operator-foundation buyer-project buyer-owner knowledge-core-bundle,context-alignment-bundle ./buyer-import.json
```

## Why Use a Manifest

A manifest keeps the training boundary explicit:

- what was imported
- why it matters
- which lane it belongs to
- how the operator wants it treated

## Shared Memory vs Imported Corpus

Do not confuse these:

- imported corpus is source material the assistant studies
- memory is continuity the assistant preserves over time

Both should be buyer-owned.

## Generic Ingestion Script

This package ships `scripts/ingest_generic_corpus.py` as an agnostic ingest scaffold. It classifies files into the four corpus lanes and writes either:

- Supabase-ready JSONL payloads (`--backend supabase`)
- Redis-ready JSON payloads (`--backend redis`)

Example:

```bash
python scripts/ingest_generic_corpus.py --repo-root . --backend supabase --output artifacts/ingestion/supabase.jsonl
python scripts/ingest_generic_corpus.py --repo-root . --backend redis --output artifacts/ingestion/redis.json
```

The script intentionally does not auto-upsert into hosted services. Buyers can connect the generated payload to their own secure ingestion jobs.

## Sub-Agent + Multi-Agent Starter Templates

`templates/subagent-templates.json` includes a ready-to-edit orchestration baseline:

- `research-scout`
- `implementation-pilot`
- `qa-guardian`

Use it as a safe, generic starting point for multi-agent handoff design.
