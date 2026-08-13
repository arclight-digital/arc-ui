/**
 * arc-data-grid — the spreadsheet-grade grid.
 *
 * What this pins: the documented ownership boundary (the grid works on a
 * shallow copy, so sorting and editing never touch the caller's array, and
 * every index that leaves the component indexes the *original* rows), the
 * multi-sort cycle including the empties-last and stable-tiebreak rules, the
 * selection contract, inline editing, the APG single-tab-stop roving grid, and
 * virtualization rendering only a window of rows.
 *
 * Fixture values are chosen so the two sortable numeric/text columns disagree
 * about ordering — sorting by `name` and sorting by `score` produce different
 * row orders, so an assertion can tell *which* key sorted. A fixture where both
 * agree cannot distinguish a working sort from one that ignores its key.
 *
 * Two tests are marked BUG: Space on a non-checkbox header toggles all rows,
 * and the scroll listener is not restored after a disconnect/reconnect. See
 * test-findings.md.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, tick, keyOn, nextFrame, until } from './helpers.js';

import '../src/data/data-grid.register.js';

afterEach(() => cleanup());

const COLS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'score', label: 'Score', sortable: true, editable: true },
  { key: 'team', label: 'Team', sortable: true },
];

/**
 * `name` ascending and `score` ascending disagree, so the assertions below can
 * name which column did the work. Dave's null score exercises empties-last in
 * both directions, and the two Blue/Red pairs exercise the original-order
 * tiebreak on `team`.
 */
const ROWS = [
  { name: 'Carol', score: 7, team: 'Blue' },
  { name: 'alice', score: 30, team: 'Red' },
  { name: 'Bob', score: 12, team: 'Red' },
  { name: 'Dave', score: null, team: 'Blue' },
];

async function grid({ columns = COLS, rows = ROWS, ...props } = {}, attrs = '') {
  const el = mount(`<arc-data-grid ${attrs}></arc-data-grid>`);
  el.columns = columns;
  el.rows = rows.map((r) => ({ ...r }));
  Object.assign(el, props);
  await settle(el);
  return el;
}

const headers = (el) => [...el.shadowRoot.querySelectorAll('th[role="columnheader"]')];
/**
 * Headers minus the select-all cell — which also carries role="columnheader",
 * so indexing the raw list shifts by one the moment `selectable` is on.
 */
const dataHeaders = (el) => headers(el).filter((th) => !th.classList.contains('checkbox-cell'));
const headerLabels = (el) =>
  dataHeaders(el).map((th) => th.textContent.replace(/[↕↑↓\d]/g, '').trim());
const bodyRows = (el) => [...el.shadowRoot.querySelectorAll('tbody tr:not(.spacer)')];
const cellsOf = (tr) => [...tr.querySelectorAll('td:not(.checkbox-cell)')];
/** The rendered value of one column, top to bottom — the order assertions read this. */
const columnText = (el, key) => {
  const i = COLS.findIndex((c) => c.key === key);
  return bodyRows(el).map((tr) => cellsOf(tr)[i]?.textContent.trim());
};
const cellAt = (el, r, c) => el.shadowRoot.querySelector(`[data-row="${r}"][data-col="${c}"]`);
/** Click the nth *data* column header, so the index means the same with or without selection. */
const clickHeader = (el, index, init = {}) =>
  dataHeaders(el)[index].dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));

