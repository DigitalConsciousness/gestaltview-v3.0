#!/usr/bin/env python3
"""
Run the knowledge_fragments table migration via Supabase Management API.
Uses the service role key to execute raw SQL.

REQUIRED ENV VARS:
  SUPABASE_URL          - your project URL (https://xxxx.supabase.co)
  SUPABASE_SERVICE_KEY  - service-role JWT (never hardcode — use .env or CI secrets)

Usage:
  SUPABASE_URL=https://xxxx.supabase.co \\
  SUPABASE_SERVICE_KEY=eyJ... \\
  python scripts/run_migration.py
"""
import os
import sys
import requests

# ── Config from environment (NEVER hardcode credentials) ──────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY  = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set as environment variables.")
    print("  Never hardcode credentials in source files.")
    print("  Add them to your .env file (which is gitignored) or set them in CI secrets.")
    sys.exit(1)

# Derive project ref from URL for Management API calls
# e.g. https://ltajayfzlaevchxngkrm.supabase.co -> ltajayfzlaevchxngkrm
PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0]

# ── SQL Statements ────────────────────────────────────────────────────────
SQL_STATEMENTS = [
    # 1. Enable pgvector
    "CREATE EXTENSION IF NOT EXISTS vector;",

    # 2. Create the main table
    """CREATE TABLE IF NOT EXISTS knowledge_fragments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content         TEXT NOT NULL,
  content_hash    TEXT UNIQUE,
  embedding       VECTOR(768),
  source_file     TEXT NOT NULL,
  document_type   TEXT NOT NULL DEFAULT 'General',
  chunk_index     INTEGER NOT NULL DEFAULT 0,
  total_chunks    INTEGER NOT NULL DEFAULT 1,
  char_count      INTEGER,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);""",

    # 3. Full-text search index
    "CREATE INDEX IF NOT EXISTS knowledge_fragments_content_fts ON knowledge_fragments USING GIN (to_tsvector('english', content));",

    # 4. Document type index
    "CREATE INDEX IF NOT EXISTS knowledge_fragments_doc_type_idx ON knowledge_fragments (document_type);",

    # 5. Tags index
    "CREATE INDEX IF NOT EXISTS knowledge_fragments_tags_idx ON knowledge_fragments USING GIN (tags);",

    # 6. Vector HNSW index
    "CREATE INDEX IF NOT EXISTS knowledge_fragments_embedding_idx ON knowledge_fragments USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);",

    # 7. Semantic search function
    """CREATE OR REPLACE FUNCTION match_knowledge_fragments(
  query_embedding VECTOR(768),
  match_count     INT DEFAULT 8,
  filter_type     TEXT DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  content       TEXT,
  source_file   TEXT,
  document_type TEXT,
  chunk_index   INT,
  tags          TEXT[],
  similarity    FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    1 - (kf.embedding <=> query_embedding) AS similarity
  FROM knowledge_fragments kf
  WHERE
    kf.embedding IS NOT NULL
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY kf.embedding <=> query_embedding
  LIMIT match_count;
$$;""",

    # 8. Full-text fallback search function
    """CREATE OR REPLACE FUNCTION search_knowledge_fragments(
  query_text  TEXT,
  match_count INT DEFAULT 8,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  content       TEXT,
  source_file   TEXT,
  document_type TEXT,
  chunk_index   INT,
  tags          TEXT[],
  rank          FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(to_tsvector('english', kf.content), plainto_tsquery('english', query_text)) AS rank
  FROM knowledge_fragments kf
  WHERE
    to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    AND (filter_type IS NULL OR kf.document_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
$$;""",

    # 9. Enable RLS
    "ALTER TABLE knowledge_fragments ENABLE ROW LEVEL SECURITY;",

    # 10. Public read policy
    """DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'knowledge_fragments'
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY \"Public read access\"
      ON knowledge_fragments
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;""",
]


def run_sql(sql: str, description: str) -> bool:
    """Execute a SQL statement via Supabase Management API."""
    resp = requests.post(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        json={"query": sql},
        timeout=30,
    )

    if resp.status_code in (200, 201):
        print(f"  ✓ {description}")
        return True
    else:
        resp2 = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/query",
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            json={"query": sql},
            timeout=30,
        )
        if resp2.status_code in (200, 201):
            print(f"  ✓ {description}")
            return True
        print(f"  ✗ {description}: {resp.status_code} — {resp.text[:150]}")
        return False


def check_table_exists() -> bool:
    """Check if the table already exists via REST API."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/knowledge_fragments?limit=1",
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
        },
        timeout=10,
    )
    return resp.status_code == 200


if __name__ == "__main__":
    print("🗄️  Billy Knowledge Repository — SQL Migration")
    print("=" * 50)
    print(f"Project: {PROJECT_REF}")
    print(f"URL:     {SUPABASE_URL}")
    print()

    if check_table_exists():
        print("✓ Table 'knowledge_fragments' already exists!")
        print("  Ready for ingestion pipeline.")
    else:
        print("Creating knowledge_fragments table...")
        descriptions = [
            "Enable pgvector extension",
            "Create knowledge_fragments table",
            "Create full-text search index",
            "Create document_type index",
            "Create tags GIN index",
            "Create vector HNSW index",
            "Create match_knowledge_fragments() function",
            "Create search_knowledge_fragments() function",
            "Enable Row Level Security",
            "Create public read policy",
        ]

        success_count = 0
        for sql, desc in zip(SQL_STATEMENTS, descriptions):
            if run_sql(sql, desc):
                success_count += 1

        print(f"\n  {success_count}/{len(SQL_STATEMENTS)} statements executed")

        if check_table_exists():
            print("✓ Table created successfully!")
        else:
            print("✗ Table creation may have failed — check Supabase dashboard")
