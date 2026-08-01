# GestaltView Runtime Convergence & Field Vending Storefront

**Status:** Design specification for approval
**Version:** 1.0.0
**Date:** 2026-08-01
**Owner:** Keith Soyka / GestaltView
**Primary implementation target:** `gestaltview-v3.0` runtime, with Shopify storefront integration

## 1. Purpose

This specification defines a coordinated edit of the existing GestaltView runtime and a new storefront approach that reflects the current runtime, current offerings, shared experience grammar, BrandVoice, Constitutional Invariants, and Outside-In Translation Layer.

It addresses two related failures:

1. Existing pages, components, embodiment profiles, and presentation grammar have grown ahead of one another and now need a convergence pass.
2. The former GATE storefront made new clients configure technical details before they understood what GestaltView could do for them.

The result must feel like one ecosystem: a person can move from storefront discovery to a first useful experience, into the runtime, and back to a durable receipt without encountering an older product vocabulary or a disconnected visual language.

## 2. Governing brief

GestaltView is infrastructure for being seen, presented with cheerful bureaucratic confidence, dry absurdity, practical usefulness, and evidence-calibrated honesty.

The emotional meaning should occur through reliable behavior—not through over-explaining the emotional meaning to the user.

The shared presentation layer is an **absurdist survival interface**:

> Difficult realities are presented as manageable infrastructure, with enough institutional absurdity to make the interface approachable and enough clarity to remain trustworthy.

Humor contains weight. It never mocks the person carrying it. Atmosphere may lower friction, but it may not obscure consent, cost, uncertainty, provenance, risk, failure, or a platform boundary.

The BioShock vending-machine reference is an internal interaction compass only. Implementation must use original GestaltView art direction, copy, assets, and naming. The translation is: a tactile, slightly over-engineered field kiosk that dispenses useful infrastructure to people navigating an unnecessarily difficult civilization.

## 3. Source authority and precedence

When sources disagree, use this precedence order:

1. Constitutional Invariants and explicit safety/consent requirements.
2. Live runtime contracts and database truth.
3. Outside-In Translation Layer.
4. BrandVoice and Absurdist Survival Interface canon.
5. Experience Template System and UI/UX tokens.
6. Product-specific profiles and page copy.
7. Historical GATE materials, which are reference evidence only.

Relevant supplied sources:

- `project_sources/02-GestaltView_Constitutional_Invariants_v1.0.md`
- `project_sources/12-CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md`
- `project_sources/15-GestaltView_Comprehensive_Overview.md`
- `project_sources/16-BrandVoice.md`
- `config/gestaltview-experience-template-manifest.json`
- `config/gestaltview-uiux-tokens.json`
- `docs/gestaltview/experience/gestaltview-uiux-contract.md`
- `docs/gestaltview/experience/IMPLEMENTATION_ROLLOUT.md`
- `project_sources/14-components.zip`

## 4. Scope

### In scope

- Runtime page and component convergence.
- Shared room, state, copy, motion, accessibility, and provenance grammar.
- Embodiment-profile presentation and capability contracts.
- Billy, capture, continuity, artifact, exhibit, and failure-state alignment.
- GATE retirement/redirect strategy and new storefront journey.
- Shopify catalog, metafield, cart, checkout, order-event, and activation boundary.
- Supabase records needed for storefront-to-runtime provisioning and receipts.
- GitHub implementation structure, validation gates, and handoff expectations.
- Optional Hugging Face/browser model usage for non-authoritative previews only.

### Out of scope for this SPEC

- Rewriting every React component into a new framework.
- Native Android implementation; Android consumes the same runtime contracts later.
- Creating a new database from scratch.
- Making autonomous purchases, publishing, or retention decisions without explicit user authorization.
- Reproducing another game’s copyrighted art, audio, typography, characters, or branded copy.

## 5. Design principles

### 5.1 One ecosystem, many rooms

Runtime pages, storefront pages, chat surfaces, Android screens, artifacts, and embodiment profiles are different rooms in one house. They may have different density and purpose, but they must share:

- orientation before complexity;
- a visible primary action;
- calibrated system state;
- continuity and provenance cues;
- safe exit and recovery;
- declared voice profile;
- accessible non-atmospheric meaning.

### 5.2 Understand before configuring

