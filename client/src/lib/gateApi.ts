import {
  GateCheckoutResponseSchema,
  GateDraftAnalysisSchema,
  GateOrderDetailSchema,
  GateRedeemAccessResponseSchema,
  type GateCheckoutRequest,
  type GateDraftAnalysis,
  type GateOrderDetail,
  type GateRedeemAccessRequest,
  type GateRedeemAccessResponse,
  type GateSidekickMessageRequest,
  type PackageConfigDraftInput,
  type PackageConfigDraftPatch,
} from "@shared/gate/schemas";

function gateAdminHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_GATE_ADMIN_KEY ?? "";
  if (!key) return {};
  return { "X-Gate-Admin-Key": key };
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return {
    error: (await response.text()).trim() || "Request failed.",
  };
}

async function requestGate<T>(
  input: RequestInfo,
  init: RequestInit,
  parse: (value: unknown) => T
): Promise<T> {
  const response = await fetch(input, init);
  const body = await readJson(response);
  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "GATE request failed.";
    throw new Error(message);
  }

  return parse(body);
}

export async function createGateDraft(
  input: Partial<PackageConfigDraftInput>
): Promise<GateDraftAnalysis> {
  return requestGate(
    "/api/gate/drafts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function fetchGateDraft(id: string): Promise<GateDraftAnalysis> {
  return requestGate(
    `/api/gate/drafts/${id}`,
    {
      method: "GET",
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function updateGateDraft(
  id: string,
  patch: PackageConfigDraftPatch
): Promise<GateDraftAnalysis> {
  return requestGate(
    `/api/gate/drafts/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function sendGateSidekickMessage(
  draftId: string,
  input: GateSidekickMessageRequest
): Promise<GateDraftAnalysis> {
  return requestGate(
    `/api/gate/drafts/${draftId}/sidekick`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function applyGateSidekickAction(
  draftId: string,
  actionId: string
): Promise<GateDraftAnalysis> {
  return requestGate(
    `/api/gate/drafts/${draftId}/sidekick/actions/${actionId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function validateGateDraft(id: string): Promise<GateDraftAnalysis> {
  return requestGate(
    `/api/gate/drafts/${id}/validate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    (body) => GateDraftAnalysisSchema.parse((body as { analysis: unknown }).analysis)
  );
}

export async function checkoutGateDraft(
  input: GateCheckoutRequest
): Promise<{
  checkout: ReturnType<typeof GateCheckoutResponseSchema.parse>;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(input.mockPayment ? gateAdminHeaders() : {}),
  };

  return requestGate(
    "/api/gate/checkout",
    {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    },
    (body) => ({
      checkout: GateCheckoutResponseSchema.parse(body),
    })
  );
}

export async function fetchGateOrder(
  orderId: string,
  accessToken: string
): Promise<GateOrderDetail> {
  if (!accessToken.trim()) {
    throw new Error("This order link is missing its buyer access token.");
  }

  return requestGate(
    `/api/gate/orders/${orderId}?access=${encodeURIComponent(accessToken)}`,
    {
      method: "GET",
    },
    (body) => GateOrderDetailSchema.parse((body as { order: unknown }).order)
  );
}

export async function redeemGateArtifactAccess(
  orderId: string,
  input: GateRedeemAccessRequest
): Promise<GateRedeemAccessResponse> {
  return requestGate(
    `/api/gate/orders/${orderId}/redeem`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    (body) => GateRedeemAccessResponseSchema.parse(body)
  );
}

export async function regenerateGateBuild(buildJobId: string): Promise<void> {
  await requestGate(
    `/api/gate/build-jobs/${buildJobId}/regenerate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...gateAdminHeaders() },
      body: "{}",
    },
    () => undefined
  );
}
