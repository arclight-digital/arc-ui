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
 * Number-valued controls are exempt from the required sweep where their
 * defaults are real values, so "empty" has no meaning — slider and
 * number-input. **`arc-rating` is no longer among them** (finding #8): 0 is not
 * a rating, it is the absence of one, so an unrated control is empty and is
 * swept like every other.
 *
 * **What the form actually submits is `form-data-sweep.test.js`**, which
 * derives its subjects from `custom-elements.json` and covers all 26
 * form-associated controls rather than the 14 hand-listed here. The two lists
 * differing by twelve is why that file derives: this one is a hand list, and it
 * went stale exactly the way HANDOFF's table predicts. The mixin's own
 * mechanism is pinned in `form-control-mixin.test.js`.
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
import '../src/input/pin-input.register.js';
import '../src/input/tag-input.register.js';
import '../src/input/password-input.register.js';
import '../src/input/rating.register.js';

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
  ['arc-pin-input', (el) => { el.value = '1234'; }],
  ['arc-tag-input', (el) => { el.value = ['a']; }],
  ['arc-password-input', (el) => { el.value = 'hunter2'; }],
  // The one number-valued control with a meaningful empty — see the header.
  ['arc-rating', (el) => { el.value = 4; }],
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
    // This asserted checkValidity() until the FormData sweep was written, which
    // is not submission at all — a control can be valid and submit nothing.
    // The distinction is the whole point of the test: `readonly` differs from
    // `disabled` precisely in that its value is still submitted.
    const form = mount('<form><arc-input readonly name="f"></arc-input></form>');
    const el = form.firstElementChild;
    await el.updateComplete;
    el.value = 'kept';
    await el.updateComplete;

    expect(new FormData(form).get('f')).to.equal('kept');
  });

  it('disabled does exclude the value from submission', async () => {
    // The other half, which makes the one above mean something: without it,
    // "the value is submitted" passes on an implementation that submits
    // everything unconditionally.
    const form = mount('<form><arc-input disabled name="f"></arc-input></form>');
    const el = form.firstElementChild;
    await el.updateComplete;
    el.value = 'dropped';
    await el.updateComplete;

    expect([...new FormData(form).keys()]).to.eql([]);
  });
});
