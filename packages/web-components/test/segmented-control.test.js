/**
 * arc-segmented-control — the radiogroup-flavoured single-choice control.
 *
 * What this pins: the bar is built from arc-option children, an empty `value`
 * auto-selects the first of them, selection is radio semantics (one tab stop,
 * aria-checked, activation follows the arrow keys and wraps), arc-change
 * carries detail.value and stays silent when the selection did not actually
 * move, and `disabled` mutes every path in and out.
 *
 * The BUG pin here — arc-option documenting a `disabled` prop this control
 * never read — is gone: finding #6 is fixed, and the per-option disabled
 * contract is pinned as a regression suite at the bottom of this file.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, deepActive, record } from './helpers.js';

import '../src/input/segmented-control.register.js';
import '../src/shared/option.register.js';

afterEach(() => cleanup());

const OPTIONS = `
  <arc-option value="day">Day</arc-option>
  <arc-option value="week">Week</arc-option>
  <arc-option value="month">Month</arc-option>
`;

async function control(attrs = '', children = OPTIONS) {
  const el = mount(`<arc-segmented-control ${attrs}>${children}</arc-segmented-control>`);
  await settle(el);
  return el;
}

const buttons = (el) => [...el.shadowRoot.querySelectorAll('.segmented__option')];
const labels = (el) => buttons(el).map((b) => b.textContent.trim());
const checked = (el) => buttons(el).map((b) => b.getAttribute('aria-checked'));
const group = (el) => el.shadowRoot.querySelector('[role="radiogroup"]');

describe('arc-segmented-control rendering', () => {
  it('renders one button per arc-option, labelled from the option text', async () => {
    const el = await control();
    expect(labels(el)).to.deep.equal(['Day', 'Week', 'Month']);
  });

  it('falls back to the value when an option has no text', async () => {
    const el = await control('', '<arc-option value="bare"></arc-option>');
    expect(labels(el)).to.deep.equal(['bare']);
  });

  it('builds the bar from arc-option children only', async () => {
    const el = await control('', `
      <span>noise</span>
      <arc-option value="real">Real</arc-option>
    `);
    expect(labels(el)).to.deep.equal(['Real']);
  });

  it('exposes the documented css parts', async () => {
    const el = await control();
    expect(el.shadowRoot.querySelector('[part~="control"]')).to.not.equal(null);
    expect(el.shadowRoot.querySelectorAll('[part~="option"]')).to.have.lengthOf(3);
  });
});

describe('arc-segmented-control value', () => {
  it('auto-selects the first option when value is empty', async () => {
    const el = await control();
    expect(el.value).to.equal('day');
    expect(checked(el)).to.deep.equal(['true', 'false', 'false']);
  });

  it('honours a value set in markup and does not overwrite it', async () => {
    const el = await control('value="month"');
    expect(el.value).to.equal('month');
    expect(checked(el)).to.deep.equal(['false', 'false', 'true']);
  });

  it('reflects value to an attribute so [value=…] selectors see it', async () => {
    const el = await control();
    el.value = 'week';
    await settle(el);
    expect(el.getAttribute('value')).to.equal('week');
    expect(checked(el)).to.deep.equal(['false', 'true', 'false']);
  });

  it('leaves value empty when there are no options at all', async () => {
    const el = await control('', '');
    expect(el.value).to.equal('');
    expect(buttons(el)).to.have.lengthOf(0);
  });
});

describe('arc-segmented-control selection', () => {
  it('selects on click and fires arc-change with the value', async () => {
    const el = await control();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    buttons(el)[1].click();
    await settle(el);

    expect(el.value).to.equal('week');
    expect(details).to.have.lengthOf(1);
    expect(details[0].value).to.equal('week');
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await control();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    buttons(el)[2].click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('stays silent when the already-selected option is clicked again', async () => {
    const el = await control('value="week"');
    const seen = record(el, ['arc-change']);

    buttons(el)[1].click();
    await settle(el);

    expect(el.value).to.equal('week');
    expect(seen, 'no change means no arc-change').to.deep.equal([]);
  });

  it('stays silent when value is set from script', async () => {
    const el = await control();
    const seen = record(el, ['arc-change']);

    el.value = 'month';
    await settle(el);

    expect(checked(el), 'the control still updates').to.deep.equal(['false', 'false', 'true']);
    expect(seen).to.deep.equal([]);
  });
});

describe('arc-segmented-control radio semantics', () => {
  it('is a radiogroup of radios', async () => {
    const el = await control();
    expect(group(el)).to.not.equal(null);
    expect(buttons(el).map((b) => b.getAttribute('role'))).to.deep.equal(['radio', 'radio', 'radio']);
  });

  it('leaves exactly one tab stop, on the checked option', async () => {
    const el = await control('value="week"');
    expect(buttons(el).map((b) => b.getAttribute('tabindex'))).to.deep.equal(['-1', '0', '-1']);
  });
});

describe('arc-segmented-control keyboard', () => {
  it('walks with the arrows, in both axes, and selects as it goes', async () => {
    const el = await control();

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.value).to.equal('week');

    keyOn(buttons(el)[1], 'ArrowDown');
    await settle(el);
    expect(el.value, 'ArrowDown is an alias for ArrowRight here').to.equal('month');

    keyOn(buttons(el)[2], 'ArrowLeft');
    await settle(el);
    expect(el.value).to.equal('week');

    keyOn(buttons(el)[1], 'ArrowUp');
    await settle(el);
    expect(el.value).to.equal('day');
  });

  it('wraps at both ends', async () => {
    const el = await control('value="month"');
    keyOn(buttons(el)[2], 'ArrowRight');
    await settle(el);
    expect(el.value, 'last → first').to.equal('day');

    keyOn(buttons(el)[0], 'ArrowLeft');
    await settle(el);
    expect(el.value, 'first → last').to.equal('month');
  });

  it('Home and End jump to the ends', async () => {
    const el = await control('value="week"');
    keyOn(buttons(el)[1], 'End');
    await settle(el);
    expect(el.value).to.equal('month');

    keyOn(buttons(el)[2], 'Home');
    await settle(el);
    expect(el.value).to.equal('day');
  });

  it('Enter and Space select the focused option without moving', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await control();
      keyOn(buttons(el)[2], key);
      await settle(el);
      expect(el.value, `${key} selects in place`).to.equal('month');
      cleanup();
    }
  });

  it('moves DOM focus onto the newly selected option', async () => {
    const el = await control();
    buttons(el)[0].focus();
    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(deepActive()).to.equal(buttons(el)[1]);
  });

  it('claims the keys it handles and leaves the rest for the page', async () => {
    const el = await control();

    const handled = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    buttons(el)[0].dispatchEvent(handled);
    await settle(el);
    expect(handled.defaultPrevented, 'or the page scrolls under the selection').to.equal(true);

    const before = el.value;
    const ignored = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    buttons(el)[0].dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented).to.equal(false);
    expect(el.value, 'an unrelated key changes nothing').to.equal(before);
  });
});

describe('arc-segmented-control disabled', () => {
  it('announces itself disabled and disables every button', async () => {
    const el = await control('disabled');
    expect(group(el).getAttribute('aria-disabled')).to.equal('true');
    expect(buttons(el).every((b) => b.disabled), 'native disabled blocks activation').to.equal(true);
  });

  it('takes the whole control out of the pointer path', async () => {
    const el = await control('disabled');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
  });

  it('mutes click and keyboard alike', async () => {
    const el = await control('disabled');
    const seen = record(el, ['arc-change']);

    buttons(el)[1].click();
    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);

    expect(el.value, 'the selection must not move').to.equal('day');
    expect(seen).to.deep.equal([]);
  });

});

/**
 * arc-option has always declared `@prop {boolean} disabled` — "dims this option
 * and prevents it from being selected". This control read the *group's* flag
 * and nothing else, so a disabled option was selectable by click and reachable
 * by arrow key (finding #6). These are the regression tests for the guard.
 */
