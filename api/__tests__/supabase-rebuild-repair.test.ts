import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

function read(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf8");
}

describe("Supabase rebuild repair contracts", () => {
  it("enriches authenticated sessions from the canonical users table", () => {
    const authSource = read("api/_lib/auth.ts");
    expect(authSource).toContain('.from("users")');
    expect(authSource).not.toContain('.from("profiles")');
  });

  it("keeps Edge Function auth modes in the active Supabase config", () => {
    const config = read("supabase/config.toml");
    expect(config).toContain("[functions.gsvw-ingest-batch]");
    expect(config).toContain("[functions.gsvw-runtime-health]");
    expect(config).toContain("[functions.gsvw-capture-event]");
    expect(config).toContain("[functions.gsvw-dormancy-review]");
    expect(config).toContain("[functions.corpus-harvest-worker]");
  });

  it("uses documented Deno entrypoints and protects service-role functions", () => {
    for (const name of [
      "gsvw-ingest-batch",
      "gsvw-runtime-health",
      "gsvw-dormancy-review",
      "corpus-harvest-worker",
    ]) {
      const source = read(`supabase/functions/${name}/index.ts`);
      expect(source, name).toContain("Deno.serve(");
      expect(source, name).toContain("requireSharedSecret(req");
    }

    expect(read("supabase/functions/gsvw-capture-event/index.ts")).toContain(
      "Deno.serve(",
    );
  });

  it("requests embeddings that match the database vector contract", () => {
    const worker = read("supabase/functions/corpus-harvest-worker/index.ts");
    expect(worker).toMatch(/dimensions:\s*768/);
  });

  it("makes the ingestion migration replay-safe and least-privileged", () => {
    const migration = read(
      "supabase/migrations/20260628000000_gsvw_ingestion_alignment.sql",
    );

    expect(
      migration.match(/DROP TRIGGER IF EXISTS/gi)?.length ?? 0,
    ).toBeGreaterThanOrEqual(3);
    expect(migration).toMatch(/WITH\s*\(security_invoker\s*=\s*true\)/i);
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.gsvw_mark_document_seen\(TEXT, TEXT, TEXT, UUID\) FROM PUBLIC/i,
    );
    expect(migration).toMatch(
      /GRANT INSERT, SELECT ON TABLE public\.gsvw_runtime_capture_events TO authenticated/i,
    );
  });

  it("provides an additive rebuilt-schema compatibility and security migration", () => {
    const migrationName = readdirSync(
      resolve(root, "supabase/migrations"),
    ).find((name) => name.endsWith("_rebuild_compatibility_and_security.sql"));

    expect(migrationName).toBeTruthy();
    const migration = read(`supabase/migrations/${migrationName}`);
    expect(migration).toMatch(
      /ALTER TABLE public\.identity_subjects\s+ADD COLUMN IF NOT EXISTS status/i,
    );
    expect(migration).toMatch(
      /RENAME COLUMN profile_id TO cognition_profile_id/i,
    );
    expect(migration).toMatch(
      /CREATE TABLE IF NOT EXISTS public\.corpus_harvest_events/i,
    );
    expect(
      migration.match(/security_invoker\s*=\s*true/gi)?.length ?? 0,
    ).toBeGreaterThanOrEqual(8);
    expect(migration).toMatch(
      /REVOKE EXECUTE ON FUNCTION public\.claim_codex_jobs\(integer\)/i,
    );
    expect(migration).not.toMatch(/DROP\s+TABLE|TRUNCATE\s+TABLE/i);
    expect(migration).not.toMatch(
      /\bprofile\s*->|\bcontent\s*\)|\bpayload\s+ELSE|\bnotes\s*\)/i,
    );
    expect(migration).toContain("to_jsonb");
    expect(migration).toMatch(
      /DROP POLICY IF EXISTS "authenticated manage own identity_subjects"[\s\S]*ALTER COLUMN app_user_id TYPE text[\s\S]*CREATE POLICY "authenticated manage own identity_subjects"/i,
    );
  });

  it("keeps the live schema smoke test aligned with rebuilt runtime tables", () => {
    const smokeTest = read("scripts/test-db-schema.sh");

    for (const table of [
      "identity_subjects",
      "human_identity_profiles",
      "profile_portraits",
      "transcriptory_captures",
      "inner_world_artifacts",
      "gsvw_ingestion_runs",
      "gsvw_runtime_capture_events",
      "corpus_harvest_events",
    ]) {
      expect(smokeTest, table).toContain(`"${table}"`);
    }
  });
});
