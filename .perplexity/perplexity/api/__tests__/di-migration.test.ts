import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260525000000_di_runtime.sql", "utf8");

describe("DI runtime migration", () => {
  it("declares both runtime tables and the expected policies", () => {
    expect(migration).toContain("create table if not exists di_sessions");
    expect(migration).toContain("create table if not exists di_memory_events");
    expect(migration).toContain("alter table di_sessions enable row level security");
    expect(migration).toContain("alter table di_memory_events enable row level security");
    expect(migration).toContain("create policy");
  });
});
