/**
 * arc-inline-edit: the display/edit swap and its commit contract.
 *
 * The contract under test: `value` is the committed text and the only thing a
 * form ever submits; keystrokes accumulate in a draft that becomes `value` on
 * commit (Enter or blur) and evaporates on Escape. arc-change means the value
 * actually changed — an unchanged commit is silent. arc-cancel means the draft
 * was thrown away.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/input/inline-edit.register.js';

afterEach(() => cleanup());

/** Record arc-input / arc-change / arc-cancel in fire order. */
function record(el) {
  const seen = [];
  el.addEventListener('arc-input', (e) => seen.push(['input', e.detail.value]));
  el.addEventListener('arc-change', (e) => seen.push(['change', e.detail.value]));
  el.addEventListener('arc-cancel', (e) => seen.push(['cancel', e.detail.value]));
  return seen;
}

const only = (seen, kind) => seen.filter(([k]) => k === kind);

const display = (el) => el.shadowRoot.querySelector('.inline-edit__display');
const field = (el) => el.shadowRoot.querySelector('.inline-edit__field');

async function mountEdit(markup) {
  const el = mount(markup);
  await el.updateComplete;
  return el;
}

/** Activate, then let the focus/select microtask settle. */
async function activate(el) {
  display(el).click();
  await el.updateComplete;
  await tick();
}

function type(el, text) {
  const f = field(el);
  f.value = text;
  f.dispatchEvent(new Event('input', { bubbles: true }));
}

const key = (init) => new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });

describe('arc-inline-edit display state', () => {
  it('renders the value as text inside a button', async () => {
    const el = await mountEdit('<arc-inline-edit value="Take Five" label="Track title"></arc-inline-edit>');
    const btn = display(el);
    expect(btn).to.exist;
    expect(btn.textContent).to.include('Take Five');
    expect(btn.getAttribute('aria-label')).to.equal('Edit Track title');
    expect(field(el)).to.not.exist;
  });

  it('shows the placeholder when empty', async () => {
    const el = await mountEdit('<arc-inline-edit label="Title"></arc-inline-edit>');
    expect(display(el).textContent).to.include('Empty');
    expect(el.shadowRoot.querySelector('.inline-edit__text--empty')).to.exist;
  });
});

describe('arc-inline-edit activation', () => {
  it('click enters edit mode with the field focused and selected', async () => {
    const el = await mountEdit('<arc-inline-edit value="Take Five" label="Title"></arc-inline-edit>');
    await activate(el);

    const f = field(el);
    expect(f).to.exist;
    expect(display(el)).to.not.exist;
    expect(el.shadowRoot.activeElement).to.equal(f);
    expect(f.value).to.equal('Take Five');
    expect(f.selectionStart).to.equal(0);
    expect(f.selectionEnd).to.equal('Take Five'.length);
  });

  it('Enter and F2 on the focused display enter edit mode', async () => {
    for (const k of ['Enter', 'F2']) {
      const el = await mountEdit('<arc-inline-edit value="x" label="Title"></arc-inline-edit>');
      display(el).dispatchEvent(key({ key: k }));
      await el.updateComplete;
      expect(field(el), `${k} should activate`).to.exist;
      cleanup();
    }
  });
});

