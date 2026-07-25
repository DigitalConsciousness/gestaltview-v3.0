# SQLite / Turso Adapter

SQLite/Turso should be treated as a prototype/offline/demo adapter, not the authoritative GestaltView identity store.

Mapping:
- uuid -> text
- timestamptz -> text
- jsonb -> text/json
- text[] / uuid[] -> JSON text
- vector -> external vector store key or serialized JSON; do not use as primary vector search
- custom domains -> text

Use `tools/emit_sqlite_schema.py` to generate a first-pass SQLite schema from the canonical manifest.
