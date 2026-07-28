import { createHash } from "node:crypto";

import type {
  CreateRuntimeHandoff,
  RuntimeHandoff,
  RuntimeHandoffState,
} from "../../shared/handoffs/contracts.js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

export function ensureRuntimeHandoffPersistence(): void {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Runtime handoff persistence is not configured.");
  }
}

export async function runtimeHandoffRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  ensureRuntimeHandoffPersistence();
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, stableValue(nested)]),
    );
  }
  return value;
}

export function runtimeHandoffMaterialFingerprint(
  input: CreateRuntimeHandoff,
): string {
  const material = {
    contractVersion: input.contractVersion,
    source: input.source,
    destination: input.destination,
    payload: input.payload,
    selectedEmbodiments: [...input.selectedEmbodiments].sort(),
    intent: input.intent,
    consentScope: [...input.provenance.consentScope].sort(),
  };
  return createHash("sha256")
    .update(JSON.stringify(stableValue(material)))
    .digest("hex");
}

export interface RuntimeHandoffRow {
  handoff_id: string;
  contract_version: "gestaltview.runtime-handoff.v1";
  owner_id: string;
  source_room: RuntimeHandoff["source"]["room"];
  source_entity_type: string;
  source_entity_id: string;
  source_revision?: string | null;
  source_ref: string;
  destination_room: RuntimeHandoff["destination"]["room"];
  requested_action: string;
  payload: RuntimeHandoff["payload"];
  selected_embodiments: string[];
  intent: RuntimeHandoff["intent"];
  state: RuntimeHandoffState;
  idempotency_key: string;
  material_fingerprint: string;
  provenance: Omit<RuntimeHandoff["provenance"], "createdAt" | "updatedAt">;
  receipt: RuntimeHandoff["receipt"];
  created_at: string;
  updated_at: string;
}

export const RUNTIME_HANDOFF_SELECT = [
  "handoff_id",
  "contract_version",
  "owner_id",
  "source_room",
  "source_entity_type",
  "source_entity_id",
  "source_revision",
  "source_ref",
  "destination_room",
  "requested_action",
  "payload",
  "selected_embodiments",
  "intent",
  "state",
  "idempotency_key",
  "material_fingerprint",
  "provenance",
  "receipt",
  "created_at",
  "updated_at",
].join(",");

export function rowToRuntimeHandoff(row: RuntimeHandoffRow): RuntimeHandoff {
  return {
    contractVersion: row.contract_version,
    handoffId: row.handoff_id,
    ownerId: row.owner_id,
    source: {
      room: row.source_room,
      entityType: row.source_entity_type,
      entityId: row.source_entity_id,
      ...(row.source_revision ? { revision: row.source_revision } : {}),
      immutableRef: row.source_ref,
    },
    destination: {
      room: row.destination_room,
      requestedAction: row.requested_action,
    },
    payload: row.payload,
    selectedEmbodiments: row.selected_embodiments,
    intent: row.intent,
    state: row.state,
    idempotencyKey: row.idempotency_key,
    provenance: {
      ...row.provenance,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    receipt: row.receipt,
  };
}

export function createRuntimeHandoffRow(
  ownerId: string,
  input: CreateRuntimeHandoff,
  fingerprint: string,
): Record<string, unknown> {
  return {
    contract_version: input.contractVersion,
    owner_id: ownerId,
    source_room: input.source.room,
    source_entity_type: input.source.entityType,
    source_entity_id: input.source.entityId,
    source_revision: input.source.revision ?? null,
    source_ref: input.source.immutableRef,
    destination_room: input.destination.room,
    requested_action: input.destination.requestedAction,
    payload: input.payload,
    selected_embodiments: input.selectedEmbodiments,
    intent: input.intent,
    state: "prepared",
    idempotency_key: input.idempotencyKey,
    material_fingerprint: fingerprint,
    provenance: input.provenance,
    receipt: null,
  };
}
