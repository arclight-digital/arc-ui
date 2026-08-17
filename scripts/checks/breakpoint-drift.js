#!/usr/bin/env node
/**
 * check-breakpoint-drift.js
 *
 * Asserts that every media query marked `nav-collapse` still uses the width in
 * tokens.breakpoint.navCollapse.
 *
 * The failure this catches is two hamburgers, or none.
 *
 * arc-top-bar reveals its menu button below a width, arc-navigation-menu hides
 * its links below the same width, arc-app-shell switches its sidebar to a
 * drawer there, and arc-navigation-menu closes its mobile panel above it. Those
 * four have to agree. The last two are JS and read the token directly. The
 * first two are media queries, and a media query cannot read a CSS custom
 * property — `@media (max-width: var(--x))` is invalid, with no workaround.
 *
 * The obvious fix, interpolating the number into the `css` template, does not
 * survive the build: prism parses these templates as text to produce the
 * standalone CSS package and cannot evaluate a `${...}`. Doing it dropped both
 * queries from arc-ui.css entirely — the components still worked, the CSS
 * package silently stopped being responsive.
 *
 * So the literals stay, and this asserts they cannot drift from the token.
 * Marker-based rather than pattern-based: only queries tagged `nav-collapse` in
 * a nearby comment are checked, so an unrelated media query at the same width
 * is not accidentally conscripted.
 *
 * Run via: pnpm check breakpoint-drift (and as part of pnpm generate)
 *
 * ── On `scripts/lib/source-walker.js` (V4-PLAN 4.10) ──
 *
 * The marker lives in a *comment*, so this is the one check on the walker that
 * reads `source` rather than `code`: blanking the comments would blank the
 * thing being looked for. Everything else the walker owns — which components
 * exist, opening them, formatting a finding — it owns here too, and the two
 * files outside the component set that the original sweep covered are swept
 * beside `run()`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { run } from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';
import { tokens } from '../../shared/tokens.js';

const ROOT = resolve(SRC_DIR, '..', '..', '..');

/**
 * Marker → the token its query must match.
 *
 * Two markers since the container-query split: `nav-collapse:` tags the
 * viewport queries (the hamburger, the mobile panel timing), and `nav-fit:`
 * tags arc-navigation-menu's container query, which measures the column the
 * pills sit in rather than the page. One number serving both is the defect
 * that split them — see the navFit comment in shared/tokens.js.
 */
const MARKERS = {
  'nav-collapse:': ['navCollapse', Number.parseFloat(tokens.breakpoint.navCollapse)],
  'nav-fit:': ['navFit', Number.parseFloat(tokens.breakpoint.navFit)],
};

/**
 * Marked queries actually inspected, across the components and the sweep below.
 *
 * A module-level counter rather than a return value because the rule reports
 * through `run()` and the vacuity guard has to see both halves of the walk.
 */
let checked = 0;

/** Every marked query in one file, reported through `emit(line, message)`. */
function scanMarkers(source, emit) {
  const lines = source.split('\n');
  lines.forEach((line, i) => {
    const marker = Object.keys(MARKERS).find((m) => line.includes(m));
    if (!marker) return;
    const [tokenName, expected] = MARKERS[marker];
    // The marked query is the next media query within a short window — the
    // marker sits in a comment that may run several lines before it.
    const window = lines.slice(i, i + 20).join('\n');
    // `@container` as well as `@media`. V4-PLAN 4.4 moved arc-navigation-menu
    // onto a container query — the component is the unit, not the page — and
    // the literal still has to match the token for the same reason it always
    // did: a container query cannot read a custom property either.
    const match = window.match(
      /@(?:media|container)\s+(?:[\w-]+\s+)?\([^)]*?(\d+(?:\.\d+)?)px\s*\)/,
    );
    if (!match) {
      emit(i + 1, `marked ${marker} but no media or container query follows within 20 lines`);
      return;
    }
    checked++;
    const found = Number.parseFloat(match[1]);
    if (found !== expected) {
      emit(i + 1, `query uses ${found}px, but tokens.breakpoint.${tokenName} is ${expected}px`);
    }
  });
}

const navCollapse = {
  name: 'breakpoint-drift',
  describe: `a marked query uses its token — ${Object.entries(MARKERS)
    .map(([m, [t, v]]) => `\`${m}\` → ${t} (${v}px)`)
    .join(', ')}`,
  hint:
    'Change the literal to match the token, not the token to match the literal — the\n' +
    '    JS side reads the token directly and the two have to agree.\n' +
    '    It stays a literal: prism reads these templates as text and cannot evaluate an\n' +
    '    interpolation, so a `${...}` here drops the query from arc-ui.css entirely.',
  component({ source, report }) {
    scanMarkers(source, report);
  },
};

/** Every .js under src, minus the generated tree. */
function sources(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated' || entry.name === 'icons') continue;
      sources(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const code = run({ name: 'breakpoint-drift', rules: [navCollapse] });

/**
 * The rest of the tree, beside `run()`.
 *
 * `run()` visits components; a marker can sit in any module under src, and the
 * original swept all of them. Everything the walk already covered is skipped
 * here so a finding is never reported twice.
 */
const visited = new Set(
  [...findComponents().values()].map((m) => resolve(SRC_DIR, m.tier, m.file)),
);
const strays = [];
for (const file of sources(SRC_DIR)) {
  if (visited.has(file)) continue;
  scanMarkers(readFileSync(file, 'utf-8'), (line, message) =>
    strays.push(`${relative(ROOT, file)}:${line}: ${message}`),
  );
}

if (strays.length > 0) {
  console.error(`\ncheck-breakpoint-drift: ${strays.length} marked quer(ies) outside the components\n`);
  for (const s of strays) console.error(`  ${s}`);
  process.exit(1);
}

if (checked === 0) {
  console.error(
    `check-breakpoint-drift: no ${Object.keys(MARKERS).join(' / ')} markers found. Either the marker was renamed `
    + 'or the queries were removed — both leave this check asserting nothing.',
  );
  process.exit(1);
}

process.exit(code);
