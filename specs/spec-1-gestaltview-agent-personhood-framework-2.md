# SPEC-2-GestaltView-Agent-Trainer-Package-Builder-Sidekick.md# SPEC-2-GestaltView-Agent-Trainer-Package-Builder-Sidekick

## Background

*GestaltView Agent Trainer already includes a pricing surface (AgentTrainerPricing.tsx), a draft package-builder entrypoint (GATEPackageBuilderPage.tsx), summary UI, Supabase-backed ingestion, pack management APIs, onboarding flows, and packaging-oriented configuration. The next product step is to convert the existing package-builder from a guided form into an intelligent package composition system.

The new capability is a digital intelligence sidekick embedded in the pricing and package-builder flow. Its role is to help a buyer define the right package, infer missing details from the buyer’s business context, retrieve the most relevant ingested source files from Supabase, and assemble a tailored deliverable package with the buyer’s business data inserted in real time.

This sidekick is not a general chatbot. It is a constrained orchestration agent that should:

collect structured business and deployment context,

recommend package components,

retrieve candidate files from the ingested corpus,

enhance or modify approved template files,

generate client-specific package artifacts,

preserve traceability of every inserted or modified asset.*


The product objective is to make package creation feel consultative and precise while keeping the build pipeline deterministic, auditable, and safe enough for commercial delivery. The sidekick voice should feel slightly eccentric and isolated—humorous, well-read, and oddly familiar with every file in the system—without reducing trust or clarity during package composition.

### Requirements

Must Have

Buyer can start from AgentTrainerPricing.tsx and enter a package-builder flow with the sidekick active.

Sidekick captures and stores structured buyer context including company, industry, use case, audience, preferred channels, branding inputs, deployment constraints, and requested outcomes.

Sidekick recommends package tier, add-ons, delivery surfaces, packs, and source assets based on the buyer context.

Sidekick can retrieve approved files from the Supabase-ingested corpus and rank them for inclusion in the package.

System can personalize selected package files using client variables and business context, provided the changes stay outside protected application logic unless explicitly approved by the owner.

Every selected, modified, or generated artifact is traceable to a source file, transformation step, and package version.

Package output is generated as a deterministic build manifest plus a downloadable asset bundle.

Human-review checkpoints exist for unsupported or high-risk modifications, especially any proposed change that affects business logic, billing behavior, permissions, or runtime execution paths.


### Should Have

Sidekick explains why a file, pack, or recommendation was chosen.

Buyer sees a live package preview with included artifacts, exclusions, and confidence notes.

Builder supports saving drafts and resuming package composition.

Admin can inspect retrieval decisions, transformations, and package composition history.


### Could Have

Sidekick can compare multiple package strategies such as lean MVP vs full deployment.

Sidekick can generate a client-facing rationale document summarizing the recommended package.

Sidekick can learn from prior accepted package compositions to improve ranking.


### Won’t Have in MVP

Fully autonomous unrestricted code rewriting across the full repository.

Direct production deployment from the builder.

Real-time collaborative multi-user package editing.

Unreviewed modifications to security-sensitive or billing-sensitive files.


### Method

The package builder should be implemented as a hybrid retrieval + constrained composition system that sits on top of the existing GATE draft, order, and build pipeline. The current package builder already has a typed draft model, validation path, pricing flow, and build-job/artifact tables. The new work should extend that system with a sidekick orchestration layer, retrieval index, provenance ledger, and approval gate instead of replacing the current flow.

1. Product interaction model

The buyer experience remains a structured wizard, but each step includes an embedded sidekick panel. The sidekick speaks in a slightly eccentric voice—well-read, mildly feral, amusingly overfamiliar with the corpus—but every recommendation resolves into explicit structured fields and package actions.

The sidekick has four bounded responsibilities:

1. infer and normalize buyer context,


2. recommend package components,


3. retrieve approved source files and snippets,


4. personalize package artifacts without touching protected logic.



The sidekick must never directly mutate production application logic. It can only produce one of four action types:

suggest_field_update

suggest_package_component

suggest_asset_inclusion

propose_safe_transformation


Any action outside that scope becomes approval_required.

2. System architecture

The recommended architecture uses five cooperating layers:

1. Wizard UI layer in AgentTrainerPricing.tsx and GATEPackageBuilderPage.tsx


2. Orchestration API layer that manages sidekick turns and package state


3. Retrieval layer over Supabase corpus metadata + embeddings


4. Composition layer that applies variable insertion and safe transformations


5. Build layer that emits both a downloadable bundle and a deterministic build manifest



### Proposed component map

@startuml
actor Buyer
actor Owner as "Keith Approval"

