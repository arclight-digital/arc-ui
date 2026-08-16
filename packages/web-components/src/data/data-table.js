import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import { DeclaredPropsMixin, flag, oneOf, num, list, int } from '../shared/props.js';
import { VirtualController } from '../shared/virtual-controller.js';
import { listen } from '../shared/subscriptions.js';

/**
 * @deprecated Since v4.0.0 — use `<arc-data-grid>`. One column model for the whole family: the slotted `<arc-column>` children become a `columns` array of the same fields. Sorting becomes the multi-sort `sort` array (a single entry behaves as `sort-column`/`sort-direction` did), and selection, virtual scrolling and `overscan` are unchanged. Removed in v5.
 *
 * A data-driven table component that renders rows from a JavaScript array. Declarative column
 * definitions via `arc-column` children control which fields appear, their headers, widths, and
 * sort behavior. Built-in support for column sorting, row selection with checkboxes, and an
 * empty-state fallback.
 *
 * @tag arc-data-table
 * @status deprecated
 * @arc-merged-into arc-data-grid
 * @requires arc-column
 * @prop {Array<Record<string, any>>} rows - The data array that drives the table. Each object in the array becomes a row, and its keys are matched against the `key` attribute of each `arc-column` child. Set as a property, or as a JSON attribute for a table that is static. Changing this array triggers a re-render.
 * @prop {boolean} sortable - Enables the sorting system at the table level. When true, columns that also have their own `sortable` attribute become clickable, toggling between ascending and descending order. The table performs client-side sorting by default and emits an `arc-sort` event with the active column key and direction.
 * @prop {boolean} selectable - Adds a checkbox column to the left of the table for row selection. A "select all" checkbox appears in the header. Selected rows receive a visual highlight. The component emits `arc-select` with the current selection (detail.value) when any row or the header checkbox is toggled; detail.all marks header toggles.
 * @prop {string} sortColumn - The `key` of the currently sorted column. Set this attribute to pre-sort the table on a specific column when it first renders. Updated automatically when the user clicks a sortable column header.
 * @prop {'asc' | 'desc'} sortDirection - The current sort direction. Works in tandem with `sort-column` to control the initial sort state. Reflected as an attribute so it can be read from the DOM or targeted with CSS selectors.
 * @prop {boolean} virtual - Enables virtual scrolling for large datasets. When true, only the visible rows plus an overscan buffer are rendered in the DOM, keeping performance constant regardless of row count.
 * @prop {number} rowHeight - Height in pixels of each row when virtual scrolling is enabled. Must match the actual rendered row height for correct scroll calculations.
 * @prop {number} overscan - Rows rendered above and below the visible window when `virtual` is on, to cover fast scrolling. Raising it trades DOM nodes for fewer blank rows on a fling; lowering it does the reverse. Never negative.
 * @fires {CustomEvent<{ column: string, direction: 'asc' | 'desc' }>} arc-sort - Fired when a sortable column header is clicked
 * @fires arc-select - Fired when row selection changes. detail: { value, selected, row, index } — `value` is the selected row objects themselves, in `rows` order, so it stays correct across sorting; `row` is the one toggled, `index` its position in `rows`, and `all` is true for header select-all toggles.
 * @slot - Default content.
 * @csspart row
 * @csspart cell
 * @csspart wrapper
 * @csspart table
 * @csspart head
 * @csspart body
 */
export class ArcDataTable extends DeclaredPropsMixin(LitElement) {
  static properties = {
    rows: list(),
    sortable: flag(false),
    selectable: flag(false),
    sortColumn: { type: String, attribute: 'sort-column' },
    sortDirection: oneOf(['asc', 'desc'], { attribute: 'sort-direction' }),
    virtual: flag(false),
    rowHeight: num({ default: 40, min: 1, clamp: 'toRange', attribute: 'row-height' }),
    // Public since 4.2. It was a public prop on arc-virtual-list and a hardcoded
    // 5 here, which is the kind of divergence that survives precisely because
    // the two copies of the arithmetic never met. V4-PLAN 4.2 requires it on
    // the merged grid; arc-data-table gets it for free from the same change.
    overscan: int({ default: 5, min: 0, clamp: 'toRange' }),
    _columns: { state: true },
    _selectedRows: { state: true },
    _startIndex: { state: true },
    _visibleCount: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }

      .table-wrapper {
        overflow-x: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      :host([virtual]) .table-wrapper {
        overflow-y: auto;
        max-height: var(--table-max-height, 600px);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--_text-sm);
        color: var(--text-primary);
      }

