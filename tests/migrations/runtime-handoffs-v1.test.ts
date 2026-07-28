import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve("supabase/migrations/20260727222849_runtime_handoffs_v1.sql"),
  "utf8",
);

describe("runtime handoffs v1 migration contract", () => {
  it("uses owner-scoped RLS and idempotency", () => {
    expect(migration).toContain(
      "alter table public.runtime_handoffs enable row level security",
    );
    expect(migration).toContain("(select auth.uid()) = owner_id");
    expect(migration).toContain("unique (owner_id, idempotency_key)");
    expect(migration).toContain(
      "grant select on public.runtime_handoffs to authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:[^;]*\b)?(?:insert|update|delete)(?:\b[^;]*)?\s+on public\.runtime_handoffs to authenticated/i,
    );
  });

  it("keeps source identity referential rather than cascading into source tables", () => {
    expect(migration).toContain("source_ref text not null");
    expect(migration).not.toMatch(
      /source_ref\s+[^,\n]*references\s+public\.(capture_events|transcriptory_captures|journals|scrapbook_items|created_artifacts|render_artifacts|inner_world_artifacts)/,
    );
  });

  it("enforces transitions and records append-only evidence", () => {
    expect(migration).toContain("invalid runtime handoff transition");
    expect(migration).toContain("source is immutable after acceptance");
    expect(migration).toContain("insert into public.runtime_handoff_events");
    expect(migration).not.toMatch(
      /policy[\s\S]{0,120}runtime_handoff_events[\s\S]{0,120}for (insert|update|delete)/i,
    );
  });
});
