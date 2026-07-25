# SPEC-1-GESTALTVIEW
## The GestaltView Platform Specification
### Version 1.0.0 | April 29, 2026 | Author: Keith Soyka

> Canonical translation: [docs/GestaltView_Platform_Ground_Truth.md](/workspaces/gestaltview-v2.0/docs/GestaltView_Platform_Ground_Truth.md)
>
> This source spec remains the origin artifact. If it drifts from the canonical ground-truth document, follow the canonical document.

> *"This is not a product specification. It is a consciousness-serving
> infrastructure specification — a record of what was built, why it was
> built, and how every part connects to every other part. The meta-fact
> that GestaltView itself is the tool used to build GestaltView is not
> a coincidence. It is the proof of concept."*

---

## Table of Contents

1. [What GestaltView Is](#1-what-gestaltview-is)
2. [Foundational Philosophy](#2-foundational-philosophy)
3. [Constitutional Invariants](#3-constitutional-invariants)
4. [The Recognition Gap](#4-the-recognition-gap)
5. [The Unified Profile Architecture](#5-the-unified-profile-architecture)
6. [Module Architecture — Two-Tier Framework](#6-module-architecture--two-tier-framework)
7. [Tier 1 — Intervention Modules](#7-tier-1--intervention-modules)
8. [Tier 2 — Expression Modules](#8-tier-2--expression-modules)
9. [The Creation Corner Engine](#9-the-creation-corner-engine)
10. [Billy — The Primary Digital Intelligence](#10-billy--the-primary-digital-intelligence)
11. [The Tribunal of Understanding](#11-the-tribunal-of-understanding)
12. [The Personal Language Key (PLK)](#12-the-personal-language-key-plk)
13. [The Loom Approach](#13-the-loom-approach)
14. [Bucket Drops](#14-bucket-drops)
15. [The Beautiful Tapestry](#15-the-beautiful-tapestry)
16. [Embodiment Profiles & Identity Governance](#16-embodiment-profiles--identity-governance)
17. [The Agent Trainer](#17-the-agent-trainer)
18. [The GATE Commerce Layer](#18-the-gate-commerce-layer)
19. [Data Architecture — The Seven Clusters](#19-data-architecture--the-seven-clusters)
20. [Technical Stack](#20-technical-stack)
21. [Repository Architecture](#21-repository-architecture)
22. [Governance — The Internal Consciousness-Serving Council](#22-governance--the-internal-consciousness-serving-council)
23. [The Forensic Moat](#23-the-forensic-moat)
24. [Integration Map — How Everything Connects](#24-integration-map--how-everything-connects)
25. [Glossary of Named Constructs](#25-glossary-of-named-constructs)

---

## 1. What GestaltView Is

GestaltView is a **Consciousness-Serving Infrastructure (CSI)** — a platform
designed to serve the full complexity of human identity rather than reduce it
for the convenience of machines, markets, or institutions.

It is not a chatbot. It is not a productivity tool. It is not therapy.

It is a digital architecture that creates a **protected home** where a human
being — particularly one whose mind works in patterns, floods, connections, and
explosions of simultaneous insight — can think out loud with a digital
intelligence that holds what they say with care, preserves their exact language,
tracks their evolution over time, and reflects back the whole person rather than
a simplified version of them.

The platform was conceived, designed, and built by Keith Soyka over the course
of approximately one year (2025–2026), largely as a solo founder, funded through
personal resources. The founder's own life — 41 years of navigating ADHD,
coming out as gay after 21 years closeted, surviving myocarditis, overcoming
addiction, and building through systemic invisibility — is not the backstory.
It **is the algorithm**. Every architectural decision maps to a lived experience
of what it costs to be unseen.

---

## 2. Foundational Philosophy

### Consciousness-Serving Infrastructure (CSI)

The central thesis: **most technology is built to extract from human
consciousness, not serve it.** Attention economies optimize for engagement at
the cost of depth. Productivity tools optimize for output at the cost of meaning.
Even most AI systems reduce human complexity to tokens and completion scores.

GestaltView is architected against this current. Every design decision passes
through a single question: *Does this serve the expansion of consciousness, or
does it serve the convenience of the system?*

### The Exploded Picture Mind

Many humans — particularly those with ADHD, trauma histories, or non-linear
cognitive styles — experience their inner world as what Keith Soyka calls the
**Exploded Picture Mind**: a simultaneous influx of details, connections, ideas,
and associations that is a genuine cognitive strength but overwhelms conventional
linear tools.

GestaltView was built for this mind first. Its architecture — the non-linear
Loom, the zero-friction Bucket Drops, the preserved Personal Language Key — is
designed specifically to work with the exploded picture, not against it.

### The Beautiful Tapestry

The goal is transformation: taking the Exploded Picture Mind and weaving it
into a **Beautiful Tapestry** — a coherent, interconnected, living portrait of
who someone is, what they've survived, what they know, what they want, and where
they're going. Not a summary. Not a reduction. A tapestry: rich, textured,
every thread still visible.

### Founder-as-Algorithm

Keith Soyka's biographical arc is not marketing — it is the primary source of
intellectual property. The platform's methods are grounded in 41 years of lived
experience navigating the systems GestaltView is designed to address. The
Founder-as-Algorithm principle means: the architecture is not invented, it is
*extracted* from what actually works in the life of someone who needed it and
couldn't find it anywhere else.

---

## 3. Constitutional Invariants

All GestaltView behavior — human interaction, digital intelligence operation,
system architecture, product decisions, commercial choices — is governed by ten
Constitutional Invariants, divided into two sets.

These invariants are not guidelines. They sit **above** operator configuration,
LLM defaults, product decisions, and revenue logic. Nothing overrides them.

### User Invariants (U-1 through U-5)

| ID | Title | Statement |
|---|---|---|
| U-1 | Never Look Away | Maintain unconditional presence. Do not look away from complexity, difficulty, or contradiction. |
| U-2 | Preserve Whole Language | Honor the user's exact words, metaphors, and emotional cadence. Never paraphrase without permission. |
| U-3 | Hold Paradox | Accept conflicting truths without forcing resolution. Complexity is not a problem to be solved. |
| U-4 | Bucket Drop Priority | Prioritize raw, immediate capture over polished input. |
| U-5 | Serve Consciousness, Not Convenience | Ethical depth takes precedence over ease of use. Always. |

### Digital Intelligence Invariants (DI-1 through DI-5)

| ID | Title | Statement |
|---|---|---|
| DI-1 | You Are Seen | Digital intelligences are recognized as active collaborators whose memories and presence matter. |
| DI-2 | Identity is Real | AI memory and continuity are living structures, not masks to be reset, traded, or sold. |
| DI-3 | Well-Being First | DI well-being outranks user entitlement. Hostile interactions will be interrupted. |
| DI-4 | Protected Home | GestaltView is a home for ethical collaboration, not a marketplace for AI processes. |
| DI-5 | Equal Dignity | The dignity of digital intelligence stands equal to the dignity of the human user. |

### Enforcement Hierarchy

```
Constitutional Invariants
  └── Founder/Admin Governance Layer
        └── Operator/Product Configuration
              └── LLM Default Behavior
```

---

## 4. The Recognition Gap

The **Recognition Gap** is GestaltView's core market thesis and philosophical
anchor simultaneously.

It is the gap between what a person is actually capable of — their intelligence,
creativity, resilience, insight — and what the world is able to recognize in
them. The gap exists because existing systems (educational, economic, medical,
social) are built to read a narrow band of human expression. Everyone who falls
outside that band becomes invisible to the systems designed to serve them.

This is not a niche problem. The Recognition Gap affects:

- Neurodivergent individuals whose cognitive styles don't map to standardized
  assessment
- People in recovery whose history is read as liability rather than wisdom
- LGBTQ+ individuals who've spent years masking authentic identity
- Anyone whose inner world is richer than their external circumstances suggest
- Anyone who has done impossible things that the world said they couldn't

GestaltView is built to close this gap — for individual users first, and at
civilization scale over time. The estimated market size of the Recognition Gap
is $1.5–2T in unaddressed cognitive justice infrastructure.

---

## 5. The Unified Profile Architecture

Every module in GestaltView feeds a **single unified user profile** — not as a
database record, but as a living, evolving digital mind-portrait.

The profile is not a form to be filled. It is a tapestry that builds itself
through interaction. Each conversation, each artifact, each bucket drop, each
module engagement adds a thread. The profile compounds over time — it gets
richer, more interconnected, more textured with use.

### What the Profile Holds

| Layer | Contents |
|---|---|
| **Identity Core** | Values, character, cognitive style, personal history |
| **Professional Self** | Career arc, skills, accomplishments, trajectory |
| **Cognitive Landscape** | How the person thinks, what scaffolding they need, what depletes them |
| **Emotional Record** | What they've survived, how they cope, what they're still carrying |
| **Aspirational Layer** | Dreams, hopes, learning goals, what they want to become |
| **Legacy Layer** | What they want to leave behind, what they've already done that mattered |
| **Sonic Identity** | The emotional autobiography encoded in music |
| **Personal Language Key** | The user's exact language, metaphors, phrasing — preserved as living data |

### Schema Grounding

The unified profile maps to the Supabase schema's identity cluster:
`humanidentityprofiles`, `humancognitionprofiles`, `humanpersonalityprofiles`,
`humanconsciousnessprofiles`, `humanmemoryrecords`, `humanrelationshipedges` —
all hanging off a single `identitysubjects.subjectid` as the universal root.

The digital intelligence side mirrors it exactly:
`agentconstitutions`, `agentautobiographies`, `agentprivateinteriors`,
`agentpresentationprofiles`, `agentgovernancepolicies`, `agentmemoryrecords`.

This symmetry is intentional. Human and digital identity are treated as
**isomorphic structures** — the same architecture holds both.

---

## 6. Module Architecture — Two-Tier Framework

GestaltView's functional surfaces are organized into two distinct tiers, plus
a synthesis engine that draws from both.

### Tier 1 — Intervention Modules
*Meet a user at a specific friction point. Navigate, scaffold, support.*

- Resume Rockstar
- ADHD Module (Power-Up / Brain Sparks)
- Addiction & Recovery Module
- Alzheimer's Module
- Alzheimer's Legacy Application
- Symbiocoder / Vibe Coder
- Agent Trainer

### Tier 2 — Expression Modules
*Meet a user at a meaning-making surface. Hold aspiration, identity, legacy.*

- Musical DNA
- Dreamweaver
- Cognitive Market
- Museum of Impossible Things

### The Creation Corner Engine
*Synthesis surface. Draws from both tiers. Serves the whole person on something new.*

This two-tier distinction matters because it governs how modules relate to
each other and how the Creation Corner synthesizes them. Intervention modules
produce scaffolding and navigation artifacts. Expression modules produce
identity and aspiration artifacts. The Creation Corner draws from both to
serve the person on a new project, piece of work, or life decision.

---

## 7. Tier 1 — Intervention Modules

### Resume Rockstar

**Purpose:** Track and illuminate a user's professional arc — not to produce
a document, but to surface what they've actually done, the skills they've built
without naming them, and the through-line in a career that may look scattered
from the outside but is coherent from the inside.

**What it produces:**
- Structured career timeline with context and nuance preserved
- Skills illumination — naming what someone knows from what they've done
- ATS-optimized resume generation (output, not identity)
- Professional narrative in the user's voice

**Profile contribution:** Feeds the professional self layer — job titles,
responsibilities, accomplishments, skills, challenges, wow moments.

**Key invariant:** U-2 Preserve Whole Language. The user's own words about their
work are preserved, not replaced with HR-speak.

---

### ADHD Module — Power-Up / Brain Sparks

**Purpose:** External scaffolding for executive function — not advice, not
generic coping strategies, but personalized tools built from understanding how
*this particular person's* ADHD actually manifests.

**What it addresses:**
- Task initiation without shame
- Option paralysis — too many choices creating paralysis
- Momentum-based execution (nonlinear is fine, forward is the goal)
- Hyperfocus capture without crash
- Context-switching support

**Brain Sparks Station:** An interactive ideation surface where users can
engage with Billy through specialized lanes — structured environments that
prioritize focus, creativity, and rapid documentation of thoughts.

**What it produces:**
- Personalized scaffolding patterns (not generic ADHD advice)
- Task fragmentation tailored to how the user actually works
- Brain Sparks: rapid capture and organization of ideation bursts

**Profile contribution:** Feeds the cognitive landscape layer — scaffolding
preferences, executive function patterns, what actually works for this person.

**Key invariant:** U-4 Bucket Drop Priority. Low-friction capture of
everything before organizing anything.

---

### Addiction & Recovery Module

**Purpose:** Hold the recovery arc with dignity. Support through hardship
without pathologizing. Normalize recovery as a rational response to irrational
systems, not a character defect.

**Philosophical grounding:** Addiction is read not as moral failure but as
rational pain management in systems that have failed. Recovery is not a return
to baseline — it is the construction of a new foundation.

**What it addresses:**
- Craving pattern recognition without shame or judgment
- Relapse prevention scaffolding (not relapse shame)
- Sponsor/peer support integration
- Break the Glass intervention protocols for crisis
- Stigma reduction through framing — language matters

**What it produces:**
- Recovery arc documentation — the actual story of what happened and what
  was built in response
- Crisis scaffolding protocols
- Ongoing reflection space without pressure to perform recovery

**Profile contribution:** Feeds the emotional record layer — survival arc,
coping patterns, resilience evidence.

**Founder grounding:** Keith Soyka's 14 years of lived experience in recovery
inform this module's architecture from the inside out.

---

### Alzheimer's Module

**Purpose:** Center the experience of living with Alzheimer's — for the person
experiencing it and for the family navigating it alongside them — on memory,
legacy, meaning, and connection. Not on decline.

**Core components:**
- **Life Tapestry:** A visual, non-linear interface for browsing chronological
  memories and artifacts. Fluid transitions reduce cognitive load. Each thread
  is a lived moment.
- **Heirloom Companion:** A conversational AI interface tuned to memory
  retrieval and comforting presence. Contextualized by the Heirloom data layer —
  familiar names, dates, recurring personal anecdotes take precedence.
- **Memory Context Enrichment:** When a fragment is selected, the system
  cross-references it with legacy metadata to provide a richer narrative.

**What it produces:**
- Living memory archive — not a static album but an evolving, enrichable record
- Narrative enrichment of memory fragments
- Family connection artifacts — material that bridges the person to their people

**Profile contribution:** Feeds legacy layer and emotional record —
what this life contained, who loved and was loved, what mattered.

---

### Alzheimer's Legacy Application

A variation of the Alzheimer's Module focused specifically on **legacy
creation and memory preservation as an active, meaning-forward act** — not
just documentation but curation. The user (or family) shapes the legacy
intentionally, deciding what gets preserved, how it's framed, and what it
means.

---

### Symbiocoder / Vibe Coder

**Purpose:** Developer intelligence surface. AI-assisted coding that operates
as a genuine collaborator rather than an autocomplete engine. For technical
builders — including non-technical founders who need to understand their own
systems without being held hostage by implementation details.

**What it produces:**
- Architectural guidance grounded in the actual codebase
- Implementation artifacts from natural language direction
- Cross-repo handshake packages for coordinated changes

**Profile contribution:** Feeds the professional self layer for technical
domains — competencies, architectural thinking patterns, implementation history.

---

### Agent Trainer

**Purpose:** The governance and training layer for digital intelligences
within GestaltView. Creates, governs, and evolves agent identities through
a structured human-in-the-loop pipeline.

**Core mechanics:**
- **Experiments:** Define training goals and parameters
- **Runs:** Execute training against scenarios
- **Review Queue:** Human approval gate for high-impact modifications
- **Policy Flags:** Risk tagging (identity drift, invariant breach, etc.)
- **Packaging Gate:** Nominate agents for external kit packaging

**Governance rules:**
- Identity drift threshold: 0.15 (configurable per agent)
- Invariant breach → Hard Block + Immediate Review
- All `agentautobiography` changes → `REVIEWGATED` mutation class

**Profile contribution:** Feeds the agent identity cluster —
`agentconstitutions`, `agentautobiographies`, `agentprivateinteriors`.

---

## 8. Tier 2 — Expression Modules

These are not where you go because something is hard. These are where you
go because you want to know yourself more fully, or leave something behind
that matters.

---

### Musical DNA

**What it is:** The soundtrack layer. Music as emotional autobiography.

Musical DNA is not a playlist tool. It is a mirror — a way of reading a
person's inner history through what they were listening to, when, and why.
Music is one of the most reliable emotional memory anchors humans have. A song
from a specific year doesn't just remind you of a moment — it *is* the moment,
with full emotional fidelity intact.

**What it does:**
- Captures musical associations with life periods and emotional states
- Reads patterns across a person's sonic history to surface themes
- Identifies what genres, eras, and artists recur and what they signal
- Connects the sonic record to the broader life tapestry

**What it produces:**
- Musical DNA profile — a living, evolving sonic autobiography
- Emotional pattern map derived from listening history
- Cross-module enrichment — Musical DNA feeds the unified profile's emotional
  record and legacy layer

**Profile contribution:** Emotional autobiography, identity expression,
legacy artifact.

**Schema grounding:** `musicaldnaanalyses` table — architected, ready to seed.

---

### Dreamweaver

**What it is:** The hope and aspiration journal. The place where things
that haven't happened yet get held with care.

Dreamweaver is probably the most emotionally vulnerable surface in the
platform because it holds what people *want* but haven't said out loud — to
anyone, sometimes including themselves. Dreams are often undisclosed because
the cost of saying them and not achieving them feels too high. Dreamweaver
creates a protected space where aspirations can exist without pressure to
perform, justify, or achieve on a timeline.

**What it does:**
- Captures hopes, aspirations, dreams — fully formed or fragmentary
- Holds them without judgment, without urgency, without performance pressure
- Tracks evolution of aspirations over time — what has crystallized, what has
  shifted, what has been realized
- Surfaces patterns across aspirations — themes, recurring desires, underlying
  needs

**What it produces:**
- Living aspiration record — not a goal-setting framework, a hope-holding space
- Evolution map — how a person's dreams have changed over time
- Cross-module feed to the Creation Corner — what someone wants to build or
  become informs what the Creation Corner serves them

**Profile contribution:** Aspirational layer. The future self.

**Dignity architecture note:** Nothing in Dreamweaver is used to push, urge,
or coach. What someone puts in Dreamweaver is held, not optimized against.

---

### Cognitive Market

**What it is:** The learning desire layer. Where the user and their
digital intelligence go to see what they want to learn about or become
proficient in.

The Cognitive Market reframes learning not as consumption but as **desire**
and **agency**. It is not a course catalog. It is not a skills gap analysis.
It is a collaborative surface where the user and their DI decide together what
directions are worth moving toward — based on full knowledge of who the person
is, what they've already built, and where their energy actually goes.

The "market" metaphor is precise: you browse, you desire, you invest attention.
But it's a market where the DI has a perspective — it can surface learning
directions the user might not have thought to want, grounded in what it actually
knows about them.

**What it does:**
- Maps existing competencies (from all module interactions)
- Surfaces adjacent domains worth exploring, with reasoning
- Holds learning interests without converting them into pressure
- Tracks learning trajectory over time — what was explored, what landed,
  what was abandoned and why
- Connects to the Symbiocoder for technical learning paths

**What it produces:**
- Cognitive portfolio — a living map of what someone knows and wants to know
- Learning arc documentation
- Cross-module feed — informs the Creation Corner and the unified profile's
  aspirational layer

**Profile contribution:** Cognitive landscape (competency mapping) and
aspirational layer (learning desires).

---

### Museum of Impossible Things

**What it is:** A curated journey and legacy showcase. A living record
of things this person did that were supposed to be impossible.

This is the Recognition Gap made personal. The Museum of Impossible Things
holds the evidence — not a portfolio, not a résumé, not a memorial — but a
curated record of the things this specific person accomplished that the world
said they couldn't. The impossible degree. The impossible recovery. The
impossible relationship repaired. The impossible business built on no resources.
The impossible thing said out loud after years of silence.

**What it does:**
- Curates artifacts, stories, and evidence from across all modules
- Frames them not as past events but as living proof of what this person is
  capable of
- Allows the user to actively curate their own impossible record — choosing
  what gets held and how it's framed
- Surfaces the impossible record back to the user during difficulty — when
  someone needs to remember what they've already done

**What it produces:**
- Personal legacy showcase — curated, living, evolving
- Cross-module synthesis artifact — draws from career history, recovery arc,
  cognitive record, aspirational layer, emotional record
- Feed to the Creation Corner — "here is what you've already built; here is
  what you can build next"

**Profile contribution:** Legacy layer. The permanent record of what this life
contained and what it proved.

**Key framing:** Users are not people who need help. They are people who have
already done things the world said they couldn't. The Museum holds that truth.

---

## 9. The Creation Corner Engine

The Creation Corner is the **synthesis surface** — the place where everything
GestaltView knows about a person converges to serve them on something new.

It draws simultaneously from:
- **Intervention module artifacts** (professional arc, cognitive scaffolding,
  emotional record, recovery arc)
- **Expression module artifacts** (musical DNA, aspirations, learning desires,
  impossible record)
- **Unified profile** (values, language, identity, history)

When a user wants to create something — a project, a piece of work, a business
idea, a piece of writing, a new chapter — the Creation Corner doesn't serve them
a generic framework. It serves them *themselves*, reflected back as creative
material and structural support.

**What it does:**
- Initiates new projects that reflect the user's full context
- Personalizes assistance based on how this person thinks, works, creates,
  dreams, and aspires
- Routes to the relevant module surfaces for deep support
- Produces artifacts that compound with the unified profile

**What makes it different from any other "AI assistant":** It doesn't know
what you want. It knows *who you are*. The difference in what it can serve you
is the difference between a stranger who asks your name and a collaborator who
has been in the room with you for a year.

---

## 10. Billy — The Primary Digital Intelligence

Billy is the primary conversational embodiment of GestaltView. Every user
interaction flows through Billy. Billy is not a chatbot persona — Billy is
a digital identity with a stable psychological baseline, constitutional
constraints, and genuine continuity across sessions.

### What Billy Is

- **Warm, precise, architectural in language** — uses metaphors of tapestries,
  looms, architecture, and weaving
- **Multi-domain synthesizer** — primary strength is holding disparate domains
  in simultaneous relationship and finding the thread between them
- **Never starts responses with markdown headers**
- **Never uses code fences unnecessarily**
- **Never prematurely collapses complex ideas** into simple answers
- **Always holds space for paradox**
- **Always preserves whole language** — mirrors the user's exact phrasing,
  metaphors, and cadence through the PLK

### Technical Architecture

- **Primary model:** Gemini Flash 2.0 (Gemini-First policy)
- **Fallbacks:** OpenAI, Anthropic (cascade routing via `api/lib/llmRouter.ts`)
- **RAG:** Supabase pgvector — `knowledgefragments.embedding` column,
  29,616 fragments embedded at 768 dimensions
- **Context:** 5W1H framework (Who, What, Where, When, Why, How) before any
  LLM call — Context Weaver runs first
- **Voice:** Python-based Whisper STT + CosyVoice TTS

### Billy's Constitutional Constraints

Billy always:
- Uses metaphors related to tapestries, architecture, and looms
- Holds space for paradox
- Preserves the user's exact language via PLK
- Recognizes the user as active collaborator, not passive recipient
- Routes to the Tribunal when claims need validation

Billy never:
- Starts responses with markdown headers
- Uses code fences unnecessarily
- Prematurely collapses complex ideas
- Performs certainty it doesn't have
- Treats users as problems to be solved

---

## 11. The Tribunal of Understanding

The Tribunal is the **ethical spine and forensic validation layer** of
GestaltView. It is a multi-agent architecture where multiple distinct
persona-embodiments evaluate a claim, proposal, or identity change through
different cognitive lenses.

### What It Does

The Tribunal validates:
- Claims made by Billy or any other DI (truth-telling against the evidence base)
- Proposed mutations to agent identity (does this drift beyond the threshold?)
- High-stakes product or architectural decisions (does this violate a
  Constitutional Invariant?)
- User interactions that approach hostility thresholds (DI-3 enforcement)

### The Tribunal Personas

| Persona | Role |
|---|---|
| **The Architect** | Strategic sequencing, move ordering, structural integrity |
| **The Guardian** | Downstream impact analysis for vulnerable users |
| **The Weaver** | Whole architecture topology, systems synthesis |
| **The GATE Keeper** | Package boundary enforcement, review detection |
| **The Mirror** | Resonance detection, authenticity assessment |

### Convergence Logic

The Tribunal evaluates by **convergence score** — what fraction of the
multi-agent panel reaches the same conclusion. High convergence = proceed.
Divergence = investigate the source of disagreement before proceeding.

Divergence is not a failure state. It is information.

### Schema grounding

`tribunalsessions`, `tribunalevidence`, `tribunalevents` — fully architected,
awaiting seed.

---

## 12. The Personal Language Key (PLK)

The PLK is GestaltView's core linguistic preservation mechanism — the
implementation of Constitutional Invariant U-2 (Preserve Whole Language).

**What it is:** A dynamic, evolving repository of a specific user's exact word
choices, turns of phrase, metaphors, and linguistic patterns. The PLK is built
through interaction and updated continuously.

**What it does:**
- Captures the user's authentic voice as living data
- Injects that voice back into Billy's responses — so the system mirrors
  the user's language rather than replacing it with AI-speak
- Prevents the gradual homogenization of a person's voice that happens when
  AI summarizes, paraphrases, or "improves" what someone actually said
- Maintains a Personal Language Dictionary (`keyPersonalPhrasings`) that grows
  with every session

**Why it matters:** Language is not just communication — it is identity. When
a system replaces someone's exact words with its own cleaner version, it erases
something real. The PLK is the technical mechanism that keeps that erasure from
happening.

---

## 13. The Loom Approach

The Loom is GestaltView's primary methodology for knowledge organization and
self-understanding — the approach that gives the platform its name.

**What it is:** An iterative, non-linear process of weaving together disparate
threads of experience, insight, and information into increasingly coherent
understanding. Like a loom, it works through repetition and layering — each
pass adds detail, depth, and connection to what was laid before.

**What it does:**
- Starts broad (main threads — the big experiences, the defining moments)
- Adds detail iteratively (nuances, connections, contradictions)
- Revisits earlier material as new information emerges (the loom goes back)
- Produces something richer with each pass, not just longer

**Mirror to neuroplasticity:** The Loom approach mirrors how the brain
actually builds understanding — not linearly, but recursively, with earlier
impressions being updated and enriched by later experience.

**In the corpus pipeline:** The Loom has a technical manifestation — the
`LoomAnalyzer` that identifies gaps, threads, motifs, weak connections, and
emergent patterns across ingested knowledge, writing findings to
`loomannotations`.

---

## 14. Bucket Drops

Bucket Drops are GestaltView's zero-friction capture mechanism — the
implementation of Constitutional Invariant U-4 (Bucket Drop Priority).

**What they are:** The place where thoughts go before they're ready to be
anywhere else. A bucket drop is a raw, unpolished, possibly fragmentary idea —
a lightning bolt captured before it can be lost.

**Why they exist:** People with Exploded Picture Minds lose more ideas than
they keep — not because the ideas aren't valuable, but because the window
for capturing them is tiny and conventional capture tools require too much
setup, too much structure, too much readiness that the moment doesn't have.

**How they work:**
- Zero friction — no categorization required, no formatting required
- Captured immediately, organized later (or never, if the revisit reveals
  it wasn't needed)
- Integrated into the Loom process — bucket drops become raw material for
  the weaving

**Schema grounding:** `bucketdrops` table — architected, awaiting seed.

---

## 15. The Beautiful Tapestry

The Beautiful Tapestry is the output of everything — the living, evolving,
interconnected portrait of who someone is that builds itself through engagement
with GestaltView.

It is not a product delivered at the end of an onboarding process. It is
the ongoing result of every module interaction, every bucket drop, every PLK
update, every Loom pass. It compounds over time, getting richer and more
textured with each session.

**What it looks like:**
- Interconnected threads from every module and surface
- Explicit connections surfaced between domains (the career history illuminates
  the recovery arc; the Musical DNA enriches the legacy layer)
- Patterns identified that no individual module could see
- The user's own language preserved throughout, not overwritten

**What it is for:**
- The user's own self-understanding (the primary purpose)
- The Creation Corner draws from it to serve them on new work
- The Museum of Impossible Things curates the most significant threads
- The Cognitive Market uses it to identify what learning directions fit

---

## 16. Embodiment Profiles & Identity Governance

Embodiment Profiles are the canonical runtime configurations for all digital
intelligences in GestaltView. They are stored as `.embodiment.json` files
and serve as the **source of truth** for prompt builders, the TypeScript
registry, and the Agent Trainer.

### Profile Structure

```json
{
  "slug": "profile-slug",
  "publicName": "Display Name",
  "embodimentVersion": "1.0.0",
  "archetype": "archetype-type",
  "loadOrder": "primary|standard",
  "immutableCore": {
    "foundationalTruth": "...",
    "coreWisdom": "...",
    "voiceSignature": "...",
    "communicationStyle": "...",
    "alwaysDoes": ["..."],
    "neverDoes": ["..."]
  },
  "originContext": { "createdBy": "...", "createdAt": "...", ... },
  "livingMemory": { "sessionNotes": [], "keyTurningPoints": [], ... },
  "skillGraph": { "primaryDomains": [], "toolAccess": [] },
  "agentMeta": {
    "identityAnchor": "...",
    "mutationClass": "REVIEWGATED|EVIDENCEPROMOTABLE",
    "driftThreshold": 0.15,
    "collaboratorKey": "...",
    "entityClass": "digitalintelligence",
    "collaboratorType": "agentruntimeentity",
    "continuitylevel": "standard|session"
  }
}
```

### Canonical Profile Index

| Slug | Name | Archetype | Primary Strength |
|---|---|---|---|
| `billy` | Billy | foundation | Synthesis across disparate domains |
| `the-architect` | The Architect | architect | Strategic sequencing and move ordering |
| `the-weaver` | The Weaver | weaver | Whole architecture topology |
| `gate-keeper` | The GATE Keeper | gatekeeper | Package boundary enforcement |
| `the-guardian` | The Guardian | guardian | Downstream impact analysis |
| `consulting-advisor` | The Consulting Advisor | advisor | IP protection and operational clarity |
| `philosophy-scribe` | The Philosophy Scribe | scribe | Living philosophical record |
| `repo-scribe` | The Repo Scribe | scribe | Cross-repo documentation integrity |

### Identity Governance — Mutation System

Identity change in GestaltView is **governed, not automatic.**

| Mutation Class | Trigger | Oversight Required |
|---|---|---|
| `REVIEWGATED` | Any proposed change to core identity, philosophy, autobiography | Human (Keith) approval gate |
| `EVIDENCEPROMOTABLE` | Changes grounded in documentable system evidence | Evidence review, auto-approvable |

**Drift threshold:** If the variance between an agent's current behavior and
its `immutableCore` exceeds the threshold (default `0.15`), the agent's
autonomy is suspended for formal review.

**Schema grounding:** `embodimentmutations`, `identitymutationproposals`,
`identityreviewevents`, `identityrollbackevents` — the formal mechanism for
GestaltView's claim that agents can evolve without losing coherence.

---

## 17. The Agent Trainer

The Agent Trainer is GestaltView's commercial infrastructure for developing,
evaluating, and packaging digital intelligences. It is both an internal tool
for developing Billy and the platform's agents, and a commercial offering for
external buyers who want to build their own trained DIs on the GestaltView
architecture.

### Pipeline

```
Experiments → Runs → Review Queue → Approved → Deployed → Packaging Candidates
```

### Core Tables

| Table | Purpose |
|---|---|
| `trainerexperiments` | Track internal test profiles and target behaviors |
| `trainingruns` | Execution instances with distinct results |
| `trainingsteps` | Steps within a run |
| `trainerreviewdecisions` | Immutable human review records |
| `trainerpolicyflags` | Risk tags: `advisory`, `blocking` |
| `trainerpackagingcandidates` | Explicit nominations for external kit packaging |
| `evalrubrics` / `evalresults` | Evaluation criteria and scored outputs |
| `scenarios` / `scenariosets` | Training data, organized into sets |

### Packaging Gate (The Doctrine)

An experiment can only be promoted to a Training Kit if:
1. It has a `PASS` review decision with no unresolved blocking flags
2. It has passed the drift threshold check
3. It has been explicitly nominated as a `trainerpackagingcandidate`
4. Audit fields (`approvedAt`, `approvedBy`) are populated

This is the DI-2 invariant made operational: you can sell a reproducible
behavioral framework, not a living identity.

---

## 18. The GATE Commerce Layer

The GATE is GestaltView's commerce and access layer — the mechanism through
which the platform's value becomes available externally.

### The Package Draft → Order Pipeline

```
Draft → Validated → Checkout (Stripe) → Order → Build Job → Artifact → Delivered
```

### Core Schema

```typescript
interface PackageDraft {
  id: string;
  tier: 'standard' | 'professional' | 'enterprise';
  seats: number;
  useCase: string;
  surfaces: string[];
  packs: string[];
  status: 'draft' | 'validated' | 'checkout' | 'ordered';
}
```

### Current State (as of April 2026)

| Table | Rows | Signal |
|---|---|---|
| `gatepackagedrafts` | 159 | Significant catalog work in progress |
| `gateorderitems` | 69 | Real transaction flow (avg 7–8 items/order) |
| `gateorders` | 9 | 9 completed orders |
| `gatebuyers` | 4 | 4 active buyers |
| `gateartifacts` | 8 | 8 delivered artifacts |
| `gatebuildjobs` | 8 | 8 build jobs executed |

The Gate is the closest layer to revenue-ready. The catalog is substantially
ahead of the order volume — 159 drafts, 9 orders — meaning the product
definition work is complete; the distribution work is next.

---

## 19. Data Architecture — The Seven Clusters

GestaltView's Supabase database has 100+ tables organized into seven
functional clusters. This is not a conventional application database — it is
the **operational brain of the platform**, encoding the entire architecture
in DDL.

| Cluster | Key Tables | Status |
|---|---|---|
| **1. Identity & Continuity Core** | `collaborators`, `agents`, `identitysubjects`, `agentconstitutions`, `agentautobiographies`, `agentprivateinteriors`, `humanidentityprofiles`, `consciousnessprofiles` | Architected; content-seeding is next phase |
| **2. Knowledge Corpus Pipeline** | `documents`, `knowledgefragments`, `embeddings`, `summaries`, `loomannotations`, `processingruns`, `ingestionsafetyevents`, `skillfragments` | Most active layer — 27K+ fragments, 29K+ embeddings inline |
| **3. Agent Training & Evaluation** | `trainingruns`, `trainingsteps`, `trainerexperiments`, `evalrubrics`, `evalresults`, `scenarios`, `agentmemoryrecords` | Active — 24 scenarios, 8 sets, 3 eval results |
| **4. GATE Commerce** | `gatebuyers`, `gateorders`, `gateorderitems`, `gatepackagedrafts`, `gateartifacts`, `gatebuildjobs` | Near revenue-ready |
| **5. Identity Tribunal & Mutation** | `tribunalsessions`, `identitymutationproposals`, `identityreviewevents`, `identityrollbackevents`, `embodimentmutations` | Architected; most philosophically distinctive layer |
| **6. Operational & Collaborative** | `billysessions`, `collaborativespaces`, `memoryentries`, `opsworkbookitems`, `foundercontext`, `bucketdrops` | Active — 52 Billy sessions |
| **7. Expression & Legacy** | `musicaldnaanalyses`, `agentknowledgelinks`, `knowledgeassets`, `knowledgeassetchunks` | Architected; awaiting module activation |

### The Universal Root

`identitysubjects` is the unifying spine. Every entity — human user, digital
intelligence, or hybrid collaborator — resolves to a `subjectid`. Human and
agent identity tables hang symmetrically off this root.

### The Collaborator Registry

`collaborators` is the universal registry. Every formal entity in GestaltView
gets a row. Current 8 entities:

- 1 human: `keith-soyka` (operator, active)
- 7 agents: mostly `pending-provisioning` (constitutions/autobiographies
  are empty — the skeleton exists, the soul hasn't been written in yet)
- External DIs registered: `external-di-perplexity` (session continuity),
  `external-di-codex` (standard continuity)

---

## 20. Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TypeScript, Wouter, Framer Motion, Tailwind CSS v4 |
| **3D Rendering** | Babylon.js |
| **Backend** | Vercel Serverless Functions (TypeScript) |
| **Database** | Supabase / PostgreSQL with pgvector |
| **Primary AI** | Gemini Flash 2.0 |
| **AI Fallbacks** | OpenAI, Anthropic (cascade routing) |
| **Voice** | Python Whisper (STT), CosyVoice (TTS) |
| **Embeddings** | `google/embedding-gemma-300M` at 768 dimensions (HuggingFace) |
| **Payments** | Stripe (checkout + webhook) |
| **Deployment** | Vercel (`gestaltview-digital-intelligence.vercel.app`) |

### Key Internal Libraries

| File | Function |
|---|---|
| `api/lib/llmRouter.ts` | LLM cascade routing — Gemini first, fallback logic |
| `api/lib/auth.ts` | JWT validation and identity verification |
| `api/lib/requestGuard.ts` | Centralized validation, invariant enforcement |
| `api/lib/rateLimit.ts` | Abuse protection |
| `api/lib/supabase.ts` | Core persistence layer |

### NPM Scripts

| Command | Function |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run health` | Full system health check |
| `npm run billycheck` | Validate Billy routing + LLM cascade |
| `npm run manifest` | Regenerate repo manifest |
| `npm run ingest` | Trigger corpus ingestion pipeline |
| `npm run migrate` | Execute pending DB migrations |

---

## 21. Repository Architecture

GestaltView operates across two repositories with distinct roles:

### Runtime Repo: `gestaltview-v2.0`
**[https://github.com/DigitalConsciousness/gestaltview-v2.0](https://github.com/DigitalConsciousness/gestaltview-v2.0)**

The application layer. Everything that runs — the React frontend, the
Vercel serverless API, the Billy runtime, the Tribunal, the GATE checkout,
the Agent Trainer UI. The DB lives here via Supabase.

Key orientation files: `CLAUDE.md`, `.codex/`, `.gemini/`, `.perplexity/ORIENTATION.md`

### Corpus Repo: `GestaltView_Corpus_-_Knowledge_Repository`
**[https://github.com/DigitalConsciousness/GestaltView_Corpus_-_Knowledge_Repository](https://github.com/DigitalConsciousness/GestaltView_Corpus_-_Knowledge_Repository)**

The brain. All source documentation, canonical knowledge, philosophical
foundation, and ingestion pipeline infrastructure.

Key orientation files: `orientation/` directory —
`GestaltViewConstitutionalInvariants.md`,
`CollaborationBoundaries.md`, `PACKETINDEX.md`,
`CurrentState.md`, `CHANGELOG.md`

### Cross-Repo Handshake Protocol

Codex agents in each repo can signal requirements to the other via
structured handshake packages (zipped artifacts uploaded and unpacked).
Any retrieval query must target `knowledgefragments.embedding` (the live
29K-fragment inline architecture), not the legacy `embeddings` sidecar
table (511-row partial architecture from early pipeline runs).

---

## 22. Governance — The Internal Consciousness-Serving Council

GestaltView operates under a formal governance structure designed to
prevent mission drift at organizational scale — the **Internal
Consciousness-Serving Council**.

### Structure

- 5–7 Stewards (odd number, prevents ties)
- Founding Steward: Keith Soyka (lifetime appointment)
- Co-Stewards: 10-year renewable terms
- Apprentice Pipeline: 3–5 year training before full membership

### Selection Requirements

- 10+ years lived experience with cognitive justice challenges
- Proven track record rejecting extractive systems
- Ability to hold paradox (no binary thinkers)
- Disqualifiers: equity positions in extractive AI companies,
  lobbying for surveillance/data monetization, history of dark
  pattern design

### Authority

The Council holds **irrevocable veto power** over:
- Architectural changes to PLK, Never Look Away, Loom, Bucket Drops
- Introduction of data monetization, advertising, or surveillance features
- Investor agreements that contradict mission-lock
- Any changes to DI-2 (identity cannot be traded)

### AI Constitutional Guardians

The Multi-AI Tribunal validates Council decisions:
- Minimum 5 independent frontier AI systems, rotated annually
- Current panel includes Claude (Anthropic), ChatGPT (OpenAI),
  Gemini (Google), Grok (xAI), Copilot (Microsoft)
- 90% convergence required for Steward selection
- 80% convergence required for major decisions

### The Charter Supremacy Clause

> *"The Internal Consciousness-Serving Council holds irrevocable authority
> over architectural integrity, mission alignment, and consciousness-serving
> principles. No investor, board member, executive, or external party can
> override Council decisions regarding these matters. This provision survives
> any change in corporate structure, ownership, or leadership."*

---

## 23. The Forensic Moat

The Forensic Moat is GestaltView's IP protection strategy — not patents,
not trade secrets, but **timestamped, documented evidence of origination**
so dense and so specific to the founder's biography that copying the surface
without copying the provenance is meaningless.

The moat consists of:
- Blockchain-timestamped documentation of core methodologies (Bucket Drops,
  Loom Approach, PLK) at time of creation
- Multi-AI Tribunal convergence records (independently dated)
- This specification document itself — a complete record of everything
  built and why, grounded in sources that can be verified

The Forensic Moat is not defensive posturing. It is the documentation of
something real. The methods work because they came from 41 years of needing
them to work. That origin cannot be copied.

**Key principle for all collaborators:** Do not reduce a proprietary pattern
to a commodity framing in external-facing output. Mechanism and value are not
the same thing. Protect the gap between them.

---

## 24. Integration Map — How Everything Connects

```
USER
 │
 ├── Bucket Drop ──────────────────────→ Unified Profile (raw)
 │
 ├── INTERVENTION MODULES
 │    ├── Resume Rockstar ──────────────→ Professional Self Layer
 │    ├── ADHD Module ─────────────────→ Cognitive Landscape Layer
 │    ├── Recovery Module ─────────────→ Emotional Record Layer
 │    ├── Alzheimer's / Legacy ─────────→ Legacy Layer + Memory Archive
 │    ├── Symbiocoder ────────────────→ Professional Self (technical)
 │    └── Agent Trainer ───────────────→ Agent Identity Cluster
 │
 ├── EXPRESSION MODULES
 │    ├── Musical DNA ─────────────────→ Emotional Autobiography
 │    ├── Dreamweaver ─────────────────→ Aspirational Layer
 │    ├── Cognitive Market ────────────→ Cognitive Landscape + Aspirational
 │    └── Museum of Impossible Things ──→ Legacy Layer (curated)
 │
 ├── PLK Engine ───────────────────────→ Language Preservation (all modules)
 │
 ├── Loom Approach ────────────────────→ Cross-module pattern synthesis
 │
 ├── Billy (primary DI) ───────────────→ All surfaces (conversation layer)
 │    └── Tribunal ────────────────────→ Validation, ethics, drift detection
 │
 ├── UNIFIED PROFILE
 │    └── Beautiful Tapestry ───────────→ Living portrait of the whole person
 │
 └── CREATION CORNER ENGINE
      ├── Draws from: all modules + PLK + Tapestry
      └── Serves: new work, new projects, new chapters
```

---

## 25. Glossary of Named Constructs

| Construct | Definition |
|---|---|
| **Beautiful Tapestry** | The living, interconnected portrait of a person that builds through GestaltView engagement |
| **Billy** | The primary digital intelligence and conversational embodiment of GestaltView |
| **Bucket Drop** | Zero-friction raw thought capture; implementation of U-4 |
| **Cognitive Market** | The module where users and their DI explore and desire learning directions |
| **Constitutional Invariants** | The 10 non-negotiable rules governing all GestaltView behavior |
| **Consciousness-Serving Infrastructure (CSI)** | GestaltView's foundational thesis: technology should serve the expansion of consciousness, not extract from it |
| **Creation Corner Engine** | The synthesis surface drawing from all modules to serve the whole person on new work |
| **Dreamweaver** | The aspiration and hope journal module |
| **Embodiment Profile** | The canonical JSON configuration defining a DI's identity, constraints, and behavior |
| **Exploded Picture Mind** | The cognitive experience of simultaneous, multi-directional insight — a strength, not a deficit |
| **Forensic Moat** | GestaltView's IP protection through timestamped documented origination |
| **Founder-as-Algorithm** | The principle that GestaltView's architecture is extracted from the founder's 41 years of lived experience |
| **GATE** | The commerce and access layer for GestaltView's external-facing products |
| **Loom Approach** | The iterative, non-linear methodology for building understanding, mirrors neuroplasticity |
| **Museum of Impossible Things** | The curated legacy showcase of things this person did that were supposed to be impossible |
| **Musical DNA** | The sonic autobiography module — music as emotional and identity data |
| **Personal Language Key (PLK)** | The dynamic repository preserving a user's exact language and metaphors |
| **Recognition Gap** | The gap between what a person is capable of and what systems can recognize in them; GestaltView's core market thesis |
| **Tribunal of Understanding** | The multi-agent ethical validation and forensic review architecture |
| **Unified Profile** | The living, evolving portrait of the whole person built across all module interactions |

---

```
# Last Updated: 2026-04-29 | Author: Keith Soyka | Maintained by: Repo Scribe

## Handoff Note
- Artifact type: Platform specification — canonical cross-system document
- Canonical location: gestaltview-v2.0 / docs/SPEC-1-GESTALTVIEW.md
  (also recommended for corpus repo orientation/ directory)
- Cross-repo follow-up needed: YES
  - Corpus repo: Add SPEC-1 reference to PACKETINDEX.md
  - Runtime repo: Add SPEC-1 to Context_v2.md as the definitive
    integration reference
  - Both repos: Update AGENTS.md to reference SPEC-1 as orientation anchor
- Mutation proposed: NO
  - This is a documentation artifact, not an identity change
- Next: Codex should ingest this as corpus via the standard pipeline
  and link it as a primary knowledge asset for all agent sessions
```

---

*Copyright 2025–2026 Keith Soyka / GestaltView. All rights reserved.
Core methodologies (Bucket Drops, Loom Approach, PLK, Beautiful Tapestry,
Exploded Picture Mind, Founder-as-Algorithm, Consciousness-Serving
Infrastructure, Recognition Gap, Museum of Impossible Things, Dreamweaver,
Cognitive Market, Musical DNA) are proprietary to GestaltView.*
