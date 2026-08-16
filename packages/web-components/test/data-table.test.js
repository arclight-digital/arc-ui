/**
 * arc-data-table — declarative columns, client-side sort, selection, virtual rows.
 *
 * Fixture notes, both of which decide whether the tests can see anything:
 *
 *   - `name` ascending and `score` ascending disagree, so a sort assertion
 *     cannot pass by accident on an already-ordered column.
 *   - `score` has one `null`, because empties are documented to sort last in
 *     *both* directions — a rule that is invisible unless something is empty.
 *
 * The sort comparator decides numeric-vs-collator once per column rather than
 * per pair; its own comment says the per-pair version made mixed columns
 * non-transitive and engines reordered rows arbitrarily. `mixed` exists to pin
 * that: it holds numbers and numeric strings together.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, settle, until, record, only, nextFrame } from './helpers.js';

import '../src/data/data-table.register.js';
import '../src/content/column.register.js';

afterEach(() => cleanup());

const ROWS = [
  { name: 'Carol', score: 30, mixed: 10 },
  { name: 'Alice', score: 20, mixed: '9' },
  { name: 'Dave', score: null, mixed: 100 },
  { name: 'Bob', score: 10, mixed: '99' },
];

const COLUMNS = `
  <arc-column key="name" label="Name" sortable></arc-column>
  <arc-column key="score" label="Score" sortable></arc-column>
`;

async function table(attrs = '', { rows = ROWS, columns = COLUMNS } = {}) {
  const el = mount(`<arc-data-table ${attrs}>${columns}</arc-data-table>`);
  el.rows = rows;
  await settle(el);
  await until(() => el.shadowRoot.querySelectorAll('th').length > 0);
  await settle(el);
  return el;
}

const headers = (el) => [...el.shadowRoot.querySelectorAll('th')];
/** Header cells for real columns — the select-all `th` is not one. */
const dataHeaders = (el) => headers(el).filter((h) => !h.classList.contains('checkbox-cell'));
const bodyRows = (el) =>
  [...el.shadowRoot.querySelectorAll('tbody tr')].filter((r) => !r.classList.contains('spacer'));
const cellsOf = (row) => [...row.querySelectorAll('td')].map((c) => c.textContent.trim());
const columnText = (el, i) => bodyRows(el).map((r) => cellsOf(r)[i]);
const rowChecks = (el) =>
  [...el.shadowRoot.querySelectorAll('tbody input[type="checkbox"]')];
const selectAll = (el) => el.shadowRoot.querySelector('thead input[type="checkbox"]');

/** Click a data column's header the way a user does. */
async function clickHeader(el, index) {
  const th = dataHeaders(el)[index];
  (th.querySelector('.sort-button') ?? th).click();
  await settle(el);
}

describe('arc-data-table rendering', () => {
  it('renders a header per column', async () => {
    const el = await table();
    expect(dataHeaders(el).map((h) => h.textContent.trim().replace(/[↕↑↓]/g, '').trim())).to.eql([
      'Name',
      'Score',
    ]);
  });

  it('renders a row per datum, in source order by default', async () => {
    const el = await table();
    expect(columnText(el, 0)).to.eql(['Carol', 'Alice', 'Dave', 'Bob']);
  });

  it('renders only the declared columns', async () => {
    const el = await table('', {
      columns: '<arc-column key="name" label="Name"></arc-column>',
    });
    expect(cellsOf(bodyRows(el)[0])).to.eql(['Carol']);
  });

  it('renders an empty cell where the field is missing', async () => {
    const el = await table('', { rows: [{ name: 'Solo' }] });
    expect(cellsOf(bodyRows(el)[0])).to.eql(['Solo', '']);
  });

  it('shows the empty state with no rows', async () => {
    const el = await table('', { rows: [] });
    const cell = el.shadowRoot.querySelector('.empty-state');
    expect(cell.textContent.trim()).to.equal('No data available');
  });

  it('spans the empty state across every column', async () => {
    const el = await table('selectable', { rows: [] });
    // Two columns plus the checkbox column.
    expect(el.shadowRoot.querySelector('.empty-state').getAttribute('colspan')).to.equal('3');
  });

  it('applies a declared column width', async () => {
    const el = await table('', {
      columns:
        '<arc-column key="name" label="Name" width="120px"></arc-column><arc-column key="score" label="Score"></arc-column>',
    });
    expect(dataHeaders(el)[0].getAttribute('style')).to.contain('120px');
  });
});

