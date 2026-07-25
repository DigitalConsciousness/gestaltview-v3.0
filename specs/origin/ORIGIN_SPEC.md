# GestaltView Origin Story Integration – Technical Spec

## Objective

To ensure that the **origin narrative** of GestaltView—and the foundational methodologies of Bucket Drops, the Loom Approach and the Personal Language Key—are preserved within the GestaltView runtime.  This spec outlines changes to the `gestaltview-v2.0` repository that will embed the origin story as a first‑class citizen of the user experience and serve as a canonical reference for future collaborators.

## Rationale

Users often interact with GestaltView without understanding its roots.  The platform was created out of necessity to organise evidence against Dunton Consulting【62†L13-L19】 and to support neurodivergent cognition through innovations like Bucket Drops and the PLK【62†L156-L167】.  Embedding this context will:

* Preserve institutional memory and prevent “telephone” distortions of the narrative.
* Provide transparency about why certain design choices (e.g., bucket drops, non‑linear loom approach) exist.
* Honour the lived experience of the founder and set expectations for new users.

## New Assets

1. **`docs/origin-story.md`** – A markdown document summarising the GestaltView origin narrative (see `ORIGIN_PROCESS.md`) with citations to transcripts and the seed prompt.  Place this under the `docs` folder.  It should be referenced in onboarding materials and from the application’s “About” section.

2. **`client/src/components/OriginStory.tsx`** – A React component that renders the origin story within the GestaltView UI.  It should support:
   - Pulling markdown content from `/docs/origin-story.md` at build time.
   - Rendering citations as footnotes or inline tooltips.
   - A responsive layout consistent with the Neural Aurora aesthetic (use existing card and typography components).  Include a “Little Things Matter” call‑out sidebar summarising the Bucket Drop and PLK methodologies.

3. **`client/src/routes/origin.tsx`** – A route definition to expose the origin story page at `/origin` or via the help/about menu.  Add navigation entry points from the Sanctuary landing page, the session recap modal and the side drawer.

4. **`metadata/origin_events.json`** – A JSON file capturing key timeline events (e.g., `"2024-08-01": "Keith moves to NYC", "2025-05-05": "Journey begins to organise evidence against Dunton", "2025-10-22": "Transcript describing origin recorded"`).  This metadata can be used by the Dynamic Inner World to render timeline markers and by future modules (e.g., interactive timelines).  The structure should include fields for `date`, `title`, `description` and optional `evidence_link` referencing transcripts in the corpus.

5. **Tests** – If the project uses automated tests, add unit tests verifying that the origin story page renders without crashing and that the metadata file contains required fields.

## Integration Tasks

1. **Documentation:**
   - Copy `gestaltview_origin_package/ORIGIN_PROCESS.md` into `docs/origin-story.md` within the repository.
   - Update `docs/SessionHandoffPacket.md` and `docs/ROOM_DEFINITIONS.md` to link to the new origin story document in the “Background” or “Overview” sections.
   - In `client/src/lib/billy-runtime-guide.ts`, add a new greeting or section summarising the origin story and emphasising that GestaltView was born out of necessity to organise evidence【62†L13-L19】.

2. **Front‑End:**
   - Create `OriginStory.tsx` with a functional React component that imports the markdown content.  Use a Markdown renderer (e.g., `@mdx-js/react` or existing markdown parser) to display the story.
   - Implement `origin.tsx` route with lazy loading to improve performance.  Add a link in the side navigation (using the existing navigation component) labelled “Origin Story”.
   - Ensure that the loading state for the origin page uses the new thinking animation component if available.

3. **Metadata:**
   - Create `metadata/origin_events.json` summarising key dates and descriptions extracted from transcripts.  Use ISO‑8601 dates and include citation fields referencing transcript files or lines for future traceability.
   - Update any timeline or recap components (e.g., `InnerWorldArtifactGallery`) to optionally overlay origin events along the session timeline.

4. **Seed Prompt Alignment:**
   - Audit existing seed prompts and modules to verify that Bucket Drops, the Loom Approach and the PLK are explicitly defined as foundational practices【63†L46-L53】【63†L49-L53】.  If missing, update the appropriate seed prompt files (e.g., `seed_prompts/Complete Seed Prompt…`) through a pull request to include these definitions.  Ensure copyright notices remain intact.

5. **Versioning & Governance:**
   - Increment documentation version numbers where appropriate (e.g., `Version: 2.1`) after adding the origin story.
   - Mention this spec in the change log (`docs/CurrentState.md`) to record that the origin narrative has been anchored into the runtime.

6. **Accessibility & Tone:**
   - Follow GestaltView’s Brand Voice guidelines by using the cheerful infrastructure voice (dry humour with heartfelt empathy) when introducing the origin story in UI copy.  Avoid technical jargon; explain the significance in plain, human terms.
   - Provide alt text for any illustrations accompanying the origin story.

## Acceptance Criteria

* The repository contains `docs/origin-story.md` with the full origin narrative and proper citations.
* Users can navigate to an “Origin Story” page from within the GestaltView UI and read the narrative without errors.
* Metadata file `metadata/origin_events.json` is parsed correctly and used to populate timeline components.
* The seed prompt and onboarding flow acknowledge the platform’s origin and methodologies.
* All new files conform to existing formatting and linting standards.