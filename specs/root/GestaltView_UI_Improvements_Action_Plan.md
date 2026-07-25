# GestaltView v2.5 — Comprehensive UI & Functional Enhancement Plan

**Source:** Stakeholder walkthrough transcript (Keith Soyka)  
**Live Repo:** [DigitalConsciousness/gestaltview-v2.0](https://github.com/DigitalConsciousness/gestaltview-v2.0)  
**Status:** Immediate remediation required across design, functionality, and data layers

---

## Executive Overview

This document catalogs every issue, request, and design directive raised during the stakeholder walkthrough. Items are organized by surface area, mapped to their live source file(s), and assigned a priority tier. The overarching theme is that the site has drifted toward a "cookie-cutter shell" at the expense of the original textured, contextual brand vision. Immediate corrective action is expected.

---

## Priority Tiers

| Tier | Label | Definition |
|------|-------|-----------|
| P0 | **Critical** | Broken functionality blocking user action |
| P1 | **High** | Missing core feature or severe UX regression |
| P2 | **Medium** | Design/polish gap significantly impacting brand |
| P3 | **Low** | Enhancement / quality-of-life item |

---

## 1. Visual & Design System

### 1.1 Homepage — `client/src/pages/Home.tsx`

| Issue | Detail | Priority |
|-------|--------|---------|
| GestaltView logo/text lacks gradient | Currently renders in flat cream; needs a living gradient treatment | P1 |
| Card fonts too small and flat | Cards need larger, more dynamic typography with a "liquid glass" visual effect | P1 |
| Drag-to-move cards | Drag functionality is acceptable for now — no change required | — |

**Directive:** Apply a gradient (not cream) to the GestaltView wordmark/title. Add a frosted/liquid-glass CSS backdrop-filter treatment to cards with slightly increased font size.

### 1.2 Room Header System — Template from Blackboard Room

The Blackboard Room (`BlackboardRoomPage.tsx`) currently has the correct font, color, and gradient execution. This should serve as the **canonical room header template** applied to every room page, with each room getting its own distinct color palette and personality.

Files to update with templated headers:
- `BlackboardRoomPage.tsx` (source/template)
- `WhiteboardRoomPage.tsx`
- `SanctuaryPage.tsx`
- `DynamicInnerWorldPage.tsx`
- `CreationCornerPage.tsx`
- `ExternalScaffoldPage.tsx`
- All other `*Page.tsx` room-type surfaces

### 1.3 Musical DNA — `client/src/pages/MusicalDNAPage.tsx` + `MusicalDNAPage.css`

All Musical DNA pages must apply **"Cabin Sketch"** as the typeface alongside a unique, beautiful color gradient that is visually distinct from every other page. Spotify integration is confirmed working (URI resolution functional). No routing fix needed — design polish only.

### 1.4 Language & Tone — Site-Wide

All "woo woo" placeholder and filler language must be removed site-wide and replaced with copy grounded in `BrandVoice.md`. The Sanctuary page is particularly affected, but the FAQ (`FAQ.tsx`) and generic CTAs across pages also need audit. The inspirational phrase *"You don't have to know where you're going, just that you're not alone in getting there"* must be rendered in a designated script/calligraphy typeface wherever it appears.

---

## 2. Functional Bugs (P0 / P1)

### 2.1 Blackboard Room — `client/src/pages/BlackboardRoomPage.tsx`

**Critical.** The persistent session layer is stacking content across layout updates, causing visual corruption. There is currently no way to clear or end a session — the room gets stuck.

Required fixes:
- Diagnose and resolve the persistent-layer stacking mechanism (likely a `localStorage` or global state accumulation bug)
- Expose a **"Clear Session"** and **"End Session"** control in the room header or a accessible action menu

### 2.2 Image Upload Failures — `ProfilePage.tsx`, `SanctuaryPage.tsx`

**Critical.** Profile images and scrapbook images are failing to upload. The error logged is `Failed to execute setItem on Storage`, which points to either a Supabase Storage bucket permission issue, a quota/tier constraint, or a browser localStorage overflow being confused for the file storage path. Supabase Storage bucket policies and the account's tier limits must be verified and corrected.

### 2.3 Blueprint Deletion — `CreationCornerPage.tsx`

**High.** Users cannot delete blueprints. Basic CRUD (specifically DELETE) is absent from the blueprint management surface. All stale/test blueprints are accumulating with no escape hatch.

Required fix: Implement a delete action (with confirmation) on each blueprint card. Ensure the corresponding server/Supabase route is wired.

### 2.4 Content-to-Inner-World Pipeline — `ExternalScaffoldPage.tsx` → `DynamicInnerWorldPage.tsx`

**High.** Attempting to send content from the Blackboard Room to the External Scaffold, and from the External Scaffold to the Dynamic Inner World, produces no result — artifacts never arrive. This means the cross-room content routing pipeline is either missing event handlers, broken API calls, or the receiving page is not subscribed to the correct data source.

Trace path: `BlackboardRoomPage` → dispatch → `ExternalScaffoldPage` receive → approve → `DynamicInnerWorldPage` render. Each seam must be verified and repaired.

### 2.5 Workspace Content Management — `WorkspacesPage.tsx`

Users can create workspaces but cannot insert content into them. Workspaces feel static and inert. Full workspace content CRUD (add files, notes, blueprints) must be implemented.

---

## 3. Design Visions Requiring Rebuild

### 3.1 Dynamic Inner World — `client/src/pages/DynamicInnerWorldPage.tsx`

**P0 for product vision.** The current implementation is a "cookie-cutter" placeholder that bears no resemblance to the intended experience. The vision is a **museum-type artifact showcase space** with 2D/3D HTML canvas rendering — similar in concept to Ready Player One's persistent spatial world. Finished artifacts (images, stories, compositions) should be displayed as permanent, browse-able exhibits in a canvas-rendered environment.

This page requires a near-complete redesign. Canvas rendering (2D `<canvas>` or Three.js/WebGL for 3D) must be introduced. Artifacts routed from Creation Corner and Blackboard Room should populate this space.

### 3.2 Creation Corner — `client/src/pages/CreationCornerPage.tsx`

**P1.** Currently a static form with no live interactivity. Required changes:

- Remove the dead "do you want a storybook or report or resume or website" dropdown (it cannot fulfill these functions currently — leaving it is misleading)
- Implement a **live Art Teacher agent** instance (Billy-connected) capable of real refinement conversation
- Wire actual **image generation API calls** (e.g., DALL·E or similar) so generative image creation works end-to-end
- On completion, route finished artifacts to Dynamic Inner World

---

## 4. Profile & Identity Layer

### 4.1 12-Module User Profile — `client/src/pages/ProfilePage.tsx`

The full 12-module user profile must be surfaced at both **macro level** (overview/summary) and **micro level** (detailed editing per module). Currently the profile page does not adequately represent or utilize this structure. The implementation should ensure every module is both writable and read-back into the product's personalization logic.

### 4.2 Embodiment Profile — `client/src/pages/EmbodimentStudioPage.tsx`

Users cannot edit the Embodiment profile. The UI provides a "Choose a non-founder DI profile" selector but no editing surface. Additionally, **24 DI (Digital Identity) profiles exist in the system but only approximately 6 are visible** — all 24 must be accessible to users. Editing capability must be added, with the Agent Academy (`AgentAcademyPage.tsx`) ultimately serving as the authoring interface.

### 4.3 Account Clearing — `client/src/pages/ProfilePage.tsx` (Danger Zone)

A **"Clear / Empty Account"** action is needed — distinct from account deletion. The user wants to reset all data without losing the account itself. This should live in the Danger Zone section with an explicit confirmation flow.

---

## 5. Sanctuary — `client/src/pages/SanctuaryPage.tsx`

### 5.1 Journal — Texture & Feel

The journal must feel "notebooky" — a textured paper aesthetic, not a plain white surface. Consider a CSS paper texture background, slightly off-white warm tones, and a handwriting-adjacent font pairing (consistent with the Babylon/willow tree visual motif mentioned).

### 5.2 Scrapbook — Markdown Rendering

Markdown content in the scrapbook is not rendering correctly — raw syntax is likely being displayed as plain text. A proper Markdown renderer (e.g., `react-markdown` with `remark-gfm`) must be applied to all scrapbook content surfaces.

---

## 6. Export & Data — `client/src/pages/ProfilePage.tsx`

Export is functionally working (26 records across 8 files confirmed exported) but the output location is unclear to the user — the file appears in the browser download queue but is not surfaced in a discoverable way within the app. A post-export state should confirm download completion and ideally show a file summary inline.

---

## 7. Validated / Working — No Action Needed

| Feature | Status |
|---------|--------|
| Spotify URI integration (Musical DNA) | ✅ Working — opens correct URI |
| Room deletion (with owner permissions) | ✅ Working |
| Data export (26 records / 8 files) | ✅ Working — UX clarity needed only |
| Card drag-to-move (Homepage) | ✅ Acceptable as-is |

---

## 8. Ordered Action Item Checklist

- [ ] **P0** Fix BlackboardRoom persistent layer stacking; add Clear Session / End Session controls — `BlackboardRoomPage.tsx`
- [ ] **P0** Diagnose and fix image upload failure (`setItem on Storage` error) — `ProfilePage.tsx`, `SanctuaryPage.tsx`, Supabase Storage
- [ ] **P0** Rebuild Dynamic Inner World as museum/canvas artifact space — `DynamicInnerWorldPage.tsx`
- [ ] **P1** Apply homepage gradient to GestaltView text + liquid-glass card effect — `Home.tsx`
- [ ] **P1** Standardize room header template from Blackboard Room; apply with unique colors per room — all `*Page.tsx` room files
- [ ] **P1** Implement Blueprint deletion (CRUD) — `CreationCornerPage.tsx`
- [ ] **P1** Repair content routing pipeline: Blackboard → External Scaffold → Dynamic Inner World — `BlackboardRoomPage.tsx`, `ExternalScaffoldPage.tsx`, `DynamicInnerWorldPage.tsx`
- [ ] **P1** Make Creation Corner generative: live Art Teacher instance, image generation API, remove dead dropdown — `CreationCornerPage.tsx`
- [ ] **P1** Surface full 12-module profile at macro + micro levels — `ProfilePage.tsx`
- [ ] **P1** Fix Embodiment profile editing; expose all 24 DI profiles — `EmbodimentStudioPage.tsx`
- [ ] **P1** Enable workspace content CRUD — `WorkspacesPage.tsx`
- [ ] **P2** Apply "Cabin Sketch" font + unique gradient to all Musical DNA pages — `MusicalDNAPage.tsx`, `MusicalDNAPage.css`
- [ ] **P2** Improve Sanctuary journal with textured-paper feel; fix scrapbook markdown rendering — `SanctuaryPage.tsx`
- [ ] **P2** Add "Clear / Empty Account" action to Danger Zone (separate from delete) — `ProfilePage.tsx`
- [ ] **P2** Improve export UX — show download confirmation + inline file summary
- [ ] **P2** Remove all "woo woo" / placeholder language site-wide; align to `BrandVoice.md`
- [ ] **P3** Apply script typeface to inspirational phrase "You don't have to know where you're going..."
- [ ] **P3** Audit and harden Settings page options — `SettingsPage.tsx`

---

## 9. Technical Debt Notes

The `setItem on Storage` error during image upload is worth a dedicated Supabase diagnostic. Check: (1) whether the Storage bucket exists and has correct RLS policies, (2) whether the `anon` key has upload rights to the relevant bucket, and (3) whether the free-tier file size or storage limits are being hit. The error message suggests the code may be attempting to store a file reference in `localStorage` rather than the actual upload to Supabase Storage — a code path bug independent of tier limits.

The content pipeline failure (Blackboard → Dynamic Inner World) is likely a missing or mismatched CustomEvent name or a Supabase row insert that succeeds but whose `project_id` scoping prevents the receiving page from querying it. Inspect both the event emitter in `BlackboardRoomPage.tsx` and the data subscriber in `DynamicInnerWorldPage.tsx`.
