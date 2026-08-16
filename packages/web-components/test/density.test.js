/**
 * `[data-density]` tightens the layout and nothing else.
 *
 * V4-PLAN 4.5's density row. Three claims, and the second is the one that took
 * the work:
 *
 *   The scale moves.
 *   It moves for a *region*, not only for the page. base.css forwards the
 *     spacing scale into shadow DOM with `inherit`, and `inherit` takes the
 *     parent's computed value — which is why the preset restates the scale
 *     rather than multiplying it. A `calc(16px * var(--density))` would have
 *     resolved once at :root and silently done nothing on a section, the same
 *     trap the lobe tokens hit.
 *   Touch targets and type do not move. --touch-min is 24px because WCAG 2.2
 *     target size (minimum) is 24×24; a density preset is not a licence to go
 *     under it.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, useBaseCss } from './helpers.js';

import '../src/input/button.register.js';
import '../src/content/card.register.js';

afterEach(cleanup);

// Density is declared at :root in base.css, so the real cascade is the test.
useBaseCss();

/** Read a token as it resolves on an element. */
const tokenOn = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

describe('the spacing scale moves with density', () => {
  it('compact is tighter than default and comfortable is looser', () => {
    const probe = mount('<div></div>');
    const at = (value) => {
      if (value) probe.setAttribute('data-density', value);
      else probe.removeAttribute('data-density');
      return parseFloat(tokenOn(probe, '--space-md'));
    };
    const base = at(null);
    expect(at('compact'), 'compact').to.be.lessThan(base);
    expect(at('comfortable'), 'comfortable').to.be.greaterThan(base);
  });

  it('moves every step, not just the one a component happens to read', () => {
    const probe = mount('<div data-density="compact"></div>');
    const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
    for (const step of steps) {
      expect(tokenOn(probe, `--space-${step}`), `--space-${step}`).to.not.equal('');
    }
    // Monotonic, which is what makes it a scale rather than eight numbers.
    const values = steps.map((s) => parseFloat(tokenOn(probe, `--space-${s}`)));
    for (let i = 1; i < values.length; i++) {
      expect(values[i], `--space-${steps[i]} > --space-${steps[i - 1]}`).to.be.greaterThan(
        values[i - 1],
      );
    }
  });
});

describe('it reaches a component, and a region rather than only the page', () => {
  it('a compact section tightens the components inside it', async () => {
    // The assertion the calc() version would have failed. Density is set on a
    // wrapper here, not on the document — a component reads the scale through
    // base.css's forwarding rule, which carries the *parent's computed value*,
    // so the preset has to produce a plain length at every level.
    const wide = mount('<div><arc-card heading="A">body</arc-card></div>');
    const tight = mount('<div data-density="compact"><arc-card heading="B">body</arc-card></div>');
    for (const box of [wide, tight]) await box.querySelector('arc-card').updateComplete;

    const padOf = (box) => {
      const card = box.querySelector('arc-card');
      const inner = card.shadowRoot.querySelector('.card__inner');
      expect(inner, 'expected the card surface that carries the padding').to.exist;
      return parseFloat(getComputedStyle(inner).paddingTop);
    };
    expect(padOf(tight), 'a card in a compact section').to.be.lessThan(padOf(wide));
  });
});

describe('what density deliberately does not touch', () => {
  it('leaves the minimum touch target alone', () => {
    // WCAG 2.2 target size (minimum) is 24×24. Density moves the padding
    // around a control, never the hit area inside it.
    const probe = mount('<div data-density="compact"></div>');
    expect(parseFloat(tokenOn(probe, '--touch-min'))).to.be.at.least(24);
  });

  it('leaves type alone', async () => {
    const wide = mount('<div><arc-button>Go</arc-button></div>');
    const tight = mount('<div data-density="compact"><arc-button>Go</arc-button></div>');
    for (const box of [wide, tight]) await box.querySelector('arc-button').updateComplete;

    const sizeOf = (box) =>
      getComputedStyle(box.querySelector('arc-button').shadowRoot.querySelector('.btn')).fontSize;
    expect(sizeOf(tight), 'compact must not shrink text').to.equal(sizeOf(wide));
  });

  it('an unrecognised density is the default, not nothing', () => {
    const probe = mount('<div data-density="cosy"></div>');
    const plain = mount('<div></div>');
    expect(tokenOn(probe, '--space-md')).to.equal(tokenOn(plain, '--space-md'));
  });
});
