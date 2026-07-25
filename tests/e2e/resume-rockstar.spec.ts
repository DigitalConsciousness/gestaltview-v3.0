import { expect, test } from "@playwright/test";

test.describe("Resume Rockstar", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/modules/resume-rockstar/analyze", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ats: { total: 82, grade: "A" }, plk: { score: 73, voice: "authentic" } }) }));
    await page.route("**/api/modules/resume-rockstar/enhance", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ enhanced: "Enhanced experience text with 40% delivery improvement.", atsDelta: 12, plkDelta: 8 }) }));
  });

  test("scores ATS/PLK and enhance replaces textarea content", async ({ page }) => {
    await page.goto("/workspace/modules/resume-rockstar");
    await page.getByRole("button", { name: /experience/i }).click();
    const textarea = page.locator("textarea").first();
    await textarea.fill("Led a team of 12 engineers, increasing delivery speed by 40%.");

    await page.getByRole("button", { name: /score|analyze/i }).click();
    await expect(page.getByText(/A\+|A|B|C|D/).first()).toBeVisible();
    await expect(page.getByText(/highly_resonant|authentic|developing|neutral|compressed/).first()).toBeVisible();

    await page.getByRole("button", { name: /enhance/i }).click();
    await expect(textarea).toHaveValue(/Enhanced experience text/);
  });
});
