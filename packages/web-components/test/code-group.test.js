/**
 * arc-code-group: tabs over arc-code-block children, one copy button, and
 * groups that switch together through `sync-key`.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';

import '../src/typography/code-block.register.js';
import '../src/typography/code-group.register.js';

beforeEach(() => {
  try {
    localStorage.removeItem('arc-code-group:edition');
  } catch {
    /* no storage */
  }
});
afterEach(() => cleanup());

const MARKUP = (attrs = '') => `
  <arc-code-group ${attrs}>
    <arc-code-block label="Pulsar" language="bash"></arc-code-block>
    <arc-code-block label="Pulsar for NVIDIA" language="bash"></arc-code-block>
    <arc-code-block filename="other.sh"></arc-code-block>
  </arc-code-group>`;

async function group(attrs = '') {
  const box = mount(`<div>${MARKUP(attrs)}</div>`);
  const el = box.querySelector('arc-code-group');
  const blocks = [...el.querySelectorAll('arc-code-block')];
  blocks.forEach((b, i) => {
    b.code = `code ${i}`;
  });
  await settle(el);
  await until(() => el.shadowRoot.querySelectorAll('[role="tab"]').length === 3);
  return { el, blocks, box };
}

const tabs = (el) => [...el.shadowRoot.querySelectorAll('[role="tab"]')];
const visible = (blocks) => blocks.map((b) => !b.hidden);

describe('arc-code-group', () => {
  it('makes a tab of each block, named by label, then filename', async () => {
    const { el } = await group();
    expect(tabs(el).map((t) => t.textContent.trim())).to.deep.equal(['Pulsar', 'Pulsar for NVIDIA', 'other.sh']);
    expect(tabs(el).map((t) => t.getAttribute('aria-selected'))).to.deep.equal(['true', 'false', 'false']);
  });

  it('shows one block at a time, with its own chrome hidden', async () => {
    const { blocks } = await group();
    expect(visible(blocks)).to.deep.equal([true, false, false]);
    await blocks[0].updateComplete;
    expect(blocks[0].hasAttribute('data-grouped')).to.equal(true);
    expect(getComputedStyle(blocks[0].shadowRoot.querySelector('[part="header"]')).display).to.equal('none');
  });

  it('switches on click and fires arc-change', async () => {
    const { el, blocks } = await group();
    const seen = [];
    el.addEventListener('arc-change', (e) => seen.push(e.detail));
    tabs(el)[1].click();
    await settle(el);
    expect(visible(blocks)).to.deep.equal([false, true, false]);
    expect(seen).to.deep.equal([{ value: 'Pulsar for NVIDIA', index: 1 }]);
  });

  it('moves with the arrow keys, Home and End, wrapping at the ends', async () => {
    const { el, blocks } = await group();
    const list = el.shadowRoot.querySelector('[role="tablist"]');
    const key = async (k) => {
      list.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      await settle(el);
    };
    await key('ArrowLeft');
    expect(visible(blocks)).to.deep.equal([false, false, true]);
    await key('Home');
    expect(visible(blocks)).to.deep.equal([true, false, false]);
    await key('End');
    await key('ArrowRight');
    expect(visible(blocks)).to.deep.equal([true, false, false]);
    expect(await until(() => el.shadowRoot.activeElement === tabs(el)[0])).to.equal(true);
    expect(tabs(el).map((t) => t.tabIndex)).to.deep.equal([0, -1, -1]);
  });

  it('copies the visible block', async () => {
    const { el } = await group();
    tabs(el)[1].click();
    await settle(el);
    const copy = el.shadowRoot.querySelector('arc-copy-button');
    copy.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(copy.value).to.equal('code 1');
  });

  it('keeps groups with the same sync-key together and remembers the choice', async () => {
    const box = mount(`<div>${MARKUP('sync-key="edition"')}${MARKUP('sync-key="edition"')}${MARKUP()}</div>`);
    const [a, b, c] = box.querySelectorAll('arc-code-group');
    await Promise.all([a, b, c].map((g) => settle(g)));
    await until(() => [a, b, c].every((g) => g.shadowRoot.querySelectorAll('[role="tab"]').length === 3));
    const seenOnB = [];
    b.addEventListener('arc-change', () => seenOnB.push(1));

    tabs(a)[1].click();
    await Promise.all([a, b, c].map((g) => settle(g)));
    expect(b.selected).to.equal(1);
    expect(c.selected).to.equal(0);
    expect(seenOnB).to.deep.equal([]);
    expect(localStorage.getItem('arc-code-group:edition')).to.equal('Pulsar for NVIDIA');

    // A group arriving later adopts the remembered choice.
    const { el: later } = await group('sync-key="edition"');
    expect(later.selected).to.equal(1);
  });

  it('labels the tab list and ties the panel to the selected tab', async () => {
    const { el } = await group('label="Edition"');
    expect(el.shadowRoot.querySelector('[role="tablist"]').getAttribute('aria-label')).to.equal('Edition');
    expect(el.shadowRoot.querySelector('[role="tabpanel"]').getAttribute('aria-labelledby')).to.equal('tab-0');
  });
});
