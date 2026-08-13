/**
 * arc-time-picker — column-based time picker.
 *
 * The arithmetic worth testing is `_to24h`'s 12-hour mapping, and it has exactly
 * two edges: 12 AM is 00 and 12 PM is 12, while every other hour is `h` or
 * `h + 12`. A fixture of "14:30" alone exercises only the `h + 12` branch and
 * lets both edges stay broken, so the times here are deliberately 00:15, 12:45
 * and 14:30 — one per branch.
 *
 * Note `_getHours()` in 12h mode returns [12, 1, 2, … 11]: 12 is *first*, not
 * where a naive 1-12 ordering would put it. Index-based assertions have to
 * account for that, which is itself worth pinning.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, keyOn, deepActive, record, only } from './helpers.js';

import '../src/input/time-picker.register.js';

afterEach(() => cleanup());

async function picker(attrs = '', props = {}) {
  const el = mount(`<arc-time-picker ${attrs}></arc-time-picker>`);
  Object.assign(el, props);
  await settle(el);
  return el;
}

const field = (el) => el.shadowRoot.querySelector('input');
const dropdown = (el) => el.shadowRoot.querySelector('.dropdown');
const column = (el, label) => el.shadowRoot.querySelector(`.column[aria-label="${label}"]`);
const cells = (el, label) => [...(column(el, label)?.querySelectorAll('button') ?? [])];
const cellText = (el, label) => cells(el, label).map((b) => b.textContent.trim());
const cellFor = (el, label, text) => cells(el, label).find((b) => b.textContent.trim() === text);

/** Open through the documented path — the click handler, not the property. */
async function opened(attrs = '', props = {}) {
  const el = await picker(attrs, props);
  field(el).click();
  await settle(el);
  return el;
}

describe('arc-time-picker display', () => {
  it('shows nothing when there is no value', async () => {
    const el = await picker('placeholder="Pick one"');
    expect(field(el).value).to.equal('');
    expect(field(el).placeholder).to.equal('Pick one');
  });

  it('formats an afternoon time in 12h', async () => {
    const el = await picker('', { value: '14:30' });
    expect(field(el).value).to.equal('2:30 PM');
  });

  it('formats midnight as 12 AM, not 0 AM', async () => {
    const el = await picker('', { value: '00:15' });
    expect(field(el).value).to.equal('12:15 AM');
  });

  it('formats noon as 12 PM, not 0 PM', async () => {
    const el = await picker('', { value: '12:45' });
    expect(field(el).value).to.equal('12:45 PM');
  });

  it('formats in 24h with a zero-padded hour', async () => {
    const el = await picker('format="24h"', { value: '09:05' });
    expect(field(el).value).to.equal('09:05');
  });

  it('leaves an unparseable value alone rather than rendering NaN', async () => {
    const el = await picker('', { value: 'not-a-time' });
    expect(field(el).value).to.equal('not-a-time');
  });

  it('is a read-only input, so typing cannot desync it from value', async () => {
    const el = await picker();
    expect(field(el).readOnly).to.equal(true);
  });
});

describe('arc-time-picker columns', () => {
  it('lists 12h hours starting at 12', async () => {
    const el = await opened();
    expect(cellText(el, 'Hours')).to.eql(
      ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    );
  });

  it('lists 24h hours zero-padded from 00', async () => {
    const el = await opened('format="24h"');
    const hours = cellText(el, 'Hours');
    expect(hours.length).to.equal(24);
    expect(hours[0]).to.equal('00');
    expect(hours[23]).to.equal('23');
  });

  it('shows an AM/PM column only in 12h', async () => {
    const el = await opened();
    expect(cellText(el, 'AM or PM')).to.eql(['AM', 'PM']);
  });

  it('drops the AM/PM column in 24h', async () => {
    const el = await opened('format="24h"');
    expect(column(el, 'AM or PM'), 'a 24h picker offered AM/PM').to.equal(null);
  });

  it('lists every minute at the default step', async () => {
    const el = await opened();
    expect(cells(el, 'Minutes').length).to.equal(60);
  });

  it('honours a step of 15', async () => {
    const el = await opened('step="15"');
    expect(cellText(el, 'Minutes')).to.eql(['00', '15', '30', '45']);
  });

  it('honours a step of 30', async () => {
    const el = await opened('step="30"');
    expect(cellText(el, 'Minutes')).to.eql(['00', '30']);
  });

  it('never produces a zero-length step', async () => {
    // _getMinutes clamps with Math.max(1, …); a step of 0 would otherwise loop
    // forever and hang the runner rather than fail.
    const el = await opened('step="0"');
    expect(cells(el, 'Minutes').length).to.equal(60);
  });
});

