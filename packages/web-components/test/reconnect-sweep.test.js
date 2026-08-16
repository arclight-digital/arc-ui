/**
 * Connection-scoped subscriptions across a disconnect → reconnect cycle.
 *
 * A component that subscribes to something outside itself — a ResizeObserver, a
 * scroll listener — owns that subscription for as long as it is *connected*,
 * not for as long as it exists. Every component here used to tear down
 * correctly on `disconnectedCallback` and then never subscribe again, because
 * the subscribing call lived in `firstUpdated`, which runs once per element for
 * its whole lifetime rather than once per connection.
 *
 * Reparenting an element is ordinary — any list reorder that recreates DOM
 * around a kept node, any move between containers, any framework host that
 * detaches a subtree and puts it back. These components came back silently
 * degraded: still rendering, still answering every property, no longer
 * reacting.
 *
 * The sweep used to be mechanism-level as well — counting `observe()` calls
 * through a ResizeObserver spy for `arc-truncate`, `arc-code-block` and
 * `arc-image-cropper`. V4-PLAN 2.6 cut that half. Its job was to catch a
 * component subscribing from `firstUpdated`, and it did that from a
 * hand-written list of the four known cases, which is precisely how finding
 * #64 got past it nine components later. `scripts/checks/lifecycle-pairing.js`
 * now reads every component in the tree and needs no list, so the call-count
 * tests were guarding a narrower version of something already guarded.
 *
 * What is left is behavioural, and that is deliberate: these are what pin the
 * *controllers* in `src/shared/subscriptions.js`, which a static check cannot
 * see into. Each asserts something a user would notice — a truncation that
 * stops re-measuring, a grid that stops responding to scroll, a toggle that
 * stops following the page theme — plus the `arc-scroll-indicator` control
 * that proves the harness's recycle() really does reconnect.
 *
 * The controllers key the subscription to the connection rather than to first
 * render, and these tests are what pins that — written against the *behaviour*
 * rather than against the controller, so they would equally catch a regression
 * to any other implementation. See test-findings.md #55.
 */
import { expect } from '@esm-bundle/chai';
import {
  mount,
  cleanup,
  settle,
  observed,
  until,
  nextFrame,
  pageWith,
} from './helpers.js';

import '../src/typography/truncate.register.js';
import '../src/data/data-grid.register.js';
import '../src/content/scroll-indicator.register.js';
import '../src/input/theme-toggle.register.js';

const LONG = 'The quick brown fox jumps over the lazy dog. '.repeat(20);

afterEach(cleanup);

/** Detach and re-attach, settling either side, as a DOM move would. */
async function recycle(el) {
  const parent = el.parentNode;
  el.remove();
  await nextFrame();
  parent.appendChild(el);
  await settle(el);
  await observed();
}

describe('arc-truncate reconnect', () => {
  /**
   * Whether the truncation is showing itself as overflowing — the "Show more"
   * button is what `_overflows` exists to draw, and the only half of it a
   * reader ever meets.
   */
  const overflowing = (el) => el.shadowRoot.querySelector('[part~="toggle"]') !== null;

  async function truncate(width) {
    const host = mount(`<div style="width:${width}px"><arc-truncate lines="2">${LONG}</arc-truncate></div>`);
    const el = host.querySelector('arc-truncate');
    await settle(el);
    await observed();
    return { host, el };
  }

  it('re-measures on resize while connected', async () => {
    const { host, el } = await truncate(200);
    expect(overflowing(el), 'narrow: should overflow').to.equal(true);

    host.style.width = '4000px';
    expect(await until(() => overflowing(el) === false)).to.equal(true);
  });

  it('keeps re-measuring on resize after a reconnect', async () => {
    const { host, el } = await truncate(200);
    expect(overflowing(el)).to.equal(true);

    await recycle(el);
    // anti-vacuity: the component is alive and still rendering after the move
    expect(el.shadowRoot.querySelector('[part~="content"]')).to.not.equal(null);
    expect(el.isConnected).to.equal(true);

    host.style.width = '4000px';
    expect(await until(() => overflowing(el) === false)).to.equal(true);
  });

});

