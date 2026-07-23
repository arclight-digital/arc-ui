import { expect } from '@esm-bundle/chai';
import '../src/feedback/modal.register.js';
import { deepActive, mount, cleanup, tick } from './helpers.js';

async function mountModal() {
  const el = mount(`
    <arc-modal heading="Test modal">
      <p>Body</p>
      <button id="in-modal">Action</button>
    </arc-modal>
  `);
  await el.updateComplete;
  return el;
}

describe('arc-modal focus management', () => {
  afterEach(cleanup);

  it('moves focus into the dialog when opened', async () => {
    const el = await mountModal();
    el.open = true;
    await el.updateComplete;
    await tick();
    const active = deepActive();
    expect(active).to.not.equal(document.body);
    const insideModal = el.contains(active) || el.shadowRoot.contains(active);
    expect(insideModal, `active element <${active.tagName}> should be inside the modal`).to.equal(true);
  });

  it('is immediately visible when opened (no visibility transition on open)', async () => {
    const el = await mountModal();
    el.open = true;
    await el.updateComplete;
    const backdrop = el.shadowRoot.querySelector('.modal__backdrop');
    expect(getComputedStyle(backdrop).visibility).to.equal('visible');
  });
});
