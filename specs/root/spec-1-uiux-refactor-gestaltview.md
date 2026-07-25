# SPEC-1-UIUX-Refactor-GestaltView

## Background

GestaltView is a consciousness‑serving AI ecosystem designed to close the Recognition Gap—the chasm
between a person’s internal complexity and how the world sees them. The platform uses Billy AI and a
structured corpus to externalize and preserve a user’s inner world, enabling nuanced interactions. Recent
evaluation revealed that the home page reads like a consulting pitch rather than the portal to a
consciousness platform. Several modules exist as text descriptions or prototypes but lack complete React
surfaces, and the existing Alzheimer’s Legacy module buries its Daydreamer companion mode. To align the
UI with the philosophical intent and implement the two‑tier module architecture described in
SPEC‑1‑GESTALTVIEW, this project will refactor the home page, create a consulting page, build three new
module pages (Rapid Prototype Engine, Adaptive Layout UI, Creation Corner), elevate Daydreamer within
the Alzheimer’s module, and rename certain modules to remove diagnostic labels.

## Requirements

**Must have (M)**
- Home page refactor: Strip consulting content and theoretical language. Present a clear orienting
statement about GestaltView’s purpose, keep the Billy widget and bucket‑drop capture, and display
tier‑based module navigation using cards. No scrolling walls of text.

- Consulting page: New page at /consulting displaying founder biography, Recognition Gap
thesis, theories, forensic moat, governance structure, and partnership/investment framing. Use Inter
font and an authoritative tone.

- Rapid Prototype Engine page (/rapid-prototype): Structured surface for idea intake, scope
extraction, prototype blueprint, and push‑to‑corpus functionality. Use orange accent and animate
scope reveal. Accessible via navigation cards on the home page.

- Adaptive Layout UI page (/adaptive-layout): Demonstrate cognitive‑adaptive layouts. Provide
a state selector (Focused, Scattered, Creative, Low Energy), real‑time layout preview, apply‑to‑session
action, and profile builder. Use teal accents and adapt the page itself as state changes. Leverage the
existing AdaptiveLayoutSystem component from the refactor folder in this repo, which adjusts UI based on cognitive
state and energy levels.

- Creation Corner page (/creation-corner): Synthesis surface where users answer "What do you
want to create?" Show context weaver output from their unified profile, recommend modules to
engage, record the artifact with timestamp and links to profile threads, and display a bucket‑drop
sidebar. Use purple accent and a subtle particle background.

- Daydreamer elevation: Add DaydreamerMode.tsx component and refactor
AlzheimersLegacyPage.tsx to have three modes (Life Tapestry, Heirloom Companion,
Daydreamer) with warm aurora palette and gentle transitions. Update alzheimers/pages/
index.tsx accordingly.

## 1
## 1.
## 2.
## 3.
## 4.
## 23
## 5.
## 6.
## 1

**Module renames and route migrations**: Implement the canonical names (External Scaffold of You,
Pull String, Your Living Legacy, etc.) with new pages and redirect shells for old routes. Update
navigation and App.tsx route registry. Follow the pass sequence in the spec.

**Pass sequence and CurrentState.md updates**: Perform full file replacements in discrete passes
(home refactor, consulting page, new module pages, Alzheimer’s refactor, module renames) and
update docs/CurrentState.md after each pass with files touched, routes added, and build
status.

