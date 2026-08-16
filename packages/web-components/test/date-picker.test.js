/**
 * arc-date-picker — the calendar date picker.
 *
 * What this pins: the open/close contract including the documented
 * programmatic `open`, the min/max bounds, the three-mode header (days →
 * months → years) and what "previous"/"next" mean in each, the roving tab stop
 * inside the grid, and the arrow-key navigation that pages the view when it
 * crosses a month boundary.
 *
 * Every test anchors on a fixed date rather than on today, because the view
 * defaults to the current month and half of these assertions are about which
 * month is on screen. 2026-07-15 is a Wednesday, which is what makes the
 * Home/End cases below meaningful — it is mid-week in either convention.
 *
 * Two tests are marked BUG: Home/End assume a Sunday-start week regardless of
 * `firstDayOfWeek`, and `disabled` is enforced on the click path but not on the
 * property path. See test-findings.md #57 and #58.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, tick, until, deepActive } from './helpers.js';

import '../src/input/date-picker.register.js';

afterEach(() => cleanup());

/** A Wednesday, mid-week under both a Monday-start and a Sunday-start calendar. */
const WED = '2026-07-15';

async function picker(attrs = '', props = {}) {
  const el = mount(`<arc-date-picker ${attrs}></arc-date-picker>`);
  Object.assign(el, props);
  await settle(el);
  return el;
}

/** Open via the real interaction path and settle the focus move it schedules. */
async function opened(attrs = '', props = {}) {
  const el = await picker(attrs, props);
  el.shadowRoot.querySelector('input').click();
  await settle(el);
  return el;
}

/**
 * Which panel the picker is showing, per the labels on its own nav buttons.
 *
 * `_mode` is state; the day/month/year grids and the "Previous month" /
 * "Previous year" labels are what a user meets, and the labels name the mode
 * unambiguously where the grid markup does not.
 */
const mode = (el) => ({
  'Previous month': 'days',
  'Previous year': 'months',
  'Previous years': 'years',
}[el.shadowRoot.querySelector('.nav-btn')?.getAttribute('aria-label')] ?? null);
const input = (el) => el.shadowRoot.querySelector('[part="input"]');
const dropdown = (el) => el.shadowRoot.querySelector('[part="dropdown"]');
const title = (el) => el.shadowRoot.querySelector('.calendar-title')?.textContent.trim();
const dayCells = (el) => [...el.shadowRoot.querySelectorAll('.day')];
const day = (el, iso) => el.shadowRoot.querySelector(`.day[data-iso="${iso}"]`);
const tabStop = (el) => el.shadowRoot.querySelector('.day[tabindex="0"]')?.dataset.iso ?? null;
const weekdayHeadings = (el) =>
  [...el.shadowRoot.querySelectorAll('.weekday')].map((s) => s.textContent.trim());
const navButtons = (el) => [...el.shadowRoot.querySelectorAll('.nav-btn')];
const gridCells = (el) => [...el.shadowRoot.querySelectorAll('.picker-cell')];

describe('arc-date-picker rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await opened('label="When"');
    for (const part of ['wrapper', 'label', 'input-wrapper', 'input', 'dropdown']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('presents the field as a combobox owning a dialog', async () => {
    const el = await picker();
    expect(input(el).getAttribute('role')).to.equal('combobox');
    expect(input(el).getAttribute('aria-haspopup')).to.equal('dialog');
    expect(input(el).getAttribute('aria-expanded')).to.equal('false');
  });

  it('labels the field, falling back when no label is given', async () => {
    expect(input(await picker()).getAttribute('aria-label')).to.equal('Choose date');
    expect(input(await picker('label="Depart"')).getAttribute('aria-label')).to.equal('Depart');
  });

  it('shows the placeholder until a date is chosen', async () => {
    const el = await picker('placeholder="Pick one"');
    expect(input(el).placeholder).to.equal('Pick one');
    expect(input(el).value).to.equal('');
  });

  it('formats a selected value for display while keeping value as ISO', async () => {
    const el = await picker('', { value: WED });
    expect(el.value).to.equal(WED);
    expect(input(el).value).to.equal('Jul 15, 2026');
  });

  it('leaves an unparseable value visible rather than blanking the field', async () => {
    const el = await picker('', { value: 'not-a-date' });
    expect(input(el).value).to.equal('not-a-date');
  });

  it('keeps the field read-only so the calendar is the only way in', async () => {
    const el = await picker();
    expect(input(el).readOnly).to.equal(true);
  });

  it('renders no dropdown until opened', async () => {
    const el = await picker();
    expect(dropdown(el)).to.equal(null);
  });

  it('always renders six weeks so the panel does not resize between months', async () => {
    const el = await opened('', { value: WED });
    expect(dayCells(el)).to.have.lengthOf(42);
  });
});