describe('arc-time-picker selection', () => {
  it('emits a 24h value for an afternoon pick', async () => {
    const el = await opened('step="30"');
    const seen = record(el, ['arc-change']);
    cellFor(el, 'Hours', '2').click();
    await settle(el);
    cellFor(el, 'AM or PM', 'PM').click();
    await settle(el);
    cellFor(el, 'Minutes', '30').click();
    await settle(el);

    expect(el.value).to.equal('14:30');
    expect(only(seen, 'change').at(-1)[1]).to.equal('14:30');
  });

  it('maps 12 AM to 00, not 12', async () => {
    const el = await opened('step="30"');
    cellFor(el, 'Hours', '12').click();
    await settle(el);
    cellFor(el, 'AM or PM', 'AM').click();
    await settle(el);
    cellFor(el, 'Minutes', '30').click();
    await settle(el);
    expect(el.value, '12 AM came out as 12:30').to.equal('00:30');
  });

  it('maps 12 PM to 12, not 24', async () => {
    const el = await opened('step="30"');
    cellFor(el, 'Hours', '12').click();
    await settle(el);
    cellFor(el, 'AM or PM', 'PM').click();
    await settle(el);
    cellFor(el, 'Minutes', '30').click();
    await settle(el);
    expect(el.value, '12 PM came out as 24:30').to.equal('12:30');
  });

  it('takes a 24h hour at face value', async () => {
    const el = await opened('format="24h" step="30"');
    cellFor(el, 'Hours', '18').click();
    await settle(el);
    cellFor(el, 'Minutes', '30').click();
    await settle(el);
    expect(el.value).to.equal('18:30');
  });

  it('waits for both columns before emitting anything', async () => {
    const el = await opened('step="30"');
    const seen = record(el, ['arc-change']);
    cellFor(el, 'Hours', '3').click();
    await settle(el);
    expect(el.value, 'emitted on a half-made selection').to.equal('');
    expect(only(seen, 'change').length).to.equal(0);
  });

  it('closes the dropdown once the value is complete', async () => {
    const el = await opened('step="30"', { value: '09:00' });
    cellFor(el, 'Minutes', '30').click();
    await settle(el);
    expect(el.open).to.equal(false);
    expect(dropdown(el) === null, 'dropdown survived the pick').to.equal(true);
  });

  it('marks the selected cells', async () => {
    const el = await opened('step="15"', { value: '14:30' });
    expect(cellFor(el, 'Hours', '2').getAttribute('aria-selected')).to.equal('true');
    expect(cellFor(el, 'Minutes', '30').getAttribute('aria-selected')).to.equal('true');
    expect(cellFor(el, 'AM or PM', 'PM').getAttribute('aria-selected')).to.equal('true');
  });
});

