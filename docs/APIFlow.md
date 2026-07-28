# APIFlow — GestaltView v2

> **Last updated:** 2026-07-11
> **Repo:** `DigitalConsciousness/gestaltview-v2.0`
> **Status:** Active / production-facing runtime

This document is the current reference for `gestaltview-v2.0`'s API surface: route families, auth expectations, request/response contracts, and the external systems those handlers depend on.

---

## 1. Endpoint map

| Route | Methods | Purpose | Auth requirement |
|---|---|---|---|
| `/api/billy` | `POST` | Billy bootstrap, retrieval-grounded chat, diagnose mode | Optional auth; diagnose requires shared secret |
| `/api/billy-health` | `GET` | Billy pipeline readiness and provider/Supabase status | None |
| `/api/billy-bucket-drop` | `POST` | Durable bucket-drop capture into Supabase | Optional auth/user context |
| `/api/actions/health` | `GET` | Actions API heartbeat | None |
| `/api/actions/*` | `POST` | Prompt-envelope routes for chat, Billy modes, bucket drops, musical DNA, tribunal, consciousness | None |
| `/api/auth/session` | `GET` | Session snapshot for the browser auth layer | Depends on caller/session |
| `/api/consciousness/[surface]` | `GET`, `POST` | Surface-aware consciousness interactions | Varies by caller |
| `/api/collaborators/provision` | `POST` | Collaborator provisioning helper | Founder/admin or secret gated |
| `/api/diligence` | `GET` | Structured diligence datasets from local report files | None |
| `/api/diligence/ots` | `GET` | OTS index dataset from `diligence/exports/ots_index.csv` | None |
| `/api/documents` | `GET` | Document index and repository document utilities | None |
| `/api/gate/*` | `GET`, `POST`, `PATCH` | GATE requisition, draft, review, checkout, order, build, and delivery flows | Draft UUID is a pre-order capability; order reads require the buyer access token; build/admin actions require server-side admin authorization; Stripe webhook requires raw-body signature verification |
| `/api/gravity` | `POST` | Gravity scoring and related diagnostic helpers | None |
| `/api/health/supabase` | `GET` | Supabase connectivity/readiness check | None |
| `/api/keep-alive` | `GET` | Runtime keep-alive ping | None |
| `/api/llm-proxy` | `POST` | Generic provider-routing proxy | None |
| `/api/login` | `POST` | Login helper | None |
| `/api/logout` | `POST` | Logout helper | None |
| `/api/orchestrator/decide` | `POST` | Deterministic orchestration decision plus worker-plan preview | None |
| `/api/orchestrator/extract` | `POST` | Signal extraction for profile and scaffold-oriented orchestration work | None |
| `/api/orchestrator/execute` | `POST` | Deterministic worker execution spine with receipts, persistence, and presentation gating | None |
| `/api/persona-chat` | `POST` | Persona-specific chat envelope | None |
| `/api/pricing` | `GET` | Public Stripe price metadata from env-backed price IDs | None |
| `/api/session/state` | `GET` | Anonymous/logged-in session tier and query state | Optional `x-user-id` |
| `/api/session/dashboard` | `GET`, `POST`, `PATCH` | Account control plane, founder bootstrap, founder persistence, admin overrides | Bearer auth required |
| `/api/session/memory` | `GET`, `POST`, `DELETE` | Persistent user memory retrieval and CRUD | Bearer auth required |
| `/api/stripe/checkout` | `POST` | Create Stripe subscription checkout session | None |
| `/api/stripe/webhook` | `POST` | Stripe webhook ingestion and Supabase tier updates | Stripe signature required |
| `/api/stripe/stripe-webhook` | `POST` | Alias of `/api/stripe/webhook` | Stripe signature required |
| `/api/voice/billy` | `POST` | ElevenLabs TTS proxy for Billy voice output | None |
| `/api/workbook/items` | `GET`, `POST` | Workbook item storage and sync helpers | Varies by caller |
| `/api/workbook/sync-runs` | `GET`, `POST` | Workbook sync run tracking | Varies by caller |
| `/api/workspaces` | `GET` | Workspace index and workspace utilities | Optional auth |
| `/api/trainer/agents` | `GET` | List trainer agents | Founder/admin bearer auth required |
| `/api/trainer/scenario-sets` | `GET` | List trainer scenario sets | Founder/admin bearer auth required |
| `/api/trainer/runs` | `GET`, `POST` | List runs and submit new training runs | Founder/admin bearer auth required |
| `/api/trainer/runs/:id` | `GET` | Fetch detailed run state | Founder/admin bearer auth required |
| `/api/trainer/runs/:id/approve` | `POST` | Approve an agent version for a run | Founder/admin bearer auth required |
| `/api/trainer/runs/:id/reject` | `POST` | Reject an agent version for a run | Founder/admin bearer auth required |
| `/api/trainer/runs/:id/deploy` | `POST` | Mark a trainer version as deployed | Founder/admin bearer auth required |

