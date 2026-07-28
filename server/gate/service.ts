import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { promises as fs } from "node:fs";

import { gateTierCatalogById } from "../../config/gateCatalog.js";
import { gateUseCaseBySlug } from "../../config/gateUseCases.js";
import { analyzeGateDraft, buildDefaultGateDraftInput } from "../../shared/gate/engine.js";
import {
  applyGateSidekickActionToDraft,
  composeGateSidekickReply,
  createGateSidekickState,
  synchronizeGateSidekickState,
} from "../../shared/gate/sidekick.js";
import {
  DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
  GateArtifactSchema,
  GateBuildJobSchema,
  GateBuyerSchema,
  GateCheckoutRequestSchema,
  GateQuoteApprovalRequestSchema,
  GateRedeemAccessRequestSchema,
  GateSidekickMessageRequestSchema,
  GateSidekickStateSchema,
  GateSidekickTurnSchema,
  GateOrderDetailSchema,
  GateOrderItemSchema,
  GateOrderSchema,
  GateSupportRequestSchema,
  GateDraftAnalysisSchema,
  PackageConfigDraftPatchSchema,
  PackageConfigDraftSchema,
  type GateArtifact,
  type GateBuildJob,
  type GateBuyer,
  type GateDraftAnalysis,
  type GateOrder,
  type GateOrderDetail,
  type GateOrderItem,
  type GateRedeemAccessResponse,
  type GateSidekickState,
  type GateSupportRequest,
  type PackageConfigDraft,
  type PackageConfigDraftInput,
  type PackageConfigDraftPatch,
} from "../../shared/gate/schemas.js";
import { composeGatePackageArtifact } from "./builder.js";
import {
  createGateArtifactSignedUrl,
  downloadGateArtifactFromStorage,
  getGateBuildJobRecord,
  getGateBuyerById,
  getGateDraftRecord,
  getGateOrderAccessTokenHash,
  getGateOrderRecord,
  insertGateBuildJob,
  insertGateDraft,
  insertGateOrder,
  insertGateOrderItems,
  insertGateSupportRequestRecord,
  listGateArtifacts,
  listGateBuildJobs,
  listGateOrderItems,
  listGateSupportRequests,
  updateGateBuildJobRecord,
  updateGateDraftRecord,
  updateGateOrderRecord,
  upsertGateArtifact,
  upsertGateBuyer,
} from "./repository.js";
import { gateArtifactsDir, loadGateState, saveGateState } from "./store.js";
import { hasGateSupabaseConfig } from "./supabase.js";
import { GATE_LOCAL_STORAGE_BUCKET } from "./constants.js";

function nowIso(): string {
  return new Date().toISOString();
}

const localGateOrderAccessHashes = new Map<string, string>();

function hashGateAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function accessHashesMatch(expected: string, actual: string): boolean {
  const expectedBytes = Buffer.from(expected, "hex");
  const actualBytes = Buffer.from(actual, "hex");
  return (
    expectedBytes.length === actualBytes.length &&
    expectedBytes.length > 0 &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}

async function assertGateOrderAccess(
  orderId: string,
  accessToken: string
): Promise<void> {
  const token = accessToken.trim();
  if (!token) {
    throw new Error("Order access denied.");
  }

  const expectedHash = hasGateSupabaseConfig()
    ? await getGateOrderAccessTokenHash(orderId)
    : localGateOrderAccessHashes.get(orderId) ?? null;
  const actualHash = hashGateAccessToken(token);
  if (!expectedHash || !accessHashesMatch(expectedHash, actualHash)) {
    throw new Error("Order access denied.");
  }
}

function sortUnique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function normalizeBuyerContext(
  input: PackageConfigDraftInput["buyerContext"] | undefined
): PackageConfigDraftInput["buyerContext"] {
  return {
    industry: input?.industry?.trim() || undefined,
    companyStage: input?.companyStage?.trim() || undefined,
    audience: input?.audience?.trim() || undefined,
    preferredChannels: sortUnique(input?.preferredChannels ?? []),
    brandingInputs: input?.brandingInputs?.trim() || undefined,
    deploymentConstraints: input?.deploymentConstraints?.trim() || undefined,
    requestedOutcomes: sortUnique(input?.requestedOutcomes ?? []),
    businessContext: input?.businessContext?.trim() || undefined,
  };
}

function stableDraftPayload(draft: PackageConfigDraftInput): string {
  return JSON.stringify({
    ...draft,
    embodimentProfileSlug:
      draft.embodimentProfileSlug || DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
    buyerContext: normalizeBuyerContext(draft.buyerContext),
    deliverySurfaces: [...draft.deliverySurfaces].sort(),
    operatorPackSlugs: [...draft.operatorPackSlugs].sort(),
    sourceBundleSlugs: [...draft.sourceBundleSlugs].sort(),
  });
}

function hashDraft(input: PackageConfigDraftInput): string {
  return createHash("sha256").update(stableDraftPayload(input)).digest("hex");
}

function normalizeDraftInput(
  input: Partial<PackageConfigDraftInput>
): PackageConfigDraftInput {
  const base = buildDefaultGateDraftInput();
  const merged = {
    ...base,
    ...input,
    embodimentProfileSlug:
      input.embodimentProfileSlug?.trim() || base.embodimentProfileSlug,
    buyerContext: normalizeBuyerContext({
      ...base.buyerContext,
      ...(input.buyerContext ?? {}),
      preferredChannels:
        input.buyerContext?.preferredChannels ?? base.buyerContext.preferredChannels,
      requestedOutcomes:
        input.buyerContext?.requestedOutcomes ?? base.buyerContext.requestedOutcomes,
    }),
    deliverySurfaces: sortUnique(
      (input.deliverySurfaces ?? base.deliverySurfaces) as string[]
    ),
    operatorPackSlugs: sortUnique(
      (input.operatorPackSlugs ?? base.operatorPackSlugs) as string[]
    ),
    sourceBundleSlugs: sortUnique(
      (input.sourceBundleSlugs ?? base.sourceBundleSlugs) as string[]
    ),
  };

  const useCase = gateUseCaseBySlug[merged.useCaseSlug];
  return PackageConfigDraftSchema.omit({
    id: true,
    status: true,
    priceSnapshotCents: true,
    configHash: true,
    createdAt: true,
    updatedAt: true,
  }).parse({
    ...merged,
    tier: merged.tier ?? useCase?.recommendedTier ?? base.tier,
    backend: merged.backend ?? useCase?.defaultBackend ?? base.backend,
    themePresetId:
      merged.themePresetId ?? useCase?.defaultThemePresetId ?? base.themePresetId,
  });
}

function analyzeGateDraftWithSidekick(
  draft: PackageConfigDraft,
  sidekickState?: GateSidekickState | null
): GateDraftAnalysis {
  const syncedSidekick = synchronizeGateSidekickState(
    draft,
    sidekickState ?? createGateSidekickState(draft)
  );

  return GateDraftAnalysisSchema.parse({
    ...analyzeGateDraft(draft),
    sidekick: syncedSidekick,
  });
}

function applyFounderReviewRequirement(
  analysis: GateDraftAnalysis,
  required: boolean
): GateDraftAnalysis {
  if (!required) {
    return analysis;
  }

  return GateDraftAnalysisSchema.parse({
    ...analysis,
    compatibility: {
      ...analysis.compatibility,
      requiresManualReview: true,
      checkoutMode: "request_review",
      findings: [
        ...analysis.compatibility.findings,
        {
          id: "founder-review-required",
          severity: "info",
          message:
            "This relationship-first collaborator requisition receives founder review before a payment link is issued.",
          resolution:
            "Keith reviews the collaboration brief and returns a firm scope and quote.",
        },
      ],
    },
  });
}

function hydrateDraft(input: PackageConfigDraftInput): PackageConfigDraft {
  const normalized = normalizeDraftInput(input);
  const createdAt = nowIso();

  return PackageConfigDraftSchema.parse({
    ...normalized,
    id: randomUUID(),
    status: "draft",
    priceSnapshotCents: 0,
    configHash: hashDraft(normalized),
    createdAt,
    updatedAt: createdAt,
  });
}

function applyDraftPatch(
  draft: PackageConfigDraft,
  patch: PackageConfigDraftPatch
): PackageConfigDraft {
  const normalized = normalizeDraftInput({
    ...draft,
    ...patch,
    deliverySurfaces: patch.deliverySurfaces ?? draft.deliverySurfaces,
    operatorPackSlugs: patch.operatorPackSlugs ?? draft.operatorPackSlugs,
    sourceBundleSlugs: patch.sourceBundleSlugs ?? draft.sourceBundleSlugs,
  });

  return PackageConfigDraftSchema.parse({
    ...draft,
    ...normalized,
    configHash: hashDraft(normalized),
    updatedAt: nowIso(),
  });
}

function resolveBuyerEmail(draft: PackageConfigDraft, email?: string): string {
  const value = email?.trim() || draft.buyerEmail?.trim() || "";
  if (!value) {
    throw new Error("A buyer email is required before checkout.");
  }

  return value;
}

function isValidBuyerEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function maskArtifactAccessKey(token: string): string | null {
  const normalized = token.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.length <= 8) {
    return normalized;
  }

  return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
}

