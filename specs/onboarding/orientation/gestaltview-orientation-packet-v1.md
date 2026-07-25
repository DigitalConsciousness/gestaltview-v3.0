# GestaltView Orientation Packet
Version: 0.1.0
Generated: 2026-04-13T11:03:01Z

## What this is
A machine-readable and human-readable onboarding packet for digital intelligence collaborators. It is meant to reduce reintroduction tax and provide a temporary single source of truth until persistence and the Agent Trainer Dashboard carry more of this load natively.

## Source-of-truth rule
- For table shape: trust schema.updated.sql
- For change history: trust live migration history
- For access boundaries: trust current live policies over assumptions in code comments

## System layers
### Identity and accounts
To anchor authenticated users, tiers, admin state, and lightweight app-level user bridges.
Primary surfaces: auth.users, public.users, public.app_users

### Runtime continuity
To preserve user/session continuity, founder state, memory notes, and experiential traces.
Primary surfaces: memory_entries, founder_context, billy_sessions, bucket_drops

### Corpus and retrieval
To ingest, chunk, annotate, summarize, and embed documents so the system can retrieve context instead of starting cold.
Primary surfaces: documents, knowledge_fragments, embeddings, summaries, concepts

### Agent personhood
To model agents as accumulative entities with memory, skills, relationships, manifests, and mutation history.
Primary surfaces: agents, agent_versions, agent_memories, agent_manifests, knowledge_assets, knowledge_interpretations

### Trainer and governance
To run experiments, evaluations, reviews, packaging decisions, and controlled promotion workflows.
Primary surfaces: training_runs, training_steps, eval_results, trainer_experiments, approvals

### Commerce and fulfillment
To support GATE package drafting, orders, builds, artifacts, and support requests.
Primary surfaces: gate_package_drafts, gate_orders, gate_build_jobs, gate_artifacts

## Domain map
### Legacy Commerce (Deprecated)
Historical commerce/package-builder tables retained for continuity, not the active GATE path.
Tables (7): _deprecated_artifacts, _deprecated_build_jobs, _deprecated_buyers, _deprecated_order_items, _deprecated_orders, _deprecated_package_drafts, _deprecated_support_requests

### Agent Personhood Framework
Tables for assets, memory, manifests, skills, relationships, and mutation state.
Tables (12): agent_code_artifacts, agent_knowledge_links, agent_manifest_entries, agent_manifests, agent_memories, agent_relationships, agent_skills, embodiment_mutations, knowledge_asset_chunks, knowledge_asset_tags, knowledge_assets, knowledge_interpretations

### Agent Trainer & Governance
Trainer runtime, evaluation telemetry, experiments, review, and promotion surfaces.
Tables (18): agent_versions, agents, approvals, deployment_artifacts, eval_results, eval_rubrics, model_providers, models, scenario_sets, scenarios, trainer_experiment_sources, trainer_experiments, trainer_jobs, trainer_packaging_candidates, trainer_policy_flags, trainer_review_decisions, training_runs, training_steps

### Knowledge & Corpus Pipeline
Ingestion, chunking, summarization, embedding, annotation, and retrieval surfaces.
Tables (12): annotation_concepts, concepts, document_concepts, documents, embeddings, knowledge_fragments, knowledge_tags, loom_annotations, processing_runs, skill_fragments, skills, summaries

### Identity & Accounts
Account anchoring tables and user identity bridges.
Tables (2): app_users, users

### Billy Runtime & Continuity
Runtime continuity, founder context, session traces, and persistent user-facing memory surfaces.
Tables (6): billy_sessions, bucket_drops, consciousness_profiles, founder_context, memory_entries, musical_dna_analyses

### GATE Commerce
The active commerce/package-builder path.
Tables (7): gate_artifacts, gate_build_jobs, gate_buyers, gate_order_items, gate_orders, gate_package_drafts, gate_support_requests

### Operations & Admin Governance
Admin governance registries and workbook sync surfaces.
Tables (2): ops_workbook_items, ops_workbook_sync_runs

### Tribunal & Deliberation
Question, evidence, and deliberation surfaces.
Tables (3): tribunal_events, tribunal_evidence, tribunal_sessions

## Memory model
GestaltView does not have one single memory table. It has layered persistence surfaces with different semantics.

### memory_entries
Role: Lightweight persistent continuity memory keyed by user_id text.
Best for: preferences, goals, notes, identity facts, session continuity
Not best for: deep governed agent constitution, versioned personhood state

### agent_memories / agent_memory_records
Role: More explicitly agent-native memory and governed memory records.
Best for: agent memory persistence, structured recall, reviewable/typed memory
Not best for: general user scratchpad continuity

