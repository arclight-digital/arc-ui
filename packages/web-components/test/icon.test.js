import { expect } from '@esm-bundle/chai';
import '../src/content/icon.register.js';
import { mount, cleanup } from './helpers.js';

async function mountIcon(attrs = '') {
  const el = mount(`<arc-icon name="book-open" ${attrs}></arc-icon>`);
  await el.updateComplete;
  return el;
}

describe('arc-icon sizing', () => {
  afterEach(cleanup);

  it('defaults to 16px', async () => {
    const el = await mountIcon();
    const r = el.getBoundingClientRect();
    expect(r.width).to.equal(16);
    expect(r.height).to.equal(16);
  });

  it('supports named sizes', async () => {
    const el = await mountIcon('size="lg"');
    const r = el.getBoundingClientRect();
    expect(r.width).to.equal(24);
    expect(r.height).to.equal(24);
  });

  it('supports numeric pixel sizes', async () => {
    const el = await mountIcon('size="16"');
    const r = el.getBoundingClientRect();
    expect(r.width).to.equal(16);
    expect(r.height).to.equal(16);
  });

  it('updates dimensions when switching between numeric and named sizes', async () => {
    const el = await mountIcon('size="40"');
    expect(el.getBoundingClientRect().width).to.equal(40);
    el.size = 'sm';
    await el.updateComplete;
    expect(el.getBoundingClientRect().width).to.equal(16);
  });
});
