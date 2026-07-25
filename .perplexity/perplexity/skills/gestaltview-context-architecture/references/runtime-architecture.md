# Runtime Architecture

## Runtime layers
- **Client**: React + Vite + TypeScript SPA with route-level exhibits, Billy interfaces, portfolio surfaces, and Diligence Explorer.
- **API**: Vercel serverless endpoints for Billy, actions, diligence, and evidence flows.
- **Shared**: TypeScript contracts shared across runtime boundaries.
- **Data**: Supabase Postgres + pgvector knowledge fragments and retrieval RPCs.

## Billy architecture
- **ManifestIndex**: static truth / evidence graph.
- **ContextWeaver**: intent classification + 5W1H extraction + layered expansions.
- **KnowledgeLoom**: retrieval layer using ranked corpus access and gap awareness.

## Provider posture
- Primary Billy path: Gemini Flash 2.0.
- Fallbacks may exist elsewhere in the stack, but Billy should not silently drift to Anthropic for normal operation.

## Canonical orientation set
Before high-stakes GestaltView reasoning, prioritize the repo’s orientation materials:
- `AGENTS.md`
- `README.md`
- `CLAUDE.md`
- canonical docs under `client/src/canonical/` when the task touches deep identity logic
- flow docs (`AIFlow.md`, `APIFlow.md`, `ArchitecturalStructure.md`)

## Repository boundary
- `gestaltview-v2` is the execution surface.
- The Compendium is the long-memory and evidence archive.
- Reference the Compendium instead of duplicating its logic into v2.
