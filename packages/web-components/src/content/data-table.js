import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-data-table
 * @requires arc-column
 */
export class ArcDataTable extends LitElement {
  static properties = {
    rows:          { type: Array },
    sortable:      { type: Boolean, reflect: true },
    selectable:    { type: Boolean, reflect: true },
    sortColumn:    { type: String, attribute: 'sort-column' },
    sortDirection: { type: String, reflect: true, attribute: 'sort-direction' },
    virtual:       { type: Boolean, reflect: true },
    rowHeight:     { type: Number, attribute: 'row-height' },
    _columns:      { state: true },
    _selectedRows: { state: true },
    _startIndex:   { state: true },
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
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      thead {
        background: var(--bg-elevated);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      th {
        text-align: left;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
        user-select: none;
      }

      th.sortable {
        cursor: pointer;
        transition: color var(--transition-fast);
      }

      th.sortable:hover {
        color: var(--text-primary);
      }

      th.sorted {
        color: var(--accent-primary);
      }

      .sort-indicator {
        display: inline-block;
        margin-left: var(--space-xs);
        font-size: var(--text-xs);
        vertical-align: middle;
      }

      td {
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      tr:last-child td {
        border-bottom: none;
      }

      tbody tr:nth-child(odd) {
        background: var(--bg-surface);
      }

      tbody tr:nth-child(even) {
        background: var(--bg-card);
      }

      tbody tr:hover {
        background: var(--bg-elevated);
      }

      tbody tr.selected {
        background: rgba(var(--accent-primary-rgb), 0.08);
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
        background: var(--bg-card);
        cursor: pointer;
        position: relative;
        vertical-align: middle;
        transition: border-color var(--transition-fast), background var(--transition-fast);
      }

      input[type="checkbox"]:hover {
        border-color: var(--accent-primary);
      }

      input[type="checkbox"]:checked {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
      }

      input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 5px;
        width: 4px;
        height: 8px;
        border: solid var(--text-primary);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input[type="checkbox"]:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
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

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.rows = [];
    this.sortable = false;
    this.selectable = false;
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.virtual = false;
    this.rowHeight = 40;
    this._columns = [];
    this._selectedRows = new Set();
    this._startIndex = 0;
    this._visibleCount = 0;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
  }

  _onSlotChange(e) {
    this._columns = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-COLUMN');
  }

  firstUpdated() {
    if (this.virtual) this._attachScrollListener();
  }

  updated(changed) {
    if (changed.has('virtual')) {
      if (this.virtual) {
        this._attachScrollListener();
        this._recalcVirtual();
      } else {
        this._detachScrollListener();
      }
    }
    if (changed.has('rows') && this.virtual) {
      this._recalcVirtual();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._detachScrollListener();
  }

  _attachScrollListener() {
    this.updateComplete.then(() => {
      const wrapper = this.shadowRoot.querySelector('.table-wrapper');
      if (wrapper) {
        wrapper.addEventListener('scroll', this._onScroll, { passive: true });
        this._recalcVirtual();
      }
    });
  }

  _detachScrollListener() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    const wrapper = this.shadowRoot?.querySelector('.table-wrapper');
    wrapper?.removeEventListener('scroll', this._onScroll);
  }

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._recalcVirtual();
    });
  }

  _recalcVirtual() {
    const wrapper = this.shadowRoot?.querySelector('.table-wrapper');
    if (!wrapper) return;

    const scrollTop = wrapper.scrollTop;
    const viewHeight = wrapper.clientHeight;
    const total = this._sortedRows.length;
    const overscan = 5;

    const rawStart = Math.floor(scrollTop / this.rowHeight);
    const rawVisible = Math.ceil(viewHeight / this.rowHeight);

    this._startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(total, rawStart + rawVisible + overscan);
    this._visibleCount = endIndex - this._startIndex;
  }

  _handleSort(column) {
    if (!this.sortable || !column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.dispatchEvent(new CustomEvent('arc-sort', {
      detail: { column: this.sortColumn, direction: this.sortDirection },
      bubbles: true,
      composed: true,
    }));
  }

  _handleSelectAll(e) {
    const checked = e.target.checked;
    if (checked) {
      this._selectedRows = new Set(this.rows.map((_, i) => i));
    } else {
      this._selectedRows = new Set();
    }

    this.dispatchEvent(new CustomEvent('arc-select-all', {
      detail: { selected: checked },
      bubbles: true,
      composed: true,
    }));
  }

  _handleRowSelect(e, row, index) {
    const checked = e.target.checked;
    const next = new Set(this._selectedRows);

    if (checked) {
      next.add(index);
    } else {
      next.delete(index);
    }

    this._selectedRows = next;

    this.dispatchEvent(new CustomEvent('arc-row-select', {
      detail: { selected: checked, row },
      bubbles: true,
      composed: true,
    }));
  }

  get _sortedRows() {
    if (!this.sortColumn) return this.rows;

    return [...this.rows].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return this.sortDirection === 'desc' ? -cmp : cmp;
    });
  }

  get _allSelected() {
    return this.rows.length > 0 && this._selectedRows.size === this.rows.length;
  }

  _renderSortIndicator(column) {
    if (!this.sortable || !column.sortable) return '';
    if (this.sortColumn !== column.key) {
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
      <tr class="${this._selectedRows.has(i) ? 'selected' : ''}" part="row">
        ${this.selectable ? html`
          <td class="checkbox-cell">
            <input
              type="checkbox"
              aria-label="Select row ${i + 1}"
              .checked=${this._selectedRows.has(i)}
              @change=${(e) => this._handleRowSelect(e, row, i)}
            />
          </td>
        ` : ''}
        ${this._columns.map(col => html`
          <td part="cell">${row[col.key] ?? ''}</td>
        `)}
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
              ${this.selectable ? html`
                <th class="checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    .checked=${this._allSelected}
                    @change=${this._handleSelectAll}
                  />
                </th>
              ` : ''}
              ${this._columns.map(col => html`
                <th
                  class="${this.sortable && col.sortable ? 'sortable' : ''} ${this.sortColumn === col.key ? 'sorted' : ''}"
                  style="${col.width ? `width: ${col.width}` : ''}"
                  @click=${() => this._handleSort(col)}
                  aria-sort=${this.sortColumn === col.key ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  ${col.label}${this._renderSortIndicator(col)}
                </th>
              `)}
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
