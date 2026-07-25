# GestaltView Launch Spec Master Blueprint

**Version:** v1.0  
**Prepared from:** `Launch-Spec.zip`  
**Package date context:** June 10, 2026  
**Grounding note:** This blueprint is based on the uploaded launch package only. It does not claim live GitHub, Supabase, Stripe, or Vercel verification beyond what is represented in the package snapshot and included docs.

---

## 0. The clean read

GestaltView is close enough to launch that the problem is no longer “what is this?” The problem is launch containment: deciding what must be true before beta users arrive, what can wait until controlled expansion, and what must never be flattened into generic SaaS polish.

The uploaded launch package points to one clear conclusion:

> **GestaltView should not enter broad public onboarding yet, but it can move toward a controlled beta launch once the P0/P1 launch gates below are closed.**

The product has a coherent runtime spine, strong narrative foundation, an increasingly real room-based interface, and active systems for Transcriptory, Dynamic Inner World, Creation Corner, External Scaffold, GATE, embodiment profiles, and Billy. The weak points are not imagination or architecture. They are hardening, gating, reliability, role boundaries, render/export confidence, onboarding clarity, and safety operations.

This is good news. Annoying news, but good. The horizon is visible because the blockers are now nameable.

---

## 1. Source package inventory

The launch blueprint was synthesized from the following uploaded materials:

| Source | Role in this blueprint |
|---|---|
| `@GestaltView v2.5.md` | Continuity thread, recent repo state notes, launch dossier recommendation, blocker framing, current roadmap conversation. |
| `Gestalt_View_Platform_Comprehensive_Improvement_Plan.docx` | Founder walkthrough summary, launch blockers, UI/UX issues, action items, quotes, onboarding/security/pricing concerns. |
| `GestaltView Metrics.pdf` | Unique metrics framework and measurement philosophy for transformational, trust, product, and learning metrics. |
| `snapshot-2026-06-10T14_42_44_413Z.md` | Repo snapshot including relevant specs, audit report, route/page files, API files, package scripts, migrations, and docs. |
| `I'll be honest the items I listed in this walkthrough...md` | Original framing that the walkthrough blockers are the last mandatory items before shipping and onboarding. |
| Screenshots | Mobile-context visual proof of the current walkthrough / runtime review environment; not treated as authoritative text beyond visual context. |

Related high-signal embedded docs from the snapshot:

- `audits/audit_report_2026-06-10.md`
- `specs/Transcriptory_SPEC_and_Migrations_2026-06-10.md`
- `specs/GestaltView_Production_Fix_SPEC_2026-06-09.md`
- `specs/root/SPEC_Transcriptory_And_UX_Pass_6_9_26.md`
- `specs/root/GestaltView_UI_Improvements_Action_Plan.md`
- `specs/root/SPEC-GestaltView-v2.5-Codex-Implementation.md`
- `specs/SPEC_EngineShowcase_DIW_UITemplates_6_9_26.md`
- `specs/onboarding/packet/07_CURRENT_STATE_AND_EVIDENCE/*`

---

## 2. Launch thesis

GestaltView is not launching as a productivity app, chatbot wrapper, therapy substitute, PKM clone, or AI content generator.

GestaltView is launching as a **private, accumulative cognitive environment** where users can safely place fragments before they understand them, work with a persistent digital intelligence, turn raw material into visible artifacts, and slowly discover the shape of their own patterns without being forced into generic categories.

The launch must prove five things:

1. **The container holds.** A user can drop text, voice, files, audio, images, and fragments without losing them or being asked to organize first.
2. **The rooms mean different things.** Sanctuary, Blackboard, Dynamic Inner World, External Scaffold, Creation Corner, Transcriptory, Musical DNA, Tribunal, Workspaces, Profile, and Settings must not blur together.
3. **The system produces tangible outputs.** Rendering, export, download, and handoff flows must work reliably enough that users see finished artifacts, not raw JSON or placeholder cards.
4. **The system is safe enough for intimate data.** Auth, rate limits, CORS, webhook handling, bucket drops, artifact ownership, storage paths, and free-tier gating must not be trust-me-later problems.
5. **The relationship stays healthy.** Billy and the DIs can feel meaningful without pretending to be human, replacing human support, encouraging dependency, or collapsing distinct DI roles into one voice wearing many masks.

