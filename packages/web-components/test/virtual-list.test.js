/**
 * arc-virtual-list windows for real: the DOM holds a screenful of rows, not
 * one per item. v2 rendered `<slot name="item-N">` for the visible range while
 * every one of the N items sat in the light DOM regardless — the scroll was
 * virtual, the cost was not.
 *
 * Both supply paths are covered, because they exist for different consumers
 * and only one of them is exercised by the framework wrappers.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/content/virtual-list.register.js';

afterEach(() => cleanup());

const ROWS = 10_000;
const data = Array.from({ length: ROWS }, (_, i) => `row ${i}`);

/** A list with a fixed viewport, mounted and settled. */
async function list(attrs = '') {
  const el = mount(`<arc-virtual-list style="height:200px" item-height="20" ${attrs}></arc-virtual-list>`);
  el.items = data;
  await el.updateComplete;
  await tick();
  await el.updateComplete;
  return el;
}

const rows = (el) => el.shadowRoot.querySelectorAll('[part~="item"]');

describe('windowing', () => {
  it('mounts a screenful of rows, not ten thousand', async () => {
    const el = await list();
    // 200px / 20px = 10 visible, plus 5 overscan each side.
    expect(rows(el).length).to.be.lessThan(30);
    expect(rows(el).length).to.be.greaterThan(0);
  });

  it('sizes the scroll region to the whole array', async () => {
    const el = await list();
    const spacer = el.shadowRoot.querySelector('[part~="spacer"]');
    expect(spacer.style.height).to.equal(`${ROWS * 20}px`);
  });

  it('moves the window on scroll without growing the DOM', async () => {
    const el = await list();

    el.scrollTop = 20 * 500;
    el.dispatchEvent(new Event('scroll'));
    await new Promise(requestAnimationFrame);
    await el.updateComplete;

    expect(el.visibleRange.start).to.be.greaterThan(400);
    // 10 visible + 5 overscan each side. At rest the leading overscan is
    // clipped by the top of the list, so mid-list is the larger window.
    expect(rows(el).length).to.equal(20);
  });

  it('clamps scrollToIndex to the list', async () => {
    const el = await list();
    // The browser clamps scrollTop to scrollHeight - clientHeight; what matters
    // is that an out-of-range index lands on the last rows rather than nowhere.
    el.scrollToIndex(999_999);
    await el.updateComplete;
    expect(el.visibleRange.end).to.equal(ROWS);

    el.scrollToIndex(-5);
    await el.updateComplete;
    expect(el.scrollTop).to.equal(0);
    expect(el.visibleRange.start).to.equal(0);
  });
});

describe('renderItem path', () => {
  it('renders rows from the callback', async () => {
    const el = await list();
    el.renderItem = (item, i) => `${i}:${item}`;
    await el.updateComplete;

    const first = rows(el)[0];
    expect(first.textContent.trim()).to.equal('0:row 0');
  });

  it('passes the real index, not the window offset', async () => {
    const el = await list();
    let seen = [];
    el.renderItem = (item, i) => { seen.push(i); return item; };
    await el.updateComplete;

    seen = []; // discard the at-rest render; only the scrolled window matters
    el.scrollTop = 20 * 300;
    el.dispatchEvent(new Event('scroll'));
    await new Promise(requestAnimationFrame);
    await el.updateComplete;

    expect(Math.min(...seen)).to.equal(el.visibleRange.start);
  });

  it('takes precedence over the slots', async () => {
    const el = await list();
    el.renderItem = () => 'from callback';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot')).to.equal(null);
  });
});

describe('slot path', () => {
  it('renders a slot per visible index only', async () => {
    const el = await list();
    const slots = [...el.shadowRoot.querySelectorAll('slot')].map((s) => s.name);
    expect(slots.length).to.equal(rows(el).length);
    expect(slots[0]).to.equal('item-0');
    expect(slots).to.not.include(`item-${ROWS - 1}`);
  });
});

describe('arc-range-change', () => {
  it('announces the range as it scrolls', async () => {
    const el = await list();
    const seen = [];
    el.addEventListener('arc-range-change', (e) => seen.push(e.detail));

    el.scrollTop = 20 * 100;
    el.dispatchEvent(new Event('scroll'));
    await new Promise(requestAnimationFrame);
    await el.updateComplete;

    expect(seen.length).to.equal(1);
    const { value, start, end } = seen[0];
    expect(start).to.equal(el.visibleRange.start);
    expect(end).to.equal(el.visibleRange.end);
    expect(value).to.deep.equal({ start, end });
  });

  it('stays quiet when the window has not moved', async () => {
    const el = await list();
    const seen = [];
    el.addEventListener('arc-range-change', (e) => seen.push(e.detail));

    // Sub-row scrolling: the pixel offset changes, the index range does not.
    el.scrollTop = 3;
    el.dispatchEvent(new Event('scroll'));
    await new Promise(requestAnimationFrame);
    await el.updateComplete;

    expect(seen).to.deep.equal([]);
  });
});
