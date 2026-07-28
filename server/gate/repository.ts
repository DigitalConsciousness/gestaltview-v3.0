import type {
  GateArtifact,
  GateBuildJob,
  GateBuyer,
  GateOrder,
  GateOrderItem,
  GateSidekickState,
  GateSupportRequest,
  PackageConfigDraft,
} from "../../shared/gate/schemas.js";
import {
  DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
  GateArtifactSchema,
  GateBuildJobSchema,
  GateBuyerSchema,
  GateOrderItemSchema,
  GateOrderSchema,
  GateSidekickStateSchema,
  GateSupportRequestSchema,
  PackageConfigDraftSchema,
} from "../../shared/gate/schemas.js";
import {
  getGateSignedUrlTtlSeconds,
  getGateStorageBucket,
  getGateSupabaseAdmin,
} from "./supabase.js";
import { GATE_TABLES } from "./constants.js";

function asErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: string }).message || fallback);
  }

  return fallback;
}

async function requireData<T>(
  promise: Promise<{ data: T | null; error?: unknown | null }>,
  fallback: string
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw new Error(asErrorMessage(error, fallback));
  }
  if (data === null) {
    throw new Error(fallback);
  }

  return data;
}

function mapBuyerRow(row: Record<string, unknown>): GateBuyer {
  return GateBuyerSchema.parse({
    id: row.id,
    email: row.email,
    companyName: row.company_name ?? undefined,
    createdAt: row.created_at,
  });
}

