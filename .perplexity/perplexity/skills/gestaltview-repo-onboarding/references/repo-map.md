# Repo map

## Read first

- `CurrentState.md` — latest status, risks, and recommended next steps.
- `ArchitecturalStructure.md` — explains the dual-repo topology and subsystem boundaries.
- `AIFlow.md` — explains Billy, retrieval, and provider routing.
- `APIFlow.md` — API surface and request lifecycle reference.
- `Workflows.md` — contributor, ingestion, and graduation workflows.
- `Manifest.md` — top-level capability and artifact index.

## Canonical implementation surfaces

- `scripts/ingest_corpus.py` — ingestion, chunking, and processing-run logging.
- `TS Files/billy-runtime.ts` — GOC Billy runtime sync copy.
- `test/api/` — schema and Billy-focused regression tests.
- `Schema/` and `Prisma/` — schema drafts, exports, and related artifacts.
- `api/` — active TypeScript API-facing code inside this repo.

## High-context archive zones

- `Knowledge Bases/`, `PDF'S/`, `Seed Prompts/`, `Manifestos/`, `Wikis/`, `Transcripts/`.
- `Founder Files/`, `IP Dossier/`, `Funding/`, `Investors/`, `GestaltView Diligence_Reports/`.
- `May - Present/`, `Notebooks (ipynb)/`, and many exported `.txt` mirrors.

## Prototype-heavy product zones

- `GestaltViewЁЯС╛One/`
- `Resume Rockstar/`
- `Insight-Bot/`
- `SymbioCoder/`
- `Museum-Of-Impossible-Things/`
- `ADHD Power Up ЁЯФЛ/`
- `Creation Korner/`
- `Neural Aurora CSS/`
- `UI Components (.tsx)/`

## Heuristics

- If a file is root-level and dated March 2026 documentation, prefer it for orientation.
- If a directory contains many exported `.txt` or duplicate filenames, treat it as archive context until proven canonical.
- If a task touches both docs and code, update the docs in the same change when possible.
