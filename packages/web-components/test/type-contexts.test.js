/**
 * The type contexts V4-PLAN 4.5 added, tested the way the role slots already
 * are: assign the token, and check it reaches the components that wear it.
 *
 * scripts/checks/type-roles.js proves no component writes a literal. That is a
 * source assertion and it cannot tell whether the token a component now reads
 * actually resolves — a name that nothing declares passes a text scan and
 * renders at its fallback forever, which is precisely the bug the check's
 * second rule found in arc-command-palette. These are the runtime half: the
 * knob exists, it moves, and it moves the right components together.
 *
 * The pairs matter more than the singles. Two components wearing one treatment
 * and disagreeing about its value is the whole reason the contexts exist, and
 * the two tables below are the case that made it obvious.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, useBaseCss } from './helpers.js';

import '../src/data/data-grid.register.js';
import '../src/data/badge.register.js';
import '../src/typography/markdown.register.js';
import '../src/data/clock.register.js';
import '../src/data/countdown-timer.register.js';
import '../src/typography/kbd.register.js';
import '../src/input/input.register.js';
import '../src/input/textarea.register.js';
import '../src/feedback/alert.register.js';

/** The grid needs columns before it renders a header row at all. */
const GRID = `<arc-data-grid columns='[{"key":"name","label":"Name"}]' rows='[{"name":"a"}]'></arc-data-grid>`;

const overrides = [];
function setToken(name, value) {
  document.documentElement.style.setProperty(name, value);
  overrides.push(name);
}

afterEach(() => {
  for (const name of overrides) document.documentElement.style.removeProperty(name);
  overrides.length = 0;
  cleanup();
});

// The contexts are declared at :root, so the real cascade needs base.css.
useBaseCss();

/** Mount, settle, and return the computed style of a node in the shadow root. */
async function styleOf(html, selector) {
  const el = mount(html);
  await el.updateComplete;
  const node = el.shadowRoot.querySelector(selector);
  expect(node, `expected ${selector} inside ${el.localName}`).to.exist;
  return getComputedStyle(node);
}

describe('--label-*: one uppercase tracked label', () => {
  it('moves the header tracking from the token, not a literal', async () => {
    // The incident this section records: arc-table said 2px and arc-data-grid
    // said 1px for the same element, both written from memory. arc-table is
    // gone (removed with the merges), so the assertion left is the one that
    // catches the regression pattern itself: writing `letter-spacing: 2px`
    // back into the grid as a literal fails here, because overriding the token
    // is what tells a shared value from a matching literal.
    setToken('--label-spacing', '7px');
    const grid = await styleOf(GRID, 'th');
    expect(grid.letterSpacing).to.equal('7px');
  });

  it('carries --section-title-* with it, because that name shipped first', async () => {
    // --section-title-spacing is public and points at --label-spacing now. A
    // consumer who overrode the old name must still reach the same text, and a
    // consumer who overrides the new one must move the old name's readers too.
    const probe = document.createElement('div');
    document.body.append(probe);
    setToken('--label-spacing', '9px');
    probe.style.letterSpacing = 'var(--section-title-spacing)';
    expect(getComputedStyle(probe).letterSpacing).to.equal('9px');
  });
});

describe('--ui-lh: running text inside a control', () => {
  it('reaches components that had written 1.4 and 1.5 separately', async () => {
    setToken('--ui-lh', '3');
    const badge = await styleOf('<arc-badge>New</arc-badge>', '.badge');
    const cell = await styleOf(GRID, 'td');
    // line-height resolves to px, and the two have different font sizes, so
    // the assertion is that each is three times its own — which is what a
    // unitless leading means, and what a per-component literal could not be.
    for (const style of [badge, cell]) {
      const size = parseFloat(style.fontSize);
      expect(parseFloat(style.lineHeight)).to.be.closeTo(size * 3, 0.5);
    }
  });

  it('leaves prose alone', async () => {
    // Anti-vacuity: --ui-lh must not be the leading of everything, or it is
    // just --line-height with extra steps and the distinction it names is gone.
    setToken('--ui-lh', '3');
    const alert = await styleOf('<arc-alert heading="x">Body copy here.</arc-alert>', '.alert__content');
    const size = parseFloat(alert.fontSize);
    expect(parseFloat(alert.lineHeight)).to.be.lessThan(size * 3);
  });
});

