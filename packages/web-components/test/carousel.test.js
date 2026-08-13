/**
 * arc-carousel — the slide deck.
 *
 * What this pins: slides come from the default slot, next/prev wrap when `loop`
 * and clamp when not, the dots are a tablist that navigates directly,
 * arc-change carries the slide index on detail.value, and auto-play advances on
 * its timer, pauses on hover and focus, stands down under reduced motion and
 * stops on disconnect.
 *
 * The auto-play assertions run on real timers at a deliberately short interval
 * and assert direction of travel rather than an exact slide, following the
 * pattern in level-meter.test.js — the timer is real, so the count is not
 * something to pin precisely.
 *
 * One test is marked BUG: at the rails of a non-looping carousel the guard in
 * _goTo lets a no-op through and announces a change that did not happen.
 * See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, wait, until, record, stubReducedMotion } from './helpers.js';

import '../src/content/carousel.register.js';

let restoreMotion = null;

afterEach(() => {
  restoreMotion?.();
  restoreMotion = null;
  cleanup();
});

const SLIDES = `
  <div>Slide one</div>
  <div>Slide two</div>
  <div>Slide three</div>
`;

async function carousel(attrs = '', slides = SLIDES) {
  const el = mount(`<arc-carousel ${attrs}>${slides}</arc-carousel>`);
  await settle(el);
  return el;
}

const dots = (el) => [...el.shadowRoot.querySelectorAll('[part="dot"]')];
const prevArrow = (el) => el.shadowRoot.querySelector('[part="arrow-prev"]');
const nextArrow = (el) => el.shadowRoot.querySelector('[part="arrow-next"]');
const viewport = (el) => el.shadowRoot.querySelector('[part="viewport"]');
/** The listeners for hover/focus pausing live on the region, not on the host. */
const region = (el) => el.shadowRoot.querySelector('[part="carousel"]');

describe('arc-carousel rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await carousel('show-dots show-arrows');
    for (const part of ['carousel', 'viewport', 'arrow-prev', 'arrow-next', 'dots', 'dot']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('projects its slides', async () => {
    const el = await carousel();
    const assigned = el.shadowRoot.querySelector('slot').assignedElements();
    expect(assigned).to.have.lengthOf(3);
    expect(assigned[0].textContent).to.equal('Slide one');
  });

  it('announces itself as a carousel region', async () => {
    const el = await carousel();
    const region = el.shadowRoot.querySelector('[part="carousel"]');
    expect(region.getAttribute('role')).to.equal('region');
    expect(region.getAttribute('aria-roledescription')).to.equal('carousel');
  });

  it('gives the viewport a tab stop so the arrow keys have a home', async () => {
    const el = await carousel();
    expect(viewport(el).getAttribute('tabindex')).to.equal('0');
  });

  it('renders one dot per slide, as a tablist', async () => {
    const el = await carousel('show-dots');
    expect(dots(el)).to.have.lengthOf(3);
    expect(el.shadowRoot.querySelector('[part="dots"]').getAttribute('role')).to.equal('tablist');
    expect(dots(el).map((d) => d.getAttribute('aria-selected')))
      .to.deep.equal(['true', 'false', 'false']);
  });

  it('shows dots and arrows by default', async () => {
    const el = await carousel();
    expect(el.showDots).to.equal(true);
    expect(el.showArrows).to.equal(true);
    expect(dots(el)).to.have.lengthOf(3);
    expect(prevArrow(el) === null, 'arrows are on by default').to.equal(false);
  });

  it('hides them when the property is set from script', async () => {
    const el = await carousel();
    el.showDots = false;
    el.showArrows = false;
    await settle(el);

    expect(dots(el)).to.have.lengthOf(0);
    expect(prevArrow(el) === null).to.equal(true);
  });

  // BUG: showDots and showArrows are `type: Boolean` props that default to true
  // (carousel.js:155-156). Lit's boolean converter maps attribute *presence* to
  // true, and an absent attribute never fires attributeChangedCallback, so the
  // constructor default stands. `show-dots="false"` is an attribute that is
  // present, so it reads as true — and there is no attribute value that reads
  // as false. The chrome cannot be turned off from markup at all, only from
  // script, which rules out static HTML, the docs' own examples, and every
  // framework wrapper that passes booleans through as attributes.
  // Was pinned as a BUG. Fixed by declaring these as flag(true, { negative }) —
  // see shared/props.js and findings #20, #48, #49.
  it('show-dots="false" turns the dots off, and show-arrows="false" the arrows', async () => {
    const el = await carousel('show-dots="false" show-arrows="false"');

    expect(el.showDots).to.equal(false);
    expect(dots(el), 'no dots render').to.have.lengthOf(0);
    expect(prevArrow(el) === null, 'no arrows render').to.equal(true);
  });

  it('the negative attribute turns them off too, and round-trips', async () => {
    const el = await carousel('no-dots');
    expect(el.showDots).to.equal(false);
    expect(dots(el)).to.have.lengthOf(0);

    // The state has a markup representation, so it survives serialisation —
    // which presence-only reflection could not express at all.
    el.showArrows = false;
    await settle(el);
    expect(el.outerHTML).to.contain('no-arrows');
  });

  it('survives having no slides at all', async () => {
    const el = await carousel('show-dots show-arrows', '');
    expect(dots(el)).to.have.lengthOf(0);
    expect(viewport(el)).to.not.equal(null);
  });
});

