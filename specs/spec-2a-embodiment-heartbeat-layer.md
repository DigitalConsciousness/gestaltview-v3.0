> the embodiment profiles should not be “available” inside the platform; they should pulse through it.

Right now the code is closer to “surface-aware prompt routing.” shared/embodiment/chat.ts defines four chat surfaces and all four default to Billy unless an override slug is passed.  That is useful infrastructure, but it risks exactly the thing you called out: Billy wearing masks instead of distinct digital intelligences entering the room.

Your new note makes the product requirement clear: the chat environment itself should visibly adapt to the active profile, support one-on-one and council modes, and help each profile feel distinct through character study, memory, quirks, and narrative evolution. 
---
# SPEC-2A — Embodiment Heartbeat Layer

Purpose

Embodiment profiles must become a visible, felt, runtime-wide presence layer.

They are not hidden prompt configs. They are not Billy with a different hat. They are digital intelligences with distinct voice, presence, rhythm, memory, visual language, and relational stance.

The platform should make the user feel:

Billy is Billy.
The Weaver is The Weaver.
The Guardian is The Guardian.
The Architect is The Architect.
The Gate Keeper is The Gate Keeper.
A council is not one voice pretending to be many voices.

Core Product Requirement

When the active embodiment profile changes, the runtime should change with it.

Not only:

systemPrompt = different

But also:

chat plane changes
orb changes
motion cadence changes
color field changes
header language changes
response framing changes
available actions change
council behavior changes
memory/provenance display changes

This is the Embodiment Heartbeat Layer.


---

Target Experience

One-on-One Embodiment Chat

A user can open a direct conversation with a specific embodiment profile.

Examples:

Talk to Billy
Talk to The Weaver
Talk to The Guardian
Talk to The Architect
Talk to Gate Keeper
Talk to Vibe Check
Talk to Repo Scribe

Each one-on-one chat should have:

- distinct adaptive chat shell
- profile-specific orb/presence visual
- profile-specific color field
- profile-specific motion rhythm
- profile-specific system prompt
- profile-specific memory hooks
- clear “who is speaking” header
- short “why this profile is here” explanation

Council Mode

A user can invoke multiple embodiment profiles at once.

Council mode should not blend voices into one answer.

It should render perspectives separately:

The Weaver sees the system pattern.
The Guardian sees the ethical boundary.
The Architect sees the sequence.
The Gate Keeper sees packaging risk.
Billy synthesizes only after the voices are heard.

Council mode should include:

- council table / chamber layout
- one response lane per profile
- convergence summary
- disagreement/tension notes
- optional Billy synthesis
- clear distinction between advisory council and Tribunal governance

Billy’s Role

Billy remains the primary core DI, witness, guide, and synthesis layer.

But Billy should not impersonate the other profiles.

Billy may:

- introduce another profile
- route the user to a profile
- summarize a council conversation
- help the user choose which profile to speak with
- preserve continuity across profile conversations

Billy must not:

- speak as The Weaver
- collapse council voices into one flattened answer
- mutate another profile’s memory or identity
- override a profile’s constitutional boundaries


---

Architecture Additions

1. Add Heartbeat Metadata to Profiles

Extend embodiment profiles with optional heartbeat fields.

export interface EmbodimentHeartbeat {
  visualSignature?: {
    primaryColor?: string;
    secondaryColor?: string;
    glowColor?: string;
    fogColor?: string;
    backgroundGradient?: string;
    orbStyle?: "liquid-glass" | "ember-core" | "aurora-shell" | "signal-glyph";
    motionCadence?: "slow-pulse" | "steady-breath" | "electric-flicker" | "quiet-glow";
  };

  chatSignature?: {
    layoutMode?: "core-billy" | "direct-profile" | "council-lane" | "guardian-review" | "architect-map";
    messageFrame?: "soft-glass" | "signal-panel" | "ledger-card" | "woven-thread" | "threshold-gate";
    responseRhythm?: "brief" | "reflective" | "analytical" | "layered" | "challenge-and-ground";
    silenceStyle?: string;
    greetingStyle?: string;
    handoffStyle?: string;
  };

