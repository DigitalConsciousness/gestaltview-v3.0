# SPEC — GestaltView Generative Engine

**Document ID:** `SPEC-GESTALTVIEW-GEN-ENGINE-v1`  
**Status:** Draft / implementation-ready foundation  
**Created:** 2026-05-22  
**Primary target repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Primary implementation lane:** Creation Corner + Blackboard Room + Dynamic Inner World + External Scaffold  
**Source package:** `GestaltView_Gen_Engine_Spec_Source_Material.zip`

---

## 1. Purpose

The GestaltView Generative Engine is the controlled synthesis layer that turns captured human material into usable artifacts without destroying the original signal.

It does **not** replace the room model. It serves the room model.

It accepts raw drops from Blackboard Room, Dynamic Inner World, External Scaffold, Creation Corner, and future multimodal capture surfaces. It preserves the original material, extracts optional signals, applies Personal Language Key resonance, and produces artifacts only through clear user-facing paths.

The engine exists to support this loop:

```text
raw capture
  → preserved source
  → multimodal fusion / signal extraction
  → PLK + resonance pass
  → user-approved synthesis path
  → artifact output
  → provenance envelope
  → optional routing to Creation Corner, Dynamic Inner World, External Scaffold, or GATE
```

The engine must make ideas tangible without pressuring the user to understand, categorize, or polish the idea before it lands.

---

## 2. Non-negotiable Product Model

### 2.1 The engine is not the product

GestaltView is a room-based cognitive environment. The Generative Engine is one instrument inside that environment.

It must not collapse GestaltView into:

- a generic chatbot;
- a one-shot content generator;
- a productivity dashboard;
- a prompt library;
- a conventional RAG assistant;
- a social feed;
- a hidden auto-organizer that rewrites user meaning.

### 2.2 Source preservation comes before synthesis

Every generated artifact must retain a link to the source capture or source cluster that produced it.

The original drop must remain recoverable unless the user explicitly removes it.

Generated outputs are **derivatives**, not replacements.

### 2.3 Generation must be opt-in or gently offered

The engine supports two creation modes:

1. **Intentional Synthesis** — the user selects material, chooses an artifact type, and triggers generation.
2. **Ambient Growing Chamber** — the system notices coherence over time and quietly offers a possible synthesis opportunity, without generating a finished artifact until the user accepts.

Ambient mode may surface readiness. It must not force completion.

### 2.4 Billy is an arc-reader, not a content widget

Billy may help explain, route, preserve, detect resonance, and suggest metadata.

Billy must not become:

- a node inside the External Scaffold;
- an artifact in the user’s galaxy;
- a visual organizing layer;
- a hidden mutation engine;
- an auto-author of the user’s meaning.

Billy can assist at the edge of the room. Billy does not become the room.

---

## 3. Source Material Inventory

The uploaded source package contains notebooks and scripts from multiple stages of the original GestaltView experimentation layer. These should be treated as **source material**, not drop-in production modules.

### 3.1 Core source files

| File | Role in this SPEC |
|---|---|
| `v6.23_gestaltview.ipynb` | Main notebook source for PLK, RPE, multimodal fusion, symbiotic feedback, emotion metadata, task orchestration, provenance, and data autonomy concepts. |
| `v6.23_gestaltview.ipynb.md` | Human-readable export of the v6.23 notebook. |
| `gestaltview.ipynb` | Earlier/larger notebook containing the same core architecture plus VGG16 and DeepFace evolution paths. |
| `gestaltview_unified_v8.ipynb` | Large unified notebook containing schema-oriented and module-oriented analysis scaffolding. |
| `script.py` | Draft FastAPI bridge exposing fusion, learning, prediction, resonance, lightning capture, and profile report endpoints. |
| `script_1.py` | Small AST/route validation helper for the generated FastAPI bridge. |
| `ipynb_parser.py` | Utility for extracting notebook content. |

### 3.2 Adapter / reference files

