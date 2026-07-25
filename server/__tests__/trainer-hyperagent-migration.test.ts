import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("trainer hyperagent migration", () => {
  it("builds memory surfaces from current schema table and column names", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase/migrations/20260427100000_trainer_hyperagent_integration.sql"),
      "utf8"
    );

    expect(migration).toContain("from public.memory_entries me");
    expect(migration).toContain("from public.knowledge_fragments kf");
    expect(migration).toContain("me.user_id::text as ownerid");
    expect(migration).toContain("kf.source_file::text as sourceref");
    expect(migration).not.toContain("public.memoryentries");
    expect(migration).not.toContain("public.knowledgefragments");
    expect(migration).not.toContain("updatedat");
  });
});
