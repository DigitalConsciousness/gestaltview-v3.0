export type RenderProjectionReceipt = {
  ok: boolean;
  projectedIds: string[];
  skipped: Array<{ artifactId: string; reason: string }>;
  targetRoom?: string;
  idempotent?: boolean;
  error?: {
    code: string;
    message: string;
  };
};

export async function projectRenderToInnerWorld(input: {
  renderJobId: string;
  title?: string;
  summary?: string;
}): Promise<RenderProjectionReceipt> {
  const response = await fetch("/api/render/promote-to-gallery", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      renderJobId: input.renderJobId,
      targetRoom: "dynamic_inner_world",
      title: input.title,
      summary: input.summary,
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | RenderProjectionReceipt
    | null;
  if (!payload) {
    throw new Error(`Projection endpoint returned an unreadable ${response.status} response.`);
  }
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error?.message ?? `Projection failed with ${response.status}.`);
  }
  return payload;
}
