import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick, useBaseCss } from './helpers.js';
import { positionStyles } from '../src/shared/position-styles.js';

import '../src/content/icon.register.js';
import '../src/content/scroll-area.register.js';
import '../src/feedback/dialog.register.js';
import '../src/feedback/progress.register.js';
import '../src/feedback/sheet.register.js';
import '../src/feedback/tooltip.register.js';
import '../src/feedback/popover.register.js';
import '../src/feedback/hover-card.register.js';
import '../src/input/textarea.register.js';
import '../src/input/button-group.register.js';
import '../src/layout/inset.register.js';
import '../src/layout/float-bar.register.js';
import '../src/navigation/drawer.register.js';
import '../src/navigation/scroll-to-top.register.js';
import '../src/typography/prose.register.js';

/**
 * enum-fallback.test.js covers the four components whose widened default
 * selectors were written by hand. The other fourteen were rewritten by codemod
 * and shipped in 2.11.0 on the strength of a summary line, which is the same
 * "mechanical change, narrow verification" that put a broken wrapper on npm in
 * the same release. This sweeps them.
 *
 * The shape of the assertion is deliberately weak-but-honest: for each component
 * an unrecognised enum value must compute the same as the default, and must not
 * compute as the *other* members. It does not assert what the styling should be,
 * only that an unknown value cannot fall through to nothing.
 */

const overrides = [];
afterEach(() => {
  for (const el of overrides) el.remove();
  overrides.length = 0;
  cleanup();
});

// base.css carries the colour and gradient tokens; without it many properties
// compute to the same empty value for every variant and a real gap would pass.
useBaseCss();

/**
 * Each case: the component, the enum attribute, its default, one other member,
 * the inner node to measure, and the properties that the enum drives.
 */
const CASES = [
  { tag: 'arc-icon', attr: 'size', def: 'sm', other: 'xl', sel: null, props: ['width', 'height'] },
  { tag: 'arc-scroll-area', attr: 'orientation', def: 'vertical', other: 'horizontal', sel: '.scroll-area', props: ['overflowX', 'overflowY'] },
  { tag: 'arc-progress', attr: 'size', def: 'md', other: 'lg', sel: '.progress__track', props: ['height'] },
  { tag: 'arc-textarea', attr: 'resize', def: 'vertical', other: 'none', sel: 'textarea', props: ['resize'] },
  { tag: 'arc-inset', attr: 'space', def: 'md', other: 'xl', sel: null, props: ['paddingTop', 'paddingLeft'] },
  { tag: 'arc-prose', attr: 'size', def: 'md', other: 'lg', sel: null, props: ['fontSize'] },
  { tag: 'arc-drawer', attr: 'position', def: 'left', other: 'right', sel: '.drawer__panel', props: ['left', 'right'] },
  { tag: 'arc-sheet', attr: 'side', def: 'bottom', other: 'right', sel: '.sheet__panel', props: ['bottom', 'right', 'width'] },
  { tag: 'arc-tooltip', attr: 'position', def: 'top', other: 'left', sel: '.tooltip__popup', props: ['bottom', 'right', 'transform'] },
  { tag: 'arc-scroll-to-top', attr: 'position', def: 'bottom-right', other: 'bottom-left', sel: '.scroll-to-top', props: ['left', 'right'] },
  { tag: 'arc-dialog', attr: 'size', def: 'md', other: 'lg', sel: '.dialog__panel', props: ['maxWidth'] },
  { tag: 'arc-float-bar', attr: 'position', def: 'bottom', other: 'top', sel: '.float-bar', props: ['top', 'bottom'] },
  { tag: 'arc-button-group', attr: 'orientation', def: 'horizontal', other: 'vertical', sel: '.button-group, .btn-group', props: ['flexDirection'] },
  { tag: 'arc-anchor-nav', attr: 'orientation', def: 'horizontal', other: 'vertical', sel: null, props: [] },
];

/** Mount `<tag attr=value>` with enough content to lay out, and return styles. */
async function stylesFor({ tag, attr, sel }, value) {
  const html = value === undefined
    ? `<${tag} open>content</${tag}>`
    : `<${tag} ${attr}="${value}" open>content</${tag}>`;
  const el = mount(html);
  overrides.push(el);
  if (el.updateComplete) await el.updateComplete;
  await tick();
  const node = sel ? el.shadowRoot?.querySelector(sel) : el;
  return node ? getComputedStyle(node) : null;
}