function isArtifactAccessExpired(artifact: GateArtifact): boolean {
  return (
    !!artifact.signedUrlExpiresAt &&
    new Date(artifact.signedUrlExpiresAt).getTime() <= Date.now()
  );
}

async function persistDraftBuyerLink(
  draft: PackageConfigDraft
): Promise<string | null> {
  const email = draft.buyerEmail?.trim() || "";
  if (!email || !isValidBuyerEmail(email)) {
    return null;
  }

  const buyer = await upsertGateBuyer(email, draft.companyName);
  return buyer.id;
}

function ensureBuyer(
  buyers: GateBuyer[],
  email: string,
  companyName?: string
): GateBuyer {
  const existing = buyers.find(
    (buyer) => buyer.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    return GateBuyerSchema.parse({
      ...existing,
      companyName: companyName?.trim() || existing.companyName,
    });
  }

  return GateBuyerSchema.parse({
    id: randomUUID(),
    email,
    companyName: companyName?.trim() || undefined,
    createdAt: nowIso(),
  });
}

function createOrderFromAnalysis(
  analysis: GateDraftAnalysis,
  buyer: GateBuyer
): {
  order: GateOrder;
  items: GateOrderItem[];
} {
  const createdAt = nowIso();
  const orderId = randomUUID();

  const order = GateOrderSchema.parse({
    id: orderId,
    buyerId: buyer.id,
    packageDraftId: analysis.draft.id,
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: null,
    currency: analysis.quote.currency,
    subtotalCents: analysis.quote.subtotalCents,
    totalCents: analysis.quote.totalCents,
    paymentStatus:
      analysis.compatibility.checkoutMode === "request_review"
        ? "review_requested"
        : "awaiting_payment",
    orderStatus:
      analysis.compatibility.checkoutMode === "request_review"
        ? "review_requested"
        : "awaiting_payment",
    paidAt: null,
    createdAt,
    updatedAt: createdAt,
    configHash: analysis.draft.configHash,
  });

  const items = analysis.quote.breakdown.map((item) =>
    GateOrderItemSchema.parse({
      id: randomUUID(),
      orderId,
      itemType: item.kind,
      itemRef: item.code,
      label: item.label,
      quantity: item.quantity,
      unitPriceCents: Math.round(item.amountCents / item.quantity),
      metadata: {
        code: item.code,
      },
    })
  );

  return { order, items };
}

function createBuildJob(order: GateOrder): GateBuildJob {
  const buildVersion = 1;
  return GateBuildJobSchema.parse({
    id: randomUUID(),
    orderId: order.id,
    packageDraftId: order.packageDraftId,
    buildVersion,
    status: "queued",
    startedAt: null,
    finishedAt: null,
    errorCode: null,
    errorMessage: null,
    retryCount: 0,
    buildLog: [],
  });
}

function createSupportRequest(
  draft: PackageConfigDraft,
  order: GateOrder | null,
  summary: string,
  detail: string
): GateSupportRequest {
  return GateSupportRequestSchema.parse({
    id: randomUUID(),
    packageDraftId: draft.id,
    orderId: order?.id ?? null,
    requestType: "manual_review",
    summary,
    detail,
    status: "open",
    createdAt: nowIso(),
  });
}

function resolveOrderPaymentStatus(orderStatus: GateOrder["orderStatus"]): GateOrder["paymentStatus"] {
  if (orderStatus === "failed") {
    return "failed";
  }

  if (orderStatus === "review_requested") {
    return "review_requested";
  }

  if (orderStatus === "draft") {
    return "draft";
  }

  if (orderStatus === "awaiting_payment") {
    return "awaiting_payment";
  }

  return "paid";
}

function hydrateOrderForDetail(
  order: GateOrder,
  draft: PackageConfigDraft,
  analysis: GateDraftAnalysis
): GateOrder {
  const resolvedSubtotalCents =
    order.subtotalCents > 0 ? order.subtotalCents : analysis.quote.subtotalCents;
  const resolvedTotalCents =
    order.totalCents > 0 ? order.totalCents : analysis.quote.totalCents;

  return GateOrderSchema.parse({
    ...order,
    subtotalCents: resolvedSubtotalCents,
    totalCents: resolvedTotalCents,
    paymentStatus: resolveOrderPaymentStatus(order.orderStatus),
    configHash: order.configHash || draft.configHash,
  });
}

async function publicArtifact(artifact: GateArtifact, orderId: string) {
  return {
    id: artifact.id,
    buildJobId: artifact.buildJobId,
    artifactType: artifact.artifactType,
    storageBucket: artifact.storageBucket,
    storagePath: artifact.storagePath,
    signedUrlExpiresAt: artifact.signedUrlExpiresAt,
    checksumSha256: artifact.checksumSha256,
    byteSize: artifact.byteSize,
    createdAt: artifact.createdAt,
    accessKey: artifact.downloadToken?.trim() || null,
    accessKeyHint: maskArtifactAccessKey(artifact.downloadToken),
    downloadUrl: null,
  };
}

