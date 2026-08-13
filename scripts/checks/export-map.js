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
 * Run via: pnpm check export-map (and as part of pnpm generate)
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

const problems = [];
let checked = 0;
let skipped = 0;
let packages = 0;

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
  process.exit(0);
}

console.error(`check-export-map: ${problems.length} export target(s) do not resolve\n`);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nAn export map is a promise to consumers. A subpath pointing at a deleted\n' +
    'file installs fine, leaves the barrel working, and throws\n' +
    'ERR_MODULE_NOT_FOUND only for whoever imports it — which is why two of\n' +
    'these shipped unnoticed. Remove the entry or restore the file.'
);
process.exit(1);