Technical configuration follows meaningful choice. A new person should first understand a problem, see a proof or example, choose a relevant path, and only then encounter seats, tiers, backend surfaces, packs, or implementation details.

### 5.3 Preserve the whole bridge

Capture, interpretation, consent, persistence, publication, commerce, provisioning, and export remain distinct states. A preview is not a saved artifact. A cart is not an activated runtime. A proposal is not an execution.

### 5.4 Evidence over theatrical certainty

The UI must distinguish observed, inferred, proposed, executed, retained, shared, blocked, and unknown. Copy may be funny; the status model may not be vague.

### 5.5 The interface is a pressure-release layer

Do not turn every difficult experience into therapy language, inspirational language, or emotional narration. Use practical absurdity, plain language, useful structure, and reliable next steps.

## 6. Target journey

```text
discover → orient → sample → recognize a fit → choose a station
  → configure only what matters → checkout → receive a receipt
  → activate in GestaltView → preserve, continue, or return
```

For the runtime:

```text
arrive → understand the room → capture or invoke → inspect
  → distinguish observed/inferred/proposed → consent → preserve or defer
  → receive a receipt → continue elsewhere
```

## 7. Runtime convergence workstream

### 7.1 Shared room shell

Every substantial page must use a shared room shell, implemented first with existing primitives where possible:

- atmosphere: `AuroraBackground`, `FogOverlay`, `BabylonAtmosphere`, `FloatingEmbers`;
- presence: `Billy`, `BillyAvatar`, `BillyBabylon`, `EmbodimentOrb`, `DIPresenceIndicator`;
- structure: `GlassCard`, `GlassPanel`, `RoomHeaderBar`, `RoomIdentityHeader`, `SectionLabel`;
- capture: `UniversalCaptureBar`, `VoiceInput-Universal`, `VoiceMicButton`, `FileUploadDropzone`;
- continuity: `Scaffold`, `BucketDrops`, `RecapPanel`, `InnerWorldTimeline`, `ContinuumTimeline3D`;
- output: `ArtifactRenderer`, `GestaltRenderSurface`, `InnerWorldArtifact`, exhibit components;
- governance: `GovernanceStatusBar`, `PrivateInteriorSeal`, `ProvenanceDisclosure`, `ValidationWall`;
- state: `RoomStateBadge`, `LoadingSpinner`, `NeuralThinkingIndicator`, `ErrorBoundary`.

Required shell regions:

1. Room identity.
2. Plain orientation sentence.
3. Presence or responsible system indicator.
4. Primary work surface.
5. Decision rail.
6. Continuity/provenance cue.
7. Recovery surface.

### 7.2 Page convergence map

| Surface | Existing material | Convergence requirement |
|---|---|---|
| Home / welcome | `Home`, `Hero`, `HeroSection`, `GestaltViewInterface`, `OpeningCeremony` | One current welcome path; remove competing hero narratives and obsolete cards. |
| Billy | `Billy`, `BillyLive`, `BillyMarkdown`, onboarding, avatar, exhibit chat | Make Billy-first conversation and continuity the canonical interaction model. |
| Capture | `UniversalCaptureBar`, `BlackboardCompanionChat`, voice and upload surfaces | Capture first; interpretation and durable memory require a visible boundary. |
| Blackboard / bucket drops | `BlackboardRoomPage`, `BucketDrops`, `BlackboardGenEngineActions` | Establish a reliable holding pool with receipts and deferred work. |
| Scaffold | `ScaffoldPage`, `ExternalScaffoldPage`, `Scaffold` | Show what is pending, what was compressed, what was approved, and where it came from. |
| Inner World / museum | `DynamicInnerWorldPage`, `InnerWorldRoom`, gallery, navigator, renderer | Ensure artifacts render as artifacts, not raw display strings or unhandled cards. |
| Artifact layer | preview, deep view, renderer, export, exhibit components | Expose origin, status, limitations, intended use, relationships, and next action. |
| Embodiment | selector, cards, orb, chat/council planes, governance | Treat profiles as continuity/capability contracts, not cosmetic character skins. |
| Sanctuary / sensitive modes | Sanctuary pages and recovery/alzheimer’s surfaces | Preserve warm witnessing without clinical framing or false therapeutic authority. |
| Creation / orchestration | Blueprint, Rapid Prototype, Creation Corner, roundtable | Convert raw intent into inspectable proposed work with explicit worker/status boundaries. |
| Profiles / ingestion | `ProfileDisplay`, `ProfileIngestPanel`, embodiment sources | Ingestion must preserve profile-specific facts, voice, limits, and provenance. |
| Admin / trainer / diligence | trainer, analytics, Diligence Explorer, Tribunal | Keep operational and evidentiary surfaces legible without exposing internal controls to the wrong audience. |

