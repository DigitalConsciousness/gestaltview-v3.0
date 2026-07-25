# Ingestion map

## Primary files

- `scripts/ingest_corpus.py`
- `config/corpus-map.json`
- `CurrentState.md`
- `Workflows.md`
- `ArchitecturalStructure.md`
- `test/api/schema-contract.test.ts`

## Core responsibilities

- Discover files by package from the repository root.
- Read `.md`, `.mdx`, `.txt`, `.json`, and `.pdf` inputs.
- Chunk extracted text into fragment-sized blocks.
- Insert `documents`, `knowledge_fragments`, `embeddings`, and `processing_runs` payloads.
- Preserve auditability through skipped paths and error lists.

## Known sensitivities

- PDF extraction falls back across multiple libraries.
- Schema drift breaks runtime retrieval and tests quickly.
- Dry-run is the safest first validation path.
- Some large archive directories contain export noise; corpus-map curation matters.
