import { expect, test } from "@playwright/test";

const JOB_ID = "33333333-3333-4333-8333-333333333333";
const ARTIFACT_ID = "44444444-4444-4444-8444-444444444444";
const PROJECTION_ID = "55555555-5555-4555-8555-555555555555";
const MARKER = "GV-CREATION-CORNER-E2E-PROOF";

test("Creation Corner keeps preview local until a ready receipt is explicitly projected", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const renderRequests: Array<Record<string, unknown>> = [];
  let projectionRequests = 0;

  await page.route("**/api/orchestrator/decide", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Use deterministic local selector." }),
    }),
  );
  await page.route("**/api/gen-engine/artifacts", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        artifact: {
          id: "artifact-e2e-proof",
          title: "Convergence browser proof",
          content: `# Convergence browser proof\n\n${MARKER}`,
          metadata: { llmSynthesized: true },
        },
        warnings: [],
        provenance: {
          artifactId: "artifact-e2e-proof",
          sourceCaptureIds: [],
          sourceHashes: [],
          artifactHash: "proof-hash",
          generatedAt: "2026-07-27T00:00:00.000Z",
          engineVersion: "e2e-proof",
        },
      }),
    }),
  );
  await page.route("**/api/gen-engine/resonance", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        score: 87,
        metaphorsMatched: [],
        energyBoost: 0,
        triggerPenalty: 0,
        warnings: [],
      }),
    }),
  );
  await page.route("**/api/codex/forge", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Exercise local preview." }),
    }),
  );
  await page.route("**/api/render/decide", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Exercise local preview." }),
    }),
  );
  await page.route("**/api/render/engine", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    renderRequests.push(body);
    expect(body).toMatchObject({
      contractVersion: "gestaltview.render-request.v2",
      sourceFamily: "scene_graph",
      idempotencyKey: "creation-corner:artifact-e2e-proof:html",
      targets: [
        {
          format: "html",
          destinationIntent: "project",
          required: true,
        },
      ],
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        reused: renderRequests.length > 1,
        job: {
          id: JOB_ID,
          graphId: "creation_corner_artifact-e2e-proof",
          status: "ready",
        },
        artifacts: [
          {
            id: ARTIFACT_ID,
            format: "html",
            backend: "gestalt-document-backend",
            mimeType: "text/html; charset=utf-8",
            bytes: 128,
            hash: "a".repeat(64),
            targetStatus: "success",
          },
        ],
        diagnostics: [],
        manifest: {
          contract: "gestaltview.render-result.v2",
          targetReceipts: [{ format: "html", required: true, status: "success" }],
        },
      }),
    });
  });
  await page.route("**/api/render/promote-to-gallery", async (route) => {
    projectionRequests += 1;
    expect(route.request().postDataJSON()).toMatchObject({
      renderJobId: JOB_ID,
      targetRoom: "dynamic_inner_world",
      title: "Convergence browser proof",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        projectedIds: [PROJECTION_ID],
        skipped: [],
        targetRoom: "dynamic_inner_world",
        idempotent: true,
      }),
    });
  });

  await page.goto("/creation-corner");
  await page.getByRole("button", { name: "→ Inner World" }).click();
  await page
    .getByPlaceholder(
      "Paste anything here — notes, fragments, voice transcripts, half-formed ideas. The Art Teacher will know what to do.",
    )
    .fill(`Deterministic browser source ${MARKER}`);
  await page.getByRole("button", { name: "⚗ Synthesize" }).click();

  await expect(
    page.getByText("Local preview — not yet saved to the render ledger"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Project to Inner World" }),
  ).toHaveCount(0);
  expect(projectionRequests).toBe(0);

  await page.getByRole("button", { name: "Create durable render" }).click();
  await expect(page.getByText("Render ledger: ready")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Project to Inner World" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Create durable render" }).click();
  await expect.poll(() => renderRequests.length).toBe(2);
  expect(renderRequests[1]?.idempotencyKey).toBe(renderRequests[0]?.idempotencyKey);

  await page.getByRole("button", { name: "Project to Inner World" }).click();
  await expect(page.getByText("Projected with durable receipt")).toBeVisible();
  expect(projectionRequests).toBe(1);

  await page.evaluate(
    ({ artifactId, jobId, marker }) => {
      const now = "2026-07-27T00:00:00.000Z";
      window.localStorage.setItem(
        "gestaltview.innerWorldArtifacts.v1",
        JSON.stringify([
          {
            id: `render-artifact:${artifactId}`,
            userId: "11111111-1111-4111-8111-111111111111",
            title: `Convergence browser proof ${marker}`,
            summary: "Explicit verified projection",
            sourceFileId: null,
            html: `<!doctype html><html><body>${marker}</body></html>`,
            createdAt: now,
            updatedAt: now,
            originRoom: "dynamic_inner_world",
            evidenceNodeIds: [],
            tags: ["render-fold-in", "format:html"],
            status: "ready",
            sourceRef: `render-artifact:${artifactId}`,
            contentRef: {
              renderJobId: jobId,
              renderArtifactId: artifactId,
            },
            originKind: "render_projection_verified",
          },
        ]),
      );
    },
    { artifactId: ARTIFACT_ID, jobId: JOB_ID, marker: MARKER },
  );
  await page.goto("/dynamic-inner-world");
  await expect(
    page.getByText(`Convergence browser proof ${MARKER}`, { exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/creation-corner-render-projection-proof.png",
    fullPage: false,
  });
});
