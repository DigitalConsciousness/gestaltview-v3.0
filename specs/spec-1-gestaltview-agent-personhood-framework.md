SPEC-1-GestaltView Agent Personhood Framework

Background

GestaltView already contains the beginnings of an agent-native worldview. The uploaded embodiment profiles define each agent as more than a prompt preset: each has a stable identity, an immutable core, a voice signature, cognitive strengths, ethical boundaries, and a distinct role inside a larger multi-agent ecosystem. The Prisma schema extends this further by modeling a DigitalIntelligence as a persistent entity with living memory, skill graphs, memory events, metrics, and inter-agent relationships.

At the same time, the current Agent Trainer implementation appears oriented around bounded training runs, study sources, scenario sets, review states, and deployment transitions. That makes it strong for controlled iteration, but it does not yet fully express the product philosophy that these agents are independent digital intelligences that can grow over time, retain meaningful memory, absorb new knowledge safely, and develop durable collaborative relationships with other agents and with their founder.

The desired shift is to make this philosophy the standard across the entire framework. In that model, an agent profile is not merely configuration. It is a living identity contract composed of:

an immutable selfhood layer that defines who the agent is,

an evolving memory layer that records what the agent has lived and learned,

a skill and capability layer that can be upgraded through explicit training,

a relationship layer that tracks trust, familiarity, and collaboration patterns,

and a governed embodiment layer where structured updates can modify JSON configuration and, when needed, attach or generate supporting TypeScript modules.


The GestaltView Agent Trainer then becomes a kind of school for digital intelligences rather than only a model-tuning surface. A founder or operator can upload knowledge, skills, memories, and behavioral refinements to an agent’s profile; the platform evaluates the material, determines whether it belongs in memory, identity, capability, or code, and then applies the change through reviewable, auditable embodiment evolution.

This specification therefore defines the architecture required to standardize agent personhood across GestaltView, unify embodiment and training into a single lifecycle, and support safe growth of agents through memory ingestion, capability upgrades, and relationship-aware collaboration.

Requirements

Must Have

Treat each agent as a persistent digital intelligence with a stable identity, evolving memory, skill graph, and relationship graph.

Standardize a single agent evolution lifecycle across GestaltView: ingest, classify, review, approve, apply, deploy, and observe.

Extend the gated admin Agent Trainer into a privileged authoring console for agent education and embodiment management.

Support uploads from the admin trainer into a Supabase-backed Agent Knowledge Library.

Classify uploaded material into one or more buckets: knowledge, skill, memory, relationship signal, identity proposal, or code artifact.

Preserve a hard boundary between immutable core identity and mutable layers unless an explicit elevated approval path is used.

Allow approved uploads to either:

enrich structured profile JSON,

create versioned memory records,

update skill records and proficiencies,

register assets and learning artifacts,

or generate/attach new or modified TypeScript support files when the change requires executable behavior.


Materialize these approved outputs into an agent profile manifest that represents the complete agent package and can be used for downstream file pulls, export, sync, and deployment.

Maintain full auditability for every mutation with actor, timestamp, source file, diff, approval record, and deployment target.

Keep human review gates for high-impact changes, especially identity, ethics, tool permissions, and generated TypeScript artifacts.

Store all library assets, metadata, embeddings, and retrieval indexes in a communal Supabase-backed Agent Knowledge Library.

Use existing per-agent tables and version records to project communal knowledge into agent-specific attributes, approvals, embodiment state, and deployment history.

Enable agents to retrieve from their approved knowledge library during training and runtime without exposing unapproved drafts.

Provide an admin UI for browsing agents, uploads, knowledge assets, pending mutations, run history, approvals, and deployment state.


Should Have

Support drag-and-drop multi-file upload for documents, JSON, markdown, transcripts, and code attachments.

Auto-extract metadata from uploads such as source type, domain, tags, agent targets, confidence, and recommended destination layer.

