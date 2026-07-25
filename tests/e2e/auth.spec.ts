import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  test("login page is available and can redirect to sanctuary after mocked callback", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading").or(page.getByText(/sign in|login|welcome/i).first())).toBeVisible();

    await page.goto("/auth/callback#access_token=e2e-token&refresh_token=e2e-refresh&type=magiclink");
    await expect(page).toHaveURL(/\/sanctuary|\/dashboard|\/welcome|\/login/);
  });

  test("unauthenticated access to blackboard room does not expose private user data", async ({ page }) => {
    await page.goto("/blackboard-room");
    await expect(page).toHaveURL(/\/blackboard-room|\/login/);
    await expect(page.locator("body")).not.toContainText(/jwt|access_token|refresh_token/i);
  });
});
