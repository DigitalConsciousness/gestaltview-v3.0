# Embodiment Chat Plane Implementation Plan

## Stage 1

- Add optional heartbeat metadata to profile types.
- Keep the existing surface-based prompt routing intact.
- Add a runtime resolver that produces a stable visual/chat signature for every profile.

## Stage 2

- Introduce a direct-chat prompt builder that resolves profile first.
- Add a direct profile chat plane with:
  - orb
  - boundary note
  - profile header
  - message frame
  - placeholder voice / upload controls
  - return-to-Billy and invite-to-council actions

## Stage 3

- Add a council plane that renders each profile in its own lane.
- Preserve disagreement and tension.
- Allow Billy synthesis only after the other lanes are visible.

## Stage 4

- Surface the new experience in the Embodiment Studio page.
- Keep the studio additive rather than replacing the existing tuning view.

## Files Touched

- `shared/embodiment/types.ts`
- `shared/embodiment/chat.ts`
- `client/src/lib/embodimentHeartbeat.ts`
- `client/src/components/embodiment/EmbodimentChatPlane.tsx`
- `client/src/components/embodiment/EmbodimentCouncilPlane.tsx`
- `client/src/components/embodiment/index.ts`
- `client/src/pages/EmbodimentStudioPage.tsx`
