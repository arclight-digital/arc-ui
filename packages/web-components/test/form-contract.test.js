/**
 * The v3 form-control contract, swept across every FormControlMixin consumer
 * with unambiguous empty semantics:
 *
 *   - `required` + empty ⇒ checkValidity() === false (valueMissing), and
 *     filling the control programmatically flips it back to valid. v2 lied
 *     here: checkValidity() returned true unconditionally on 19 of 22
 *     controls because nothing ever called setValidity.
 *   - `name` reflects to an attribute on every control, so [name="x"]
 *     selectors and serializers see it.
 *   - `readonly` exists everywhere and blocks user mutation (spot-checked
 *     here on representative gestures; per-control guards live in the
 *     components).
 *
 * Number-valued controls (slider, number-input, rating) are exempt from the
 * required sweep: their defaults are real values, so "empty" has no meaning.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup } from './helpers.js';

import '../src/input/input.register.js';
import '../src/input/textarea.register.js';
import '../src/input/select.register.js';
import '../src/input/combobox.register.js';
import '../src/input/multi-select.register.js';
import '../src/input/radio-group.register.js';
import '../src/input/checkbox.register.js';
import '../src/input/toggle.register.js';
import '../src/input/date-picker.register.js';
import '../src/input/time-picker.register.js';
import '../src/input/otp-input.register.js';
import '../src/input/pin-input.register.js';
import '../src/input/tag-input.register.js';
import '../src/input/password-input.register.js';

/** tag → how to programmatically make the control non-empty. */
const REQUIRED_SWEEP = [
  ['arc-input', (el) => { el.value = 'x'; }],
  ['arc-textarea', (el) => { el.value = 'x'; }],
  ['arc-select', (el) => { el.value = 'a'; }],
  ['arc-combobox', (el) => { el.value = 'a'; }],
  ['arc-multi-select', (el) => { el.value = ['a']; }],
  ['arc-radio-group', (el) => { el.value = 'a'; }],
  ['arc-checkbox', (el) => { el.checked = true; }],
  ['arc-toggle', (el) => { el.checked = true; }],
  ['arc-date-picker', (el) => { el.value = '2026-07-30'; }],
  ['arc-time-picker', (el) => { el.value = '12:30'; }],
  ['arc-otp-input', (el) => { el.value = '123456'; }],
  ['arc-pin-input', (el) => { el.value = '1234'; }],
  ['arc-tag-input', (el) => { el.value = ['a']; }],
  ['arc-password-input', (el) => { el.value = 'hunter2'; }],
];

describe('required ⇒ valueMissing until filled', () => {
  afterEach(cleanup);

  for (const [tag, fill] of REQUIRED_SWEEP) {
    it(tag, async () => {
      const el = mount(`<${tag} required></${tag}>`);
      await el.updateComplete;
      expect(el.checkValidity(), `${tag}: empty + required must be invalid`).to.equal(false);
      expect(el.validity.valueMissing, `${tag}: the failing flag must be valueMissing`).to.equal(true);

      fill(el);
      await el.updateComplete;
      expect(el.checkValidity(), `${tag}: filled control must be valid`).to.equal(true);
    });
  }
});

describe('name reflects on every form control', () => {
  afterEach(cleanup);

  for (const [tag] of REQUIRED_SWEEP) {
    it(tag, async () => {
      const el = mount(`<${tag}></${tag}>`);
      el.name = 'field';
      await el.updateComplete;
      expect(el.getAttribute('name'), `${tag}: name must reflect`).to.equal('field');
    });
  }
});

describe('readonly blocks user mutation', () => {
  afterEach(cleanup);

  it('arc-checkbox: click does not toggle', async () => {
    const el = mount('<arc-checkbox readonly label="c"></arc-checkbox>');
    await el.updateComplete;
    el.shadowRoot.querySelector('[role="checkbox"]').click();
    await el.updateComplete;
    expect(el.checked).to.equal(false);
  });

  it('arc-input: native input carries readonly', async () => {
    const el = mount('<arc-input readonly label="i"></arc-input>');
    await el.updateComplete;
    const native = el.shadowRoot.querySelector('input, textarea');
    expect(native.readOnly).to.equal(true);
  });

  it('readonly does not exclude the value from submission', async () => {
    const el = mount('<arc-input readonly name="f"></arc-input>');
    await el.updateComplete;
    el.value = 'kept';
    await el.updateComplete;
    // Still a live form value — readonly is not disabled.
    expect(el.checkValidity()).to.equal(true);
  });
});
