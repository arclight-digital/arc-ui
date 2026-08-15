/**
 * arc-range-slider — the two-thumb range control.
 *
 * What this pins: the thumbs bound each other rather than crossing, the
 * keyboard and pointer paths both snap to `step` and clamp, arc-input fires
 * continuously while arc-change commits, both carrying the canonical
 * `detail.value` as `[low, high]`, and the control participates in a form
 * including the round trip through formStateRestoreCallback.
 *
 * One test is marked BUG: a key press at a rail fires a full input+change pair
 * for a value that did not move, which is the opposite of what arc-knob and
 * arc-rating do. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, only, pointerInit } from './helpers.js';

import '../src/input/range-slider.register.js';

afterEach(() => cleanup());

async function slider(attrs = '') {
  const el = mount(`<arc-range-slider style="width: 400px; display: block" ${attrs}></arc-range-slider>`);
  await settle(el);
  return el;
}

const thumb = (el, which) => el.shadowRoot.querySelector(`[part="thumb-${which}"]`);
const track = (el) => el.shadowRoot.querySelector('[part="track"]');
const fill = (el) => el.shadowRoot.querySelector('[part="fill"]');

/** Drag a thumb to a fraction of the track. */
async function dragThumb(el, which, fraction) {
  const t = thumb(el, which);
  const rect = track(el).getBoundingClientRect();
  const x = rect.left + rect.width * fraction;

  t.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, clientX: rect.left }));
  t.dispatchEvent(new PointerEvent('pointermove', { ...pointerInit, clientX: x }));
  await settle(el);
  t.dispatchEvent(new PointerEvent('pointerup', { ...pointerInit, clientX: x }));
  await settle(el);
}

describe('arc-range-slider rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await slider('label="Price"');
    for (const part of [
      'range-slider', 'header', 'label', 'values', 'track', 'rail', 'fill',
      'thumb-low', 'thumb-high',
    ]) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('spans the full range by default', async () => {
    const el = await slider();
    expect([el.min, el.max, el.low, el.high]).to.deep.equal([0, 100, 0, 100]);
  });

  it('positions the fill between the two thumbs', async () => {
    const el = await slider('low="25" high="75"');
    // Offset plus width, not two edges: left is the low bound, width the span.
    expect(fill(el).style.left).to.equal('25%');
    expect(fill(el).style.width).to.equal('50%');
  });

  it('moves the fill with the bounds', async () => {
    const el = await slider('low="0" high="100"');
    el.low = 40;
    el.high = 60;
    await settle(el);
    expect(fill(el).style.left).to.equal('40%');
    expect(fill(el).style.width).to.equal('20%');
  });

  it('reflects low and high so attribute selectors see them', async () => {
    const el = await slider();
    el.low = 10;
    el.high = 90;
    await settle(el);
    expect(el.getAttribute('low')).to.equal('10');
    expect(el.getAttribute('high')).to.equal('90');
  });

  it('shows the readout and the label', async () => {
    const el = await slider('label="Price" low="20" high="80"');
    expect(el.shadowRoot.querySelector('[part="label"]').textContent).to.contain('Price');
    expect(el.shadowRoot.querySelector('[part="values"]').textContent.replace(/\s+/g, ' '))
      .to.contain('20');
  });
});

describe('arc-range-slider accessibility', () => {
  it('gives each thumb slider semantics bounded by the other', async () => {
    const el = await slider('low="30" high="70"');

    for (const [which, now] of [['low', '30'], ['high', '70']]) {
      const t = thumb(el, which);
      expect(t.getAttribute('role'), which).to.equal('slider');
      expect(t.getAttribute('aria-valuenow'), which).to.equal(now);
      expect(t.getAttribute('tabindex'), which).to.equal('0');
    }
  });

  it('tracks aria-valuenow as a thumb moves', async () => {
    const el = await slider('low="30" high="70" step="5"');
    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);
    expect(thumb(el, 'low').getAttribute('aria-valuenow')).to.equal('35');
  });
});