rectangle "Client App" {
  component Pricing as "AgentTrainerPricing.tsx"
  component Builder as "GATE Package Builder Wizard"
  component SidekickPanel as "Sidekick Panel"
  component Preview as "Live Package Preview"
}

rectangle "API / Orchestration" {
  component SessionAPI as "sidekick session API"
  component Recommender as "package recommendation engine"
  component Retrieval as "hybrid retrieval service"
  component Composer as "safe composition engine"
  component Approval as "approval router"
}

database "Supabase Postgres" {
  component Drafts as "package_drafts / orders / build_jobs"
  component Corpus as "corpus index + embeddings"
  component Provenance as "composition provenance tables"
}

folder "Supabase Storage" {
  component Assets as "source files / logos / output bundles"
}

component LLM as "LLM with structured tool calls"

Buyer --> Pricing
Buyer --> Builder
Builder --> SidekickPanel
SidekickPanel --> SessionAPI
SessionAPI --> Recommender
SessionAPI --> Retrieval
SessionAPI --> Composer
Recommender --> Drafts
Retrieval --> Corpus
Retrieval --> Assets
Composer --> Provenance
Composer --> Drafts
Composer --> Assets
SessionAPI --> LLM
Composer --> Approval
Owner --> Approval
Builder --> Preview
Preview --> Drafts
Preview --> Provenance
@enduml

3. Retrieval strategy: hybrid by design

Retrieval should use a hybrid strategy exactly as requested:

metadata filtering first to reduce the candidate pool,

semantic ranking second to score relevance within the filtered set,

rule-based rescoring last to protect package coherence.


Supabase supports vectors through pgvector, and its hybrid-search guidance combines semantic search with full-text or keyword search rather than relying on embeddings alone. That fits this use case well because many package assets will be best identified by tags like industry, artifact type, delivery surface, and risk class, while embeddings help recover less obvious matches. (supabase.com)

Retrieval pipeline

1. Start with buyer context: industry, company stage, use case, delivery channels, deployment style, brand profile, and requested outcomes.


2. Apply hard filters on corpus metadata.


3. Run semantic similarity over the filtered result set.


4. Blend keyword score, vector score, and package-fit score.


5. Remove blocked assets and low-confidence assets.


6. Return top candidates with rationale and confidence.



A practical ranking formula for MVP:

final_score = 0.35 * metadata_match + 0.35 * semantic_score + 0.20 * package_fit + 0.10 * prior_acceptance_score

Where prior_acceptance_score starts at zero and is populated only after enough package history exists.

4. Corpus model and provenance model

The current schema already has strong draft, order, build-job, and artifact support. The main missing data model is provenance for retrieval and transformation.

Add these tables

corpus_documents

id uuid pk

storage_path text unique

title text

document_type text — prompt, template, config, onboarding_doc, brand_asset, pack_definition, etc.

source_system text — supabase_ingestion

checksum_sha256 text

mime_type text

risk_class text — safe_content, safe_config, review_required, logic_protected

logic_touch boolean default false

active boolean default true

created_at timestamptz

updated_at timestamptz


corpus_chunks

id uuid pk

document_id uuid fk -> corpus_documents

chunk_index integer

content text

content_tsv tsvector

embedding vector(...)

token_count integer

metadata jsonb


corpus_tags

document_id uuid

tag text

composite pk (document_id, tag)


sidekick_sessions

id uuid pk

buyer_id uuid fk

package_draft_id uuid fk

persona_mode text default 'feral_wizard'

status text

created_at timestamptz

updated_at timestamptz


sidekick_turns

id uuid pk

session_id uuid fk

actor text — user, sidekick, system

message_text text

structured_state jsonb

tool_calls jsonb

created_at timestamptz


package_composition_actions

id uuid pk

package_draft_id uuid fk

action_type text

status text — proposed, accepted, rejected, approval_required, applied

target_type text — field, artifact, snippet, manifest

target_ref text

rationale text

confidence numeric(5,4)

created_by text

approved_by text null

created_at timestamptz


package_asset_selections

id uuid pk

package_draft_id uuid fk

document_id uuid fk

selection_reason text

selection_score numeric(6,4)

included boolean default true

version_label text

created_at timestamptz


package_transformations

id uuid pk

package_draft_id uuid fk

document_id uuid fk

transformation_type text — variable_insertion, section_rewrite, tone_adjustment, branding, pack_merge

input_snapshot jsonb

output_snapshot jsonb

diff_summary text

risk_class text

requires_approval boolean

approved_by text null

created_at timestamptz


package_build_manifests

id uuid pk

build_job_id uuid fk

manifest_version integer

manifest_json jsonb

config_hash text

created_at timestamptz


