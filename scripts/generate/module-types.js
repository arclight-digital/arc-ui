/**
 * generate-module-types.js
 *
 * Emits .d.ts for every exported module that is not a custom element, straight
 * from its JSDoc. Element classes are declared in types/index.d.ts by
 * generate-types.js; everything else — shared controllers and mixins, the dev
 * warnings module, the icon registries — had no declarations at all, which is
 * how a subpath ends up resolving to implicit `any` in a consumer.
 *
 * The work list is derived from the exports map rather than hardcoded, so a
 * newly exported module gets declarations without anyone remembering to add it
 * here. Declarations are generated, never hand-written — the same rule
 * generate-types.js follows.
 *
 * Run via: pnpm generate (before generate-exports.js, which asserts that every
 * file this produces exists)
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const pkgDir = path.join(root, 'packages', 'web-components');
const srcDir = path.join(pkgDir, 'src');
const tsc = path.join(root, 'node_modules', '.bin', 'tsc');

const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'));

/**
 * True when a target's types come from the shared types/index.d.ts rather than
 * from a declaration of its own: element registrations and barrel modules.
 */
function coveredByIndex(target) {
  return (
    target.endsWith('.register.js') ||
    target === './src/index.js' ||
    target === './src/register.js' ||
    /^\.\/src\/[\w-]+\/index\.js$/.test(target)
  );
}

const targets = [...new Set(
  Object.entries(pkg.exports)
    .filter(([key]) => !key.includes('*'))
    .map(([, value]) => (typeof value === 'string' ? value : value.default))
    .filter((t) => t && t.endsWith('.js') && !coveredByIndex(t)),
)].sort();

const entries = targets
  // Modules shipping a declaration alongside the source (the icon packs) own
  // their own types; re-emitting would duplicate ~200KB to no purpose.
  .filter((t) => !fs.existsSync(path.join(pkgDir, t.replace(/\.js$/, '.d.ts'))))
  .map((t) => path.join(pkgDir, t))
  .filter((f) => fs.existsSync(f));

if (entries.length === 0) {
  console.log('generate-module-types: nothing to emit');
  process.exit(0);
}

// tsc emits declarations for the whole transitive program, not just the files
// named on the command line — which here means every per-icon module, some 15MB
// of them. Emit to a scratch directory and copy only what was asked for.
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'arc-module-types-'));

try {
  execFileSync(
    tsc,
    [
      '--allowJs',
      '--declaration',
      '--emitDeclarationOnly',
      '--skipLibCheck',
      '--module', 'esnext',
      '--moduleResolution', 'bundler',
      '--target', 'esnext',
      '--rootDir', srcDir,
      '--outDir', stage,
      ...entries,
    ],
    { stdio: 'pipe' },
  );

  const typesDir = path.join(pkgDir, 'types');
  const copied = [];

  for (const entry of entries) {
    const rel = path.relative(srcDir, entry).replace(/\.js$/, '.d.ts');
    const from = path.join(stage, rel);
    if (!fs.existsSync(from)) {
      throw new Error(`generate-module-types: tsc emitted no declaration for ${rel}`);
    }
    const to = path.join(typesDir, rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    copied.push(rel);
  }

  // These declarations currently reference nothing inside the package, so
  // copying them in isolation is complete. If that ever changes, the sibling
  // would resolve to a file that was never copied — fail rather than ship a
  // declaration with a dangling import.
  for (const rel of copied) {
    const text = fs.readFileSync(path.join(typesDir, rel), 'utf-8');
    for (const m of text.matchAll(/from\s+'(\.[^']+)'/g)) {
      const target = path
        .join(path.dirname(rel), m[1])
        .replace(/\.js$/, '.d.ts');
      if (!copied.includes(target) && !fs.existsSync(path.join(typesDir, target))) {
        throw new Error(
          `generate-module-types: ${rel} imports '${m[1]}', which is not among the ` +
            'emitted declarations. Add its module to the exports map, or copy it here too.',
        );
      }
    }
  }

  console.log(`generate-module-types: emitted declarations for ${copied.length} module(s)`);
} catch (err) {
  const out = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`.trim();
  console.error(out || err.message);
  process.exit(1);
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
