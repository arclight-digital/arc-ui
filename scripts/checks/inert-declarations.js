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
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const SRC = path.join(root, 'packages', 'web-components', 'src');

const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

/** A declaration helper used as a property value: `foo: flag(...)`. */
const DECLARES = /^\s*\w+:\s*(flag|oneOf|num|int)\(/m;
const ADOPTS = /extends\s+DeclaredPropsMixin\(/;

const inert = [];
let checked = 0;

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js')) continue;
    const full = path.join(dir, file);
    const src = fs.readFileSync(full, 'utf8');

    // Only classes are candidates; shared helpers export functions.
    if (!/^export class /m.test(src)) continue;

    // A mixin declares props for its consumers and is not itself a class that
    // can extend DeclaredPropsMixin. FormControlMixin declares `required` and
    // `readonly` for all 26 form controls, every one of which composes the
    // vocabulary itself — verified separately, since this check cannot see
    // across files.
    if (/^export const \w+Mixin = \(superClass\)/m.test(src)) continue;
    checked += 1;

    const declares = DECLARES.test(src);
    const adopts = ADOPTS.test(src);

    if (declares && !adopts) inert.push(`${tier}/${file}`);
  }
}

// Anti-vacuity: this check is worthless if it silently stops finding anything
// to look at, which is how a path change would present.
if (checked < 100) {
  console.error(`check-inert-declarations: only ${checked} component classes found — expected 100+.`);
  console.error('The source layout probably moved; this check was about to pass by looking at nothing.');
  process.exit(1);
}

if (!inert.length) {
  console.log(`check-inert-declarations: ${checked} classes, every declaration is live`);
  process.exit(0);
}

if (inert.length) {
  console.error(
    `check-inert-declarations: ${inert.length} component(s) declare props the mixin never enforces\n`,
  );
  for (const row of inert) console.error(`    ${row}`);
  console.error(
    '\nAdd the mixin to the class: `export class ArcX extends DeclaredPropsMixin(LitElement)`.\n' +
      'Without it the declaration normalises nothing and fails silently — the docs and the\n' +
      'wrapper types promise a constraint that does not exist.',
  );
}


process.exit(1);
