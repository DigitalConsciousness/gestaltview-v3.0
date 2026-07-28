import {
  createRuntimeHandoffSchema,
  runtimeHandoffSchema,
  transitionRuntimeHandoffSchema,
  type CreateRuntimeHandoff,
  type RuntimeHandoff,
  type TransitionRuntimeHandoff,
} from "@shared/handoffs/contracts";

async function readHandoffResponse(
  response: Response,
): Promise<RuntimeHandoff> {
  const body = (await response.json()) as {
    handoff?: unknown;
    error?: { message?: string };
  };
  if (!response.ok || !body.handoff) {
    throw new Error(
      body.error?.message ??
        `Runtime handoff request failed (${response.status}).`,
    );
  }
  return runtimeHandoffSchema.parse(body.handoff);
}

export async function prepareRuntimeHandoff(
  input: CreateRuntimeHandoff,
): Promise<RuntimeHandoff> {
  const body = createRuntimeHandoffSchema.parse(input);
  return readHandoffResponse(
    await fetch("/api/runtime-handoffs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function getRuntimeHandoff(
  handoffId: string,
): Promise<RuntimeHandoff> {
  return readHandoffResponse(
    await fetch(`/api/runtime-handoffs/${encodeURIComponent(handoffId)}`, {
      credentials: "include",
    }),
  );
}

export async function transitionRuntimeHandoff(
  handoffId: string,
  input: TransitionRuntimeHandoff,
): Promise<RuntimeHandoff> {
  const body = transitionRuntimeHandoffSchema.parse(input);
  return readHandoffResponse(
    await fetch(`/api/runtime-handoffs/${encodeURIComponent(handoffId)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function deleteRuntimeHandoff(handoffId: string): Promise<void> {
  const response = await fetch(
    `/api/runtime-handoffs/${encodeURIComponent(handoffId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error(`Runtime handoff deletion failed (${response.status}).`);
  }
}
