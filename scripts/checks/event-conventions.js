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
 *   - the events that carry a selection or a value put it on `detail.value`
 *   - what a component dispatches and what its JSDoc says it dispatches agree
 *
 * These held at 150-of-151 call sites by convention alone; this pins them so
 * the next component can't drift. Names are read textually — a dynamic name
 * expression contributes every quoted string inside it (covers the
 * `this.open ? 'arc-open' : 'arc-close'` dispatch shape), and a name with no
 * literal at all requires a waiver.
 *
 * ## Why the last two rules exist
 *
 * The first version of this check tested the *envelope* — the name, and whether
 * the event can escape a shadow root. It could not see the payload or the
 * documentation, which is half of what "contract" means, and five components
 * were violating that half while the check reported clean:
 * arc-command-palette, arc-dropdown-menu, arc-context-menu, arc-tree-view and
 * arc-menubar all emitted arc-select with no `detail.value`. The v3 event pass
 * had collapsed four selection events into arc-select precisely so that one
 * generic handler could read `detail.value` everywhere, and on those five it
 * read undefined. Consumers were left matching on display text to work out
 * which item fired — which two items sharing a label get silently wrong.
 *
 * That is the class of defect worth guarding: a contract that is enforced
 * where it is cheap to check and honour-system where it matters.
 *
 * Run via: pnpm check event-conventions (and as part of pnpm generate)
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { SRC_DIR, TIERS } from '../lib/component-tags.js';

/**
 * file → reasons. Every entry must explain itself; delete entries that stop
 * matching (a stale waiver reads as coverage it isn't).
 */
const WAIVERS = new Map([
  [
    'navigation/top-bar.js',
    // _toggleMenu builds the name from a ternary of two arc- literals on the
    // line above the dispatch ('arc-mobile-menu-toggle' / 'arc-sidebar-toggle');
    // the scanner only reads the argument text, so it can't see them. Both are
    // genuinely dispatched, so the @fires declarations for them are correct —
    // the scanner just cannot match them up.
    [
      'dynamic name needs a waiver',
      '@fires "arc-sidebar-toggle" but never dispatches it',
      '@fires "arc-mobile-menu-toggle" but never dispatches it',
    ],
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

/**
 * Events whose whole purpose is to report a value, and which the v3 contract
 * therefore requires to carry `detail.value`.
 *
 * arc-select is the one the collapse of arc-item-select / arc-row-select /
 * arc-select-all / arc-selection-change was built around; arc-change and
 * arc-input are the editing pair. Keys beside `value` are welcome — the
 * contract adds a canonical name, it does not forbid the specific ones.
 */
const MUST_CARRY_VALUE = new Set(['arc-select', 'arc-change', 'arc-input']);

/** Balanced-brace read of the object literal following `detail:`. */
function detailObject(args) {
  const key = /\bdetail\s*:/.exec(args);
  if (!key) return null;
  const open = args.indexOf('{', key.index);
  // `detail: someVariable` — no literal to inspect. Reported separately.
  if (open === -1 || args.slice(key.index + key[0].length, open).trim() !== '') {
    return { opaque: true, text: '' };
  }
  let depth = 0;
  let quote = null;
  for (let i = open; i < args.length; i++) {
    const ch = args[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return { opaque: false, text: args.slice(open + 1, i) };
    }
  }
  return { opaque: true, text: '' };
}

/** Top-level keys of an object-literal body (ignores keys of nested objects). */
function topLevelKeys(text) {
  const keys = [];
  let depth = 0;
  let quote = null;
  let atKeyPosition = true;
  let token = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{' || ch === '[' || ch === '(') { depth++; continue; }
    if (ch === '}' || ch === ']' || ch === ')') { depth--; continue; }
    if (depth !== 0) continue;

    if (ch === ',') { atKeyPosition = true; token = ''; continue; }
    if (ch === ':') {
      if (atKeyPosition && token.trim()) keys.push(token.trim());
      atKeyPosition = false;
      token = '';
      continue;
    }
    token += ch;
  }
  // Shorthand at the end with no trailing comma, e.g. `{ value }`.
  if (atKeyPosition && token.trim()) keys.push(token.trim());
  return keys.map((k) => k.replace(/^\.\.\./, '').trim());
}

/**
 * Event names a file's JSDoc claims, via @fires.
 *
 * The optional type annotation has to be skipped by brace counting, not by a
 * `\{[^}]*\}` pattern: the annotations here are shapes like
 * `{CustomEvent<{ value: string }>}`, whose first `}` closes the inner object,
 * so a non-greedy scan stops inside the type and reads `>` as the event name.
 * That mistake made the first run of this check report forty-odd components as
 * dispatching undocumented events when every one of them was documented.
 */
function documentedEvents(source) {
  const names = new Set();
  const tag = /@fires\s+/g;
  let m;
  while ((m = tag.exec(source))) {
    let i = m.index + m[0].length;
    if (source[i] === '{') {
      let depth = 0;
      for (; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}' && --depth === 0) { i++; break; }
      }
      while (source[i] === ' ') i++;
    }
    const name = /^[\w-]+/.exec(source.slice(i));
    if (name) names.add(name[0]);
  }
  return names;
}

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
    const documented = documentedEvents(source);
    const dispatched = new Set();

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
        dispatched.add(name);
        if (!name.startsWith('arc-')) problems.push(`event name "${name}" is not arc-prefixed`);
        if (RETIRED.has(name)) problems.push(`event name "${name}" was retired in v3 — ${RETIRED.get(name)}`);
      }
      if (!/bubbles:\s*true/.test(args)) problems.push('missing bubbles: true');
      if (!/composed:\s*true/.test(args)) problems.push('missing composed: true');

      // The payload half of the contract.
      for (const name of names.filter((n) => MUST_CARRY_VALUE.has(n))) {
        const detail = detailObject(args);
        if (!detail) {
          problems.push(`${name} carries no detail — the contract puts the value on detail.value`);
        } else if (detail.opaque) {
          problems.push(`${name} builds its detail off-site, so detail.value cannot be verified here`);
        } else if (!topLevelKeys(detail.text).includes('value')) {
          problems.push(`${name} detail has no "value" key — one generic handler should read detail.value on every emitter`);
        }
      }

      for (const problem of problems) {
        if (WAIVERS.get(rel)?.some((w) => problem.includes(w))) continue;
        console.error(`  ${rel}: ${problem}`);
        failures++;
      }
    }

    // Documentation and behavior have to agree. An undocumented event is
    // invisible to the manifest, the editor data and the wrappers, all of which
    // are generated from the JSDoc; a documented event that nothing dispatches
    // is a promise the component does not keep.
    for (const name of dispatched) {
      if (!name.startsWith('arc-') || documented.has(name)) continue;
      const problem = `dispatches "${name}" but has no @fires for it`;
      if (WAIVERS.get(rel)?.some((w) => problem.includes(w))) continue;
      console.error(`  ${rel}: ${problem}`);
      failures++;
    }
    for (const name of documented) {
      if (dispatched.has(name)) continue;
      const problem = `@fires "${name}" but never dispatches it`;
      if (WAIVERS.get(rel)?.some((w) => problem.includes(w))) continue;
      console.error(`  ${rel}: ${problem}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n✗ ${failures} event-convention violation(s) across ${sites} dispatch sites`);
  process.exit(1);
}

console.log(`✓ ${sites} CustomEvent dispatch sites follow the arc- prefix + bubbles/composed contract`);
