import { useMemo } from "react";
import { Link, useRoute } from "wouter";

import ArtifactDeepView from "@/components/ArtifactDeepView";
import type { ArtifactScreenModel } from "@/components/ArtifactScreen";
import { useSEO } from "@/hooks/useSEO";
import {
  artifactResponseToScreenModel,
  readSandboxArtifactRecord,
} from "@/lib/sandboxArtifacts";

const BASE_URL = "https://gestaltview-di-gsvw.vercel.app";

export default function SandboxArtifactDetailPage() {
  const [match, params] = useRoute<{ artifactId: string }>("/app/artifacts/:artifactId");
  const artifactId = params?.artifactId ?? "";
  const record = useMemo(() => readSandboxArtifactRecord(artifactId), [artifactId]);

  useSEO({
    title: record
      ? `${record.payload.title} | Sandbox Artifact | GestaltView`
      : "Sandbox Artifact | GestaltView",
    description: record
      ? `Saved sandbox artifact for ${record.payload.mode} mode.`
      : "Saved sandbox artifact detail surface.",
    h1: "Sandbox Artifact Detail",
    canonical:
      typeof window !== "undefined"
        ? window.location.href
        : `${BASE_URL}/app/artifacts/${artifactId}`,
  });

  const artifact = useMemo<ArtifactScreenModel | null>(() => {
    if (!record) {
      return null;
    }

    return artifactResponseToScreenModel(record.response.artifact);
  }, [record]);

  const sessionOrigin = record ? `Sandbox · ${record.payload.mode.toUpperCase()}` : "Sandbox export";
  const plkConnections = record
    ? [`Saved from the Multi-Modal Sandbox`, `Created ${new Date(record.payload.metadata.createdAt).toLocaleString()}`]
    : [];

  const externalLinks = record
    ? [`Sandbox version ${record.payload.metadata.sandboxVersion}`, record.payload.previewSnapshot ? "Preview snapshot preserved" : "No snapshot captured"]
    : [];

  return (
    <div className="min-h-screen bg-[#020307] px-4 py-6 text-white sm:px-6 lg:px-8">
      {match && artifact ? (
        <ArtifactDeepView
          open
          artifact={artifact}
          sessionOrigin={sessionOrigin}
          plkConnections={plkConnections}
          externalLinks={externalLinks}
          resonanceLinks={[]}
          onClose={() => {
            if (window.history.length > 1) {
              window.history.back();
              return;
            }

            window.location.assign("/app/sandbox");
          }}
        />
      ) : (
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.24em] text-gv-text-muted">Sandbox artifact</p>
            <h1 className="mt-3 text-3xl font-semibold text-gv-text-primary">
              Artifact not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-gv-text-secondary">
              We could not find a saved sandbox artifact for this id in the local browser store.
            </p>
            <div className="mt-6">
              <Link
                href="/app/sandbox"
                className="inline-flex items-center rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-5 py-2.5 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/15"
              >
                Back to sandbox
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
