/**
 * export-map.js
 *
 * Asserts that every subpath in every published package.json resolves to a file
 * that exists.
 *
 * Two subpaths shipped broken for an unknown length of time: `./shared/click-
 * outside`, whose target was deleted with the DismissController migration, and
 * `./toast-manager`. Both advertised themselves in the export map and both
 * produced ERR_MODULE_NOT_FOUND for anyone who imported them. Nothing caught it
 * because nothing looked: the suite imports source paths directly, and
 * `pnpm smoke:wrappers` builds a scratch consumer per framework that imports
 * the package root rather than every subpath it offers.
 *
 * An export map is a promise to consumers, so it is checked like one. The
 * failure mode is silent by construction — the package installs, the barrel
 * works, and only the one import nobody on the team uses is broken.
 *
 * Wildcards (`./icons/*`) are checked by resolving the directory rather than
 * the pattern: a wildcard promising a directory that does not exist is the same
 * defect, while enumerating every file behind it is not this check's job.
 *
 * **Build outputs are skipped when the package has not been built.** The six
 * wrapper packages export `./dist/...`, which legitimately does not exist in a
 * source checkout — the first draft of this check reported 2,332 failures for
 * exactly that reason. When `dist/` *is* present the targets are verified
 * normally, so a stale export map in a built tree is still caught, and CI's
 * wrapper-builds job plus `pnpm smoke:wrappers` cover the packed tarballs.
 * What is always checked is anything resolving to committed source, which is
 * where both real defects lived.
 *
 * ── Types are part of the promise ──
 *
 * A subpath that resolves to JavaScript with no `types` condition installs
 * fine, imports fine, and hands every TypeScript consumer TS7016 — "could not
 * find a declaration file … implicitly has an 'any' type". The package looks
 * typed, because its root entry is; the deep import the docs recommend is not.
 *
 * generate-exports.js has asserted this since 4.1, but only for
 * @arclux/arc-ui, whose map it writes. @arclux/arc-ui-icons writes its own by
 * hand and was never covered: all five of its JavaScript subpaths — both packs'
 * per-glyph wildcards, both register modules, and `./aliases` — published no
 * types, so `import check from '@arclux/arc-ui-icons/phosphor/check'` was
 * implicitly `any` for the whole of v4.0. That is the same defect
 * `./shared/time-scale` had in 2.x, arriving in the one package the generator
 * does not touch, which is why the assertion belongs here instead: this check
 * reads every published map, whoever wrote it.
 *
 * An explicit `types` condition satisfies it. So does a `.d.ts` beside the
 * target, which is how a tsc-built `dist/` is laid out and which TypeScript
 * resolves on its own — a wrapper package is not made wrong by being built
 * conventionally. Wildcards have no single sibling to find, so they must say
 * `types` outright.
 *
 * Run via: pnpm check export-map (and directly in CI, before the wrapper
 * tarballs are packed, where dist/ exists and its targets are real)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const PACKAGES = path.join(ROOT, 'packages');

/** Every condition value in an exports entry, however deeply nested. */
function targets(node, out = []) {
  if (typeof node === 'string') {
    out.push(node);
  } else if (node && typeof node === 'object') {
    for (const v of Object.values(node)) targets(v, out);
  }
  return out;
}

/**
 * True when `target` points into a build directory that has not been built.
 * Nothing to assert in that case — the export map is a promise about the
 * *published* package, and CI builds the wrappers before packing them.
 */
