# Pending Animation Upgrade

## Problem

Pending messages/orbs are too quiet. They read like passive loading indicators instead of living captures waiting to route.

## Required feel

A pending item should feel electrically alive but not chaotic:

- orbiting ember/fog ring
- pulsing edge with depth
- small movement in text baseline or glow
- visible route tags: Inner World / Scaffold / Creation Corner
- status chip: queued, rendering, needs decision, failed, ready

## Component target

Create or upgrade:

```text
client/src/components/runtime/PendingArtifactRail.tsx
client/src/components/runtime/PendingArtifactCard.tsx
```

## No silent pending

Every pending item must expose:

- status
- last attempted action
- retry if failed
- open raw source
- send onward