export async function createGateDraft(
  input: Partial<PackageConfigDraftInput> = {}
): Promise<GateDraftAnalysis> {
  const draft = hydrateDraft(normalizeDraftInput(input));
  const analysis = analyzeGateDraftWithSidekick(draft);

  if (hasGateSupabaseConfig()) {
    const buyerId = await persistDraftBuyerLink(analysis.draft);
    const saved = await insertGateDraft(analysis.draft, buyerId, analysis.sidekick);
    return analyzeGateDraftWithSidekick(saved, analysis.sidekick);
  }

  const state = await loadGateState();
  state.drafts.push(analysis.draft);
  state.sidekickByDraftId[analysis.draft.id] = analysis.sidekick;
  await saveGateState(state);

  return analysis;
}

export async function getGateDraft(id: string): Promise<GateDraftAnalysis> {
  if (hasGateSupabaseConfig()) {
    const record = await getGateDraftRecord(id);
    if (!record) {
      throw new Error("Draft not found.");
    }

    return analyzeGateDraftWithSidekick(record.draft, record.sidekickState);
  }

  const state = await loadGateState();
  const draft = state.drafts.find((entry) => entry.id === id);
  if (!draft) {
    throw new Error("Draft not found.");
  }

  return analyzeGateDraftWithSidekick(draft, state.sidekickByDraftId[id] ?? null);
}

export async function updateGateDraft(
  id: string,
  patch: PackageConfigDraftPatch
): Promise<GateDraftAnalysis> {
  const safePatch = PackageConfigDraftPatchSchema.parse(patch);

  if (hasGateSupabaseConfig()) {
    const record = await getGateDraftRecord(id);
    if (!record) {
      throw new Error("Draft not found.");
    }

    const nextDraft = applyDraftPatch(record.draft, safePatch);
    const analysis = analyzeGateDraftWithSidekick(nextDraft, record.sidekickState);
    const buyerId = await persistDraftBuyerLink(analysis.draft);
    const saved = await updateGateDraftRecord(
      analysis.draft,
      buyerId,
      analysis.sidekick
    );
    return analyzeGateDraftWithSidekick(saved, analysis.sidekick);
  }

  const state = await loadGateState();
  const index = state.drafts.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new Error("Draft not found.");
  }

  const nextDraft = applyDraftPatch(state.drafts[index], safePatch);
  const analysis = analyzeGateDraftWithSidekick(
    nextDraft,
    state.sidekickByDraftId[id] ?? null
  );
  state.drafts[index] = analysis.draft;
  state.sidekickByDraftId[id] = analysis.sidekick;
  await saveGateState(state);

  return analysis;
}

export async function validateGateDraft(id: string): Promise<GateDraftAnalysis> {
  return getGateDraft(id);
}

export async function sendGateSidekickMessage(
  draftId: string,
  payload: unknown
): Promise<GateDraftAnalysis> {
  const input = GateSidekickMessageRequestSchema.parse(payload);

  if (hasGateSupabaseConfig()) {
    const record = await getGateDraftRecord(draftId);
    if (!record) {
      throw new Error("Draft not found.");
    }

    const currentState = synchronizeGateSidekickState(
      record.draft,
      record.sidekickState
    );
    const reply = composeGateSidekickReply({
      draft: record.draft,
      state: currentState,
      userMessage: input.message,
    });
    const userTurn = GateSidekickTurnSchema.parse({
      id: randomUUID(),
      sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
      actor: "user",
      messageText: input.message,
      structuredState: currentState.turns.at(-1)?.structuredState ?? {
        buyerContext: record.draft.buyerContext,
        recommendations: {
          tier: record.draft.tier,
          operatorPackSlugs: record.draft.operatorPackSlugs,
          sourceBundleSlugs: record.draft.sourceBundleSlugs,
          deliverySurfaces: record.draft.deliverySurfaces,
          themePresetId: record.draft.themePresetId,
          assetIds: currentState.assetSelections
            .filter((asset) => asset.included)
            .map((asset) => asset.documentId),
          confidenceNotes: [],
        },
        pendingClarifications: [],
      },
      toolCalls: [],
      createdAt: nowIso(),
    });
    const assistantTurn = GateSidekickTurnSchema.parse({
      id: randomUUID(),
      sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
      actor: "sidekick",
      messageText: reply.messageText,
      structuredState: reply.structuredState,
      toolCalls: reply.toolCalls,
      createdAt: nowIso(),
    });
    const nextDraft = applyDraftPatch(record.draft, {
      buyerContext: reply.draft.buyerContext,
    });
    const nextState = GateSidekickStateSchema.parse({
      ...reply.nextState,
      session: reply.nextState.session
        ? {
            ...reply.nextState.session,
            summary: reply.messageText,
            updatedAt: assistantTurn.createdAt,
          }
        : null,
      turns: [...reply.nextState.turns, userTurn, assistantTurn],
    });
    const buyerId = await persistDraftBuyerLink(nextDraft);
    const savedDraft = await updateGateDraftRecord(nextDraft, buyerId, nextState);

    return analyzeGateDraftWithSidekick(savedDraft, nextState);
  }

  const state = await loadGateState();
  const draftIndex = state.drafts.findIndex((draft) => draft.id === draftId);
  if (draftIndex < 0) {
    throw new Error("Draft not found.");
  }

  const currentDraft = state.drafts[draftIndex]!;
  const currentState = synchronizeGateSidekickState(
    currentDraft,
    state.sidekickByDraftId[draftId] ?? null
  );
  const reply = composeGateSidekickReply({
    draft: currentDraft,
    state: currentState,
    userMessage: input.message,
  });
  const userTurn = GateSidekickTurnSchema.parse({
    id: randomUUID(),
    sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
    actor: "user",
    messageText: input.message,
    structuredState:
      currentState.turns.at(-1)?.structuredState ?? currentState.turns[0]?.structuredState,
    toolCalls: [],
    createdAt: nowIso(),
  });
  const assistantTurn = GateSidekickTurnSchema.parse({
    id: randomUUID(),
    sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
    actor: "sidekick",
    messageText: reply.messageText,
    structuredState: reply.structuredState,
    toolCalls: reply.toolCalls,
    createdAt: nowIso(),
  });
  const nextDraft = applyDraftPatch(currentDraft, {
    buyerContext: reply.draft.buyerContext,
  });
  const nextSidekick = GateSidekickStateSchema.parse({
    ...reply.nextState,
    session: reply.nextState.session
      ? {
          ...reply.nextState.session,
          summary: reply.messageText,
          updatedAt: assistantTurn.createdAt,
        }
      : null,
    turns: [...reply.nextState.turns, userTurn, assistantTurn],
  });

  state.drafts[draftIndex] = nextDraft;
  state.sidekickByDraftId[draftId] = nextSidekick;
  await saveGateState(state);

  return analyzeGateDraftWithSidekick(nextDraft, nextSidekick);
}

