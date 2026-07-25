import { expect, test } from "@playwright/test";

test("Musical DNA interview opens and can add extracted songs", async ({ page }) => {
  await page.goto("/musical-dna");
  await page.getByRole("button", { name: /interview with billy/i }).click();
  await expect(page.getByText(/Billy Music Interview/i)).toBeVisible();

  await page.getByPlaceholder(/what theme did billy catch/i).fill("Courage and repair.");
  await page.getByPlaceholder(/song title/i).first().fill("Heroes");
  await page.getByPlaceholder(/artist/i).first().fill("David Bowie");
  await page.getByPlaceholder(/why this one matters/i).first().fill("It lands like courage in the body.");
  await page.getByRole("button", { name: /weave interview/i }).click();

  await expect(page.getByRole("button", { name: /add to musical dna|save to musical dna/i }).or(page.getByText(/heroes/i))).toBeVisible();
});