describe('arc-data-grid rendering', () => {
  it('exposes the documented css parts', async () => {
    const el = await grid({ selectable: true });
    for (const part of ['wrapper', 'table', 'header', 'body', 'header-cell', 'row', 'cell']) {
      expect(el.shadowRoot.querySelector(`[part="${part}"]`), part).to.not.equal(null);
    }
  });

  it('renders a header per column and a row per datum', async () => {
    const el = await grid();
    expect(headerLabels(el)).to.deep.equal(['Name', 'Score', 'Team']);
    expect(bodyRows(el)).to.have.lengthOf(ROWS.length);
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'alice', 'Bob', 'Dave']);
  });

  it('renders an empty cell rather than the string "null"', async () => {
    const el = await grid();
    expect(columnText(el, 'score')).to.deep.equal(['7', '30', '12', '']);
  });

  it('carries the grid roles and counts', async () => {
    const el = await grid({ selectable: true });
    const table = el.shadowRoot.querySelector('[role="grid"]');
    expect(table.getAttribute('aria-rowcount')).to.equal(String(ROWS.length + 1));
    expect(table.getAttribute('aria-colcount')).to.equal(String(COLS.length + 1));
    expect(table.getAttribute('aria-multiselectable')).to.equal('true');
  });

  it('omits aria-multiselectable when not selectable', async () => {
    const el = await grid();
    expect(el.shadowRoot.querySelector('[role="grid"]').hasAttribute('aria-multiselectable')).to.equal(
      false,
    );
  });

  it('shows the empty state spanning every column', async () => {
    const el = await grid({ rows: [], selectable: true });
    const empty = el.shadowRoot.querySelector('.empty-state');
    expect(empty).to.not.equal(null);
    expect(empty.textContent.trim()).to.equal('No data available');
    expect(empty.getAttribute('colspan')).to.equal(String(COLS.length + 1));
  });

  it('survives columns and rows never being set', async () => {
    const el = mount('<arc-data-grid></arc-data-grid>');
    await settle(el);
    expect(el.shadowRoot.querySelector('.empty-state')).to.not.equal(null);
    expect(headers(el)).to.have.lengthOf(0);
  });

  it('defaults rowHeight to 40', async () => {
    const el = await grid();
    expect(el.rowHeight).to.equal(40);
  });
});

describe('arc-data-grid column order', () => {
  const PINNED = [
    { key: 'name', label: 'Name' },
    { key: 'score', label: 'Score', pinned: true, width: '90px' },
    { key: 'team', label: 'Team' },
  ];

  it('displays pinned columns first regardless of their position in the array', async () => {
    const el = await grid({ columns: PINNED });
    expect(headerLabels(el)).to.deep.equal(['Score', 'Name', 'Team']);
  });

  it('offsets pinned cells along the inline axis, not the left edge', async () => {
    const el = await grid({ columns: PINNED });
    const th = headers(el)[0];
    expect(th.classList.contains('cell--pinned')).to.equal(true);
    expect(th.getAttribute('style')).to.contain('inset-inline-start:0px');
  });

  it('reserves the checkbox column width in the pinned offset', async () => {
    const el = await grid({ columns: PINNED, selectable: true });
    // Checkbox is pinned too once any column is, so the first data column
    // starts past it rather than underneath it.
    expect(headers(el)[1].getAttribute('style')).to.contain('inset-inline-start:40px');
  });

  it('marks only the last pinned column as the shadow-casting edge', async () => {
    const el = await grid({
      columns: [
        { key: 'name', label: 'Name', pinned: true, width: '100px' },
        { key: 'score', label: 'Score', pinned: true, width: '90px' },
        { key: 'team', label: 'Team' },
      ],
    });
    const last = headers(el).filter((th) => th.classList.contains('cell--pinned-last'));
    expect(last).to.have.lengthOf(1);
    expect(last[0].textContent.trim()).to.equal('Score');
  });

  it('pins nothing when no column asks for it', async () => {
    const el = await grid();
    expect(el.shadowRoot.querySelector('.cell--pinned')).to.equal(null);
  });

  it('maps logical and physical align values onto the inline axis', async () => {
    const el = await grid({
      columns: [
        { key: 'name', label: 'Name', align: 'right' },
        { key: 'score', label: 'Score', align: 'center' },
        { key: 'team', label: 'Team', align: 'left' },
      ],
    });
    const styles = headers(el).map((th) => th.getAttribute('style') ?? '');
    expect(styles[0]).to.contain('text-align:end');
    expect(styles[1]).to.contain('text-align:center');
    // start is the CSS default, so it is deliberately not declared
    expect(styles[2]).to.not.contain('text-align');
  });
});

