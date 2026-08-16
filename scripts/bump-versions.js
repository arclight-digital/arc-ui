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

/* Lockstep *versions*, diff-gated *publishing*.
 *
 * 4.6 asked for per-package versioning to replace this. It got the half that
 * was actually costing something — every release put nine tarballs on npm
 * whether or not anything in eight of them had moved — and kept one version
 * line, because the two are separable and only one of them was the problem.
 *
 * A single version number is what makes the release tag mean something: the
 * workflow gates on core's version matching the tag, and `v4.1.0` naming a tree
 * where the Vue wrapper is at 4.0.3 is a tag that describes one package.
 * Per-package numbers also need per-package changelogs and a decision per
 * package per release, which is bookkeeping for one maintainer to carry in
 * exchange for version histories nobody is reading.
 *
 * What diff-gating gives up in return is that a wrapper's version no longer
 * proves it changed — but the git tag does, and scripts/checks/version-floor.js
 * keeps the thing that has to stay true: every wrapper's core floor is a caret
 * stamped at pack time, so an unpublished wrapper still accepts the new core.
 */
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
