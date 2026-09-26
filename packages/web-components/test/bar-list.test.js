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

/** Halteres adoption batch against 4.6.0 (test-findings #138–#140). */
describe('arc-bar-list highlight, reference and more (4.7.0)', () => {
  it('emphasises a highlighted row in colour and weight (#138)', async () => {
    const el = await bars('', [{ label: 'A', value: 3 }, { label: 'B', value: 2, highlight: true }]);
    const [a, b] = rows(el);
    expect(b.querySelector('.bar').getAttribute('part')).to.equal('bar highlight');
    expect(a.querySelector('.bar').getAttribute('part')).to.equal('bar');
    const bw = parseInt(getComputedStyle(b.querySelector('[part~="label"]')).fontWeight, 10);
    const aw = parseInt(getComputedStyle(a.querySelector('[part~="label"]')).fontWeight, 10);
    expect(bw).to.be.greaterThan(aw);
  });

  it('draws a reference line at its value, with a caption (#139)', async () => {
    const el = await bars('reference="30" reference-label="Chance" unit="%"', [{ label: 'A', value: 60 }]);
    const line = el.shadowRoot.querySelector('[part~="reference"]');
    expect(line.style.insetInlineStart).to.equal('50%');
    expect(el.shadowRoot.querySelector('[part~="reference-label"]').textContent.trim()).to.equal('Chance: 30%');
  });

  it('shows reference-display in the caption, in the list\'s own format', async () => {
    const el = await bars('reference="0.0556" reference-label="Random pick" reference-display="6%"', [{ label: 'A', value: 0.4, display: '40%' }]);
    expect(el.shadowRoot.querySelector('[part~="reference-label"]').textContent.trim()).to.equal('Random pick: 6%');
  });

  it('extends the scale to a reference beyond the largest bar', async () => {
    const el = await bars('reference="200"', [{ label: 'A', value: 100 }]);
    expect(widths(el)).to.deep.equal(['50%']);
    expect(el.shadowRoot.querySelector('[part~="reference"]').style.insetInlineStart).to.equal('100%');
  });

  it('counts the rows limit leaves out, and lets the more slot replace it (#140)', async () => {
    const el = await bars('limit="1"');
    const more = el.shadowRoot.querySelector('[part~="more"]');
    expect(more.textContent.trim()).to.equal('2 more');
    cleanup();
    const el2 = mount('<arc-bar-list limit="1"><a slot="more" href="#all">See all</a></arc-bar-list>');
    el2.items = ITEMS;
    await settle(el2);
    const slot = el2.shadowRoot.querySelector('slot[name="more"]');
    expect(slot.assignedElements().length).to.equal(1);
  });

  it('hides the more line when nothing is left out', async () => {
    // Rendered and hidden, not absent, so the slot stays fillable.
    const el = await bars();
    expect(el.shadowRoot.querySelector('[part~="more"]').hidden).to.equal(true);
  });
});