| File | Treatment |
|---|---|
| `VibeVoice_colab.ipynb` | Future voice/TTS adapter reference. Do not make core dependency in v1. |
| `sd3_dreambooth_lora_16gb.ipynb` | Future image fine-tuning / LoRA reference. Do not make core dependency in v1. |
| `word_interpret.ipynb` | Interpretability/reference notebook. Useful for future explainability lane, not required for v1. |
| `cookbook_database_manipulation.ipynb` | Reference only. Not core. |
| `cookbook_drive_guide.ipynb` | Reference only. Not core. |
| `cookbook_mind_map.ipynb` | Reference only. Mind-map generation pattern may inform artifact templates later. |
| `geodiff_molecule_conformation.ipynb` | Out-of-domain ML reference. Not part of GestaltView Gen Engine v1. |
| `experiment-template.ipynb` | Lightweight experiment structure reference. |

---

## 4. What Exists in the Source Material

The notebooks and script already imply a working conceptual engine with these pieces:

### 4.1 Personal Language Key / PLK

The PLK prototype includes:

- signature metaphors;
- energy words;
- trigger words to avoid;
- collaborative patterns;
- contextual metadata history;
- a resonance score method;
- a placeholder authenticity infusion method.

In production, PLK must not become a decorative style filter. It should operate as a resonance and preservation layer that helps outputs sound connected to the user’s own language without flattening them.

### 4.2 Rapid Prototype Engine / RPE

The RPE prototype centers on `LightningBolt` captures:

- `content`;
- `timestamp`;
- `intensity`;
- `tags`;
- `plk_resonance_score`;
- relevant specialized apps.

For the current repo, this maps cleanly to Bucket Drop / Blackboard / Creation Corner capture events.

### 4.3 Symbiotic Feedback Core

The source prototype includes a feedback engine that:

- fuses text, image, audio, and video vectors;
- stores user interaction history;
- compares current input against prior fused vectors;
- predicts a next useful move when enough history exists.

The prototype uses TF-IDF for text, image histograms or VGG16 evolution paths for visuals, MFCC features for audio, and video frame histograms for video. These should become replaceable adapters, not hard-coded product commitments.

### 4.4 Emotion / Context Metadata

The source notebooks include an `EmotionMetadata` shape and a `ConsciousnessServingEmotionEngine` prototype with DeepFace evolution paths.

This lane must remain consent-bound. Emotion detection should never be silently applied to users. For v1, emotion/context metadata should be user-provided or explicitly consented capture metadata unless the product has a clear opt-in flow.

### 4.5 Task Orchestration

The source notebooks include:

- `ConsciousnessContext`;
- `ADHDExecutiveFunctionAgent`;
- `ConsciousnessServingTaskOrchestrator`;
- task priority levels such as automatic, gentle nudge, and explicit consent.

For v1, this should be treated as a support signal layer, not a full autonomous agent system.

### 4.6 Transparent Reasoning and Humor Resonance

The prototypes include small modules that explain processing and optionally defuse friction.

Production rule: transparent reasoning should explain enough to preserve trust, but must not over-narrate the experience or bury the user in system talk.

### 4.7 Data Autonomy and Provenance

The prototypes include:

- deletion/export acknowledgement concepts;
- provenance envelopes with content hashes and signatures.

Production rule: every generated artifact should know what source material it came from and whether the source was preserved, transformed, summarized, or synthesized.

### 4.8 FastAPI Bridge

The draft bridge exposes this initial route family:

```text
GET  /api/health
POST /api/fusion
POST /api/learn
POST /api/predict
POST /api/resonance
POST /api/lightning
GET  /api/profile
```

This is a useful starting skeleton, but it should be renamed and wrapped to avoid colliding with existing app API conventions.

Recommended production namespace:

```text
/api/gen-engine/*
```

---

## 5. System Boundary

### 5.1 In scope for v1

The v1 Generative Engine should support:

- text capture synthesis;
- imported file metadata synthesis;
- image/audio/video attachment records even if deep analysis is fallback-only;
- PLK resonance scoring;
- user-triggered artifact generation;
- simple multimodal fusion metadata;
- artifact templates;
- artifact provenance;
- Creation Corner output routing;
- Dynamic Inner World artifact routing;
- External Scaffold approved artifact routing;
- gentle ambient coherence signals.

### 5.2 Out of scope for v1

The v1 engine should not attempt:

