/**
 * arc-kanban — the drag-and-drop board.
 *
 * What this pins: `columns` drives the board, the count badge shows `count/limit`
 * and flags an exceeded limit, arc-card-click distinguishes a click from a drag,
 * and the keyboard move protocol — grab, move within and across columns, drop or
 * cancel — reorders the board and reports every move as arc-card-move with the
 * final position.
 *
 * The keyboard path is what makes this component usable at all: the pointer path
 * is a custom drag, so without it a board would be mouse-only the way
 * arc-split-pane is (test-findings.md #34).
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, keyOn, record, useBaseCss } from './helpers.js';

import '../src/data/kanban.register.js';

afterEach(() => cleanup());

// The over-limit count is coloured with a theme token, which lives at :root in
// base.css — without it every count computes the same colour and the assertion
// would pass for the wrong reason.
useBaseCss();

const COLUMNS = [
  { id: 'todo', title: 'To do', items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Bravo' }] },
  { id: 'doing', title: 'Doing', items: [{ id: 'c', label: 'Charlie' }] },
  { id: 'done', title: 'Done', items: [] },
];

async function board(attrs = '', columns = COLUMNS) {
  const el = mount(`<arc-kanban ${attrs}></arc-kanban>`);
  el.columns = columns;
  await settle(el);
  return el;
}

const columnEls = (el) => [...el.shadowRoot.querySelectorAll('[part~="column"]')];
const cards = (el) => [...el.shadowRoot.querySelectorAll('[part~="card"]')];
/** Cards are re-rendered on every move, so always look them up fresh by id. */
const cardById = (el, id) => el.shadowRoot.querySelector(`[part~="card"][data-card-id="${id}"]`);

/**
 * A click, as this component detects one: a pointerdown/pointerup pair with no
 * movement between them. `.click()` alone never reaches _onCardPointerUp.
 */
async function clickCard(el, id) {
  const card = cardById(el, id);
  const init = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0, clientX: 10, clientY: 10 };
  card.dispatchEvent(new PointerEvent('pointerdown', init));
  card.dispatchEvent(new PointerEvent('pointerup', init));
  await settle(el);
}
const labelsIn = (el, colIndex) =>
  [...columnEls(el)[colIndex].querySelectorAll('[part~="card-label"]')].map((n) => n.textContent.trim());
const counts = (el) =>
  [...el.shadowRoot.querySelectorAll('[part~="column-count"]')].map((n) => n.textContent.trim());

/** The board's layout as column → card labels. */
const layout = (el) => columnEls(el).map((_, i) => labelsIn(el, i));

