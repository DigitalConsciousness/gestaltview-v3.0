import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');

try {
  const raw = await readFile(packageJsonPath, 'utf8');
  JSON.parse(raw);
  console.log(`package.json is valid JSON: ${packageJsonPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`package.json validation failed for ${packageJsonPath}`);
  console.error(message);
  process.exitCode = 1;
}
