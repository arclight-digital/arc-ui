import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * A spreadsheet-grade grid for working with tabular data: inline cell editing, multi-column
 * sorting, pinned columns, row selection, and virtualized rendering. Columns are defined as a
 * JavaScript array, and the grid implements the full WAI-ARIA grid keyboard pattern with a single
 * tab stop.
 *
 * @tag arc-data-grid
 * @prop columns - Column definitions. Each entry maps a `key` in your row objects to a rendered column with a `label` header. Optional flags enable sorting, inline editing, and left-edge pinning per column; `width` sets a fixed CSS width (required for accurate pinned offsets) and `align` controls text alignment. Pinned columns are always displayed first. Set via JavaScript property.
 * @prop {Array<Record<string, any>>} rows - The data array. Each object becomes a row keyed by column `key`. The grid works on an internal shallow copy — sorting and inline edits never mutate the array you pass in. Set via JavaScript property; reassigning it resets selection and any open editor.
 * @prop sort - Multi-sort state in priority order. Clicking a sortable header cycles it asc → desc → none; Shift+click appends it as a secondary sort. When more than one sort is active, headers show a direction arrow plus priority number. Set this property to pre-sort the grid.
 * @prop {boolean} manualSort - Skips internal sorting. Rows render in the order given, while headers still cycle the `sort` state and emit `arc-sort` — use this to implement server-side sorting.
 * @prop {boolean} selectable - Adds a checkbox column with a select-all header checkbox (indeterminate when partially selected). Space toggles selection from the keyboard. Emits `arc-selection-change` with the selected row indices.
 * @prop {boolean} virtual - Enables virtual scrolling for large datasets. Only visible rows plus an overscan buffer are rendered, keeping performance constant regardless of row count.
 * @prop {number} rowHeight - Height in pixels of each row when virtual scrolling is enabled. Must match the actual rendered row height for correct scroll calculations.
 * @fires arc-sort - Fired when the user changes sorting. detail: { sort } with the full multi-sort array in priority order
 * @fires arc-cell-change - Fired when an inline cell edit is committed. detail: { rowIndex, key, value, row } — rowIndex refers to the original rows array
 * @fires arc-selection-change - Fired when row selection changes. detail: { selectedIndices } — indices into the original rows array
 * @csspart header-cell
 * @csspart cell
 * @csspart editor
 * @csspart row
 * @csspart wrapper
 * @csspart table
 * @csspart header
 * @csspart body
 */
export class ArcDataGrid extends LitElement {
  static properties = {
    columns:       { type: Array },
    rows:          { type: Array },
    sort:          { type: Array },
    manualSort:    { type: Boolean, attribute: 'manual-sort' },
    selectable:    { type: Boolean, reflect: true },
    virtual:       { type: Boolean, reflect: true },
    rowHeight:     { type: Number, attribute: 'row-height' },
    _rows:         { state: true },
    _selected:     { state: true },
    _startIndex:   { state: true },
    _visibleCount: { state: true },
    _focusRow:     { state: true },
    _focusCol:     { state: true },
    _editing:      { state: true },
    _scrolledX:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }

