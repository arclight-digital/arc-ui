/**
 * A component describes its text with a type context. It never spells one.
 *
 * The role slots — `--font-body`, `--font-label`, their weights and fallbacks —
 * shipped in v3 and the guards for them (font-roles.test.js, font-weights.test.js)
 * prove a consumer's override *reaches* a component. They say nothing about the
 * components that never asked. This is the other half: a census, and then a rule
 * that keeps the census at zero.
 *
 * What the census found, before V4-PLAN 4.5:
 *
 *   font-family    3 raw of 262   the role slots had won outright
 *   font-size     22 raw of 413   nearly won
 *   font-weight   68 raw of 163   `600` written out 39 times — the label role's
 *                                 own weight, in components that could not
 *                                 follow it when a face arrived without a
 *                                 semibold, which is the exact failure the role
 *                                 weight was added to prevent
 *   line-height   80 raw of 98    the tree published three, the tree used ten
 *   letter-spacing 65 raw of 89   one uppercase label at four trackings
 *
 * The two tables tell it best. `arc-table`'s `th` and `arc-data-table`'s `th`
 * are the same element — same family, weight, size, transform — and differ in
 * letter-spacing, 2px against 1px, and in nothing else that was decided. They
 * ship side by side. Nobody chose that; both were written from memory, and
 * memory is what a token exists to replace.
 *
 * Three rules:
 *
 *   1. A font declaration carries a `var()` somewhere in its value, or one of
 *      the keywords that means "no decision here" — `inherit`, `normal`,
 *      `initial`, `unset`, `revert`. A bare literal is a fork of the type scale
 *      that no theme override can reach. `calc(var(--label-inline-size) - 1px)`
 *      passes on purpose: a size derived from the scale still moves with it,
 *      and the seven components that spell their small variant that way are
 *      using the scale, not escaping it.
 *   2. Every token a font declaration names is declared somewhere. This is the
 *      cheap rule and it earned its place immediately: `--weight-medium` was
 *      read by arc-command-palette and declared by nothing, so that text had
 *      been rendering at its fallback since it was written, unreachable by any
 *      theme, and silently correct-looking.
 *   3. The exception list matches the tree. An entry for a site that no longer
 *      has a raw value is rot, and rot is what makes a list stop being read.
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'packages/web-components/src';
const BASE_CSS = path.join(SRC, 'base.css');
const HOST_TOKENS = path.join(SRC, 'generated', 'host-tokens.js');

const PROPS = ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'font'];

/** Values that decline to style text rather than styling it outside a role. */
const PASSTHROUGH = new Set(['inherit', 'initial', 'unset', 'revert', 'normal']);

/**
 * Raw values that stay raw, each because a token would be the wrong answer
 * rather than a missing one. Keyed `file:selector` so moving a rule around
 * inside a file does not silently widen the exemption to its neighbour.
 */
const EXEMPT = {
  // ── font-size used to size a glyph, not to set type ──
  // These set `font-size` on a box whose content is one icon. The number is the
  // icon's diameter; putting it on the type scale would tie an ornament's size
  // to the reading size of body copy, and moving the type scale would resize
  // artwork.
  'content/feature-card.js .card__icon': 'icon diameter, not type',
  'navigation/bottom-nav.js .bottom-nav__icon': 'icon diameter, not type',
  'data/value-card.js .card__icon': 'icon diameter, not type',
  'content/empty-state.js .empty__icon': 'icon diameter, not type',
  'typography/blockquote.js .blockquote::after': 'the decorative quote mark, an ornament at 64px',

  // ── em-relative: consuming the ambient role rather than replacing it ──
  // `0.9em` follows whatever the surrounding context set. That is the type
  // scale doing its job through inheritance; a token here would pin the size
  // and break the relationship.
  'data/data-grid.js .sort-index': 'relative to the cell it sits in',
  'typography/prose.js arc-prose code': 'relative to the prose around it',

  // ── one-offs with no shared treatment behind them ──
  'data/stat.js .stat__value': 'the hero figure, deliberately larger than --numeral-size',
  'data/stepper.js .step__circle': 'a digit inside a 24px circle; 700 is legibility, not emphasis',
  'input/label.js .label__required': 'the required asterisk — one glyph, bold to be seen at 12px',
  'content/qr-code.js :host': 'line-height 0, not 1: the host wraps an inline <svg> and 1 still leaves a descender gap',
};

