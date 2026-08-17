#!/usr/bin/env node
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
 *
 * V4-PLAN 4.10 moved this onto `scripts/lib/source-walker.js`. The
 * find-a-method-body-by-brace-depth pair that used to live here is the walker's
 * `method()` for the catalog and `balanced()` for everything else, and the walk
 * now runs over the comment-blanked copy — so a docblock that quotes
 * `addEventListener` while explaining why the component does not call one is
 * prose rather than a finding. The same 67 `firstUpdated()` bodies are read.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { run, balanced, withoutComments, lineAt } from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

const ROOT = resolve(SRC_DIR, '..', '..', '..');

/** Anything that creates an ongoing subscription needing later teardown. */
const SUBSCRIBES = /\baddEventListener\s*\(|\.observe\s*\(|new\s+(?:Resize|Intersection|Mutation)Observer\b/;

/**
 * Does `body` subscribe, directly or through one of the component's own methods?
 *
 * One level of indirection is enough in practice and is what the real case
 * needed: arc-data-table's `firstUpdated` called `this._attachScrollListener()`,
 * and a direct-text scan would have reported it clean.
 *
 * `lookup` is the file's method reader — the walker's `method()` for a
 * component, `methodBody()` below for anything outside the catalog — so both
 * halves follow the indirection the same way.
 */
function subscribes(lookup, body, depth = 1) {
  if (SUBSCRIBES.test(body)) return true;
  if (depth === 0) return false;
  for (const [, called] of body.matchAll(/\bthis\.(_\w+)\s*\(/g)) {
    const nested = lookup(called);
    if (nested && subscribes(lookup, nested.body, depth - 1)) return true;
  }
  return false;
}

const REMEDY =
  'firstUpdated runs once per *element*; disconnectedCallback runs once per\n' +
  '*connection*. Pairing them means the first reparenting unsubscribes the\n' +
  'component permanently and it silently stops reacting.\n\n' +
  'Use observeResize() / listen() from src/shared/subscriptions.js instead —\n' +
  'they are controllers, so both halves are connection-scoped. See\n' +
  'test-findings.md §55 and §64.';

/** REMEDY as a rule hint: run() indents the first line, so indent the rest. */
const asHint = (text) => text.replace(/^(?=.)/gm, '    ').trimStart();

/** Every `firstUpdated()` body the sweep read, in and out of the catalog. */
let scanned = 0;

const noSetupInFirstUpdated = {
  name: 'lifecycle-pairing',
  describe: 'nothing subscribes from firstUpdated()',
  hint: asHint(REMEDY),
  component({ method, report }) {
    const first = method('firstUpdated');
    if (!first) return;
    scanned += 1;
    if (subscribes(method, first.body)) {
      report(first.line, 'subscribes from firstUpdated()');
    }
  },
};

/**
 * The body of a class method by name, or null if it has none.
 *
 * The walker's `method()` reads a component class, where a method sits at two
 * spaces. Outside the catalog a method can sit anywhere — a mixin's methods are
 * a class expression deep — so this keeps the original's any-indent match, and
 * takes the block from `balanced()` rather than counting braces again.
 */
function methodBody(code, name) {
  const m = code.match(new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?${name}\\s*\\([^)]*\\)\\s*\\{`));
  if (!m) return null;
  const block = balanced(code, m.index);
  return block ? { body: block.body, line: lineAt(code, m.index) } : null;
}

/**
 * Everything under `src/` that is not a registered component, swept the same
 * way.
 *
 * The original walked the whole tree recursively rather than the catalog, and
 * that breadth is the check's whole claim — "it reads every component in the
 * tree, so a new file is covered by existing". A mixin or a controller that
 * grows a `firstUpdated` is exactly the case a catalog-only walk would miss,
 * and it is the case nobody would think to add to a list.
 */
function scanNonComponents() {
  const components = new Set(
    [...findComponents().values()].map((m) => resolve(SRC_DIR, m.tier, m.file)),
  );
  const problems = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith('.js') || entry.name.endsWith('.register.js')) continue;
      if (components.has(full)) continue;

      const code = withoutComments(readFileSync(full, 'utf8'));
      const first = methodBody(code, 'firstUpdated');
      if (!first) continue;
      scanned += 1;
      if (subscribes((n) => methodBody(code, n), first.body)) {
        problems.push(`${relative(ROOT, full)}:${first.line}`);
      }
    }
  };
  walk(SRC_DIR);
  return problems;
}

const code = run({ name: 'lifecycle-pairing', rules: [noSetupInFirstUpdated] });
const problems = scanNonComponents();

// Anti-vacuity: a regex that silently stopped matching would report success
// forever. There are always components with a firstUpdated.
if (scanned < 5) {
  console.error(
    `check-lifecycle-pairing: only ${scanned} firstUpdated() bodies found — the scan is broken, not the tree`,
  );
  process.exit(1);
}

if (problems.length) {
  console.error(
    `\ncheck-lifecycle-pairing: ${problems.length} module(s) outside the catalog subscribe from firstUpdated()\n`,
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

if (code === 0) {
  console.log(
    `check-lifecycle-pairing: none of ${scanned} firstUpdated() bodies subscribe to anything`,
  );
}

process.exit(code);
