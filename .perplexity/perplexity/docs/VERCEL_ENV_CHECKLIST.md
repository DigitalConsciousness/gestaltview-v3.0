# Vercel Environment Variable Checklist

> **Why this exists:** `gestaltview-v2` depends on both browser-visible env vars and server-only env vars. The current Billy path is API-first, so missing server-side values still break real functionality even if some client fallback behavior remains available.

---

## 1. Core server-side requirements

### Billy retrieval and session state

| Variable | Where to get it | Notes |
|---|---|---|
| `SUPABASE_URL` | Supabase Dashboard -> Project Settings -> API | Server-side project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard -> Project Settings -> API | Required for Billy retrieval, founder context, rate limits, billing updates |

### Router and embedding providers

| Variable | Provider | Notes |
|---|---|---|
| `GOOGLE_API_KEY` or `GEMINI_API_KEY` | Gemini | Used by server-side routing and default Billy embeddings |
| `GROQ_API_KEY` | Groq | Optional provider in current cascade |
| `HUGGINGFACE_API_KEY` or `HF_API_TOKEN` | Hugging Face | Optional provider/embedding path |
| `OPENROUTER_API_KEY` | OpenRouter | Optional provider |
| `ANTHROPIC_API_KEY` | Anthropic | Optional paid provider |
| `OPENAI_API_KEY` | OpenAI | Optional paid provider |
| `BILLY_OLLAMA_URL` | Ollama | Optional local/provider-first path in the current cascade |

### Billing and voice

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Checkout + webhook handling |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_CORE_MONTHLY` / `STRIPE_PRICE_CORE_ANNUAL` / `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_PRO_ANNUAL` | Public pricing metadata and checkout mapping |
| `ELEVENLABS_API_KEY` | `/api/voice/billy` |
| `ELEVENLABS_BILLY_VOICE_ID` | Billy TTS voice selection |

The public signup surface now routes into `/pricing`, so missing Stripe price IDs will also degrade the signup-to-checkout flow even if the login gate still works.

### Founder admin login

GestaltView now uses a founder-only Supabase magic-link login instead of the old password-hash gate for the operator surface.

| Setting | Purpose |
|---|---|
| `ADMIN_LOGIN_EMAIL` | Label used for the admin session identity |
| `SESSION_SECRET` | Signing key for the HTTP-only session cookie |
| `ADMIN_SESSION_TTL_MS` | Optional session lifetime override |
| `MAGIC_LINK_ALLOWLIST` | Optional comma-separated allowlist; defaults to the founder/admin email(s) if omitted |

Keep these values server-side only. The browser should never receive the admin password or the signing secret.

---

## 2. Browser-visible env vars for magic-link session sync

These values are required for the browser callback to complete the magic-link session handoff. They can still be useful in adjacent runtime surfaces, but they do **not** replace the server-side variables above:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Browser Supabase project URL for the callback session sync |
| `VITE_SUPABASE_ANON_KEY` | Browser Supabase anon key for the callback session sync |
| `VITE_GEMINI_API_KEY` | Client-side fallback or adjacent browser AI features where still used |
| `VITE_ELEVENLABS_VOICE_ID` | Optional client configuration |

---

## 3. Important current diagnosis

The older story “BillyLive works because it talks directly to Gemini from the browser” is no longer the right default explanation.

Current Billy behavior:

1. `BillyLive.tsx` calls `client/src/lib/billyApi.ts`
2. that code prefers `POST /api/billy`
3. `/api/billy` needs server-side env vars for retrieval and routed generation
4. only if the server path fails or resolves to `offline-fallback` does the client drop to its legacy fallback path

So:

- missing `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` degrades retrieval and session/state-backed behavior
- missing provider keys degrades routed generation
- missing browser `VITE_*` keys no longer explain the primary Billy page behavior on their own

---

## 4. How to set in Vercel

1. Open the project in Vercel.
2. Go to **Settings -> Environment Variables**.
3. Add the required values for:
   - Production
   - Preview, if needed
4. Redeploy after changing them.

`vercel.json` in this repo is configured to build the client into `dist/public` and expose the `api/` directory as function handlers.

---

## 5. Practical verification

After updating env vars, verify with:

```bash
npm run build
```

And then check the relevant surfaces:

- `/api/billy-health`
- `/api/pricing`
- `/api/session/state`
- `/api/voice/billy` if voice output is expected
- Stripe checkout/webhook flows if billing changes were part of the rollout
