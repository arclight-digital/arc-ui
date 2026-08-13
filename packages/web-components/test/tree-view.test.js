/**
 * arc-tree-view / arc-tree-item — the hierarchical navigator.
 *
 * What this pins: the tree is built from arc-tree-item children and nests by
 * their own children, rows carry treeitem semantics, the arrow keys expand,
 * collapse and walk the visible rows, and arc-select / arc-toggle report what
 * happened — arc-select with detail.value, per the v3 contract.
 *
 * Three tests are marked BUG. All three come from the same decision: expansion
 * and selection are keyed on `item.label` rather than on the node's path
 * (tree-view.js:141, 148, 171). See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record } from './helpers.js';

import '../src/navigation/tree-view.register.js';

afterEach(() => cleanup());

/** A tree with unique labels throughout. */
const TREE = `
  <arc-tree-item label="src">
    <arc-tree-item label="index.js"></arc-tree-item>
    <arc-tree-item label="app.js"></arc-tree-item>
  </arc-tree-item>
  <arc-tree-item label="README.md"></arc-tree-item>
`;

async function tree(children = TREE) {
  const el = mount(`<arc-tree-view>${children}</arc-tree-view>`);
  await settle(el);
  return el;
}

const rows = (el) => [...el.shadowRoot.querySelectorAll('.tree__row')];
const labels = (el) => rows(el).map((r) => r.textContent.trim());
const rowFor = (el, label) => rows(el).find((r) => r.textContent.trim().startsWith(label));

