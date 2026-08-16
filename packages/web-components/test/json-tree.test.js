/**
 * arc-json-tree: the dev-tools inspector with house coloring. What is pinned
 * here: primitives carry per-type classes (that is the syntax coloring
 * contract), branches expand and collapse by pointer and by the tree keymap,
 * the expanded depth prop is honored, an invalid json attribute degrades to an
 * inline error rather than a throw, and the 100-child page boundary inserts a
 * working "show N more" expander.
 */
import { expect } from '@esm-bundle/chai';
import { ArcJsonTree } from '../src/data/json-tree.js';
import { mount, cleanup, deepActive } from './helpers.js';

// json-tree.register.js is generated from the JSDoc @tag by pnpm generate;
// define the element the same way here so the test runs before generation and
// stays harmless after it.
if (!customElements.get('arc-json-tree')) {
  customElements.define('arc-json-tree', ArcJsonTree);
}

afterEach(() => cleanup());

async function tree(data, attrs = '') {
  const el = mount(`<arc-json-tree ${attrs}></arc-json-tree>`);
  if (data !== undefined) el.data = data;
  await el.updateComplete;
  return el;
}

const rows = (el) => [...el.shadowRoot.querySelectorAll('.json-tree__row')];
const rowByText = (el, text) => rows(el).find((r) => r.textContent.includes(text));
const valueOf = (el, type) =>
  el.shadowRoot.querySelector(`.json-tree__value--${type}`);

function press(row, key) {
  row.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true }));
}

describe('primitive rendering', () => {
  it('gives each primitive its type class', async () => {
    const el = await tree({ name: 'ARC', count: 42, live: true, note: null });

    expect(valueOf(el, 'string').textContent).to.equal('"ARC"');
    expect(valueOf(el, 'number').textContent).to.equal('42');
    expect(valueOf(el, 'boolean').textContent).to.equal('true');
    expect(valueOf(el, 'null').textContent).to.equal('null');
  });

  it('renders keys bare by default, quoted on request', async () => {
    const bare = await tree({ name: 'x' });
    expect(bare.shadowRoot.querySelector('.json-tree__key').textContent).to.equal('name');

    const quoted = await tree({ name: 'x' }, 'keys-quoted');
    expect(quoted.shadowRoot.querySelector('.json-tree__key').textContent).to.equal('"name"');
  });

  it('truncates long strings and keeps the full value in title', async () => {
    const long = 'x'.repeat(300);
    const el = await tree({ blob: long });

    const span = valueOf(el, 'string');
    expect(span.textContent.length).to.be.lessThan(120);
    expect(span.textContent.endsWith('…"')).to.equal(true);
    expect(span.getAttribute('title')).to.equal(long);
  });
});

describe('expand and collapse', () => {
  it('collapses beyond the default depth of one, with a summary preview', async () => {
    const el = await tree({ outer: { inner: 1 }, list: [1, 2, 3] });

    const outer = rowByText(el, 'outer');
    expect(outer.getAttribute('aria-expanded')).to.equal('false');
    expect(outer.textContent).to.include('{…} 1 key');
    expect(rowByText(el, 'list').textContent).to.include('[…] 3 items');
    expect(rowByText(el, 'inner')).to.equal(undefined);
  });

  it('toggles a branch on click', async () => {
    const el = await tree({ outer: { inner: 1 } });

    rowByText(el, 'outer').click();
    await el.updateComplete;
    expect(rowByText(el, 'outer').getAttribute('aria-expanded')).to.equal('true');
    expect(rowByText(el, 'inner')).to.not.equal(undefined);

    rowByText(el, 'outer').click();
    await el.updateComplete;
    expect(rowByText(el, 'outer').getAttribute('aria-expanded')).to.equal('false');
    expect(rowByText(el, 'inner')).to.equal(undefined);
  });

  it('fires arc-toggle with the node path and new state', async () => {
    const el = await tree({ outer: { inner: 1 } });
    const seen = [];
    el.addEventListener('arc-toggle', (e) => seen.push(e.detail));

    rowByText(el, 'outer').click();
    await el.updateComplete;

    expect(seen).to.deep.equal([{ path: ['outer'], expanded: true }]);
  });
});

describe('expanded depth', () => {
  const deep = { a: { b: { c: { d: 1 } } } };

  it('opens the requested number of levels', async () => {
    const el = await tree(deep, 'expanded="2"');
    expect(rowByText(el, 'b')).to.not.equal(undefined);
    expect(rowByText(el, 'c')).to.equal(undefined);
  });

  it('opens everything for the bare boolean attribute', async () => {
    const el = await tree(deep, 'expanded');
    expect(rowByText(el, 'd')).to.not.equal(undefined);
  });

  it('keeps even the root collapsed at zero', async () => {
    const el = await tree({ a: 1, b: 2 }, 'expanded="0"');
    expect(rows(el).length).to.equal(1);
    expect(rows(el)[0].textContent).to.include('{…} 2 keys');
  });
});

