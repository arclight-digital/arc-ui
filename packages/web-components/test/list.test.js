/**
 * arc-list / arc-list-item — the selectable list.
 *
 * What this pins: `selectable` switches the container between `list` and
 * `listbox`, single select toggles off on a second activation, `multiple`
 * accumulates into the comma-joined `value` string, arc-change reports that
 * string on detail.value, and the arrow keys walk the enabled items and wrap.
 *
 * Three tests are marked BUG. Two are ARIA structure — the roles the list and
 * its items claim do not agree with each other — and one is the comma-joined
 * value string meeting a value that contains a comma. See test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, useBaseCss } from './helpers.js';

import '../src/data/list.register.js';

afterEach(() => cleanup());

// The variant styling is drawn with colour tokens (--border-default,
// --divider), which live at :root in base.css and are deliberately kept off the
// :host layer so a component is not pinned to one theme — see
// token-drift.test.js. Without base.css every variant computes to the same
// empty border and the enum assertions below would pass for the wrong reason.
useBaseCss();

const ITEMS = `
  <arc-list-item value="a">Alpha</arc-list-item>
  <arc-list-item value="b">Bravo</arc-list-item>
  <arc-list-item value="c">Charlie</arc-list-item>
`;

async function list(attrs = '', items = ITEMS) {
  const el = mount(`<arc-list ${attrs}>${items}</arc-list>`);
  await settle(el);
  return el;
}

const container = (el) => el.shadowRoot.querySelector('[part~="list"]');
const items = (el) => [...el.querySelectorAll('arc-list-item')];
const rowOf = (item) => item.shadowRoot.querySelector('[part~="item"]');
const selected = (el) => items(el).filter((i) => i.selected).map((i) => i.value);

/** Activate an item the way arc-list listens for it. */
function activate(item) {
  item.dispatchEvent(
    new CustomEvent('arc-select', { bubbles: true, composed: true, detail: { value: item.value } }),
  );
}

describe('arc-list rendering', () => {
  it('exposes the documented css part', async () => {
    const el = await list();
    expect(container(el)).to.not.equal(null);
  });

  it('projects its items', async () => {
    const el = await list();
    expect(items(el)).to.have.lengthOf(3);
    expect(items(el)[0].textContent.trim()).to.equal('Alpha');
  });

  it('survives having no items', async () => {
    const el = await list('', '');
    expect(container(el)).to.not.equal(null);
    expect(items(el)).to.have.lengthOf(0);
  });

  it('carries an accessible name only when one is given', async () => {
    const named = await list('selectable label="Instruments"');
    expect(container(named).getAttribute('aria-label')).to.equal('Instruments');

    const bare = await list('selectable');
    expect(bare.shadowRoot.querySelector('[part~="list"]').hasAttribute('aria-label'))
      .to.equal(false);
  });
});

describe('arc-list enums', () => {
  it('bordered draws an outline the default does not, and an unknown value falls back', async () => {
    const border = (el) => getComputedStyle(container(el)).borderTopWidth;

    const def = await list();
    const bordered = await list('variant="bordered"');
    expect(border(bordered), 'bordered must actually draw a border').to.equal('1px');
    expect(border(def), 'the default must not').to.equal('0px');

    const unknown = await list('variant="neon"');
    expect(border(unknown)).to.equal(border(def));
  });

  it('separated rules between items but not after the last', async () => {
    const el = await list('variant="separated"');
    const rule = (i) => getComputedStyle(items(el)[i]).borderBottomWidth;

    expect(rule(0)).to.equal('1px');
    expect(rule(1)).to.equal('1px');
    expect(rule(2), 'no trailing rule').to.equal('0px');
  });

  it('each size renders distinctly, and an unknown one lands on the default', async () => {
    const size = (el) => getComputedStyle(container(el)).fontSize;

    const def = await list();
    const lg = await list('size="lg"');
    expect(size(lg), 'lg must differ from md').to.not.equal(size(def));

    const unknown = await list('size="enormous"');
    expect(size(unknown)).to.equal(size(def));
  });
});