function mapDraftRow(row: Record<string, unknown>): PackageConfigDraft {
  return PackageConfigDraftSchema.parse({
    id: row.id,
    buyerEmail:
      typeof row.buyer_email === "string" && row.buyer_email.trim()
        ? row.buyer_email
        : undefined,
    companyName:
      typeof row.company_name === "string" && row.company_name.trim()
        ? row.company_name
        : undefined,
    embodimentProfileSlug:
      typeof row.embodiment_profile_slug === "string" &&
      row.embodiment_profile_slug.trim()
        ? row.embodiment_profile_slug
        : "billy",
    buyerContext: row.buyer_context ?? {
      preferredChannels: [],
      requestedOutcomes: [],
    },
    useCaseSlug: row.use_case_slug,
    tier: row.tier,
    seatsRequested: row.seats_requested,
    backend: row.backend,
    deliverySurfaces: row.delivery_surfaces,
    operatorPackSlugs: row.operator_pack_slugs,
    sourceBundleSlugs: row.source_bundle_slugs,
    themePresetId: row.theme_preset_id,
    brandColor: row.brand_color ?? undefined,
    logoAssetPath: row.logo_asset_path ?? undefined,
    customNotes: row.custom_notes ?? undefined,
    wantsNativeInstaller: row.wants_native_installer,
    priceSnapshotCents: row.price_snapshot_cents,
    configHash: row.config_hash,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function draftPayload(
  draft: PackageConfigDraft,
  buyerId?: string | null,
  sidekickState?: GateSidekickState | null
): Record<string, unknown> {
  return {
    id: draft.id,
    buyer_id: buyerId ?? null,
    buyer_email: draft.buyerEmail?.trim() || null,
    company_name: draft.companyName?.trim() || null,
    embodiment_profile_slug:
      draft.embodimentProfileSlug || DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
    buyer_context: draft.buyerContext ?? {
      preferredChannels: [],
      requestedOutcomes: [],
    },
    sidekick_state:
      sidekickState ??
      GateSidekickStateSchema.parse({
        session: null,
        turns: [],
        actions: [],
        assetSelections: [],
        transformations: [],
        manifestHistory: [],
      }),
    use_case_slug: draft.useCaseSlug,
    tier: draft.tier,
    seats_requested: draft.seatsRequested,
    backend: draft.backend,
    delivery_surfaces: draft.deliverySurfaces,
    operator_pack_slugs: draft.operatorPackSlugs,
    source_bundle_slugs: draft.sourceBundleSlugs,
    theme_preset_id: draft.themePresetId,
    brand_color: draft.brandColor ?? null,
    logo_asset_path: draft.logoAssetPath ?? null,
    custom_notes: draft.customNotes ?? null,
    wants_native_installer: draft.wantsNativeInstaller,
    price_snapshot_cents: draft.priceSnapshotCents,
    config_hash: draft.configHash,
    status: draft.status,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
  };
}

function mapOrderRow(row: Record<string, unknown>): GateOrder {
  const rawOrderStatus =
    typeof row.order_status === "string" && row.order_status.trim()
      ? row.order_status.trim()
      : "draft";
  const orderStatus =
    rawOrderStatus === "pending"
      ? "awaiting_payment"
      : rawOrderStatus === "draft" ||
          rawOrderStatus === "awaiting_payment" ||
          rawOrderStatus === "paid" ||
          rawOrderStatus === "provisioning" ||
          rawOrderStatus === "packaged" ||
          rawOrderStatus === "delivered" ||
          rawOrderStatus === "failed" ||
          rawOrderStatus === "review_requested"
        ? rawOrderStatus
        : "draft";
  const paymentStatus =
    typeof row.payment_status === "string" && row.payment_status.trim()
      ? row.payment_status.trim()
      : orderStatus === "failed"
        ? "failed"
        : orderStatus === "review_requested"
          ? "review_requested"
          : orderStatus === "draft"
            ? "draft"
            : orderStatus === "awaiting_payment"
              ? "awaiting_payment"
              : "paid";

  return GateOrderSchema.parse({
    id: row.id,
    buyerId: row.buyer_id,
    packageDraftId: row.package_draft_id,
    stripeCheckoutSessionId:
      typeof row.stripe_checkout_session_id === "string"
        ? row.stripe_checkout_session_id
        : null,
    stripePaymentIntentId:
      typeof row.stripe_payment_intent_id === "string"
        ? row.stripe_payment_intent_id
        : null,
    currency:
      typeof row.currency === "string" && row.currency.trim()
        ? row.currency
        : "usd",
    subtotalCents:
      typeof row.subtotal_cents === "number" ? row.subtotal_cents : 0,
    totalCents: typeof row.total_cents === "number" ? row.total_cents : 0,
    paymentStatus,
    orderStatus,
    paidAt:
      typeof row.paid_at === "string" && row.paid_at.trim()
        ? row.paid_at
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    configHash:
      typeof row.config_hash === "string" && row.config_hash.trim()
        ? row.config_hash
        : "",
  });
}

function orderPayload(order: GateOrder): Record<string, unknown> {
  return {
    stripe_checkout_session_id: order.stripeCheckoutSessionId,
    stripe_payment_intent_id: order.stripePaymentIntentId,
    currency: order.currency,
    subtotal_cents: order.subtotalCents,
    total_cents: order.totalCents,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    paid_at: order.paidAt,
    config_hash: order.configHash,
    updated_at: order.updatedAt,
    buyer_id: order.buyerId,
    package_draft_id: order.packageDraftId,
  };
}

function orderInsertPayload(
  order: GateOrder,
  input: {
    buyerEmail: string;
    companyName?: string;
    productName?: string;
    accessTokenHash: string;
  }
): Record<string, unknown> {
  return {
    id: order.id,
    customer_email: input.buyerEmail,
    customer_name: input.companyName?.trim() || null,
    product_name: input.productName?.trim() || "GestaltView Bespoke Package",
    access_token_hash: input.accessTokenHash,
    stripe_checkout_session_id: order.stripeCheckoutSessionId,
    stripe_payment_intent_id: order.stripePaymentIntentId,
    currency: order.currency,
    subtotal_cents: order.subtotalCents,
    total_cents: order.totalCents,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    paid_at: order.paidAt,
    config_hash: order.configHash,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    buyer_id: order.buyerId,
    package_draft_id: order.packageDraftId,
  };
}

function mapOrderItemRow(row: Record<string, unknown>): GateOrderItem {
  return GateOrderItemSchema.parse({
    id: row.id,
    orderId: row.order_id,
    itemType: row.item_type,
    itemRef: row.item_ref ?? null,
    label: row.label,
    quantity: row.quantity,
    unitPriceCents: row.unit_price_cents,
    metadata: row.metadata ?? {},
  });
}

function orderItemPayload(item: GateOrderItem): Record<string, unknown> {
  return {
    id: item.id,
    order_id: item.orderId,
    item_type: item.itemType,
    item_ref: item.itemRef,
    label: item.label,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    metadata: item.metadata ?? {},
  };
}

function mapBuildJobRow(row: Record<string, unknown>): GateBuildJob {
  return GateBuildJobSchema.parse({
    id: row.id,
    orderId: row.order_id,
    packageDraftId: row.package_draft_id,
    buildVersion: row.build_version,
    status: row.status,
    startedAt: row.started_at ?? null,
    finishedAt: row.finished_at ?? null,
    errorCode: row.error_code ?? null,
    errorMessage: row.error_message ?? null,
    retryCount: row.retry_count,
    buildLog: row.build_log ?? [],
  });
}

function buildJobPayload(job: GateBuildJob): Record<string, unknown> {
  return {
    id: job.id,
    order_id: job.orderId,
    package_draft_id: job.packageDraftId,
    build_version: job.buildVersion,
    status: job.status,
    started_at: job.startedAt,
    finished_at: job.finishedAt,
    error_code: job.errorCode,
    error_message: job.errorMessage,
    retry_count: job.retryCount,
    build_log: job.buildLog,
  };
}

function mapArtifactRow(row: Record<string, unknown>): GateArtifact {
  return GateArtifactSchema.parse({
    id: row.id,
    buildJobId: row.build_job_id,
    artifactType: row.artifact_type,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    localPath: "",
    signedUrlExpiresAt: row.signed_url_expires_at ?? null,
    checksumSha256: row.checksum_sha256 ?? null,
    byteSize: row.byte_size ?? null,
    createdAt: row.created_at,
    downloadToken:
      typeof row.download_token === "string" ? row.download_token : "",
  });
}

function artifactPayload(artifact: GateArtifact): Record<string, unknown> {
  return {
    id: artifact.id,
    build_job_id: artifact.buildJobId,
    artifact_type: artifact.artifactType,
    storage_bucket: artifact.storageBucket,
    storage_path: artifact.storagePath,
    signed_url_expires_at: artifact.signedUrlExpiresAt,
    checksum_sha256: artifact.checksumSha256,
    byte_size: artifact.byteSize,
    created_at: artifact.createdAt,
    download_token: artifact.downloadToken,
  };
}

function mapSupportRequestRow(row: Record<string, unknown>): GateSupportRequest {
  return GateSupportRequestSchema.parse({
    id: row.id,
    packageDraftId: row.package_draft_id ?? null,
    orderId: row.order_id ?? null,
    requestType: row.request_type,
    summary: row.summary,
    detail: row.detail ?? null,
    status: row.status,
    createdAt: row.created_at,
  });
}

function supportRequestPayload(
  request: GateSupportRequest
): Record<string, unknown> {
  return {
    id: request.id,
    package_draft_id: request.packageDraftId,
    order_id: request.orderId,
    request_type: request.requestType,
    summary: request.summary,
    detail: request.detail,
    status: request.status,
    created_at: request.createdAt,
  };
}

export async function upsertGateBuyer(
  email: string,
  companyName?: string
): Promise<GateBuyer> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.buyers)
      .upsert(
        {
          email,
          company_name: companyName?.trim() || null,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single(),
    "Failed to upsert buyer."
  );

  return mapBuyerRow(row as Record<string, unknown>);
}

export async function getGateBuyerById(id: string): Promise<GateBuyer | null> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.buyers)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load buyer."));
  }
  return data ? mapBuyerRow(data as Record<string, unknown>) : null;
}

