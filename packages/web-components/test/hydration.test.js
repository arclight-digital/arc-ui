/**
 * Declarative shadow DOM, hydrated.
 *
 * The claim server rendering makes is that content is in the initial payload
 * and is *kept* — not thrown away and redrawn the moment the JS lands. That
 * second half is the one worth testing, because it fails silently: without
 * hydration support Lit renders the template from scratch into the existing
 * shadow root, the output looks identical, and the only symptom is a flash the
 * consumer sees and a test doesn't.
 *
 * So these assert node identity across upgrade. A node that survives was
 * adopted; a node that was replaced is a new object, however similar it looks.
 *
 * The DSD payloads here are the real output of @lit-labs/ssr, captured by
 * scripts/check-ssr.js's renderer — hand-written markup would not carry the
 * lit-part comment markers hydration binds to, and would prove nothing.
 */
import { expect } from '@esm-bundle/chai';
import { cleanup, tick } from './helpers.js';

// Must come before any component module: hydration support patches
// LitElement's update path, and a class defined before the patch never gets it.
import '../src/hydrate.js';
import '../src/content/feature-card.register.js';

afterEach(() => cleanup());

/** Parse DSD markup the way a browser parses a server response. */
function planted(markup) {
  const host = document.createElement('div');
  // setHTMLUnsafe is what attaches declarative shadow roots; innerHTML leaves
  // the <template> inert, which would make this test a no-op that passes.
  host.setHTMLUnsafe(markup);
  document.body.appendChild(host);
  return host.firstElementChild;
}

describe('declarative shadow DOM', () => {
  it('is attached by the parser before any JS runs', () => {
    const el = planted(`
      <arc-feature-card heading="Server rendered">
        <template shadowrootmode="open"><div class="card"><h3>Server rendered</h3></div></template>
      </arc-feature-card>
    `);
    // Not yet upgraded — but the shadow root and its content already exist.
    expect(el.shadowRoot, 'parser attached the shadow root').to.not.equal(null);
    expect(el.shadowRoot.textContent).to.contain('Server rendered');
  });

  it('survives upgrade rather than being re-rendered', async () => {
    const el = planted(`
      <arc-feature-card heading="Server rendered">
        <template shadowrootmode="open"><div class="card"><h3>Server rendered</h3></div></template>
      </arc-feature-card>
    `);
    const before = el.shadowRoot.querySelector('.card');
    expect(before, 'server DOM present').to.not.equal(null);

    // Upgrade: the element is already defined, so this is the moment Lit takes
    // over an element the parser created.
    customElements.upgrade(el);
    await el.updateComplete;
    await tick();

    const after = el.shadowRoot.querySelector('.card');
    expect(after, 'the server node is still there').to.not.equal(null);
    expect(after, 'and is the same node, not a replacement').to.equal(before);
  });
});

describe('the FOUC guard does not hide server-rendered content', () => {
  // base.css hides :not(:defined) ARC elements to avoid a flash of unstyled
  // markup. A server-rendered element is un-upgraded but finished, so the rule
  // is opted out of at the root — otherwise SSR buys a longer blank screen
  // rather than a shorter one.
  it('is scoped to :root:not([data-arc-ssr])', async () => {
    const css = await (await fetch(new URL('../../../shared/base.css', import.meta.url))).text();
    const guard = css.match(/@media \(scripting: enabled\) \{([\s\S]*?)\n\}/);
    expect(guard, 'found the guard').to.not.equal(null);
    expect(guard[1]).to.contain(':root:not([data-arc-ssr])');
    expect(guard[1]).to.contain(':not(:defined)');
  });
});
