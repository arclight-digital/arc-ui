import { expect } from '@esm-bundle/chai';
import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../src/shared-styles.js';
import { cleanup } from './helpers.js';

/**
 * A probe that reports the computed font-size a component would get from each
 * scale step. Reading a resolved pixel value is the only way to prove the token
 * chain actually works: a broken var() chain leaves font-size inherited, which
 * looks plausible in the stylesheet and wrong on screen.
 */
class SizeProbe extends LitElement {
  static styles = [
    tokenStyles,
    css`
      span { display: block; }
      .xs { font-size: var(--_text-xs); }
      .sm { font-size: var(--_text-sm); }
      .md { font-size: var(--_text-md); }
      .lg { font-size: var(--_text-lg); }
      .xl { font-size: var(--_text-xl); }
      .xxl { font-size: var(--_text-2xl); }
      .xxxl { font-size: var(--_text-3xl); }
      .label { font-size: var(--label-inline-size); }
      .body { font-size: var(--body-size); }
      .displayxl { font-size: var(--display-xl-size); }
      .heading { font-size: var(--heading-size); }
    `,
  ];

  size(cls) {
    const el = this.shadowRoot.querySelector(`.${cls}`);
    return parseFloat(getComputedStyle(el).fontSize);
  }

  render() {
    return html`
      ${['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl', 'label', 'body', 'displayxl', 'heading']
        .map((c) => html`<span class=${c}>x</span>`)}
    `;
  }
}
customElements.define('size-probe', SizeProbe);

async function probe() {
  const el = document.createElement('size-probe');
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('size scale: the shipped values', () => {
  afterEach(cleanup);

  it('gives every step its own distinct value, in ascending order', async () => {
    const el = await probe();
    const steps = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'].map((s) => el.size(s));
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i], `${i} > ${i - 1} (${steps.join(', ')})`).to.be.greaterThan(steps[i - 1]);
    }
  });

  it('resolves --_text-3xl above --_text-2xl', async () => {
    // The bug: :host declared --text-3xl with the 2xl value, so the two steps
    // were identical and every prose h1 rendered one step small.
    const el = await probe();
    expect(el.size('xxxl')).to.be.greaterThan(el.size('xxl'));
  });

  it('feeds --display-xl-size from the 3xl step', async () => {
    const el = await probe();
    expect(el.size('displayxl')).to.equal(el.size('xxxl'));
  });

  it('feeds --heading-size from the xl step and --body-size from md', async () => {
    const el = await probe();
    expect(el.size('heading')).to.equal(el.size('xl'));
    expect(el.size('body')).to.equal(el.size('md'));
  });

  it('agrees with the generated stylesheet on --label-inline-size', async () => {
    // The two sources disagreed (10px on :host, 12px via the token tree) so the
    // web components and the standalone CSS rendered labels at different sizes.
    const el = await probe();
    expect(el.size('label')).to.equal(10);
  });
});

describe('size scale: a :root override reaches components', () => {
  afterEach(() => {
    for (const t of ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']) {
      document.documentElement.style.removeProperty(`--text-${t}`);
    }
    cleanup();
  });

  // This is the whole point of the private-token indirection. Declaring the
  // public name on :host made these overrides unreachable: a value set on the
  // host always beats one inherited into it from :root.
  const cases = [
    ['--text-xs', 'xs'],
    ['--text-sm', 'sm'],
    ['--text-md', 'md'],
    ['--text-lg', 'lg'],
    ['--text-xl', 'xl'],
    ['--text-2xl', 'xxl'],
    ['--text-3xl', 'xxxl'],
  ];

  for (const [token, cls] of cases) {
    it(`${token} set on :root changes the rendered size`, async () => {
      const el = await probe();
      const before = el.size(cls);

      document.documentElement.style.setProperty(token, '99px');
      await el.updateComplete;

      expect(el.size(cls), `${token} override`).to.equal(99);
      expect(before).to.not.equal(99);
    });
  }

  it('cascades an override through the derived tokens', async () => {
    const el = await probe();
    document.documentElement.style.setProperty('--text-md', '99px');
    await el.updateComplete;
    // --body-size is composed from the md step, so it follows.
    expect(el.size('body')).to.equal(99);
  });

  it('still honours a per-instance override', async () => {
    // Outer-tree rules on the host outrank :host declarations, so this worked
    // before and must keep working.
    const el = await probe();
    el.style.setProperty('--text-md', '42px');
    await el.updateComplete;
    expect(el.size('md')).to.equal(42);
  });
});

describe('size scale: no component reads the public names', () => {
  it('leaves --text-* to consumers', async () => {
    // A component reading var(--text-md) directly would work today and silently
    // stop working the moment shared-styles stops declaring it — which it now
    // deliberately does not.
    const paths = [
      'input/select.js', 'input/combobox.js', 'typography/prose.js',
      'content/card.js', 'feedback/tooltip.js',
    ];
    for (const path of paths) {
      const res = await fetch(new URL(`../src/${path}`, import.meta.url));
      if (!res.ok) continue;
      const src = await res.text();
      expect(src, path).to.not.match(/var\(\s*--text-(?:xs|sm|md|lg|xl|2xl|3xl)\s*[,)]/);
    }
  });
});