describe('arc-carousel navigation', () => {
  it('advances and retreats with the arrows', async () => {
    const el = await carousel('show-arrows');

    nextArrow(el).click();
    await settle(el);
    expect(el._current).to.equal(1);

    prevArrow(el).click();
    await settle(el);
    expect(el._current).to.equal(0);
  });

  it('announces the new index on detail.value', async () => {
    const el = await carousel('show-arrows');
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    nextArrow(el).click();
    await settle(el);

    expect(details).to.deep.equal([{ value: 1, index: 1 }]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await carousel('show-arrows');
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    nextArrow(el).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('wraps at both ends when looping', async () => {
    const el = await carousel('show-arrows loop');

    prevArrow(el).click();
    await settle(el);
    expect(el._current, 'first → last').to.equal(2);

    nextArrow(el).click();
    await settle(el);
    expect(el._current, 'last → first').to.equal(0);
  });

  it('clamps at both ends when not looping', async () => {
    const el = await carousel('show-arrows loop="false"');
    el.loop = false;
    await settle(el);

    prevArrow(el).click();
    await settle(el);
    expect(el._current, 'held at the first slide').to.equal(0);

    for (let i = 0; i < 5; i++) {
      nextArrow(el).click();
      await settle(el);
    }
    expect(el._current, 'held at the last slide').to.equal(2);
  });

  it('navigates directly from a dot, and moves the selection with it', async () => {
    const el = await carousel('show-dots');

    dots(el)[2].click();
    await settle(el);

    expect(el._current).to.equal(2);
    expect(dots(el).map((d) => d.getAttribute('aria-selected')))
      .to.deep.equal(['false', 'false', 'true']);
  });

  it('stays silent when the current dot is clicked again', async () => {
    const el = await carousel('show-dots');
    const seen = record(el, ['arc-change']);

    dots(el)[0].click();
    await settle(el);

    expect(seen, 'no movement, no announcement').to.deep.equal([]);
  });

  it('disables the arrow that would run off the end when not looping', async () => {
    const el = await carousel('show-arrows');
    el.loop = false;
    await settle(el);

    expect(prevArrow(el).disabled, 'nothing before the first slide').to.equal(true);
    expect(nextArrow(el).disabled).to.equal(false);
  });

  // BUG: the no-op guard in _goTo (carousel.js:199) is
  // `if (next === this._current && index === next) return;`. When clamping
  // changes the index the second condition is false, so the guard does not
  // fire: _goTo re-assigns the same index, scrolls again, and announces a
  // change that did not happen.
  //
  // The arrow buttons are `?disabled` at the rails (carousel.js:313, 320), so
  // that path is safe. _onKeydown (carousel.js:270) has no such guard — it
  // calls _prev()/_next() directly — so the keyboard reaches it.
  it('BUG: an arrow key at the rails announces a change that did not happen', async () => {
    const el = await carousel();
    el.loop = false;
    await settle(el);

    const seen = record(el, ['arc-change']);
    keyOn(viewport(el), 'ArrowLeft');
    await settle(el);

    expect(el._current, 'the slide did not move').to.equal(0);
    expect(seen, 'but a change was announced anyway').to.deep.equal([['change', 0]]);
  });
});

describe('arc-carousel keyboard', () => {
  it('walks with the inline arrows', async () => {
    const el = await carousel();

    keyOn(viewport(el), 'ArrowRight');
    await settle(el);
    expect(el._current).to.equal(1);

    keyOn(viewport(el), 'ArrowLeft');
    await settle(el);
    expect(el._current).to.equal(0);
  });

  it('claims the keys it handles and leaves the rest', async () => {
    const el = await carousel();

    const handled = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    viewport(el).dispatchEvent(handled);
    await settle(el);
    expect(handled.defaultPrevented).to.equal(true);

    const before = el._current;
    const ignored = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    viewport(el).dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented).to.equal(false);
    expect(el._current).to.equal(before);
  });
});

describe('arc-carousel auto-play', () => {
  it('advances on its own', async () => {
    restoreMotion = stubReducedMotion(false);
    const el = await carousel('auto-play interval="30" loop');

    // Poll rather than sleep a fixed 120ms. The old form asserted after four
    // nominal intervals, which sounds generous and is not: a real setInterval
    // competing with the rest of the suite for the main thread misses that
    // window occasionally, and the failure reads as "auto-play is broken"
    // rather than "the machine was busy". Observed ~2 in 6 full-suite runs
    // under load. What the test means is "it advances without help", so wait
    // for that rather than for the clock.
    const advanced = await until(() => el._current !== 0, { timeout: 1500 });

    expect(advanced, 'the deck moved by itself within 1.5s').to.equal(true);
    expect(el._current, 'and landed on a real slide').to.be.greaterThan(0);
  });

  it('stays put without auto-play', async () => {
    const el = await carousel('interval="30"');
    await wait(120);
    expect(el._current).to.equal(0);
  });

  it('pauses while the pointer is over it', async () => {
    restoreMotion = stubReducedMotion(false);
    const el = await carousel('auto-play interval="30" loop');

    region(el).dispatchEvent(new MouseEvent('mouseenter'));
    const at = el._current;
    await wait(120);
    expect(el._current, 'hovering holds the slide').to.equal(at);

    region(el).dispatchEvent(new MouseEvent('mouseleave'));
    // Poll, for the same reason 'advances on its own' does: this half asserts
    // that something *happens*, and a fixed sleep sized off the nominal
    // interval is a guess about how busy the machine is. The hover half above
    // asserts nothing happens, which a fixed sleep can say honestly.
    expect(
      await until(() => el._current !== at),
      'and it resumes on leave',
    ).to.equal(true);
  });

  it('pauses while something inside it has focus', async () => {
    restoreMotion = stubReducedMotion(false);
    const el = await carousel('auto-play interval="30" loop');

    region(el).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    const at = el._current;
    await wait(120);
    expect(el._current, 'a keyboard user is not rushed').to.equal(at);
  });

  it('stands down entirely under prefers-reduced-motion', async () => {
    restoreMotion = stubReducedMotion(true);
    const el = await carousel('auto-play interval="30" loop');

    await wait(120);
    expect(el._current, 'no timer should have been started').to.equal(0);
  });

  it('stops its timer on disconnect', async () => {
    restoreMotion = stubReducedMotion(false);
    const el = await carousel('auto-play interval="30" loop');
    await wait(60);

    el.remove();
    const at = el._current;
    await wait(120);

    expect(el._current, 'a detached carousel must not keep ticking').to.equal(at);
  });
});
