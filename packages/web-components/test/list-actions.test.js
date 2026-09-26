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

async function list(attrs = 'selectable') {
  const el = mount(`<arc-list ${attrs}>${ROW('a')}${ROW('b')}</arc-list>`);
  await settle(el);
  for (const i of el.querySelectorAll('arc-list-item')) await settle(i);
  return el;
}

const item = (el, v) => el.querySelector(`arc-list-item[value="${v}"]`);
const actions = (i) => i.shadowRoot.querySelector('[part~="actions"]');
const row = (i) => i.shadowRoot.querySelector('.item');

describe('arc-list-item actions', () => {
  it('renders the slot inside the row, after the suffix', async () => {
    const el = await list();
    const a = item(el, 'a');
    // Booleans, not elements: see readouts.test.js on chai printing DOM nodes.
    expect(actions(a) !== null, 'an actions container').to.equal(true);
    expect(row(a).lastElementChild === actions(a), 'last in the row').to.equal(true);
    expect(actions(a).className).to.not.contain('--empty');
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
    expect(css).to.match(/\.item:hover \.item__actions[^{]*\{[^}]*opacity: 1/);
    expect(css).to.match(/@media \(hover: none\)\s*\{\s*\.item__actions\s*\{\s*opacity: 1/);
  });

  it('never selects the row on click', async () => {
    const el = await list();
    const events = record(el, ['arc-select', 'arc-change']);
    item(el, 'a').querySelector('.delete').click();
    await settle(el);
    expect(events).to.deep.equal([]);
    expect(el.value).to.not.equal('a');
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