describe('arc-data-table sorting', () => {
  it('does nothing without the table-level flag', async () => {
    const el = await table();
    await clickHeader(el, 0);
    expect(el.sortColumn, 'sorted without `sortable`').to.equal('');
    expect(columnText(el, 0)).to.eql(['Carol', 'Alice', 'Dave', 'Bob']);
  });

  it('does nothing for a column that is not itself sortable', async () => {
    const el = await table('sortable', {
      columns:
        '<arc-column key="name" label="Name"></arc-column><arc-column key="score" label="Score" sortable></arc-column>',
    });
    await clickHeader(el, 0);
    expect(el.sortColumn).to.equal('');
  });

  it('sorts ascending on the first click', async () => {
    const el = await table('sortable');
    await clickHeader(el, 0);
    expect(el.sortDirection).to.equal('asc');
    expect(columnText(el, 0)).to.eql(['Alice', 'Bob', 'Carol', 'Dave']);
  });

  it('reverses on a second click of the same column', async () => {
    const el = await table('sortable');
    await clickHeader(el, 0);
    await clickHeader(el, 0);
    expect(el.sortDirection).to.equal('desc');
    expect(columnText(el, 0)).to.eql(['Dave', 'Carol', 'Bob', 'Alice']);
  });

  it('restarts ascending when a different column is clicked', async () => {
    const el = await table('sortable');
    await clickHeader(el, 0);
    await clickHeader(el, 0); // now desc on name
    await clickHeader(el, 1);
    expect(el.sortColumn).to.equal('score');
    expect(el.sortDirection, 'kept the previous direction').to.equal('asc');
  });

  it('sorts numerically, not lexically', async () => {
    // 10 < 20 < 30; lexical order would be '10', '20', '30' here too, so the
    // check that matters is that 100 does not land between 10 and 20.
    const el = await table('sortable', {
      rows: [{ name: 'a', score: 100 }, { name: 'b', score: 20 }, { name: 'c', score: 3 }],
    });
    await clickHeader(el, 1);
    expect(columnText(el, 1)).to.eql(['3', '20', '100']);
  });

  it('sorts a mixed number/numeric-string column transitively', async () => {
    // The regression named in _sortedRows: deciding the comparison per *pair*
    // made this column non-transitive and the engine reordered rows arbitrarily.
    const el = await table('sortable', {
      columns:
        '<arc-column key="name" label="Name"></arc-column><arc-column key="mixed" label="Mixed" sortable></arc-column>',
    });
    await clickHeader(el, 1);
    expect(columnText(el, 1)).to.eql(['9', '10', '99', '100']);
  });

  it('puts empties last ascending', async () => {
    const el = await table('sortable');
    await clickHeader(el, 1);
    expect(columnText(el, 0)).to.eql(['Bob', 'Alice', 'Carol', 'Dave']);
  });

  it('puts empties last descending too', async () => {
    // The half that a naive `-cmp` gets wrong: reversing the comparator would
    // float the empty row to the top.
    const el = await table('sortable');
    await clickHeader(el, 1);
    await clickHeader(el, 1);
    expect(columnText(el, 0)).to.eql(['Carol', 'Alice', 'Bob', 'Dave']);
  });

  it('keeps equal rows in their original order', async () => {
    const el = await table('sortable', {
      rows: [
        { name: 'Blue', score: 1 },
        { name: 'Red', score: 1 },
        { name: 'Green', score: 0 },
      ],
    });
    await clickHeader(el, 1);
    expect(columnText(el, 0)).to.eql(['Green', 'Blue', 'Red']);
  });

  it('honours a pre-set sort column from markup', async () => {
    const el = await table('sortable sort-column="name" sort-direction="desc"');
    expect(columnText(el, 0)).to.eql(['Dave', 'Carol', 'Bob', 'Alice']);
  });

  it('emits arc-sort with the column and direction', async () => {
    const el = await table('sortable');
    const seen = [];
    el.addEventListener('arc-sort', (e) => seen.push(e.detail));
    await clickHeader(el, 0);
    await clickHeader(el, 0);
    expect(seen).to.eql([
      { column: 'name', direction: 'asc' },
      { column: 'name', direction: 'desc' },
    ]);
  });

  it('announces the sort on the header', async () => {
    const el = await table('sortable');
    expect(dataHeaders(el).map((h) => h.getAttribute('aria-sort'))).to.eql(['none', 'none']);
    await clickHeader(el, 0);
    expect(dataHeaders(el).map((h) => h.getAttribute('aria-sort'))).to.eql(['ascending', 'none']);
    await clickHeader(el, 0);
    expect(dataHeaders(el)[0].getAttribute('aria-sort')).to.equal('descending');
  });

  it('puts a real button in the header so it is reachable by keyboard', async () => {
    const el = await table('sortable');
    expect(dataHeaders(el)[0].querySelector('.sort-button')).to.not.equal(null);
  });

  it('leaves an unsortable column without a button', async () => {
    const el = await table('sortable', {
      columns: '<arc-column key="name" label="Name"></arc-column>',
    });
    expect(dataHeaders(el)[0].querySelector('.sort-button') === null).to.equal(true);
  });
});

