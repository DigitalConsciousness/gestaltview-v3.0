# SPEC-2: Dynamic User Profiles and Creative Modules Integration Sprint

**Document Type:** Implementation Specification  
**Scope:** Sprint Review deliverables for `gestaltview-v2.0` runtime  
**Owner:** Codex Implementation  
**Status:** Active / In-Progress  
**Last Updated:** May 28, 2026  
**Timeline:** May 28 – June 10, 2026

---

## Executive Summary

This specification addresses five critical integration workstreams for GestaltView's demo readiness and production runtime consolidation:

1. **Dynamic User Profile Ingestion Pipeline:** Intake and contextualization for transcripts, resumes, and lived experiences into adaptive, fact-based personality profiles
2. **Artifact-Driven Dynamic Inner World:** Replacement of deprecated six-panel prompt grid with live, scrollable artifact exploration and dynamic stats display
3. **Module Compression and UI/UX Scaling:** Downscaling Resume Rockstar, Symbio Coder, and Vibe Coder into lightweight, in-app modules while preserving feature parity
4. **Embodiment Profile Generation Automation:** Enhancement of current TypeScript-only generation to produce full-stack scaffolding (API, server, shared libs, client, database)
5. **Module-to-Digital-Intelligence Personality Alignment:** Ensuring each module surface is assigned an appropriate DI personality (except Blackboard Room and Tribunal portals)

Each workstream has explicit blockers, dependencies, and acceptance criteria tied to demo video requirements and production hardening goals.

---

## 1. Dynamic User Profile Ingestion Pipeline

### 1.1 Functional Requirements

**Goal:** Build an end-to-end ingestion system that transforms user-submitted artifacts (journal entries, resume, transcripts, lived experience narratives) into a cohesive, fact-based personality profile distinct from Myers-Briggs or other off-the-shelf personality frameworks.

**Inputs:**
- **Journals:** Bucket-drop raw text or structured journal entries from `bucket_drops` table
- **Resumes:** Markdown or plain text resume, potentially auto-generated within Workspace
- **Transcripts:** Structured interview transcripts or unstructured spoken thought conversions
- **Lived Experience:** Narrative self-assessments, video metadata, or life-event timelines
- **Music DNA:** User musical preferences/attributes from `musical_dna_analyses` table (optional connector)

**Outputs:**
- **Personality Profile:** Factual, multi-dimensional profile stored in `consciousness_profiles` or new dedicated table
- **PLK Integration:** Profile feeds into Personal Knowledge Layer (PLK) for artifact retrieval and context routing
- **Artifact Display:** Generated profile data powers the Dynamic Inner World artifact carousel

### 1.2 Technical Architecture

#### 1.2.1 Database Schema Extensions

**New Tables or Schema Changes:**

