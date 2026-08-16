/**
 * The scroll-listener group — arc-scroll-spy, arc-top-bar, arc-scroll-to-top,
 * arc-scroll-indicator.
 *
 * Four components that read scroll position directly rather than through an
 * observer. **arc-scroll-spy is not an IntersectionObserver component** despite
 * mentioning one in a comment: it deliberately measures geometry instead,
 * because the observer version took whichever entry the browser happened to list
 * second and settled on the wrong section when scrolling up. That history is why
 * the assertions here scroll a real page rather than stub anything.
 *
 * All four subscribe in `connectedCallback` and unsubscribe in
 * `disconnectedCallback` — both connection-scoped, so unlike findings #55/#64
 * they survive reparenting. The sweep at the bottom is the control that proves
 * it, and the shape a future component should copy.
 *
 * Everything is polled with `until()`: these coalesce through
 * requestAnimationFrame, so the state after `scrollTo` lands a frame later.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, nextFrame, pageWith } from './helpers.js';

import '../src/navigation/scroll-spy.register.js';
import '../src/navigation/spy-link.register.js';
import '../src/navigation/top-bar.register.js';
import '../src/navigation/scroll-to-top.register.js';
import '../src/content/scroll-indicator.register.js';

afterEach(() => cleanup());

/** Scroll the window and let the rAF-coalesced handlers run. */
async function scrollTo(y) {
  window.scrollTo(0, y);
  await nextFrame();
  await nextFrame();
}

const bottom = () => {
  const doc = document.scrollingElement || document.documentElement;
  return doc.scrollHeight - doc.clientHeight;
};

