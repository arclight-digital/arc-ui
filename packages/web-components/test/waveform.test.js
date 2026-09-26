/**
 * arc-waveform: peaks-array rendering, position-to-geometry mapping, and the
 * scrub gesture's edit/commit contract — arc-input while the pointer moves,
 * arc-change once on release; a keyboard nudge is both at once, as a native
 * range input's is. Non-interactive waveforms are images: they emit nothing.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/data/waveform.register.js';

afterEach(() => cleanup());

const PEAKS = [0.2, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8, 0.6, 0.1, 1];

/** Mount a waveform and hand it peaks from script — an array prop has no attribute. */
async function mountWaveform(attrs = '', peaks = PEAKS) {
  const el = mount(`<arc-waveform ${attrs}></arc-waveform>`);
  if (peaks != null) el.peaks = peaks;
  await el.updateComplete;
  return el;
}

/** Record both contract events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

/** One pointer scrub across the track: down at, moves through, up. Fractions 0..1. */
function scrub(el, downAt, moves) {
  const track = el.shadowRoot.querySelector('.waveform');
  const box = track.getBoundingClientRect();
  const atX = (fraction) => box.left + box.width * fraction;
  // setPointerCapture rejects an id it has never seen, so the whole gesture
  // carries one real pointerId.
  const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };
  track.dispatchEvent(new PointerEvent('pointerdown', {
    ...pointer, clientX: atX(downAt), clientY: box.top + 10,
  }));
  for (const fraction of moves) {
    window.dispatchEvent(new PointerEvent('pointermove', {
      ...pointer, clientX: atX(fraction), clientY: box.top + 10,
    }));
  }
  window.dispatchEvent(new PointerEvent('pointerup', pointer));
}

describe('arc-waveform rendering', () => {
  it('renders one bar per peak in each layer', async () => {
    const el = await mountWaveform();
    expect(el.shadowRoot.querySelectorAll('.wave-base rect').length).to.equal(PEAKS.length);
    expect(el.shadowRoot.querySelectorAll('.wave-played rect').length).to.equal(PEAKS.length);
  });

  it('mirror variant renders a single envelope path per layer', async () => {
    const el = await mountWaveform('variant="mirror"');
    expect(el.shadowRoot.querySelectorAll('.wave-base path').length).to.equal(1);
    expect(el.shadowRoot.querySelectorAll('.wave-base rect').length).to.equal(0);
  });

  it('empty peaks renders an empty track, not an error', async () => {
    const el = await mountWaveform('', null);
    expect(el.shadowRoot.querySelector('svg')).to.exist;
    expect(el.shadowRoot.querySelectorAll('rect:not(clipPath rect)').length).to.equal(0);
    expect(el.shadowRoot.querySelector('.wave-empty')).to.exist;

    el.peaks = [];
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.wave-empty')).to.exist;
  });

  it('position maps the played clip to the right bar boundary', async () => {
    // 10 peaks at 4 viewBox units each: position 0.5 must clip at exactly
    // 20 units — the boundary after the fifth bar.
    const el = await mountWaveform('position="0.5"');
    const svg = el.shadowRoot.querySelector('svg');
    const viewBoxWidth = Number(svg.getAttribute('viewBox').split(' ')[2]);
    expect(viewBoxWidth).to.equal(PEAKS.length * 4);

    const clipRect = el.shadowRoot.querySelector('clipPath rect');
    expect(Number(clipRect.getAttribute('width'))).to.equal(viewBoxWidth / 2);
  });

  it('duration renders time readouts; without it there are none', async () => {
    const el = await mountWaveform('duration="120" position="0.5"');
    const time = el.shadowRoot.querySelector('.waveform__time');
    expect(time).to.exist;
    expect(time.querySelector('.waveform__time-current').textContent).to.equal('1:00');
    expect(time.querySelector('.waveform__time-total').textContent).to.equal('2:00');

    const bare = await mountWaveform();
    expect(bare.shadowRoot.querySelector('.waveform__time')).to.not.exist;
  });

  it('is a slider when interactive, an image otherwise', async () => {
    const el = await mountWaveform('interactive label="Track scrubber" duration="100" position="0.25"');
    const track = el.shadowRoot.querySelector('.waveform');
    expect(track.getAttribute('role')).to.equal('slider');
    expect(track.getAttribute('tabindex')).to.equal('0');
    expect(track.getAttribute('aria-label')).to.equal('Track scrubber');
    expect(track.getAttribute('aria-valuenow')).to.equal('25');
    expect(track.getAttribute('aria-valuetext')).to.equal('0:25 of 1:40');

    const still = await mountWaveform('label="Kick sample"');
    const img = still.shadowRoot.querySelector('.waveform');
    expect(img.getAttribute('role')).to.equal('img');
    expect(img.hasAttribute('tabindex')).to.be.false;
  });
});

