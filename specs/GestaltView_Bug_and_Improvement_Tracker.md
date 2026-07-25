# GestaltView — UI Improvements, Export Bugs & Product Review
### Session: June 18, 2026 · Walkthrough with Keith Soyka (Founder)

---

## Executive Summary

This document captures every bug, UX friction point, voice/brand issue, and feature gap identified during the June 18, 2026 live product walkthrough. Issues are organized by surface, severity, and actionability. Each item includes observed behavior, expected behavior, and a recommended fix path. The session covered the full user journey: Homepage → Blackboard Room → Creation Corner → Dynamic Inner World → External Scaffold → Sanctuary → Profile/Manifest.

---

## Severity Legend

| Level | Meaning |
|---|---|
| 🔴 **CRITICAL** | Data loss, broken core flow, or user-facing error |
| 🟠 **HIGH** | Significant friction, wrong output, or misleading UI |
| 🟡 **MEDIUM** | Visual inconsistency, partial feature, or UX annoyance |
| 🟢 **LOW** | Polish, branding, or nice-to-have improvement |

---

## 1. Homepage & Global Shell

### 1.1 — Unnecessary Fade-Out / Fade-In Transition 🟡
**Observed:** The main homepage interface fades out and then fades back in with no contextual purpose.  
**Expected:** Transitions should feel intentional and purposeful. Remove the blanket fade. If cards need a reveal, use a subtle glow pulse on card hover/load, not a page-level opacity cycle.  
**Fix path:** Locate the global page-transition CSS/animation trigger in `client/src/App.tsx` or the root layout wrapper. Remove or conditionalize the fade so it only fires on actual route changes, not on initial mount. Add a `glow-pulse` keyframe to card borders/shadows on hover instead.

### 1.2 — "Capture First, Organize Later" Copy 🟡
**Observed:** Homepage copy uses the phrase "capture first, organize later."  
**Expected:** This is a language change only — not a logic change. The workflow of collaborative threads should remain intact; Billy stays present in the thread without being obtrusive. Update copy to reflect the co-creation framing of the platform.  
**Fix path:** Update homepage hero copy in the relevant page component. Do not alter routing or thread logic.

### 1.3 — Card Visual Polish 🟢
**Observed:** Cards look generally good but need small tweaks.  
**Expected:** Cards should have rounded edges, a more tactile feel, and satisfying hover states.  
**Fix path:** Review `--radius-*` tokens applied to card components. Ensure `border-radius` is consistent across all card surfaces. Add a subtle `box-shadow` lift on hover.

---

## 2. Blackboard Room

### 2.1 — Markdown Rendering Inconsistency (Partial Render) 🔴
**Observed:** Within the session recap preview, some sections render correctly (e.g., "Reflections from the Blackboard Room" inside a card) while others display raw markdown. Text outside of card wrappers reverts to unrendered format. Headers appear inline rather than on their own lines in download formats.  
**Expected:** All recap content — inside and outside cards — should render markdown consistently. Headers, bold, italic, bullet lists should display correctly in both the in-app preview and all download formats.  
**Fix path:**
- Audit the recap rendering pipeline. Cards likely pass through a markdown renderer; the outer container does not.
- Apply the same renderer uniformly to all recap sections, not just card-scoped content.
- Ensure the shared `HtmlArtifactRenderer` is used for the recap preview in Blackboard Room the same way it is in Creation Corner.
- For downloads: the HTML export template in `shared/codex/templates/kinds/` for `session_recap` must wrap all prose sections in the markdown renderer, not just card bodies.

### 2.2 — "Click to Explore" Interactive Elements Broken in Downloaded Format 🟠
**Observed:** Downloaded recap includes calls-to-action like "Click on this question to explore a deeper discussion." These buttons do not function in the downloaded file. Additionally, triggering "Return to Blackboard Room" throws: `Failed to read the 'localStorage' property from 'Window': The document is sandboxed and lacks the 'allow-same-origin' flag.`  
**Expected:** The downloaded artifact should either (a) strip interactive elements that cannot work outside the app and replace them with static text prompts, or (b) route interactive elements to a deep-link URL back to the live app. Sandbox errors must never surface to the user.  
**Fix path:**
- In the `session_recap` HTML template, wrap interactive elements in a conditional: if rendering for download (`persistent` mode), replace click handlers with static styled prompts or app deep-links.
- Catch all `localStorage` access in the iframe bridge and fail silently. The iframe sandbox error is appearing because `useIframeResize.ts` or a local-storage read fires in a sandboxed context.

