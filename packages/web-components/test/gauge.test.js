import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/data/gauge.register.js';

afterEach(cleanup);

async function gauge(attrs = '') {
  const el = mount(`<arc-gauge ${attrs}></arc-gauge>`);
  await el.updateComplete;
  return el;
}

/** The zone the value arc is currently painted with. */
function zoneOf(el) {
  const arc = el.shadowRoot.querySelector('.gauge__arc');
  const match = arc.className.baseVal.match(/gauge__arc--(\w+)/);
  return match?.[1];
}

describe('arc-gauge rendering', () => {
  it('renders a track and a value arc', async () => {
    const el = await gauge('value="50"');
    expect(el.shadowRoot.querySelector('.gauge__track')).to.exist;
    expect(el.shadowRoot.querySelector('.gauge__arc')).to.exist;
  });

  it('shows the value with unit in the readout by default', async () => {
    const el = await gauge('value="72" unit="%"');
    const value = el.shadowRoot.querySelector('.gauge__value');
    expect(value.textContent).to.contain('72');
    expect(el.shadowRoot.querySelector('.gauge__unit').textContent).to.equal('%');
  });

  it('hides the readout value when showValue is false', async () => {
    const el = await gauge('value="72"');
    el.showValue = false;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.gauge__value')).to.not.exist;
  });

  it('switches geometry with the half variant', async () => {
    const full = await gauge('value="50"');
    const half = await gauge('value="50" variant="half"');
    const box = (el) => el.shadowRoot.querySelector('svg').getAttribute('viewBox');
    expect(box(full)).to.equal('0 0 100 100');
    expect(box(half)).to.equal('0 0 100 58');
  });
});

describe('arc-gauge zone logic (mirrors arc-meter)', () => {
  it('higher-is-better: success above high, warning between, error below low', async () => {
    const attrs = 'min="0" max="100" low="20" high="60" optimum="100"';
    expect(zoneOf(await gauge(`value="82" ${attrs}`))).to.equal('success');
    expect(zoneOf(await gauge(`value="40" ${attrs}`))).to.equal('warning');
    expect(zoneOf(await gauge(`value="10" ${attrs}`))).to.equal('error');
  });

  it('inverts when optimum is in the low segment (lower is better)', async () => {
    const attrs = 'min="0" max="100" low="10" high="50" optimum="0"';
    expect(zoneOf(await gauge(`value="5" ${attrs}`))).to.equal('success');
    expect(zoneOf(await gauge(`value="30" ${attrs}`))).to.equal('warning');
    expect(zoneOf(await gauge(`value="80" ${attrs}`))).to.equal('error');
  });

  it('treats the middle segment as success when optimum sits between low and high', async () => {
    const attrs = 'min="0" max="100" low="30" high="70" optimum="50"';
    expect(zoneOf(await gauge(`value="50" ${attrs}`))).to.equal('success');
    expect(zoneOf(await gauge(`value="10" ${attrs}`))).to.equal('warning');
    expect(zoneOf(await gauge(`value="90" ${attrs}`))).to.equal('warning');
  });

  it('falls back to thirds when no thresholds are set', async () => {
    // Defaults put optimum mid-range: the middle third reads success.
    expect(zoneOf(await gauge('value="50"'))).to.equal('success');
    expect(zoneOf(await gauge('value="10"'))).to.equal('warning');
  });
});

describe('arc-gauge clamping', () => {
  it('clamps the sweep to full when value exceeds max', async () => {
    const el = await gauge('value="150" min="0" max="100"');
    const arc = el.shadowRoot.querySelector('.gauge__arc');
    expect(arc.getAttribute('style')).to.contain('stroke-dashoffset: 0');
    expect(el.shadowRoot.querySelector('.gauge__value').textContent).to.contain('100');
  });

  it('clamps the sweep to empty when value is below min', async () => {
    const el = await gauge('value="-10" min="0" max="100"');
    const arc = el.shadowRoot.querySelector('.gauge__arc');
    const style = arc.getAttribute('style');
    const [, dash] = style.match(/stroke-dasharray:\s*([\d.]+)/);
    const [, offset] = style.match(/stroke-dashoffset:\s*([\d.]+)/);
    expect(offset).to.equal(dash);
    expect(el.shadowRoot.querySelector('.gauge__value').textContent).to.contain('0');
  });
});

describe('arc-gauge accessibility', () => {
  it('exposes role="meter" with value bounds', async () => {
    const el = await gauge('value="42" min="0" max="100" label="CPU"');
    const meter = el.shadowRoot.querySelector('[role="meter"]');
    expect(meter).to.exist;
    expect(meter.getAttribute('aria-valuemin')).to.equal('0');
    expect(meter.getAttribute('aria-valuemax')).to.equal('100');
    expect(meter.getAttribute('aria-valuenow')).to.equal('42');
    expect(meter.getAttribute('aria-label')).to.equal('CPU');
  });

  it('falls back to a generic accessible name without a label', async () => {
    const el = await gauge('value="42"');
    const meter = el.shadowRoot.querySelector('[role="meter"]');
    expect(meter.getAttribute('aria-label')).to.equal('Gauge');
  });

  it('reports the clamped value with unit via aria-valuetext', async () => {
    const el = await gauge('value="120" min="0" max="100" unit="%"');
    const meter = el.shadowRoot.querySelector('[role="meter"]');
    expect(meter.getAttribute('aria-valuetext')).to.equal('100%');
  });

  it('hides the visual readout from assistive tech', async () => {
    const el = await gauge('value="42" label="CPU"');
    const readout = el.shadowRoot.querySelector('.gauge__readout');
    expect(readout.getAttribute('aria-hidden')).to.equal('true');
  });
});
