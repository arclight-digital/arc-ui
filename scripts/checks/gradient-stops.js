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
 *
 * ── On `scripts/lib/source-walker.js` (V4-PLAN 4.10) ──
 *
 * Two rules now, because the file always held two: the stop-list scan, which
 * reads the whole module because a gradient can be built in a JS template
 * literal as well as in a `css` block (arc-color-picker's is), and the lobe
 * input scan, which reads CSS rules. The walker owns `code` and `balanced` for
 * the first and `cssRules` for the second. shared/tokens.js is not a component
 * and is swept beside `run()`, as it was before the components joined it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  ComponentSource,
  balanced,
  lineAt,
  run,
  withoutComments,
} from '../lib/source-walker.js';
import { findComponents, SRC_DIR } from '../lib/component-tags.js';

const ROOT = resolve(SRC_DIR, '..', '..', '..');
const TOKENS = join('shared', 'tokens.js');

/**
 * The one place transparent black is the right answer.
 *
 * An HSV square is a black overlay whose alpha ramps to nothing over the hue
 * beneath it. The stop *is* black at zero alpha; naming the adjacent color
 * would be the mistake here.
 */
const EXEMPT = new Set(['input/color-picker.js']);

/**
 * Every gradient in a module whose stop list names `transparent`.
 *
 * The scan the header describes, unchanged in what it looks at and moved onto
 * the walker's two primitives for how. Both were written out by hand here, and
 * both were written out by hand in four other checks, which is why the walker
 * exists:
 *
 *     Comments explain the rule and quote the keyword, so they are stripped
 *     before the scan — otherwise the note above this rule fails the rule.
 *
 *     A balanced scan rather than a regex. These values nest two deep —
 *     `rgba(var(--accent-primary-rgb), 0.2)` — and a bracket-class pattern that
 *     tolerates one level silently matched 3 of the 14 real cases, which is the
 *     worst outcome for a check: green, and wrong.
 *
 * `withoutComments` blanks rather than deletes, so unlike the hand-rolled strip
 * this reports the line the gradient is really on: the old copy counted lines
 * in the stripped text and pointed above every block comment in the file.
 */