describe('arc-data-grid sorting', () => {
  it('cycles a sortable header asc → desc → none', async () => {
    const el = await grid();

    clickHeader(el, 0);
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: 'name', direction: 'asc' }]);
    expect(columnText(el, 'name')).to.deep.equal(['alice', 'Bob', 'Carol', 'Dave']);

    clickHeader(el, 0);
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: 'name', direction: 'desc' }]);
    expect(columnText(el, 'name')).to.deep.equal(['Dave', 'Carol', 'Bob', 'alice']);

    clickHeader(el, 0);
    await settle(el);
    expect(el.sort).to.deep.equal([]);
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'alice', 'Bob', 'Dave']);
  });

  it('sorts by the column that was clicked', async () => {
    const el = await grid();
    clickHeader(el, 1);
    await settle(el);
    // score asc, which disagrees with name asc — so this pins the key, not just
    // that some sort happened
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'Bob', 'alice', 'Dave']);
  });

  it('keeps empty values last in both directions', async () => {
    const el = await grid();
    clickHeader(el, 1);
    await settle(el);
    expect(columnText(el, 'name').at(-1)).to.equal('Dave');
    clickHeader(el, 1);
    await settle(el);
    expect(el.sort[0].direction).to.equal('desc');
    expect(columnText(el, 'name').at(-1)).to.equal('Dave');
  });

  it('breaks ties by original order rather than arbitrarily', async () => {
    const el = await grid();
    clickHeader(el, 2);
    await settle(el);
    // Blue: Carol(0), Dave(3) — Red: alice(1), Bob(2)
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'Dave', 'alice', 'Bob']);
  });

  it('appends a secondary sort on shift-click and applies it in priority order', async () => {
    const el = await grid();
    clickHeader(el, 2);
    await settle(el);
    clickHeader(el, 1, { shiftKey: true });
    await settle(el);

    expect(el.sort).to.deep.equal([
      { key: 'team', direction: 'asc' },
      { key: 'score', direction: 'asc' },
    ]);
    // team asc, then score asc inside each team; Dave's empty score still last
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'Dave', 'Bob', 'alice']);
  });

  it('replaces the whole sort on a plain click after a multi-sort', async () => {
    const el = await grid();
    clickHeader(el, 2);
    await settle(el);
    clickHeader(el, 1, { shiftKey: true });
    await settle(el);
    clickHeader(el, 0);
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: 'name', direction: 'asc' }]);
  });

  it('drops a shift-cycled column out of the multi-sort without disturbing the rest', async () => {
    const el = await grid();
    clickHeader(el, 2);
    await settle(el);
    clickHeader(el, 1, { shiftKey: true });
    await settle(el);
    clickHeader(el, 1, { shiftKey: true }); // asc → desc
    await settle(el);
    expect(el.sort).to.deep.equal([
      { key: 'team', direction: 'asc' },
      { key: 'score', direction: 'desc' },
    ]);
    clickHeader(el, 1, { shiftKey: true }); // desc → none
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: 'team', direction: 'asc' }]);
  });

  it('ignores clicks on a column that is not sortable', async () => {
    const el = await grid({ columns: [{ key: 'name', label: 'Name' }] });
    clickHeader(el, 0);
    await settle(el);
    expect(el.sort).to.deep.equal([]);
  });

  it('emits arc-sort with the full multi-sort array, detached from internal state', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-sort', (e) => seen.push(e.detail.sort));

    clickHeader(el, 2);
    await settle(el);
    clickHeader(el, 1, { shiftKey: true });
    await settle(el);

    expect(seen).to.have.lengthOf(2);
    expect(seen[1]).to.deep.equal([
      { key: 'team', direction: 'asc' },
      { key: 'score', direction: 'asc' },
    ]);
    // the first payload must not have grown a second entry behind the listener's back
    expect(seen[0]).to.have.lengthOf(1);
  });

  it('compares a column of numeric strings numerically, not lexically', async () => {
    const el = await grid({
      columns: [{ key: 'n', label: 'N', sortable: true }],
      rows: [{ n: '100' }, { n: '9' }, { n: 20 }],
    });
    clickHeader(el, 0);
    await settle(el);
    expect(bodyRows(el).map((tr) => tr.textContent.trim())).to.deep.equal(['9', '20', '100']);
  });

  it('pre-sorts when sort is set as a property', async () => {
    const el = await grid({ sort: [{ key: 'score', direction: 'desc' }] });
    expect(columnText(el, 'name')).to.deep.equal(['alice', 'Bob', 'Carol', 'Dave']);
  });

  it('marks the primary sorted header with aria-sort', async () => {
    const el = await grid();
    clickHeader(el, 0);
    await settle(el);
    expect(headers(el)[0].getAttribute('aria-sort')).to.equal('ascending');
    expect(headers(el)[1].getAttribute('aria-sort')).to.equal('none');
    clickHeader(el, 0);
    await settle(el);
    expect(headers(el)[0].getAttribute('aria-sort')).to.equal('descending');
  });

  it('shows a priority number only once more than one sort is active', async () => {
    const el = await grid();
    clickHeader(el, 2);
    await settle(el);
    expect(el.shadowRoot.querySelector('.sort-index')).to.equal(null);
    clickHeader(el, 1, { shiftKey: true });
    await settle(el);
    // The badge belongs to the column, so it follows header order — team was
    // sorted first and sits last, which is exactly what makes the number useful.
    const badge = (i) => dataHeaders(el)[i].querySelector('.sort-index')?.textContent;
    expect([badge(0), badge(1), badge(2)]).to.deep.equal([undefined, '2', '1']);
  });
});