describe('arc-time-picker min and max', () => {
  it('disables hours entirely below min', async () => {
    // min 09:00, so every minute of 8 AM is out of range and the hour goes dead.
    const el = await opened('min="09:00" step="30"');
    expect(cellFor(el, 'Hours', '8').disabled, '8 AM should be unreachable').to.equal(true);
    expect(cellFor(el, 'Hours', '9').disabled, '9 AM is exactly min').to.equal(false);
  });

  it('disables hours entirely above max', async () => {
    // The period comes from the value rather than from a click: clicking PM
    // would complete the selection, emit, and close the dropdown out from under
    // the assertion. _isHourDisabled reads _selectedPeriod either way.
    const el = await opened('max="17:00" step="30"', { value: '13:00' });
    expect(cellFor(el, 'AM or PM', 'PM').getAttribute('aria-selected'), 'not in PM').to.equal(
      'true',
    );
    expect(cellFor(el, 'Hours', '6').disabled, '6 PM is past max').to.equal(true);
    expect(cellFor(el, 'Hours', '5').disabled, '5 PM is exactly max').to.equal(false);
  });

  it('keeps an hour alive when only some of its minutes are out of range', async () => {
    // min 09:30 — 9 AM still has 9:30 and 9:45, so the hour must stay pickable.
    const el = await opened('min="09:30" step="15"');
    expect(cellFor(el, 'Hours', '9').disabled, 'a partly-valid hour went dead').to.equal(false);
  });

  it('disables just the out-of-range minutes of a partly-valid hour', async () => {
    const el = await opened('min="09:30" step="15"', { value: '09:45' });
    expect(cellFor(el, 'Minutes', '00').disabled).to.equal(true);
    expect(cellFor(el, 'Minutes', '15').disabled).to.equal(true);
    expect(cellFor(el, 'Minutes', '30').disabled).to.equal(false);
  });

  it('leaves everything enabled with no bounds', async () => {
    const el = await opened('step="30"');
    expect(cells(el, 'Hours').some((b) => b.disabled), 'bounds appeared from nowhere').to.equal(
      false,
    );
  });

  it('ignores an unparseable bound rather than disabling everything', async () => {
    const el = await opened('min="garbage" step="30"');
    expect(cells(el, 'Hours').every((b) => !b.disabled)).to.equal(true);
  });

  it('refuses a click on a disabled cell', async () => {
    const el = await opened('min="09:00" step="30"', { value: '10:00' });
    const eight = cellFor(el, 'Hours', '8');
    expect(eight.disabled, 'nothing was disabled, so this is vacuous').to.equal(true);
    eight.click();
    await settle(el);
    expect(el.value).to.equal('10:00');
  });
});

describe('arc-time-picker roving tabindex', () => {
  it('gives each column exactly one tab stop', async () => {
    const el = await opened('step="15"');
    for (const label of ['Hours', 'Minutes', 'AM or PM']) {
      const stops = cells(el, label).filter((b) => b.getAttribute('tabindex') === '0');
      expect(stops.length, `${label} had ${stops.length} tab stops`).to.equal(1);
    }
  });

  it('puts the tab stop on the selected cell', async () => {
    const el = await opened('step="15"', { value: '14:30' });
    expect(cellFor(el, 'Hours', '2').getAttribute('tabindex')).to.equal('0');
    expect(cellFor(el, 'Minutes', '30').getAttribute('tabindex')).to.equal('0');
  });

  it('falls back to the first enabled cell when nothing is selected', async () => {
    const el = await opened('min="09:00" step="30"');
    // 12 AM through 8 AM are all out of range, so the stop must skip them.
    expect(cellFor(el, 'Hours', '9').getAttribute('tabindex'), 'stop landed on a dead cell').to.equal(
      '0',
    );
  });
});