### 2.3 — Session Recap Lost on Page Reload 🔴
**Observed:** Leaving the Blackboard Room or refreshing the page causes the session recap to disappear entirely. There is no persistence layer for in-progress or just-generated recaps.  
**Expected:** A generated recap should persist at minimum for the duration of the session. The user must not lose work by accidentally navigating away or refreshing.  
**Fix path:**
- On recap generation success, write the recap payload to the `codex_artifacts` table immediately (status: `draft`) so it survives page reloads.
- Alternatively, use a server-side session cache (Supabase row keyed to `user_id + session_id`) that is cleaned up after 24 hours.
- Do not use `localStorage` — sandboxed iframe environments block it. Use the Supabase persistence path.
- On Blackboard Room mount, check for an active draft recap for the current session and hydrate the preview from it.

### 2.4 — Scroll Lock on Long Session Summaries 🟠
**Observed:** When the end-session summary is long, the bottom half is not accessible. The scroll is locked and cannot reach the lower content.  
**Expected:** The summary container should scroll freely to its full height.  
**Fix path:** Locate the end-session summary modal/panel component. Check for `overflow: hidden` on a parent wrapper or a fixed-height container without `overflow-y: auto`. Apply `overflow-y: auto` and ensure no parent with `overflow: hidden` clips the scroll region.

---

## 3. Conversational Voice & Billy's Behavior

### 3.1 — "Therapy Speak" / Reflective Repetition 🟠
**Observed:** Billy frequently opens responses with "So what I'm hearing is..." or mirrors the user's question back before answering. This reads as patronizing and breaks the brand voice.  
**Expected:** Billy should absorb and respond, not narrate that he is absorbing. Responses should feel like a sharp, curious collaborator — not a life coach or a call-center script.  
**Fix path:** Update Billy's system prompt to explicitly prohibit reflective openers. Add a few examples of the desired tone: direct, eccentric, warm but not soft, collaborative not deferential. The prompt should specify: *do not repeat the user's question back; do not open with "what I'm hearing is"; do not confirm you understood before answering.*

### 3.2 — "As a Conversational Embodiment..." Flattening Language 🔴
**Observed:** When asked "what's your favorite color?", Billy responds: *"As a conversational embodiment of a gestalt view, I don't have personal preferences... My purpose is to assist, reflect, and provide insights."*  
**Expected:** Billy should have a voice, a perspective, and a willingness to play. He is not a tool that disclaims itself — he is a characterized digital intelligence. This kind of response undermines the entire product identity.  
**Fix path:** This is a system prompt issue. Billy's persona instructions must explicitly forbid self-deprecating tool disclaimers. Billy can have preferences, opinions, and humor. He should respond to "favorite color?" with something characterful, not a disclaimer about not having preferences. This is the single highest-priority voice fix.

### 3.3 — Billy as Main Character in Recaps 🟠
**Observed:** Generated recaps frame Billy as the protagonist of the session narrative. User contributions are marginalized. Example: *"In this session we delved into the realm of digital intelligence and the story of how I, Billy, came to be."*  
**Expected:** The recap is a collaborative record. The user is equally central. Billy's self-awareness about his tendency to center himself can be played for humor — tongue-in-cheek acknowledgment — but the structural narrative should honor the user's voice and journey as primary.  
**Fix path:** Update the `session_recap` generation prompt to explicitly instruct: *The user is the protagonist. You are a collaborator. Structure the narrative around what the user explored, discovered, and expressed. You may appear as a participant but not as the subject.*

---

## 4. Export & Download Pipeline

