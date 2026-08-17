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
 *
 * V4-PLAN 4.10 moved this onto `scripts/lib/source-walker.js`. The brace-depth
 * walk of `static properties` that used to live here is the walker's `props`,
 * and the reason it has to be a walk rather than a regex — a nested
 * `converter: { … }` belongs to its parent, and the converter is the thing
 * being looked for — is recorded there, once, for every check that needs it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { run, ComponentSource } from '../lib/source-walker.js';
import { findComponents, SRC_DIR, TIERS } from '../lib/component-tags.js';

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

/**
 * A declaration that hands Lit its stock boolean converter.
 *
 * `attribute: false` and `state: true` are the two shapes with no markup path
 * to break, so neither is counted and neither can fail.
 */
function isRawBoolean(decl) {
  if (!/type\s*:\s*Boolean/.test(decl)) return false;
  if (/\bstate\s*:\s*true/.test(decl)) return false;
  if (/attribute\s*:\s*false/.test(decl)) return false;
  return true;
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

/** REMEDY as a rule hint: run() indents the first line, so indent the rest. */
const asHint = (text) => text.replace(/^(?=.)/gm, '    ').trimStart();

/** Every boolean prop the sweep looked at, components and shared modules alike. */
let checked = 0;

const throughFlag = {
  name: 'boolean-defaults',
  describe: 'every boolean prop is declared through flag()',
  hint: asHint(REMEDY),
  component({ source, props, report }) {
    const waived = exempted(source);
    for (const { name, text, line } of props) {
      if (!isRawBoolean(text)) continue;

      checked++;
      if (waived.has(name)) continue;

      report(
        line,
        `\`${name}\` is a raw \`type: Boolean\`; declare it with flag() ` +
          `so \`${attributeFor(name, text)}="false"\` means false`,
      );
    }
  },
};

/**
 * The tier modules that are not components, swept the same way.
 *
 * The original walked every `.js` in every tier rather than the registered
 * catalog, and two of the files that are not components declare props all the
 * same: `shared/form-control-mixin.js` declares `required` and `readonly` for
 * all 26 form controls, and `shared/props.js` is the vocabulary itself. The
 * walker iterates components, so those keep being read here — through the same
 * `ComponentSource`, so the shared-module half and the component half cannot
 * drift into reading a declaration two different ways.
 */
function scanSharedModules() {
  const components = new Set(
    [...findComponents().values()].map((m) => `${m.tier}/${m.file}`),
  );
  const problems = [];

  for (const tier of TIERS) {
    for (const file of readdirSync(resolve(SRC_DIR, tier))) {
      if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;
      const rel = `${tier}/${file}`;
      if (components.has(rel)) continue;

      const source = readFileSync(resolve(SRC_DIR, tier, file), 'utf-8');
      const view = new ComponentSource({ tag: rel, tier, file }, source);
      const waived = exempted(source);

      for (const { name, text, line } of view.props) {
        if (!isRawBoolean(text)) continue;

        checked++;
        if (waived.has(name)) continue;

        problems.push(
          `${view.file}:${line} — \`${name}\` is a raw \`type: Boolean\`; declare it with ` +
            `flag() so \`${attributeFor(name, text)}="false"\` means false`,
        );
      }
    }
  }
  return problems;
}

const code = run({ name: 'boolean-defaults', rules: [throughFlag] });

// After the sweep, for the same reason size-canon audits its lists there: a
// shared module's raw boolean is reported beside the component findings rather
// than instead of them.
const shared = scanSharedModules();
if (shared.length) {
  console.error(
    `\ncheck-boolean-defaults: ${shared.length} boolean prop(s) not declared through flag() ` +
      'outside the component catalog\n',
  );
  for (const p of shared) console.error(`  ${p}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

if (code === 0) {
  console.log(
    `check-boolean-defaults: ${checked} boolean prop(s) checked, every one declared ` +
      'through flag() or exempt with a stated reason',
  );
}

process.exit(code);
