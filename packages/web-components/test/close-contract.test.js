/**
 * The v3 close contract: user-initiated closes fire a cancelable `arc-close`
 * BEFORE the component closes, and preventDefault() vetoes the close — the
 * "unsaved changes" affordance v2 never had. Transient auto-dismissing
 * surfaces (toast, snackbar) are exempt by design: a veto would fight their
 * own timers, so they emit non-cancelable post-close notifications.
 *
 * Also pins the companion rule from the same pass: `detail.value` is always
 * present and canonical on arc-change, with component-specific keys riding
 * alongside (checkbox keeps `checked`).
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/modal.register.js';
import '../src/feedback/alert.register.js';
import '../src/input/checkbox.register.js';
import { mount, cleanup, tick } from './helpers.js';

describe('cancelable arc-close', () => {
  afterEach(cleanup);

  it('modal: preventDefault() on arc-close vetoes the close', async () => {
    const el = mount('<arc-modal heading="m"><p>body</p></arc-modal>');
    el.open = true;
    await el.updateComplete;
    await tick();

    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    el.shadowRoot.querySelector('arc-icon-button').click();
    await el.updateComplete;
    expect(el.open, 'vetoed close must leave the modal open').to.equal(true);

    el.shadowRoot.querySelector('arc-icon-button').click();
    await el.updateComplete;
    expect(el.open, 'unvetoed close must close').to.equal(false);
  });

  it('modal: arc-close fires before the state flips', async () => {
    const el = mount('<arc-modal heading="m"><p>body</p></arc-modal>');
    el.open = true;
    await el.updateComplete;

    let openDuringEvent = null;
    el.addEventListener('arc-close', () => { openDuringEvent = el.open; }, { once: true });
    el.shadowRoot.querySelector('arc-icon-button').click();
    expect(openDuringEvent, 'listener must observe the still-open state').to.equal(true);
  });

  it('alert: preventDefault() keeps the alert visible', async () => {
    const el = mount('<arc-alert dismissible>content</arc-alert>');
    await el.updateComplete;

    el.addEventListener('arc-close', (e) => e.preventDefault(), { once: true });
    el.shadowRoot.querySelector('arc-icon-button').click();
    await el.updateComplete;
    expect(el.style.display, 'vetoed dismiss must not hide the alert').to.not.equal('none');

    el.shadowRoot.querySelector('arc-icon-button').click();
    await el.updateComplete;
    expect(el.style.display).to.equal('none');
  });
});

describe('arc-change detail.value is canonical', () => {
  afterEach(cleanup);

  it('checkbox carries value alongside checked', async () => {
    const el = mount('<arc-checkbox label="c"></arc-checkbox>');
    await el.updateComplete;

    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));
    el.shadowRoot.querySelector('[role="checkbox"]').click();
    await el.updateComplete;

    expect(details.length).to.equal(1);
    expect(details[0].value, 'detail.value must exist').to.equal(true);
    expect(details[0].checked, 'specific key must ride alongside').to.equal(true);
    expect(details[0].value).to.equal(details[0].checked);
  });
});