/* ── Which tokens exist ── */

function declaredTokens() {
  const names = new Set();
  for (const file of [BASE_CSS, HOST_TOKENS]) {
    const src = fs.readFileSync(file, 'utf8');
    for (const [, name] of src.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) names.add(name);
  }
  return names;
}

/* ── The scan ── */

const failures = [];
const usedExemptions = new Set();

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'generated' && entry.name !== 'icons') walk(full, visit);
    } else if (entry.name.endsWith('.js')) visit(full);
  }
}

/**
 * The selector a declaration sits under.
 *
 * Walks back to the nearest line that opens a block. Good enough to key an
 * exemption on and deliberately not a parser: the alternative is a CSS parse of
 * a template literal, and the only thing this identifier has to do is be stable
 * and readable in the exception list.
 */
function selectorAbove(lines, i) {
  for (let j = i; j >= 0 && j > i - 40; j--) {
    const m = /^\s*([.:#\w[][^;{}]*?)\s*\{/.exec(lines[j]);
    if (m) return m[1].replace(/\s+/g, ' ').trim();
  }
  return '?';
}

const tokens = declaredTokens();
const privateOf = new Map();

walk(SRC, (file) => {
  const rel = path.relative(SRC, file);
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');

  // A component may declare its own --_private tokens and read them back.
  const own = new Set([...src.matchAll(/(--_[a-zA-Z0-9_-]+)\s*:/g)].map((m) => m[1]));
  privateOf.set(rel, own);

  lines.forEach((line, i) => {
    for (const prop of PROPS) {
      const m = new RegExp(`(?:^|[^-\\w])${prop}:\\s*([^;{}]+?)(?:\\s*!important)?;`).exec(line);
      if (!m) continue;
      const value = m[1].trim();
      const at = (msg) =>
        failures.push({ file: rel, line: i + 1, msg, text: line.trim().slice(0, 100) });

      // Rule 2: names a token that has to exist.
      for (const [, name] of value.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
        if (tokens.has(name) || own.has(name)) continue;
        at(`reads ${name}, which nothing declares — this renders at its fallback forever`);
      }

      if (value.includes('var(') || PASSTHROUGH.has(value)) continue;

      // Rule 1: everything else is a literal.
      const key = `${rel} ${selectorAbove(lines, i)}`;
      if (EXEMPT[key]) {
        usedExemptions.add(key);
        continue;
      }
      at(`literal ${prop}: ${value} — use a type context, or exempt it with a reason`);
    }
  });
});

// Rule 3: an exemption for a site that has no raw value any more.
for (const key of Object.keys(EXEMPT)) {
  if (usedExemptions.has(key)) continue;
  failures.push({
    file: key.split(' ')[0],
    line: 0,
    msg: `exempt "${key}" no longer has a raw font declaration — drop the entry`,
    text: EXEMPT[key],
  });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} type declaration(s) outside the scale:\n`);
  for (const f of failures) {
    console.error(`  ${SRC}/${f.file}${f.line ? ':' + f.line : ''}  ${f.msg}`);
    console.error(`    ${f.text}\n`);
  }
  console.error(
    `  The contexts are --{display-xl,heading,body,numeral,label,section-title,\n` +
      `  ui-accent,code,label-inline}-{size,weight,spacing,lh}, plus --glyph-lh and\n` +
      `  --ui-lh. See the typography block in shared/tokens.js.\n`,
  );
  process.exit(1);
}

console.log(`✓ every font declaration reads the type scale (${Object.keys(EXEMPT).length} exempt)`);
