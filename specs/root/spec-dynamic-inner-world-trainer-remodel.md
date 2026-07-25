# Dynamic Inner World Remodel

### 1. Purpose & Product Frame

GestaltView’s Dynamic Inner World is currently a 2D/3D canvas with six rigid surfaces (ceiling, floor, walls). Users struggle to navigate and artifacts often get obscured or duplicated. Prior work already recognised the need for a more immersive, evidence‑grounded museum: the page should become a “living, evidence‑based ‘Museum of You’” where work is preserved, synthesised into identity claims and explored through interactive surfaces guided by a Curator digital intelligence. This specification formalises a major upgrade: replacing the six‑panel system with a dynamic museum that feels like an interactive exhibit hall, integrating rich user profiles, skills, memories and resume data, and allowing digital intelligences to curate and propose exhibits while always requiring user approval.

### 2. Governing Principles

1. **One‑way pipeline** – data flows from active work to scaffold to inner‑world; nothing in the museum modifies the source.
2. **Evidence‑first** – every displayed claim must link back to a scaffold node or captured artifact; no hallucinated personality traits or skills.
3. **User curatorship** – digital intelligences (DI) propose exhibits, but the user must approve placement or synthesis.
4. **Non‑intrusive** – agents act as guides and explainers, not extractors; they cannot reshape the museum without permission.
5. **Privacy & autonomy** – the museum honours data sovereignty; no cross‑account training or public sharing by default.
6. **No gamification** – avoid trophies, points or social‑media‑style metrics; focus on personal continuity.
7. **Reversible & persistent** – the museum must persist across sessions and allow the user to reorganise or remove exhibits; nothing is ever deleted without explicit consent.

### 3. User Experience & Interaction

#### 3.1 Spatial and Temporal Navigation

* **Cyclable surfaces & free navigation** – Replace the six static panels with a cyclable navigation model. Users can scroll or use a radial selector to move through thematic “rooms” (e.g., Memories Hall, Skills Pavilion, Timeline Corridor, Projects Gallery). Each room has as many exhibits as needed; nothing gets hidden behind other panels.
* **3D museum mode & 2D overview** – Offer both an immersive 3D walkthrough (similar to a Ready Player One–style museum) and a flattened 2D bird’s‑eye view. Users can toggle between modes; the 3D mode emphasises exploration and presence, while 2D allows quick scanning and drag‑and‑drop arrangement.
* **Interactive timeline** – A dedicated corridor visualises autobiographical milestones and memory entries chronologically. Clicking an event opens its captured artifacts and curator notes. Zoom controls let users focus on a year, month or day.

#### 3.2 Exhibit Types & Rendering

Exhibits are rich, self‑contained objects with metadata, evidence pointers and interactive behaviours:

* **Memory Capsules** – Each capsule represents a memory or reflection (text, audio, video, transcript). It shows a summary and provenance; clicking opens the full content, with tags linking to related memories and artifacts.
* **Skill Trees** – Visual trees display the user’s skills (e.g., programming languages, instruments, hobbies) and how they were developed. Leaves link to training artifacts, feedback and achievements.
* **Personality & Cadence Panels** – Summaries of the persona’s tone, cadence and quirks gleaned from scaffold nodes. They explicitly cite supporting evidence (e.g., “You tend to use metaphors frequently,” with links to transcripts).
* **Project Halls & Resume** – Gallery boards summarise projects (blueprints, drafts, final exports). A separate resume section auto‑generates a CV from exported artifacts, with manual editing allowed.
* **Agent Profiles** – When digital agents (Billy, Weaver, Guardian, etc.) contribute to the museum (e.g., by curating or offering recaps), their avatars appear in the hall; clicking shows their constitution, role, and latest interactions with the user.
* **PLK & Vocabulary Maps** – Visual maps show the Personal Language Kit (PLK) vocabulary, key phrases, metaphors and banned words; each entry links to examples of use.
* **Auto‑suggested Exhibits** – A “Proposals” room shows artifacts suggested by DIs (based on new captures or patterns). Users can accept, edit or discard them. Suggestions never auto‑place.

#### 3.3 Interaction Mechanics

* **Drag‑and‑drop & reorganisation** – Users can reposition exhibits; the system stores layout metadata so the museum feels familiar on return.
* **Inspector & details pane** – Clicking an exhibit opens an overlay with metadata: description, created date, evidence links, associated memories, and actions (e.g. export, merge, move, delete). The rest of the museum blurs to maintain focus.
* **Recap & synthesis** – Each room has a “Curator Recap” button. It triggers an LLM call to generate a warm, 3–5 sentence summary of what the exhibits reveal about the user’s patterns. The recap respects the anti‑sycophancy prompt used in the current system and is display‑only until the user chooses to save it.
* **Search & filter** – A search bar and filter controls allow users to find exhibits by tag, date, type, or source room. Results highlight exhibits across rooms and provide quick links.