describe('arc-waveform scrubbing', () => {
  it('emits arc-input per move and commits once on release', async () => {
    const el = await mountWaveform('interactive');
    const seen = record(el);

    scrub(el, 0.25, [0.4, 0.6, 0.75]);
    await tick();

    expect(only(seen, 'input').length, 'one per down and move').to.equal(4);
    expect(only(seen, 'change').length, 'exactly one commit').to.equal(1);
    expect(only(seen, 'change')[0][1], 'commits the release position').to.be.closeTo(0.75, 0.02);
    expect(el.position).to.be.closeTo(0.75, 0.02);
  });

  it('arc-input carries the live position while dragging', async () => {
    const el = await mountWaveform('interactive');
    const seen = record(el);

    scrub(el, 0.2, [0.8]);
    await tick();

    const inputs = only(seen, 'input');
    expect(inputs[0][1], 'grab point').to.be.closeTo(0.2, 0.02);
    expect(inputs[inputs.length - 1][1], 'last move').to.be.closeTo(0.8, 0.02);
  });

  it('keyboard arrows seek, each press an edit and a commit at once', async () => {
    const el = await mountWaveform('interactive position="0.5"');
    const seen = record(el);
    const track = el.shadowRoot.querySelector('.waveform');

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await tick();
    expect(el.position).to.be.closeTo(0.51, 0.001);
    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
    await tick();
    expect(el.position).to.be.closeTo(0.5, 0.001);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    await tick();
    expect(el.position).to.equal(1);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    await tick();
    expect(el.position).to.equal(0);
  });

  it('a key press at the boundary emits nothing', async () => {
    const el = await mountWaveform('interactive position="1"');
    const seen = record(el);

    el.shadowRoot.querySelector('.waveform')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await tick();

    expect(seen.length).to.equal(0);
    expect(el.position).to.equal(1);
  });

  it('non-interactive emits nothing and never moves', async () => {
    const el = await mountWaveform('position="0.3"');
    const seen = record(el);

    scrub(el, 0.1, [0.9]);
    el.shadowRoot.querySelector('.waveform')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    await tick();

    expect(seen.length).to.equal(0);
    expect(el.position).to.equal(0.3);
  });
});

/**
 * `steps` and `value-text` — a waveform as a replay scrubber over discrete
 * frames (test-findings #119). The fixed 1% arrow step landed a 40-step replay
 * on the same frame for several presses, and the built-in announcement could
 * only say a percentage or seconds.
 */
describe('arc-waveform steps and value text', () => {
  const key = (el, k) =>
    el.shadowRoot.querySelector('.waveform').dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }),
    );
  const slider = (el) => el.shadowRoot.querySelector('[role="slider"]');

  it('moves one step per arrow press', async () => {
    const el = await mountWaveform('interactive steps="40"');
    const seen = record(el);
    for (let i = 0; i < 3; i++) key(el, 'ArrowRight');
    await el.updateComplete;
    expect(el.position).to.equal(3 / 40);
    expect(only(seen, 'change').map(([, v]) => v)).to.deep.equal([1 / 40, 2 / 40, 3 / 40]);
  });

  it('moves a tenth of the track, at least one step, on Page Up', async () => {
    const el = await mountWaveform('interactive steps="40"');
    key(el, 'PageUp');
    expect(el.position).to.equal(4 / 40);
    el.steps = 5;
    el.position = 0;
    await el.updateComplete;
    key(el, 'PageUp');
    expect(el.position, 'never less than one step').to.equal(1 / 5);
  });

  it('snaps a position set from outside before stepping from it', async () => {
    // The consumer's failure: snapping `position` itself froze the keyboard,
    // because a 1% nudge rounded straight back to the same step.
    const el = await mountWaveform('interactive steps="40"');
    el.position = 0.301;
    await el.updateComplete;
    key(el, 'ArrowRight');
    expect(el.position).to.equal(13 / 40);
  });

  it('snaps pointer scrubbing, and reports each new step once', async () => {
    const el = await mountWaveform('interactive steps="4"');
    const seen = record(el);
    scrub(el, 0.1, [0.12, 0.2, 0.3, 0.55]);
    await el.updateComplete;
    expect(el.position).to.equal(0.5);
    // The press lands on step 0, where the playhead already was: not news.
    expect(only(seen, 'input').map(([, v]) => v)).to.deep.equal([0.25, 0.5]);
  });

  it('reports step numbers to assistive tech', async () => {
    const el = await mountWaveform('interactive steps="40"');
    el.position = 12 / 40;
    await el.updateComplete;
    expect(slider(el).getAttribute('aria-valuemax')).to.equal('40');
    expect(slider(el).getAttribute('aria-valuenow')).to.equal('12');
    expect(slider(el).getAttribute('aria-valuetext')).to.equal('12 of 40');
  });

  it('announces value-text instead of the built-in text', async () => {
    const el = await mountWaveform('interactive steps="40" duration="10" value-text="85 of 200 ms"');
    expect(slider(el).getAttribute('aria-valuetext')).to.equal('85 of 200 ms');
  });

  it('renders value-text set in the arc-input handler with the new position', async () => {
    const el = await mountWaveform('interactive steps="40"');
    el.addEventListener('arc-input', (e) => {
      el.valueText = `${Math.round(e.detail.value * 200)} of 200 ms`;
    });
    key(el, 'ArrowRight');
    await el.updateComplete;
    expect(slider(el).getAttribute('aria-valuenow')).to.equal('1');
    expect(slider(el).getAttribute('aria-valuetext')).to.equal('5 of 200 ms');
  });

  it('leaves a continuous track at 1% and a percentage', async () => {
    const el = await mountWaveform('interactive');
    key(el, 'ArrowRight');
    await el.updateComplete;
    expect(el.position).to.be.closeTo(0.01, 1e-9);
    expect(slider(el).getAttribute('aria-valuemax')).to.equal('100');
    expect(slider(el).getAttribute('aria-valuetext')).to.equal('1%');
  });
});