export async function insertGateDraft(
  draft: PackageConfigDraft,
  buyerId?: string | null,
  sidekickState?: GateSidekickState | null
): Promise<PackageConfigDraft> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.drafts)
      .insert(draftPayload(draft, buyerId, sidekickState))
      .select("*")
      .single(),
    "Failed to create draft."
  );
  return mapDraftRow(row as Record<string, unknown>);
}

export async function updateGateDraftRecord(
  draft: PackageConfigDraft,
  buyerId?: string | null,
  sidekickState?: GateSidekickState | null
): Promise<PackageConfigDraft> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.drafts)
      .update(draftPayload(draft, buyerId, sidekickState))
      .eq("id", draft.id)
      .select("*")
      .single(),
    "Failed to update draft."
  );
  return mapDraftRow(row as Record<string, unknown>);
}

export async function getGateDraftRecord(
  id: string
): Promise<{
  draft: PackageConfigDraft;
  buyerId: string | null;
  sidekickState: GateSidekickState;
} | null> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.drafts)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load draft."));
  }
  if (!data) {
    return null;
  }
  const row = data as Record<string, unknown>;
  return {
    draft: mapDraftRow(row),
    buyerId:
      typeof row.buyer_id === "string" && row.buyer_id.trim()
        ? row.buyer_id
        : null,
    sidekickState: GateSidekickStateSchema.parse(row.sidekick_state ?? {}),
  };
}

