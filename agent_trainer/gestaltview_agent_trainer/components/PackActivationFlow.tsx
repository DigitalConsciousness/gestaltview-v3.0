import { useEffect, useState } from "react";
import {
  buildStarterPackRouteRequest,
  buildImportManifestForPack,
  buildStarterPackPlan,
  previewStarterPacks
} from "../api/packs";
import { sourceBundles } from "../config/sourceBundles";
import type { KitTierName } from "../config/tiers";
import {
  Surface,
  Tag,
  autoGridStyle,
  glassCardStyle,
  glassNightCardStyle,
  subtleTextStyle
} from "./kitPrimitives";

interface PackActivationFlowProps {
  tier: KitTierName;
}

export function PackActivationFlow({ tier }: PackActivationFlowProps) {
  const previews = previewStarterPacks();
  const [selectedPackSlug, setSelectedPackSlug] = useState<string>(previews[0]?.slug ?? "");
  const [selectedBundleSlugs, setSelectedBundleSlugs] = useState<string[]>(
    previews[0]?.recommendedSourceBundles ?? []
  );
  const [userId, setUserId] = useState("replace-with-user-id");
  const [projectName, setProjectName] = useState("replace-with-project-name");
  const [owner, setOwner] = useState("replace-with-owner");

  useEffect(() => {
    const nextPreview = previews.find((preview) => preview.slug === selectedPackSlug);
    setSelectedBundleSlugs(nextPreview?.recommendedSourceBundles ?? []);
  }, [selectedPackSlug]);

  const planResult = buildStarterPackPlan(selectedPackSlug, selectedBundleSlugs);
  const manifestResult = buildImportManifestForPack(
    selectedPackSlug,
    projectName,
    owner,
    selectedBundleSlugs
  );

  const plan = planResult.data;
  const manifest = manifestResult.data;
  const routeRequest = buildStarterPackRouteRequest({
    packSlug: selectedPackSlug,
    userId,
    selectedBundleSlugs,
    projectName,
    owner
  });
  const executionReady =
    userId.trim().length > 0 &&
    projectName.trim().length > 0 &&
    owner.trim().length > 0 &&
    selectedBundleSlugs.length > 0;
  const applyCommand =
    `npm run cli -- apply ${userId} ${selectedPackSlug} ${projectName} ${owner} ` +
    `${selectedBundleSlugs.join(",")} ./buyer-import.json`;

  function toggleBundle(bundleSlug: string): void {
    setSelectedBundleSlugs((current) =>
      current.includes(bundleSlug)
        ? current.filter((slug) => slug !== bundleSlug)
        : [...current, bundleSlug]
    );
  }

  return (
    <Surface
      eyebrow="Pack Activation"
      title="Choose a Pack, Then Choose the Study Surface"
      description={`Current tier: ${tier}. This flow turns the starter-pack concept into a buyer-safe activation plan instead of a static catalog.`}
    >
      <div style={autoGridStyle}>
        <div style={{ ...glassCardStyle, gap: 12 }}>
          <strong style={{ fontSize: "1.05rem" }}>Step 1: Execution context</strong>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={subtleTextStyle}>User ID</span>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={subtleTextStyle}>Project name</span>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={subtleTextStyle}>Owner</span>
            <input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div
          style={{
            ...glassCardStyle,
            gap: 12,
            background: executionReady
              ? "color-mix(in srgb, var(--gsvw-color-accent-primary) 14%, white)"
              : "color-mix(in srgb, var(--gsvw-color-warning) 14%, white)",
            border: executionReady
              ? "1px solid color-mix(in srgb, var(--gsvw-color-accent-primary) 30%, white)"
              : "1px solid color-mix(in srgb, var(--gsvw-color-warning) 30%, white)"
          }}
        >
          <strong style={{ fontSize: "1.05rem" }}>Execution readiness</strong>
          <span style={subtleTextStyle}>
            {executionReady
              ? "Ready to apply through the CLI or an env-backed /api/packs adapter."
              : "Complete the execution context and select at least one bundle."}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Tag tone={executionReady ? "accent" : "warm"}>
              {executionReady ? "ready to execute" : "missing execution context"}
            </Tag>
            <Tag tone="soft">{selectedBundleSlugs.length} bundles selected</Tag>
          </div>
        </div>
      </div>

      <div style={autoGridStyle}>
        {previews.map((preview) => {
          const isSelected = preview.slug === selectedPackSlug;

          return (
            <button
              key={preview.slug}
              type="button"
              onClick={() => setSelectedPackSlug(preview.slug)}
              style={{
                display: "grid",
                gap: 12,
                textAlign: "left",
                padding: 18,
                borderRadius: 20,
                cursor: "pointer",
                border: isSelected
                  ? "1px solid color-mix(in srgb, var(--gsvw-color-accent-primary) 55%, white)"
                  : "1px solid var(--gsvw-color-border-strong)",
                background: isSelected
                  ? "color-mix(in srgb, var(--gsvw-color-accent-primary) 12%, white)"
                  : "var(--gsvw-color-panel-glass)"
              }}
            >
              <Tag tone={preview.kind === "tools" ? "warm" : "accent"}>{preview.kind}</Tag>
              <strong style={{ fontSize: "1.05rem" }}>{preview.title}</strong>
              <p style={subtleTextStyle}>{preview.summary}</p>
              <span style={subtleTextStyle}>
                skills: {preview.generatedSkills.length} • memory: {preview.generatedMemoryKeys.length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={autoGridStyle}>
        <div style={{ ...glassCardStyle, gap: 14 }}>
          <strong style={{ fontSize: "1.05rem" }}>Step 2: Choose source bundles</strong>
          <p style={subtleTextStyle}>
            Buyers should explicitly choose the study bundles they want to activate before loading any real material.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {sourceBundles.map((bundle) => (
              <label
                key={bundle.slug}
                style={{
                  ...glassCardStyle,
                  gap: 8,
                  padding: 14
                }}
              >
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedBundleSlugs.includes(bundle.slug)}
                    onChange={() => toggleBundle(bundle.slug)}
                  />
                  <strong>{bundle.title}</strong>
                  <Tag tone={bundle.lane === "product" ? "warm" : "accent"}>{bundle.lane}</Tag>
                </span>
                <span style={subtleTextStyle}>{bundle.summary}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ ...glassCardStyle, gap: 14 }}>
          <strong style={{ fontSize: "1.05rem" }}>Step 3: Review activation plan</strong>
          {plan ? (
            <>
              <div style={{ display: "grid", gap: 8 }}>
                <span style={subtleTextStyle}>Selected pack: {plan.title}</span>
                <span style={subtleTextStyle}>
                  Bundles: {plan.selectedSourceBundles.join(", ") || "none selected"}
                </span>
                <span style={subtleTextStyle}>
                  Skills seeded: {plan.generatedSkills.length} • Memory keys seeded: {plan.generatedMemoryKeys.length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {plan.nextActions.map((action) => (
                  <div
                    key={action}
                    style={{
                      ...glassCardStyle,
                      padding: 12
                    }}
                  >
                    <span style={subtleTextStyle}>{action}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={subtleTextStyle}>{planResult.error?.message ?? "No plan available."}</p>
          )}
        </div>
      </div>

      <div style={autoGridStyle}>
        <div style={{ ...glassCardStyle, gap: 12 }}>
          <strong style={{ fontSize: "1.05rem" }}>Step 4: Route payload preview</strong>
          <p style={subtleTextStyle}>
            This is the exact request shape a future `/api/packs` endpoint can accept when wrapped in Express, Vercel, or another runtime.
          </p>
          <pre style={preStyle}>{JSON.stringify(routeRequest, null, 2)}</pre>
        </div>

        <div style={{ ...glassCardStyle, gap: 12 }}>
          <strong style={{ fontSize: "1.05rem" }}>Step 5: Execution path</strong>
          <p style={subtleTextStyle}>
            The CLI is the current real execution path for applying a pack to a configured buyer workspace.
          </p>
          <pre style={preStyle}>{applyCommand}</pre>
        </div>
      </div>

      <div style={{ ...glassCardStyle, gap: 12 }}>
        <strong style={{ fontSize: "1.05rem" }}>Step 6: Buyer-owned import manifest</strong>
        <p style={subtleTextStyle}>
          The next step is to fill this manifest with buyer-owned sources only. This is the hard boundary between the package scaffold and any real customer corpus.
        </p>
        <pre style={preStyle}>{JSON.stringify(manifest ?? manifestResult.error, null, 2)}</pre>
      </div>
    </Surface>
  );
}

const inputStyle = {
  border: "1px solid var(--gsvw-color-border-strong)",
  borderRadius: 12,
  padding: "10px 12px",
  background: "var(--gsvw-color-panel-glass-strong)",
  color: "var(--gsvw-color-text-primary)",
  fontFamily: "inherit"
} as const;

const preStyle = {
  ...glassNightCardStyle,
  margin: 0,
  overflow: "auto",
  fontSize: 12
} as const;
