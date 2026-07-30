#!/usr/bin/env node
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];

if (!version) {
  console.error('Usage: pnpm bump <version>');
  console.error('  e.g. pnpm bump 1.4.0');
  process.exit(1);
}

const packages = [
  '.',
  'packages/web-components',
  'packages/react',
  'packages/vue',
  'packages/svelte',
  'packages/angular',
  'packages/solid',
  'packages/preact',
  'packages/html',
  'docs',
];

for (const pkg of packages) {
  const cwd = resolve(root, pkg);
  try {
    execSync(`pnpm version ${version} --no-git-tag-version`, { cwd, stdio: 'pipe' });
    console.log(`  ${pkg === '.' ? 'root' : pkg} → v${version}`);
  } catch {
    console.log(`  ${pkg} — skipped (no package.json)`);
  }
}

// web-types.json stamps the version it was generated from, so a bump alone
// leaves it behind and the release workflow's generate-diff gate fails before
// it publishes anything — which is exactly how v2.11.1 stalled.
console.log('\nRegenerating version-stamped output…');
execSync('node scripts/generate.js', { cwd: root, stdio: 'inherit' });

console.log(`\nAll packages bumped to v${version}`);
