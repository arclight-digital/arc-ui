/**
 * arc-activity-heatmap turns { date, value } entries into a week-column
 * contribution grid: the span is a pure function of end-date, weeks and
 * week-start, dates land at index (row = i % 7, column = i / 7), intensity
 * follows the quartile ramp unless max pins a linear one, and inspection is
 * uptime's one-tab-stop pattern with grid-semantics arrows.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';
import { ArcActivityHeatmap } from '../src/data/activity-heatmap.js';

// The .register.js is generated and may not exist yet on a fresh branch;
// registering here (guarded) keeps the test independent of `pnpm generate`.
if (!customElements.get('arc-activity-heatmap')) {
  customElements.define('arc-activity-heatmap', ArcActivityHeatmap);
}

afterEach(() => cleanup());

// 2026-03-14 is a Saturday: with a Sunday week start the last column is full,
// so every span below is exact and none of the assertions depend on "today".
const END = 'end-date="2026-03-14"';

/** Mount a heatmap with the given data (and optional extra attributes). */
async function heatmap(data, attrs = END) {
  const el = mount(`<arc-activity-heatmap ${attrs}></arc-activity-heatmap>`);
  el.data = data;
  await el.updateComplete;
  return el;
}

const cells = (el) => [...el.shadowRoot.querySelectorAll('[part="cell"]')];
const levelOf = (cell) =>
  [...cell.classList].find((c) => c.startsWith('level-'))?.slice('level-'.length);
const cellByDate = (el, date) =>
  el.shadowRoot.querySelector(`[part="cell"][data-date="${date}"]`);

describe('span and grid positions', () => {
  it('renders weeks * 7 cells when the end date closes its week', async () => {
    const el = await heatmap([], `${END} weeks="2"`);
    expect(cells(el).length).to.equal(14);
    const year = await heatmap([], END); // default 52 weeks
    expect(cells(year).length).to.equal(364);
  });

  it('runs from the week start of the oldest column through the end date', async () => {
    const el = await heatmap([], `${END} weeks="2"`);
    const dates = cells(el).map((c) => c.dataset.date);
    expect(dates[0]).to.equal('2026-03-01'); // the Sunday two weeks back
    expect(dates[dates.length - 1]).to.equal('2026-03-14');
  });

  it('places a date at row index % 7 in its week column', async () => {
    const el = await heatmap([], `${END} weeks="2"`);
    const cell = cellByDate(el, '2026-03-11'); // a Wednesday in the second week
    const index = Number(cell.dataset.index);
    expect(index).to.equal(10);
    expect(index % 7).to.equal(3);            // Sunday-start row: Wed = 3
    expect(Math.floor(index / 7)).to.equal(1);
  });

  it('truncates the last column after a mid-week end date', async () => {
    // 2026-03-11 is a Wednesday: 1 full week + Sun..Wed of the last one.
    const el = await heatmap([], 'end-date="2026-03-11" weeks="2"');
    expect(cells(el).length).to.equal(11);
    const dates = cells(el).map((c) => c.dataset.date);
    expect(dates[dates.length - 1]).to.equal('2026-03-11');
  });
});

describe('week-start', () => {
  it('re-anchors columns and rows on monday', async () => {
    const el = await heatmap([], `${END} week-start="monday"`);
    // Saturday sits at row 5 of a Monday week, so the last column holds 6 days.
    expect(cells(el).length).to.equal(51 * 7 + 6);
    expect(cells(el)[0].dataset.date).to.equal('2025-03-17'); // a Monday
    const wed = cellByDate(el, '2026-03-11');
    expect(Number(wed.dataset.index) % 7).to.equal(2);        // Monday-start row: Wed = 2
  });

  it('moves the sparse weekday labels to the matching rows', async () => {
    const sun = await heatmap([], `${END} weeks="2"`);
    const mon = await heatmap([], `${END} weeks="2" week-start="monday"`);
    const rowsOf = (el) => [...el.shadowRoot.querySelectorAll('[part="weekday"]')]
      .map((l) => l.style.gridRow);
    expect(rowsOf(sun)).to.deep.equal(['2', '4', '6']); // Mon/Wed/Fri under Sunday start
    expect(rowsOf(mon)).to.deep.equal(['1', '3', '5']); // Mon/Wed/Fri under Monday start
  });
});

describe('intensity', () => {
  it('assigns steps 1-4 by quartile of the nonzero values', async () => {
    // Values 1..8: sorted quartile cuts land at 3, 5 and 7, so the ramp
    // splits into pairs — [1,2] [3,4] [5,6] [7,8].
    const data = Array.from({ length: 8 }, (_, i) => ({
      date: `2026-03-0${i + 1}`,
      value: i + 1,
    }));
    const el = await heatmap(data, `${END} weeks="2"`);
    const levels = data.map((d) => levelOf(cellByDate(el, d.date)));
    expect(levels).to.deep.equal(['1', '1', '2', '2', '3', '3', '4', '4']);
  });

  it('renders days with no entry (or zero) as step 0', async () => {
    const el = await heatmap([{ date: '2026-03-04', value: 0 }], `${END} weeks="2"`);
    expect(levelOf(cellByDate(el, '2026-03-04'))).to.equal('0');
    expect(levelOf(cellByDate(el, '2026-03-05'))).to.equal('0');
  });

  it('switches to a linear ramp when max is set', async () => {
    const data = [
      { date: '2026-03-01', value: 2 },
      { date: '2026-03-02', value: 4 },
      { date: '2026-03-03', value: 6 },
      { date: '2026-03-04', value: 8 },
      { date: '2026-03-05', value: 100 }, // above max clamps to 4
    ];
    const el = await heatmap(data, `${END} weeks="2" max="8"`);
    const levels = data.map((d) => levelOf(cellByDate(el, d.date)));
    expect(levels).to.deep.equal(['1', '2', '3', '4', '4']);
  });
});

