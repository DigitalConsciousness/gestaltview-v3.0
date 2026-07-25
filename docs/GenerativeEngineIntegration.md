# Generative Engine Integration Guide

> Last updated: 2026-05-31 | Status: **Live in `main`**

## Architecture

```
Vercel (frontend + API routes)
    |
    | HTTP (BACKEND_API_URL)
    ↓
FastAPI sidecar — server/gestaltview_generative_engine.py
    |
    ├── FusionEngine         (multimodal → semantic)
    ├── SymbioticFeedbackCore (learning loop)
    ├── PLK v5.0             (personal language key)
    ├── LLMRouter            (local → deterministic → external)
    ├── BlackboardResponder  (persona routing)
    ├── ResonanceLinkBuilder (artifact graph)
    ├── MusicalDNAAnalyzer   (song resonance)
    └── EmbodimentProfileManager
            |
            ↓ (when SUPABASE_URL is set)
    server/engine_persistence_bridge.py
            |
            ↓
    server/supabase_integration.py  (repository layer)
            |
            ↓
    Supabase (fdqykmefgyuytwnqcthg)
```

## Tables Touched

| Repository | Table | Written by |
|---|---|---|
| BucketDropRepository | `bucket_drops` | `/api/fusion` |
| MemoryEntryRepository | `memory_entries` | `/api/learn` (promote) |
| InsightRepository | `insights` | resonance engine |
| InnerWorldArtifactRepository | `inner_world_artifacts` | synthesis |
| BillySessionRepository | `billy_sessions` | `/api/blackboard/respond` |
| MusicalDNARepository | `musical_dna_analyses` | `/api/actions/musical-dna/analyze` |
| EmbodimentProfileRepository | `embodiment_profiles` | `/api/embodiment/upsert` |
| UserPreferenceRepository | `user_preferences` | `/api/profile/preferences` |
| DISessionRepository | `di_sessions` | session start |
| DISessionRepository | `di_memory_events` | `/api/learn` |
| FounderContextRepository | `founder_context` | PLK save |
| ModuleRegistry | `gestaltview_modules` | read-only |

## Required Environment Variables

```bash
# Required for Supabase persistence
SUPABASE_URL=https://fdqykmefgyuytwnqcthg.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>   # never expose to client

# Optional — enables external AI tier
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk-...

# Optional — enables local LLM (llama.cpp)
LOCAL_LLM_PATH=./models/llama-2-7b.gguf

# CORS
CORS_ORIGINS=https://gestaltview-v2-dig.vercel.app
```

## Starting the Engine

```bash
cd gestaltview-v2.0
pip install -r requirements.txt
uvicorn server.gestaltview_generative_engine:app --reload --port 8000
```

## Integration Checklist

- [ ] Run migration `20260531020000_vector_search_and_indexes.sql` in Supabase SQL Editor
- [ ] Run migration `20260531013000_masterclass_module_setup_and_progress_tracking.sql`
- [ ] Set `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` in engine environment
- [ ] Set `CORS_ORIGINS` to match Vercel deploy URL
- [ ] `DatabaseEmbodimentManager` auto-activates when bridge import succeeds
- [ ] `DatabaseSymbioticCore` replaces in-memory `SymbioticFeedbackCore` for returning users
- [ ] `MasterclassProfileCard` needs `sessionCount` prop — see Slice 2b

## Graceful Degradation

If `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are absent, every repository method
returns a local-only dict with `"local_only": True`. The engine runs fully
offline — no crashes, no silent data loss. The bridge import is wrapped in
`try/except ImportError` so missing deps never break the server start.

## Adding a New DI to the Masterclass

1. Add entry to `EMBODIMENT_REGISTRY` in `shared/embodiment/generated.ts`
2. Add slug → domain to `DOMAIN_MAP` in `MasterclassPage.tsx`
3. Add persona prompt to `PERSONA_PROMPTS` in `gestaltview_generative_engine.py`
4. Upsert profile via `POST /api/embodiment/upsert`
