/**
 * arc-command-bar — the search input strip.
 *
 * What this pins: the input mirrors `value` in both directions, arc-input fires
 * per keystroke and arc-submit on Enter, both carrying detail.value, and the
 * icon and hint slot render where documented.
 *
 * Two tests are marked BUG: the input has no accessible name, and Enter is not
 * claimed, so inside a form it submits twice. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/navigation/command-bar.register.js';

afterEach(() => cleanup());

async function bar(attrs = '', slotted = '') {
  const el = mount(`<arc-command-bar ${attrs}>${slotted}</arc-command-bar>`);
  await settle(el);
  return el;
}

const input = (el) => el.shadowRoot.querySelector('[part~="input"]');

/** Type into the native input the way a user would. */
async function type(el, text) {
  input(el).value = text;
  input(el).dispatchEvent(new Event('input', { bubbles: true }));
  await settle(el);
}

describe('arc-command-bar rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await bar();
    for (const part of ['base', 'icon', 'input', 'hint']) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders a text input with the default placeholder', async () => {
    const el = await bar();
    expect(input(el).type).to.equal('text');
    expect(input(el).placeholder).to.equal('Search…');
  });

  it('takes a custom placeholder', async () => {
    const el = await bar('placeholder="Find a component"');
    expect(input(el).placeholder).to.equal('Find a component');
  });

  it('passes the icon name through, with a default', async () => {
    const el = await bar();
    expect(el.shadowRoot.querySelector('arc-icon').getAttribute('name'))
      .to.equal('magnifying-glass');

    const custom = await bar('icon="command"');
    expect(custom.shadowRoot.querySelector('arc-icon').getAttribute('name')).to.equal('command');
  });

  it('projects the hint slot', async () => {
    const el = await bar('', '<kbd slot="hint">⌘K</kbd>');
    const assigned = el.shadowRoot.querySelector('slot[name="hint"]').assignedElements();
    expect(assigned).to.have.lengthOf(1);
    expect(assigned[0].textContent).to.equal('⌘K');
  });
});

describe('arc-command-bar value', () => {
  it('seeds the input from the value attribute', async () => {
    const el = await bar('value="modal"');
    expect(input(el).value).to.equal('modal');
  });

  it('pushes a programmatic value into the input', async () => {
    const el = await bar();
    el.value = 'tabs';
    await settle(el);
    expect(input(el).value).to.equal('tabs');
  });

  it('tracks what the user types', async () => {
    const el = await bar();
    await type(el, 'grid');
    expect(el.value).to.equal('grid');
  });
});

describe('arc-command-bar events', () => {
  it('fires arc-input per keystroke with the current value', async () => {
    const el = await bar();
    const details = [];
    el.addEventListener('arc-input', (e) => details.push(e.detail));

    await type(el, 'a');
    await type(el, 'ab');

    expect(details).to.deep.equal([{ value: 'a' }, { value: 'ab' }]);
  });

  it('fires arc-submit on Enter with the current value', async () => {
    const el = await bar();
    await type(el, 'modal');
    const details = [];
    el.addEventListener('arc-submit', (e) => details.push(e.detail));

    keyOn(input(el), 'Enter');
    await settle(el);

    expect(details).to.deep.equal([{ value: 'modal' }]);
  });

  it('does not submit on other keys', async () => {
    const el = await bar();
    const seen = record(el, ['arc-submit']);

    keyOn(input(el), 'Escape');
    keyOn(input(el), 'a');
    await settle(el);

    expect(seen).to.deep.equal([]);
  });

  it('both events bubble and cross the shadow boundary', async () => {
    const el = await bar();
    const heard = [];
    document.body.addEventListener('arc-input', (e) => heard.push(e));
    document.body.addEventListener('arc-submit', (e) => heard.push(e));

    await type(el, 'x');
    keyOn(input(el), 'Enter');
    await settle(el);

    expect(heard).to.have.lengthOf(2);
    expect(heard.every((e) => e.bubbles && e.composed)).to.equal(true);
  });

  it('stays silent when value is set from script', async () => {
    const el = await bar();
    const seen = record(el, ['arc-input', 'arc-submit']);

    el.value = 'quiet';
    await settle(el);

    expect(seen).to.deep.equal([]);
  });
});

describe('arc-command-bar accessibility', () => {
  // Was a BUG pin (finding #29). The input carried no aria-label, no
  // aria-labelledby and no associated <label> — only a placeholder, which is
  // explicitly not an accessible name: it is announced inconsistently and
  // disappears the moment the user types. There was no `label` prop to supply
  // one, and an aria-label on the *host* does not reach into the shadow root.
  it('names the input from the label prop', async () => {
    const el = await bar('label="Search components"');
    expect(input(el).getAttribute('aria-label')).to.equal('Search components');
  });

  it('falls back to a generic name rather than going unnamed', async () => {
    const el = await bar();
    expect(input(el).getAttribute('aria-label')).to.equal('Search');
  });

  it('keeps the name once the placeholder is gone', async () => {
    // The whole reason a placeholder is not a name: it disappears on the first
    // keystroke, and that is exactly when the user most needs to know what the
    // field is.
    const el = await bar('label="Search components"');
    el.value = 'typed';
    await settle(el);

    expect(input(el).getAttribute('aria-label')).to.equal('Search components');
  });

  // Was a BUG pin (finding #30). _onKeyDown dispatched arc-submit and never
  // called preventDefault, so inside a <form> a single Enter produced both an
  // arc-submit and the form's own implicit submission.
  it('claims Enter, so a form does not also submit', async () => {
    const form = mount('<form><arc-command-bar></arc-command-bar></form>');
    const el = form.querySelector('arc-command-bar');
    await settle(el);

    let nativeSubmits = 0;
    form.addEventListener('submit', (e) => { e.preventDefault(); nativeSubmits++; });
    const seen = record(el, ['arc-submit']);

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input(el).dispatchEvent(event);
    await settle(el);

    expect(seen, 'arc-submit fires').to.have.lengthOf(1);
    expect(event.defaultPrevented, 'and the key is claimed').to.equal(true);
    expect(nativeSubmits, 'so one press is one submission').to.equal(0);
  });

  it('leaves every other key for the page', async () => {
    // Anti-vacuity: a handler that claimed everything would pass the test
    // above and break typing in a form.
    const el = await bar();
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    input(el).dispatchEvent(event);
    await settle(el);

    expect(event.defaultPrevented).to.equal(false);
  });
});