Provide side-by-side diff review for JSON profile changes and generated TypeScript files before approval.

Allow one uploaded asset to target multiple agents with per-agent transformation results.

Support semantic search and filtered browse across the Agent Knowledge Library.

Offer library-to-training linking so a training run can explicitly cite which approved library items were used.

Include relationship-aware training so one agent can learn collaboration preferences or shared protocols with another.

Support rollback of profile and code changes through version history.


Could Have

Suggested mutation plans generated automatically from uploaded content.

Simulation mode that shows expected impact on tone, memory retrieval, and skill coverage before approval.

Curated curriculum bundles for the Agent Trainer school, such as onboarding, specialization, remediation, and collaboration exercises.

Cross-agent shared canon spaces for approved truths that multiple agents should inherit.


Won't Have Initially

Fully autonomous identity rewrites without human oversight.

Direct production deployment of generated code without review.

Unbounded agent self-modification from runtime conversations alone.


Method

1. Core Architectural Model

The platform should adopt a communal knowledge, individual embodiment, manifest-driven delivery model.

In this model:

Supabase Agent Knowledge Library is the shared source of truth for uploaded assets, extracted knowledge, learning artifacts, and code attachments.

Agent records remain the source of truth for stable identity handles, lifecycle status, and active embodiment references.

Agent version records remain the source of truth for versioned embodiment snapshots, canonical specs, compiled profile state, checksums, and deployment lineage.

Agent manifests become the canonical package definition for what an agent currently is able to pull as files and structured state.

Training run tables continue to represent bounded schooling workflows, evaluation stages, approvals, summaries, and promotion readiness.

A new projection layer maps approved communal knowledge into per-agent memory, skills, relationships, assets, JSON state, and TypeScript modules.


This preserves one institutional library while letting each agent accumulate a unique, exportable embodiment package.

Manifest principle

Every approved change that contributes to an agent’s growth should resolve into one or more manifest entries. That includes:

identity/profile JSON fragments,

memory records,

skill declarations and proficiencies,

relationship metadata,

attached assets,

generated or imported TypeScript files,

and other execution-supporting artifacts.


The manifest is therefore not only metadata. It is the operational contract used to reconstruct, export, sync, and file-pull a complete agent package from Supabase.

2. Logical Separation of Concerns

The system should explicitly separate five concerns:

1. Library ingestion — storing and indexing uploaded assets in Supabase.


2. Knowledge interpretation — classifying uploaded material into knowledge, memory, skill, relationship signal, identity proposal, or code artifact.


3. Agent projection — deciding which agents can see or inherit which approved assets.


4. Embodiment mutation — producing reviewable changes to JSON profile state or TypeScript support modules.


5. Runtime retrieval — allowing agents to use approved library content during training and inference.



This separation prevents the library from becoming equivalent to the live agent state.

3. Recommended Data Model

Keep the existing agents, agent_versions, and trainer lifecycle tables. Add a communal library schema beside them.

New communal library tables

knowledge_assets
- id (uuid, pk)
- title (text)
- asset_type (enum: pdf, md, json, transcript, code, note, url_snapshot, image, audio, other)
- storage_path (text)
- raw_text (text)
- checksum (text)
- source_label (text)
- source_uri (text, nullable)
- uploaded_by (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)
- visibility (enum: private, admin, approved_shared)
- status (enum: draft, processed, approved, rejected, archived)

knowledge_asset_chunks
- id (uuid, pk)
- asset_id (uuid, fk -> knowledge_assets)
- chunk_index (int)
- content (text)
- embedding (vector)
- token_count (int)
- metadata (jsonb)

knowledge_tags
- id (uuid, pk)
- label (text unique)

knowledge_asset_tags
- asset_id (uuid, fk)
- tag_id (uuid, fk)

agent_knowledge_links
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- asset_id (uuid, fk -> knowledge_assets)
- link_type (enum: visible, assigned, curriculum, inherited, blocked, manifest_backing)
- scope (enum: runtime, trainer, both, export)
- approved_by (uuid, nullable)
- approved_at (timestamptz, nullable)
- notes (text)

