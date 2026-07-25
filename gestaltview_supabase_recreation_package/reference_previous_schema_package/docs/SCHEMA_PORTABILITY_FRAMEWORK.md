# Framework for Applying the GestaltView Schema to New Database Possibilities

## The underlying shape

GestaltView is not one generic app schema. It is a layered continuity system:

1. **Identity Core** — `users`, `app_users`, `identity_subjects`.
2. **Runtime Continuity** — `bucket_drops`, `memory_entries`, `billy_sessions`, `founder_context`, `consciousness_profiles`.
3. **Corpus + Retrieval** — `documents`, `knowledge_fragments`, `embeddings`, `summaries`, `loom_annotations`, `concepts`.
4. **Agent Personhood** — constitutions, autobiographies, private interiors, memory records, preference nodes, relationship edges, evidence, mutation proposals.
5. **Agent Trainer Governance** — models, providers, runs, steps, evals, approvals, policy flags, packaging candidates.
6. **GATE Commerce** — buyers, package drafts, orders, build jobs, artifacts, support requests.
7. **Collaborator Layer** — human/digital collaborator records, roles, permissions, relationships, onboarding events.
8. **Human Identity Layer** — cognition, consciousness, personality, memory, context views, relationships, evidence, mutation review.
9. **Operations + Tribunal** — workbook sync, deliberation sessions, events, evidence.

The database choice should be evaluated by how well it preserves those layers, not by generic popularity.

## Database fit model

Score every candidate database against these ten pressures:

| Pressure | Why it matters |
|---|---|
| Relational integrity | Agent/personhood/governance records need traceable structure. |
| JSON support | Embodiment profiles, policies, manifests, and snapshots are naturally semi-structured. |
| Vector support | Corpus and memory retrieval depend on embedding search. |
| Auth/RLS support | User-owned memory and private identity state need row-level boundaries. |
| Migration ergonomics | The schema is large enough that manual console edits are a trap. |
| Free-tier survivability | GestaltView needs to remain operable under constrained resources. |
| Backup/export clarity | Continuity systems must be recoverable. |
| Edge/serverless compatibility | Vercel/serverless routes need predictable connection handling. |
| Observability | Trainer and ingestion runs need debuggable failure states. |
| Portability | The schema should not become hostage to one vendor-specific feature. |

## Recommended architecture by maturity

### Option A — Single Postgres/Supabase baseline

Best when speed and operational simplicity matter most.

- System of record: Supabase Postgres
- Auth: Supabase Auth
- Vectors: pgvector in Supabase
- Files: Supabase Storage
- Pros: one control plane, RLS, low startup cost
- Cons: free-tier cold starts, vector scans can hurt, large schema can become heavy

### Option B — Postgres core + external vector store

Best when corpus size grows beyond free-tier pgvector comfort.

- System of record: Supabase/Neon/Railway Postgres
- Vectors: Qdrant, Pinecone, Weaviate, or pgvector on separate instance
- Files: S3/R2/Supabase Storage
- Pros: protects relational DB from vector workload spikes
- Cons: more moving parts, cross-store consistency discipline required

### Option C — Postgres core + document/search sidecar

Best when knowledge browsing and text search become heavy.

- System of record: Postgres
- Search: Meilisearch, Typesense, OpenSearch, or Postgres full-text first
- Vectors: pgvector or external vector store
- Pros: better search UX without compromising governance tables
- Cons: requires projection/indexing pipeline

### Option D — SQLite/Turso prototype adapter

Best for offline demos, local-first testing, or small embedded builds.

- System of record: SQLite/Turso
- JSON: stored as text/JSON where supported
- Arrays: stored as JSON text
- Vectors: external service or serialized blob/text, not canonical search layer
- Pros: cheap, portable, simple demos
- Cons: loses RLS, pgvector, domains, and some Postgres-native semantics

## The portability rule

Keep a canonical schema manifest separate from any one SQL dialect.

```text
supabaseSchema.md
   ↓ parser
schema/gestaltview_schema_manifest.json
   ↓ dialect adapter
Postgres SQL / SQLite SQL / split-vector projection / docs
   ↓ verification
expected tables + expected columns check
```

## What must stay in Postgres-like relational storage

Do not move these to a document store as the primary record:

- users / app_users / identity_subjects
- memory_entries / bucket_drops / founder_context
- agents / agent_versions / agent_manifests
- agent identity mutation/review/rollback tables
- training_runs / eval_results / approvals
- gate_orders / gate_build_jobs / gate_artifacts
- collaborator permissions / onboarding events

These tables are governance-heavy. They need auditability more than flexible shape.

## What can be projected outward

These can be mirrored into specialized systems:

- `knowledge_fragments` → vector/search index
- `documents.content` → search index
- `embeddings.embedding` → vector store
- `agent_relationship_edges` / `collaborator_relationships` → graph visualization
- `gate_artifacts.storage_path` → object storage/CDN

Projection is not ownership. The relational row remains the source of truth.

## New database checklist

Before applying schema to a new DB target, answer:

1. Does it support UUID primary keys cleanly?
2. Does it support JSON fields or an equivalent?
3. Does it support arrays, or do arrays need JSON encoding?
4. Does it support vector search natively? If not, where will vectors live?
5. Does it support row-level access boundaries? If not, where are boundaries enforced?
6. Can migrations be replayed from scratch?
7. Can the schema be introspected and verified automatically?
8. Can backups be exported without vendor lock-in?
9. Can serverless clients connect without exhausting connections?
10. Can the free tier survive ingestion/trainer workloads?

## Decision recommendation

For the next stable step, use **Postgres-compatible first**:

1. Supabase for current continuity and auth.
2. Neon/Railway/Self-hosted Postgres as portability targets.
3. Split vectors only when vector workload becomes the bottleneck.
4. Use SQLite/Turso only as a demo/offline adapter, not the authoritative identity store.

That keeps the schema breathing without letting the architecture sprawl before it has to.
