import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/input/button.register.js';
import '../src/input/icon-button.register.js';
import '../src/typography/gradient-text.register.js';
import '../src/content/divider.register.js';

/**
 * An enum value outside a component's documented set used to render the element
 * with no styling at all: the default look was selected by the *absence* of the
 * attribute, so a reflected-but-unrecognised value matched no rule and could not
 * reach the default either. `variant="outline"` on arc-button — a plausible
 * guess — produced a button with no background, border or padding, silently.
 *
 * Every default is now keyed on "not any of the other members", so an
 * unrecognised value lands on it. These tests pin that: an unknown value must
 * render identically to the default, not to nothing.
 *
 * `@arclux/arc-ui/dev` warns about the same mistake at the console; this is the
 * behaviour that keeps an unwarned production build looking right regardless.
 */

/** Computed styles of a node inside a component's shadow root. */
function styleOf(host, selector) {
  const node = host.shadowRoot.querySelector(selector);
  expect(node, `expected ${selector} inside ${host.localName}`).to.exist;
  return getComputedStyle(node);
}

/** Mount two elements and compare one property of an inner node across them. */
async function sameAsDefault(defaultHtml, unknownHtml, selector, prop) {
  const a = mount(defaultHtml);
  const b = mount(unknownHtml);
  await a.updateComplete;
  await b.updateComplete;
  return [styleOf(a, selector)[prop], styleOf(b, selector)[prop]];
}

afterEach(cleanup);

// Colours and gradients resolve from base.css at :root — shared-styles.js
// deliberately holds only the static tokens. Without it `var(--interactive)`
// is unresolvable and *every* variant computes to transparent, which would let
// a genuinely unstyled fallback pass unnoticed.
before(async () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/packages/web-components/src/base.css';
  const loaded = new Promise((res, rej) => {
    link.onload = res;
    link.onerror = () => rej(new Error('base.css failed to load'));
  });
  document.head.appendChild(link);
  await loaded;
});

describe('unrecognised enum values fall back to the default', () => {
  it('arc-button variant="outline" keeps the primary fill', async () => {
    const [def, unknown] = await sameAsDefault(
      '<arc-button>Go</arc-button>',
      '<arc-button variant="outline">Go</arc-button>',
      '.btn',
      'backgroundColor',
    );
    expect(unknown).to.equal(def);
    expect(unknown, 'an unstyled button would be transparent').to.not.equal('rgba(0, 0, 0, 0)');
  });

  it('arc-button variant="outline" keeps the primary padding', async () => {
    const [def, unknown] = await sameAsDefault(
      '<arc-button>Go</arc-button>',
      '<arc-button variant="outline">Go</arc-button>',
      '.btn',
      'paddingLeft',
    );
    expect(unknown).to.equal(def);
    expect(unknown).to.not.equal('0px');
  });

  it('arc-button size="huge" keeps the medium padding', async () => {
    const [def, unknown] = await sameAsDefault(
      '<arc-button>Go</arc-button>',
      '<arc-button size="huge">Go</arc-button>',
      '.btn',
      'paddingLeft',
    );
    expect(unknown).to.equal(def);
  });

  it('arc-icon-button falls back to ghost, not to the button default', async () => {
    const [def, unknown] = await sameAsDefault(
      '<arc-icon-button label="a">x</arc-icon-button>',
      '<arc-icon-button label="a" variant="outline">x</arc-icon-button>',
      '.btn',
      'backgroundColor',
    );
    // Each component keeps its own default — icon-button's is ghost, so the
    // fallback is transparent here and filled on arc-button.
    expect(unknown).to.equal(def);
  });

  it('arc-divider variant="dashed" keeps a visible gradient', async () => {
    const [def, unknown] = await sameAsDefault(
      '<arc-divider></arc-divider>',
      '<arc-divider variant="dashed"></arc-divider>',
      '.divider',
      'backgroundImage',
    );
    expect(unknown).to.equal(def);
    expect(unknown, 'an unstyled divider would have no gradient').to.not.equal('none');
  });

  it('arc-gradient-text variant="custom" with no gradient still paints', async () => {
    // `custom` is a documented member with no rule of its own — the gradient
    // arrives as an inline style. Before, omitting `gradient` left transparent
    // text over no background, i.e. invisible.
    const el = mount('<arc-gradient-text variant="custom">Hi</arc-gradient-text>');
    await el.updateComplete;
    expect(styleOf(el, '.gradient-text').backgroundImage).to.not.equal('none');
  });

  it('arc-gradient-text still honours an explicit custom gradient', async () => {
    const el = mount(
      '<arc-gradient-text variant="custom" gradient="linear-gradient(90deg, red, blue)">Hi</arc-gradient-text>',
    );
    await el.updateComplete;
    const bg = styleOf(el, '.gradient-text').backgroundImage;
    expect(bg).to.contain('255, 0, 0');
  });
});

describe('recognised enum values are unaffected', () => {
  it('arc-button variant="ghost" is still transparent', async () => {
    const el = mount('<arc-button variant="ghost">Go</arc-button>');
    await el.updateComplete;
    expect(styleOf(el, '.btn').backgroundColor).to.equal('rgba(0, 0, 0, 0)');
  });

  it('arc-button variant="secondary" keeps its border', async () => {
    const el = mount('<arc-button variant="secondary">Go</arc-button>');
    await el.updateComplete;
    const s = styleOf(el, '.btn');
    expect(s.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
    expect(s.borderLeftWidth).to.equal('1px');
  });

  it('arc-button size="lg" keeps its own padding', async () => {
    const md = mount('<arc-button>Go</arc-button>');
    const lg = mount('<arc-button size="lg">Go</arc-button>');
    await md.updateComplete;
    await lg.updateComplete;
    expect(styleOf(lg, '.btn').paddingLeft).to.not.equal(styleOf(md, '.btn').paddingLeft);
  });

  it('arc-divider variant="glow" keeps its own gradient', async () => {
    const def = mount('<arc-divider></arc-divider>');
    const glow = mount('<arc-divider variant="glow"></arc-divider>');
    await def.updateComplete;
    await glow.updateComplete;
    expect(styleOf(glow, '.divider').backgroundImage).to.not.equal(
      styleOf(def, '.divider').backgroundImage,
    );
  });
});