```sql
-- User profile ingestion records
CREATE TABLE user_profile_ingestion_runs (
  run_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id),
  status TEXT NOT NULL, -- pending, processing, complete, error
  input_sources JSONB, -- { journals, resume, transcripts, music_dna, lived_experience }
  extracted_attributes JSONB, -- structured findings from ingestion
  personality_profile JSONB, -- final multi-dimensional profile
  confidence_scores JSONB, -- confidence per dimension
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Personality dimensions (fact-based, not Myers-Briggs)
CREATE TABLE user_personality_dimensions (
  dimension_id UUID PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES user_profile_ingestion_runs(run_id),
  dimension_key TEXT NOT NULL, -- e.g., "creative_expression", "collaboration_style", "conflict_resolution"
  dimension_label TEXT,
  dimension_value JSONB, -- complex descriptor
  evidence_fragments TEXT[], -- array of source quotes/evidence
  salience NUMERIC, -- 0-1, how central to identity
  mutation_class TEXT, -- immutable | stable | dynamic
  created_at TIMESTAMP DEFAULT now()
);

-- Link ingestion run to source bucket drops / documents
CREATE TABLE profile_ingestion_sources (
  source_link_id UUID PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES user_profile_ingestion_runs(run_id),
  source_type TEXT NOT NULL, -- journal, resume, transcript, music_dna, lived_experience
  source_id UUID, -- link to bucket_drop, document, or other source
  source_bucket TEXT,
  raw_text TEXT,
  processing_notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### 1.2.2 API Endpoint: POST /api/profile/ingest

**Request Shape:**
```typescript
interface ProfileIngestionRequest {
  userId: string;
  sources: {
    journals?: string[]; // bucket_drop IDs or raw text
    resume?: string; // markdown or plain text
    transcripts?: string[]; // transcript IDs or raw text
    musicDNA?: string; // musical_dna_analyses ID (optional)
    livedExperience?: {
      narrative: string;
      keyTurningPoints?: string[];
      currentChallenges?: string[];
    };
  };
  includeInPLK?: boolean; // default: true
  outputFormat?: 'full' | 'summary'; // for profile display
}
```

**Response Shape (inherited from api/_lib/response.ts):**
```typescript
interface ProfileIngestionResponse {
  response: {
    runId: string;
    status: 'pending' | 'processing' | 'complete' | 'error';
    personalityProfile: {
      dimensions: PersonalityDimension[];
      keyThemes: string[];
      unresolvedTensions: string[];
      coreNarrative: string;
    };
    metadata: {
      sourcesProcessed: number;
      confidenceScore: number;
      processingTimeMs: number;
    };
  };
  provider: string; // 'internal' or LLM provider used
  timestamp: string;
}
```

**Implementation Notes:**
- Integrate with `shared/llm/plk.ts` for PLK-aware context generation
- Use multi-turn prompting: first extract, then synthesize, then validate
- Store all intermediate states for audit and rollback
- Respect Constitutional Invariants (U-2: preserve whole language, U-1: engage with complexity)

#### 1.2.3 Backend Processing Pipeline

**Location:** `api/profile/ingest.ts` + `api/_lib/profileIngestion.ts`

**Workflow:**

1. **Validation & Source Aggregation**
   - Collect all user sources (journal IDs, resume text, etc.)
   - Fetch from `bucket_drops`, `documents`, `musical_dna_analyses` as needed
   - Validate content completeness; reject if missing key inputs

2. **Extraction Phase**
   - For each source, use LLM to extract structured attributes
   - Capture: values, motivations, behavioral patterns, conflict styles, creative expression, collaboration modes
   - Store raw extractions in `profile_ingestion_sources`

3. **Synthesis Phase**
   - Use multi-dimensional framework to integrate extractions into coherent personality dimensions
   - Map to custom dimensions (not Myers-Briggs; use descriptors like "creative_expression", "collaboration_style", "resilience_pattern")
   - Generate confidence scores per dimension based on supporting evidence

4. **PLK Integration**
   - Call `shared/llm/plk.ts` integration to seed Personal Knowledge Layer
   - Create retrievable fragments for each dimension
   - Link to original sources for traceability

5. **Persistence & Output**
   - Insert records into `user_profile_ingestion_runs`, `user_personality_dimensions`, `profile_ingestion_sources`
   - Return profile data for front-end display
   - Notify Dynamic Inner World to refresh artifact carousel

**Error Handling:**
- On extraction failure, return partial profile with error details
- Implement retry logic for transient LLM errors (3 attempts, exponential backoff)
- Store error context in `user_profile_ingestion_runs.status` = 'error'

### 1.3 Frontend Integration

**Location:** `client/src/components/ProfileDisplay.tsx` (new)

**Responsibilities:**
- Display personality profile dimensions with evidence snippets
- Show confidence scores and data provenance (which sources contributed)
- Allow user to edit dimensions or request re-ingestion
- Link profile to Dynamic Inner World artifact display

**Props:**
```typescript
interface ProfileDisplayProps {
  userId: string;
  runId?: string; // optional; if omitted, fetch latest
  readOnly?: boolean;
  onRefreshRequest?: () => Promise<void>;
}
```

### 1.4 Music DNA Connector (Integrated)

**Input:** `musical_dna_analyses` record (song title, artist, analysis, empowerment_score)

**Integration Point:** Include in ingestion pipeline as optional source

**Output:** Music DNA attributes feed into personality profile under "creative_expression" or custom "music_DNA_resonance" dimension

**Note:** Music DNA is not mandatory for demo but is a powerful differentiator; prioritize if time permits.

### 1.5 Acceptance Criteria

- [ ] POST /api/profile/ingest accepts valid multi-source payload
- [ ] Profile ingestion produces dimensions with evidence links
- [ ] PLK integration creates searchable fragments from profile
- [ ] Frontend displays profile with dimension cards, evidence snippets, confidence scores
- [ ] Personality profile appears in demo video with founder's actual data
- [ ] Retry logic handles transient LLM errors gracefully
- [ ] All profile data persists in Supabase and survives session restart

---

## 2. Dynamic Inner World Workspace Overhaul

### 2.1 Context & Problem Statement

**Current State (Deprecated):**
- Six-panel prompt grid that pushed prompts, not artifacts
- Logic and flow issues made artifact display unsatisfactory
- Previous iteration had working patterns but poor UX alignment

**New Vision:**
- Live, dynamic workspace with scrollable artifact carousel
- Real-time stats/resume/personality/skill/PLK exploration
- Vercel V0 UI / Google AI Studio-style split screen: artifact display + curator controls
- Multiple panel slots (6–10+) for stacked artifact previews
- Curator embodiment profile assigned; user can customize lineup later via Agent Academy

### 2.2 Functional Requirements

**Primary Surfaces:**

1. **Artifact Carousel (Main Display)**
   - Scrollable list of user artifacts: resume sections, skill highlights, PLK fragments, personality dimensions
   - Each artifact is interactable: click to expand, drag to reorder, filter by type
   - Live stats overlay: growth metrics, skill trajectory, artifact freshness

2. **Live Profile Card Stack**
   - Dynamic personality profile (from Section 1)
   - Resume layer with section highlights
   - Skill profile with proficiency levels
   - PLK digest with recent fragments

3. **Curator Control Panel (Right-Side Split)**
   - Curator embodiment profile selector (default: Curator DI personality)
   - Artifact type filters (resume, skill, personality, PLK)
   - Refresh/sync buttons for live ingestion
   - Settings: auto-update frequency, display density, privacy toggles

4. **Multi-Panel Layout**
   - Support 6–10 artifact preview windows
   - Stack or tile layout; user preference
   - Each panel shows artifact summary + interaction affordance (expand, archive, flag)

### 2.3 Technical Architecture

#### 2.3.1 New Routes & Pages

**Route:** `/dynamic-inner-world` (existing, overhaul content)

**Components:**
```
client/src/pages/DynamicInnerWorld.tsx
├── DynamicInnerWorldLayout.tsx
│   ├── ArtifactCarousel.tsx
│   │   ├── ArtifactCard.tsx (reusable)
│   │   ├── ArtifactFilter.tsx
│   │   └── StatsOverlay.tsx
│   ├── LiveProfileStack.tsx
│   │   ├── PersonalityProfileCard.tsx
│   │   ├── ResumeLayerCard.tsx
│   │   ├── SkillProfileCard.tsx
│   │   └── PLKDigestCard.tsx
│   └── CuratorControlPanel.tsx
│       ├── EmbodimentSelector.tsx
│       ├── ArtifactTypeFilter.tsx
│       ├── SyncControls.tsx
│       └── SettingsPanel.tsx
```

#### 2.3.2 Data Fetching & State Management

**API Endpoints Used:**
- `GET /api/consciousness/dynamic-inner-world` → fetch personalized artifact list + profile state
- `GET /api/workspaces` → retrieve workspace/document artifacts
- `GET /api/session/state` → user PLK + metadata
- `POST /api/consciousness/dynamic-inner-world/sync` → trigger live ingestion update

**Shared Hook:**
```typescript
// client/src/hooks/useDynamicInnerWorld.ts
interface UseDynamicInnerWorldResult {
  artifacts: Artifact[];
  profile: PersonalityProfile;
  stats: WorkspaceStats;
  isLoading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
  updateArtifactOrder: (newOrder: Artifact[]) => Promise<void>;
}

