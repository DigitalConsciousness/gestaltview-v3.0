import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

import { gateOperatorPacks, gateThemePresets } from "@config/gateCatalog";
import { gateUseCases } from "@config/gateUseCases";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import {
  hasFounderTrainerControlPlaneAccess,
  hasHostedAgentTrainerAccess,
  resolveHostedAgentTrainerPlan,
} from "@/lib/agentTrainerAccess";
import { AssistantChat } from "../../../agent_trainer/gestaltview_agent_trainer/components/AssistantChat";
import { KnowledgeUploader } from "../../../agent_trainer/gestaltview_agent_trainer/components/KnowledgeUploader";
import { MemoryViewer } from "../../../agent_trainer/gestaltview_agent_trainer/components/MemoryViewer";
import { OnboardingFlow } from "../../../agent_trainer/gestaltview_agent_trainer/components/OnboardingFlow";
import { PackActivationFlow } from "../../../agent_trainer/gestaltview_agent_trainer/components/PackActivationFlow";
import { PackLibrary } from "../../../agent_trainer/gestaltview_agent_trainer/components/PackLibrary";
import { ThemeStudio } from "../../../agent_trainer/gestaltview_agent_trainer/components/ThemeStudio";
import {
  buildBackdropBackground,
  buildThemeCssVariables,
  defaultThemePreset,
} from "../../../agent_trainer/gestaltview_agent_trainer/config/themeEngine";
import type { KitTierName } from "../../../agent_trainer/gestaltview_agent_trainer/config/tiers";

const onboardingSteps = [
  {
    step: "01",
    title: "Stage buyer-owned corpus",
    body: "Create the workspace, route source material into knowledge / code / product / context, and keep the first import small enough to inspect.",
  },
  {
    step: "02",
    title: "Activate the right pack",
    body: "Seed the runtime with reusable operator behavior before you ask it to improvise around a blank system.",
  },
  {
    step: "03",
    title: "Validate before launch",
    body: "Run a deliberate proof prompt, inspect the context stack, and make publish readiness earn its way in.",
  },
] as const;

const runtimeLanes = [
  {
    name: "Knowledge Lane",
    score: 84,
    detail: "Policies, SOPs, and operational docs are the first-class source of truth.",
  },
  {
    name: "Code Lane",
    score: 68,
    detail: "Architecture notes and APIs are grounded, but still need broader repo coverage.",
  },
  {
    name: "Product Lane",
    score: 57,
    detail: "Roadmap and release reasoning exist, but this is still the weakest lane.",
  },
  {
    name: "Context Lane",
    score: 81,
    detail: "Voice, boundaries, and operator language keep the runtime from sounding generic.",
  },
] as const;

const memoryPolicies = [
  "Pinned continuity stays visible until an operator explicitly clears it.",
  "Shared memory is reviewable and bounded rather than silently accumulating forever.",
  "Unsafe-to-store fragments are surfaced as warnings instead of being tucked into history.",
] as const;

function toneForScore(score: number): string {
  if (score >= 80) return "text-[rgba(110,231,183,0.95)]";
  if (score >= 65) return "text-[rgba(18,214,255,0.95)]";
  return "text-[rgba(247,178,103,0.95)]";
}

function resolveKitTier(runtimeTier: "SOLO_SPARK" | "STUDIO" | "ENTERPRISE"): KitTierName {
  if (runtimeTier === "ENTERPRISE") {
    return "ENTERPRISE";
  }

  if (runtimeTier === "STUDIO") {
    return "STUDIO";
  }

  return "SOLO_SPARK";
}

