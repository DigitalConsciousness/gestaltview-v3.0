#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const packagePath = path.resolve('package.json');
if (!fs.existsSync(packagePath)) {
  console.error('package.json not found. Run from gestaltview-v2.0 repo root.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts ??= {};

const additions = {
  'gsvw:env': 'node scripts/gsvw_check_alignment_env.mjs',
  'ingest:align:dry-run': 'python3 scripts/gsvw_align_ingest.py --map config/gsvw-ingestion-map.example.json --dry-run',
  'ingest:align': 'python3 scripts/gsvw_align_ingest.py --map config/gsvw-ingestion-map.example.json --apply',
  'supabase:functions:deploy:alignment': 'npx supabase functions deploy gsvw-ingest-batch && npx supabase functions deploy gsvw-runtime-health && npx supabase functions deploy gsvw-capture-event && npx supabase functions deploy gsvw-dormancy-review',
  'supabase:functions:serve:ingest': 'npx supabase functions serve gsvw-ingest-batch --env-file supabase/functions/.env.local'
};

let changed = false;
for (const [key, value] of Object.entries(additions)) {
  if (pkg.scripts[key] !== value) {
    pkg.scripts[key] = value;
    changed = true;
  }
}

if (!changed) {
  console.log('package.json already has alignment scripts.');
  process.exit(0);
}

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log('Updated package.json with GestaltView alignment scripts.');