      .grid-wrapper {
        overflow-x: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      :host([virtual]) .grid-wrapper {
        overflow-y: auto;
        max-height: var(--grid-max-height, 600px);
      }

      table {
        width: 100%;
        border-collapse: separate; /* required so sticky cells keep their borders while scrolling */
        border-spacing: 0;
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      thead {
        position: sticky;
        top: 0;
        z-index: 3;
      }

      thead tr { background: var(--surface-overlay); }

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
        background: inherit;
      }

      th.sortable {
        cursor: pointer;
        transition: color var(--transition-fast);
      }

      th.sortable:hover { color: var(--text-primary); }

      th.sorted { color: var(--interactive); }

      /* Fixed-width slot so the glyph swap (↕ → ↑/↓ + index) can't shift column widths */
      .sort-indicator {
        display: inline-block;
        width: 1.6em;
        margin-left: var(--space-sm);
        font-size: var(--text-xs);
        vertical-align: middle;
        text-align: left;
      }

      .sort-indicator--idle {
        color: var(--text-ghost);
        opacity: 0.6;
        transition: opacity var(--transition-fast);
      }

      th.sortable:hover .sort-indicator--idle { opacity: 1; }

      .sort-index {
        font-size: 0.75em;
        vertical-align: super;
        margin-left: 1px;
      }

      td {
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        color: var(--text-secondary);
        line-height: 1.5;
        white-space: nowrap;
        background: inherit;
      }

      tbody tr:last-child td { border-bottom: none; }

      tbody tr:nth-child(odd)  { background: var(--surface-primary); }
      tbody tr:nth-child(even) { background: var(--surface-raised); }
      tbody tr:hover           { background: var(--surface-overlay); }
      /* Opaque composite so sticky pinned cells don't show scrolled content through the tint */
      tbody tr.selected {
        background-color: var(--surface-raised);
        background-image: linear-gradient(rgba(var(--interactive-rgb), 0.08), rgba(var(--interactive-rgb), 0.08));
      }

      td.editable-cell { cursor: text; }
      td.editing { padding: 0 var(--space-xs); }

      /* Pinned columns stick to the left edge of the horizontal scroller */
      .cell--pinned {
        position: sticky;
        z-index: 1;
        background: inherit;
      }

      thead .cell--pinned { z-index: 4; }

      .cell--pinned-last { border-right: 1px solid var(--border-default); }

      .scrolled-x th.cell--pinned-last,
      .scrolled-x td.cell--pinned-last {
        box-shadow: 6px 0 12px -6px rgba(var(--black-rgb), 0.45);
      }

      th:focus-visible,
      td:focus-visible,
      .scrolled-x th.cell--pinned-last:focus-visible,
      .scrolled-x td.cell--pinned-last:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
        z-index: 2;
      }

      thead th:focus-visible { z-index: 5; }

