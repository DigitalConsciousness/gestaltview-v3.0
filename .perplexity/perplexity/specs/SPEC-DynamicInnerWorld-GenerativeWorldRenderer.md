# SPEC — DynamicInnerWorld Generative World Space Renderer

**Repository:** `DigitalConsciousness/gestaltview-v2.0`  
**Target page:** `client/src/pages/DynamicInnerWorldPage.tsx`  
**Working title:** `GenerativeWorldSpaceRenderer`  
**Intent:** Replace the static artifact-grid feeling with a living, explorable museum/world renderer that behaves like a safe, local version of v0-style generative UI: artifact data becomes a structured layout plan, and the renderer turns that plan into a spatial interface.

---

## 1. Core Read

The Dynamic Inner World should not feel like a generic gallery or dashboard. It should feel like the user has stepped into a memory-museum where finished artifacts remain alive, connected, and inspectable.

The reference vibe is the **James Halliday museum / journals space**: glass, exhibit halls, neon-cyan wayfinding, archival density, controlled theatrical lighting, and a sense that every item has provenance. The implementation must avoid copying Ready Player One assets, logos, names, or exact framing. The GestaltView version should be original: neural aurora atmosphere, liquid glass exhibits, fog, deep midnight void, teal/cyan/emerald/electric-purple energy, warm analog memory light, and Curator-led interpretation.

The result should be a **dynamic world-space renderer**, not a pile of cards.

---

## 2. Current Repo Anchors

The current page already has several useful pieces that should be preserved:

- `DynamicInnerWorldPage.tsx` already reads local and endpoint artifacts, merges them, filters them, chooses a selected artifact, and sends that selected artifact into `ArtifactDeepView`.
- `useDynamicInnerWorld` already hydrates from `/api/consciousness/dynamic-inner-world?userId=...`.
- `buildDynamicInnerWorldResonanceLinks` already scores selected artifacts against nearby candidates.
- `BabylonAtmosphere` already exists and supports an `inner-world` mode.
- `CuratorDI` already exists as the space-specific digital intelligence surface.
- `package.json` already includes Babylon, React Three/Fiber, Framer Motion, Tailwind, Radix, Wouter, and the rest needed for this without adding major dependencies.

Do not throw this away. The renderer should wrap and elevate the existing data flow.

---

## 3. What “v0-like generative UI” Means Here

This should **not** be runtime arbitrary code generation. Do not ask an LLM to emit React and then render that React in the browser.

The safe version is:

1. Inputs are artifacts, tags, timestamps, resonance links, profile stats, selected filters, and Curator state.
2. A deterministic or LLM-assisted planner produces a **strict JSON layout plan**.
3. The renderer only accepts known node kinds from a registry.
4. Each node kind maps to a local trusted React component.
5. The user sees a generated, living interface, but the runtime never evaluates unknown code.

This gives the feel of v0’s adaptive generation and live preview loop while staying production-safe.

---

## 4. New Architecture

Create a feature folder:

```txt
client/src/features/dynamic-inner-world/world-renderer/
  DynamicWorldSpaceRenderer.tsx
  WorldRendererProvider.tsx
  buildWorldPlan.ts
  renderWorldNode.tsx
  types.ts
  components/
    WorldAtrium.tsx
    ExhibitPod.tsx
    ArtifactConstellation.tsx
    ResonanceRail.tsx
    CuratorConsole.tsx
    ArchiveVault.tsx
    SearchControlDeck.tsx
    EmptyHallState.tsx
    WorldStatsRibbon.tsx
  styles.ts
```

Keep `DynamicInnerWorldPage.tsx` as the orchestration page. Move rendering complexity into the feature folder.

---

## 5. Data Model

Add `types.ts`:

