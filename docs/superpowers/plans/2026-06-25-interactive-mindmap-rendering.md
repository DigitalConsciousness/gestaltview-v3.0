# Interactive Mind Map Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static mind-map fallback previews with an interactive SVG/React mind map that parses markdown outlines into expandable graph nodes.

**Architecture:** Keep parsing and layout in pure helpers under `client/src/lib/rendering/mindmap/`, render the interactive canvas in a focused React component, and have `MindMapRenderer.tsx` route HTML documents to the existing HTML5 renderer while markdown/plain text uses the new runtime component. No `refactor/` imports.

**Tech Stack:** React 19, local SVG graph rendering, Vitest, TypeScript.

---

### Task 1: Outline Parser and Layout

**Files:**
- Create: `client/src/lib/rendering/mindmap/mindMapModel.ts`
- Test: `client/src/tests/mindmap-interactive-rendering.test.ts`

- [x] **Step 1: Write failing tests**
- [x] **Step 2: Implement parser and deterministic layout**
- [x] **Step 3: Run parser tests**

### Task 2: Interactive Renderer Component

**Files:**
- Create: `client/src/lib/rendering/mindmap/InteractiveMindMap.tsx`
- Modify: `client/src/lib/rendering/renderers/MindMapRenderer.tsx`

- [x] **Step 1: Add local SVG graph with focus and expand/collapse state**
- [x] **Step 2: Route markdown/plain text through the interactive renderer**

### Task 3: Validation and Handoff

**Files:**
- Modify: `docs/CurrentState.md`

- [x] **Step 1: Run tests, typecheck, and diff checks**
- [x] **Step 2: Sync CurrentState mirror**
