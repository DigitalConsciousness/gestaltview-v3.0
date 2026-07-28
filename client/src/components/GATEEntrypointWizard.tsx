import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "wouter";

import { gateOperatorPacks, gateSourceBundles, gateThemePresets, gateTierCatalog } from "@config/gateCatalog";
import { gateUseCases, gateUseCaseBySlug } from "@config/gateUseCases";
import { EMBODIMENT_PROFILES } from "@shared/embodiment";
import { analyzeGateDraft, applyUseCaseDefaults } from "@shared/gate/engine";
import {
  createGateSidekickState,
  synchronizeGateSidekickState,
} from "@shared/gate/sidekick";
import {
  PackageConfigDraftInputSchema,
  PackageConfigDraftSchema,
  defaultPackageConfigDraftInput,
  type GateBuyerContext,
  type GateSidekickState,
  type DeliverySurface,
  type PackageConfigDraft,
  type PackageConfigDraftInput,
} from "@shared/gate/schemas";
import { cn } from "@/lib/utils";
import {
  applyGateSidekickAction as applyGateSidekickActionRequest,
  checkoutGateDraft,
  createGateDraft,
  fetchGateDraft,
  sendGateSidekickMessage as sendGateSidekickMessageRequest,
  updateGateDraft,
} from "@/lib/gateApi";
import { useAuth } from "@/contexts/AuthContext";
import GATECompatibilityWarnings from "./GATECompatibilityWarnings";
import GATEPackageSummary from "./GATEPackageSummary";
import GATESidekickPanel from "./GATESidekickPanel";
import GATEUseCaseSelector from "./GATEUseCaseSelector";

const SNAPSHOT_KEY = "gv-gate-builder-snapshot-v1";
const SNAPSHOT_DRAFT_KEY = "gv-gate-builder-draft-v2";
const SNAPSHOT_SIDEKICK_KEY = "gv-gate-builder-sidekick-v2";

const steps = [
  { key: "use_case", label: "Use Case" },
  { key: "tier_scope", label: "Tier + Seats" },
  { key: "runtime", label: "Backend + Surfaces" },
  { key: "packs", label: "Packs + Bundles" },
  { key: "theme", label: "Theme + Branding" },
  { key: "checkout", label: "Notes + Checkout" },
] as const;

function createPreviewDraft(
  input: PackageConfigDraftInput,
  draftId: string | null
): PackageConfigDraft {
  return PackageConfigDraftSchema.parse({
    ...input,
    id: draftId ?? "preview-draft",
    status: "draft",
    priceSnapshotCents: 0,
    configHash: "preview",
    createdAt: "2026-04-06T00:00:00.000Z",
    updatedAt: "2026-04-06T00:00:00.000Z",
  });
}

function readSnapshot(): {
  draftId: string | null;
  draft: PackageConfigDraftInput | null;
  sidekick: GateSidekickState | null;
} {
  if (typeof window === "undefined") {
    return { draftId: null, draft: null, sidekick: null };
  }

  try {
    const draftRaw = window.localStorage.getItem(SNAPSHOT_DRAFT_KEY);
    const sidekickRaw = window.localStorage.getItem(SNAPSHOT_SIDEKICK_KEY);

    if (draftRaw || sidekickRaw) {
      const parsedDraft = draftRaw
        ? (JSON.parse(draftRaw) as {
            draftId?: string | null;
            draft?: PackageConfigDraftInput;
          })
        : null;
      const parsedSidekick = sidekickRaw
        ? (JSON.parse(sidekickRaw) as GateSidekickState | null)
        : null;

      return {
        draftId: parsedDraft?.draftId ?? null,
        draft: parsedDraft?.draft ?? null,
        sidekick: parsedSidekick ?? null,
      };
    }

    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) {
      return { draftId: null, draft: null, sidekick: null };
    }

    const parsed = JSON.parse(raw) as {
      draftId?: string | null;
      draft?: PackageConfigDraftInput;
      sidekick?: GateSidekickState | null;
    };

    return {
      draftId: parsed.draftId ?? null,
      draft: parsed.draft ?? null,
      sidekick: parsed.sidekick ?? null,
    };
  } catch {
    return { draftId: null, draft: null, sidekick: null };
  }
}

function normalizeOptionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBuyerContextForClient(
  value?: Partial<GateBuyerContext> | null
): GateBuyerContext {
  return {
    ...defaultPackageConfigDraftInput.buyerContext,
    ...(value ?? {}),
    preferredChannels:
      value?.preferredChannels ??
      defaultPackageConfigDraftInput.buyerContext.preferredChannels,
    requestedOutcomes:
      value?.requestedOutcomes ??
      defaultPackageConfigDraftInput.buyerContext.requestedOutcomes,
  };
}

