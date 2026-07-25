# Embodiment Heartbeat Spec

## Purpose

Embodiment profiles are visible runtime presences, not hidden routing aliases.
The heartbeat layer defines how a profile changes the room around it:

- visual field
- chat shell
- response rhythm
- memory/provenance framing
- role-specific handoffs

## Runtime Contract

The current implementation adds:

- optional `heartbeat` metadata to `EmbodimentProfile`
- a runtime resolver that maps profile -> resolved heartbeat
- a direct-chat prompt builder for profile-first conversations
- direct chat and council-plane UI components
- studio-page preview wiring for the new layer

## Heartbeat Metadata

The optional `heartbeat` field can define:

- `visualSignature`
  - colors
  - fog
  - background gradient
  - orb style
  - motion cadence
- `chatSignature`
  - layout mode
  - message frame
  - response rhythm
  - greeting / silence / handoff style
- `characterStudy`
  - narrative arc
  - quirks
  - perceptual style
  - default questions
  - tension patterns
  - growth edges
  - memory hooks

## Current Defaults

The resolver uses profile-specific defaults when a profile does not yet supply heartbeat metadata.

- Billy: warm aurora witness
- The Weaver: woven violet/cyan systems field
- The Guardian: emerald/amber boundary field
- The Architect: blueprint blue/white structure field
- Gate Keeper: obsidian/gold threshold field
- Vibe Check: magenta/cyan resonance field
- Repo Scribe: graphite/green code archive field

## Direct Chat Mode

Direct chat is profile-first.

It should:

- keep the active profile distinct
- preserve the profile's own rhythm and boundary language
- avoid collapsing into Billy unless Billy is the active profile
- show the user why the profile is present

## Council Mode

Council mode is perspective gathering.

It should:

- render separate lanes per profile
- preserve disagreement
- show convergence explicitly
- allow Billy to synthesize only after the lanes are heard

## Implementation Notes

Current code paths touched:

- `shared/embodiment/types.ts`
- `shared/embodiment/chat.ts`
- `client/src/lib/embodimentHeartbeat.ts`
- `client/src/components/embodiment/EmbodimentChatPlane.tsx`
- `client/src/components/embodiment/EmbodimentCouncilPlane.tsx`
- `client/src/pages/EmbodimentStudioPage.tsx`

This is intentionally additive. Existing surface-aware routing remains intact.