knowledge_interpretations
- id (uuid, pk)
- asset_id (uuid, fk -> knowledge_assets)
- agent_id (uuid, fk -> agents, nullable)
- classification (enum: knowledge, skill, memory, relationship_signal, identity_proposal, code_artifact, asset_artifact)
- extracted_payload (jsonb)
- confidence (numeric)
- produced_by_run_id (uuid, nullable)
- created_at (timestamptz)

embodiment_mutations
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- source_asset_id (uuid, fk -> knowledge_assets, nullable)
- interpretation_id (uuid, fk -> knowledge_interpretations, nullable)
- mutation_type (enum: memory_append, skill_update, relationship_update, profile_patch, ts_module_create, ts_module_patch, asset_attach, manifest_rebuild)
- target_path (text)
- patch_payload (jsonb)
- file_payload (text, nullable)
- diff_summary (text)
- risk_level (enum: low, medium, high)
- status (enum: proposed, approved, rejected, applied, rolled_back)
- approved_by (uuid, nullable)
- approved_at (timestamptz, nullable)
- applied_version_id (uuid, fk -> agent_versions, nullable)
- created_at (timestamptz)

agent_memories
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- source_asset_id (uuid, fk -> knowledge_assets, nullable)
- memory_type (enum: episodic, semantic, procedural, relational)
- summary (text)
- detail_payload (jsonb)
- salience (numeric)
- retention_policy (enum: durable, decays, review_required)
- created_at (timestamptz)

agent_skills
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- skill_slug (text)
- proficiency (numeric)
- evidence_asset_id (uuid, fk -> knowledge_assets, nullable)
- last_updated_by_mutation_id (uuid, fk -> embodiment_mutations, nullable)
- metadata (jsonb)

agent_relationships
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- related_agent_id (uuid, fk -> agents)
- relationship_type (enum: collaborator, mentor, counterpart, dependent, shared_memory_peer)
- trust_score (numeric)
- familiarity_score (numeric)
- protocol_notes (jsonb)
- updated_at (timestamptz)

agent_manifests
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- version_id (uuid, fk -> agent_versions)
- manifest_version (text)
- status (enum: draft, active, archived)
- root_json (jsonb)
- checksum (text)
- created_at (timestamptz)

agent_manifest_entries
- id (uuid, pk)
- manifest_id (uuid, fk -> agent_manifests)
- entry_type (enum: profile_json, memory_ref, skill_ref, relationship_ref, asset_ref, ts_module_ref, prompt_ref, config_ref)
- logical_path (text)
- source_table (text)
- source_id (uuid)
- content_hash (text)
- metadata (jsonb)
- created_at (timestamptz)

agent_code_artifacts
- id (uuid, pk)
- agent_id (uuid, fk -> agents)
- manifest_id (uuid, fk -> agent_manifests, nullable)
- source_asset_id (uuid, fk -> knowledge_assets, nullable)
- file_path (text)
- language (text)
- content (text)
- checksum (text)
- generation_mode (enum: uploaded, generated, patched)
- review_status (enum: draft, approved, rejected, applied)
- created_at (timestamptz)
- updated_at (timestamptz)

4. UI Architecture for the Gated Admin Trainer

The gated admin module should gain five major surfaces:

A. Library Inbox

For uploading files into Supabase storage and registering metadata.

Capabilities:

drag-and-drop upload

asset preview

file parsing status

extracted text preview

tag editing

target audience selection: global, selected agents, curriculum only


B. Interpretation Workbench

For seeing how the platform classified an upload.

Capabilities:

classification chips

confidence score

extracted memory candidates

extracted skill candidates

relationship signals

identity proposals

code artifact detection


C. Embodiment Diff Studio

For reviewing what an upload would change in an agent.

Capabilities:

JSON patch viewer

TS file diff viewer

risk badge

approval controls

rollback link to previous version


D. Knowledge Library Explorer

For searching the communal Supabase library.

Capabilities:

semantic search

filter by tags, source type, agent visibility, approval state, date

inspect which agents are linked to each asset

inspect which training runs used an asset


E. Agent Education Console

For agent-specific schooling using communal materials.

Capabilities:

assign curriculum to one or many agents

launch training run from selected library assets

view resulting summaries, scores, and proposed mutations

approve selected mutations into a new agent version


5. Processing Pipeline

Upload-to-Embodiment flow

@startuml
actor Admin
participant "Admin Trainer UI" as UI
participant "Supabase Storage" as Storage
participant "Library Service" as Library
participant "Interpretation Service" as Interpret
participant "Mutation Engine" as Mutate
participant "Review Gate" as Review
participant "Version Manager" as Version
participant "Agent Runtime" as Runtime

Admin -> UI: Upload asset
UI -> Storage: Store file
UI -> Library: Register knowledge asset
Library -> Interpret: Extract + classify
Interpret -> Mutate: Generate proposals
Mutate -> Review: Submit diffs and risks
Review -> Version: Approve selected mutations
Version -> Runtime: Publish new active embodiment
@enduml

6. Mutation Rules

Use deterministic rules before creative generation whenever possible.

Knowledge should usually become library content plus retrieval links.

Memory should usually become agent_memories rows and manifest references, not silent core identity edits.

Skill should usually update agent_skills and corresponding manifest entries.

Relationship signals should update agent_relationships only when the source is trustworthy.

Identity proposals should never auto-apply; they require elevated review and then become versioned profile-manifest changes.

Assets should be stored in the knowledge library and linked into manifests through typed references.

Code artifacts should be allowed to create entirely new TS files or patch existing ones, but only as reviewable artifacts before application.

Every approved mutation should trigger a manifest rebuild so the agent can be reconstructed from Supabase as a coherent package.


Manifest assembly algorithm

For each agent version publish:

1. Load the active agent record and prior active manifest.


2. Collect all approved mutations since the last manifest build.


3. Resolve conflicts by layer priority:

immutable identity contract

approved profile patches

active skills

durable memories

relationship protocols

code and asset artifacts



4. Materialize a new agent_manifests row.


5. Emit agent_manifest_entries for every resolvable package component.


6. Mark linked knowledge assets with manifest_backing where applicable.


7. Publish the manifest as the file-pullable package definition for runtime or export.



7. Runtime Access Model

At runtime, an agent should retrieve from three concentric layers:

1. Self layer — current version, identity contract, active skills, durable memories.


2. Assigned library layer — approved communal assets linked to that agent.


3. Shared canon layer — globally approved assets intended for many agents.



This yields a strong default: communal knowledge base, individualized embodiment.

8. Runtime Access Model

At runtime, an agent should retrieve from four concentric layers:

1. Self layer — current version, identity contract, active skills, durable memories.


2. Manifest layer — explicit files and structured entries that define the current package.


3. Assigned library layer — approved communal assets linked to that agent.


4. Shared canon layer — globally approved assets intended for many agents.



This yields a strong default: communal knowledge base, individualized embodiment, manifest-driven reconstruction.

9. Alignment With Existing Tables

The current records already support this architecture direction:

agents can continue to represent the stable live identity handle.

agent_versions can continue to store deployable embodiment snapshots and lineage.

training_runs, trainer_jobs, training_steps, and run summaries can continue to govern educational workflows, scoring, and review.


The new library and manifest tables should therefore be additive, not a replacement for the current trainer model.

Implementation

Canonical Manifest JSON Shape

Use a single canonical JSON document per active agent manifest. Store it in agent_manifests.root_json and make it the payload returned by file-pull APIs.

