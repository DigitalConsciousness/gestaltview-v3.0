import { useCallback } from "react";

import {
  buildSandboxSourceRoom,
  buildSandboxArtifactPayload,
  resolveSandboxArtifactId,
  storeSandboxArtifactRecord,
  type SandboxArtifactPayload,
  type SandboxState,
} from "@/lib/sandboxArtifacts";
import {
  createArtifact as createGenEngineArtifact,
  getDefaultConsent,
} from "@/lib/genEngineClient";
import type { ArtifactSynthesisResponse } from "@shared/gen-engine";

export type SandboxArtifactCreationResult = {
  artifactId: string;
  response: ArtifactSynthesisResponse & {
    codexArtifactId?: string;
  };
  payload: SandboxArtifactPayload;
};

export function useCreateArtifact() {
  const createArtifact = useCallback(
    async (
      payload: SandboxArtifactPayload,
      sandboxState: SandboxState,
      previewSnapshot?: string,
    ): Promise<SandboxArtifactCreationResult> => {
      const response = (await createGenEngineArtifact({
        sourceCaptureIds: [`sandbox:${payload.mode}`],
        sourceArtifactIds: [],
        targetType: "code",
        synthesisStyle: "faithful",
        destination: "download-only",
        preserveExactLanguage: true,
        plkMode: "full-resonance-pass",
        title: payload.title,
        summary: `Sandbox export from ${payload.mode} mode.`,
        sourceTitle: payload.title,
        sourceText: payload.sourceCode,
        sourceRoom: buildSandboxSourceRoom(),
        consent: getDefaultConsent(),
        tags: ["sandbox", payload.mode, "multimodal"],
      })) as ArtifactSynthesisResponse & {
        codexArtifactId?: string;
      };

      const artifactId = resolveSandboxArtifactId(response);
      storeSandboxArtifactRecord({
        artifactId,
        payload,
        response,
        savedAt: new Date().toISOString(),
      });

      if (previewSnapshot) {
        storeSandboxArtifactRecord({
          artifactId,
          payload: buildSandboxArtifactPayload(payload.mode, sandboxState, previewSnapshot),
          response,
          savedAt: new Date().toISOString(),
        });
      }

      return {
        artifactId,
        response,
        payload,
      };
    },
    [],
  );

  return {
    createArtifact,
  };
}
