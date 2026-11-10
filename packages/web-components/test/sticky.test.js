/**
 * arc-sticky with a non-zero offset.
 *
 * The offset="0px" cases live in intersection-observers.test.js. These cover
 * the bug those missed: the sentinel sits 1px above the host, so when the host
 * sticks at `top: 64px` the sentinel sits at 63px, still inside the viewport,
 * and an observer on the plain viewport never saw it leave. `stuck` and
 * `arc-stuck` only ever worked at offset 0.
 *
 * Real observers and real scrolling, as in the shared file.
 */
import { expect } from '@esm-bundle/chai';
import { cleanup, settle, until, observed, pageWith } from './helpers.js';

import '../src/layout/sticky.register.js';

afterEach(() => {
  cleanup();
  window.scrollTo(0, 0);
});

async function mount(attrs) {
  const page = pageWith(`<arc-sticky ${attrs}>header</arc-sticky>`, { above: 200, below: 2000 });
  const el = page.querySelector('arc-sticky');
  await settle(el);
  await observed();
  return el;
}

describe('arc-sticky offset', () => {
  it('reports stuck at a 64px offset', async () => {
    const el = await mount('offset="64px"');
    const seen = [];
    el.addEventListener('arc-stuck', (e) => seen.push(e.detail.stuck));

    expect(el.stuck, 'stuck before it reached its offset').to.equal(false);

    window.scrollTo(0, 600);
    const stuck = await until(() => el.stuck === true);

    expect(stuck, 'never became stuck at offset 64px').to.equal(true);
    expect(el.getBoundingClientRect().top, 'host sits at its offset').to.be.closeTo(64, 1);
    expect(el.hasAttribute('stuck')).to.equal(true);
    expect(seen).to.deep.equal([true]);

    window.scrollTo(0, 0);
    await until(() => el.stuck === false);
    expect(seen, 'announced the return').to.deep.equal([true, false]);
  });

  it('is not stuck while scrolled short of the offset', async () => {
    // Host starts at y=200. Scrolling 100px puts it at y=100, still 36px below
    // a 64px offset, so it has not stuck yet.
    const el = await mount('offset="64px"');
    window.scrollTo(0, 100);
    await observed();
    await until(() => el.stuck === true, { timeout: 300 });
    expect(el.stuck, 'reported stuck before reaching its offset').to.equal(false);
  });

  it('resolves a non-pixel offset', async () => {
    const el = await mount('offset="4rem"');
    window.scrollTo(0, 600);
    expect(await until(() => el.stuck === true), 'never stuck at 4rem').to.equal(true);
  });

  it('follows an offset changed after it connected', async () => {
    const el = await mount('offset="0px"');
    el.offset = '64px';
    await settle(el);
    await observed();

    window.scrollTo(0, 600);
    expect(await until(() => el.stuck === true), 'never stuck at the new offset').to.equal(true);
    expect(el.getBoundingClientRect().top).to.be.closeTo(64, 1);
  });
});
