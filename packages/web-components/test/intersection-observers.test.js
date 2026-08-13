/**
 * The IntersectionObserver components — arc-sticky, arc-infinite-scroll and
 * arc-anchor-nav.
 *
 * arc-scroll-spy looks like a fourth and is not: it drives off a document
 * scroll listener, and only mentions IntersectionObserver in a comment. It is
 * covered with the scroll-listener components instead.
 *
 * Three components wrap the same browser API for three different purposes, and
 * they share the failure modes that come with it: an observer that never
 * disconnects, a sentinel that is never observed, and a callback that fires on
 * the initial observation rather than on a real crossing.
 *
 * The observers are real. Nothing here stubs `IntersectionObserver`, because a
 * stub asserts our idea of when the browser delivers rather than the browser's
 * — and the whole reason this suite runs in Chromium is that the browser's
 * answer is the one that ships. The cost is that the assertions have to be
 * written against real page layout and real scrolling, which is what
 * `pageWith()` in helpers.js is for.
 *
 * Timing is polled via `until()` rather than slept: a fixed wait encodes a
 * guess about machine load, and that guess is what made carousel's auto-play
 * test flake roughly 2 runs in 6 under full-suite load.
 */
import { expect } from '@esm-bundle/chai';
import {
  cleanup,
  settle,
  until,
  observed,
  pageWith,
  nextFrame,
  spyIntersectionObserver,
} from './helpers.js';

import '../src/layout/sticky.register.js';
import '../src/content/infinite-scroll.register.js';
import '../src/navigation/anchor-nav.register.js';

afterEach(() => cleanup());

/**
 * Every component in this file, for the shared teardown contract.
 *
 * `watched` exists for arc-anchor-nav, which observes document *sections* by id
 * rather than anything inside itself — so the host-scoped count reads zero and a
 * teardown assertion silently proves nothing. Its old fixture had no sections at
 * all, and the test passed the whole time on `_observer != null`: an observer
 * object existed while observing nothing.
 */
const OBSERVERS = [
  { tag: 'arc-sticky', markup: '<arc-sticky offset="0px">stuck me</arc-sticky>' },
  { tag: 'arc-infinite-scroll', markup: '<arc-infinite-scroll>rows</arc-infinite-scroll>' },
  {
    tag: 'arc-anchor-nav',
    markup:
      '<section id="one">One</section><section id="two">Two</section>' +
      '<arc-anchor-nav><arc-anchor-nav-item value="one">One</arc-anchor-nav-item>' +
      '<arc-anchor-nav-item value="two">Two</arc-anchor-nav-item></arc-anchor-nav>',
    watched: (page) => [...page.querySelectorAll('section')],
  },
];

describe('IntersectionObserver teardown', () => {
  // The leak this catches is invisible in a page that never unmounts and
  // obvious in an app that routes: an observer holding a detached element keeps
  // it, its shadow root and its listeners alive for the life of the document.
  for (const { tag, markup, watched } of OBSERVERS) {
    it(`${tag} stops observing when removed`, async () => {
      // Asserted through the mechanism rather than through a component's
      // `_observer` field. The field version broke the moment
      // arc-infinite-scroll moved onto the shared subscription controller and
      // stopped holding an observer of its own — it had become *more* correct
      // and the test went red, which is a test coupled to a name (finding #64).
      const spy = spyIntersectionObserver();
      try {
        const page = pageWith(markup);
        const el = page.querySelector(tag);
        await settle(el);
        await observed();

        const targets = watched?.(page) ?? null;
        const observing = () =>
          targets ? targets.filter((t) => spy.isObserved(t)).length : spy.liveCount(el);

        if (targets) {
          expect(targets.length, `${tag} fixture has nothing to observe`).to.be.greaterThan(0);
        }
        expect(observing(), `${tag} never observed anything to leak`).to.be.greaterThan(0);

        el.remove();
        await nextFrame();

        expect(observing(), `${tag} is still observing after removal`).to.equal(0);
      } finally {
        spy.restore();
      }
    });
  }
});

