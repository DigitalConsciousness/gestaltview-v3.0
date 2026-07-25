import { mkdir, symlink, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const repoRoot = path.resolve(new URL('.', import.meta.url).pathname, '..');
const artifactsDir = path.join(repoRoot, 'artifacts');
const outputFile = path.join(artifactsDir, 'embodiment-collaborator-package-v5.zip');
const latestAlias = path.join(artifactsDir, 'latest.zip');

const zipTargets = [
  'README.md',
  'GestaltView-Collaboration-Onboarding-Packet',
  'docs/ContinuityStack.md',
  'docs/CurrentState.md',
  'docs/ContextPersistenceChecklist.md',
  'docs/ContextPersistenceProtocol.md',
  'docs/SessionHandoffPacket.md',
  'docs/Workflows.md',
  'docs/embodiment',
  'embodiment_profiles',
  'shared/embodiment',
  'scripts/validate-continuity-stack.mjs',
  'scripts/sync-embodiment-profiles.ts',
  'scripts/build-embodiment-artifacts.mjs',
  'scripts/README.md',
  'package.json',
  'skills/INDEX.md',
  'skills/gestaltview-repo-onboarding',
  'skills/gestaltview-workflow-operations',
  'skills/gestaltview-current-state-maintenance',
  'skills/gestaltview-cross-repo-workflows',
  'skills/gestaltview-context-architecture',
  'skills/gestaltview-digital-intelligence-collaboration',
  'artifacts/README.md',
];

async function updateLatestAlias(targetFile) {
  try {
    await unlink(latestAlias);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  await symlink(path.basename(targetFile), latestAlias);
}

async function main() {
  await mkdir(artifactsDir, { recursive: true });

  const args = ['-qr', outputFile, ...zipTargets];
  execFileSync('zip', args, { cwd: repoRoot, stdio: 'inherit' });

  await updateLatestAlias(outputFile);

  process.stdout.write(`Wrote ${path.relative(repoRoot, outputFile)}\n`);
  process.stdout.write(`Updated ${path.relative(repoRoot, latestAlias)} -> ${path.basename(outputFile)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