**Design system adherence**: Use Neural Aurora tokens (primary teal #00D4FF, dim teal #006B7F,
glow rgba(0,212,255,0.35), dark background #0A0F14, card background #050A0E, black
#000000). Use JetBrains Mono for UI and Billy surfaces; Inter for consulting pages. Use accent
colours per module (orange for Rapid Prototype Engine, teal for Adaptive Layout UI, purple for
## Creation Corner).

**Philosophical compliance**: All copy and interactions must honour the constitutional invariants—
Never Look Away, Preserve Whole Language, Hold Paradox, Bucket Drop Priority, Serve
Consciousness. The platform should feel like an arrival into a consciousness‑serving space rather
than a sales pitch.

### Should have (S)

**Idea push to corpus**: From the Rapid Prototype Engine, allow packaging of blueprint as a Markdown
file and pushing it to the corpus repository via API.

**Layout profile persistence**: Store saved adaptive layout profiles in Supabase (layout_profiles
table) keyed by user ID, with a JSON config column representing user preferences and state.

**Creation Corner artifact persistence**: Store created artifacts in Supabase (creation_artifacts
table) with fields for user ID, prompt, context threads (JSON), suggested modules, artifact type,
artifact data (JSON or text), and timestamps.

**Internationalisation support**: Prepare the new pages for localisation by externalizing strings and
using a translation provider.

### Could have (C)

**Voice input across all capture surfaces**: Integrate whisper‑like voice transcription on bucket‑drop,
Rapid Prototype, and Creation Corner fields if browser APIs permit.

**Particle field in Creation Corner**: Use Babylon.js to render a responsive particle field modulated by
the user’s Personal Language Key resonance scores.

**AI‑assisted scope extraction**: Provide a simplified fallback if Billy is unreachable (basic heuristics to
extract nouns and verbs).

### Won’t have (W)

**Backend authentication changes**: Authentication flow remains unchanged; this refactor does not
touch login/registration screens.

**Analytics integration**: No instrumentation beyond existing logging.

**Full Dreamweaver integration**: Creation Corner may reference Dreamweaver threads but does not
embed the Dreamweaver UI in this pass.


## Method

## System Architecture Overview

The platform is a React 19 single‑page application using Wouter for client‑side routing, Tailwind CSS v4 for
styling with the Neural Aurora design system, and a Supabase backend. Billy AI is accessed via serverless
functions that orchestrate multiple LLMs. The refactor introduces new pages and components as illustrated
below.

## @startuml
skinparam style strictuml
skinparam shadowing false
skinparam linetype ortho
actor User
rectangle "GestaltView Client" {
component HomePage
component ConsultingPage
component RapidPrototypePage
component AdaptiveLayoutPage
component CreationCornerPage
component LivingLegacyPage as LivingLegacy
component BillyWidget
## }
rectangle "GestaltView API" {
component BillyFunction
database Supabase
## }
User --> HomePage : navigate
User --> ConsultingPage : navigate
User --> RapidPrototypePage : idea intake
User --> AdaptiveLayoutPage : choose state
User --> CreationCornerPage : create
HomePage --> BillyWidget : present chat
RapidPrototypePage --> BillyFunction : send idea for scope extraction
RapidPrototypePage --> Supabase : store prototype blueprint
AdaptiveLayoutPage --> Supabase : load/save layout profiles
CreationCornerPage --> BillyFunction : context weave
CreationCornerPage --> Supabase : store creation artifact
LivingLegacy --> BillyFunction : daydreamer interactions
BillyWidget --> BillyFunction : chat
BillyFunction --> BillyWidget : responses (preserve language, hold paradox)
## @enduml
## Database Schema Additions
layout_profiles1.
## 3

columntypeconstraintsdescription
iduuid
primary key, default
uuid_generate_v4()
unique identifier
user_iduuid
not null, foreign key to users
user owning the profile
nametextnot nulluser‑provided name for the profile
state_configjsonbnot null
full layout preferences (theme,
density, motion settings, state
selector)
created_attimestamp
default now()
creation timestamp
updated_attimestamp
default now()
last update timestamp
rapid_prototypes
columntypeconstraintsdescription
iduuid
primary key, default
uuid_generate_v4()
unique identifier
user_iduuid
not null, foreign key to users
user who submitted the idea
idea_texttextnot nullraw idea intake
scope_jsonjsonbnot null
structured scope output from Billy
(function, dependencies, outputs,
tier)
blueprint_jsonjsonbnot null
proposed component tree, route,
Supabase tables
created_attimestamp
default now()
creation timestamp
creation_artifacts
columntypeconstraintsdescription
iduuid
primary key, default
uuid_generate_v4()
unique identifier
user_iduuid
not null, foreign key to users
user creating the artifact
prompttextnot null
text prompt asked in Creation
## Corner
context_jsonjsonbnot null
threads surfaced from unified
profile (PLK, bucket drops, etc.)


columntypeconstraintsdescription
suggestionsjsonbnot null
recommended modules based on
Billy’s analysis
artifact_typetextnot null
mind-map, image, video, poem,
daily-journey, etc.
artifact_datajsonbnot null
generated artifact contents (could
be base64 for media)
created_attimestamp
default now()
creation timestamp

### Front‑End Component and Routing Design

The refactor introduces the following pages and components. Each page uses full file replacement and
registers its route in App.tsx.

**HomePage**: Imports BillyWidget, ModuleCard components, and BucketDrop capture. Renders a hero
section with a plain‑language orienting statement (“A place to externalize and work with your inner
world”). Renders a card grid grouped by Tier 1 (Intervention modules) and Tier 2 (Expression
modules), using names from MODULE‑NAMING‑CANONICAL.md. Each card links to its route. Uses
Tailwind classes to apply dark background, glow overlays and radial scanlines per design system. All
removed copy is moved to ConsultingPage.

**ConsultingPage**: Receives narrative content; uses Inter font and a slightly wider content area.
Divided into sections (Origin Story, Recognition Gap, Forensic Moat, Governance, Partnerships). Each
section uses <section> tags and standard headings. Provide next/previous anchors.

**RapidPrototypePage**: Contains four sections: IdeaIntake (a text/voice input controlled by state),
ScopeEngine (a panel that appears after submission; calls api/rapid_prototype/scope which
forwards to BillyFunction; displays returned fields with skeleton loaders), PrototypeBlueprint (shows
the blueprint JSON elegantly; uses a Card), and CorpusPush (a button that triggers
supabase.insert('rapid_prototypes')). Use useState and useEffect to manage
phases. Use orange accent colours and motion.div for scope reveal animation. The page uses
responsive grid layout.

**AdaptiveLayoutPage**: Renders a state selector (radio buttons with icons), an adaptive preferences
panel (theme switcher, density slider, motion toggles), and an AdaptiveLayoutPreview that wraps the
AdaptiveLayoutSystem component from the zip. When the user changes state or preferences,
update local state and call saveProfile() if “Save” is clicked. Provide “Apply to Session” button
that writes to Billy context via API. Use teal accent, scanlines and glow backgrounds. Optionally add
an animated bar reflecting energy level.

**CreationCornerPage**: Renders a large prompt text area with a microphone button for voice input.
On submit, call api/creation/context_weaver to retrieve context threads; show them in a
scrollable card list. Render module suggestions as clickable chips linking to module pages. Provide a
“Create Artifact” area where the user selects artifact type (dropdown) and clicks “Create”; call api/
creation/synthesize_artifact to generate output. Show progress bar. When done, display the
artifact preview (use a dynamic component that switches between text, image, video etc.). Provide an
“Export” button that downloads the artifact. Use purple accent and optionally a subtle canvas of
particles in the background.

**LivingLegacyPage**: New page for “Your Living Legacy”. Contains three sub‑modes (Living Record,
Daydreamer, Curation). Provide a navigation bar at the top; each mode is a component.
LivingRecord aggregates life events, bucket drops and Museum artifacts; Daydreamer uses
the new DaydreamerMode component; Curation allows users to choose which artifacts become
part of their Living Legacy. Use warm aurora palette (define a new CSS variable set
--aurora-warm with amber and coral gradients) and gentle transitions between modes.

**DaydreamerMode**: Lives in client/src/components/alzheimers/DaydreamerMode.tsx.
Renders an ambient background (slow moving aurora gradient). Presents a memory fragment from
the Alzheimer’s data (server call); shows a resonance indicator bar that fills when the user engages
(could be controlled via sentiment analysis). Provide microphone button to record responses or skip
button. At any time, the user can switch to Life Tapestry or Heirloom Companion via the page nav.

###API Extensions

New API endpoints are required to support the front‑end features. They should be implemented as
serverless functions (e.g., Node/Express in api/ directory):
POST /api/rapid_prototype/scope
Body: { ideaText: string }
Process: Sends ideaText to BillyFunction; returns { function: string, dependencies:
string[], outputs: string[], tier: number }. On error, return a fallback structure.
POST /api/rapid_prototype/push
Body: { ideaText: string, scope: object, blueprint: object }
Process: Inserts a row into rapid_prototypes table. Returns { id: uuid }.
POST /api/adaptive_layout/saveProfile
Body: { name: string, stateConfig: object }
Process: Inserts or updates a row in layout_profiles for the current user. Returns { id:
uuid }.
POST /api/creation/context_weaver
Body: { prompt: string }

Process: Calls BillyFunction to retrieve relevant threads from PLK, bucket drops, etc.; returns
{ threads: object[] }. Each thread has a title and summary.
POST /api/creation/synthesize_artifact
Body: { prompt: string, context: object[], artifactType: string }
Process: Calls BillyFunction or another AI to generate the artifact. Stores the artifact in
creation_artifacts. Returns { id: uuid, artifactType: string, artifactData:
object }.
GET /api/alzheimers/daydreamer-fragment
Returns: { fragmentText: string, id: string } with the next memory fragment for
Daydreamer mode.
PlantUML Data Flow Diagram for Creation Corner
## @startuml
actor User
rectangle CreationCornerPage {
[Prompt Input] --> [Context Weaver]
[Context Weaver] --> [Module Suggestions]
[Module Suggestions] --> [Artifact Generator]
[Artifact Generator] --> [Artifact Preview]
[Artifact Generator] --> Supabase : insert creation_artifacts
## }
User --> [Prompt Input] : writes prompt
[Context Weaver] --> BillyFunction : fetch threads
[Module Suggestions] --> BillyFunction : recommend modules
[Artifact Generator] --> BillyFunction : synthesize
## @enduml
## Implementation
Set up environment: Pull the latest gestaltview-v2.0 codebase. Create a new branch for the
refactor. Install dependencies (npm install) and run npm run dev to verify baseline. Create
placeholder page components for the new routes to prevent broken navigation during Pass 1.
Pass 1 – Home page refactor:
Replace the contents of client/src/pages/Home.tsx with the new component. Ensure imports
for BillyWidget, ModuleCard, and BucketDrop are correct. Use JetBrains Mono and Neural Aurora
tokens. Test that the page loads and navigation cards link to placeholder pages. Commit with
message “Pass 1: Home page refactor”.

Pass 2 – Consulting page:
Create client/src/pages/ConsultingPage.tsx. Write sections with narrative content
extracted from the original home page and spec. Use Inter font by applying a CSS class. Add its route
in client/src/App.tsx and a card on the home page. Build and run tests. Update
CurrentState.md.

## Pass 3 – Rapid Prototype Engine:
Create client/src/pages/RapidPrototypePage.tsx using the structure described in Method.
Add necessary state management and call the new API endpoints. Build api/rapid_prototype/
scope.ts and api/rapid_prototype/push.ts functions. Create rapid_prototypes table
via Supabase migration script. Update routes. Commit and update CurrentState.md.
Pass 4 – Adaptive Layout UI:
Create client/src/pages/AdaptiveLayoutPage.tsx. Import AdaptiveLayoutSystem from
the zip and adapt it for the page. Create layout_profiles table. Implement API endpoint api/
adaptive_layout/saveProfile.ts. Add route in App.tsx. Test the state selector and profile
saving. Update CurrentState.md.
## Pass 5 – Creation Corner:
Create client/src/pages/CreationCornerPage.tsx. Build api/creation/
context_weaver.ts and api/creation/synthesize_artifact.ts. Create
creation_artifacts table. Build UI with prompt input, context threads, module suggestions and
artifact preview. Use PlantUML diagram for guidance. Add route in App.tsx. Update
CurrentState.md.
Pass 6 – Alzheimer’s refactor:
Create client/src/components/alzheimers/DaydreamerMode.tsx. Implement warm aurora
theme and memory fragment retrieval via api/alzheimers/daydreamer-fragment.ts. Replace
client/src/pages/AlzheimersLegacyPage.tsx with one that imports Daydreamer and sets
up three modes. Update navigation. Update alzheimers/pages/index.tsx exports. Test
transitions with AnimatePresence. Update CurrentState.md.
Pass 7 – Module renames:
Create ExternalScaffoldPage.tsx, PullStringPage.tsx and LivingLegacyPage.tsx
based on existing modules (ADHDPowerUp, AddictionRecovery and the new Living Legacy concept).
Add redirect shells in old files (e.g., ADHDPowerUpPage.tsx with a <Redirect to="/external-
scaffold" />). Update App.tsx with new routes and redirect routes. Change navigation card
labels to canonical names. Commit and update CurrentState.md.


## Pass 8 – Finalization:
Review all changes. Ensure that each module page uses Neural Aurora design tokens and correct
fonts. Test all routes. Run npm run build and fix any TypeScript errors. Write final entry in
CurrentState.md summarizing the delta and open items. Merge the branch into main.
## Milestones
## Milestone
## Target
## Date
## Deliverable
Home page refactor completePass 1
New Home.tsx; navigation cards to modules
Consulting page operationalPass 2
ConsultingPage.tsx and updated routes
Rapid Prototype Engine livePass 3
UI page, API endpoints, rapid_prototypes
table
Adaptive Layout UI livePass 4
UI page, profile saving, layout_profiles
table
Creation Corner livePass 5UI page, context weaver, artifact synthesis
Daydreamer elevated and Living
Legacy ready
## Pass 6
New Daydreamer component, refactored
## Alzheimer’s
Module renames and redirects in placePass 7New pages, redirects, route updates
Final build and documentationPass 8
CurrentState.md updated, build passes
## Gathering Results
After implementation, evaluate the system by:
Functional testing: Verify each route loads and functions as expected. Ensure bucket drop capture
works on all pages. Test Rapid Prototype Engine flows end‑to‑end (idea intake → scope extraction →
blueprint → corpus push). Test Adaptive Layout profile save and preview. Test Creation Corner
artifact generation and export. Test Daydreamer mode for smooth memory flow and warm palette.
Confirm redirects from old routes.
Design review: Ensure consistent use of Neural Aurora colours and fonts. Evaluate the home page
to confirm it feels like an invitation rather than a pitch. Ensure each module page uses its assigned
accent and respects cognitive load.
Performance and build: Run npm run build and measure bundle size. Confirm no TypeScript
errors or unresolved imports. Run end‑to‑end tests (if available) on major flows.