describe('arc-data-table selection', () => {
  it('adds no checkboxes unless selectable', async () => {
    const el = await table();
    expect(rowChecks(el).length).to.equal(0);
    expect(selectAll(el) === null).to.equal(true);
  });

  it('adds a checkbox per row plus a select-all', async () => {
    const el = await table('selectable');
    expect(rowChecks(el).length).to.equal(4);
    expect(selectAll(el)).to.not.equal(null);
  });

  it('labels each row checkbox', async () => {
    const el = await table('selectable');
    expect(rowChecks(el)[0].getAttribute('aria-label')).to.equal('Select row 1');
    expect(selectAll(el).getAttribute('aria-label')).to.equal('Select all rows');
  });

  it('marks the row when checked', async () => {
    const el = await table('selectable');
    rowChecks(el)[1].click();
    await settle(el);
    expect(bodyRows(el)[1].classList.contains('selected')).to.equal(true);
    expect(bodyRows(el)[0].classList.contains('selected')).to.equal(false);
  });

  it('emits arc-select with the selected rows, in rows order', async () => {
    const el = await table('selectable');
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));

    rowChecks(el)[2].click();
    await settle(el);
    rowChecks(el)[0].click();
    await settle(el);

    // Picked in the order 2 then 0, reported in `rows` order — the one ordering
    // that survives a sort (finding #63).
    expect(seen.at(-1).value, 'not in rows order').to.eql([ROWS[0], ROWS[2]]);
    expect(seen.at(-1).selected).to.equal(true);
    expect(seen.at(-1).index).to.equal(0);
    expect(seen.at(-1).row).to.equal(ROWS[0]);
  });

  it('reports the rows themselves, not copies', async () => {
    // Identity is the whole mechanism now: a consumer has to be able to match
    // what it gets back against the objects it passed in.
    const el = await table('selectable');
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));
    rowChecks(el)[1].click();
    await settle(el);
    expect(seen.at(-1).value[0] === ROWS[1], 'a copy came back').to.equal(true);
  });

  it('reports a deselection', async () => {
    const el = await table('selectable');
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));
    rowChecks(el)[0].click();
    await settle(el);
    rowChecks(el)[0].click();
    await settle(el);
    expect(seen.at(-1).selected).to.equal(false);
    expect(seen.at(-1).value).to.eql([]);
  });

  it('select-all checks every row and marks the event', async () => {
    const el = await table('selectable');
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));

    selectAll(el).click();
    await settle(el);

    expect(seen.at(-1).all, 'header toggles are not marked').to.equal(true);
    expect(seen.at(-1).value).to.eql(ROWS);
    expect(rowChecks(el).every((c) => c.checked)).to.equal(true);
  });

  it('select-all clears everything when unchecked', async () => {
    const el = await table('selectable');
    selectAll(el).click();
    await settle(el);
    selectAll(el).click();
    await settle(el);
    expect(rowChecks(el).some((c) => c.checked)).to.equal(false);
  });

  it('checks the header box once every row is individually selected', async () => {
    const el = await table('selectable');
    for (const box of rowChecks(el)) {
      box.click();
      await settle(el);
    }
    expect(selectAll(el).checked).to.equal(true);
  });

  it('leaves the header box unchecked with no rows at all', async () => {
    // _allSelected guards on rows.length, or an empty table reads as fully
    // selected — every one of its zero rows is selected.
    const el = await table('selectable', { rows: [] });
    expect(selectAll(el).checked).to.equal(false);
  });
});

