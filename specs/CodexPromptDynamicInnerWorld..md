# Codex Prompt — DynamicInnerWorld Generative World Space Renderer

Work in `DigitalConsciousness/gestaltview-v2.0`.

Implement a safe, v0-like Generative UI World Space Renderer for `client/src/pages/DynamicInnerWorldPage.tsx`.

The target feel is a GestaltView-original futuristic memory museum: glass atrium, cyan/teal signage, liquid glass exhibit pods, neural aurora fog, deep midnight background, resonance rails between related artifacts, and a Curator digital intelligence presence. It can borrow the *emotional grammar* of a Halliday-style journal museum — archival density, theatrical lighting, glass, neon wayfinding, remembered artifacts — but must not copy Ready Player One assets, names, logos, or exact scenes.

Do not implement arbitrary runtime React/code generation. The safe pattern is:

1. Artifacts + filters + selected artifact + resonance links become a strict `WorldPlan` JSON object.
2. `WorldPlan.nodes[]` uses a known union of node kinds.
3. `renderWorldNode` maps those node kinds to trusted local React components.
4. Unknown node kinds render nothing.
5. The interface feels generated/adaptive, but never evaluates unknown code.

Create:

```txt
client/src/features/dynamic-inner-world/world-renderer/
  DynamicWorldSpaceRenderer.tsx
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
```

Wire `DynamicWorldSpaceRenderer` into `DynamicInnerWorldPage.tsx` using the existing page state: `visibleArtifacts`, `archivedArtifacts`, `selectedArtifactId`, `resonanceLinks`, `searchQuery`, `selectedTags`, `typeFilter`, `sortMode`, `clearFilters`, and `setLocation("/creation-corner")`.

Preserve the existing `ArtifactDeepView` integration for open/archive/download/resonance-link behavior. Preserve `useDynamicInnerWorld`, `innerWorldFiles`, and `buildDynamicInnerWorldResonanceLinks`.

Requirements:

- Selected artifact is always visually prominent.
- Search/filter/sort still work.
- Empty state is clear and useful.
- Curator is present, contextual, dismissible/collapsible, and never blocks Home navigation.
- Use `prefers-reduced-motion` to disable drifting/orbit effects.
- Mobile collapses into a vertical museum corridor instead of a wide 3D scatter.
- Use existing dependencies only.
- Run `pnpm build` and fix TypeScript errors.