describe('arc-time-picker keyboard', () => {
  it('moves down a column with ArrowDown', async () => {
    const el = await opened('step="30"');
    const hours = column(el, 'Hours');
    const first = cells(el, 'Hours')[0];
    first.focus();
    keyOn(first, 'ArrowDown');
    await settle(el);
    expect(deepActive().textContent.trim(), 'ArrowDown did not advance').to.equal('1');
    expect(hours.contains(deepActive()), 'focus left the column').to.equal(true);
  });

  it('wraps from the end back to the start', async () => {
    // Documented by construction in _handleColumnKeydown: the columns wrap,
    // unlike the date grid. Pinned so the difference is deliberate.
    const el = await opened('step="30"');
    const last = cells(el, 'Minutes').at(-1);
    last.focus();
    keyOn(last, 'ArrowDown');
    await settle(el);
    expect(deepActive().textContent.trim()).to.equal('00');
  });

  it('wraps backwards from the start to the end', async () => {
    const el = await opened('step="30"');
    const first = cells(el, 'Minutes')[0];
    first.focus();
    keyOn(first, 'ArrowUp');
    await settle(el);
    expect(deepActive().textContent.trim()).to.equal('30');
  });

  it('jumps to the ends with Home and End', async () => {
    const el = await opened('step="15"');
    const mid = cells(el, 'Minutes')[1];
    mid.focus();
    keyOn(mid, 'End');
    await settle(el);
    expect(deepActive().textContent.trim()).to.equal('45');
    keyOn(deepActive(), 'Home');
    await settle(el);
    expect(deepActive().textContent.trim()).to.equal('00');
  });

  it('skips disabled cells when arrowing', async () => {
    const el = await opened('min="09:00" step="30"');
    const nine = cellFor(el, 'Hours', '9');
    nine.focus();
    keyOn(nine, 'ArrowUp');
    await settle(el);
    // Wrapping past the dead 12 AM–8 AM run lands on the last enabled hour.
    expect(deepActive().textContent.trim(), 'landed on a disabled hour').to.equal('11');
  });

  it('selects with Enter', async () => {
    const el = await opened('step="30"', { value: '09:00' });
    const three = cellFor(el, 'Hours', '3');
    three.focus();
    keyOn(three, 'Enter');
    await settle(el);
    expect(el.value).to.equal('03:00');
  });

  it('moves the tab stop along with focus', async () => {
    const el = await opened('step="30"');
    const first = cells(el, 'Hours')[0];
    first.focus();
    keyOn(first, 'ArrowDown');
    await settle(el);
    const stops = cells(el, 'Hours').filter((b) => b.tabIndex === 0);
    expect(stops.length).to.equal(1);
    expect(stops[0].textContent.trim()).to.equal('1');
  });

  it('leaves Tab alone so it can cross columns', async () => {
    const el = await opened('step="30"');
    const first = cells(el, 'Hours')[0];
    first.focus();
    keyOn(first, 'Tab');
    await settle(el);
    expect(deepActive(), 'Tab was intercepted').to.equal(first);
  });
});

