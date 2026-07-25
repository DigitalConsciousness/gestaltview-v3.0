// GestaltView v2 — Billy Full System Check
// © 2026 Keith Soyka / GestaltView

import { diagnoseBilly } from "../shared/billy/diagnostics";

const GREEN = "[32m";
const RED = "[31m";
const CYAN = "[36m";
const RESET = "[0m";

async function main(): Promise<void> {
  const diagnosis = await diagnoseBilly();
  const keys = Object.keys(diagnosis.status) as Array<keyof typeof diagnosis.status>;
  const hasFailures = keys.some((key) => !diagnosis.status[key]);

  console.log(`${CYAN}Billy.diagnose() — Full System Check${RESET}`);
  console.log("");

  for (const key of keys) {
    const ok = diagnosis.status[key];
    const icon = ok ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    console.log(`${icon} ${key}: ${diagnosis.details[key]}`);
  }

  console.log("");
  if (hasFailures) {
    console.error(`${RED}Billy check failed. See actionable messages above.${RESET}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${GREEN}Billy check passed with all systems green.${RESET}`);
}

void main();
