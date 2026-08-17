/**
 * arc-input vs arc-change, on the four controls that only ever fired
 * arc-change — and then on every other text-editing control, so the whole
 * family is pinned, not just the ones that were caught misbehaving.
 *
 * The v3 contract: `arc-input` is every edit as it happens, `arc-change` is a
 * committed value. Four controls fired `arc-change` per keystroke or per
 * pointermove — the committed-value name for typing behaviour — so a consumer
 * doing something expensive on arc-change did it on every character, and one
 * submitting a code on arc-change submitted every incomplete prefix first.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick, record, only } from './helpers.js';

import '../src/input/number-input.register.js';
import '../src/input/pin-input.register.js';
import '../src/input/color-picker.register.js';
import '../src/input/input.register.js';
import '../src/input/textarea.register.js';
import '../src/input/password-input.register.js';
import '../src/input/search.register.js';
import '../src/input/suggestion.register.js';
import '../src/input/combobox.register.js';
import '../src/input/multi-select.register.js';
import '../src/input/tag-input.register.js';
import '../src/shared/option.register.js';

afterEach(() => cleanup());

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

    el.shadowRoot.querySelector('[part~="increment"]').click();
    await tick();

    expect(seen.map(([k]) => k)).to.deep.equal(['input', 'change']);
  });
});

for (const [tag, len] of [['arc-pin-input', 4]]) {
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

/**
 * The plain text fields share one shape: native `input` while typing, native
 * `change` on blur-after-edit. The native change event is what the browser
 * fires on commit, so dispatching it directly is the blur path.
 */
for (const [tag, selector] of [
  ['arc-input', '.input-group__field'],
  ['arc-textarea', 'textarea'],
  ['arc-password-input', '.input-group__field'],
]) {
  describe(tag, () => {
    it('typing emits arc-input and does not commit', async () => {
      const el = mount(`<${tag}></${tag}>`);
      await el.updateComplete;
      const seen = record(el);

      const field = el.shadowRoot.querySelector(selector);
      field.value = 'a';
      field.dispatchEvent(new Event('input', { bubbles: true }));
      await tick();

      expect(only(seen, 'input').length, 'arc-input').to.equal(1);
      expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
      expect(el.value).to.equal('a');
    });

    it('blur commits once', async () => {
      const el = mount(`<${tag}></${tag}>`);
      await el.updateComplete;
      const seen = record(el);

      const field = el.shadowRoot.querySelector(selector);
      field.value = 'done';
      field.dispatchEvent(new Event('change', { bubbles: true }));
      await tick();

      expect(only(seen, 'change').length).to.equal(1);
      expect(only(seen, 'change')[0][1]).to.equal('done');
    });
  });
}

describe('arc-search', () => {
  /** record() plus arc-select, whose ordering against arc-change is the contract. */
  function recordWithSelect(el) {
    const seen = record(el);
    el.addEventListener('arc-select', (e) => seen.push(['select', e.detail.value]));
    return seen;
  }

  it('typing emits arc-input and does not commit', async () => {
    const el = mount('<arc-search></arc-search>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.search__input');
    field.value = 'q';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();

    expect(only(seen, 'input').length, 'arc-input').to.equal(1);
    expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
  });

  it('Enter with nothing highlighted commits the typed text once', async () => {
    const el = mount('<arc-search></arc-search>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.search__input');
    field.value = 'query';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1]).to.equal('query');
  });

  it('picking a suggestion is arc-select then arc-change', async () => {
    const el = mount('<arc-search><arc-suggestion>Alpha</arc-suggestion></arc-search>');
    await el.updateComplete;
    await tick(); // slotchange → suggestion buttons render
    await el.updateComplete;
    const seen = recordWithSelect(el);

    el.shadowRoot.querySelector('.search__suggestion').click();
    await tick();

    expect(seen.map(([k]) => k), 'pick is a selection, then a commit').to.deep.equal(['select', 'change']);
    expect(only(seen, 'change')[0][1], 'commits the picked value').to.equal(el.value);
  });
});

describe('arc-combobox', () => {
  const markup = `<arc-combobox>
    <arc-option value="a">Alpha</arc-option>
    <arc-option value="b">Beta</arc-option>
  </arc-combobox>`;

  it('typing a query emits arc-input and does not commit', async () => {
    const el = mount(markup);
    await el.updateComplete;
    await tick();
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.combobox__input');
    field.value = 'al';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();

    expect(only(seen, 'input').length, 'arc-input').to.equal(1);
    expect(only(seen, 'input')[0][1], 'query text').to.equal('al');
    expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
  });

  it('picking an option commits once', async () => {
    const el = mount(markup);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    const seen = record(el);

    el.shadowRoot.querySelector('.combobox__option').click();
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1]).to.equal('a');
    expect(el.value).to.equal('a');
  });
});

describe('arc-multi-select', () => {
  const markup = `<arc-multi-select>
    <arc-option value="a">Alpha</arc-option>
    <arc-option value="b">Beta</arc-option>
  </arc-multi-select>`;

  it('typing a query emits arc-input and does not commit', async () => {
    const el = mount(markup);
    await el.updateComplete;
    await tick();
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.ms__input');
    field.value = 'be';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    await tick();

    expect(only(seen, 'input').length, 'arc-input').to.equal(1);
    expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
  });

  it('toggling an option commits the array once', async () => {
    const el = mount(markup);
    await el.updateComplete;
    await tick();
    await el.updateComplete;
    const seen = record(el);

    el.shadowRoot.querySelector('.ms__option').click();
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1]).to.deep.equal(['a']);
  });
});

describe('arc-tag-input', () => {
  it('typing emits arc-input per keystroke and does not commit', async () => {
    const el = mount('<arc-tag-input></arc-tag-input>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.ti__input');
    for (const text of ['a', 'ab', 'abc']) {
      field.value = text;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      await tick();
    }

    expect(only(seen, 'input').length, 'one per keystroke').to.equal(3);
    expect(only(seen, 'change').length, 'arc-change while typing').to.equal(0);
  });

  it('Enter commits the tag once', async () => {
    const el = mount('<arc-tag-input></arc-tag-input>');
    await el.updateComplete;
    const seen = record(el);

    const field = el.shadowRoot.querySelector('.ti__input');
    field.value = 'abc';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1]).to.deep.equal(['abc']);
  });
});
