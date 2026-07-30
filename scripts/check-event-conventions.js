/**
 * check-event-conventions.js
 *
 * Asserts every CustomEvent a component dispatches follows the library's
 * event contract:
 *
 *   - the event name starts with `arc-` (consumers filter on the prefix, and
 *     an unprefixed name collides with native or third-party events)
 *   - the event is dispatched with `bubbles: true` and `composed: true`
 *     (shadow roots swallow anything else, so a non-composed event looks like
 *     a component that never fires)
 *
 * These held at 150-of-151 call sites by convention alone; this pins them so
 * the next component can't drift. Names are read textually — a dynamic name
 * expression contributes every quoted string inside it (covers the
 * `this.open ? 'arc-open' : 'arc-close'` dispatch shape), and a name with no
 * literal at all requires a waiver.
 *
 * Run via: pnpm run check:events (and as part of pnpm generate)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { SRC_DIR, TIERS } from './lib/component-tags.js';

/**
 * file → reasons. Every entry must explain itself; delete entries that stop
 * matching (a stale waiver reads as coverage it isn't).
 */
const WAIVERS = new Map([
  [
    'navigation/top-bar.js',
    // _toggleMenu builds the name from a ternary of two arc- literals on the
    // line above the dispatch ('arc-mobile-menu-toggle' / 'arc-sidebar-toggle');
    // the scanner only reads the argument text, so it can't see them.
    ['dynamic name needs a waiver'],
  ],
  [
    'navigation/navigation-menu.js',
    // _closeMobileMenu dispatches arc-mobile-menu-toggle on `document`, where
    // bubbles/composed are meaningless — there is no boundary left to cross.
    // The dispatch target itself is the deviation (every other event fires on
    // the host); moving it is a breaking change staged for v3.
    ['missing bubbles: true', 'missing composed: true'],
  ],
]);

/**
 * Names retired by the v3 vocabulary pass. arc-close absorbed arc-dismiss;
 * arc-select absorbed the four selection variants; arc-month-change replaced
 * calendar's arc-navigate (which collided with the router event of the same
 * name). A retired name reappearing is a regression, not a style choice.
 */
const RETIRED = new Map([
  ['arc-dismiss', 'use arc-close'],
  ['arc-item-select', 'use arc-select'],
  ['arc-row-select', 'use arc-select'],
  ['arc-select-all', 'use arc-select with detail.all'],
  ['arc-selection-change', 'use arc-select'],
]);

/** Extract the balanced argument text of each `new CustomEvent(...)` call. */
function customEventArgs(source) {
  const calls = [];
  const needle = 'new CustomEvent(';
  let from = 0;
  for (;;) {
    const start = source.indexOf(needle, from);
    if (start === -1) break;
    let depth = 1;
    let i = start + needle.length;
    let quote = null;
    for (; i < source.length && depth > 0; i++) {
      const ch = source[i];
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
      } else if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '(') depth++;
      else if (ch === ')') depth--;
    }
    calls.push(source.slice(start + needle.length, i - 1));
    from = i;
  }
  return calls;
}

let failures = 0;
let sites = 0;

for (const tier of TIERS) {
  const tierDir = resolve(SRC_DIR, tier);
  for (const file of readdirSync(tierDir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
    const rel = `${tier}/${file}`;
    const source = readFileSync(resolve(tierDir, file), 'utf-8');

    for (const args of customEventArgs(source)) {
      sites++;
      const problems = [];

      // Quoted strings past the name arg are detail keys/values; the name
      // expression ends where the options object starts, so only strings
      // before the first `{` count as name candidates.
      const nameText = args.split('{')[0];
      const names = [...nameText.matchAll(/['"`]([\w:-]+)['"`]/g)].map((m) => m[1]);

      if (names.length === 0) {
        problems.push('event name has no string literal (dynamic name needs a waiver)');
      }
      for (const name of names) {
        if (!name.startsWith('arc-')) problems.push(`event name "${name}" is not arc-prefixed`);
        if (RETIRED.has(name)) problems.push(`event name "${name}" was retired in v3 — ${RETIRED.get(name)}`);
      }
      if (!/bubbles:\s*true/.test(args)) problems.push('missing bubbles: true');
      if (!/composed:\s*true/.test(args)) problems.push('missing composed: true');

      for (const problem of problems) {
        if (WAIVERS.get(rel)?.some((w) => problem.includes(w))) continue;
        console.error(`  ${rel}: ${problem}`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} event-convention violation(s) across ${sites} dispatch sites`);
  process.exit(1);
}

console.log(`✓ ${sites} CustomEvent dispatch sites follow the arc- prefix + bubbles/composed contract`);
