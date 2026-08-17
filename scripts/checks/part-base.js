#!/usr/bin/env node
/**
 * part-base.js
 *
 * Every component names its root element `base`, alongside whatever else that
 * element is called.
 *
 * The fourth of V4-PLAN 4.3's five convention checks. The library had **86
 * distinct spellings** for the outermost element across 202 components —
 * `container`, `wrapper`, `bar`, `shell`, `inner`, `body`, and eighty more —
 * and a consumer wanting to reach the outer box of an arbitrary component had
 * to look each one up. `base` is the name that does not need looking up.
 *
 * It is added *beside* the existing name rather than replacing it
 * (`part="base container"`), so no `::part()` selector anybody has written
 * stops matching. That is the entire reason this is a dual token: the cheap
 * version of this change for us would have been a rename, and the cheap version
 * for consumers is this one.
 *
 * ## What `base` means, exactly
 *
 * **The element that is the component's own box in its shadow root.** Three
 * things fall out of that, and each of them was a surprise the plan did not
 * budget for:
 *
 *  1. **A component can have more than one root.** `arc-text` renders `h1`
 *     through `h6`, `span` or `p` depending on `variant`; `arc-button` renders
 *     `<a>` or `<button>` depending on `href`; `arc-qr-code` renders a card
 *     wrapper or a bare svg depending on `contrast`. Fourteen components change
 *     their root *element* with a prop — which is the strongest argument for a
 *     name that does not, and the reason this rule counts roots rather than
 *     assuming one.
 *  2. **The first element is not always the box.** `arc-sheet` and `arc-drawer`
 *     render the scrim first and the panel second, as siblings. `base` is on
 *     the panel: a consumer reaching for "the component" means the dialog, not
 *     the thing dimming the page behind it.
 *  3. **Some components have no box at all** — see EXEMPT.
 */
import { run, baseComponentSource } from '../lib/source-walker.js';
import { findComponents } from '../lib/component-tags.js';

/**
 * Components with no root element to name, and why.
 *
 * Not suppressions. Each is a component where `::part(base)` would have nothing
 * useful to select, and inventing an element so the convention could apply
 * would add a box to the page to satisfy a naming rule.
 */
const EXEMPT = {
  // A bare <slot> as the entire shadow root. The host is the box — style the
  // element itself — and a slot has no box for ::part() to reach.
  'arc-accordion-item': 'shadow root is a bare slot; the host is the box',
  'arc-stack': 'shadow root is a bare slot; the host is the box',
  'arc-step': 'shadow root is a bare slot; the host is the box',
  'arc-timeline-item': 'shadow root is a bare slot; the host is the box',
  'arc-command-group': 'shadow root is a bare slot; the host is the box',
  'arc-command-item': 'shadow root is a bare slot; the host is the box',
  'arc-radio': 'shadow root is a bare slot; the host is the box',
  'arc-suggestion': 'shadow root is a bare slot; the host is the box',
  'arc-center': 'shadow root is a bare slot; the host is the box',
  'arc-inset': 'shadow root is a bare slot; the host is the box',
  'arc-breadcrumb-item': 'shadow root is a bare slot; the host is the box',
  'arc-nav-item': 'shadow root is a bare slot; the host is the box',
  'arc-sidebar-link': 'shadow root is a bare slot; the host is the box',
  'arc-sidebar-section': 'shadow root is a bare slot; the host is the box',
  'arc-spy-link': 'shadow root is a bare slot; the host is the box',
  'arc-tab': 'shadow root is a bare slot; the host is the box',
  'arc-tree-item': 'shadow root is a bare slot; the host is the box',
  'arc-menu-item': 'shadow root is a bare slot; the host is the box',
  'arc-option': 'shadow root is a bare slot; the host is the box',

  // Peer boxes with the host as their only container. Naming either half `base`
  // would point ::part(base) at something no reader would predict — the icon of
  // an inline message, the key of a key/value pair.

  // Renders nothing: configuration and registry elements that exist to be read
  // by a parent, not to draw.
  'arc-icon-library': 'renders nothing — it registers icons for arc-icon',
  'arc-comparison-column': 'renders nothing — it configures its arc-comparison parent',
  'arc-hotkey': 'renders nothing — it binds a shortcut',
  'arc-menu-divider': 'renders nothing — the parent menu draws the rule',
};