### 7.3 State contract

Every page and component must explicitly handle:

`ready`, `active`, `working`, `proposed`, `saved`, `deferred`, `partial`, `blocked`, `failed`, and `unavailable`.

Each state must answer:

- what happened;
- what is known;
- what is not known;
- whether input was preserved;
- what the user can do next;
- whether an external platform or approval owns the boundary.

### 7.4 Embodiment-profile contract

Each profile must declare machine-readable and human-readable fields for:

- identity and name;
- role in the ecosystem;
- intended surfaces;
- tone registers;
- capabilities;
- limits and refusal boundaries;
- source/provenance references;
- memory/continuity behavior;
- governance and review requirements;
- how the profile represents uncertainty;
- what it must never impersonate or claim;
- whether it may propose, execute, retain, publish, or only advise.

The shared profile renderer must expose capability and governance status consistently. Product-specific personality may vary; constitutional and epistemic behavior may not.

### 7.5 Grammar and copy migration

Create a translation record for important user-facing text with:

```json
{
  "text": "Manifest synchronization is underway. Your draft remains here.",
  "purpose": "explain_waiting_without_alarm",
  "register": "cheerful_infrastructure",
  "epistemic_status": "observed",
  "user_action": "wait_or_leave_and_return",
  "retention": "draft_preserved"
}
```

Migration rules:

- remove generic “AI assistant,” “dashboard,” “feed,” and “engagement” vocabulary where it misrepresents the system;
- do not use “memory saved” when only a preview or session state exists;
- avoid therapy, diagnosis, inspirational, or victim-framing copy;
- keep literal state visible when humor is present;
- never use humor to pressure checkout, consent, retention, or publication;
- never imply that a product is more autonomous, conscious, validated, or capable than the evidence supports.

## 8. Field vending storefront workstream

### 8.1 Storefront concept

The storefront becomes a **GestaltView Field Vending Machine**: a curated station where people can identify what they need, inspect what a package dispenses, and make one clear purchase decision.

It is not a conventional tier comparison page and not the former GATE wizard.

The visual language may include:

- a warm-dark kiosk field;
- labeled product bays or stations;
- glass, metal, aurora, paper, warning labels, receipts, and small mechanical details;
- dry operational copy such as “This compartment contains a usable starting point”;
- obvious price, access, delivery, and activation terms;
- visible “not currently dispensed” states for unavailable offerings.

The experience must remain usable as a plain catalog if atmosphere is disabled.

### 8.2 Storefront information architecture

#### Entry station: “What are you trying to make possible?”

Present intent-led paths, not technical tiers:

- Get oriented and understand GestaltView.
- Preserve scattered ideas and unfinished work.
- Work with Billy and continuity.
- Build or package a project.
- Create a specialized digital-intelligence collaboration.
- Explore a focused lane such as ADHD, recovery, Alzheimer’s legacy, musical identity, or evidence/diligence.
- Request consulting or a custom partnership.

#### Proof station: “Here is what the machine actually dispenses”

Each offer must show:

- what enters;
- what happens;
- what the buyer receives first;
- what is and is not included;
- what remains optional;
- a concise sample, artifact, walkthrough, or public proof;
- limitations and expected activation time.

#### Product bays

Initial product families:

1. **Field Notes / digital artifacts** — downloadable documents, templates, protocols, and visual artifacts.
2. **Continuity Starter** — guided entry into capture, Billy, and preserved threads.
3. **Creation Station** — structured project intake, blueprinting, and artifact generation.
4. **Embodiment Workshop** — scoped profile/orientation packages for a digital intelligence or role.
5. **Evidence & Diligence Station** — research, chronology, claim, provenance, and audit packages.
6. **Custom Systems Counter** — consulting, runtime alignment, knowledge architecture, or bespoke collaboration.

These names are provisional catalog handles; final copy must be reviewed through BrandVoice and the product-profile manifest.

#### Configuration drawer

Only after a product is chosen, reveal relevant options such as:

