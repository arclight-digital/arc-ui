/**
 * `required` and `readonly` are flags, not native boolean attributes.
 *
 * Finding #48 was `<arc-input disabled="false">` reading as **true**, because
 * Lit's stock boolean converter is `value !== null` — presence, with the value
 * ignored. `flag()` exists to fix that, and `disabled` was deliberately left
 * out of it: a form-associated element whose `disabled` content attribute is
 * merely present is "actually disabled" per the HTML spec, the platform calls
 * formDisabledCallback(true), and FormControlMixin assigns the property back.
 * No converter wins that argument, and native semantics are the right answer.
 *
 * That exclusion was then applied one prop too widely. `required` and
 * `readonly` sat beside `disabled` in the same declaration block and neither is
 * platform-mapped: `required` is enforced by the mixin's own
 * `_computeValidity()`, `readonly` by each component's interaction handlers. So
 * they carried the bug with none of the justification — `required="false"`
 * meant required, and blocked submission of a form the author had written to be
 * optional, across all 26 form controls at once.
 *
 * A representative spread rather than all 26: the props are declared once in
 * FormControlMixin, so what needs proving is that the declaration reaches
 * consumers of different shapes — a plain input, a wrapping control with its
 * own internals, and one whose readonly is enforced by gesture handlers.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';

import '../src/input/input.register.js';
import '../src/input/textarea.register.js';
import '../src/input/select.register.js';
import '../src/input/range-slider.register.js';

afterEach(() => cleanup());

const make = async (html) => {
  const el = mount(html);
  await settle(el);
  return el;
};

const CONTROLS = ['arc-input', 'arc-textarea', 'arc-select', 'arc-range-slider'];

describe('required is a flag', () => {
  for (const tag of CONTROLS) {
    it(`${tag} treats required="false" as false`, async () => {
      // The defect: this control was required, so the form would not submit and
      // the author's explicit "false" was read as an assertion of presence.
      const el = await make(`<${tag} required="false"></${tag}>`);
      expect(el.required).to.equal(false);
    });

    it(`${tag} still treats bare required as true`, async () => {
      expect((await make(`<${tag} required></${tag}>`)).required).to.equal(true);
    });

    it(`${tag} defaults to not required`, async () => {
      expect((await make(`<${tag}></${tag}>`)).required).to.equal(false);
    });
  }

  it('a false-by-attribute control does not block form submission', async () => {
    // The consequence, not just the property: valueMissing is what actually
    // stops a submit, and it is computed from `required`.
    const form = await make('<form><arc-input required="false" name="a"></arc-input></form>');
    const el = form.querySelector('arc-input');
    await settle(el);
    expect(el.validity?.valueMissing, 'an empty optional field reported valueMissing').to.not.equal(
      true,
    );
    expect(form.checkValidity(), 'the form refused to submit').to.equal(true);
  });

  it('a genuinely required empty control still blocks submission', async () => {
    // The control: the fix must not turn `required` off, only make "false" mean
    // false. Without this the test above passes for the wrong reason.
    const form = await make('<form><arc-input required name="a"></arc-input></form>');
    const el = form.querySelector('arc-input');
    await settle(el);
    expect(el.validity.valueMissing).to.equal(true);
    expect(form.checkValidity()).to.equal(false);
  });
});

describe('readonly is a flag', () => {
  for (const tag of CONTROLS) {
    it(`${tag} treats readonly="false" as false`, async () => {
      expect((await make(`<${tag} readonly="false"></${tag}>`)).readonly).to.equal(false);
    });

    it(`${tag} still treats bare readonly as true`, async () => {
      expect((await make(`<${tag} readonly></${tag}>`)).readonly).to.equal(true);
    });
  }

  it('readonly="false" leaves the field editable', async () => {
    // readonly is enforced by each component's own handlers, so the property
    // being right is only half the claim.
    const el = await make('<arc-input readonly="false"></arc-input>');
    expect(el.shadowRoot.querySelector('input').readOnly).to.equal(false);
  });

  it('bare readonly still makes the field read-only', async () => {
    const el = await make('<arc-input readonly></arc-input>');
    expect(el.shadowRoot.querySelector('input').readOnly).to.equal(true);
  });
});

describe('disabled deliberately keeps native semantics', () => {
  it('arc-input disabled="false" is still disabled', async () => {
    // Not a gap — the documented exclusion. A form-associated element whose
    // `disabled` attribute is present is disabled per the HTML spec, exactly as
    // `<input disabled="false">` is. Pinned so the next sweep does not "fix" it.
    const el = await make('<arc-input disabled="false"></arc-input>');
    expect(el.disabled, 'disabled must follow the platform, not flag()').to.equal(true);
  });
});
