#!/usr/bin/env node
/**
 * Generates the exports map for each framework wrapper package from the
 * prism-generated file tree — the wrapper twin of generate-exports.js.
 *
 * Every component gets its own subpath (`@arclux/arc-ui-react/Button`), so
 * consumers that can't tree-shake a 186-export barrel (Jest, ts-node, older
 * builders) can import one component without paying for the rest. The `"./*"`
 * wildcard the packages used to carry is gone: it published every internal
 * file as unversioned API and was exempt from existence assertions — an
 * exports surface nobody could refactor safely.
 *
 * Built packages (react, preact) point at `dist/` — compiled JS next to real
 * declarations. Source-shipping packages (vue, svelte, solid, angular) keep
 * `src/` targets; their formats are what their toolchains consume directly.
 *
 * Run via `pnpm generate` (after the Prism step, whose output it maps).
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const TIERS = ['content', 'data', 'typography', 'input', 'navigation', 'layout', 'feedback'];

/**
 * Modes describe what each package's build emits:
 *   dist        — tsc/vite output: .d.ts next to .js per module
 *   dist-vue    — vite preserveModules (X.vue.js) + vue-tsc (X.vue.d.ts)
 *   dist-svelte — svelte-package: shipped .svelte + svelte2tsx .svelte.d.ts,
 *                 with the `svelte` condition Svelte tooling resolves
 *   dist-solid  — compiled fallback + declarations, plus a `solid` condition
 *                 pointing at source .tsx so Solid's own compiler (which owns
 *                 reactivity) processes the JSX instead of the prebuilt copy
 *
 * Angular is absent on purpose: ng-packagr owns its published package.json
 * (APF: FESM + partial-Ivy declarations, single entry). Any exports written
 * into its source manifest get copied verbatim into dist and ship broken.
 */
const PACKAGES = [
  { dir: 'react',  ext: '.ts',     mode: 'dist' },
  { dir: 'preact', ext: '.tsx',    mode: 'dist' },
  { dir: 'solid',  ext: '.tsx',    mode: 'dist-solid' },
  { dir: 'svelte', ext: '.svelte', mode: 'dist-svelte' },
  { dir: 'vue',    ext: '.vue',    mode: 'dist-vue' },
];

function entry(pkg, rel) {
  const base = rel.replace(/\.(tsx|ts|svelte|vue)$/, '');
  switch (pkg.mode) {
    case 'dist':
      return { types: `./dist/${base}.d.ts`, default: `./dist/${base}.js` };
    case 'dist-solid':
      return {
        types: `./dist/${base}.d.ts`,
        solid: `./src/${rel}`,
        default: `./dist/${base}.js`,
      };
    case 'dist-svelte':
      return rel.endsWith('.svelte')
        ? {
            types: `./dist/${base}.svelte.d.ts`,
            svelte: `./dist/${base}.svelte`,
            default: `./dist/${base}.svelte`,
          }
        : { types: `./dist/${base}.d.ts`, svelte: `./dist/${base}.js`, default: `./dist/${base}.js` };
    case 'dist-vue':
      return rel.endsWith('.vue')
        ? { types: `./dist/${base}.vue.d.ts`, default: `./dist/${base}.vue.js` }
        : { types: `./dist/${base}.d.ts`, default: `./dist/${base}.js` };
  }
}

let failures = 0;

for (const pkg of PACKAGES) {
  const pkgDir = resolve(root, 'packages', pkg.dir);
  const srcDir = resolve(pkgDir, 'src');
  const exports = { '.': entry(pkg, 'index.ts') };

  for (const tier of TIERS) {
    const tierDir = resolve(srcDir, tier);
    if (!existsSync(tierDir)) continue;
    exports[`./${tier}`] = entry(pkg, `${tier}/index.ts`);
    for (const file of readdirSync(tierDir).sort()) {
      if (file.startsWith('index.')) continue;
      if (!file.endsWith(pkg.ext)) continue;
      const name = file.replace(/\.(tsx|ts|svelte|vue)$/, '');
      exports[`./${name}`] = entry(pkg, `${tier}/${file}`);
    }
  }
  if (existsSync(resolve(srcDir, 'shared'))) {
    exports['./shared'] = entry(pkg, 'shared/index.ts');
  }

  // Assert every target that points at *source* exists; dist targets are
  // asserted by the package build (tsc/vite fail loudly), not by this script.
  for (const [subpath, target] of Object.entries(exports)) {
    const srcTargets = Object.values(target).filter((t) => t.startsWith('./src/'));
    for (const t of srcTargets) {
      if (!existsSync(resolve(pkgDir, t))) {
        console.error(`  ${pkg.dir}: ${subpath} → ${t} does not exist`);
        failures++;
      }
    }
  }

  const pkgJsonPath = resolve(pkgDir, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  pkgJson.exports = exports;
  pkgJson.main = 'dist/index.js';
  pkgJson.module = 'dist/index.js';
  pkgJson.types = 'dist/index.d.ts';
  pkgJson.files = ['dist/', 'src/'];
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  console.log(`  ${pkg.dir}: ${Object.keys(exports).length} subpaths (${pkg.mode})`);
}

if (failures > 0) {
  console.error(`\n✗ ${failures} export target(s) missing`);
  process.exit(1);
}
console.log('✓ wrapper exports maps generated');
