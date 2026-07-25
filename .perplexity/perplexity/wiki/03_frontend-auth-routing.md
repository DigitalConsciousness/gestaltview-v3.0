<!-- PAGE_ID: gestaltview_v2_03_frontend-auth-routing -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [client/src/App.tsx:78-209](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L78-L209)
- [client/src/contexts/AuthContext.tsx:9-38](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L9-L38)
- [client/src/contexts/AuthContext.tsx:56-178](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L56-L178)
- [client/src/pages/SignIn.tsx:15-139](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/SignIn.tsx#L15-L139)
- [README.md:54-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L54-L76)

</details>

# Frontend, Auth, And Routing

> **Related Pages**: [[Overview|01_overview.md]], [[Billy Runtime|04_billy-runtime.md]], [[Agent Trainer|08_agent-trainer.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_shell -->
## Application Shell And Route Inventory

`client/src/App.tsx` is the frontend route source of truth. The app shell wraps the router with an error boundary, theme provider, auth provider, tooltip provider, Billy provider, and Vercel analytics hooks, then gates the home page behind an opening-ceremony experience while subpages skip straight to the routed surface.

The route inventory is broad and intentionally mixed: core Billy pages, pricing and auth flows, the hosted trainer runtime, package-builder/order views, exhibit lanes, diligence, tribunal, and archive pages. That matches the README claim that `gestaltview-v2` is both the public product surface and the authenticated operator surface.

Sources: [client/src/App.tsx:98-209](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L98-L209), [README.md:54-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L54-L76)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_shell -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_auth -->
## Auth State And Redirect Memory

The auth layer is now local and cookie-based. `AuthContext` talks to `/api/auth/session`, `/api/login`, and `/api/logout`, stores no browser auth token, and treats the signed HTTP-only cookie as the only authenticated state. The browser no longer waits on a remote Supabase session lookup before rendering.

`SignIn.tsx` is the operator gate, not the signup funnel. It preserves redirect intent with `redirect`, session storage, and same-origin referrer fallbacks, but the only submission path is the shared admin password. The same surface now points users toward `/signup` or `/pricing` when they need to choose a billing plan first. After login, the browser lands back on the intended route immediately.

Sources: [client/src/contexts/AuthContext.tsx:9-38](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L9-L38), [client/src/contexts/AuthContext.tsx:56-178](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/contexts/AuthContext.tsx#L56-L178), [client/src/pages/SignIn.tsx:15-139](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/SignIn.tsx#L15-L139)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_auth -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_billing -->
## Signup And Billing Bridge

`Signup.tsx` now acts as the public billing bridge. It points visitors at the real checkout surface in `/pricing`, preserves a direct path for returning operators to `/login`, and surfaces the Core/Pro/Enterprise structure without implying a separate account-creation backend.

`Pricing.tsx` is the checkout surface. It receives the public Stripe price metadata, starts the checkout session, and returns the buyer to `/welcome` after payment. The pricing page can also read a `plan` query param as a soft preset so the signup page can deep-link into the intended tier.

Sources: [client/src/pages/Signup.tsx:1-93](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/Signup.tsx#L1-L93), [client/src/pages/Pricing.tsx:1-360](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/pages/Pricing.tsx#L1-L360)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_billing -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_03_frontend-auth-routing_control -->
## Control Surfaces And Product Lanes

Not every route is public in the same way. The internal trainer control plane is protected by a cookie check that runs before the page or API handler executes and only grants access to authenticated admin sessions. That separation is important: `/agent-trainer/pricing` remains public, while `/agent-trainer/runtime` and `/agent-trainer/control-plane` are internal operating surfaces.

Outside the trainer, the app keeps several distinct product lanes live in one SPA: Billy chat and voice, GATE package generation, diligence and tribunal views, and a long list of exhibit pages. The frontend is therefore an orchestration layer over many product domains rather than a narrow chat UI.

Sources: [client/src/App.tsx:66-96](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L66-L96), [client/src/App.tsx:101-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/App.tsx#L101-L159)
<!-- END:AUTOGEN gestaltview_v2_03_frontend-auth-routing_control -->

---