function unbuilt(pkgRoot, target) {
  const first = target.replace(/^\.\//, '').split('/')[0];
  if (!['dist', 'build', 'out'].includes(first)) return false;
  return !fs.existsSync(path.join(pkgRoot, first));
}

const JS = /\.(?:js|mjs|cjs)$/;

/** The `types` target anywhere inside an entry, however deeply nested. */
function typesTarget(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (typeof node.types === 'string') return node.types;
  for (const v of Object.values(node)) {
    const found = typesTarget(v);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** A wildcard target resolves to a directory; anything else to a file. */
function resolves(pkgRoot, target) {
  const probe = target.includes('*')
    ? path.join(pkgRoot, target.slice(0, target.indexOf('*')))
    : path.join(pkgRoot, target);
  return fs.existsSync(probe);
}

const problems = [];
let checked = 0;
let skipped = 0;
let packages = 0;
let typed = 0;

for (const dir of fs.readdirSync(PACKAGES)) {
  const manifestPath = path.join(PACKAGES, dir, 'package.json');
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.private) continue;
  packages += 1;

  const pkgRoot = path.join(PACKAGES, dir);
  const entries = Object.entries(manifest.exports ?? {});

  for (const [subpath, node] of entries) {
    for (const target of targets(node)) {
      if (!target.startsWith('.')) continue; // a bare specifier, not a file
      if (unbuilt(pkgRoot, target)) { skipped += 1; continue; }
      checked += 1;

      // A wildcard promises a directory; resolve that rather than the pattern.
      const probe = target.includes('*')
        ? path.join(pkgRoot, target.slice(0, target.indexOf('*')))
        : path.join(pkgRoot, target);

      if (!fs.existsSync(probe)) {
        problems.push(`${dir}: "${subpath}" → ${target} does not exist`);
      }
    }

    // Every JavaScript subpath must reach a declaration file. See the header:
    // without one the import is implicitly `any`, and nothing about installing
    // or importing the package says so.
    const js = targets(node).filter((t) => t.startsWith('.') && JS.test(t));
    if (js.length === 0) continue;
    if (js.some((t) => unbuilt(pkgRoot, t))) continue;

    const declared = typesTarget(node);
    if (declared !== undefined) {
      if (resolves(pkgRoot, declared)) {
        typed += 1;
      } else {
        problems.push(`${dir}: "${subpath}" → types: ${declared} does not exist`);
      }
      continue;
    }

    if (subpath.includes('*')) {
      problems.push(
        `${dir}: "${subpath}" is a wildcard with no "types" condition — ` +
          'a wildcard has no sibling declaration for TypeScript to find'
      );
      continue;
    }

    // No condition, but TypeScript still finds a `.d.ts` sitting beside the
    // target on its own. That is what a tsc-built dist/ looks like.
    const missing = js.filter(
      (t) => !fs.existsSync(path.join(pkgRoot, t.replace(JS, '.d.ts')))
    );
    if (missing.length) {
      problems.push(
        `${dir}: "${subpath}" → ${missing.join(', ')} publishes no types ` +
          '(add a "types" condition, or a .d.ts beside the target)'
      );
    } else {
      typed += 1;
    }
  }

  // `main`/`module`/`types` are the same promise in older clothes.
  for (const field of ['main', 'module', 'types']) {
    const target = manifest[field];
    if (typeof target !== 'string' || !target.startsWith('.')) continue;
    if (unbuilt(pkgRoot, target)) { skipped += 1; continue; }
    checked += 1;
    if (!fs.existsSync(path.join(pkgRoot, target))) {
      problems.push(`${dir}: "${field}" → ${target} does not exist`);
    }
  }
}

// Anti-vacuity: a glob that matched nothing, or a shape change in the
// manifests, would otherwise report a clean tree having verified nothing.
if (packages === 0 || checked < 50) {
  console.error(
    `check-export-map: only ${checked} target(s) across ${packages} package(s) — ` +
      'the scan is broken, not the tree'
  );
  process.exit(1);
}

if (problems.length === 0) {
  const note = skipped ? ` (${skipped} unbuilt build-output target(s) skipped)` : '';
  console.log(
    `check-export-map: ${checked} export target(s) across ${packages} published package(s) all resolve${note}`
  );
  console.log(`  ${typed} JavaScript subpath(s) reach a declaration file`);
  process.exit(0);
}

console.error(`check-export-map: ${problems.length} export target(s) do not resolve\n`);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nAn export map is a promise to consumers. A subpath pointing at a deleted\n' +
    'file installs fine, leaves the barrel working, and throws\n' +
    'ERR_MODULE_NOT_FOUND only for whoever imports it — which is why two of\n' +
    'these shipped unnoticed. Remove the entry or restore the file.\n\n' +
    'A subpath that publishes no types is quieter still: it imports fine and\n' +
    'is implicitly `any`, so the failure is a type nobody was ever given.\n' +
    'Add a "types" condition, or put a .d.ts beside the target.'
);
process.exit(1);