export async function applyGateSidekickAction(
  draftId: string,
  actionId: string
): Promise<GateDraftAnalysis> {
  if (hasGateSupabaseConfig()) {
    const record = await getGateDraftRecord(draftId);
    if (!record) {
      throw new Error("Draft not found.");
    }

    const currentState = synchronizeGateSidekickState(
      record.draft,
      record.sidekickState
    );
    const action = currentState.actions.find((entry) => entry.id === actionId);
    if (!action) {
      throw new Error("Sidekick action not found.");
    }

    const applied = applyGateSidekickActionToDraft(record.draft, action, currentState);
    const nextDraft = applyDraftPatch(
      record.draft,
      PackageConfigDraftPatchSchema.parse(applied.draft)
    );
    const systemTurn = GateSidekickTurnSchema.parse({
      id: randomUUID(),
      sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
      actor: "system",
      messageText: `Applied sidekick action: ${action.title}.`,
      structuredState:
        applied.state.turns.at(-1)?.structuredState ??
        currentState.turns.at(-1)?.structuredState,
      toolCalls: [
        {
          name: "apply_action",
          payload: {
            actionId: action.id,
            title: action.title,
          },
        },
      ],
      createdAt: nowIso(),
    });
    const nextState = GateSidekickStateSchema.parse({
      ...applied.state,
      session: applied.state.session
        ? {
            ...applied.state.session,
            summary: systemTurn.messageText,
            updatedAt: systemTurn.createdAt,
          }
        : null,
      turns: [...applied.state.turns, systemTurn],
      actions: applied.state.actions.map((entry) =>
        entry.id === action.id ? { ...entry, status: "applied" } : entry
      ),
    });
    const buyerId = await persistDraftBuyerLink(nextDraft);
    const savedDraft = await updateGateDraftRecord(nextDraft, buyerId, nextState);
    return analyzeGateDraftWithSidekick(savedDraft, nextState);
  }

  const state = await loadGateState();
  const draftIndex = state.drafts.findIndex((draft) => draft.id === draftId);
  if (draftIndex < 0) {
    throw new Error("Draft not found.");
  }

  const currentDraft = state.drafts[draftIndex]!;
  const currentState = synchronizeGateSidekickState(
    currentDraft,
    state.sidekickByDraftId[draftId] ?? null
  );
  const action = currentState.actions.find((entry) => entry.id === actionId);
  if (!action) {
    throw new Error("Sidekick action not found.");
  }

  const applied = applyGateSidekickActionToDraft(currentDraft, action, currentState);
  const nextDraft = applyDraftPatch(
    currentDraft,
    PackageConfigDraftPatchSchema.parse(applied.draft)
  );
  const systemTurn = GateSidekickTurnSchema.parse({
    id: randomUUID(),
    sessionId: currentState.session?.id ?? `gate-sidekick-${draftId}`,
    actor: "system",
    messageText: `Applied sidekick action: ${action.title}.`,
    structuredState:
      applied.state.turns.at(-1)?.structuredState ??
      currentState.turns.at(-1)?.structuredState,
    toolCalls: [
      {
        name: "apply_action",
        payload: {
          actionId: action.id,
          title: action.title,
        },
      },
    ],
    createdAt: nowIso(),
  });
  const nextSidekick = GateSidekickStateSchema.parse({
    ...applied.state,
    session: applied.state.session
      ? {
          ...applied.state.session,
          summary: systemTurn.messageText,
          updatedAt: systemTurn.createdAt,
        }
      : null,
    turns: [...applied.state.turns, systemTurn],
    actions: applied.state.actions.map((entry) =>
      entry.id === action.id ? { ...entry, status: "applied" } : entry
    ),
  });

  state.drafts[draftIndex] = nextDraft;
  state.sidekickByDraftId[draftId] = nextSidekick;
  await saveGateState(state);

  return analyzeGateDraftWithSidekick(nextDraft, nextSidekick);
}

export async function createGateOrderForCheckout(
  payload: unknown
): Promise<{
  analysis: GateDraftAnalysis;
  buyer: GateBuyer;
  order: GateOrder;
  accessToken: string;
  supportRequest: GateSupportRequest | null;
}> {
  const input = GateCheckoutRequestSchema.parse(payload);

  if (hasGateSupabaseConfig()) {
    const record = await getGateDraftRecord(input.draftId);
    if (!record) {
      throw new Error("Draft not found.");
    }

    const draft = PackageConfigDraftSchema.parse({
      ...record.draft,
      buyerEmail: input.buyerEmail?.trim() || record.draft.buyerEmail,
      companyName: input.companyName?.trim() || record.draft.companyName,
      updatedAt: nowIso(),
    });
    const analysis = analyzeGateDraftWithSidekick(draft, record.sidekickState);
    const email = resolveBuyerEmail(analysis.draft, input.buyerEmail);
    const buyer = await upsertGateBuyer(email, input.companyName);

    const nextDraft = PackageConfigDraftSchema.parse({
      ...analysis.draft,
      buyerEmail: email,
      companyName: input.companyName?.trim() || analysis.draft.companyName,
      status:
        analysis.compatibility.checkoutMode === "request_review"
          ? "review_requested"
          : "awaiting_payment",
      updatedAt: nowIso(),
    });

    const savedDraft = await updateGateDraftRecord(
      nextDraft,
      buyer.id,
      analysis.sidekick
    );
    const refreshedAnalysis = applyFounderReviewRequirement(
      analyzeGateDraftWithSidekick(savedDraft, analysis.sidekick),
      input.requestFounderReview
    );
    const { order, items } = createOrderFromAnalysis(refreshedAnalysis, buyer);
    const accessToken = randomBytes(32).toString("base64url");
    const accessTokenHash = hashGateAccessToken(accessToken);
    const savedOrder = await insertGateOrder(order, {
      buyerEmail: buyer.email,
      companyName: input.companyName?.trim() || savedDraft.companyName,
      productName: "GestaltView Bespoke Package",
      accessTokenHash,
    });
    await insertGateOrderItems(items);

    let supportRequest: GateSupportRequest | null = null;
    if (refreshedAnalysis.compatibility.checkoutMode === "request_review") {
      supportRequest = await insertGateSupportRequestRecord(
        createSupportRequest(
          savedDraft,
          savedOrder,
          "Package requires review before payment.",
          refreshedAnalysis.compatibility.findings
            .map(
              (finding) => `${finding.severity.toUpperCase()}: ${finding.message}`
            )
            .join("\n")
        )
      );
    }

    return {
      analysis: refreshedAnalysis,
      buyer,
      order: savedOrder,
      accessToken,
      supportRequest,
    };
  }

  const state = await loadGateState();
  const draftIndex = state.drafts.findIndex((draft) => draft.id === input.draftId);
  if (draftIndex < 0) {
    throw new Error("Draft not found.");
  }

  const draft = PackageConfigDraftSchema.parse({
    ...state.drafts[draftIndex],
    buyerEmail: input.buyerEmail?.trim() || state.drafts[draftIndex].buyerEmail,
    companyName: input.companyName?.trim() || state.drafts[draftIndex].companyName,
    updatedAt: nowIso(),
  });

  const analysis = analyzeGateDraft({
    ...draft,
    priceSnapshotCents: state.drafts[draftIndex].priceSnapshotCents,
  });

  const email = resolveBuyerEmail(analysis.draft, input.buyerEmail);
  const buyer = ensureBuyer(state.buyers, email, input.companyName);
  const buyerIndex = state.buyers.findIndex((entry) => entry.id === buyer.id);
  if (buyerIndex >= 0) {
    state.buyers[buyerIndex] = buyer;
  } else {
    state.buyers.push(buyer);
  }

  const nextDraft = PackageConfigDraftSchema.parse({
    ...analysis.draft,
    buyerEmail: email,
    companyName: input.companyName?.trim() || analysis.draft.companyName,
    status:
      analysis.compatibility.checkoutMode === "request_review"
        ? "review_requested"
        : "awaiting_payment",
    updatedAt: nowIso(),
  });

  state.drafts[draftIndex] = nextDraft;
  const refreshedAnalysis = applyFounderReviewRequirement(
    analyzeGateDraftWithSidekick(
      nextDraft,
      state.sidekickByDraftId[nextDraft.id] ?? null
    ),
    input.requestFounderReview
  );
  state.sidekickByDraftId[nextDraft.id] = refreshedAnalysis.sidekick;
  const { order, items } = createOrderFromAnalysis(refreshedAnalysis, buyer);
  const accessToken = randomBytes(32).toString("base64url");
  localGateOrderAccessHashes.set(order.id, hashGateAccessToken(accessToken));
  state.orders.push(order);
  state.orderItems.push(...items);

  let supportRequest: GateSupportRequest | null = null;
  if (refreshedAnalysis.compatibility.checkoutMode === "request_review") {
    supportRequest = createSupportRequest(
      nextDraft,
      order,
      "Package requires review before payment.",
      refreshedAnalysis.compatibility.findings
        .map((finding) => `${finding.severity.toUpperCase()}: ${finding.message}`)
        .join("\n")
    );
    state.supportRequests.push(supportRequest);
  }

  await saveGateState(state);

  return {
    analysis: refreshedAnalysis,
    buyer,
    order,
    accessToken,
    supportRequest,
  };
}

