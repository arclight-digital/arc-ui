/**
 * The two-color contract: everything that carries the brand follows the brand.
 *
 * ARC's public theming surface is deliberately tiny. **Two colors are the
 * inputs** — `--accent-primary` and `--accent-secondary`, each with its `-rgb`
 * channel, so four declarations for two decisions. Neutral, radius and density
 * are optional *preferences*. Statuses and chart colors are the design
 * language's own and are solved against each scheme's ground rather than
 * offered as knobs. Adaptation means changing the inputs, never the formula.
 *
 * That contract is only worth stating if a consumer who changes the inputs gets
 * *everything*. The failure mode is not a token that ignores the accent — it is
 * a token that used to follow it and now carries a literal, because someone was
 * fixing one region's contrast and a hex was the quickest way. The history is
 * in the contrast contract's own notes: a pinned accent literal for the navy
 * island, a white `--on-accent` exception, a container-scoped accent that only
 * half-recolored. Each was correct locally and each was a place the brand
 * stopped propagating, discoverable only by theming the library and looking.
 *
 * Two rules, because the obvious one alone has a hole. Deriving the
 * accent-dependent set from `:root` and checking other blocks for a baked
 * member of it misses a bake *at* `:root` — the token stops referencing the
 * accent, so it drops out of the set and the check reports a smaller number
 * and a pass. The first version of this did exactly that.
 *
 *   1. The brand is spelled once per scheme, in its own declaration. Any other
 *      token containing an accent literal is a copy that will not follow.
 *   2. A token that follows the accents at `:root` keeps following them in
 *      every other block — the light scheme, the softened schemes, the pinned
 *      regions. This is the shape of the pinned-literal rescue.
 *
 * Thirty-five tokens follow the two accents today: every glow, focus ring,
 * gradient, tint, interactive state and ground mix. None of them bakes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_CSS = path.join(
  __dirname,
  '..',
  '..',
  'packages',
  'web-components',
  'src',
  'base.css',
);

/** The inputs. Four declarations, two colors. */
const INPUTS = [
  '--accent-primary',
  '--accent-secondary',
  '--accent-primary-rgb',
  '--accent-secondary-rgb',
];

const css = fs.readFileSync(BASE_CSS, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

const blocks = [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)]
  .map((m) => ({
    selector: m[1].trim().split('\n').pop().trim(),
    decls: [...m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]),
  }))
  .filter((b) => b.decls.length);

/* The accent-dependent set is read from :root, not from the union of every
   block. A surface is a literal neutral at :root and accent-derived inside a
   softened region — that is what "softened" means — so a union would call
   --bg-deep accent-dependent and then report its own :root value as a bake.
   The :root scheme is the one that says what a token is *for*. */
const root = new Map();
for (const b of blocks) {
  if (b.selector !== ':root') continue;
  for (const [name, value] of b.decls) root.set(name, value);
}

if (root.size === 0) {
  console.error(
    `\n✗ no :root declarations in base.css — run \`pnpm generate\` before this check.\n`,
  );
  process.exit(1);
}

/* Transitive closure: a token that references a token that references an input.
   Iterated to a fixed point rather than walked once, because the compounds are
   layered — --interactive-active is --glow-primary is the accent channel. */
const derived = new Set(INPUTS);
for (let changed = true; changed; ) {
  changed = false;
  for (const [name, value] of root) {
    if (derived.has(name)) continue;
    for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (!derived.has(ref[1])) continue;
      derived.add(name);
      changed = true;
      break;
    }
  }
}

