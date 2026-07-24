import { expect } from '@esm-bundle/chai';
import '../src/input/form.register.js';
import '../src/input/button.register.js';
import '../src/input/input.register.js';
import { mount, cleanup, tick } from './helpers.js';

async function mountForm(inner) {
  const el = mount(`<arc-form>${inner}</arc-form>`);
  await el.updateComplete;
  for (const child of el.querySelectorAll('*')) {
    await child.updateComplete?.catch?.(() => {});
  }
  await tick();
  return el;
}

function innerButton(arcButton) {
  return arcButton.shadowRoot.querySelector('button');
}

describe('arc-form submission wiring', () => {
  afterEach(cleanup);

  it('submits when a slotted arc-button[type="submit"] is clicked', async () => {
    const form = await mountForm(`
      <arc-input name="email" value="a@b.c"></arc-input>
      <arc-button type="submit">Send</arc-button>
    `);
    let detail = null;
    form.addEventListener('arc-submit', (e) => { detail = e.detail; });
    innerButton(form.querySelector('arc-button')).click();
    expect(detail, 'arc-submit event').to.not.equal(null);
    expect(detail.values.email).to.equal('a@b.c');
  });

  it('resets when a slotted arc-button[type="reset"] is clicked', async () => {
    const form = await mountForm(`
      <arc-input name="email" value="a@b.c"></arc-input>
      <arc-button type="reset">Clear</arc-button>
    `);
    let resetFired = false;
    form.addEventListener('arc-reset', () => { resetFired = true; });
    innerButton(form.querySelector('arc-button')).click();
    expect(resetFired).to.equal(true);
    expect(form.querySelector('arc-input').value).to.equal('');
  });

  it('does nothing for type="button" clicks', async () => {
    const form = await mountForm(`<arc-button>Plain</arc-button>`);
    let submitFired = false;
    form.addEventListener('arc-submit', () => { submitFired = true; });
    innerButton(form.querySelector('arc-button')).click();
    expect(submitFired).to.equal(false);
  });

  it('submits a native ancestor <form> from arc-button[type="submit"]', async () => {
    const wrapper = mount(`
      <form>
        <arc-button type="submit">Send</arc-button>
      </form>
    `);
    const arcButton = wrapper.querySelector('arc-button');
    await arcButton.updateComplete;
    let submitted = false;
    wrapper.addEventListener('submit', (e) => { e.preventDefault(); submitted = true; });
    innerButton(arcButton).click();
    expect(submitted).to.equal(true);
  });

  it('submits on Enter in a slotted single-line arc-input', async () => {
    const form = await mountForm(`<arc-input name="q" value="hello"></arc-input>`);
    let detail = null;
    form.addEventListener('arc-submit', (e) => { detail = e.detail; });
    const inner = form.querySelector('arc-input').shadowRoot.querySelector('input');
    inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }));
    expect(detail, 'arc-submit event').to.not.equal(null);
    expect(detail.values.q).to.equal('hello');
  });

  it('does not submit on Enter in a multiline arc-input (textarea)', async () => {
    const form = await mountForm(`<arc-input name="msg" multiline value="hi"></arc-input>`);
    let submitFired = false;
    form.addEventListener('arc-submit', () => { submitFired = true; });
    const inner = form.querySelector('arc-input').shadowRoot.querySelector('textarea');
    expect(inner, 'multiline renders a textarea').to.exist;
    inner.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }));
    expect(submitFired).to.equal(false);
  });

  it('validates required fields before submitting', async () => {
    const form = await mountForm(`
      <arc-input name="email" label="Email" required></arc-input>
      <arc-button type="submit">Send</arc-button>
    `);
    let submitFired = false;
    let invalidDetail = null;
    form.addEventListener('arc-submit', () => { submitFired = true; });
    form.addEventListener('arc-invalid', (e) => { invalidDetail = e.detail; });
    innerButton(form.querySelector('arc-button')).click();
    expect(submitFired).to.equal(false);
    expect(invalidDetail.errors).to.have.length(1);
  });

  it('ignores submission while loading', async () => {
    const form = await mountForm(`
      <arc-input name="email" value="a@b.c"></arc-input>
      <arc-button type="submit">Send</arc-button>
    `);
    form.loading = true;
    await form.updateComplete;
    let submitFired = false;
    form.addEventListener('arc-submit', () => { submitFired = true; });
    form.submit();
    expect(submitFired).to.equal(false);
  });
});
