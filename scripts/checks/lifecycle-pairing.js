/**
 * check-lifecycle-pairing.js
 *
 * Asserts that no component subscribes to anything from `firstUpdated`.
 *
 * `firstUpdated` runs once per **element**. `disconnectedCallback` runs once per
 * **connection**. Pairing them looks symmetrical and is not: the first time the
 * element is moved in the DOM, the teardown runs and the setup never does again.
 * What is left is a component that still renders, still answers every property,
 * and has silently stopped reacting — no error, nothing in the console, and
 * nothing a snapshot test would notice.
 *
 * Finding #55 found four of these at once. Finding #64 found a fifth, in
 * `arc-data-table`, nine components later — because the guard for #55 was
 * `test/reconnect-sweep.test.js`, which carries a hand-written list of the four
 * that were known. A list cannot catch the case nobody thought of, which is the
 * only case that matters.
 *
 * This is the guard that needs no list: it reads every component in the tree, so
 * a new file is covered by existing.
 *
 * The fix is always the same — `observeResize()` / `listen()` from
 * `src/shared/subscriptions.js`. They are reactive controllers, so they attach
 * on `hostConnected` **or** the first `hostUpdated` after it (whichever is the
 * first moment the target exists), detach on `hostDisconnected`, and re-attach
 * if the target element is replaced between renders.
 *
 * Run via: pnpm check lifecycle-pairing (and as part of pnpm generate)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', '..', 'packages', 'web-components', 'src');

/** Anything that creates an ongoing subscription needing later teardown. */
const SUBSCRIBES = /\baddEventListener\s*\(|\.observe\s*\(|new\s+(?:Resize|Intersection|Mutation)Observer\b/;

/** The balanced `{ … }` block that starts at the first `{` at or after `from`. */
function blockAt(source, from) {
  const start = source.indexOf('{', from);
  if (start === -1) return '';
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return '';
}

/** The body of a class method by name, or '' if it has none. */
function methodBody(source, name) {
  const match = source.match(new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?${name}\\s*\\([^)]*\\)\\s*\\{`));
  return match ? blockAt(source, match.index) : '';
}

/**
 * Does `body` subscribe, directly or through one of the component's own methods?
 *
 * One level of indirection is enough in practice and is what the real case
 * needed: arc-data-table's `firstUpdated` called `this._attachScrollListener()`,
 * and a direct-text scan would have reported it clean.
 */
function subscribes(source, body, depth = 1) {
  if (SUBSCRIBES.test(body)) return true;
  if (depth === 0) return false;
  for (const [, called] of body.matchAll(/\bthis\.(_\w+)\s*\(/g)) {
    const nested = methodBody(source, called);
    if (nested && subscribes(source, nested, depth - 1)) return true;
  }
  return false;
}

function componentFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...componentFiles(full));
    else if (entry.name.endsWith('.js') && !entry.name.endsWith('.register.js')) out.push(full);
  }
  return out;
}

const problems = [];
let scanned = 0;

for (const file of componentFiles(SRC)) {
  const source = fs.readFileSync(file, 'utf8');
  const body = methodBody(source, 'firstUpdated');
  if (!body) continue;
  scanned += 1;
  if (subscribes(source, body)) {
    problems.push(path.relative(path.join(__dirname, '..', '..'), file));
  }
}

// Anti-vacuity: a regex that silently stopped matching would report success
// forever. There are always components with a firstUpdated.
if (scanned < 5) {
  console.error(
    `check-lifecycle-pairing: only ${scanned} firstUpdated() bodies found — the scan is broken, not the tree`,
  );
  process.exit(1);
}

if (problems.length === 0) {
  console.log(
    `check-lifecycle-pairing: none of ${scanned} firstUpdated() bodies subscribe to anything`,
  );
  process.exit(0);
}

console.error(
  `check-lifecycle-pairing: ${problems.length} component(s) subscribe from firstUpdated()\n`,
);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nfirstUpdated runs once per *element*; disconnectedCallback runs once per\n' +
    '*connection*. Pairing them means the first reparenting unsubscribes the\n' +
    'component permanently and it silently stops reacting.\n\n' +
    'Use observeResize() / listen() from src/shared/subscriptions.js instead —\n' +
    'they are controllers, so both halves are connection-scoped. See\n' +
    'test-findings.md §55 and §64.',
);
process.exit(1);
