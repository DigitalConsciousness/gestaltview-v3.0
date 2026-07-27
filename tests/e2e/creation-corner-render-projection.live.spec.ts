import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  expect,
  test,
  type BrowserContext,
  type BrowserContextOptions,
} from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const LIVE_ENABLED = process.env.PHASE5_LIVE === "true";
const CONTRACT_VERSION = "gestaltview.render-request.v2";
const SOURCE_ID = "phase5:inside-out-convergence:v1";
const IDEMPOTENCY_KEY = "phase5:inside-out-convergence:v1:html";
const MARKER = "GV-PHASE5-LIVE-CONVERGENCE-PROOF";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonRecord = Record<string, unknown>;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required when PHASE5_LIVE=true.`);
  }
  return value;
}

function assertSafeTarget(baseURL: string): void {
  const url = new URL(baseURL);
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const productionHosts = new Set([
    "gestaltview.com",
    "www.gestaltview.com",
    "gestaltview-one.vercel.app",
  ]);

  if (
    productionHosts.has(url.hostname) &&
    process.env.PHASE5_ALLOW_PRODUCTION !== "true"
  ) {
    throw new Error(
      `Refusing Phase 5 production smoke against ${url.hostname}. ` +
        "Run preview/development first, then set PHASE5_ALLOW_PRODUCTION=true only after approval.",
    );
  }
  if (!local && process.env.PHASE5_ALLOW_REMOTE !== "true") {
    throw new Error(
      `Refusing remote Phase 5 proof against ${url.hostname} without PHASE5_ALLOW_REMOTE=true.`,
    );
  }
}

function protectedDeploymentHeaders(): BrowserContextOptions["extraHTTPHeaders"] {
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  if (!bypassSecret) return undefined;

  return {
    "x-vercel-protection-bypass": bypassSecret,
    "x-vercel-set-bypass-cookie": "true",
  };
}

function makeUserClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function authenticateContext(params: {
  context: BrowserContext;
  supabaseUrl: string;
  publishableKey: string;
  email: string;
  password: string;
}): Promise<{ id: string; client: SupabaseClient }> {
  const client = makeUserClient(params.supabaseUrl, params.publishableKey);
  const { data, error } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session?.access_token || !data.user?.id) {
    throw new Error(
      `Phase 5 test-user sign-in failed: ${error?.message ?? "no session returned"}`,
    );
  }

  const sync = await params.context.request.post("/api/auth/supabase/session", {
    data: {
      accessToken: data.session.access_token,
      redirectTo: "/dynamic-inner-world",
    },
  });
  if (!sync.ok()) {
    throw new Error(
      `App session exchange failed (${sync.status()}): ${await sync.text()}`,
    );
  }

  return { id: data.user.id, client };
}

function jsonObject(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} did not return a JSON object.`);
  }
  return value as JsonRecord;
}

function objectField(
  value: JsonRecord,
  field: string,
  label: string,
): JsonRecord {
  return jsonObject(value[field], `${label}.${field}`);
}

function arrayField(
  value: JsonRecord,
  field: string,
  label: string,
): JsonRecord[] {
  const result = value[field];
  if (!Array.isArray(result)) {
    throw new Error(`${label}.${field} did not return an array.`);
  }
  return result.map((item, index) =>
    jsonObject(item, `${label}.${field}[${index}]`),
  );
}

function redactStoragePath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.length <= 2 ? path : `…/${parts.slice(-2).join("/")}`;
}

