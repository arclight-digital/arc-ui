/**
 * arc-date-range-picker — the two-date interval control.
 *
 * What this pins: `start` and `end` drive a derived `value` that is an ISO 8601
 * interval, selecting a range takes two clicks and commits on the second,
 * min/max bound what can be picked, presets select the last N days, and the
 * control participates in a form with `required` meaning "a complete range".
 *
 * One test is marked BUG: `detail.value` on arc-change is an object while the
 * `value` property is a string, so the canonical key does not match the property
 * it names. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, record, keyOn } from './helpers.js';

import '../src/input/date-range-picker.register.js';

afterEach(() => cleanup());

async function picker(attrs = '') {
  const el = mount(`<arc-date-range-picker label="Dates" ${attrs}></arc-date-range-picker>`);
  await settle(el);
  return el;
}

const field = (el) => el.shadowRoot.querySelector('[part~="input-wrapper"] input, input');
const calendar = (el) => el.shadowRoot.querySelector('[part~="calendar"]');
const days = (el) => [...el.shadowRoot.querySelectorAll('[part~="day"]')];
const dayFor = (el, iso) => days(el).find((d) => d.dataset.iso === iso);
/** Days that can actually be picked, in calendar order. */
const pickable = (el) => days(el).filter((d) => d.dataset.iso && !d.disabled);

async function open(el) {
  el.open = true;
  await settle(el);
}

describe('arc-date-range-picker rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await picker();
    for (const part of ['wrapper', 'label', 'input-wrapper']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders its label', async () => {
    const el = await picker();
    expect(el.shadowRoot.querySelector('[part~="label"]').textContent).to.contain('Dates');
  });

  it('shows the placeholder while unset', async () => {
    const el = await picker('placeholder="Pick a range"');
    expect(field(el).placeholder).to.equal('Pick a range');
  });

  it('keeps the calendar closed until asked', async () => {
    const el = await picker();
    expect(el.open).to.equal(false);
    expect(calendar(el) === null, 'no calendar until opened').to.equal(true);
  });

  it('reflects open so it can be styled and driven from outside', async () => {
    const el = await picker();
    await open(el);
    expect(el.hasAttribute('open')).to.equal(true);
    expect(calendar(el)).to.not.equal(null);
  });

  it('renders the requested number of month panels', async () => {
    const el = await picker('months="2"');
    await open(el);
    expect(el.shadowRoot.querySelectorAll('[part~="panel-title"]')).to.have.lengthOf(2);
  });
});

describe('arc-date-range-picker value', () => {
  it('derives an ISO interval once both ends are set', async () => {
    const el = await picker('start="2026-03-01" end="2026-03-08"');
    expect(el.value).to.equal('2026-03-01/2026-03-08');
  });

  it('is empty while the range is incomplete', async () => {
    const el = await picker('start="2026-03-01"');
    expect(el.value, 'a half range is not a value').to.equal('');
  });

  it('accepts an interval assignment and splits it', async () => {
    const el = await picker();
    el.value = '2026-05-02/2026-05-09';
    await settle(el);

    expect(el.start).to.equal('2026-05-02');
    expect(el.end).to.equal('2026-05-09');
  });

  it('shows the selected range in the field', async () => {
    const el = await picker('start="2026-03-01" end="2026-03-08"');
    expect(field(el).value).to.not.equal('');
  });
});

