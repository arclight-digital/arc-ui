/**
 * arc-masked-input: the mask is presentation, the value is raw.
 *
 * Everything here defends one decision — `value` (and the submitted form
 * value) holds only the characters the user provided, never the mask's
 * literals — plus the v3 commit contract: arc-input per accepted edit,
 * arc-change on blur/Enter and immediately when the mask completes (the
 * fixed-length precedent from otp-input).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/masked-input.register.js';

afterEach(() => cleanup());

const field = (el) => el.shadowRoot.querySelector('.masked__field');

/** Dispatch beforeinput per character, as typing delivers it. */
function type(el, text) {
  const f = field(el);
  for (const ch of text) {
    f.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'insertText', data: ch, bubbles: true, cancelable: true, composed: true,
    }));
  }
}

function backspace(el) {
  field(el).dispatchEvent(new InputEvent('beforeinput', {
    inputType: 'deleteContentBackward', bubbles: true, cancelable: true, composed: true,
  }));
}

function paste(el, text) {
  field(el).dispatchEvent(new InputEvent('beforeinput', {
    inputType: 'insertFromPaste', data: text, bubbles: true, cancelable: true, composed: true,
  }));
}

/** Record both commit-contract events in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

describe('arc-masked-input: raw value vs formatted presentation', () => {
  it('typing formats through the mask; value stays raw', async () => {
    const el = mount('<arc-masked-input mask="##/##/####"></arc-masked-input>');
    await el.updateComplete;

    type(el, '1204');
    expect(el.value, 'raw characters only').to.equal('1204');
    expect(el.formattedValue, 'literals are presentation').to.equal('12/04/');
    expect(field(el).value).to.equal('12/04/');
  });

  it('the in-field hint shows the unfilled remainder once typing starts', async () => {
    const el = mount('<arc-masked-input mask="##/##/####"></arc-masked-input>');
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('.masked__hint'), 'no hint before typing').to.equal(null);
    expect(field(el).placeholder, 'native placeholder shows the mask shape').to.equal('__/__/____');

    type(el, '12');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.masked__hint-rest').textContent).to.equal('__/____');
  });

  it('placeholder-char customises the hint shape', async () => {
    const el = mount('<arc-masked-input mask="##/##" placeholder-char="•"></arc-masked-input>');
    await el.updateComplete;
    expect(field(el).placeholder).to.equal('••/••');
  });

  it('a programmatic formatted string is conformed down to its raw characters', async () => {
    const el = mount('<arc-masked-input mask="##/##/####"></arc-masked-input>');
    await el.updateComplete;

    el.value = '12/04/2026';
    await el.updateComplete;
    expect(el.value).to.equal('12042026');
    expect(el.formattedValue).to.equal('12/04/2026');
  });

  it('uppercase slots normalise letters', async () => {
    const el = mount('<arc-masked-input mask="AAA-###"></arc-masked-input>');
    await el.updateComplete;

    type(el, 'abc123');
    expect(el.value).to.equal('ABC123');
    expect(el.formattedValue).to.equal('ABC-123');
  });
});

describe('arc-masked-input: caret and literal skipping', () => {
  it('typing lands the caret past literals, on the next fillable position', async () => {
    const el = mount('<arc-masked-input mask="##/##/####"></arc-masked-input>');
    await el.updateComplete;

    type(el, '12');
    expect(field(el).value).to.equal('12/');
    expect(field(el).selectionStart, 'caret sits after the auto-typed slash').to.equal(3);
  });

  it('backspace deletes the previous fillable char, skipping literals backward', async () => {
    const el = mount('<arc-masked-input mask="##/##"></arc-masked-input>');
    await el.updateComplete;

    type(el, '12');
    expect(field(el).value).to.equal('12/');
    backspace(el);
    expect(el.value).to.equal('1');
    expect(field(el).value).to.equal('1');
    expect(field(el).selectionStart).to.equal(1);
  });

  it('a rejected character changes nothing and fires nothing', async () => {
    const el = mount('<arc-masked-input mask="##/##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    type(el, 'x');
    expect(el.value).to.equal('');
    expect(field(el).value).to.equal('');
    expect(seen.length, 'silent rejection').to.equal(0);
  });

  it('paste strips non-conforming characters and fills', async () => {
    const el = mount('<arc-masked-input mask="#### #### #### ####"></arc-masked-input>');
    await el.updateComplete;

    paste(el, '4242-4242-4242-4242');
    expect(el.value).to.equal('4242424242424242');
    expect(el.formattedValue).to.equal('4242 4242 4242 4242');
  });
});

describe('arc-masked-input: commit contract', () => {
  it('typing emits arc-input per accepted edit and does not commit', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    type(el, '123');
    expect(only(seen, 'input').length, 'one per accepted character').to.equal(3);
    expect(only(seen, 'input')[2][1]).to.deep.equal({ value: '123', formatted: '12-3' });
    expect(only(seen, 'change').length, 'incomplete value must not commit').to.equal(0);
  });

  it('completing the mask commits immediately', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    type(el, '1234');
    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1]).to.deep.equal({ value: '1234', formatted: '12-34' });
  });

  it('blur commits a changed partial value once', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    field(el).focus();
    type(el, '12');
    field(el).blur();
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
    expect(only(seen, 'change')[0][1].value).to.equal('12');
  });

  it('blur after completion does not repeat the commit', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    field(el).focus();
    type(el, '1234');
    field(el).blur();
    await tick();

    expect(only(seen, 'change').length, 'completion already committed this value').to.equal(1);
  });

  it('Enter commits', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;
    const seen = record(el);

    field(el).focus();
    type(el, '12');
    field(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await tick();

    expect(only(seen, 'change').length).to.equal(1);
  });
});

describe('arc-masked-input: constraint validation', () => {
  it('required and empty is valueMissing', async () => {
    const el = mount('<arc-masked-input mask="##-##" required></arc-masked-input>');
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);
  });

  it('a partially filled mask is a pattern mismatch, required or not', async () => {
    const el = mount('<arc-masked-input mask="##-##"></arc-masked-input>');
    await el.updateComplete;

    type(el, '12');
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.patternMismatch).to.equal(true);
    expect(el.validationMessage).to.equal('Incomplete value');
  });

  it('a complete mask is valid', async () => {
    const el = mount('<arc-masked-input mask="##-##" required></arc-masked-input>');
    await el.updateComplete;

    type(el, '1234');
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });
});

describe('arc-masked-input: form participation', () => {
  it('submits the RAW value, never the formatted string', async () => {
    const form = mount('<form><arc-masked-input name="card" mask="#### ####"></arc-masked-input></form>');
    const el = form.querySelector('arc-masked-input');
    await el.updateComplete;

    el.value = '12345678';
    await el.updateComplete;
    expect(new FormData(form).get('card')).to.equal('12345678');
  });
});

describe('arc-masked-input: input-family parity', () => {
  it('name reflects', async () => {
    const el = mount('<arc-masked-input mask="##"></arc-masked-input>');
    el.name = 'f';
    await el.updateComplete;
    expect(el.getAttribute('name')).to.equal('f');
  });

  it('size reflects for styling', async () => {
    const el = mount('<arc-masked-input mask="##" size="sm"></arc-masked-input>');
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('disabled reaches the native field', async () => {
    const el = mount('<arc-masked-input mask="##" disabled></arc-masked-input>');
    await el.updateComplete;
    expect(field(el).disabled).to.equal(true);
  });

  it('readonly carries to the native field and blocks edits', async () => {
    const el = mount('<arc-masked-input mask="##" readonly></arc-masked-input>');
    await el.updateComplete;
    expect(field(el).readOnly).to.equal(true);

    type(el, '12');
    expect(el.value).to.equal('');
  });

  it('autocomplete passes through', async () => {
    const el = mount('<arc-masked-input mask="#### ####" autocomplete="cc-number"></arc-masked-input>');
    await el.updateComplete;
    expect(field(el).getAttribute('autocomplete')).to.equal('cc-number');
  });
});
