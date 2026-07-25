## 1. File Preview + Capture in Blackboard Room

You want: drop a file → see it rendered inline → optionally pipe it into a capture, not copy‑paste raw text. 

### Frontend pieces

Use what you already have: React + TS + room pages. Concretely in `BlackboardRoomPage.tsx` and a `FilePreviewPane` component. 

Core components:

- `<FileUploadDropzone>` – wraps your existing upload logic.
- `<FilePreviewPane>` – shows the active file with appropriate renderer.
- `<CaptureComposer>` – the text/markdown editor you already use; gets a “Insert to capture” button fed from the preview, not the other way around.

Renderers inside `FilePreviewPane`:

- **Markdown**:  
  - `remark` + `remark-gfm` + `rehype-react` to render MD into React components.
  - Optional: `react-syntax-highlighter` for code blocks.
- **PDF**:  
  - `react-pdf` for page thumbnails and basic reading.
- **Plain text / other**:  
  - simple `<pre>` with monospaced font as fallback.

Routing logic:

- Based on MIME type or extension from Supabase Storage metadata:
  - `.md`, `.markdown` → markdown renderer.
  - `application/pdf` → `react-pdf`.
  - everything else → text / download.

Minimal flow change:

1. Upload file → store in Supabase Storage (see next section) and create a `user_files` row.
2. Show it immediately in `FilePreviewPane`.
3. Provide:
   - “Insert rendered text into capture” (for markdown/text) – pipes HTML→MD or MD directly into your capture window.
   - “Link into capture” – just a reference to the file ID/URL so the recap engine can pull contents later.

This alone kills the “upload → raw text below → copy/paste into capture” anti-pattern. 

***

## 2. File Explorer Backed by Supabase

You described a per‑user File Explorer with a ~300 file cap and tiered limits. 

### Data model

In your Supabase project:

- Table `user_files`:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users)
  - `name` (text)
  - `mime_type` (text)
  - `size_bytes` (bigint)
  - `storage_path` (text) – pointer into Supabase Storage bucket
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - `room_origin` (enum: `blackboard`, `creation_corner`, `dynamic_inner_world`, etc.)
  - `tags` (text[] or jsonb) – `["resume", "poem", "session-recap"]`

- Storage bucket `user-files` with path convention:
  - `user-files/{user_id}/{file_id}/{originalName}`

Enforce per‑user cap via:

- DB constraint & check function or
- server API guard in your upload endpoint (count `user_files` where `user_id = current_user`, reject if ≥ tier limit).

### UI component

A single `FileExplorer` React component:

- Left column: folders/filters (by tag, type, room_origin).
- Right grid: file cards (name, type, created_at, size, origin).
- Actions:
  - “Open in Blackboard Room” → set current session file.
  - “Pin to Inner World” → mark as candidate artifact to appear on a screen.
  - “Delete” → delete Storage object + `user_files` row.

The same component can be used:

- as a drawer inside Blackboard Room, and  
- as a side panel inside Dynamic Inner World for selecting which artifacts show on which screens.

***

## 3. Dynamic Inner World Screens (HTML Surfaces)

From Manhattan_Mornings + Room Definitions, the museum is: a room with ~6 big canvases, each an HTML surface showing a living artifact (resume, poem, recap, code demo, etc.), not VR, not generic cards. 

### Representation of artifacts

Define an `inner_world_artifacts` table:

- `id` (uuid)
- `user_id` (uuid)
- `title` (text)
- `summary` (short text – “what this is” in one line)
- `source_file_id` (uuid, FK to `user_files`, nullable)
- `html` (text) – fully rendered artifact output (recaps, blueprints, etc.)
- `thumbnail_url` (text, optional)
- `created_at`, `updated_at`
- `origin_room` (`blackboard`, `creation_corner`, etc.)
- `evidence_node_ids` (text[] – pointers into Scaffold nodes that support this artifact)