describe('arc-data-grid manualSort', () => {
  it('leaves row order alone while still cycling and emitting', async () => {
    const el = await grid({ manualSort: true });
    const seen = [];
    el.addEventListener('arc-sort', (e) => seen.push(e.detail.sort));

    clickHeader(el, 0);
    await settle(el);

    expect(el.sort).to.deep.equal([{ key: 'name', direction: 'asc' }]);
    expect(seen[0]).to.deep.equal([{ key: 'name', direction: 'asc' }]);
    expect(columnText(el, 'name')).to.deep.equal(['Carol', 'alice', 'Bob', 'Dave']);
  });

  it('reflects no attribute but reads one', async () => {
    const el = await grid({}, 'manual-sort');
    expect(el.manualSort).to.equal(true);
  });
});

describe('arc-data-grid selection', () => {
  const selectAll = (el) => el.shadowRoot.querySelector('.select-all');
  const rowBoxes = (el) =>
    [...el.shadowRoot.querySelectorAll('tbody input[type="checkbox"]')];

  it('adds a checkbox column only when selectable', async () => {
    expect(rowBoxes(await grid())).to.have.lengthOf(0);
    expect(rowBoxes(await grid({ selectable: true }))).to.have.lengthOf(ROWS.length);
  });

  it('emits sorted indices into the original rows array', async () => {
    const el = await grid({ selectable: true });
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));

    rowBoxes(el)[2].click();
    await settle(el);
    rowBoxes(el)[0].click();
    await settle(el);

    expect(seen.at(-1).selectedIndices).to.deep.equal([0, 2]);
    expect(seen.at(-1).value).to.deep.equal([0, 2]);
  });

  it('keeps indices pointing at the original rows after a sort', async () => {
    const el = await grid({ selectable: true });
    clickHeader(el, 1); // score asc → Carol, Bob, alice, Dave
    await settle(el);

    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.value));
    rowBoxes(el)[0].click(); // first *displayed* row is Carol, original index 0
    await settle(el);
    rowBoxes(el)[1].click(); // Bob, original index 2
    await settle(el);

    expect(seen.at(-1)).to.deep.equal([0, 2]);
  });

  it('marks the selected row on the element, not just the checkbox', async () => {
    const el = await grid({ selectable: true });
    rowBoxes(el)[1].click();
    await settle(el);
    const tr = bodyRows(el)[1];
    expect(tr.classList.contains('selected')).to.equal(true);
    expect(tr.getAttribute('aria-selected')).to.equal('true');
    expect(bodyRows(el)[0].getAttribute('aria-selected')).to.equal('false');
  });

  it('omits aria-selected entirely when the grid is not selectable', async () => {
    const el = await grid();
    expect(bodyRows(el)[0].hasAttribute('aria-selected')).to.equal(false);
  });

  it('select-all toggles every row and then clears every row', async () => {
    const el = await grid({ selectable: true });
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.value));

    selectAll(el).click();
    await settle(el);
    expect(seen.at(-1)).to.deep.equal([0, 1, 2, 3]);
    expect(rowBoxes(el).every((b) => b.checked)).to.equal(true);

    selectAll(el).click();
    await settle(el);
    expect(seen.at(-1)).to.deep.equal([]);
    expect(rowBoxes(el).some((b) => b.checked)).to.equal(false);
  });

  it('shows the select-all as indeterminate only while partially selected', async () => {
    const el = await grid({ selectable: true });
    expect(selectAll(el).indeterminate).to.equal(false);

    rowBoxes(el)[0].click();
    await settle(el);
    expect(selectAll(el).indeterminate).to.equal(true);
    expect(selectAll(el).checked).to.equal(false);

    for (const box of rowBoxes(el).slice(1)) {
      box.click();
      await settle(el);
    }
    expect(selectAll(el).indeterminate).to.equal(false);
    expect(selectAll(el).checked).to.equal(true);
  });

  it('does not treat an empty grid as fully selected', async () => {
    const el = await grid({ rows: [], selectable: true });
    expect(selectAll(el).checked).to.equal(false);
    expect(selectAll(el).indeterminate).to.equal(false);
  });

  it('clears selection when rows are reassigned', async () => {
    const el = await grid({ selectable: true });
    selectAll(el).click();
    await settle(el);
    expect(rowBoxes(el).every((b) => b.checked)).to.equal(true);

    el.rows = ROWS.map((r) => ({ ...r }));
    await settle(el);
    expect(rowBoxes(el).some((b) => b.checked)).to.equal(false);
  });
});

