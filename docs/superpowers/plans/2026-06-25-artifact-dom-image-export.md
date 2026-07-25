# Artifact DOM Image Export Slice

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-native DOM capture path so fully rendered artifact preview cards can be saved as PNG images without leaving the live rendering runtime or depending on `refactor/` at runtime.

**Architecture:** Put capture helpers under `client/src/lib/rendering/capture/`, keep the pure filename/SVG helpers testable in Node, and expose the browser-only capture action from `ArtifactPreview` with SSR-safe guards.

## Task 1: Capture Utility

- [x] **Step 1: Add pure helper tests**

Create `client/src/tests/dom-capture-export.test.ts` for filename normalization and SVG foreignObject wrapping.

- [x] **Step 2: Implement DOM capture helper**

Create `client/src/lib/rendering/capture/domCapture.ts` with `sanitizeCaptureFileName()`, `buildForeignObjectSvg()`, `captureDomNodeAsPng()`, and `downloadCapturedDomNode()`.

## Task 2: Preview Integration

- [x] **Step 1: Add `Save image` action to artifact previews**

Attach a ref to the artifact card and call `downloadCapturedDomNode()` from a browser-only click handler.

- [x] **Step 2: Keep capture controls out of the captured image**

Mark export/open/download controls with `data-capture-exclude="true"` so the saved card focuses on the rendered artifact.

## Task 3: Validation And Handoff

- [x] **Step 1: Run focused tests, typecheck, SSR smoke, and diff checks**

- [x] **Step 2: Update `docs/CurrentState.md` and sync the collaboration mirror**