const COLOR = /(#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(|\b\d{1,3},\s*\d{1,3},\s*\d{1,3}\b)/i;
const isLiteral = (value) => !value.includes('var(') && COLOR.test(value);

/**
 * The brand, as the strings that actually appear in the stylesheet.
 *
 * Collected from the input declarations themselves rather than imported from
 * the tree, so every scheme's own accent — dark, light, and the two softened
 * variants — is covered without a second list to keep in step.
 */
const brandLiterals = new Set();
for (const { decls } of blocks) {
  for (const [name, value] of decls) {
    if (!INPUTS.includes(name) || value.includes('var(')) continue;
    const channels = /\b(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\b/.exec(value);
    if (channels) brandLiterals.add(`${channels[1]}, ${channels[2]}, ${channels[3]}`);
  }
}

/**
 * The one palette that carries the brand's own value and must not follow it.
 *
 * `--chart-1` is `#4d7ef7`, which is the dark scheme's accent to the byte. That
 * is a coincidence of seed choice, not a derivation: the six chart colors are
 * validated as a set — OKLCH lightness band, chroma floor, CVD separation
 * between adjacent pairs, 3:1 against bg-card in both themes — and pointing one
 * of them at a consumer's brand would break every one of those properties for
 * whatever color they picked. A series color is data, not chrome.
 */
const EXEMPT = /^--chart-\d$/;

const failures = [];

// Rule 1: the brand appears once per scheme, in its own declaration.
for (const { selector, decls } of blocks) {
  for (const [name, value] of decls) {
    if (INPUTS.includes(name) || EXEMPT.test(name)) continue;
    for (const brand of brandLiterals) {
      const [r, g, b] = brand.split(', ');
      const hex = `#${[r, g, b].map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
      if (!value.includes(brand) && !value.toLowerCase().includes(hex)) continue;
      failures.push({
        selector,
        name,
        value: value.slice(0, 90),
        why: `spells the brand (${brand}) instead of referencing it`,
      });
      break;
    }
  }
}

// Rule 2: a token that follows the accents at :root keeps following them
// everywhere. This is the "pinned literal for the navy island" shape — a value
// that is not the brand, substituted for one that was.
for (const { selector, decls } of blocks) {
  for (const [name, value] of decls) {
    if (INPUTS.includes(name) || !derived.has(name) || !isLiteral(value)) continue;
    failures.push({ selector, name, value: value.slice(0, 90), why: 'baked to a literal' });
  }
}

/**
 * Rule 3, and the reason it is a number rather than a shape.
 *
 * Rules 1 and 2 both read the accent-dependent set out of `:root`, so a token
 * baked *at* `:root` leaves the set and takes its own violation with it — the
 * check reports a smaller count and a pass. Rule 1 catches that when the baked
 * value is the brand, which is the common case, but a compound rewritten to
 * some other literal escapes both.
 *
 * There is no structural signal for "this used to follow the accent", so the
 * floor is the signal. Raise it freely when a compound is added. Lowering it is
 * the thing to be suspicious of: it means something that carried the brand
 * stopped, and that is a decision, not a cleanup.
 */
const FLOOR = 35;
const following = derived.size - INPUTS.length;
if (following < FLOOR) {
  console.error(
    `\n✗ ${following} tokens follow the two accents, down from ${FLOOR}.\n\n` +
      `  Something that carried the brand stopped carrying it. Find it by diffing\n` +
      `  base.css against the previous build; if the drop is deliberate, lower FLOOR\n` +
      `  in this file and say which compound went and why.\n`,
  );
  process.exit(1);
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} token(s) outside the two-color contract:\n`);
  for (const f of failures) {
    console.error(`  ${f.selector}`);
    console.error(`    ${f.name}: ${f.value}`);
    console.error(`    ${f.why}\n`);
  }
  console.error(
    `  These follow --accent-primary / --accent-secondary at :root and stop following\n` +
      `  them here, so a consumer who sets the two inputs gets a page that is mostly\n` +
      `  their brand with these left behind. Compose from the input, or move the value\n` +
      `  into shared/tokens.js where the whole scheme is solved.\n`,
  );
  process.exit(1);
}

console.log(
  `✓ ${derived.size - INPUTS.length} tokens follow the two-color contract, and the brand is ` +
    `spelled only in its own ${brandLiterals.size} declarations`,
);