describe('arc-range-slider keyboard', () => {
  it('steps each thumb by step, in both axes', async () => {
    const el = await slider('low="20" high="80" step="5"');

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);
    expect(el.low).to.equal(25);

    keyOn(thumb(el, 'low'), 'ArrowUp');
    await settle(el);
    expect(el.low).to.equal(30);

    keyOn(thumb(el, 'high'), 'ArrowLeft');
    await settle(el);
    expect(el.high).to.equal(75);

    keyOn(thumb(el, 'high'), 'ArrowDown');
    await settle(el);
    expect(el.high).to.equal(70);
  });

  it('stops each thumb at the other rather than crossing', async () => {
    const el = await slider('low="48" high="50" step="5"');

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);
    expect(el.low, 'low cannot pass high').to.equal(50);
    expect(el.high).to.equal(50);

    keyOn(thumb(el, 'high'), 'ArrowLeft');
    await settle(el);
    expect(el.high, 'high cannot pass low').to.equal(50);
  });

  it('Home and End collapse each thumb onto its own bound', async () => {
    const el = await slider('low="30" high="70"');

    keyOn(thumb(el, 'low'), 'Home');
    await settle(el);
    expect(el.low, 'low goes to min').to.equal(0);

    keyOn(thumb(el, 'high'), 'End');
    await settle(el);
    expect(el.high, 'high goes to max').to.equal(100);
  });

  it('is edit and commit at once, as a discrete step should be', async () => {
    const el = await slider('low="20" high="80" step="5"');
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);

    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
    expect(only(seen, 'change')[0][1], 'detail.value is the pair').to.deep.equal([25, 80]);
  });

  it('claims the keys it handles and leaves the rest', async () => {
    const el = await slider('low="20" high="80"');

    const handled = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    thumb(el, 'low').dispatchEvent(handled);
    await settle(el);
    expect(handled.defaultPrevented).to.equal(true);

    const before = el.low;
    const ignored = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    thumb(el, 'low').dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented).to.equal(false);
    expect(el.low).to.equal(before);
  });

  // Was a BUG pin (finding #38). _onKeyDown clamped and then called
  // _fireInput() and _fireChange() unconditionally, so a press against a rail
  // emitted a full edit-and-commit pair for a range that had not moved — one
  // pair per key repeat. arc-change is the expensive half of the v3 contract by
  // this component's own docs ("persisting to a database or triggering an
  // expensive operation"), which is what made this the costliest instance of
  // the shape after #19.
  //
  // Every sibling control already guarded it: arc-knob asserts "a step against
  // a rail clamps and stays silent" (knob.test.js:101), and arc-rating does the
  // same.
  it('a key at the low rail stays silent', async () => {
    const el = await slider('low="0" high="100" step="5"');
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowLeft');
    await settle(el);

    expect(el.low, 'the value did not move').to.equal(0);
    expect(seen.map(([k]) => k), 'so neither event fires').to.deep.equal([]);
  });

  it('a key at the high rail stays silent', async () => {
    const el = await slider('low="0" high="100" step="5"');
    const seen = record(el);

    keyOn(thumb(el, 'high'), 'ArrowRight');
    await settle(el);

    expect(el.high).to.equal(100);
    expect(seen.map(([k]) => k)).to.deep.equal([]);
  });

  it('a thumb pinned against its sibling stays silent too', async () => {
    // The bound that is not a rail: `low` cannot pass `high`. Same guard, and
    // the case a min/max-only check would miss.
    const el = await slider('low="50" high="50" step="5"');
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);

    expect(el.low).to.equal(50);
    expect(seen.map(([k]) => k)).to.deep.equal([]);
  });

  it('still claims the key at a rail, so the page does not scroll', async () => {
    const el = await slider('low="0" high="100" step="5"');
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    thumb(el, 'low').dispatchEvent(event);
    await settle(el);
    expect(event.defaultPrevented).to.equal(true);
  });

  it('still announces a move that does happen', async () => {
    // Anti-vacuity for all four above.
    const el = await slider('low="20" high="100" step="5"');
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowLeft');
    await settle(el);

    expect(el.low).to.equal(15);
    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
  });
});