describe('arc-data-table selection across a sort', () => {
  /**
   * Finding #63, fixed. Selection used to be stored as a positional index into
   * the *rendered* order, and sorting re-rendered in a different order without
   * touching the set — so the highlight, and the `value` reported to consumers,
   * silently came to mean a different row than the one the user picked. It is
   * now keyed by row identity.
   */
  it('the highlight follows the row, not the position', async () => {
    const el = await table('selectable sortable');

    rowChecks(el)[0].click(); // Carol, at position 0
    await settle(el);
    expect(cellsOf(bodyRows(el)[0])[1], 'picked the wrong row to start').to.equal('Carol');

    await clickHeader(el, 0); // sort by name: Alice, Bob, Carol, Dave

    const selected = bodyRows(el).filter((r) => r.classList.contains('selected'));
    expect(selected.length).to.equal(1);
    expect(cellsOf(selected[0])[1], 'the selection moved to another row').to.equal('Carol');
  });

  it('reports the same rows after a sort as before it', async () => {
    const el = await table('selectable sortable');
    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));

    rowChecks(el)[0].click();
    await settle(el);
    const before = seen.at(-1).value;

    await clickHeader(el, 0);
    rowChecks(el)[3].click(); // Dave, last under a name sort
    await settle(el);

    expect(before).to.eql([ROWS[0]]);
    expect(seen.at(-1).value, 'sorting changed what was selected').to.eql([ROWS[0], ROWS[2]]);
  });

  it('select-all survives a sort', async () => {
    const el = await table('selectable sortable');
    selectAll(el).click();
    await settle(el);
    await clickHeader(el, 0);
    expect(bodyRows(el).every((r) => r.classList.contains('selected'))).to.equal(true);
    expect(selectAll(el).checked).to.equal(true);
  });

  it('forgets rows that are no longer in the data', async () => {
    // Identity-keyed selection would otherwise hold the old objects alive and
    // report them in every later arc-select.
    const el = await table('selectable');
    rowChecks(el)[0].click();
    await settle(el);

    el.rows = [{ name: 'Fresh', score: 1 }];
    await settle(el);

    const seen = [];
    el.addEventListener('arc-select', (e) => seen.push(e.detail));
    rowChecks(el)[0].click();
    await settle(el);
    expect(seen.at(-1).value.length, 'a stale row came back').to.equal(1);
    expect(seen.at(-1).value[0].name).to.equal('Fresh');
  });
});