describe('arc-data-grid inline editing', () => {
  const editor = (el) => el.shadowRoot.querySelector('.editor');
  const dblclick = (cell) => cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));

  it('opens an editor on double click of an editable cell', async () => {
    const el = await grid();
    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    expect(editor(el)).to.not.equal(null);
    expect(editor(el).value).to.equal('7');
  });

  it('leaves a non-editable cell alone', async () => {
    const el = await grid();
    dblclick(cellsOf(bodyRows(el)[0])[0]);
    await settle(el);
    expect(editor(el)).to.equal(null);
  });

  it('commits on Enter and emits arc-cell-change', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-cell-change', (e) => seen.push(e.detail));

    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    editor(el).value = '42';
    keyOn(editor(el), 'Enter');
    await settle(el);

    expect(seen).to.have.lengthOf(1);
    expect(seen[0].rowIndex).to.equal(0);
    expect(seen[0].key).to.equal('score');
    expect(seen[0].value).to.equal(42);
    expect(columnText(el, 'score')[0]).to.equal('42');
    expect(editor(el)).to.equal(null);
  });

  it('coerces to a number only when the previous value was one', async () => {
    const el = await grid({
      columns: [{ key: 'v', label: 'V', editable: true }],
      rows: [{ v: 'abc' }],
    });
    const seen = [];
    el.addEventListener('arc-cell-change', (e) => seen.push(e.detail.value));

    dblclick(bodyRows(el)[0].querySelector('td'));
    await settle(el);
    editor(el).value = '42';
    keyOn(editor(el), 'Enter');
    await settle(el);

    expect(seen[0]).to.equal('42');
  });

  it('keeps a non-numeric edit of a numeric cell as text', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-cell-change', (e) => seen.push(e.detail.value));

    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    editor(el).value = 'n/a';
    keyOn(editor(el), 'Enter');
    await settle(el);

    expect(seen[0]).to.equal('n/a');
  });

  it('reports the original row index even when the grid is sorted', async () => {
    const el = await grid();
    clickHeader(el, 1); // score asc → Carol(0), Bob(2), alice(1), Dave(3)
    await settle(el);

    const seen = [];
    el.addEventListener('arc-cell-change', (e) => seen.push(e.detail));
    dblclick(cellsOf(bodyRows(el)[1])[1]); // displayed second = Bob, original index 2
    await settle(el);
    editor(el).value = '99';
    keyOn(editor(el), 'Enter');
    await settle(el);

    expect(seen[0].rowIndex).to.equal(2);
    expect(seen[0].row.name).to.equal('Bob');
  });

  it('abandons the edit on Escape', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-cell-change', () => seen.push(1));

    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    editor(el).value = '42';
    keyOn(editor(el), 'Escape');
    await settle(el);

    expect(seen).to.have.lengthOf(0);
    expect(columnText(el, 'score')[0]).to.equal('7');
    expect(editor(el)).to.equal(null);
  });

  it('commits on blur', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-cell-change', (e) => seen.push(e.detail.value));

    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    editor(el).value = '42';
    editor(el).dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    await settle(el);

    expect(seen).to.deep.equal([42]);
  });

  it('does not double-commit when Enter is followed by the blur it causes', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-cell-change', () => seen.push(1));

    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    const input = editor(el);
    input.value = '42';
    keyOn(input, 'Enter');
    input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    await settle(el);

    expect(seen).to.have.lengthOf(1);
  });

  it('never mutates the rows array the caller passed in', async () => {
    const source = ROWS.map((r) => ({ ...r }));
    const el = mount('<arc-data-grid></arc-data-grid>');
    el.columns = COLS;
    el.rows = source;
    await settle(el);

    clickHeader(el, 1);
    await settle(el);
    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    editor(el).value = '999';
    keyOn(editor(el), 'Enter');
    await settle(el);

    // anti-vacuity: the edit really did land in the grid
    expect(columnText(el, 'score')).to.contain('999');
    expect(source).to.deep.equal(ROWS);
  });

  it('closes an open editor when rows are reassigned', async () => {
    const el = await grid();
    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    expect(editor(el)).to.not.equal(null);

    el.rows = ROWS.map((r) => ({ ...r }));
    await settle(el);
    expect(editor(el)).to.equal(null);
  });

  it('keeps grid keys from acting while the editor is open', async () => {
    const el = await grid();
    dblclick(cellsOf(bodyRows(el)[0])[1]);
    await settle(el);
    const before = [el._focusRow, el._focusCol];
    keyOn(editor(el), 'ArrowDown');
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal(before);
  });
});

