# Multimodal Artifact Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route artifact preview cards through the shared rendering engine so markdown, mind maps, diagrams, image, audio, video, PDF, HTML, code, and text can live in one coherent artifact card.

**Architecture:** Add pure classification helpers under `client/src/lib/rendering/multimodal/`, then update `ArtifactPreview.tsx` to render a shared `RenderingEngine` surface plus companion summary/transcript panels. Preserve existing attachment open/download actions and do not import from `refactor/`.

**Tech Stack:** React 19, GestaltView rendering registry, Vitest, TypeScript.

---

### Task 1: Multimodal View Model

**Files:**
- Create: `client/src/lib/rendering/multimodal/artifactCardModel.ts`
- Test: `client/src/tests/multimodal-artifact-card.test.ts`

- [x] **Step 1: Write failing tests**
- [x] **Step 2: Implement classification helper**
- [x] **Step 3: Run helper tests**

### Task 2: Artifact Preview Integration

**Files:**
- Modify: `client/src/components/ArtifactPreview.tsx`

- [x] **Step 1: Route primary content through `RenderingEngine`**
- [x] **Step 2: Add companion summary/transcript panels**

### Task 3: Validation and Handoff

**Files:**
- Modify: `docs/CurrentState.md`

- [x] **Step 1: Run tests, typecheck, SSR smoke, and diff checks**
- [x] **Step 2: Sync CurrentState mirror**
