/**
 * arc-multi-select — chips, inline filter, listbox.
 *
 * Fixture note: the option labels share prefixes on purpose ("Blue"/"Black")
 * so a filter query has to discriminate rather than just truncate, and the
 * values are deliberately *not* the lowercased labels — `_getLabel()` looks a
 * value up in the options and falls back to the raw value, and identical
 * value/label pairs would make a broken lookup indistinguishable from a working
 * one.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, keyOn, deepActive, record, only } from './helpers.js';

import '../src/input/multi-select.register.js';
// arc-option must be a *defined* element, not just parsed markup: unupgraded, it
// has neither `label` nor `value`, so every option reads blank and every chip
// falls back to its raw value. multi-select.register.js pulls in the class but
// not the registration. Same note as listbox-controller.test.js.
import '../src/shared/option.register.js';

afterEach(() => cleanup());

const OPTIONS = `
  <arc-option value="c1">Blue</arc-option>
  <arc-option value="c2">Black</arc-option>
  <arc-option value="c3">Crimson</arc-option>
`;

async function ms(attrs = '', props = {}) {
  const el = mount(`<arc-multi-select ${attrs}>${OPTIONS}</arc-multi-select>`);
  Object.assign(el, props);
  await settle(el);
  // The options arrive by slotchange, so one settle is not always enough.
  await until(() => el._options.length === 3);
  await settle(el);
  return el;
}

const input = (el) => el.shadowRoot.querySelector('.ms__input');
const dropdown = (el) => el.shadowRoot.querySelector('.ms__dropdown');
const options = (el) => [...el.shadowRoot.querySelectorAll('.ms__option')];
const optionText = (el) => options(el).map((o) => o.textContent.trim());
const optionFor = (el, text) => options(el).find((o) => o.textContent.trim() === text);
const chips = (el) => [...el.shadowRoot.querySelectorAll('.ms__tag')];
const chipText = (el) => chips(el).map((c) => c.textContent.replace('×', '').trim());
const removers = (el) => [...el.shadowRoot.querySelectorAll('.ms__tag-remove')];
const isOpen = (el) => dropdown(el).classList.contains('ms__dropdown--open');

async function type(el, text) {
  input(el).value = text;
  input(el).dispatchEvent(new Event('input', { bubbles: true }));
  await settle(el);
}

async function opened(attrs = '', props = {}) {
  const el = await ms(attrs, props);
  input(el).focus();
  await settle(el);
  return el;
}

describe('arc-multi-select rendering', () => {
  it('lists every option once open', async () => {
    const el = await opened();
    expect(optionText(el)).to.eql(['Blue', 'Black', 'Crimson']);
  });

  it('starts closed', async () => {
    const el = await ms();
    expect(isOpen(el)).to.equal(false);
  });

  it('renders no chips without a value', async () => {
    const el = await ms();
    expect(chips(el).length).to.equal(0);
  });

  it('renders a chip per selected value, labelled from the option', async () => {
    const el = await ms('', { value: ['c1', 'c3'] });
    expect(chipText(el)).to.eql(['Blue', 'Crimson']);
  });

  it('falls back to the raw value when no option matches', async () => {
    const el = await ms('', { value: ['ghost'] });
    expect(chipText(el)).to.eql(['ghost']);
  });

  it('shows the placeholder only while empty', async () => {
    const el = await ms('placeholder="Pick colours"');
    expect(input(el).placeholder).to.equal('Pick colours');
    el.value = ['c1'];
    await settle(el);
    expect(input(el).placeholder, 'placeholder survived a selection').to.equal('');
  });

  it('drops the placeholder once there is a query', async () => {
    const el = await opened('placeholder="Pick colours"');
    await type(el, 'bl');
    expect(input(el).placeholder).to.equal('');
  });

  it('renders the label when given one', async () => {
    const el = await ms('label="Colours"');
    expect(el.shadowRoot.querySelector('.ms__label').textContent.trim()).to.equal('Colours');
  });
});

describe('arc-multi-select filtering', () => {
  it('narrows to matching labels', async () => {
    const el = await opened();
    await type(el, 'bl');
    expect(optionText(el)).to.eql(['Blue', 'Black']);
  });

  it('discriminates between shared prefixes', async () => {
    const el = await opened();
    await type(el, 'blu');
    expect(optionText(el)).to.eql(['Blue']);
  });

  it('matches case-insensitively', async () => {
    const el = await opened();
    await type(el, 'CRIM');
    expect(optionText(el)).to.eql(['Crimson']);
  });

  it('says so when nothing matches', async () => {
    const el = await opened();
    await type(el, 'zzz');
    expect(options(el).length).to.equal(0);
    expect(el.shadowRoot.querySelector('.ms__empty').textContent.trim()).to.equal(
      'No results found',
    );
  });

  it('opens on typing even if it was closed', async () => {
    const el = await ms();
    await type(el, 'bl');
    expect(isOpen(el)).to.equal(true);
  });

  it('fires arc-input with the query', async () => {
    const el = await opened();
    const seen = record(el, ['arc-input']);
    await type(el, 'bl');
    expect(only(seen, 'input').map((e) => e[1])).to.eql(['bl']);
  });

  it('filters on label, not on value', async () => {
    // The values are c1/c2/c3, so a query of "c" would match all three if the
    // filter ever reached for the value instead.
    const el = await opened();
    await type(el, 'c');
    expect(optionText(el), 'the filter matched values').to.eql(['Black', 'Crimson']);
  });
});

describe('arc-multi-select selection', () => {
  it('selects on click and emits', async () => {
    const el = await opened();
    const seen = record(el, ['arc-change']);
    optionFor(el, 'Blue').click();
    await settle(el);
    expect(el.value).to.eql(['c1']);
    expect(only(seen, 'change').at(-1)[1]).to.eql(['c1']);
  });

  it('accumulates rather than replacing', async () => {
    const el = await opened();
    optionFor(el, 'Blue').click();
    await settle(el);
    optionFor(el, 'Crimson').click();
    await settle(el);
    expect(el.value).to.eql(['c1', 'c3']);
  });

  it('deselects a second click on the same option', async () => {
    const el = await opened('', { value: ['c1'] });
    optionFor(el, 'Blue').click();
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('stays open after a selection, so more can be picked', async () => {
    const el = await opened();
    optionFor(el, 'Blue').click();
    await settle(el);
    expect(isOpen(el), 'a multi-select closed after one pick').to.equal(true);
  });

  it('clears the query after a selection', async () => {
    const el = await opened();
    await type(el, 'blu');
    optionFor(el, 'Blue').click();
    await settle(el);
    expect(el._query).to.equal('');
    expect(input(el).value).to.equal('');
    expect(optionText(el), 'the list stayed filtered').to.eql(['Blue', 'Black', 'Crimson']);
  });

  it('marks selection with aria-selected', async () => {
    const el = await opened('', { value: ['c1'] });
    expect(optionFor(el, 'Blue').getAttribute('aria-selected')).to.equal('true');
    expect(optionFor(el, 'Black').getAttribute('aria-selected')).to.equal('false');
  });
});

describe('arc-multi-select chip removal', () => {
  it('removes on the chip button and emits', async () => {
    const el = await ms('', { value: ['c1', 'c3'] });
    const seen = record(el, ['arc-change']);
    removers(el)[0].click();
    await settle(el);
    expect(el.value).to.eql(['c3']);
    expect(only(seen, 'change').at(-1)[1]).to.eql(['c3']);
  });

  it('does not open the dropdown when a chip is removed', async () => {
    // _removeItem stops propagation so the control's click-to-focus handler
    // does not fire; removing a chip is not a request to browse the list.
    const el = await ms('', { value: ['c1'] });
    removers(el)[0].click();
    await settle(el);
    expect(isOpen(el)).to.equal(false);
  });

  it('names the chip it removes, for screen readers', async () => {
    const el = await ms('', { value: ['c1'] });
    expect(removers(el)[0].getAttribute('aria-label')).to.equal('Remove Blue');
  });

  it('keeps chips out of the tab order', async () => {
    // They are reached with ArrowLeft from the input instead, so a control with
    // ten selections is not ten tab stops.
    const el = await ms('', { value: ['c1', 'c3'] });
    expect(removers(el).every((r) => r.getAttribute('tabindex') === '-1')).to.equal(true);
  });
});

describe('arc-multi-select keyboard', () => {
  it('removes the last chip on Backspace in an empty field', async () => {
    const el = await opened('', { value: ['c1', 'c3'] });
    keyOn(input(el), 'Backspace');
    await settle(el);
    expect(el.value).to.eql(['c1']);
  });

  it('leaves chips alone while there is a query', async () => {
    const el = await opened('', { value: ['c1'] });
    await type(el, 'bl');
    keyOn(input(el), 'Backspace');
    await settle(el);
    expect(el.value, 'Backspace ate a chip mid-word').to.eql(['c1']);
  });

  it('does nothing on Backspace with no chips', async () => {
    const el = await opened();
    keyOn(input(el), 'Backspace');
    await settle(el);
    expect(el.value).to.eql([]);
  });

  it('moves into the chips with ArrowLeft from the start of the field', async () => {
    const el = await opened('', { value: ['c1', 'c3'] });
    input(el).setSelectionRange(0, 0);
    keyOn(input(el), 'ArrowLeft');
    await settle(el);
    expect(await until(() => deepActive() === removers(el)[1])).to.equal(true);
  });

  it('walks left along the chips', async () => {
    const el = await opened('', { value: ['c1', 'c3'] });
    removers(el)[1].focus();
    keyOn(removers(el)[1], 'ArrowLeft');
    await settle(el);
    expect(deepActive()).to.equal(removers(el)[0]);
  });

  it('stops at the first chip rather than wrapping', async () => {
    const el = await opened('', { value: ['c1', 'c3'] });
    removers(el)[0].focus();
    keyOn(removers(el)[0], 'ArrowLeft');
    await settle(el);
    expect(deepActive()).to.equal(removers(el)[0]);
  });

  it('returns to the field with ArrowRight past the last chip', async () => {
    const el = await opened('', { value: ['c1'] });
    removers(el)[0].focus();
    keyOn(removers(el)[0], 'ArrowRight');
    await settle(el);
    expect(deepActive()).to.equal(input(el));
  });

  it('returns to the field on Escape from a chip', async () => {
    const el = await opened('', { value: ['c1'] });
    removers(el)[0].focus();
    keyOn(removers(el)[0], 'Escape');
    await settle(el);
    expect(deepActive()).to.equal(input(el));
  });

  it('deletes a focused chip and moves focus to the one that replaced it', async () => {
    const el = await opened('', { value: ['c1', 'c2', 'c3'] });
    removers(el)[1].focus();
    keyOn(removers(el)[1], 'Delete');
    await settle(el);
    expect(el.value).to.eql(['c1', 'c3']);
    // Index 1 now holds Crimson, which slid into the deleted chip's position.
    expect(await until(() => deepActive() === removers(el)[1])).to.equal(true);
  });

  it('falls back to the last chip when the deleted one was last', async () => {
    const el = await opened('', { value: ['c1', 'c3'] });
    removers(el)[1].focus();
    keyOn(removers(el)[1], 'Backspace');
    await settle(el);
    expect(el.value).to.eql(['c1']);
    expect(await until(() => deepActive() === removers(el)[0])).to.equal(true);
  });

  it('falls back to the field when the last chip goes', async () => {
    const el = await opened('', { value: ['c1'] });
    removers(el)[0].focus();
    keyOn(removers(el)[0], 'Backspace');
    await settle(el);
    expect(el.value).to.eql([]);
    expect(await until(() => deepActive() === input(el))).to.equal(true);
  });

  it('walks the listbox with ArrowDown', async () => {
    const el = await opened();
    keyOn(input(el), 'ArrowDown');
    await settle(el);
    expect(options(el)[0].classList.contains('ms__option--active')).to.equal(true);
  });

  it('selects the active option with Enter', async () => {
    const el = await opened();
    keyOn(input(el), 'ArrowDown');
    await settle(el);
    keyOn(input(el), 'Enter');
    await settle(el);
    expect(el.value).to.eql(['c1']);
  });

  it('gives Home and End to the text cursor while typing', async () => {
    // Documented in _onKeyDown: the listbox only gets them when the field is
    // empty, or the caret cannot be moved in a half-typed query.
    const el = await opened();
    await type(el, 'bl');
    keyOn(input(el), 'ArrowDown');
    await settle(el);
    const activeBefore = el._listbox.activeIndex;
    keyOn(input(el), 'End');
    await settle(el);
    expect(el._listbox.activeIndex, 'End moved the listbox instead of the caret').to.equal(
      activeBefore,
    );
  });

  it('gives Home and End to the listbox when the field is empty', async () => {
    const el = await opened();
    keyOn(input(el), 'End');
    await settle(el);
    expect(el._listbox.activeIndex).to.equal(2);
  });
});

describe('arc-multi-select combobox semantics', () => {
  it('announces its expanded state', async () => {
    const el = await ms();
    expect(input(el).getAttribute('aria-expanded')).to.equal('false');
    input(el).focus();
    await settle(el);
    expect(input(el).getAttribute('aria-expanded')).to.equal('true');
  });

  it('advertises multi-selection on the listbox', async () => {
    const el = await opened();
    expect(dropdown(el).getAttribute('role')).to.equal('listbox');
    expect(dropdown(el).getAttribute('aria-multiselectable')).to.equal('true');
  });

  it('points aria-controls at the listbox it owns', async () => {
    const el = await opened();
    expect(input(el).getAttribute('aria-controls')).to.equal(dropdown(el).id);
    expect(dropdown(el).id, 'the listbox has no id to point at').to.not.equal('');
  });

  it('tracks the active option with aria-activedescendant', async () => {
    const el = await opened();
    keyOn(input(el), 'ArrowDown');
    await settle(el);
    expect(input(el).getAttribute('aria-activedescendant')).to.equal(options(el)[0].id);
  });

  it('gives each instance its own ids', async () => {
    const a = await ms();
    const b = await ms();
    expect(dropdown(a).id).to.not.equal(dropdown(b).id);
  });
});

describe('arc-multi-select disabled and readonly', () => {
  it('disables the field', async () => {
    const el = await ms('disabled');
    expect(input(el).disabled).to.equal(true);
  });

  it('refuses to toggle while readonly', async () => {
    const el = await opened('readonly', { value: ['c1'] });
    optionFor(el, 'Black').click();
    await settle(el);
    expect(el.value).to.eql(['c1']);
  });

  it('refuses to remove a chip while readonly', async () => {
    const el = await ms('readonly', { value: ['c1'] });
    removers(el)[0].click();
    await settle(el);
    expect(el.value).to.eql(['c1']);
  });

  it('still opens for viewing while readonly', async () => {
    // "the dropdown can still be opened for viewing" — readonly is narrower
    // than disabled, and this is the half that must keep working.
    const el = await opened('readonly');
    expect(isOpen(el)).to.equal(true);
    expect(optionText(el).length).to.equal(3);
  });

  it('still submits while readonly', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-multi-select');
    el.name = 'colours';
    el.readonly = true;
    el.value = ['c1'];
    form.appendChild(el);
    await settle(el);
    expect(new FormData(form).getAll('colours')).to.eql(['c1']);
  });
});

describe('arc-multi-select form participation', () => {
  it('submits one entry per value', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-multi-select');
    el.name = 'colours';
    el.value = ['c1', 'c3'];
    form.appendChild(el);
    await settle(el);
    expect(new FormData(form).getAll('colours')).to.eql(['c1', 'c3']);
  });

  it('restores its value on reset', async () => {
    const form = mount('<form></form>');
    const el = document.createElement('arc-multi-select');
    el.name = 'colours';
    el.value = ['c1'];
    form.appendChild(el);
    await settle(el);

    el.value = ['c1', 'c2', 'c3'];
    await settle(el);
    form.reset();
    await settle(el);
    expect(el.value).to.eql(['c1']);
  });
});

describe('arc-multi-select dismissal', () => {
  it('closes on a pointer outside', async () => {
    const el = await opened();
    expect(isOpen(el), 'it never opened').to.equal(true);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await settle(el);
    expect(await until(() => isOpen(el) === false)).to.equal(true);
  });

  it('stays open for a pointer inside', async () => {
    const el = await opened();
    dropdown(el).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await settle(el);
    expect(isOpen(el)).to.equal(true);
  });

  /**
   * Finding #60, fixed. Dismissal has two triggers — a pointer landing outside,
   * and focus leaving — and only the first used to be implemented, so a keyboard
   * user who tabbed out left the dropdown hanging open over the rest of the page
   * with the control still wearing its focus ring. `ClickOutsideController`
   * became `DismissController` and covers both.
   */
  it('closes when focus leaves by keyboard', async () => {
    const host = mount(
      `<div><arc-multi-select>${OPTIONS}</arc-multi-select><button>away</button></div>`,
    );
    const el = host.querySelector('arc-multi-select');
    await settle(el);
    input(el).focus();
    await settle(el);
    expect(isOpen(el), 'it never opened, so this is vacuous').to.equal(true);

    host.querySelector('button').focus();
    await settle(el);

    expect(deepActive(), 'focus did not actually leave').to.equal(host.querySelector('button'));
    expect(isOpen(el), 'the dropdown stayed open after focus left').to.equal(false);
  });

  it('drops its focus ring after focus leaves', async () => {
    const host = mount(
      `<div><arc-multi-select>${OPTIONS}</arc-multi-select><button>away</button></div>`,
    );
    const el = host.querySelector('arc-multi-select');
    await settle(el);
    input(el).focus();
    await settle(el);
    host.querySelector('button').focus();
    await settle(el);

    const control = el.shadowRoot.querySelector('.ms__control');
    expect(control.classList.contains('ms__control--focused')).to.equal(false);
  });

  it('keeps the panel open while focus moves between its own parts', async () => {
    // The other half: chips live inside the shadow root and take focus, so a
    // dismiss keyed on focusout alone would close the panel on the way to one.
    const el = await opened('', { value: ['c1'] });
    expect(isOpen(el), 'it never opened').to.equal(true);
    removers(el)[0].focus();
    await settle(el);
    expect(deepActive(), 'focus did not reach the chip').to.equal(removers(el)[0]);
    expect(isOpen(el), 'moving focus inside dismissed it').to.equal(true);
  });
});
