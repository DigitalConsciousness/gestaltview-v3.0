# Phase 5 live proof runbook

This runbook executes the remaining real-infrastructure proof for
`GestaltView_Inside_Out_Convergence_SPEC_2026-07-27.md`. The existing deterministic
browser test proves the Creation Corner interaction contract. The gated live test
proves the deployed render, Supabase, private Storage, ownership, projection, and
Dynamic Inner World path.

## Prerequisites

1. Deploy the current branch to a preview/development environment with the render
   v2 migration applied and a private `codex-exports` bucket.
2. Provision two disposable, confirmed Supabase email/password users. They must be
   distinct ordinary users, not founder content accounts.
3. Copy `.env.phase5.example` to an ignored local environment file and supply the
   preview URL, Supabase URL, publishable key, both test-user credentials, and a
   service-role key available only to the trusted test process.
   If the preview uses Vercel Deployment Protection, generate an Automation
   Bypass secret in the Vercel project settings and set
   `VERCEL_AUTOMATION_BYPASS_SECRET` in that ignored file. The runner sends it
   only as Vercel's protection-bypass header and asks Vercel to set the bypass
   cookie for subsequent browser requests.
4. Keep `PHASE5_ALLOW_PRODUCTION=false`. A production smoke is a separate approval
   gate after preview passes.

The service-role key must remain in the trusted test runner. It verifies the
durable job, artifact, projection, and private storage receipt directly; it is
never passed into a browser. Cleanup uses the same runner-only client when enabled.

## Run

```bash
set -a
source .env.phase5.local
set +a
pnpm run phase5:proof:live
```

The proof refuses remote targets unless `PHASE5_ALLOW_REMOTE=true`, and refuses
known production hosts unless `PHASE5_ALLOW_PRODUCTION=true`.

## Evidence

Successful execution writes:

- `output/phase5/creation-corner-render-projection.json`
- `output/playwright/creation-corner-render-projection-live-proof.png`

The JSON contains the v2 request version, job and artifact UUIDs, lifecycle
timestamps, format/MIME/byte receipt, redacted storage location, expected and
retrieved SHA-256 values, owner retrieval, API and direct-RLS cross-owner denial,
projection UUID and `source_ref`, browser marker proof, and idempotent rerun
results. Tokens, passwords, service keys, and signed URLs are omitted.

## Cleanup and production gate

For a disposable preview proof, set `PHASE5_CLEANUP_AFTER=true` and provide
`PHASE5_SUPABASE_SERVICE_ROLE_KEY`. Cleanup first verifies that the job belongs to
the configured owner and has the exact Phase 5 source ID. It then removes only
that job's storage objects, its exact projection, and the exact render job
(artifacts cascade from the job).

After preview passes, stop and review the evidence. Do not enable
`PHASE5_ALLOW_PRODUCTION` until production smoke approval is explicitly given.