describe('arc-kanban rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await board();
    for (const part of [
      'board', 'column', 'column-header', 'column-title', 'column-count', 'list', 'card', 'card-label',
    ]) {
      expect(el.shadowRoot.querySelector(`[part~="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders a column per entry and a card per item', async () => {
    const el = await board();
    expect(columnEls(el)).to.have.lengthOf(3);
    expect(layout(el)).to.deep.equal([['Alpha', 'Bravo'], ['Charlie'], []]);
  });

  it('titles each column', async () => {
    const el = await board();
    expect([...el.shadowRoot.querySelectorAll('[part~="column-title"]')].map((n) => n.textContent.trim()))
      .to.deep.equal(['To do', 'Doing', 'Done']);
  });

  it('renders a description only when the card has one', async () => {
    const el = await board('', [
      { id: 'c1', title: 'C', items: [{ id: 'a', label: 'A', description: 'details' }, { id: 'b', label: 'B' }] },
    ]);
    expect(el.shadowRoot.querySelectorAll('[part~="card-description"]')).to.have.lengthOf(1);
  });

  it('survives an empty board', async () => {
    const el = await board('', []);
    expect(columnEls(el)).to.have.lengthOf(0);
    expect(el.shadowRoot.querySelector('[part~="board"]')).to.not.equal(null);
  });

  it('survives never being handed columns', async () => {
    const el = mount('<arc-kanban></arc-kanban>');
    await settle(el);
    expect(el.shadowRoot.querySelector('[part~="board"]')).to.not.equal(null);
  });
});

describe('arc-kanban column counts', () => {
  it('counts the cards', async () => {
    const el = await board();
    expect(counts(el)[0]).to.contain('2');
  });

  it('shows count over limit when a limit is set', async () => {
    const el = await board('', [
      { id: 'x', title: 'X', limit: 5, items: [{ id: 'a', label: 'A' }] },
    ]);
    expect(counts(el)[0].replace(/\s/g, '')).to.equal('1/5');
  });

  it('flags a column that is over its limit', async () => {
    const under = await board('', [
      { id: 'x', title: 'X', limit: 3, items: [{ id: 'a', label: 'A' }] },
    ]);
    const over = await board('', [
      { id: 'x', title: 'X', limit: 1, items: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] },
    ]);

    const colour = (el) =>
      getComputedStyle(el.shadowRoot.querySelector('[part~="column-count"]')).color;
    expect(colour(over), 'an exceeded limit is coloured differently').to.not.equal(colour(under));
  });
});

describe('arc-kanban card activation', () => {
  it('reports a plain click with the card and its column', async () => {
    const el = await board();
    const details = [];
    el.addEventListener('arc-card-click', (e) => details.push(e.detail));

    await clickCard(el, 'a');

    expect(details).to.have.lengthOf(1);
    expect(details[0]).to.deep.equal({ cardId: 'a', columnId: 'todo' });
  });

  it('bubbles and crosses the shadow boundary', async () => {
    const el = await board();
    let event = null;
    document.body.addEventListener('arc-card-click', (e) => { event = e; }, { once: true });

    await clickCard(el, 'a');

    expect(event).to.not.equal(null);
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });
});

describe('arc-kanban keyboard move protocol', () => {
  /** Grab a card by id, then send keys to it — re-querying after each render. */
  async function grab(el, id) {
    keyOn(cardById(el, id), ' ');
    await settle(el);
  }
  async function send(el, id, key) {
    keyOn(cardById(el, id), key);
    await settle(el);
  }

  it('moves a card down within its column and reports the final position', async () => {
    const el = await board();
    const details = [];
    el.addEventListener('arc-card-move', (e) => details.push(e.detail));

    await grab(el, 'a');
    await send(el, 'a', 'ArrowDown');
    await send(el, 'a', ' ');

    expect(layout(el)[0]).to.deep.equal(['Bravo', 'Alpha']);
    expect(details.at(-1)).to.include({ cardId: 'a', fromColumn: 'todo', toColumn: 'todo' });
    expect(details.at(-1).index).to.equal(1);
  });

  it('moves a card across columns', async () => {
    const el = await board();
    const details = [];
    el.addEventListener('arc-card-move', (e) => details.push(e.detail));

    await grab(el, 'a');
    await send(el, 'a', 'ArrowRight');
    await send(el, 'a', ' ');

    expect(layout(el)[0], 'left the source column').to.not.include('Alpha');
    expect(details.at(-1).toColumn).to.equal('doing');
  });

  it('Escape abandons a grab and restores the original order', async () => {
    const el = await board();
    const before = layout(el);
    const seen = record(el, ['arc-card-move']);

    await grab(el, 'a');
    await send(el, 'a', 'ArrowDown');
    await send(el, 'a', 'Escape');

    expect(layout(el), 'the board is back where it started').to.deep.equal(before);
    expect(seen, 'and nothing was announced').to.deep.equal([]);
  });

  it('does not move anything before a grab', async () => {
    const el = await board();
    const before = layout(el);

    await send(el, 'a', 'ArrowDown');

    expect(layout(el), 'the arrows navigate rather than move').to.deep.equal(before);
  });

  it('announces the move in a live region', async () => {
    const el = await board();
    const live = el.shadowRoot.querySelector('[aria-live]');
    expect(live, 'a live region exists').to.not.equal(null);

    await grab(el, 'a');
    expect(live.textContent.trim(), 'the grab is announced').to.not.equal('');
  });

  it('claims the keys it handles', async () => {
    const el = await board();
    for (const key of [' ', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      cardById(el, 'a').dispatchEvent(event);
      await settle(el);
      expect(event.defaultPrevented, key).to.equal(true);
    }
  });
});

describe('arc-kanban disabled', () => {
  it('mutes the keyboard path', async () => {
    const el = await board('disabled');
    const before = layout(el);
    const seen = record(el, ['arc-card-move']);

    keyOn(cardById(el, 'a'), ' ');
    keyOn(cardById(el, 'a'), 'ArrowDown');
    keyOn(cardById(el, 'a'), ' ');
    await settle(el);

    expect(layout(el)).to.deep.equal(before);
    expect(seen).to.deep.equal([]);
  });

  it('takes the board out of the pointer path', async () => {
    const el = await board('disabled');
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
  });
});

describe('arc-kanban internal copy', () => {
  it('works on its own copy, leaving the caller array untouched', async () => {
    // Documented: "The component works on an internal copy for immediate drag
    // feedback; sync your source of truth from arc-card-move."
    const source = structuredClone(COLUMNS);
    const el = await board('', source);

    keyOn(cardById(el, 'a'), ' ');
    await settle(el);
    keyOn(cardById(el, 'a'), 'ArrowDown');
    await settle(el);
    keyOn(cardById(el, 'a'), ' ');
    await settle(el);

    expect(source[0].items.map((i) => i.id), 'the caller array is not mutated')
      .to.deep.equal(['a', 'b']);
  });

  it('re-renders when a new array is assigned', async () => {
    const el = await board();
    el.columns = [{ id: 'only', title: 'Only', items: [{ id: 'z', label: 'Zulu' }] }];
    await settle(el);

    expect(layout(el)).to.deep.equal([['Zulu']]);
  });
});
