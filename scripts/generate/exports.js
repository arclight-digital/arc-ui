/**
 * generate-exports.js
 *
 * Syncs the `exports` field in packages/web-components/package.json
 * from the actual .register.js files on disk, and attaches a "types"
 * condition to every JavaScript subpath.
 *
 * A bare-string export publishes no types for that subpath, so consuming
 * TypeScript silently falls back to implicit `any` — the package looks typed
 * because the root entry is, while every deep import is not. Both failures are
 * invisible from inside this repo, since nothing here imports itself by
 * package name. So this script asserts rather than assumes:
 *
 *   - every export target must exist on disk — including each target inside an
 *     already-conditioned entry, which is every entry after its first pass
 *   - every JavaScript target must resolve to a .d.ts that exists
 *
 * Either failure exits non-zero, which fails `pnpm generate` and therefore the
 * generate-diff CI gate. Adding a subpath without types is not something you
 * can forget to notice.
 *
 * Entries are never *removed* here. Deleting a published subpath is a breaking
 * change with a MIGRATION entry behind it, so it is a hand edit that this
 * script then verifies — not a silent consequence of deleting a source file.
 *
 * Run via: pnpm run generate:exports
 * Called automatically as part of: pnpm generate (after the types steps)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(__dirname, '..', '..', 'packages', 'web-components');
const pkgPath = path.join(pkgDir, 'package.json');
const srcDir = path.join(pkgDir, 'src');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const existing = pkg.exports;

// Collect all .register.js files
function findRegisterFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRegisterFiles(full));
    } else if (entry.name.endsWith('.register.js')) {
      results.push(full);
    }
  }
  return results;
}

const registerFiles = findRegisterFiles(srcDir);
let added = 0;

for (const file of registerFiles) {
  const rel = './' + path.relative(pkgDir, file).replace(/\\/g, '/');
  const name = path.basename(file, '.register.js');
  const key = `./${name}`;

  if (!existing[key]) {
    existing[key] = rel;
    added++;
  }
}

/**
 * Declaration file for a JavaScript export target, or null when the target
 * needs no types (stylesheets).
 *
 * Element modules all resolve to the single generated types/index.d.ts, which
 * declares every element class. Shared modules get their own declaration,
 * emitted from JSDoc by generate-shared-types.js.
 */
function typesFor(target) {
  if (target.endsWith('.css')) return null;
  if (target.endsWith('.d.ts')) return target;

  // Element registrations, the register barrel, the root and per-tier barrels.
  if (target.endsWith('.register.js')) return './types/index.d.ts';
  if (target === './src/index.js' || target === './src/register.js') return './types/index.d.ts';
  if (/^\.\/src\/[\w-]+\/index\.js$/.test(target)) return './types/index.d.ts';

  // Every other module carries a declaration of its own. A co-located one wins
  // where it exists; the rest are emitted from JSDoc into types/ by
  // generate-module-types.js. (The icon packs were the co-located case until
  // 4.7 moved them to @arclux/arc-ui-icons, which writes its own map by hand.)
  const mod = target.match(/^\.\/src\/(.+)\.js$/);
  if (mod) {
    const colocated = `./src/${mod[1]}.d.ts`;
    if (fs.existsSync(path.join(pkgDir, colocated))) return colocated;
    return `./types/${mod[1]}.d.ts`;
  }

  return undefined; // unrecognized — caller reports it
}

const problems = [];
const withTypes = {};

for (const [key, value] of Object.entries(existing)) {
  // Wildcard subpaths expand at resolution time; there is no single file to check.
  if (key.includes('*')) {
    withTypes[key] = value;
    continue;
  }

  // Already a condition object — either one this script wrote on an earlier run
  // or a hand-authored one (e.g. "./react-jsx"). Its shape is settled, so it is
  // passed through as-is, but its targets are still asserted.
  //
  // They were not, until 4.1 deleted five components and left five subpaths
  // pointing at nothing: the existence check below only ever ran on *bare
  // string* entries, which an entry is for exactly one run — its first, before
  // this script attaches the types condition. So the assertion this file's
  // header describes was live for one pass per subpath and dead thereafter,
  // across the whole map. `check-export-map` is what actually caught the five,
  // which is why nothing shipped broken; it runs on the same targets from the
  // other side and was never fooled.
  if (typeof value !== 'string') {
    for (const [condition, target] of Object.entries(value)) {
      if (typeof target !== 'string' || !target.startsWith('.')) continue;
      if (!fs.existsSync(path.join(pkgDir, target))) {
        problems.push(`${key} → ${condition}: ${target} does not exist`);
      }
    }
    withTypes[key] = value;
    continue;
  }

  if (!fs.existsSync(path.join(pkgDir, value))) {
    problems.push(`${key} → ${value} does not exist`);
    continue;
  }

  const types = typesFor(value);
  if (types === undefined) {
    problems.push(`${key} → ${value} has no known declaration mapping (see typesFor)`);
    continue;
  }
  if (types === null) {
    withTypes[key] = value;
    continue;
  }
  if (!fs.existsSync(path.join(pkgDir, types))) {
    problems.push(`${key} → ${types} is missing (run generate-shared-types.js first)`);
    continue;
  }

  withTypes[key] = { types, default: value };
}

if (problems.length) {
  console.error('generate-exports: the exports map is not publishable\n');
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    '\nEvery subpath must point at a file that exists and, if it is JavaScript,\n' +
      'resolve to a declaration file. Remove the entry or add the missing target.',
  );
  process.exit(1);
}

// Sort exports: "." first, "./register" second, then alphabetical component keys,
// then category barrels and special entries at the end
const specialFirst = ['.', './register'];
const specialLast = ['./base.css', './utilities.css'];

const sorted = {};

for (const k of specialFirst) {
  if (withTypes[k]) sorted[k] = withTypes[k];
}

const componentKeys = Object.keys(withTypes)
  .filter(
    (k) =>
      !specialFirst.includes(k) &&
      !specialLast.includes(k) &&
      !k.startsWith('./themes/'),
  )
  .sort();

for (const k of componentKeys) sorted[k] = withTypes[k];

for (const k of Object.keys(withTypes).filter((k) => k.startsWith('./themes/')).sort()) {
  sorted[k] = withTypes[k];
}
for (const k of specialLast) {
  if (withTypes[k]) sorted[k] = withTypes[k];
}

pkg.exports = sorted;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

const typed = Object.values(sorted).filter((v) => typeof v !== 'string').length;
const untyped = Object.entries(sorted)
  .filter(([, v]) => typeof v === 'string' && !v.endsWith('.css'))
  .map(([k]) => k);

console.log(
  `generate-exports: ${Object.keys(sorted).length} subpaths, ${typed} with types` +
    (added > 0 ? ` (added ${added} missing export(s))` : ''),
);
// Wildcard subpaths are exempt from the assertion above because there is no
// single file to check. Name them anyway — an exemption nobody can see reads
// as coverage it isn't.
if (untyped.length) {
  console.log(`  untyped (wildcard, not asserted): ${untyped.join(', ')}`);
}
