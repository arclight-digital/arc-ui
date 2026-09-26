/**
 * arc-bar-list (test-findings #124): ranked, labelled bars.
 * Booleans rather than DOM nodes in equalities (see the harness note, #119–#124).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle } from './helpers.js';
import '../src/data/bar-list.register.js';

afterEach(cleanup);

const ITEMS = [
  { label: 'Direct', value: 30 },
  { label: 'Search', value: 60 },
  { label: 'Social', value: 15 },
  { label: 'Broken', value: 'n/a' },
];

async function bars(attrs = '', items = ITEMS) {
  const el = mount(`<arc-bar-list label="Sources" ${attrs}></arc-bar-list>`);
  el.items = items;
  await settle(el);
  return el;
}
const rows = (el) => [...el.shadowRoot.querySelectorAll('[part~="item"]')];
const labels = (el) => rows(el).map((r) => r.querySelector('[part~="label"]').textContent.trim());
const widths = (el) => rows(el).map((r) => r.querySelector('[part~="bar"]').style.width);

describe('arc-bar-list', () => {
  it('ranks rows largest first and drops non-numeric values', async () => {
    const el = await bars();
    expect(labels(el)).to.deep.equal(['Search', 'Direct', 'Social']);
  });

  it('scales bars to the largest value by default', async () => {
    const el = await bars();
    expect(widths(el)).to.deep.equal(['100%', '50%', '25%']);
  });

  it('scales to an explicit max', async () => {
    const el = await bars('max="120"');
    expect(widths(el)).to.deep.equal(['50%', '25%', '12.5%']);
  });

  it('keeps the given order when unsorted, and cuts to limit', async () => {
    const el = await bars('unsorted limit="2"');
    expect(labels(el)).to.deep.equal(['Direct', 'Search']);
  });

  it('shows display text and the unit, and is an ordered list with a name', async () => {
    const el = await bars('unit="%"', [{ label: 'A', value: 1200, display: '1.2k' }, { label: 'B', value: 5 }]);
    const values = rows(el).map((r) => r.querySelector('[part~="value"]').textContent.trim());
    expect(values).to.deep.equal(['1.2k%', '5%']);
    const list = el.shadowRoot.querySelector('[part~="base"]');
    expect(list.localName).to.equal('ol');
    expect(list.getAttribute('aria-label')).to.equal('Sources');
    expect(rows(el)[0].querySelector('[part~="track"]').getAttribute('aria-hidden')).to.equal('true');
  });

  it('links a row with href', async () => {
    const el = await bars('', [{ label: 'A', value: 1, href: '/a' }]);
    const label = rows(el)[0].querySelector('[part~="label"]');
    expect(label.localName).to.equal('a');
    expect(label.getAttribute('href')).to.equal('/a');
  });

  it('accepts items as a JSON attribute', async () => {
    const el = mount(`<arc-bar-list items='[{"label":"X","value":2},{"label":"Y","value":4}]'></arc-bar-list>`);
    await settle(el);
    expect(labels(el)).to.deep.equal(['Y', 'X']);
  });
});
