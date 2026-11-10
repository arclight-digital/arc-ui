/**
 * arc-toggle: keyboard activation.
 *
 * What this pins: Space and Enter both flip the switch, as the WAI-ARIA switch
 * pattern allows and as button-based switches do, and neither submits a
 * surrounding form. Submitting the form by its own means still carries the
 * toggle's value.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/toggle.register.js';
import '../src/input/form.register.js';

afterEach(() => cleanup());

async function toggle(attrs = '') {
  const el = mount(`<arc-toggle label="Wi-Fi" ${attrs}></arc-toggle>`);
  await settle(el);
  return el;
}

const track = (el) => el.shadowRoot.querySelector('[role="switch"]');

describe('arc-toggle keyboard', () => {
  it('toggles on Space', async () => {
    const el = await toggle();
    keyOn(track(el), ' ');
    await settle(el);
    expect(el.checked).to.equal(true);
  });

  it('toggles on Enter and fires one arc-change', async () => {
    const el = await toggle();
    const seen = record(el, ['arc-change']);
    keyOn(track(el), 'Enter');
    await settle(el);
    expect(el.checked).to.equal(true);
    expect(track(el).getAttribute('aria-checked')).to.equal('true');
    expect(seen).to.have.lengthOf(1);
    keyOn(track(el), 'Enter');
    await settle(el);
    expect(el.checked).to.equal(false);
  });

  it('ignores Enter when disabled', async () => {
    const el = await toggle('disabled');
    keyOn(track(el), 'Enter');
    await settle(el);
    expect(el.checked).to.equal(false);
  });

  it('claims Enter so it does not also submit a surrounding form', async () => {
    const form = mount('<form><arc-toggle name="wifi" label="Wi-Fi"></arc-toggle></form>');
    const el = form.querySelector('arc-toggle');
    await settle(el);
    let submits = 0;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submits += 1;
    });
    const event = new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true, composed: true, cancelable: true,
    });
    track(el).dispatchEvent(event);
    await settle(el);
    expect(el.checked).to.equal(true);
    expect(event.defaultPrevented).to.equal(true);
    expect(submits).to.equal(0);
  });

  it('does not trigger arc-form implicit submission on Enter', async () => {
    const form = mount('<arc-form><arc-toggle name="wifi" label="Wi-Fi"></arc-toggle></arc-form>');
    const el = form.querySelector('arc-toggle');
    await settle(form);
    await settle(el);
    let submits = 0;
    form.addEventListener('arc-submit', () => { submits += 1; });
    keyOn(track(el), 'Enter');
    await settle(el);
    expect(el.checked).to.equal(true);
    expect(submits).to.equal(0);
  });

  it('submits its value when the form is submitted', async () => {
    const form = mount('<form><arc-toggle name="wifi" label="Wi-Fi"></arc-toggle></form>');
    const el = form.querySelector('arc-toggle');
    await settle(el);
    keyOn(track(el), 'Enter');
    await settle(el);
    let data = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      data = new FormData(form);
    });
    form.requestSubmit();
    expect(data.get('wifi')).to.equal('on');
  });
});
