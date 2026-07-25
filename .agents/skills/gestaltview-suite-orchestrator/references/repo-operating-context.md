# Repo Operating Context

## Core files to trust first

- `AGENTS.md`
- `CodexAgent.md`
- `CurrentState.md`
- `Workflows.md`
- `SymbioticWorkflow.md`
- `OriginStory.md`
- `GestaltView_Communication_&_Language_Guide_v2.md`
- `BILLY_INTEGRATION_DESIGN.md`
- `.env.example`

## Runtime anchors

- Frontend/pages/components: `client/src/`
- Serverless/API: `api/`
- Shared logic: `shared/`
- Supabase: `supabase/`
- Operational scripts: `scripts/`
- Pricing surfaces: `client/src/pages/Pricing.tsx`, `api/pricing.ts`, `api/stripe/checkout.ts`
- Billy runtime: `client/src/components/Billy.tsx`, `client/src/components/BillyLive.tsx`, `api/billy.ts`, `api/_lib/llmRouter.ts`

## Non-negotiables

- Billy standard runtime stays Gemini-first.
- Preserve the founder’s exact language when PLK or Bucket Drop content is involved.
- Update `CurrentState.md` after meaningful repo changes.
- Prefer actual repository structure over older assumptions in docs if they diverge.
