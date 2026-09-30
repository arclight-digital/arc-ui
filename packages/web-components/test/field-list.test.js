/**
 * arc-field-list / arc-field-row (test-findings #118): a repeating form field
 * whose rows the application owns. The list asks (arc-add, arc-remove,
 * arc-move) and the test plays the application, changing the DOM in answer.
 *
 * Booleans rather than DOM nodes in equalities (see the harness note, #119–#124).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until } from './helpers.js';
import '../src/input/field-list.register.js';
import '../src/input/field-row.register.js';

afterEach(cleanup);

const row = (v) =>
  `<arc-field-row label="Option ${v}"><input aria-label="Option ${v}" value="${v}"></arc-field-row>`;

/** A list, and an application that answers its requests by changing the rows. */
async function app(attrs = '', values = ['a', 'b', 'c']) {
  const el = mount(
    `<arc-field-list label="Options" ${attrs}>${values.map(row).join('')}</arc-field-list>`,
  );
  const log = [];
  el.addEventListener('arc-add', () => {
    log.push(['add']);
    el.insertAdjacentHTML('beforeend', row(`n${el.children.length}`));
  });
  el.addEventListener('arc-remove', (e) => {
    log.push(['remove', e.detail.index, e.detail.value]);
    el.children[e.detail.index].remove();
  });
  el.addEventListener('arc-move', (e) => {
    log.push(['move', e.detail.from, e.detail.to]);
    const rows = [...el.children];
    const [moved] = rows.splice(e.detail.from, 1);
    rows.splice(e.detail.to, 0, moved);
    el.append(...rows);
  });
  await settle(el);
  for (const r of el.children) await settle(r);
  return { el, log };
}

const rows = (el) => [...el.querySelectorAll('arc-field-row')];
const values = (el) => rows(el).map((r) => r.querySelector('input').value);
const handle = (r) => r.shadowRoot.querySelector('[part~="handle"]');
const remove = (r) => r.shadowRoot.querySelector('[part~="remove"]');
const addButton = (el) => el.shadowRoot.querySelector('[part~="add"]');
const key = (target, k) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }),
  );
const deepActive = () => {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
};

describe('arc-field-list', () => {
  it('names each row control after its row', async () => {
    const { el } = await app();
    const second = rows(el)[1];
    expect(handle(second).getAttribute('aria-label')).to.equal('Move Option b, position 2 of 3');
    expect(remove(second).getAttribute('label')).to.equal('Remove Option b');
    expect(el.shadowRoot.querySelector('[role="group"]').getAttribute('aria-label')).to.equal(
      'Options',
    );
  });

  it('asks for a new row, and puts focus in it once it renders', async () => {
    const { el, log } = await app();
    addButton(el).click();
    await settle(el);
    expect(log).to.deep.equal([['add']]);
    expect(rows(el)).to.have.length(4);
    const newInput = rows(el)[3].querySelector('input');
    expect(await until(() => document.activeElement === newInput), 'focus in the new row').to.equal(
      true,
    );
  });

  it('asks to remove a row, and moves focus to the row in its place', async () => {
    const { el, log } = await app();
    remove(rows(el)[1]).click();
    await settle(el);
    expect(log).to.deep.equal([['remove', 1, 1]]);
    expect(values(el)).to.deep.equal(['a', 'c']);
    expect(await until(() => deepActive() === handle(rows(el)[1]))).to.equal(true);
  });

  it('moves a row with the arrow keys, and focus follows it', async () => {
    const { el, log } = await app();
    key(handle(rows(el)[0]), 'ArrowDown');
    await settle(el);
    expect(log).to.deep.equal([['move', 0, 1]]);
    expect(values(el)).to.deep.equal(['b', 'a', 'c']);
    expect(await until(() => deepActive() === handle(rows(el)[1]))).to.equal(true);
    key(handle(rows(el)[1]), 'End');
    await settle(el);
    expect(values(el)).to.deep.equal(['b', 'c', 'a']);
  });

  it('does not ask to move past either end', async () => {
    const { el, log } = await app();
    key(handle(rows(el)[0]), 'ArrowUp');
    key(handle(rows(el)[2]), 'ArrowDown');
    await settle(el);
    expect(log).to.deep.equal([]);
  });

  it('moves a row by dragging its handle', async () => {
    const { el, log } = await app();
    const h = handle(rows(el)[0]);
    const third = rows(el)[2].getBoundingClientRect();
    const p = (y) => ({
      bubbles: true,
      composed: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse',
      clientX: 5,
      clientY: y,
    });
    const y0 = h.getBoundingClientRect().top + 4;
    h.dispatchEvent(new PointerEvent('pointerdown', p(y0)));
    h.dispatchEvent(new PointerEvent('pointermove', p(third.bottom - 2)));
    h.dispatchEvent(new PointerEvent('pointerup', p(third.bottom - 2)));
    await settle(el);
    expect(log).to.deep.equal([['move', 0, 2]]);
    expect(values(el)).to.deep.equal(['b', 'c', 'a']);
    expect(rows(el)[2].style.transform, 'drag offset cleared').to.equal('');
  });

  it('disables Remove at min and Add at max', async () => {
    const { el } = await app('min="3" max="3"');
    expect(
      rows(el).every((r) => remove(r).disabled),
      'remove disabled at min',
    ).to.equal(true);
    expect(addButton(el).disabled, 'add disabled at max').to.equal(true);
  });

  it('announces each change politely', async () => {
    const { el } = await app();
    const live = el.shadowRoot.querySelector('[aria-live="polite"]');
    key(handle(rows(el)[0]), 'ArrowDown');
    expect(await until(() => live.textContent.trim() === 'Moved to position 2 of 3')).to.equal(
      true,
    );
  });

  it('changes nothing itself when the application does not answer', async () => {
    const el = mount(
      `<arc-field-list label="Options">${['a', 'b'].map(row).join('')}</arc-field-list>`,
    );
    await settle(el);
    for (const r of el.children) await settle(r);
    key(handle(rows(el)[0]), 'ArrowDown');
    remove(rows(el)[1]).click();
    addButton(el).click();
    await settle(el);
    expect(values(el)).to.deep.equal(['a', 'b']);
  });
});

/** Halteres adoption batch against 4.6.0 (test-findings #141, #142). */
describe('arc-field-list readonly and add label (4.7.0)', () => {
  it('shows rows without controls when readonly (#141)', async () => {
    const { el } = await app('readonly');
    expect(addButton(el) === null, 'no add button').to.equal(true);
    expect(
      rows(el).every((r) => handle(r) === null && remove(r) === null),
      'no row controls',
    ).to.equal(true);
    el.readonly = false;
    await settle(el);
    for (const r of rows(el)) await settle(r);
    expect(handle(rows(el)[0]) !== null, 'controls return').to.equal(true);
  });

  it('uses add-label as the whole text, with the plus as an icon (#142)', async () => {
    const { el } = await app('add-label="Option"');
    expect(addButton(el).textContent.trim()).to.equal('Option');
    expect(addButton(el).querySelector('svg') !== null).to.equal(true);
  });
});