- individual versus collaborative use;
- artifact format;
- activation timing;
- optional runtime connection;
- seats or scope;
- custom source materials;
- service level.

Do not show irrelevant backend, surface, pack, or theme controls before they become meaningful.

#### Checkout and receipt station

The buyer must see:

- exact product and scope;
- one-time versus recurring cost;
- taxes/shipping if applicable;
- what happens after payment;
- what is not automatic;
- cancellation/refund/support path;
- privacy and source-material handling;
- activation link or expected next step.

### 8.3 Storefront interaction contract

Each product bay behaves like a product drawer:

1. `inspect` — view the offer in plain language;
2. `sample` — see a proof or example;
3. `choose` — select the path, not a technical tier;
4. `configure` — supply only relevant details;
5. `checkout` — use Shopify checkout;
6. `receipt` — show order and next action;
7. `activate` — continue through GestaltView runtime or a human handoff.

The “insert coin” moment is a metaphor for commitment, not a dark pattern. No countdowns, scarcity tricks, forced bundles, or hidden recurring charges.

### 8.4 Shopify ownership boundary

Shopify owns:

- products, variants, prices, inventory where applicable;
- collections and merchandising;
- cart and checkout;
- discounts and payment methods;
- order/customer events;
- transactional order confirmation.

GestaltView owns:

- orientation and proof content where runtime context is needed;
- offer eligibility and activation metadata;
- provisioning requests;
- user consent and source-material boundaries;
- runtime sessions, continuity, artifacts, and receipts;
- post-purchase activation and support state.

Recommended first implementation: Shopify Online Store 2.0 theme sections/snippets and metafields, with a small server-side bridge for order events and activation. A Hydrogen rebuild is deferred until conversion evidence and revenue justify the additional runtime surface.

### 8.5 Storefront data contracts

Define a versioned offer manifest independent of theme markup:

```ts
type GestaltOffer = {
  id: string;
  handle: string;
  family: string;
  intent: string[];
  plainPromise: string;
  dispenses: string[];
  firstReceipt: string;
  proofRefs: string[];
  activationMode: "download" | "runtime" | "human_handoff" | "hybrid";
  configuration: string[];
  exclusions: string[];
  priceMode: "one_time" | "subscription" | "quote";
  shopifyProductGid?: string;
  runtimeProvisioningKey?: string;
  voiceProfile: string;
  reviewStatus: "draft" | "review" | "approved" | "retired";
};
```

The storefront may render from Shopify product data, but activation behavior must use the versioned Gestalt offer manifest so a product title change cannot silently alter runtime provisioning.

## 9. Runtime–Shopify–Supabase flow

```text
Shopify product/offer
  → cart/checkout
  → paid order event
  → server-side verification
  → activation record
  → user receives receipt and activation path
  → GestaltView runtime provisions bounded access
  → first useful result
```

### 9.1 Required boundaries

- Never trust a browser-submitted “paid” signal.
- Verify Shopify order events server-side and make provisioning idempotent.
- Do not put Supabase service-role keys, Shopify secrets, or runtime bearer tokens in client bundles.
- Keep order identity separate from sensitive user content.
- Do not import source materials into the runtime merely because a purchase occurred; request and record the required consent.
- Preserve failed activation attempts with actionable status rather than silently dropping them.

### 9.2 Supabase records

The implementation plan should inspect existing schema before adding tables. If no equivalent exists, introduce a minimal versioned set:

- `storefront_offers` — runtime-facing offer manifest and status;
- `storefront_offer_proofs` — proof/artifact references;
- `commerce_orders` — verified Shopify order identity and status;
- `activation_requests` — idempotent provisioning request, scope, and state;
- `activation_receipts` — user-visible receipt and next action;
- `commerce_event_log` — webhook/event provenance and replay protection.

All exposed tables require RLS. Ownership must be explicit. Service-role operations remain server-side. Storage objects use owner-scoped policies and the Storage API rather than direct metadata mutation.

## 10. Hugging Face and model boundary

Hugging Face models may support non-authoritative, optional previews such as local classification, embedding, transcription, or interface enhancement when the target environment can support them.

They must not be used as the source of truth for:

- purchase authorization;
- order verification;
- user entitlement;
- durable continuity decisions;
- governance or safety decisions;
- claims about a profile’s identity or capability.