function normalizeDraftInputForClient(
  value?: Partial<PackageConfigDraftInput> | null
): PackageConfigDraftInput {
  return PackageConfigDraftInputSchema.parse({
    ...defaultPackageConfigDraftInput,
    ...(value ?? {}),
    embodimentProfileSlug:
      value?.embodimentProfileSlug ??
      defaultPackageConfigDraftInput.embodimentProfileSlug,
    buyerContext: normalizeBuyerContextForClient(value?.buyerContext),
    deliverySurfaces:
      value?.deliverySurfaces ?? defaultPackageConfigDraftInput.deliverySurfaces,
    operatorPackSlugs:
      value?.operatorPackSlugs ?? defaultPackageConfigDraftInput.operatorPackSlugs,
    sourceBundleSlugs:
      value?.sourceBundleSlugs ?? defaultPackageConfigDraftInput.sourceBundleSlugs,
  });
}

function serializeDraftInput(input: PackageConfigDraftInput): string {
  return JSON.stringify({
    ...input,
    buyerEmail: normalizeOptionalText(input.buyerEmail),
    companyName: normalizeOptionalText(input.companyName),
    embodimentProfileSlug: input.embodimentProfileSlug,
    buyerContext: {
      ...normalizeBuyerContextForClient(input.buyerContext),
      preferredChannels: [
        ...normalizeBuyerContextForClient(input.buyerContext).preferredChannels,
      ].sort(),
      requestedOutcomes: [
        ...normalizeBuyerContextForClient(input.buyerContext).requestedOutcomes,
      ].sort(),
    },
    logoAssetPath: normalizeOptionalText(input.logoAssetPath),
    customNotes: normalizeOptionalText(input.customNotes),
    deliverySurfaces: [...input.deliverySurfaces].sort(),
    operatorPackSlugs: [...input.operatorPackSlugs].sort(),
    sourceBundleSlugs: [...input.sourceBundleSlugs].sort(),
  });
}

const DEFAULT_DRAFT_SIGNATURE = serializeDraftInput(defaultPackageConfigDraftInput);