```ts
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import type { DynamicInnerWorldResonanceLink } from "@/lib/genEngineRoomWiring";

export type WorldRenderMode = "museum" | "constellation" | "timeline" | "archive";

export type WorldNodeKind =
  | "world-atrium"
  | "artifact-pod"
  | "artifact-constellation"
  | "resonance-rail"
  | "curator-console"
  | "archive-vault"
  | "search-control-deck"
  | "empty-hall-state"
  | "world-stats-ribbon";

export type WorldPosition = {
  x: number;
  y: number;
  z: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
};

export type WorldNode = {
  id: string;
  kind: WorldNodeKind;
  artifactId?: string;
  title?: string;
  summary?: string;
  tags?: string[];
  position: WorldPosition;
  emphasis: "primary" | "secondary" | "ambient" | "archived";
  children?: WorldNode[];
  props?: Record<string, unknown>;
};

export type WorldPlan = {
  id: string;
  mode: WorldRenderMode;
  generatedAt: string;
  selectedArtifactId: string | null;
  nodes: WorldNode[];
  atmosphere: {
    density: number;
    accent: "cyan" | "emerald" | "purple" | "gold";
    signage: string;
    corridorDepth: number;
  };
  curator: {
    message: string;
    note?: string;
    activePersonaSlug: "curator";
  };
};

export type BuildWorldPlanInput = {
  artifacts: InnerWorldArtifactRecord[];
  archivedArtifacts: InnerWorldArtifactRecord[];
  selectedArtifactId: string | null;
  resonanceLinks: DynamicInnerWorldResonanceLink[];
  searchQuery: string;
  selectedTags: string[];
  typeFilter: string;
  sortMode: string;
};
```

---

## 6. Layout Planner

Add `buildWorldPlan.ts`.

Rules:

- If there are no artifacts, generate an `empty-hall-state`, `curator-console`, and `search-control-deck` only.
- If there are 1–8 artifacts, use `museum` mode: large central exhibit pods in a glass atrium.
- If there are 9–40 artifacts, use `constellation` mode: pods become clustered exhibits around a central selected artifact.
- If there are 41+ artifacts, use `archive` mode: grouped wings by tag/type/date with only visible highlighted pods.
- The selected artifact is always visually prominent and reachable.
- Resonance links become visible rails from selected pod to connected pods.
- The plan must be stable between renders: deterministic positions from artifact id hash, not `Math.random()`.

Skeleton:

```ts
import type { BuildWorldPlanInput, WorldPlan, WorldNode } from "./types";

function hashNumber(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function positionForArtifact(id: string, index: number, total: number) {
  const hash = hashNumber(id);
  const angle = (index / Math.max(1, total)) * Math.PI * 2;
  const radius = total <= 8 ? 220 : 280 + (hash % 120);
  return {
    x: Math.cos(angle) * radius,
    y: ((hash % 90) - 45),
    z: Math.sin(angle) * radius,
    rotateY: -angle,
    scale: 1,
  };
}

export function buildWorldPlan(input: BuildWorldPlanInput): WorldPlan {
  const selectedArtifact = input.artifacts.find((artifact) => artifact.id === input.selectedArtifactId) ?? input.artifacts[0] ?? null;
  const mode = input.artifacts.length > 40 ? "archive" : input.artifacts.length > 8 ? "constellation" : "museum";

  const artifactNodes: WorldNode[] = input.artifacts.map((artifact, index) => ({
    id: `node-${artifact.id}`,
    kind: "artifact-pod",
    artifactId: artifact.id,
    title: artifact.title,
    summary: artifact.summary,
    tags: artifact.tags,
    position: artifact.id === selectedArtifact?.id
      ? { x: 0, y: 0, z: 0, scale: 1.18 }
      : positionForArtifact(artifact.id, index, input.artifacts.length),
    emphasis: artifact.id === selectedArtifact?.id ? "primary" : "secondary",
  }));

  const resonanceNodes: WorldNode[] = input.resonanceLinks.map((link, index) => ({
    id: `rail-${link.artifactId}`,
    kind: "resonance-rail",
    artifactId: link.artifactId,
    title: link.title,
    summary: link.reason,
    position: { x: 0, y: 12 + index * 18, z: -80 - index * 18, scale: 1 },
    emphasis: "ambient",
    props: { score: link.score, reason: link.reason },
  }));

  return {
    id: `inner-world-plan-${selectedArtifact?.id ?? "empty"}`,
    mode,
    generatedAt: new Date().toISOString(),
    selectedArtifactId: selectedArtifact?.id ?? null,
    nodes: [
      {
        id: "atrium",
        kind: "world-atrium",
        title: "Dynamic Inner World",
        summary: "The hall where finished artifacts stay alive.",
        position: { x: 0, y: 0, z: 0, scale: 1 },
        emphasis: "ambient",
      },
      ...artifactNodes,
      ...resonanceNodes,
      {
        id: "control-deck",
        kind: "search-control-deck",
        position: { x: 0, y: -120, z: 180, scale: 1 },
        emphasis: "ambient",
      },
      {
        id: "curator-console",
        kind: "curator-console",
        position: { x: 220, y: 40, z: 120, scale: 1 },
        emphasis: "ambient",
      },
    ],
    atmosphere: {
      density: mode === "archive" ? 0.52 : mode === "constellation" ? 0.42 : 0.34,
      accent: "cyan",
      signage: selectedArtifact ? selectedArtifact.title : "No artifacts yet",
      corridorDepth: mode === "archive" ? 920 : 620,
    },
    curator: {
      activePersonaSlug: "curator",
      message: selectedArtifact
        ? `I found ${selectedArtifact.title}. The hall remembers where it came from.`
        : "Nothing has arrived here yet. Send something from Creation Corner and the hall will light up.",
      note: `${input.artifacts.length} visible artifacts · ${input.archivedArtifacts.length} archived`,
    },
  };
}
```