### knowledge_assets / knowledge_interpretations / knowledge_asset_chunks
Role: Evidence and derived interpretation surfaces rather than raw continuity memory.
Best for: documents, evidence, retrieval chunks, derived knowledge proposals
Not best for: simple conversational continuity notes

## Key workflows
### Corpus ingestion to retrieval
1. Create a processing_runs record
2. Write documents rows
3. Generate embeddings and summaries
4. Optionally map concepts and annotations
5. Use knowledge_fragments / related tables for retrieval
Tables: processing_runs, documents, embeddings, summaries, document_concepts, knowledge_fragments
So what: This is how raw source material becomes queryable context.

### Agent training and review
1. Define or select an agent
2. Create training_runs and training_steps
3. Evaluate against scenarios and rubrics
4. Review via approvals / trainer review tables
5. Emit candidate or approved agent_versions and artifacts
Tables: agents, training_runs, training_steps, eval_results, approvals, agent_versions, deployment_artifacts
So what: This is the controlled path from draft behavior to reviewable, promotable agent state.

### Agent memory and identity growth
1. Store or ingest knowledge/evidence
2. Interpret evidence into knowledge_interpretations
3. Propose or apply mutations / memory updates
4. Attach manifests, skills, and code artifacts as needed
Tables: knowledge_assets, knowledge_interpretations, embodiment_mutations, agent_memories, agent_manifests, agent_skills
So what: This is how agents can accumulate rather than restart from a static prompt.

### GATE drafting to fulfillment
1. Create or update gate_package_drafts
2. Create gate_buyers / gate_orders
3. Run gate_build_jobs
4. Store gate_artifacts
5. Track support via gate_support_requests
Tables: gate_package_drafts, gate_buyers, gate_orders, gate_build_jobs, gate_artifacts, gate_support_requests
So what: This is the active commerce pipeline, distinct from deprecated legacy tables.

## Critical boundaries
- **Schema snapshot vs migration history**: The snapshot tells what the database looks like now. It does not prove how it got there.
- **Runtime continuity vs agent personhood**: User/session continuity tables are not automatically the canonical source for agent identity.
- **Evidence vs memory**: Knowledge assets and interpretations are evidence-bearing surfaces; memory surfaces are continuity-bearing surfaces.
- **Table existence vs safe exposure**: A table being present in public schema does not mean it should be broadly readable or writable.
- **Deprecated vs active commerce**: Tables prefixed with _deprecated_ are historical continuity surfaces, not the main GATE path.

## Questions people do not know to ask
- What is the difference between a continuity memory, an agent memory, and a knowledge asset?
- Which table is authoritative for a given kind of truth: current shape, historical change, permission boundary, or runtime convenience?
- Am I storing a note, a fact, an evidence artifact, a derived interpretation, or a governed identity mutation?
- Is this surface user-owned, agent-owned, operator-owned, or service-role-only?
- Is this table part of the active path or merely kept for historical continuity?
- What breaks if this record changes shape without a migration?
- If two tables seem to represent the same thing, which one is the canonical source and which one is a bridge or legacy compatibility surface?

## Glossary
- **Agent**: A top-level digital intelligence entity tracked in the agents table.
- **Agent Version**: A compiled, reviewable state snapshot of an agent.
- **Manifest**: A materialized assembly of files/entries that represent an agent version or payload.
- **Memory Entry**: A persistent user-linked continuity record in memory_entries.
- **Knowledge Asset**: A canonical stored knowledge source, such as a document, transcript, note, or code artifact.
- **Knowledge Interpretation**: A derived understanding or classification extracted from a knowledge asset.
- **Embodiment Mutation**: A proposed or applied change to agent/personhood-related state.
- **Processing Run**: A ledger record for document/corpus ingestion and processing.
- **Training Run**: A governed execution that drafts/evaluates agent behavior.
- **RLS**: Row Level Security; database-level rules determining who can read or mutate rows.
- **GATE**: The active commerce/package-builder flow in the current schema.
- **Deprecated Table**: A kept-for-continuity table that should not be confused with the active production path.

## Starter prompts for digital colleagues
- List the domains in GestaltView and the tables that belong to each.
- Explain the difference between memory_entries and agent_memory_records.
- Show the workflow from documents to knowledge_fragments to retrieval.
- Identify which tables are part of GATE commerce versus deprecated commerce.
- Which surfaces should an operator inspect first when a trainer run fails?
- Which identity surface should be used for this operation: auth.users, public.users, or app_users?

## Implementation notes
- Prefer reading this packet as a map, not as a substitute for schema inspection.
- When generating advice, distinguish observation from inference.
- When recommending changes, preserve domain separation unless there is a strong reason to merge surfaces.
- When uncertain about authority, explicitly say which artifact you are trusting.
