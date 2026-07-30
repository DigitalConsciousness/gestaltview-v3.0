# Insight-Bot runtime bridge

Insight-Bot is a public integration doorway into GestaltView. Reddit, Discord,
Devvit, web, and API clients remain thin channel adapters; GestaltView owns model
routing, response policy, trace metadata, and approval-gated proposals.

## Runtime endpoint

`POST /api/insight-bot/respond` accepts the versioned contract in
`shared/insight-bot/contracts.ts`. Calls require:

```http
Authorization: Bearer <GESTALTVIEW_RUNTIME_TOKEN>
Content-Type: application/json
```

The token is server-only and must be configured in both GestaltView and the
Insight-Bot server/worker environment. It must never be exposed through a
`VITE_*` variable or browser bundle.

The endpoint rejects private-memory use and any request that does not set
`context.publicContextOnly` to `true`. Public responses remove artifact
proposals. Capture and artifact actions are proposals and are emitted only when
the request mode and explicit consent both allow them.

## Persistence boundary

Migration `20260729000000_insight_bot_runtime_bridge.sql` creates private bridge
tables for channel conversations, messages, and runtime events. RLS is enabled,
`anon` and `authenticated` receive no grants, and only the server-side
`service_role` can access the tables.

Applying the migration does not automatically persist requests. Persistence
must be connected deliberately after the installation identity, retention
policy, and public-conversation consent policy are approved. The bridge tables
must not become an authority for private GestaltView memory.

## Approved execution endpoint

`POST /api/insight-bot/execute` uses the same server-only bearer token as the
response route. It accepts only `capture` and `artifact` proposals with explicit
approval and retention consent. The Reddit adapter verifies that the requested
action exists in its cached runtime response before forwarding execution.

Execution writes a deterministic, retry-safe receipt to
`insight_bot_runtime_events`. The event is a public-channel integration receipt;
it is not private Billy memory and does not create a `bucket_drops` row for an
unlinked Reddit identity. Success is returned only after the stored row can be
read back.

## Operational contract

- Preserve the user's original text in the request.
- Keep public requests isolated from embodiment profiles and private memory.
- Treat provider failure as runtime unavailability, never as permission to
  invent certainty.
- Do not publicly post crisis-path responses automatically.
- Rotate any credentials found in the dormant Insight-Bot archive before use.

Local tests establish contract behavior only. Production migration application,
token configuration, channel-adapter wiring, and live posting remain separate
deployment steps.
