/**
 * arc-copy-button: the icon-only form and the accessible label.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';

import '../src/input/copy-button.register.js';

let restore;
beforeEach(() => {
  const clip = navigator.clipboard;
  const original = clip.writeText;
  clip.writeText = async () => {};
  restore = () => {
    clip.writeText = original;
  };
});
afterEach(() => {
  restore();
  cleanup();
});

const button = (el) => el.shadowRoot.querySelector('button');

describe('arc-copy-button', () => {
  it('shows its text label by default', async () => {
    const el = mount('<arc-copy-button value="x"></arc-copy-button>');
    await settle(el);
    expect(el.shadowRoot.querySelector('[part="label"]').textContent).to.equal('Copy');
    expect(button(el).getAttribute('aria-label')).to.equal('Copy to clipboard');
  });

  it('drops the text under icon-only and takes its name from `label`', async () => {
    const el = mount('<arc-copy-button value="x" icon-only label="Copy code"></arc-copy-button>');
    await settle(el);
    expect(el.shadowRoot.querySelector('[part="label"]')).to.equal(null);
    expect(button(el).getAttribute('aria-label')).to.equal('Copy code');
    const box = button(el).getBoundingClientRect();
    expect(box.width).to.equal(30);
    expect(box.height).to.equal(30);
  });

  it('says Copied, then goes back after 1.4s when icon-only', async () => {
    const el = mount('<arc-copy-button value="x" icon-only label="Copy code"></arc-copy-button>');
    await settle(el);
    button(el).click();
    expect(await until(() => button(el).getAttribute('aria-label') === 'Copied')).to.equal(true);
    const at = performance.now();
    expect(
      await until(() => button(el).getAttribute('aria-label') === 'Copy code', { timeout: 3000 }),
    ).to.equal(true);
    expect(performance.now() - at).to.be.within(1200, 1900);
  });
});