describe('json attribute', () => {
  it('parses valid JSON from the attribute', async () => {
    const el = mount(`<arc-json-tree json='{"live": true, "n": 7}'></arc-json-tree>`);
    await el.updateComplete;

    expect(valueOf(el, 'boolean').textContent).to.equal('true');
    expect(valueOf(el, 'number').textContent).to.equal('7');
  });

  it('shows an inline error state on invalid JSON instead of throwing', async () => {
    const el = mount(`<arc-json-tree json='{"broken":'></arc-json-tree>`);
    await el.updateComplete;

    const error = el.shadowRoot.querySelector('.json-tree__error');
    expect(error).to.not.equal(null);
    expect(error.textContent).to.include('Invalid JSON');
    expect(el.shadowRoot.querySelector('[role="tree"]')).to.equal(null);
  });

  it('lets the data property win over the json attribute', async () => {
    const el = mount(`<arc-json-tree json='{"from": "attribute"}'></arc-json-tree>`);
    el.data = { from: 'property' };
    await el.updateComplete;

    expect(valueOf(el, 'string').textContent).to.equal('"property"');
  });
});

describe('large children guard', () => {
  it('renders the first page plus a show-more expander', async () => {
    const el = await tree(Array.from({ length: 150 }, (_, i) => i));

    // root + 100 items + the expander
    expect(rows(el).length).to.equal(102);
    const more = rowByText(el, 'show 50 more');
    expect(more).to.not.equal(undefined);
    expect(more.getAttribute('role')).to.equal('treeitem');
  });

  it('reveals the rest on activation', async () => {
    const el = await tree(Array.from({ length: 150 }, (_, i) => i));

    rowByText(el, 'show 50 more').click();
    await el.updateComplete;

    expect(rows(el).length).to.equal(151);
    expect(rowByText(el, 'show')).to.equal(undefined);
  });
});

describe('keyboard', () => {
  const data = { a: { b: 1 }, c: 2 };

  it('moves focus down and up through visible rows', async () => {
    const el = await tree(data);
    const [root, a] = rows(el);

    root.focus();
    press(root, 'ArrowDown');
    expect(deepActive()).to.equal(a);

    press(a, 'ArrowUp');
    expect(deepActive()).to.equal(rows(el)[0]);
  });

  it('expands with ArrowRight and collapses with ArrowLeft', async () => {
    const el = await tree(data);
    const a = rowByText(el, 'a');
    a.focus();

    press(a, 'ArrowRight');
    await el.updateComplete;
    expect(rowByText(el, 'a').getAttribute('aria-expanded')).to.equal('true');
    expect(rowByText(el, 'b')).to.not.equal(undefined);

    press(rowByText(el, 'a'), 'ArrowLeft');
    await el.updateComplete;
    expect(rowByText(el, 'a').getAttribute('aria-expanded')).to.equal('false');
  });

  it('toggles with Enter and Space', async () => {
    const el = await tree(data);

    press(rowByText(el, 'a'), 'Enter');
    await el.updateComplete;
    expect(rowByText(el, 'a').getAttribute('aria-expanded')).to.equal('true');

    press(rowByText(el, 'a'), ' ');
    await el.updateComplete;
    expect(rowByText(el, 'a').getAttribute('aria-expanded')).to.equal('false');
  });

  it('roves the tabindex with focus', async () => {
    const el = await tree(data);
    const [root, a] = rows(el);
    expect(root.getAttribute('tabindex')).to.equal('0');
    expect(a.getAttribute('tabindex')).to.equal('-1');

    a.focus();
    await el.updateComplete;
    expect(rows(el)[1].getAttribute('tabindex')).to.equal('0');
    expect(rows(el)[0].getAttribute('tabindex')).to.equal('-1');
  });
});

/**
 * Cycles — V4-PLAN 3.2.
 *
 * `JSON.parse` cannot produce one, so this is entirely about the `data`
 * property: an object that contains itself. Both walks — `_collectVisibleKeys`
 * and `_renderNode` — recursed with no memory of where they had been, so with
 * the expansion depth unbounded the first paint was a
 * `RangeError: Maximum call stack size exceeded` and the component rendered
 * nothing at all.
 *
 * The guard is ancestor-scoped on purpose. "Have I seen this object anywhere
 * in this render" would also mark the *second* of two siblings that happen to
 * share one object, which is an ordinary shape (a lookup table referenced
 * twice) and not a cycle. The sibling test below is what holds that line.
 */