function syncDraftQueryParam(draftId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = new URL(window.location.href);
  if (!draftId) {
    if (!nextUrl.searchParams.has("draft")) {
      return;
    }

    nextUrl.searchParams.delete("draft");
    window.history.replaceState(
      window.history.state,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );
    return;
  }

  if (nextUrl.searchParams.get("draft") === draftId) {
    return;
  }

  nextUrl.searchParams.set("draft", draftId);
  window.history.replaceState(
    window.history.state,
    "",
    `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
  );
}

type GATEEntrypointWizardProps = {
  founderReviewOnly?: boolean;
};

export default function GATEEntrypointWizard({
  founderReviewOnly = false,
}: GATEEntrypointWizardProps) {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PackageConfigDraftInput>(
    defaultPackageConfigDraftInput
  );
  const [sidekickState, setSidekickState] = useState<GateSidekickState>(() =>
    createGateSidekickState(
      createPreviewDraft(defaultPackageConfigDraftInput, null)
    )
  );
  const [loading, setLoading] = useState<"loading" | "saving" | "checkout" | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const draftRef = useRef(draft);
  const draftIdRef = useRef(draftId);
  const hydrationCompleteRef = useRef(false);
  const lastSavedSignatureRef = useRef<string | null>(null);
  const autosaveAbortRef = useRef<AbortController | null>(null);
  const saveGenerationRef = useRef(0);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  function updateDraft(
    updater: (current: PackageConfigDraftInput) => PackageConfigDraftInput
  ) {
    setDraft((current) => {
      const nextDraft = updater(current);
      draftRef.current = nextDraft;
      return nextDraft;
    });
  }

  const loadInitialDraft = useEffectEvent(async () => {
    const params = new URLSearchParams(window.location.search);
    const urlDraftId = params.get("draft");
    const snapshot = readSnapshot();
    const sourceDraftId = urlDraftId ?? snapshot.draftId ?? null;

    if (snapshot.draft) {
      const normalizedSnapshotDraft = normalizeDraftInputForClient(snapshot.draft);
      draftRef.current = normalizedSnapshotDraft;
      draftIdRef.current = snapshot.draftId ?? null;
      startTransition(() => {
        setDraft(normalizedSnapshotDraft);
        setDraftId(snapshot.draftId ?? null);
        setSidekickState(
          synchronizeGateSidekickState(
            createPreviewDraft(normalizedSnapshotDraft, snapshot.draftId ?? null),
            snapshot.sidekick ?? null
          )
        );
      });
    }

    if (!sourceDraftId) {
      hydrationCompleteRef.current = true;
      return;
    }

    setLoading("loading");
    try {
      const analysis = await fetchGateDraft(sourceDraftId);
      const normalizedDraft = normalizeDraftInputForClient(analysis.draft);
      lastSavedSignatureRef.current = serializeDraftInput(normalizedDraft);
      draftRef.current = normalizedDraft;
      draftIdRef.current = analysis.draft.id;
      startTransition(() => {
        setDraft(normalizedDraft);
        setDraftId(analysis.draft.id);
        setSidekickState(
          synchronizeGateSidekickState(
            createPreviewDraft(normalizedDraft, analysis.draft.id),
            analysis.sidekick
          )
        );
        setSaveState("saved");
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load saved draft."
      );
    } finally {
      hydrationCompleteRef.current = true;
      setLoading(null);
    }
  });

  useEffect(() => {
    void loadInitialDraft();
  }, [loadInitialDraft]);

  useEffect(() => {
    syncDraftQueryParam(draftId);
  }, [draftId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        SNAPSHOT_DRAFT_KEY,
        JSON.stringify({
          draftId,
          draft,
        })
      );
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [draft, draftId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(
        SNAPSHOT_SIDEKICK_KEY,
        JSON.stringify(sidekickState)
      );
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [sidekickState]);

  const saveDraftRemote = useEffectEvent(
    async (
      mode: "manual" | "autosave" | "checkout"
    ): Promise<{ draftId: string; draft: PackageConfigDraftInput }> => {
      const currentDraft = draftRef.current;
      const currentDraftId = draftIdRef.current;
      const requestedSignature = serializeDraftInput(currentDraft);

      if (currentDraftId && requestedSignature === lastSavedSignatureRef.current) {
        if (mode === "manual") {
          setBanner("Draft saved.");
        }
        setSaveState("saved");
        return {
          draftId: currentDraftId,
          draft: currentDraft,
        };
      }

      if (mode === "manual") {
        setLoading("saving");
      } else if (mode === "autosave") {
        setSaveState("saving");
      }

      setError(null);

      const generationAtStart = saveGenerationRef.current + 1;
      saveGenerationRef.current = generationAtStart;
      const abortController = new AbortController();
      if (mode === "autosave") {
        autosaveAbortRef.current?.abort();
        autosaveAbortRef.current = abortController;
      } else if (autosaveAbortRef.current) {
        autosaveAbortRef.current.abort();
        autosaveAbortRef.current = null;
      }

      try {
        const analysis = currentDraftId
          ? await updateGateDraft(currentDraftId, currentDraft)
          : await createGateDraft(currentDraft);

        if (abortController.signal.aborted || saveGenerationRef.current !== generationAtStart) {
          return {
            draftId: analysis.draft.id,
            draft: analysis.draft,
          };
        }

        const savedDraft = analysis.draft;
        const normalizedSavedDraft = normalizeDraftInputForClient(savedDraft);
        const savedSignature = serializeDraftInput(normalizedSavedDraft);
        const draftChangedDuringAutosave =
          mode === "autosave" &&
          serializeDraftInput(draftRef.current) !== requestedSignature;

        lastSavedSignatureRef.current = savedSignature;
        draftIdRef.current = savedDraft.id;

        if (mode === "autosave") {
          startTransition(() => {
            setDraftId(savedDraft.id);
            setSaveState(draftChangedDuringAutosave ? "idle" : "saved");
          });

          return {
            draftId: savedDraft.id,
            draft: draftRef.current,
          };
        }

        draftRef.current = normalizedSavedDraft;

        startTransition(() => {
          setDraft(normalizedSavedDraft);
          setDraftId(savedDraft.id);
          setSidekickState(
            synchronizeGateSidekickState(
              createPreviewDraft(normalizedSavedDraft, savedDraft.id),
              analysis.sidekick
            )
          );
          setSaveState("saved");
          if (mode === "manual") {
            setBanner("Draft saved.");
          }
        });

        return {
          draftId: savedDraft.id,
          draft: savedDraft,
        };
      } catch (saveError) {
        if (abortController.signal.aborted || saveGenerationRef.current !== generationAtStart) {
          return {
            draftId: draftIdRef.current ?? currentDraftId ?? "",
            draft: draftRef.current,
          };
        }

        const message =
          saveError instanceof Error ? saveError.message : "Unable to save draft.";
        setSaveState("error");
        if (mode === "manual" || mode === "checkout") {
          setError(message);
        } else {
          setBanner("Live draft sync paused. Keep editing, then tap Save Draft.");
        }
        throw saveError;
      } finally {
        if (mode === "manual") {
          setLoading(null);
        }
        if (mode === "autosave" && autosaveAbortRef.current === abortController) {
          autosaveAbortRef.current = null;
        }
      }
    }
  );

  useEffect(() => {
    if (!hydrationCompleteRef.current) {
      return;
    }

    if (loading === "loading" || loading === "saving" || loading === "checkout") {
      return;
    }

    const signature = serializeDraftInput(draft);
    if (draftId && signature === lastSavedSignatureRef.current) {
      return;
    }

    if (!draftId && signature === DEFAULT_DRAFT_SIGNATURE) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveDraftRemote("autosave");
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [draft, draftId, loading, saveDraftRemote]);

  const deferredDraft = useDeferredValue(draft);
  const deferredDraftId = useDeferredValue(draftId);
  const deferredSidekickState = useDeferredValue(sidekickState);

  const analysis = useMemo(() => {
    const previewDraft = createPreviewDraft(deferredDraft, deferredDraftId);

    return {
      ...analyzeGateDraft(previewDraft),
      sidekick: synchronizeGateSidekickState(previewDraft, deferredSidekickState),
    };
  }, [deferredDraft, deferredDraftId, deferredSidekickState]);

  const sidekickName =
    EMBODIMENT_PROFILES[
      (draft.embodimentProfileSlug ||
        defaultPackageConfigDraftInput.embodimentProfileSlug) as keyof typeof EMBODIMENT_PROFILES
    ]?.publicName ?? "Sidekick";
  const selectedUseCase = gateUseCaseBySlug[draft.useCaseSlug];
  const canAdvance = stepIndex < steps.length - 1;
  const canGoBack = stepIndex > 0;
  const liveDraftStatus =
    loading === "loading"
      ? "Loading saved draft..."
      : loading === "saving"
        ? "Saving draft..."
        : loading === "checkout"
          ? "Preparing checkout..."
          : saveState === "saving"
            ? "Saving live draft..."
            : saveState === "saved" && draftId
              ? "Live draft saved."
              : draftId
                ? "Live draft connected."
                : "Live draft starts after your first change.";

  function clearBanner() {
    if (banner) {
      setBanner(null);
    }
  }

  function goToStep(nextStepIndex: number) {
    setStepIndex(nextStepIndex);
  }

  function toggleSurface(surface: DeliverySurface) {
    updateDraft((current) => {
      const hasSurface = current.deliverySurfaces.includes(surface);
      if (hasSurface && current.deliverySurfaces.length === 1) {
        return current;
      }

      return {
        ...current,
        deliverySurfaces: hasSurface
          ? current.deliverySurfaces.filter((entry) => entry !== surface)
          : [...current.deliverySurfaces, surface],
      };
    });
  }

  function toggleValue(
    key: "operatorPackSlugs" | "sourceBundleSlugs",
    value: string
  ) {
    updateDraft((current) => {
      const currentValues = current[key];
      const hasValue = currentValues.includes(value);

      return {
        ...current,
        [key]: hasValue
          ? currentValues.filter((entry) => entry !== value)
          : [...currentValues, value],
      };
    });
  }

  function updateBuyerContext(patch: Partial<GateBuyerContext>) {
    updateDraft((current) => ({
      ...current,
      buyerContext: {
        ...normalizeBuyerContextForClient(current.buyerContext),
        ...patch,
        preferredChannels:
          patch.preferredChannels ??
          normalizeBuyerContextForClient(current.buyerContext).preferredChannels,
        requestedOutcomes:
          patch.requestedOutcomes ??
          normalizeBuyerContextForClient(current.buyerContext).requestedOutcomes,
      },
    }));
  }

  async function persistDraft(): Promise<{ draftId: string; draft: PackageConfigDraftInput }> {
    return saveDraftRemote("manual");
  }

  async function handleSidekickMessage(message: string) {
    setError(null);

    try {
      const { draftId: savedDraftId } = await saveDraftRemote("manual");
      const refreshedAnalysis = await sendGateSidekickMessageRequest(savedDraftId, {
        message,
      });
      const normalizedDraft = normalizeDraftInputForClient(refreshedAnalysis.draft);
      lastSavedSignatureRef.current = serializeDraftInput(normalizedDraft);
      draftRef.current = normalizedDraft;
      draftIdRef.current = refreshedAnalysis.draft.id;
      startTransition(() => {
        setDraft(normalizedDraft);
        setDraftId(refreshedAnalysis.draft.id);
        setSidekickState(
          synchronizeGateSidekickState(
            createPreviewDraft(normalizedDraft, refreshedAnalysis.draft.id),
            refreshedAnalysis.sidekick
          )
        );
        setSaveState("saved");
      });
    } catch (sidekickError) {
      setError(
        sidekickError instanceof Error
          ? sidekickError.message
          : `${sidekickName} could not process that message.`
      );
    }
  }

  async function handleApplySidekickAction(actionId: string) {
    setError(null);

    try {
      const { draftId: savedDraftId } = await saveDraftRemote("manual");
      const refreshedAnalysis = await applyGateSidekickActionRequest(
        savedDraftId,
        actionId
      );
      const normalizedDraft = normalizeDraftInputForClient(refreshedAnalysis.draft);
      lastSavedSignatureRef.current = serializeDraftInput(normalizedDraft);
      draftRef.current = normalizedDraft;
      draftIdRef.current = refreshedAnalysis.draft.id;
      startTransition(() => {
        setDraft(normalizedDraft);
        setDraftId(refreshedAnalysis.draft.id);
        setSidekickState(
          synchronizeGateSidekickState(
            createPreviewDraft(normalizedDraft, refreshedAnalysis.draft.id),
            refreshedAnalysis.sidekick
          )
        );
        setBanner(`${sidekickName} applied the selected package change.`);
        setSaveState("saved");
      });
    } catch (sidekickError) {
      setError(
        sidekickError instanceof Error
          ? sidekickError.message
          : "Unable to apply that sidekick action."
      );
    }
  }

  async function handleCheckout() {
    const checkoutDraft = draftRef.current;

    setLoading("checkout");
    setError(null);

    try {
      const { draftId: savedDraftId, draft: savedDraft } = await saveDraftRemote(
        "checkout"
      );
      const buyerEmail =
        normalizeOptionalText(savedDraft.buyerEmail) ??
        normalizeOptionalText(checkoutDraft.buyerEmail) ??
        "";
      const companyName =
        normalizeOptionalText(savedDraft.companyName) ??
        normalizeOptionalText(checkoutDraft.companyName);

      if (buyerEmail.length < 3) {
        setError("Add a buyer email before generating the package.");
        return;
      }

      const { checkout } = await checkoutGateDraft({
        draftId: savedDraftId,
        ...(buyerEmail ? { buyerEmail } : {}),
        ...(companyName ? { companyName } : {}),
        requestFounderReview: founderReviewOnly,
        mockPayment:
          isAdmin ||
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1",
      });

      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }

      if (checkout.redirectUrl) {
        setLocation(checkout.redirectUrl);
        return;
      }

      setLocation(`/agent-trainer/orders/${checkout.orderId}`);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to continue to checkout."
      );
    } finally {
      setLoading(null);
    }
  }

  function handleStartOver() {
    autosaveAbortRef.current?.abort();
    autosaveAbortRef.current = null;
    saveGenerationRef.current += 1;
    lastSavedSignatureRef.current = null;
    hydrationCompleteRef.current = true;
    setStepIndex(0);
    draftRef.current = defaultPackageConfigDraftInput;
    draftIdRef.current = null;
    setDraft(defaultPackageConfigDraftInput);
    setDraftId(null);
    setSidekickState(
      createGateSidekickState(createPreviewDraft(defaultPackageConfigDraftInput, null))
    );
    setSaveState("idle");
    setError(null);
    setBanner("Builder reset. Start a fresh package draft.");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SNAPSHOT_KEY);
      window.localStorage.removeItem(SNAPSHOT_DRAFT_KEY);
      window.localStorage.removeItem(SNAPSHOT_SIDEKICK_KEY);
    }
  }

  function renderStep() {
    if (stepIndex === 0) {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
              Step 1
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
              Choose the business shape
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Start from the use case. The builder uses this to recommend the safest
              tier, backend, surfaces, packs, bundles, and theme direction without
              locking those recommendations in.
            </p>
          </div>
          <GATEUseCaseSelector
            value={draft.useCaseSlug}
            onSelect={(slug) => {
              updateDraft((current) => ({
                ...applyUseCaseDefaults(current, slug),
                buyerEmail: current.buyerEmail,
                companyName: current.companyName,
                brandColor: current.brandColor,
                logoAssetPath: current.logoAssetPath,
                customNotes: current.customNotes,
              }));
            }}
          />
        </div>
      );
    }

    if (stepIndex === 1) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
              Step 2
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
              Set tier and seat scope
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gateTierCatalog.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    tier: tier.id,
                    seatsRequested:
                      tier.maxSeats === "unlimited"
                        ? current.seatsRequested
                        : Math.min(current.seatsRequested, tier.maxSeats),
                  }))
                }
                className={cn(
                  "rounded-[28px] border px-5 py-5 text-left transition-[border-color,background-color,box-shadow] duration-150",
                  draft.tier === tier.id
                    ? "border-[rgba(255,60,172,0.32)] bg-[rgba(255,60,172,0.08)]"
                    : "border-[rgba(120,214,255,0.16)] bg-[rgba(8,12,18,0.75)] hover:border-[rgba(120,214,255,0.28)]"
                )}
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  {tier.onboardingMode}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold uppercase tracking-[0.05em] text-white">
                  {tier.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {tier.headlinePromise}
                </p>
                <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--gv-electric-cyan)]">
                  Included seats: {tier.includedSeats}
                  {tier.maxSeats === "unlimited" ? " · Unlimited max" : ` · Max ${tier.maxSeats}`}
                </p>
              </button>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
              Seats Requested
            </span>
            <input
              type="number"
              min={1}
              max={999}
              value={draft.seatsRequested}
              onChange={(event) => {
                const next = Number(event.target.value);
                updateDraft((current) => ({
                  ...current,
                  seatsRequested: Number.isFinite(next) && next > 0 ? next : current.seatsRequested,
                }));
              }}
              className="w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
            />
          </label>
        </div>
      );
    }

    if (stepIndex === 2) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
              Step 3
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
              Pick runtime and delivery surfaces
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {(["supabase", "redis", "mongodb"] as const).map((backend) => (
              <button
                key={backend}
                type="button"
                onClick={() => updateDraft((current) => ({ ...current, backend }))}
                className={cn(
                  "rounded-[24px] border px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-150",
                  draft.backend === backend
                    ? "border-[rgba(18,214,255,0.32)] bg-[rgba(18,214,255,0.08)]"
                    : "border-[rgba(255,255,255,0.08)] bg-white/[0.03]"
                )}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">
                  {backend}
                </p>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {(["web", "cli", "windows", "ios", "android"] as const).map((surface) => {
              const active = draft.deliverySurfaces.includes(surface);
              return (
                <button
                  key={surface}
                  type="button"
                  onClick={() => toggleSurface(surface)}
                  className={cn(
                    "rounded-[20px] border px-4 py-4 text-sm font-semibold uppercase tracking-[0.08em] transition-[border-color,background-color,box-shadow] duration-150",
                    active
                      ? "border-[rgba(255,60,172,0.32)] bg-[rgba(255,60,172,0.08)] text-white"
                      : "border-[rgba(255,255,255,0.08)] bg-white/[0.03] text-slate-300"
                  )}
                >
                  {surface}
                </button>
              );
            })}
          </div>

          <label className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white">
                Native Installer Stub
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                MVP support is limited to Windows and CLI combinations.
              </p>
            </div>
            <input
              type="checkbox"
              checked={draft.wantsNativeInstaller}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  wantsNativeInstaller: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-[var(--gv-neon-magenta)]"
            />
          </label>
        </div>
      );
    }

    if (stepIndex === 3) {
      return (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
              Step 4
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
              Select packs and source bundles
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Recommended badges show what the gatekeeper would choose. Nothing is
              auto-added here unless you explicitly select it.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
              Operator Packs
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {gateOperatorPacks.map((pack) => {
                const active = draft.operatorPackSlugs.includes(pack.slug);
                const recommended =
                  analysis.recommendations.operatorPackSlugs.includes(pack.slug);
                return (
                  <button
                    key={pack.slug}
                    type="button"
                    onClick={() => toggleValue("operatorPackSlugs", pack.slug)}
                    className={cn(
                      "flex h-full flex-col rounded-[28px] border px-5 py-5 text-left transition-[border-color,background-color,box-shadow] duration-150",
                      active
                        ? "border-[rgba(255,60,172,0.3)] bg-[rgba(255,60,172,0.08)]"
                        : "border-[rgba(255,255,255,0.08)] bg-white/[0.03]"
                    )}
                  >
                    <div className="flex min-h-[2rem] items-start justify-between gap-3">
                      <p className="font-display text-lg font-bold uppercase tracking-[0.05em] text-white">
                        {pack.title}
                      </p>
                      <span
                        aria-hidden={!recommended}
                        className={cn(
                          "inline-flex min-w-[7.5rem] justify-center rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition-opacity duration-150",
                          recommended
                            ? "border-[rgba(18,214,255,0.24)] bg-[rgba(18,214,255,0.08)] text-[var(--gv-electric-cyan)] opacity-100"
                            : "invisible opacity-0"
                        )}
                      >
                        Recommended
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {pack.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
              Source Bundles
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {gateSourceBundles.map((bundle) => {
                const active = draft.sourceBundleSlugs.includes(bundle.slug);
                const recommended =
                  analysis.recommendations.sourceBundleSlugs.includes(bundle.slug);
                return (
                  <button
                    key={bundle.slug}
                    type="button"
                    onClick={() => toggleValue("sourceBundleSlugs", bundle.slug)}
                    className={cn(
                      "flex h-full flex-col rounded-[28px] border px-5 py-5 text-left transition-[border-color,background-color,box-shadow] duration-150",
                      active
                        ? "border-[rgba(18,214,255,0.3)] bg-[rgba(18,214,255,0.08)]"
                        : "border-[rgba(255,255,255,0.08)] bg-white/[0.03]"
                    )}
                  >
                    <div className="flex min-h-[2rem] items-start justify-between gap-3">
                      <p className="font-display text-lg font-bold uppercase tracking-[0.05em] text-white">
                        {bundle.title}
                      </p>
                      <span
                        aria-hidden={!recommended}
                        className={cn(
                          "inline-flex min-w-[7.5rem] justify-center rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em] transition-opacity duration-150",
                          recommended
                            ? "border-[rgba(255,60,172,0.24)] bg-[rgba(255,60,172,0.08)] text-white opacity-100"
                            : "invisible opacity-0"
                        )}
                      >
                        Recommended
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {bundle.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (stepIndex === 4) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
              Step 5
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
              Theme and buyer identity
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gateThemePresets.map((theme) => {
              const active = draft.themePresetId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      themePresetId: theme.id,
                    }))
                  }
                  className={cn(
                    "rounded-[28px] border px-5 py-5 text-left transition-[border-color,background-color,box-shadow] duration-150",
                    active
                      ? "border-[rgba(255,60,172,0.32)] bg-[rgba(255,60,172,0.08)]"
                      : "border-[rgba(255,255,255,0.08)] bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-8 w-8 rounded-full border border-white/10"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div>
                      <p className="font-display text-lg font-bold uppercase tracking-[0.05em] text-white">
                        {theme.label}
                      </p>
                      <p className="text-xs font-mono uppercase tracking-[0.16em] text-slate-500">
                        {theme.bestFor.join(" · ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {theme.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Company Name
              </span>
              <input
                type="text"
                value={draft.companyName ?? ""}
                maxLength={160}
                autoComplete="organization"
                onChange={(event) => {
                  clearBanner();
                  updateDraft((current) => ({
                    ...current,
                    companyName: event.target.value,
                  }));
                }}
                onKeyDown={clearBanner}
                className="w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Buyer Email
              </span>
              <input
                type="email"
                value={draft.buyerEmail ?? ""}
                maxLength={320}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => {
                  clearBanner();
                  updateDraft((current) => ({
                    ...current,
                    buyerEmail: event.target.value,
                  }));
                }}
                onKeyDown={clearBanner}
                className="w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Brand Color
              </span>
              <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/20 px-4 py-3">
                <input
                  type="color"
                  value={draft.brandColor ?? "#0f6b60"}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      brandColor: event.target.value,
                    }))
                  }
                  className="h-10 w-12 border-0 bg-transparent"
                />
                <span className="font-mono text-sm text-slate-300">
                  {draft.brandColor ?? "#0f6b60"}
                </span>
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Logo Path
              </span>
              <input
                type="text"
                value={draft.logoAssetPath ?? ""}
                maxLength={260}
                onChange={(event) => {
                  clearBanner();
                  updateDraft((current) => ({
                    ...current,
                    logoAssetPath: event.target.value,
                  }));
                }}
                onKeyDown={clearBanner}
                placeholder="/assets/brand/logo.svg"
                className="w-full rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
              />
            </label>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--gv-electric-cyan)]">
            Step 6
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.05em] text-white">
            Add final notes and launch
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Unsupported requests are captured as structured review notes. If this
            package stays on a supported path, checkout moves straight into automated packaging.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
            Custom Requirements
          </span>
          <textarea
            value={draft.customNotes ?? ""}
            maxLength={4000}
            onChange={(event) => {
              clearBanner();
              updateDraft((current) => ({
                ...current,
                customNotes: event.target.value,
              }));
            }}
            onKeyDown={clearBanner}
            rows={6}
            className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition focus:border-[rgba(18,214,255,0.3)]"
            placeholder="White-label domain, compliance notes, deployment constraints, or delivery preferences."
          />
        </label>

        <div className="rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-5 py-5">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
            Selected Default Profile
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-200">
            {selectedUseCase?.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6 rounded-[36px] border border-[rgba(255,255,255,0.08)] bg-[rgba(5,9,15,0.82)] p-6 backdrop-blur-xl sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[var(--gv-electric-cyan)]">
            GATE Entrypoint
          </p>
          <p className="min-h-[1rem] text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            {liveDraftStatus}
          </p>
          {isAdmin ? (
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[rgba(110,231,183,0.92)]">
              Admin mode: checkout uses simulated payment.
            </p>
          ) : null}
          <h1 className="font-display text-4xl font-bold uppercase tracking-[0.05em] text-white sm:text-5xl">
            Build the exact package before you pay.
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300">
            Configure the package from the pricing surface, validate the combination,
            save the draft, and generate a tailored ZIP immediately after payment.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {steps.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => goToStep(index)}
              className={cn(
                "rounded-[18px] border px-3 py-3 text-left transition-[border-color,background-color] duration-150",
                index === stepIndex
                  ? "border-[rgba(255,60,172,0.32)] bg-[rgba(255,60,172,0.08)]"
                  : "border-[rgba(255,255,255,0.08)] bg-white/[0.03]"
              )}
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                {step.label}
              </p>
            </button>
          ))}
        </div>

        {banner ? (
          <div className="rounded-[20px] border border-[rgba(110,231,183,0.35)] bg-[rgba(110,231,183,0.08)] px-4 py-3 text-sm text-[rgba(214,255,233,0.96)]">
            {banner}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[20px] border border-[rgba(255,92,138,0.35)] bg-[rgba(255,92,138,0.08)] px-4 py-3 text-sm text-[rgba(255,220,228,0.96)]">
            {error}
          </div>
        ) : null}

        {loading === "loading" ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
            Loading saved draft…
          </div>
        ) : (
          renderStep()
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => canGoBack && goToStep(stepIndex - 1)}
              disabled={!canGoBack}
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => void persistDraft()}
              disabled={loading === "saving" || loading === "checkout"}
              className="rounded-full border border-[rgba(18,214,255,0.26)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--gv-electric-cyan)] transition hover:bg-[rgba(18,214,255,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading === "saving" ? "Saving…" : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={handleStartOver}
              disabled={loading === "saving" || loading === "checkout"}
              className="rounded-full border border-[rgba(255,255,255,0.18)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start Over
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {canAdvance ? (
              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                className="rounded-full bg-[linear-gradient(90deg,var(--gv-neon-magenta),#ff74c6)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(255,60,172,0.22)] transition hover:brightness-110"
              >
                Next Step
              </button>
            ) : (
                <button
                  type="button"
                  onClick={() => void handleCheckout()}
                  disabled={loading === "checkout"}
                  className="rounded-full bg-[linear-gradient(90deg,var(--gv-neon-magenta),#ff74c6)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(255,60,172,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading === "checkout"
                    ? "Processing…"
                    : founderReviewOnly
                      ? "Submit for Founder Review"
                    : isAdmin
                      ? "Generate Package (Admin)"
                    : analysis.compatibility.checkoutMode === "request_review"
                      ? "Request Review"
                      : "Generate Package"}
                </button>
              )}
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
        <GATESidekickPanel
          draft={draft}
          analysis={analysis}
          sidekick={analysis.sidekick}
          busy={loading === "saving" || loading === "checkout"}
          onBuyerContextPatch={updateBuyerContext}
          onSendMessage={handleSidekickMessage}
          onApplyAction={handleApplySidekickAction}
        />
        <GATECompatibilityWarnings compatibility={analysis.compatibility} />
        <GATEPackageSummary analysis={analysis} savedDraftId={draftId} />
      </div>
    </div>
  );
}