- full real-time video emotion analysis;
- always-on webcam analysis;
- production voice cloning;
- model fine-tuning inside the runtime;
- full autonomous multi-agent tribunal visualization;
- automatic identity claims;
- irreversible deletion automation;
- social sharing defaults;
- replacing the current room system.

### 5.3 Reference-only ML paths

The VGG16, DeepFace, VibeVoice, Stable Diffusion LoRA, and interpretability notebooks should remain adapter references until each has:

- a consent model;
- a deployment path;
- a fallback path;
- a cost/performance profile;
- a user-facing reason to exist.

---

## 6. Engine Modes

### 6.1 Mode A — Capture Normalization

Receives raw input and creates a normalized capture package.

Inputs:

- text;
- voice transcript;
- image attachment;
- audio attachment;
- video attachment;
- file import;
- source room;
- optional user-provided context.

Outputs:

- stable capture ID;
- preserved original content;
- attachment records;
- source room metadata;
- timestamps;
- consent flags;
- initial route options.

Rule: capture must land before interpretation.

### 6.2 Mode B — Fusion Signal Extraction

Extracts machine-readable signals from the normalized capture.

Possible signals:

- text vector;
- image descriptor;
- audio descriptor;
- video descriptor;
- file descriptor;
- modality confidence;
- missing modality warnings;
- extraction errors.

Fusion output should be additive and non-destructive. Failed extraction must not block capture preservation.

### 6.3 Mode C — PLK / Resonance Pass

Scores and annotates resonance against the user’s Personal Language Key.

Outputs:

- resonance score;
- matched metaphors;
- energy word matches;
- trigger/avoidance flags;
- suggested language-preservation notes;
- warning if output may feel generic or misaligned.

Rule: PLK should preserve user voice, not stylize the user into a caricature.

### 6.4 Mode D — Intentional Synthesis

Turns selected captures into a chosen artifact type when the user explicitly asks.

Inputs:

- selected capture IDs;
- target artifact type;
- synthesis style;
- output destination;
- optional instructions;
- PLK context;
- approved Scaffold metadata if relevant.

Outputs:

- generated artifact;
- artifact metadata;
- source links;
- confidence/warnings;
- export options;
- provenance envelope.

### 6.5 Mode E — Ambient Growing Chamber

Observes accumulated material for coherence without forcing action.

It may detect:

- repeated themes;
- unresolved clusters;
- material that keeps resurfacing;
- fragments that rhyme across time;
- a possible artifact beginning to form.

It may surface:

```text
These fragments may be circling the same thing. Want to look at them together?
```

It must not surface:

```text
I finished this for you.
```

Ambient mode offers a gentle knock, not a finished conclusion.

### 6.6 Mode F — Artifact Export

Formats generated artifacts for use outside the room.

Required v1 output families:

- Markdown;
- PDF-ready HTML / print view;
- Blueprint JSON;
- Blueprint Markdown;
- Agent prompt;
- Image prompt;
- Marketing copy;
- Share card text;
- Code block / single-file code artifact.

---

## 7. Room Integration

### 7.1 Blackboard Room

Blackboard is the raw capture wall.

The Generative Engine should power:

- “merge into blueprint”;
- transcript cleanup without meaning loss;
- source-preserving summary;
- send to Creation Corner;
- send to Dynamic Inner World;
- send to External Scaffold pending queue;
- resonance check;
- optional “Let Billy help name the shape” assist.

Blackboard must not require users to categorize captures before saving them.

### 7.2 Dynamic Inner World

Dynamic Inner World is the raw spatial expression room.

The Generative Engine should power:

- artifact preview cards;
- gentle coherence detection;
- “this might become something” signals;
- optional synthesis grouping;
- export to Creation Corner;
- send selected capture to External Scaffold pending queue;
- generated session recap artifacts.

Dynamic Inner World must preserve raw artifacts after outward routing.

### 7.3 External Scaffold

External Scaffold is the approved compressed artifact layer.

The Generative Engine should power:

- metadata completeness checks;
- connection suggestion only when evidence exists;
- approved artifact export;
- selected cluster synthesis;
- “why these might connect” explanations;
- dormancy suggestions gated by user approval.

