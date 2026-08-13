/**
 * arc-event-calendar — the month/week event grid.
 *
 * What this pins: `date` anchors the visible period so nothing here depends on
 * the clock, `events` render as chips on the right days including multi-day
 * spans, the month/week toggle and the prev/next/today controls move the period
 * and announce arc-period-change, and clicking a chip or a day reports what was
 * clicked.
 *
 * Locale and first-day-of-week are asserted through the shared date-names
 * helpers the component uses, which rtl-intl.test.js already pins in isolation.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record, keyOn, useBaseCss } from './helpers.js';

import '../src/data/event-calendar.register.js';

afterEach(() => cleanup());

// Chip colours come from the --chart-N palette, which lives at :root in
// base.css — without it every chip computes the same colour and the palette
// assertion would pass for the wrong reason.
useBaseCss();

// March 2026: the 1st is a Sunday, so a Monday-start month grid has six leading
// blanks and every span below is exact.
const ANCHOR = '2026-03-11';
const EVENTS = [
  { date: '2026-03-11', label: 'Standup' },
  { date: '2026-03-12', end: '2026-03-14', label: 'Offsite', color: 3 },
  { date: '2026-03-30', label: 'Retro' },
];

async function calendar(attrs = '', events = EVENTS) {
  const el = mount(`<arc-event-calendar date="${ANCHOR}" ${attrs}></arc-event-calendar>`);
  el.events = events;
  await settle(el);
  return el;
}

const dayCells = (el) => [...el.shadowRoot.querySelectorAll('[part="day"]')];
const dayFor = (el, iso) => dayCells(el).find((d) => d.dataset.iso === iso);
/** The day-number button inside a cell — the thing that is actually clickable. */
const dayButton = (el, iso) => dayFor(el, iso)?.querySelector('[part="day-number"], .cal__daynum');
const chips = (el) => [...el.shadowRoot.querySelectorAll('[part="event"]')];
const chipLabels = (el) => chips(el).map((c) => c.textContent.trim());
const title = (el) => el.shadowRoot.querySelector('[part="title"]').textContent.trim();
const part = (el, name) => el.shadowRoot.querySelector(`[part="${name}"]`);

describe('arc-event-calendar rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await calendar();
    for (const name of [
      'calendar', 'header', 'title', 'nav-prev', 'nav-next', 'today',
      'view-toggle', 'view-month', 'view-week', 'dows', 'dow', 'grid', 'day', 'day-number',
    ]) {
      expect(part(el, name), name).to.not.equal(null);
    }
  });

  it('anchors the period on the date prop rather than on today', async () => {
    const el = await calendar();
    expect(title(el)).to.contain('2026');
    expect(dayFor(el, '2026-03-11'), 'the anchored month is on screen').to.not.equal(undefined);
  });

  it('renders seven weekday headers', async () => {
    const el = await calendar();
    expect(el.shadowRoot.querySelectorAll('[part="dow"]')).to.have.lengthOf(7);
  });

  it('starts the week where the locale says', async () => {
    const gb = await calendar('locale="en-GB"');
    const us = await calendar('locale="en-US"');
    const firstDow = (el) => part(el, 'dow').textContent.trim();
    expect(firstDow(gb), 'en-GB starts on Monday').to.not.equal(firstDow(us));
  });

  it('honours an explicit first-day-of-week over the locale', async () => {
    const el = await calendar('locale="en-GB" first-day-of-week="7"');
    const forced = part(el, 'dow').textContent.trim();
    const natural = part(await calendar('locale="en-GB"'), 'dow').textContent.trim();
    expect(forced).to.not.equal(natural);
  });

  it('survives having no events', async () => {
    const el = await calendar('', []);
    expect(chips(el)).to.have.lengthOf(0);
    expect(dayCells(el).length).to.be.greaterThan(27);
  });

  it('survives never being handed events', async () => {
    const el = mount(`<arc-event-calendar date="${ANCHOR}"></arc-event-calendar>`);
    await settle(el);
    expect(part(el, 'grid')).to.not.equal(null);
  });
});

describe('arc-event-calendar events', () => {
  it('places a single-day event on its own day', async () => {
    const el = await calendar();
    const cell = dayFor(el, '2026-03-11');
    expect(cell.textContent).to.contain('Standup');
  });

  it('spans a multi-day event across every day it covers', async () => {
    const el = await calendar();
    for (const iso of ['2026-03-12', '2026-03-13', '2026-03-14']) {
      expect(dayFor(el, iso).textContent, iso).to.contain('Offsite');
    }
    expect(dayFor(el, '2026-03-15').textContent, 'and not past its end').to.not.contain('Offsite');
  });

  it('renders every event in the month', async () => {
    const el = await calendar();
    expect(chipLabels(el).filter((l) => l.includes('Standup'))).to.have.lengthOf(1);
    expect(chipLabels(el).filter((l) => l.includes('Retro'))).to.have.lengthOf(1);
  });

  it('colours a chip from the palette index', async () => {
    const el = await calendar();
    const offsite = chips(el).find((c) => c.textContent.includes('Offsite'));
    const standup = chips(el).find((c) => c.textContent.includes('Standup'));
    expect(getComputedStyle(offsite).backgroundColor, 'color: 3 differs from the default')
      .to.not.equal(getComputedStyle(standup).backgroundColor);
  });
});