describe('arc-scroll-spy', () => {
  /** Three tall sections plus a spy listing them. */
  function spyPage(attrs = '') {
    return pageWith(
      `<arc-scroll-spy ${attrs}>
         <arc-spy-link target="one">One</arc-spy-link>
         <arc-spy-link target="two">Two</arc-spy-link>
         <arc-spy-link target="three">Three</arc-spy-link>
       </arc-scroll-spy>
       <section id="one" style="height:1000px">One</section>
       <section id="two" style="height:1000px">Two</section>
       <section id="three" style="height:1000px">Three</section>`,
      { below: 400 },
    );
  }

  async function spy(attrs = '') {
    const page = spyPage(attrs);
    const el = page.querySelector('arc-scroll-spy');
    await settle(el);
    await until(() => el.shadowRoot.querySelectorAll('[part~="link"], .scroll-spy__link').length === 3);
    await settle(el);
    return { page, el };
  }

  it('marks the first section on arrival, before any scrolling', async () => {
    // Documented on `updated`: a page opened at a #hash used to leave the
    // highlight on the first heading while the viewport showed the eighth.
    const { el } = await spy();
    expect(await until(() => el.active === 'one')).to.equal(true);
  });

  it('follows the scroll to the next section', async () => {
    const { el } = await spy();
    await scrollTo(1100);
    expect(await until(() => el.active === 'two'), `active was ${el.active}`).to.equal(true);
  });

  it('goes back when scrolling up', async () => {
    // The case the IntersectionObserver version got wrong: entering and leaving
    // fire in one batch and it took whichever was listed second.
    const { el } = await spy();
    await scrollTo(2100);
    await until(() => el.active === 'three');
    await scrollTo(1100);
    expect(await until(() => el.active === 'two'), `active was ${el.active}`).to.equal(true);
  });

  it('moves the line with offset', async () => {
    // Positioned from the section's real offsetTop rather than a guessed scroll
    // distance: the spy itself renders above the sections, so section two does
    // not start at 1000px and a hard-coded scroll silently tests nothing.
    const { el: plain } = await spy();
    const topOfTwo = document.getElementById('two').offsetTop;
    await scrollTo(topOfTwo - 100); // two's top is 100px below the viewport top
    // Polled, not read after two frames. `_measure` is rAF-coalesced, so a bare
    // read races the frame under full-suite load — which is the one shape the
    // conventions in HANDOFF.md single out, and the likeliest candidate for a
    // 1-in-6 failure seen here.
    const stayedOnOne = await until(() => plain.active === 'one');
    cleanup();

    const { el: offset } = await spy('offset="200"');
    await scrollTo(document.getElementById('two').offsetTop - 100);
    const reachedTwo = await until(() => offset.active === 'two');

    expect(stayedOnOne, 'a 0px line already counted section two as current').to.equal(true);
    expect(reachedTwo, 'a 200px line did not reach section two').to.equal(true);
  });

  it('activates the last section once the page bottoms out', async () => {
    // A final section shorter than the remaining viewport never reaches the
    // line, so it could not be highlighted by scrolling at all.
    const { el } = await spy();
    await scrollTo(bottom());
    expect(await until(() => el.active === 'three'), `active was ${el.active}`).to.equal(true);
  });

  it('reports progress through the document', async () => {
    // Read off the ring, which is what `progress` exists to draw. `_progress`
    // is state, and a spy that computed it correctly and stopped drawing it
    // would satisfy an assertion made against the field while showing a reader
    // nothing. `progress="ring"` is on the fixture for the same reason: the
    // number has to have somewhere to land.
    const { el } = await spy('progress="ring"');
    const ring = () => el.shadowRoot.querySelector('.scroll-spy__ring-fill');
    /** dashoffset counts *down* from the full circumference as it fills. */
    const shown = () => {
      const r = ring();
      return 1 - Number(r.getAttribute('stroke-dashoffset')) / Number(r.getAttribute('stroke-dasharray'));
    };

    await scrollTo(0);
    await until(() => shown() === 0);
    const atTop = shown();

    await scrollTo(bottom());
    expect(await until(() => shown() >= 0.99)).to.equal(true);
    expect(atTop).to.equal(0);
  });

  it('announces a change once per section, not per scroll event', async () => {
    const { el } = await spy();
    await until(() => el.active === 'one');

    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));

    await scrollTo(1100);
    await until(() => el.active === 'two');
    await scrollTo(1200);
    await scrollTo(1300);

    expect(seen, 'fired again without the section changing').to.eql(['two']);
  });

  it('reflects active as an attribute so CSS can select it', async () => {
    const { el } = await spy();
    await until(() => el.active === 'one');
    expect(el.getAttribute('active')).to.equal('one');
  });

  it('ignores a link whose target is not on the page', async () => {
    const page = pageWith(
      `<arc-scroll-spy><arc-spy-link target="ghost">Ghost</arc-spy-link></arc-scroll-spy>`,
    );
    const el = page.querySelector('arc-scroll-spy');
    await settle(el);
    expect(el.active, 'a missing target became active').to.equal('');
  });

  it('sets active on click, and updates the URL so a section can be linked', async () => {
    const { el } = await spy();
    const link = el.shadowRoot.querySelector('a');
    link.click();
    await settle(el);

    expect(el.active).to.equal('one');
    expect(location.hash, 'clicking a TOC entry left the URL unchanged').to.equal('#one');
  });

  it('does not announce a click the way it announces a scroll', async () => {
    // Deliberate asymmetry, and the docs scope the event to scrolling: "@fires
    // arc-change — Fired when the active spy target changes during scroll". The
    // click path sets `active` directly and stays silent, so a consumer syncing
    // on the event will not echo back a navigation it just performed. Pinned
    // because it reads as a missing dispatch and is not one.
    const { el } = await spy();
    await scrollTo(1100);
    await until(() => el.active === 'two');

    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));
    el.shadowRoot.querySelectorAll('a')[2].click();
    await settle(el);

    expect(el.active, 'the click did not take').to.equal('three');
    expect(seen, 'the click path announced itself').to.eql([]);
  });
});

describe('arc-top-bar scrolled state', () => {
  async function bar() {
    const page = pageWith('<arc-top-bar></arc-top-bar>', { below: 3000 });
    const el = page.querySelector('arc-top-bar');
    await settle(el);
    return el;
  }

  it('starts unscrolled', async () => {
    await scrollTo(0);
    const el = await bar();
    expect(el.scrolled).to.equal(false);
  });

  it('sets scrolled once past its threshold', async () => {
    const el = await bar();
    await scrollTo(200);
    expect(await until(() => el.scrolled === true)).to.equal(true);
  });

  it('clears it again at the top', async () => {
    const el = await bar();
    await scrollTo(200);
    await until(() => el.scrolled === true);
    await scrollTo(0);
    expect(await until(() => el.scrolled === false)).to.equal(true);
  });

  it('reflects it so `arc-top-bar[scrolled]` works from outside', async () => {
    // The whole reason the prop is `derived: true` rather than internal state.
    const el = await bar();
    await scrollTo(200);
    await until(() => el.scrolled === true);
    expect(el.hasAttribute('scrolled')).to.equal(true);
  });
});

