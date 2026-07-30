/**
 * check-enum-fallbacks.js
 *
 * Asserts that no component selects its default styling by the *absence* of an
 * enum attribute.
 *
 * The failure this catches renders a component with no styling at all, silently.
 * `arc-button` accepts primary | secondary | ghost and picked its default with:
 *
 *   :host(:not([variant])) .btn { … }
 *
 * `variant` is reflected and defaults to 'primary', so that selector never
 * matched in the common path — the `[variant="primary"]` rule did the work. But
 * give it a plausible-looking value that isn't in the set, say `outline`, and
 * the attribute reflects, matches no rule, and cannot reach the default either,
 * because the default is keyed on the attribute not being there. The result is a
 * button with no background, no border and no padding, and no error anywhere.
 *
 * The fix is to key the default on "not any of the other members" instead, so
 * an unrecognised value lands on it:
 *
 *   :host(:not([variant="secondary"]):not([variant="ghost"])) .btn { … }
 *
 * which matches an absent attribute, the default, and anything unrecognised.
 *
 * Note that the sibling `:host([variant="primary"])` selector usually left on
 * the same rule is *not* redundant even though the widened selector covers it:
 * prism infers a prop's union from the `:host([prop="value"])` selectors it can
 * see, so deleting the default's own selector drops the default out of the
 * generated union. check-prop-unions.js is the check for that half.
 *
 * Boolean props are exempt — absence is the whole semantic — as is the
 * `:host(:not([prop="value"]))` form, which already routes unrecognised values
 * to the default by construction.
 *
 * Run via: pnpm run check:enum-fallbacks (and as part of pnpm generate)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'packages', 'web-components', 'src');
const TIERS = ['content', 'data', 'feedback', 'input', 'layout', 'navigation', 'typography', 'shared'];

const problems = [];
let checked = 0;

for (const tier of TIERS) {
  const dir = path.join(SRC, tier);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js') || file.endsWith('.register.js') || file === 'index.js') continue;

    const rel = `${tier}/${file}`;
    const src = fs.readFileSync(path.join(dir, file), 'utf-8');

    // Props whose default styling is keyed on the attribute being absent.
    const absenceKeyed = new Set(
      [...src.matchAll(/:host\((?:\[[\w-]+\])?:not\(\[([\w-]+)\]\)/g)].map((m) => m[1]),
    );
    if (!absenceKeyed.size) continue;

    for (const prop of absenceKeyed) {
      // An enum either documents a union or carries more than one value-keyed
      // rule in its own CSS. One value-keyed rule is a boolean-ish toggle.
      const documented = src.match(
        new RegExp(`@prop \\{([^}]*'[^}]*)\\} ${prop}\\b`),
      );
      const members = documented
        ? [...documented[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
        : [];
      const observed = new Set(
        [...src.matchAll(new RegExp(`:host\\((?:\\[open\\])?\\[${prop}="([^"]+)"\\]`, 'g'))].map((m) => m[1]),
      );

      const isEnum = members.length >= 2 || observed.size > 1;
      if (!isEnum) continue;

      checked++;
      const set = members.length >= 2 ? members : [...observed];
      problems.push(
        `${rel} — \`${prop}\` (${set.join(' | ')}) selects its default with ` +
          `:host(:not([${prop}])), so an unrecognised value renders unstyled`,
      );
    }
  }
}

if (problems.length === 0) {
  console.log(
    'check-enum-fallbacks: no enum prop keys its default styling on attribute absence',
  );
  process.exit(0);
}

console.error(
  `check-enum-fallbacks: ${problems.length} enum prop(s) render unstyled on an unrecognised value\n`,
);
for (const p of problems) console.error(`  ${p}`);
console.error(
  '\nKey the default on the other members instead — :host(:not([prop="b"]):not([prop="c"]))\n' +
    '— so an absent attribute, the default and an unrecognised value all reach it.\n' +
    'Keep the default\'s own :host([prop="a"]) selector: prism infers the prop union from it.',
);
process.exit(1);