describe('arc-inline-edit commit', () => {
  it('Enter commits once with the new value and returns to display', async () => {
    const el = await mountEdit('<arc-inline-edit value="Old" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    type(el, 'New');
    field(el).dispatchEvent(key({ key: 'Enter' }));
    await el.updateComplete;

    expect(only(seen, 'change')).to.deep.equal([['change', 'New']]);
    expect(el.value).to.equal('New');
    expect(field(el)).to.not.exist;
    expect(display(el).textContent).to.include('New');
  });

  it('blur commits once', async () => {
    const el = await mountEdit('<arc-inline-edit value="Old" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    type(el, 'Blurred');
    field(el).dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;

    expect(only(seen, 'change')).to.deep.equal([['change', 'Blurred']]);
    expect(el.value).to.equal('Blurred');
  });

  it('an unchanged commit fires nothing', async () => {
    const el = await mountEdit('<arc-inline-edit value="Same" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    field(el).dispatchEvent(key({ key: 'Enter' }));
    await el.updateComplete;

    expect(only(seen, 'change')).to.have.lengthOf(0);
    expect(only(seen, 'cancel')).to.have.lengthOf(0);
    expect(el.value).to.equal('Same');
    expect(display(el)).to.exist;
  });

  it('the blur that follows an Enter commit does not double-fire', async () => {
    const el = await mountEdit('<arc-inline-edit value="Old" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    type(el, 'Once');
    const f = field(el);
    f.dispatchEvent(key({ key: 'Enter' }));
    f.dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;

    expect(only(seen, 'change')).to.have.lengthOf(1);
  });
});

describe('arc-inline-edit cancel', () => {
  it('Escape reverts, fires arc-cancel, and no arc-change', async () => {
    const el = await mountEdit('<arc-inline-edit value="Keep me" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    type(el, 'Discard me');
    field(el).dispatchEvent(key({ key: 'Escape' }));
    await el.updateComplete;

    expect(only(seen, 'cancel')).to.deep.equal([['cancel', 'Keep me']]);
    expect(only(seen, 'change')).to.have.lengthOf(0);
    expect(el.value).to.equal('Keep me');
    expect(display(el)).to.exist;
  });

  it('Escape does not propagate out of the component', async () => {
    const el = await mountEdit('<arc-inline-edit value="x" label="Title"></arc-inline-edit>');
    await activate(el);

    let escaped = false;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') escaped = true; }, { once: true });
    field(el).dispatchEvent(key({ key: 'Escape' }));
    await el.updateComplete;

    expect(escaped, 'a containing overlay must not see the Escape').to.equal(false);
  });
});

describe('arc-inline-edit typing', () => {
  it('emits arc-input per keystroke with the draft, and does not commit', async () => {
    const el = await mountEdit('<arc-inline-edit value="" label="Title"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    for (const text of ['a', 'ab', 'abc']) type(el, text);
    await tick();

    expect(only(seen, 'input').map(([, v]) => v)).to.deep.equal(['a', 'ab', 'abc']);
    expect(only(seen, 'change')).to.have.lengthOf(0);
    expect(el.value, 'value stays committed while typing').to.equal('');
  });
});

describe('arc-inline-edit multiline', () => {
  it('renders a textarea and plain Enter does not commit', async () => {
    const el = await mountEdit('<arc-inline-edit multiline value="line one" label="Notes"></arc-inline-edit>');
    const seen = record(el);
    await activate(el);

    expect(field(el).tagName).to.equal('TEXTAREA');
    field(el).dispatchEvent(key({ key: 'Enter' }));
    await el.updateComplete;

    expect(field(el), 'still editing after plain Enter').to.exist;
    expect(only(seen, 'change')).to.have.lengthOf(0);
  });

  it('Ctrl+Enter and Meta+Enter commit', async () => {
    for (const mod of [{ ctrlKey: true }, { metaKey: true }]) {
      const el = await mountEdit('<arc-inline-edit multiline value="a" label="Notes"></arc-inline-edit>');
      const seen = record(el);
      await activate(el);

      type(el, 'a\nb');
      field(el).dispatchEvent(key({ key: 'Enter', ...mod }));
      await el.updateComplete;

      expect(only(seen, 'change'), JSON.stringify(mod)).to.deep.equal([['change', 'a\nb']]);
      expect(el.value).to.equal('a\nb');
      cleanup();
    }
  });
});

describe('arc-inline-edit validation and form', () => {
  it('required and empty is invalid, in display state, with the error tint class', async () => {
    const el = await mountEdit('<arc-inline-edit required label="Title"></arc-inline-edit>');
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);
    expect(el.shadowRoot.querySelector('.inline-edit__display--invalid')).to.exist;

    el.value = 'filled';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
    expect(el.shadowRoot.querySelector('.inline-edit__display--invalid')).to.not.exist;
  });

  it('submits the committed value, not an in-progress draft', async () => {
    const form = mount('<form><arc-inline-edit name="title" value="Committed" label="Title"></arc-inline-edit></form>');
    const el = form.querySelector('arc-inline-edit');
    await el.updateComplete;

    expect(new FormData(form).get('title')).to.equal('Committed');

    display(el).click();
    await el.updateComplete;
    await tick();
    type(el, 'Draft in progress');
    await el.updateComplete;

    expect(new FormData(form).get('title'), 'draft must not leak into the form').to.equal('Committed');

    field(el).dispatchEvent(key({ key: 'Enter' }));
    await el.updateComplete;
    expect(new FormData(form).get('title')).to.equal('Draft in progress');
  });
});

describe('arc-inline-edit readonly and disabled', () => {
  it('readonly never enters edit mode', async () => {
    const el = await mountEdit('<arc-inline-edit readonly value="Locked" label="Title"></arc-inline-edit>');
    display(el).click();
    display(el).dispatchEvent(key({ key: 'F2' }));
    el.edit();
    await el.updateComplete;
    expect(field(el)).to.not.exist;
  });

  it('disabled renders a disabled button and never enters edit mode', async () => {
    const el = await mountEdit('<arc-inline-edit disabled value="Off" label="Title"></arc-inline-edit>');
    expect(display(el).disabled).to.equal(true);
    el.edit();
    await el.updateComplete;
    expect(field(el)).to.not.exist;
  });
});

describe('arc-inline-edit methods', () => {
  it('edit() enters edit mode with focus and selection', async () => {
    const el = await mountEdit('<arc-inline-edit value="Programmatic" label="Title"></arc-inline-edit>');
    el.edit();
    await el.updateComplete;
    await tick();

    const f = field(el);
    expect(f).to.exist;
    expect(el.shadowRoot.activeElement).to.equal(f);
    expect(f.selectionEnd).to.equal('Programmatic'.length);
  });

  it('commit() commits the draft', async () => {
    const el = await mountEdit('<arc-inline-edit value="Old" label="Title"></arc-inline-edit>');
    const seen = record(el);
    el.edit();
    await el.updateComplete;
    await tick();

    type(el, 'Via method');
    el.commit();
    await el.updateComplete;

    expect(only(seen, 'change')).to.deep.equal([['change', 'Via method']]);
    expect(el.value).to.equal('Via method');
    expect(display(el)).to.exist;
  });

  it('cancel() reverts and fires arc-cancel', async () => {
    const el = await mountEdit('<arc-inline-edit value="Old" label="Title"></arc-inline-edit>');
    const seen = record(el);
    el.edit();
    await el.updateComplete;
    await tick();

    type(el, 'Never mind');
    el.cancel();
    await el.updateComplete;

    expect(only(seen, 'cancel')).to.deep.equal([['cancel', 'Old']]);
    expect(only(seen, 'change')).to.have.lengthOf(0);
    expect(el.value).to.equal('Old');
  });

  it('commit() and cancel() outside edit mode are no-ops', async () => {
    const el = await mountEdit('<arc-inline-edit value="Rest" label="Title"></arc-inline-edit>');
    const seen = record(el);
    el.commit();
    el.cancel();
    await el.updateComplete;
    expect(seen).to.have.lengthOf(0);
  });
});