describe('arc-scroll-to-top', () => {
  async function button() {
    const page = pageWith('<arc-scroll-to-top threshold="100"></arc-scroll-to-top>', {
      below: 3000,
    });
    const el = page.querySelector('arc-scroll-to-top');
    await settle(el);
    return el;
  }

  const btn = (el) => el.shadowRoot.querySelector('.scroll-to-top');

  it('is hidden below the threshold', async () => {
    await scrollTo(0);
    const el = await button();
    expect(btn(el).classList.contains('visible')).to.equal(false);
  });

  it('appears once past it', async () => {
    const el = await button();
    await scrollTo(300);
    expect(await until(() => btn(el).classList.contains('visible'))).to.equal(true);
  });

  it('checks the position on connect, not only on the next scroll', async () => {
    // Mounted into an already-scrolled page: without the initial check the
    // button stays hidden until the reader happens to scroll again.
    await scrollTo(0);
    const page = pageWith('<div style="height:3000px"></div>');
    window.scrollTo(0, 500);
    await nextFrame();

    const el = mount('<arc-scroll-to-top threshold="100"></arc-scroll-to-top>');
    await settle(el);
    expect(await until(() => btn(el).classList.contains('visible'))).to.equal(true);
    page.remove();
  });

  it('scrolls back to the top when pressed', async () => {
    const el = await button();
    await scrollTo(500);
    await until(() => btn(el).classList.contains('visible'));

    btn(el).click();
    expect(await until(() => window.scrollY === 0)).to.equal(true);
  });

  it('names itself for screen readers', async () => {
    const el = await button();
    expect(btn(el).getAttribute('aria-label')).to.equal('Scroll to top');
  });
});

