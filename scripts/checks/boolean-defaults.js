#!/usr/bin/env node
/**
 * check-boolean-defaults.js
 *
 * Asserts that no `type: Boolean` prop defaulting to `true` is left without a
 * way to turn it off from markup.
 *
 * Lit's boolean converter maps attribute *presence* to `true`, and an absent
 * attribute never fires `attributeChangedCallback` — so a prop whose
 * constructor sets it to `true` stays `true` for every possible attribute
 * spelling:
 *
 *   <arc-carousel>                    → true   (constructor default)
 *   <arc-carousel show-dots>          → true
 *   <arc-carousel show-dots="false">  → true   ← the attribute is *present*
 *
 * There is no attribute value that yields `false`. The prop becomes settable
 * only from script, which rules out static HTML, the documentation's own
 * examples, and every framework wrapper that forwards booleans as attributes.
 *
 * The failure is silent and reads as "the component ignores my attribute". It
 * is also invisible from inside this repo the same way the wrapper defects were
 * (see check-wrapper-slots.js): the tests that exist set the property from
 * script, where it works.
 *
 * The library already solved this four times, with an explicit escape hatch:
 *
 *   legend: { type: Boolean, converter: { fromAttribute: (v) => v !== 'false' } }
 *
 * — arc-activity-heatmap (`legend`), arc-uptime (`summary`), arc-video
 * (`controls`) and arc-keyboard-map (`labels`). arc-activity-heatmap documents
 * it on the prop: "default true; set the attribute to the string 'false' to
 * disable from markup". This check is that convention, enforced.
 *
 * WHAT IS NOT A FAILURE, and why each allowance exists:
 *
 *   - A prop carrying its own `converter`. That is the fix; any converter is
 *     accepted rather than only the `v !== 'false'` spelling, because a
 *     component may reasonably accept more than one falsy word.
 *   - A prop declared `attribute: false`. It is script-only by design, so there
 *     is no markup path to break.
 *   - A prop defaulting to `false` or left undefined. Presence-means-true is
 *     exactly right there — that is what a boolean attribute is for.
 *   - An assignment nested inside the constructor rather than at its top level.
 *     arc-select and arc-tree-select both build a ListboxController in the
 *     constructor whose callbacks assign `this.open = true`; the default those
 *     components actually ship is `false`, set on the line above.
 *
 * The twenty props that already ship this way are listed in BASELINE below, so
 * the rule blocks new occurrences without turning CI red on day one. Note that
 * check.js discards a passing check's stdout, so `pnpm check` shows only `ok` —
 * run this file directly to print the outstanding list:
 *
 *   node scripts/checks/boolean-defaults.js
 *
 * Run via: pnpm check boolean-defaults
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', '..', 'packages', 'web-components', 'src');
const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

/**
 * Empty, and the rule is therefore strict.
 *
 * It held twenty props when this check was written, as the same device as the
 * ALLOWED list in rtl-intl.test.js: a rule is worth having the moment it stops
 * the *next* one, and holding it back until the backlog is burned down means it
 * lands never. The backlog is burned down — every one of them now declares
 * through `flag()` in shared/props.js, which supplies the converter and a
 * round-trippable negative attribute for the true-defaulting ones.
 *
 * The list emptied itself, in the sense that mattered: a BASELINE entry that no
 * longer violates is reported as loudly as a new violation, so the migration
 * could not silently finish without this file noticing.
 */
const BASELINE = [];

/** The body of the first `{ … }` at or after `from`, read by brace depth. */
function balanced(src, from) {
  const open = src.indexOf('{', from);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return { body: src.slice(open + 1, i), end: i };
  }
  return null;
}

/**
 * Every `name: { … }` entry in the static properties block, mapped to its own
 * declaration text.
 *
 * Read by brace depth rather than by regex so that a nested `converter: { … }`
 * is part of its parent's text instead of being mistaken for an entry of its
 * own — which matters, since the converter is the thing being looked for.
 */
