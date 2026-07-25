# Comprehensive UI/UX and Technical Specification
for GestaltView v2.0

## Introduction and Research Summary

>GestaltView aims to be an extension of the mind—a network of rooms where thoughts, artifacts and AI
agents interact. Two internal specifications (spec‑1‑uiux‑refactor‑gestaltview.md and
spec‑codex‑may‑7th.md) already demand major refactors: removal of developer‑facing clutter, introduction
of persistent navigation and unified agent state, and stronger ties between rooms. To design the next
iteration, we synthesised up‑to‑date research from industry surveys, forward‑looking UX predictions and
open‑source tooling.

**Generative & multi‑modal interfaces**: Predictions for 2026 stress that AI will move from text‑only
chat to multi‑modal agents that speak, listen, see and imagine, making generative UI and
autonomous agents a key business moat. A2UI, an open project backed by Google, provides
a declarative data format that lets agents generate context‑specific UI components (forms, charts,
etc.) which the client renders using trusted components. Vercel’s open‑source json‑render
offers a similar generative‑UI catalogue; it allows AI to produce dynamic personalised UIs from
prompts without sacrificing reliability.
**Design trends**: A survey of 100 UX designers shows that 73 % see AI as a design collaborator having
the biggest impact in 2026, while 60 % expect AI agents to take actions on behalf of users.
Only 24 % cite multimodal interfaces as important but adoption is growing; 93 % already use
generative AI tools and 50 % focus on accessibility. Glassmorphism and other low‑contrast
effects are fading because of accessibility concerns.
**React ecosystem**: React 19 introduces Server Components and Server Functions that move
data‑fetching and sensitive logic to the server; Suspense, ViewTransition and Activity APIs
provide built‑in loading and transition handling. Developers favour features that solve focused
problems and emphasise accessibility and theming.
**Open‑source ASR and file viewing**: The open‑source speech‑to‑text landscape has evolved. Whisper
Large V3 remains widely adopted but new models like NVIDIA Canary‑Qwen and Qwen3‑ASR achieve
state‑of‑the‑art accuracy and real‑time performance. Developers must still integrate diarization
and streaming features themselves. For viewing and creating PDFs, React‑PDF (a wrapper over
PDF.js) supports page‑by‑page rendering, zooming and interactive elements and is available under
an MIT licence.

*These insights inform the comprehensive specification below, which targets four core pages—Home,
Blackboard Room, Creation Corner and Dynamic Inner World—while adhering to internal requirements and
harnessing the latest capabilities.*

## Specification Principles
**Persistent Global Navigation**: Every page must include a fixed navigation bar (top or side) with
icons/text for the major rooms and settings. This addresses internal requirements to remove
developer‑oriented clutter and provide a consistent navigation model.
**Unified Billy Agent & Multi‑Modal Capture**: Billy (the AI assistant) should support text chat,
streaming voice transcription and file uploads. Use a state‑of‑the‑art open‑source ASR model (e.g.,
Whisper Large V3 or Qwen3‑ASR) with optional diarization. Maintain a single chat state across rooms
so conversations persist seamlessly, satisfying the specification’s demand for a unified Billy.
**Generative UI & Adaptive Forms**: Integrate a generative‑UI framework (e.g., A2UI or
json‑render) to allow agents to produce context‑specific mini‑interfaces such as date pickers or
rating sliders. Agents send declarative UI descriptions; the client renders them using a catalogue of
safe components.
**Accessibility & Inclusive Design**: Adopt the Neural‑Aurora design tokens (colour palette,
typography, spacing) and adhere to WCAG guidelines, ensuring high contrast, keyboard navigation
and descriptive alt text. Avoid glassmorphism and other low‑contrast styles. Provide
reduced‑motion preferences.
**Micro‑Interactions & Motion**: Use React 19’s ViewTransition and Activity APIs to animate
state changes. Designers report that micro‑interactions and motion design enhance usability.
Ensure animations remain subtle and respect reduced‑motion settings.
**Modular Shared Components**: Create reusable components—CaptureComposer (text/voice/file
input), ArtifactCard, BlueprintCard, InspectorDrawer, ToastNotification—to
ensure consistent design across rooms. Cross‑room actions should trigger toast notifications with
undo options, as mandated by the spec.
**Server Components & Data Loading**: Adopt React Server Components and Server Functions for
data‑heavy operations and summarisation tasks. Use Suspense to handle loading states. Follow
incremental adoption: wrap only components that clearly benefit from server execution.
**Enhanced File Preview**: Integrate open‑source viewers—React‑PDF for PDFs, HTML5 players for
audio/video, an image gallery and a code viewer (e.g., Prism). Use pdfKit for PDF generation during
exports.