describe('arc-range-slider pointer', () => {
  it('drags the low thumb along the track', async () => {
    const el = await slider('low="0" high="100" step="10"');
    await dragThumb(el, 'low', 0.3);
    expect(el.low).to.be.closeTo(30, 10);
  });

  it('drags the high thumb along the track', async () => {
    const el = await slider('low="0" high="100" step="10"');
    await dragThumb(el, 'high', 0.6);
    expect(el.high).to.be.closeTo(60, 10);
  });

  it('emits input while dragging and one change on release', async () => {
    const el = await slider('low="0" high="100" step="10"');
    const seen = record(el);
    const t = thumb(el, 'low');
    const rect = track(el).getBoundingClientRect();

    t.dispatchEvent(new PointerEvent('pointerdown', { ...pointerInit, clientX: rect.left }));
    for (const fraction of [0.1, 0.2, 0.3]) {
      t.dispatchEvent(
        new PointerEvent('pointermove', { ...pointerInit, clientX: rect.left + rect.width * fraction }),
      );
      await settle(el);
    }
    expect(only(seen, 'change'), 'nothing committed mid-drag').to.have.lengthOf(0);

    t.dispatchEvent(new PointerEvent('pointerup', pointerInit));
    await settle(el);

    expect(only(seen, 'input').length, 'one per move').to.be.greaterThan(0);
    expect(only(seen, 'change'), 'exactly one commit').to.have.lengthOf(1);
  });

  it('moves the nearest thumb when the rail itself is clicked', async () => {
    const el = await slider('low="0" high="100" step="10"');
    const rect = track(el).getBoundingClientRect();

    track(el).dispatchEvent(
      new PointerEvent('pointerdown', { ...pointerInit, clientX: rect.left + rect.width * 0.2 }),
    );
    await settle(el);

    expect(el.low, 'the low thumb was nearer').to.be.closeTo(20, 10);
    expect(el.high).to.equal(100);
  });

  it('snaps to step', async () => {
    const el = await slider('low="0" high="100" step="25"');
    await dragThumb(el, 'low', 0.4);
    expect(el.low % 25, 'lands on a multiple of step').to.equal(0);
  });
});

describe('arc-range-slider disabled and readonly', () => {
  it('disabled mutes both input paths', async () => {
    const el = await slider('low="20" high="80" disabled');
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await dragThumb(el, 'low', 0.6);

    expect(el.low).to.equal(20);
    expect(seen).to.deep.equal([]);
  });

  it('readonly mutes both input paths but keeps submitting', async () => {
    const form = mount('<form><arc-range-slider name="price" low="20" high="80" readonly></arc-range-slider></form>');
    const el = form.querySelector('arc-range-slider');
    await settle(el);
    const seen = record(el);

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);

    expect(el.low).to.equal(20);
    expect(seen).to.deep.equal([]);
    expect(new FormData(form).get('price')).to.equal('20,80');
  });
});

describe('arc-range-slider form participation', () => {
  it('submits the pair under its name and tracks changes', async () => {
    const form = mount('<form><arc-range-slider name="price" low="20" high="80"></arc-range-slider></form>');
    const el = form.querySelector('arc-range-slider');
    await settle(el);

    expect(new FormData(form).get('price')).to.equal('20,80');

    el.low = 35;
    await settle(el);
    expect(new FormData(form).get('price'), 'a programmatic set reaches the form')
      .to.equal('35,80');
  });

  it('restores both bounds on form reset', async () => {
    const form = mount('<form><arc-range-slider name="price" low="20" high="80"></arc-range-slider></form>');
    const el = form.querySelector('arc-range-slider');
    await settle(el);

    el.low = 40;
    el.high = 60;
    await settle(el);
    form.reset();
    await settle(el);

    expect([el.low, el.high], 'reset restores the initial range').to.deep.equal([20, 80]);
  });

  it('round-trips through formStateRestoreCallback', async () => {
    // The mixin's default only handles a plain string value; this control
    // overrides it to split the pair back apart, which is what makes bfcache
    // and autofill restore work for a two-valued control.
    const el = await slider('low="10" high="20"');
    el.formStateRestoreCallback('45,65');
    await settle(el);

    expect([el.low, el.high]).to.deep.equal([45, 65]);
  });
});

/**
 * Everything above runs on the default range, which starts at min = 0 — and a
 * min of 0 makes `x - this.min` and `x + this.min` the same expression. A
 * mutation run showed that hiding every arithmetic error in the percent maths,
 * the snap and the track-click hit test: 61% of mutants in this file survived,
 * most of them here.
 *
 * These run on an offset range instead, where the two differ. Nothing about the
 * component is different — the tests were.
 */