describe('arc-date-picker opening and closing', () => {
  it('opens on click and reports it through aria-expanded', async () => {
    const el = await opened();
    expect(dropdown(el)).to.not.equal(null);
    expect(el.open).to.equal(true);
    expect(input(el).getAttribute('aria-expanded')).to.equal('true');
  });

  it('closes on a second click', async () => {
    const el = await opened();
    input(el).click();
    await settle(el);
    expect(dropdown(el)).to.equal(null);
  });

  it('opens on the selected date\'s month, not on today', async () => {
    const el = await opened('', { value: '2020-02-10' });
    expect(title(el)).to.equal('February 2020');
  });

  it('returns to the selected month after browsing away and reopening', async () => {
    const el = await opened('', { value: '2020-02-10' });
    navButtons(el)[1].click();
    await settle(el);
    expect(title(el)).to.equal('March 2020');

    input(el).click(); // close
    await settle(el);
    input(el).click(); // reopen
    await settle(el);
    expect(title(el)).to.equal('February 2020');
  });

  it('closes on Escape and returns focus to the field', async () => {
    const el = await opened('', { value: WED });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(el);
    expect(el.open).to.equal(false);
    expect(deepActive()).to.equal(input(el));
  });

  it('ignores Escape when already closed', async () => {
    const el = await picker();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('closes on an outside click', async () => {
    const el = await opened();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    document.body.click();
    await settle(el);
    await tick();
    expect(el.open).to.equal(false);
  });

  it('resets to day mode when closed', async () => {
    const el = await opened('', { value: WED });
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(mode(el)).to.equal('months');

    input(el).click();
    await settle(el);
    input(el).click();
    await settle(el);
    expect(mode(el)).to.equal('days');
  });

  it('moves focus into the grid when opened', async () => {
    const el = await opened('', { value: WED });
    expect(await until(() => deepActive()?.dataset?.iso === WED)).to.equal(true);
  });
});

describe('arc-date-picker disabled', () => {
  it('does not open on click', async () => {
    const el = await picker('disabled');
    input(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
    expect(dropdown(el)).to.equal(null);
  });

  it('shows no calendar when `open` is set as a property', async () => {
    // The docs say `disabled` "prevent[s] the calendar from opening", and they
    // also say `open` is "Reflected so it can be opened programmatically". Only
    // _toggleDropdown() used to check `disabled`, so the two claims collided and
    // the property path won — the guard was on the interaction, not on the
    // state. `open` now declares `blockedBy: 'disabled'` (finding #58).
    //
    // This asserts through the rendered DOM rather than through `el.open`, which
    // is where conformance.test.js stops: a component could hold the property at
    // false and still render the panel from separate internal state.
    const el = await picker('disabled');
    el.open = true;
    await settle(el);
    expect(dropdown(el) === null, 'a disabled picker showing its calendar').to.equal(true);
  });

  it('does not open on click when read-only', async () => {
    const el = await picker('readonly');
    input(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
  });
});

describe('arc-date-picker selection', () => {
  it('selects a day, emits arc-change and closes', async () => {
    const el = await opened('', { value: WED });
    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));

    day(el, '2026-07-20').click();
    await settle(el);

    expect(el.value).to.equal('2026-07-20');
    expect(seen).to.deep.equal(['2026-07-20']);
    expect(el.open).to.equal(false);
  });

  it('marks the selected day and only that day', async () => {
    const el = await opened('', { value: WED });
    const selected = dayCells(el).filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(selected).to.have.lengthOf(1);
    expect(selected[0].dataset.iso).to.equal(WED);
  });

  it('selects a day from an adjacent month and pages to it', async () => {
    const el = await opened('', { value: WED });
    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail.value));

    // the trailing cells belong to August
    const outside = dayCells(el).filter((b) => b.classList.contains('outside')).at(-1);
    const iso = outside.dataset.iso;
    outside.click();
    await settle(el);

    expect(seen).to.deep.equal([iso]);
    expect(el.value).to.equal(iso);
  });

  it('gives every day an accessible date label', async () => {
    const el = await opened('', { value: WED });
    expect(day(el, WED).getAttribute('aria-label')).to.equal('July 15, 2026');
  });
});