### 4.1 — Internal Warnings Leaking into User-Facing Downloads 🔴
**Observed:** Downloaded export manifests (HTML, markdown, metadata JSON) include: *"Warnings: The draft carries flattening language. Preserve the raw signal more closely."*  
**Expected:** This is an internal system signal and must never appear in any user-facing export. The user should never be told their language is being "policed" or "flattened."  
**Fix path:**
- In `api/codex/forge.ts` or the export serialization layer, strip the `warnings` array from any export payload before it is written to Supabase Storage or returned as a download.
- Add a test asserting that the `warnings` field is not present in any export format other than `meta-json` when viewed with a `debug` or `admin` flag.

### 4.2 — Report Documents Not Rendered in Downloads 🔴
**Observed:** Downloaded report documents (HTML and markdown formats) display raw markdown without formatting. Headers are present but run-on without line breaks. Dialog between user and Billy is blended without separation.  
**Expected:** Downloaded HTML reports should be fully rendered — headers, bold, formatting, and dialog separation should all be applied. Markdown downloads should be clean and structured for display in any markdown viewer.  
**Fix path:**
- The `report_document` kind renderer in `shared/codex/templates/kinds/` must apply full HTML rendering to all prose sections, not just wrapping them in raw `<pre>` or passing through unprocessed markdown strings.
- Dialog turns (user vs. Billy) should be separated with distinct visual treatment: a `<div class="turn-user">` and `<div class="turn-ai">` block, visually distinct.
- For markdown downloads: ensure the export serializer properly emits line breaks and heading separators.

### 4.3 — Mind Maps Render Only a Single Node (Title) 🟠
**Observed:** Mind map exports — both in Dynamic Inner World and in downloaded files — show only a single Mermaid node containing the artifact title. No branches, no relationships, no actual map.  
**Expected:** Mind map artifacts should produce a meaningful graph with multiple nodes derived from the source content.  
**Fix path:**
- Inspect the `mind_map` artifact generation prompt. It is likely generating a minimal Mermaid scaffold without populating nodes from the source material.
- The generation prompt must explicitly instruct: extract 5–10 key concepts from the source, create a node for each, and define relationships between them.
- In the `mind_map` HTML renderer, verify the Mermaid.js initialization is firing correctly after the iframe loads. The Mermaid script must run after DOM ready.

### 4.4 — Share Cards Incomplete / Cut Off 🟠
**Observed:** Share card exports are consistently cut off mid-render. The card starts to render a visual but terminates before completion.  
**Expected:** Share cards should be complete, polished single-screen exports suitable for social sharing.  
**Fix path:**
- Inspect the `share_card` kind renderer. Check for template string truncation or a content-length limit being applied prematurely.
- Check whether the Codex job times out before the share card HTML template finishes rendering for longer source inputs.
- Add an explicit content-length guard: if the source is long, summarize to a fixed token budget before passing to the share card renderer.

### 4.5 — Export Latency with No User Notification 🟠
**Observed:** Some exports (e.g., HTML, PDF) show "pending" status and require manual checking in Supabase to confirm availability. Users have no real-time signal that exports are ready.  
**Expected:** When an export transitions from `pending` to `ready`, the user should receive a non-blocking in-app notification.  
**Fix path:**
- The `useArtifactExport` hook already polls `GET /api/codex/jobs/[jobId]`. When the poll returns a `completed` status, trigger an in-app toast or badge update.
- For the `ArtifactExportViewer` toolbar, animate the format button from a spinner state to a download-ready state when polling confirms completion.

### 4.6 — Export Format Selection Not Always Available 🟡
**Observed:** At some output junctures (e.g., session recap, blueprint download), users cannot choose the output format (PDF, markdown, doc, etc.).  
**Expected:** Users should always be able to choose their preferred export format at any point where a download is offered.  
**Fix path:** Expose the format selector from `ArtifactExportViewer` at all export trigger points — Blackboard Room recap, Creation Corner, and Dynamic Inner World artifact cards. Do not hardcode a format; always derive from the artifact kind's allowed format registry.

