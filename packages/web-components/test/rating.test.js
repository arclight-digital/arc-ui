/**
 * arc-rating — the star scale.
 *
 * What this pins: `max` stars render and `value` fills that many, hover previews
 * a rating without committing it, the arrow keys walk the scale and clamp,
 * arc-change carries detail.value and only fires when the value actually moved,
 * disabled and readonly both mute every gesture while readonly keeps submitting,
 * and the control participates in a form under its name.
 *
 * Four tests are marked BUG. The common root is that `value = 0` means
 * "unrated" everywhere except in the places that decide ARIA range, keyboard
 * floor and form validity. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/rating.register.js';

afterEach(() => cleanup());

async function rating(attrs = '') {
  const el = mount(`<arc-rating ${attrs}></arc-rating>`);
  await settle(el);
  return el;
}

const stars = (el) => [...el.shadowRoot.querySelectorAll('.rating__star')];
const slider = (el) => el.shadowRoot.querySelector('[role="slider"]');
/** Which stars are painted filled — read off the svg, not the class. */
const filled = (el) =>
  stars(el).map((s) => s.querySelector('svg').getAttribute('fill') === 'currentColor');
const filledCount = (el) => filled(el).filter(Boolean).length;

const hover = (star, type) => star.dispatchEvent(new MouseEvent(type, { bubbles: true }));

describe('arc-rating rendering', () => {
  it('renders five stars by default', async () => {
    const el = await rating();
    expect(stars(el)).to.have.lengthOf(5);
  });

  it('renders max stars', async () => {
    const el = await rating('max="3"');
    expect(stars(el)).to.have.lengthOf(3);
    expect(slider(el).getAttribute('aria-valuemax')).to.equal('3');
  });

  it('exposes the documented css parts', async () => {
    const el = await rating();
    expect(el.shadowRoot.querySelector('[part="rating"]')).to.not.equal(null);
    expect(el.shadowRoot.querySelectorAll('[part="star"]')).to.have.lengthOf(5);
  });

  it('fills exactly as many stars as the value', async () => {
    const el = await rating('value="3"');
    expect(filled(el)).to.deep.equal([true, true, true, false, false]);
  });

  it('fills nothing when unrated', async () => {
    const el = await rating();
    expect(el.value).to.equal(0);
    expect(filledCount(el)).to.equal(0);
  });
});

describe('arc-rating size', () => {
  const starWidth = (el) => getComputedStyle(stars(el)[0].querySelector('svg')).width;

  it('scales the glyphs per step', async () => {
    expect(starWidth(await rating('size="sm"'))).to.equal('20px');
    expect(starWidth(await rating())).to.equal('28px');
    expect(starWidth(await rating('size="lg"'))).to.equal('36px');
  });

  it('an unrecognised size lands on the medium default', async () => {
    const unknown = await rating('size="enormous"');
    const def = await rating();
    expect(starWidth(unknown)).to.equal(starWidth(def));
    expect(starWidth(unknown), 'and is not simply unstyled').to.equal('28px');
  });
});