describe('cyclic data', () => {
  /** `{ name, self }` where `self` is the object itself. */
  function selfReferential() {
    const node = { name: 'root' };
    node.self = node;
    return node;
  }

  it('renders a self-referential object instead of overflowing the stack', async () => {
    // `expanded` bare means every level, which is what makes the recursion
    // unbounded. At the default depth of one it stopped before it recursed and
    // the bug was invisible.
    const el = await tree(selfReferential(), 'expanded');
    expect(rows(el).length, 'something rendered').to.be.greaterThan(0);
    expect(valueOf(el, 'string').textContent).to.equal('"root"');
  });

  it('marks the cycle rather than repeating it', async () => {
    const el = await tree(selfReferential(), 'expanded');
    const previews = [...el.shadowRoot.querySelectorAll('[part="preview"]')]
      .map((p) => p.textContent.trim());
    expect(previews).to.include('{Circular}');

    // One row for the root, one for `name`, one for `self`. A tree that
    // recursed once more would have four.
    expect(rows(el)).to.have.lengthOf(3);
  });

  it('marks a cycle closed through an array too', async () => {
    const list = [1];
    list.push(list);
    const el = await tree({ list }, 'expanded');
    const previews = [...el.shadowRoot.querySelectorAll('[part="preview"]')]
      .map((p) => p.textContent.trim());
    expect(previews).to.include('[Circular]');
  });

  it('leaves the cycle row out of the tree keymap rather than half in it', async () => {
    // The two walks have to agree: `_collectVisibleKeys` decides which rows
    // can hold the roving tabindex, and a row it does not know about cannot be
    // focused even though it is on screen.
    const el = await tree(selfReferential(), 'expanded');
    const keys = el._collectVisibleKeys(el.data);
    expect(keys.length, 'one key per rendered row').to.equal(rows(el).length);
  });

  it('still renders a shared reference in full when it is not an ancestor', async () => {
    // Anti-vacuity, and the reason the guard is ancestor-scoped: `shared`
    // appears twice as a sibling, which is not a cycle. A "seen anywhere"
    // guard would render the second one as circular and quietly hide data.
    const shared = { unit: 'ms' };
    const el = await tree({ first: shared, second: shared }, 'expanded');

    const previews = [...el.shadowRoot.querySelectorAll('[part="preview"]')]
      .map((p) => p.textContent.trim());
    expect(previews, 'neither copy is a cycle').to.not.include('{Circular}');
    expect(el.shadowRoot.querySelectorAll('.json-tree__value--string')).to.have.lengthOf(2);
  });

  it('presents the cycle row as a leaf, not a branch that refuses to open', async () => {
    const el = await tree(selfReferential(), 'expanded');
    const row = rowByText(el, 'Circular');

    expect(row.getAttribute('aria-expanded'), 'a leaf claims nothing').to.equal(null);
    row.click();
    await el.updateComplete;
    expect(rowByText(el, 'Circular'), 'and clicking it changes nothing').to.not.equal(undefined);
    expect(rows(el)).to.have.lengthOf(3);
  });

  it('keeps a cycle harmless at a finite depth as well', async () => {
    // Without the guard this nested five deep and rendered `self > self > …`,
    // which is not a crash but is not the truth either.
    const el = await tree(selfReferential(), 'expanded="5"');
    expect(rows(el)).to.have.lengthOf(3);
  });
});

describe('aria', () => {
  it('exposes the tree pattern roles and levels', async () => {
    const el = await tree({ outer: { inner: 1 } }, 'expanded="2"');

    expect(el.shadowRoot.querySelector('ul[role="tree"]')).to.not.equal(null);
    expect(el.shadowRoot.querySelector('ul[role="group"]')).to.not.equal(null);

    const root = rows(el)[0];
    const outer = rowByText(el, 'outer');
    const inner = rowByText(el, 'inner');
    expect(root.getAttribute('aria-level')).to.equal('1');
    expect(outer.getAttribute('aria-level')).to.equal('2');
    expect(inner.getAttribute('aria-level')).to.equal('3');
  });

  it('marks only branches with aria-expanded', async () => {
    const el = await tree({ outer: { inner: 1 } }, 'expanded="2"');

    expect(rowByText(el, 'outer').hasAttribute('aria-expanded')).to.equal(true);
    expect(rowByText(el, 'inner').hasAttribute('aria-expanded')).to.equal(false);
  });
});
