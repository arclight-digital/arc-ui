/**
 * arc-form's side of the v3 form contract: what it can *see*, what it asks,
 * and what reset means.
 *
 * All three were parallel implementations of something the controls already
 * do, and each was wrong in its own way:
 *
 *   - Control discovery stopped at any element with a shadow root, which is
 *     every ARC layout component — so a control inside <arc-fieldset> was
 *     never validated, serialised, or disabled with the form.
 *   - Validation re-derived `required` from a string trim, so it understood
 *     text and checkboxes and nothing else.
 *   - reset() blanked controls instead of restoring their initial state.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/form.register.js';
import '../src/input/fieldset.register.js';
import '../src/input/input.register.js';
import '../src/input/checkbox.register.js';
import '../src/input/multi-select.register.js';

afterEach(() => cleanup());

/** Submit and capture the arc-submit / arc-invalid outcome. */
async function submit(form) {
  const seen = {};
  form.addEventListener('arc-submit', (e) => { seen.submit = e.detail; }, { once: true });
  form.addEventListener('arc-invalid', (e) => { seen.invalid = e.detail; }, { once: true });
  form.submit();
  await tick();
  return seen;
}

describe('control discovery crosses shadow hosts', () => {
  it('finds a control nested inside arc-fieldset', async () => {
    const form = mount(`
      <arc-form>
        <arc-fieldset legend="Contact">
          <arc-input name="email" label="Email" required></arc-input>
        </arc-fieldset>
      </arc-form>
    `);
    await form.updateComplete;

    const controls = form._getFormControls();
    expect(controls.map((c) => c.getAttribute('name'))).to.deep.equal(['email']);
  });

  it('validates and serialises that control', async () => {
    const form = mount(`
      <arc-form>
        <arc-fieldset legend="Contact">
          <arc-input name="email" label="Email" required></arc-input>
        </arc-fieldset>
      </arc-form>
    `);
    await form.updateComplete;

    const blocked = await submit(form);
    expect(blocked.submit, 'empty required field must block submit').to.be.undefined;
    expect(blocked.invalid.errors.map((e) => e.name)).to.deep.equal(['email']);

    form.querySelector('arc-input').value = 'a@b.co';
    await tick();

    const sent = await submit(form);
    expect(sent.invalid).to.be.undefined;
    expect(sent.submit.values.email).to.equal('a@b.co');
  });

  it('propagates disabled into the fieldset', async () => {
    const form = mount(`
      <arc-form>
        <arc-fieldset legend="Contact">
          <arc-input name="email" label="Email"></arc-input>
        </arc-fieldset>
      </arc-form>
    `);
    await form.updateComplete;

    form.disabled = true;
    await form.updateComplete;
    expect(form.querySelector('arc-input').hasAttribute('disabled')).to.be.true;
  });
});

describe('validity comes from the control', () => {
  it('honours a non-string empty value (multi-select array)', async () => {
    const form = mount(`
      <arc-form>
        <arc-multi-select name="tags" label="Tags" required></arc-multi-select>
      </arc-form>
    `);
    await form.updateComplete;

    // The old string-trim check called `[]` non-empty and let this through.
    const blocked = await submit(form);
    expect(blocked.submit).to.be.undefined;
    expect(blocked.invalid.errors.map((e) => e.name)).to.deep.equal(['tags']);
  });

  it('uses the control validationMessage as the error text', async () => {
    const form = mount(`
      <arc-form>
        <arc-input name="email" label="Email" required></arc-input>
      </arc-form>
    `);
    await form.updateComplete;

    const { invalid } = await submit(form);
    const input = form.querySelector('arc-input');
    expect(invalid.errors[0].message).to.equal(input.validationMessage);
    expect(input.error).to.equal(input.validationMessage);
  });

  it('leaves a consumer-set error alone on a valid control', async () => {
    const form = mount(`
      <arc-form>
        <arc-input name="email" label="Email" value="a@b.co"></arc-input>
      </arc-form>
    `);
    await form.updateComplete;

    const input = form.querySelector('arc-input');
    input.error = 'That address is already registered';
    await submit(form);
    expect(input.error).to.equal('That address is already registered');
  });

  it('clears its own error once the control is filled', async () => {
    const form = mount(`
      <arc-form>
        <arc-input name="email" label="Email" required></arc-input>
      </arc-form>
    `);
    await form.updateComplete;
    const input = form.querySelector('arc-input');

    await submit(form);
    expect(input.error).to.not.equal('');

    input.value = 'a@b.co';
    await tick();
    await submit(form);
    expect(input.error).to.equal('');
  });
});

describe('reset restores initial state', () => {
  it('restores a default rather than blanking it', async () => {
    const form = mount(`
      <arc-form>
        <arc-input name="email" label="Email" value="a@b.co"></arc-input>
        <arc-checkbox name="news" label="Newsletter" checked></arc-checkbox>
      </arc-form>
    `);
    await form.updateComplete;

    const input = form.querySelector('arc-input');
    const check = form.querySelector('arc-checkbox');
    input.value = 'changed@b.co';
    check.checked = false;
    await tick();

    form.reset();
    await tick();

    expect(input.value).to.equal('a@b.co');
    expect(check.checked).to.be.true;
  });
});
