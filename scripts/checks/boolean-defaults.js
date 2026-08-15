#!/usr/bin/env node
/**
 * check-boolean-defaults.js
 *
 * Asserts that every boolean prop is declared through `flag()`, and names the
 * only two reasons one may not be.
 *
 * **This rule changed shape once the migration finished (V4-PLAN 2.2).** It
 * shipped as "no `type: Boolean` prop defaulting to `true` may be left without
 * a way to turn it off from markup", carrying a BASELINE of the twenty props
 * that already were. Finding #20 said what should happen when the vocabulary
 * landed: *"it is rewritten to flag any `type: Boolean` not declared through
 * `flag()`, which turns its BASELINE from a list of twenty into a list of one
 * rule."* That is this file now. The BASELINE is gone, not emptied.
 *
 * The original problem, kept because it is why `flag()` exists at all:
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
 * `flag()` settles it for both directions at once — `flag(false)` reads an
 * explicit falsey string as false, and `flag(true, { negative: 'no-x' })` gives
 * a true default a markup spelling for its false state. The four components
 * that once carried a hand-written escape-hatch converter (arc-activity-heatmap
 * `legend`, arc-uptime `summary`, arc-video `controls`, arc-keyboard-map
 * `labels`) are on `flag()` now, and so are the other sixteen.
 *
 * THE TWO EXEMPTIONS, each of which must be spelled in the source:
 *
 *   1. **`disabled` on a form-associated element.** The platform owns that
 *      attribute: an element whose `disabled` content attribute is merely
 *      *present* is "actually disabled" per the HTML spec, the platform calls
 *      `formDisabledCallback(true)`, and the mixin assigns the property back —
 *      so no converter can win. `disabled="false"` is a disabled control here
 *      for exactly the reason it is on a native `<input>`. Native semantics
 *      win; see the note in shared/props.js. 27 controls.
 *   2. **A documented tri-state**, where *unset* is a third meaning rather than
 *      a synonym for false. `arc-clock.hour12` is the only one: true forces
 *      12-hour, false forces 24-hour, and undefined lets the viewer's locale
 *      decide. `flag()` collapses undefined onto the declared default, which
 *      would delete the third state.
 *
 * Both are recognised by a `// NOT flag():` comment on the line above the
 * declaration, so an exemption has to be *stated* rather than inferred from a
 * shape — a check that guesses at intent is a check that can be fooled by
 * accident. A new exemption means writing down why.
 *
 * WHAT IS STILL NOT A FAILURE:
 *
 *   - A prop declared `attribute: false`. It is script-only by design, so there
 *     is no markup path to break.
 *   - `state: true`. Internal, not a prop.
 *
 * check.js discards a passing check's stdout, so `pnpm check` shows only `ok` —
 * run this file directly to see the count it verified:
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

/**
 * Declarations carrying a `// NOT flag():` comment on the line above.
 *
 * Stated rather than inferred: an exemption a check can *deduce* from a shape
 * is one a component can acquire by accident. Writing the reason down is the
 * price of taking it.
 */
function exempted(src) {
  const out = new Set();
  const lines = src.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const decl = /^\s*(\w+)\s*:/.exec(lines[i]);
    if (!decl) continue;
    // Walk back over a contiguous comment block, so a multi-line reason counts.
    for (let j = i - 1; j >= 0 && /^\s*(\/\/|\*|\/\*)/.test(lines[j]); j--) {
      if (/NOT flag\(\)/.test(lines[j])) {
        out.add(decl[1]);
        break;
      }
    }
  }
  return out;
}

const problems = [];
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
    const waived = exempted(src);

    for (const [prop, decl] of decls) {
      if (!/type\s*:\s*Boolean/.test(decl)) continue;
      if (/\bstate\s*:\s*true/.test(decl)) continue;
      if (/attribute\s*:\s*false/.test(decl)) continue;

      checked++;
      if (waived.has(prop)) continue;

      problems.push(
        `${rel} — \`${prop}\` is a raw \`type: Boolean\`; declare it with flag() ` +
          `so \`${attributeFor(prop, decl)}="false"\` means false`,
      );
    }
  }
}

const REMEDY =
  'Declare the prop through the vocabulary:\n' +
  '  import { flag } from "../shared/props.js";\n' +
  '  showDots: flag(true, { negative: "no-dots" })   // a true default\n' +
  '  removable: flag(false)                          // a false default\n' +
  'A true default REQUIRES a `negative` attribute name — flag() throws without\n' +
  'one, because presence-means-true has no markup spelling for the false state.\n' +
  '\n' +
  'If the prop is genuinely one of the two exemptions — platform-owned\n' +
  '`disabled` on a form-associated element, or a documented tri-state where\n' +
  'unset is a third meaning — put a `// NOT flag(): <reason>` comment on the\n' +
  'line above the declaration. The reason is the point; see the header.';

if (problems.length) {
  console.error(
    `check-boolean-defaults: ${problems.length} boolean prop(s) not declared through flag()\n`,
  );
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

console.log(
  `check-boolean-defaults: ${checked} boolean prop(s) checked, every one declared ` +
    'through flag() or exempt with a stated reason',
);
process.exit(0);
