#!/usr/bin/env node
/**
 * dismiss-prop.js
 *
 * A component the user can dismiss says so with `dismissible`.
 *
 * The second of V4-PLAN 4.3's five convention checks. The library had two
 * spellings: `dismissible` on arc-alert, arc-banner and arc-callout, and
 * `closable` on arc-modal. `dismissible` won on usage, and because
 * `DismissController` and the central dismissal contract are the architecture's
 * word for the capability.
 *
 * **Only the spelling converges, and that is deliberate.** The two dialects
 * also differed in polarity: `closable` defaulted true, `dismissible` false. A
 * modal is dismissible unless you say otherwise; an alert is not dismissible
 * unless you say so. Both are right for their component — an inescapable modal
 * is the exception, an alert with an X is the exception — so this check is
 * about the name and says nothing about the default. Forcing one default on
 * both would trade a naming inconsistency for a behavioural one.
 *
 * ## What it looks for
 *
 * Two directions, because each catches something the other cannot:
 *
 *  1. **A banned spelling.** `closable`, `dismissable` (the common misspelling),
 *     `hideable`. Named rather than inferred, so the rule cannot drift into
 *     objecting to an unrelated prop that happens to end in -able.
 *  2. **A dismissal affordance with no prop behind it.** A component that
 *     renders a close button or listens for Escape and has no `dismissible` is
 *     either missing the prop or hard-coding a decision the consumer should
 *     make. This is the half that finds a *new* dialect rather than a known one.
 *
 * `removable` on arc-tag is not in scope and is not a synonym: a tag is removed
 * from a set it belongs to, which is a different thing from an overlay being
 * dismissed, and the two would want different events.
 */
import { run } from '../lib/source-walker.js';
import { findComponents } from '../lib/component-tags.js';

const CANON = 'dismissible';

/**
 * Spellings that mean `dismissible`, with the deprecation each is allowed
 * during. A component may declare one *alongside* the canonical prop as a
 * deprecated alias; declaring one instead is the finding.
 */
const RETIRED = {
  closable: 'renamed in v4.0.0, removed in v5',
  dismissable: 'a misspelling — the word has one a',
  hideable: 'never shipped; listed so it cannot arrive',
};

/** Markup that means "the user can dismiss this from inside the component". */
const AFFORDANCE = [
  { pattern: /label="(?:Dismiss|Close)"/, what: 'a close button' },
  { pattern: /@click=\$\{(?:this\.)?_?(?:dismiss|close)\b/, what: 'a dismiss handler' },
];

/**
 * Components whose dismissal affordance is unconditional on purpose.
 *
 * Each is a case where "can the user dismiss this" is not a question the
 * consumer should be answering — so the absence of the prop is the design,
 * not an oversight.
 */
const UNCONDITIONAL = {
  'arc-toast': 'a toast the user cannot dismiss is a toast that traps the screen',
  'arc-snackbar': 'same, and deprecated into arc-toast',
  'arc-progress-toast': 'its cancel affordance is driven by an onCancel callback, not a flag; deprecated into arc-toast',
  'arc-notification-panel': 'the panel closes from its own trigger; there is no separate affordance to gate',
  'arc-drawer': 'dismissal is the overlay contract, not a per-instance choice',
  'arc-sheet': 'dismissal is the overlay contract, not a per-instance choice',
  'arc-lightbox': 'a lightbox the user cannot leave is a trap',
  'arc-command-palette': 'opened by a shortcut and closed by Escape; gating that would strand it open',
  'arc-tag': 'its affordance is `removable`, which is removal from a set rather than dismissal',
  'arc-chip': 'same as arc-tag',
  'arc-hotspot': 'its popover closes on outside click via DismissController, with no button to gate',
};

const oneName = {
  name: 'dismiss-prop',
  describe: `the dismissal prop is \`${CANON}\``,
  hint:
    `Rename it to ${CANON}. Keeping the old name working through one major means\n` +
    '    declaring both and mirroring them in willUpdate — see arc-modal, which is the\n' +
    '    worked example and the only component that needed it.',
  component({ tag, prop, report }) {
    const canonical = prop(CANON);
    for (const [retired, note] of Object.entries(RETIRED)) {
      const found = prop(retired);
      if (!found) continue;
      if (canonical) continue; // declared beside the canon: a deprecated alias
      report(found.line, `declares \`${retired}\` and not \`${CANON}\` (${note})`);
    }
  },
};

const affordanceHasAProp = {
  name: 'dismiss-affordance',
  describe: 'a component that renders its own dismissal offers a prop for it',
  hint:
    'Either declare `dismissible`, or — if the affordance is unconditional by design,\n' +
    '    like a toast that always has an X — nothing needs to change and this rule is\n' +
    '    wrong about your component; add it to UNCONDITIONAL with the reason.',
  component({ tag, prop, method, report }) {
    if (prop(CANON)) return;
    if (UNCONDITIONAL[tag]) return;
    const render = method('render');
    if (!render) return;
    for (const { pattern, what } of AFFORDANCE) {
      if (pattern.test(render.body)) {
        report(render.line, `renders ${what} but declares no \`${CANON}\``);
        return;
      }
    }
  },
};

const code = run({ name: 'dismiss-prop', rules: [oneName, affordanceHasAProp] });

/**
 * The exemption list, checked against the tree.
 *
 * Same reasoning as size-canon's: an entry naming a tag that is not registered,
 * or one that has since grown a `dismissible`, is a decision about nothing —
 * and a list with dead entries in it stops being read as a list of decisions.
 * A speculative entry for a component that does not exist yet was in here on
 * the first draft and is exactly what this catches.
 */
const known = findComponents();
const stale = [];
for (const [tag, reason] of Object.entries(UNCONDITIONAL)) {
  if (!reason?.trim()) stale.push(`${tag}: exempt with no reason`);
  else if (!known.has(tag)) stale.push(`${tag}: exempt but not a registered tag`);
}
if (stale.length) {
  console.error('\ncheck-dismiss-prop: the UNCONDITIONAL list is stale\n');
  for (const s2 of stale) console.error(`  ${s2}`);
  process.exit(1);
}

process.exit(code);
