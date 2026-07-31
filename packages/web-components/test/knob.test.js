/**
 * arc-knob — rendering, the drag/wheel/keyboard gestures, the v3 edit/commit
 * contract (arc-input while turning, arc-change once on release; a discrete
 * wheel notch or key step is edit and commit at once, as the stepper click on
 * number-input is), detent magnetism, and form participation.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/knob.register.js';

afterEach(() => cleanup());

/** Record both contract events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

const dialOf = (el) => el.shadowRoot.querySelector('.knob__dial');

/** One real pointer id (the mouse) so setPointerCapture accepts the gesture. */
const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };

function key(target, k, init = {}) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
}

describe('arc-knob rendering', () => {
  it('renders a slider-role dial with the full ARIA value set', async () => {
    const el = mount('<arc-knob label="Cutoff" value="30" min="0" max="100"></arc-knob>');
    await el.updateComplete;

    const dial = dialOf(el);
    expect(dial.getAttribute('role')).to.equal('slider');
    expect(dial.getAttribute('aria-valuemin')).to.equal('0');
    expect(dial.getAttribute('aria-valuemax')).to.equal('100');
    expect(dial.getAttribute('aria-valuenow')).to.equal('30');
    expect(dial.getAttribute('aria-valuetext')).to.equal('30');
    expect(dial.getAttribute('aria-label')).to.equal('Cutoff');
    expect(dial.getAttribute('tabindex')).to.equal('0');

    expect(el.shadowRoot.querySelector('.knob__label').textContent).to.equal('Cutoff');
    expect(el.shadowRoot.querySelector('.knob__value').textContent).to.equal('30');
  });

  it('format shapes the readout and the accessible value text', async () => {
    const el = mount('<arc-knob value="440" min="20" max="2000"></arc-knob>');
    el.format = (v) => `${v} Hz`;
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('.knob__value').textContent).to.equal('440 Hz');
    expect(dialOf(el).getAttribute('aria-valuetext')).to.equal('440 Hz');
  });

  it('parses a comma-separated detents attribute and renders one tick per detent', async () => {
    const el = mount('<arc-knob value="0" detents="0,50,100"></arc-knob>');
    await el.updateComplete;

    expect(el.detents).to.deep.equal([0, 50, 100]);
    expect(el.shadowRoot.querySelectorAll('.knob__tick').length).to.equal(3);
  });
});

describe('arc-knob keyboard', () => {
  it('arrow keys step by step, as edit and commit at once', async () => {
    const el = mount('<arc-knob value="50" step="2"></arc-knob>');
    await el.updateComplete;
    const seen = record(el);

    key(dialOf(el), 'ArrowUp');
    await tick();

    expect(el.value).to.equal(52);
    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);

    key(dialOf(el), 'ArrowDown');
    await tick();
    expect(el.value).to.equal(50);
  });

  it('page keys step by ten steps; Home and End hit the rails', async () => {
    const el = mount('<arc-knob value="50" min="0" max="100" step="1"></arc-knob>');
    await el.updateComplete;
    const dial = dialOf(el);

    key(dial, 'PageUp');
    expect(el.value).to.equal(60);
    key(dial, 'PageDown');
    expect(el.value).to.equal(50);
    key(dial, 'Home');
    expect(el.value).to.equal(0);
    key(dial, 'End');
    expect(el.value).to.equal(100);
  });

  it('a step against a rail clamps and stays silent', async () => {
    const el = mount('<arc-knob value="100" min="0" max="100"></arc-knob>');
    await el.updateComplete;
    const seen = record(el);

    key(dialOf(el), 'ArrowUp');
    await tick();

    expect(el.value).to.equal(100);
    expect(seen.length, 'no events for an unchanged value').to.equal(0);
  });
});

