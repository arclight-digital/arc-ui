/**
 * A gradient stop never fades to the `transparent` keyword.
 *
 * `transparent` is `rgba(0, 0, 0, 0)` — transparent *black*. Interpolating a
 * colored stop toward it walks the color to black while the alpha falls, so the
 * fade darkens instead of thinning, and wherever the gradient meets the edge of
 * its own box the residue reads as a hard line. The fix is always the same: the
 * adjacent stop's color at zero alpha, which fades to nothing.
 *
 * Fourteen of the library's gradients did this — every divider, both glow
 * hairlines, the page and section ambients, in both themes. Nothing showed,
 * because the surfaces underneath were all near-black and black is what the
 * fade was drifting toward. Then the softened schemes put those same gradients
 * on a navy ground, and the cuts appeared as rectangles — visible first under
 * the footer wordmark, where the ambient wash and the word's own fade overlap.
 *
 * A bug that is invisible on one surface and obvious on another is exactly the
 * kind that comes back, so this is checked rather than remembered.
 *
 * Scoped to the token source. Component CSS is not swept yet: `transparent` is
 * perfectly correct in the many places it is a flat value — `background:
 * transparent`, `border-color: transparent` — and telling those apart from stop
 * lists needs a real parse rather than the pattern below.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.join(__dirname, '..', '..', 'shared', 'tokens.js');

const src = fs.readFileSync(TOKENS, 'utf-8');

/* Comments explain the rule and quote the keyword, so they are stripped before
   the scan — otherwise the note above this rule fails the rule. */
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const failures = [];

/* A balanced scan rather than a regex. These values nest two deep —
   `rgba(var(--accent-primary-rgb), 0.2)` — and a bracket-class pattern that
   tolerates one level silently matched 3 of the 14 real cases, which is the
   worst outcome for a check: green, and wrong. */
for (const open of code.matchAll(/\b(?:linear|radial|conic)-gradient\(/g)) {
  const start = open.index + open[0].length;
  let depth = 1;
  let i = start;
  for (; i < code.length && depth > 0; i++) {
    if (code[i] === '(') depth++;
    else if (code[i] === ')') depth--;
  }
  if (depth !== 0) continue; // unbalanced, not something to judge
  const stops = code.slice(start, i - 1);
  if (!/(^|[\s,])transparent(\s|,|$)/.test(stops)) continue;
  failures.push({
    line: code.slice(0, open.index).split('\n').length,
    text: code.slice(open.index, i).replace(/\s+/g, ' ').slice(0, 110),
  });
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} gradient(s) fading to the \`transparent\` keyword:\n`);
  for (const f of failures) {
    console.error(`  shared/tokens.js:${f.line}`);
    console.error(`    ${f.text}\n`);
  }
  console.error(
    `  \`transparent\` is rgba(0, 0, 0, 0), so these darken as they fade and leave a\n` +
      `  hard edge where the gradient meets its box. Use the adjacent stop's color at\n` +
      `  zero alpha instead — rgba(var(--accent-primary-rgb), 0).\n`,
  );
  process.exit(1);
}

console.log('✓ no gradient fades to transparent black');
