import { useMemo, useState } from "react";

import { gateTierCatalogById } from "@config/gateCatalog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { EMBODIMENT_PROFILES } from "@shared/embodiment";
import {
  DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
  type GateBuyerContext,
  type GateDraftAnalysis,
  type GateSidekickState,
  type PackageConfigDraftInput,
} from "@shared/gate/schemas";

const channelOptions = [
  "web",
  "cli",
  "windows",
  "ios",
  "android",
  "email",
  "discord",
  "slack",
] as const;

interface GATESidekickPanelProps {
  draft: PackageConfigDraftInput;
  analysis: GateDraftAnalysis;
  sidekick: GateSidekickState;
  busy?: boolean;
  onBuyerContextPatch: (patch: Partial<GateBuyerContext>) => void;
  onSendMessage: (message: string) => Promise<void> | void;
  onApplyAction: (actionId: string) => Promise<void> | void;
}

function parseTextareaList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function scoreLabel(score: number): string {
  if (score >= 0.85) {
    return "High";
  }
  if (score >= 0.7) {
    return "Solid";
  }
  return "Tentative";
}

export default function GATESidekickPanel({
  draft,
  analysis,
  sidekick,
  busy = false,
  onBuyerContextPatch,
  onSendMessage,
  onApplyAction,
}: GATESidekickPanelProps) {
  const [message, setMessage] = useState("");
  const rawBuyerContext = draft.buyerContext;
  const buyerContext = {
    industry: rawBuyerContext?.industry,
    companyStage: rawBuyerContext?.companyStage,
    audience: rawBuyerContext?.audience,
    preferredChannels: rawBuyerContext?.preferredChannels ?? [],
    brandingInputs: rawBuyerContext?.brandingInputs,
    deploymentConstraints: rawBuyerContext?.deploymentConstraints,
    requestedOutcomes: rawBuyerContext?.requestedOutcomes ?? [],
    businessContext: rawBuyerContext?.businessContext,
  };
  const embodiment =
    EMBODIMENT_PROFILES[
      (draft.embodimentProfileSlug ||
        DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG) as keyof typeof EMBODIMENT_PROFILES
    ] ?? EMBODIMENT_PROFILES[DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG];
  const sidekickName = embodiment.publicName;
  const activeActions = useMemo(
    () =>
      sidekick.actions.filter(
        (action) =>
          action.status === "proposed" || action.status === "approval_required"
      ),
    [sidekick.actions]
  );
  const latestStructuredState = sidekick.turns.at(-1)?.structuredState ?? null;
  const reviewAction =
    activeActions.find((action) => action.status === "approval_required") ?? null;
  const nextMove =
    latestStructuredState?.pendingClarifications[0] ??
    reviewAction?.title ??
    activeActions[0]?.title ??
    "Current package shape is coherent. Tighten the brief only if the buyer intent changed.";
  const recentTurns = sidekick.turns.slice(-4);
  const includedAssets = sidekick.assetSelections.filter((asset) => asset.included);
  const requestedOutcomesText = buyerContext.requestedOutcomes.join("\n");

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setMessage("");
    await onSendMessage(trimmed);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[rgba(255,60,172,0.18)] bg-[linear-gradient(180deg,rgba(22,8,24,0.96),rgba(8,12,18,0.94))] p-6 shadow-[0_24px_80px_rgba(255,60,172,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[var(--gv-electric-cyan)]">
              {sidekickName} Active
            </p>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-[0.05em] text-white">
                {embodiment.publicName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {embodiment.immutableCore.coreWisdom}
              </p>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Voice
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {embodiment.immutableCore.voiceTone}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Current Read
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            {sidekick.session?.summary ??
              `${sidekickName} is syncing the package brief with the current draft.`}
          </p>
          <p className="mt-3 text-xs font-mono uppercase tracking-[0.16em] text-slate-500">
            Recommended tier:{" "}
            {gateTierCatalogById[analysis.sidekick.turns[0]?.structuredState.recommendations.tier ?? draft.tier]
              ?.label ?? gateTierCatalogById[draft.tier].label}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-[rgba(18,214,255,0.18)] bg-[rgba(18,214,255,0.06)] px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--gv-electric-cyan)]">
              Gate Status
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              Builder gate staffed
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {sidekickName} is actively tracking package state, not waiting as decoration.
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Boundary
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {reviewAction ? "Owner review line active" : "Safe package boundary active"}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              {reviewAction
                ? reviewAction.rationale
                : "Current recommendations stay inside bounded package, asset, and manifest changes."}
            </p>
          </div>

          <div className="rounded-[22px] border border-[rgba(255,60,172,0.18)] bg-[rgba(255,60,172,0.06)] px-4 py-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Next Move
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {nextMove}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              The gate should always make the next concrete move legible.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[rgba(5,9,15,0.82)] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
              Structured Brief
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {"This is what "}
              {sidekickName}
              {" uses to tighten tier, packs, assets, and safe transformations."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Industry
            </span>
            <input
              type="text"
              value={buyerContext.industry ?? ""}
              onChange={(event) =>
                onBuyerContextPatch({ industry: event.target.value })
              }
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Audience
            </span>
            <input
              type="text"
              value={buyerContext.audience ?? ""}
              onChange={(event) =>
                onBuyerContextPatch({ audience: event.target.value })
              }
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Preferred Channels
            </span>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((channel) => {
                const active = buyerContext.preferredChannels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                      onClick={() =>
                      onBuyerContextPatch({
                        preferredChannels: active
                          ? buyerContext.preferredChannels.filter(
                              (entry) => entry !== channel
                            )
                          : [...buyerContext.preferredChannels, channel],
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-2 text-[11px] font-mono uppercase tracking-[0.16em] transition",
                      active
                        ? "border-[rgba(255,60,172,0.3)] bg-[rgba(255,60,172,0.08)] text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300"
                    )}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Requested Outcomes
            </span>
            <Textarea
              value={requestedOutcomesText}
              rows={4}
              onChange={(event) =>
                onBuyerContextPatch({
                  requestedOutcomes: parseTextareaList(event.target.value),
                })
              }
              placeholder="One outcome per line. Example: Launch a white-label internal copilot."
              className="border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-[rgba(18,214,255,0.35)] focus-visible:ring-[rgba(18,214,255,0.16)]"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Deployment Constraints
            </span>
            <Textarea
              value={buyerContext.deploymentConstraints ?? ""}
              rows={3}
              onChange={(event) =>
                onBuyerContextPatch({
                  deploymentConstraints: event.target.value,
                })
              }
              placeholder="Compliance posture, hosting constraints, handoff expectations, or banned surfaces."
              className="border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-[rgba(18,214,255,0.35)] focus-visible:ring-[rgba(18,214,255,0.16)]"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              Branding Inputs
            </span>
            <Textarea
              value={buyerContext.brandingInputs ?? ""}
              rows={3}
              onChange={(event) =>
                onBuyerContextPatch({
                  brandingInputs: event.target.value,
                })
              }
              placeholder="Tone, visual direction, copy posture, or brand references."
              className="border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-[rgba(18,214,255,0.35)] focus-visible:ring-[rgba(18,214,255,0.16)]"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[rgba(5,9,15,0.82)] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
              Conversation Rail
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use this for loose context. {sidekickName} will map it back into the structured brief.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {recentTurns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                "rounded-[22px] border px-4 py-4 text-sm leading-7",
                turn.actor === "user"
                  ? "ml-8 border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] text-white"
                  : turn.actor === "system"
                    ? "border-[rgba(255,255,255,0.1)] bg-white/[0.03] text-slate-300"
                    : "mr-8 border-[rgba(255,60,172,0.22)] bg-[rgba(255,60,172,0.08)] text-slate-100"
              )}
            >
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                {turn.actor}
              </p>
              <p>{turn.messageText}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Example: We’re a healthcare operations team, Windows-first, and legal wants an audit-friendly handoff."
            className="border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-[rgba(18,214,255,0.35)] focus-visible:ring-[rgba(18,214,255,0.16)]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={busy || !message.trim()}
              className="rounded-full border border-[rgba(18,214,255,0.26)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gv-electric-cyan)] transition hover:bg-[rgba(18,214,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Syncing…" : `Send to ${sidekickName}`}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[rgba(5,9,15,0.82)] p-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
            Bounded Actions
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {"These are the package changes "}
            {sidekickName}
            {" can justify right now without touching protected logic."}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {activeActions.length === 0 ? (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
              No immediate sidekick actions are waiting. The current package shape is coherent.
            </div>
          ) : null}

          {activeActions.map((action) => (
            <div
              key={action.id}
              className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">{action.title}</p>
                  <p className="text-sm leading-6 text-slate-300">{action.rationale}</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                    {action.actionType.replace(/_/g, " ")} · {scoreLabel(action.confidence)} confidence
                  </p>
                </div>
                {action.status === "approval_required" ? (
                  <span className="rounded-full border border-[rgba(255,168,76,0.25)] bg-[rgba(255,168,76,0.08)] px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[rgba(255,210,158,0.96)]">
                    Owner Review
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void onApplyAction(action.id)}
                    disabled={busy}
                    className="rounded-full bg-[linear-gradient(90deg,var(--gv-neon-magenta),#ff74c6)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[rgba(5,9,15,0.82)] p-6">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">
            Asset Ledger
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Approved assets ranked for inclusion, with safe transformation plans attached.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {includedAssets.slice(0, 6).map((asset) => (
            <div
              key={asset.id}
              className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{asset.documentTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {asset.selectionReason}
                  </p>
                  <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                    {asset.documentType} · {asset.riskClass.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-black/20 px-3 py-2 text-right">
                  <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {Math.round(asset.selectionScore * 100)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
            Safe Transformations
          </p>
          <div className="mt-3 space-y-2">
            {sidekick.transformations.slice(0, 5).map((transformation) => (
              <p key={transformation.id} className="text-sm leading-6 text-slate-300">
                <span className="font-semibold text-white">
                  {transformation.transformationType.replace(/_/g, " ")}
                </span>{" "}
                {transformation.diffSummary}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
