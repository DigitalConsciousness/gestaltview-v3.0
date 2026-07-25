# Dynamic Inner World — Museum Hall Implementation Patch

This patch upgrades the existing Dynamic Inner World renderer instead of replacing the room architecture.

## What changed

The outside markdown described the Dynamic Inner World as a long hall that opens into a T-junction, with large showcase surfaces where finished artifacts render as live HTML. This patch brings that into the current renderer seam.

### Updated files

- `client/src/features/dynamic-inner-world/world-renderer/buildWorldPlan.ts`
- `client/src/features/dynamic-inner-world/world-renderer/components/ExhibitPod.tsx`
- `client/src/features/dynamic-inner-world/world-renderer/components/WorldAtrium.tsx`
- `client/src/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer.tsx`

## Behavior now

- Artifacts are arranged like museum showcases along a corridor instead of orbiting generic cards.
- The selected artifact is pulled forward to the center lane, echoing the “shooting gallery / zip line” retrieval idea.
- HTML artifacts render automatically inside sandboxed iframe previews directly on the showcase surface.
- Non-HTML artifacts are wrapped into a safe generated HTML preview so every artifact can still appear as a finished surface.
- The far end visually suggests the T-junction branch from the source markdown.
- The existing filters, timeline, archive vault, Creation Corner button, deep artifact view, and keyboard navigation are preserved.

## Why this path

The repo already had `DynamicWorldSpaceRenderer` and the page was already feeding it artifact records. The right move was to upgrade the renderer’s spatial grammar and artifact pod rendering, not introduce a new room taxonomy or break the existing data flow.

## Apply

The four updated files have been applied to the live `client/src/features/dynamic-inner-world/world-renderer/` seam in this repo.

Then run:

```bash
npm run build
git diff --check
```

## Manual check

1. Open `/dynamic-inner-world`.
2. Confirm seeded or saved artifacts appear as large showcase frames.
3. Select an artifact with arrow keys; it should pull forward into the center lane.
4. Press Enter or click “Open full artifact.”
5. Confirm HTML renders in the preview and the deep view.
6. Confirm filters/search still update the visible hall.
7. Confirm Creation Corner routing still works.

## Notes

The preview iframes use `srcDoc` and `sandbox="allow-scripts allow-forms"` so interactive self-contained HTML artifacts can breathe without giving them same-origin access. If a future dependency like DOMPurify is already available in the repo, sanitization can be added before writing `srcDoc`, but the sandbox boundary is the correct no-new-dependency default for this pass.
