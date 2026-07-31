/**
 * check-wrapper-types.js
 *
 * Compiles the generated React wrappers (and the react-jsx.d.ts augmentation)
 * with tsc. The wrappers ship as raw .ts and nothing in this repo consumes
 * them, so without this a generated wrapper can be a hard TypeScript error
 * and still publish — which is exactly how the 2.11.0 default-slot regression
 * reached npm ("React breaks at the type level", check-wrapper-slots.js).
 *
 * KNOWN_ERRORS is a baseline, not an exemption list: every entry names a real
 * defect that is too breaking to fix in v2, with the v3 plan. An entry that
 * stops matching fails the check so the baseline can only shrink.
 *
 * Run via: pnpm run check:wrapper-types (and as part of pnpm generate)
 */

import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/**
 * `file::TScode` → reason. Empty since v3 renamed the three props that
 * shadowed native DOM members (diff.original/revised, nav-item.subItems,
 * gradient-text.animated) — a prop shadowing an HTMLElement member makes the
 * element structurally not an HTMLElement, and @lit/react's createComponent
 * rejects the class. Add entries only for defects too breaking to fix now,
 * with the plan.
 */
const KNOWN_ERRORS = new Map([
  // none
]);

const TSC_RUNS = [
  // The built packages compile with their own project configs — the same
  // invocation `pnpm build` uses, so the check can't drift from the build.
  ['-p', 'packages/react/tsconfig.json', '--noEmit'],
  ['-p', 'packages/preact/tsconfig.json', '--noEmit'],
  // The opt-in JSX augmentation ships from web-components and has no project.
  ['--noEmit', '--skipLibCheck', '--moduleResolution', 'bundler',
    '--module', 'esnext', '--target', 'es2022', '--jsx', 'react-jsx',
    'packages/web-components/types/react-jsx.d.ts'],
];

let output = '';
for (const args of TSC_RUNS) {
  try {
    output += execFileSync(resolve(root, 'node_modules/.bin/tsc'), args, {
      cwd: root, encoding: 'utf-8',
    });
  } catch (err) {
    output += `${err.stdout ?? ''}${err.stderr ?? ''}`;
  }
}

const seen = new Set();
let unexpected = 0;

for (const line of output.split('\n')) {
  const m = line.match(/^(.+?)\(\d+,\d+\): error (TS\d+):/);
  if (!m) continue;
  const key = `${m[1]}::${m[2]}`;
  if (KNOWN_ERRORS.has(key)) {
    seen.add(key);
    continue;
  }
  console.error(`  ${line.trim()}`);
  unexpected++;
}

let stale = 0;
for (const [key, reason] of KNOWN_ERRORS) {
  if (!seen.has(key)) {
    console.error(`  stale baseline entry no longer matches: ${key} (${reason}) — delete it`);
    stale++;
  }
}

if (unexpected > 0 || stale > 0) {
  console.error(`\n✗ wrapper typecheck: ${unexpected} new error(s), ${stale} stale baseline entr(y/ies)`);
  process.exit(1);
}

console.log(`✓ react + preact wrappers and react-jsx.d.ts compile (${KNOWN_ERRORS.size} baselined)`);
