/**
 * arc-list-item's `actions` slot: per-row buttons, such as rename or delete,
 * that appear on hover or focus and never select the row.
 *
 * Reported by an application listing documents (test-findings #113). Its
 * workaround was a hand-built list, because arc-list-item had nowhere to put a
 * trailing action. Decided with the maintainer: on a device without hover the
 * actions are always shown.
 *
 * Hover and `(hover: none)` cannot be driven from this runner without adding a
 * dependency, so those two are asserted on the component's own stylesheet.
 * Focus, clicks and keys are driven for real.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, until } from './helpers.js';

import '../src/data/list.register.js';

afterEach(cleanup);

const ROW = (v) => `
  <arc-list-item value="${v}">Row ${v}
    <button slot="actions" class="rename">Rename ${v}</button>
    <button slot="actions" class="delete">Delete ${v}</button>
  </arc-list-item>`;

async function list(attrs = '') {
  const el = mount(`<arc-list ${attrs}>${ROW('a')}${ROW('b')}</arc-list>`);
  await settle(el);
  for (const i of el.querySelectorAll('arc-list-item')) await settle(i);
  return el;
}

const item = (el, v) => el.querySelector(`arc-list-item[value="${v}"]`);
const actions = (i) => i.shadowRoot.querySelector('[part~="actions"]');
const row = (i) => i.shadowRoot.querySelector('.item');

describe('arc-list-item actions', () => {
  it('renders the actions beside the row, never inside it', async () => {
    // Inside the row was 4.5.0, and axe failed it as nested-interactive: the
    // row is an option in a listbox and a link with href (finding #125).
    const el = await list();
    const a = item(el, 'a');
    // Booleans, not elements: see readouts.test.js on chai printing DOM nodes.
    expect(actions(a) !== null, 'an actions container').to.equal(true);
    expect(row(a).contains(actions(a)), 'not inside the row').to.equal(false);
    expect(row(a).nextElementSibling === actions(a), 'right after it').to.equal(true);
    expect(actions(a).className).to.not.contain('--empty');
  });

  it('puts the list item role around the row and its actions', async () => {
    const el = await list();
    const a = item(el, 'a');
    const wrapper = actions(a).parentElement;
    expect(wrapper.getAttribute('role')).to.equal('listitem');
    expect(wrapper.contains(row(a))).to.equal(true);
    expect(row(a).hasAttribute('role'), 'the row itself carries no list role').to.equal(false);
  });

  it('does not render actions in a selectable list, where the row is an option', async () => {
    const el = await list('selectable');
    const a = item(el, 'a');
    expect(row(a).getAttribute('role')).to.equal('option');
    expect(actions(a) === null, 'no actions in a listbox').to.equal(true);
    expect(a.querySelector('.rename').assignedSlot === null, 'the buttons stay unslotted').to.equal(
      true,
    );
  });

  it('marks a selected link row as the current page', async () => {
    const el = mount(`<arc-list>
      <arc-list-item href="#a" selected>A<button slot="actions">Rename A</button></arc-list-item>
      <arc-list-item href="#b">B</arc-list-item></arc-list>`);
    await settle(el);
    const [a, b] = el.querySelectorAll('arc-list-item');
    await settle(a);
    await settle(b);
    expect(row(a).localName).to.equal('a');
    expect(row(a).getAttribute('aria-current')).to.equal('page');
    expect(row(b).hasAttribute('aria-current')).to.equal(false);
    expect(row(a).contains(actions(a)), 'never inside the link').to.equal(false);
  });

  it('takes no space when empty', async () => {
    const el = mount('<arc-list><arc-list-item value="x">Plain</arc-list-item></arc-list>');
    await settle(el);
    const i = el.querySelector('arc-list-item');
    await settle(i);
    expect(getComputedStyle(actions(i)).display).to.equal('none');
  });

  it('is hidden at rest, and shown while something in the row has focus', async () => {
    const el = await list();
    const a = item(el, 'a');
    expect(getComputedStyle(actions(a)).opacity).to.equal('0');
    a.querySelector('.rename').focus();
    // The reveal fades, so wait for it to land rather than reading mid-fade.
    expect(
      await until(() => getComputedStyle(actions(a)).opacity === '1'),
      'revealed by focus',
    ).to.equal(true);
  });

  it('stays in the tab order while hidden, so focus can reveal it', async () => {
    const el = await list();
    const a = item(el, 'a');
    expect(getComputedStyle(actions(a)).visibility).to.equal('visible');
    a.querySelector('.rename').focus();
    expect(document.activeElement === a.querySelector('.rename')).to.equal(true);
  });

  it('declares the hover reveal and the no-hover default', async () => {
    const el = await list();
    const css = item(el, 'a')
      .shadowRoot.adoptedStyleSheets.flatMap((sheet) => [...sheet.cssRules])
      .map((r) => r.cssText)
      .join('\n');
    expect(css).to.match(/\.row:hover \.item__actions[^{]*\{[^}]*opacity: 1/);
    expect(css).to.match(/@media \(hover: none\)\s*\{\s*\.item__actions\s*\{\s*opacity: 1/);
  });

  it('never activates the row on click', async () => {
    const el = await list();
    const events = record(el, ['arc-select', 'arc-change']);
    item(el, 'a').querySelector('.delete').click();
    await settle(el);
    expect(events).to.deep.equal([]);
  });

  it('still selects the row on a click beside the actions', async () => {
    const el = await list();
    const events = record(el, ['arc-select']);
    row(item(el, 'a')).click();
    await settle(el);
    expect(events.map(([, v]) => v)).to.deep.equal(['a']);
  });

  it('keeps Enter and Space for the button', async () => {
    const el = await list();
    const events = record(el, ['arc-select']);
    const button = item(el, 'a').querySelector('.rename');
    button.focus();
    for (const k of ['Enter', ' ']) {
      const ev = new KeyboardEvent('keydown', {
        key: k,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      button.dispatchEvent(ev);
      expect(ev.defaultPrevented, `${k} is left to the button`).to.equal(false);
    }
    await settle(el);
    expect(events).to.deep.equal([]);
  });

  it('moves from an action to the next row with ArrowDown', async () => {
    const el = await list();
    item(el, 'a').querySelector('.rename').focus();
    keyOn(item(el, 'a').querySelector('.rename'), 'ArrowDown');
    await settle(el);
    expect(item(el, 'b').shadowRoot.activeElement === row(item(el, 'b'))).to.equal(true);
  });
});

/** Halteres adoption batch against 4.6.0 (test-findings #133–#135). */
describe('arc-list-item activation (4.7.0)', () => {
  const clickAndHold = (target, init = {}) => {
    let prevented = null;
    const hold = (e) => {
      prevented = e.defaultPrevented;
      e.preventDefault();
    };
    window.addEventListener('click', hold, { once: true });
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, ...init }));
    window.removeEventListener('click', hold);
    return prevented;
  };

  const plain = async (markup) => {
    const el = mount(`<arc-list>${markup}</arc-list>`);
    await settle(el);
    for (const i of el.querySelectorAll('arc-list-item')) await settle(i);
    return el;
  };

  it('fires arc-select on Enter and Space in a plain list (#133)', async () => {
    const el = await plain('<arc-list-item value="a">A</arc-list-item>');
    const events = record(el, ['arc-select']);
    const r = row(el.querySelector('arc-list-item'));
    for (const k of ['Enter', ' ']) {
      const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true });
      r.dispatchEvent(ev);
      expect(ev.defaultPrevented, `${k} claimed`).to.equal(true);
    }
    expect(events.map(([, v]) => v)).to.deep.equal(['a', 'a']);
  });

  it('lets a cancelled arc-select stop a link row navigating (#134)', async () => {
    const el = await plain('<arc-list-item value="a" href="#nowhere">A</arc-list-item>');
    el.addEventListener('arc-select', (e) => e.preventDefault());
    expect(clickAndHold(row(el.querySelector('arc-list-item')))).to.equal(true);
  });

  // A real click on a real link navigates the test page, which ends the run
  // ("page was reloaded"); clickAndHold reads the row's decision at the window,
  // after the component has had its turn, then cancels the navigation there.
  it('lets an uncancelled one navigate', async () => {
    const el = await plain('<arc-list-item value="a" href="#nowhere">A</arc-list-item>');
    const seen = record(el, ['arc-select']);
    expect(clickAndHold(row(el.querySelector('arc-list-item'))), 'not cancelled by the row').to.equal(false);
    expect(seen).to.have.length(1);
  });

  it('leaves a modified click on a link row to the browser (#134)', async () => {
    const el = await plain('<arc-list-item value="a" href="#nowhere">A</arc-list-item>');
    const seen = record(el, ['arc-select']);
    for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
      expect(clickAndHold(row(el.querySelector('arc-list-item')), init), 'left to the browser').to.equal(false);
    }
    expect(seen).to.deep.equal([]);
  });

  it('makes sm rows shorter, not just their text (#135)', async () => {
    const md = await plain('<arc-list-item value="a">A</arc-list-item>');
    const mdH = row(md.querySelector('arc-list-item')).getBoundingClientRect().height;
    const mdF = getComputedStyle(row(md.querySelector('arc-list-item'))).fontSize;
    cleanup();
    const sm = mount('<arc-list size="sm"><arc-list-item value="a">A</arc-list-item></arc-list>');
    await settle(sm);
    await settle(sm.querySelector('arc-list-item'));
    const r = row(sm.querySelector('arc-list-item'));
    expect(r.getBoundingClientRect().height).to.be.lessThan(mdH);
    expect(parseFloat(getComputedStyle(r).fontSize)).to.be.lessThan(parseFloat(mdF));
  });
});