describe('arc-date-picker min and max', () => {
  it('disables dates outside the range', async () => {
    const el = await opened('', { value: WED, min: '2026-07-10', max: '2026-07-20' });
    expect(day(el, '2026-07-09').disabled).to.equal(true);
    expect(day(el, '2026-07-10').disabled).to.equal(false);
    expect(day(el, '2026-07-20').disabled).to.equal(false);
    expect(day(el, '2026-07-21').disabled).to.equal(true);
  });

  it('does not select a disabled date on click', async () => {
    const el = await opened('', { value: WED, min: '2026-07-10' });
    const seen = [];
    el.addEventListener('arc-change', () => seen.push(1));
    day(el, '2026-07-05').click();
    await settle(el);
    expect(seen).to.have.lengthOf(0);
    expect(el.value).to.equal(WED);
  });

  it('applies each bound independently', async () => {
    const only = await opened('', { value: WED, max: '2026-07-20' });
    expect(day(only, '2026-07-01').disabled).to.equal(false);
    expect(day(only, '2026-07-21').disabled).to.equal(true);
  });

  it('treats an empty bound as no bound', async () => {
    const el = await opened('', { value: WED, min: '', max: '' });
    expect(dayCells(el).every((b) => !b.disabled)).to.equal(true);
  });
});

describe('arc-date-picker month and mode navigation', () => {
  it('steps months and wraps the year in both directions', async () => {
    const el = await opened('', { value: '2026-01-15' });
    navButtons(el)[0].click();
    await settle(el);
    expect(title(el)).to.equal('December 2025');

    navButtons(el)[1].click();
    await settle(el);
    navButtons(el)[1].click();
    await settle(el);
    expect(title(el)).to.equal('February 2026');
  });

  it('wraps forward from December into the next year', async () => {
    const el = await opened('', { value: '2026-12-15' });
    navButtons(el)[1].click();
    await settle(el);
    expect(title(el)).to.equal('January 2027');
  });

  it('cycles the title through days → months → years → days', async () => {
    const el = await opened('', { value: WED });
    const cycle = el.shadowRoot.querySelector('.calendar-title');

    expect(title(el)).to.equal('July 2026');
    cycle.click();
    await settle(el);
    expect(title(el)).to.equal('2026');
    expect(gridCells(el)).to.have.lengthOf(12);

    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(title(el)).to.equal('2021 – 2032');

    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(title(el)).to.equal('July 2026');
  });

  it('re-labels the nav buttons for the mode they page', async () => {
    const el = await opened('', { value: WED });
    expect(navButtons(el)[0].getAttribute('aria-label')).to.equal('Previous month');

    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(navButtons(el)[0].getAttribute('aria-label')).to.equal('Previous year');

    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(navButtons(el)[0].getAttribute('aria-label')).to.equal('Previous years');
  });

  it('pages by a year in month mode and by twelve in year mode', async () => {
    const el = await opened('', { value: WED });
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    navButtons(el)[1].click();
    await settle(el);
    expect(title(el)).to.equal('2027');

    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    expect(title(el)).to.equal('2022 – 2033');
    navButtons(el)[1].click();
    await settle(el);
    expect(title(el)).to.equal('2034 – 2045');
  });

  it('picking a month returns to days on that month', async () => {
    const el = await opened('', { value: WED });
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    gridCells(el)[0].click(); // January
    await settle(el);
    expect(title(el)).to.equal('January 2026');
  });

  it('picking a year steps down to months rather than all the way to days', async () => {
    const el = await opened('', { value: WED });
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    gridCells(el)[0].click(); // 2021
    await settle(el);
    expect(mode(el)).to.equal('months');
    expect(title(el)).to.equal('2021');
  });

  it('marks the current month and year in their grids', async () => {
    const el = await opened('', { value: WED });
    el.shadowRoot.querySelector('.calendar-title').click();
    await settle(el);
    const current = gridCells(el).filter((c) => c.classList.contains('current'));
    expect(current).to.have.lengthOf(1);
    expect(current[0].textContent.trim()).to.contain('Jul');
  });
});

describe('arc-date-picker roving tab stop', () => {
  it('keeps exactly one day focusable', async () => {
    const el = await opened('', { value: WED });
    expect(el.shadowRoot.querySelectorAll('.day[tabindex="0"]')).to.have.lengthOf(1);
  });

  it('prefers the selected date', async () => {
    const el = await opened('', { value: WED });
    expect(tabStop(el)).to.equal(WED);
  });

  it('falls back to a day in the visible month when nothing is selected', async () => {
    const el = await opened();
    expect(tabStop(el)).to.not.equal(null);
    expect(day(el, tabStop(el)).classList.contains('outside')).to.equal(false);
  });

  it('never lands on a disabled day', async () => {
    const el = await opened('', { value: WED, min: '2026-07-20' });
    expect(day(el, tabStop(el)).disabled).to.equal(false);
  });
});

