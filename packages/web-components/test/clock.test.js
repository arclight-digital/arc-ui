import { expect } from '@esm-bundle/chai';
import { ArcClock } from '../src/data/clock.js';
import { mount, cleanup } from './helpers.js';

// clock.register.js is generated from the JSDoc @tag by pnpm generate; define
// the element the same way here so the test runs before generation and stays
// harmless after it.
if (!customElements.get('arc-clock')) customElements.define('arc-clock', ArcClock);

/**
 * Pin the rendered instant by writing the reactive _now state directly. The
 * component's own interval overwrites it a second later, but every assertion
 * runs synchronously after updateComplete, so the pinned time is what renders.
 * Timezones are pinned too (UTC and Asia/Tokyo, which has no DST) so nothing
 * depends on the machine's local zone.
 */
async function pin(el, epochMs) {
  el._now = epochMs;
  await el.updateComplete;
}

describe('arc-clock digital face', () => {
  afterEach(cleanup);

  it('renders a plausible time string', async () => {
    const el = mount('<arc-clock timezone="UTC"></arc-clock>');
    await el.updateComplete;
    const time = el.shadowRoot.querySelector('[part="time"]');
    expect(time).to.exist;
    expect(time.textContent.trim()).to.match(/\d{1,2}:\d{2}/);
  });

  it('respects show-seconds', async () => {
    const el = mount('<arc-clock timezone="UTC" show-seconds></arc-clock>');
    el.hour12 = false;
    await pin(el, Date.UTC(2026, 0, 15, 9, 5, 7));
    const text = el.shadowRoot.querySelector('[part="time"]').textContent.trim();
    expect(text).to.match(/0?9:05:07/);

    el.showSeconds = false;
    await el.updateComplete;
    const noSeconds = el.shadowRoot.querySelector('[part="time"]').textContent.trim();
    expect(noSeconds).to.match(/0?9:05$/);
  });

  it('respects hour12 in both directions', async () => {
    const el = mount('<arc-clock timezone="UTC" hour12></arc-clock>');
    await pin(el, Date.UTC(2026, 0, 15, 15, 0, 0));
    const twelve = el.shadowRoot.querySelector('[part="time"]').textContent.trim();
    expect(twelve).to.include('3:00');
    expect(twelve).to.not.include('15');

    el.hour12 = false;
    await el.updateComplete;
    const twentyFour = el.shadowRoot.querySelector('[part="time"]').textContent.trim();
    expect(twentyFour).to.include('15:00');
  });

  it('respects the timezone attribute', async () => {
    const epoch = Date.UTC(2026, 0, 15, 3, 0, 0); // no DST ambiguity: Tokyo is UTC+9 year-round
    const utc = mount('<arc-clock timezone="UTC"></arc-clock>');
    const tokyo = mount('<arc-clock timezone="Asia/Tokyo"></arc-clock>');
    utc.hour12 = false;
    tokyo.hour12 = false;
    await pin(utc, epoch);
    await pin(tokyo, epoch);
    expect(utc.shadowRoot.querySelector('[part="time"]').textContent.trim()).to.match(/0?3:00/);
    expect(tokyo.shadowRoot.querySelector('[part="time"]').textContent.trim()).to.include('12:00');
  });

  it('falls back to local time when the timezone is not recognized', async () => {
    const el = mount('<arc-clock timezone="Not/AZone"></arc-clock>');
    await el.updateComplete;
    const time = el.shadowRoot.querySelector('[part="time"]');
    expect(time.textContent.trim()).to.match(/\d{1,2}:\d{2}/);
  });

  it('shows the muted zone abbreviation only with show-timezone', async () => {
    const el = mount('<arc-clock timezone="UTC" show-timezone></arc-clock>');
    await pin(el, Date.UTC(2026, 0, 15, 9, 0, 0));
    const zone = el.shadowRoot.querySelector('[part="timezone"]');
    expect(zone).to.exist;
    expect(zone.textContent.trim()).to.have.length.greaterThan(0);

    const plain = mount('<arc-clock timezone="UTC"></arc-clock>');
    await plain.updateComplete;
    expect(plain.shadowRoot.querySelector('[part="timezone"]')).to.not.exist;
  });
});

describe('arc-clock analog face', () => {
  afterEach(cleanup);

  it('renders hands at angles matching a pinned time', async () => {
    const el = mount('<arc-clock variant="analog" timezone="UTC" show-seconds></arc-clock>');
    await pin(el, Date.UTC(2026, 0, 15, 3, 0, 0)); // 03:00:00 UTC
    const rotation = (part) =>
      el.shadowRoot.querySelector(`[part="${part}"]`).getAttribute('transform');
    expect(rotation('hand-hour')).to.equal('rotate(90 50 50)');
    expect(rotation('hand-minute')).to.equal('rotate(0 50 50)');
    expect(rotation('hand-second')).to.equal('rotate(0 50 50)');
  });

  it('folds minutes into the hour hand angle', async () => {
    const el = mount('<arc-clock variant="analog" timezone="UTC"></arc-clock>');
    await pin(el, Date.UTC(2026, 0, 15, 6, 30, 0)); // 06:30 UTC
    const hour = el.shadowRoot.querySelector('[part="hand-hour"]').getAttribute('transform');
    const minute = el.shadowRoot.querySelector('[part="hand-minute"]').getAttribute('transform');
    expect(hour).to.equal('rotate(195 50 50)');
    expect(minute).to.equal('rotate(180 50 50)');
  });

  it('renders the second hand only with show-seconds', async () => {
    const el = mount('<arc-clock variant="analog" timezone="UTC"></arc-clock>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part="hand-second"]')).to.not.exist;

    el.showSeconds = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part="hand-second"]')).to.exist;
  });

  it('renders the tick ring with 12 majors and 48 minors', async () => {
    const el = mount('<arc-clock variant="analog"></arc-clock>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.tick')).to.have.length(60);
    expect(el.shadowRoot.querySelectorAll('.tick--major')).to.have.length(12);
  });
});

describe('arc-clock lifecycle and a11y', () => {
  afterEach(cleanup);

  it('starts the timer on connect and stops it on disconnect', async () => {
    const el = mount('<arc-clock></arc-clock>');
    await el.updateComplete;
    expect(el._intervalId).to.not.be.null;
    el.remove();
    expect(el._intervalId).to.be.null;
  });

  it('exposes the time as visually-hidden text without a live region', async () => {
    const el = mount('<arc-clock variant="analog" timezone="UTC" label="Tokyo"></arc-clock>');
    await pin(el, Date.UTC(2026, 0, 15, 9, 5, 0));
    const sr = el.shadowRoot.querySelector('.sr-only');
    expect(sr).to.exist;
    expect(sr.textContent).to.include('Tokyo');
    expect(sr.textContent).to.match(/\d{1,2}:\d{2}/);
    expect(el.shadowRoot.querySelector('[aria-live]')).to.not.exist;
    // The visual face is decorative; assistive tech reads the hidden string.
    expect(el.shadowRoot.querySelector('[part="face"]').getAttribute('aria-hidden')).to.equal('true');
  });

  it('renders an unknown variant as the digital default', async () => {
    const el = mount('<arc-clock variant="cuckoo" timezone="UTC"></arc-clock>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[part="time"]')).to.exist;
    expect(el.shadowRoot.querySelector('[part="svg"]')).to.not.exist;
  });
});