describe('arc-segmented-control per-option disabled', () => {
  const MIXED = `
    <arc-option value="day">Day</arc-option>
    <arc-option value="week" disabled>Week</arc-option>
    <arc-option value="month">Month</arc-option>
  `;

  it('disables only that option, not the bar', async () => {
    const el = await control('', MIXED);
    expect(buttons(el).map((b) => b.disabled)).to.deep.equal([false, true, false]);
    expect(group(el).getAttribute('aria-disabled'), 'the group is still live').to.equal('false');
  });

  it('refuses a click on a disabled option, silently', async () => {
    const el = await control('', MIXED);
    const seen = record(el, ['arc-change']);

    buttons(el)[1].click();
    await settle(el);

    expect(el.value).to.equal('day');
    expect(seen).to.deep.equal([]);
  });

  it('refuses a programmatic _select of a disabled option', async () => {
    const el = await control('', MIXED);
    el._select('week');
    await settle(el);
    expect(el.value).to.equal('day');
  });

  it('steps over a disabled option with the arrows, in both directions', async () => {
    const el = await control('', MIXED);

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);
    expect(el.value, 'skips week').to.equal('month');

    keyOn(buttons(el)[2], 'ArrowLeft');
    await settle(el);
    expect(el.value, 'and skips it going back').to.equal('day');
  });

  it('lands Home and End on the nearest selectable option', async () => {
    const el = await control('', `
      <arc-option value="day" disabled>Day</arc-option>
      <arc-option value="week">Week</arc-option>
      <arc-option value="month" disabled>Month</arc-option>
    `);

    keyOn(buttons(el)[1], 'End');
    await settle(el);
    expect(el.value).to.equal('week');

    keyOn(buttons(el)[1], 'Home');
    await settle(el);
    expect(el.value).to.equal('week');
  });

  it('auto-selects the first selectable option, not the first option', async () => {
    const el = await control('', `
      <arc-option value="day" disabled>Day</arc-option>
      <arc-option value="week">Week</arc-option>
    `);
    expect(el.value, 'landing the default on a disabled segment defeats the guard').to.equal('week');
    expect(checked(el)).to.deep.equal(['false', 'true']);
  });

  it('does not spin or move when every option is disabled', async () => {
    const el = await control('', `
      <arc-option value="day" disabled>Day</arc-option>
      <arc-option value="week" disabled>Week</arc-option>
    `);
    const seen = record(el, ['arc-change']);

    keyOn(buttons(el)[0], 'ArrowRight');
    await settle(el);

    expect(el.value, 'nothing was selectable to begin with').to.equal('');
    expect(seen).to.deep.equal([]);
  });

  it('re-renders the bar when an option is disabled after mount', async () => {
    const el = await control();
    el.querySelectorAll('arc-option')[1].disabled = true;
    await settle(el);

    expect(buttons(el)[1].disabled, 'the owner reads its options at render time').to.equal(true);
  });
});