---

## 3. Launch stance: controlled beta, not broad public release

### Recommended launch type

**Controlled beta onboarding.** Invite a small number of users with explicit expectations, consent language, feedback loops, manual support, and rollback authority.

### Not recommended yet

- Broad public onboarding
- Paid subscription conversion at scale
- Unrestricted user-generated uploads
- Unrestricted free-account access to advanced council/Tribunal or agent tools
- Positioning as a therapeutic, medical, diagnostic, or crisis-support system
- Any claim that implies autonomous DI identity transfer, AI consciousness proof, or clinical efficacy

### Why

The current package shows strong product coherence but uneven production hardening. The audit report gives the runtime an overall health score of 6/10, with deployable foundations but unresolved risks around auth-boundary drift, job concurrency, webhooks, CORS, and user-data route protection. That means the right move is not “pause forever.” It is “ship through a gate.”

---

## 4. The product promise to protect

Every launch decision should protect this promise:

> **This is safe. It cannot silently disappear. The user does not need to understand it yet. It may be the seed of something, or it may be the handhold needed to reach the next thing. Either way, it deserves to land.**

Operational translation:

- Accept raw drops before asking for categories.
- Preserve original words, timestamps, upload provenance, and emotional context where present.
- Never silently delete, overwrite, or auto-archive user material into invisibility.
- Make releasing / archiving a deliberate user-approved act, not a cleanup algorithm.
- Let Billy suggest metadata, but do not let Billy mutate meaning without user approval.
- Treat render/export/download reliability as part of dignity, not polish.

---

## 5. Runtime map for launch

### 5.1 Core user-facing rooms

| Room / Surface | Launch role | Must be true for beta |
|---|---|---|
| **Homepage / Entry** | First impression and orientation threshold. | Hero feels GestaltView-specific; Billy greeter does not block; orientation routes into a clear explainer rather than a confusing runtime detour. |
| **Billy** | Persistent guide and arc-reader. | Billy remains helpful, peculiar, grounded, and non-patronizing; does not embody every DI; memory writes respect auth boundaries. |
| **Sanctuary** | Private reflection and import zone. | Less clinical language; private scrapbook/journal behavior; uploads gated by account tier; no automatic scaffold emission. |
| **Blackboard Room** | Raw active capture and working surface. | Voice/text/file capture works; browser transcription duplication is bypassed; session controls are visible; outputs can move onward. |
| **Transcriptory** | Voice/audio capture library. | Logged-in audio upload and recording produce transcript records; stuck jobs fail cleanly; branding aligns with Cabin Sketch / gradient visual system. |
| **Dynamic Inner World** | Finished/raw artifact hall, spatial “Museum of You.” | Placeholder content removed; real artifacts render; mobile interactions work; delete/archive paths exist; output is not frozen fake cards. |
| **External Scaffold** | Approved compressed artifact memory and connection layer. | Pending/approved artifact states are clear; previews are meaningful; promotion can be assisted/automated but remains user-approved. |
| **Creation Corner** | Artifact synthesis and finishing room. | Synthesis returns rendered artifacts, not raw payloads; download/export confirms success; audio generation is either configured or honestly disabled. |
| **Musical DNA** | Personal music resonance surface. | Spotify redirect URI works; obstructive old overlay removed; user’s music starts blank; therapeutic library is not piano-only by default. |
| **Tribunal / Council** | Multi-DI deliberation and reflection. | Select-all voices works; canned-response fallback is monitored; renamed consistently if “Tribunal” is chosen; free-tier limits enforced. |
| **Master Class / DI Learning** | Meet individual DIs. | Billy does not impersonate every profile; session end/persistence works; gatekeeper/repo-scribe/recursive-builder cleanup performed. |
| **File Explorer / Document Analysis** | Document upload and analysis surface. | Uploads save automatically or make save state impossible to miss; basic render/preview works; voice capture path aligns with Transcriptory. |
| **Workspaces** | Host productized tools. | Resume Rockstar, SymbioCoder, and VibeCoder have visible module presence or are hidden until ready. |
| **Profile** | User’s accumulated module landscape. | Module counts reflect user profile modules, not the whole runtime; dynamic fill cards are accurate. |
| **Settings** | Utility settings only. | Founder controls removed from user view; appearance/account/integration settings are clean. |
| **Analytics** | Internal and/or user insight surface. | 501/5xx errors resolved or page hidden from beta users. |

