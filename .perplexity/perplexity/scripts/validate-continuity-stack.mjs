import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const requiredFiles = [
  'docs/ContinuityStack.md',
  'docs/CurrentState.md',
  'docs/ContextPersistenceChecklist.md',
  'docs/ContextPersistenceProtocol.md',
  'docs/SessionHandoffPacket.md',
  'docs/Workflows.md',
  'artifacts/README.md',
  'artifacts/latest.zip',
  'scripts/README.md',
  'package.json',
  'README.md',
  'GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/README.md',
  'GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/PACKET_INDEX.md',
  'GestaltView-Collaboration-Onboarding-Packet/06_COLLABORATION_TEMPLATES/handoff_template.md',
  'GestaltView-Collaboration-Onboarding-Packet/06_COLLABORATION_TEMPLATES/task_brief_template.md',
];

const checks = [
  {
    file: 'docs/ContinuityStack.md',
    patterns: [
      'docs/CurrentState.md',
      'docs/ContextPersistenceChecklist.md',
      'docs/SessionHandoffPacket.md',
      'docs/ContextPersistenceProtocol.md',
      'docs/SessionHandoffPacket.md',
      'embodiment_profiles/',
      'scripts/validate-embodiment-profiles.mjs',
      'scripts/build-embodiment-artifacts.mjs',
      'scripts/sync-embodiment-profiles.ts',
    ],
  },
  {
    file: 'docs/SessionHandoffPacket.md',
    patterns: [
      'Use this together with [ContinuityStack.md](./ContinuityStack.md).',
      '## Default order',
      'artifacts/',
    ],
  },
  {
    file: 'docs/ContinuityStack.md',
    patterns: ['artifacts/', 'Session Handoff Packet'],
  },
  {
    file: 'docs/Workflows.md',
    patterns: [
      'docs/ContinuityStack.md',
      'docs/SessionHandoffPacket.md',
      'GestaltView-Collaboration-Onboarding-Packet/',
    ],
  },
  {
    file: 'artifacts/README.md',
    patterns: ['embodiment-collaborator-package-v5.zip', 'latest.zip', 'handoff bundles', 'npm run package:collaborator'],
  },
  {
    file: 'scripts/README.md',
    patterns: ['npm run package:collaborator', 'refreshes `artifacts/latest.zip`'],
  },
  {
    file: 'package.json',
    patterns: ['package:collaborator'],
  },
  {
    file: 'README.md',
    patterns: ['artifacts/README.md', 'Handoff bundles live in `artifacts/` by default'],
  },
  {
    file: 'GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/README.md',
    patterns: [
      'docs/ContinuityStack.md',
      'artifacts/README.md',
      'scripts/sync-embodiment-profiles.ts',
      'scripts/build-embodiment-artifacts.mjs',
    ],
  },
  {
    file: 'GestaltView-Collaboration-Onboarding-Packet/06_COLLABORATION_TEMPLATES/handoff_template.md',
    patterns: ['## Intention', '## Targets'],
  },
  {
    file: 'GestaltView-Collaboration-Onboarding-Packet/06_COLLABORATION_TEMPLATES/task_brief_template.md',
    patterns: ['## Intention', '## Targets'],
  },
  {
    file: 'docs/embodiment/EMBODIMENT_COLLABORATOR_PACKAGE.md',
    patterns: [
      'docs/ContinuityStack.md',
      'Read `docs/ContinuityStack.md`, the packet index, and the embodiment inventory.',
    ],
  },
  {
    file: 'GestaltView-Collaboration-Onboarding-Packet/00_READ_FIRST/PACKET_INDEX.md',
    patterns: ['continuity stack', 'intent/target framing', 'intention/target templates'],
  },
];

let failures = 0;

for (const file of requiredFiles) {
  const fullPath = path.resolve(root, file);
  try {
    await readFile(fullPath, 'utf8');
  } catch {
    console.error(`missing file: ${file}`);
    failures += 1;
  }
}

for (const { file, patterns } of checks) {
  const fullPath = path.resolve(root, file);
  let content;
  try {
    content = await readFile(fullPath, 'utf8');
  } catch {
    continue;
  }

  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      console.error(`missing pattern in ${file}: ${pattern}`);
      failures += 1;
    }
  }
}

if (failures > 0) {
  console.error(`continuity stack validation failed with ${failures} issue(s)`);
  process.exitCode = 1;
} else {
  console.log('continuity stack validation passed');
}
