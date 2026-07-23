import { expect } from '@esm-bundle/chai';
import '../src/feedback/command-palette.register.js';
import { deepActive, mount, cleanup, tick, pressKey } from './helpers.js';

const ITEMS = Array.from({ length: 20 }, (_, i) => `<arc-command-item>Item ${i}</arc-command-item>`).join('');

async function mountPalette() {
  const el = mount(`<arc-command-palette>${ITEMS}</arc-command-palette>`);
  await el.updateComplete;
  await tick(); // let slotchange populate _items
  return el;
}

function input(el) {
  return el.shadowRoot.querySelector('.palette__input');
}

async function setQuery(el, value) {
  const inp = input(el);
  inp.value = value;
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  await el.updateComplete;
}

describe('arc-command-palette', () => {
  afterEach(cleanup);

  it('focuses the search input when opened', async () => {
    const el = await mountPalette();
    el.open = true;
    await el.updateComplete;
    await tick();
    expect(deepActive()).to.equal(input(el));
  });

  it('is immediately visible when opened (no visibility transition on open)', async () => {
    const el = await mountPalette();
    el.open = true;
    await el.updateComplete;
    const dialog = el.shadowRoot.querySelector('.palette__dialog');
    expect(getComputedStyle(dialog).visibility).to.equal('visible');
  });

  it('shows an empty state naming the query when nothing matches', async () => {
    const el = await mountPalette();
    el.open = true;
    await el.updateComplete;
    await setQuery(el, 'zzz-no-match');
    const empty = el.shadowRoot.querySelector('.palette__empty');
    expect(empty, 'empty state element').to.exist;
    expect(empty.textContent).to.include('zzz-no-match');
    expect(el.shadowRoot.querySelectorAll('.palette__item').length).to.equal(0);
  });

  it('closes on Escape even when the query has zero matches', async () => {
    const el = await mountPalette();
    el.open = true;
    await el.updateComplete;
    await setQuery(el, 'zzz-no-match');
    pressKey('Escape');
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('keeps the focused item scrolled into view during arrow-key navigation', async () => {
    const el = await mountPalette();
    el.open = true;
    await el.updateComplete;
    await tick();
    for (let i = 0; i < 15; i++) pressKey('ArrowDown');
    await el.updateComplete;
    const results = el.shadowRoot.querySelector('.palette__results');
    const focused = el.shadowRoot.querySelector('.palette__item.is-focused');
    expect(focused.textContent).to.include('Item 15');
    const rr = results.getBoundingClientRect();
    const fr = focused.getBoundingClientRect();
    expect(fr.top).to.be.at.least(rr.top - 1);
    expect(fr.bottom).to.be.at.most(rr.bottom + 1);
  });

  it('restores focus to the previously focused element on close', async () => {
    const el = await mountPalette();
    const button = mount('<button>trigger</button>');
    button.focus();
    el.open = true;
    await el.updateComplete;
    await tick();
    el.open = false;
    await el.updateComplete;
    await tick();
    expect(deepActive()).to.equal(button);
  });
});
