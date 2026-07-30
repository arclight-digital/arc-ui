/**
 * arc-input vs arc-change, on the four controls that only ever fired
 * arc-change.
 *
 * The v3 contract: `arc-input` is every edit as it happens, `arc-change` is a
 * committed value. Four controls fired `arc-change` per keystroke or per
 * pointermove — the committed-value name for typing behaviour — so a consumer
 * doing something expensive on arc-change did it on every character, and one
 * submitting a code on arc-change submitted every incomplete prefix first.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/number-input.register.js';
import '../src/input/otp-input.register.js';
import '../src/input/pin-input.register.js';
import '../src/input/color-picker.register.js';

afterEach(() => cleanup());

/** Record both events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

describe('arc-number-input', () => {
  it('typing emits arc-input and does not commit', async () => {
    const el = mount('<arc-number-input value="1"></arc-number-input>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.number-input__field');
    field.value = '42';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();

    expect(only(seen, 'input').length, 'arc-input').to.equal(1);
    expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
    expect(el.value).to.equal(42);
  });

  it('blur or Enter commits', async () => {
    const el = mount('<arc-number-input value="1"></arc-number-input>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.number-input__field');
    field.value = '7';
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
  });

  it('a stepper click is edit and commit at once, as the native control is', async () => {
    const el = mount('<arc-number-input value="1"></arc-number-input>');
    await el.updateComplete;
    const seen = record(el);

    el.shadowRoot.querySelector('[part="increment"]').click();
    await tick();

    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
  });
});

for (const [tag, len] of [['arc-otp-input', 4], ['arc-pin-input', 4]]) {
  describe(tag, () => {
    async function typeInto(el, chars) {
      const boxes = [...el.shadowRoot.querySelectorAll('input')];
      for (let i = 0; i < chars.length; i++) {
        boxes[i].value = chars[i];
        boxes[i].dispatchEvent(new Event('input', { bubbles: true }));
        await tick();
      }
    }

    it('emits arc-input per character and commits only when complete', async () => {
      const el = mount(`<${tag} length="${len}"></${tag}>`);
      await el.updateComplete;
      const seen = record(el);

      await typeInto(el, ['1', '2', '3']);
      expect(only(seen, 'input').length, 'one per character').to.equal(3);
      expect(only(seen, 'change').length, 'incomplete code must not commit').to.equal(0);

      await typeInto(el, ['1', '2', '3', '4']);
      expect(only(seen, 'change').length, 'complete code commits').to.equal(1);
      expect(only(seen, 'change')[0][1]).to.have.lengthOf(len);
    });
  });
}

describe('arc-pin-input keeps arc-complete', () => {
  it('fires it alongside arc-change', async () => {
    const el = mount('<arc-pin-input length="2"></arc-pin-input>');
    await el.updateComplete;
    const completes = [];
    el.addEventListener('arc-complete', (e) => completes.push(e.detail.value));
    const seen = record(el);

    const boxes = [...el.shadowRoot.querySelectorAll('input')];
    for (let i = 0; i < 2; i++) {
      boxes[i].value = String(i + 1);
      boxes[i].dispatchEvent(new Event('input', { bubbles: true }));
      await tick();
    }

    expect(completes).to.deep.equal(['12']);
    expect(only(seen, 'change').length).to.equal(1);
  });
});

describe('arc-color-picker', () => {
  /** Presets only render when supplied — an array prop, so set from script. */
  async function mountPicker(presets) {
    const el = mount('<arc-color-picker value="#000000"></arc-color-picker>');
    if (presets) el.presets = presets;
    await el.updateComplete;
    return el;
  }

  it('a preset click is edit and commit at once', async () => {
    const el = await mountPicker(['#ff0000', '#00ff00']);
    const seen = record(el);

    el.shadowRoot.querySelector('.picker__swatch').click();
    await tick();

    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
  });

  it('dragging emits arc-input per move and commits once on release', async () => {
    const el = await mountPicker();
    const seen = record(el);

    const area = el.shadowRoot.querySelector('.picker__area');
    const box = area.getBoundingClientRect();
    // setPointerCapture rejects an id it has never seen, so the whole gesture
    // carries one real pointerId.
    const pointer = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' };
    area.dispatchEvent(new PointerEvent('pointerdown', {
      ...pointer, clientX: box.left + 10, clientY: box.top + 10,
    }));
    for (const dx of [20, 30, 40]) {
      window.dispatchEvent(new PointerEvent('pointermove', {
        ...pointer, clientX: box.left + dx, clientY: box.top + 20,
      }));
      await tick();
    }
    window.dispatchEvent(new PointerEvent('pointerup', pointer));
    await tick();

    expect(only(seen, 'input').length, 'one per move').to.be.greaterThan(1);
    expect(only(seen, 'change').length, 'exactly one commit').to.equal(1);
  });
});
