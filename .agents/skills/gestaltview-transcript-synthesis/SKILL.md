---
name: gestaltview-transcript-synthesis
description: Synthesize founder voice and recurring themes from the material that remains locally accessible in `gestaltview-v2`. Use this skill for voice distillation, phrase extraction, and aligning narrative docs with Billy or brand behavior.
---

# GestaltView Transcript Synthesis

Last reviewed: 2026-03-29

The raw long-form transcript corpus may live elsewhere, so keep that boundary explicit. In this repo, the job is to synthesize from local canonical docs, wikis, and personality specs without pretending the full transcript archive is mounted.

## Inspect first
- `client/src/canonical`
- `docs/OriginStory.md`
- `docs/BrandVoice.md`
- `docs/billy-personality-spec.md`
- `docs/wikis`

## Current integrations
- Local canonical docs and brand or personality specs are the current distilled voice surfaces.
- Billy runtime and marketing copy both consume this voice layer and should stay aligned with it.
- Supabase only enters when synthesis changes what should be stored or retrieved as fragments.

## Workflow
1. Confirm whether the task is repo-local or needs a sibling-repo handoff before editing.
2. Read the anchor files first and verify live behavior instead of relying on older docs.
3. Update runtime, schema, copy, and skill/docs surfaces together when the change crosses boundaries.
4. Run the lightest meaningful validation for the touched surface and update `docs/CurrentState.md` when repo reality changed.

## Compose with
- `gestaltview-knowledge-curation`
- `gestaltview-billy-intelligence`
- `gestaltview-marketing-social`

## Done when
- Synthesized voice work cites available local sources.
- Missing corpus access is acknowledged rather than guessed.