/**
 * Finding #7: this control had a reflected `value`, no `name`, and no
 * FormControlMixin — so a control that looks exactly like a radio group
 * submitted nothing. The library-wide sweeps (form-contract, form-data-sweep)
 * now derive it from `formAssociated` in the manifest and cover the generic
 * contract; what is here is what is specific to a segmented control.
 */
describe('arc-segmented-control form participation', () => {
  async function inForm(children = OPTIONS, attrs = 'name="range"') {
    const form = mount(`<form><arc-segmented-control ${attrs}>${children}</arc-segmented-control></form>`);
    const el = form.firstElementChild;
    await settle(el);
    return { form, el };
  }

  it('submits the auto-selected option without the user touching it', async () => {
    const { form } = await inForm();
    expect(new FormData(form).get('range')).to.equal('day');
  });

  it('submits the segment the user picked', async () => {
    const { form, el } = await inForm();
    el.shadowRoot.querySelectorAll('.segmented__option')[2].click();
    await settle(el);
    expect(new FormData(form).get('range')).to.equal('month');
  });

  it('restores the initial segment on form.reset()', async () => {
    const { form, el } = await inForm();
    el.shadowRoot.querySelectorAll('.segmented__option')[2].click();
    await settle(el);

    form.reset();
    await settle(el);

    expect(el.value).to.equal('day');
    expect(new FormData(form).get('range')).to.equal('day');
  });
});