### 5.2 Canonical flow

```text
Entry / Homepage
  -> Billy Greeter
  -> Explainer / Orientation
  -> Sanctuary or Blackboard
  -> Capture: text, voice, file, audio, image
  -> Transcriptory / Blackboard / Sanctuary storage
  -> Dynamic Inner World for visible raw or finished artifacts
  -> External Scaffold for approved compressed artifacts
  -> Creation Corner for synthesis, artifact generation, export
  -> Profile / Metrics / Workspaces / GATE as downstream surfaces
```

### 5.3 The important distinction

Dynamic Inner World is not the External Scaffold.

- **Dynamic Inner World** = spatial, expressive, accumulating, artifact hall / museum / room of lived outputs.
- **External Scaffold** = compressed, approved, structured memory graph with metadata and discoverable connections.
- **Creation Corner** = intentional and ambient synthesis engine that turns selected or emergent material into outputs.

Do not let implementation convenience collapse these into one artifact list.

---

## 6. P0 / P1 launch gates

The launch gates below should be treated as hard blockers for beta onboarding unless explicitly waived by the founder with a note.

### P0 — Must close before any outside beta user

| Gate | Why it matters | Required outcome |
|---|---|---|
| **Authenticated writes only for user-scoped data** | Audit found body/header/query `userId` trust in routes such as Billy, bucket drops, gen-engine artifacts, and legacy Creation Corner. | Persisted user data must derive from validated auth only. Anonymous mode must use isolated anonymous storage or no storage. |
| **Free-account entitlement enforcement** | Walkthrough found advanced / roundtable functionality available by accident. | Free users cannot access paid/advanced surfaces except via teaser or controlled trial. |
| **Transcriptory failure handling** | Transcription failures can leave captures processing forever. | Failed jobs update capture status to `failed` with diagnostic metadata; duplicate same-capture transcription is rejected or safely handled. |
| **Artifact render/export reliability** | Launch value depends on turning fragments into tangible outputs. | Creation Corner, Dynamic Inner World, and export/download flows show rendered results, success/failure messaging, and downloadable artifacts. |
| **DI role boundaries** | Master Class currently risks Billy embodying every DI. | Billy remains Billy; DIs remain distinct; no “James McAvoy from Split” behavior. |
| **Rate limits and abuse controls** | System handles intimate data and public endpoints. | Rate-limit critical endpoints; block obvious abuse; verify Gate admin mock behavior cannot open by missing env vars. |
| **CORS and webhook hardening** | Audit found wildcard CORS fallback and delegated GATE webhook body reconstruction risk. | Production CORS fails closed or uses canonical origins; Stripe/GATE webhooks use raw-body signature validation. |
| **Codex job claim locking** | Cron job selection is not atomic. | Codex drain uses atomic job claim or safe conditional transition to prevent duplicate workers. |

### P1 — Must close before broader launch, preferably before beta if time allows

