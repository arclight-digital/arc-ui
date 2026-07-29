import { expect } from '@esm-bundle/chai';
import '../src/input/button.register.js';
import '../src/input/icon-button.register.js';
import '../src/navigation/link.register.js';
import '../src/navigation/nav-item.register.js';
import '../src/navigation/breadcrumb-item.register.js';
import '../src/navigation/sidebar-link.register.js';
import '../src/content/card.register.js';
import { mount, cleanup, tick } from './helpers.js';

/**
 * Anchor adoption — the no-JS story for link-bearing components (issue #2).
 *
 * The contract: a single slotted `<a>` becomes the component's control, so the
 * link is real HTML in the initial markup and survives with JS disabled or
 * before upgrade. Crucially it must produce exactly ONE anchor — rendering a
 * second one around it would nest links in the accessibility tree.
 */

async function mountUpgraded(htmlString) {
  const el = mount(htmlString);
  await el.updateComplete;
  // slotchange lands after the first paint of the slot; a second update flushes
  // the re-render that adopting the anchor triggers.
  await tick();
  await el.updateComplete;
  return el;
}

/** Anchors in the composed tree: shadow-rendered plus slotted light DOM. */
function allAnchors(el) {
  return [
    ...el.shadowRoot.querySelectorAll('a'),
    ...el.querySelectorAll('a'),
  ];
}

describe('anchor adoption — arc-button', () => {
  afterEach(cleanup);

  it('adopts a lone slotted anchor as the control', async () => {
    const el = await mountUpgraded('<arc-button><a href="/start">Get started</a></arc-button>');
    const anchors = allAnchors(el);
    expect(anchors).to.have.lengthOf(1);
    expect(anchors[0].getAttribute('href')).to.equal('/start');
    expect(el.shadowRoot.querySelector('a')).to.equal(null);
    expect(el.shadowRoot.querySelector('button')).to.equal(null);
  });

  it('styles the adopted anchor as the button box', async () => {
    const el = await mountUpgraded('<arc-button><a href="/start">Get started</a></arc-button>');
    const anchor = el.querySelector('a');
    const styles = getComputedStyle(anchor);
    // Blockified to `flex` because the anchor is a flex item of the host.
    expect(styles.display).to.equal('flex');
    expect(styles.textDecorationLine).to.equal('none');
    // Padding comes from the size rules, so the whole box is the click target.
    expect(parseFloat(styles.paddingLeft)).to.be.greaterThan(0);
  });

  it('leaves the href form untouched', async () => {
    const el = await mountUpgraded('<arc-button href="/start">Get started</arc-button>');
    const shadowAnchor = el.shadowRoot.querySelector('a');
    expect(shadowAnchor).to.not.equal(null);
    expect(shadowAnchor.getAttribute('href')).to.equal('/start');
    expect(shadowAnchor.classList.contains('btn')).to.equal(true);
  });

  it('an explicit href wins over a slotted anchor', async () => {
    const el = await mountUpgraded('<arc-button href="/explicit"><a href="/slotted">Go</a></arc-button>');
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('/explicit');
  });

  it('ignores an incidental inline link', async () => {
    const el = await mountUpgraded('<arc-button>Read <a href="/x">this</a></arc-button>');
    // Not the sole slotted element, so the normal button path stays in charge.
    expect(el.shadowRoot.querySelector('button')).to.not.equal(null);
  });

  it('still renders a button with no href and no anchor', async () => {
    const el = await mountUpgraded('<arc-button>Submit</arc-button>');
    expect(el.shadowRoot.querySelector('button')).to.not.equal(null);
    expect(allAnchors(el)).to.have.lengthOf(0);
  });
});

