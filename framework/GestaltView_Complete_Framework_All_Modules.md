# GestaltView Complete Framework All Modules

This document maps the larger GestaltView framework to the current database surfaces.
It is written to preserve symmetry between human cognition and digital intelligence.

## Modules

### Human Identity Module

- Tracks who the human operator is across stable and changing context.
- Tables: `users`, `app_users`, `founder_context`, `identity_subjects`, `human_identity_profiles`

### Human Cognition Module

- Tracks attention, reasoning, planning, recall, and working-memory style.
- Tables: `human_cognition_profiles`, `human_continuity_snapshots`

### Human Consciousness Module

- Tracks self-observation, continuity, agency, and present-state awareness.
- Tables: `consciousness_profiles`, `human_consciousness_profiles`

### Human Personality Module

- Tracks tone, trait shape, social posture, values, and communication style.
- Tables: `human_personality_profiles`, `human_context_views`

### Human Memory Module

- Tracks durable and session-scoped memory with provenance.
- Tables: `memory_entries`, `human_memory_records`, `human_identity_evidence`

### Digital Intelligence Module

- Tracks agent identity, versioning, interiority, relationships, and behavior.
- Tables: `agents`, `agent_versions`, `agent_constitutions`, `agent_autobiographies`, `agent_private_interiors`

### Mutation And Review Module

- Tracks proposed changes, review decisions, approvals, rollback, and evidence.
- Tables: `identity_mutation_proposals`, `identity_review_events`, `identity_rollback_events`, `embodiment_mutations`, `approvals`

### Context Injection Module

- Tracks how runtime surfaces are assembled.
- Tables: `context_injection_rules`, `context_injection_packets`

### Knowledge And Corpus Module

- Tracks source material, fragments, tags, interpretations, and embeddings.
- Tables: `knowledge_assets`, `knowledge_asset_chunks`, `knowledge_tags`, `knowledge_interpretations`, `knowledge_fragments`, `skill_fragments`

### Training And Packaging Module

- Tracks experiments, training runs, evaluation, and packaging.
- Tables: `trainer_experiments`, `trainer_experiment_sources`, `training_runs`, `training_steps`, `trainer_jobs`, `trainer_packaging_candidates`, `trainer_review_decisions`

### Commerce Module

- Tracks customer-facing draft packages, orders, build jobs, and artifacts.
- Tables: `gate_buyers`, `gate_package_drafts`, `gate_orders`, `gate_order_items`, `gate_build_jobs`, `gate_artifacts`, `gate_support_requests`

## Framework Rule

Do not treat human cognition as a lesser version of agent cognition.
The framework only works if both are represented as complex, inspectable systems.

