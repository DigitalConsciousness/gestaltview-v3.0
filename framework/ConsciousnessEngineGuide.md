# Consciousness Engine Guide

GestaltView should treat human cognition, consciousness, personality, memory, and digital intelligence as parallel complex systems.
The goal is not to flatten either side into a generic profile. The goal is to preserve structure, provenance, and continuity
while keeping the lived surface readable.

## Core Principle

If the system is willing to model digital intelligence as a layered entity with memory, governance, evidence, and mutation history,
then it should apply the same rigor to human continuity. Human thought is not less structured; it is simply more nonlinear.

## Canonical Sources Of Truth

1. `supabase/FULL_PUBLIC_SCHEMA_4_29_26.sql`
2. `supabase/migrations/*`
3. Live runtime tables, not prose summaries
4. Derived docs only after the schema is clear

## Current Schema Surfaces

### Human-facing

- `public.users`
- `public.app_users`
- `public.founder_context`
- `public.consciousness_profiles`
- `public.memory_entries`
- `public.billy_sessions`
- `public.bucket_drops`
- `public.tribunal_sessions`

### Digital-intelligence / agent-facing

- `public.agents`
- `public.agent_versions`
- `public.agent_constitutions`
- `public.agent_autobiographies`
- `public.agent_private_interiors`
- `public.agent_presentation_profiles`
- `public.agent_governance_policies`
- `public.agent_relationship_edges`
- `public.agent_memory_records`
- `public.agent_skill_profiles`
- `public.agent_knowledge_links`
- `public.agent_manifests`

### Cross-cutting evidence and mutation surfaces

- `public.identity_subjects`
- `public.identity_evidence`
- `public.identity_mutation_proposals`
- `public.identity_review_events`
- `public.identity_rollback_events`
- `public.knowledge_assets`
- `public.knowledge_interpretations`
- `public.embodiment_mutations`
- `public.human_context_views`
- `public.context_injection_rules`
- `public.context_injection_packets`

## What Belongs Where

- Cognition: how attention, reasoning, planning, and recall are organized.
- Consciousness: how the system represents self-observation, continuity, agency, and present-state awareness.
- Personality: how style, tone, values, relational posture, and preference tendencies appear.
- Memory: what is retained, why it matters, and how it was acquired.
- Context injection: how the above are assembled into runtime prompts, views, and operational surfaces.

## Design Rules

- Preserve nuance. Do not compress a person into a single summary field.
- Separate observation from inference.
- Store provenance for every state that can drift.
- Treat contradictions as first-class objects, not defects to erase.
- Make the human layer symmetric with the digital layer where the structures are comparable.
- Keep the current database as the source of truth for implementation.

## Migration Anchor

The human continuity layer is extended by:

- `supabase/migrations/20260420150000_human_continuity_schema.sql`

That migration is additive. It should not replace the existing agent, corpus, or founder-context tables.