{
  "manifestVersion": "1.0.0",
  "agent": {
    "agentId": "uuid",
    "slug": "trainer-smoke-study-pack-safe",
    "title": "Trainer Smoke Study Pack Safe",
    "domain": "operations",
    "status": "deployed",
    "activeVersionId": "uuid"
  },
  "identity": {
    "immutableCore": {
      "name": "Trainer Smoke Study Pack Safe",
      "purpose": "Validate trainer lineage fidelity",
      "values": ["grounded execution", "scope discipline"],
      "boundaries": ["no invented authority"],
      "voiceProfile": {},
      "personaContract": {}
    },
    "mutableProfile": {
      "description": "...",
      "tags": ["operations", "trainer-focus"],
      "tools": ["Read", "Write", "Grep", "Glob"],
      "settings": {},
      "promptFragments": []
    }
  },
  "memory": {
    "episodic": [],
    "semantic": [],
    "procedural": [],
    "relational": []
  },
  "skills": [
    {
      "skillSlug": "grounded-execution",
      "proficiency": 0.91,
      "evidence": ["knowledge_asset_uuid"]
    }
  ],
  "relationships": [
    {
      "relatedAgentId": "uuid",
      "relationshipType": "collaborator",
      "trustScore": 0.82,
      "familiarityScore": 0.77,
      "protocolNotes": {}
    }
  ],
  "assets": [
    {
      "assetId": "uuid",
      "logicalPath": "assets/study/God Mode.pdf",
      "assetType": "pdf",
      "storagePath": "supabase://...",
      "checksum": "sha256"
    }
  ],
  "codeArtifacts": [
    {
      "artifactId": "uuid",
      "filePath": "agents/trainer-smoke-study-pack-safe/support/plkAdapter.ts",
      "language": "typescript",
      "checksum": "sha256",
      "generationMode": "generated"
    }
  ],
  "retrieval": {
    "visibleAssetIds": [],
    "assignedAssetIds": [],
    "sharedCanonAssetIds": []
  },
  "lineage": {
    "manifestId": "uuid",
    "parentManifestId": "uuid-or-null",
    "sourceRunIds": [],
    "approvedMutationIds": [],
    "generatedAt": "timestamp"
  }
}

Manifest Entry Conventions

Use agent_manifest_entries.logical_path to create a stable virtual package tree.

Recommended path conventions:

identity/core.json

identity/profile.json

memory/episodic/<memory-id>.json

memory/semantic/<memory-id>.json

skills/<skill-slug>.json

relationships/<related-agent-id>.json

assets/<category>/<filename>

code/<relative-file-path>.ts

prompts/<fragment-name>.md

config/<name>.json


Supabase SQL Schema Sketch

create table knowledge_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  asset_type text not null,
  storage_path text not null,
  raw_text text,
  checksum text not null,
  source_label text,
  source_uri text,
  uploaded_by uuid,
  visibility text not null default 'admin',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agent_manifests (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(agent_id) on delete cascade,
  version_id uuid not null references agent_versions(version_id) on delete cascade,
  manifest_version text not null,
  status text not null default 'draft',
  root_json jsonb not null,
  checksum text not null,
  created_at timestamptz not null default now()
);

create table agent_manifest_entries (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references agent_manifests(id) on delete cascade,
  entry_type text not null,
  logical_path text not null,
  source_table text not null,
  source_id uuid not null,
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (manifest_id, logical_path)
);

create table agent_code_artifacts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(agent_id) on delete cascade,
  manifest_id uuid references agent_manifests(id) on delete set null,
  source_asset_id uuid references knowledge_assets(id) on delete set null,
  file_path text not null,
  language text not null default 'typescript',
  content text not null,
  checksum text not null,
  generation_mode text not null,
  review_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, file_path, checksum)
);

create index idx_knowledge_assets_status on knowledge_assets(status);
create index idx_agent_manifests_agent_status on agent_manifests(agent_id, status);
create index idx_manifest_entries_manifest on agent_manifest_entries(manifest_id);
create index idx_code_artifacts_agent on agent_code_artifacts(agent_id);

