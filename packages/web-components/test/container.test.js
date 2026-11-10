/**
 * arc-container: the width cap.
 *
 * What this pins: `narrow` is the same cap as `size="sm"` while `size` is left
 * at its default, and an explicit non-default `size` wins over `narrow`. The
 * bug this guards: `size` defaults to `md` and reflects, so `:host([size="md"])`
 * always matched and, coming after the `narrow` rule, silently overrode it.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, useBaseCss } from './helpers.js';

import '../src/layout/container.register.js';

useBaseCss();
afterEach(() => cleanup());

async function cap(attrs = '') {
  const el = mount(`<arc-container ${attrs}><p>Content</p></arc-container>`);
  await settle(el);
  return getComputedStyle(el.shadowRoot.querySelector('.container')).maxWidth;
}

describe('arc-container width', () => {
  it('caps at --max-width by default', async () => {
    expect(await cap()).to.equal('1120px');
  });

  it('caps at --max-width-sm with size="sm"', async () => {
    expect(await cap('size="sm"')).to.equal('720px');
  });

  it('narrow caps at --max-width-sm, the same as size="sm"', async () => {
    expect(await cap('narrow')).to.equal('720px');
  });

  it('narrow set as a property after first render takes effect', async () => {
    const el = mount('<arc-container><p>Content</p></arc-container>');
    await settle(el);
    el.narrow = true;
    await settle(el);
    expect(getComputedStyle(el.shadowRoot.querySelector('.container')).maxWidth).to.equal('720px');
  });

  it('an explicit non-default size wins over narrow', async () => {
    expect(await cap('narrow size="lg"')).to.equal('1400px');
    expect(await cap('narrow size="xl"')).to.equal('1600px');
    expect(await cap('narrow size="full"')).to.equal('none');
  });

  it('keeps every explicit size without narrow', async () => {
    expect(await cap('size="md"')).to.equal('1120px');
    expect(await cap('size="lg"')).to.equal('1400px');
    expect(await cap('size="xl"')).to.equal('1600px');
    expect(await cap('size="full"')).to.equal('none');
  });
});
