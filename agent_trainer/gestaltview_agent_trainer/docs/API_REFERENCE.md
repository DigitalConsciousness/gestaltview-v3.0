# API Reference

All API modules are scaffolded as framework-agnostic functions that return:

```json
{ "data": "...", "error": null }
```

or

```json
{ "data": null, "error": { "message": "..." } }
```

## Modules

- `api/assistant.ts`
- `api/knowledge.ts`
- `api/skills.ts`
- `api/memory.ts`
- `api/analytics.ts`
- `api/plk.ts`
- `api/packs.ts`

## Expected Endpoints

- `POST /api/assistant`
- `GET /api/knowledge`
- `POST /api/knowledge`
- `PUT /api/knowledge/:id`
- `DELETE /api/knowledge/:id`
- `POST /api/knowledge/search`
- `GET /api/skills`
- `POST /api/skills`
- `PUT /api/skills/:id`
- `DELETE /api/skills/:id`
- `GET /api/memory`
- `POST /api/memory`
- `DELETE /api/memory/:id`
- `POST /api/analytics/event`
- `GET /api/analytics/summary`
- `GET /api/plk/:user_id`
- `POST /api/plk`
- `GET /api/packs`
- `POST /api/packs`

## Integration Note

These files are deliberately framework-neutral so they can be wrapped by Vercel, Express, Next.js route handlers, or another runtime without changing the core business logic contracts.

## Packs Route Shape

The package now includes a minimal route-style adapter in `api/packs.ts`.

Example request shapes:

```json
{ "method": "GET", "action": "list" }
```

```json
{ "method": "POST", "action": "plan", "packSlug": "devops-terminal-pack" }
```

```json
{
  "method": "POST",
  "action": "manifest",
  "packSlug": "general-operator-foundation",
  "projectName": "buyer-project",
  "owner": "buyer-owner"
}
```

```json
{
  "method": "POST",
  "action": "apply",
  "userId": "buyer-user-id",
  "packSlug": "general-operator-foundation",
  "projectName": "buyer-project",
  "owner": "buyer-owner",
  "selectedBundleSlugs": ["knowledge-core-bundle", "context-alignment-bundle"]
}
```

`handlePacksRoute()` handles planning-only actions.

`handlePacksRouteWithEnv()` is the env-backed execution path for real pack application.