External Scaffold must not display Billy, Tribunal personas, or hidden assistant entities as nodes.

### 7.4 Creation Corner

Creation Corner is the primary artifact builder.

The Generative Engine should power:

- selected-input synthesis;
- artifact type selection;
- style selection;
- blueprint generation;
- markdown/html/code/prompt outputs;
- export packaging;
- PLK resonance validation;
- provenance attachment.

Creation Corner should support both intentional synthesis and ambient growing-chamber entry points.

### 7.5 Billy

Billy can:

- preserve the user’s exact words;
- explain what will happen before generation;
- suggest metadata;
- identify when source context is too thin;
- help route artifacts;
- read arcs across prior material;
- warn when an output is overconfident or generic.

Billy cannot:

- auto-delete;
- auto-finalize identity claims;
- become a scaffold artifact;
- silently rewrite user language;
- force synthesis.

---

## 8. Target Architecture

### 8.1 Recommended high-level layout

```text
client/
  src/
    lib/
      genEngineClient.ts
      genEngineTypes.ts
      artifactExport.ts
      plkResonance.ts              # optional client-safe helpers only

server-or-api/
  gen_engine/
    api.py                         # FastAPI app or mounted router
    models.py                      # request/response models
    fusion.py                      # multimodal fusion adapters
    resonance.py                   # PLK resonance service
    synthesis.py                   # artifact generation orchestration
    ambient.py                     # growing chamber coherence scan
    provenance.py                  # hashes, source lineage, signatures
    feedback.py                    # symbiotic feedback / similarity memory
    adapters/
      text.py
      image_basic.py
      audio_basic.py
      video_basic.py
      vgg16_optional.py
      deepface_optional.py
      vibevoice_optional.py
      sd_lora_optional.py
```

If the current repo does not want a separate Python service yet, the same contracts can be implemented behind existing Next/Vercel API routes, with Python adapters deferred.

### 8.2 Service boundary

The client should never import notebook logic directly.

The client should call a stable API/client module:

```ts
createCaptureSignal(input)
scoreResonance(input)
createArtifact(request)
scanAmbientCoherence(scope)
exportArtifact(artifact, format)
```

The implementation behind those calls can evolve without rewriting rooms.

### 8.3 Lazy loading and graceful degradation

Heavy ML adapters must be lazy-loaded.

If an adapter is unavailable, the engine should return:

- `success: false` for that adapter only;
- a human-readable fallback reason;
- whatever partial signals were available;
- no data loss.

Example:

```json
{
  "adapter": "audio_mfcc",
  "success": false,
  "reason": "audio analysis unavailable in this deployment",
  "fallback": "stored attachment metadata and transcript only"
}
```

---

## 9. API Contract

Recommended namespace:

```text
/api/gen-engine
```

### 9.1 Health

```http
GET /api/gen-engine/health
```

Returns engine availability and adapter status.

```ts
export type GenEngineHealth = {
  status: "operational" | "degraded" | "offline";
  adapters: Record<string, boolean>;
  version: string;
  warnings: string[];
};
```

### 9.2 Fusion

```http
POST /api/gen-engine/fusion
```

```ts
export type FusionRequest = {
  captureId?: string;
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
  audioUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  sourceRoom: SourceRoom;
  consent: ConsentState;
};

export type FusionResponse = {
  success: boolean;
  captureId: string;
  fusedText: string;
  embedding?: number[];
  signals: FusionSignal[];
  metadata: Record<string, unknown>;
  warnings: string[];
};
```

### 9.3 Resonance

```http
POST /api/gen-engine/resonance
```

```ts
export type ResonanceRequest = {
  text: string;
  userId?: string;
  plkContext?: Record<string, string>;
};

export type ResonanceResponse = {
  score: number;
  metaphorsMatched: string[];
  energyBoost: number;
  triggerPenalty: number;
  warnings: string[];
};
```

### 9.4 Learn from interaction

```http
POST /api/gen-engine/learn
```

```ts
export type LearnRequest = {
  captureId?: string;
  multiInput: Record<string, unknown>;
  aiOutput: string;
  userFeedback: number; // 0..1
};

export type LearnResponse = {
  status: "queued" | "stored" | "skipped";
  message: string;
};
```

