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
 * The sweep is mechanism-level (did anything re-observe?) and is anchored by one
 * fully behavioural test on `arc-truncate`, so the assertion is tied to
 * something a user can see rather than to an internal call count alone.
 *
 * All four were broken; all four are now fixed by the reactive controllers in
 * `src/shared/subscriptions.js`, which key the subscription to the connection
 * rather than to first render. These tests are what pins the fix, so they are
 * written against the *behaviour* rather than against the controller — they
 * would equally catch a regression to any other implementation. See
 * test-findings.md #55.
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
  spyResizeObserver,
} from './helpers.js';

import '../src/typography/truncate.register.js';
import '../src/typography/code-block.register.js';
import '../src/input/image-cropper.register.js';
import '../src/data/data-grid.register.js';
import '../src/content/scroll-indicator.register.js';

const LONG = 'The quick brown fox jumps over the lazy dog. '.repeat(20);

let spy;
beforeEach(() => {
  spy = spyResizeObserver();
});
afterEach(() => {
  spy.restore();
  cleanup();
});

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
  async function truncate(width) {
    const host = mount(`<div style="width:${width}px"><arc-truncate lines="2">${LONG}</arc-truncate></div>`);
    const el = host.querySelector('arc-truncate');
    await settle(el);
    await observed();
    return { host, el };
  }

  it('re-measures on resize while connected', async () => {
    const { host, el } = await truncate(200);
    expect(el._overflows, 'narrow: should overflow').to.equal(true);

    host.style.width = '4000px';
    expect(await until(() => el._overflows === false)).to.equal(true);
  });

  it('keeps re-measuring on resize after a reconnect', async () => {
    const { host, el } = await truncate(200);
    expect(el._overflows).to.equal(true);

    await recycle(el);
    // anti-vacuity: the component is alive and still rendering after the move
    expect(el.shadowRoot.querySelector('[part="content"]')).to.not.equal(null);
    expect(el.isConnected).to.equal(true);

    host.style.width = '4000px';
    expect(await until(() => el._overflows === false)).to.equal(true);
  });

  it('re-observes the target on reconnect rather than holding a dead observer', async () => {
    // The sharpest spelling of the original bug was here: connectedCallback
    // constructed a fresh ResizeObserver — so the code read as reconnect-aware
    // — while the matching observe() sat in firstUpdated and was never reached
    // again, leaving a live observer watching nothing.
    const { el } = await truncate(200);
    expect(spy.observeCalls(el), 'observed once on first render').to.equal(1);

    await recycle(el);

    expect(spy.observeCalls(el), 'observed again on reconnect').to.be.greaterThan(1);
  });
});

describe('arc-code-block reconnect', () => {
  const CODE = 'const aVeryLongIdentifierName = someFunctionCall(withArguments, andMore);';

  it('re-observes its scroller after a reconnect', async () => {
    const host = mount(`<div style="width:200px"><arc-code-block language="js" code="${CODE}"></arc-code-block></div>`);
    const el = host.querySelector('arc-code-block');
    await settle(el);
    await observed();

    expect(spy.observeCalls(el), 'anti-vacuity: observed on first render').to.be.greaterThan(0);
    const before = spy.observeCalls(el);

    await recycle(el);

    expect(el.shadowRoot.querySelector('[part="body"], .code-block__body')).to.not.equal(null);
    expect(spy.observeCalls(el)).to.be.greaterThan(before);
  });
});

describe('arc-image-cropper reconnect', () => {
  it('re-observes its stage after a reconnect', async () => {
    const host = mount('<div style="width:300px"><arc-image-cropper></arc-image-cropper></div>');
    const el = host.querySelector('arc-image-cropper');
    await settle(el);
    await observed();

    expect(spy.observeCalls(el), 'anti-vacuity: observed on first render').to.be.greaterThan(0);
    const before = spy.observeCalls(el);

    await recycle(el);

    expect(el.shadowRoot.querySelector('.stage')).to.not.equal(null);
    expect(spy.observeCalls(el)).to.be.greaterThan(before);
  });
});

describe('arc-data-grid reconnect', () => {
  it('keeps responding to scroll after a reconnect', async () => {
    // Not a ResizeObserver, same lifecycle mistake: the scroll listener was
    // bound in firstUpdated. Recorded separately as finding #54.
    const host = mount('<div><arc-data-grid style="display:block"></arc-data-grid></div>');
    const el = host.querySelector('arc-data-grid');
    el.columns = [{ key: 'a', label: 'A' }];
    el.rows = [{ a: 1 }];
    await settle(el);

    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    wrapper.dispatchEvent(new Event('scroll'));
    expect(el._rafId, 'anti-vacuity: responds while connected').to.not.equal(null);
    await nextFrame();

    await recycle(el);

    // The wrapper survives the move, so this is the same element that was
    // listened to before — a fix that rebound to a *new* wrapper would not
    // satisfy this.
    expect(el.shadowRoot.querySelector('.grid-wrapper')).to.equal(wrapper);
    wrapper.dispatchEvent(new Event('scroll'));
    expect(el._rafId).to.not.equal(null);
    await nextFrame();
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

    window.scrollTo(0, 600);
    expect(await until(() => el._progress > 0), 'tracks before the move').to.equal(true);
    window.scrollTo(0, 0);
    await until(() => el._progress === 0);

    await recycle(el);

    window.scrollTo(0, 600);
    expect(await until(() => el._progress > 0), 'still tracks after the move').to.equal(true);
  });
});
