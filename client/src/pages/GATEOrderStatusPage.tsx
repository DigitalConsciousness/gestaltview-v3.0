import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";

import { useSEO } from "@/hooks/useSEO";
import {
  fetchGateOrder,
  redeemGateArtifactAccess,
  regenerateGateBuild,
} from "@/lib/gateApi";
import { cn } from "@/lib/utils";
import type { GateOrderDetail } from "@shared/gate/schemas";

function statusClass(status: GateOrderDetail["order"]["orderStatus"]) {
  if (status === "delivered") {
    return "border-[rgba(110,231,183,0.35)] bg-[rgba(110,231,183,0.08)] text-[rgba(214,255,233,0.96)]";
  }
  if (status === "failed" || status === "review_requested") {
    return "border-[rgba(247,178,103,0.35)] bg-[rgba(247,178,103,0.08)] text-[rgba(255,237,199,0.96)]";
  }
  return "border-[rgba(18,214,255,0.26)] bg-[rgba(18,214,255,0.08)] text-[rgba(214,250,255,0.96)]";
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function isTerminal(status: GateOrderDetail["order"]["orderStatus"]): boolean {
  return status === "delivered" || status === "failed" || status === "review_requested";
}

export default function GATEOrderStatusPage() {
  const [match, params] = useRoute<{ id: string }>("/agent-trainer/orders/:id");
  const orderId = params?.id ?? "";
  const accessToken =
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("access")?.trim() ?? "";
  const [orderDetail, setOrderDetail] = useState<GateOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessKeyInputs, setAccessKeyInputs] = useState<Record<string, string>>({});
  const [accessKeyErrors, setAccessKeyErrors] = useState<Record<string, string | null>>({});
  const [redeemingArtifactId, setRedeemingArtifactId] = useState<string | null>(null);
  const [redeemedDownloads, setRedeemedDownloads] = useState<
    Record<string, { downloadUrl: string; expiresAt: string | null }>
  >({});

  useSEO({
    title: "GATE Order Status",
    description:
      "Track package provisioning, download delivered artifacts, and inspect tailored package details.",
    h1: "Package order status.",
    canonical: match
      ? `https://gestaltview-di-gsvw.vercel.app/agent-trainer/orders/${params.id}`
      : undefined,
  });

  useEffect(() => {
    if (!match) return;

    let cancelled = false;

    async function loadOrder(poll = false) {
      try {
        if (poll) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const order = await fetchGateOrder(orderId, accessToken);
        if (!cancelled) {
          setOrderDetail(order);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load order."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadOrder();
    const interval = window.setInterval(() => {
      if (orderDetail && isTerminal(orderDetail.order.orderStatus)) {
        return;
      }
      void loadOrder(true);
    }, 3500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [accessToken, match, orderId, orderDetail?.order.orderStatus]);

  const latestBuildJob = orderDetail?.buildJobs
    .slice()
    .sort((left, right) => right.buildVersion - left.buildVersion)[0];

  async function handleRegenerate() {
    if (!latestBuildJob) return;
    setRefreshing(true);
    setError(null);

    try {
      await regenerateGateBuild(latestBuildJob.id);
      const order = await fetchGateOrder(orderId, accessToken);
      setOrderDetail(order);
    } catch (regenerateError) {
      setError(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Unable to regenerate package."
      );
    } finally {
      setRefreshing(false);
    }
  }

  function setAccessKeyInput(artifactId: string, value: string) {
    setAccessKeyInputs((current) => ({
      ...current,
      [artifactId]: value,
    }));
    setAccessKeyErrors((current) => ({
      ...current,
      [artifactId]: null,
    }));
  }

  async function handleRedeemArtifact(artifactId: string) {
    const key = accessKeyInputs[artifactId]?.trim() || "";
    if (!key) {
      setAccessKeyErrors((current) => ({
        ...current,
        [artifactId]: "Enter the issued access key to unlock this download.",
      }));
      return;
    }

    setRedeemingArtifactId(artifactId);
    setAccessKeyErrors((current) => ({
      ...current,
      [artifactId]: null,
    }));

    try {
      const redemption = await redeemGateArtifactAccess(orderId, { key });
      setRedeemedDownloads((current) => ({
        ...current,
        [redemption.artifactId]: {
          downloadUrl: redemption.downloadUrl,
          expiresAt: redemption.expiresAt,
        },
      }));
    } catch (redeemError) {
      setAccessKeyErrors((current) => ({
        ...current,
        [artifactId]:
          redeemError instanceof Error
            ? redeemError.message
            : "Unable to validate the access key.",
      }));
    } finally {
      setRedeemingArtifactId(null);
    }
  }

  if (!match) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(18,214,255,0.08),transparent_30%),#04070d] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/agent-trainer/package-builder"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:text-white"
          >
            Back to Builder
          </Link>
          {refreshing ? (
            <div className="rounded-full border border-[rgba(18,214,255,0.26)] bg-[rgba(18,214,255,0.08)] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--gv-electric-cyan)]">
              Refreshing…
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-6 text-sm text-slate-300">
            Loading order…
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-[rgba(255,92,138,0.35)] bg-[rgba(255,92,138,0.08)] px-6 py-6 text-sm text-[rgba(255,220,228,0.96)]">
            {error}
          </div>
        ) : orderDetail ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[36px] border border-white/10 bg-[rgba(6,10,16,0.82)] p-6 backdrop-blur-xl sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
                      Order Status
                    </p>
                    <h1 className="font-display text-4xl font-bold uppercase tracking-[0.05em] text-white">
                      {orderDetail.draft.companyName || "Bespoke package"}
                    </h1>
                    <p className="max-w-3xl text-sm leading-7 text-slate-300">
                      {orderDetail.draft.useCaseSlug.replace(/-/g, " ")} ·{" "}
                      {orderDetail.draft.backend} ·{" "}
                      {orderDetail.draft.deliverySurfaces.join(", ")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em]",
                      statusClass(orderDetail.order.orderStatus)
                    )}
                  >
                    {orderDetail.order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Order ID
                    </p>
                    <p className="mt-2 break-all text-sm text-white">{orderDetail.order.id}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Price
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {formatCurrency(orderDetail.order.totalCents)}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Payment
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {orderDetail.order.paymentStatus.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                    Deliverables
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {orderDetail.deliverables.map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-[36px] border border-white/10 bg-[rgba(6,10,16,0.82)] p-6 backdrop-blur-xl sm:p-8">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                  Downloads
                </p>
                {orderDetail.artifacts.length > 0 ? (
                  orderDetail.artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="rounded-[24px] border border-[rgba(110,231,183,0.22)] bg-[rgba(110,231,183,0.06)] px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {artifact.storagePath.split("/").pop()}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {artifact.byteSize
                          ? `${Math.max(1, Math.round(artifact.byteSize / 1024))} KB`
                          : "ZIP artifact"}
                      </p>
                      {artifact.accessKey ? (
                        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-3 py-3">
                          <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
                            Issued Access Key
                          </p>
                          <p className="mt-2 break-all font-mono text-sm text-white">
                            {artifact.accessKey}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            Save this key. It is required before the package download unlocks.
                          </p>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-slate-400">
                          Access key will appear after packaging completes.
                        </p>
                      )}

                      <div className="mt-4 space-y-3">
                        <label className="block space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
                            Enter Access Key
                          </span>
                          <input
                            type="text"
                            value={accessKeyInputs[artifact.id] ?? ""}
                            onChange={(event) =>
                              setAccessKeyInput(artifact.id, event.target.value)
                            }
                            placeholder={artifact.accessKeyHint ?? "Paste access key"}
                            className="w-full rounded-[16px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
                          />
                        </label>
                        {artifact.accessKey ? (
                          <button
                            type="button"
                            onClick={() => setAccessKeyInput(artifact.id, artifact.accessKey ?? "")}
                            className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--gv-electric-cyan)] transition hover:text-white"
                          >
                            Use Issued Key
                          </button>
                        ) : null}
                      </div>
                      {accessKeyErrors[artifact.id] ? (
                        <p className="mt-3 text-xs text-[rgba(255,220,228,0.96)]">
                          {accessKeyErrors[artifact.id]}
                        </p>
                      ) : null}
                      {redeemedDownloads[artifact.id]?.downloadUrl ? (
                        <div className="mt-4 space-y-2">
                          <a
                            href={redeemedDownloads[artifact.id]!.downloadUrl}
                            className="inline-flex rounded-full bg-[linear-gradient(90deg,var(--gv-neon-magenta),#ff74c6)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(255,60,172,0.22)]"
                          >
                            Download ZIP
                          </a>
                          {redeemedDownloads[artifact.id]!.expiresAt ? (
                            <p className="text-xs text-slate-400">
                              Link expires at {redeemedDownloads[artifact.id]!.expiresAt}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-slate-400">
                          Validate the issued key to generate a download link.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleRedeemArtifact(artifact.id)}
                        disabled={redeemingArtifactId === artifact.id}
                        className="mt-4 inline-flex rounded-full border border-[rgba(18,214,255,0.26)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gv-electric-cyan)] transition hover:bg-[rgba(18,214,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {redeemingArtifactId === artifact.id ? "Validating…" : "Validate Key"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                    No artifacts yet. The package is still moving through provisioning.
                  </div>
                )}

                {latestBuildJob &&
                (latestBuildJob.status === "failed" ||
                  orderDetail.order.orderStatus === "failed") ? (
                  <button
                    type="button"
                    onClick={() => void handleRegenerate()}
                    disabled={refreshing}
                    className="rounded-full border border-[rgba(18,214,255,0.26)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gv-electric-cyan)] transition hover:bg-[rgba(18,214,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refreshing ? "Regenerating…" : "Regenerate Package"}
                  </button>
                ) : null}
              </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[32px] border border-white/10 bg-[rgba(6,10,16,0.82)] p-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                  Build Jobs
                </p>
                <div className="mt-4 space-y-4">
                  {orderDetail.buildJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          Build v{job.buildVersion}
                        </p>
                        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400">
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {job.buildLog.map((entry, index) => (
                          <div
                            key={`${job.id}-${index}`}
                            className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3 text-xs text-slate-300"
                          >
                            <p className="font-mono uppercase tracking-[0.16em] text-slate-500">
                              {entry.step} · {entry.status}
                            </p>
                            <p className="mt-1 leading-5">{entry.detail}</p>
                          </div>
                        ))}
                      </div>
                      {job.errorMessage ? (
                        <p className="mt-3 text-xs text-[rgba(255,220,228,0.96)]">
                          {job.errorMessage}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-[rgba(6,10,16,0.82)] p-6">
                <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                  Support Requests
                </p>
                <div className="mt-4 space-y-4">
                  {orderDetail.supportRequests.length > 0 ? (
                    orderDetail.supportRequests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-[24px] border border-[rgba(247,178,103,0.24)] bg-[rgba(247,178,103,0.06)] px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-white">{request.summary}</p>
                        {request.detail ? (
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {request.detail}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                      No manual follow-up items were captured for this order.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
