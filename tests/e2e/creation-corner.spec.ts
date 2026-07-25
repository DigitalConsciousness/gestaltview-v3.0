import { expect, test } from "@playwright/test";

const renderedContent = Array.from({ length: 60 }, (_, i) => `word${i + 1}`).join(" ");

test("Creation Corner renders readable LLM prose instead of JSON or template markdown", async ({ page }) => {
  await page.route("**/api/gen-engine/artifacts", async (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ artifact: { id: "artifact-e2e", title: "E2E Artifact", content: renderedContent, metadata: { llmSynthesized: true } }, warnings: [] }),
  }));

  await page.goto("/creation-corner");
  const textarea = page.locator("textarea").first();
  await textarea.fill("Source text for a long readable artifact that should be synthesized into prose.");
  await page.getByRole("button", { name: /synthesize|create|forge|generate/i }).first().click();

  await expect(page.getByText(renderedContent.slice(0, 40))).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/\{\s*"metadata"|Source captures:/);
  expect(renderedContent.split(/\s+/)).toHaveLength(60);
});
