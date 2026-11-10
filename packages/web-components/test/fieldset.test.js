/**
 * arc-fieldset's `disabled` reaching the controls inside it.
 *
 * The native <fieldset disabled> lives in the shadow root, and the controls
 * are light DOM: they are slotted into it, not its descendants, so the
 * platform's own cascade never reaches them. The fieldset has to set them.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/fieldset.register.js';
import '../src/input/input.register.js';
import '../src/input/checkbox.register.js';

afterEach(() => cleanup());

async function settle(el) {
  await el.updateComplete;
  for (const child of el.querySelectorAll('*')) await child.updateComplete;
  await tick();
}

describe('arc-fieldset disabled', () => {
  it('disables slotted controls, including ones inside a wrapper', async () => {
    const fs = mount(`
      <arc-fieldset legend="Contact">
        <arc-input name="email" label="Email"></arc-input>
        <div><arc-checkbox name="news" label="News"></arc-checkbox></div>
      </arc-fieldset>
    `);
    await settle(fs);

    fs.disabled = true;
    await settle(fs);

    const input = fs.querySelector('arc-input');
    const box = fs.querySelector('arc-checkbox');
    expect(input.disabled, 'direct child').to.equal(true);
    expect(box.disabled, 'nested child').to.equal(true);
    expect(input.matches(':disabled'), 'platform-disabled').to.equal(true);
  });

  it('disables controls when the markup starts disabled', async () => {
    const fs = mount(`
      <arc-fieldset legend="Contact" disabled>
        <arc-input name="email" label="Email"></arc-input>
      </arc-fieldset>
    `);
    await settle(fs);
    expect(fs.querySelector('arc-input').disabled).to.equal(true);
  });

  it('re-enables what it disabled and leaves a control disabled on its own alone', async () => {
    const fs = mount(`
      <arc-fieldset legend="Contact">
        <arc-input name="email" label="Email"></arc-input>
        <arc-input name="locked" label="Locked" disabled></arc-input>
      </arc-fieldset>
    `);
    await settle(fs);

    fs.disabled = true;
    await settle(fs);
    fs.disabled = false;
    await settle(fs);

    expect(fs.querySelector('[name="email"]').disabled, 'cascaded control').to.equal(false);
    expect(fs.querySelector('[name="locked"]').disabled, 'own disabled').to.equal(true);
  });

  it('disables a control added while it is disabled', async () => {
    const fs = mount(`
      <arc-fieldset legend="Contact" disabled>
        <arc-input name="email" label="Email"></arc-input>
      </arc-fieldset>
    `);
    await settle(fs);

    const late = document.createElement('arc-input');
    late.setAttribute('name', 'late');
    fs.append(late);
    await settle(fs);
    expect(late.disabled, 'added while disabled').to.equal(true);

    fs.disabled = false;
    await settle(fs);
    expect(late.disabled, 'released with the rest').to.equal(false);
  });

  it('nested fieldsets: the last one re-enabled releases the control', async () => {
    const outer = mount(`
      <arc-fieldset legend="Outer">
        <arc-fieldset legend="Inner">
          <arc-input name="email" label="Email"></arc-input>
        </arc-fieldset>
      </arc-fieldset>
    `);
    await settle(outer);
    const inner = outer.querySelector('arc-fieldset');
    const input = outer.querySelector('arc-input');

    outer.disabled = true;
    await settle(outer);
    inner.disabled = true;
    await settle(outer);
    outer.disabled = false;
    await settle(outer);
    expect(input.disabled, 'inner still disabled').to.equal(true);

    inner.disabled = false;
    await settle(outer);
    expect(input.disabled, 'both re-enabled').to.equal(false);
  });
});