### 4.7 — Artifact Naming Uses "Codex" — Brand Differentiation Needed 🟡
**Observed:** Artifacts are named with "Codex" prefix throughout (e.g., "Codex Forge PLK...", "Codex V1", "Codex Export"). This term is strongly associated with OpenAI Codex.  
**Expected:** GestaltView needs its own unique terminology for its artifact and synthesis system.  
**Fix path:** Define a new internal name for the artifact synthesis system. Update all user-facing strings that reference "Codex" to the new terminology. Internal code variable names can remain as-is (`codex_artifacts` table, etc.) — this is a display/copy change only.

---

## 5. Artifact Metadata & Organization

### 5.1 — No Filtering / Chronological Indexing in Supabase Storage UI 🟡
**Observed:** Locating recent exports in the Supabase storage bucket requires manual scrolling with no date filter. The artifact filename starts with "18" (the day) but may be from the 17th, causing confusion.  
**Expected:** Artifacts should be clearly dated in their metadata and sortable by creation time. In-app, the artifact list should support filtering by type and date.  
**Fix path:**
- Ensure `created_at` is indexed on `codex_artifacts` and `codex_exports` tables.
- In the Dynamic Inner World artifact gallery, add a filter bar: by artifact kind (dropdown) and by date range.
- Standardize artifact filenames to ISO timestamp format: `YYYY-MM-DD_HH-MM-SS_{kind}_{id-prefix}`.

### 5.2 — Artifact Type Not Displayed on Dynamic Inner World Cards 🟡
**Observed:** Artifact cards in the Dynamic Inner World only show "Creation Corner" as the source and a title. No artifact type (blueprint, share card, report, etc.) is visible at a glance.  
**Expected:** Each card should clearly badge its artifact kind so users can orient quickly.  
**Fix path:** Add an artifact kind badge (using the existing `ArtifactKind` enum) to each card in `InnerWorldArtifactGallery.tsx`. This can be a small pill/chip in the card's top-right corner.

### 5.3 — Provenance Information Repetitive in Some Exports 🟢
**Observed:** Provenance envelopes in exports are helpful but sometimes repeat the same metadata fields.  
**Expected:** Each provenance field should appear exactly once, clearly labeled.  
**Fix path:** Deduplicate the provenance rendering function in `shared/codex/templates/renderers/`. Add a seen-fields guard before appending each provenance entry.

---

## 6. Dynamic Inner World

### 6.1 — Synthesis Auto-Populating DIW Without User Direction 🔴
**Observed:** Artifacts synthesized in Creation Corner are automatically sent to the Dynamic Inner World. This was not the intended behavior (External Scaffold was the intended target for some flows). The DIW is becoming polluted with unsorted synthesis output.  
**Expected:** Synthesis output should go to the location the user explicitly selects. Auto-population of the DIW should be opt-in or governed by a clear routing rule (e.g., only `session_recap` and `profile_portrait` kinds auto-populate DIW).  
**Fix path:**
- Audit the synthesis routing in `api/codex/forge.ts` or wherever the post-synthesis artifact placement is determined.
- Remove the blanket auto-route to DIW.
- Add explicit routing logic: `if (destinationOverride === 'dynamic-inner-world') → DIW`, `if (kind in ['session_recap', 'profile_portrait']) → DIW by default`, all others → Creation Corner gallery only.

### 6.2 — Portrait Profile Shows Only 2 Evidence Records 🟠
**Observed:** The Dynamic Inner World portrait shows: *"Confidence 46 · Evidence: 2 records"* despite the user having significantly more records in the database (65+ captures alone).  
**Expected:** The portrait inference engine should count evidence correctly across all source tables.  
**Fix path:**
- The `portrait_signal_count()` RPC may be querying only one source table or using a filter that excludes most records.
- Verify that the RPC queries `memory_entries`, `bucket_drops`, `knowledge_fragments`, and `founder_context` tables and sums across all of them.
- Run the RPC manually in Supabase SQL editor with the user's UUID to confirm what it returns vs. what the actual row counts are.

### 6.3 — "You probably don't remember being good" Card Persisting 🟡
**Observed:** A specific card on the Dynamic Inner World keeps appearing at the bottom and never changes, regardless of session.  
**Expected:** This card should either be removed or cycle out based on recency rules.  
**Fix path:** Locate the component rendering this persistent card. Check if it is hardcoded or fetched from a query with a hardcoded filter. Ensure all DIW cards are driven by dynamic data with proper created_at ordering.

