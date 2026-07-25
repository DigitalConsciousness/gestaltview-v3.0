import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createRepoCorpusContainer } from "../../scripts/corpusContainer";

describe("repo corpus container", () => {
  it("creates a repo-aware staging scaffold with a manifest and review plan", () => {
    const baseDir = mkdtempSync(join(tmpdir(), "gsvw-repo-corpus-"));

    try {
      const plan = createRepoCorpusContainer({
        repository: "acme/demo-repo",
        defaultBranch: "develop",
        baseDir
      });

      expect(plan.repoSlug).toBe("acme-demo-repo");
      expect(existsSync(plan.manifestPath)).toBe(true);
      expect(existsSync(plan.reviewPath)).toBe(true);
      expect(existsSync(plan.lanePaths.knowledge)).toBe(true);

      const manifest = JSON.parse(readFileSync(plan.manifestPath, "utf8")) as {
        projectName: string;
        owner: string;
        repoContainer: string;
        entries: Array<{ sourceUri: string }>;
      };

      expect(manifest.projectName).toBe("demo-repo");
      expect(manifest.owner).toBe("acme");
      expect(manifest.repoContainer).toBe("..");
      expect(manifest.entries[0]?.sourceUri).toContain("../staged/knowledge/");
    } finally {
      rmSync(baseDir, { recursive: true, force: true });
    }
  });
});
