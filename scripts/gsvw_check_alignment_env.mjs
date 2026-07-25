#!/usr/bin/env node
import process from 'node:process';

const requiredForApply = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GESTALTVIEW_INGEST_SECRET',
  'CORS_ORIGINS',
];

function normalizeOrigin(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function mask(value) {
  if (!value) return '(missing)';
  if (value.length <= 10) return `${value.slice(0, 2)}…`;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

let ok = true;
console.log('GestaltView alignment environment check');
console.log('='.repeat(48));

for (const key of requiredForApply) {
  const value = process.env[key] || '';
  const present = Boolean(value);
  ok = ok && present;
  console.log(`${present ? '✓' : '✗'} ${key}: ${key.includes('KEY') || key.includes('SECRET') ? mask(value) : value || '(missing)'}`);
}

const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const expected = 'https://gestaltview-di-gsvw.vercel.app';
if (!origins.includes(expected)) {
  ok = false;
  console.log(`✗ CORS_ORIGINS must include ${expected}`);
} else {
  console.log(`✓ runtime origin allowed: ${expected}`);
}

for (const origin of origins) {
  if (origin.endsWith('/')) {
    ok = false;
    console.log(`✗ origin still has trailing slash: ${origin}`);
  }
}

if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.startsWith('https://')) {
  ok = false;
  console.log('✗ SUPABASE_URL should start with https://');
}

console.log('='.repeat(48));
if (!ok) {
  console.error('Alignment environment is not ready yet. Fix the marked values.');
  process.exit(1);
}
console.log('Alignment environment looks ready.');