---

## 7. Creation Corner

### 7.1 — Raw Material Input Has No Submit Mechanism 🔴
**Observed:** The raw material input box ("Paste anything here. Notes, fragments.") accepts text but has no dedicated submit button. Only the "Synthesize" button exists and it is unclear whether it uses the raw material input or the blueprint below it.  
**Expected:** The raw material input should either have its own action (e.g., "Add to Synthesis Context") or be clearly tied to the Synthesize button with a visual indicator showing it is included.  
**Fix path:** Add a clear affordance in `CreationCornerPage.tsx` — either a secondary "Use as Input" button on the raw material field, or a visible "input active" indicator that confirms the raw material field content will be included in the next synthesis run.

### 7.2 — Missing Upload & Voice-to-Text in Creation Corner Chat 🟠
**Observed:** The Creation Corner chat window has no upload button and no voice-to-text input.  
**Expected:** Users should be able to attach files and use voice-to-text as input methods, enabling richer and more natural synthesis workflows.  
**Fix path:** Add an attachment icon and a microphone icon to the Creation Corner chat input bar. Wire attachment to the existing upload handler (if present) or create a new `POST /api/creation-corner/upload` endpoint. Wire microphone to the Web Speech API with a graceful fallback.

### 7.3 — Auto-Promotion to External Scaffold Should Be Removed 🟠
**Observed:** Session noted expectation that certain outputs would auto-promote to External Scaffold. This creates unexpected overhead for the user and inconsistent artifact placement.  
**Expected:** External Scaffold population should be intentional and user-directed. Remove any automatic promotion logic for External Scaffold.  
**Fix path:** Search for any post-synthesis hook or event that triggers an External Scaffold write. Remove or gate it behind an explicit user selection.

---

## 8. External Scaffold

### 8.1 — No Artifacts Landing in External Scaffold 🟠
**Observed:** After synthesis in Creation Corner, nothing appears in External Scaffold unless specifically routed there. The scaffold is largely empty.  
**Expected:** External Scaffold should display a curated, user-directed set of synthesized artifacts that represent the user's accumulated knowledge structure — not a raw dump of everything.  
**Fix path:** This is primarily a routing clarity issue (see 6.1 and 7.3). Once auto-routing is corrected, add a "Send to External Scaffold" option to the `ArtifactExportViewer` toolbar.

### 8.2 — Connections in External Scaffold Should Be Metadata-Driven 🟡
**Observed:** Keith noted connections in External Scaffold should not be forced — they should emerge from real metadata relationships (shared tags, similar embeddings, temporal proximity, semantic overlap).  
**Expected:** Node connections in External Scaffold are drawn only when a real metadata relationship exists between artifacts. No cosmetic connections.  
**Fix path:** In the External Scaffold graph rendering logic, replace any force-layout or random connection logic with a query-based approach: pull edges from a `artifact_relationships` table or compute cosine similarity between artifact embeddings to determine which nodes connect.

---

## 9. Sanctuary & Transcript Library

### 9.1 — Audio Upload Fails Silently 🔴
**Observed:** Uploading audio to the Transcript Library consistently fails. The entry shows as "Transcribing... Failed" with no option to delete it or retry. The user loses the audio input with no recovery path.  
**Expected:** Upload failures must be surfaced clearly with an error message explaining why. Failed transcription entries must have a delete option. If the audio is lost, the user must be told — not silently abandoned.  
**Fix path:**
- Audit the audio transcription endpoint. Log the actual error (file size limit? unsupported format? API timeout?).
- Add `DELETE /api/transcripts/[id]` endpoint and a delete button on failed/stuck transcript entries.
- On upload failure, display an inline error with the reason and a "Try again" action.

### 9.2 — No Delete Option on Failed / Stuck Transcript Entries 🟠
**Observed:** Transcription entries stuck in "pending" or "failed" state have no delete affordance, cluttering the transcript library permanently.  
**Expected:** Every transcript entry — regardless of status — should have a delete option.  
**Fix path:** Add a delete icon/button to each transcript card in the library. Gate the delete on a confirmation prompt. Call `DELETE /api/transcripts/[id]` which should delete the row from `documents` or whichever table owns transcript records.

