/**
 * wrapper-entries.js — derive a wrapper package's build entries from the
 * subpaths it publishes.
 *
 * A Vite library build with `preserveModules` emits exactly the modules its
 * entry graph reaches. `src/index.ts` re-exports every component *directly*
 * (`export { default as Card } from './content/Card.vue'`), so it never touches
 * the eight tier barrels — and a component held out of the root barrel on
 * purpose (`barrelExclude`: `arc-code-block`, whose shiki dependency is 13.6 MB)
 * is reached by nothing at all.
 *
 * The result was 18 published subpaths across `@arclux/arc-ui-vue` and
 * `@arclux/arc-ui-solid` that resolve to files no build has ever produced:
 * all eight tier barrels in each, plus `./CodeBlock` — which is the *only*
 * documented way to reach the one component deliberately kept out of the
 * barrel. `npm install` succeeds, the root barrel works, and the import throws.
 *
 * Listing the entries by hand would fix it once and rot on the next component.
 * Deriving them from `exports` makes the build and the export map the same
 * statement: whatever the package promises, the build produces. It is the same
 * promise `scripts/checks/export-map.js` verifies from the other side.
 *
 * @param {string} pkgDir     the package root (the dir holding package.json)
 * @param {string[]} sourceExts  extensions to try, in order, when a dist target
 *                               carries none — `.vue`/`.ts` for Vue,
 *                               `.tsx`/`.ts` for Solid.
 * @returns {string[]} entry paths relative to `pkgDir`, deduplicated and sorted
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function entriesFromExports(pkgDir, sourceExts) {
  const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8'));
  const entries = new Set();
  const unresolved = [];

  /** Every string leaf of an exports entry, however deeply the conditions nest. */
  const targets = (node, out = []) => {
    if (typeof node === 'string') out.push(node);
    else if (node && typeof node === 'object') for (const v of Object.values(node)) targets(v, out);
    return out;
  };

  for (const node of Object.values(manifest.exports ?? {})) {
    for (const target of targets(node)) {
      // Only build outputs are ours to produce. A `./src/...` target under the
      // `solid` condition is shipped source and already exists.
      if (!target.startsWith('./dist/')) continue;
      if (target.includes('*')) continue; // a wildcard promises a directory
      if (target.endsWith('.d.ts')) continue; // declarations come from tsc

      // `dist/content/Card.vue.js` → `src/content/Card.vue`
      // `dist/data/index.js`       → `src/data/index` + an extension
      const stem = join('src', target.slice('./dist/'.length).replace(/\.js$/, ''));

      const found = [stem, ...sourceExts.map((ext) => stem + ext)].find((p) =>
        existsSync(join(pkgDir, p))
      );
      if (found) entries.add(found);
      else unresolved.push(target);
    }
  }

  // A subpath with no source behind it cannot be built into existence, and
  // failing here names it at build time rather than at some consumer's import.
  if (unresolved.length) {
    throw new Error(
      `${manifest.name}: ${unresolved.length} export target(s) have no source file:\n` +
        unresolved.map((t) => `  ${t}`).join('\n')
    );
  }

  // Anti-vacuity: a shape change in `exports` that matched nothing would
  // otherwise build a single-entry library and report success.
  if (entries.size < 50) {
    throw new Error(
      `${manifest.name}: only ${entries.size} build entr(ies) derived from exports — ` +
        'the derivation is broken, not the package'
    );
  }

  return [...entries].sort();
}