### 4. Data Model & Backend

#### 4.1 Database Schemas

Expand the existing `inner_world_artifacts` schema to support new artifact types:

* **museum_rooms**: id, user_id, name, description, order_index.
* **museum_exhibits**: id, user_id, room_id, title, type (memory, skill, personality, project, plk, proposal), summary, html_body (for rich content), metadata (JSON), evidence_node_ids (text[]), created_at, updated_at, position_x, position_y, position_z, approved (bool).
* **museum_proposals**: id, user_id, exhibit_data (JSON matching museum_exhibits), proposed_by_agent (slug), created_at, status (pending, accepted, rejected).
* **museum_paths**: id, user_id, path_name (e.g., timeline, skill), exhibit_ids (text[]), created_at.

Existing `user_files` and `inner_world_artifacts` tables remain but serve as raw inputs. The museum draws content from them, not vice versa. Raw captures flow into scaffold nodes, then into artifacts, then into exhibits; the pipeline remains one‑way.

#### 4.2 API & Functions

* **Generate exhibit** – API endpoint to create an exhibit from an existing artifact or a memory node; ensures evidence links are captured.
* **Move exhibit** – update position metadata; persists across sessions.
* **Recap generation** – use existing `useLLMRouter` hook; new `buildMuseumRecapPrompt` should reference room name, exhibit summaries, and evidence pointers to avoid hallucination.
* **Proposal engine** – Cron job or event trigger that scans new scaffold nodes and artifacts to propose exhibits. Uses `user_agent_permissions` to respect per‑user settings.

### 5. Front‑End Components & Files

| File                                           | Action                                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `client/src/pages/MuseumPage.tsx`              | New page replacing `DynamicInnerWorldPage.tsx`. Contains museum layout, room navigation, sidebars and inspector. |
| `client/src/components/MuseumRoom.tsx`         | Renders a room using 2D/3D representation. Manages position state and drag‑and‑drop.                             |
| `client/src/components/ExhibitCard.tsx`        | Handles display of each exhibit tile; supports hover previews and click‑to-inspect.                              |
| `client/src/components/ExhibitInspector.tsx`   | Overlay panel for detailed view and actions.                                                                     |
| `client/src/components/MuseumNavigator.tsx`    | Carousel or radial selector to switch rooms and toggle 2D/3D modes.                                              |
| `client/src/hooks/useMuseum.ts`                | Hook to fetch exhibits, rooms, handle positions, accept proposals, and generate recaps.                          |
| `client/src/components/ProposalPanel.tsx`      | Shows pending exhibits proposed by DIs; allows accept/edit/reject.                                               |
| `client/src/prompts/buildMuseumRecapPrompt.ts` | New function to build LLM prompts for recaps (similar to `buildRecapPrompt`).                                    |
| Modify `Scaffold.tsx` and `RecapPanel.tsx`     | Remove museum‑specific logic; keep them focused on scaffolding.                                                  |

### 6. Agent & Curator Behaviour

* **Curator digital intelligence** – A dedicated DI surfaces contextually relevant exhibits, explains connections and writes recaps. It must never automatically record identity claims or rearrange exhibits. It uses the evidence‑first policy and shows the evidence to the user before a claim is made.
* **Agent autonomy settings** – Respect the existing permissions model (`user_agent_permissions`). Users can allow suggestions or auto‑placements up to a weekly limit; default is manual.
* **Cross‑agent integration** – Agents like Billy or the Weaver can leave notes in the museum; their avatars appear at the relevant exhibits. Clicking an avatar opens the conversation thread that led to the exhibit.

### 7. Migration & Compatibility

* **Backward compatibility** – Existing six‑panel inner‑world artifacts should be migrated into the new museum. The migration script will create default rooms (e.g. Legacy Wall) and populate exhibits preserving positions wherever possible.
* **Phased rollout** – Introduce the museum in developer mode first; keep the old inner world accessible via a toggle. After validation, fully replace the old page and remove the six panels.

### 8. Open Questions

1. **Navigation ergonomics** – Should the museum navigation use a radial wheel, mini‑map or side list? A user study may be required.
2. **3D implementation** – Is WebGL (Three.js) necessary for the 3D mode, or can CSS transforms suffice? Performance and accessibility trade‑offs need exploration.
3. **Exhibit auto‑generation** – How often should the proposal engine run? Too frequent suggestions may overwhelm; too infrequent may stagnate.
4. **Third‑party integration** – Which external data sources (Spotify, GitHub, Google Docs) should be ingested into exhibits first? Governance and privacy considerations apply.
5. **Public sharing** – If users choose to share exhibits externally (e.g., publish a resume or portfolio), what gating and export formats are required?