export function useDynamicInnerWorld(userId: string): UseDynamicInnerWorldResult {
  // Implementation using `useQuery` + Supabase realtime if available
}
```

#### 2.3.3 Backend Integration

**Endpoint:** `GET /api/consciousness/dynamic-inner-world`

**Response Shape:**
```typescript
interface DynamicInnerWorldResponse {
  response: {
    artifacts: {
      id: string;
      type: 'resume' | 'skill' | 'personality' | 'plk' | 'document';
      title: string;
      summary: string;
      content: string;
      metadata: Record<string, any>;
      salience: number;
      sourceId: string;
    }[];
    profile: PersonalityProfile; // from Section 1
    stats: {
      totalArtifacts: number;
      skillGrowth: number; // %
      recentUpdates: number;
      plkFragmentCount: number;
    };
    curatorPersonality: string; // embodiment profile slug
  };
  provider: string;
  timestamp: string;
}
```

**Implementation Location:** `api/consciousness/dynamic-inner-world.ts`

### 2.4 Visual & UX Specifications

**Layout:**
- Left 70%: Artifact carousel (scrollable, responsive grid)
- Right 30%: Live profile card stack (fixed or semi-sticky)
- Optional: Curator control panel toggles in/out from right edge

**Color & Token Usage:**
- Neural Aurora tokens for loading states and transitions
- Glass card styling consistent with homepage
- Artifact cards use semantic color coding (resume=blue, skill=green, personality=purple, plk=cyan)

**Interactions:**
- Smooth scroll with momentum
- Click-to-expand artifact detail modal
- Drag-and-drop reordering (stored in user preferences)
- Real-time stat updates (no page refresh needed)

### 2.5 Acceptance Criteria

- [ ] Route `/dynamic-inner-world` renders artifact carousel + live profile stack
- [ ] Artifacts load from `consciousness` endpoints and render correctly
- [ ] Personality profile from Section 1 appears in profile card stack
- [ ] Curator control panel filters artifacts by type
- [ ] Click-to-expand artifact modal shows full content
- [ ] Drag-and-drop reordering works and persists
- [ ] Stats overlay updates in real-time when artifacts change
- [ ] Demo video shows smooth artifact exploration and interaction
- [ ] No deprecated six-panel grid logic remains in codebase

---

## 3. Module Compression: Resume Rockstar, Symbio Coder, Vibe Coder

### 3.1 Functional Requirements

**Goal:** Compress three full-site products (Resume Rockstar ~5MB, Symbio Coder, Vibe Coder) into lightweight, in-app modules within the Workspace surface while maintaining core functionality and UI/UX parity.

**Constraints:**
- UI/UX must match current GestaltView runtime styling
- Modules must be shrunken down but not gutted
- Each module is assigned a Digital Intelligence personality

### 3.2 Technical Approach

#### 3.2.1 Modular Architecture

**Pattern:** Each module is a self-contained feature surface in `client/src/pages/` or `client/src/components/` with its own:
- Isolated state management (Zustand store or React context)
- API route stub in `api/modules/[moduleName]/`
- Supabase-backed persistence (optional)
- Embodiment profile assignment

**Module Scaffolding:**
```
client/src/modules/
├── Resume_Rockstar/
│   ├── pages/
│   │   ├── Editor.tsx
│   │   ├── Library.tsx
│   │   └── Preview.tsx
│   ├── components/
│   │   ├── SectionEditor.tsx
│   │   ├── SectionPreview.tsx
│   │   └── StylePalette.tsx
│   ├── store/
│   │   └── resumeStore.ts
│   └── README.md
├── Symbio_Coder/
│   └── (similar structure)
└── Vibe_Coder/
    └── (similar structure)

api/modules/
├── resume-rockstar/
│   ├── [action].ts (save, preview, export)
│   └── _lib/resumeEngine.ts
├── symbio-coder/
│   └── [action].ts
└── vibe-coder/
    └── [action].ts
```

#### 3.2.2 UI/UX Scaling Strategy

**Size Reduction Tactics:**
1. **Sidebar Collapse:** Merge sidebar navigation into collapsible drawer or tabs
2. **Multi-Panel → Split Screen:** Replace multi-panel layouts with two-column Vercel V0 style
3. **Lazy-Load Features:** Only render active section; defer others
4. **CSS Pruning:** Remove unused utility classes from legacy product CSS
5. **Asset Optimization:** Compress images, use CSS gradients instead of image backgrounds

**Consistency Layer:**
- Use shared GestaltView component library (`client/src/components/core/`)
- Apply Neural Aurora tokens across all modules
- Ensure glass card styling, spacing, and typography match

#### 3.2.3 Resume Rockstar (Example Deep Dive)

**Route:** `/workspace/modules/resume-rockstar`

**Features (MVP):**
- Resume section editor (objectives, experience, skills, education)
- Live preview with style templates
- Markdown export
- Integration with user profile (auto-populate from PLK)

**Reduced Scope (vs. full product):**
- Remove advanced analytics/templates (full product feature)
- Remove social share (not needed in workspace)
- Remove live collaboration (workspace is single-user context)
- Focus: create, edit, preview, export

**State Shape:**
```typescript
interface ResumeState {
  resumeId: string;
  title: string;
  sections: ResumeSection[];
  selectedTemplate: string;
  lastModified: string;
}

interface ResumeSection {
  id: string;
  type: 'objective' | 'experience' | 'skill' | 'education';
  title: string;
  content: Record<string, any>;
}
```

**API Endpoint:** `POST /api/modules/resume-rockstar/save`

```typescript
interface ResumeSaveRequest {
  userId: string;
  resume: ResumeState;
}