describe('arc-anchor-nav scroll spy', () => {
  /**
   * Finding #65. `_setupObserver()` built an IntersectionObserver and nothing
   * ever called `observe()` on it, so the documented active-link highlight moved
   * only on click and never on scroll — the feature had never worked.
   *
   * It survived because the one test touching the observer asked whether an
   * observer *object* existed. That is the whole lesson: assert the mechanism
   * is doing something, not that it was constructed.
   */
  function spyPage() {
    return pageWith(
      '<arc-anchor-nav><arc-anchor-nav-item value="alpha">Alpha</arc-anchor-nav-item>' +
        '<arc-anchor-nav-item value="beta">Beta</arc-anchor-nav-item></arc-anchor-nav>' +
        '<section id="alpha" style="height:900px">Alpha</section>' +
        '<section id="beta" style="height:900px">Beta</section>',
      { below: 1200 },
    );
  }

  it('observes the section each item points at', async () => {
    const spy = spyIntersectionObserver();
    try {
      const page = spyPage();
      const el = page.querySelector('arc-anchor-nav');
      await settle(el);
      await observed();
      expect(spy.isObserved(page.querySelector('#alpha')), 'alpha unwatched').to.equal(true);
      expect(spy.isObserved(page.querySelector('#beta')), 'beta unwatched').to.equal(true);
    } finally {
      spy.restore();
    }
  });

  it('moves value to the section scrolled into view', async () => {
    const page = spyPage();
    const el = page.querySelector('arc-anchor-nav');
    await settle(el);
    await observed();

    page.querySelector('#beta').scrollIntoView({ block: 'center' });

    expect(
      await until(() => el.value === 'beta'),
      'the active link never followed the scroll',
    ).to.equal(true);
  });

  it('announces the change so a consumer can follow it', async () => {
    const page = spyPage();
    const el = page.querySelector('arc-anchor-nav');
    await settle(el);
    await observed();

    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));

    page.querySelector('#beta').scrollIntoView({ block: 'center' });
    await until(() => seen.includes('beta'));

    expect(seen, 'no arc-change for a scroll-driven activation').to.contain('beta');
  });

  it('ignores an item whose section is not on the page', async () => {
    // _observeSections skips a missing id rather than throwing, so a nav can
    // name a section that has not rendered yet.
    const page = pageWith(
      '<arc-anchor-nav><arc-anchor-nav-item value="ghost">Ghost</arc-anchor-nav-item></arc-anchor-nav>',
    );
    const el = page.querySelector('arc-anchor-nav');
    await settle(el);
    expect(el.value).to.equal('');
  });
});

describe('arc-sticky', () => {
  it('reports stuck when its sentinel leaves the top of the scroller', async () => {
    const page = pageWith('<arc-sticky offset="0px">header</arc-sticky>', { below: 2000 });
    const el = page.querySelector('arc-sticky');
    await settle(el);
    await observed();

    const seen = [];
    el.addEventListener('arc-stuck', (e) => seen.push(e.detail.stuck));

    expect(el.stuck, 'not stuck while its sentinel is in view').to.equal(false);

    window.scrollTo(0, 600);
    const stuck = await until(() => el.stuck === true);

    expect(stuck, 'never became stuck after scrolling past it').to.equal(true);
    expect(seen, 'announced the transition once').to.deep.equal([true]);
    expect(el.hasAttribute('stuck'), '[stuck] reflects so CSS can select it').to.equal(true);
  });

  it('announces the return, and only on a change', async () => {
    const page = pageWith('<arc-sticky offset="0px">header</arc-sticky>', { below: 2000 });
    const el = page.querySelector('arc-sticky');
    await settle(el);
    await observed();

    const seen = [];
    el.addEventListener('arc-stuck', (e) => seen.push(e.detail.stuck));

    window.scrollTo(0, 600);
    await until(() => el.stuck === true);
    window.scrollTo(0, 640); // still stuck — must not re-announce
    await observed();
    window.scrollTo(0, 0);
    await until(() => el.stuck === false);

    expect(seen, 'one event per actual transition').to.deep.equal([true, false]);
  });
});

describe('arc-infinite-scroll', () => {
  /** Mount below the fold so the sentinel starts outside the viewport. */
  const mountBelow = async (attrs = '') => {
    const page = pageWith(`<arc-infinite-scroll ${attrs}>rows</arc-infinite-scroll>`, {
      above: 2000,
      below: 1200,
    });
    const el = page.querySelector('arc-infinite-scroll');
    await settle(el);
    await observed();
    return { page, el };
  };

  it('asks for more when the sentinel comes into view', async () => {
    const { el } = await mountBelow();
    let calls = 0;
    el.addEventListener('arc-load-more', () => (calls += 1));

    el.scrollIntoView({ block: 'center' });
    const asked = await until(() => calls > 0);

    expect(asked, 'never fired arc-load-more when scrolled to the sentinel').to.equal(true);
  });

  it('stays quiet while loading', async () => {
    // The guard that stops a scroll from queueing a second page on top of the
    // one already in flight.
    const { el } = await mountBelow('loading');
    let calls = 0;
    el.addEventListener('arc-load-more', () => (calls += 1));

    el.scrollIntoView({ block: 'center' });
    await observed();
    await until(() => calls > 0, { timeout: 300 });

    expect(calls, 'asked for more while a load was already in flight').to.equal(0);
  });

  for (const state of ['finished', 'disabled']) {
    it(`does not observe at all when ${state}`, async () => {
      // Both halves matter: it must be silent *and* not watching. Silence alone
      // would also be satisfied by an observer that fires into a guard, which is
      // what this component used to do before the state was expressed by the
      // target resolver returning null.
      const spy = spyIntersectionObserver();
      try {
        const { el } = await mountBelow(state);
        let calls = 0;
        el.addEventListener('arc-load-more', () => (calls += 1));

        el.scrollIntoView({ block: 'center' });
        await observed();
        await until(() => calls > 0, { timeout: 300 });

        expect(spy.liveCount(el), `${state} should stop the observation`).to.equal(0);
        expect(calls, `asked for more while ${state}`).to.equal(0);
      } finally {
        spy.restore();
      }
    });
  }

  it('resumes observing when loading clears', async () => {
    const { el } = await mountBelow('loading');
    let calls = 0;
    el.addEventListener('arc-load-more', () => (calls += 1));

    el.loading = false;
    await settle(el);
    el.scrollIntoView({ block: 'center' });
    const asked = await until(() => calls > 0);

    expect(asked, 'stayed silent after loading cleared').to.equal(true);
  });
});