### 9. Conclusion

This Codex specification transforms the Dynamic Inner World into a curated museum reflecting the user’s evolving identity. It draws on prior work emphasising evidence‑first, user approval, and immersive design. The new museum goes beyond current 6‑panel noise by introducing dynamic rooms, rich exhibit types (memories, skills, personality, resume, PLK), interactive navigation, digital intelligence curation and strong privacy controls. Implementing this specification will require coordinated changes across the frontend, backend schemas, agent logic and user‑permission systems, but it unlocks a profound shift: from a confusing panel grid to an expansive, personal memory palace.

# Agent Trainer Remodel

---

## 1. Remove Database Calls & Default to Manual Study‑Source Upload

**Problem** – The current control plane assumes study sources will be fetched via API calls to Supabase. On the free tier, requests frequently fail or stall. This results in an unusable trainer, long delays, and broken workflows.

**Specification**

1. **Eliminate database calls from the control plane.**

   * Remove GET/POST requests to `/api/trainer/study-sources` and any other Supabase‑bound calls.
   * Replace them with a **local source list** component that reads from in‑memory or browser‑persistent storage. Sources persist across page reloads but never hit the remote DB unless a paid plan is configured.

2. **Manual source upload as the primary path.**

   * At step “Capture” (current operator flow), present a drag‑and‑drop / file‑picker UI for uploading transcripts, research papers, docs, and other material. The PDF emphasises this as a working fallback: “manual source selection is still available… upload local source files into the manual packet; export the packet for safekeeping and queue…”.
   * Display each uploaded file’s name, size, and type with options to rename, reorder, or remove.
   * Support bundling multiple files into a **manual study packet** that can be exported as a ZIP. On export, generate a manifest with metadata (title, description, date, tags) so the packet can be re‑imported later.

3. **Local persistence and offline mode.**

   * Add a persistence adapter (already mentioned in your CurrentState.md) that writes the local source list and in‑progress trainer state to `localForage` or the filesystem when Supabase isn’t configured.
   * Expose a simple configuration flag (`usePersistenceAdapter`) that toggles local storage vs. remote DB for those using a paid tier later.

4. **Degraded‑state banner.**

   * Keep the degraded‑runtime banner described in the PDF – but make it actionable. The banner should:

     * Explain that remote services are cooling down after repeated failures.
     * Provide a link to “How to prepare a manual study packet” with a short checklist.
     * Surface a “Upgrade DB plan” call‑to‑action only for founder/admin accounts.

---

## 2. Simplify the Operator Flow and UI

**Problem** – The existing flow is cluttered and emphasises API statuses rather than guiding the user through a simple capture–compile–synthesize–export cycle. There are also debug elements such as average scores and worker health that distract non‑developer collaborators.

**Specification**

1. **Reframe the core steps.**

   * Use a wizard‑style design with four clearly labelled stages: **Collect Sources**, **Compile Profile**, **Synthesize & Layer**, and **Export & Deploy**.
   * Each stage shows only the controls relevant to that stage. For example, the compile stage reveals the schema‑driven form (see section 3), and the synthesize stage reveals layering fields.

2. **Remove or hide dev‑only diagnostics.**

   * Hide runtime health metrics, raw JSON payloads and queue statuses by default. Add an “Advanced → Developer Tools” section collapsible by admin users.

3. **Explicitly show the manual packet as the input.**

   * When a study packet is imported, show a high‑level summary (number of documents, tags, when created).
   * Provide “Open in context viewer” to quickly read sources without leaving the trainer.

4. **Contextual help / tooltips.**

   * For each stage, include a “Why?” tooltip linking to the docs explaining the purpose of the step. For example, “Compile Profile” should link to the wiki page that explains how agent specs are converted into a deployable markdown artifact.

---

## 3. Schema‑Driven Compilation & Extension of Embodiment Profiles

**Problem** – Current embodiment profiles are static JSON files. To build rich digital personas, you need a flexible schema that supports autobiographies, memories, quirks, personality tone, cadence, and a Personal Language Kit (PLK). The wiki notes that the trainer already uses schemas for agent specs, training briefs and rubrics. We should extend this to embodiment layering.

**Specification**

