/**
 * arc-infinite-scroll `threshold`.
 *
 * The rest of the component is covered in intersection-observers.test.js. This
 * file is for the prop that never worked: the rootMargin was built in the
 * constructor, before any attribute had landed, and the shared observer read
 * its options once, so every instance used the 200px default whatever
 * `threshold` said.
 *
 * Real observers and real scrolling. Each test parks the sentinel a known
 * distance below the bottom of the viewport and asks whether that distance is
 * inside or outside the threshold.
 */
import { expect } from '@esm-bundle/chai';
import { cleanup, settle, until, observed, pageWith } from './helpers.js';

import '../src/content/infinite-scroll.register.js';

afterEach(() => {
  cleanup();
  window.scrollTo(0, 0);
});

async function mount(attrs = '') {
  const page = pageWith(`<arc-infinite-scroll ${attrs}>rows</arc-infinite-scroll>`, {
    above: 3000,
    below: 3000,
  });
  const el = page.querySelector('arc-infinite-scroll');
  await settle(el);
  await observed();
  const calls = { n: 0 };
  el.addEventListener('arc-load-more', () => (calls.n += 1));
  return { el, calls };
}

/** Scroll so the sentinel's top sits `gap` px below the bottom of the viewport. */
async function parkSentinel(el, gap) {
  const sentinel = el.shadowRoot.querySelector('.infinite-scroll__sentinel');
  const top = sentinel.getBoundingClientRect().top;
  window.scrollBy(0, top - (window.innerHeight + gap));
  await observed();
}

describe('arc-infinite-scroll threshold', () => {
  it('fires from further away with a larger threshold attribute', async () => {
    const { el, calls } = await mount('threshold="600"');
    await parkSentinel(el, 400);
    expect(
      await until(() => calls.n > 0),
      'sentinel 400px out did not fire with threshold="600"',
    ).to.equal(true);
  });

  it('holds off until closer with a smaller threshold attribute', async () => {
    const { el, calls } = await mount('threshold="0"');
    await parkSentinel(el, 100);
    await until(() => calls.n > 0, { timeout: 300 });
    expect(calls.n, 'sentinel 100px out fired with threshold="0"').to.equal(0);
  });

  it('still uses 200px by default', async () => {
    const { el, calls } = await mount();
    await parkSentinel(el, 100);
    expect(await until(() => calls.n > 0), '100px out did not fire at the default').to.equal(true);
  });

  it('follows a threshold changed after it connected', async () => {
    const { el, calls } = await mount('threshold="0"');
    await parkSentinel(el, 400);
    await until(() => calls.n > 0, { timeout: 300 });
    expect(calls.n, 'fired before the threshold grew').to.equal(0);

    el.threshold = 600;
    await settle(el);
    expect(await until(() => calls.n > 0), 'new threshold never applied').to.equal(true);
  });
});
