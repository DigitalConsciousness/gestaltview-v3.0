# Split Vector Adapter

Use when relational tables should stay in Postgres but embedding search should move out.

Pattern:

```text
knowledge_fragments.id / documents.document_id / memory_entries.id
        ↓ projection job
external vector store collection
        ↓ retrieval returns source ids
Postgres loads authoritative rows by id
```

Never let the vector store become the source of truth. It is an index, not memory.
