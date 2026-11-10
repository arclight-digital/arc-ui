/**
 * arc-loading-overlay: what the keyboard can reach behind a global overlay.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, deepActive } from './helpers.js';

import '../src/feedback/loading-overlay.register.js';

afterEach(() => cleanup());

describe('arc-loading-overlay global focus', () => {
  it('keeps the page behind out of reach while active', async () => {
    const wrapper = mount(`
      <div>
        <button id="behind">Behind</button>
        <arc-loading-overlay global></arc-loading-overlay>
      </div>
    `);
    const button = wrapper.querySelector('#behind');
    const overlay = wrapper.querySelector('arc-loading-overlay');
    await overlay.updateComplete;

    button.focus();
    expect(deepActive(), 'reachable before').to.equal(button);

    overlay.active = true;
    await overlay.updateComplete;
    expect(deepActive(), 'focus left the page').to.not.equal(button);
    button.focus();
    expect(deepActive(), 'cannot be focused while active').to.not.equal(button);

    overlay.active = false;
    await overlay.updateComplete;
    button.focus();
    expect(deepActive(), 'reachable after').to.equal(button);
  });

  it('stays up when Escape is pressed', async () => {
    const overlay = mount(`<arc-loading-overlay global active></arc-loading-overlay>`);
    await overlay.updateComplete;
    const dialog = overlay.shadowRoot.querySelector('dialog');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await overlay.updateComplete;
    expect(dialog.open).to.equal(true);
  });

  it('leaves the page reachable in contained mode', async () => {
    const wrapper = mount(`
      <div style="position: relative">
        <button id="behind">Behind</button>
        <arc-loading-overlay active></arc-loading-overlay>
      </div>
    `);
    const overlay = wrapper.querySelector('arc-loading-overlay');
    await overlay.updateComplete;
    const button = wrapper.querySelector('#behind');
    button.focus();
    expect(deepActive()).to.equal(button);
  });
});
