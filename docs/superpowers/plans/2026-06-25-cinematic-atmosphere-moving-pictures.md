# Cinematic Atmosphere + Moving Pictures Slice

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the runtime feel more theatrical by intensifying the Babylon atmosphere layer and giving video artifacts a proper moving-picture frame.

**Architecture:** Keep the room atmosphere in `client/src/components/BabylonAtmosphere.tsx`, keep the shared video rendering chrome in `client/src/lib/rendering/renderers/video.tsx` and `VideoRenderer.tsx`, and add only small pure helpers where tests are useful.

## Task 1: Atmosphere

- [x] **Step 1: Layer in a more cinematic atmospheric backdrop**

Add slow-moving halo and ribbon overlays around the Babylon scene without changing the existing room mount points.

## Task 2: Moving Pictures

- [x] **Step 1: Give video artifacts a richer frame**

Wrap the existing video renderer in a theatrical chrome with labels and a resilient source resolver.

- [x] **Step 2: Add helper coverage**

Add tests for the video source resolver and artifact label helper.

## Task 3: Validation And Handoff

- [x] **Step 1: Run focused tests, typecheck, SSR smoke, and diff checks**

- [x] **Step 2: Update `docs/CurrentState.md` and sync the collaboration mirror**