export async function approveGateOrderQuote(
  orderId: string,
  payload: unknown
): Promise<{ order: GateOrder; supportRequest: GateSupportRequest }> {
  const input = GateQuoteApprovalRequestSchema.parse(payload);

  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }
    if (
      order.orderStatus !== "review_requested" &&
      order.orderStatus !== "awaiting_payment"
    ) {
      throw new Error("Only reviewed orders can receive a firm quote.");
    }

    const draftRecord = await getGateDraftRecord(order.packageDraftId);
    if (!draftRecord) {
      throw new Error("Order draft not found.");
    }

    const savedOrder = await updateGateOrderRecord(
      GateOrderSchema.parse({
        ...order,
        stripeCheckoutSessionId: null,
        subtotalCents: input.totalCents,
        totalCents: input.totalCents,
        paymentStatus: "awaiting_payment",
        orderStatus: "awaiting_payment",
        updatedAt: nowIso(),
      })
    );
    const savedDraft = await updateGateDraftRecord(
      PackageConfigDraftSchema.parse({
        ...draftRecord.draft,
        priceSnapshotCents: input.totalCents,
        status: "awaiting_payment",
        updatedAt: nowIso(),
      }),
      order.buyerId,
      synchronizeGateSidekickState(
        {
          ...draftRecord.draft,
          priceSnapshotCents: input.totalCents,
          status: "awaiting_payment",
          updatedAt: nowIso(),
        },
        draftRecord.sidekickState
      )
    );
    const supportRequest = await insertGateSupportRequestRecord(
      createSupportRequest(
        savedDraft,
        savedOrder,
        "Firm scope and quote approved.",
        `${input.scopeSummary}\n\nPayment terms: ${input.paymentTerms}`
      )
    );

    return { order: savedOrder, supportRequest };
  }

  const state = await loadGateState();
  const orderIndex = state.orders.findIndex((entry) => entry.id === orderId);
  if (orderIndex < 0) {
    throw new Error("Order not found.");
  }
  const order = state.orders[orderIndex]!;
  if (
    order.orderStatus !== "review_requested" &&
    order.orderStatus !== "awaiting_payment"
  ) {
    throw new Error("Only reviewed orders can receive a firm quote.");
  }

  const draftIndex = state.drafts.findIndex(
    (entry) => entry.id === order.packageDraftId
  );
  if (draftIndex < 0) {
    throw new Error("Order draft not found.");
  }

  const savedOrder = GateOrderSchema.parse({
    ...order,
    stripeCheckoutSessionId: null,
    subtotalCents: input.totalCents,
    totalCents: input.totalCents,
    paymentStatus: "awaiting_payment",
    orderStatus: "awaiting_payment",
    updatedAt: nowIso(),
  });
  const savedDraft = PackageConfigDraftSchema.parse({
    ...state.drafts[draftIndex],
    priceSnapshotCents: input.totalCents,
    status: "awaiting_payment",
    updatedAt: nowIso(),
  });
  const supportRequest = createSupportRequest(
    savedDraft,
    savedOrder,
    "Firm scope and quote approved.",
    `${input.scopeSummary}\n\nPayment terms: ${input.paymentTerms}`
  );

  state.orders[orderIndex] = savedOrder;
  state.drafts[draftIndex] = savedDraft;
  state.sidekickByDraftId[savedDraft.id] = synchronizeGateSidekickState(
    savedDraft,
    state.sidekickByDraftId[savedDraft.id] ?? null
  );
  state.supportRequests.push(supportRequest);
  await saveGateState(state);

  return { order: savedOrder, supportRequest };
}

export async function attachStripeSessionToOrder(
  orderId: string,
  sessionId: string
): Promise<GateOrder> {
  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    return updateGateOrderRecord(
      GateOrderSchema.parse({
        ...order,
        stripeCheckoutSessionId: sessionId,
        updatedAt: nowIso(),
      })
    );
  }

  const state = await loadGateState();
  const index = state.orders.findIndex((order) => order.id === orderId);
  if (index < 0) {
    throw new Error("Order not found.");
  }

  const nextOrder = GateOrderSchema.parse({
    ...state.orders[index],
    stripeCheckoutSessionId: sessionId,
    updatedAt: nowIso(),
  });
  state.orders[index] = nextOrder;
  await saveGateState(state);

  return nextOrder;
}