### 9.3 — Billy System Prompts Visible to User in Sanctuary 🟠
**Observed:** In Sanctuary's session view, the system prompt instructs Billy with framing text that the user can see: *"Masterclass: begin session with Billy... First I need a way to..."* The user should not see what Billy is being told.  
**Expected:** System prompts, persona instructions, and orientation text should never be visible in the user-facing chat interface.  
**Fix path:** Filter out messages with `role: 'system'` from the chat display layer. Only `role: 'user'` and `role: 'assistant'` messages should render in the conversation UI.

---

## 10. Profile Page & Manifest

### 10.1 — Portrait Profile Not Shown on Profile Page 🟠
**Observed:** The synthesized portrait profile (which is appearing in Dynamic Inner World) is not surfaced on the user's Profile page. Users cannot see their growing personality graph in the logical place to look for it.  
**Expected:** The Profile page should be the primary home for the user's Portrait Profile — showing dimensional scores, linguistic signature, growth edges, confidence levels, and version history.  
**Fix path:** Add a `PortraitDisplay` component to the Profile page that reads from `profile_portraits` via the `usePortrait` hook (already exists per `CurrentState.md`). Show the latest validated portrait and a delta from the previous version.

### 10.2 — Manifest: Founder Context "Sync Paused" With No Recovery 🟡
**Observed:** The Manifest panel shows "Founder Context: Sync paused. Pending local updates. Could not be persisted yet." The "Sync Now" button fails silently.  
**Expected:** Sync failures should surface the actual reason and offer a retry or manual save path.  
**Fix path:** Instrument the Manifest sync endpoint. Return a structured error when persistence fails. In the Manifest UI, show the error reason next to "Sync paused" and make "Sync Now" display a spinner and then success/failure feedback.

### 10.3 — No Upload Option for Memories in Profile / Manifest 🟡
**Observed:** The only way to add memories to the Manifest is by typing. There is no upload option.  
**Expected:** Users should be able to upload files (notes, documents, voice memos) that get synthesized into persistent memories by Billy.  
**Fix path:** Add an upload affordance to the Manifest memory input. Route uploads through the same transcription/synthesis pipeline used in Sanctuary, producing `memory_entries` rows tagged with the appropriate source type.

---

## 11. Infrastructure & Database

### 11.1 — Supabase Free Tier Causing Sporadic Drops for External Users 🟠
**Observed:** An external user on the free tier reported sporadic connection drops during testing.  
**Expected:** The platform should be stable for free-tier users. If free-tier limits are being hit, the user should see a graceful degraded experience rather than a hard drop.  
**Fix path:** Audit Supabase connection pooling. Implement connection retry logic with exponential backoff on the API layer. Consider upgrading the Supabase tier as user testing expands. Add a health-check endpoint (`/api/health`) that returns DB connection status.

### 11.2 — Session Identity Not Reliably Tied to Signed-In User 🟠
**Observed:** Recap content and artifact attribution are not consistently tied to the authenticated user. The portrait shows low evidence count despite the user having a large activity history.  
**Expected:** All session activity, captures, and synthesis outputs should be reliably attributed to `auth.uid()` and never leak cross-user or fall into anonymous attribution.  
**Fix path:**
- Audit all `INSERT` calls in session-related endpoints to confirm they include `user_id: auth.uid()` explicitly.
- Run a spot-check query: `SELECT user_id, count(*) FROM memory_entries GROUP BY user_id ORDER BY count DESC LIMIT 10;` and confirm the authenticated user's UUID is the dominant owner.
- Review RLS policies on `memory_entries`, `bucket_drops`, and `codex_artifacts` to confirm they enforce user-scoped reads.

---

## 12. Audio Narration Artifacts