describe('arc-data-grid keyboard (APG grid)', () => {
  it('exposes exactly one tab stop', async () => {
    const el = await grid({ selectable: true });
    const stops = [...el.shadowRoot.querySelectorAll('[tabindex="0"]')];
    expect(stops).to.have.lengthOf(1);
    expect(stops[0].dataset.row).to.equal('0');
    expect(stops[0].dataset.col).to.equal('0');
  });

  it('moves the tab stop with the arrow keys', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'ArrowDown');
    await settle(el);
    keyOn(cellAt(el, 1, 0), 'ArrowRight');
    await settle(el);

    const stops = [...el.shadowRoot.querySelectorAll('[tabindex="0"]')];
    expect(stops).to.have.lengthOf(1);
    expect([stops[0].dataset.row, stops[0].dataset.col]).to.deep.equal(['1', '1']);
    expect(el.shadowRoot.activeElement).to.equal(stops[0]);
  });

  it('clamps at every edge rather than wrapping', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'ArrowUp');
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([0, 0]);
    keyOn(cellAt(el, 0, 0), 'ArrowLeft');
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([0, 0]);

    for (let i = 0; i < 10; i++) {
      keyOn(cellAt(el, el._focusRow, el._focusCol), 'ArrowDown');
      await settle(el);
      keyOn(cellAt(el, el._focusRow, el._focusCol), 'ArrowRight');
      await settle(el);
    }
    expect([el._focusRow, el._focusCol]).to.deep.equal([ROWS.length, COLS.length - 1]);
  });

  it('Home and End move within the row, and with ctrl to the grid corners', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'ArrowDown');
    await settle(el);
    keyOn(cellAt(el, 1, 0), 'End');
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([1, COLS.length - 1]);

    keyOn(cellAt(el, 1, COLS.length - 1), 'Home');
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([1, 0]);

    keyOn(cellAt(el, 1, 0), 'End', { ctrlKey: true });
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([ROWS.length, COLS.length - 1]);

    keyOn(cellAt(el, ROWS.length, COLS.length - 1), 'Home', { ctrlKey: true });
    await settle(el);
    expect([el._focusRow, el._focusCol]).to.deep.equal([0, 0]);
  });

  it('sorts from the keyboard with Enter, and multi-sorts with Shift+Enter', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'Enter');
    await settle(el);
    expect(el.sort).to.deep.equal([{ key: 'name', direction: 'asc' }]);

    keyOn(cellAt(el, 0, 0), 'ArrowRight');
    await settle(el);
    keyOn(cellAt(el, 0, 1), 'Enter', { shiftKey: true });
    await settle(el);
    expect(el.sort).to.deep.equal([
      { key: 'name', direction: 'asc' },
      { key: 'score', direction: 'asc' },
    ]);
  });

  it('opens the editor with Enter on an editable cell', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'ArrowDown');
    await settle(el);
    keyOn(cellAt(el, 1, 0), 'ArrowRight');
    await settle(el);
    keyOn(cellAt(el, 1, 1), 'Enter');
    await settle(el);
    expect(el.shadowRoot.querySelector('.editor')).to.not.equal(null);
  });

  it('returns focus to the cell after the edit is committed', async () => {
    const el = await grid();
    keyOn(cellAt(el, 0, 0), 'ArrowDown');
    await settle(el);
    keyOn(cellAt(el, 1, 0), 'ArrowRight');
    await settle(el);
    keyOn(cellAt(el, 1, 1), 'Enter');
    await settle(el);

    const input = el.shadowRoot.querySelector('.editor');
    expect(input, 'editor should be open').to.not.equal(null);
    input.value = '5';
    keyOn(input, 'Enter');
    await settle(el);

    expect(el.shadowRoot.activeElement).to.equal(cellAt(el, 1, 1));
  });

  it('toggles the focused row with Space when selectable', async () => {
    const el = await grid({ selectable: true });
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.value));

    keyOn(cellAt(el, 0, 0), 'ArrowDown');
    await settle(el);
    keyOn(cellAt(el, 1, 0), ' ');
    await settle(el);

    expect(seen.at(-1)).to.deep.equal([0]);
  });

  it('selects all with Space on the header checkbox', async () => {
    const el = await grid({ selectable: true });
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.value));
    keyOn(cellAt(el, 0, 0), ' ');
    await settle(el);
    expect(seen.at(-1)).to.deep.equal([0, 1, 2, 3]);
  });

  it('ignores Space when the grid is not selectable', async () => {
    const el = await grid();
    const seen = [];
    el.addEventListener('arc-select', () => seen.push(1));
    keyOn(cellAt(el, 0, 0), ' ');
    await settle(el);
    expect(seen).to.have.lengthOf(0);
  });

  it('BUG: Space on a non-checkbox header selects every row', async () => {
    // Enter on the same cell sorts, because _activateCell checks `c === 0`
    // before treating the press as a selection toggle. The Space branch of
    // _onGridKeydown checks only `r === 0`, so Space anywhere in the header row
    // toggles all rows — including on a column that has nothing to do with
    // selection. See test-findings.md.
    const el = await grid({ selectable: true });
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail.value));

    keyOn(cellAt(el, 0, 0), 'ArrowRight');
    await settle(el);
    expect(el._focusCol).to.equal(1); // anti-vacuity: we really left the checkbox
    keyOn(cellAt(el, 0, 1), ' ');
    await settle(el);

    expect(seen.at(-1)).to.deep.equal([0, 1, 2, 3]);
  });

  it('leaves other keys to the browser', async () => {
    const el = await grid();
    const e = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    cellAt(el, 0, 0).dispatchEvent(e);
    await settle(el);
    expect(e.defaultPrevented).to.equal(false);
  });
});

