// Hydration support first, before anything that reaches lit-element — which
// `lit` does. Written the other way round, this file reproduces the very bug it
// is testing: lit-element evaluates first, never consumes the hook, and every
// assertion below inverts.
import '../src/hydrate.js';
import { expect } from '@esm-bundle/chai';
import { LitElement } from 'lit';

/**
 * The hydration-order failure is silent by construction: nothing throws, the
 * page looks approximately right, and the only symptom is every component
 * holding the server's markup plus a second client-rendered copy above it.
 * This is the warning that says so.
 *
 * The signal is the hook's fingerprint on each class as it is defined —
 * `defer-hydration` in `observedAttributes` appears only if lit-element
 * consumed `globalThis.litElementHydrateSupport` while evaluating.
 *
 * Verified against a real build too, not only here: removing `manualChunks`
 * from docs/astro.config.mjs reproduces the failure, and the warning fires
 * with 29 duplicated shadow roots to corroborate it. Restoring it silences
 * both.
 */
describe('hydration order warning', () => {
  let warnings;
  let realWarn;

  beforeEach(() => {
    warnings = [];
    realWarn = console.warn;
    console.warn = (...args) => { warnings.push(args.join(' ')); };
  });

  afterEach(() => { console.warn = realWarn; });

  const hydrationWarnings = () =>
    warnings.filter((w) => w.includes('Hydration support loaded too late'));

  it('stays quiet on a page that was not server-rendered', () => {
    // No data-arc-ssr: none of this matters, so it should say nothing even
    // for a class that never saw the hook.
    class Unpatched extends HTMLElement {
      static get observedAttributes() { return ['size']; }
    }
    customElements.define('arc-test-not-ssr', Unpatched);
    expect(hydrationWarnings()).to.have.length(0);
  });

  describe('on a server-rendered page', () => {
    beforeEach(() => document.documentElement.setAttribute('data-arc-ssr', ''));
    afterEach(() => document.documentElement.removeAttribute('data-arc-ssr'));

    it('stays quiet for a class that carries the hook', () => {
      // A real LitElement: importing hydrate.js above means lit-element
      // consumed the hook, so `defer-hydration` is observed.
      class Patched extends LitElement {}
      customElements.define('arc-test-patched', Patched);
      // Read on the subclass, not on LitElement itself: the patched getter
      // delegates to ReactiveElement's accessor, which needs a finalized class.
      expect(Patched.observedAttributes).to.contain('defer-hydration');
      expect(hydrationWarnings()).to.have.length(0);
    });

    it('warns once for a class defined without it', () => {
      class Unpatched extends HTMLElement {
        static get observedAttributes() { return ['size']; }
      }
      class AlsoUnpatched extends HTMLElement {
        static get observedAttributes() { return ['variant']; }
      }
      customElements.define('arc-test-unpatched', Unpatched);
      customElements.define('arc-test-unpatched-two', AlsoUnpatched);

      // Once, not once per component — a page has hundreds.
      expect(hydrationWarnings()).to.have.length(1);
      expect(hydrationWarnings()[0]).to.contain('arc-test-unpatched');
      expect(hydrationWarnings()[0]).to.contain('manualChunks');
    });

    it('ignores elements outside the arc- namespace', () => {
      class Foreign extends HTMLElement {
        static get observedAttributes() { return ['x']; }
      }
      customElements.define('other-test-element', Foreign);
      expect(hydrationWarnings()).to.have.length(0);
    });
  });
});