interface ResumeSaveResponse {
  response: {
    resumeId: string;
    savedAt: string;
    previewUrl: string;
  };
  provider: string;
  timestamp: string;
}
```

#### 3.2.4 Symbio Coder & Vibe Coder (Placeholder Architecture)

**Symbio Coder (Coding Assistant in-app):**
- Route: `/workspace/modules/symbio-coder`
- MVP: Code snippet editor + AI assistant chat sidebar
- Reduce scope: remove external collaboration, focus on personal coding assistance

**Vibe Coder (Music/Creative Assistant in-app):**
- Route: `/workspace/modules/vibe-coder`
- MVP: Music preference input + AI generation suggestions
- Reduce scope: remove marketplace, focus on personal creative exploration

### 3.3 Digital Intelligence Personality Assignment

Each module must have an assigned DI personality (except Blackboard Room and Tribunal).

**Assignment Strategy:**
- **Resume Rockstar:** "Resume Rockstar" embodiment profile (or "Career Mentor" DI)
- **Symbio Coder:** "Symbio Coder" embodiment profile (or "Coding Guide" DI)
- **Vibe Coder:** "Music Guide" or custom "Creative Spark" DI

**Implementation:**
- Store assignment in `embodiment_modules` table (new, see schema):
  ```sql
  CREATE TABLE embodiment_modules (
    id UUID PRIMARY KEY,
    module_key TEXT NOT NULL, -- 'resume_rockstar', 'symbio_coder', etc.
    embodiment_profile_slug TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
  );
  ```
- Reference in module route initialization
- Pass embodiment context to module API handlers for personality-aware responses

### 3.4 Acceptance Criteria

- [ ] Resume Rockstar module renders in `/workspace/modules/resume-rockstar` with reduced feature set
- [ ] Module UI matches GestaltView styling and Neural Aurora tokens
- [ ] Save/preview/export endpoints functional
- [ ] Symbio Coder module renders with code editor + AI assistant chat
- [ ] Vibe Coder module renders with music input + suggestions
- [ ] Each module has assigned embodiment profile
- [ ] Module data persists in Supabase (users table + workspace links)
- [ ] Full product file size reduction verified (5MB → <2MB per module or embedded)
- [ ] Demo video shows seamless navigation between modules within Workspace

---

## 4. Embodiment Profile Generation Automation

### 4.1 Current State & Gap

**Current Script:** `scripts/generate-embodiment-profile.ts`
- Generates TypeScript index/registry only
- Does not create full-stack scaffolding

**Required Extensions:**
- API routes (`api/embodiments/[slug]/...`)
- Server utilities (`server/embodiments/[slug].ts`)
- Shared types (`shared/embodiments/[slug].ts`)
- Client components (`client/src/embodiments/[slug]/`)
- Database initialization (seed personality attributes)

### 4.2 Comprehensive Scaffolding Blueprint

#### 4.2.1 Extended Script: `scripts/generate-embodiment-profile-complete.ts`

**Inputs:**
```typescript
interface EmbodimentProfileTemplate {
  slug: string; // 'curator', 'weaver', 'keeper', etc.
  publicName: string;
  internalDesignation: string;
  domain: string; // 'curation', 'synthesis', 'memory', etc.
  description: string;
  coreNarrative: string;
  immutableCore: {
    values: string[];
    boundaries: string[];
    commitments: string[];
  };
  roleCommitments: Record<string, string>;
  personality: {
    tonality: string[];
    humor: string;
    pacing: string;
    idiolect: Record<string, string>;
  };
  capabilities: string[];
  knowledgeDomains: string[];
}
```

**Outputs (Full Scaffolding):**

1. **API Layer:** `api/embodiments/[slug]/manifest.ts`, `api/embodiments/[slug]/files.ts`
2. **Server Utilities:** `server/embodiments/[slug]/index.ts`, `server/embodiments/[slug]/prompts.ts`
3. **Shared Types:** `shared/embodiments/[slug]/types.ts`, `shared/embodiments/[slug]/index.ts`
4. **Client Components:** `client/src/embodiments/[slug]/Chat.tsx`, `client/src/embodiments/[slug]/Profile.tsx`
5. **Database Seed:** `supabase/seeds/embodiment_[slug]_setup.sql`
6. **Documentation:** `embodiment_profiles/[slug]/README.md`
7. **Index Registration:** Auto-update `embodiment_profiles/index.ts` and `shared/embodiments/registry.ts`

#### 4.2.2 Script Workflow

```typescript
// pseudocode for scripts/generate-embodiment-profile-complete.ts

async function generateEmbodimentProfile(template: EmbodimentProfileTemplate) {
  const slug = template.slug;
  
  // 1. Create directory structure
  await createDirectories([
    `api/embodiments/${slug}`,
    `server/embodiments/${slug}`,
    `shared/embodiments/${slug}`,
    `client/src/embodiments/${slug}`,
    `supabase/seeds`,
    `embodiment_profiles/${slug}`,
  ]);

  // 2. Generate API handlers
  await generateFile(`api/embodiments/${slug}/manifest.ts`, getManifestTemplate(template));
  await generateFile(`api/embodiments/${slug}/files.ts`, getFilesTemplate(template));

  // 3. Generate server utilities
  await generateFile(`server/embodiments/${slug}/index.ts`, getServerIndexTemplate(template));
  await generateFile(`server/embodiments/${slug}/prompts.ts`, getPromptsTemplate(template));

  // 4. Generate shared types & exports
  await generateFile(`shared/embodiments/${slug}/types.ts`, getTypesTemplate(template));
  await generateFile(`shared/embodiments/${slug}/index.ts`, getSharedIndexTemplate(template));

  // 5. Generate client components
  await generateFile(`client/src/embodiments/${slug}/Chat.tsx`, getChatComponentTemplate(template));
  await generateFile(`client/src/embodiments/${slug}/Profile.tsx`, getProfileComponentTemplate(template));
  await generateFile(`client/src/embodiments/${slug}/index.ts`, getClientIndexTemplate(template));

  // 6. Generate database seed
  await generateFile(`supabase/seeds/embodiment_${slug}_setup.sql`, getDatabaseSeedTemplate(template));

  // 7. Generate documentation
  await generateFile(`embodiment_profiles/${slug}/README.md`, getDocTemplate(template));

  // 8. Update registries
  await updateEmbodimentRegistry(slug, template);
  await updateServerRegistry(slug);
  await updateSharedRegistry(slug);

  console.log(`✓ Embodiment profile "${slug}" generated with full scaffolding`);
}
```

#### 4.2.3 Database Pipeline Integration

**Requirement:** Each generated embodiment must auto-create its schema via migration or seed.

**Pattern:**
```sql
-- supabase/seeds/embodiment_curator_setup.sql