describe('arc-data-grid virtualization', () => {
  const MANY = Array.from({ length: 200 }, (_, i) => ({ name: `row ${i}`, score: i, team: 'X' }));

  async function virtualGrid() {
    const el = mount(
      '<arc-data-grid virtual style="display:block; --grid-max-height: 200px"></arc-data-grid>',
    );
    el.columns = COLS;
    el.rows = MANY;
    await settle(el);
    return el;
  }

  it('renders a window of rows rather than all of them', async () => {
    const el = await virtualGrid();
    const rendered = bodyRows(el);
    expect(rendered.length).to.be.greaterThan(0);
    expect(rendered.length).to.be.lessThan(MANY.length);
  });

  it('renders every row when virtual is off', async () => {
    const el = await grid({ rows: MANY });
    expect(bodyRows(el)).to.have.lengthOf(MANY.length);
  });

  it('holds the scroll height with spacer rows', async () => {
    const el = await virtualGrid();
    const spacers = [...el.shadowRoot.querySelectorAll('tr.spacer')];
    expect(spacers.length).to.be.greaterThan(0);
    const total = spacers.reduce(
      (sum, tr) => sum + parseFloat(tr.querySelector('td').style.height),
      0,
    );
    const visible = bodyRows(el).length;
    expect(total).to.equal((MANY.length - visible) * el.rowHeight);
    expect(spacers.every((tr) => tr.getAttribute('aria-hidden') === 'true')).to.equal(true);
  });

  it('advances the window as the wrapper scrolls', async () => {
    const el = await virtualGrid();
    const first = () => bodyRows(el)[0]?.textContent.trim();
    const before = first();

    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    wrapper.scrollTop = 40 * 50;
    wrapper.dispatchEvent(new Event('scroll'));
    await until(() => first() !== before);
    await settle(el);

    expect(first()).to.not.equal(before);
    expect(el._startIndex).to.be.greaterThan(0);
  });

  it('gives every rendered row the declared height so the maths stays true', async () => {
    const el = await virtualGrid();
    expect(bodyRows(el)[0].style.height).to.equal('40px');
  });

  it('leaves row height unset when not virtual', async () => {
    const el = await grid();
    expect(bodyRows(el)[0].style.height).to.equal('');
  });

  it('scrolls a keyboard-focused row into view', async () => {
    const el = await virtualGrid();
    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    expect(wrapper.scrollTop).to.equal(0);

    keyOn(cellAt(el, 0, 0), 'End', { ctrlKey: true });
    await settle(el);
    await until(() => wrapper.scrollTop > 0);

    expect(wrapper.scrollTop).to.be.greaterThan(0);
    expect(el._focusRow).to.equal(MANY.length);
  });
});

