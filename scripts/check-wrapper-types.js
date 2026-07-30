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
 * `file::TScode` → reason. All three are component props that shadow native
 * DOM members, so the element class is structurally not an HTMLElement and
 * @lit/react's createComponent rejects it. The fix is renaming the props —
 * a breaking change batched for v3.
 */
const KNOWN_ERRORS = new Map([
  ['packages/react/src/data/Diff.ts::TS2322',
    'arc-diff props `before`/`after` shadow ChildNode.before()/after() — rename in v3'],
  ['packages/react/src/navigation/NavItem.ts::TS2322',
    'arc-nav-item getter `children` shadows ParentNode.children (navigation-menu depends on the Array it returns) — rename in v3'],
  ['packages/react/src/typography/GradientText.ts::TS2322',
    'arc-gradient-text prop `animate` shadows Element.animate() — rename in v3'],
]);

const TSC_ARGS = [
  '--noEmit', '--skipLibCheck',
  '--moduleResolution', 'bundler',
  '--module', 'esnext',
  '--target', 'es2022',
  '--jsx', 'react-jsx',
  'packages/react/src/index.ts',
  'packages/web-components/types/react-jsx.d.ts',
];

let output = '';
try {
  output = execFileSync(resolve(root, 'node_modules/.bin/tsc'), TSC_ARGS, {
    cwd: root, encoding: 'utf-8',
  });
} catch (err) {
  output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
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

console.log(`✓ React wrappers + react-jsx.d.ts compile (${KNOWN_ERRORS.size} known v3-batched errors baselined)`);