      thead {
        background: var(--surface-overlay);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      th {
        text-align: start;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
        user-select: none;
      }

      th.sortable {
        padding: 0;
        cursor: pointer;
        transition: color var(--transition-fast);
      }

      th.sortable:hover {
        color: var(--text-primary);
      }

      .sort-button {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font: inherit;
        letter-spacing: inherit;
        text-transform: inherit;
        white-space: inherit;
        color: inherit;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: var(--radius-sm);
      }

      .sort-button:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      th.sorted {
        color: var(--interactive);
      }

      /* Fixed-width slot so the glyph swap (↕ → ↑/↓) can't shift column widths */
      .sort-indicator {
        display: inline-block;
        width: 1em;
        text-align: center;
        font-size: var(--_text-xs);
        opacity: 0.5;
        transition: opacity var(--transition-fast);
      }

      th.sorted .sort-indicator,
      th.sortable:hover .sort-indicator {
        opacity: 1;
      }

      td {
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      tr:last-child td {
        border-bottom: none;
      }

      tbody tr:nth-child(odd) {
        background: var(--surface-primary);
      }

      tbody tr:nth-child(even) {
        background: var(--surface-raised);
      }

      tbody tr:hover {
        background: var(--surface-overlay);
      }

      tbody tr.selected {
        background: rgba(var(--interactive-rgb), 0.08);
      }

      .checkbox-cell {
        width: 40px;
        text-align: center;
      }

      input[type="checkbox"] {
        appearance: none;
        width: 16px;
        height: 16px;
        border: 1px solid var(--border-bright);
        border-radius: var(--radius-sm);
        background: var(--surface-raised);
        cursor: pointer;
        position: relative;
        vertical-align: middle;
        transition: border-color var(--transition-fast), background var(--transition-fast);
      }

      input[type="checkbox"]:hover {
        box-shadow: var(--glow-xs);
      }

      input[type="checkbox"]:checked {
        background: var(--interactive);
        border-color: var(--interactive);
      }

      input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        top: 2px;
        inset-inline-start: 5px;
        width: 4px;
        height: 8px;
        border: solid var(--text-primary);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input[type="checkbox"]:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .empty-state {
        padding: var(--space-xl);
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      }

      /* Virtual spacer rows */
      .spacer td { padding: 0; border: none; background: none; }

      .data-table__slot-host { display: none; }
    `,
  ];

  constructor() {
    super();
    this.sortColumn = '';
    this._columns = [];
    this._selectedRows = new Set();
        this._window = new VirtualController(this, {
      // Null until the first render, which is the case the controller is
      // written to tolerate — a scroll cannot happen before there is something
      // to scroll, and `measure()` is a no-op until there is.
      getViewport: () => this.shadowRoot?.querySelector('.table-wrapper'),
      getTotal: () => this._sortedRows.length,
      getRowHeight: () => this.rowHeight,
      getOverscan: () => this.overscan,
    });
    this._startIndex = 0;
    this._visibleCount = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
    // Finding #64 (a recurrence of #55). This used to attach in `firstUpdated`
    // and detach in `disconnectedCallback`, which do not pair — the first runs
    // once per *element*, the second once per *connection* — so the first
    // reparenting killed virtual scrolling silently. The controller subscribes
    // per connection and re-binds if the wrapper is re-rendered.
    listen(this, '.table-wrapper', 'scroll', this._onScroll, { passive: true });
  }

  _onSlotChange(e) {
    this._columns = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === 'ARC-COLUMN');
  }

  firstUpdated() {
    hydrateSlots(this);
    if (this.virtual) this._recalcVirtual();
  }

  updated(changed) {
    super.updated(changed);
    if ((changed.has('virtual') || changed.has('rows')) && this.virtual) {
      this._recalcVirtual();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // The listener is the controller's to manage; this only drops the pending
    // frame so a queued recalc cannot land on a detached element.
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._recalcVirtual();
    });
  }

  /**
   * The window is `VirtualController`'s since 4.2. This file used to carry its
   * own copy of the arithmetic, and so did arc-data-grid and arc-virtual-list.
   * The copy here was the one missing the zero-clamp on the count.
   */
  _recalcVirtual() {
    this._window.measure();
    this._startIndex = this._window.start;
    this._visibleCount = this._window.count;
  }

  _handleSort(column) {
    if (!this.sortable || !column.sortable) return;

    if (this.sortColumn === column.fieldName) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.fieldName;
      this.sortDirection = 'asc';
    }

    this.dispatchEvent(
      new CustomEvent('arc-sort', {
        detail: { column: this.sortColumn, direction: this.sortDirection },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleSelectAll(e) {
    const checked = e.target.checked;
    this._selectedRows = checked ? new Set(this.rows) : new Set();

    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: {
          value: this._selectionInRowOrder(),
          selected: checked,
          all: true,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _handleRowSelect(e, row) {
    const checked = e.target.checked;
    const next = new Set(this._selectedRows);

    if (checked) next.add(row);
    else next.delete(row);

    this._selectedRows = next;

    this.dispatchEvent(
      new CustomEvent('arc-select', {
        detail: {
          value: this._selectionInRowOrder(),
          selected: checked,
          row,
          index: this.rows.indexOf(row),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  get _sortedRows() {
    if (!this.sortColumn) return this.rows;
    const key = this.sortColumn;

    // Decide the comparison mode once for the whole column. Deciding per
    // pair (old behavior) made mixed number/"number" columns non-transitive,
    // so engines reordered rows arbitrarily on every sort.
    const numeric = this.rows.every((r) => {
      const v = r[key];
      return (
        v == null ||
        v === '' ||
        (typeof v === 'number' ? Number.isFinite(v) : !Number.isNaN(Number(v)))
      );
    });
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    return this.rows
      .map((row, i) => ({ row, i }))
      .sort((a, b) => {
        const aVal = a.row[key];
        const bVal = b.row[key];
        const aEmpty = aVal == null || aVal === '';
        const bEmpty = bVal == null || bVal === '';

        // Empty values always sort last, in original order, either direction
        if (aEmpty && bEmpty) return a.i - b.i;
        if (aEmpty) return 1;
        if (bEmpty) return -1;

        let cmp = numeric
          ? Number(aVal) - Number(bVal)
          : collator.compare(String(aVal), String(bVal));
        if (this.sortDirection === 'desc') cmp = -cmp;
        return cmp || a.i - b.i; // original-order tiebreak keeps equal rows stable
      })
      .map((entry) => entry.row);
  }

  get _allSelected() {
    return this.rows.length > 0 && this.rows.every((row) => this._selectedRows.has(row));
  }

  /**
   * The selection as row references, in `rows` order.
   *
   * `rows` order rather than selection order or rendered order: it is the one
   * ordering that does not change when the user sorts, which is the whole point
   * of finding #63.
   */
  _selectionInRowOrder() {
    return this.rows.filter((row) => this._selectedRows.has(row));
  }

  /**
   * Drop selections whose rows are gone.
   *
   * Selection is held by object identity, so a replaced `rows` array would
   * otherwise pin the old objects alive in the set forever and report them in
   * every subsequent `arc-select`.
   */
  willUpdate(changed) {
    super.willUpdate(changed);
    if (!changed.has('rows') || this._selectedRows.size === 0) return;
    const live = new Set(this.rows);
    const kept = new Set([...this._selectedRows].filter((row) => live.has(row)));
    if (kept.size !== this._selectedRows.size) this._selectedRows = kept;
  }

  _renderSortIndicator(column) {
    if (!this.sortable || !column.sortable) return '';
    if (this.sortColumn !== column.fieldName) {
      return html`<span class="sort-indicator" aria-hidden="true">\u2195</span>`;
    }
    return html`<span class="sort-indicator" aria-hidden="true">${this.sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>`;
  }

  _renderRows(rows) {
    if (rows.length === 0) {
      return html`
        <tr>
          <td class="empty-state" colspan=${this._columns.length + (this.selectable ? 1 : 0)}>
            No data available
          </td>
        </tr>
      `;
    }

    if (this.virtual) {
      const total = rows.length;
      const colCount = this._columns.length + (this.selectable ? 1 : 0);
      const topHeight = this._startIndex * this.rowHeight;
      const endIndex = this._startIndex + this._visibleCount;
      const bottomHeight = (total - endIndex) * this.rowHeight;
      const visibleRows = rows.slice(this._startIndex, endIndex);

      return html`
        ${topHeight > 0 ? html`<tr class="spacer"><td colspan=${colCount} style="height:${topHeight}px"></td></tr>` : ''}
        ${visibleRows.map((row, i) => this._renderRow(row, this._startIndex + i))}
        ${bottomHeight > 0 ? html`<tr class="spacer"><td colspan=${colCount} style="height:${bottomHeight}px"></td></tr>` : ''}
      `;
    }

    return rows.map((row, i) => this._renderRow(row, i));
  }

  _renderRow(row, i) {
    return html`
      <tr class="${this._selectedRows.has(row) ? 'selected' : ''}" part="row">
        ${
          this.selectable
            ? html`
          <td class="checkbox-cell">
            <input
              type="checkbox"
              aria-label="Select row ${i + 1}"
              .checked=${this._selectedRows.has(row)}
              @change=${(e) => this._handleRowSelect(e, row)}
            />
          </td>
        `
            : ''
        }
        ${this._columns.map(
          (col) => html`
          <td part="cell">${row[col.fieldName] ?? ''}</td>
        `,
        )}
      </tr>
    `;
  }

  render() {
    const rows = this._sortedRows;

    return html`
      <div class="data-table__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="table-wrapper" part="wrapper" role="region" aria-label="Data table">
        <table part="table">
          <thead part="head">
            <tr>
              ${
                this.selectable
                  ? html`
                <th class="checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    .checked=${this._allSelected}
                    @change=${this._handleSelectAll}
                  />
                </th>
              `
                  : ''
              }
              ${this._columns.map(
                (col) => html`
                <th
                  class="${this.sortable && col.sortable ? 'sortable' : ''} ${this.sortColumn === col.fieldName ? 'sorted' : ''}"
                  style="${col.width ? `width: ${col.width}` : ''}"
                  aria-sort=${this.sortColumn === col.fieldName ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  ${
                    this.sortable && col.sortable
                      ? html`
                    <button class="sort-button" @click=${() => this._handleSort(col)}>
                      ${col.label}${this._renderSortIndicator(col)}
                    </button>
                  `
                      : html`${col.label}${this._renderSortIndicator(col)}`
                  }
                </th>
              `,
              )}
            </tr>
          </thead>
          <tbody part="body">
            ${this._renderRows(rows)}
          </tbody>
        </table>
      </div>
    `;
  }
}
