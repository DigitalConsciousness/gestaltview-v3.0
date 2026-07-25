# GestaltView Feature Spec — Three Implementation Slices
**Source:** Founder voice notes, May 14 2026 · Manhattan Mornings transcript  
**Prepared for:** Codex  
**Author perspective:** External architect reading the founder's intent — not the founder, not the runtime

---

## How to read this spec

These three features are independent slices. Each has a clear boundary, a clear done state, and a clear list of files Codex should touch. Do not bleed across slice boundaries. Do not introduce abstractions not listed here. If something is ambiguous, the rule is: do the simpler thing and leave a TODO comment with the exact question.

---

## Slice 1 — Blackboard Room: File Preview Pane

### Problem statement (exact, from founder)

When a user uploads a Markdown or PDF file in the Blackboard Room today, two things break:
1. Markdown renders as raw text — the formatting is stripped and the content is harder to read than the original file.
2. The file does not load into the capture window automatically. It appears below the capture window, requiring the user to manually copy-paste the content up into the window before anything useful can happen.

This is a regression in UX. The file upload should make the file *more* usable, not less.

### Target behavior

- When a file is uploaded in the Blackboard Room, a **preview pane** opens adjacent to (or below) the capture window — not replacing it.
- Markdown files render with full formatting: headings, lists, bold/italic, code blocks, blockquotes.
- PDF files render with page-level visual fidelity — not extracted text, actual page rendering.
- The preview pane and the capture window coexist. The user can reference the preview while writing in the capture window.
- A single "Load into capture" button (or equivalent affordance) copies the file content into the capture window if the user explicitly wants it there. It should not happen automatically — the user controls that action.
- The preview pane is dismissible. It should not permanently occupy space if the user closes it.

### What Codex should touch

- `client/src/pages/BlackboardRoomPage.tsx` (or equivalent) — add preview pane state and layout split
- `client/src/components/FilePreview.tsx` — create this component; handles Markdown and PDF rendering
  - For Markdown: use `react-markdown` with `remark-gfm`
  - For PDF: use `react-pdf` (from `@react-pdf/renderer` or `pdfjs-dist`) — whichever is already in the dependency tree; if neither exists, use `pdfjs-dist` via CDN script tag before introducing a new package dependency
- File upload handler — ensure uploaded file content is passed to the preview pane, not only stored

### What Codex should NOT touch

- Supabase schema — no schema changes needed for this slice
- The capture window component itself — do not alter its input behavior
- Any other page or room

### Done when

- Uploading a `.md` file shows rendered Markdown in the preview pane
- Uploading a `.pdf` file shows the PDF rendered (not text-extracted) in the preview pane
- "Load into capture" button works
- Preview pane closes cleanly
- No console errors on upload

---

## Slice 2 — File Explorer

### Problem statement (exact, from founder)

Users upload files across sessions with no persistent, organized place to see what they have. There is no file management. Files exist somewhere in storage but are not surfaced as a browsable personal library.

### Target behavior

- A **File Explorer** panel (accessible from the nav or from within the Blackboard Room) shows all files a user has ever uploaded, organized by date uploaded, with filename and file type visible.
- Files are scoped strictly to the authenticated user. No user can see another user's files under any circumstances.
- The hard cap is **300 files per user**. At 300 files, uploads are blocked with a clear message: "You've reached your 300-file limit. Delete files to upload more, or upgrade your plan for additional storage."
- Higher subscription tiers get higher caps — the exact tier thresholds are TBD (leave a `TODO: define tier caps by subscription level` comment). For now, implement the 300 cap as a config constant, not a hardcoded literal.
- From the File Explorer, a user can:
  - See the file (opens the preview pane from Slice 1)
  - Delete a file (with confirmation prompt)
  - Load a file into the current Blackboard Room capture window (if navigated from there)

### What Codex should touch

- `supabase/migrations/` — add migration: `user_files` table with columns `id`, `user_id` (FK to auth.users), `filename`, `file_type`, `storage_path`, `file_size_bytes`, `uploaded_at`. RLS: users can only select/delete their own rows.
- `client/src/components/FileExplorer.tsx` — create this component
- `client/src/pages/BlackboardRoomPage.tsx` — add entry point to open File Explorer
- `client/src/lib/fileStorage.ts` — create or extend; handles upload (with cap check before upload), delete, and list operations against Supabase Storage + the `user_files` table
- `FILE_CAP` constant should live in `client/src/lib/constants.ts` (create if not exists)

### What Codex should NOT touch

- Auth system — do not alter how users authenticate
- Any other feature's storage logic
- Subscription or billing logic — cap check reads from a config constant only; billing integration is a separate future slice

### Privacy requirement (non-negotiable)

RLS on `user_files` must be enforced at the database level, not only in client code. The migration must include RLS policies. Client-side filtering is not sufficient.

### Done when

- User can see their uploaded files in the File Explorer
- User can delete a file from the File Explorer
- Uploading a 301st file is blocked with the correct message
- RLS is confirmed: querying the table as a different user returns zero rows for another user's files
- No file data leaks between users in any query path

---