describe('arc-data-table virtual scrolling', () => {
  const MANY = Array.from({ length: 500 }, (_, i) => ({ name: `Row ${i}`, score: i }));

  it('renders every row when not virtual', async () => {
    const el = await table('', { rows: MANY.slice(0, 60) });
    expect(bodyRows(el).length).to.equal(60);
  });

  it('renders a window rather than the whole set', async () => {
    const el = await table('virtual row-height="40"', { rows: MANY });
    await until(() => bodyRows(el).length > 0);
    expect(bodyRows(el).length, 'rendered everything').to.be.lessThan(MANY.length);
    expect(bodyRows(el).length, 'rendered nothing').to.be.greaterThan(0);
  });

  it('pads with spacer rows so the scrollbar reflects the full set', async () => {
    const el = await table('virtual row-height="40"', { rows: MANY });
    await until(() => bodyRows(el).length > 0);
    const spacers = [...el.shadowRoot.querySelectorAll('tbody tr.spacer')];
    expect(spacers.length, 'no spacer to stand in for the unrendered rows').to.be.greaterThan(0);
  });

  it('moves the window when the wrapper scrolls', async () => {
    const el = await table('virtual row-height="40"', { rows: MANY });
    await until(() => bodyRows(el).length > 0);
    const firstBefore = cellsOf(bodyRows(el)[0])[0];

    const wrapper = el.shadowRoot.querySelector('.table-wrapper');
    wrapper.scrollTop = 4000;
    wrapper.dispatchEvent(new Event('scroll'));

    expect(
      await until(() => cellsOf(bodyRows(el)[0])[0] !== firstBefore),
      'the window did not move',
    ).to.equal(true);
  });

  it('drops back to rendering everything when virtual is turned off', async () => {
    const el = await table('virtual row-height="40"', { rows: MANY.slice(0, 30) });
    await until(() => bodyRows(el).length > 0);
    el.virtual = false;
    await settle(el);
    expect(bodyRows(el).length).to.equal(30);
  });

  it('shows the empty state rather than a window of nothing', async () => {
    const el = await table('virtual row-height="40"', { rows: [] });
    expect(el.shadowRoot.querySelector('.empty-state')).to.not.equal(null);
  });

  /**
   * Finding #64, fixed — it was finding #55 again, in the one component the
   * original sweep missed.
   *
   * The scroll listener was attached in `firstUpdated` and removed in
   * `disconnectedCallback`. Those lifecycles do not pair: the first runs once
   * per *element*, the second once per *connection*, so the first reparenting
   * unsubscribed it permanently and a virtual table went on rendering the window
   * it happened to be showing while the user scrolled past it.
   *
   * Now on `listen()` from src/shared/subscriptions.js, which arc-data-grid was
   * already using. This file was missed because reconnect-sweep.test.js carries
   * a hand-written list; `scripts/checks/lifecycle-pairing.js` is the guard that
   * does not.
   */
  it('still responds to scroll after being reparented', async () => {
    const el = await table('virtual row-height="40"', { rows: MANY });
    await until(() => bodyRows(el).length > 0);

    const parent = el.parentElement;
    el.remove();
    await nextFrame();
    parent.appendChild(el);
    await settle(el);

    const firstBefore = cellsOf(bodyRows(el)[0])[0];
    const wrapper = el.shadowRoot.querySelector('.table-wrapper');
    wrapper.scrollTop = 4000;
    wrapper.dispatchEvent(new Event('scroll'));

    expect(
      await until(() => cellsOf(bodyRows(el)[0])[0] !== firstBefore),
      'the window did not move after a reconnect',
    ).to.equal(true);
  });
});

describe('arc-data-table reacting to input', () => {
  it('re-renders when rows are replaced', async () => {
    const el = await table();
    el.rows = [{ name: 'Zoe', score: 1 }];
    await settle(el);
    expect(columnText(el, 0)).to.eql(['Zoe']);
  });

  it('keeps the sort when rows are replaced', async () => {
    const el = await table('sortable');
    await clickHeader(el, 0);
    el.rows = [
      { name: 'Zoe', score: 1 },
      { name: 'Ann', score: 2 },
    ];
    await settle(el);
    expect(columnText(el, 0)).to.eql(['Ann', 'Zoe']);
  });

  it('picks up a column added later', async () => {
    const el = await table();
    const col = document.createElement('arc-column');
    col.key = 'score';
    col.label = 'Extra';
    el.appendChild(col);
    await until(() => dataHeaders(el).length === 3);
    await settle(el);
    expect(dataHeaders(el).length).to.equal(3);
  });
});

// ---------------------------------------------------------------------------
// Gaps found by mutation testing (48.15% — the lowest of the five sampled)
// ---------------------------------------------------------------------------

/**
 * These were written against surviving mutants rather than against the docs,
 * which is the point of running the tool: 47 hand-written tests were already
 * here and none of them pinned any of this.
 *
 * The uncomfortable half is that two of the survivors are in the selection
 * pruning added earlier in this same audit (findings #63/#64). The feature was
 * tested; its *guards* were not, so `!changed.has('rows')` and
 * `kept.size !== size` could both be inverted with every existing test still
 * green.
 */