These artifacts are what your recap generator and Creation Corner already want to emit as `pdfHtml`/`html` lanes. 

### Frontend layout

In `DynamicInnerWorldPage.tsx` (explicitly cleared for rebuild) render:

- A **spatial layout** component that takes an array of artifacts and positions them:
  - simplest version: CSS grid with oversized tiles (2x3, 1x2, etc.)
  - next step: a 2D canvas layout using something like `framer-motion` for physics/hover and `react-use-gesture` for drag.

Each “screen”:

- Shows title, summary, a little neural‑aurora style border, created‑at, maybe one tag (e.g. `recap`, `resume`, `poem`).
- On click: opens a full‑size overlay with the `html` rendered inside an `<iframe>` or via `dangerouslySetInnerHTML` with a sanitization step.

HTML rendering:

- Keep artifact HTML self‑contained: inline styles, no external JS.
- On the viewer side, sanitize HTML using `dompurify` (or similar) before injecting.
- Consider sandboxed `<iframe>` if you start allowing user-authored JS.

### How artifacts arrive

Two main feeds, consistent with your earlier thinking: 

1. **Blackboard Room recap trigger**  
   - SessionRecapGenerator (you already scoped this): collects `captures` and `conversationHistory`, calls LLM, gets back a complete HTML recap, writes `inner_world_artifacts` row.

2. **External Scaffold node trigger**  
   - From `ExternalScaffoldPage`, when you click a node’s “Generate recap” action, call the same backend route with `{seedNodeId}`; the engine builds HTML around that one node.

Same engine, two front doors; the museum is just a viewer of these artifacts.

***

## 4. Agent Autonomy & “Thoughtful Moves”

You want agents to sometimes act first—in the museum or file space—but only with explicit permission. 

Minimal, safe mechanism:

- Per user settings table `user_agent_permissions`:
  - `can_suggest_artifacts` (bool)
  - `can_auto_place_artifacts` (bool)
  - `max_auto_artifacts_per_week` (int)
- Background job (cron) that:
  - scans recent Scaffold nodes + sessions,
  - proposes new artifacts (recaps, pattern cards),
  - but **never writes them live**; instead, writes to `proposed_inner_world_artifacts` table.
- In Dynamic Inner World:
  - a subtle “New suggestions” indicator shows when proposals exist.
  - user can accept/drop each; accepting moves it into `inner_world_artifacts`.

This gives you the “agents experimenting” energy you want without your stuff rearranging itself when you’re not looking.

***

## 5. Privacy, Security, and Data Path

You explicitly called out: vulnerable material, strong data sovereignty, no creeping exposure. 

Concrete guardrails:

- **Auth**: use Supabase Auth across all file/inner‑world tables, RLS by `user_id`.
- **Buckets**:  
  - `user-files` — private, RLS‑guarded signed URLs only.  
  - optionally `public-artifacts` — for explicitly shared items (export from Inner World → GATE).
- **RLS policies**:
  - `user_files.user_id = auth.uid()` for all CRUD operations.
  - same pattern for `inner_world_artifacts`.
- **Logging & access**:
  - track accesses to artifacts in a `artifact_views` table if you want an audit trail (later).
- **No cross‑account training**:
  - if/when you train models on user content, only do it in per‑user, non‑pooled workflows (what you’re already doing in Agent Trainer).

***

## The next real thing to grab onto

To keep this from ballooning, one grounded slice:

1. **Implement `user_files` + Storage bucket + RLS.**
2. Add `FileExplorer` + `FilePreviewPane` to Blackboard Room:
   - upload
   - preview MD/PDF
   - insert into capture
3. Wire a minimal `inner_world_artifacts` table and a tiny Dynamic Inner World page that just shows a grid of artifacts with HTML in a modal.

Once those three are real, the recap generator and the fancier museum layout have somewhere concrete to land, and you can feel the thing instead of just imagining it.
