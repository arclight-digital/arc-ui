/**
 * `disabled` versus a programmatically-set `open`. Finding #58, fixed.
 *
 * Every component here documents two things that used to collide:
 *
 *   @prop disabled - "...preventing the calendar from opening"
 *   @prop open     - "Reflected so it can be opened programmatically"
 *
 * The guard lived in the toggle handler, which is only on the *click* path, so
 * the property path won and a disabled control showed its panel. That is the
 * same shape as arc-tabs' unclamped `selected` (#1), arc-theme-toggle's unsynced
 * `theme` (#14) and arc-image-cropper's unclamped `zoom` (#47): a constraint
 * enforced on the interaction rather than on the state.
 *
 * The fix was not five one-line guards. All five now declare
 * `open: flag(false, { blockedBy: 'disabled' })`, so the constraint runs on the
 * same controller as every other declared contract and holds on both paths.
 *
 * That makes most of this file **redundant by construction** —
 * `conformance.test.js` derives the property-path and markup cases from the
 * declaration for any component that declares `blockedBy`. What it keeps is the
 * two things a declaration cannot state: that clicking the field is the right
 * way in, and that these five specific components are the ones carrying it. A
 * sixth component acquiring the same prose and not the declaration is exactly
 * the regression this list catches and the derived suite cannot.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/input/date-picker.register.js';
import '../src/input/date-range-picker.register.js';
import '../src/input/time-picker.register.js';
import '../src/input/select.register.js';
import '../src/input/tree-select.register.js';

afterEach(() => cleanup());

const CASES = [
  ['arc-date-picker', '<arc-date-picker></arc-date-picker>'],
  ['arc-date-range-picker', '<arc-date-range-picker></arc-date-range-picker>'],
  ['arc-time-picker', '<arc-time-picker></arc-time-picker>'],
  ['arc-select', '<arc-select></arc-select>'],
  ['arc-tree-select', '<arc-tree-select></arc-tree-select>'],
];

describe('disabled controls refuse the click path', () => {
  for (const [tag, markup] of CASES) {
    it(`${tag} does not open when its field is clicked`, async () => {
      const el = mount(markup);
      el.disabled = true;
      await settle(el);

      // Whatever the field is called in each, clicking it is the documented way
      // in — and every one of them declines while disabled.
      el.shadowRoot.querySelector('input, [part="trigger"], [part="control"]')?.click();
      await settle(el);

      expect(el.open, `${tag} opened on click while disabled`).to.equal(false);
    });
  }
});

describe('disabled controls and a programmatic open', () => {
  for (const [tag, markup] of CASES) {
    it(`${tag} declares open as blocked by disabled`, () => {
      // The declaration is the fix, so this asserts the fix is present rather
      // than re-testing the behaviour conformance.test.js already derives from
      // it. A component that reverts to a hand-written guard fails here while
      // its behaviour still looks correct — which is the point of #58.
      const meta = customElements.get(tag).elementProperties.get('open')?.arc;
      expect(meta?.blockedBy, `${tag} lost its blockedBy declaration`).to.equal('disabled');
    });

    it(`${tag} stays closed when open is set as a property`, async () => {
      const el = mount(markup);
      el.disabled = true;
      await settle(el);

      // anti-vacuity: it really is disabled, so this is not just an inert element
      expect(el.disabled, `${tag} did not take disabled`).to.equal(true);

      el.open = true;
      await settle(el);

      expect(el.open, `${tag} — documented as unable to open while disabled`).to.equal(false);
    });

    it(`${tag} does not even schedule a render for a refused set`, async () => {
      // `blockedBy` refuses at the setter, so a blocked assignment never reaches
      // requestUpdate. Reverting it in the controller instead would leave `open`
      // in changedProperties, run the host's close-side effects, and schedule a
      // second render for a value that never changed.
      const el = mount(markup);
      el.disabled = true;
      await settle(el);

      el.open = true;
      expect(el.isUpdatePending, `${tag} scheduled a render for a refused set`).to.equal(false);

      // anti-vacuity: an allowed set on the same element does schedule one, so
      // this is not just an element that has stopped updating.
      el.disabled = false;
      expect(el.isUpdatePending, `${tag} never schedules anything`).to.equal(true);
    });

    it(`${tag} opens once disabled is cleared`, async () => {
      // The other half: blocking must not leave `open` permanently inert, which
      // would satisfy the test above for the wrong reason.
      const el = mount(markup);
      el.disabled = true;
      await settle(el);
      el.disabled = false;
      el.open = true;
      await settle(el);

      expect(el.open, `${tag} stayed blocked after disabled was cleared`).to.equal(true);
    });
  }
});
