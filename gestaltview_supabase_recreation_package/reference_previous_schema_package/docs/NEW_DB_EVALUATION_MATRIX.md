# New Database Evaluation Matrix

| Target | Fit | Use when | Watch-outs |
|---|---:|---|---|
| Supabase Postgres | 9/10 | Current best default: auth, RLS, pgvector, storage, free tier. | Cold starts, free-tier limits, vector scans. |
| Neon Postgres | 8/10 | Need portable Postgres and branching. | Auth/RLS app wiring is yours; storage separate. |
| Railway/Render Postgres | 7/10 | Need simple hosted Postgres. | Less integrated auth/storage; cost can drift. |
| Self-hosted Postgres | 8/10 | Need sovereignty/control. | Ops burden. Backups and security are yours. |
| Turso/SQLite | 5/10 | Local-first demos or lightweight packaged versions. | No native RLS/pgvector/domains; arrays need JSON encoding. |
| MongoDB | 4/10 | Document projection, not primary governance store. | Weak fit for relational identity/training governance. |
| Qdrant/Pinecone/Weaviate | 7/10 sidecar | Vector retrieval sidecar. | Not a source-of-truth DB. |
| Neo4j | 6/10 sidecar | Relationship visualization and graph exploration. | Projection only; not primary continuity store. |
| Meilisearch/Typesense | 7/10 sidecar | Fast text search over documents/fragments. | Projection only; needs sync pipeline. |

Recommended next path: keep the source of truth Postgres-compatible, then split vector/search/graph outward only when specific workloads justify it.