export async function markGateOrderPaid(
  orderId: string,
  paymentIntentId?: string | null
): Promise<{ order: GateOrder; buildJob: GateBuildJob }> {
  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const existingBuilds = await listGateBuildJobs(orderId);
    const existingBuild = existingBuilds[0] ?? null;
    const nextOrder = await updateGateOrderRecord(
      GateOrderSchema.parse({
        ...order,
        stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId,
        paymentStatus: "paid",
        orderStatus: existingBuild ? order.orderStatus : "paid",
        paidAt: order.paidAt ?? nowIso(),
        updatedAt: nowIso(),
      })
    );

    const buildJob =
      existingBuild ??
      (await insertGateBuildJob(createBuildJob(nextOrder)));

    const draftRecord = await getGateDraftRecord(nextOrder.packageDraftId);
    if (draftRecord) {
      const nextSidekick = synchronizeGateSidekickState(
        {
          ...draftRecord.draft,
          status: "paid",
          updatedAt: nowIso(),
        },
        draftRecord.sidekickState
      );
      await updateGateDraftRecord(
        PackageConfigDraftSchema.parse({
          ...draftRecord.draft,
          status: "paid",
          updatedAt: nowIso(),
        }),
        nextOrder.buyerId,
        nextSidekick
      );
    }

    return { order: nextOrder, buildJob };
  }

  const state = await loadGateState();
  const orderIndex = state.orders.findIndex((order) => order.id === orderId);
  if (orderIndex < 0) {
    throw new Error("Order not found.");
  }

  const existingBuild = state.buildJobs.find((job) => job.orderId === orderId);
  const nextOrder = GateOrderSchema.parse({
    ...state.orders[orderIndex],
    stripePaymentIntentId: paymentIntentId ?? state.orders[orderIndex].stripePaymentIntentId,
    paymentStatus: "paid",
    orderStatus: existingBuild ? state.orders[orderIndex].orderStatus : "paid",
    paidAt: state.orders[orderIndex].paidAt ?? nowIso(),
    updatedAt: nowIso(),
  });
  state.orders[orderIndex] = nextOrder;

  const buildJob = existingBuild ?? createBuildJob(nextOrder);
  if (!existingBuild) {
    state.buildJobs.push(buildJob);
  }

  const draftIndex = state.drafts.findIndex(
    (draft) => draft.id === nextOrder.packageDraftId
  );
  if (draftIndex >= 0) {
    state.drafts[draftIndex] = PackageConfigDraftSchema.parse({
      ...state.drafts[draftIndex],
      status: "paid",
      updatedAt: nowIso(),
    });
    state.sidekickByDraftId[nextOrder.packageDraftId] = synchronizeGateSidekickState(
      state.drafts[draftIndex],
      state.sidekickByDraftId[nextOrder.packageDraftId] ?? null
    );
  }

  await saveGateState(state);

  return { order: nextOrder, buildJob };
}

export async function runGateBuildJob(buildJobId: string): Promise<GateBuildJob> {
  if (hasGateSupabaseConfig()) {
    const buildJob = await getGateBuildJobRecord(buildJobId);
    if (!buildJob) {
      throw new Error("Build job not found.");
    }

    const order = await getGateOrderRecord(buildJob.orderId);
    const draftRecord = await getGateDraftRecord(buildJob.packageDraftId);
    if (!order || !draftRecord) {
      throw new Error("Build job is missing its order or draft.");
    }

    const buyer = await getGateBuyerById(order.buyerId);
    const analysis = analyzeGateDraftWithSidekick(
      draftRecord.draft,
      draftRecord.sidekickState
    );

    const runningJob = await updateGateBuildJobRecord(
      GateBuildJobSchema.parse({
        ...buildJob,
        status: "running",
        startedAt: buildJob.startedAt ?? nowIso(),
        errorCode: null,
        errorMessage: null,
      })
    );

    const provisioningOrder = await updateGateOrderRecord(
      GateOrderSchema.parse({
        ...order,
        orderStatus: "provisioning",
        updatedAt: nowIso(),
      })
    );
    const provisioningDraft = await updateGateDraftRecord(
      PackageConfigDraftSchema.parse({
        ...draftRecord.draft,
        status: "provisioning",
        updatedAt: nowIso(),
      }),
      order.buyerId,
      synchronizeGateSidekickState(
        {
          ...draftRecord.draft,
          status: "provisioning",
          updatedAt: nowIso(),
        },
        draftRecord.sidekickState
      )
    );

    try {
      const { artifact, buildLog, manifest } = await composeGatePackageArtifact({
        buyer,
        draft: provisioningDraft,
        order: provisioningOrder,
        buildJob: runningJob,
        compatibility: analysis.compatibility,
        quote: analysis.quote,
        sidekick: analysis.sidekick,
      });

      await upsertGateArtifact(artifact);
      const deliveredJob = await updateGateBuildJobRecord(
        GateBuildJobSchema.parse({
          ...runningJob,
          status: "delivered",
          finishedAt: nowIso(),
          buildLog,
        })
      );
      await updateGateOrderRecord(
        GateOrderSchema.parse({
          ...provisioningOrder,
          orderStatus: "delivered",
          updatedAt: nowIso(),
        })
      );
      await updateGateDraftRecord(
        PackageConfigDraftSchema.parse({
          ...provisioningDraft,
          status: "delivered",
          updatedAt: nowIso(),
        }),
        provisioningOrder.buyerId,
        GateSidekickStateSchema.parse({
          ...synchronizeGateSidekickState(
            {
              ...provisioningDraft,
              status: "delivered",
              updatedAt: nowIso(),
            },
            draftRecord.sidekickState
          ),
          manifestHistory: [
            ...analysis.sidekick.manifestHistory,
            manifest,
          ],
        })
      );

      return deliveredJob;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Package build failed.";
      const failedJob = await updateGateBuildJobRecord(
        GateBuildJobSchema.parse({
          ...runningJob,
          status: "failed",
          finishedAt: nowIso(),
          errorCode: "build_failed",
          errorMessage: message,
          buildLog: [
            ...runningJob.buildLog,
            {
              at: nowIso(),
              step: "build",
              status: "failed",
              detail: message,
            },
          ],
        })
      );
      await updateGateOrderRecord(
        GateOrderSchema.parse({
          ...provisioningOrder,
          orderStatus: "failed",
          updatedAt: nowIso(),
        })
      );
      await updateGateDraftRecord(
        PackageConfigDraftSchema.parse({
          ...provisioningDraft,
          status: "failed",
          updatedAt: nowIso(),
        }),
        provisioningOrder.buyerId,
        synchronizeGateSidekickState(
          {
            ...provisioningDraft,
            status: "failed",
            updatedAt: nowIso(),
          },
          draftRecord.sidekickState
        )
      );

      return failedJob;
    }
  }

  const state = await loadGateState();
  const buildIndex = state.buildJobs.findIndex((job) => job.id === buildJobId);
  if (buildIndex < 0) {
    throw new Error("Build job not found.");
  }

  const buildJob = state.buildJobs[buildIndex];
  const order = state.orders.find((entry) => entry.id === buildJob.orderId);
  const draft = state.drafts.find((entry) => entry.id === buildJob.packageDraftId);
  if (!order || !draft) {
    throw new Error("Build job is missing its order or draft.");
  }

  const buyer = state.buyers.find((entry) => entry.id === order.buyerId) ?? null;
  const analysis = analyzeGateDraftWithSidekick(
    draft,
    state.sidekickByDraftId[draft.id] ?? null
  );

  const runningJob = GateBuildJobSchema.parse({
    ...buildJob,
    status: "running",
    startedAt: buildJob.startedAt ?? nowIso(),
    errorCode: null,
    errorMessage: null,
  });
  state.buildJobs[buildIndex] = runningJob;

  const orderIndex = state.orders.findIndex((entry) => entry.id === order.id);
  state.orders[orderIndex] = GateOrderSchema.parse({
    ...order,
    orderStatus: "provisioning",
    updatedAt: nowIso(),
  });

  const draftIndex = state.drafts.findIndex((entry) => entry.id === draft.id);
  state.drafts[draftIndex] = PackageConfigDraftSchema.parse({
    ...draft,
    status: "provisioning",
    updatedAt: nowIso(),
  });
  state.sidekickByDraftId[draft.id] = synchronizeGateSidekickState(
    state.drafts[draftIndex],
    state.sidekickByDraftId[draft.id] ?? null
  );

  await saveGateState(state);

  try {
    const { artifact, buildLog, manifest } = await composeGatePackageArtifact({
      buyer,
      draft,
      order: state.orders[orderIndex],
      buildJob: runningJob,
      compatibility: analysis.compatibility,
      quote: analysis.quote,
      sidekick: analysis.sidekick,
    });

    const finalState = await loadGateState();
    const finalBuildIndex = finalState.buildJobs.findIndex((job) => job.id === buildJobId);
    const finalOrderIndex = finalState.orders.findIndex((entry) => entry.id === order.id);
    const finalDraftIndex = finalState.drafts.findIndex((entry) => entry.id === draft.id);
    const existingArtifactIndex = finalState.artifacts.findIndex(
      (entry) => entry.buildJobId === buildJobId
    );

    if (existingArtifactIndex >= 0) {
      finalState.artifacts[existingArtifactIndex] = GateArtifactSchema.parse(artifact);
    } else {
      finalState.artifacts.push(GateArtifactSchema.parse(artifact));
    }

    finalState.buildJobs[finalBuildIndex] = GateBuildJobSchema.parse({
      ...finalState.buildJobs[finalBuildIndex],
      status: "delivered",
      finishedAt: nowIso(),
      buildLog,
    });
    finalState.orders[finalOrderIndex] = GateOrderSchema.parse({
      ...finalState.orders[finalOrderIndex],
      orderStatus: "delivered",
      updatedAt: nowIso(),
    });
    finalState.drafts[finalDraftIndex] = PackageConfigDraftSchema.parse({
      ...finalState.drafts[finalDraftIndex],
      status: "delivered",
      updatedAt: nowIso(),
    });
    finalState.sidekickByDraftId[draft.id] = GateSidekickStateSchema.parse({
      ...synchronizeGateSidekickState(
        finalState.drafts[finalDraftIndex],
        finalState.sidekickByDraftId[draft.id] ?? null
      ),
      manifestHistory: [
        ...(finalState.sidekickByDraftId[draft.id]?.manifestHistory ?? []),
        manifest,
      ],
    });

    await saveGateState(finalState);
    return finalState.buildJobs[finalBuildIndex];
  } catch (error) {
    const failedState = await loadGateState();
    const failedBuildIndex = failedState.buildJobs.findIndex((job) => job.id === buildJobId);
    const failedOrderIndex = failedState.orders.findIndex((entry) => entry.id === order.id);
    const failedDraftIndex = failedState.drafts.findIndex((entry) => entry.id === draft.id);
    const message =
      error instanceof Error ? error.message : "Package build failed.";

    failedState.buildJobs[failedBuildIndex] = GateBuildJobSchema.parse({
      ...failedState.buildJobs[failedBuildIndex],
      status: "failed",
      finishedAt: nowIso(),
      errorCode: "build_failed",
      errorMessage: message,
      buildLog: [
        ...failedState.buildJobs[failedBuildIndex].buildLog,
        {
          at: nowIso(),
          step: "build",
          status: "failed",
          detail: message,
        },
      ],
    });
    failedState.orders[failedOrderIndex] = GateOrderSchema.parse({
      ...failedState.orders[failedOrderIndex],
      orderStatus: "failed",
      updatedAt: nowIso(),
    });
    failedState.drafts[failedDraftIndex] = PackageConfigDraftSchema.parse({
      ...failedState.drafts[failedDraftIndex],
      status: "failed",
      updatedAt: nowIso(),
    });
    failedState.sidekickByDraftId[draft.id] = synchronizeGateSidekickState(
      failedState.drafts[failedDraftIndex],
      failedState.sidekickByDraftId[draft.id] ?? null
    );
    await saveGateState(failedState);
    return failedState.buildJobs[failedBuildIndex];
  }
}

