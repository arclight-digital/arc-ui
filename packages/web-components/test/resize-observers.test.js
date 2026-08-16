/**
 * The ResizeObserver components — arc-truncate, arc-marquee, arc-code-block,
 * arc-toolbar.
 *
 * All four measure themselves and re-render from the result, which is the
 * pattern most likely to produce the "scheduled an update after an update
 * completed" warning, an observation loop, or a stale measurement that only
 * shows up at a width nobody tested.
 *
 * Real observers again, and real width changes — a stubbed ResizeObserver would
 * assert our idea of when the browser delivers a resize, and the browser's is
 * the one that ships. `observed()` covers observation → callback → the render
 * the callback schedules.
 *
 * The measurement assertions are written as direction-of-travel rather than
 * exact geometry, following level-meter.test.js: the numbers depend on the
 * default font and the runner's viewport, and pinning them would make this file
 * fail for reasons that have nothing to do with the components.
 */
import { expect } from '@esm-bundle/chai';
import {
  mount,
  cleanup,
  settle,
  observed,
  until,
  nextFrame,
  spyResizeObserver,
} from './helpers.js';

import '../src/typography/truncate.register.js';
import '../src/content/marquee.register.js';
import '../src/typography/code-block.register.js';
import '../src/layout/toolbar.register.js';

afterEach(() => cleanup());

const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor '
  + 'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud '
  + 'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const RESIZERS = [
  ['arc-truncate', `<arc-truncate lines="2" style="display:block;width:300px">${LONG}</arc-truncate>`],
  ['arc-marquee', `<arc-marquee style="display:block;width:300px">${LONG}</arc-marquee>`],
  ['arc-code-block', `<arc-code-block language="js" style="display:block;width:300px">const x = 1;</arc-code-block>`],
  // arc-toolbar only observes when `overflow` is on — without it there is no
  // observer to tear down, and the case would test nothing.
  ['arc-toolbar', `<arc-toolbar overflow style="display:block;width:300px"><button>a</button></arc-toolbar>`],
];

describe('ResizeObserver teardown', () => {
  let spy;
  beforeEach(() => {
    spy = spyResizeObserver();
  });
  afterEach(() => spy.restore());

  for (const [tag, markup] of RESIZERS) {
    it(`${tag} stops observing when removed`, async () => {
      const el = mount(markup);
      await settle(el);
      await observed();

      // Anti-vacuity: if the component never observed anything, the assertion
      // below passes without testing anything.
      expect(spy.liveCount(el), `${tag} never observed anything`).to.be.greaterThan(0);

      el.remove();
      await nextFrame();

      expect(spy.liveCount(el), `${tag} is still observing after removal`).to.equal(0);
    });
  }
});

describe('ResizeObserver components re-measure on width change', () => {
  // The shared claim: a width change reaches the component. Asserted through
  // whatever each one publishes rather than through the observer itself, since
  // "did you re-measure" is only meaningful if something observable changed.
  it('arc-truncate re-evaluates overflow when the box narrows', async () => {
    const el = mount(`<arc-truncate lines="2" style="display:block;width:900px">${LONG}</arc-truncate>`);
    await settle(el);
    await observed();

    const toggle = () => el.shadowRoot.querySelector('[part="toggle"], button');
    const wideHasToggle = toggle() !== null;

    el.style.width = '120px';
    await observed();
    const narrowHasToggle = await until(() => toggle() !== null);

    // At 900px the text may or may not overflow two lines depending on the
    // runner's font; at 120px it certainly does. Assert the direction, and that
    // the narrow case is not merely inheriting the wide one.
    expect(narrowHasToggle, 'no expand affordance once the text is clamped').to.equal(true);
    expect(
      [wideHasToggle, narrowHasToggle],
      'narrowing must not lose the toggle',
    ).to.not.deep.equal([true, false]);
  });

  it('arc-marquee derives its duration from content width and speed', async () => {
    const el = mount(`<arc-marquee speed="50" style="display:block;width:600px">${LONG}</arc-marquee>`);
    await settle(el);
    await observed();

    // Worth stating, because the obvious test is wrong: the duration is
    // `group.scrollWidth / speed` (marquee.js:126) — the *content* width, not
    // the host's. The content is a nowrap group, so narrowing the host does not
    // change it, and a test asserting that it does is asserting a bug.
    // Read off the custom property the track carries, which is where the
    // duration actually drives the animation. `_animDuration` is state, and a
    // marquee that computed it and stopped writing it would scroll at the
    // 10s default while every assertion against the field passed.
    const duration = () =>
      el.shadowRoot.querySelector('[part="track"]').style.getPropertyValue('--marquee-duration');

    const slow = duration();
    expect(slow, 'a duration is computed at all').to.match(/^[\d.]+s$/);

    el.style.width = '150px';
    await observed();
    expect(duration(), 'host width must not change the scroll duration').to.equal(slow);

    el.speed = 200;
    await settle(el);
    const faster = await until(() => duration() !== slow);
    expect(faster, 'quadrupling speed did not shorten the duration').to.equal(true);
    expect(parseFloat(duration())).to.be.below(parseFloat(slow));
  });

  // NOT COVERED: arc-code-block's re-measure on resize.
  //
  // Its teardown is covered above, but `_overflows` (code-block.js:413) never
  // flipped when the host was narrowed from 900px to 140px, despite the body
  // being `white-space: pre`. The measurement appears to be gated behind
  // `_highlight()`, which wants a `code` property and the shiki grammar rather
  // than slotted text — so the probe was very likely never measuring rendered
  // code at all.
  //
  // Left uncovered rather than guessed at: an assertion written against a setup
  // I could not confirm is worth less than a recorded gap. Needs a session with
  // the highlighting path understood. See test-findings.md.

  it('arc-toolbar moves items into the overflow menu when the bar narrows', async () => {
    const el = mount(`
      <arc-toolbar overflow style="display:block;width:900px">
        <button>alpha</button><button>bravo</button><button>charlie</button>
        <button>delta</button><button>echo</button><button>foxtrot</button>
      </arc-toolbar>
    `);
    await settle(el);
    await observed();

    // The rendered overflow menu, not the array behind it: "moves items into
    // the overflow menu" is a claim about what the toolbar draws.
    const overflowing = () => el.shadowRoot.querySelectorAll('.overflow__item').length;
    expect(overflowing(), 'nothing overflows at full width').to.equal(0);

    el.style.width = '120px';
    await observed();
    const collapsed = await until(() => overflowing() > 0);

    expect(collapsed, 'no items moved into the overflow menu at 120px').to.equal(true);
  });
});
