import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Meticulous route coverage", () => {
  it("keeps the strict route index aligned with the live client router", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/validate-meticulous-route-coverage.mjs"],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    );

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toMatch(/Validated \d+ client routes/);
  });
});