describe('arc-tree-view rendering', () => {
  it('renders a tree of the top-level items, collapsed', async () => {
    const el = await tree();
    expect(labels(el)).to.deep.equal(['src', 'README.md']);
  });

  it('roots the structure with role=tree and treeitem rows', async () => {
    const el = await tree();
    expect(el.shadowRoot.querySelector('[role="tree"]')).to.not.equal(null);
    expect(rows(el).every((r) => r.getAttribute('role') === 'treeitem')).to.equal(true);
  });

  it('exposes the documented css parts', async () => {
    const el = await tree();
    for (const part of ['item', 'row']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('leaves exactly one tab stop before anything is focused', async () => {
    const el = await tree();
    expect(rows(el).map((r) => r.getAttribute('tabindex'))).to.deep.equal(['0', '-1']);
  });

  it('builds the tree from arc-tree-item children only', async () => {
    const el = await tree('<p>noise</p><arc-tree-item label="real"></arc-tree-item>');
    expect(labels(el)).to.deep.equal(['real']);
  });

  it('survives having no items at all', async () => {
    const el = await tree('');
    expect(rows(el)).to.have.lengthOf(0);
    expect(el.shadowRoot.querySelector('[role="tree"]')).to.not.equal(null);
  });

  it('honours expanded set on a child from markup', async () => {
    const el = await tree(`
      <arc-tree-item label="src" expanded>
        <arc-tree-item label="index.js"></arc-tree-item>
      </arc-tree-item>
    `);
    expect(labels(el)).to.deep.equal(['src', 'index.js']);
  });
});

describe('arc-tree-view expansion', () => {
  it('expands and collapses a branch on click', async () => {
    const el = await tree();

    rowFor(el, 'src').click();
    await settle(el);
    expect(labels(el), 'children appear').to.deep.equal(['src', 'index.js', 'app.js', 'README.md']);

    rowFor(el, 'src').click();
    await settle(el);
    expect(labels(el), 'and go away again').to.deep.equal(['src', 'README.md']);
  });

  it('tracks aria-expanded on the branch', async () => {
    const el = await tree();
    expect(rowFor(el, 'src').getAttribute('aria-expanded')).to.equal('false');

    rowFor(el, 'src').click();
    await settle(el);
    expect(rowFor(el, 'src').getAttribute('aria-expanded')).to.equal('true');
  });

  it('reports the toggle with the new state', async () => {
    const el = await tree();
    const details = [];
    el.addEventListener('arc-toggle', (e) => details.push(e.detail));

    rowFor(el, 'src').click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].expanded).to.equal(true);
    expect(details[0].item.label).to.equal('src');
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await tree();
    let event = null;
    document.body.addEventListener('arc-toggle', (e) => { event = e; }, { once: true });

    rowFor(el, 'src').click();
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  // BUG: `aria-expanded=${hasChildren ? String(expanded) : undefined}`
  // (tree-view.js:248). In Lit only `nothing` removes an attribute — `undefined`
  // is stringified, so every leaf ships `aria-expanded=""`. That is not a valid
  // value for an enumerated ARIA state, and it advertises leaves as expandable
  // nodes. arc-chip:83 gets this right with `nothing`, so the idiom is already
  // in the codebase.
  it('BUG: a leaf renders aria-expanded="" instead of omitting the attribute', async () => {
    const el = await tree();
    const leaf = rowFor(el, 'README.md');

    expect(leaf.hasAttribute('aria-expanded'), 'a leaf should carry no aria-expanded').to.equal(true);
    expect(leaf.getAttribute('aria-expanded'), 'and certainly not an empty one').to.equal('');
  });

  it('does not toggle a leaf', async () => {
    const el = await tree();
    const seen = record(el, ['arc-toggle']);

    rowFor(el, 'README.md').click();
    await settle(el);

    expect(seen, 'a leaf has nothing to expand').to.deep.equal([]);
  });
});

describe('arc-tree-view selection', () => {
  it('reports the selected node on detail.value with its path', async () => {
    const el = await tree();
    const details = [];
    el.addEventListener('arc-select', (e) => details.push(e.detail));

    rowFor(el, 'README.md').click();
    await settle(el);

    expect(details).to.have.lengthOf(1);
    expect(details[0].value, 'detail.value is canonical').to.equal('README.md');
    expect(details[0].item.label).to.equal('README.md');
    expect(details[0].path).to.be.an('array');
  });

  it('marks the selected row', async () => {
    const el = await tree();
    rowFor(el, 'README.md').click();
    await settle(el);

    expect(rowFor(el, 'README.md').getAttribute('aria-selected')).to.equal('true');
    expect(rowFor(el, 'src').getAttribute('aria-selected')).to.equal('false');
  });

  it('selects a branch as well as toggling it', async () => {
    const el = await tree();
    const seen = record(el, ['arc-select', 'arc-toggle']);

    rowFor(el, 'src').click();
    await settle(el);

    expect(seen.map(([k]) => k)).to.deep.equal(['select', 'toggle']);
  });
});

describe('arc-tree-view keyboard', () => {
  it('ArrowRight expands and ArrowLeft collapses', async () => {
    const el = await tree();

    keyOn(rowFor(el, 'src'), 'ArrowRight');
    await settle(el);
    expect(labels(el)).to.contain('index.js');

    keyOn(rowFor(el, 'src'), 'ArrowLeft');
    await settle(el);
    expect(labels(el)).to.not.contain('index.js');
  });

  it('walks the visible rows with the block arrows', async () => {
    const el = await tree();
    rows(el)[0].focus();

    keyOn(rows(el)[0], 'ArrowDown');
    await settle(el);
    expect(el.shadowRoot.activeElement).to.equal(rows(el)[1]);

    keyOn(rows(el)[1], 'ArrowUp');
    await settle(el);
    expect(el.shadowRoot.activeElement).to.equal(rows(el)[0]);
  });

  it('stops at both ends rather than wrapping', async () => {
    const el = await tree();
    rows(el)[0].focus();

    keyOn(rows(el)[0], 'ArrowUp');
    await settle(el);
    expect(el.shadowRoot.activeElement, 'held at the first row').to.equal(rows(el)[0]);

    const last = rows(el).at(-1);
    last.focus();
    keyOn(last, 'ArrowDown');
    await settle(el);
    expect(el.shadowRoot.activeElement, 'held at the last row').to.equal(last);
  });

  it('Enter and Space select without toggling', async () => {
    for (const key of ['Enter', ' ']) {
      const el = await tree();
      const seen = record(el, ['arc-select', 'arc-toggle']);

      keyOn(rowFor(el, 'src'), key);
      await settle(el);

      expect(seen.map(([k]) => k), `${key} selects only`).to.deep.equal(['select']);
      cleanup();
    }
  });

  it('claims the keys that would otherwise scroll the page', async () => {
    const el = await tree();
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      rows(el)[0].dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });

  it('ignores keys it does not handle', async () => {
    const el = await tree();
    const seen = record(el, ['arc-select', 'arc-toggle']);

    keyOn(rows(el)[0], 'x');
    await settle(el);

    expect(seen).to.deep.equal([]);
  });
});

describe('arc-tree-view duplicate labels', () => {
  /** The same leaf name under two different branches — an ordinary file tree. */
  const DUPES = `
    <arc-tree-item label="src" expanded>
      <arc-tree-item label="index.js"></arc-tree-item>
    </arc-tree-item>
    <arc-tree-item label="test" expanded>
      <arc-tree-item label="index.js"></arc-tree-item>
    </arc-tree-item>
  `;

  // BUG: _selected is the label alone (tree-view.js:171), and the render
  // compares against it, so every node sharing a label is marked selected.
  // Clicking src/index.js highlights test/index.js too.
  it('BUG: selecting one node also marks its same-named sibling elsewhere', async () => {
    const el = await tree(DUPES);
    const dupes = rows(el).filter((r) => r.textContent.trim().startsWith('index.js'));
    expect(dupes, 'two nodes share the name').to.have.lengthOf(2);

    dupes[0].click();
    await settle(el);

    const selected = rows(el)
      .filter((r) => r.getAttribute('aria-selected') === 'true')
      .map((r) => r.textContent.trim());
    expect(selected, 'only one node was clicked').to.have.lengthOf(2);
  });

  // BUG: the expansion set is keyed on the label too (tree-view.js:141, 148),
  // so two branches with the same name expand and collapse together.
  it('BUG: expanding one branch expands every branch with the same label', async () => {
    const el = await tree(`
      <arc-tree-item label="project">
        <arc-tree-item label="assets">
          <arc-tree-item label="logo.svg"></arc-tree-item>
        </arc-tree-item>
      </arc-tree-item>
      <arc-tree-item label="archive">
        <arc-tree-item label="assets">
          <arc-tree-item label="old.svg"></arc-tree-item>
        </arc-tree-item>
      </arc-tree-item>
    `);

    rowFor(el, 'project').click();
    await settle(el);
    rowFor(el, 'archive').click();
    await settle(el);

    const assets = rows(el).filter((r) => r.textContent.trim().startsWith('assets'));
    expect(assets).to.have.lengthOf(2);

    assets[0].click();
    await settle(el);

    expect(labels(el), 'both branches opened from one click')
      .to.include.members(['logo.svg', 'old.svg']);
  });

  // BUG: arc-toggle reports only { label, icon }, so a consumer cannot tell
  // which of two same-named branches moved — unlike arc-select, which carries
  // `path` alongside.
  it('BUG: arc-toggle carries no path, so duplicate labels are indistinguishable', async () => {
    const el = await tree(DUPES);
    const details = [];
    el.addEventListener('arc-toggle', (e) => details.push(e.detail));

    rowFor(el, 'src').click();
    await settle(el);

    expect(details[0].path, 'arc-select carries a path here; arc-toggle does not')
      .to.equal(undefined);
  });
});