---

## 7. Renderer Registry

Add `renderWorldNode.tsx`.

This is the safety boundary. Only known nodes render.

```tsx
import type { WorldNode } from "./types";
import { ExhibitPod } from "./components/ExhibitPod";
import { WorldAtrium } from "./components/WorldAtrium";
import { ResonanceRail } from "./components/ResonanceRail";
import { CuratorConsole } from "./components/CuratorConsole";
import { SearchControlDeck } from "./components/SearchControlDeck";
import { EmptyHallState } from "./components/EmptyHallState";
import { WorldStatsRibbon } from "./components/WorldStatsRibbon";

export function renderWorldNode(node: WorldNode, context: WorldRenderContext) {
  switch (node.kind) {
    case "world-atrium":
      return <WorldAtrium key={node.id} node={node} context={context} />;
    case "artifact-pod":
      return <ExhibitPod key={node.id} node={node} context={context} />;
    case "resonance-rail":
      return <ResonanceRail key={node.id} node={node} context={context} />;
    case "curator-console":
      return <CuratorConsole key={node.id} node={node} context={context} />;
    case "search-control-deck":
      return <SearchControlDeck key={node.id} node={node} context={context} />;
    case "empty-hall-state":
      return <EmptyHallState key={node.id} node={node} context={context} />;
    case "world-stats-ribbon":
      return <WorldStatsRibbon key={node.id} node={node} context={context} />;
    default:
      return null;
  }
}
```

---

## 8. Main Component

Add `DynamicWorldSpaceRenderer.tsx`.

Responsibilities:

- Build the plan with `buildWorldPlan`.
- Render a deep background atmosphere.
- Render world nodes in a `preserve-3d` stage.
- Let the user select an artifact pod.
- Support keyboard navigation.
- Respect `prefers-reduced-motion`.
- Avoid breaking the existing `ArtifactDeepView` interaction.

Required props:

```ts
type DynamicWorldSpaceRendererProps = {
  artifacts: InnerWorldArtifactRecord[];
  archivedArtifacts: InnerWorldArtifactRecord[];
  selectedArtifactId: string | null;
  resonanceLinks: DynamicInnerWorldResonanceLink[];
  searchQuery: string;
  selectedTags: string[];
  typeFilter: ArtifactTypeFilter;
  sortMode: ArtifactSortMode;
  onSelectArtifact: (artifactId: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  onClearFilters: () => void;
  onGoToCreationCorner: () => void;
};
```

Visual structure:

```tsx
<section className="relative min-h-[72vh] overflow-hidden rounded-[2.4rem] border border-white/10 bg-black/30 shadow-[0_0_120px_rgba(18,214,255,0.10)] backdrop-blur-xl">
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(18,214,255,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(191,0,255,0.14),transparent_28%),linear-gradient(180deg,rgba(1,5,12,0.44),rgba(1,5,12,0.96))]" />
    <div className="absolute inset-x-8 top-10 h-px bg-cyan-200/30 shadow-[0_0_32px_rgba(18,214,255,0.45)]" />
    <div className="absolute bottom-0 left-1/2 h-[42%] w-[80%] -translate-x-1/2 rounded-t-full border-t border-cyan-200/15 bg-cyan-200/[0.025]" />
  </div>

  <div className="relative z-10 flex min-h-[72vh] flex-col">
    <WorldHeader />
    <div className="relative flex-1 perspective-[1200px]">
      <div className="absolute inset-0 transform-gpu [transform-style:preserve-3d]">
        {plan.nodes.map((node) => renderWorldNode(node, context))}
      </div>
    </div>
  </div>
</section>
```