async function cleanupFixture(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  ownerId: string;
  jobId: string;
  projectionId: string;
  sourceRef: string;
}): Promise<{
  removedObjects: number;
  removedProjection: boolean;
  removedJob: boolean;
}> {
  const admin = createClient(params.supabaseUrl, params.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const { data: jobs, error: jobReadError } = await admin
    .from("render_jobs")
    .select("id,user_id,source_id")
    .eq("id", params.jobId)
    .eq("user_id", params.ownerId)
    .limit(1);
  if (jobReadError || jobs?.[0]?.source_id !== SOURCE_ID) {
    throw new Error(
      "Cleanup refused: the render job does not match the disposable Phase 5 fixture.",
    );
  }

  const { data: artifacts, error: artifactReadError } = await admin
    .from("render_artifacts")
    .select("storage_bucket,storage_path")
    .eq("render_job_id", params.jobId)
    .eq("user_id", params.ownerId);
  if (artifactReadError) throw artifactReadError;

  let removedObjects = 0;
  for (const artifact of artifacts ?? []) {
    const bucket = String(artifact.storage_bucket ?? "");
    const path = String(artifact.storage_path ?? "");
    if (!bucket || !path || !path.includes(params.jobId)) {
      throw new Error(
        "Cleanup refused: a storage receipt is outside the disposable job namespace.",
      );
    }
    const { error } = await admin.storage.from(bucket).remove([path]);
    if (error) throw error;
    removedObjects += 1;
  }

  const { error: projectionDeleteError } = await admin
    .from("inner_world_artifacts")
    .delete()
    .eq("id", params.projectionId)
    .eq("user_id", params.ownerId)
    .eq("source_ref", params.sourceRef);
  if (projectionDeleteError) throw projectionDeleteError;

  const { error: jobDeleteError } = await admin
    .from("render_jobs")
    .delete()
    .eq("id", params.jobId)
    .eq("user_id", params.ownerId)
    .eq("source_id", SOURCE_ID);
  if (jobDeleteError) throw jobDeleteError;

  return { removedObjects, removedProjection: true, removedJob: true };
}

test.describe("Phase 5 live infrastructure proof", () => {
  test.skip(!LIVE_ENABLED, "Set PHASE5_LIVE=true to run the gated live proof.");

  test("proves stored bytes, ownership, retrieval, projection, display, and idempotency", async ({
    browser,
  }, testInfo) => {
    test.setTimeout(120_000);

    const baseURL = requiredEnv("PLAYWRIGHT_BASE_URL");
    const supabaseUrl = requiredEnv("PHASE5_SUPABASE_URL");
    const publishableKey = requiredEnv("PHASE5_SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = requiredEnv("PHASE5_SUPABASE_SERVICE_ROLE_KEY");
    assertSafeTarget(baseURL);
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });

    const extraHTTPHeaders = protectedDeploymentHeaders();
    const ownerContext = await browser.newContext({
      baseURL,
      extraHTTPHeaders,
    });
    const otherContext = await browser.newContext({
      baseURL,
      extraHTTPHeaders,
    });
    let cleanup:
      | {
          removedObjects: number;
          removedProjection: boolean;
          removedJob: boolean;
        }
      | { skipped: true } = { skipped: true };

    try {
      const owner = await authenticateContext({
        context: ownerContext,
        supabaseUrl,
        publishableKey,
        email: requiredEnv("PHASE5_OWNER_EMAIL"),
        password: requiredEnv("PHASE5_OWNER_PASSWORD"),
      });
      const other = await authenticateContext({
        context: otherContext,
        supabaseUrl,
        publishableKey,
        email: requiredEnv("PHASE5_OTHER_EMAIL"),
        password: requiredEnv("PHASE5_OTHER_PASSWORD"),
      });
      expect(owner.id).not.toBe(other.id);

      const requestBody = {
        contractVersion: CONTRACT_VERSION,
        sourceFamily: "scene_graph",
        sceneGraph: {
          schema: "nextgen.scene-graph.v1",
          graphId: SOURCE_ID,
          nodes: [
            {
              id: "phase5-document",
              type: "Document",
              name: "Phase 5 convergence proof",
              props: { title: `Phase 5 convergence proof — ${MARKER}` },
            },
            {
              id: "phase5-body",
              type: "Markdown",
              name: "Proof body",
              props: {
                source:
                  `# Phase 5 convergence proof\n\n${MARKER}\n\n` +
                  "Deterministic, harmless render and projection fixture.",
              },
            },
          ],
          edges: [
            {
              id: "phase5-document-contains-body",
              type: "contains",
              from: "phase5-document",
              to: "phase5-body",
              props: {},
            },
          ],
        },
        targets: [
          {
            format: "html",
            mimeType: "text/html; charset=utf-8",
            destinationIntent: "project",
            required: true,
          },
        ],
        idempotencyKey: IDEMPOTENCY_KEY,
      };

      const firstResponse = await ownerContext.request.post(
        "/api/render/engine",
        {
          data: requestBody,
          headers: { "Idempotency-Key": IDEMPOTENCY_KEY },
        },
      );
      const first = jsonObject(await firstResponse.json(), "render");
      expect(firstResponse.ok(), JSON.stringify(first)).toBeTruthy();
      expect(first.ok).toBe(true);
      const firstJob = objectField(first, "job", "render");
      const jobId = String(firstJob.id ?? "");
      expect(jobId).toMatch(UUID_PATTERN);
      expect(firstJob.status).toBe("ready");

      const statusResponse = await ownerContext.request.get(
        `/api/render/status?jobId=${encodeURIComponent(jobId)}`,
      );
      const status = jsonObject(await statusResponse.json(), "status");
      expect(statusResponse.ok(), JSON.stringify(status)).toBeTruthy();
      const statusJob = objectField(status, "job", "status");
      expect(statusJob.id).toBe(jobId);
      expect(statusJob.status).toBe("ready");
      expect(Date.parse(String(statusJob.createdAt))).not.toBeNaN();
      expect(Date.parse(String(statusJob.updatedAt))).not.toBeNaN();

      const artifacts = arrayField(status, "artifacts", "status");
      const htmlArtifact = artifacts.find(
        (artifact) =>
          String(artifact.format) === "html" &&
          String(artifact.mimeType).startsWith("text/html") &&
          String(artifact.targetStatus) === "success",
      );
      expect(htmlArtifact, JSON.stringify(artifacts)).toBeTruthy();
      const artifactId = String(htmlArtifact?.id ?? "");
      const expectedHash = String(htmlArtifact?.hash ?? "").toLowerCase();
      const downloadUrl = String(htmlArtifact?.downloadUrl ?? "");
      expect(artifactId).toMatch(UUID_PATTERN);
      expect(Number(htmlArtifact?.bytes)).toBeGreaterThan(0);
      expect(expectedHash).toMatch(/^[a-f0-9]{64}$/);
      expect(downloadUrl).toMatch(/^https?:\/\//);

      const download = await ownerContext.request.get(downloadUrl);
      expect(download.ok()).toBeTruthy();
      const downloadedBytes = await download.body();
      const retrievedHash = createHash("sha256")
        .update(downloadedBytes)
        .digest("hex");
      expect(retrievedHash).toBe(expectedHash);
      expect(downloadedBytes.toString("utf8")).toContain(MARKER);

      const { data: durableArtifacts, error: durableArtifactError } =
        await admin
          .from("render_artifacts")
          .select(
            "id,render_job_id,user_id,format,mime_type,storage_bucket,storage_path,byte_size,content_hash,target_status,created_at",
          )
          .eq("id", artifactId)
          .eq("render_job_id", jobId)
          .eq("user_id", owner.id)
          .limit(1);
      expect(durableArtifactError).toBeNull();
      const durableArtifact = durableArtifacts?.[0];
      expect(durableArtifact).toBeTruthy();
      expect(durableArtifact?.content_hash).toBe(expectedHash);
      expect(Number(durableArtifact?.byte_size)).toBe(
        downloadedBytes.byteLength,
      );
      expect(String(durableArtifact?.storage_bucket ?? "")).not.toBe("");
      expect(String(durableArtifact?.storage_path ?? "")).not.toBe("");

      const otherStatus = await otherContext.request.get(
        `/api/render/status?jobId=${encodeURIComponent(jobId)}`,
      );
      expect(otherStatus.status()).toBe(404);
      const { data: crossOwnerRows, error: crossOwnerError } =
        await other.client.from("render_jobs").select("id").eq("id", jobId);
      const crossOwnerRlsDenied =
        Boolean(crossOwnerError) || crossOwnerRows?.length === 0;
      expect(crossOwnerRlsDenied).toBe(true);

      const projectionResponse = await ownerContext.request.post(
        "/api/render/promote-to-gallery",
        {
          data: {
            renderJobId: jobId,
            targetRoom: "dynamic_inner_world",
            title: `Phase 5 convergence proof — ${MARKER}`,
            summary:
              "Explicit verified projection from the disposable Phase 5 fixture.",
          },
        },
      );
      const projection = jsonObject(
        await projectionResponse.json(),
        "projection",
      );
      expect(projectionResponse.ok(), JSON.stringify(projection)).toBeTruthy();
      const projectionIds = projection.projectedIds;
      expect(Array.isArray(projectionIds)).toBeTruthy();
      const projectionId = String((projectionIds as unknown[])[0] ?? "");
      expect(projectionId).toMatch(UUID_PATTERN);
      const sourceRef = `render-artifact:${artifactId}`;

      const artifactsResponse = await ownerContext.request.get(
        "/api/inner-world/artifacts?limit=100",
      );
      const artifactEnvelope = jsonObject(
        await artifactsResponse.json(),
        "innerWorld",
      );
      expect(
        artifactsResponse.ok(),
        JSON.stringify(artifactEnvelope),
      ).toBeTruthy();
      const projectedRecord = arrayField(
        artifactEnvelope,
        "artifacts",
        "innerWorld",
      ).find(
        (artifact) =>
          String(artifact.sourceRef ?? artifact.source_ref ?? "") === sourceRef,
      );
      expect(projectedRecord, JSON.stringify(artifactEnvelope)).toBeTruthy();
      expect(String(projectedRecord?.id)).toBe(projectionId);
      const { data: durableProjections, error: durableProjectionError } =
        await admin
          .from("inner_world_artifacts")
          .select("id,user_id,source_ref,content_ref,status,created_at")
          .eq("id", projectionId)
          .eq("user_id", owner.id)
          .eq("source_ref", sourceRef)
          .limit(1);
      expect(durableProjectionError).toBeNull();
      expect(durableProjections?.[0]?.source_ref).toBe(sourceRef);

      const otherProjection = await otherContext.request.post(
        "/api/render/promote-to-gallery",
        { data: { renderJobId: jobId, targetRoom: "dynamic_inner_world" } },
      );
      expect(otherProjection.status()).toBe(404);

      const rerunResponse = await ownerContext.request.post(
        "/api/render/engine",
        {
          data: requestBody,
          headers: { "Idempotency-Key": IDEMPOTENCY_KEY },
        },
      );
      const rerun = jsonObject(await rerunResponse.json(), "rerun");
      expect(rerunResponse.ok(), JSON.stringify(rerun)).toBeTruthy();
      expect(rerun.reused).toBe(true);
      expect(objectField(rerun, "job", "rerun").id).toBe(jobId);

      const projectionRerunResponse = await ownerContext.request.post(
        "/api/render/promote-to-gallery",
        {
          data: {
            renderJobId: jobId,
            targetRoom: "dynamic_inner_world",
            title: `Phase 5 convergence proof — ${MARKER}`,
          },
        },
      );
      const projectionRerun = jsonObject(
        await projectionRerunResponse.json(),
        "projectionRerun",
      );
      expect(
        projectionRerunResponse.ok(),
        JSON.stringify(projectionRerun),
      ).toBeTruthy();
      expect(projectionRerun.projectedIds).toEqual([projectionId]);

      const page = await ownerContext.newPage();
      await page.goto("/dynamic-inner-world");
      await expect(
        page
          .getByText(`Phase 5 convergence proof — ${MARKER}`, { exact: true })
          .first(),
      ).toBeVisible({ timeout: 30_000 });
      const screenshotPath = resolve(
        "output/playwright/creation-corner-render-projection-live-proof.png",
      );
      await mkdir(dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const storageBucket = String(durableArtifact?.storage_bucket ?? "");
      const storagePath = String(durableArtifact?.storage_path ?? "");
      const evidence: JsonRecord = {
        proofVersion: "gestaltview.phase5-live-proof.v1",
        capturedAt: new Date().toISOString(),
        target: {
          origin: new URL(baseURL).origin,
          productionAllowed: process.env.PHASE5_ALLOW_PRODUCTION === "true",
        },
        request: {
          contractVersion: CONTRACT_VERSION,
          sourceId: SOURCE_ID,
          idempotencyKey: IDEMPOTENCY_KEY,
        },
        job: {
          id: jobId,
          status: statusJob.status,
          createdAt: statusJob.createdAt,
          updatedAt: statusJob.updatedAt,
        },
        artifact: {
          id: artifactId,
          format: htmlArtifact?.format,
          mimeType: htmlArtifact?.mimeType,
          bucket: storageBucket,
          path: redactStoragePath(storagePath),
          bytes: htmlArtifact?.bytes,
          expectedSha256: expectedHash,
          retrievedSha256: retrievedHash,
        },
        ownership: {
          ownerRetrievalStatus: download.status(),
          crossOwnerStatusApi: otherStatus.status(),
          crossOwnerRlsDenied,
          crossOwnerRlsErrorCode: crossOwnerError?.code ?? null,
          crossOwnerProjectionStatus: otherProjection.status(),
        },
        projection: { id: projectionId, sourceRef, displayedMarker: MARKER },
        idempotency: {
          renderReused: rerun.reused,
          sameJobId: objectField(rerun, "job", "rerun").id === jobId,
          sameProjectionId:
            (projectionRerun.projectedIds as unknown[])[0] === projectionId,
        },
        logs: [
          "Supabase credentials and session tokens omitted.",
          "Signed retrieval URL omitted.",
          "Storage path redacted to its final two segments when available.",
        ],
      };

      if (process.env.PHASE5_CLEANUP_AFTER === "true") {
        cleanup = await cleanupFixture({
          supabaseUrl,
          serviceRoleKey,
          ownerId: owner.id,
          jobId,
          projectionId,
          sourceRef,
        });
      }
      evidence.cleanup = cleanup;

      const evidencePath = resolve(
        "output/phase5/creation-corner-render-projection.json",
      );
      await mkdir(dirname(evidencePath), { recursive: true });
      await writeFile(
        evidencePath,
        `${JSON.stringify(evidence, null, 2)}\n`,
        "utf8",
      );
      await testInfo.attach("phase5-live-evidence", {
        body: Buffer.from(JSON.stringify(evidence, null, 2)),
        contentType: "application/json",
      });
    } finally {
      await ownerContext.close();
      await otherContext.close();
    }
  });
});