describe('anchor adoption — arc-icon-button', () => {
  afterEach(cleanup);

  it('adopts a lone slotted anchor', async () => {
    const el = await mountUpgraded('<arc-icon-button><a href="/settings" aria-label="Settings">S</a></arc-icon-button>');
    const anchors = allAnchors(el);
    expect(anchors).to.have.lengthOf(1);
    expect(anchors[0].getAttribute('href')).to.equal('/settings');
    // The anchor must not end up inside a <button> — invalid nesting, and it
    // would swallow the link's activation behaviour.
    expect(el.shadowRoot.querySelector('button')).to.equal(null);
  });

  it('leaves the href form untouched', async () => {
    const el = await mountUpgraded('<arc-icon-button href="/settings" label="Settings" name="settings"></arc-icon-button>');
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('/settings');
  });
});

describe('anchor adoption — arc-link', () => {
  afterEach(cleanup);

  it('adopts a lone slotted anchor', async () => {
    const el = await mountUpgraded('<arc-link><a href="/docs">Docs</a></arc-link>');
    const anchors = allAnchors(el);
    expect(anchors).to.have.lengthOf(1);
    expect(anchors[0].getAttribute('href')).to.equal('/docs');
  });

  it('leaves the href form untouched', async () => {
    const el = await mountUpgraded('<arc-link href="/docs">Docs</arc-link>');
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('/docs');
  });
});

describe('anchor adoption — arc-card', () => {
  afterEach(cleanup);

  it('adopts a wrapping anchor without rendering a second one', async () => {
    const el = await mountUpgraded('<arc-card><a href="/post"><h3>Title</h3><p>Body</p></a></arc-card>');
    const anchors = allAnchors(el);
    expect(anchors).to.have.lengthOf(1);
    expect(anchors[0].getAttribute('href')).to.equal('/post');
    expect(el.shadowRoot.querySelector('a')).to.equal(null);
  });

  it('re-enables the hover treatment when linked', async () => {
    const el = await mountUpgraded('<arc-card><a href="/post">Title</a></arc-card>');
    expect(el.shadowRoot.querySelector('.card').classList.contains('card--linked')).to.equal(true);
  });

  it('leaves a plain card unlinked', async () => {
    const el = await mountUpgraded('<arc-card><h3>Title</h3></arc-card>');
    expect(el.shadowRoot.querySelector('.card').classList.contains('card--linked')).to.equal(false);
  });

  it('leaves the href form untouched', async () => {
    const el = await mountUpgraded('<arc-card href="/post">Title</arc-card>');
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('/post');
  });
});

/**
 * The nav carriers are data holders — their parents read these getters and
 * re-render into shadow DOM. Reading from a child anchor is what lets the
 * pre-upgrade markup be a working link list.
 */
describe('anchor adoption — nav carriers', () => {
  afterEach(cleanup);

  it('arc-nav-item resolves href and label from a child anchor', async () => {
    const el = await mountUpgraded('<arc-nav-item><a href="/docs">Docs</a></arc-nav-item>');
    expect(el.resolvedHref).to.equal('/docs');
    expect(el.label).to.equal('Docs');
  });

  it('arc-nav-item keeps the attribute form working', async () => {
    const el = await mountUpgraded('<arc-nav-item href="/docs">Docs</arc-nav-item>');
    expect(el.resolvedHref).to.equal('/docs');
    expect(el.label).to.equal('Docs');
  });

  it('arc-nav-item attribute href wins over a child anchor', async () => {
    const el = await mountUpgraded('<arc-nav-item href="/explicit"><a href="/slotted">Docs</a></arc-nav-item>');
    expect(el.resolvedHref).to.equal('/explicit');
  });

  it('arc-breadcrumb-item resolves href and label from a child anchor', async () => {
    const el = await mountUpgraded('<arc-breadcrumb-item><a href="/docs">Docs</a></arc-breadcrumb-item>');
    expect(el.resolvedHref).to.equal('/docs');
    expect(el.label).to.equal('Docs');
  });

  it('arc-sidebar-link resolves href and label from a child anchor', async () => {
    const el = await mountUpgraded('<arc-sidebar-link><a href="/docs/install">Install</a></arc-sidebar-link>');
    expect(el.resolvedHref).to.equal('/docs/install');
    expect(el.label).to.equal('Install');
  });
});