---

## 9. Component Behavior

### `WorldAtrium`

- Draw glass-pane grid lines inspired by a futuristic museum facade.
- Add cyan sign text from `plan.atmosphere.signage`.
- Add subtle “journal archive” floor glow.
- No copyrighted text, logos, or direct Ready Player One names.

### `ExhibitPod`

- Liquid-glass card/object hybrid.
- Displays artifact title, type, tags, timestamp, and a short summary.
- Primary selected artifact gets larger scale, stronger glow, and a “selected exhibit” label.
- Click = select.
- Double click / Enter = open `ArtifactDeepView`.
- Use `transform: translate3d(...) rotateY(...) scale(...)` from `WorldPosition`.

### `ResonanceRail`

- Draws lightweight connection labels, not heavy graph spaghetti.
- Each rail points from selected artifact to linked artifact.
- Show score as a small pulse; show reason text only on hover/focus.

### `CuratorConsole`

- Upgrade current fixed `CuratorDI` into an in-world console or keep `CuratorDI` as the mobile fallback.
- Must be dismissible/collapsible.
- Must never block Home navigation or artifact controls.

### `SearchControlDeck`

- Converts current search/filter UI into a compact “control deck.”
- Search input remains text-first and accessible.
- Type chips and tag chips remain available.
- Clear filters remains one action.

### `ArchiveVault`

- Optional for phase 2.
- Shows archived count and latest archived pieces.
- Does not remove current archive behavior.

---

## 10. Update `DynamicInnerWorldPage.tsx`

Keep the page’s existing data logic. Replace the current large filter/card-grid/stats visual layout with the renderer.

Minimum integration shape:

```tsx
<DynamicWorldSpaceRenderer
  artifacts={visibleArtifacts}
  archivedArtifacts={archivedArtifacts}
  selectedArtifactId={selectedArtifactId}
  resonanceLinks={resonanceLinks}
  searchQuery={searchQuery}
  selectedTags={selectedTags}
  typeFilter={typeFilter}
  sortMode={sortMode}
  onSelectArtifact={setSelectedArtifactId}
  onOpenArtifact={(artifactId) => setSelectedArtifactId(artifactId)}
  onClearFilters={clearFilters}
  onGoToCreationCorner={() => setLocation("/creation-corner")}
/>
```

Keep `ArtifactDeepView` exactly as the detail surface unless Codex finds a hard conflict. It already handles archive, download, PLK connections, external links, and resonance links.

---

## 11. Integration With Generative Engine

The world renderer should consume artifacts that already exist in `innerWorldFiles` and endpoint artifacts from `useDynamicInnerWorld`.

Creation Corner artifacts that target `dynamic_inner_world` should appear as:

```ts
originRoom: "creation_corner"
tags: [artifactType, synthesisStyle, generationMode]
evidenceNodeIds: sourceCaptureIds
html: generated artifact html/markdown render
summary: generated summary
```

Phase 1 can be local-only: deterministic `buildWorldPlan`.  
Phase 2 can add server-assisted planning through the existing gen-engine, but only if the output is validated with a schema and rendered through the strict registry.

Do not introduce unsafe dynamic React rendering.

---

## 12. Motion & Atmosphere Rules

- Use slow parallax, drift, and glow. No aggressive spinning.
- Use `prefers-reduced-motion` to disable orbiting/float animation.
- Use static transforms for all artifact positions.
- Animate opacity/scale only on select and filter change.
- Keep `BabylonAtmosphere mode="inner-world"` behind the renderer or replace it only if the new renderer covers its role.
- On mobile, collapse into vertical “museum corridor” cards rather than 3D scatter.

---

## 13. Accessibility

- All artifact pods must be buttons.
- `Enter` opens selected artifact.
- Arrow keys cycle artifacts when the renderer is focused.
- Search and filters must remain native input/button controls.
- Curator console must not trap focus.
- Provide visible focus rings.
- Do not rely on color alone for type/resonance state.

---

## 14. Performance Budget

- 60 artifact pods maximum in full 3D stage.
- If artifacts > 60, show the top visible 60 and route the rest into `ArchiveVault`/grouped wings.
- Avoid canvas text rendering unless necessary.
- Avoid loading 3D models in phase 1.
- Do not add new heavy dependencies.
- Memoize `buildWorldPlan` by artifact ids, selected id, filters, and resonance link ids.
- Use `content-visibility: auto` for non-selected pod detail sections if needed.

