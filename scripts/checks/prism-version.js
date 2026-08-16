/**
 * prism-version.js
 *
 * Asserts the installed `@arclux/prism` is new enough to emit the wrappers this
 * repo has committed.
 *
 * The failure this exists to stop is silent and total. `pnpm generate` rewrites
 * all 235 wrapper files from whatever prism happens to be installed, so an
 * older prism does not error — it *reverts*. The three emitter fixes in 2.13.0
 * (findings #80–82: the Angular package registering no custom elements at all,
 * and Angular and Solid discarding children on every component whose slots are
 * all named) come straight back out, and the only signal is a large diff nobody
 * asked for, in generated files nobody reads.
 *
 * That already happened once, deliberately, to measure it: regenerating on
 * 2.12.0 undid 205 Angular, 10 React, 10 Preact and 10 Solid files.
 *
 * CI would have caught it — `verify` runs `pnpm generate` and then
 * `git diff --quiet` — but only as "generated files are out of date", which
 * reads as *stale committed output* and invites the exact wrong fix: commit the
 * revert. This names the real cause at the top of the run instead, before the
 * 35s prism step rather than after it.
 *
 * The floor is a floor, not a pin. Raise it when a prism release changes
 * emitted output that this repo depends on — or, as with 2.13.1, when an older
 * prism would silently stop *maintaining* it. 2.13.1's fixes change no bytes:
 * regenerating the whole tree on 2.13.0 and 2.13.1 is byte-identical. What
 * 2.13.0 cannot do is remove a `barrelExclude` name from a barrel a formatter
 * has wrapped, which since 4.1 is 16 components across seven packages, and it
 * leaves every wrapper barrel broken for one run after a component is deleted.
 * Both are maintenance correctness rather than emitter output, and both fail
 * the same way a stale emitter does: quietly, in files nobody reads.
 *
 * Run via: pnpm check prism-version (and first in `pnpm generate`)
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Bump when a prism release changes output this repo has committed. */
const FLOOR = '2.13.1';
const REASON =
  'the wrapper emitter fixes for findings #80-82 (Angular element registration, ' +
  'and children forwarding for named-only slots in Angular and Solid), plus the ' +
  '2.13.1 barrel fixes this catalog depends on (barrelExclude across a wrapped ' +
  'barrel, and the prune/sweep ordering on a deletion)';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// Read off disk rather than through `require('@arclux/prism/package.json')`:
// prism's `exports` map does not expose its own manifest, so the resolver
// throws MODULE_NOT_FOUND and the check reports "not installed" for a package
// that is sitting right there. `pnpm generate` runs `npx prism` from this same
// root, so this is the copy it will actually use.
let installed;
try {
  installed = JSON.parse(
    readFileSync(resolve(ROOT, 'node_modules/@arclux/prism/package.json'), 'utf-8')
  ).version;
} catch {
  console.error('check-prism-version: @arclux/prism is not installed — run `pnpm install`');
  process.exit(1);
}

/** Numeric compare of `major.minor.patch`; prerelease tags sort below release. */
function older(a, b) {
  const parts = (v) => v.split('-')[0].split('.').map(Number);
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i++) {
    if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) < (y[i] ?? 0);
  }
  // Equal releases: a prerelease of the floor is still older than the floor.
  return a.includes('-') && !b.includes('-');
}

if (older(installed, FLOOR)) {
  console.error(
    `check-prism-version: @arclux/prism ${installed} is installed, but the committed\n` +
      `wrappers need >= ${FLOOR} — ${REASON}.\n\n` +
      'Regenerating with this version does not fail, it REVERTS: `pnpm generate`\n' +
      'rewrites all 235 wrapper files and silently undoes those fixes.\n\n' +
      'Fix: publish/install a newer prism, then bump the devDependency and\n' +
      'refresh the lockfile — do not commit the regenerated output.'
  );
  process.exit(1);
}

console.log(`check-prism-version: @arclux/prism ${installed} >= ${FLOOR}`);
process.exit(0);