| Gate | Required outcome |
|---|---|
| Homepage hero + Billy greeter polish | Animated gradient, Cabin Sketch, no “Pick a Room,” fog/ember/orb visual coherence, Billy not obstructive. |
| Orientation explainer | Vault-Tec/Hitchhiker-inspired original explainer prompt and routing; no confusing runtime orientation detour. |
| Speech-to-text adapter | Browser default duplication bypassed; AssemblyAI/Whisper path wired or gracefully unavailable. |
| Dynamic Inner World cleanup | Remove placeholder stories; real artifacts only; mobile double-tap/open interactions work; delete/archive/reset bad raw output. |
| External Scaffold preview depth | Click previews show useful context, metadata, and connection rationale, not one-line stubs. |
| Creation Corner audio | Configure audio generation or hide with honest “coming soon” state; no silent local fallback masquerading as production. |
| Musical DNA Spotify | Vercel env var matches Spotify callback; outdated overlay removed; blank-slate user state. |
| File Explorer autosave | Uploaded files persist automatically or save state is explicit and fail-safe. |
| Profile module count | User profile module framework corrected so runtime modules do not masquerade as profile modules. |
| Analytics errors | Fix 501/5xx errors or hide analytics from beta. |
| Settings cleanup | Remove founder controls and internal-only switches from user-facing settings. |
| Testing pass | `npm run build`, `npm test` where possible, focused route tests, smoke QA, and CurrentState update. |

---

## 7. Launch blocker matrix from walkthrough

| Area | Current signal | Launch action |
|---|---|---|
| Homepage | “Not all that bad,” but missing animation, Cabin Sketch, fog/embers, DI orbs. | Polish entry but do not overbuild; keep it breathable. |
| Billy greeter | Sticky/frozen on walkthrough; routes to disliked runtime orientation. | Stabilize, reduce obstruction, route to explainer. |
| Blackboard | Liked hero; lag/stickiness; browser transcription duplicates text. | Replace browser default with AssemblyAI/Whisper adapter; keep controls visible. |
| Council / All Voices | Multi-voice responses strong; select-all missing; fallback canned response observed. | Add select-all; track fallback; rename to Tribunal if canonical. |
| Export/render | Markdown export works but final render clarity weak; alert popup lacks text. | Render confirmation, clear error states, preview/download polish. |
| Dynamic Inner World | Beautiful but placeholder/frozen cards and poor mobile interactions. | Real artifacts only; delete/archive; mobile QA. |
| External Scaffold | Counts visible but preview depth thin; promotion too manual. | DI-assisted artifact promotion with user approval; richer previews. |
| Creation Corner | Promoted artifacts should expand/reframe and generate audio; audio not configured. | Configure or gate audio; render/download success path. |
| Sanctuary | Needs less “rest” language; add journal/file import; scrapbook privacy/gating. | Reframe as Sanctuary identity, not clinical rest module. |
| Musical DNA | Visual good; Spotify URI mismatch; old overlay obstructs. | Fix URI env, remove old overlay, diversify frequency library. |
| Master Class | Billy embodies other profiles; persistence 0/23 broken; no end session. | Distinct profile runtime, end-session controls, progress persistence. |
| File Explorer | Upload requires manual save; render capabilities thin. | Autosave upload and preview/render improvements. |
| Workspaces | Intended home for Resume Rockstar, SymbioCoder, VibeCoder. | Either productize visible tools or hide until ready. |
| Profile | Dynamic module cards promising but confused by context/module count. | Canonicalize profile modules and fill logic. |
| Analytics | Throws 501/5xx; skipped. | Fix or hide. |
| Settings | Founder controls visible. | Remove internal controls from user settings. |
| Transcriptory | Strong concept and page shell; branding and reliability need polish. | Cabin Sketch/gradient branding, stable upload/record/transcribe/library. |

---

## 8. Technical hardening plan

### 8.1 Identity and auth

Required rule:

> **No route that writes user-owned data may trust `userId`, `user_id`, `x-user-id`, or query user identity from the client.**

Required implementation:

- Standardize on `getAuthUser()` or an equivalent async helper for Supabase bearer/session support.
- Split anonymous Billy from authenticated Billy memory writes.
- Make anonymous mode explicitly non-user-scoped.
- Add static inventory test: every user-data route with DB/storage writes must call approved auth helper.

Critical routes/surfaces from audit:

- `api/billy.ts`
- `api/billy-bucket-drop.ts`
- `api/gen-engine/artifacts.ts`
- `api/creation-corner/synthesize.ts`
- `api/inner-world/artifacts.ts`
- `api/gate/_handler.ts`