---

## 15. Styling Tokens

Use existing GestaltView colors first:

- `bg-gv-bg-void`
- `bg-gv-bg-deep`
- `text-gv-text-primary`
- `text-gv-text-secondary`
- `text-gv-text-muted`
- `gv-aurora-cyan`

Suggested hardcoded accent fallbacks only where existing tokens are unavailable:

```txt
cyan: #12D6FF
teal: #14F1D9
emerald: #35FF9F
purple: #BF00FF
neon-pink: #FF2FA3
midnight: #05070B
memory-gold: #F2B84B, use sparingly only as archival warmth
```

The gold should be an accent, not the dominant identity.

---

## 16. Phased Build Plan

### Phase 1 — Safe Renderer

- Add world-renderer folder.
- Add deterministic `buildWorldPlan`.
- Add `DynamicWorldSpaceRenderer` and base components.
- Wire it into `DynamicInnerWorldPage.tsx`.
- Keep current `ArtifactDeepView` and `CuratorDI` fallback.

### Phase 2 — Better Museum Semantics

- Add tag/date/type wings.
- Add resonance rail hover/focus details.
- Add Archive Vault.
- Add “Send selected artifact to Creation Corner” action.

### Phase 3 — True Generative UI Planner

- Add optional endpoint: `/api/dynamic-inner-world/layout-plan`.
- Server returns JSON only.
- Validate with Zod.
- Fall back to deterministic planner on any failure.
- Store no plan unless the user explicitly saves it.

### Phase 4 — Multimodal Exhibit Modes

- Image artifacts become lightbox exhibits.
- Audio artifacts become ambient stations.
- Code artifacts become holographic blueprint panels.
- Markdown/text artifacts become journal plaques.

---

## 17. Acceptance Criteria

- The page still builds with `pnpm build`.
- Home navigation is always reachable.
- No unclosable overlay blocks the page.
- The selected artifact is always visible or reachable.
- Search/filter/sort still work.
- Artifact opening, archiving, downloading, and resonance links still work.
- Curator is present and contextual, not a generic chat box.
- The page reads as a world/museum, not a dashboard grid.
- No arbitrary generated code is evaluated.
- No new paid service is required.
- Mobile remains usable on a Samsung A35-class device.

---

## 18. Codex Prompt

```md
You are working in `DigitalConsciousness/gestaltview-v2.0`.

Implement a safe, v0-like Generative UI World Space Renderer for `client/src/pages/DynamicInnerWorldPage.tsx`.

Goal: transform the current artifact grid into a living Dynamic Inner World museum renderer inspired by the feel of a futuristic archive/journal museum, but make it original GestaltView: neural aurora, fog, liquid glass, cyan/teal/emerald/electric-purple accents, midnight void, warm archival memory light, and a Curator digital intelligence presence.

Do not use copyrighted assets, names, logos, or direct Ready Player One reproduction. Do not eval generated React. Do not add unsafe runtime codegen.

Architecture:
1. Create `client/src/features/dynamic-inner-world/world-renderer/`.
2. Add `types.ts`, `buildWorldPlan.ts`, `renderWorldNode.tsx`, `DynamicWorldSpaceRenderer.tsx`, and component files under `components/`.
3. `buildWorldPlan` must convert artifacts + selected artifact + resonance links + filters into strict typed `WorldPlan` JSON.
4. `renderWorldNode` must map known node kinds to trusted React components only.
5. Wire `DynamicWorldSpaceRenderer` into `DynamicInnerWorldPage.tsx` using existing state and handlers.
6. Preserve existing `ArtifactDeepView`, artifact archive/download behavior, `useDynamicInnerWorld`, `innerWorldFiles`, and `buildDynamicInnerWorldResonanceLinks` behavior.
7. Keep `BabylonAtmosphere mode="inner-world"` behind the renderer unless the new renderer fully replaces it.
8. Curator must be present, contextual, dismissible/collapsible, and never block navigation.
9. Search, filter, tags, sort, stats, and empty state must remain functional.
10. Use existing dependencies only.

Validation:
- Run `pnpm build`.
- Fix all TypeScript errors.
- Confirm keyboard access and reduced-motion behavior.
- Confirm no unclosable overlay remains.
```