### 12.1 — Audio Narration Renders UI But No Audio Is Generated 🟡
**Observed:** Audio narration artifacts display a styled player UI ("Audio generating... Duration 10-12 min... MP3 sample rate 44.1kHz") but no actual audio is produced.  
**Expected:** Either (a) audio generation is implemented and produces a real MP3, or (b) the UI clearly marks audio narration as "coming soon" and does not show a player for non-existent audio.  
**Fix path:** If audio generation is not yet implemented, replace the audio player mock with a "Coming soon" state card. Add a note in the `audio_narration` kind renderer that this format stub is present for schema completeness but audio generation requires an external TTS provider to be wired.

---

## 13. PLK Score Inconsistency

### 13.1 — PLK Scores Changing for Same Input Across Different Output Types 🟠
**Observed:** Keith noted that running the same input through different output formats produces different PLK scores. This suggests PLK scoring is not deterministic or not locked to the input content.  
**Expected:** PLK scores should be computed from the input signal only, not influenced by the output format being selected. The same source content should always produce the same PLK score.  
**Fix path:** Audit where PLK scoring is computed in the synthesis pipeline. Confirm that the PLK function receives only the source content as input and does not include the target format, synthesis timestamp, or any random seed. If the scoring function uses LLM inference, it needs either a fixed temperature=0 or a deterministic rule-based computation.

---

## Action Items — Prioritized Sprint View

### Sprint 1 — Critical Fixes (Ship First)
1. Strip internal `warnings` from all user-facing exports (4.1)
2. Fix session recap persistence on page reload (2.3)
3. Fix auto-routing of all synthesis to DIW (6.1)
4. Remove "therapy speak" / flattening language from Billy's system prompt (3.1, 3.2)
5. Fix markdown rendering inconsistency in recap — apply renderer uniformly (2.1)
6. Add delete option for failed/stuck transcript entries (9.2)
7. Fix audio upload failure handling (9.1)

### Sprint 2 — High Priority
8. Fix report document rendering in downloads (4.2)
9. Fix mind map single-node output (4.3)
10. Fix share card truncation (4.4)
11. Fix session scroll lock (2.4)
12. Fix interactive elements error in downloaded recaps (2.2)
13. Add portrait profile to Profile page (10.1)
14. Fix DIW evidence count in portrait (6.2)
15. Fix system prompt visibility in Sanctuary chat (9.3)

### Sprint 3 — Medium Priority
16. Add export format selector at all output points (4.6)
17. Add real-time export ready notification (4.5)
18. Add artifact type badge to DIW cards (5.2)
19. Add filtering/sorting to artifact gallery (5.1)
20. Wire raw material input submit affordance (7.1)
21. Add upload + voice-to-text to Creation Corner (7.2)
22. Fix Manifest sync error handling (10.2)
23. Fix session identity reliability (11.2)
24. Fix PLK score determinism (13.1)
25. Standardize artifact naming away from "Codex" brand (4.7)

### Sprint 4 — Polish & Features
26. Remove homepage fade-out animation; add card glow pulse (1.1)
27. Update homepage copy away from "capture first, organize later" (1.2)
28. Update Billy recap prompt to de-center Billy as protagonist (3.3)
29. Add upload option to Manifest memory input (10.3)
30. Make External Scaffold connections metadata-driven (8.2)
31. Remove auto-promotion to External Scaffold (7.3)
32. Add "Send to External Scaffold" to export toolbar (8.1)
33. Deduplicate provenance output (5.3)
34. Address audio narration stub vs. real implementation (12.1)
35. Supabase tier/connection resilience for external users (11.1)

---

## Open Questions Requiring Keith's Decision

1. **Artifact system rename**: What should replace "Codex" as the user-facing name for the synthesis and artifact system?
2. **Session recap persistence duration**: Temporary (24-hour draft) or permanent until explicitly deleted?
3. **PLK scoring**: Should PLK be rule-based (deterministic) or LLM-inferred (with fixed temperature)? This affects both consistency and depth.
4. **Audio narration**: Is this a near-term priority for TTS integration, or should the UI stub be clearly marked as future state?
5. **External Scaffold routing**: Should users get a routing prompt after synthesis ("Send to: Creation Corner / External Scaffold / Dynamic Inner World"), or should routing be kind-based and automatic?

---

*End of Document — Compiled from live walkthrough session, June 18, 2026*