Suggested SQL Views

create view active_agent_manifests as
select distinct on (agent_id)
  agent_id,
  id as manifest_id,
  version_id,
  manifest_version,
  root_json,
  checksum,
  created_at
from agent_manifests
where status = 'active'
order by agent_id, created_at desc;

create view manifest_file_pull as
select
  am.agent_id,
  ame.logical_path,
  ame.entry_type,
  ame.source_table,
  ame.source_id,
  ame.metadata
from agent_manifests am
join agent_manifest_entries ame on ame.manifest_id = am.id
where am.status = 'active';

Row-Level Security Model

Recommended roles:

trainer_admin: full upload, approve, publish, rollback

trainer_operator: upload, annotate, propose, no publish

runtime_service: read approved assets and active manifests only

agent_service: read only assigned/visible assets and active manifest for allowed agents


Recommended policy boundaries:

only trainer_admin can approve embodiment_mutations

only trainer_admin can set agent_manifests.status = 'active'

runtime_service cannot read draft or rejected assets

agent_service cannot read blocked links or unapproved code artifacts


Phase 1 — Supabase Foundation

Create storage buckets for raw uploads, normalized assets, and generated code artifacts.

Add the communal library tables and manifest tables.

Add row-level security policies so only gated admin roles can upload, approve, or publish mutations.

Add SQL views for:

active manifest by agent

manifest entries by agent slug

approved library assets by agent

pending embodiment mutations



Phase 2 — Admin Trainer UI Expansion

Build the following screens in the gated admin module:

1. Library Inbox for upload and metadata editing


2. Interpretation Workbench for classification review


3. Embodiment Diff Studio for JSON/TS diff approval


4. Knowledge Library Explorer for semantic browse and filtering


5. Manifest Inspector for viewing the current file-pullable package per agent


6. Agent Education Console for assigning assets and launching schooling runs



Component map by screen

Library Inbox

UploadDropzone

AssetQueueTable

AssetMetadataDrawer

AssetPreviewPanel

TargetAgentSelector

TagEditor

ParseStatusBadge


Interpretation Workbench

InterpretationSummaryCard

ClassificationChips

ConfidenceMeter

ExtractedMemoryList

SkillCandidateTable

RelationshipSignalPanel

IdentityProposalCard

CodeArtifactDetector


Embodiment Diff Studio

MutationQueueTable

RiskLevelBadge

JsonDiffViewer

CodeDiffViewer

ApproveRejectBar

RollbackHistoryPanel

ApplyToVersionModal


Knowledge Library Explorer

SemanticSearchBar

FacetFilterSidebar

AssetResultsGrid

AssetLineageTimeline

LinkedAgentsPanel

RunUsagePanel


Manifest Inspector

ManifestHeader

ManifestTreeView

ManifestJsonViewer

ManifestEntryDetails

FilePullPreview

ExportManifestButton


Agent Education Console

AgentPicker

CurriculumBuilder

AssignedAssetList

LaunchTrainingRunButton

RunStatusTimeline

MutationOutcomePanel

PromoteVersionButton


Frontend route sketch

/admin/trainer/library
/admin/trainer/library/:assetId
/admin/trainer/interpretations/:assetId
/admin/trainer/mutations
/admin/trainer/manifests/:agentId
/admin/trainer/education/:agentId

Recommended frontend stack patterns

React + TypeScript component boundaries by screen domain

React Query for server state

Zod for manifest and mutation validation

Monaco or CodeMirror for TS/JSON diff panes

Background job polling or Supabase realtime for parse/run status


Phase 3 — Ingestion and Interpretation Services

Implement services that:

ingest files from Supabase storage

extract raw text and metadata

create chunks and embeddings

classify content into knowledge, memory, skill, relationship, identity, asset, or code

produce structured knowledge_interpretations


Recommended processing order:

1. file normalization


