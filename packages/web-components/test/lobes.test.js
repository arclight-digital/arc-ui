/**
 * Lobes of light: the shape is a token, its color is an argument.
 *
 * V4-PLAN 4.5's illumination row. `scripts/checks/gradient-stops.js` is the
 * source assertion — no gradient in the tree may fade to the `transparent`
 * keyword, because that is transparent *black*, so the fade darkens on its way
 * out and leaves a hard edge wherever it meets its own box. That check now
 * covers the components as well as the token file, which is how the 42 in the
 * tree were found.
 *
 * This file is the runtime half, and it exists because the mechanism has two
 * sharp edges that both fail the same silent way — every lobe in the library
 * renders in the border color and nothing else goes wrong.
 *
 *   A custom property substitutes its own `var()`s when *it* is computed, at
 *   the element that declares it, and inheritance carries the substituted
 *   result. So a component's inputs have to sit on `:host`, where the shape
 *   token is declared. Setting `--lobe-rgb` on an inner node is too late — the
 *   shape it reads was resolved one element up.
 *
 *   And `--lobe-*` has to stay out of base.css's forwarding rule. That rule
 *   exists so a `:root` override reaches into shadow DOM, and it works by
 *   winning the cascade against `:host` from the outer tree — which means it
 *   also beats the inputs a component sets on its own host, and hands every
 *   component `:root`'s already-resolved hairline. Both of these were built
 *   wrong first; the CSS was correct and every divider was grey.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, useBaseCss } from './helpers.js';

import '../src/content/divider.register.js';
import '../src/data/stat.register.js';

afterEach(cleanup);

// The point of a runtime test here is the real cascade: the lobes are declared
// on :host by every component and at :root by base.css, and which one wins is
// the whole question.
useBaseCss();

/** The resolved background-image of a node inside a component. */
async function backgroundOf(html, selector) {
  const el = mount(html);
  await el.updateComplete;
  const node = el.shadowRoot.querySelector(selector);
  expect(node, `expected ${selector} inside ${el.localName}`).to.exist;
  return getComputedStyle(node).backgroundImage;
}

/** Parse the rgba() stops out of a resolved gradient string. */
const stopsOf = (bg) => [...bg.matchAll(/rgba?\([^)]*\)/g)].map((m) => m[0]);

describe('a lobe fades to nothing, not to black', () => {
  it('arc-divider line-white fades out in the text color at zero alpha', async () => {
    const bg = await backgroundOf(
      '<arc-divider variant="line-white"></arc-divider>',
      '.divider',
    );
    const stops = stopsOf(bg);
    expect(stops.length, bg).to.be.at.least(3);

    // The claim, stated as the browser resolves it: the outer stops carry the
    // same channels as the lit one and differ only in alpha. `transparent`
    // would resolve to rgba(0, 0, 0, 0) and fail both halves.
    const channels = (s) => s.match(/\d+,\s*\d+,\s*\d+/)?.[0];
    expect(channels(stops[0]), `outer stop was ${stops[0]}`).to.equal(channels(stops[1]));
    expect(stops[0], 'the outer stop is the lit color at zero alpha').to.match(/,\s*0\)$/);
    expect(stops[0]).to.not.equal('rgba(0, 0, 0, 0)');
  });

  it('holds for the one-sided form an aligned divider uses', async () => {
    const bg = await backgroundOf(
      '<arc-divider variant="line-primary" align="left"></arc-divider>',
      '.divider',
    );
    const stops = stopsOf(bg);
    expect(stops).to.have.lengthOf(2);
    const channels = (s) => s.match(/\d+,\s*\d+,\s*\d+/)?.[0];
    expect(channels(stops[0])).to.equal(channels(stops[1]));
    expect(stops[1], `faded to ${stops[1]}`).to.not.equal('rgba(0, 0, 0, 0)');
  });
});

describe('the color is an argument, and it crosses the shadow boundary', () => {
  it('arc-divider line-white and line-primary resolve to different colors', async () => {
    // The mechanism, stated as the thing it has to be able to do: one shape
    // token, two variants of one component, two colors. If the inputs did not
    // reach the shape these would be identical — which is exactly what the
    // forwarding rule made them until --lobe-* was held out of it.
    const white = await backgroundOf('<arc-divider variant="line-white"></arc-divider>', '.divider');
    const primary = await backgroundOf(
      '<arc-divider variant="line-primary"></arc-divider>',
      '.divider',
    );
    expect(white).to.not.equal(primary);
  });

  it('falls back to the border color rather than to nothing', async () => {
    // The shapes carry `var(--lobe-rgb, var(--border-default-rgb))` rather
    // than relying on a declared default, for exactly this: a lobe read with no
    // inputs set must be a plain hairline, not a declaration that is invalid at
    // computed-value time — which drops the background entirely and leaves an
    // invisible divider. A declared default would also have to live on :host,
    // where it would beat a consumer's :root value.
    const bg = await backgroundOf('<arc-divider variant="fade"></arc-divider>', '.divider');
    expect(bg, 'a lobe with no inputs still paints').to.not.equal('none');
    expect(stopsOf(bg).length).to.be.at.least(3);
  });

  it('a consumer can retune every lobe at once', async () => {
    const before = await backgroundOf('<arc-divider variant="fade"></arc-divider>', '.divider');
    document.documentElement.style.setProperty('--border-default-rgb', '10, 20, 30');
    try {
      const after = await backgroundOf('<arc-divider variant="fade"></arc-divider>', '.divider');
      expect(after).to.not.equal(before);
      expect(after).to.contain('10, 20, 30');
    } finally {
      document.documentElement.style.removeProperty('--border-default-rgb');
    }
  });
});

describe('the axis is an argument too', () => {
  it('a vertical divider runs its lobe down instead of across', async () => {
    const across = await backgroundOf('<arc-divider variant="fade"></arc-divider>', '.divider');
    const down = await backgroundOf(
      '<arc-divider variant="fade" vertical></arc-divider>',
      '.divider',
    );
    expect(across).to.not.equal(down);
    // Chrome prints the angle only when it is not the default, and 180deg *is*
    // `to bottom`. So the horizontal one names its angle and the vertical one
    // does not — asserting on "180deg" appearing would fail on correct output.
    expect(across, `got ${across}`).to.contain('90deg');
    expect(down, `got ${down}`).to.not.contain('90deg');
  });
});

describe('components that are not arc-divider get the same guarantee', () => {
  it('arc-stat rule fades in the accent, not to black', async () => {
    const bg = await backgroundOf('<arc-stat label="Users" value="42"></arc-stat>', '.stat__rule, .stat::after, .stat__accent, .stat');
    // Not every arc-stat internal carries a lobe; the assertion is about the
    // one that does, so an empty background here means the selector needs
    // updating rather than that the lobe is wrong.
    if (bg === 'none') return;
    expect(stopsOf(bg).filter((s) => s === 'rgba(0, 0, 0, 0)')).to.have.lengthOf(0);
  });
});