describe('arc-event-calendar activation', () => {
  it('reports the clicked event with its original object', async () => {
    const el = await calendar();
    const details = [];
    el.addEventListener('arc-event-click', (e) => details.push(e.detail));

    chips(el).find((c) => c.textContent.includes('Standup')).click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].event.label).to.equal('Standup');
    expect(details[0].event.date).to.equal('2026-03-11');
  });

  it('reports a clicked day with its ISO date', async () => {
    const el = await calendar();
    const details = [];
    el.addEventListener('arc-date-click', (e) => details.push(e.detail));

    dayButton(el, '2026-03-18').click();
    await settle(el);

    expect(details).to.deep.equal([{ date: '2026-03-18' }]);
  });

  it('both events bubble and cross the shadow boundary', async () => {
    const el = await calendar();
    const heard = [];
    document.body.addEventListener('arc-event-click', (e) => heard.push(e));
    document.body.addEventListener('arc-date-click', (e) => heard.push(e));

    chips(el)[0].click();
    await settle(el);
    dayButton(el, '2026-03-18').click();
    await settle(el);

    expect(heard.length).to.be.greaterThan(0);
    expect(heard.every((e) => e.bubbles && e.composed)).to.equal(true);
  });
});

describe('arc-event-calendar period navigation', () => {
  it('moves back and forward a month', async () => {
    const el = await calendar();
    const start = title(el);

    part(el, 'nav-next').click();
    await settle(el);
    expect(title(el), 'moved on').to.not.equal(start);

    part(el, 'nav-prev').click();
    await settle(el);
    expect(title(el), 'and back').to.equal(start);
  });

  it('announces the new period with the view', async () => {
    const el = await calendar();
    const details = [];
    el.addEventListener('arc-period-change', (e) => details.push(e.detail));

    part(el, 'nav-next').click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].view).to.equal('month');
    expect(details[0].date).to.be.a('string').and.match(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('Today returns to the current period', async () => {
    const el = await calendar();
    part(el, 'today').click();
    await settle(el);

    const now = new Date();
    const yyyy = String(now.getFullYear());
    expect(title(el), 'the header names the current year').to.contain(yyyy);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await calendar();
    let event = null;
    document.body.addEventListener('arc-period-change', (e) => { event = e; }, { once: true });

    part(el, 'nav-next').click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });
});

describe('arc-event-calendar view toggle', () => {
  it('starts in month view', async () => {
    const el = await calendar();
    expect(el.view).to.equal('month');
    expect(part(el, 'view-month').getAttribute('aria-pressed')).to.equal('true');
    expect(part(el, 'view-week').getAttribute('aria-pressed')).to.equal('false');
  });

  it('switches to week view and shows fewer days', async () => {
    const el = await calendar();
    const monthDays = dayCells(el).length;

    part(el, 'view-week').click();
    await settle(el);

    expect(el.view).to.equal('week');
    expect(dayCells(el)).to.have.lengthOf(7);
    expect(monthDays).to.be.greaterThan(7);
    expect(part(el, 'view-week').getAttribute('aria-pressed')).to.equal('true');
  });

  it('announces a view change', async () => {
    const el = await calendar();
    const details = [];
    el.addEventListener('arc-period-change', (e) => details.push(e.detail));

    part(el, 'view-week').click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].view).to.equal('week');
  });

  it('keeps the anchored day visible across the switch', async () => {
    const el = await calendar();
    part(el, 'view-week').click();
    await settle(el);

    expect(dayFor(el, ANCHOR), 'the anchor stays on screen').to.not.equal(undefined);
  });

  it('an unrecognised view renders as month', async () => {
    const el = await calendar('view="decade"');
    expect(dayCells(el).length, 'a month-sized grid').to.be.greaterThan(27);
  });
});

describe('arc-event-calendar week-edge keys', () => {
  // Was part of finding #57: Home/End computed the row ends with the
  // Sunday-based getDay() while the grid is laid out from `firstDayOfWeek`, so
  // on a Monday-start calendar both keys landed one cell outside their row.
  // 2026-03-11 is a Wednesday — mid-week under either convention.
  const stop = (el) =>
    el.shadowRoot.querySelector('.cal__daynum[tabindex="0"]')?.dataset.iso;

  async function withWeekStart(firstDay) {
    const el = await calendar(`first-day-of-week="${firstDay}"`);
    return el;
  }

  it('reaches the ends of a Monday-start week', async () => {
    const el = await withWeekStart(1);
    expect(el.shadowRoot.querySelector('[part="dow"]').textContent.trim()).to.equal('Mon');

    keyOn(dayButton(el, ANCHOR), 'Home');
    await settle(el);
    expect(stop(el)).to.equal('2026-03-09');

    keyOn(dayButton(el, '2026-03-09'), 'End');
    await settle(el);
    expect(stop(el)).to.equal('2026-03-15');
  });

  it('reaches the ends of a Sunday-start week', async () => {
    const el = await withWeekStart(7);

    keyOn(dayButton(el, ANCHOR), 'Home');
    await settle(el);
    expect(stop(el)).to.equal('2026-03-08');

    keyOn(dayButton(el, '2026-03-08'), 'End');
    await settle(el);
    expect(stop(el)).to.equal('2026-03-14');
  });
});