describe('arc-data-grid horizontal scroll shadow', () => {
  const WIDE = Array.from({ length: 8 }, (_, i) => ({
    key: `c${i}`,
    label: `Column ${i}`,
    width: '200px',
    pinned: i === 0,
  }));

  it('marks the wrapper once scrolled away from the pinned edge', async () => {
    const el = mount('<arc-data-grid style="display:block; width: 300px"></arc-data-grid>');
    el.columns = WIDE;
    el.rows = [Object.fromEntries(WIDE.map((c) => [c.key, c.label]))];
    await settle(el);

    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    expect(wrapper.classList.contains('scrolled-x')).to.equal(false);

    wrapper.scrollLeft = 120;
    // anti-vacuity: if the table did not actually overflow, scrollLeft stays 0
    // and this test would pass against a component that never sets the class
    expect(Math.abs(wrapper.scrollLeft)).to.be.greaterThan(0);
    wrapper.dispatchEvent(new Event('scroll'));
    await until(() => wrapper.classList.contains('scrolled-x'));

    expect(wrapper.classList.contains('scrolled-x')).to.equal(true);
  });

  it('coalesces a burst of scroll events into one frame', async () => {
    const el = mount('<arc-data-grid style="display:block; width: 300px"></arc-data-grid>');
    el.columns = WIDE;
    el.rows = [Object.fromEntries(WIDE.map((c) => [c.key, c.label]))];
    await settle(el);

    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    wrapper.scrollLeft = 120;
    for (let i = 0; i < 5; i++) wrapper.dispatchEvent(new Event('scroll'));
    expect(el._rafId).to.not.equal(null);

    await nextFrame();
    await settle(el);
    expect(el._rafId).to.equal(null);
  });
});

describe('arc-data-grid teardown', () => {
  it('cancels a pending frame on disconnect', async () => {
    const el = await grid();
    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    wrapper.dispatchEvent(new Event('scroll'));
    expect(el._rafId).to.not.equal(null);

    el.remove();
    expect(el._rafId).to.equal(null);
  });

  it('stops responding to scroll once disconnected', async () => {
    const el = await grid();
    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    el.remove();

    wrapper.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(el._rafId).to.equal(null);
  });

  it('restores the scroll listener after reconnecting', async () => {
    // Was finding #54: firstUpdated bound the listener and disconnectedCallback
    // removed it, but firstUpdated only ever runs once, so a grid moved in the
    // DOM silently lost its pinned-column shadow and, when virtual, stopped
    // recalculating its window. Now bound by the subscriptions controller.
    const el = await grid();
    const wrapper = el.shadowRoot.querySelector('.grid-wrapper');
    el.remove();
    document.body.appendChild(el);
    await settle(el);

    wrapper.dispatchEvent(new Event('scroll'));
    expect(el._rafId).to.not.equal(null);
    await nextFrame();
    await tick();
  });
});