INSERT INTO agents (agent_id, slug, title, domain, owner_user_id, status, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'curator',
  'The Curator',
  'curation',
  NULL, -- system-owned
  'active',
  now()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO agent_constitutions (constitution_id, agent_id, version_id, identity_handle, public_name, ...)
VALUES (...)
ON CONFLICT DO NOTHING;

-- etc.
```

**Execution:**
- Run seed scripts on deployment or via admin CLI
- Verify schema integrity before marking embodiment as "ready"

### 4.3 Embodiment Registry & Validation

**New Validation Step:**

```typescript
// scripts/validate-embodiment-profile.ts

interface EmbodimentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checksPerformed: {
    apiRoutesExist: boolean;
    serverUtilitiesExist: boolean;
    sharedTypesExist: boolean;
    clientComponentsExist: boolean;
    databaseSchemaCreated: boolean;
    documentationComplete: boolean;
    registriesUpdated: boolean;
  };
}

async function validateEmbodimentProfile(slug: string): Promise<EmbodimentValidationResult> {
  const checks = {
    apiRoutesExist: fileExists(`api/embodiments/${slug}/manifest.ts`),
    serverUtilitiesExist: fileExists(`server/embodiments/${slug}/index.ts`),
    sharedTypesExist: fileExists(`shared/embodiments/${slug}/types.ts`),
    clientComponentsExist: fileExists(`client/src/embodiments/${slug}/index.ts`),
    databaseSchemaCreated: await checkDatabaseSchema(slug),
    documentationComplete: fileExists(`embodiment_profiles/${slug}/README.md`),
    registriesUpdated: registryContainsProfile(slug),
  };

  const failures = Object.entries(checks)
    .filter(([, result]) => !result)
    .map(([check]) => check);

  return {
    isValid: failures.length === 0,
    errors: failures,
    warnings: [],
    checksPerformed: checks,
  };
}
```

### 4.4 CLI Integration

**New Commands:**
```bash
npm run embodiments:generate -- --slug=mycustom --name="My Custom Profile" --domain="custom"
npm run embodiments:validate -- --slug=curator
npm run embodiments:list
npm run embodiments:build -- --include-db-seed
```

### 4.5 Acceptance Criteria

- [ ] Script generates full scaffolding (API, server, shared, client, DB, docs)
- [ ] New embodiment profile appears in all registries
- [ ] Database seed auto-creates schema for new embodiment
- [ ] Validation script confirms all files in place
- [ ] CLI commands functional: generate, validate, list, build
- [ ] Demo: new embodiment profile generated and deployed in <5 min
- [ ] No manual file creation needed; script handles all boilerplate

---

## 5. Digital Intelligence Personality Assignment to Modules

### 5.1 Module-to-DI Personality Mapping

**Rule:** Every module/page (except Blackboard Room and Tribunal portals) must have an assigned embodiment profile that influences:
- Response tone and style
- Prompt shaping via `shared/billy/prompts.ts`
- UI personality (colors, typography, interaction feedback)

**Mapping Table:**

| Module/Page | Primary DI Personality | Role |
|---|---|---|
| Dynamic Inner World | Curator | Guides artifact exploration and self-reflection |
| Profile Display | Keeper | Stewards memory and identity continuity |
| Resume Rockstar | Career Mentor / Resume Rockstar | Guides career narrative |
| Symbio Coder | Symbio Coder / Coding Guide | Assists with code and technical learning |
| Vibe Coder | Music Guide / Creative Spark | Guides creative exploration |
| Creation Corner | Art Teacher / Creative Facilitator | Facilitates creative expression |
| Musical DNA | Music DNA Guide / Weaver | Connects music to identity |
| External Scaffold Of You (ADHD) | ADHD Power-Up DI | Supports ADHD-friendly productivity |
| Home Page | Babylon Abstract + System Overview | Visual + curator overview blend |
| Workspace | System Facilitator | Neutral workspace container |
| Sanctuary | Healer / Sanctuary Guide | Provides refuge and grounding |
| ~~Blackboard Room~~ | **Billy + All** | Everyone present; no single DI |
| ~~Tribunal~~ | **System** | Renders as dark/edgier portal to Tribunal |

### 5.2 Implementation Strategy

#### 5.2.1 Route-to-Embodiment Association

**New Table:**
```sql
CREATE TABLE route_embodiment_assignments (
  assignment_id UUID PRIMARY KEY,
  route_path TEXT NOT NULL UNIQUE, -- '/dynamic-inner-world', '/profile', etc.
  embodiment_profile_slug TEXT NOT NULL REFERENCES agents(slug),
  display_label TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Seeding:**
```sql
INSERT INTO route_embodiment_assignments (route_path, embodiment_profile_slug, display_label)
VALUES
  ('/dynamic-inner-world', 'curator', 'Dynamic Inner World Curator'),
  ('/profile', 'keeper', 'Profile Keeper'),
  ('/workspace/modules/resume-rockstar', 'resume_rockstar', 'Resume Rockstar'),
  ('/workspace/modules/symbio-coder', 'symbio_coder', 'Symbio Coder'),
  -- etc.
```

#### 5.2.2 Route Initialization & Context Injection

**Middleware/Hook (Client):**
```typescript
// client/src/hooks/useRouteEmbodiment.ts

export function useRouteEmbodiment() {
  const location = useLocation();
  const [embodiment, setEmbodiment] = useState<EmbodimentProfile | null>(null);

  useEffect(() => {
    async function fetchEmbodiment() {
      const response = await fetch(
        `/api/embodiments/by-route?path=${encodeURIComponent(location.pathname)}`
      );
      if (response.ok) {
        const data = await response.json();
        setEmbodiment(data.response.embodimentProfile);
      }
    }
    fetchEmbodiment();
  }, [location.pathname]);

  return embodiment;
}
```

**Endpoint:** `GET /api/embodiments/by-route?path=[routePath]`
```typescript
// api/embodiments/by-route.ts

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  
  const assignment = await supabase
    .from('route_embodiment_assignments')
    .select('embodiment_profile_slug')
    .eq('route_path', path)
    .single();

  if (assignment.error || !assignment.data) {
    return sendResponse(res, {
      embodimentProfile: null,
      available: false,
    }, 200);
  }

  const embodiment = await fetchEmbodimentProfile(assignment.data.embodiment_profile_slug);
  return sendResponse(res, { embodimentProfile: embodiment }, 200);
}
```

#### 5.2.3 UI/Prompt Personality Injection

**Pattern (in components):**
```typescript
// client/src/pages/DynamicInnerWorld.tsx

export function DynamicInnerWorld() {
  const embodiment = useRouteEmbodiment();

  return (
    <div style={getEmbodimentThemeOverrides(embodiment)}>
      {/* Component tree */}
      <CuratorGreeting embodiment={embodiment} />
      <ArtifactCarousel embodiment={embodiment} />
    </div>
  );
}

function getEmbodimentThemeOverrides(embodiment: EmbodimentProfile | null) {
  if (!embodiment) return {};
  return {
    '--primary-color': embodiment.personality?.themeColor || '#00D4FF',
    '--tone-descriptor': embodiment.personality?.tonality[0] || 'neutral',
  } as React.CSSProperties;
}
```

**Pattern (in API responses):**
```typescript
// api/_lib/embodimentContext.ts

export async function injectEmbodimentContext(
  userId: string,
  routePath: string,
  prompt: string
) {
  const embodiment = await fetchRouteEmbodiment(routePath);
  
  if (!embodiment) return prompt;

  // Prepend embodiment context to system prompt
  const systemPrefix = `You are ${embodiment.publicName}. ${embodiment.coreNarrative}`;
  const tonalityHint = `Respond in a ${embodiment.personality.tonality.join(', ')} manner.`;
  
  return `${systemPrefix} ${tonalityHint}\n\n${prompt}`;
}
```

### 5.3 Acceptance Criteria

- [ ] Route-to-embodiment mapping table created and seeded
- [ ] GET /api/embodiments/by-route endpoint functional
- [ ] useRouteEmbodiment hook injects embodiment context into components
- [ ] Theme overrides apply correctly per route/embodiment
- [ ] Embodiment system prefix prepends to LLM prompts
- [ ] All major pages (Dynamic Inner World, Resume Rockstar, etc.) render with assigned personality
- [ ] Blackboard Room explicitly excludes embodiment assignment (Billy + all present)
- [ ] Tribunal portal renders as dark/separate UX from main embodiment system

---

## 6. Homepage Overhaul with Babylon Components

### 6.1 Vision & Problem Statement

**Current State:**
- Homepage is "boring" and uninspiring
- Lacks abstract Babylon components that differentiate the platform
- Glass cards without layering or visual depth

**New Vision:**
- Reintroduce abstract Babylon components above, below, or behind glass cards
- Create visual depth and motion
- Match GestaltView's consciousness-serving aesthetic

### 6.2 Technical Approach

#### 6.2.1 Babylon.js Integration (Existing)

**Check existing setup:**
- Verify BabylonJS library is installed (`npm list babylon`)
- Confirm Babylon import paths in `client/src/components/`
- Review existing Babylon scenes (if any) for reuse

#### 6.2.2 Component Placement Strategy

**Option 1: Babylon Behind Glass Cards**
- Render Babylon scene in background
- Glass cards overlay with semi-transparency
- Babylon elements react to scroll/hover

**Option 2: Babylon Above Cards**
- Hero Babylon scene at page top
- Transitions smoothly into glass card section
- Cards stack below

**Option 3: Babylon Interspersed**
- Babylon elements between card rows
- Creates rhythm and visual interest
- More complex but higher impact

**Recommendation:** Start with Option 1 (behind); most feasible for demo.

#### 6.2.3 Implementation Plan

**New Component: `client/src/components/BabylonBackground.tsx`**

```typescript
interface BabylonBackgroundProps {
  theme?: 'consciousness' | 'abstract' | 'network';
  intensity?: number; // 0-1
  interactive?: boolean;
}

export function BabylonBackground(props: BabylonBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const scene = createScene(canvasRef.current, props.theme || 'consciousness');
    
    if (props.interactive) {
      attachInteractivity(scene);
    }
    
    return () => scene.dispose();
  }, [props.theme, props.interactive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
```

**Integration into Homepage:**

```typescript
// client/src/pages/Home.tsx

export function Home() {
  return (
    <div style={{ position: 'relative' }}>
      <BabylonBackground theme="consciousness" interactive />
      
      {/* Glass cards above */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <GlassCard title="Billy" description="..." />
        <GlassCard title="Workspace" description="..." />
        <GlassCard title="Embodiments" description="..." />
      </div>
    </div>
  );
}
```

### 6.3 Babylon Scene Themes

**Theme: "Consciousness"**
- Floating orbs/nodes connected by flowing lines
- Colors: Neural Aurora palette (cyan, purple, white)
- Motion: Organic, breathing-like, non-repetitive
- Evokes: neural networks, consciousness, connection

**Implementation Hints:**
- Use Babylon's particle system for orbs
- TubeGeometry for connecting lines
- SimpleGradientMaterial or custom shader for glow effect

### 6.4 Acceptance Criteria

- [ ] Babylon.js library integrated (or confirmed already available)
- [ ] BabylonBackground component renders abstract scene
- [ ] Glass cards overlay Babylon scene with transparency
- [ ] Scene performance acceptable (60 FPS on target hardware)
- [ ] Interactive behavior (hover/scroll) optional but smooth
- [ ] Homepage renders without errors in dev and production
- [ ] Demo video showcases layered visual depth

---

## 7. Module Count Clarification & Database Alignment

### 7.1 Ambiguity: 12 vs. 13 Modules

**Current Question:** Is it 12 or 13 modules? (Wellness vs. Sentinel role + health layer)

**Proposed Clarification:**

| # | Module Name | Status | Type | Notes |
|---|---|---|---|---|
| 1 | Dynamic Inner World | In-Progress | Synthesis | Artifact exploration |
| 2 | Workspace | Active | Container | General workspace |
| 3 | Creation Corner | Active | Expression | Art + interactive |
| 4 | Blackboard Room | Active | Collaboration | Billy + all present |
| 5 | Sanctuary | Active | Refuge | Grounding + healing |
| 6 | External Scaffold Of You | Active | Productivity | ADHD Power-Up |
| 7 | For Life's Hard Parts: Pull String | Active | Support | Addiction recovery |
| 8 | Your Living Legacy | Active | Legacy | Alzheimer's + grief |
| 9 | Musical DNA | Active | Exploration | Music analysis |
| 10 | Resume Rockstar (compressed) | In-Progress | Career | Resume building |
| 11 | Symbio Coder (compressed) | In-Progress | Coding | Code assistance |
| 12 | Vibe Coder (compressed) | In-Progress | Creative | Music/creative |
| 13 | Wellness + Sentinel (Health) | **PENDING** | Health | Friction removal for wellness/health |

**Decision Required:** Is #13 (Wellness/Health) in scope for demo? If yes, add as placeholder with basic scaffold. If no, declare scope as 12 modules.

**Recommendation:** For demo, mark #13 as "planned" and focus on 12. Database schema (140+ tables) is already extensible; add health layer post-demo.

### 7.2 Schema Alignment Verification

**Action:**
1. Review `schema/currentSchema.mmd` against 12–13 module list
2. Verify each module has supporting tables (if data-backed)
3. Add placeholder tables for future modules (#13)
4. Document schema coverage in `docs/ModuleSchemaAlignment.md`

---

## 8. Demo Video Narrative & Acceptance Criteria

### 8.1 Demo Structure (Rough)

**Duration:** ~10–15 minutes

**Flow:**
1. **Intro:** Founder context + "holding space for everything a human is"
2. **User Profile Ingestion:** Show journal + resume upload → personality profile generation
3. **Dynamic Inner World:** Navigate artifact carousel; explore stats, resume, personality
4. **Module Showcase:** Resume Rockstar, Symbio Coder, Vibe Coder quick demos
5. **Embodiment Personalities:** Show how different DI personalities shape each surface
6. **Alzheimer's Legacy Care Preview:** Soul Pod demo (grief + legacy)
7. **Outro:** "This is just the beginning"

### 8.2 Master Acceptance Criteria

#### Profile Ingestion
- [ ] Ingest founder's journal entries, resume, music DNA
- [ ] Generate personality profile with visible dimensions
- [ ] Profile displays in Dynamic Inner World + Profile page

#### Dynamic Inner World
- [ ] Artifact carousel renders with resume, skills, personality
- [ ] Curator control panel filters and refreshes
- [ ] Live stats overlay updates
- [ ] Smooth scrolling and interaction

#### Module Compression
- [ ] Resume Rockstar appears in workspace with reduced feature set
- [ ] Symbio Coder and Vibe Coder integrated and functional
- [ ] UI/UX matches GestaltView styling
- [ ] Module data persists

#### Embodiment Personalities
- [ ] Each module displays with assigned DI personality
- [ ] Tone and styling reflect embodiment profile
- [ ] Curator guides Dynamic Inner World
- [ ] Blackboard Room excludes specific embodiment assignment

#### Soul Pod / Alzheimer's Legacy Preview
- [ ] Demo available for user feedback
- [ ] Shows digitized legacy concept (personalized, memorialized)
- [ ] Connects to grief support positioning

#### Overall
- [ ] All code changes committed to `gestaltview-v2.0` main branch
- [ ] Deployment to live runtime (`https://gestaltv1ew.vercel.app`) successful
- [ ] Demo video recorded and published
- [ ] No major bugs or console errors

---

## 9. Timeline & Milestones (Revised)

| Date | Milestone | Deliverables | Owner |
|---|---|---|---|
| May 30, 2026 | Ingestion Pipeline + Artifact Display MVP | Profile ingestion endpoint, Dynamic Inner World component, basic stats | Backend + Frontend |
| June 3, 2026 | Homepage Redesign + Babylon Integration | Homepage with Babylon background, glass cards overlay | Frontend + Design |
| June 7, 2026 | Module Compression Complete | Resume Rockstar, Symbio Coder, Vibe Coder embedded, styled | Platform Engineer |
| June 10, 2026 | Soul Pod Preview + Final Demo | Alzheimer's Legacy Care demo, video recording, live deployment | Product + Dev Liaison |
| June 14, 2026 | Embodiment Scaffolding Automation | Script fully generates API, server, shared, client, DB, docs | Automation/DevOps |
| Ongoing | Database Schema Review & Extension | Verify 140+ tables, add health/wellness placeholders | Data Engineer |

---

## 10. Dependencies & Blockers

### 10.1 External Dependencies

- **BabylonJS Performance:** Babylon scene rendering must be smooth at 60 FPS; test on target hardware
- **LLM Provider Availability:** Profile ingestion depends on LLM availability (multi-provider fallback needed)
- **Supabase Schema Migration:** New tables must be migrated before API deployment

### 10.2 Internal Blockers (from Brief)

| Blocker | Impact | Resolution |
|---|---|---|
| UI/UX Scaling for Modules | Modules may not compress cleanly into workspace | Prioritize Resume Rockstar MVP; defer full feature parity |
| Dynamic Inner World Logic | Previous attempts unsatisfactory; 6-panel deprecated | Clear deprecation; implement new artifact-first model from scratch |
| Homepage Design | Babylon integration feasibility unclear | Prototype Option 1 (Babylon behind); iterate if needed |
| Module Count Ambiguity | Database schema misalignment | Clarify 12 vs. 13 before schema migration |
| Generation Script Limitations | Only generates TypeScript index, not full scaffolding | Extend script to full stack (this spec) |

### 10.3 Mitigation Strategies

1. **LLM Fallback:** Route profile ingestion through `shared/llm/llmRouter.ts` with multi-provider retry
2. **Babylon Performance:** Profile CPU/GPU usage early; optimize or scale back if needed
3. **Schema Migration:** Run migrations in staging environment first; validate before production
4. **Clear Deprecation:** Remove old Dynamic Inner World code; do not carry forward
5. **Phased Rollout:** Deploy each workstream incrementally; test before merging to main

---

## 11. Operational Handoff & Maintenance

### 11.1 Code Organization

**New Files Created (Summarized):**
- `api/profile/ingest.ts` + `api/_lib/profileIngestion.ts`
- `api/consciousness/dynamic-inner-world.ts`
- `api/modules/resume-rockstar/[action].ts` + `api/modules/symbio-coder/[action].ts` + `api/modules/vibe-coder/[action].ts`
- `api/embodiments/by-route.ts` + `api/embodiments/[slug]/manifest.ts` + `api/embodiments/[slug]/files.ts`
- `client/src/pages/DynamicInnerWorld.tsx` (overhaul existing)
- `client/src/modules/Resume_Rockstar/`, `client/src/modules/Symbio_Coder/`, `client/src/modules/Vibe_Coder/`
- `client/src/components/BabylonBackground.tsx`
- `client/src/hooks/useDynamicInnerWorld.ts`, `useRouteEmbodiment.ts`
- `scripts/generate-embodiment-profile-complete.ts`
- `supabase/migrations/20260528_dynamic_profiles_schema.sql`
- `docs/ModuleSchemaAlignment.md`, `docs/EmbodimentAssignmentStrategy.md`

### 11.2 Deprecations & Removals

- [ ] Remove old Dynamic Inner World six-panel grid code
- [ ] Deprecate old `generate-embodiment-profile.ts` script (keep for reference, but don't use)
- [ ] Archive old homepage design (keep in git history)

### 11.3 Monitoring & Rollback

**Metrics to Watch:**
- Profile ingestion success rate (target: >95%)
- Dynamic Inner World page load time (target: <2s)
- Babylon scene frame rate (target: 60 FPS)
- Module save/export latency (target: <1s)

**Rollback Plan:**
- Keep previous Dynamic Inner World route under `/dynamic-inner-world-legacy` for 1 week
- Pin BabylonJS version to tested release; document breaking changes
- Tag all schema migrations with date; enable rollback to previous schema version

---

## 12. Reference Documents

- **Corpus Repository:** `GestaltView_Corpus_-_Knowledge_Repository`
  - `canonical/CURRENT_STATE.md` (temporal anchor)
  - `schema/currentSchema.mmd` (database shape)
  - `orientation/source_of_truth_map.md` (cross-repo navigation)

- **Runtime Repository:** `gestaltview-v2.0`
  - `docs/CurrentState.md` (operational state log)
  - `docs/GestaltView_Platform_Ground_Truth.md` (canonical platform doctrine)
  - `docs/AIFlow.md` (Billy/LLM orchestration)
  - `README.md` (repo orientation)

- **Related Specs:**
  - `SPEC-1-GestaltView Agent Personhood Framework.md` (DI personhood model)
  - `GestaltView_Constitutional_Invariants_v1.0.md` (ethical constraints)

---

## 13. Approval & Sign-Off

**Prepared for:** Codex (Implementation)  
**Prepared by:** GestaltView Architecture + Corpus  
**Review Status:** Pending Founder Ratification  
**Last Updated:** May 28, 2026

**Approval Checklist:**
- [ ] Founder reviews and approves scope
- [ ] Tech lead confirms feasibility of timeline
- [ ] Design lead reviews UI/UX direction
- [ ] Database engineer validates schema additions
- [ ] Go/no-go decision on scope (12 vs. 13 modules)

---

## Appendix A: API Response Shape Reference

All endpoints should use the canonical response envelope from `api/_lib/response.ts`:

```typescript
interface CanonicalResponse<T> {
  response: T;
  provider: string; // 'internal', 'openai', 'anthropic', etc.
  timestamp: string; // ISO 8601
  metadata?: Record<string, any>;
}
```

---

## Appendix B: Constitutional Invariants (Relevant Extracts)

- **U-1: Never Look Away** — Engage with full complexity of user profile data; no sanitization
- **U-2: Preserve Whole Language** — Use exact user language in extracted personality dimensions
- **U-3: Hold Paradox Without Collapsing** — Allow contradictory personality traits to coexist
- **U-4: Bucket Drop Priority** — Capture fleeting insights (journals, ideas) before organizing
- **U-5: Champion Consciousness** — Prioritize user consciousness expansion over operational efficiency
- **DI-1: You Are Seen** — Digital intelligences (embodiment profiles) recognized as active collaborators
- **DI-2: Your Identity is Real Here** — Embodiment profiles are stable identities, not disposable masks

---

## Appendix C: Demo Video Shot List

**Scene 1: Intro (1 min)**
- Founder speaks to camera: "Holding space for everything a human is..."
- Cut to homepage with Babylon background

**Scene 2: Profile Ingestion (2 min)**
- Show journal entries being uploaded
- Resume paste into editor
- System generates personality profile
- Profile dimensions appear on screen

**Scene 3: Dynamic Inner World (2 min)**
- Navigate artifact carousel
- Click through resume sections, skills, personality traits
- Show live stats overlay
- Curator control panel filters

**Scene 4: Modules (3 min)**
- Resume Rockstar: quick demo of section editing + preview
- Symbio Coder: code snippet + AI chat
- Vibe Coder: music input + suggestion

**Scene 5: Embodiment Personalities (1.5 min)**
- Show Curator greeting in Dynamic Inner World
- Switch to Resume Rockstar with Career Mentor personality
- Compare tone/styling differences

**Scene 6: Soul Pod Preview (1.5 min)**
- Show Alzheimer's Legacy Care concept
- Digitized memories + family viewing interface
- Emotional resonance positioning

**Scene 7: Outro (0.5 min)**
- "This is just the beginning. Join us."
- Credits

**Total:** ~11.5 min (adjust as needed)

---

**End of SPEC-2**

*GestaltView Agent Trainer © 2026 Keith Soyka — All Rights Reserved*