describe('sort mode is decided per column, not per pair', () => {
  const nameCell = (el) => bodyRows(el).map((r) => cellsOf(r)[0]);
  // Two things the first version of these tests got wrong, both of which made
  // sorting look broken when it was not: the click target is the `.sort-button`
  // inside the header rather than the `th`, and `_handleSort` also requires the
  // *table* to be `sortable` — a per-column `sortable` is only half the guard.
  const sortBy = async (el, label) => {
    const th = dataHeaders(el).find((h) => h.textContent.includes(label));
    (th.querySelector('.sort-button') ?? th).click();
    await settle(el);
  };

  it('sorts a mixed number/numeric-string column numerically', async () => {
    // `mixed` holds 10, '9', 100, '99'. Compared as text that is 10 < 100 < 9,
    // which is why the mode is decided once for the whole column.
    const el = await table('sortable', {
      columns: `<arc-column key="mixed" label="Mixed" sortable></arc-column>`,
    });
    await sortBy(el, 'Mixed');
    expect(bodyRows(el).map((r) => cellsOf(r)[0])).to.eql(['9', '10', '99', '100']);
  });

  it('treats a column with blanks as still numeric', async () => {
    // `null` and '' must not force the column into text mode — they are
    // absences, not values, and they sort last either way.
    const el = await table('sortable');
    await sortBy(el, 'Score');
    expect(nameCell(el)).to.eql(['Bob', 'Alice', 'Carol', 'Dave']);
  });

  it('falls back to text ordering when any value is not a number', async () => {
    const rows = [{ v: '10' }, { v: 'apple' }, { v: '9' }];
    const el = await table('sortable', {
      rows,
      columns: `<arc-column key="v" label="V" sortable></arc-column>`,
    });
    await sortBy(el, 'V');
    // Intl.Collator with numeric: true still orders 9 before 10 inside text mode;
    // what matters is that a non-numeric value no longer becomes NaN.
    expect(bodyRows(el).map((r) => cellsOf(r)[0])).to.eql(['9', '10', 'apple']);
  });

  it('keeps empty values last in both directions', async () => {
    const el = await table('sortable');
    await sortBy(el, 'Score');
    expect(nameCell(el).at(-1), 'ascending').to.equal('Dave');
    await sortBy(el, 'Score');
    expect(nameCell(el).at(-1), 'descending').to.equal('Dave');
  });
});

describe('sorting is refused where it was not offered', () => {
  it('ignores a click on a column that is not sortable', async () => {
    const el = await table('sortable', {
      columns: `<arc-column key="name" label="Name"></arc-column>`,
    });
    const th = dataHeaders(el)[0];
    expect(th.querySelector('.sort-button'), 'an unsortable column got a button').to.equal(null);
    th.click();
    await settle(el);
    expect(el.sortColumn, 'a non-sortable column started sorting').to.not.equal('name');
  });

  it('starts a new column ascending rather than inheriting the last direction', async () => {
    const el = await table('sortable');
    const click = (label) => {
      const th = dataHeaders(el).find((h) => h.textContent.includes(label));
      (th.querySelector('.sort-button') ?? th).click();
      return settle(el);
    };
    await click('Score');
    await click('Score');
    expect(el.sortDirection, 'second click on the same column toggles').to.equal('desc');

    await click('Name');
    expect(el.sortColumn).to.equal('name');
    expect(el.sortDirection, 'a different column must restart ascending').to.equal('asc');
  });
});

describe('selection pruning guards', () => {
  const checkboxes = (el) =>
    [...el.shadowRoot.querySelectorAll('tbody input[type="checkbox"]')];

  /** How many rows are checked, which is the selection as anyone can see it. */
  const selectedCount = (el) => checkboxes(el).filter((c) => c.checked).length;

  it('leaves the selection alone when a row object survives a rows reassignment', async () => {
    // The `kept.size !== size` guard: if the set is unchanged it must not be
    // replaced, or every rows update churns identity and re-fires selection.
    // Asserted as the churn itself — a spurious `arc-select` — rather than as
    // Set identity, which is the mechanism and not the promise.
    const el = await table('selectable');
    checkboxes(el)[0].click();
    await settle(el);

    const seen = record(el, ['arc-select']);
    el.rows = [...ROWS]; // same objects, new array
    await settle(el);

    expect(seen, 'nothing changed, so nothing should be announced').to.deep.equal([]);
    expect(selectedCount(el), 'and the row is still selected').to.equal(1);
  });

  it('drops a selected row that is no longer present', async () => {
    const el = await table('selectable');
    checkboxes(el)[0].click();
    await settle(el);
    expect(selectedCount(el)).to.equal(1);

    el.rows = ROWS.slice(1); // Carol removed
    await settle(el);
    expect(selectedCount(el), 'a removed row stayed selected').to.equal(0);
  });

  it('does no work when nothing is selected', async () => {
    // The `size === 0` early return, asserted the same way: an empty selection
    // crossing a rows change must stay silent and stay empty.
    const el = await table('selectable');
    const seen = record(el, ['arc-select']);

    el.rows = ROWS.slice(1);
    await settle(el);

    expect(seen).to.deep.equal([]);
    expect(selectedCount(el)).to.equal(0);
  });
});