describe('arc-range-slider on an offset range', () => {
  const offset = (attrs = '') => slider(`min="10" max="110" ${attrs}`);
  const pct = (el, which) =>
    parseFloat(getComputedStyle(thumb(el, which)).getPropertyValue('inset-inline-start'));

  it('positions each thumb by its offset from min, not by its raw value', async () => {
    const el = await offset('low="35" high="85"');
    const width = track(el).getBoundingClientRect().width;

    // low sits a quarter along (35 is 25 of the 100 units above min), high at 75%.
    expect(pct(el, 'low') / width, 'low at 25%').to.be.closeTo(0.25, 0.02);
    expect(pct(el, 'high') / width, 'high at 75%').to.be.closeTo(0.75, 0.02);
  });

  it('Home and End move each thumb to its own bound, from either thumb', async () => {
    // Four combinations: the ternary picking the delta has a branch per thumb
    // per key, and the suite previously exercised one of each.
    const a = await offset('low="35" high="85"');
    keyOn(thumb(a, 'low'), 'Home');
    await settle(a);
    expect(a.low, 'Home on low goes to min').to.equal(10);

    const b = await offset('low="35" high="85"');
    keyOn(thumb(b, 'low'), 'End');
    await settle(b);
    expect(b.low, 'End on low goes up to high').to.equal(85);

    const c = await offset('low="35" high="85"');
    keyOn(thumb(c, 'high'), 'Home');
    await settle(c);
    expect(c.high, 'Home on high comes down to low').to.equal(35);

    const d = await offset('low="35" high="85"');
    keyOn(thumb(d, 'high'), 'End');
    await settle(d);
    expect(d.high, 'End on high goes to max').to.equal(110);
  });

  it('a track click picks the nearer thumb in both directions', async () => {
    const near = await offset('low="30" high="90" step="1"');
    const rectA = track(near).getBoundingClientRect();
    track(near).dispatchEvent(
      new PointerEvent('pointerdown', { ...pointerInit, clientX: rectA.left + rectA.width * 0.15 }),
    );
    await settle(near);
    expect(near.high, 'clicking low-side leaves high alone').to.equal(90);
    expect(near.low, 'low moved toward the click').to.be.closeTo(25, 6);

    const far = await offset('low="30" high="90" step="1"');
    const rectB = track(far).getBoundingClientRect();
    track(far).dispatchEvent(
      new PointerEvent('pointerdown', { ...pointerInit, clientX: rectB.left + rectB.width * 0.95 }),
    );
    await settle(far);
    expect(far.low, 'clicking high-side leaves low alone').to.equal(30);
    expect(far.high, 'high moved toward the click').to.be.closeTo(105, 6);
  });

  it('snaps to a fractional step without float drift', async () => {
    // The decimal-places rounding in _snap only has an effect when step is
    // fractional; an integer step leaves it dead.
    const el = await slider('min="0" max="1" step="0.1" low="0" high="1"');
    await dragThumb(el, 'low', 0.37);

    expect(String(el.low), 'no 0.30000000000000004').to.not.contain('000000');
    expect(Math.round(el.low * 10) / 10, 'lands on a tenth').to.equal(el.low);
  });
});

describe('arc-range-slider event propagation', () => {
  it('both events cross the shadow boundary and bubble, per the v3 contract', async () => {
    // Recorded on document, not on the element: an event that neither bubbles
    // nor composes still reaches a listener bound on the host itself, so the
    // contract is invisible to every assertion that listens there.
    const el = await slider('low="20" high="80"');
    const seen = [];
    const onDoc = (e) => seen.push(e.type);
    document.addEventListener('arc-input', onDoc);
    document.addEventListener('arc-change', onDoc);

    keyOn(thumb(el, 'low'), 'ArrowRight');
    await settle(el);
    document.removeEventListener('arc-input', onDoc);
    document.removeEventListener('arc-change', onDoc);

    expect(seen, 'both reached document').to.deep.equal(['arc-input', 'arc-change']);
  });
});

describe('arc-range-slider accessible names', () => {
  it('names each thumb generically when there is no label', async () => {
    const el = await slider();
    expect(thumb(el, 'low').getAttribute('aria-label')).to.equal('Range low');
    expect(thumb(el, 'high').getAttribute('aria-label')).to.equal('Range high');
  });

  it('qualifies each thumb with the label when there is one', async () => {
    const el = await slider('label="Price"');
    expect(thumb(el, 'low').getAttribute('aria-label')).to.equal('Price low');
    expect(thumb(el, 'high').getAttribute('aria-label')).to.equal('Price high');
  });
});

describe('arc-range-slider size', () => {
  it('each size renders distinctly and an unknown one lands on the default', async () => {
    const height = (el) => getComputedStyle(el.shadowRoot.querySelector('[part="rail"]')).height;

    const def = await slider();
    const lg = await slider('size="lg"');
    expect(height(lg), 'lg must differ from md').to.not.equal(height(def));

    const unknown = await slider('size="enormous"');
    expect(height(unknown)).to.equal(height(def));
  });
});
