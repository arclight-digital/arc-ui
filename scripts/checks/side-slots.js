#!/usr/bin/env node
/**
 * side-slots.js
 *
 * A slot at the inline-start or inline-end edge of a component is `prefix` or
 * `suffix`.
 *
 * The last of V4-PLAN 4.3's five convention checks, and the one whose row had
 * to be corrected before it could be executed. The plan proposed aliasing three
 * pairs onto `prefix`/`suffix` — `start`/`end`, `before`/`after`,
 * `above`/`below` — and **two of the three are not side slots at all**:
 *
 *  - `arc-image-compare`'s `before` and `after` are the two images being
 *    compared. They are a *sequence in time*, not positions on an axis, and one
 *    is layered over the other rather than beside it. Renaming them to
 *    prefix/suffix would describe the wrong thing in the wrong dimension.
 *  - `arc-page-header`'s `above` and `below` are the block axis — a breadcrumb
 *    over the heading, a tab strip under it. `prefix`/`suffix` are the inline
 *    axis. Collapsing the two would leave a component unable to say which of
 *    the two axes it meant.
 *
 * So the convergence is one pair over two components: `arc-toolbar` and
 * `arc-status-bar` moved from `start`/`end`. The aliases they briefly carried
 * were removed in the pre-release housecleaning — v4 never shipped, so they
 * had no consumers to serve. Five components already used `prefix`/`suffix`,
 * which is also what the rest of the ecosystem calls the leading slot on a
 * control.
 *
 * ## What this rule actually guards
 *
 * Not a rename — that has happened. What it prevents is the *next* component
 * inventing a sixth spelling. Which is how the library got here: no component
 * chose `start` in preference to `prefix`; each one was written without
 * knowing the other existed.
 */
import { run } from '../lib/source-walker.js';
import { findComponents } from '../lib/component-tags.js';

/** Spellings that mean prefix/suffix, with what each is allowed to be. */
const RETIRED = {
  start: 'prefix',
  end: 'suffix',
  leading: 'prefix',
  trailing: 'suffix',
  left: 'prefix',
  right: 'suffix',
};

/**
 * Components allowed to declare a retired spelling, because they carry it as a
 * deprecated alias beside the canonical one.
 *
 * An entry is only valid while the canonical slot is *also* declared — which is
 * what makes it an alias rather than a holdout, and is checked below rather
 * than trusted.
 *
 * Empty since the pre-release housecleaning removed arc-toolbar's and
 * arc-status-bar's start/end aliases along with everything else deprecated.
 * The mechanism stays for the next rename that does ship an alias period.
 */
const ALIASES = {};

/**
 * Slot names that look like an axis and are not one.
 *
 * Documented here rather than left out, because "why doesn't the rule fire on
 * arc-image-compare" is the first question anyone reading it will have, and the
 * answer is a design decision rather than an oversight.
 */
const NOT_AN_AXIS = {
  'arc-image-compare': 'before/after are the two images being compared — a sequence, not a side',
  'arc-page-header': 'above/below are the block axis; prefix/suffix are the inline one',
};

const canonicalNames = {
  name: 'side-slots',
  describe: 'a side slot is `prefix` or `suffix`',
  hint:
    'Rename the slot to prefix/suffix. If the old name must keep working through a\n' +
    '    major, render both slots into the same region, document the old one as\n' +
    '    deprecated, and add the tag to ALIASES with the reason.',
  component({ tag, docTag, report }) {
    if (NOT_AN_AXIS[tag]) return;
    const slots = docTag('slot');
    const declared = new Set(slots.map((s) => s.text.split(/[\s-]/)[0]));

    for (const slot of slots) {
      const name = slot.text.split(/[\s-]/)[0];
      const canonical = RETIRED[name];
      if (!canonical) continue;
      if (ALIASES[tag] && declared.has(canonical)) continue; // a real alias
      report(
        slot.line,
        ALIASES[tag]
          ? `declares \`${name}\` as an alias but not \`${canonical}\` beside it, so it is a ` +
            'holdout rather than an alias.'
          : `declares a \`${name}\` slot. The name for that side is \`${canonical}\`.`,
      );
    }
  },
};

const code = run({ name: 'side-slots', rules: [canonicalNames] });

/** Both lists, checked against the tree — see size-canon.js. */
const known = findComponents();
const stale = [];
for (const [label, list] of [
  ['ALIASES', ALIASES],
  ['NOT_AN_AXIS', NOT_AN_AXIS],
]) {
  for (const [tag, reason] of Object.entries(list)) {
    if (!reason?.trim()) stale.push(`${label}: ${tag} has no reason`);
    else if (!known.has(tag)) stale.push(`${label}: ${tag} is not a registered tag`);
  }
}
if (stale.length) {
  console.error('\ncheck-side-slots: the exception lists are stale\n');
  for (const s of stale) console.error(`  ${s}`);
  process.exit(1);
}

process.exit(code);