describe('arc-knob drag', () => {
  it('vertical drag emits arc-input per move and commits once on release', async () => {
    const el = mount('<arc-knob value="0" min="0" max="100" step="1"></arc-knob>');
    await el.updateComplete;
    const seen = record(el);
    const dial = dialOf(el);

    dial.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, clientY: 200 }));
    for (const dy of [15, 30, 45]) {
      dial.dispatchEvent(new PointerEvent('pointermove', { ...pointer, clientY: 200 - dy }));
      await tick();
    }
    dial.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    // 150px of drag covers the full range, so 45px of a 0–100 knob is 30.
    expect(el.value).to.equal(30);
    expect(only(seen, 'input').length, 'one per move').to.equal(3);
    expect(only(seen, 'change').length, 'exactly one commit').to.equal(1);
    expect(only(seen, 'change')[0][1]).to.equal(30);
  });

  it('dragging snaps magnetically to a nearby detent', async () => {
    const el = mount('<arc-knob value="0" min="0" max="100" detents="0,50,100"></arc-knob>');
    await el.updateComplete;
    const dial = dialOf(el);

    // 74px of drag is a raw 49.3 → step-snap 49 → within the 2.5-unit
    // detent window of 50, so the detent wins.
    dial.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, clientY: 200 }));
    dial.dispatchEvent(new PointerEvent('pointermove', { ...pointer, clientY: 200 - 74 }));
    dial.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    expect(el.value).to.equal(50);
  });
});

describe('arc-knob wheel', () => {
  it('a wheel notch steps by step, as edit and commit at once', async () => {
    const el = mount('<arc-knob value="50" step="5"></arc-knob>');
    await el.updateComplete;
    const seen = record(el);
    const dial = dialOf(el);

    dial.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }));
    await tick();
    expect(el.value).to.equal(55);
    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);

    dial.dispatchEvent(new WheelEvent('wheel', { deltaY: 1, bubbles: true, cancelable: true }));
    await tick();
    expect(el.value).to.equal(50);
  });

  it('wheel clamps at the rails', async () => {
    const el = mount('<arc-knob value="99" min="0" max="100" step="5"></arc-knob>');
    await el.updateComplete;

    dialOf(el).dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }));
    await tick();
    expect(el.value).to.equal(100);
  });
});

describe('arc-knob form participation', () => {
  it('submits its value under its name, tracks programmatic changes, and resets', async () => {
    const form = mount('<form><arc-knob name="gain" value="30"></arc-knob></form>');
    const el = form.querySelector('arc-knob');
    await el.updateComplete;

    expect(new FormData(form).get('gain')).to.equal('30');

    el.value = 70;
    await el.updateComplete;
    expect(new FormData(form).get('gain'), 'programmatic set reaches the form').to.equal('70');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal(30);
    expect(new FormData(form).get('gain')).to.equal('30');
  });
});

describe('arc-knob disabled and readonly', () => {
  it('disabled removes the dial from the tab order and mutes every gesture', async () => {
    const el = mount('<arc-knob value="50" disabled></arc-knob>');
    await el.updateComplete;
    const seen = record(el);
    const dial = dialOf(el);

    expect(dial.getAttribute('tabindex')).to.equal('-1');

    key(dial, 'ArrowUp');
    dial.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }));
    await tick();

    expect(el.value).to.equal(50);
    expect(seen.length).to.equal(0);
  });

  it('readonly keeps the dial focusable but inert, and the value still submits', async () => {
    const form = mount('<form><arc-knob name="pan" value="50" readonly></arc-knob></form>');
    const el = form.querySelector('arc-knob');
    await el.updateComplete;
    const seen = record(el);
    const dial = dialOf(el);

    expect(dial.getAttribute('tabindex')).to.equal('0');

    key(dial, 'ArrowUp');
    dial.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, bubbles: true, cancelable: true }));
    dial.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, clientY: 200 }));
    dial.dispatchEvent(new PointerEvent('pointermove', { ...pointer, clientY: 100 }));
    dial.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    expect(el.value).to.equal(50);
    expect(seen.length).to.equal(0);
    expect(new FormData(form).get('pan')).to.equal('50');
  });
});
