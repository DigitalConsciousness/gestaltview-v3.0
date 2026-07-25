# Tribunal Roundtable Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the multi-voice room to Tribunal everywhere visible, make `/tribunal` the canonical route, keep `/agent-council` as an alias, and add the new roundtable interaction shell with creation actions.

**Architecture:** Keep the existing `AgentCouncilPage.tsx` as the working implementation surface, but evolve it into a Tribunal page with a third mode (`roundtable`), a left voice sidebar, a full-height feed, and message-level creation affordances. Use tiny shared helper components for mention parsing, sidebar rendering, and creation actions so the page stays readable. Preserve the current local-storage history and persona routing contracts while expanding the UI and mode model.

**Tech Stack:** React, Wouter, TypeScript, shared GestaltView embodiment/runtime helpers, localStorage, clipboard API, existing Billy API routing.

---

### Task 1: Canonical Tribunal route and rename sweep

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/TopNav.tsx`
- Modify: `client/src/components/SubpageQuickNav.tsx`
- Modify: `client/src/components/BillyLive.tsx`
- Modify: `client/src/components/Billy.tsx`
- Modify: `client/src/hooks/useSEO.ts`
- Modify: `client/src/prerender.tsx`
- Modify: `client/src/pages/AgentCouncilPage.tsx`
- Modify: `client/src/lib/billyApi.ts`
- Modify: `client/src/lib/BillyEngine.ts`
- Modify: `shared/embodiment/chat.ts`
- Modify: `shared/embodiment/index.ts`

- [ ] **Step 1: Add `/tribunal` as the canonical route and keep `/agent-council` as a redirect/alias**

```tsx
<Route path="/tribunal" component={AgentCouncilPage} />
<Route path="/module/tribunal" component={AgentCouncilPage} />
<Route path="/agent-council" component={() => <Redirect to="/tribunal" />} />
<Route path="/module/agent-council" component={() => <Redirect to="/tribunal" />} />
```

- [ ] **Step 2: Update visible labels and SEO metadata from Council to Tribunal**

```ts
export const PAGE_SEO: Record<string, SEOProps> = {
  tribunal: {
    title: 'Tribunal | GestaltView',
    description: 'The Tribunal is where the designed agents coordinate care, scaffold, legacy, and roundtable synthesis without flattening the user.',
    h1: 'Tribunal',
    canonical: `${BASE_URL}/tribunal`,
  },
};
```

- [ ] **Step 3: Keep the room-slug compatibility mappings working through the rename**

```ts
const SECTION_TO_ROOM_SLUG: Record<string, string> = {
  "agent-council": "tribunal",
  tribunal: "tribunal",
};
```

- [ ] **Step 4: Verify the rename sweep with a targeted typecheck and grep pass**

Run: `./node_modules/.bin/tsc --noEmit --pretty false`
Run: `git grep -n "agent-council\\|Council" -- client/src shared api | head -200`

### Task 2: Tribunal roundtable mode and message data model

**Files:**
- Modify: `client/src/pages/AgentCouncilPage.tsx`
- Create: `client/src/components/roundtable/MentionAutocomplete.tsx`
- Create: `client/src/components/roundtable/VoiceSidebar.tsx`
- Create: `client/src/components/roundtable/CreationActionBar.tsx`
- Create: `client/src/components/roundtable/CreationPanel.tsx`
- Create: `shared/roundtable/types.ts`
- Create: `shared/roundtable/mentionParser.ts`

- [ ] **Step 1: Extend the tribunal message and mode types**

```ts
type CouncilMode = 'session' | 'debate' | 'roundtable';

interface CouncilMessage {
  addressedTo?: string[];
  isAutoReply?: boolean;
  replyDepth?: number;
}
```

- [ ] **Step 2: Add mention parsing helpers and auto-reply queueing**

```ts
export function extractMentions(content: string, activeSlugs: string[]): string[] {
  // Return unique matched slugs from @mentions in the text.
}
```

- [ ] **Step 3: Wire a `handleRoundtableTurn()` path that fires selected voices, parses mentions, and caps reply depth at 3**

```ts
if (councilMode === 'roundtable') {
  await handleRoundtableTurn(text);
}
```

- [ ] **Step 4: Render the new left sidebar with stance controls, response counts, and address buttons**

```tsx
<VoiceSidebar
  agents={visibleAgents}
  selectedSlugs={selectedSlugs}
  onAddressAgent={handleAddressAgent}
/>
```

- [ ] **Step 5: Add the `@` mention popover to the input bar**

```tsx
{mentionQuery ? <MentionAutocomplete query={mentionQuery} agents={selectedArray} /> : null}
```

- [ ] **Step 6: Verify the roundtable state updates with focused tests and a build/typecheck pass**

Run: `./node_modules/.bin/tsc --noEmit --pretty false`
Run: `npm run build`

### Task 3: Creation actions and Tribunal feed polish

**Files:**
- Modify: `client/src/pages/AgentCouncilPage.tsx`
- Modify: `client/src/components/Scaffold.tsx`
- Modify: `client/src/pages/DynamicInnerWorldPage.tsx`
- Modify: `client/src/pages/CreationCornerPage.tsx`

- [ ] **Step 1: Add per-message creation action buttons for scaffold, inner world, creation corner, tribunal, save, and share**

```tsx
<CreationActionBar
  content={msg.content}
  agentSlug={msg.agentSlug}
  onScaffold={() => appendScaffoldQueue(...)}
  onInnerWorld={() => appendInnerWorldCapture(...)}
/>
```

- [ ] **Step 2: Route seeded creation content through the existing Creation Corner and Inner World seams**

```ts
appendInnerWorldCapture({ ...capture, status: 'saved' });
appendScaffoldQueue({ ...orb, status: 'pending' });
```

- [ ] **Step 3: Add the right-side creation panel so the user can open creation flows without hunting through the feed**

```tsx
<CreationPanel open={creationPanelOpen} seed={creationSeed} />
```

- [ ] **Step 4: Validate the feed layout, creation actions, and route alias behavior end to end**

Run: `git diff --check`
Run: `./node_modules/.bin/vitest run tests/agent-council*.test.ts`

### Task 4: Handoff updates

**Files:**
- Modify: `docs/CurrentState.md`

- [ ] **Step 1: Add a new top entry describing the Tribunal rename and roundtable slice**
- [ ] **Step 2: Record the validation commands that passed**
- [ ] **Step 3: Note the remaining follow-up, if any, for the next session**

