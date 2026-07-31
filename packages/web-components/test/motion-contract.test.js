/**
 * The v3 motion contract.
 *
 * Two things this pins, both of which failed silently before and would fail
 * silently again:
 *
 *   The curves are the library's, not the browser's. All three transition
 *   tokens used to end in the CSS keyword `ease` across 356 uses. A regression
 *   here is invisible — everything still animates, just genericly — so it has
 *   to be asserted rather than eyeballed.
 *
 *   Reduced motion is honoured by every component, because shared-styles.js
 *   carries the guard rather than each component carrying its own copy. It was
 *   pasted into sixty-nine files and missing from fifteen that animate.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/input/button.register.js';
import '../src/content/card.register.js';
import '../src/data/badge.register.js';
import '../src/content/accordion.register.js';

/**
 * Read a token the way a component does — off a mounted host.
 *
 * Not off documentElement: the static token layer is declared on :host, and
 * these tests do not load base.css, so :root carries none of it. Asking the
 * document returns '' for every one of these, which reads as a pass on any
 * assertion phrased as "not equal to the old value".
 */
let host;
const tokenValue = (name) => getComputedStyle(host).getPropertyValue(name).trim();

describe('motion tokens', () => {
  beforeEach(async () => {
    host = mount('<arc-button>Go</arc-button>');
    await host.updateComplete;
  });
  afterEach(cleanup);

  it('resolves the transition scale to real curves, not the ease keyword', () => {
    for (const name of ['--transition-fast', '--transition-base', '--transition-slow']) {
      const value = tokenValue(name);
      expect(value, `${name} should be declared`).to.not.equal('');
      expect(value, `${name} should carry a cubic-bezier, not a keyword`)
        .to.match(/cubic-bezier\(/);
      // The keyword must not survive anywhere in the value — "120ms ease" is
      // exactly the shape this replaced.
      expect(/(^|[\s,])ease([\s,;]|$)/.test(value), `${name} still uses the ease keyword`)
        .to.equal(false);
    }
  });

  it('publishes a curve for each motion role', () => {
    for (const name of ['--ease-standard', '--ease-out', '--ease-in', '--ease-spring']) {
      expect(tokenValue(name), `${name} should be declared`).to.match(/cubic-bezier\(/);
    }
  });

  it('keeps the pre-v3 curve names working as aliases', () => {
    expect(tokenValue('--ease-out-expo')).to.equal(tokenValue('--ease-out'));
    expect(tokenValue('--ease-in-out')).to.equal(tokenValue('--ease-standard'));
  });

  it('pairs enter with a decelerating curve and exit with an accelerating one', () => {
    expect(tokenValue('--transition-enter')).to.contain(tokenValue('--ease-out'));
    expect(tokenValue('--transition-exit')).to.contain(tokenValue('--ease-in'));

    const ms = (v) => parseFloat(v);
    expect(
      ms(tokenValue('--duration-exit')),
      'an exit the user already decided on should not be re-watched',
    ).to.be.lessThan(ms(tokenValue('--duration-enter')));
  });
});

describe('reduced motion', () => {
  afterEach(cleanup);

  // Every component adopts tokenStyles, so the guard should be in the adopted
  // stylesheets of any of them — including ones that never wrote their own.
  const tags = ['arc-button', 'arc-card', 'arc-badge', 'arc-accordion'];

  for (const tag of tags) {
    it(`${tag} carries the shared reduced-motion guard`, async () => {
      const el = mount(`<${tag}></${tag}>`);
      await el.updateComplete;

      const css = [...el.shadowRoot.adoptedStyleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .map((rule) => rule.cssText)
        .join('\n');

      expect(css).to.contain('prefers-reduced-motion');
      expect(css, 'the guard should shorten rather than cancel, so animationend still fires')
        .to.match(/animation-duration:\s*0\.01ms/);
    });
  }

  it('declares the guard exactly once per component', async () => {
    const el = mount('<arc-card></arc-card>');
    await el.updateComplete;

    const occurrences = [...el.shadowRoot.adoptedStyleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .filter((rule) => rule.cssText.includes('prefers-reduced-motion')).length;

    expect(occurrences, 'the per-component copies should be gone').to.equal(1);
  });
});
