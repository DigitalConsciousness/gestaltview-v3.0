# Context Injection Guide

Context injection in GestaltView is the process of assembling the right stable facts, live state, memory, and policy into a runtime surface.
It should respect what is current, what is inferred, and what is merely historical.

## Injection Order

Use the most stable source that still satisfies the task.

1. Direct schema facts
2. Live runtime rows
3. Explicit user settings and founder context
4. Memory and evidence records
5. Derived summaries and synthesized packets
6. Historical docs only when a live surface does not exist

## Main Injection Surfaces

- `public.founder_context`
- `public.consciousness_profiles`
- `public.memory_entries`
- `public.identity_subjects`
- `public.human_identity_profiles`
- `public.human_cognition_profiles`
- `public.human_consciousness_profiles`
- `public.human_personality_profiles`
- `public.human_memory_records`
- `public.human_context_views`
- `public.context_injection_rules`
- `public.context_injection_packets`

## Practical Semantics

- `founder_context` holds the smallest stable anchor for the human operator.
- `consciousness_profiles` represents an explicitly modeled state surface, not a full ontology of the person.
- `memory_entries` is the working memory layer for personal, session, and shared recall.
- `identity_subjects` is the registry that lets human and digital subjects be addressed without forcing them into the same table.
- `context_injection_rules` defines what can enter a surface and in what priority.
- `context_injection_packets` records the assembled runtime bundle for later review, replay, or audit.

## Example Packet Shape

```json
{
  "subject_kind": "human",
  "surface": "founder_session",
  "sources": [
    "founder_context",
    "memory_entries",
    "human_consciousness_profiles",
    "human_personality_profiles"
  ],
  "principles": [
    "preserve nuance",
    "do not flatten contradiction",
    "retain provenance"
  ],
  "output": {
    "system_notes": [],
    "working_memory": [],
    "response_constraints": []
  }
}
```

## What Not To Do

- Do not overwrite lived context with a cleaned-up summary if the raw state matters.
- Do not mix inferred personality traits with observed memory without labeling the difference.
- Do not lose the subject boundary between a human, an agent, and a document corpus.
- Do not treat old documentation as more authoritative than the live schema.
