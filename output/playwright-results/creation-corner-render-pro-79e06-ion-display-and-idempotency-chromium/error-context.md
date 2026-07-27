# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: creation-corner-render-projection.live.spec.ts >> Phase 5 live infrastructure proof >> proves stored bytes, ownership, retrieval, projection, display, and idempotency
- Location: tests/e2e/creation-corner-render-projection.live.spec.ts:216:3

# Error details

```
Error: Phase 5 test-user sign-in failed: Invalid login credentials
```

# Test source

```ts
  1   | import { createHash } from "node:crypto";
  2   | import { mkdir, writeFile } from "node:fs/promises";
  3   | import { dirname, resolve } from "node:path";
  4   | import {
  5   |   expect,
  6   |   test,
  7   |   type BrowserContext,
  8   |   type BrowserContextOptions,
  9   | } from "@playwright/test";
  10  | import { createClient, type SupabaseClient } from "@supabase/supabase-js";
  11  | 
  12  | const LIVE_ENABLED = process.env.PHASE5_LIVE === "true";
  13  | const CONTRACT_VERSION = "gestaltview.render-request.v2";
  14  | const SOURCE_ID = "phase5:inside-out-convergence:v1";
  15  | const IDEMPOTENCY_KEY = "phase5:inside-out-convergence:v1:html";
  16  | const MARKER = "GV-PHASE5-LIVE-CONVERGENCE-PROOF";
  17  | const UUID_PATTERN =
  18  |   /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  19  | 
  20  | type JsonRecord = Record<string, unknown>;
  21  | 
  22  | function requiredEnv(name: string): string {
  23  |   const value = process.env[name]?.trim();
  24  |   if (!value) {
  25  |     throw new Error(`${name} is required when PHASE5_LIVE=true.`);
  26  |   }
  27  |   return value;
  28  | }
  29  | 
  30  | function assertSafeTarget(baseURL: string): void {
  31  |   const url = new URL(baseURL);
  32  |   const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  33  |   const productionHosts = new Set([
  34  |     "gestaltview.com",
  35  |     "www.gestaltview.com",
  36  |     "gestaltview-one.vercel.app",
  37  |   ]);
  38  | 
  39  |   if (
  40  |     productionHosts.has(url.hostname) &&
  41  |     process.env.PHASE5_ALLOW_PRODUCTION !== "true"
  42  |   ) {
  43  |     throw new Error(
  44  |       `Refusing Phase 5 production smoke against ${url.hostname}. ` +
  45  |         "Run preview/development first, then set PHASE5_ALLOW_PRODUCTION=true only after approval.",
  46  |     );
  47  |   }
  48  |   if (!local && process.env.PHASE5_ALLOW_REMOTE !== "true") {
  49  |     throw new Error(
  50  |       `Refusing remote Phase 5 proof against ${url.hostname} without PHASE5_ALLOW_REMOTE=true.`,
  51  |     );
  52  |   }
  53  | }
  54  | 
  55  | function protectedDeploymentHeaders(): BrowserContextOptions["extraHTTPHeaders"] {
  56  |   const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  57  |   if (!bypassSecret) return undefined;
  58  | 
  59  |   return {
  60  |     "x-vercel-protection-bypass": bypassSecret,
  61  |     "x-vercel-set-bypass-cookie": "true",
  62  |   };
  63  | }
  64  | 
  65  | function makeUserClient(url: string, key: string): SupabaseClient {
  66  |   return createClient(url, key, {
  67  |     auth: {
  68  |       autoRefreshToken: false,
  69  |       detectSessionInUrl: false,
  70  |       persistSession: false,
  71  |     },
  72  |   });
  73  | }
  74  | 
  75  | async function authenticateContext(params: {
  76  |   context: BrowserContext;
  77  |   supabaseUrl: string;
  78  |   publishableKey: string;
  79  |   email: string;
  80  |   password: string;
  81  | }): Promise<{ id: string; client: SupabaseClient }> {
  82  |   const client = makeUserClient(params.supabaseUrl, params.publishableKey);
  83  |   const { data, error } = await client.auth.signInWithPassword({
  84  |     email: params.email,
  85  |     password: params.password,
  86  |   });
  87  |   if (error || !data.session?.access_token || !data.user?.id) {
> 88  |     throw new Error(
      |           ^ Error: Phase 5 test-user sign-in failed: Invalid login credentials
  89  |       `Phase 5 test-user sign-in failed: ${error?.message ?? "no session returned"}`,
  90  |     );
  91  |   }
  92  | 
  93  |   const sync = await params.context.request.post("/api/auth/supabase/session", {
  94  |     data: {
  95  |       accessToken: data.session.access_token,
  96  |       redirectTo: "/dynamic-inner-world",
  97  |     },
  98  |   });
  99  |   if (!sync.ok()) {
  100 |     throw new Error(
  101 |       `App session exchange failed (${sync.status()}): ${await sync.text()}`,
  102 |     );
  103 |   }
  104 | 
  105 |   return { id: data.user.id, client };
  106 | }
  107 | 
  108 | function jsonObject(value: unknown, label: string): JsonRecord {
  109 |   if (!value || typeof value !== "object" || Array.isArray(value)) {
  110 |     throw new Error(`${label} did not return a JSON object.`);
  111 |   }
  112 |   return value as JsonRecord;
  113 | }
  114 | 
  115 | function objectField(
  116 |   value: JsonRecord,
  117 |   field: string,
  118 |   label: string,
  119 | ): JsonRecord {
  120 |   return jsonObject(value[field], `${label}.${field}`);
  121 | }
  122 | 
  123 | function arrayField(
  124 |   value: JsonRecord,
  125 |   field: string,
  126 |   label: string,
  127 | ): JsonRecord[] {
  128 |   const result = value[field];
  129 |   if (!Array.isArray(result)) {
  130 |     throw new Error(`${label}.${field} did not return an array.`);
  131 |   }
  132 |   return result.map((item, index) =>
  133 |     jsonObject(item, `${label}.${field}[${index}]`),
  134 |   );
  135 | }
  136 | 
  137 | function redactStoragePath(path: string): string {
  138 |   const parts = path.split("/").filter(Boolean);
  139 |   return parts.length <= 2 ? path : `…/${parts.slice(-2).join("/")}`;
  140 | }
  141 | 
  142 | async function cleanupFixture(params: {
  143 |   supabaseUrl: string;
  144 |   serviceRoleKey: string;
  145 |   ownerId: string;
  146 |   jobId: string;
  147 |   projectionId: string;
  148 |   sourceRef: string;
  149 | }): Promise<{
  150 |   removedObjects: number;
  151 |   removedProjection: boolean;
  152 |   removedJob: boolean;
  153 | }> {
  154 |   const admin = createClient(params.supabaseUrl, params.serviceRoleKey, {
  155 |     auth: {
  156 |       autoRefreshToken: false,
  157 |       detectSessionInUrl: false,
  158 |       persistSession: false,
  159 |     },
  160 |   });
  161 |   const { data: jobs, error: jobReadError } = await admin
  162 |     .from("render_jobs")
  163 |     .select("id,user_id,source_id")
  164 |     .eq("id", params.jobId)
  165 |     .eq("user_id", params.ownerId)
  166 |     .limit(1);
  167 |   if (jobReadError || jobs?.[0]?.source_id !== SOURCE_ID) {
  168 |     throw new Error(
  169 |       "Cleanup refused: the render job does not match the disposable Phase 5 fixture.",
  170 |     );
  171 |   }
  172 | 
  173 |   const { data: artifacts, error: artifactReadError } = await admin
  174 |     .from("render_artifacts")
  175 |     .select("storage_bucket,storage_path")
  176 |     .eq("render_job_id", params.jobId)
  177 |     .eq("user_id", params.ownerId);
  178 |   if (artifactReadError) throw artifactReadError;
  179 | 
  180 |   let removedObjects = 0;
  181 |   for (const artifact of artifacts ?? []) {
  182 |     const bucket = String(artifact.storage_bucket ?? "");
  183 |     const path = String(artifact.storage_path ?? "");
  184 |     if (!bucket || !path || !path.includes(params.jobId)) {
  185 |       throw new Error(
  186 |         "Cleanup refused: a storage receipt is outside the disposable job namespace.",
  187 |       );
  188 |     }
```