---

## 2. Billy contract

### 2.1 Request

Current supported request fields for `/api/billy` include:

```ts
{
  bootstrap?: boolean;
  message?: string;
  query?: string;
  mode?: "synthesis" | "chat" | "diagnose";
  topK?: number;
  section?: string;
  exhibitDomain?: string;
  userTier?: "anonymous" | "free" | "core" | "pro" | "enterprise" | "founder";
}
```

Additional auth/diagnostic inputs:

- `Authorization: Bearer <supabase-access-token>` for authenticated sessions
- `x-user-id` or body/query `userId` in some caller contexts
- `x-billy-api-secret` or body `apiSecret` when `mode === "diagnose"`

### 2.2 Response

Billy responses return an envelope shaped like:

```ts
{
  response: string;
  provider: string;
  timestamp: string;
  free?: boolean;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?: {
    conversationMode?: "synthesis" | "chat";
    retrievalMode?: "semantic" | "text" | "text-only" | "none";
    contextSources?: number;
    skillSources?: number;
    memorySources?: number;
    memoryRetrievalMode?: "semantic" | "text" | "text-only" | "none";
    packageFilter?: string | null;
    founderSessionActive?: boolean;
    founderContext?: Record<string, unknown> | null;
    sessionThread?: string | null;
    modePreference?: "synthesis" | "chat" | null;
    embedBackend?: "gemini" | "ollama" | "huggingface" | null;
    embedModel?: string | null;
  };
  chunks?: Array<{
    document_id: string;
    chunk_index: number;
    score: number | null;
    filename: string;
    document_type: string | null;
  }>;
}
```

Notes:

- `bootstrap: true` returns an opening line and founder/session metadata with `retrievalMode: "none"`.
- A text-only retrieval path can return without a routed LLM success, but standard Billy responses still come back as metadata-rich envelopes.
- Billy metadata now includes memory-specific fields alongside knowledge/skill retrieval fields.

---

## 3. Account and session contracts

### 3.1 `/api/session/state`

Returns:

```ts
{
  tier: "anonymous" | "free" | "core" | "pro" | "enterprise";
  queryCount: number;
  queryLimit: number;
  remaining: number;
  isLimited: boolean;
  userId?: string;
}
```

Anonymous callers use a daily rotating fingerprint based on IP + user-agent hash. Logged-in sessions can also supply `x-user-id` for more specific state.

### 3.2 `/api/session/dashboard`

This is the authenticated account control plane backing `/dashboard`.

Methods:

- `GET`: returns profile, founder controls, founder context, admin user list, shortcuts, and Billy runtime diagnostics hints
- `POST`: action-style mutations for:
  - `bootstrap-founder-admin`
  - `update-user-account`
- `PATCH`: persist founder continuity fields such as:
  - `currentState`
  - `sessionThread`
  - `modePreference`
  - `confirmedAdult`
  - `plkSnapshot`

### 3.3 `/api/session/memory`

Authenticated memory contract for the persistent user memory bank.

Methods:

- `GET` without query: list memory entries, with filters like `scope`, `kind`, `pinned`, and `archived`
- `GET` with `q` or `query`: retrieve memory via semantic/text search
- `POST`: create or update a memory entry
- `DELETE`: remove a memory entry by id

Representative memory fields:

```ts
{
  id?: string;
  scope: "personal" | "session" | "shared";
  kind: "identity" | "preference" | "goal" | "project" | "relationship" | "constraint" | "insight" | "note";
  title?: string | null;
  summary?: string | null;
  content: string;
  source?: string;
  sourceRef?: string | null;
  tags?: string[];
  importance?: number;
  pinned?: boolean;
}
```

---

## 4. Actions API contract

`api/actions/[...path].ts` is a catch-all route. The path determines the mode.

Common request fields:

```ts
{
  message?: string;
  query?: string;
  userId?: string;
  userTier?: string;
  sectionId?: string;
  topK?: number;
  exhibit?: string;
  plk?: string;
}
```

