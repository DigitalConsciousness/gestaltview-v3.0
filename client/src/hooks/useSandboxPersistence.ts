import { useCallback, useState } from "react";

import {
  readSandboxState,
  writeSandboxState,
  type SandboxState,
} from "@/lib/sandboxArtifacts";

export function useSandboxPersistence(fallbackState: SandboxState) {
  const [sandboxState, setSandboxState] = useState<SandboxState>(() => readSandboxState(fallbackState));

  const saveSandboxState = useCallback((nextState: SandboxState | ((previous: SandboxState) => SandboxState)) => {
    setSandboxState((previous) => {
      const resolved = typeof nextState === "function" ? nextState(previous) : nextState;
      writeSandboxState(resolved);
      return resolved;
    });
  }, []);

  return {
    sandboxState,
    saveSandboxState,
  };
}