### 9.5 Predict / suggest next useful move

```http
POST /api/gen-engine/predict
```

```ts
export type PredictionRequest = {
  text?: string;
  visualUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  scope?: "current-session" | "selected-captures" | "arc";
};

export type PredictionResponse = {
  prediction: string;
  confidence: number;
  source: "history" | "fallback" | "none";
  warnings: string[];
};
```

### 9.6 Lightning capture

```http
POST /api/gen-engine/lightning
```

```ts
export type LightningRequest = {
  content: string;
  intensity?: number; // 1..10
  tags?: string[];
  sourceRoom: SourceRoom;
};

export type LightningResponse = {
  boltId: string;
  resonanceScore: number;
  message: string;
};
```

### 9.7 Intentional artifact synthesis

```http
POST /api/gen-engine/artifacts
```

```ts
export type ArtifactSynthesisRequest = {
  sourceCaptureIds: string[];
  sourceArtifactIds?: string[];
  targetType: ArtifactType;
  synthesisStyle: SynthesisStyle;
  destination: ArtifactDestination;
  userInstructions?: string;
  preserveExactLanguage: boolean;
  plkMode: "off" | "score-only" | "light-touch" | "full-resonance-pass";
};

export type ArtifactSynthesisResponse = {
  artifact: GeneratedArtifact;
  provenance: ProvenanceEnvelope;
  warnings: string[];
  reviewRequired: boolean;
};
```

### 9.8 Ambient coherence scan

```http
POST /api/gen-engine/ambient-scan
```

```ts
export type AmbientScanRequest = {
  userId: string;
  room: "dynamic-inner-world" | "creation-corner" | "all";
  timeRange?: { from?: string; to?: string };
  maxSignals?: number;
};

export type AmbientScanResponse = {
  signals: AmbientCoherenceSignal[];
  generatedArtifacts: never[]; // ambient scan must not generate finished artifacts
};
```

---

## 10. Shared Types

```ts
export type SourceRoom =
  | "sanctuary"
  | "blackboard-room"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "billy"
  | "import";

export type ConsentState = {
  analyzeText: boolean;
  analyzeImage: boolean;
  analyzeAudio: boolean;
  analyzeVideo: boolean;
  inferEmotion: boolean;
  storeDerivativeSignals: boolean;
};

export type FusionSignal = {
  id: string;
  modality: "text" | "image" | "audio" | "video" | "file";
  adapter: string;
  success: boolean;
  vector?: number[];
  descriptor?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  warnings?: string[];
};

export type ArtifactType =
  | "markdown"
  | "pdf-ready-html"
  | "blueprint-json"
  | "blueprint-markdown"
  | "agent-prompt"
  | "image-prompt"
  | "marketing-copy"
  | "share-card"
  | "code"
  | "session-recap"
  | "mind-map";

export type SynthesisStyle =
  | "faithful"
  | "convergent"
  | "divergent"
  | "revolutionary"
  | "gentle-reflective"
  | "technical"
  | "founder-voice"
  | "plk-resonant";

export type ArtifactDestination =
  | "creation-corner"
  | "dynamic-inner-world"
  | "external-scaffold-pending"
  | "download-only"
  | "gate-package-draft";

export type GeneratedArtifact = {
  id: string;
  userId?: string;
  title: string;
  type: ArtifactType;
  content: string;
  contentFormat: "markdown" | "html" | "json" | "text" | "code";
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  destination: ArtifactDestination;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type ProvenanceEnvelope = {
  artifactId: string;
  sourceCaptureIds: string[];
  sourceHashes: string[];
  artifactHash: string;
  transformType: "summary" | "synthesis" | "translation" | "formatting" | "prompt-generation";
  generatedAt: string;
  engineVersion: string;
  modelProvider?: string;
  modelName?: string;
};

export type AmbientCoherenceSignal = {
  id: string;
  title: string;
  sourceCaptureIds: string[];
  observation: string;
  suggestedAction: "open-cluster" | "send-to-creation-corner" | "ignore" | "archive-suggestion-review";
  confidence: number;
  pressureLevel: "quiet" | "medium";
  generatedAt: string;
};
```