describe('arc-date-picker keyboard navigation', () => {
  const arrow = async (el, key, fromIso = WED) => {
    keyOn(day(el, fromIso), key);
    await settle(el);
  };

  it('moves a day at a time with left and right', async () => {
    const el = await opened('', { value: WED });
    await arrow(el, 'ArrowRight');
    expect(tabStop(el)).to.equal('2026-07-16');
    await arrow(el, 'ArrowLeft', '2026-07-16');
    expect(tabStop(el)).to.equal(WED);
  });

  it('moves a week at a time with up and down', async () => {
    const el = await opened('', { value: WED });
    await arrow(el, 'ArrowDown');
    expect(tabStop(el)).to.equal('2026-07-22');
    await arrow(el, 'ArrowUp', '2026-07-22');
    expect(tabStop(el)).to.equal(WED);
  });

  it('pages the view when navigation crosses a month boundary', async () => {
    const el = await opened('', { value: '2026-07-31' });
    keyOn(day(el, '2026-07-31'), 'ArrowRight');
    await settle(el);
    expect(title(el)).to.equal('August 2026');
    expect(tabStop(el)).to.equal('2026-08-01');
  });

  it('moves focus, not just the tab stop', async () => {
    const el = await opened('', { value: WED });
    keyOn(day(el, WED), 'ArrowRight');
    await settle(el);
    expect(await until(() => deepActive()?.dataset?.iso === '2026-07-16')).to.equal(true);
  });

  it('refuses to move onto a date outside the bounds', async () => {
    const el = await opened('', { value: WED, max: '2026-07-15' });
    await arrow(el, 'ArrowRight');
    expect(tabStop(el), 'stays put at the boundary').to.equal(WED);
  });

  it('leaves other keys to the browser', async () => {
    const el = await opened('', { value: WED });
    const e = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    day(el, WED).dispatchEvent(e);
    await settle(el);
    expect(e.defaultPrevented).to.equal(false);
  });

  it('Home and End reach the ends of a Sunday-start week', async () => {
    // firstDayOfWeek 7 = Sunday: the row containing Wed 15 July runs
    // Sun 12 → Sat 18, which is what the implementation assumes.
    const el = await opened('', { value: WED, firstDayOfWeek: 7 });
    await arrow(el, 'Home');
    expect(tabStop(el)).to.equal('2026-07-12');
    await arrow(el, 'End', '2026-07-12');
    expect(tabStop(el)).to.equal('2026-07-18');
  });

  it('Home and End follow firstDayOfWeek rather than assuming Sunday', async () => {
    // Was finding #57. With a Monday-start week the row containing Wed 15 July
    // runs Mon 13 → Sun 19; the old code computed row ends with the
    // Sunday-based getDay() and landed on Sun 12 (the last cell of the
    // *previous* row) and Sat 18 (one short of this row's end).
    const el = await opened('', { value: WED, firstDayOfWeek: 1 });

    // anti-vacuity: the grid really is rendered Monday-first
    expect(weekdayHeadings(el)[0]).to.equal('Mon');

    await arrow(el, 'Home');
    expect(tabStop(el)).to.equal('2026-07-13');
    await arrow(el, 'End', '2026-07-13');
    expect(tabStop(el)).to.equal('2026-07-19');
  });
});

describe('arc-date-picker locale and week start', () => {
  it('starts the week on the requested day', async () => {
    const monday = await opened('', { value: WED, firstDayOfWeek: 1 });
    expect(weekdayHeadings(monday)[0]).to.equal('Mon');

    const sunday = await opened('', { value: WED, firstDayOfWeek: 7 });
    expect(weekdayHeadings(sunday)[0]).to.equal('Sun');
  });

  it('renders seven weekday headings', async () => {
    const el = await opened('', { value: WED });
    expect(weekdayHeadings(el)).to.have.lengthOf(7);
  });

  it('shifts the leading blanks with the week start', async () => {
    // Read one, then the other. Opening a second picker moves focus into it,
    // which pulls focus out of the first — and DismissController closes it, so
    // its grid is gone by the time a side-by-side comparison would read it.
    const firstCell = (el) => dayCells(el)[0].dataset.iso;

    const monday = firstCell(await opened('', { value: WED, firstDayOfWeek: 1 }));
    const sunday = firstCell(await opened('', { value: WED, firstDayOfWeek: 7 }));

    // July 2026 starts on a Wednesday, so the two conventions cannot agree
    expect(monday).to.not.equal(sunday);
  });

  it('names months in the requested locale', async () => {
    const el = await opened('', { value: WED, locale: 'de-DE' });
    expect(title(el)).to.equal('Juli 2026');
  });

  it('names weekdays in the requested locale', async () => {
    const el = await opened('', { value: WED, locale: 'de-DE', firstDayOfWeek: 1 });
    expect(weekdayHeadings(el)[0]).to.not.equal('Mon');
  });
});
