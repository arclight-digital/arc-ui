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

/**
 * Compositions are forwarded; only shadow-private references are held back.
 *
 * This reverses the earlier "literal-valued tokens only" rule. Forwarding a
 * composition is what lets the `[data-theme="light"]` retunes of --glow-*,
 * --focus-* and the interactive ramp reach shadow DOM at all; holding them back
 * stranded the light values at :root while the :host copies kept dark alphas.
 * A value referencing a shadow-private var(--_…) is still excluded, because
 * that reference is guaranteed-invalid in the scope it would inherit from.
 *
 * The rule is stated in shared/tokens.js (renderForwardRule). Its cost is real,
 * and the last test here pins it rather than leaving it to be rediscovered.
 */
describe('compositions are forwarded, shadow-private references are not', () => {
  function forwardedNames() {
    const from = cssText.indexOf('Let a :root override');
    const block = cssText.slice(from, cssText.indexOf('\n}', from));
    return [...block.matchAll(/(--[a-z0-9_-]+): inherit;/g)].map((m) => m[1]);
  }

  function rootValues() {
    const from = cssText.indexOf(':root {');
    const root = cssText.slice(from, cssText.indexOf('\n}', from));
    return new Map(
      [...root.matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2]]));
  }

  afterEach(() => {
    document.documentElement.style.removeProperty('--accent-primary');
    document.documentElement.removeAttribute('data-theme');
    cleanup();
  });

  it('lets a :root override of a base token re-resolve the compounds', async () => {
    const el = await mountButton();
    expect(seen(el, '--interactive')).to.equal('rgb(77, 126, 247)');

    document.documentElement.style.setProperty('--accent-primary', 'rgb(1, 2, 3)');
    await el.updateComplete;
    expect(seen(el, '--interactive'), 'compound followed :root').to.equal('rgb(1, 2, 3)');
  });

  it('carries the light-theme retune of a glow into shadow DOM', async () => {
    // The whole reason compositions are forwarded: --glow-md is retuned from
    // alpha .25 to .36 under [data-theme="light"], and a component that never
    // saw the retune would wear a dark-mode glow on a light ground.
    const el = await mountButton();
    const dark = seen(el, '--glow-md');

    document.documentElement.setAttribute('data-theme', 'light');
    await el.updateComplete;
    const light = seen(el, '--glow-md');

    expect(light, 'the retune reached the component').to.not.equal(dark);
    expect(light).to.include('0.36');
  });

  it('forwards no token whose value references a shadow-private variable', async () => {
    const values = rootValues();
    const leaked = forwardedNames().filter((n) => (values.get(n) || '').includes('var(--_'));
    expect(leaked, 'these would inherit an invalid reference').to.deep.equal([]);

    // --glow-status is the live case: rgba(var(--_status-rgb), …), declared only
    // inside a shadow root by status-styles.js. If it appears in the rule, the
    // exclusion in renderForwardRule has stopped matching.
    expect(forwardedNames()).to.not.include('--glow-status');
    expect(forwardedNames(), 'its literal alpha still is').to.include('--glow-status-alpha');
  });

  it('forwards the semantic aliases and the accent compounds', async () => {
    for (const n of ['--interactive', '--surface-raised', '--divider', '--focus-glow',
                     '--glow-md', '--transition-base']) {
      expect(forwardedNames(), n).to.include(n);
    }
  });

  it('prices the trade: a per-element base override no longer re-resolves compounds', async () => {
    // `inherit` arrives already substituted in the parent's scope, so setting a
    // base token on the element itself cannot reach a compound resolved above it.
    // Overriding the compound directly still works — an element's own style
    // outranks :where() — and that is the documented escape hatch.
    const el = await mountButton();

    el.style.setProperty('--accent-primary', 'rgb(1, 2, 3)');
    await el.updateComplete;
    expect(seen(el, '--interactive'), 'frozen to the parent value').to.equal('rgb(77, 126, 247)');

    el.style.setProperty('--interactive', 'rgb(4, 5, 6)');
    await el.updateComplete;
    expect(seen(el, '--interactive'), 'the compound itself still overrides').to.equal('rgb(4, 5, 6)');
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
    for (const tag of ['arc-button', 'arc-card', 'arc-select', 'arc-dialog', 'arc-tooltip']) {
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
