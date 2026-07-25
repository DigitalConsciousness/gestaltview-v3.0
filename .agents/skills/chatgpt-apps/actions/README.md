# GestaltView GPT Actions Package v2

This package turns the uploaded GestaltView schema, Billy manifest, and Billy engine into import-ready Custom GPT Actions.

## Included files
- `gestaltview_gpt_actions_core.openapi.yaml` — smaller first import for Custom GPTs
- `gestaltview_gpt_actions_comprehensive.openapi.yaml` — fuller schema with Journey recap and draft Tribunal review
- `gestaltview_gpt_instructions.md` — GPT instructions aligned to the actual action names
- `gestaltview_actions_backend_map.md` — route-by-route implementation notes
- `gestaltview_gpt_actions_examples.json` — request examples
- `fastapi_actions_stub.py` — FastAPI starter with matching routes
- `.env.example` — server-side environment template

## Wired middleware in this repository
The Actions middleware is now wired in this repo at:

- `api/actions/[...path].ts`
- Base URL for GPT Actions imports: `https://gestaltview-v2-indol.vercel.app/api`
- Health check: `GET https://gestaltview-v2-indol.vercel.app/api/actions/health`

The core and comprehensive OpenAPI files in this folder already point to that `/api` base URL.

## Recommended setup
1. Import the **core** OpenAPI schema into your Custom GPT first.
2. Paste `gestaltview_gpt_instructions.md` into the GPT Instructions field.
3. Keep all provider and database credentials server-side only.
4. Once stable, upgrade to the comprehensive schema.

## Notes
- The middleware endpoints are active for GPT Actions integration and currently return deterministic/stub-safe synthesis wrappers while preserving route compatibility.
- `POST /actions/billy/synthesize`, `/actions/billy/loom`, and `/actions/billy/code` can pull corpus chunks through `/api/billy` when available.
- Replace placeholder auth with the auth method you actually deploy.