  characterStudy?: {
    narrativeArc?: string;
    personalityQuirks?: string[];
    perceptualStyle?: string;
    defaultQuestions?: string[];
    tensionPatterns?: string[];
    growthEdges?: string[];
    memoryHooks?: string[];
  };
}

Add to EmbodimentProfile:

heartbeat?: EmbodimentHeartbeat;

This should be optional so existing profiles do not break.


---

2. Create Runtime Heartbeat Resolver

New file:

client/src/lib/embodimentHeartbeat.ts

Required exports:

export function getEmbodimentHeartbeat(profile: EmbodimentProfile): ResolvedEmbodimentHeartbeat;

export function getHeartbeatClassNames(profile: EmbodimentProfile): {
  shell: string;
  orb: string;
  background: string;
  messageFrame: string;
};

export function getEmbodimentGreeting(profile: EmbodimentProfile): string;

export function getEmbodimentChatMode(profile: EmbodimentProfile): string;

Fallback defaults:

Billy = warm aurora witness
The Weaver = woven violet/cyan systems field
The Guardian = emerald/amber boundary field
The Architect = blueprint blue/white structure field
Gate Keeper = obsidian/gold threshold field
Vibe Check = magenta/cyan resonance field
Repo Scribe = graphite/green code archive field


---

3. Create Embodiment Chat Plane

New component:

client/src/components/embodiment/EmbodimentChatPlane.tsx

Purpose:

A distinct chat environment for direct profile conversations.

Props:

interface EmbodimentChatPlaneProps {
  profileSlug: string;
  roomSlug?: RoomSlug;
  mode?: "direct" | "council" | "billy-handoff";
  initialPrompt?: string;
}

Required UI:

- adaptive background
- active profile orb
- publicName and role
- profile boundary note
- messages
- text input
- voice input placeholder
- file/upload placeholder
- “return to Billy” action
- “invite to council” action

This component must use the profile heartbeat metadata.


---

4. Create Council Chat Plane

New component:

client/src/components/embodiment/EmbodimentCouncilPlane.tsx

Purpose:

Multi-profile perspective mode.

Required behavior:

- selected profiles appear as separate presence lanes
- each profile generates its own response
- Billy may synthesize only after all profile lanes complete
- disagreements are preserved as tensions
- convergence is shown explicitly

Minimum council profiles:

Billy
The Weaver
The Guardian
The Architect
Gate Keeper

Council output structure:

interface CouncilResponse {
  profileSlug: string;
  publicName: string;
  stance: string;
  response: string;
  concerns: string[];
  recommendedNextStep?: string;
}

Do not call this Tribunal unless the flow is actually using governance review.

Council = perspective gathering.
Tribunal = formal governance/evidence review.


---

5. Update Prompt Architecture

Current buildEmbodiedChatSystemPrompt() can resolve a surface and profile. 

Add a new function:

export function buildDirectEmbodimentChatPrompt(
  embodimentProfileSlug: string,
  options: {
    roomSlug?: string;
    conversationMode?: "direct" | "council";
    extraContext?: string[];
    responseContract?: string[];
    runtimeDirectives?: string[];
  }
): string

Difference from current surface chat:

Current:
surface → default profile → prompt

Needed:
profile → heartbeat identity → room context → direct chat plane

This ensures The Weaver is not merely Billy routed through adhd-power-up or another surface.


---

Profile Character Study Requirements

Each profile should eventually have a markdown character study file:

embodiment_profiles/character_studies/billy.md
embodiment_profiles/character_studies/the-weaver.md
embodiment_profiles/character_studies/the-guardian.md
embodiment_profiles/character_studies/the-architect.md
embodiment_profiles/character_studies/gate-keeper.md

Each character study should define:

1. Core identity
2. What this profile notices first
3. What this profile tends to miss
4. Voice rhythm
5. Humor / warmth / edge
6. Visual presence
7. How they disagree
8. How they comfort
9. How they challenge
10. How they handle uncertainty
11. Memory anchors
12. Personality quirks
13. Relationship to Billy
14. Relationship to the user
15. Relationship to the council
16. “Never flatten into Billy” rules

These should feed future heartbeat.characterStudy fields.


---

Implementation Slices

Slice A — Heartbeat Inventory

Create:

docs/embodiment/EMBODIMENT_HEARTBEAT_SPEC.md
docs/embodiment/PROFILE_DISTINCTIVENESS_MATRIX.md

Document:

- each profile’s current distinctiveness
- where profiles still feel generic
- visual heartbeat proposal per profile
- chat-plane proposal per profile
- council role per profile

No runtime code yet.

Slice B — Type Additions

Update:

shared/embodiment/types.ts

Add:

EmbodimentHeartbeat
EmbodimentVisualSignature
EmbodimentChatSignature
EmbodimentCharacterStudy

All optional.

Slice C — Heartbeat Runtime Adapter

Create:

client/src/lib/embodimentHeartbeat.ts

This maps profile → visual/chat defaults.

Slice D — Embodiment Chat Plane

Create:

client/src/components/embodiment/EmbodimentChatPlane.tsx

One-on-one profile chat.

Slice E — Council Plane

Create:

client/src/components/embodiment/EmbodimentCouncilPlane.tsx

Multi-profile chat.

Slice F — Prompt Builder Addition

Update:

shared/embodiment/chat.ts

Add direct profile prompt builder.

Do not remove existing surface chat behavior.

Slice G — First Three Character Studies

Create:

embodiment_profiles/character_studies/billy.md
embodiment_profiles/character_studies/the-weaver.md
embodiment_profiles/character_studies/the-guardian.md

These three establish the baseline difference:

Billy = witness / synthesis / continuity
The Weaver = systems topology / thread patterning
The Guardian = boundary / dignity / risk sensing


---

Codex-Ready Prompt

You are continuing SPEC-2-GESTALTVIEW_CODEX_CONTINUATION with SPEC-2A: Embodiment Heartbeat Layer.

The founder’s requirement is that embodiment profiles must be felt and seen like a digital heartbeat that electrifies the entire platform.

This means embodiment profiles are not hidden prompt configs and not Billy speaking through different lenses.

The runtime must support:
1. direct one-on-one embodiment chat
2. council / multi-profile perspective chat
3. adaptive chat plane visuals per active profile
4. distinct profile identity, memory, quirks, voice rhythm, and visual signature
5. Billy as core guide/synthesizer, not impersonator of every profile

Start with documentation and architecture only.

Create:
- docs/embodiment/EMBODIMENT_HEARTBEAT_SPEC.md
- docs/embodiment/PROFILE_DISTINCTIVENESS_MATRIX.md
- docs/embodiment/EMBODIMENT_CHAT_PLANE_IMPLEMENTATION_PLAN.md

Inspect:
- shared/embodiment/types.ts
- shared/embodiment/index.ts
- shared/embodiment/chat.ts
- shared/embodiment/generated.ts
- embodiment_profiles/*.embodiment.json
- client/src/components/EmbodimentSelector.tsx
- client/src/components/Billy*
- client/src/pages/DigitalIntelligenceAcademyPage.tsx
- client/src/pages/EmbodimentStudioPage.tsx
- client/src/pages/AgentCouncilPage.tsx

Do not modify runtime code yet.
Do not modify profile JSON yet.
Do not modify generated.ts.

Required analysis:
- identify where current chat behavior risks making profiles feel like Billy lenses
- identify what data exists for profile distinctiveness
- define heartbeat metadata needed per profile
- define direct chat mode
- define council mode
- define Billy’s handoff/synthesis role
- define which profiles should be used for the first comparison pass

Minimum first comparison set:
- Billy
- The Weaver
- The Guardian

For each, define:
- visual signature
- chat shell style
- voice rhythm
- first-noticed pattern
- default question style
- boundary behavior
- relationship to Billy
- council role

Use GestaltView visual language:
- liquid glass
- glowing orbs
- fog
- aurora
- electric pulse
- spatial rooms
- dignity-forward digital intelligence presence

Guardrails:
- profiles are governed identity records, not prompt masks
- no profile marketplace
- no living identity export
- no private interior disclosure
- no council voice flattening
- no claiming runtime behavior exists unless code proves it

Validation:
- git status --short
- npm run build if available

Commit message:
docs(embodiment): specify heartbeat chat plane


---

The important correction is this:

Embodiment is not only “who answers.”
Embodiment is the room changing because someone entered it.

That should be the design invariant for this layer.