## Page‑Specific Improvements

- 1. Home Page (home.tsx)
**Current observations**: The existing home page presents a tagline and call‑to‑action buttons, a grid of room
cards and a collapsible Billy chip. It lacks persistent navigation and cohesive onboarding.


## Enhancements:
**Persistent Nav & Onboarding**: Implement a fixed navigation bar across the top or left. Provide a
first‑time onboarding tour with tooltips explaining the purpose of each room.
**Adaptive Hero Section**: Replace the static hero with a dynamic section that can show a generative
illustration summarising recent activity or recommended rooms. Use micro‑interactions (e.g., subtle
parallax) instead of confetti.
**Contextual Billy Greeting**: Position the Billy assistant near the hero and unify chat across the site.
Include voice input via the unified ASR. Offer quick actions such as “Start a new session” or “Resume
last conversation”.
**Responsive Grid & Cards**: Redesign room cards to follow design tokens (rounded corners, soft
shadows, strong contrast) and adapt to different screen sizes. Include icons and short descriptions;
on hover, show a preview using small 3D scenes or mini dashboards.
**Search & Quick Access**: Add a search bar for artifacts and rooms. Use generative UI to display
search results as cards or forms, enabling real‑time personalisation.
- Blackboard Room (BlackboardRoomPage.tsx)
**Current observations**: The room currently mixes persona selection, chat messages, file upload, voice
recording, summarisation and blueprint export within a single vertical layout, causing clutter. Export actions
require nested modals and cross‑room sending is not intuitive.

## Enhancements:
**Unified Capture Composer**: Introduce a consolidated composer containing:
Text input with markdown support and auto‑resize.
Streaming voice transcription using Whisper V3 or Qwen3‑ASR. Show live transcript and allow
editing. Highlight that the model’s accuracy and multilingual coverage are state‑of‑the‑art.
File attachments accessible via a “+” menu; show thumbnails and previews using the new file
previewer (React‑PDF, HTML5 players, image gallery).
**Generative form insertion**: When Billy suggests a structured form (e.g., schedule picker), render it
through the generative‑UI renderer.
**Persona & Knowledge Controls**: Move persona toggles into a side panel with clear icons
(Self‑Reflection, Brainstorming, Critique). Provide tooltips and persist the choice in state.
**Session Management & Summarisation**: Display the session timer in the top bar. Summaries
should be generated on demand using server actions; show progress indicators and allow editing
before saving. Summaries produce blueprint objects consistent with the unified artifact model.
**Blueprint & Export Workflow**: When exporting, open a Drawer overlay showing the blueprint
content and offering options: send to Creation Corner, save as file (PDF/Markdown), copy to
clipboard. Each action triggers a toast with an undo option. The modal uses generative UI for
additional options (e.g., selecting output format). Avoid nested modals.

**Layout & Filtering**: Use a split view: the message list occupies most of the screen; the side panel
contains persona and metadata. Provide quick filters (all messages, only AI, only attachments).
Animate new messages with ViewTransition.
**Accessibility & Motion**: Provide keyboard shortcuts (Ctrl + Enter to send), ARIA labels for screen
readers and high‑contrast themes. Allow users to disable animated transitions.
- Creation Corner (CreationCornerPage.tsx)
**Current observations**: The page displays a list of blueprints stored locally and remotely. The user can
preview, rename, delete, and merge blueprints, but the workflow is unclear; exports support only simple
formats and cross‑room integration is limited.

