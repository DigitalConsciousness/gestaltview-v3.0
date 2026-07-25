# GestaltView Compendium — Ingest Manifest

## Embedding Model
- **Model**: `gemini-embedding-001`
- **Dimensions**: 3072
- **Provider**: Google Gemini free tier
- **Standardized**: 2026-03-21
- Both `ingest_corpus.py` and `aiorchestrator.py` use this model.
  Do not change without running `fix_embedding_dims_3072.sql` first.

## Chunk Configuration
- **Chunk size**: 4 500 chars
- **Overlap**: 600 chars
- Boundaries respected: paragraph → sentence → hard cut

## Script Preflight
- Install shared Python script dependencies first:
  `python3 -m pip install -r requirements.txt`
- Then run the ingestion pass with:
  `python3 scripts/ingest_corpus.py`

## In-Scope Packages (see corpus-map.json)
| Package | What it covers |
|---|---|
| `core-docs` | README, SKILL.md, architecture docs, workflow docs |
| `billy-intelligence` | Billy, PLK, Context Weaver, prompt templates |
| `philosophy-narrative` | Origin story, synthesis reports, stewardship briefs |
| `technical-architecture` | Orchestrator, LLM router, genesis protocol, schemas |
| `exhibits-products` | ADHD, SymbioCoder, VibeCoder, Resume Rockstar, Museum |
| `diligence-evidence` | Presentation decks, comparative literature, timeline PDFs |
| `skills-framework` | SKILL.md files, skill suite map, references |

## Intentionally Excluded
- `client/public/audio/` — binary MP3s, not text
- `client/public/art/` — SVG assets
- Raw screenshot PDFs (image-only, no extractable text) — they will be
  caught by pdfplumber's "no extractable text" warning and skipped cleanly
- `.env`, `.gitignore`, lockfiles — no signal value

## Extending the Map
1. Add the new directory or file path under the appropriate package key in
   `config/corpus-map.json`.
2. Re-run `python3 scripts/ingest_corpus.py` — dedup hash comparison means
   only new/changed files are processed.
3. Update this file with what was added and why.

## Deprecation Note
`scripts/seed_billy_knowledge.py` is superseded by this pipeline.
It targets `~/gvcorpus` (non-standard path), uses 600-char chunks
(too granular), and has no provenance tracking. Do not run it going forward.
