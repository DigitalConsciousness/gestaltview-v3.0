#!/usr/bin/env python3
from __future__ import annotations

CANDIDATES = {
    "supabase": {"relational":5,"json":5,"vector":4,"auth_rls":5,"migrations":4,"free_tier":4,"backup":4,"serverless":4,"observability":3,"portability":4},
    "neon": {"relational":5,"json":5,"vector":4,"auth_rls":2,"migrations":5,"free_tier":4,"backup":4,"serverless":5,"observability":3,"portability":5},
    "railway_postgres": {"relational":5,"json":5,"vector":3,"auth_rls":2,"migrations":4,"free_tier":3,"backup":3,"serverless":3,"observability":3,"portability":5},
    "sqlite_turso": {"relational":3,"json":3,"vector":1,"auth_rls":1,"migrations":3,"free_tier":5,"backup":4,"serverless":5,"observability":2,"portability":4},
    "mongodb": {"relational":1,"json":5,"vector":3,"auth_rls":2,"migrations":2,"free_tier":4,"backup":3,"serverless":4,"observability":3,"portability":2},
    "postgres_plus_qdrant": {"relational":5,"json":5,"vector":5,"auth_rls":3,"migrations":4,"free_tier":3,"backup":4,"serverless":3,"observability":4,"portability":5},
}

WEIGHTS = {"relational":2,"json":2,"vector":2,"auth_rls":2,"migrations":1,"free_tier":1,"backup":1,"serverless":1,"observability":1,"portability":2}

for name, scores in sorted(CANDIDATES.items()):
    weighted = sum(scores[k]*WEIGHTS[k] for k in WEIGHTS)
    maxed = sum(5*WEIGHTS[k] for k in WEIGHTS)
    print(f"{name:22s} {weighted/maxed*10:0.1f}/10")
