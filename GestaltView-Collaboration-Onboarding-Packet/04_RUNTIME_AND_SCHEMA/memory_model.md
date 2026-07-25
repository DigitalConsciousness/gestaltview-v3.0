# Memory Model

GestaltView uses layered persistence.

## Surfaces
- `memory_entries`: runtime continuity
- `agent_memories` / `agent_memory_records`: agent-native reviewed persistence
- `knowledge_assets` / `knowledge_asset_chunks` / `knowledge_interpretations`: evidence and retrieval substrate

## Rule
Do not treat every durable datum as the same type of memory.