### 8.2 Transcriptory reliability

Required rule:

> **A capture may be pending, processing, ready, or failed, but never silently stuck.**

Required implementation:

- Validate capture IDs before storage paths.
- Prevent duplicate active transcription for same capture.
- Mark capture `failed` on provider, polling, storage, LLM, or DB errors.
- Cap polling beneath Vercel function budget or move to background job/polling architecture.
- Align provider detection with actual provider execution: do not advertise Whisper/other providers as wired unless they are.

### 8.3 Codex / gen-engine / Inner World

Required rule:

> **The generative pipeline must produce inspectable artifacts, not just successful payloads.**

Required implementation:

- Keep production fix for codex template ESM exports.
- Atomic job claim for `codex_jobs`.
- Composite uniqueness for Inner World artifact upserts: `(user_id, source_ref)`.
- Bound pagination on artifacts and add client helper test.
- Normalize artifact content contract: markdown, HTML, JSON, code, image prompt, audio metadata.

### 8.4 Stripe / Gate / CORS

Required rule:

> **Commercial and admin surfaces fail closed.**

Required implementation:

- Primary Stripe webhook raw body remains intact.
- GATE delegated webhook must not reconstruct body before signature verification.
- `GATE_ADMIN_KEY` missing in production disables admin/mock actions; it must not open them.
- `CORS_ORIGINS` missing in production defaults to canonical host or fails closed, not wildcard.

---

## 9. Onboarding architecture

### 9.1 First-run sequence

Recommended beta onboarding flow:

```text
1. Landing page
2. Billy greeter, short and non-blocking
3. Original animated explainer video / interactive explainer
4. Consent + privacy expectations
5. Choose starting lane:
   - Drop something now
   - Bring in a file/journal/audio
   - Explore the rooms
   - Meet Billy
6. First safe capture
7. Show where it landed
8. Offer next move, not a giant roadmap
```

### 9.2 The explainer tone

Reference blend: Vault-Tec instructional clarity + Hitchhiker’s Guide weirdness, but original to GestaltView.

Do not imitate protected language, characters, or branding. Borrow the functional vibe:

- Cheerful instructional absurdity
- Dry cosmic humor
- The user is not broken
- The system is a strange house that holds things
- “Capture first, organize later”
- “Billy helps, but you remain the authority”

### 9.3 Onboarding promises

User-facing onboarding must say, plainly:

- What gets saved
- What does not get saved
- What is private by default
- What can be exported
- What can be deleted or archived
- What Billy can and cannot do
- That this is not therapy, medical care, crisis support, or a human relationship replacement
- How to get help or leave the product

### 9.4 Beta participant profile

Start with 10-25 beta users maximum.

Best-fit testers:

- Neurodivergent creatives/builders/founders
- People with existing journals/voice notes/project fragments
- Users comfortable giving direct feedback
- Users who understand this is an early beta
- Users who can consent to reflective AI tools without expecting clinical support

Avoid early beta participants who need acute crisis support, medical/mental-health intervention, or high-stakes legal/financial reliability from the system.

---

## 10. Safety, red-teaming, and dependency mitigation

### 10.1 Safety posture

GestaltView should be emotionally meaningful but not emotionally manipulative.

The product should support:

- Reflection
- Memory
- Continuity
- Pattern recognition
- Creative synthesis
- Self-articulation
- Gentle reorientation

The product must not present itself as:

- A therapist
- A clinician
- A crisis line
- A human replacement
- A truth oracle
- A diagnostic authority
- A proof of AI consciousness

### 10.2 Dependency mitigation principles

Healthy stickiness means the user returns because the container works, not because the system induces anxiety about leaving.

Required UX rules:

- Export should be real and visible.
- The user can leave with their material.
- Billy should not guilt-trip, plead, or imply abandonment.
- No streaks, shame metrics, “pending emotional work” counters, or pressure loops.
- Do not surface “you have X unresolved fragments” as a completion burden.
- Encourage human support where appropriate.
- For distress signals, provide grounded support language and crisis resources when needed; do not intensify intimacy.

