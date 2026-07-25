import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  GatePersistedStateSchema,
  type GatePersistedState,
} from "../../shared/gate/schemas.js";

const defaultState: GatePersistedState = {
  version: 1,
  buyers: [],
  drafts: [],
  sidekickByDraftId: {},
  orders: [],
  orderItems: [],
  buildJobs: [],
  artifacts: [],
  supportRequests: [],
};

function gateRootDir(): string {
  return process.env.GATE_DATA_DIR?.trim()
    ? path.resolve(process.env.GATE_DATA_DIR)
    : path.join(os.tmpdir(), "gestaltview-gate");
}

export function gateStatePath(): string {
  return path.join(gateRootDir(), "state.json");
}

export function gateArtifactsDir(): string {
  return path.join(gateRootDir(), "artifacts");
}

export function gateBuildsDir(): string {
  return path.join(gateRootDir(), "builds");
}

async function ensureRootDir() {
  await fs.mkdir(gateRootDir(), { recursive: true });
}

export async function loadGateState(): Promise<GatePersistedState> {
  await ensureRootDir();
  const filePath = gateStatePath();

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return GatePersistedStateSchema.parse(JSON.parse(raw));
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    if (code === "ENOENT") {
      return defaultState;
    }
    throw error;
  }
}

export async function saveGateState(state: GatePersistedState): Promise<void> {
  await ensureRootDir();
  const filePath = gateStatePath();
  const nextState = GatePersistedStateSchema.parse(state);
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(nextState, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}