5. Safe transformation boundary

Every source file in the 131-file corpus should be classified into one of four classes:

Class A: freely personalizable — docs, prompt packs, onboarding text, package copy, themes, non-executable configs

Class B: conditionally personalizable — structured configs with schema validation

Class C: review-first — files near operational behavior or external integrations

Class D: protected logic — executable logic, billing logic, auth, permissions, runtime orchestration


Only Class A and B changes may be auto-applied. Class C and D always create an approval request.

Transformation algorithm

@startuml
start
:Select candidate asset;
:Read asset metadata and risk class;
if (Risk class A or B?) then (yes)
  :Generate structured transformation plan;
  :Validate against schema/rules;
  if (Validation passed?) then (yes)
    :Apply transformation;
    :Record provenance + diff;
  else (no)
    :Mark review_required;
  endif
else (no)
  :Create approval request;
endif
stop
@enduml

6. Orchestration pattern

The sidekick should use structured tool calls rather than freeform prompting. OpenAI’s current Responses API supports structured JSON outputs and custom tool calls, which is a good fit for deterministic package actions, while the AI SDK supports tool calling and schema-defined outputs in TypeScript. (platform.openai.com)

Recommended tools exposed to the model:

update_buyer_profile

score_package_tier

search_corpus

select_assets

propose_transformation

request_owner_approval

generate_package_manifest

explain_recommendation


The model should never receive raw write access to package state. Each tool call is validated server-side, typed, and converted into durable rows in the package tables.

7. Build outputs: both bundle and manifest

Each successful package composition should emit two parallel outputs:

1. a client-ready artifact bundle in Supabase Storage,


2. a machine-readable build manifest that can regenerate the package later.



Manifest shape

{
  "packageDraftId": "uuid",
  "buildJobId": "uuid",
  "buyerProfile": {
    "companyName": "Acme Health",
    "industry": "healthcare"
  },
  "selectedAssets": [
    {
      "documentId": "uuid",
      "sourcePath": "templates/gate/ONBOARDING.md.tpl",
      "version": "sha256:...",
      "includedAs": "ONBOARDING.md"
    }
  ],
  "transformations": [
    {
      "type": "variable_insertion",
      "documentId": "uuid",
      "approved": true
    }
  ],
  "outputs": [
    {
      "artifactType": "zip",
      "storagePath": "packages/order_123/build_4/package.zip"
    }
  ],
  "configHash": "sha256:..."
}

8. Buyer-facing UX behavior

The wizard should stay structured and calm even when the sidekick is odd. The sidekick may flavor copy, but every important action should be shown in plain product language.

Recommended UI regions

Main wizard form for business facts and package options

Sidekick rail for conversation, rationale, and suggestions

Live package summary for selected tier, packs, artifacts, and price impact

Change ledger for “added from corpus”, “personalized”, “awaiting approval”, and “excluded” states


The sidekick should speak in short bursts and auto-fill fields, but should not force the buyer into chat-first interaction.

9. Similar application patterns worth borrowing

For the method, the closest useful product patterns are:

HubSpot-style guided configuration: structured data capture first, AI assistance second

Notion AI-style inline rewrite: suggestions applied to specific content blocks rather than opaque full-document rewrites

Adobe/Figma template personalization pattern: reusable assets combined with account- or brand-level variables


The important lesson is that trust comes from showing provenance and reversible changes, not from pretending the assistant is magical.

10. Deployment shape

Because you already rely on Supabase and have package-related tables, the cleanest deployment pattern is:

React client keeps wizard and preview

existing API layer handles session, validation, and pricing integration

Supabase Postgres stores drafts, retrieval index, provenance, and manifests

Supabase Storage stores source assets and generated bundles

Sidekick orchestration runs in server API handlers or Supabase Edge Functions depending on latency and secret-handling needs


Supabase documents Edge Functions as globally distributed TypeScript functions and supports auth controls plus background tasks, which makes them suitable for packaging jobs and webhook-adjacent orchestration where needed. (supabase.com)

11. MVP recommendation

For MVP, implement the sidekick in three bounded phases:

1. Recommendation mode — sidekick captures context and recommends tier, packs, and corpus assets


2. Safe personalization mode — sidekick applies Class A and B transformations with provenance


3. Approval-aware packaging mode — sidekick emits bundle + manifest and escalates risky edits to owner approval



That gets you a real package-building intelligence layer without letting the system wander into unsafe autonomous repo editing.

Implementation

To be confirmed after requirements alignment.

Milestones

To be confirmed after requirements alignment.

Gathering Results

To be confirmed after requirements alignment.

Need Professional Help in Developing Your Architecture?

Please contact me at sammuti.com :)