function transparentGradients(code, source, emit) {
  for (const open of code.matchAll(/\b(?:linear|radial|conic)-gradient\(/g)) {
    const span = balanced(code, open.index, '(', ')');
    if (!span) continue; // unbalanced, not something to judge
    const stops = span.body;
    if (!/(^|[\s,])transparent(\s|,|$)/.test(stops)) continue;
    emit(
      lineAt(source, open.index),
      code.slice(open.index, span.end + 1).replace(/\s+/g, ' ').slice(0, 110),
    );
  }
}

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
 *
 * Read off `cssRules` rather than by scanning lines and walking back for the
 * enclosing selector. The hand-rolled version carried this note beside the
 * walk:
 *
 *     The selector this declaration sits under. A one-line rule carries it on
 *     the same line, so check that before walking back — otherwise the walk
 *     finds the *previous* rule's selector and reports a correct declaration.
 *
 * — which is the same one-line-rule blind spot check-focus-ring records against
 * its own backscan, found twice and fixed twice. The walker reads innermost
 * selector/body pairs, so there is no backscan left to get wrong. A finding is
 * reported at the rule rather than at the declaration inside it; the message
 * quotes both.
 *
 * A rule's selector runs from the previous rule's closing brace, so a CSS
 * comment above `:host` is part of it — blanked here, along with the comments
 * in the body, for the reason every other check on the walker blanks them: a
 * note *about* a lobe input is not one.
 */
function misplacedLobeInputs(cssRules, emit) {
  for (const rule of cssRules) {
    const selector = withoutComments(rule.selector).replace(/\s+/g, ' ').trim();
    if (/^:host\b[^ ]*$/.test(selector)) continue;
    for (const decl of withoutComments(rule.body).split(';')) {
      if (!/--lobe-(rgb|alpha|axis|shape|extent)\s*:/.test(decl)) continue;
      emit(rule.line, `${decl.trim()};   (in \`${selector}\`)`);
    }
  }
}

const fadesToBlack = {
  name: 'gradient-stops',
  describe: 'no gradient stop fades to the `transparent` keyword',
  hint:
    '`transparent` is rgba(0, 0, 0, 0), so these darken as they fade and leave a\n' +
    '    hard edge where the gradient meets its box. Use the adjacent stop\'s color at\n' +
    '    zero alpha instead — rgba(var(--accent-primary-rgb), 0) — or one of the lobe\n' +
    '    tokens, which cannot be spelled wrong: var(--lobe-line), --lobe-start,\n' +
    '    --lobe-end, --lobe-ambient, driven by --lobe-rgb / --lobe-alpha / --lobe-axis.',
  component({ meta, code, source, report }) {
    if (EXEMPT.has(`${meta.tier}/${meta.file}`)) return;
    transparentGradients(code, source, report);
  },
};

const lobeInputsOnHost = {
  name: 'lobe-inputs',
  describe: 'every lobe input is declared on :host, where it can take effect',
  hint:
    'A lobe shape is declared on :host and substitutes its var()s there, so an\n' +
    '    input set on an inner element arrives after the decision it was meant to\n' +
    '    make. Move these to a :host rule. Nothing fails at runtime — the element\n' +
    '    simply paints in the fallback color.',
  component({ cssRules, report }) {
    misplacedLobeInputs(cssRules, report);
  },
};

const code = run({ name: 'gradient-stops', rules: [fadesToBlack, lobeInputsOnHost] });

// ── Beside run(): the files that are not components ─────────────────────────

/**
 * A walker view of a file `run()` does not visit.
 *
 * The sweep always covered the whole tree, and the tree holds modules that are
 * not components: the shared style sheets, the generated token layer, the SSR
 * entry. `ComponentSource` is the same reader either way, so they are read with
 * the same primitives rather than through a second, drifting scan.
 */
function viewOf(file) {
  const rel = relative(SRC_DIR, file);
  return new ComponentSource(
    { tag: rel, tier: '.', file: rel },
    readFileSync(file, 'utf-8'),
  );
}

/** Every .js under src. */
function sources(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'icons') sources(full, out);
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

const failures = [];
const emitFor = (rel) => (line, text) => failures.push({ file: rel, line, text });

// shared/tokens.js — where the fourteen were, and not a component.
const tokensSource = readFileSync(resolve(ROOT, TOKENS), 'utf-8');
transparentGradients(withoutComments(tokensSource), tokensSource, emitFor(TOKENS));

const visited = new Set(
  [...findComponents().values()].map((m) => resolve(SRC_DIR, m.tier, m.file)),
);
for (const file of sources(SRC_DIR)) {
  if (visited.has(file)) continue;
  const view = viewOf(file);
  misplacedLobeInputs(view.cssRules, emitFor(view.file));
  if (!EXEMPT.has(relative(SRC_DIR, file))) {
    transparentGradients(view.code, view.source, emitFor(view.file));
  }
}

if (failures.length > 0) {
  console.error(`\ncheck-gradient-stops: ${failures.length} finding(s) outside the components\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.text}\n`);
  }
}

/**
 * EXEMPT, checked against the tree.
 *
 * Same reasoning as size-canon's lists: an exemption for a file that no longer
 * exists, or that no longer has a gradient needing it, is a decision about
 * nothing — and the next reader takes it as evidence that fading to transparent
 * black is sometimes simply fine.
 */
const stale = [];
for (const rel of EXEMPT) {
  const file = resolve(SRC_DIR, rel);
  let source;
  try {
    source = readFileSync(file, 'utf-8');
  } catch {
    stale.push(`${rel} is exempt but is not a file under src`);
    continue;
  }
  let needed = 0;
  transparentGradients(withoutComments(source), source, () => needed++);
  if (needed === 0) stale.push(`${rel} is exempt but has no gradient fading to transparent`);
}
if (stale.length > 0) {
  console.error('\ncheck-gradient-stops: the EXEMPT list is stale\n');
  for (const s of stale) console.error(`  ${s}`);
  process.exit(1);
}

if (failures.length > 0) process.exit(1);

process.exit(code);
