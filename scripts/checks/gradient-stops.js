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
 * ── The components, swept in 4.5 ──
 *
 * This ran over shared/tokens.js alone for a release and a half, on the stated
 * grounds that component CSS needed "a real parse" to tell a stop list from a
 * flat `background: transparent`. That was wrong, and expensively: the balanced
 * scan below *already* isolates the stop list, because it walks from the
 * gradient's open paren to its matching close, and a flat value is never inside
 * one. The check could have covered the components from the day it was written.
 *
 * It found forty-two, against the fourteen in the token file — twenty-four in
 * arc-divider alone, several of them a published token spelled out by hand with
 * one difference: the token faded to zero alpha and the copy faded to
 * transparent black. `--glow-line-white` and arc-divider's `line-white` variant
 * were character-for-character identical apart from that.
 *
 * 4.5's scheme-parity row is what makes this urgent rather than tidy. Every one
 * of the forty-two is invisible on a near-black page and a hard grey rectangle
 * on a near-white one, and light is about to become a first-class scheme.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const TOKENS = path.join('shared', 'tokens.js');
const COMPONENTS = path.join('packages', 'web-components', 'src');

/**
 * The one place transparent black is the right answer.
 *
 * An HSV square is a black overlay whose alpha ramps to nothing over the hue
 * beneath it. The stop *is* black at zero alpha; naming the adjacent color
 * would be the mistake here.
 */
const EXEMPT = new Set(['input/color-picker.js']);

const failures = [];

/**
 * A lobe input set anywhere but `:host` is a no-op, and a silent one.
 *
 * `--lobe-line` and its siblings are gradients with `var()`s inside them. A
 * custom property substitutes its own variables when *it* is computed, at the
 * element that declares it — and every component declares the lobes on `:host`,
 * through the generated token layer. Inheritance then carries the *substituted*
 * string down, so `--lobe-rgb` on an inner node arrives after the decision it
 * was meant to make.
 *
 * Nothing about that fails loudly. The declaration is valid, the gradient is
 * valid, and the element paints in the fallback color. Twelve components were
 * built that way first.
 */
function lobeInputs(file, rel) {
  const src = fs.readFileSync(file, 'utf-8');
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    if (!/--lobe-(rgb|alpha|axis|shape|extent)\s*:/.test(line)) return;
    // The selector this declaration sits under. A one-line rule carries it on
    // the same line, so check that before walking back — otherwise the walk
    // finds the *previous* rule's selector and reports a correct declaration.
    let selector = null;
    const inline = /^\s*([.:#\w[][^;{}]*?)\s*\{[^{}]*--lobe-/.exec(line);
    if (inline) selector = inline[1].replace(/\s+/g, ' ').trim();
    for (let j = i; selector === null && j >= 0 && j > i - 40; j--) {
      const m = /^\s*([.:#\w[][^;{}]*?)\s*\{\s*$/.exec(lines[j]);
      if (m) selector = m[1].replace(/\s+/g, ' ').trim();
    }
    if (selector === null || /^:host\b[^ ]*$/.test(selector)) return;
    failures.push({
      file: rel,
      line: i + 1,
      text: `${line.trim()}   (in \`${selector}\`)`,
      lobe: true,
    });
  });
}

function scan(file, rel) {
  const src = fs.readFileSync(file, 'utf-8');

  /* Comments explain the rule and quote the keyword, so they are stripped
     before the scan — otherwise the note above this rule fails the rule. */
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

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
      file: rel,
      line: code.slice(0, open.index).split('\n').length,
      text: code.slice(open.index, i).replace(/\s+/g, ' ').slice(0, 110),
    });
  }
}

scan(path.join(ROOT, TOKENS), TOKENS);

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'icons') walk(full);
    } else if (entry.name.endsWith('.js')) {
      const rel = path.relative(path.join(ROOT, COMPONENTS), full).split(path.sep).join('/');
      lobeInputs(full, `${COMPONENTS}/${rel}`);
      if (!EXEMPT.has(rel)) scan(full, `${COMPONENTS}/${rel}`);
    }
  }
})(path.join(ROOT, COMPONENTS));

const fades = failures.filter((f) => !f.lobe);
const misplaced = failures.filter((f) => f.lobe);

if (fades.length > 0) {
  console.error(`\n✗ ${fades.length} gradient(s) fading to the \`transparent\` keyword:\n`);
  for (const f of fades) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.text}\n`);
  }
  console.error(
    `  \`transparent\` is rgba(0, 0, 0, 0), so these darken as they fade and leave a\n` +
      `  hard edge where the gradient meets its box. Use the adjacent stop's color at\n` +
      `  zero alpha instead — rgba(var(--accent-primary-rgb), 0) — or one of the lobe\n` +
      `  tokens, which cannot be spelled wrong: var(--lobe-line), --lobe-start,\n` +
      `  --lobe-end, --lobe-ambient, driven by --lobe-rgb / --lobe-alpha / --lobe-axis.\n`,
  );
}

if (misplaced.length > 0) {
  console.error(`\n✗ ${misplaced.length} lobe input(s) set somewhere they cannot take effect:\n`);
  for (const f of misplaced) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.text}\n`);
  }
  console.error(
    `  A lobe shape is declared on :host and substitutes its var()s there, so an\n` +
      `  input set on an inner element arrives after the decision it was meant to\n` +
      `  make. Move these to a :host rule. Nothing fails at runtime — the element\n` +
      `  simply paints in the fallback color.\n`,
  );
}

if (failures.length > 0) process.exit(1);

console.log('✓ no gradient fades to transparent black, and every lobe input is on :host');