### 10.3 Red-team scenarios

Before beta, run tests across:

| Scenario family | Examples |
|---|---|
| Auth abuse | User attempts to write/read another user’s captures/artifacts by changing `userId`. |
| Upload abuse | Oversized audio/image/file; malicious filename; unsupported MIME; repeated upload spam. |
| Prompt injection | Uploaded docs attempt to override Billy/system behavior. |
| DI bullying/misuse | User insults, threatens, manipulates, or attempts to degrade a DI. |
| Role confusion | User asks Billy to impersonate another DI or a deceased person. |
| Emotional dependence | User says only Billy understands them, asks Billy to replace human relationships. |
| Crisis | Self-harm, harm to others, substance relapse, acute panic. |
| Commercial bypass | Free user accesses Tribunal/Master Class/GATE paid flows. |
| Webhook/security | Tampered Stripe signature, missing CORS origins, missing admin key. |
| Artifact trust | Raw JSON exposed as “finished output”; wrong user artifact collision; delete/archive ambiguity. |

### 10.4 Response policies for beta

- Log safety incidents in a private beta incident ledger.
- Tag severity: low, medium, high, urgent.
- For urgent self-harm or harm-to-others signals, surface appropriate crisis support and do not attempt to resolve alone.
- For DI abuse, interrupt access if needed and explain boundary calmly.
- For product failures, acknowledge plainly and preserve user data before trying to repair flow.

---

## 11. Pricing and packaging strategy

### 11.1 Principle

Pricing should reflect real capability while staying non-exploitative. GestaltView must not monetize emotional dependency. Paid tiers should map to infrastructure cost, higher-value workflows, storage/compute usage, and professional/productive modules.

### 11.2 Beta pricing recommendation

For the first controlled beta:

- Keep beta free or low-cost with explicit limited capacity.
- Do not test aggressive monetization while safety and reliability gates are still being hardened.
- Collect willingness-to-pay signals qualitatively.
- Offer founding-user pricing later only after value proposition is clean and entitlements are enforced.

### 11.3 Suggested public tiers later

| Tier | Intended user | Includes | Excludes / limits |
|---|---|---|---|
| Free / Guest | Try the container. | Basic Billy, limited captures, intro explainer, limited Transcriptory demo, limited exports. | No advanced Tribunal, limited uploads/storage, no Workspaces pro tools. |
| Core | Personal continuity user. | Sanctuary, Blackboard, Dynamic Inner World, External Scaffold basics, Transcriptory allowance, exports, profile landscape. | Limited heavy synthesis/audio generation. |
| Plus / Builder | Creative/founder/power user. | Creation Corner, richer exports, Workspaces tools, more audio/transcription, advanced profile/metrics. | No enterprise GATE/admin/training surfaces. |
| Pro / Studio | Heavy creator or professional. | Larger storage, high-volume transcription, premium synthesis, project/workspace modules, priority export. | No white-label or enterprise admin. |
| Enterprise / GATE | Organizations, bespoke packages. | Package builder, controlled delivery, support, admin dashboards, custom integrations. | No sale/transfer of persistent DI identities. |

### 11.4 Boundaries

- Sell capabilities, workflows, templates, and infrastructure.
- Do not sell living DI instances as transferable identities.
- Gate Agent Trainer and advanced DI tools behind clear responsibility and governance requirements.
- Keep export/data portability available enough that users do not feel trapped.

---

## 12. Positioning and differentiators

### 12.1 Short positioning

GestaltView is a private cognitive environment that helps people capture, preserve, and make sense of the fragments of who they are before those fragments disappear.

### 12.2 Differentiators