describe('arc-date-range-picker selection', () => {
  it('takes two clicks: the first opens the range, the second closes it', async () => {
    const el = await picker('start="" end=""');
    el.start = '';
    el.end = '';
    await open(el);

    const first = pickable(el)[0];
    const iso = first.dataset.iso;
    const seen = record(el, ['arc-change']);

    first.click();
    await settle(el);
    expect(el.start, 'the first click sets the start').to.equal(iso);
    expect(seen, 'and commits nothing yet').to.deep.equal([]);
  });

  it('commits on the second click and reports both ends', async () => {
    const el = await picker();
    el.start = '';
    el.end = '';
    await open(el);

    const list = pickable(el);
    const [fromIso, toIso] = [list[0].dataset.iso, list[5].dataset.iso];
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    list[0].click();
    await settle(el);
    pickable(el).find((d) => d.dataset.iso === toIso).click();
    await settle(el);

    expect(details, 'exactly one commit').to.have.lengthOf(1);
    expect(details[0].start).to.equal(fromIso);
    expect(details[0].end).to.equal(toIso);
    expect(el.open, 'and the popup closes').to.equal(false);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await picker();
    el.start = '';
    el.end = '';
    await open(el);
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    const toIso = pickable(el)[3].dataset.iso;
    pickable(el)[0].click();
    await settle(el);
    pickable(el).find((d) => d.dataset.iso === toIso).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  // Was a BUG pin (finding #45). `detail.value` was an object, `{ start, end }`,
  // while the `value` property it is named after is an ISO 8601 interval
  // string — so reading `e.detail.value` and reading `el.value` on the same
  // component gave two different types. The point of the canonical key, per
  // event-conventions.js, is that "one generic handler could read detail.value
  // on every emitter", which holds only if detail.value means the control's
  // value. `event-conventions.js` passed the whole time because it verifies the
  // key *exists*, not that it agrees with the property.
  it('carries the control value on detail.value, in the property shape', async () => {
    const el = await picker();
    el.start = '';
    el.end = '';
    await open(el);

    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));
    const toIso = pickable(el)[2].dataset.iso;
    pickable(el)[0].click();
    await settle(el);
    pickable(el).find((d) => d.dataset.iso === toIso).click();
    await settle(el);

    expect(details[0].value, 'the same type as the property').to.be.a('string');
    expect(details[0].value, 'and the same value').to.equal(el.value);
    expect(el.value).to.contain('/');
  });

  it('keeps the two ends alongside it', async () => {
    // The named keys are what the component is *for*; dropping them to make
    // detail.value canonical would have been a worse break than the mismatch.
    const el = await picker();
    el.start = '';
    el.end = '';
    await open(el);

    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));
    const toIso = pickable(el)[2].dataset.iso;
    pickable(el)[0].click();
    await settle(el);
    pickable(el).find((d) => d.dataset.iso === toIso).click();
    await settle(el);

    expect(details[0].value).to.equal(`${details[0].start}/${details[0].end}`);
  });
});

describe('arc-date-range-picker bounds', () => {
  // The panel opens on the current month, so fixed dates would drift with the
  // clock. These derive min/max from whatever is actually on screen instead.
  it('disables every day outside min and max, and none inside', async () => {
    const probe = await picker();
    await open(probe);
    const all = days(probe).map((d) => d.dataset.iso);
    expect(all.length, 'the panel rendered days to bound').to.be.greaterThan(20);
    const min = all[5];
    const max = all[15];
    cleanup();

    const el = await picker(`min="${min}" max="${max}"`);
    await open(el);

    const outside = days(el).filter((d) => d.dataset.iso < min || d.dataset.iso > max);
    const inside = days(el).filter((d) => d.dataset.iso >= min && d.dataset.iso <= max);

    expect(outside.length, 'there are days on both sides of the window').to.be.greaterThan(0);
    expect(inside.length).to.equal(11);
    expect(outside.every((d) => d.disabled), 'everything outside is disabled').to.equal(true);
    expect(inside.every((d) => !d.disabled), 'everything inside is pickable').to.equal(true);
  });

  // This was recorded as "the panel always shows the current month" and that
  // diagnosis was wrong. The anchoring existed; it lived in `_toggleDropdown`,
  // so it ran on the field click and not on `el.open = true` — which is what the
  // `open()` helper above does. The visible symptom was real, the cause was a
  // path divergence, and it turned out to be shared with arc-date-picker and
  // arc-time-picker. Finding #59; the anchoring now runs from `willUpdate`.
  it('opens on the month the range starts in, however it was opened', async () => {
    const el = await picker('start="2020-01-15" end="2020-01-20"');
    await open(el);

    const shown = days(el).map((d) => d.dataset.iso);
    expect(el.value, 'the range is set').to.equal('2020-01-15/2020-01-20');
    expect(
      shown.some((iso) => iso.startsWith('2020-01')),
      'the selected range is off-screen',
    ).to.equal(true);
  });
});

describe('arc-date-range-picker presets', () => {
  it('renders no rail without presets', async () => {
    const el = await picker();
    await open(el);
    expect(el.shadowRoot.querySelector('.preset, [part~="preset"]') === null).to.equal(true);
  });

  it('selects the last N days and closes', async () => {
    const el = await picker();
    el.presets = [{ label: 'Last 7 days', days: 7 }];
    await open(el);

    const preset = [...el.shadowRoot.querySelectorAll('button')]
      .find((b) => b.textContent.includes('Last 7 days'));
    expect(preset, 'the preset renders').to.not.equal(null);

    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));
    preset.click();
    await settle(el);

    expect(el.start).to.not.equal('');
    expect(el.end).to.not.equal('');
    expect(details, 'a preset is a complete range').to.have.lengthOf(1);
    expect(el.open).to.equal(false);
  });
});

