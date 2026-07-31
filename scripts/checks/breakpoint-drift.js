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
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens } from '../../shared/tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', '..', 'packages', 'web-components', 'src');

const expected = Number.parseFloat(tokens.breakpoint.navCollapse);
const MARKER = 'nav-collapse:';

/** Every .js under src, minus the generated tree. */
function sources(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated' || entry.name === 'icons') continue;
      sources(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const problems = [];
let checked = 0;

for (const file of sources(SRC)) {
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  lines.forEach((line, i) => {
    if (!line.includes(MARKER)) return;
    // The marked query is the next media query within a short window — the
    // marker sits in a comment that may run several lines before it.
    const window = lines.slice(i, i + 14).join('\n');
    const match = window.match(/@media\s*\([^)]*?(\d+(?:\.\d+)?)px\s*\)/);
    const rel = path.relative(path.join(__dirname, '..', '..'), file);
    if (!match) {
      problems.push(`${rel}:${i + 1}: marked ${MARKER} but no media query follows within 14 lines`);
      return;
    }
    checked++;
    const found = Number.parseFloat(match[1]);
    if (found !== expected) {
      problems.push(
        `${rel}:${i + 1}: media query uses ${found}px, but tokens.breakpoint.navCollapse is ${expected}px`,
      );
    }
  });
}

if (checked === 0) {
  console.error(
    `check-breakpoint-drift: no ${MARKER} markers found. Either the marker was renamed `
    + 'or the queries were removed — both leave this check asserting nothing.',
  );
  process.exit(1);
}

if (problems.length > 0) {
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n✗ ${problems.length} breakpoint drift problem(s)`);
  process.exit(1);
}

console.log(`check-breakpoint-drift: ${checked} nav-collapse media quer${checked === 1 ? 'y' : 'ies'} match ${expected}px`);