export default function HostedAgentTrainerPage() {
  const { isLoading, isAuthenticated, isAdmin, tier, profile, user } = useAuth();
  const [selectedUseCase, setSelectedUseCase] = useState(gateUseCases[0]?.slug ?? "");

  useSEO({
    title: "GestaltView Agent Trainer Hosted Runtime",
    description:
      "Hosted runtime for monthly Agent Trainer subscribers: onboarding, corpus lanes, packs, validation, and rollout readiness.",
    h1: "Hosted Agent Trainer Runtime",
    canonical: "https://gestaltview-di-gsvw.vercel.app/agent-trainer/runtime",
  });

  const hasHostedAccess = hasHostedAgentTrainerAccess({
    isAdmin,
    tier,
    subscriptionStatus: profile?.subscriptionStatus,
  });
  const hasControlPlaneAccess = hasFounderTrainerControlPlaneAccess({
    email: user?.email,
    isAdmin,
  });
  const plan = resolveHostedAgentTrainerPlan({
    isAdmin,
    tier,
    subscriptionStatus: profile?.subscriptionStatus,
  });
  const selectedUseCaseMeta = useMemo(
    () => gateUseCases.find((entry) => entry.slug === selectedUseCase) ?? gateUseCases[0],
    [selectedUseCase]
  );
  const featuredPacks = gateOperatorPacks.slice(0, 4);
  const featuredThemes = gateThemePresets.slice(0, 3);
  const hostedKitTier = resolveKitTier(plan.runtimeTier);
  const hostedKitShellStyle = useMemo(
    () => ({
      ...buildThemeCssVariables(defaultThemePreset.tokens),
      background: buildBackdropBackground(defaultThemePreset.tokens),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(18,214,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,60,172,0.14),transparent_30%),linear-gradient(180deg,#06111a_0%,#02070d_100%)] text-white">
      <NavBar />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="gv-hosted-hero"
        >
          <div className="gv-hosted-grid">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="gv-hosted-chip">Hosted Runtime</span>
                <span className="gv-hosted-chip gv-hosted-chip--cyan">{plan.label}</span>
                {profile?.subscriptionStatus ? (
                  <span className="gv-hosted-chip">
                    Billing: {profile.subscriptionStatus.replace(/_/g, " ")}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="gv-tech-kicker">LIVE SURFACE // SUBSCRIBER ACCESS</p>
                <h1 className="gv-tech-title text-4xl sm:text-5xl">
                  Hosted Agent Trainer Runtime
                </h1>
                <p className="gv-tech-copy max-w-3xl text-base">
                  This is the subscriber runtime surface: onboarding, corpus handling,
                  starter packs, memory posture, and readiness checks for active
                  hosted accounts. The public pricing page stays upstream, and this
                  room only opens once someone is actually entering the runtime.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isAuthenticated ? (
                  <Link
                    href="/login?redirect=/agent-trainer/runtime"
                    className="gv-solid-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em]"
                  >
                    Sign In To Open Runtime
                  </Link>
                ) : hasHostedAccess ? null : (
                  <Link
                    href="/agent-trainer"
                    className="gv-solid-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em]"
                  >
                    Activate Hosted Access
                  </Link>
                )}
                <Link
                  href="/agent-trainer"
                  className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                >
                  Back To Pricing
                </Link>
                <Link
                  href="/agent-trainer/package-builder"
                  className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                >
                  Build Your Own Package
                </Link>
                {hasControlPlaneAccess ? (
                  <Link
                    href="/agent-trainer/control-plane"
                    className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                  >
                    Open Control Plane
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="gv-hosted-panel gv-hosted-panel--night space-y-4">
              <p className="gv-tech-kicker">CURRENT ACCESS</p>
              <div className="grid gap-3">
                <div className="gv-hosted-metric">
                  <span className="gv-hosted-metric__label">Runtime tier</span>
                  <strong>{plan.runtimeTier}</strong>
                </div>
                <div className="gv-hosted-metric">
                  <span className="gv-hosted-metric__label">Support state</span>
                  <strong>{plan.supportState}</strong>
                </div>
                <div className="gv-hosted-metric">
                  <span className="gv-hosted-metric__label">User lane</span>
                  <strong>{isAuthenticated ? user?.email ?? "signed in" : "anonymous"}</strong>
                </div>
              </div>
              <p className="gv-tech-copy text-sm">
                Hosted access is granted by subscription state and app tier. The
                owned ZIP package remains the separate one-time purchase path.
              </p>
            </div>
          </div>
        </motion.section>

        {isLoading ? (
          <section className="gv-hosted-panel">
            <p className="gv-tech-copy text-sm">Loading your hosted runtime state…</p>
          </section>
        ) : !isAuthenticated ? (
          <section className="gv-hosted-panel gv-hosted-panel--warm">
            <p className="gv-tech-kicker">ACCOUNT REQUIRED</p>
            <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
              Sign in before the hosted runtime opens.
            </h2>
            <p className="gv-tech-copy max-w-3xl text-sm">
              The builder is public. The hosted runtime is tied to an account so pack
              activation, continuity, and subscription entitlements can stay attached
              to the correct user.
            </p>
          </section>
        ) : !hasHostedAccess ? (
          <section className="gv-hosted-panel gv-hosted-panel--warm">
            <p className="gv-tech-kicker">HOSTED ACCESS LOCKED</p>
            <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
              Monthly hosted runtime is not active on this account yet.
            </h2>
            <p className="gv-tech-copy max-w-3xl text-sm">
              Use the subscription track if you want the hosted surface. Use the
              package builder + scaffold if you want to bring your own infrastructure.
            </p>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="gv-hosted-panel">
              <p className="gv-tech-kicker">GUIDED SETUP</p>
              <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                One clear onboarding path at a time
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {onboardingSteps.map((item) => (
                  <div key={item.step} className="gv-hosted-panel-inner">
                    <span className="gv-hosted-step">{item.step}</span>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="gv-tech-copy text-sm">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="gv-hosted-panel">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="gv-tech-kicker">CORPUS LANES</p>
                  <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                    Runtime coverage by lane
                  </h2>
                </div>
                <select
                  value={selectedUseCase}
                  onChange={(event) => setSelectedUseCase(event.target.value)}
                  className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                >
                  {gateUseCases.map((useCase) => (
                    <option key={useCase.slug} value={useCase.slug}>
                      {useCase.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="gv-tech-copy mt-3 text-sm">
                {selectedUseCaseMeta?.description}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {runtimeLanes.map((lane) => (
                  <div key={lane.name} className="gv-hosted-panel-inner">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white">{lane.name}</h3>
                      <span className={`font-mono text-lg ${toneForScore(lane.score)}`}>
                        {lane.score}%
                      </span>
                    </div>
                    <div className="gv-hosted-progress mt-3">
                      <span style={{ width: `${lane.score}%` }} />
                    </div>
                    <p className="gv-tech-copy mt-3 text-sm">{lane.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="gv-hosted-panel">
              <p className="gv-tech-kicker">STARTER PACKS</p>
              <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                Hosted packs still stay explicit
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {featuredPacks.map((pack) => (
                  <div key={pack.slug} className="gv-hosted-panel-inner">
                    <div className="flex flex-wrap gap-2">
                      <span className="gv-hosted-chip">{pack.kind}</span>
                      <span className="gv-hosted-chip gv-hosted-chip--cyan">
                        {pack.bestFor}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{pack.title}</h3>
                    <p className="gv-tech-copy mt-2 text-sm">{pack.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="gv-hosted-panel">
              <p className="gv-tech-kicker">MEMORY + CONTINUITY</p>
              <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                Reviewable memory posture
              </h2>
              <div className="mt-4 grid gap-3">
                {memoryPolicies.map((policy) => (
                  <div key={policy} className="gv-hosted-panel-inner">
                    <p className="gv-tech-copy text-sm">{policy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="gv-hosted-panel">
              <p className="gv-tech-kicker">THEME ENGINE</p>
              <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                Tokenized runtime looks
              </h2>
              <div className="mt-5 grid gap-4">
                {featuredThemes.map((theme) => (
                  <div key={theme.id} className="gv-hosted-panel-inner">
                    <div
                      className="h-20 rounded-[20px] border border-white/10"
                      style={{
                        background: `radial-gradient(circle at 18% 20%, ${theme.tokens.gradient.heroA}, transparent 38%), radial-gradient(circle at 82% 24%, ${theme.tokens.gradient.heroB}, transparent 42%), linear-gradient(180deg, ${theme.tokens.color.bgBase}, ${theme.tokens.color.bgElevated})`,
                      }}
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="gv-hosted-chip gv-hosted-chip--cyan">{theme.label}</span>
                      {theme.bestFor.map((segment) => (
                        <span key={segment} className="gv-hosted-chip">
                          {segment}
                        </span>
                      ))}
                    </div>
                    <p className="gv-tech-copy mt-3 text-sm">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isAuthenticated && hasHostedAccess ? (
          <section className="space-y-6">
            <div className="gv-hosted-panel">
              <p className="gv-tech-kicker">HOSTED RUNTIME MODULES</p>
              <h2 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                Subscriber-facing trainer surfaces are now wired to the real kit
              </h2>
              <p className="gv-tech-copy max-w-4xl text-sm">
                This runtime now renders the actual Agent Trainer kit surfaces for
                onboarding, corpus staging, pack activation, memory posture, proof
                prompts, and theme configuration. The self-hosted builder remains a
                separate package path.
              </p>
            </div>

            <div className="gv-hosted-kit-shell" style={hostedKitShellStyle}>
              <div className="gv-hosted-kit-stack">
                <AssistantChat tier={hostedKitTier} kitName="Hosted Agent Trainer" />
                <KnowledgeUploader tier={hostedKitTier} />
                <div className="gv-hosted-kit-grid">
                  <PackActivationFlow tier={hostedKitTier} />
                  <ThemeStudio tier={hostedKitTier} />
                </div>
                <div className="gv-hosted-kit-grid">
                  <PackLibrary tier={hostedKitTier} />
                  <MemoryViewer tier={hostedKitTier} />
                </div>
                <OnboardingFlow tier={hostedKitTier} />
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
