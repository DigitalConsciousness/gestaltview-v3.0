import { expect, test } from "@playwright/test";

const billyResponse = {
  response: "Billy test response with enough content to prove the response bubble is not blank.",
  provider: "e2e-mock",
  timestamp: new Date().toISOString(),
  metadata: {
    symbioCoder: {
      intent: { primary: "explain", confidence: 0.96, signals: ["explain"] },
      emotion: { tone: "focused", intensity: 0.6, supportMode: "coach" },
      flow: { state: "in_flow", momentum: 0.9 },
      routing: "explain",
    },
  },
};

test.describe("Billy chat", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/billy", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(billyResponse) }));
  });

  test("sends a message, renders a non-empty response, and shows symbio metadata chip", async ({ page }) => {
    await page.goto("/sanctuary");
    await page.getByRole("button", { name: /billy|open/i }).last().click();
    await page.getByPlaceholder(/ask billy/i).fill("Explain this demo path.");
    await page.keyboard.press("Enter");

    await expect(page.getByText(billyResponse.response)).toBeVisible();
    await expect(page.getByText(billyResponse.response)).not.toHaveText(/^\s*$/);
    await expect(page.getByTestId("billy-symbio-chip")).toBeVisible();
  });
});