describe('arc-data-grid reconnect', () => {
  it('keeps responding to scroll after a reconnect', async () => {
    // Not a ResizeObserver, same lifecycle mistake: the scroll listener was
    // bound in firstUpdated. Recorded separately as finding #54.
    // Columns wider than the host, so the scroll handler has something visible
    // to do: it adds `scrolled-x`, which lifts the pinned column's shadow.
    const cols = Array.from({ length: 8 }, (_, i) => ({
      key: `c${i}`, label: `Column ${i}`, width: '200px', pinned: i === 0,
    }));
    const host = mount('<div style="width:300px"><arc-data-grid style="display:block"></arc-data-grid></div>');
    const el = host.querySelector('arc-data-grid');
    el.columns = cols;
    el.rows = [Object.fromEntries(cols.map((c) => [c.key, c.label]))];
    await settle(el);

    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    wrapper.scrollLeft = 120;
    wrapper.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await settle(el);
    expect(
      wrapper.classList.contains('scrolled-x'),
      'anti-vacuity: responds while connected',
    ).to.equal(true);

    // Back to the pinned edge, through the handler rather than by editing the
    // class: `scrolled-x` is rendered from `_scrolledX`, so removing it by hand
    // desyncs the two and the next render never puts it back.
    wrapper.scrollLeft = 0;
    wrapper.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await settle(el);
    expect(wrapper.classList.contains('scrolled-x'), 'reset before the move').to.equal(false);

    await recycle(el);

    // The wrapper survives the move, so this is the same element that was
    // listened to before — a fix that rebound to a *new* wrapper would not
    // satisfy this.
    expect(el.shadowRoot.querySelector('.grid-wrapper')).to.equal(wrapper);
    // Detaching resets the scroll position, so re-establish it before asking
    // the handler what it sees.
    wrapper.scrollLeft = 120;
    wrapper.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await settle(el);
    expect(wrapper.classList.contains('scrolled-x'), 'and after it').to.equal(true);
  });
});

describe('arc-theme-toggle reconnect', () => {
  // The third subscription kind — observeAttributes — and the first whose
  // target is *outside* the host: arc-theme-toggle watches the document root's
  // data-theme so every toggle on a page agrees (finding #15). A subscription
  // to shared global state is exactly the kind that must survive a reparent
  // and must not survive a disconnect, so both directions are asserted here.
  let storedBefore;
  let attrBefore;

  beforeEach(() => {
    storedBefore = localStorage.getItem('arc-theme');
    attrBefore = document.documentElement.getAttribute('data-theme');
    localStorage.removeItem('arc-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    if (storedBefore === null) localStorage.removeItem('arc-theme');
    else localStorage.setItem('arc-theme', storedBefore);
    if (attrBefore === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', attrBefore);
  });

  it('still follows the page theme after a reparent', async () => {
    const host = mount('<div><arc-theme-toggle></arc-theme-toggle></div>');
    const el = host.querySelector('arc-theme-toggle');
    await settle(el);

    document.documentElement.setAttribute('data-theme', 'light');
    await settle(el);
    expect(el.theme, 'follows before the move').to.equal('light');

    await recycle(el);

    document.documentElement.setAttribute('data-theme', 'dark');
    await settle(el);
    expect(el.theme, 'and still follows after it').to.equal('dark');
  });

  it('stops following while detached', async () => {
    const host = mount('<div><arc-theme-toggle></arc-theme-toggle></div>');
    const el = host.querySelector('arc-theme-toggle');
    await settle(el);

    el.remove();
    await nextFrame();

    document.documentElement.setAttribute('data-theme', 'light');
    await settle(el);
    expect(el.theme, 'a detached instance is not part of the page').to.equal('auto');
  });
});

describe('the correct shape, for contrast', () => {
  it('components that subscribe in connectedCallback survive the same cycle', async () => {
    // arc-scroll-indicator binds in connectedCallback, so the identical move
    // leaves it working. This is the control: without it, the four tests above
    // could be describing a limitation of the harness — a recycle() that does
    // not really reconnect, or observers that never deliver in a moved subtree
    // — rather than a defect in the components.
    const wrapper = pageWith('<arc-scroll-indicator></arc-scroll-indicator>', { below: 3000 });
    const el = wrapper.querySelector('arc-scroll-indicator');
    await settle(el);
    /** How far the bar says it has got, read off the fill it draws. */
    const shown = () =>
      Number(/scaleX\(([-\d.]+)\)/.exec(
        el.shadowRoot.querySelector('.bar__fill').getAttribute('style'),
      )[1]);

    window.scrollTo(0, 600);
    expect(await until(() => shown() > 0), 'tracks before the move').to.equal(true);
    window.scrollTo(0, 0);
    await until(() => shown() === 0);

    await recycle(el);

    window.scrollTo(0, 600);
    expect(await until(() => shown() > 0), 'still tracks after the move').to.equal(true);
  });
});