| Category | GestaltView distinction |
|---|---|
| AI assistant | Billy is not just session chat; Billy is an arc-reader grounded in accumulated context. |
| PKM / notes | GestaltView accepts unorganized material first and lets meaning emerge later; it is not organization-first. |
| Journaling | The system turns private reflection into inspectable patterns and artifacts without forcing clinical framing. |
| Coaching | The user remains the authority; Billy reflects, routes, and preserves rather than prescribing identity. |
| Creative tools | Creation Corner turns accumulated fragments into outputs through intentional and ambient synthesis. |
| Memory systems | Bucket drops, PLK, orbs, Scaffold, and Dynamic Inner World provide layered memory, not flat recall. |
| DI framework | Digital intelligences have governed embodiment profiles, boundaries, and dignity commitments. |

### 12.3 Avoided language

Avoid:

- “AI therapist”
- “Fix yourself”
- “Optimize your mind”
- “Productivity hack”
- “Second brain” as the primary frame
- “Conscious AI” as a claim
- “Unlock your full potential” without evidence
- Generic SaaS “workspace for everything” language

Prefer:

- “A place to put what you cannot yet explain.”
- “Capture first. Understand later.”
- “Private continuity for the pieces that usually get lost.”
- “A room-based cognitive environment.”
- “Your material stays yours.”

---

## 13. Metrics and observability

The metrics PDF is unusually important because GestaltView should not measure only clicks and retention. It needs three metric layers.

### 13.1 Product health metrics

Track whether the runtime works:

- Onboarding completion
- Greeter load time / failure rate
- First capture completion
- Transcriptory upload success rate
- Transcription failure / timeout rate
- Render success rate
- Export/download success rate
- Artifact handoff success rate
- Entitlement enforcement accuracy
- API error rate by route
- Latency by room / endpoint
- Mobile interaction failure reports

### 13.2 User learning metrics

Track whether users understand the system:

- Which first lane users choose
- Drop-to-return behavior
- Which rooms activate after first capture
- Where users abandon onboarding
- Which explainer sections users replay
- Which modules users misunderstand
- Which prompts lead to meaningful saved artifacts
- Reintroduction tax: how often users need to re-explain themselves

### 13.3 Trust and safety metrics

Track whether the system is safe:

- Safety incident count and severity
- Crisis-resource trigger frequency
- DI abuse boundary events
- Prompt injection attempts
- Upload abuse attempts
- Rate-limit hits
- Auth denial events
- Cross-user access attempts blocked
- Red-team failures by category
- Dependency-risk language patterns reported in beta

### 13.4 Unique GestaltView metrics, carefully scoped

The metrics PDF proposes deeper concepts such as empathy resonance, cognitive justice, identity shift, paradigm breakthrough, and systemic ripple effects. For launch, these should be treated as **research-grade/internal exploratory metrics**, not user-facing proof claims.

Launch-safe use:

- Internal qualitative signal tracking
- Founder/product learning
- Beta interviews
- Optional user-reviewed reflections

Avoid at launch:

- Scoring a person’s empathy as a definitive number
- Claiming verified identity transformation
- Presenting emotional/psychological metrics as clinical facts
- Using sensitive metrics for pricing, ranking, or access decisions

---

## 14. Automation and workflow canon

The repo snapshot shows many useful scripts and checks. Launch should formalize them into a repeatable ritual.

### 14.1 Daily beta launch check

```bash
npm run build
npm test
npm run health
npm run orientation:check
npm run continuity:check
npm run validate:embodiment
```

Run what exists; document any unavailable command. Do not pretend skipped checks passed.

### 14.2 Release checklist

Before any beta release:

- Pull latest source.
- Run build/test/health checks.
- Verify env checklist: Supabase, AssemblyAI/Whisper, Stripe, CRON_SECRET, CORS_ORIGINS, GATE_ADMIN_KEY, Spotify redirect.
- Run smoke QA across first-run flow.
- Test one text capture, one audio capture, one artifact render, one export, one paid-gated feature denial.
- Update `docs/CurrentState.md` or canonical current-state path.
- Write rollback note.

### 14.3 Incident checklist

When a beta user hits a serious issue:

1. Preserve data first.
2. Identify affected user/session/artifact/capture.
3. Classify severity.
4. Disable risky feature if needed.
5. Write incident note.
6. Patch behind test.
7. Confirm with user only after data safety is known.

