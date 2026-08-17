#!/usr/bin/env node
/**
 * check-inert-declarations.js
 *
 * A component that declares props with the vocabulary but does not extend
 * `DeclaredPropsMixin` gets **no normalisation at all**, silently. The
 * declaration still reads correctly, prism still generates the narrowed
 * wrapper type, the docs still say the value is clamped — and nothing enforces
 * any of it. There is no error, at build time or at runtime.
 *
 * This has now happened twice. `arc-meter` (finding #70) was caught by luck
 * while reading, and `arc-calendar` was caught by grepping four files after the
 * fact — with the trap already written down in HANDOFF.md, which did not stop
 * it. A note is not a check.
 *
 * The reverse case — extending the mixin while declaring nothing — is NOT
 * reported. It flagged 10 components on its first run and every one was
 * deliberate: form-associated controls whose `disabled` must stay a native
 * boolean attribute, each already carrying a `// NOT flag(): …` comment saying
 * so. A check that cries wolf on correct code trains people to ignore it.
 *
 * Run via: pnpm check inert-declarations
 *
 * V4-PLAN 4.10 moved this onto `scripts/lib/source-walker.js`. "Declares with
 * the vocabulary" used to be a regex over the whole file; it is now the
 * walker's `props`, asked whether any entry's value is one of the helper calls
 * — which is the same 208 verdicts, read out of the `static properties` block
 * they are actually in rather than out of anywhere the shape happens to occur.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { run, ComponentSource, lineAt } from '../lib/source-walker.js';
import { findComponents, SRC_DIR, TIERS } from '../lib/component-tags.js';

/** A declaration helper used as a property value: `foo: flag(...)`. */
const DECLARES = /^(flag|oneOf|num|int|list)\(/;
const ADOPTS = /extends\s+DeclaredPropsMixin\(/;

/** Whether any entry in `static properties` is a vocabulary helper call. */
const declaresWithVocabulary = (props) => props.some((p) => DECLARES.test(p.text.trim()));

const REMEDY =
  'Add the mixin to the class: `export class ArcX extends DeclaredPropsMixin(LitElement)`.\n' +
  'Without it the declaration normalises nothing and fails silently — the docs and the\n' +
  'wrapper types promise a constraint that does not exist.';

/** REMEDY as a rule hint: run() indents the first line, so indent the rest. */
const asHint = (text) => text.replace(/^(?=.)/gm, '    ').trimStart();

/** Every class the sweep looked at, components and shared classes alike. */
let checked = 0;

const liveDeclarations = {
  name: 'inert-declarations',
  describe: 'a class that declares props with the vocabulary extends DeclaredPropsMixin',
  hint: asHint(REMEDY),
  component({ code, props, report }) {
    checked += 1;
    if (!declaresWithVocabulary(props)) return;
    if (ADOPTS.test(code)) return;

    const at = code.search(/^export\s+class\s/m);
    report(at === -1 ? 1 : lineAt(code, at), 'declares props the mixin never enforces');
  },
};

/**
 * The tier classes that are not components, swept the same way.
 *
 * The original walked every `.js` in every tier and took every file with an
 * `export class` in it, which is the six reactive controllers in `shared/` on
 * top of the catalog. They are classes that could declare and could forget, so
 * they keep being read here — the walker iterates components.
 *
 * A mixin declares props for its consumers and is not itself a class that
 * can extend DeclaredPropsMixin. FormControlMixin declares `required` and
 * `readonly` for all 26 form controls, every one of which composes the
 * vocabulary itself — verified separately, since this check cannot see
 * across files.
 */
function scanSharedClasses() {
  const components = new Set(
    [...findComponents().values()].map((m) => `${m.tier}/${m.file}`),
  );
  const inert = [];

  for (const tier of TIERS) {
    for (const file of readdirSync(resolve(SRC_DIR, tier))) {
      if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
      const rel = `${tier}/${file}`;
      if (components.has(rel)) continue;

      const source = readFileSync(resolve(SRC_DIR, tier, file), 'utf8');

      // Only classes are candidates; shared helpers export functions.
      if (!/^export class /m.test(source)) continue;
      if (/^export const \w+Mixin = \(superClass\)/m.test(source)) continue;
      checked += 1;

      const view = new ComponentSource({ tag: rel, tier, file }, source);
      if (declaresWithVocabulary(view.props) && !ADOPTS.test(view.code)) inert.push(rel);
    }
  }
  return inert;
}

const code = run({ name: 'inert-declarations', rules: [liveDeclarations] });
const inert = scanSharedClasses();

// Anti-vacuity: this check is worthless if it silently stops finding anything
// to look at, which is how a path change would present.
// run() already refuses an empty component set; 100+ is the stronger statement
// this check has always made, and it counts the shared classes too.
if (checked < 100) {
  console.error(`check-inert-declarations: only ${checked} component classes found — expected 100+.`);
  console.error('The source layout probably moved; this check was about to pass by looking at nothing.');
  process.exit(1);
}

if (inert.length) {
  console.error(
    `\ncheck-inert-declarations: ${inert.length} class(es) declare props the mixin never enforces\n`,
  );
  for (const row of inert) console.error(`    ${row}`);
  console.error(`\n${REMEDY}`);
  process.exit(1);
}

if (code === 0) {
  console.log(`check-inert-declarations: ${checked} classes, every declaration is live`);
}

process.exit(code);
