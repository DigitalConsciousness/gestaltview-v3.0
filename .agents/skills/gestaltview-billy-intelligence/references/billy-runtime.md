# Billy Runtime Map

## Functional layers

1. **Surface/UI** — widget, full-page Billy, chips, voice controls.
2. **Prompting/identity** — Billy system prompt, section context, PLK context.
3. **Provider cascade** — Groq/Gemini first, then paid fallbacks where allowed.
4. **Retrieval grounding** — Manifest Index / knowledge fragments / package inference.
5. **Graceful degradation** — offline fallback that still sounds like Billy.

## Key source anchors

- `BILLY_INTEGRATION_DESIGN.md` for the conceptual model
- `api/_lib/llmRouter.ts` for actual server routing
- `api/__tests__/billy*.test.ts` for expected contracts
- `scripts/test-billy-routing.sh` for route policy verification
- `scripts/test-never-look-away.sh` and `scripts/test-invariants.sh` for safety and constitutional checks