Current behavior highlights:

- `chat` and `consciousness/reflect` require `message`
- `billy/synthesize`, `billy/loom`, and `billy/code` accept `message` or `query`
- `bucket-drops` requires `content`
- `musical-dna/*` requires music-specific payload fields
- `tribunal/*` requires a question/prompt input
- `actions` is the generic prompt-envelope lane; `gate`, `workbook`, `workspaces`, `documents`, `consciousness`, `persona-chat`, and `llm-proxy` have dedicated handlers outside the catch-all

These routes go through `routeLlm(...)`, not Billy's full retrieval-and-memory pipeline.

---

## 5. Billing and voice contracts

### 5.1 `/api/pricing`

Returns env-backed public Stripe pricing metadata:

```ts
{
  configured: boolean;
  missing: string[];
  prices: Record<string, {
    priceId: string;
    amount: number;
    currency: "usd";
    interval: "month" | "year";
    tier: string;
  }>;
}
```

### 5.2 `/api/stripe/checkout`

Request:

```ts
{
  plan?: string;
  interval?: string;
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
}
```

Response:

```ts
{
  url: string;
  sessionId: string;
}
```

### 5.3 `/api/voice/billy`

Request:

```ts
{
  text?: string;
}
```

Response:

- `200` audio stream (`audio/mpeg`) on success
- JSON error payload on failure

---

## 6. Diligence and OTS data path

### 6.1 `/api/diligence`

- reads normalized data from local report files under `Diligence_Reports/`
- uses in-memory caching
- returns partial data with warnings instead of hard-failing when a file is missing

### 6.2 `/api/diligence/ots`

- reads `diligence/exports/ots_index.csv`
- supports refresh/invalidation flags
- powers OTS-facing evidence views in the diligence UI

---

## 7. Trainer API contract

The trainer surface is an admin/founder control plane, not a public app API.

Current route families:

- list agents: `GET /api/trainer/agents`
- list scenario sets: `GET /api/trainer/scenario-sets`
- list runs: `GET /api/trainer/runs`
- create run: `POST /api/trainer/runs`
- run detail: `GET /api/trainer/runs/:id`
- approve/reject/deploy version:
  - `POST /api/trainer/runs/:id/approve`
  - `POST /api/trainer/runs/:id/reject`
  - `POST /api/trainer/runs/:id/deploy`

Operational notes:

- all trainer routes use founder/admin auth gating via `requireFounderOrAdmin(...)`
- `POST /api/trainer/runs` may execute inline when `TRAINER_INLINE_EXECUTION === "true"`
- otherwise execution is expected to flow through the worker path in `worker/trainer/main.ts`

---

## 8. External dependencies behind the API

| Surface | External or backing dependency |
|---|---|
| Billy retrieval/session logging | Supabase |
| Session state / users / founder context / memory | Supabase |
| Pricing and checkout | Stripe |
| Stripe webhook | Stripe + Supabase |
| Voice output | ElevenLabs |
| Diligence data | Local repo files |
| Actions and Billy LLM generation | Providers behind `routeLlm` |
| Trainer generation | `server/agent-trainer/providers.ts` model gateway + Supabase persistence |

---

## 9. CORS and method handling

CORS is not completely uniform across every handler.

Current patterns:

- Billy, voice, dashboard, memory, and trainer routes explicitly apply CORS helpers
- actions has its own permissive CORS helper path
- some routes are still effectively same-origin app endpoints even if they speak JSON

Do not assume every `/api/*` handler behaves identically; check the actual file.

---

## 10. Validation anchors

Current API-focused tests live in:

- `api/__tests__/actions.test.ts`
- `api/__tests__/billy-api.test.ts`
- `api/__tests__/billy-runtime.test.ts`
- `api/__tests__/billy.test.ts`
- `api/__tests__/dashboard.test.ts`
- `api/__tests__/llmRouter.test.ts`
- `api/__tests__/memory.test.ts`

Repo-level validation helpers include:

- `npm run build`
- `bash scripts/test-apis.sh`
- `bash scripts/test-billy-routing.sh`
- `bash scripts/test-db-schema.sh`

---

## 11. Related documents

- [`AIFlow.md`](./AIFlow.md)
- [`ArchitecturalStructure.md`](./ArchitecturalStructure.md)
- [`Manifest.md`](./Manifest.md)
- [`CurrentState.md`](./CurrentState.md)