describe('codemod-widened enum defaults: an unknown value lands on the default', () => {
  for (const c of CASES.filter((x) => x.props.length && x.tag !== 'arc-anchor-nav')) {
    it(`${c.tag}[${c.attr}]`, async () => {
      const def = await stylesFor(c, undefined);
      const explicit = await stylesFor(c, c.def);
      const unknown = await stylesFor(c, 'definitely-not-a-member');
      const other = await stylesFor(c, c.other);

      if (!def || !explicit || !unknown) {
        throw new Error(`could not resolve a node for ${c.tag} — fix the selector in this test`);
      }

      for (const p of c.props) {
        expect(unknown[p], `${c.tag} ${c.attr}="unknown" should match no-attribute for ${p}`)
          .to.equal(def[p]);
        expect(unknown[p], `${c.tag} ${c.attr}="unknown" should match ${c.attr}="${c.def}" for ${p}`)
          .to.equal(explicit[p]);
      }

      // At least one measured property must differ from the non-default member,
      // otherwise the assertions above are vacuous — they'd pass even if the
      // attribute drove nothing we're looking at.
      if (other) {
        const differs = c.props.some((p) => other[p] !== def[p]);
        expect(differs, `${c.tag}: ${c.attr}="${c.other}" computed identically to the default for ${c.props.join(', ')} — this test is not measuring the right property`).to.be.true;
      }
    });
  }
});

describe('shared positionStyles: the open rule outranks the closed rule', () => {
  // Tested against the stylesheet directly rather than through arc-popover or
  // arc-hover-card. Both animate `transform`, so reading it right after opening
  // returns an interpolated value, and hover-card's open state is a class its own
  // re-render reinstates — measuring through them tests their timing, not the
  // selectors. What regressed here is specificity, which is exactly measurable.
  //
  // The invariant: the open rule must outrank the closed rule for every value the
  // closed rule matches. Widening only the closed rule to
  // :not(left):not(right):not(top) would take it to (0,5,0) while an explicit
  // :host([open][position="bottom"]) open branch stayed at (0,4,0), inverting the
  // two for exactly the values the widening added — the panel would hold its
  // closed transform while open. That did not ship, but nothing was stopping it:
  // these cases are what makes the constraint checkable.

  /** Build a host with positionStyles adopted, at a given position attribute. */
  function probe(position, open) {
    const host = document.createElement('div');
    host.className = 'ps-probe';
    if (position) host.setAttribute('position', position);
    if (open) host.setAttribute('open', '');
    const root = host.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    // :host rules only apply inside a shadow root, so adopt rather than inline.
    // Transitions off: this is a specificity assertion, not an animation one.
    sheet.replaceSync(`.panel { transition: none !important; }\n${positionStyles('panel', { scale: 0.95 }).cssText}`);
    root.adoptedStyleSheets = [sheet];
    const panel = document.createElement('div');
    panel.className = 'panel';
    root.append(panel);
    document.body.append(host);
    overrides.push(host);
    return getComputedStyle(panel).transform;
  }

  const cases = [
    ['no position attribute', undefined],
    ['position="bottom"', 'bottom'],
    ['an unrecognised position', 'sideways'],
    ['position="top"', 'top'],
    ['position="left"', 'left'],
    ['position="right"', 'right'],
  ];

  for (const [label, position] of cases) {
    it(`${label}: open resolves to a different transform than closed`, () => {
      const closed = probe(position, false);
      const opened = probe(position, true);
      expect(closed, `${label} closed should carry the scaled-down form`).to.contain('0.95');
      expect(opened, `${label}: the [open] rule must outrank the closed rule`).to.not.equal(closed);
    });
  }

  it('an unrecognised position resolves identically to bottom and to no attribute', () => {
    expect(probe('sideways', true)).to.equal(probe('bottom', true));
    expect(probe('sideways', true)).to.equal(probe(undefined, true));
    expect(probe('sideways', false)).to.equal(probe('bottom', false));
  });
});