describe('arc-list selection', () => {
  it('is inert unless selectable', async () => {
    const el = await list();
    const seen = record(el, ['arc-change']);

    activate(items(el)[0]);
    await settle(el);

    expect(el.value).to.equal('');
    expect(seen).to.deep.equal([]);
  });

  it('selects one at a time and reports the value', async () => {
    const el = await list('selectable label="L"');
    const details = [];
    el.addEventListener('arc-change', (e) => details.push(e.detail));

    activate(items(el)[1]);
    await settle(el);

    expect(el.value).to.equal('b');
    expect(selected(el)).to.deep.equal(['b']);
    expect(details).to.deep.equal([{ value: 'b' }]);
  });

  it('replaces the selection rather than adding to it', async () => {
    const el = await list('selectable label="L"');
    activate(items(el)[0]);
    await settle(el);
    activate(items(el)[2]);
    await settle(el);

    expect(el.value).to.equal('c');
    expect(selected(el)).to.deep.equal(['c']);
  });

  it('deselects when the selected item is activated again', async () => {
    const el = await list('selectable label="L"');
    activate(items(el)[0]);
    await settle(el);
    activate(items(el)[0]);
    await settle(el);

    expect(el.value, 'a second activation clears it').to.equal('');
    expect(selected(el)).to.deep.equal([]);
  });

  it('accumulates and removes when multiple', async () => {
    const el = await list('selectable multiple label="L"');

    activate(items(el)[0]);
    await settle(el);
    activate(items(el)[2]);
    await settle(el);
    expect(el.value).to.equal('a,c');
    expect(selected(el)).to.deep.equal(['a', 'c']);

    activate(items(el)[0]);
    await settle(el);
    expect(el.value, 'toggling one off leaves the rest').to.equal('c');
  });

  it('reflects a value set in markup onto the items', async () => {
    const el = await list('selectable multiple label="L" value="a,c"');
    expect(selected(el)).to.deep.equal(['a', 'c']);
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await list('selectable label="L"');
    let event = null;
    document.body.addEventListener('arc-change', (e) => { event = e; }, { once: true });

    activate(items(el)[0]);
    await settle(el);

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  // Was a BUG pin (finding #26). `value` was the selection, so it was split
  // apart on every read — and a value containing a comma never matched its own
  // fragments: it was recorded in `value` and never marked selected on screen.
  // The selection is a list of values now, and `value` is its serialised view.
  const COMMA_ITEMS = `
    <arc-list-item value="Smith, John">Smith, John</arc-list-item>
    <arc-list-item value="b">Bravo</arc-list-item>
  `;

  it('tracks an item whose value contains a comma', async () => {
    const el = await list('selectable multiple label="L"', COMMA_ITEMS);

    activate(items(el)[0]);
    await settle(el);

    expect(el.value, 'the value is recorded').to.equal('Smith, John');
    expect(selected(el), 'and the item is marked selected').to.deep.equal(['Smith, John']);
  });

  it('deselects it again on a second activation', async () => {
    // The toggle path reads the selection back, which is where the round trip
    // used to fail — the value was found in `value` and not among its splits.
    const el = await list('selectable multiple label="L"', COMMA_ITEMS);

    activate(items(el)[0]);
    await settle(el);
    activate(items(el)[0]);
    await settle(el);

    expect(el.value).to.equal('');
    expect(selected(el)).to.deep.equal([]);
  });

  it('keeps a comma value alongside an ordinary one', async () => {
    const el = await list('selectable multiple label="L"', COMMA_ITEMS);

    activate(items(el)[0]);
    await settle(el);
    activate(items(el)[1]);
    await settle(el);

    expect(selected(el)).to.deep.equal(['Smith, John', 'b']);
  });

  it('round-trips a comma value through the property in single-select', async () => {
    // Single-select does not split at all, so any value survives assignment
    // from outside. Multi-select cannot represent one — the comma is the
    // format's separator — and that limit is documented on the prop.
    const el = await list('selectable label="L"', COMMA_ITEMS);

    el.value = 'Smith, John';
    await settle(el);

    expect(selected(el)).to.deep.equal(['Smith, John']);
  });
});

describe('arc-list keyboard', () => {
  it('walks the items with the block arrows and wraps', async () => {
    const el = await list('selectable label="L"');
    rowOf(items(el)[0]).focus();

    keyOn(container(el), 'ArrowDown');
    await settle(el);
    expect(el.shadowRoot.activeElement ?? document.activeElement).to.not.equal(null);
    expect(items(el)[1].shadowRoot.activeElement).to.equal(rowOf(items(el)[1]));

    keyOn(container(el), 'ArrowUp');
    await settle(el);
    expect(items(el)[0].shadowRoot.activeElement).to.equal(rowOf(items(el)[0]));
  });

  it('Home and End jump to the ends', async () => {
    const el = await list('selectable label="L"');
    rowOf(items(el)[0]).focus();

    keyOn(container(el), 'End');
    await settle(el);
    expect(items(el)[2].shadowRoot.activeElement).to.equal(rowOf(items(el)[2]));

    keyOn(container(el), 'Home');
    await settle(el);
    expect(items(el)[0].shadowRoot.activeElement).to.equal(rowOf(items(el)[0]));
  });

  it('skips disabled items', async () => {
    const el = await list('selectable label="L"', `
      <arc-list-item value="a">Alpha</arc-list-item>
      <arc-list-item value="b" disabled>Bravo</arc-list-item>
      <arc-list-item value="c">Charlie</arc-list-item>
    `);
    rowOf(items(el)[0]).focus();

    keyOn(container(el), 'ArrowDown');
    await settle(el);

    expect(items(el)[2].shadowRoot.activeElement, 'lands past the disabled item')
      .to.equal(rowOf(items(el)[2]));
  });

  it('Enter selects the focused item when selectable', async () => {
    const el = await list('selectable label="L"');
    rowOf(items(el)[1]).focus();

    keyOn(container(el), 'Enter');
    await settle(el);

    expect(el.value).to.equal('b');
  });

  it('claims the navigation keys and leaves the rest', async () => {
    const el = await list('selectable label="L"');
    rowOf(items(el)[0]).focus();

    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      container(el).dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }

    const ignored = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    container(el).dispatchEvent(ignored);
    await settle(el);
    expect(ignored.defaultPrevented).to.equal(false);
  });
});

describe('arc-list ARIA structure', () => {
  it('is a listbox when selectable and a list otherwise', async () => {
    expect(container(await list()).getAttribute('role')).to.equal('list');
    expect(container(await list('selectable label="L"')).getAttribute('role')).to.equal('listbox');
  });

  it('announces multi-select on a selectable list', async () => {
    const el = await list('selectable multiple label="L"');
    expect(container(el).getAttribute('aria-multiselectable')).to.equal('true');
  });

  // Was a BUG pin (finding #27). aria-multiselectable is defined for listbox,
  // grid, tree and tablist and for nothing else, so a plain role="list" must
  // not carry it — axe reports it as aria-allowed-attr.
  it('omits aria-multiselectable on a plain list', async () => {
    const el = await list();
    expect(container(el).getAttribute('role')).to.equal('list');
    expect(container(el).hasAttribute('aria-multiselectable')).to.equal(false);
  });

  it('still declares single-select on a selectable list', async () => {
    // Anti-vacuity, and the case that is easy to lose: false is a legal and
    // meaningful value on a listbox, so it must survive.
    const el = await list('selectable label="L"');
    expect(container(el).getAttribute('aria-multiselectable')).to.equal('false');
  });

  // Was a BUG pin (finding #28). arc-list-item rendered role="option" and
  // aria-selected unconditionally, so a non-selectable arc-list was a
  // role="list" containing options — a list with no listitem in it, and
  // options outside any listbox. Both halves are invalid, and screen readers
  // announce item counts and positions from these roles.
  it('renders listitems inside a plain list', async () => {
    const el = await list();
    expect(container(el).getAttribute('role')).to.equal('list');

    const roles = items(el).map((i) => rowOf(i).getAttribute('role'));
    expect(roles).to.deep.equal(['listitem', 'listitem', 'listitem']);
    expect(rowOf(items(el)[0]).hasAttribute('aria-selected'), 'and carry no selection state')
      .to.equal(false);
  });

  it('renders options inside a selectable list', async () => {
    const el = await list('selectable label="L"');
    const roles = items(el).map((i) => rowOf(i).getAttribute('role'));
    expect(roles).to.deep.equal(['option', 'option', 'option']);
    expect(rowOf(items(el)[0]).getAttribute('aria-selected')).to.equal('false');
  });

  it('follows selectable being flipped after mount', async () => {
    // The role comes from the parent list, which can change its mind — and the
    // items are light-DOM siblings, not reactive inputs of the list.
    const el = await list();
    expect(rowOf(items(el)[0]).getAttribute('role')).to.equal('listitem');

    el.selectable = true;
    el.label = 'L';
    await settle(el);

    expect(rowOf(items(el)[0]).getAttribute('role')).to.equal('option');
  });
});