export async function insertGateOrder(
  order: GateOrder,
  input: {
    buyerEmail: string;
    companyName?: string;
    productName?: string;
    accessTokenHash: string;
  }
): Promise<GateOrder> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.orders)
      .insert(orderInsertPayload(order, input))
      .select("*")
      .single(),
    "Failed to create order."
  );
  return mapOrderRow(row as Record<string, unknown>);
}

export async function updateGateOrderRecord(order: GateOrder): Promise<GateOrder> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.orders)
      .update(orderPayload(order))
      .eq("id", order.id)
      .select("*")
      .single(),
    "Failed to update order."
  );
  return mapOrderRow(row as Record<string, unknown>);
}

export async function getGateOrderRecord(id: string): Promise<GateOrder | null> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.orders)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load order."));
  }
  return data ? mapOrderRow(data as Record<string, unknown>) : null;
}

export async function getGateOrderAccessTokenHash(id: string): Promise<string | null> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.orders)
    .select("access_token_hash")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to read order access state."));
  }

  return typeof data?.access_token_hash === "string"
    ? data.access_token_hash
    : null;
}

export async function insertGateOrderItems(items: GateOrderItem[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const supabase = getGateSupabaseAdmin();
  const { error } = await supabase
    .from(GATE_TABLES.orderItems)
    .insert(items.map(orderItemPayload));
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to create order items."));
  }
}

export async function listGateOrderItems(orderId: string): Promise<GateOrderItem[]> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.orderItems)
    .select("*")
    .eq("order_id", orderId)
    .order("label", { ascending: true });
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load order items."));
  }
  return (data ?? []).map((row: unknown) =>
    mapOrderItemRow(row as Record<string, unknown>)
  );
}

export async function insertGateBuildJob(job: GateBuildJob): Promise<GateBuildJob> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.buildJobs)
      .insert(buildJobPayload(job))
      .select("*")
      .single(),
    "Failed to create build job."
  );
  return mapBuildJobRow(row as Record<string, unknown>);
}

export async function updateGateBuildJobRecord(
  job: GateBuildJob
): Promise<GateBuildJob> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.buildJobs)
      .update(buildJobPayload(job))
      .eq("id", job.id)
      .select("*")
      .single(),
    "Failed to update build job."
  );
  return mapBuildJobRow(row as Record<string, unknown>);
}

