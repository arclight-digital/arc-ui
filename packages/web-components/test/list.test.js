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

const container = (el) => el.shadowRoot.querySelector('[part="list"]');
const items = (el) => [...el.querySelectorAll('arc-list-item')];
const rowOf = (item) => item.shadowRoot.querySelector('[part="item"]');
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
    expect(bare.shadowRoot.querySelector('[part="list"]').hasAttribute('aria-label'))
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

  // BUG: `value` is a single comma-joined string (list.js:101), split back
  // apart on every read (list.js:117). A value that itself contains a comma —
  // "Smith, John", a locale-formatted number, a tag list — cannot survive the
  // round trip: _syncSelection looks for the whole string among the split
  // fragments and never finds it, so the item is selected in `value` but never
  // marked selected on screen.
  it('BUG: an item whose value contains a comma cannot be tracked', async () => {
    const el = await list('selectable multiple label="L"', `
      <arc-list-item value="Smith, John">Smith, John</arc-list-item>
      <arc-list-item value="b">Bravo</arc-list-item>
    `);

    activate(items(el)[0]);
    await settle(el);

    expect(el.value, 'the value is recorded').to.equal('Smith, John');
    expect(selected(el), 'but the item is not marked selected').to.deep.equal([]);
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

  // BUG: aria-multiselectable is bound unconditionally (list.js:194), so a
  // plain list renders role="list" aria-multiselectable="false".
  // aria-multiselectable is only defined for listbox, grid, tree and tablist —
  // on role="list" it is not an allowed attribute, which is what axe's
  // aria-allowed-attr rule reports.
  it('BUG: a non-selectable list carries aria-multiselectable anyway', async () => {
    const el = await list();
    expect(container(el).getAttribute('role')).to.equal('list');
    expect(container(el).getAttribute('aria-multiselectable')).to.equal('false');
  });

  // BUG: arc-list-item renders role="option" and aria-selected unconditionally
  // (list-item.js:190, 202), regardless of whether its parent is a listbox. A
  // non-selectable arc-list is therefore a role="list" containing role="option"
  // children — a list with no listitem in it, and options outside any listbox.
  // arc-chip solves exactly this by checking its ancestor before choosing a
  // role (chip.js:54).
  it('BUG: items claim role=option even inside a plain list', async () => {
    const el = await list();
    expect(container(el).getAttribute('role')).to.equal('list');

    const roles = items(el).map((i) => rowOf(i).getAttribute('role'));
    expect(roles, 'a list should contain listitems').to.deep.equal(['option', 'option', 'option']);
    expect(rowOf(items(el)[0]).getAttribute('aria-selected'), 'and options carry selection state')
      .to.equal('false');
  });
});