## Enhancements:
**Blueprint Library & Metadata**: Present blueprints as cards in a grid. Each card shows title,
summary and date. Offer filters by tag, date and source, and provide search. Use server components
to fetch remote data efficiently.
**Draft Workspace & Merging**: When the user selects blueprints or individual captures, open a side
DraftWorkspace panel. Items appear as editable sections within a markdown editor. Users can
reorder, merge and edit the content. Provide AI‑assisted tools for summarising, rewriting or
generating outlines, aligning with the spec’s call for a digital intelligence assistant in Creation Corner

## Output Types: Offer explicit export formats—Markdown, PDF, HTML, agent prompt, blueprint JSON.
Use pdfKit to generate PDF exports and React‑PDF to preview them. The user selects an output
type; the interface renders a preview and size estimate before exporting.
**Assistant Panel**: Include a side panel where Billy (or an “Art Teacher” persona) provides critique or
suggestions. This panel uses the unified chat and generative‑UI renderer to propose structural
changes and additional content. There are 24 embodiment_profiles, use them.

**Cleanup & Deletion**: Provide clear buttons to delete or archive blueprints, with confirmation modals
and undo toasts. Add a “Clear all” option with safety checks.
**Accessibility & Micro‑Interactions**: Ensure keyboard navigation through cards and workspace.
Animate drag‑and‑drop merging actions. Provide progress indicators for large exports.
- Dynamic Inner World (DynamicInnerWorldPage.tsx)
**Current observations**: Artifacts are shown in a scrollable list with options to open an inspector, archive or
download. The “Inner World” concept is not fully realised and cross‑room actions are minimal.

## Enhancements:
**Immersive Surface Canvas**: Transform the page into a 3D or multi‑surface canvas using a WebGL library (e.g., Babylon.js). Artifacts float as objects. Provide
accessible navigation (WASD/mouse; accessible buttons). Offer a 2D list view as an alternative. Use
Suspense for lazy loading scenes.
**Artifact Interaction & Inspector**: Clicking an artifact opens an InspectorDrawer from the side,
displaying metadata (title, tags, date), preview (image, markdown, audio), notes and related
connections. Include controls to archive, rename, tag, or send the artifact to other rooms.
Cross‑room sends trigger undoable toast notifications. Provide AI‑generated context and
suggestions (e.g., summarising relationships between artifacts and blueprints).
**Search & Filters**: A search bar allows filtering by type (image, text, code, audio), tags or recency.
Results update dynamically with ViewTransition animations.
**Personalisation & Generative Layout**: Allow the system to arrange artifacts based on recency or
user preferences (e.g., centralising active artifacts). Offer a mini‑map or legend to orient the user.
**Accessibility & Motion**: Provide keyboard and screen‑reader navigation; allow switching to a
simplified list view. Respect reduced‑motion preferences; avoid excessive 3D motion.

## Common Technical Notes
**State Management & Persistence**: Use a centralised state (e.g., Zustand or Redux Toolkit) to
manage user preferences, chat history, blueprints and artifacts. Persist state to local storage and
remote storage via API.
**API Integration**: Implement backend endpoints for saving/loading blueprints and artifacts, merging
drafts and generating summaries. Use server functions (e.g., tRPC) to ensure type safety and unify
front‑end and back‑end code.
**Testing & Accessibility**: Use Storybook for component documentation, write unit/integration tests
and run accessibility audits (e.g., axe‑core). Provide keyboard navigation tests.
**Analytics & Privacy**: Collect anonymised analytics to improve features. For voice inputs, consider
local inference when privacy is critical. Provide clear data‑usage explanations.

## Conclusion
This specification merges GestaltView’s internal mandates with modern UX trends and open‑source
capabilities. It prioritises persistent navigation, unified multi‑modal capture, generative UI, accessibility,
micro‑interactions and modular design. By leveraging React 19 features, generative‑UI frameworks (A2UI,
json‑render), state‑of‑the‑art speech‑to‑text models and robust file viewing tools, GestaltView can evolve
into an intuitive, agentic system that supports deep cognition and fluid cross‑room workflows.