describe('arc-time-picker dismissal', () => {
  it('closes on Escape and returns focus to the field', async () => {
    const el = await opened();
    keyOn(document, 'Escape');
    await settle(el);
    expect(el.open).to.equal(false);
    expect(await until(() => deepActive() === field(el))).to.equal(true);
  });

  it('ignores Escape while closed', async () => {
    const el = await picker();
    keyOn(document, 'Escape');
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('closes on a click outside', async () => {
    // ClickOutsideController listens for `pointerdown` in the capture phase, so
    // a plain .click() never reaches it.
    const el = await opened();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await settle(el);
    expect(await until(() => el.open === false)).to.equal(true);
  });

  it('stays open on a click inside the dropdown', async () => {
    const el = await opened();
    dropdown(el).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await settle(el);
    expect(el.open).to.equal(true);
  });

  it('toggles shut on a second field click', async () => {
    const el = await opened();
    field(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('drops the document listener when removed', async () => {
    // _handleEscape is bound to document, and both halves are connection-scoped,
    // so a detached picker must stop reacting. (Contrast finding #55, where the
    // subscribe and unsubscribe lifecycles did not pair.)
    const el = await opened();
    el.remove();
    await settle(el);
    keyOn(document, 'Escape');
    expect(el.open, 'a detached picker still handled Escape').to.equal(true);
  });
});

describe('arc-time-picker combobox semantics', () => {
  it('announces its expanded state', async () => {
    const el = await picker();
    expect(field(el).getAttribute('aria-expanded')).to.equal('false');
    field(el).click();
    await settle(el);
    expect(field(el).getAttribute('aria-expanded')).to.equal('true');
  });

  it('names itself when unlabelled', async () => {
    const el = await picker();
    expect(field(el).getAttribute('aria-label')).to.equal('Choose time');
  });

  it('prefers the declared label', async () => {
    const el = await picker('label="Start"');
    expect(field(el).getAttribute('aria-label')).to.equal('Start');
  });

  it('marks the panel as the dialog it advertises', async () => {
    const el = await opened();
    expect(field(el).getAttribute('aria-haspopup')).to.equal('dialog');
    expect(dropdown(el).getAttribute('role')).to.equal('dialog');
  });
});

describe('arc-time-picker disabled and readonly', () => {
  it('does not open on click when disabled', async () => {
    const el = await picker('disabled');
    field(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('does not open on click when readonly', async () => {
    const el = await picker('readonly');
    field(el).click();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('still submits its value when readonly', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-time-picker');
    el.name = 'at';
    el.readonly = true;
    el.value = '14:30';
    form.appendChild(el);
    await settle(el);
    expect(new FormData(form).get('at')).to.equal('14:30');
  });
});

describe('arc-time-picker form participation', () => {
  it('submits the 24h value under its name', async () => {
    const form = mount('<form><arc-time-picker name="at" value="14:30"></arc-time-picker></form>');
    const el = form.querySelector('arc-time-picker');
    await settle(el);
    expect(new FormData(form).get('at')).to.equal('14:30');
  });

  it('restores its value on reset', async () => {
    // The baseline is captured on first connect, so the value has to be set
    // before the element is appended. See test-findings.md, arc-transfer-list.
    const form = mount('<form></form>');
    const el = document.createElement('arc-time-picker');
    el.name = 'at';
    el.value = '14:30';
    form.appendChild(el);
    await settle(el);

    el.value = '09:00';
    await settle(el);
    form.reset();
    await settle(el);
    expect(el.value).to.equal('14:30');
  });
});

describe('arc-time-picker opened as a property', () => {
  /**
   * Finding #59, fixed. `_toggleDropdown()` used to do more than flip `open` —
   * it called `_syncFromValue()` and reset `_focusedColumn` — and none of that
   * was on the property path, which the docs explicitly support ("Reflected so
   * it can be opened programmatically"). That work now runs from `willUpdate`
   * on `open`, so both paths reach the same panel.
   */
  it('opens', async () => {
    const el = await picker('', { value: '14:30' });
    el.open = true;
    await settle(el);
    expect(dropdown(el) === null, 'the property path did not open it').to.equal(false);
  });

  it('highlights the current value, as the click path does', async () => {
    const el = await picker('step="15"', { value: '14:30' });
    el.open = true;
    await settle(el);
    expect(cellFor(el, 'Hours', '2').getAttribute('aria-selected')).to.equal('true');
    expect(cellFor(el, 'Minutes', '30').getAttribute('aria-selected')).to.equal('true');
    expect(cellFor(el, 'AM or PM', 'PM').getAttribute('aria-selected')).to.equal('true');
  });

  it('picks up a value assigned after it was already open', async () => {
    // _syncFromValue keys off `open` changing, so a value arriving while the
    // panel is already open is a different path again.
    const el = await opened('step="15"');
    el.open = false;
    await settle(el);
    el.value = '09:15';
    el.open = true;
    await settle(el);
    expect(cellFor(el, 'Hours', '9').getAttribute('aria-selected')).to.equal('true');
  });
});

describe('arc-time-picker format fallback', () => {
  it('defaults to 12h', async () => {
    const el = await picker();
    expect(el.format).to.equal('12h');
  });

  it('falls back to 12h from markup, not to the other member', async () => {
    // Before `oneOf`, an unrecognised value left `format === 'bogus'`, and every
    // `format === '12h'` test in the component read false — so it silently
    // rendered as 24h, which is the member it is *not* documented to default to.
    const el = await opened('format="bogus"');
    expect(el.format).to.equal('12h');
    expect(column(el, 'AM or PM') === null, 'fell through to the 24h layout').to.equal(false);
  });

  it('falls back when assigned from script', async () => {
    const el = await picker();
    el.format = 'bogus';
    await settle(el);
    expect(el.format).to.equal('12h');
  });
});