describe('empty data', () => {
  it('renders the full span as empty cells and still summarises', async () => {
    const el = await heatmap([], `${END} weeks="2"`);
    expect(cells(el).length).to.equal(14);
    expect(cells(el).every((c) => levelOf(c) === '0')).to.equal(true);
    const grid = el.shadowRoot.querySelector('[part="grid"]');
    expect(grid.getAttribute('aria-label')).to.include('14 days');
    expect(grid.getAttribute('aria-label')).to.include('0 total');
  });

  it('survives never being handed data at all', async () => {
    const el = mount(`<arc-activity-heatmap ${END} weeks="2"></arc-activity-heatmap>`);
    await el.updateComplete;
    expect(cells(el).length).to.equal(14);
  });

  it('anchors on today when end-date is unset in the browser', async () => {
    const el = mount('<arc-activity-heatmap weeks="2"></arc-activity-heatmap>');
    await el.updateComplete;
    const d = new Date();
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dates = cells(el).map((c) => c.dataset.date);
    expect(dates[dates.length - 1]).to.equal(iso);
  });
});

/**
 * Which day the heatmap is showing as active, read off the cell it marks.
 *
 * `_activeIndex` is state; `is-active` and the detail bubble are what a user
 * sees. Hovering is also how the index is set in practice, so the setup below
 * goes through the pointer rather than through the field.
 */
const activeAt = (el) => {
  const i = cells(el).findIndex((c) => c.classList.contains('is-active'));
  return i === -1 ? null : i;
};
const hover = (el, i) => {
  cells(el)[i].dispatchEvent(new PointerEvent('pointerover', { bubbles: true, composed: true }));
  return el.updateComplete;
};

describe('detail bubble', () => {
  it('shows the date with the label, or the bare value, or "No activity"', async () => {
    const el = await heatmap([
      { date: '2026-03-04', value: 7, label: '7 commits' },
      { date: '2026-03-05', value: 3 },
    ], `${END} weeks="2"`);

    await hover(el, 3); // 2026-03-04
    let detail = el.shadowRoot.querySelector('[part="detail"]');
    expect(detail.textContent).to.include('Mar 4, 2026');
    expect(detail.textContent).to.include('7 commits');

    await hover(el, 4); // 2026-03-05, no label
    detail = el.shadowRoot.querySelector('[part="detail"]');
    expect(detail.textContent).to.include('3');

    await hover(el, 6); // an empty day
    detail = el.shadowRoot.querySelector('[part="detail"]');
    expect(detail.textContent).to.include('No activity');
  });
});

describe('keyboard grid navigation', () => {
  const key = (el, k) => {
    el.shadowRoot.querySelector('[part="grid"]')
      .dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    return el.updateComplete;
  };

  it('moves by day vertically and by week horizontally', async () => {
    const el = await heatmap([{ date: '2026-03-14', value: 2, label: 'Launch day' }],
      `${END} weeks="2"`);

    await key(el, 'ArrowDown');            // first press lands, no jump
    expect(activeAt(el)).to.equal(0);
    await key(el, 'ArrowDown');
    expect(activeAt(el)).to.equal(1);
    await key(el, 'ArrowRight');           // a week later, same weekday
    expect(activeAt(el)).to.equal(8);
    await key(el, 'ArrowUp');
    expect(activeAt(el)).to.equal(7);
    await key(el, 'ArrowLeft');
    expect(activeAt(el)).to.equal(0);
    await key(el, 'ArrowUp');              // clamped at the first day
    expect(activeAt(el)).to.equal(0);

    await key(el, 'End');
    expect(activeAt(el)).to.equal(13);
    expect(cells(el)[13].classList.contains('is-active')).to.equal(true);
    const live = el.shadowRoot.querySelector('[role="status"]');
    expect(live.textContent).to.include('Launch day');

    await key(el, 'Home');
    expect(activeAt(el)).to.equal(0);
    await key(el, 'Escape');
    expect(activeAt(el)).to.equal(null);
    expect(el.shadowRoot.querySelector('[part="detail"]')).to.equal(null);
  });

  it('is one tab stop with a computed summary label', async () => {
    const el = await heatmap([
      { date: '2026-03-04', value: 7 },
      { date: '2026-03-05', value: 3 },
    ], `${END} weeks="2"`);
    const grid = el.shadowRoot.querySelector('[part="grid"]');
    expect(grid.getAttribute('tabindex')).to.equal('0');
    expect(grid.getAttribute('role')).to.equal('img');
    const label = grid.getAttribute('aria-label');
    expect(label).to.include('14 days');
    expect(label).to.include('Mar 14, 2026');
    expect(label).to.include('10 total');
    expect(label).to.include('2 active days');
  });
});

describe('legend', () => {
  it('renders the five-step strip by default and drops it on legend="false"', async () => {
    const el = await heatmap([], `${END} weeks="2"`);
    expect(el.shadowRoot.querySelectorAll('[part="swatch"]').length).to.equal(5);
    const off = await heatmap([], `${END} weeks="2" legend="false"`);
    expect(off.shadowRoot.querySelector('[part="legend"]')).to.equal(null);
  });
});
