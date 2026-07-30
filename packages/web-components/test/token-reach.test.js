import { expect } from '@esm-bundle/chai';
import '../src/input/button.register.js';
import '../src/content/card.register.js';
import { cleanup } from './helpers.js';

/**
 * A :root override has to reach into shadow DOM.
 *
 * Every token in the :host static layer is *set on the host element*, and a value
 * set on an element always beats one inherited into it — so
 * `:root { --space-md: 20px }` was silently ignored by every component. base.css
 * now carries a `:where(<every arc tag>) { --space-md: inherit; … }` rule, which
 * wins because the cascade weighs encapsulation context before specificity for
 * normal declarations.
 *
 * These tests load the real generated base.css and use real ARC tags, because
 * the forwarding selector is a fixed list built from the component sources — a
 * test-only element would not be in it and would prove nothing.
 */
let sheet;
let cssText;

before(async () => {
  cssText = await (await fetch(new URL('../src/base.css', import.meta.url))).text();
  sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
});

after(() => {
  document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
});

/** The value a component's shadow tree would see for `token`. */
function seen(el, token) {
  return getComputedStyle(el).getPropertyValue(token).trim();
}

async function mountButton() {
  const el = document.createElement('arc-button');
  el.textContent = 'Go';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('a :root override reaches components', () => {
  const touched = ['--space-md', '--radius-md', '--z-dropdown', '--touch-min',
                   '--text-md', '--accent-primary'];
  afterEach(() => {
    for (const t of touched) document.documentElement.style.removeProperty(t);
    cleanup();
  });

  const cases = [
    ['--space-md', '16px', '31px'],
    ['--radius-md', '10px', '3px'],
    ['--z-dropdown', '1000', '42'],
    ['--touch-min', '24px', '55px'],
  ];

  for (const [token, def, override] of cases) {
    it(`forwards ${token}`, async () => {
      const el = await mountButton();
      expect(seen(el, token), `${token} default`).to.equal(def);

      document.documentElement.style.setProperty(token, override);
      await el.updateComplete;
      expect(seen(el, token), `${token} after :root override`).to.equal(override);
    });
  }

  it('reaches a derived token through its base rather than directly', async () => {
    // --body-size is var(--text-md), a composition, so it is deliberately NOT
    // forwarded — see below. The capability is preserved through the base token:
    // overriding --text-md moves --body-size with it.
    const el = await mountButton();
    document.documentElement.style.setProperty('--text-md', '23px');
    await el.updateComplete;
    expect(seen(el, '--body-size')).to.equal('23px');
  });

  it('reaches a second, unrelated component too', async () => {
    const card = document.createElement('arc-card');
    document.body.appendChild(card);
    await card.updateComplete;

    document.documentElement.style.setProperty('--space-md', '31px');
    await card.updateComplete;
    expect(seen(card, '--space-md')).to.equal('31px');
  });

  it('still lets a single instance win over :root', async () => {
    // A consumer's own selector outranks :where() on specificity, so per-instance
    // theming keeps working — before this rule it was the only thing that did.
    const el = await mountButton();
    document.documentElement.style.setProperty('--space-md', '31px');
    el.style.setProperty('--space-md', '7px');
    await el.updateComplete;
    expect(seen(el, '--space-md')).to.equal('7px');
  });

  it('leaves the defaults alone when nothing is overridden', async () => {
    const el = await mountButton();
    expect(seen(el, '--space-md')).to.equal('16px');
    expect(seen(el, '--radius-md')).to.equal('10px');
    expect(seen(el, '--touch-min')).to.equal('24px');
  });
});

describe('compositions are deliberately not forwarded', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--accent-primary');
    cleanup();
  });

  it('keeps a per-instance --accent-primary override flowing into its aliases', async () => {
    // The regression this guards: `inherit` resolves to the parent's *substituted*
    // value, so forwarding --interactive would freeze it to the parent's accent and
    // `arc-button { --accent-primary: … }` would stop recolouring the button —
    // :host's `--interactive: var(--accent-primary)` would never resolve locally.
    // Only literal-valued tokens may be forwarded.
    const el = await mountButton();
    expect(seen(el, '--interactive')).to.equal('rgb(77, 126, 247)');

    el.style.setProperty('--accent-primary', 'rgb(1, 2, 3)');
    await el.updateComplete;
    expect(seen(el, '--interactive'), 'alias followed the instance').to.equal('rgb(1, 2, 3)');
  });

  it('forwards no token whose value contains a var() reference', async () => {
    const cssText2 = cssText;
    const from = cssText2.indexOf('Let a :root override');
    const block = cssText2.slice(from, cssText2.indexOf('\n}', from));
    const forwarded = [...block.matchAll(/(--[a-z0-9_-]+): inherit;/g)].map((m) => m[1]);

    // Look each one up in the :root block and confirm it is a literal.
    const rootFrom = cssText2.indexOf(':root {');
    const root = cssText2.slice(rootFrom, cssText2.indexOf('\n}', rootFrom));
    const values = new Map(
      [...root.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2]]));

    const compositions = forwarded.filter((n) => (values.get(n) || '').includes('var('));
    expect(compositions, 'these would freeze to the parent value').to.deep.equal([]);
  });

  it('does not forward the semantic aliases', async () => {
    const from = cssText.indexOf('Let a :root override');
    const block = cssText.slice(from, cssText.indexOf('\n}', from));
    for (const n of ['--interactive', '--surface-raised', '--divider', '--focus-glow']) {
      expect(block, n).to.not.include(`${n}: inherit`);
    }
  });
});

describe('the forwarding rule is scoped and complete', () => {
  afterEach(cleanup);

  function rule() {
    const from = cssText.indexOf('Let a :root override');
    return cssText.slice(from, cssText.indexOf('\n}', from));
  }

  it('never uses a universal selector', async () => {
    // A universal selector would push ARC's token values onto every element in
    // the consumer's page, including elements ARC does not own.
    const selector = rule().slice(rule().indexOf(':where('));
    expect(selector).to.not.match(/\*/);
    expect(selector).to.include('arc-');
  });

  it('covers a broad sample of ARC tags', async () => {
    const selector = rule();
    for (const tag of ['arc-button', 'arc-card', 'arc-select', 'arc-modal', 'arc-tooltip']) {
      expect(selector, tag).to.include(tag);
    }
  });

  it('does not forward the font compositions', async () => {
    // Their override surface is the --font-*-family slot, which already inherits
    // because it is deliberately not declared on :host.
    for (const n of ['--font-body', '--font-label', '--font-mono', '--font-display']) {
      expect(rule(), n).to.not.include(`${n}: inherit`);
    }
  });

  it('does not forward the private size mirrors', async () => {
    expect(rule()).to.not.match(/--_text-[a-z0-9]+: inherit/);
  });

  it('lets a font slot override reach a component without being forwarded', async () => {
    const el = await mountButton();
    const before = seen(el, '--font-body');
    document.documentElement.style.setProperty('--font-body-family', 'Times');
    await el.updateComplete;
    const after = seen(el, '--font-body');

    expect(after, 'composition picked up the slot').to.not.equal(before);
    expect(after).to.include('Times');
    document.documentElement.style.removeProperty('--font-body-family');
  });
});