export async function regenerateGateBuildForOrder(orderId: string): Promise<GateBuildJob> {
  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const builds = await listGateBuildJobs(orderId);
    const nextBuild = GateBuildJobSchema.parse({
      id: randomUUID(),
      orderId: order.id,
      packageDraftId: order.packageDraftId,
      buildVersion: Math.max(0, ...builds.map((job) => job.buildVersion)) + 1,
      status: "queued",
      startedAt: null,
      finishedAt: null,
      errorCode: null,
      errorMessage: null,
      retryCount: 0,
      buildLog: [],
    });

    const savedBuild = await insertGateBuildJob(nextBuild);
    await updateGateOrderRecord(
      GateOrderSchema.parse({
        ...order,
        orderStatus: "paid",
        updatedAt: nowIso(),
      })
    );

    return runGateBuildJob(savedBuild.id);
  }

  const state = await loadGateState();
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const versions = state.buildJobs
    .filter((job) => job.orderId === orderId)
    .map((job) => job.buildVersion);
  const nextBuild = GateBuildJobSchema.parse({
    id: randomUUID(),
    orderId: order.id,
    packageDraftId: order.packageDraftId,
    buildVersion: Math.max(0, ...versions) + 1,
    status: "queued",
    startedAt: null,
    finishedAt: null,
    errorCode: null,
    errorMessage: null,
    retryCount: 0,
    buildLog: [],
  });

  state.buildJobs.push(nextBuild);
  state.orders = state.orders.map((entry) =>
    entry.id === order.id
      ? GateOrderSchema.parse({
          ...entry,
          orderStatus: "paid",
          updatedAt: nowIso(),
        })
      : entry
  );
  await saveGateState(state);

  return runGateBuildJob(nextBuild.id);
}

export async function regenerateGateBuildJob(buildJobId: string): Promise<GateBuildJob> {
  if (hasGateSupabaseConfig()) {
    const buildJob = await getGateBuildJobRecord(buildJobId);
    if (!buildJob) {
      throw new Error("Build job not found.");
    }

    return regenerateGateBuildForOrder(buildJob.orderId);
  }

  const state = await loadGateState();
  const buildJob = state.buildJobs.find((job) => job.id === buildJobId);
  if (!buildJob) {
    throw new Error("Build job not found.");
  }

  return regenerateGateBuildForOrder(buildJob.orderId);
}

