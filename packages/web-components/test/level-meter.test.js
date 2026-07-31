/**
 * arc-level-meter is live instrumentation: segments light in proportion to the
 * value, zones come from warn/clip fractions of the range, and the peak-hold
 * line either obeys a consumer-supplied `peak` or tracks its own decaying peak
 * from incoming values. The decay runs on rAF, so the timing assertions here
 * are deliberately loose — direction of travel, not exact position.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import { ArcLevelMeter } from '../src/data/level-meter.js';
if (!customElements.get('arc-level-meter')) customElements.define('arc-level-meter', ArcLevelMeter);

afterEach(() => cleanup());

const segs = (el) => [...el.shadowRoot.querySelectorAll('[part="segment"]')];
const litSegs = (el) => segs(el).filter((s) => s.classList.contains('seg--lit'));
const peakLine = (el) => el.shadowRoot.querySelector('[part="peak"]');
const peakPos = (el) => parseFloat(peakLine(el).style.getPropertyValue('--_peak'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function meter(attrs = '') {
  const el = mount(`<arc-level-meter ${attrs}></arc-level-meter>`);
  await el.updateComplete;
  return el;
}

describe('segments', () => {
  it('lights segments in proportion to the value', async () => {
    const el = await meter('value="0.5" segments="20"');
    expect(segs(el).length).to.equal(20);
    expect(litSegs(el).length).to.equal(10);

    el.value = 1;
    await el.updateComplete;
    expect(litSegs(el).length).to.equal(20);

    el.value = 0;
    await el.updateComplete;
    expect(litSegs(el).length).to.equal(0);
  });

  it('maps a dB range onto the same fraction', async () => {
    const el = await meter('value="-30" min="-60" max="0" segments="20"');
    expect(litSegs(el).length).to.equal(10);
  });

  it('clamps out-of-range values', async () => {
    const el = await meter('value="2" segments="20"');
    expect(litSegs(el).length).to.equal(20);
  });

  it('renders a continuous fill when segments is 0', async () => {
    const el = await meter('value="0.55" segments="0"');
    expect(segs(el).length).to.equal(0);
    const fill = el.shadowRoot.querySelector('[part="fill"]');
    expect(parseFloat(fill.style.getPropertyValue('--_fill'))).to.be.closeTo(55, 0.1);
  });
});

describe('zones', () => {
  it('tints segments by the default warn/clip thresholds', async () => {
    // Defaults warn=0.75, clip=0.9 on 20 segments: 15 starts the warning
    // zone (15/20 = 0.75), 18 starts the clip zone (18/20 = 0.9).
    const el = await meter('value="1" segments="20"');
    const s = segs(el);
    expect(s[0].classList.contains('zone--success')).to.equal(true);
    expect(s[14].classList.contains('zone--success')).to.equal(true);
    expect(s[15].classList.contains('zone--warning')).to.equal(true);
    expect(s[17].classList.contains('zone--warning')).to.equal(true);
    expect(s[18].classList.contains('zone--error')).to.equal(true);
    expect(s[19].classList.contains('zone--error')).to.equal(true);
  });

  it('honours custom warn/clip fractions', async () => {
    const el = await meter('value="1" segments="10" warn="0.5" clip="0.8"');
    const s = segs(el);
    expect(s[4].classList.contains('zone--success')).to.equal(true);
    expect(s[5].classList.contains('zone--warning')).to.equal(true);
    expect(s[8].classList.contains('zone--error')).to.equal(true);
  });
});

describe('peak hold', () => {
  it('renders the hold line at a consumer-supplied peak', async () => {
    const el = await meter('value="0.4" peak="0.8"');
    expect(peakLine(el)).to.not.equal(null);
    expect(peakPos(el)).to.be.closeTo(80, 0.1);
  });

  it('renders no line before any signal', async () => {
    const el = await meter('value="0"');
    expect(peakLine(el)).to.equal(null);
  });

  it('tracks its own peak from incoming values and holds it', async () => {
    const el = await meter('value="0.9"');
    el.value = 0.1;
    await el.updateComplete;
    // Inside the hold window the line stays where the signal peaked.
    expect(peakPos(el)).to.be.closeTo(90, 0.1);
  });

  it('decays the self-tracked peak toward the value over time', async () => {
    const el = await meter('value="0.9"');
    // Private tuning knobs, shortened so the test does not sit through the
    // real 800ms hold. The decay itself still runs on real rAF frames.
    el._holdMs = 0;
    el._decayPerS = 4;
    el.value = 0.1;
    await el.updateComplete;

    await wait(150);
    await el.updateComplete;
    const fallen = peakPos(el);
    expect(fallen).to.be.lessThan(90);
    expect(fallen).to.be.at.least(10);

    await wait(300);
    await el.updateComplete;
    // Eventually the line comes to rest on the current level.
    expect(peakPos(el)).to.be.closeTo(10, 20);
  });

  it('leaves the hold line alone when peak is consumer-supplied', async () => {
    const el = await meter('value="0.2" peak="0.7"');
    el._holdMs = 0;
    el._decayPerS = 10;
    await wait(120);
    await el.updateComplete;
    expect(peakPos(el)).to.be.closeTo(70, 0.1);
  });
});

describe('orientation', () => {
  it('defaults to vertical, filling bottom-up', async () => {
    const el = await meter('value="0.5"');
    expect(el.getAttribute('orientation')).to.equal('vertical');
    const track = el.shadowRoot.querySelector('[part="track"]');
    expect(getComputedStyle(track).flexDirection).to.equal('column-reverse');
  });

  it('switches to a row when horizontal', async () => {
    const el = await meter('value="0.5" orientation="horizontal"');
    const track = el.shadowRoot.querySelector('[part="track"]');
    expect(getComputedStyle(track).flexDirection).to.equal('row');
  });

  it('treats an unknown orientation as vertical', async () => {
    const el = await meter('value="0.5" orientation="diagonal"');
    const track = el.shadowRoot.querySelector('[part="track"]');
    expect(getComputedStyle(track).flexDirection).to.equal('column-reverse');
  });
});

describe('aria', () => {
  it('exposes a meter with range and current value', async () => {
    const el = await meter('value="-12" min="-60" max="0" label="Master left"');
    const node = el.shadowRoot.querySelector('[role="meter"]');
    expect(node).to.not.equal(null);
    expect(node.getAttribute('aria-valuemin')).to.equal('-60');
    expect(node.getAttribute('aria-valuemax')).to.equal('0');
    expect(node.getAttribute('aria-valuenow')).to.equal('-12');
    expect(node.getAttribute('aria-label')).to.equal('Master left');
  });

  it('falls back to a generic accessible name', async () => {
    const el = await meter('value="0.5"');
    const node = el.shadowRoot.querySelector('[role="meter"]');
    expect(node.getAttribute('aria-label')).to.equal('Level');
  });
});