export async function getGateBuildJobRecord(
  id: string
): Promise<GateBuildJob | null> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.buildJobs)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load build job."));
  }
  return data ? mapBuildJobRow(data as Record<string, unknown>) : null;
}

export async function listGateBuildJobs(orderId: string): Promise<GateBuildJob[]> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.buildJobs)
    .select("*")
    .eq("order_id", orderId)
    .order("build_version", { ascending: true });
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load build jobs."));
  }
  return (data ?? []).map((row: unknown) =>
    mapBuildJobRow(row as Record<string, unknown>)
  );
}

export async function upsertGateArtifact(
  artifact: GateArtifact
): Promise<GateArtifact> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.artifacts)
      .upsert(artifactPayload(artifact))
      .select("*")
      .single(),
    "Failed to save artifact."
  );
  return mapArtifactRow(row as Record<string, unknown>);
}

export async function listGateArtifacts(
  buildJobIds: string[]
): Promise<GateArtifact[]> {
  if (buildJobIds.length === 0) {
    return [];
  }

  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.artifacts)
    .select("*")
    .in("build_job_id", buildJobIds)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load artifacts."));
  }
  return (data ?? []).map((row: unknown) =>
    mapArtifactRow(row as Record<string, unknown>)
  );
}

export async function insertGateSupportRequestRecord(
  request: GateSupportRequest
): Promise<GateSupportRequest> {
  const supabase = getGateSupabaseAdmin();
  const row = await requireData(
    supabase
      .from(GATE_TABLES.supportRequests)
      .insert(supportRequestPayload(request))
      .select("*")
      .single(),
    "Failed to create support request."
  );
  return mapSupportRequestRow(row as Record<string, unknown>);
}

export async function listGateSupportRequests(
  orderId: string,
  draftId: string
): Promise<GateSupportRequest[]> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase
    .from(GATE_TABLES.supportRequests)
    .select("*")
    .or(`order_id.eq.${orderId},package_draft_id.eq.${draftId}`)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(asErrorMessage(error, "Failed to load support requests."));
  }
  return (data ?? []).map((row: unknown) =>
    mapSupportRequestRow(row as Record<string, unknown>)
  );
}

export async function uploadGateArtifactToStorage(
  storagePath: string,
  file: Buffer
): Promise<string> {
  const supabase = getGateSupabaseAdmin();
  const bucket = getGateStorageBucket();
  const { error: ensureError } = await supabase.storage.createBucket(bucket, {
    public: false,
    allowedMimeTypes: ["application/zip"],
  });

  if (ensureError) {
    const message = asErrorMessage(
      ensureError,
      `Failed to ensure Supabase Storage bucket "${bucket}".`
    );

    if (!/(already exists|duplicate|conflict)/i.test(message)) {
      throw new Error(message);
    }
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: "application/zip",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(
      `Failed to upload package artifact to Supabase Storage bucket "${bucket}": ${asErrorMessage(
        error,
        "upload failed"
      )}`
    );
  }

  return bucket;
}

export async function createGateArtifactSignedUrl(
  bucket: string,
  storagePath: string
): Promise<{ signedUrl: string; expiresAt: string }> {
  const supabase = getGateSupabaseAdmin();
  const ttlSeconds = getGateSignedUrlTtlSeconds();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(
      asErrorMessage(error, "Failed to create artifact signed URL.")
    );
  }

  return {
    signedUrl: data.signedUrl,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };
}

export async function downloadGateArtifactFromStorage(
  bucket: string,
  storagePath: string
): Promise<Buffer> {
  const supabase = getGateSupabaseAdmin();
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error || !data) {
    throw new Error(asErrorMessage(error, "Failed to download artifact."));
  }

  return Buffer.from(await data.arrayBuffer());
}