describe('--glyph-lh: a box holding one mark', () => {
  it('is the leading a kbd cap reads', async () => {
    setToken('--glyph-lh', '4');
    const kbd = await styleOf('<arc-kbd>K</arc-kbd>', '.kbd, kbd');
    const size = parseFloat(kbd.fontSize);
    expect(parseFloat(kbd.lineHeight)).to.be.closeTo(size * 4, 0.5);
  });

  it('defaults to adding no leading at all', async () => {
    // The value is the point: a glyph box taller than its glyph stops centring,
    // which is how a badge with a number in it goes lopsided.
    const kbd = await styleOf('<arc-kbd>K</arc-kbd>', '.kbd, kbd');
    expect(parseFloat(kbd.lineHeight)).to.be.closeTo(parseFloat(kbd.fontSize), 0.5);
  });
});

describe('--numeral-*: the large figure', () => {
  it('sizes arc-clock and arc-countdown-timer together', async () => {
    // The two had arrived at clamp(24px, 3vw, 36px) independently — the same
    // clamp, character for character, in two files with nothing between them.
    setToken('--numeral-size', '61px');
    const clock = await styleOf('<arc-clock></arc-clock>', '.time');
    const timer = await styleOf('<arc-countdown-timer to="2030-01-01"></arc-countdown-timer>', '.number');
    expect(clock.fontSize).to.equal('61px');
    expect(timer.fontSize).to.equal('61px');
  });

  it('weighs them together too', async () => {
    setToken('--numeral-weight', '800');
    const clock = await styleOf('<arc-clock></arc-clock>', '.time');
    expect(clock.fontWeight).to.equal('800');
  });
});

describe('field labels are one size', () => {
  it('an input and a textarea label the same way', async () => {
    // arc-textarea's label was 12px at 2px tracking while arc-input,
    // arc-select, arc-password-input, arc-masked-input and arc-tree-select
    // were all 10px at 0.75px. Both elements land in the same form constantly.
    const input = await styleOf('<arc-input label="Name"></arc-input>', '.input-group__label');
    const textarea = await styleOf('<arc-textarea label="Bio"></arc-textarea>', 'label');
    expect(textarea.fontSize).to.equal(input.fontSize);
    expect(textarea.letterSpacing).to.equal(input.letterSpacing);
  });

  it('moves both from --label-inline-size', async () => {
    setToken('--label-inline-size', '13px');
    const input = await styleOf('<arc-input label="Name"></arc-input>', '.input-group__label');
    const textarea = await styleOf('<arc-textarea label="Bio"></arc-textarea>', 'label');
    expect(input.fontSize).to.equal('13px');
    expect(textarea.fontSize).to.equal('13px');
  });
});

describe('the role weights reach the components that had spelled them', () => {
  it('600 written out 39 times now follows --font-label-weight', async () => {
    setToken('--font-label-weight', '250');
    const th = await styleOf(GRID, 'th');
    const alert = await styleOf('<arc-alert heading="Careful">x</arc-alert>', '.alert__heading');
    expect(th.fontWeight).to.equal('250');
    expect(alert.fontWeight, 'arc-alert had font-weight: 600 in its own stylesheet').to.equal('250');
  });

  it('500 follows the body role', async () => {
    setToken('--font-body-weight', '250');
    const badge = await styleOf('<arc-badge>New</arc-badge>', '.badge');
    const h5 = await styleOf('<arc-markdown content="##### Five"></arc-markdown>', '.markdown h5');
    expect(badge.fontWeight).to.equal('250');
    expect(h5.fontWeight).to.equal('250');
  });
});