const declaresBase = {
  name: 'part-base',
  describe: 'every component documents a `base` part',
  hint:
    'Add `base` to the root element\'s part list — `part="base container"`, keeping the\n' +
    '    existing name — and declare `@csspart base - The root element.` A component\n' +
    '    whose shadow root has no box of its own goes in EXEMPT with the reason.',
  component({ tag, docTag, report, docblock, source }) {
    if (EXEMPT[tag]) return;
    const documented = docTag('csspart').some((t) => /^base\b/.test(t.text));
    if (documented) return;
    report(
      docblock ? lineOf(source, docblock) : 1,
      'does not document a `base` part. Without it a consumer has to look up this ' +
        "component's own name for its outer box.",
    );
  },
};

const rendersBase = {
  name: 'part-base-rendered',
  describe: 'the documented `base` part is on an element that renders',
  hint:
    'The docblock declares it; the template has to carry it. Check every root branch —\n' +
    '    fourteen components render a different root element depending on a prop, and\n' +
    '    each branch needs the token.',
  component({ tag, code, source, docTag, report }) {
    if (EXEMPT[tag]) return;
    if (!docTag('csspart').some((t) => /^base\b/.test(t.text))) return; // the rule above owns this
    if (/part="[^"]*\bbase\b[^"]*"/.test(code)) return;
    // A component defined as an empty subclass renders its base's template.
    // `arc-modal` is the first — V4-SCOPE §2.4's rename alias — and it
    // documents every part the element has while implementing none of them,
    // which is the point of an alias with no body.
    const base = baseComponentSource(source);
    if (base && /part="[^"]*\bbase\b[^"]*"/.test(base)) return;
    report(1, 'documents a `base` part that no element in the template carries.');
  },
};

/**
 * Every root branch carries the token, not just the first.
 *
 * `arc-text` renders eight different root elements and shares one part name
 * across them; the codemod that introduced `base` hit one branch in thirteen
 * components and the other branches were found by mounting them, not by
 * reading them. A part name spelled both with and without `base` in the same
 * file is that mistake, and it is cheap to spot.
 */
const everyBranch = {
  name: 'part-base-branches',
  describe: 'a root part name carries `base` in every branch that renders it',
  hint:
    'One branch of this component names the root `base X` and another names it `X`.\n' +
    '    A consumer\'s ::part(base) would work in one configuration and not the other,\n' +
    '    which is worse than not having the token at all.',
  component({ code, report, source }) {
    const based = new Set([...code.matchAll(/part="base ([^"]+)"/g)].map((m) => m[1].trim()));
    for (const m of code.matchAll(/part="(?!base\b)([^"]+)"/g)) {
      const name = m[1].trim();
      if (!based.has(name)) continue;
      report(
        source.slice(0, m.index).split('\n').length,
        `\`${name}\` is spelled \`base ${name}\` elsewhere in this component but not here.`,
      );
    }
  },
};

/** 1-based line of a substring. */
function lineOf(source, needle) {
  const at = source.indexOf(needle);
  return at === -1 ? 1 : source.slice(0, at).split('\n').length;
}

const code = run({ name: 'part-base', rules: [declaresBase, rendersBase, everyBranch] });

/** The exemption list, checked against the tree — see size-canon.js. */
const known = findComponents();
const stale = [];
for (const [tag, reason] of Object.entries(EXEMPT)) {
  if (!reason?.trim()) stale.push(`${tag}: exempt with no reason`);
  else if (!known.has(tag)) stale.push(`${tag}: exempt but not a registered tag`);
}
if (stale.length) {
  console.error('\ncheck-part-base: the EXEMPT list is stale\n');
  for (const s of stale) console.error(`  ${s}`);
  process.exit(1);
}

process.exit(code);
