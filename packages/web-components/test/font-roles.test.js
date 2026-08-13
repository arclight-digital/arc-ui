import { expect } from '@esm-bundle/chai';
import { mount, cleanup, useBaseCss } from './helpers.js';

import '../src/typography/text.register.js';
import '../src/input/slider.register.js';
import '../src/typography/code-block.register.js';
import '../src/typography/blockquote.register.js';

/** Resolved font-family of a node inside a component's shadow root. */
function fontOf(host, selector) {
  const node = host.shadowRoot.querySelector(selector);
  expect(node, `expected ${selector} inside ${host.localName}`).to.exist;
  return getComputedStyle(node).fontFamily;
}

/** Set a token on the document root for the duration of one test. */
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

describe('font role slots', () => {
  describe('assigning a typeface from the document root', () => {
    it('reaches the text role inside shadow DOM', async () => {
      const el = mount('<arc-text>Body</arc-text>');
      await el.updateComplete;
      setToken('--font-body-family', 'TestBody');
      expect(fontOf(el, '.text, span, p')).to.contain('TestBody');
    });

    it('reaches the label role inside shadow DOM', async () => {
      const el = mount('<arc-slider label="Volume"></arc-slider>');
      await el.updateComplete;
      setToken('--font-label-family', 'TestLabel');
      expect(fontOf(el, '.slider__label')).to.contain('TestLabel');
    });

    it('reaches the mono role inside shadow DOM', async () => {
      const el = mount('<arc-code-block code="x"></arc-code-block>');
      await el.updateComplete;
      setToken('--font-mono-family', 'TestMono');
      const found = [...el.shadowRoot.querySelectorAll('*')].some((n) =>
        getComputedStyle(n).fontFamily.includes('TestMono'),
      );
      expect(found, 'no node in arc-code-block picked up --font-mono-family').to.be.true;
    });
  });

  describe('role independence', () => {
    it('reassigning the text role leaves the label role alone', async () => {
      const el = mount('<arc-slider label="Volume"></arc-slider>');
      await el.updateComplete;
      setToken('--font-body-family', 'TestBody');
      expect(fontOf(el, '.slider__label')).to.not.contain('TestBody');
    });

    it('the display role follows the text role until assigned separately', async () => {
      const el = mount('<arc-text variant="display">Big</arc-text>');
      await el.updateComplete;
      setToken('--font-body-family', 'TestBody');
      expect(fontOf(el, '.text, span, p')).to.contain('TestBody');

      setToken('--font-display-family', 'TestDisplay');
      expect(fontOf(el, '.text, span, p')).to.contain('TestDisplay');
    });
  });

  describe('fallbacks', () => {
    it('keeps the role fallback when only the family is assigned', async () => {
      const el = mount('<arc-text>Body</arc-text>');
      await el.updateComplete;
      setToken('--font-body-family', 'TestBody');
      expect(fontOf(el, '.text, span, p')).to.contain('system-ui');
    });

    it('lets the fallback be replaced independently of the family', async () => {
      const el = mount('<arc-text>Body</arc-text>');
      await el.updateComplete;
      setToken('--font-body-fallback', 'Times, serif');
      const font = fontOf(el, '.text, span, p');
      expect(font).to.contain('Times');
      expect(font).to.not.contain('system-ui');
    });
  });

  describe('back-compat', () => {
    // The alias lives in base.css at :root, which is what a real consumer
    // loads. Exercise it the same way rather than through a hand-built fixture.
    useBaseCss();

    it('--font-accent still resolves to the label role', () => {
      setToken('--font-label-family', 'TestLabel');
      const probe = document.createElement('div');
      probe.style.fontFamily = 'var(--font-accent)';
      document.body.appendChild(probe);
      expect(getComputedStyle(probe).fontFamily).to.contain('TestLabel');
    });

    // Named no face on purpose. The point of the alias is that it follows
    // whatever the label role currently is, so spelling today's face here
    // would fail the next time that face changes — which is the one event
    // this test exists to survive.
    it('--font-accent tracks the label role rather than pinning a face', () => {
      const accent = document.createElement('div');
      accent.style.fontFamily = 'var(--font-accent)';
      const label = document.createElement('div');
      label.style.fontFamily = 'var(--font-label)';
      document.body.append(accent, label);
      const resolved = getComputedStyle(label).fontFamily;
      expect(resolved).to.not.equal('');
      expect(getComputedStyle(accent).fontFamily).to.equal(resolved);
    });
  });

  describe('no un-tokenized faces', () => {
    it('blockquote decoration is assignable rather than hardcoded', async () => {
      const el = mount('<arc-blockquote>Quoted</arc-blockquote>');
      await el.updateComplete;
      setToken('--font-quote-family', 'TestQuote');
      const quote = el.shadowRoot.querySelector('.blockquote');
      expect(quote, 'expected .blockquote in arc-blockquote').to.exist;
      expect(getComputedStyle(quote, '::after').fontFamily).to.contain('TestQuote');
    });

    it('falls back to the reference face when the quote role is unassigned', async () => {
      const el = mount('<arc-blockquote>Quoted</arc-blockquote>');
      await el.updateComplete;
      expect(
        getComputedStyle(el.shadowRoot.querySelector('.blockquote'), '::after').fontFamily,
      ).to.contain('Georgia');
    });
  });
});