      .checkbox-cell {
        width: 40px;
        min-width: 40px;
        max-width: 40px;
        text-align: center;
        box-sizing: border-box;
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

      input[type="checkbox"]:hover { border-color: var(--interactive); }

      input[type="checkbox"]:checked,
      input[type="checkbox"]:indeterminate {
        background: var(--interactive);
        border-color: var(--interactive);
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

      input[type="checkbox"]:indeterminate::after {
        content: '';
        position: absolute;
        top: 6px;
        left: 3px;
        width: 8px;
        height: 2px;
        background: var(--text-primary);
      }

      /* Inline cell editor — matches arc-input's field look */
      .editor {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        font-weight: 300;
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid rgba(var(--interactive-rgb), 0.4);
        border-radius: var(--radius-sm);
        padding: var(--space-xs) var(--space-sm);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .editor:focus { outline: none; }

      .empty-state {
        padding: var(--space-xl);
        text-align: center;
        color: var(--text-muted);
        font-style: italic;
      }

      /* Virtual spacer rows */
      .spacer td { padding: 0; border: none; background: none; }

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
    this.columns = [];
    this.rows = [];
    this.sort = [];
    this.manualSort = false;
    this.selectable = false;
    this.virtual = false;
    this.rowHeight = 40;
    this._rows = [];
    this._selected = new Set();
    this._startIndex = 0;
    this._visibleCount = 0;
    this._focusRow = 0;
    this._focusCol = 0;
    this._editing = null;
    this._scrolledX = false;
    this._rafId = null;
    this._onScroll = this._onScroll.bind(this);
  }

  willUpdate(changed) {
    if (changed.has('rows')) {
      // Grid displays (and mutates) its own shallow copy; consumer owns source of truth.
      this._rows = Array.isArray(this.rows) ? this.rows.map((r) => ({ ...r })) : [];
      this._selected = new Set();
      this._editing = null;
    }
  }

  firstUpdated() {
    const wrapper = this.shadowRoot.querySelector('.grid-wrapper');
    wrapper?.addEventListener('scroll', this._onScroll, { passive: true });
    if (this.virtual) this._recalcVirtual();
  }

  updated(changed) {
    if (this.virtual && (changed.has('virtual') || changed.has('_rows'))) {
      this._recalcVirtual();
    }
    const selectAll = this.shadowRoot.querySelector('.select-all');
    if (selectAll) selectAll.indeterminate = this._selected.size > 0 && !this._allSelected;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.shadowRoot?.querySelector('.grid-wrapper')?.removeEventListener('scroll', this._onScroll);
  }

  /* ---------- Scrolling / virtualization ---------- */

  _onScroll() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      const wrapper = this.shadowRoot?.querySelector('.grid-wrapper');
      if (!wrapper) return;
      this._scrolledX = wrapper.scrollLeft > 0;
      if (this.virtual) this._recalcVirtual();
    });
  }

  _recalcVirtual() {
    const wrapper = this.shadowRoot?.querySelector('.grid-wrapper');
    if (!wrapper) return;

    const scrollTop = wrapper.scrollTop;
    const viewHeight = wrapper.clientHeight;
    const total = this._rows.length;
    const overscan = 5;

    const rawStart = Math.floor(scrollTop / this.rowHeight);
    const rawVisible = Math.ceil(viewHeight / this.rowHeight);

    this._startIndex = Math.max(0, rawStart - overscan);
    const endIndex = Math.min(total, rawStart + rawVisible + overscan);
    this._visibleCount = Math.max(0, endIndex - this._startIndex);
  }

  _scrollRowIntoView(i) {
    const wrapper = this.shadowRoot?.querySelector('.grid-wrapper');
    if (!wrapper) return;
    const headerH = wrapper.querySelector('thead')?.offsetHeight ?? 0;
    const bodyTop = i * this.rowHeight;
    if (bodyTop < wrapper.scrollTop) {
      wrapper.scrollTop = bodyTop;
    } else if (headerH + bodyTop + this.rowHeight > wrapper.scrollTop + wrapper.clientHeight) {
      wrapper.scrollTop = headerH + bodyTop + this.rowHeight - wrapper.clientHeight;
    }
    this._recalcVirtual();
  }

  /* ---------- Columns / sorting ---------- */

  get _orderedColumns() {
    const cols = Array.isArray(this.columns) ? this.columns : [];
    return [...cols.filter((c) => c.pinned), ...cols.filter((c) => !c.pinned)];
  }

  _colWidth(col) {
    const n = parseFloat(col.width);
    return Number.isFinite(n) ? n : 120;
  }

  _pinnedInfo(cols) {
    const hasPinned = cols.some((c) => c.pinned);
    const offsets = new Map();
    const checkboxPinned = this.selectable && hasPinned;
    let left = checkboxPinned ? 40 : 0;
    let lastPinnedKey = null;
    for (const col of cols) {
      if (!col.pinned) break;
      offsets.set(col.key, left);
      left += this._colWidth(col);
      lastPinnedKey = col.key;
    }
    return { hasPinned, offsets, lastPinnedKey, checkboxPinned };
  }

  get _orderedIndices() {
    const idx = this._rows.map((_, i) => i);
    const sorts = Array.isArray(this.sort) ? this.sort : [];
    if (this.manualSort || sorts.length === 0) return idx;

    // Decide each key's comparison mode once for the whole column. A per-pair
    // typeof check makes mixed number/"number" columns non-transitive, letting
    // engines reorder rows arbitrarily on every sort.
    const numericByKey = new Map(sorts.map(({ key }) => [key, this._rows.every((r) => {
      const v = r[key];
      return v == null || v === '' || (typeof v === 'number' ? Number.isFinite(v) : !Number.isNaN(Number(v)));
    })]));
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    return idx.sort((ia, ib) => {
      for (const { key, direction } of sorts) {
        const a = this._rows[ia][key];
        const b = this._rows[ib][key];
        const aEmpty = a == null || a === '';
        const bEmpty = b == null || b === '';
        if (aEmpty && bEmpty) continue;
        if (aEmpty) return 1; // empties always last, either direction
        if (bEmpty) return -1;
        const cmp = numericByKey.get(key)
          ? Number(a) - Number(b)
          : collator.compare(String(a), String(b));
        if (cmp !== 0) return direction === 'desc' ? -cmp : cmp;
      }
      return ia - ib; // original-order tiebreak keeps equal rows stable
    });
  }

  _cycleSort(col, additive) {
    if (!col.sortable) return;
    const sorts = Array.isArray(this.sort) ? this.sort : [];
    const existing = sorts.find((s) => s.key === col.key);
    const nextDir = existing ? (existing.direction === 'asc' ? 'desc' : null) : 'asc';

    let next;
    if (additive) {
      next = sorts
        .map((s) => (s.key === col.key ? (nextDir ? { key: col.key, direction: nextDir } : null) : s))
        .filter(Boolean);
      if (!existing) next.push({ key: col.key, direction: 'asc' });
    } else {
      next = nextDir ? [{ key: col.key, direction: nextDir }] : [];
    }

    this.sort = next;
    this.dispatchEvent(new CustomEvent('arc-sort', {
      detail: { sort: next.map((s) => ({ ...s })) },
      bubbles: true,
      composed: true,
    }));
  }

  _onHeaderClick(e, col, c) {
    this._setFocusCoords(0, c);
    if (col.sortable) this._cycleSort(col, e.shiftKey);
  }

  /* ---------- Selection ---------- */

  get _allSelected() {
    return this._rows.length > 0 && this._selected.size === this._rows.length;
  }

  _toggleAll() {
    this._selected = this._allSelected
      ? new Set()
      : new Set(this._rows.map((_, i) => i));
    this._emitSelection();
  }

  _toggleRow(sourceIndex) {
    const next = new Set(this._selected);
    if (next.has(sourceIndex)) next.delete(sourceIndex);
    else next.add(sourceIndex);
    this._selected = next;
    this._emitSelection();
  }

  _emitSelection() {
    this.dispatchEvent(new CustomEvent('arc-selection-change', {
      detail: { selectedIndices: [...this._selected].sort((a, b) => a - b) },
      bubbles: true,
      composed: true,
    }));
  }

  /* ---------- Roving cell focus (APG grid) ---------- */

  _tabindex(r, c) {
    return this._focusRow === r && this._focusCol === c ? '0' : '-1';
  }

  _setFocusCoords(r, c) {
    this._focusRow = r;
    this._focusCol = c;
  }

  async _moveFocus(r, c) {
    const colCount = this._orderedColumns.length + (this.selectable ? 1 : 0);
    const rowCount = this._rows.length + 1;
    r = Math.max(0, Math.min(rowCount - 1, r));
    c = Math.max(0, Math.min(colCount - 1, c));
    this._focusRow = r;
    this._focusCol = c;
    if (this.virtual && r > 0) this._scrollRowIntoView(r - 1);
    await this.updateComplete;
    this.shadowRoot.querySelector(`[data-row="${r}"][data-col="${c}"]`)?.focus();
  }

  _onGridKeydown(e) {
    if (this._editing) return;
    const r = this._focusRow;
    const c = this._focusCol;
    const colCount = this._orderedColumns.length + (this.selectable ? 1 : 0);
    const rowCount = this._rows.length + 1;

    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); this._moveFocus(r, c + 1); return;
      case 'ArrowLeft':  e.preventDefault(); this._moveFocus(r, c - 1); return;
      case 'ArrowDown':  e.preventDefault(); this._moveFocus(r + 1, c); return;
      case 'ArrowUp':    e.preventDefault(); this._moveFocus(r - 1, c); return;
      case 'Home':
        e.preventDefault();
        this._moveFocus(e.ctrlKey || e.metaKey ? 0 : r, 0);
        return;
      case 'End':
        e.preventDefault();
        this._moveFocus(e.ctrlKey || e.metaKey ? rowCount - 1 : r, colCount - 1);
        return;
      case 'Enter':
        e.preventDefault();
        this._activateCell(e.shiftKey);
        return;
      case ' ': {
        if (!this.selectable) return;
        e.preventDefault();
        if (r === 0) {
          this._toggleAll();
        } else {
          const si = this._orderedIndices[r - 1];
          if (si != null) this._toggleRow(si);
        }
        return;
      }
      default:
    }
  }

  _activateCell(shift) {
    const r = this._focusRow;
    const c = this._focusCol;
    const cbOffset = this.selectable ? 1 : 0;

    if (this.selectable && c === 0) {
      if (r === 0) this._toggleAll();
      else {
        const si = this._orderedIndices[r - 1];
        if (si != null) this._toggleRow(si);
      }
      return;
    }

    const col = this._orderedColumns[c - cbOffset];
    if (!col) return;

    if (r === 0) {
      if (col.sortable) this._cycleSort(col, shift);
      return;
    }

    if (col.editable) {
      const si = this._orderedIndices[r - 1];
      if (si != null) this._openEditor(r, c, col, si);
    }
  }

  /* ---------- Inline editing ---------- */

  _openEditor(r, c, col, sourceIndex) {
    this._editing = { r, c, key: col.key, sourceIndex };
    this.updateComplete.then(() => {
      const input = this.shadowRoot.querySelector('.editor');
      input?.focus();
      input?.select();
    });
  }

  _commitEdit(value, refocus = true) {
    const { r, c, key, sourceIndex } = this._editing;
    this._editing = null;
    const row = this._rows[sourceIndex];
    if (!row) return;

    const prev = row[key];
    let next = value;
    if (typeof prev === 'number' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      next = Number(value);
    }
    row[key] = next;
    this._rows = [...this._rows];

    this.dispatchEvent(new CustomEvent('arc-cell-change', {
      detail: { rowIndex: sourceIndex, key, value: next, row },
      bubbles: true,
      composed: true,
    }));

    if (refocus) this._moveFocus(r, c);
  }

  _cancelEdit() {
    const { r, c } = this._editing;
    this._editing = null;
    this._moveFocus(r, c);
  }

  _onEditorKeydown(e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      this._commitEdit(e.target.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._cancelEdit();
    }
  }

  _onEditorBlur(e) {
    if (!this._editing) return; // already committed/cancelled
    this._commitEdit(e.target.value, false);
  }

  /* ---------- Rendering ---------- */

  _cellStyle(col, pin) {
    const styles = [];
    if (pin.offsets.has(col.key)) {
      const w = this._colWidth(col);
      styles.push(`left:${pin.offsets.get(col.key)}px`, `width:${w}px`, `min-width:${w}px`, `max-width:${w}px`);
    } else if (col.width) {
      styles.push(`width:${col.width}`);
    }
    if (col.align && col.align !== 'left') styles.push(`text-align:${col.align}`);
    return styles.join(';');
  }

  _renderSortIndicator(col, entry, entryIdx, totalSorts) {
    if (!col.sortable) return '';
    if (!entry) {
      return html`<span class="sort-indicator sort-indicator--idle" aria-hidden="true">↕</span>`;
    }
    return html`<span class="sort-indicator" aria-hidden="true">${entry.direction === 'asc' ? '↑' : '↓'}${totalSorts > 1 ? html`<span class="sort-index">${entryIdx + 1}</span>` : ''}</span>`;
  }

  _renderHeaderCell(col, c, pin) {
    const sorts = Array.isArray(this.sort) ? this.sort : [];
    const entryIdx = sorts.findIndex((s) => s.key === col.key);
    const entry = entryIdx >= 0 ? sorts[entryIdx] : null;
    const primary = entry && entryIdx === 0;
    const pinned = pin.offsets.has(col.key);
    const style = this._cellStyle(col, pin);

    return html`
      <th
        role="columnheader"
        part="header-cell"
        scope="col"
        class="${col.sortable ? 'sortable' : ''} ${entry ? 'sorted' : ''} ${pinned ? 'cell--pinned' : ''} ${col.key === pin.lastPinnedKey ? 'cell--pinned-last' : ''}"
        style=${style || nothing}
        aria-sort=${col.sortable
          ? (primary ? (entry.direction === 'asc' ? 'ascending' : 'descending') : 'none')
          : nothing}
        tabindex=${this._tabindex(0, c)}
        data-row="0"
        data-col=${c}
        @click=${(e) => this._onHeaderClick(e, col, c)}
      >${col.label}${this._renderSortIndicator(col, entry, entryIdx, sorts.length)}</th>
    `;
  }

  _renderCell(col, c, row, sourceIndex, r, pin) {
    const editing = this._editing
      && this._editing.sourceIndex === sourceIndex
      && this._editing.key === col.key;
    const pinned = pin.offsets.has(col.key);
    const style = this._cellStyle(col, pin);
    const value = row[col.key];

    return html`
      <td
        role="gridcell"
        part="cell"
        class="${col.editable ? 'editable-cell' : ''} ${editing ? 'editing' : ''} ${pinned ? 'cell--pinned' : ''} ${col.key === pin.lastPinnedKey ? 'cell--pinned-last' : ''}"
        style=${style || nothing}
        tabindex=${this._tabindex(r, c)}
        data-row=${r}
        data-col=${c}
        @click=${() => this._setFocusCoords(r, c)}
        @dblclick=${col.editable ? () => this._openEditor(r, c, col, sourceIndex) : nothing}
      >${editing
        ? html`<input
            class="editor"
            part="editor"
            type="text"
            aria-label="Edit ${col.label}"
            .value=${String(value ?? '')}
            @keydown=${this._onEditorKeydown}
            @blur=${this._onEditorBlur}
          />`
        : value ?? ''}</td>
    `;
  }

  _renderRow(sourceIndex, displayIndex, cols, pin) {
    const row = this._rows[sourceIndex];
    const r = displayIndex + 1;
    const selected = this._selected.has(sourceIndex);

    return html`
      <tr
        role="row"
        part="row"
        class=${selected ? 'selected' : ''}
        style=${this.virtual ? `height:${this.rowHeight}px` : nothing}
        aria-rowindex=${r + 1}
        aria-selected=${this.selectable ? String(selected) : nothing}
      >
        ${this.selectable ? html`
          <td
            role="gridcell"
            part="cell"
            class="checkbox-cell ${pin.checkboxPinned ? 'cell--pinned' : ''}"
            style=${pin.checkboxPinned ? 'left:0' : nothing}
            tabindex=${this._tabindex(r, 0)}
            data-row=${r}
            data-col="0"
            @click=${() => this._setFocusCoords(r, 0)}
          >
            <input
              type="checkbox"
              tabindex="-1"
              aria-label="Select row ${r}"
              .checked=${selected}
              @change=${() => this._toggleRow(sourceIndex)}
            />
          </td>
        ` : ''}
        ${cols.map((col, i) => this._renderCell(col, i + (this.selectable ? 1 : 0), row, sourceIndex, r, pin))}
      </tr>
    `;
  }

  _renderBody(order, cols, pin, colCount) {
    if (order.length === 0) {
      return html`
        <tr role="row">
          <td class="empty-state" role="gridcell" colspan=${colCount}>No data available</td>
        </tr>
      `;
    }

    if (this.virtual) {
      const total = order.length;
      const topHeight = this._startIndex * this.rowHeight;
      const endIndex = Math.min(total, this._startIndex + this._visibleCount);
      const bottomHeight = (total - endIndex) * this.rowHeight;
      const visible = order.slice(this._startIndex, endIndex);

      return html`
        ${topHeight > 0 ? html`<tr class="spacer" aria-hidden="true"><td colspan=${colCount} style="height:${topHeight}px"></td></tr>` : ''}
        ${visible.map((si, i) => this._renderRow(si, this._startIndex + i, cols, pin))}
        ${bottomHeight > 0 ? html`<tr class="spacer" aria-hidden="true"><td colspan=${colCount} style="height:${bottomHeight}px"></td></tr>` : ''}
      `;
    }

    return order.map((si, di) => this._renderRow(si, di, cols, pin));
  }

  render() {
    const cols = this._orderedColumns;
    const pin = this._pinnedInfo(cols);
    const colCount = cols.length + (this.selectable ? 1 : 0);
    const order = this._orderedIndices;

    return html`
      <div class="grid-wrapper ${this._scrolledX ? 'scrolled-x' : ''}" part="wrapper">
        <table
          part="table"
          role="grid"
          aria-label="Data grid"
          aria-rowcount=${this._rows.length + 1}
          aria-colcount=${colCount}
          aria-multiselectable=${this.selectable ? 'true' : nothing}
          @keydown=${this._onGridKeydown}
        >
          <thead part="header">
            <tr role="row" aria-rowindex="1">
              ${this.selectable ? html`
                <th
                  role="columnheader"
                  part="header-cell"
                  class="checkbox-cell ${pin.checkboxPinned ? 'cell--pinned' : ''}"
                  style=${pin.checkboxPinned ? 'left:0' : nothing}
                  tabindex=${this._tabindex(0, 0)}
                  data-row="0"
                  data-col="0"
                  @click=${() => this._setFocusCoords(0, 0)}
                >
                  <input
                    class="select-all"
                    type="checkbox"
                    tabindex="-1"
                    aria-label="Select all rows"
                    .checked=${this._allSelected}
                    @change=${() => this._toggleAll()}
                  />
                </th>
              ` : ''}
              ${cols.map((col, i) => this._renderHeaderCell(col, i + (this.selectable ? 1 : 0), pin))}
            </tr>
          </thead>
          <tbody part="body">
            ${this._renderBody(order, cols, pin, colCount)}
          </tbody>
        </table>
      </div>
    `;
  }
}