## Slice 3 — Dynamic Inner World (Phase 1: Room Shell + Canvas Screens)

### Problem statement / vision (exact, from founder)

The Dynamic Inner World is a personal space inside GestaltView where a user's most meaningful artifacts — poems, art, conversations, documents, stories — are displayed as large, immersive, interactive screens arranged in a room. The reference is the James Halliday museum in *Ready Player One*: a space curated around a single person's life, where everything in it is in motion, alive, and explorable.

The feeling is: you walk into a room and see six large screens (think oversized movie bus shelter posters, each the size of a wall). Each screen is a live canvas for one type of artifact. Things scroll. Things animate. Clicking into a screen takes you deeper into that artifact — layers, not pages.

This is especially important for neurodivergent users. Static pages flatten meaning. This space is designed for layered, non-linear exploration.

**What is explicitly NOT in scope for Phase 1:**
- VR/AR or 3D spatial room (founder decided against this — HTML surfaces only)
- Agent autonomy or agent-driven content placement (that is Phase 3+, requires explicit permission architecture first)
- Real-time collaboration

### Phase 1 target behavior

- A new route/page: `/inner-world` (or equivalent within the existing routing structure)
- The page renders a **room layout**: a dark, atmospheric canvas with 6 screen slots arranged spatially (suggested: 3 across the top, 3 across the bottom, or a slight perspective-implied arc — but keep it CSS/HTML, no WebGL)
- Each screen slot corresponds to a **content type** (suggested initial types: Art, Writing, Conversations, Documents, Resume, Favorites — these are configurable, not hardcoded to these names)
- Each screen that has content associated with it renders that content in motion:
  - Text content (poems, stories, conversations): slow vertical scroll, like a teleprompter
  - Image content: gentle Ken Burns effect (slow pan/zoom)
  - Document content: first page preview with subtle pulse
  - Empty screens: show a soft placeholder state with the content type label and a "+" to add content
- Clicking a screen opens a **deep view** of that artifact — full content, scrollable, with the ability to edit if it's an editable type (e.g., Resume)
- The room itself should feel like GestaltView: neural aurora aesthetic, dark surfaces, soft glow, fog. Not a generic dashboard.

### What Codex should touch

- `client/src/pages/DynamicInnerWorldPage.tsx` — create this page
- `client/src/components/innerworld/RoomCanvas.tsx` — the room layout component
- `client/src/components/innerworld/ArtifactScreen.tsx` — individual screen component (takes content type + content as props)
- `client/src/components/innerworld/ArtifactDeepView.tsx` — the expanded view when a screen is clicked
- `supabase/migrations/` — add migration: `inner_world_artifacts` table with columns `id`, `user_id`, `content_type` (enum or string), `title`, `content_ref` (either inline JSONB or FK to `user_files`), `display_order`, `created_at`. RLS: user-scoped.
- Routing: wire `/inner-world` in the app's router

### What Codex should NOT touch

- File Explorer (Slice 2) can be referenced to pull files into the inner world, but do not alter its internals
- Agent behavior, permissions, or autonomy logic — that is a separate future slice
- Blackboard Room

### Design constraints for Codex

- CSS animations only for motion (no canvas API, no Three.js, no GSAP unless already in the project)
- All screens must be accessible: keyboard navigable, screen-reader labels on each screen slot
- Reduced motion: `@media (prefers-reduced-motion: reduce)` must pause all animations
- Mobile: screens stack vertically on narrow viewports; the room layout collapses gracefully

### Done when

- `/inner-world` route exists and renders
- 6 screen slots are visible with the room aesthetic
- At least one screen type (writing/text) animates with scrolling content
- Clicking a screen opens the deep view
- Empty screen slots show the placeholder + add affordance
- RLS on `inner_world_artifacts` is enforced at the database level
- Animations pause under `prefers-reduced-motion`

---

## Privacy — Cross-cutting requirement

This is not a slice. This is a constraint on all three slices.

The founder's exact words: *"Privacy is going to be a big thing. If people are going to be opening up about very personal, intimate things and being vulnerable, we have to respect that with absolute vigilance when it comes to privacy and data sovereignty."*

Every database table introduced in these slices must have:
1. RLS enabled
2. A `SELECT` policy: `auth.uid() = user_id`
3. An `INSERT` policy: `auth.uid() = user_id`
4. A `DELETE` policy: `auth.uid() = user_id`
5. No admin bypass except explicit service role usage documented in a comment

Codex must not introduce any query path that could expose one user's files, artifacts, or content to another user — not in the client, not in an API route, not in a Supabase function.

---

## Slice sequencing recommendation

Implement in this order:
1. **Slice 1** (File Preview Pane) — smallest, highest immediate friction reduction, zero schema changes
2. **Slice 2** (File Explorer) — builds on Slice 1's preview component, adds schema
3. **Slice 3** (Dynamic Inner World Phase 1) — largest, builds on both prior slices for content sourcing

Do not start Slice 3 until Slices 1 and 2 are merged and validated.

---

*Spec authored from external architect vantage point — reading the founder's voice notes as product requirements and translating intent into bounded, executable implementation instructions for Codex.*