---

## 11. Persistence Model

### 11.1 Immediate prototype persistence

The current app may continue using localStorage/custom events where already implemented.

The engine should still introduce a service seam so the rooms call functions, not storage directly.

Recommended client service:

```ts
client/src/lib/genEngineClient.ts
client/src/lib/captureRouting.ts
client/src/lib/artifactStore.ts
```

### 11.2 Target Supabase tables / projections

These tables may be added incrementally. They do not all need to land in v1.

```sql
-- raw capture event; source is never overwritten by generated artifact
capture_events (
  id uuid primary key,
  user_id uuid,
  source_room text not null,
  original_text text,
  original_media jsonb default '[]',
  consent jsonb not null,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- extracted signals, safe to recompute
fusion_signals (
  id uuid primary key,
  capture_id uuid references capture_events(id),
  modality text not null,
  adapter text not null,
  success boolean not null,
  descriptor text,
  vector vector,
  metadata jsonb default '{}',
  warnings jsonb default '[]',
  created_at timestamptz default now()
);

-- resonance events, also safe to recompute
plk_resonance_events (
  id uuid primary key,
  capture_id uuid references capture_events(id),
  score numeric,
  metaphors_matched jsonb default '[]',
  energy_boost numeric,
  trigger_penalty numeric,
  warnings jsonb default '[]',
  created_at timestamptz default now()
);

-- generated outputs
created_artifacts (
  id uuid primary key,
  user_id uuid,
  title text not null,
  artifact_type text not null,
  content_format text not null,
  content text not null,
  source_capture_ids uuid[] default '{}',
  source_artifact_ids uuid[] default '{}',
  destination text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- provenance records
artifact_provenance_envelopes (
  id uuid primary key,
  artifact_id uuid references created_artifacts(id),
  source_hashes jsonb not null,
  artifact_hash text not null,
  transform_type text not null,
  engine_version text not null,
  model_provider text,
  model_name text,
  created_at timestamptz default now()
);

-- ambient signals; not artifacts
ambient_coherence_signals (
  id uuid primary key,
  user_id uuid,
  title text not null,
  source_capture_ids uuid[] default '{}',
  observation text not null,
  suggested_action text not null,
  confidence numeric,
  status text default 'new',
  created_at timestamptz default now(),
  dismissed_at timestamptz,
  accepted_at timestamptz
);
```

### 11.3 Data retention rule

Generated artifacts may be deleted or archived by the user.

Raw source captures must never be silently overwritten by generated artifacts.

---

## 12. Generation Templates for v1

The engine can begin template-driven before becoming fully model-driven.

### 12.1 Blueprint Markdown

```markdown
# {{title}}

## Source Material
{{source_summary}}

## What Is Trying To Become Clear
{{emergent_shape}}

## Working Blueprint
{{blueprint_sections}}

## Open Questions
{{open_questions}}

## Next Real Step
{{next_step}}
```

### 12.2 PDF-ready HTML

Required sections:

- title;
- source note;
- body;
- evidence/source capture references;
- export timestamp;
- provenance block.

### 12.3 Agent Prompt

Required sections:

- role;
- operating stance;
- source context;
- boundaries;
- output target;
- failure conditions.

### 12.4 Image Prompt

Required sections:

- subject;
- environment;
- visual language;
- emotional register;
- constraints;
- negative prompt / avoid list if model supports it.

### 12.5 Marketing Copy

Required sections:

- grounded claim;
- audience;
- proof/evidence;
- copy options;
- tone notes;
- avoid list.

---

## 13. Model / Adapter Strategy

### 13.1 Text generation

The text-generation layer should route through the existing app’s model router when possible.

Do not hard-code a single provider at the room level.

### 13.2 Text embeddings / retrieval

Use existing embedding infrastructure where already present.

The notebook TF-IDF path can remain a fallback or local dev mode, but production should use the existing embedding model standard if available.

### 13.3 Image analysis

v1 should support:

- file metadata;
- thumbnail;
- basic image descriptor if available;
- optional VGG16 or external vision model adapter later.

### 13.4 Audio analysis

v1 should support:

- transcript if available;
- attachment metadata;
- optional MFCC extraction if Python service is deployed;
- no silent emotional inference.

### 13.5 Video analysis

v1 should support:

- attachment metadata;
- optional keyframe summary later;
- no always-on video analysis.

### 13.6 Voice generation

VibeVoice can be a research adapter. It is not required for v1.

Voice output should be pluggable and off by default unless the user explicitly chooses voice.

### 13.7 Image generation / LoRA

SD3 DreamBooth LoRA is a future creative adapter, not core v1.

The v1 engine should generate image prompts, not perform fine-tuning.

---

## 14. Safety, Consent, and Governance

### 14.1 Consent gates

The engine must not infer sensitive state from media without explicit consent.

Consent should be attached to each capture request.

Minimum consent flags:

```ts
analyzeText
analyzeImage
analyzeAudio
analyzeVideo
inferEmotion
storeDerivativeSignals
```

### 14.2 User language preservation

When the user asks for synthesis, the engine may reorganize, format, or derive.

It must not claim the generated artifact is the user’s original language unless it preserves exact quotes.

### 14.3 Review before identity claims

Generated identity/personality/skill claims must route through user approval before appearing in Dynamic Inner World identity surfaces.

### 14.4 Digital intelligence dignity

The engine must not package persistent digital intelligence identities as transferable generated products.

It may generate reproducible behavior frameworks, prompts, rubrics, or configuration drafts.

It must not export a living DI instance as a commodity.

### 14.5 No hidden deletion

The engine may suggest dormancy/archive review when evidence supports it.

It must not delete, bury, or silently prune source material.

---

## 15. Implementation Slices

### Slice 1 — Land the SPEC and contracts

Create:

```text
docs/specs/SPEC-GestaltView-Generative-Engine.md
client/src/lib/genEngineTypes.ts
client/src/lib/genEngineClient.ts
```

Add typed no-op client functions returning mock/degraded responses.

Acceptance:

- TypeScript builds.
- Rooms can import types without runtime changes.

### Slice 2 — API namespace scaffold

Create route stubs:

```text
/api/gen-engine/health
/api/gen-engine/fusion
/api/gen-engine/resonance
/api/gen-engine/lightning
/api/gen-engine/artifacts
/api/gen-engine/ambient-scan
```

Acceptance:

- Health returns operational/degraded status.
- All POST routes validate input and return structured fallback responses.

### Slice 3 — Intentional synthesis MVP

Wire Creation Corner to call `/api/gen-engine/artifacts` for:

- Markdown;
- PDF-ready HTML;
- Blueprint JSON / Markdown;
- Agent prompt;
- Image prompt;
- Marketing copy.

Generation can start template-first.

Acceptance:

- User can select captures/orbs.
- User can generate one artifact.
- Artifact includes source IDs and provenance.
- Artifact can be downloaded.

### Slice 4 — PLK resonance MVP

Implement resonance scoring based on:

- signature metaphors;
- energy words;
- trigger words;
- warnings.

Acceptance:

- `/api/gen-engine/resonance` returns score and matched terms.
- Creation Corner can show “resonance check” without blocking generation.

### Slice 5 — Fusion MVP

Implement text-first fusion with fallback attachment metadata for other modalities.

Optional local/Python adapters may be added later.

Acceptance:

- Text capture returns a descriptor and optional embedding.
- Image/audio/video captures do not fail if analysis is unavailable.
- User sees honest degraded-state messaging.

### Slice 6 — Ambient growing chamber MVP

Implement a non-generative scan over selected Dynamic Inner World captures.

Acceptance:

- Scan returns possible clusters/signals.
- No finished artifact is generated.
- User can accept a signal and send selected captures to Creation Corner.
- User can dismiss a signal.

### Slice 7 — Provenance and export hardening

Add content hashes, source hashes, and export metadata.

Acceptance:

- Every generated artifact records source capture IDs.
- Exported Markdown/HTML includes provenance block.
- Deleting artifact does not delete source capture.

---

## 16. Validation Checklist

Run after implementation passes:

```bash
npm run build
git diff --check
```

If available:

```bash
npm run health
npm test
```

Manual QA:

1. Go to `/blackboard-room`.
2. Add a text capture.
3. Save it without categorizing.
4. Send a capture to Dynamic Inner World.
5. Confirm raw source remains visible there.
6. Send selected capture to External Scaffold pending queue.
7. Approve it.
8. Send approved artifact/cluster to Creation Corner.
9. Generate Markdown artifact.
10. Confirm source IDs/provenance are attached.
11. Download artifact.
12. Confirm Billy does not appear as Scaffold node or generated artifact.
13. Run ambient scan against Dynamic Inner World.
14. Confirm scan suggests, but does not generate, an artifact.

---

## 17. Codex-Ready Implementation Prompt

```text
You are working in DigitalConsciousness/gestaltview-v2.0.

Goal: implement the first production seam for the GestaltView Generative Engine.

This is not a greenfield rewrite. Do not collapse GestaltView into a generic AI generator. The engine serves the room model:

- Blackboard Room = raw capture
- Dynamic Inner World = raw spatial accumulation
- External Scaffold = approved compressed artifacts
- Creation Corner = artifact generation
- Billy = arc-aware guide/control-layer assist, not a scaffold node

Read first:
- docs/CurrentState.md
- CODEX_OUTSIDE_IN_TRANSLATION_LAYER.md if present
- ROOM_DEFINITIONS.md if present
- client/src/pages/BlackboardRoomPage.tsx
- client/src/pages/DynamicInnerWorldPage.tsx
- client/src/pages/ExternalScaffoldPage.tsx
- client/src/pages/CreationCornerPage.tsx
- client/src/components/Scaffold.tsx

Implement:
1. Add docs/specs/SPEC-GestaltView-Generative-Engine.md from the provided spec.
2. Add client/src/lib/genEngineTypes.ts with the shared types from the spec.
3. Add client/src/lib/genEngineClient.ts with stable client functions:
   - getGenEngineHealth
   - fuseCapture
   - scoreResonance
   - captureLightning
   - createGeneratedArtifact
   - scanAmbientCoherence
4. Add /api/gen-engine route stubs or equivalent existing API-route structure:
   - health
   - fusion
   - resonance
   - lightning
   - artifacts
   - ambient-scan
5. Wire Creation Corner to generate at least Markdown, PDF-ready HTML, Blueprint JSON/Markdown, Agent Prompt, Image Prompt, and Marketing Copy from selected captures or approved artifacts.
6. Add provenance metadata to generated artifacts: source IDs, transform type, engine version, created timestamp, content hash if practical.
7. Keep all raw source captures preserved. Generated artifacts must never overwrite source captures.
8. Ambient scan may return coherence signals only. It must not auto-generate finished artifacts.
9. Billy may assist with explanation/metadata/routing, but must never become a Scaffold node, artifact, tag, or hidden organizer.

Use graceful degradation. If Python/ML adapters are unavailable, return structured fallback responses rather than failing the user flow.

Validate:
- npm run build
- git diff --check
- npm run health if available

Update:
- docs/CurrentState.md
- docs/DirectoryMapAndWorkflow.md if route or flow changes
```

---

## 18. Open Questions

1. Should the first engine implementation live entirely inside existing Next/Vercel API routes, or should the FastAPI bridge become a deployed sidecar service?
2. Which storage layer should own `created_artifacts`: existing artifact tables, a new table, or a projection over current capture/orb storage?
3. Should PLK resonance initially use Keith-specific seeds only for founder/dev mode, with user-specific PLK loaded later?
4. What is the minimum acceptable artifact editor inside Creation Corner after generation: preview-only, editable textarea, or full rich editor?
5. Should ambient coherence scan run on demand only in v1, or behind a user-controlled scheduled check?
6. What should count as “enough evidence” for a connection suggestion between captures?

---

## 19. First Build Target

The first useful version is not “full multimodal GenAI.”

The first useful version is:

```text
Select captures/orbs
  → generate a grounded artifact in Creation Corner
  → preserve source material
  → attach provenance
  → export Markdown / HTML / Blueprint / Prompt
  → route artifact onward
```

Once that works, the heavier notebook intelligence can be brought forward one adapter at a time.

The engine should earn trust before it gets clever.