describe('arc-scroll-indicator', () => {
  const fill = (el) => el.shadowRoot.querySelector('.bar__fill');
  const bar = (el) => el.shadowRoot.querySelector('.bar');
  /**
   * How far the indicator says it has got, 0–1, read off the fill it draws.
   *
   * The raw `style` attribute rather than the computed transform: this is the
   * number the component wrote, undisturbed by the matrix the browser
   * serialises it to.
   */
  const shown = (el) => Number(/scaleX\(([-\d.]+)\)/.exec(fill(el).getAttribute('style'))[1]);

  async function indicator(attrs = '') {
    const page = pageWith(`<arc-scroll-indicator ${attrs}></arc-scroll-indicator>`, {
      below: 3000,
    });
    const el = page.querySelector('arc-scroll-indicator');
    await settle(el);
    return el;
  }

  it('is empty at the top of the page', async () => {
    await scrollTo(0);
    const el = await indicator();
    expect(await until(() => shown(el) === 0)).to.equal(true);
    expect(fill(el).getAttribute('style')).to.contain('scaleX(0)');
  });

  it('fills as the page scrolls', async () => {
    const el = await indicator();
    await scrollTo(bottom());
    expect(await until(() => shown(el) >= 0.99)).to.equal(true);
  });

  it('exposes itself as a progressbar', async () => {
    await scrollTo(0);
    const el = await indicator();
    expect(bar(el).getAttribute('role')).to.equal('progressbar');
    expect(bar(el).getAttribute('aria-valuemin')).to.equal('0');
    expect(bar(el).getAttribute('aria-valuemax')).to.equal('100');
  });

  it('reports its percentage on aria-valuenow', async () => {
    const el = await indicator();
    await scrollTo(bottom());
    await until(() => shown(el) >= 0.99);
    expect(Number(bar(el).getAttribute('aria-valuenow'))).to.be.greaterThan(95);
  });

  it('tracks a nominated container instead of the window', async () => {
    const page = pageWith(
      `<div id="box" style="height:100px;overflow:auto"><div style="height:1000px"></div></div>
       <arc-scroll-indicator target="#box"></arc-scroll-indicator>`,
    );
    const el = page.querySelector('arc-scroll-indicator');
    await settle(el);

    const box = page.querySelector('#box');
    box.scrollTop = box.scrollHeight - box.clientHeight;
    box.dispatchEvent(new Event('scroll'));

    expect(await until(() => shown(el) >= 0.99)).to.equal(true);
  });

  it('falls back to the window when the selector matches nothing', async () => {
    const el = await indicator('target="#nope"');
    await scrollTo(bottom());
    expect(await until(() => shown(el) >= 0.99)).to.equal(true);
  });

  /**
   * Finding #68. `_detachListener()` calls `_getTarget()`, which **re-resolves
   * the selector at teardown time**. `updated()` runs it after `this.target` has
   * already changed, so it unsubscribes from the *new* element and the old one
   * keeps its listener for the life of the page.
   *
   * Same root cause as #55/#64 from the other end: not a mismatched lifecycle,
   * but teardown that recomputes what to release instead of remembering what it
   * attached to. `ConnectedSubscription` in src/shared/subscriptions.js stores
   * `_target` for exactly this reason.
   */
  it('stops listening to the container it used to track', async () => {
    const page = pageWith(
      `<div id="a" style="height:100px;overflow:auto"><div style="height:1000px"></div></div>
       <div id="b" style="height:100px;overflow:auto"><div style="height:1000px"></div></div>
       <arc-scroll-indicator target="#a"></arc-scroll-indicator>`,
    );
    const el = page.querySelector('arc-scroll-indicator');
    await settle(el);

    // Asserted by watching #a's own removeEventListener, not by watching
    // `_progress`. The stray listener does no *visible* damage — `_updateProgress`
    // re-reads the current target, so a scroll on #a recomputes from #b and the
    // number looks right — which is exactly why this survived: the leak is a
    // retained reference to a detached container and wasted frames, and nothing
    // on screen says so. A progress-based assertion here passes either way.
    const a = page.querySelector('#a');
    const removed = [];
    const realRemove = a.removeEventListener.bind(a);
    a.removeEventListener = (type, ...rest) => {
      removed.push(type);
      return realRemove(type, ...rest);
    };

    el.target = '#b';
    await settle(el);

    expect(removed, 'the old container was never unsubscribed').to.contain('scroll');
  });

});

describe('scroll listeners are connection-scoped', () => {
  /**
   * The control for findings #55 and #64. All four of these subscribe in
   * `connectedCallback` and unsubscribe in `disconnectedCallback` — both run
   * once per *connection*, so they pair, and reparenting is survivable. The
   * components that broke used `firstUpdated`, which runs once per *element*.
   *
   * This is the shape to copy, and the reason it is asserted rather than assumed
   * is that the difference is invisible in every other respect.
   */
  const CASES = [
    ['arc-top-bar', '<arc-top-bar></arc-top-bar>', (el) => el.scrolled === true],
    [
      'arc-scroll-to-top',
      '<arc-scroll-to-top threshold="100"></arc-scroll-to-top>',
      (el) => el.shadowRoot.querySelector('.scroll-to-top').classList.contains('visible'),
    ],
    [
      'arc-scroll-indicator',
      '<arc-scroll-indicator></arc-scroll-indicator>',
      // The drawn fill, for the same reason as the block above: reacting means
      // the bar moved, not that a field did.
      (el) => !/scaleX\(0\)/.test(el.shadowRoot.querySelector('.bar__fill').getAttribute('style')),
    ],
  ];

  for (const [tag, markup, reacted] of CASES) {
    it(`${tag} still reacts after being reparented`, async () => {
      await scrollTo(0);
      const page = pageWith(markup, { below: 3000 });
      const el = page.querySelector(tag);
      await settle(el);

      await scrollTo(400);
      expect(await until(() => reacted(el)), `${tag} never reacted to begin with`).to.equal(true);

      await scrollTo(0);
      await until(() => !reacted(el));

      el.remove();
      await nextFrame();
      page.appendChild(el);
      await settle(el);

      await scrollTo(400);
      expect(await until(() => reacted(el)), `${tag} stopped reacting after a reconnect`).to.equal(
        true,
      );
    });
  }
});