export async function getGateOrderDetail(
  orderId: string,
  accessToken: string
): Promise<GateOrderDetail> {
  await assertGateOrderAccess(orderId, accessToken);

  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }
    const draftRecord = await getGateDraftRecord(order.packageDraftId);
    if (!draftRecord) {
      throw new Error("Order draft not found.");
    }

    const analysis = analyzeGateDraft(draftRecord.draft);
    const buyer = await getGateBuyerById(order.buyerId);
    const items = await listGateOrderItems(order.id);
    const buildJobs = await listGateBuildJobs(order.id);
    const artifacts = await Promise.all(
      (
        await listGateArtifacts(buildJobs.map((job) => job.id))
      ).map((artifact) => publicArtifact(artifact, order.id))
    );
    const supportRequests = await listGateSupportRequests(order.id, draftRecord.draft.id);
    const hydratedOrder = hydrateOrderForDetail(
      order,
      draftRecord.draft,
      analysis
    );

    return GateOrderDetailSchema.parse({
      order: hydratedOrder,
      buyer,
      draft: draftRecord.draft,
      compatibility: analysis.compatibility,
      quote: analysis.quote,
      recommendations: analysis.recommendations,
      deliverables: analysis.deliverables,
      items,
      buildJobs,
      artifacts,
      supportRequests,
    });
  }

  const state = await loadGateState();
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }
  const draft = state.drafts.find((entry) => entry.id === order.packageDraftId);
  if (!draft) {
    throw new Error("Order draft not found.");
  }

  const analysis = analyzeGateDraft(draft);
  const buyer = state.buyers.find((entry) => entry.id === order.buyerId) ?? null;
  const items = state.orderItems.filter((item) => item.orderId === order.id);
  const buildJobs = state.buildJobs.filter((job) => job.orderId === order.id);
  const artifacts = await Promise.all(
    state.artifacts
      .filter((artifact) => buildJobs.some((job) => job.id === artifact.buildJobId))
      .map((artifact) => publicArtifact(artifact, order.id))
  );
  const supportRequests = state.supportRequests.filter(
    (request) => request.orderId === order.id || request.packageDraftId === draft.id
  );
  const hydratedOrder = hydrateOrderForDetail(order, draft, analysis);

  return GateOrderDetailSchema.parse({
    order: hydratedOrder,
    buyer,
    draft,
    compatibility: analysis.compatibility,
    quote: analysis.quote,
    recommendations: analysis.recommendations,
    deliverables: analysis.deliverables,
    items,
    buildJobs,
    artifacts,
    supportRequests,
  });
}

export async function redeemGateArtifactAccess(
  orderId: string,
  payload: unknown
): Promise<GateRedeemAccessResponse> {
  const input = GateRedeemAccessRequestSchema.parse(payload);
  const requestedKey = input.key.trim();

  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const buildJobs = await listGateBuildJobs(orderId);
    const artifacts = await listGateArtifacts(buildJobs.map((job) => job.id));
    const artifact = artifacts.find(
      (entry) => entry.downloadToken === requestedKey
    );
    if (!artifact) {
      throw new Error("Access key is invalid.");
    }
    if (isArtifactAccessExpired(artifact)) {
      throw new Error("Access key has expired.");
    }

    if (artifact.storageBucket !== GATE_LOCAL_STORAGE_BUCKET) {
      const signed = await createGateArtifactSignedUrl(
        artifact.storageBucket,
        artifact.storagePath
      );

      return {
        artifactId: artifact.id,
        artifactType: artifact.artifactType,
        downloadUrl: signed.signedUrl,
        expiresAt: signed.expiresAt,
      };
    }

    return {
      artifactId: artifact.id,
      artifactType: artifact.artifactType,
      downloadUrl: `/api/gate/orders/${orderId}/download?token=${encodeURIComponent(
        artifact.downloadToken
      )}`,
      expiresAt: artifact.signedUrlExpiresAt,
    };
  }

  const state = await loadGateState();
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const buildIds = state.buildJobs
    .filter((job) => job.orderId === orderId)
    .map((job) => job.id);
  const artifact = state.artifacts.find(
    (entry) =>
      buildIds.includes(entry.buildJobId) &&
      entry.downloadToken === requestedKey
  );
  if (!artifact) {
    throw new Error("Access key is invalid.");
  }
  if (isArtifactAccessExpired(artifact)) {
    throw new Error("Access key has expired.");
  }

  return {
    artifactId: artifact.id,
    artifactType: artifact.artifactType,
    downloadUrl: `/api/gate/orders/${orderId}/download?token=${encodeURIComponent(
      artifact.downloadToken
    )}`,
    expiresAt: artifact.signedUrlExpiresAt,
  };
}

export async function resolveGateDownload(
  orderId: string,
  token: string
): Promise<{ artifact: GateArtifact; file: Buffer }> {
  const requestedToken = token.trim();

  if (hasGateSupabaseConfig()) {
    const order = await getGateOrderRecord(orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const buildJobs = await listGateBuildJobs(orderId);
    const artifacts = await listGateArtifacts(buildJobs.map((job) => job.id));
    const artifact = artifacts.find(
      (entry) => entry.downloadToken === requestedToken
    );
    if (!artifact) {
      throw new Error("Download token is invalid.");
    }
    if (isArtifactAccessExpired(artifact)) {
      throw new Error("Download link has expired.");
    }

    const file =
      artifact.storageBucket !== GATE_LOCAL_STORAGE_BUCKET
        ? await downloadGateArtifactFromStorage(
            artifact.storageBucket,
            artifact.storagePath
          )
        : await fs.readFile(artifact.localPath);

    return { artifact, file };
  }

  const state = await loadGateState();
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const buildIds = state.buildJobs
    .filter((job) => job.orderId === orderId)
    .map((job) => job.id);
  const artifact = state.artifacts.find(
    (entry) =>
      buildIds.includes(entry.buildJobId) &&
      entry.downloadToken === requestedToken
  );
  if (!artifact) {
    throw new Error("Download token is invalid.");
  }
  if (isArtifactAccessExpired(artifact)) {
    throw new Error("Download link has expired.");
  }

  const buffer = await fs.readFile(artifact.localPath);
  return { artifact, file: buffer };
}

export async function createGateSupportRequest(input: {
  draftId?: string | null;
  orderId?: string | null;
  requestType: string;
  summary: string;
  detail?: string | null;
}): Promise<GateSupportRequest> {
  if (hasGateSupabaseConfig()) {
    return insertGateSupportRequestRecord(
      GateSupportRequestSchema.parse({
        id: randomUUID(),
        packageDraftId: input.draftId ?? null,
        orderId: input.orderId ?? null,
        requestType: input.requestType,
        summary: input.summary,
        detail: input.detail ?? null,
        status: "open",
        createdAt: nowIso(),
      })
    );
  }

  const state = await loadGateState();
  const supportRequest = GateSupportRequestSchema.parse({
    id: randomUUID(),
    packageDraftId: input.draftId ?? null,
    orderId: input.orderId ?? null,
    requestType: input.requestType,
    summary: input.summary,
    detail: input.detail ?? null,
    status: "open",
    createdAt: nowIso(),
  });
  state.supportRequests.push(supportRequest);
  await saveGateState(state);
  return supportRequest;
}

export async function listGateArtifactsForCleanup(): Promise<string[]> {
  const dir = gateArtifactsDir();
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}
