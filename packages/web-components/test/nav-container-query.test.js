/**
 * arc-navigation-menu collapses on its own width, not the viewport's.
 *
 * V4-PLAN 4.4's container-query row, and the reason it names this component
 * first: the desktop bar was gated on `@media (max-width: 900px)`, so whether
 * it rendered depended on the size of the browser window running the test. A
 * suite cannot resize the window, so the desktop bar was **untestable** —
 * every assertion about it was really an assertion about the machine's screen,
 * and passed or failed accordingly.
 *
 * A container query moves the gate onto the component. A test can set the
 * component's width, which is what makes this file possible at all.
 */
import { expect } from '@esm-bundle/chai';
import '../src/navigation/navigation-menu.register.js';
import { breakpoints } from '../src/generated/breakpoints.js';
import { mount, cleanup, settle } from './helpers.js';

/* navFit, not navCollapse. The two tokens split when the collapse moved onto
 * the container: navCollapse (900) stays the viewport point where the mobile
 * affordances begin, and navFit is the width below which the pill row itself
 * no longer fits. Deriving the widths from the token is what keeps this file
 * from asserting a number the source has moved past — which is exactly how
 * its first version went stale. */
const FIT = breakpoints.navFit;

afterEach(cleanup);

/** Mount the nav inside a box of a known width. */
async function navAt(width) {
  const box = mount(`
    <div style="width: ${width}px">
      <arc-navigation-menu label="Main">
        <a href="/a" data-label="Alpha">Alpha</a>
        <a href="/b" data-label="Bravo">Bravo</a>
      </arc-navigation-menu>
    </div>
  `);
  const el = box.querySelector('arc-navigation-menu');
  await settle(el);
  return el;
}

const desktopBar = (el) => el.shadowRoot.querySelector('.nav');

describe('arc-navigation-menu: the component is the unit', () => {
  it('shows the desktop bar when the component is wide', async () => {
    const el = await navAt(1200);
    expect(getComputedStyle(desktopBar(el)).display).to.not.equal('none');
  });

  it('hides the desktop bar when the component is narrow', async () => {
    // The assertion the viewport gate could never make on a wide screen.
    const el = await navAt(FIT - 80);
    expect(getComputedStyle(desktopBar(el)).display).to.equal('none');
  });

  it('collapses at the token width, not near it', async () => {
    // `tokens.breakpoint.navFit`, kept in step by
    // scripts/checks/breakpoint-drift.js. `max-width` includes the boundary.
    const narrow = await navAt(FIT);
    expect(getComputedStyle(desktopBar(narrow)).display, 'at the breakpoint').to.equal('none');
    cleanup();

    const wide = await navAt(FIT + 1);
    expect(getComputedStyle(desktopBar(wide)).display, 'one pixel past it').to.not.equal('none');
  });

  it('contains only the desktop bar', async () => {
    // Containment is public: `container-type: inline-size` implies `contain:
    // layout style inline-size`, and on `:host` that lands on the custom
    // element a consumer wrote. The container wraps the one thing the query is
    // about and nothing else, which is what this pins — the cheap way for that
    // to rot is someone moving markup inside the wrapper because it is there.
    const el = await navAt(1200);
    const container = el.shadowRoot.querySelector('.nav__container');
    expect(container, 'the container renders').to.not.equal(null);
    expect(container.children).to.have.lengthOf(1);
    expect(container.firstElementChild).to.equal(desktopBar(el));
  });

  it('measures the component, not the window, when deciding to close', async () => {
    // The JS half of the same gate. It used to read `window.innerWidth`, so a
    // nav in a narrow column had its desktop bar hidden by CSS while the JS,
    // reading a wide viewport, insisted the mobile panel should close —
    // leaving no navigation at all. Both halves ask the same element now.
    const el = await navAt(500);
    el._mobileOpen = true;
    el._onResize();
    expect(el._mobileOpen, 'a narrow component keeps its mobile panel').to.equal(true);
  });
});
