<!-- PAGE_ID: gestaltview_v2_05_data-memory-retrieval -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [api/_lib/auth.ts:4-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L4-L33)
- [api/_lib/auth.ts:35-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L35-L159)
- [api/_lib/supabase.ts:4-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L4-L21)
- [api/_lib/supabase.ts:229-253](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L229-L253)
- [api/_lib/memory.ts:20-132](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L20-L132)
- [api/_lib/memory.ts:299-590](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L299-L590)
- [api/session/memory.ts:63-186](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/memory.ts#L63-L186)
- [api/session/dashboard.ts:196-270](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L196-L270)

</details>

# Data, Memory, And Retrieval

> **Related Pages**: [[Billy Runtime|04_billy-runtime.md]], [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_supabase -->
## Supabase Access Layer

The shared Supabase helper is deliberately lightweight: it avoids the external SDK in favor of direct REST calls for knowledge fragments, skill fragments, founder context, user accounts, and memory operations. That helper now includes an `AbortController`-based request timeout, defaulting to twelve seconds, so stalled backend calls cannot quietly consume an entire serverless execution window.

Auth follows the same pattern. `api/_lib/auth.ts` creates a service-role Supabase client, caches user-profile lookups for thirty seconds, and wraps both `supabase.auth.getUser()` and the profile lookup query in a four-second timeout. That is the concrete implementation behind the current-state note about fast-fail mitigation.

Sources: [api/_lib/supabase.ts:4-21](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L4-L21), [api/_lib/supabase.ts:229-253](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/supabase.ts#L229-L253), [api/_lib/auth.ts:4-33](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L4-L33), [api/_lib/auth.ts:108-159](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L108-L159)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_supabase -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_memory -->
## Persistent Memory Capture And Recall

The memory layer distinguishes memory kinds such as identity, preference, goal, project, relationship, constraint, insight, and note, and separates scopes across `personal`, `session`, and `shared`. Billy auto-capture is conservative: it skips short sentences, questions, and volatile support requests, extracts at most two candidates per turn, derives tags and summaries, embeds them when possible, and stores them as `billy-auto` entries.

Recall uses hybrid retrieval. When an embedding is available, the helper queries both semantic and text search, then merges results with a weighted rank that boosts importance and pinned status. The session memory API exposes that behavior via `GET` search, `POST` create-or-update with embeddings, and `DELETE` removal for authenticated users.

Sources: [api/_lib/memory.ts:20-132](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L20-L132), [api/_lib/memory.ts:299-590](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/memory.ts#L299-L590), [api/session/memory.ts:63-186](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/memory.ts#L63-L186)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_memory -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_05_data-memory-retrieval_session -->
## Session APIs And Founder Continuity

`/api/session/dashboard` is the authenticated control-plane summary for a user. It returns profile state, founder-bootstrap flags, founder context when the caller is founder-eligible or admin, common runtime shortcuts, and visibility into which Billy text and voice providers are configured in the environment. It can also expose a bounded admin user listing when the current account has admin rights.

Founder continuity is treated as a managed surface rather than an implicit side effect. The dashboard payload carries `currentState`, `sessionThread`, `modePreference`, `confirmedAdult`, and `plkSnapshot`, while the auth helper separately exposes founder/admin allowlisting. Together those pieces provide the durable context that Billy and internal control surfaces can reuse across sessions.

Sources: [api/session/dashboard.ts:17-40](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L17-L40), [api/session/dashboard.ts:196-280](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/session/dashboard.ts#L196-L280), [api/_lib/auth.ts:85-101](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/_lib/auth.ts#L85-L101)
<!-- END:AUTOGEN gestaltview_v2_05_data-memory-retrieval_session -->

---