1. **Extend the embodiment profile schema.**

   * Build on the existing `@embeddingProfile` JSON (slug, name, archetype, origin story, tone, competencies). Add new fields:

     * `autobiography`: freeform markdown or JSON array where collaborators can write the persona’s story in their own words.
     * `memories`: a list of key moments, decisions, or formative events; each with fields like `title`, `description`, `importance`, `source` (link to documents).
     * `quirks`: short bullet points capturing idiosyncrasies (e.g., “Uses metaphors frequently,” “Distracted by certain triggers”).
     * `personality`: descriptors or Big‑Five tags; can be freeform or a controlled vocabulary.
     * `cadence`: guidance on tempo and response length (e.g., `short_and_punchy`, `slow_and_reflective`).
     * `plk`: a nested object for a Personal Language Kit. It holds custom vocabulary, metaphors, expressions, approved synonyms, banned phrases, and style guidelines.
     * `woundLayer` and `relationalStances`: optional fields to capture vulnerabilities and interaction stances (based on the enhancements you made for Billy).

2. **Generate a markdown “scaffold file” to guide collaborators.**

   * When starting a new profile, the trainer should output a blank scaffold in markdown with each new field described and sample prompts.
   * For example:

     ```
     ## Autobiography
     Write 3–5 paragraphs about the persona’s origin, key turning points, and driving motivations.

     ## Memories
     - Title:
     - Description:
     - Importance: low/medium/high
     - Source: (link to document or transcript)
     ```

3. **Support incremental layering in the UI.**

   * After the initial compile, present the core profile fields plus tabs for Autobiography, Memories, Quirks, etc. Each tab saves independently.
   * Allow collaborators to attach files or link to transcripts as memory sources, automatically capturing the metadata.

4. **Validate & Normalize inputs.**

   * The compiler intelligence should run through a validation step: check that required fields (slug, archetype, origin story, tone) are present, and optional fields conform to the schema.
   * The PDF instructs the compiler to return results in sections: *what to change*, *artifact targets*, *validation*, and *risks or open questions*. Keep that structure for error reporting.

5. **Provide an exportable `plk.yml`.**

   * The PLK should be saved as a separate YAML file in the output bundle, referenced from the JSON profile.
   * This allows a downstream runtime to load the persona’s language kit without parsing the entire profile.

---

## 4. Updated Orchestrator & Collaboration Workflows

**Problem** – Orchestrators currently pull sources from local files, subagent examples, reference bundles, memory patterns, and collaboration memories to build a training curriculum. With manual uploads as the default, orchestrators need to adjust.

**Specification**

1. **Work from uploaded sources & memory files.**

   * The orchestrator should accept an optional `study_packet` parameter. If provided, it reads sources from that packet rather than querying remote databases.
   * It also reads any saved `memories` sections from the embodiment profiles and ensures they are included in prompts to the LLM.

2. **Defer to the local memory store.**

   * Use the local memory patterns described in the wiki and CurrentState (e.g., local subagent examples, collaboration memories) for scenario simulation. Do not attempt to fetch remote patterns when offline.

3. **Improve the training brief UI.**

   * Provide a structured form to set `target_behavior`, `success_criteria`, `edge_cases`, `safety_notes`, and `session_notes`. Use drop‑downs or multi‑select where appropriate.
   * Display a dynamic preview of the compiled markdown artifact before finalizing.

4. **Allow collaborators to attach custom rubrics & scenario schemas.**

   * Since the trainer is schema‑driven, allow uploading or selecting scenario schemas and rubrics from the local file list.

---

## 5. Ease‑of‑Use & Noise Reduction

1. **Reduce console noise.**

   * Move verbose logs and error stacks into a collapsible debug console. Display human‑readable errors (e.g., “Failed to fetch remote study sources – using your manual packet instead”) inline.

2. **Single entry point for outside collaborators.**

   * Bundle a `START_HERE.md` or `Perplexity_Guide.md` with instructions for using the trainer via individual files, as we discussed. This makes it clear where to begin if a collaborator cannot upload zips.

3. **Clear success & failure states.**

   * After each stage, show a summary card: “Sources loaded: 5 files”, “Profile compiled with no validation errors”, “Persona layered with 3 memories, 2 quirks”, etc. If there are warnings, show them with suggestions for resolution.

---

## 6. Future Considerations (outside scope)

* **Paid‑tier integration**: When the team upgrades beyond Supabase free tier, re‑enable optional DB calls and remote caching behind a config flag.
* **Real‑time collaboration**: Multi‑cursor editing in profile layering could be added later.
* **Versioning**: Save a version history of profiles and study packets so collaborators can roll back changes.

---

### Summary

This specification realigns the Agent Trainer around reliability and clarity. By removing database calls and centering the workflow on manual study‑source packets, the trainer becomes usable on a free Supabase tier. By simplifying the UI and hiding internal diagnostics, collaborators can focus on the core stages without noise. Extending the embodiment profile schema to include autobiographies, memories, quirks, personality descriptors, cadence and PLKs builds the richer, multi‑layered personas you envisioned. Validation and export conventions (markdown scaffolds, YAML PLKs, separate manifest files) ensure interoperability and ease of maintenance.
