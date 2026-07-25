<!-- PAGE_ID: gestaltview_v2_07_gate-package-builder -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [shared/gate/schemas.ts:3-68](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L3-L68)
- [shared/gate/schemas.ts:191-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L191-L320)
- [shared/gate/engine.ts:30-188](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/engine.ts#L30-L188)
- [client/src/components/GATEEntrypointWizard.tsx:32-318](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/GATEEntrypointWizard.tsx#L32-L318)
- [client/src/lib/gateApi.ts:53-162](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/lib/gateApi.ts#L53-L162)
- [server/gate/service.ts:366-577](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L366-L577)
- [server/gate/service.ts:615-935](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L615-L935)
- [docs/CurrentState.md:161-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L161-L211)

</details>

# GATE Package Builder

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Operations, Manifest, And Skills|10_operations-manifest-skills.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_contract -->
## Draft Contract And Recommendation Engine

GATE is strongly typed from the start. The shared schemas define draft tiers, delivery surfaces, checkout modes, draft and order statuses, compatibility findings, price breakdowns, build jobs, and artifacts. A package draft carries enough data to describe buyer identity, use case, tier, seats, backend, surfaces, packs, source bundles, theme, notes, and optional installer intent.

The shared engine turns that draft into a richer analysis. It applies use-case defaults, scores operator packs and source bundles, suggests surfaces, produces a price quote, and generates a deliverables preview that already assumes package artifacts like manifests, config files, docs, and installers.

Sources: [shared/gate/schemas.ts:3-68](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L3-L68), [shared/gate/schemas.ts:191-320](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/schemas.ts#L191-L320), [shared/gate/engine.ts:30-188](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/gate/engine.ts#L30-L188)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_contract -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_wizard -->
## Wizard UX And Draft Persistence

The frontend wizard is built around a six-step flow, local snapshot persistence, URL draft synchronization, optimistic hydration from local state, and autosave-aware remote persistence. It stores a local snapshot under `gv-gate-builder-snapshot-v1`, restores it on load, prefers a `draft` query param when present, and avoids unnecessary saves when the serialized draft signature has not changed.

The client API layer is thin on purpose. It exposes draft create, fetch, patch, validate, checkout, order retrieval, artifact access redemption, and build regeneration endpoints, while only attaching the `X-Gate-Admin-Key` header for mock-payment flows. The recent current-state notes show that this surface has been under active UX hardening, especially around autosave stability, reset behavior, and admin no-charge testing.

Sources: [client/src/components/GATEEntrypointWizard.tsx:32-318](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/GATEEntrypointWizard.tsx#L32-L318), [client/src/lib/gateApi.ts:53-162](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/lib/gateApi.ts#L53-L162), [docs/CurrentState.md:161-211](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/docs/CurrentState.md#L161-L211)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_wizard -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_07_gate-package-builder_checkout -->
## Checkout, Orders, And Build Jobs

Server-side GATE service code manages the full state machine. Draft creation and patching normalize selections and hash the config, checkout turns a validated draft into an order and optional support request, and payment completion either attaches a Stripe session or immediately marks the order paid and creates a build job. The same service keeps draft, order, and build-job state aligned across both Supabase-backed and local-state modes.

Build execution then flips orders and drafts into `provisioning`, composes a package artifact, stores or upserts the artifact, and ends in either `delivered` or `failed` with build-log entries. This is not a marketing upsell screen disguised as code; it is a real package-assembly pipeline with typed persistence and explicit lifecycle states.

Sources: [server/gate/service.ts:366-577](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L366-L577), [server/gate/service.ts:615-935](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/server/gate/service.ts#L615-L935)
<!-- END:AUTOGEN gestaltview_v2_07_gate-package-builder_checkout -->

---