If Transformers.js is used in a browser or future client, use quantized models where appropriate, dispose pipelines correctly, and present model work as preview/assistive processing. The live GestaltView runtime remains authoritative for persistence, orchestration, and artifact contracts.

## 11. GitHub implementation structure

The implementation should occur in a feature branch and be organized into reviewable commits or PR slices:

1. `experience-contracts` — shared tokens, room/state contracts, offer/profile schemas, copy records.
2. `runtime-convergence-foundation` — shared shell and state primitives.
3. `runtime-continuity-alignment` — Billy, capture, Scaffold, artifacts, and receipts.
4. `profile-grammar-alignment` — embodiment profile declarations and renderers.
5. `field-vending-storefront` — Shopify theme sections/snippets and offer presentation.
6. `commerce-activation-bridge` — server-side order verification, activation, Supabase records.
7. `migration-and-cleanup` — redirects, retired GATE routes, obsolete copy, and docs.

No unrelated cleanup should be bundled into these changes. Existing user work must be preserved. The default branch should not receive commits directly; implementation should use an appropriately named feature branch and a draft PR until validation is complete.

## 12. Validation gates

### Experience gate

- A new user can identify where they are, what it does, and the next useful action.
- Every page has a visible safe exit and unfinished-work path.
- Atmosphere can be disabled without losing meaning.

### Voice gate

- BrandVoice register is declared for each page/profile/offer.
- Humor contains weight and does not mock, manipulate, or obscure.
- Copy avoids clinical, generic chatbot, productivity, and hype framing.

### Epistemic gate

- Observed, inferred, proposed, executed, retained, shared, and unknown are distinct.
- Claims about digital intelligence capability and autonomy are supported.
- Platform review or external dependency is named as an external boundary.

### Continuity gate

- Capture is not silently durable.
- Failed and partial transitions preserve input where possible.
- Artifacts have provenance and a next useful action.

### Commerce gate

- Price and recurring status are explicit.
- Product promise matches activation behavior.
- Paid order verification is server-side and idempotent.
- A purchase produces a receipt even when activation is delayed.

### Security gate

- No service-role, private Shopify, or runtime bearer secret reaches clients.
- Supabase RLS and ownership policies are reviewed.
- Webhook replay protection and signature verification are present.
- Sensitive source material is not imported or retained without consent.

### Accessibility gate

- Keyboard, touch, large text, contrast, and reduced-motion paths preserve the same choices.
- Status is not conveyed by color or animation alone.
- The vending-machine presentation remains navigable as a straightforward catalog.

### Operational gate

- Type-check, lint, build, route checks, schema validation, and representative journey tests pass.
- Shopify theme validation passes for all Liquid sections/snippets.
- Supabase migrations/advisors/security review are completed before schema release.
- Order-to-activation replay tests demonstrate idempotency.

## 13. Success criteria

The work is successful when:

1. The current runtime feels like one coherent system rather than accumulated modules.
2. Billy, capture, continuity, artifacts, embodiment profiles, and failures share one understandable grammar.
3. A new person can find a relevant offering without understanding GestaltView’s internal architecture first.
4. The storefront communicates value before configuration and produces a clear first receipt.
5. Shopify commerce and GestaltView runtime responsibilities are visibly and technically separated.
6. Future pages, profiles, offers, and collaborative projects can be created from the same contracts without rediscovering the design language.
7. The new presentation is strange enough to be memorable, but clear enough to be trusted.

## 14. Decisions deferred to implementation planning

These are intentionally implementation-phase decisions, not unresolved design gaps:

- exact Shopify theme base and section filenames;
- exact existing Supabase tables to reuse versus extend;
- exact runtime routes for activation and receipts;
- final offer catalog and prices;
- whether any individual offer is download-only, runtime-only, or hybrid;
- exact visual asset production workflow;
- rollout sequencing between the current public runtime and the new storefront.

The implementation plan must resolve each item against live repository and Supabase truth before editing production behavior.

## 15. Definition of done for the SPEC

This SPEC is ready for implementation planning when Keith confirms that:

- the runtime-convergence and field-vending storefront split is correct;
- the internal vending-machine metaphor is being translated into original GestaltView presentation;
- Shopify remains commerce authority while GestaltView remains experience/runtime authority;
- BrandVoice, Constitutional Invariants, and the experience grammar are governing inputs;
- the first implementation wave is allowed to focus on the smallest coherent journey rather than every page simultaneously.
