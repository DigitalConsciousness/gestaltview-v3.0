import { createClient } from "@supabase/supabase-js";

import type { CommerceRepository, ShopifyCommerceTopic, VerifiedOrder } from "./commerce.js";

type OfferRow = { id: string; manifest_version: string; runtime_provisioning_key: string | null; activation_scope: Record<string, unknown>; review_status: string };

function requiredEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`missing_${names[0]?.toLowerCase()}`);
}

type CommerceDatabaseClient = any;

export function getCommerceSupabaseAdmin(): CommerceDatabaseClient {
  return createClient(
    requiredEnv("SUPABASE_URL", "VITE_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export class SupabaseCommerceRepository implements CommerceRepository {
  constructor(private readonly database: CommerceDatabaseClient = getCommerceSupabaseAdmin()) {}

  async claimEvent(event: { eventId: string; shopDomain: string; topic: ShopifyCommerceTopic; payloadHash: string }): Promise<"claimed" | "duplicate"> {
    const { error } = await this.database.from("commerce_event_log").insert({
      external_event_id: event.eventId,
      shop_domain: event.shopDomain,
      topic: event.topic,
      payload_sha256: event.payloadHash,
      status: "processing",
    });
    if (error?.code === "23505") {
      const { data: existing, error: lookupError } = await this.database.from("commerce_event_log")
        .select("status,attempt_count").eq("external_event_id", event.eventId).eq("shop_domain", event.shopDomain).single();
      if (lookupError || !existing) throw new Error(`event_replay_lookup_failed:${lookupError?.code || "missing_row"}`);
      if (existing.status !== "failed") return "duplicate";
      const { data: retried, error: retryError } = await this.database.from("commerce_event_log").update({
        status: "processing",
        attempt_count: Number(existing.attempt_count || 1) + 1,
        error_code: null,
        error_detail: null,
        payload_sha256: event.payloadHash,
        updated_at: new Date().toISOString(),
      }).eq("external_event_id", event.eventId).eq("shop_domain", event.shopDomain).eq("status", "failed").select("id").maybeSingle();
      if (retryError) throw new Error(`event_replay_claim_failed:${retryError.code || "unknown"}`);
      if (!retried) return "duplicate";
      return "claimed";
    }
    if (error) throw new Error(`event_claim_failed:${error.code || "unknown"}`);
    return "claimed";
  }

  async processPaidOrder(order: VerifiedOrder): Promise<void> {
    const { data: existingOrder, error: existingOrderError } = await this.database.from("commerce_orders")
      .select("status").eq("shop_domain", order.shopDomain).eq("external_order_id", order.externalOrderId).maybeSingle();
    if (existingOrderError) throw new Error(`order_lookup_failed:${existingOrderError.code || "unknown"}`);
    const preservedStatus = ["cancelled", "refunded", "partially_refunded", "disputed"].includes(existingOrder?.status)
      ? existingOrder.status
      : "verified_paid";
    const { data: commerceOrder, error: orderError } = await this.database.from("commerce_orders").upsert({
      shop_domain: order.shopDomain,
      external_order_id: order.externalOrderId,
      order_name: order.orderName,
      buyer_email_hash: order.buyerEmailHash,
      currency: order.currency,
      total_amount: order.totalAmount,
      financial_status: order.financialStatus,
      status: preservedStatus,
      paid_at: order.paidAt,
      raw_summary: order.summary,
      updated_at: new Date().toISOString(),
    }, { onConflict: "shop_domain,external_order_id" }).select("id").single();
    if (orderError || !commerceOrder) throw new Error(`order_upsert_failed:${orderError?.code || "missing_row"}`);

    for (const claim of order.claims) {
      const { data: offerData, error: offerError } = await this.database.from("storefront_offers")
        .select("id,manifest_version,runtime_provisioning_key,activation_scope,review_status")
        .eq("handle", claim.offerHandle).maybeSingle();
      if (offerError) throw new Error(`offer_lookup_failed:${offerError.code || "unknown"}`);
      const offer = offerData as OfferRow | null;
      const approved = offer?.review_status === "approved" && offer.manifest_version === claim.manifestVersion;
      const terminal = preservedStatus === "cancelled" || preservedStatus === "refunded" || preservedStatus === "disputed";
      const partial = preservedStatus === "partially_refunded";
      const status = terminal ? "revoked" : partial ? "partial" : approved ? "pending_consent" : "blocked";
      const statusDetail = terminal
        ? "The order reached a terminal cancellation, refund, or dispute state. Activation remains revoked."
        : partial
          ? "A refund was reported. Activation remains under review until the remaining paid scope is verified."
          : approved
        ? "Payment verified. Activation waits for the buyer to confirm consent and source-material boundaries."
        : offer
          ? "Payment verified, but the purchased manifest version is not approved for activation."
          : "Payment verified, but this offer is not registered in the runtime activation manifest.";
      const { data: request, error: requestError } = await this.database.from("activation_requests").upsert({
        commerce_order_id: commerceOrder.id,
        offer_id: offer?.id ?? null,
        offer_handle: claim.offerHandle,
        manifest_version: claim.manifestVersion,
        claim_token_hash: claim.tokenHash,
        runtime_provisioning_key: approved ? offer?.runtime_provisioning_key ?? null : null,
        activation_scope: approved ? offer?.activation_scope ?? {} : {},
        status,
        status_detail: statusDetail,
        updated_at: new Date().toISOString(),
      }, { onConflict: "commerce_order_id,offer_handle,claim_token_hash" }).select("id").single();
      if (requestError || !request) throw new Error(`activation_upsert_failed:${requestError?.code || "missing_row"}`);
      const { error: receiptError } = await this.database.from("activation_receipts").upsert({
        activation_request_id: request.id,
        claim_token_hash: claim.tokenHash,
        state: terminal ? "revoked" : partial ? "partial" : approved ? "ready" : "blocked",
        headline: terminal ? "Activation remains revoked following the Shopify order state." : partial ? "A refund was reported; activation is under review." : approved ? "Payment verified. Activation is ready for your decision." : "Payment verified. Activation is waiting at a manifest boundary.",
        detail: statusDetail,
        known_facts: ["Shopify reported this order as paid", `Offer: ${claim.offerHandle}`, `Manifest: ${claim.manifestVersion}`],
        unknowns: terminal ? [] : partial ? ["The remaining paid scope that may still be eligible"] : approved ? ["Whether you want to connect this purchase to GestaltView continuity"] : ["Whether this offer/version should be activated"],
        input_preserved: false,
        next_action_label: !terminal && !partial && approved ? "Review activation and consent" : "Contact GestaltView support",
        next_action_path: !terminal && !partial && approved ? "/auth/consent" : "/contact",
        updated_at: new Date().toISOString(),
      }, { onConflict: "activation_request_id" });
      if (receiptError) throw new Error(`receipt_upsert_failed:${receiptError.code || "unknown"}`);
    }
  }

  async processOrderCancelled(input: { shopDomain: string; externalOrderId: string; cancelledAt: string | null }): Promise<void> {
    await this.transitionOrder(input.shopDomain, input.externalOrderId, "cancelled", "revoked", input.cancelledAt);
  }

  async processRefund(input: { shopDomain: string; externalOrderId: string; fullyRefunded: boolean }): Promise<void> {
    await this.transitionOrder(input.shopDomain, input.externalOrderId, input.fullyRefunded ? "refunded" : "partially_refunded", input.fullyRefunded ? "revoked" : "partial", null);
  }

  private async transitionOrder(shopDomain: string, externalOrderId: string, orderStatus: string, receiptState: string, cancelledAt: string | null): Promise<void> {
    const { data: order, error } = await this.database.from("commerce_orders").upsert({
      shop_domain: shopDomain,
      external_order_id: externalOrderId,
      status: orderStatus,
      cancelled_at: cancelledAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: "shop_domain,external_order_id" }).select("id").single();
    if (error) throw new Error(`order_transition_failed:${error.code || "unknown"}`);
    const { data: requests, error: requestsError } = await this.database.from("activation_requests")
      .update({ status: receiptState === "revoked" ? "revoked" : "partial", status_detail: receiptState === "revoked" ? "The Shopify order was cancelled or fully refunded. Activation has been revoked." : "Shopify reported a refund. Access remains under review until the remaining order state is verified.", revoked_at: receiptState === "revoked" ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
      .eq("commerce_order_id", order.id).select("id");
    if (requestsError) throw new Error(`activation_transition_failed:${requestsError.code || "unknown"}`);
    const ids = (requests ?? []).map((request: { id: string }) => request.id);
    if (!ids.length) return;
    const { error: receiptError } = await this.database.from("activation_receipts").update({
      state: receiptState,
      headline: receiptState === "revoked" ? "Activation revoked following the Shopify order state." : "A refund was reported; activation is under review.",
      detail: receiptState === "revoked" ? "No new runtime access will be provisioned from this order." : "The order is not being treated as fully active or fully revoked until its remaining paid scope is verified.",
      next_action_label: "Contact GestaltView support",
      next_action_path: "/contact",
      updated_at: new Date().toISOString(),
    }).in("activation_request_id", ids);
    if (receiptError) throw new Error(`receipt_transition_failed:${receiptError.code || "unknown"}`);
  }

  async finishEvent(eventId: string, shopDomain: string, status: "processed" | "ignored"): Promise<void> {
    const { error } = await this.database.from("commerce_event_log").update({ status, processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("external_event_id", eventId).eq("shop_domain", shopDomain);
    if (error) throw new Error(`event_finish_failed:${error.code || "unknown"}`);
  }

  async failEvent(eventId: string, shopDomain: string, code: string, detail: string): Promise<void> {
    await this.database.from("commerce_event_log").update({ status: "failed", error_code: code, error_detail: detail.slice(0, 500), updated_at: new Date().toISOString() }).eq("external_event_id", eventId).eq("shop_domain", shopDomain);
  }
}

export async function findActivationReceipt(tokenHash: string, database: CommerceDatabaseClient = getCommerceSupabaseAdmin()) {
  const { data, error } = await database.from("activation_receipts")
    .select("public_receipt_id,state,headline,detail,known_facts,unknowns,input_preserved,next_action_label,next_action_path,created_at,updated_at")
    .eq("claim_token_hash", tokenHash).maybeSingle();
  if (error) throw new Error(`receipt_lookup_failed:${error.code || "unknown"}`);
  return data;
}
