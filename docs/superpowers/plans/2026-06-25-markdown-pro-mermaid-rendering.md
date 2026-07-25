# Markdown Pro Mermaid Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade GestaltView markdown artifacts into polished document surfaces with safe Mermaid diagram blocks.

**Architecture:** Keep parsing and classification in pure helpers under `client/src/lib/rendering/markdown/`, render Mermaid through a browser-only component under `client/src/lib/rendering/diagram/`, and have both markdown renderer entrypoints delegate to the same enhanced renderer components. The renderer must not import from `refactor/`; those libraries remain source material only.

**Tech Stack:** React 19, `react-markdown`, `remark-gfm`, browser-loaded Mermaid CDN fallback, Vitest, TypeScript.

---

### Task 1: Markdown Analysis Helpers

**Files:**
- Create: `client/src/lib/rendering/markdown/analyzeMarkdown.ts`
- Test: `client/src/tests/markdown-pro-rendering.test.ts`

- [x] **Step 1: Write failing tests**

```ts
expect(analyzeMarkdown(source).diagramBlocks).toEqual([{ language: "mermaid", code: "graph TD\\nA-->B" }]);
expect(getMarkdownCodeKind("mermaid")).toBe("diagram");
expect(getMarkdownCodeKind("tsx")).toBe("code");
expect(getMarkdownCalloutKind("> [!NOTE] Keep this")).toBe("note");
```

- [x] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run client/src/tests/markdown-pro-rendering.test.ts`
Expected: FAIL because `analyzeMarkdown.ts` does not exist.

- [x] **Step 3: Implement pure helpers**

Create a helper that extracts fenced code blocks, recognizes `mermaid`, `mindmap`, `flowchart`, `sequenceDiagram`, `graph`, and `journey` as diagram signals, and classifies Obsidian/GitHub-style callouts.

- [x] **Step 4: Run helper tests**

Run: `./node_modules/.bin/vitest run client/src/tests/markdown-pro-rendering.test.ts`
Expected: PASS.

### Task 2: Mermaid Renderer Component

**Files:**
- Create: `client/src/lib/rendering/diagram/MermaidDiagram.tsx`
- Create: `client/src/lib/rendering/diagram/mermaidLoader.ts`
- Modify: `client/src/lib/rendering/markdown/MarkdownCodeBlock.tsx`

- [x] **Step 1: Add browser-only Mermaid loader**

Load `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js` only in browsers, initialize with strict security, and fall back to source display if loading or rendering fails.

- [x] **Step 2: Add MermaidDiagram component**

Render an SVG into an isolated container, with copyable source fallback and stable status states.

### Task 3: Enhanced Markdown Renderer

**Files:**
- Create: `client/src/lib/rendering/markdown/EnhancedMarkdownRenderer.tsx`
- Create: `client/src/lib/rendering/markdown/MarkdownCodeBlock.tsx`
- Modify: `client/src/lib/rendering/renderers/markdown.tsx`
- Modify: `client/src/lib/rendering/renderers/MarkdownRenderer.tsx`

- [x] **Step 1: Replace raw ReactMarkdown output with styled components**

Add custom heading anchors, paragraphs, lists, tables, links, blockquotes/callouts, inline code, code blocks, and Mermaid delegation.

- [x] **Step 2: Wire both renderer entrypoints**

Keep the canonical registry import path stable while making legacy and current renderers share the enhanced implementation.

### Task 4: Validation and Handoff

**Files:**
- Modify: `docs/CurrentState.md`

- [x] **Step 1: Run focused tests and typecheck**

Run:
`./node_modules/.bin/vitest run client/src/tests/markdown-pro-rendering.test.ts client/src/tests/rendering-contract.test.ts`
`./node_modules/.bin/tsc --noEmit --pretty false`
`git diff --check`

- [x] **Step 2: Sync CurrentState mirror**

Run:
`npm run sync:perplexity`
`npm run sync:perplexity:check`