describe('arc-date-range-picker disabled', () => {
  it('does not open', async () => {
    const el = await picker('disabled');
    field(el)?.click();
    await settle(el);
    expect(el.open).to.equal(false);
  });

  it('takes the control out of the pointer path', async () => {
    const el = await picker('disabled');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
  });
});

describe('arc-date-range-picker form participation', () => {
  it('submits the interval under its name', async () => {
    const form = mount(
      '<form><arc-date-range-picker name="when" start="2026-03-01" end="2026-03-08"></arc-date-range-picker></form>',
    );
    const el = form.querySelector('arc-date-range-picker');
    await settle(el);

    expect(new FormData(form).get('when')).to.equal('2026-03-01/2026-03-08');
  });

  it('required is unsatisfied until the range is complete', async () => {
    const el = await picker('required name="when"');
    el.start = '';
    el.end = '';
    await settle(el);

    expect(el.checkValidity(), 'nothing picked').to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.start = '2026-03-01';
    await settle(el);
    expect(el.checkValidity(), 'a half range is still incomplete').to.equal(false);

    el.end = '2026-03-08';
    await settle(el);
    expect(el.checkValidity(), 'a complete range satisfies it').to.equal(true);
  });

  it('restores both ends on form reset', async () => {
    const form = mount(
      '<form><arc-date-range-picker name="when" start="2026-03-01" end="2026-03-08"></arc-date-range-picker></form>',
    );
    const el = form.querySelector('arc-date-range-picker');
    await settle(el);

    el.value = '2026-06-01/2026-06-10';
    await settle(el);
    form.reset();
    await settle(el);

    expect(el.value).to.equal('2026-03-01/2026-03-08');
  });
});

describe('arc-date-range-picker size', () => {
  it('each size renders distinctly and an unknown one lands on the default', async () => {
    // The size steps scale the native input's padding, not the wrapper's.
    const pad = (el) => getComputedStyle(el.shadowRoot.querySelector('input')).paddingTop;

    const def = await picker();
    const lg = await picker('size="lg"');
    expect(pad(lg), 'lg must differ from md').to.not.equal(pad(def));

    const unknown = await picker('size="enormous"');
    expect(pad(unknown)).to.equal(pad(def));
  });
});

describe('arc-date-range-picker week-edge keys', () => {
  // Was part of finding #57: Home/End computed the row ends with the
  // Sunday-based getDay() while the grid itself is laid out from
  // `firstDayOfWeek`, so on a Monday-start calendar both keys landed one cell
  // outside the row they belong to.
  const WED = '2026-07-15'; // a Wednesday: mid-week under either convention

  async function openedOn(firstDay) {
    const el = mount('<arc-date-range-picker label="Dates"></arc-date-range-picker>');
    el.firstDayOfWeek = firstDay;
    el.start = WED;
    await settle(el);
    // Open through the field, not by setting `open`: the view is anchored to
    // `start` in the toggle handler, so a property-set open stays on today's
    // month and the July cells this test needs are never rendered.
    field(el).click();
    await settle(el);
    return el;
  }

  const stop = (el) => el.shadowRoot.querySelector('[part~="day"][tabindex="0"]')?.dataset.iso;

  it('reaches the ends of a Monday-start week', async () => {
    const el = await openedOn(1);
    expect(el.shadowRoot.querySelector('[part~="dow"], .weekday')?.textContent.trim()).to.equal(
      'Mon',
    );

    keyOn(dayFor(el, WED), 'Home');
    await settle(el);
    expect(stop(el)).to.equal('2026-07-13');

    keyOn(dayFor(el, '2026-07-13'), 'End');
    await settle(el);
    expect(stop(el)).to.equal('2026-07-19');
  });

  it('reaches the ends of a Sunday-start week', async () => {
    const el = await openedOn(7);

    keyOn(dayFor(el, WED), 'Home');
    await settle(el);
    expect(stop(el)).to.equal('2026-07-12');

    keyOn(dayFor(el, '2026-07-12'), 'End');
    await settle(el);
    expect(stop(el)).to.equal('2026-07-18');
  });
});