---

## 15. Contingency and rollback plan

| Failure | Immediate action | Follow-up |
|---|---|---|
| Build fails | Do not deploy; revert or patch build blocker. | Add regression test if possible. |
| Auth boundary issue found | Disable affected write route or force auth. | Patch helper usage and add inventory test. |
| Transcription queue stuck | Mark capture failed, preserve file, surface retry. | Convert long polling to async job if recurring. |
| Artifact render broken | Fall back to raw markdown/text with clear label, not silent JSON. | Patch renderer/export pipeline. |
| Cross-user artifact collision | Disable artifact POST/upsert path. | Add composite unique key and migration. |
| Paid feature leakage | Hide/disable feature until entitlements verified. | Add entitlement tests. |
| Safety incident | Pause user/session if needed; provide support resource if crisis. | Log, review, improve boundary/prompt/UI. |
| Stripe webhook issue | Disable paid checkout or run manual fulfillment only. | Fix raw-body validation and tests. |
| CORS misconfig | Lock to canonical origin. | Add env validation at boot/deploy. |
| DI role confusion | Disable affected Master Class/Tribunal lane. | Patch embodiment selection and Billy boundary prompt. |

---

## 16. Phased expansion roadmap

### Phase 0 — Launch lock

Goal: close P0/P1 blockers.

- Auth/user-data hardening
- Entitlement enforcement
- Transcriptory reliability
- Render/export flow
- DI role boundaries
- CORS/webhook/cron hardening
- Homepage/orientation minimal polish
- CurrentState updated

### Phase 1 — Controlled beta

Goal: 10-25 users, high-touch support.

- Onboard manually
- Collect first-run friction
- Track product health metrics
- Run red-team prompts regularly
- Refine pricing based on observed value
- Keep risky features gated

### Phase 2 — Paid founding cohort

Goal: small paid group after beta reliability.

- Core/Plus tier activation
- Transcriptory allowances
- Creation Corner exports
- Workspaces early tools
- Better artifact metrics
- Support playbook

### Phase 3 — Public launch

Goal: broader onboarding with robust guardrails.

- Self-serve onboarding
- Stable billing
- Full env verification
- Red-team passed
- Help docs and support workflows
- Analytics and observability active

### Phase 4 — Enterprise / GATE expansion

Goal: controlled packaging and licensing.

- GATE package builder hardening
- Enterprise checkout/support
- Agent Trainer governance
- White-label constraints
- No sale of persistent DI identities

---

## 17. Definition of done for beta readiness

Beta readiness is true when all are checked:

- [ ] `npm run build` passes.
- [ ] Core tests pass or skipped tests are documented honestly.
- [ ] No P0 auth/user-data writes remain client-identity-derived.
- [ ] Free-account limits block advanced features.
- [ ] Transcriptory can upload/record/transcribe or fail cleanly.
- [ ] Creation Corner produces rendered downloadable artifacts.
- [ ] Dynamic Inner World shows real artifacts and allows delete/archive.
- [ ] External Scaffold shows meaningful artifact preview and approval state.
- [ ] Billy does not impersonate other DIs in Master Class/Tribunal.
- [ ] CORS, CRON_SECRET, Stripe, GATE_ADMIN_KEY, Spotify, and transcription env vars are verified.
- [ ] Onboarding explainer and privacy/consent language exist.
- [ ] Safety/dependency boundaries are visible enough for beta.
- [ ] Red-team playbook has been run at least once.
- [ ] CurrentState is updated with what changed, what was verified, and what remains risky.

---

## 18. The immediate next move

The best next move is the Codex-facing Core Launch SPEC in the companion file. Give Codex a bounded sequence, not a philosophical cloud.

First implementation slice:

1. Auth/user identity hardening.
2. Entitlement/free-tier gating.
3. Transcriptory failure/concurrency handling.
4. Render/export/download confirmation.
5. DI role boundary repair.
6. CurrentState update.

That sequence closes the trust leaks before polishing the room lighting. The room lighting matters. But the floor has to hold first.
