#!/usr/bin/env node
/**
 * check-empty-attributes.js
 *
 * Asserts that no attribute binding falls back to `undefined` or `null` where
 * it means "omit this attribute".
 *
 * In a lit-html attribute position, only the `nothing` sentinel removes the
 * attribute. `undefined` and `null` are stringified, so the attribute is
 * rendered — present and empty:
 *
 *   aria-expanded=${hasChildren ? String(expanded) : undefined}
 *      leaf → aria-expanded=""
 *
 * An empty string is not a valid value for an enumerated ARIA state, and its
 * mere presence changes what the node claims to be: every leaf of
 * arc-tree-view advertised itself as an expandable node. The same slip on
 * `aria-labelledby` / `aria-describedby` leaves an IDREF list pointing at
 * nothing, and on `maxlength` / `aria-valuemax` leaves a numeric attribute
 * that parses as invalid.
 *
 * The failure is invisible in every direction a component is normally checked:
 * it renders, it does not throw, the manifest is unaffected, and a test that
 * reads the property rather than the attribute sees nothing wrong.
 *
 * The library already uses the sentinel correctly — arc-chip's
 * `aria-selected=${this._inListbox ? … : nothing}` is the pattern, and six
 * components import `nothing` from lit. This check is that convention,
 * enforced.
 *
 * WHAT IS NOT A FAILURE, and why each allowance exists:
 *
 *   - An event binding, `@mouseenter=${cond ? fn : null}`. A null listener is a
 *     genuine no-op; arc-navigation-menu does this deliberately.
 *   - A property binding, `.value=${… : undefined}`. Setting a property to
 *     undefined is a real assignment, not a rendered attribute.
 *   - A boolean attribute binding, `?disabled=${…}`. Presence is already driven
 *     by truthiness, which is the whole point of the `?` prefix.
 *   - An expression containing braces of its own (an object literal or an arrow
 *     function body). Those are read but not analysed — the aim is the common
 *     ternary, not a parser for arbitrary JavaScript.
 *
 * The five bindings that already ship this way are listed in BASELINE below, so
 * the rule blocks new occurrences without turning CI red on day one. check.js
 * discards a passing check's stdout, so `pnpm check` shows only `ok` — run this
 * file directly to print the outstanding list:
 *
 *   node scripts/checks/empty-attributes.js
 *
 * Run via: pnpm check empty-attributes
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', '..', 'packages', 'web-components', 'src');
const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

/**
 * Known occurrences, kept the same way boolean-defaults.js keeps its own and
 * rtl-intl.test.js keeps ALLOWED: the rule earns its place by stopping the next
 * one, and waiting for the backlog means it never lands.
 *
 * Fixing one means deleting its line here; an entry that no longer violates is
 * itself reported, so the list cannot go stale. Empty this array to make the
 * rule strict.
 */
const BASELINE = [
  'input/textarea.js:maxlength',
  'input/textarea.js:aria-labelledby',
  'input/textarea.js:aria-describedby',
  'layout/resizable.js:aria-valuemax',
  'navigation/tree-view.js:aria-expanded',
];

/**
 * Attribute bindings in a source file, as [name, expression] pairs.
 *
 * The name must not be preceded by `@`, `.` or `?` — those are the event,
 * property and boolean-attribute forms, none of which render a stray empty
 * attribute. The expression is read by brace depth so a nested template or
 * object literal does not truncate it mid-way.
 */
function attributeBindings(src) {
  const out = [];
  const start = /(^|[\s"'`])([a-zA-Z][\w-]*)=\$\{/g;
  let m;
  while ((m = start.exec(src))) {
    const name = m[2];
    let depth = 1;
    let i = start.lastIndex;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
    }
    out.push([name, src.slice(start.lastIndex, i - 1)]);
    start.lastIndex = i;
  }
  return out;
}

/** Whether an expression hands lit-html `undefined`/`null` in place of `nothing`. */
function fallsBackToNullish(expr) {
  // Only the plain ternary and the bare literal are analysed; an expression
  // carrying braces of its own is left alone rather than half-parsed.
  if (/[{}]/.test(expr)) return false;
  return /:\s*(undefined|null)\s*$/.test(expr.trim()) || /^\s*(undefined|null)\s*$/.test(expr);
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

    for (const [name, expr] of attributeBindings(src)) {
      checked++;
      if (!fallsBackToNullish(expr)) continue;

      const id = `${rel}:${name}`;
      const message =
        `${rel} — \`${name}\` falls back to ${/null\s*$/.test(expr.trim()) ? 'null' : 'undefined'}, ` +
        `so it renders as \`${name}=""\` instead of being omitted`;

      if (baseline.has(id)) outstanding.push(message);
      else problems.push(message);
      baseline.delete(id);
    }
  }
}

const REMEDY =
  "Import the sentinel and return it instead — `import { nothing } from 'lit'` —\n" +
  '  aria-expanded=${hasChildren ? String(expanded) : nothing}\n' +
  'as arc-chip does for aria-selected/aria-pressed. `nothing` is the only value\n' +
  'that removes an attribute; undefined and null are stringified.';

if (baseline.size) {
  console.error(
    `check-empty-attributes: ${baseline.size} BASELINE entr(ies) no longer violate — delete them:\n`,
  );
  for (const id of baseline) console.error(`  ${id}`);
  process.exit(1);
}

if (problems.length) {
  console.error(
    `check-empty-attributes: ${problems.length} new attribute binding(s) render empty ` +
      'instead of being omitted\n',
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

console.log(
  `check-empty-attributes: no new violations (${checked} attribute binding(s) checked)`,
);
if (outstanding.length) {
  console.log(`\n  ${outstanding.length} known violation(s) outstanding, from BASELINE:\n`);
  for (const p of outstanding) console.log(`    ${p}`);
  console.log(`\n${REMEDY.replace(/^/gm, '  ')}`);
}
process.exit(0);
