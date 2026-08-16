/**
 * arc-uptime turns an array of periods into a status strip: every datum gets
 * a tick, numbers pass through the documented thresholds, explicit statuses
 * win over derived ones, and the summary percentage is the mean of whatever
 * values exist — including values riding along on status objects.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';
import { ArcUptime } from '../src/data/uptime.js';

// The .register.js is generated and may not exist yet on a fresh branch;
// registering here (guarded) keeps the test independent of `pnpm generate`.
if (!customElements.get('arc-uptime')) customElements.define('arc-uptime', ArcUptime);

afterEach(() => cleanup());

/** Mount a strip with the given data (and optional extra attributes). */
async function strip(data, attrs = '') {
  const el = mount(`<arc-uptime ${attrs}></arc-uptime>`);
  el.data = data;
  await el.updateComplete;
  return el;
}

const ticks = (el) => [...el.shadowRoot.querySelectorAll('[part="tick"]')];
const statusOf = (tick) =>
  [...tick.classList].find((c) => c.startsWith('status--'))?.slice('status--'.length);

describe('ticks', () => {
  it('renders one tick per datum', async () => {
    const el = await strip([1, 1, 0.97, 0.5, { status: 'none' }]);
    expect(ticks(el).length).to.equal(5);
  });

  it('maps numbers to status by threshold', async () => {
    const el = await strip([1, 0.99, 0.98, 0.95, 0.949, 0]);
    expect(ticks(el).map(statusOf)).to.deep.equal([
      'up', 'up', 'degraded', 'degraded', 'down', 'down',
    ]);
  });

  it('lets an explicit status win over the value-derived one', async () => {
    const el = await strip([
      { value: 1, status: 'down' },   // value says up, status pins down
      { value: 0.5 },                 // no status: derived from value
      { status: 'degraded' },         // status only
      {},                             // neither: neutral track
    ]);
    expect(ticks(el).map(statusOf)).to.deep.equal(['down', 'down', 'degraded', 'none']);
  });

  it('treats non-finite and junk entries as none', async () => {
    const el = await strip([NaN, { value: NaN }, null, undefined]);
    expect(ticks(el).map(statusOf)).to.deep.equal(['none', 'none', 'none', 'none']);
  });
});

describe('summary', () => {
  it('averages every finite value, across both entry forms', async () => {
    // (1 + 0.9 + 0.98) / 3 = 0.96 — the status-only and empty entries are
    // excluded from the math but still count as ticks.
    const el = await strip([1, { value: 0.9, status: 'down' }, 0.98, { status: 'up' }, {}]);
    const summary = el.shadowRoot.querySelector('[part="summary"]');
    expect(summary.textContent.trim()).to.equal('96% uptime');
  });

  it('trims trailing zeros but keeps real precision', async () => {
    const el = await strip([0.9998, 0.9998]);
    const summary = el.shadowRoot.querySelector('[part="summary"]');
    expect(summary.textContent.trim()).to.equal('99.98% uptime');
  });

  it('is omitted when no entry carries a value', async () => {
    const el = await strip([{ status: 'up' }, { status: 'down' }]);
    expect(el.shadowRoot.querySelector('[part="summary"]')).to.equal(null);
  });

  it('is omitted when summary="false"', async () => {
    const el = await strip([1, 1], 'summary="false"');
    expect(el.shadowRoot.querySelector('[part="summary"]')).to.equal(null);
  });
});

describe('empty data', () => {
  it('renders an empty track, no summary, and stays out of the tab order', async () => {
    const el = await strip([]);
    const track = el.shadowRoot.querySelector('[part="track"]');
    expect(track).to.not.equal(null);
    expect(ticks(el).length).to.equal(0);
    expect(el.shadowRoot.querySelector('[part="summary"]')).to.equal(null);
    expect(track.getAttribute('tabindex')).to.equal('-1');
    expect(track.getAttribute('aria-label')).to.equal('Uptime history: no data');
  });

  it('survives never being handed data at all', async () => {
    const el = mount('<arc-uptime></arc-uptime>');
    await el.updateComplete;
    expect(ticks(el).length).to.equal(0);
  });
});

describe('labels', () => {
  it('renders the caption ends from start-label and end-label', async () => {
    const el = await strip([1, 1], 'start-label="90 days ago" end-label="Today"');
    const caption = el.shadowRoot.querySelector('[part="caption"]');
    expect(caption.textContent).to.include('90 days ago');
    expect(caption.textContent).to.include('Today');
  });

  it('omits the caption row when neither label is set', async () => {
    const el = await strip([1, 1]);
    expect(el.shadowRoot.querySelector('[part="caption"]')).to.equal(null);
  });

  it('shows a datum label in the detail bubble for the active tick', async () => {
    const el = await strip([1, { value: 0.9412, status: 'down', label: 'Mar 4' }]);
    ticks(el)[1].dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true }));
    await el.updateComplete;
    const detail = el.shadowRoot.querySelector('[part="detail"]');
    expect(detail.textContent).to.include('Mar 4');
    expect(detail.textContent).to.include('94.12%');
    expect(detail.textContent).to.include('Outage');
  });
});

/**
 * Which tick the strip is showing as active, read off the class it marks.
 * `_activeIndex` is state; `is-active` and the detail bubble are the strip.
 */
const activeAt = (el) => {
  const i = ticks(el).findIndex((t) => t.classList.contains('is-active'));
  return i === -1 ? null : i;
};

describe('keyboard inspection', () => {
  it('walks ticks with arrows and announces the active one', async () => {
    const el = await strip([1, 0.97, { status: 'down', label: 'Yesterday' }]);
    const track = el.shadowRoot.querySelector('[part="track"]');

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(activeAt(el)).to.equal(0);
    expect(ticks(el)[0].classList.contains('is-active')).to.equal(true);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    expect(activeAt(el)).to.equal(2);
    const live = el.shadowRoot.querySelector('[role="status"]');
    expect(live.textContent).to.include('Yesterday');

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(activeAt(el)).to.equal(null);
    expect(el.shadowRoot.querySelector('[part="detail"]')).to.equal(null);
  });

  it('summarises the strip in the track aria-label', async () => {
    const el = await strip([1, 1, { value: 0.5, status: 'down' }, { status: 'degraded' }]);
    const label = el.shadowRoot.querySelector('[part="track"]').getAttribute('aria-label');
    expect(label).to.include('4 periods');
    expect(label).to.include('1 outage period');
    expect(label).to.include('1 degraded');
  });
});