function declarations(src) {
  const at = src.indexOf('static properties');
  if (at === -1) return new Map();
  const block = balanced(src, at);
  if (!block) return new Map();

  const out = new Map();
  const entry = /(\w+)\s*:\s*\{/g;
  let m;
  while ((m = entry.exec(block.body))) {
    const inner = balanced(block.body, m.index);
    if (!inner) break;
    out.set(m[1], inner.body);
    entry.lastIndex = inner.end;
  }
  return out;
}

/**
 * Props assigned `true` at the top level of the constructor.
 *
 * Depth is tracked across the body so an assignment inside a nested object or
 * callback does not count as the shipped default.
 */
function defaultedTrue(src) {
  const m = /\n\s*constructor\s*\(/.exec(src);
  if (!m) return new Set();
  const ctor = balanced(src, m.index);
  if (!ctor) return new Set();

  const found = new Set();
  let depth = 0;
  for (const line of ctor.body.split('\n')) {
    const assign = /^\s*this\.(\w+)\s*=\s*true\s*;/.exec(line);
    if (assign && depth === 0) found.add(assign[1]);
    depth += (line.match(/[{[(]/g) || []).length - (line.match(/[}\])]/g) || []).length;
  }
  return found;
}

/** The attribute a prop is set through — Lit lowercases the name by default. */
function attributeFor(prop, decl) {
  const named = /attribute\s*:\s*'([^']+)'/.exec(decl);
  return named ? named[1] : prop.toLowerCase();
}

const baseline = new Set(BASELINE);
const problems = [];
const outstanding = [];
let checked = 0;

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;

    const rel = `${tier}/${file}`;
    const src = fs.readFileSync(path.join(dir, file), 'utf-8');

    const decls = declarations(src);
    if (!decls.size) continue;
    const defaults = defaultedTrue(src);
    if (!defaults.size) continue;


    for (const [prop, decl] of decls) {
      if (!/type\s*:\s*Boolean/.test(decl)) continue;
      if (!defaults.has(prop)) continue;
      if (/attribute\s*:\s*false/.test(decl)) continue;

      checked++;
      if (/converter\s*:/.test(decl)) continue;

      const id = `${rel}:${prop}`;
      const message =
        `${rel} — \`${prop}\` defaults to true, so \`${attributeFor(prop, decl)}="false"\` ` +
        'reads as true and there is no markup spelling that disables it';

      if (baseline.has(id)) outstanding.push(message);
      else problems.push(message);
      baseline.delete(id);
    }
  }
}

const REMEDY =
  'Give the prop the converter the library already uses for exactly this —\n' +
  "  { type: Boolean, converter: { fromAttribute: (v) => v !== 'false' } }\n" +
  '— as arc-activity-heatmap (legend), arc-uptime (summary), arc-video (controls)\n' +
  'and arc-keyboard-map (labels) do, and note it on the @prop line the way\n' +
  'arc-activity-heatmap does. Inverting the prop so the default is false\n' +
  '(`no-dots` rather than `show-dots`) is the other way out, at the cost of a\n' +
  'breaking rename.';

// A baseline entry that no longer violates has been fixed — say so, so the
// list shrinks with the work instead of drifting out of date.
if (baseline.size) {
  console.error(
    `check-boolean-defaults: ${baseline.size} BASELINE entr(ies) no longer violate — delete them:\n`,
  );
  for (const id of baseline) console.error(`  ${id}`);
  process.exit(1);
}

if (problems.length) {
  console.error(
    `check-boolean-defaults: ${problems.length} new true-by-default boolean prop(s) ` +
      'cannot be turned off from markup\n',
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

console.log(
  `check-boolean-defaults: no new violations (${checked} true-by-default boolean prop(s) checked)`,
);
if (outstanding.length) {
  console.log(`\n  ${outstanding.length} known violation(s) outstanding, from BASELINE:\n`);
  for (const p of outstanding) console.log(`    ${p}`);
  console.log(`\n${REMEDY.replace(/^/gm, '  ')}`);
}
process.exit(0);
