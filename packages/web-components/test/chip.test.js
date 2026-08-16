/**
 * arc-chip — the selectable tag.
 *
 * What this pins: the chip toggles on click and on Enter/Space, arc-change
 * carries the chip's `value` on detail.value with the boolean riding alongside,
 * `disabled` mutes every path, and — the interesting one — the ARIA role
 * switches on context: a chip inside a listbox or group is an `option` with
 * aria-selected, a standalone chip is a `button` with aria-pressed. Emitting
 * `option` outside a listbox is invalid ARIA, which is why the component checks.
 *
 * Note detail.value here is the chip's identity, not its state — unlike
 * arc-checkbox, where close-contract.test.js:66 pins detail.value === detail.checked.
 * Both satisfy the contract; a consumer reading detail.value gets "which chip"
 * and must read detail.selected for "on or off".
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/input/chip.register.js';

afterEach(() => cleanup());

async function chip(attrs = 'value="red"', text = 'Red') {
  const el = mount(`<arc-chip ${attrs}>${text}</arc-chip>`);
  await settle(el);
  return el;
}

/** Mount a chip inside a container carrying the given role. */
async function chipIn(role, attrs = 'value="red"') {
  const wrap = mount(`<div role="${role}"><arc-chip ${attrs}>Red</arc-chip></div>`);
  const el = wrap.querySelector('arc-chip');
  await settle(el);
  return el;
}

const control = (el) => el.shadowRoot.querySelector('[part~="chip"]');

describe('arc-chip rendering', () => {
  it('projects its label', async () => {
    const el = await chip();
    expect(el.textContent.trim()).to.equal('Red');
  });

  it('exposes the documented css part', async () => {
    const el = await chip();
    expect(control(el)).to.not.equal(null);
  });

  it('starts unselected and reflects selected once set', async () => {
    const el = await chip();
    expect(el.selected).to.equal(false);

    el.selected = true;
    await settle(el);
    expect(el.hasAttribute('selected'), 'reflects for [selected] selectors').to.equal(true);
  });
});

describe('arc-chip ARIA context switching', () => {
  it('is a toggle button when standalone', async () => {
    const el = await chip();
    expect(control(el).getAttribute('role')).to.equal('button');
    expect(control(el).getAttribute('aria-pressed')).to.equal('false');
    expect(control(el).hasAttribute('aria-selected'), 'aria-selected is meaningless here')
      .to.equal(false);
  });

  it('tracks aria-pressed as it toggles', async () => {
    const el = await chip();
    control(el).click();
    await settle(el);
    expect(control(el).getAttribute('aria-pressed')).to.equal('true');
  });

  it('becomes an option inside a listbox', async () => {
    const el = await chipIn('listbox');
    expect(control(el).getAttribute('role')).to.equal('option');
    expect(control(el).getAttribute('aria-selected')).to.equal('false');
    expect(control(el).hasAttribute('aria-pressed'), 'aria-pressed is invalid on an option')
      .to.equal(false);
  });

  it('becomes an option inside a group too', async () => {
    const el = await chipIn('group');
    expect(control(el).getAttribute('role')).to.equal('option');
  });

  it('tracks aria-selected as it toggles inside a listbox', async () => {
    const el = await chipIn('listbox');
    control(el).click();
    await settle(el);
    expect(control(el).getAttribute('aria-selected')).to.equal('true');
  });

  it('is in the tab order, and leaves it when disabled', async () => {
    expect(control(await chip()).getAttribute('tabindex')).to.equal('0');
    expect(control(await chip('value="red" disabled')).getAttribute('tabindex')).to.equal('-1');
  });
});

describe('arc-chip toggling', () => {
  it('toggles on click and announces value with the new state', async () => {
    const el = await chip();
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    control(el).click();
    await settle(el);
    expect(el.selected).to.equal(true);

    control(el).click();
    await settle(el);
    expect(el.selected).to.equal(false);

    expect(details).to.deep.equal([
      { value: 'red', selected: true },
      { value: 'red', selected: false },
    ]);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await chip();
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    control(el).click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('toggles exactly once for Enter and once for Space', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await chip();
      const seen = record(el, ['arc-change']);

      keyOn(control(el), key);
      await settle(el);

      expect(el.selected, `${key} must toggle once, not twice`).to.equal(true);
      expect(seen, key).to.have.lengthOf(1);
      cleanup();
    }
  });

  it('claims Enter and Space', async () => {
    const el = await chip();
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      control(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('ignores other keys', async () => {
    const el = await chip();
    const seen = record(el, ['arc-change']);

    keyOn(control(el), 'ArrowRight');
    await settle(el);

    expect(el.selected).to.equal(false);
    expect(seen).to.deep.equal([]);
  });

  it('carries an empty value when none was set', async () => {
    const el = await chip('');
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    control(el).click();
    await settle(el);

    expect(details).to.deep.equal([{ value: '', selected: true }]);
  });

  it('stays silent when selected is set from script', async () => {
    const el = await chip();
    const seen = record(el, ['arc-change']);

    el.selected = true;
    await settle(el);

    expect(control(el).getAttribute('aria-pressed'), 'the state still updates').to.equal('true');
    expect(seen).to.deep.equal([]);
  });
});

describe('arc-chip disabled', () => {
  it('announces itself disabled and leaves the tab order', async () => {
    const el = await chip('value="red" disabled');
    expect(control(el).getAttribute('aria-disabled')).to.equal('true');
    expect(control(el).getAttribute('tabindex')).to.equal('-1');
  });

  it('mutes click and keyboard alike', async () => {
    const el = await chip('value="red" disabled');
    const seen = record(el, ['arc-change']);

    control(el).click();
    keyOn(control(el), 'Enter');
    keyOn(control(el), ' ');
    await settle(el);

    expect(el.selected).to.equal(false);
    expect(seen).to.deep.equal([]);
  });

  it('keeps a selected chip selected while disabled', async () => {
    const el = await chip('value="red" selected disabled');
    control(el).click();
    await settle(el);
    expect(el.selected, 'disabled must not clear an existing selection').to.equal(true);
  });
});