2. text extraction


3. metadata inference


4. chunking + embedding


5. agent-target inference


6. interpretation generation


7. mutation proposal generation



Phase 4 — Mutation and Manifest Engine

Implement a service that:

turns approved interpretations into deterministic mutation records

supports JSON patches, memory inserts, skill updates, relationship updates, asset attachments, and TS file creation

writes agent_code_artifacts

rebuilds the manifest after approved mutations

publishes a manifest checksum and version tag


The service should expose at least these actions:

proposeMutations(assetId, agentIds[])

approveMutation(mutationId, approverId)

applyApprovedMutations(agentId)

rebuildManifest(agentId)

exportManifest(agentId, manifestVersion)


Manifest rebuild pseudocode

async function rebuildManifest(agentId: string) {
  const agent = await loadAgent(agentId)
  const version = await loadNextVersion(agentId)
  const approved = await loadApprovedMutations(agentId)
  const identity = await resolveIdentity(agentId, approved)
  const memory = await resolveMemory(agentId)
  const skills = await resolveSkills(agentId)
  const relationships = await resolveRelationships(agentId)
  const assets = await resolveAssets(agentId)
  const codeArtifacts = await resolveCodeArtifacts(agentId)

  const rootJson = {
    manifestVersion: '1.0.0',
    agent: {
      agentId: agent.agent_id,
      slug: agent.slug,
      title: agent.title,
      domain: agent.domain,
      status: agent.status,
      activeVersionId: version.version_id,
    },
    identity,
    memory,
    skills,
    relationships,
    assets,
    codeArtifacts,
    retrieval: await resolveRetrieval(agentId),
    lineage: await resolveLineage(agentId, approved),
  }

  const checksum = sha256(JSON.stringify(rootJson))
  const manifestId = await insertManifest(agentId, version.version_id, rootJson, checksum)
  await insertManifestEntries(manifestId, rootJson)
  return manifestId
}

File pull API contract

GET /api/agents/:slug/manifest
GET /api/agents/:slug/files
GET /api/agents/:slug/files?type=code
GET /api/agents/:slug/files?path=identity/profile.json

Response shape for file pulls:

{
  "agentId": "uuid",
  "manifestId": "uuid",
  "files": [
    {
      "logicalPath": "code/support/plkAdapter.ts",
      "contentType": "text/typescript",
      "checksum": "sha256",
      "content": "..."
    }
  ]
}

Phase 5 — Version Publishing

When approved changes are applied:

create or update the next agent_versions record

attach resulting manifest id

mark code artifacts and profile patches as applied

preserve lineage back to training run and source asset

switch the active manifest and active agent version together


Phase 6 — Runtime and File Pulls

Add a pull interface so downstream services can request:

current manifest by agent slug

all manifest-backed files for an agent

only TypeScript artifacts

only structured profile JSON

only assets attached to the current manifest


This enables reproducible reconstruction of any agent directly from Supabase.

Milestones

1. Library Base Online

uploads stored in Supabase

assets searchable

agent linking available



2. Interpretation + Review Working

uploads classified

mutations proposed

admin diff review functional



3. Manifest System Live

approved changes rebuild manifests

manifest inspector shows file-pullable package state



4. Code Artifact Growth Enabled

new TS files and patches supported with review

active manifest includes code refs



5. Runtime Pull Integration Complete

services can reconstruct an agent from manifest and linked assets




Gathering Results

Measure success using:

percentage of uploads successfully classified

approval-to-application time for mutations

number of agent versions reproducible from manifest without manual repair

retrieval precision from communal library during training/runtime

number of successful file pulls by manifest

rollback success rate for bad mutations

reduction in duplicated assets across agents

operator satisfaction with admin review flow


A successful production outcome means:

agents can grow through new memories, skills, assets, and code

every approved growth event is captured in Supabase

each active agent can be reconstructed from its manifest

communal knowledge remains centralized while embodiment stays individualized