describe('arc-rating click', () => {
  it('sets the value and fires arc-change with it', async () => {
    const el = await rating();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    stars(el)[2].click();
    await settle(el);

    expect(el.value).to.equal(3);
    expect(filledCount(el)).to.equal(3);
    expect(details).to.deep.equal([{ value: 3 }]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await rating();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    stars(el)[0].click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('re-clicking the same star re-announces the same value', async () => {
    // No equality guard on the click path, unlike the keyboard path. Pinned as
    // current behaviour: a consumer counting events sees two.
    const el = await rating('value="2"');
    const seen = record(el, ['arc-change']);

    stars(el)[1].click();
    await settle(el);

    expect(el.value).to.equal(2);
    expect(seen).to.deep.equal([['change', 2]]);
  });
});

describe('arc-rating hover preview', () => {
  it('previews a rating without committing it', async () => {
    const el = await rating('value="1"');
    const seen = record(el, ['arc-change']);

    hover(stars(el)[3], 'mouseenter');
    await settle(el);

    expect(filledCount(el), 'four stars previewed').to.equal(4);
    expect(el.value, 'but the value is untouched').to.equal(1);
    expect(seen, 'and nothing is announced').to.deep.equal([]);
  });

  it('restores the committed value on leave', async () => {
    const el = await rating('value="1"');
    hover(stars(el)[3], 'mouseenter');
    await settle(el);
    hover(stars(el)[3], 'mouseleave');
    await settle(el);

    expect(filledCount(el)).to.equal(1);
  });

  it('does not preview while disabled or readonly', async () => {
    for (const attrs of ['value="1" disabled', 'value="1" readonly']) {
      const el = await rating(attrs);
      hover(stars(el)[4], 'mouseenter');
      await settle(el);
      expect(filledCount(el), attrs).to.equal(1);
      cleanup();
    }
  });
});

describe('arc-rating keyboard', () => {
  it('the forward keys step up and clamp at max', async () => {
    const el = await rating('value="4" max="5"');

    keyOn(slider(el), 'ArrowRight');
    await settle(el);
    expect(el.value).to.equal(5);

    const seen = record(el, ['arc-change']);
    keyOn(slider(el), 'ArrowUp');
    await settle(el);
    expect(el.value, 'clamped').to.equal(5);
    expect(seen, 'an unchanged value announces nothing').to.deep.equal([]);
  });

  it('the backward keys step down', async () => {
    const el = await rating('value="3"');

    keyOn(slider(el), 'ArrowLeft');
    await settle(el);
    expect(el.value).to.equal(2);

    keyOn(slider(el), 'ArrowDown');
    await settle(el);
    expect(el.value).to.equal(1);
  });

  it('Home and End hit the rails', async () => {
    const el = await rating('value="3" max="5"');
    keyOn(slider(el), 'End');
    await settle(el);
    expect(el.value).to.equal(5);

    keyOn(slider(el), 'Home');
    await settle(el);
    expect(el.value).to.equal(1);
  });

  it('announces each keyboard move once', async () => {
    const el = await rating('value="1"');
    const seen = record(el, ['arc-change']);

    keyOn(slider(el), 'ArrowRight');
    await settle(el);
    keyOn(slider(el), 'ArrowRight');
    await settle(el);

    expect(seen).to.deep.equal([['change', 2], ['change', 3]]);
  });

  it('claims the keys it handles and leaves the rest for the page', async () => {
    const el = await rating('value="2"');

    const handled = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    slider(el).dispatchEvent(handled);
    await settle(el);
    expect(handled.defaultPrevented).to.equal(true);

    const before = el.value;
    const ignored = new KeyboardEvent('keydown', { key: 'q', bubbles: true, cancelable: true });
    slider(el).dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented).to.equal(false);
    expect(el.value).to.equal(before);
  });

  // BUG: the decrement floor is 1, not 0 (rating.js:150). From the unrated
  // default of 0, ArrowLeft computes Math.max(0 - 1, 1) === 1 — so the key that
  // means "less" raises the rating, and there is no keyboard route back to
  // unrated at all.
  it('BUG: ArrowLeft from unrated raises the rating instead of lowering it', async () => {
    const el = await rating();
    expect(el.value).to.equal(0);

    keyOn(slider(el), 'ArrowLeft');
    await settle(el);

    expect(el.value, 'a decrement key increased the value').to.equal(1);
  });

  it('BUG: no keyboard route back to unrated once a rating is set', async () => {
    const el = await rating('value="1"');
    keyOn(slider(el), 'ArrowLeft');
    keyOn(slider(el), 'Home');
    await settle(el);
    expect(el.value, 'the floor is 1, so 0 is unreachable').to.equal(1);
  });
});

describe('arc-rating ARIA', () => {
  it('is a slider carrying its range and current value', async () => {
    const el = await rating('value="3" max="7"');
    const node = slider(el);
    expect(node.getAttribute('aria-valuemin')).to.equal('1');
    expect(node.getAttribute('aria-valuemax')).to.equal('7');
    expect(node.getAttribute('aria-valuenow')).to.equal('3');
  });

  it('tracks the value as it changes', async () => {
    const el = await rating('value="1"');
    keyOn(slider(el), 'ArrowRight');
    await settle(el);
    expect(slider(el).getAttribute('aria-valuenow')).to.equal('2');
  });

  it('announces disabled and readonly', async () => {
    const el = await rating('disabled');
    expect(slider(el).getAttribute('aria-disabled')).to.equal('true');

    const ro = await rating('readonly');
    expect(slider(ro).getAttribute('aria-readonly')).to.equal('true');
  });

  it('hides the star glyphs from assistive tech', async () => {
    const el = await rating();
    expect(stars(el).every((s) => s.querySelector('svg').getAttribute('aria-hidden') === 'true'))
      .to.equal(true);
  });

  // BUG: aria-valuemin is the literal "1" (rating.js:215) while the default
  // value is 0, so an unrated control reports aria-valuenow="0" against a
  // declared minimum of 1 — out of range, which is invalid ARIA and leaves the
  // announced value undefined by spec.
  it('BUG: an unrated control reports a value below its own declared minimum', async () => {
    const el = await rating();
    expect(slider(el).getAttribute('aria-valuenow')).to.equal('0');
    expect(slider(el).getAttribute('aria-valuemin')).to.equal('1');
  });

  // BUG: aria-label is hardcoded (rating.js:214) and there is no `label` prop,
  // so every rating on a page announces as "Rating" with no way to tell them
  // apart, and an author-supplied aria-label on the host does not reach it.
  it('BUG: the accessible name is hardcoded and cannot be set', async () => {
    const el = await rating('aria-label="Delivery speed"');
    expect(slider(el).getAttribute('aria-label')).to.equal('Rating');
  });
});

describe('arc-rating disabled and readonly', () => {
  it('disabled leaves the tab order and mutes every gesture', async () => {
    const el = await rating('value="2" disabled');
    const seen = record(el, ['arc-change']);

    expect(slider(el).getAttribute('tabindex')).to.equal('-1');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');

    stars(el)[4].click();
    keyOn(slider(el), 'ArrowRight');
    await settle(el);

    expect(el.value).to.equal(2);
    expect(seen).to.deep.equal([]);
  });

  it('readonly keeps the tab stop but stays inert', async () => {
    const el = await rating('value="2" readonly');
    const seen = record(el, ['arc-change']);

    expect(slider(el).getAttribute('tabindex'), 'still reachable for reading').to.equal('0');

    stars(el)[4].click();
    keyOn(slider(el), 'ArrowRight');
    await settle(el);

    expect(el.value).to.equal(2);
    expect(seen).to.deep.equal([]);
  });
});

describe('arc-rating form participation', () => {
  it('submits its value under its name and tracks programmatic changes', async () => {
    const form = mount('<form><arc-rating name="stars" value="4"></arc-rating></form>');
    const el = form.querySelector('arc-rating');
    await settle(el);

    expect(new FormData(form).get('stars')).to.equal('4');

    el.value = 2;
    await settle(el);
    expect(new FormData(form).get('stars'), 'programmatic set reaches the form').to.equal('2');
  });

  it('restores its initial value on form reset', async () => {
    const form = mount('<form><arc-rating name="stars" value="4"></arc-rating></form>');
    const el = form.querySelector('arc-rating');
    await settle(el);

    el.value = 1;
    await settle(el);
    form.reset();
    await settle(el);

    expect(el.value).to.equal(4);
    expect(new FormData(form).get('stars')).to.equal('4');
  });

  it('a readonly rating still submits', async () => {
    const form = mount('<form><arc-rating name="stars" value="3" readonly></arc-rating></form>');
    const el = form.querySelector('arc-rating');
    await settle(el);
    expect(new FormData(form).get('stars')).to.equal('3');
  });

  // BUG: _formValue() stringifies the value (rating.js:112), so an unrated
  // control submits "0" — which FormControlMixin._formValueIsEmpty does not
  // treat as empty (only null and ''). `required` on a rating is therefore
  // satisfied by never rating anything. form-contract.test.js:15-16 exempts
  // rating from its required sweep on the grounds that number-valued controls
  // have no meaningful "empty", but 0 is exactly that for this control — it is
  // outside the component's own aria-valuemin of 1.
  it('BUG: required is satisfied by an unrated control', async () => {
    const el = await rating('required name="stars"');
    expect(el.value).to.equal(0);
    expect(el.checkValidity(), 'an unrated required rating reports valid').to.equal(true);
    expect(el.validity.valueMissing).to.equal(false);
  });
});
