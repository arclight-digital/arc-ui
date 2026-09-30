import { LitElement, html, css, svg, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, num } from '../shared/props.js';
import { hydrateSlots } from '../shared/hydrate-slots.js';
import './field-row.js';
import '../input/button.js';

/**
 * A repeating set of form rows the user can add to, remove from and reorder, such
 * as the options of a poll or the levels of a scale.
 *
 * **Your application owns the rows.** Each row is an `arc-field-row` you render
 * from your own array, with whatever inputs it needs. The list never adds, removes
 * or moves an element itself: it tells you what the user asked for, with
 * `arc-add`, `arc-remove` and `arc-move`, and you update your array. That keeps
 * one copy of the data, yours, and leaves nothing to drift out of step. The list
 * handles everything around it: the Add button, remove and move controls on each
 * row, keyboard and pointer reordering, focus after each change, the `min` and
 * `max` limits, and a spoken confirmation of every change.
 *
 * Name your inputs as your form expects (`option-0`, `option-1`, or a repeated
 * `option`); the rows are plain light DOM, so they submit like any other field.
 *
 * @tag arc-field-list
 * @status stable
 * @child arc-field-row
 * @requires arc-button
 * @requires arc-field-row
 * @prop {string} label - Accessible name for the group of rows, such as "Options".
 * @prop {string} addLabel - Text of the Add button, exactly as given. The plus sign before it is an icon, not part of the text, so `add-label="Option"` reads "Option" with a + beside it.
 * @prop {boolean} readonly - Show the rows without their controls: no Add button, no handles, no Remove buttons. For a fixed set that should look like the editable one, such as a taught question's options.
 * @prop {number} min - The fewest rows allowed. Remove is disabled at this count.
 * @prop {number} max - The most rows allowed. Add is disabled at this count. Unset is unlimited.
 * @fires {CustomEvent<void>} arc-add - The user asked for a new row. Append one to your array; focus moves into it when it renders.
 * @fires {CustomEvent<{ value: number, index: number }>} arc-remove - The user asked to remove the row at `index`. Remove it from your array.
 * @fires {CustomEvent<{ value: number, from: number, to: number }>} arc-move - The user moved the row at `from` to `to` (also `value`). Move it in your array; focus follows it.
 * @slot - `arc-field-row` elements, one per row, in order.
 * @csspart base - The root element: the group of rows.
 * @csspart rows - The container of the rows.
 * @csspart add - The Add button.
 */
export class ArcFieldList extends DeclaredPropsMixin(LitElement) {
  static properties = {
    label: { type: String },
    addLabel: { type: String, attribute: 'add-label' },
    min: num({ default: 0, min: 0, int: true }),
    max: num({ nullable: true, min: 0, int: true }),
    readonly: flag(false),
    _rows: { state: true },
    _announcement: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .rows {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .add { align-self: flex-start; }

      .live {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `,
  ];

  /** @internal Slots read on the server and before hydration; see ssr.js. */
  static slotReaders = { '': '_onSlotChange' };

  constructor() {
    super();
    this.label = '';
    this.addLabel = 'Add';
    this._rows = [];
    this._announcement = '';
    this._pendingFocus = null;
  }

  firstUpdated() {
    hydrateSlots(this);
  }

  get _atMax() {
    return this.max != null && this._rows.length >= this.max;
  }

  get _atMin() {
    return this._rows.length <= this.min;
  }

  _onSlotChange(e) {
    const previous = this._rows.length;
    this._rows = e.target
      .assignedElements({ flatten: true })
      .filter((el) => el.localName === 'arc-field-row');
    this._syncRows();
    this._restoreFocus(previous);
  }

  /** Each row learns its place, so its controls can name it and know their limits. */
  _syncRows() {
    const count = this._rows.length;
    this._rows.forEach((row, i) => {
      row._list = this;
      row._index = i;
      row._count = count;
      row._removable = count > this.min;
      row._readonly = this.readonly;
    });
  }

  updated(changed) {
    if (changed.has('min') || changed.has('max') || changed.has('readonly')) this._syncRows();
  }

  /**
   * After the application re-rendered in answer to a request, put focus where
   * the user expects it: in the new row, on the moved row's handle, or on the
   * row that took the removed one's place.
   */
  _restoreFocus(previous) {
    const want = this._pendingFocus;
    if (!want) return;
    const rows = this._rows;
    if (want.kind === 'add' && rows.length > previous) {
      this._pendingFocus = null;
      const row = rows[rows.length - 1];
      row.updateComplete.then(() => row.focusFirstField());
    } else if (want.kind === 'remove' && rows.length < previous) {
      this._pendingFocus = null;
      const row = rows[Math.min(want.index, rows.length - 1)];
      if (row) row.updateComplete.then(() => row.focusHandle());
      else this.shadowRoot.querySelector('.add')?.focus();
    } else if (want.kind === 'move' && rows.length === previous) {
      this._pendingFocus = null;
      const row = rows[want.index];
      row?.updateComplete.then(() => row.focusHandle());
    }
  }

  _announce(text) {
    // The same text twice in a row would not be read again; clear it first.
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = text;
    });
  }

  _add() {
    if (this._atMax) return;
    this._pendingFocus = { kind: 'add' };
    this.dispatchEvent(new CustomEvent('arc-add', { bubbles: true, composed: true }));
    this._announce('Row added');
  }

  /** Called by a row's Remove button. */
  _requestRemove(index) {
    if (this._atMin) return;
    this._pendingFocus = { kind: 'remove', index };
    this.dispatchEvent(
      new CustomEvent('arc-remove', {
        detail: { value: index, index },
        bubbles: true,
        composed: true,
      }),
    );
    this._announce(`Row ${index + 1} removed`);
  }

  /** Called by a row's handle, from the keyboard or a drag. */
  _requestMove(from, to) {
    const last = this._rows.length - 1;
    const target = Math.max(0, Math.min(last, to));
    if (target === from) return;
    this._pendingFocus = { kind: 'move', index: target };
    this.dispatchEvent(
      new CustomEvent('arc-move', {
        detail: { value: target, from, to: target },
        bubbles: true,
        composed: true,
      }),
    );
    this._announce(`Moved to position ${target + 1} of ${this._rows.length}`);
  }

  /** Where a drag at `clientY` would drop the row at `from`. */
  _dropIndex(from, clientY) {
    let to = 0;
    this._rows.forEach((row, i) => {
      if (i === from) return;
      const r = row.getBoundingClientRect();
      if (clientY > r.top + r.height / 2) to = i < from ? i + 1 : i;
    });
    return to;
  }

  /**
   * The Add button's plus is an icon, not text: prefixed as a character, it
   * made add-label="+ option" read "+ + option" (finding #142).
   */
  render() {
    return html`
      <div class="list" part="base" role="group" aria-label=${this.label || 'Rows'}>
        <div class="rows" part="rows">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        ${
          this.readonly
            ? nothing
            : html`<arc-button
              class="add"
              part="add"
              variant="secondary"
              size="sm"
              ?disabled=${this._atMax}
              @click=${this._add}
            >
              ${svg`<svg slot="prefix" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>`}
              ${this.addLabel}
            </arc-button>`
        }
        <div class="live" aria-live="polite">${this._announcement}</div>
      </div>
    `;
  }
}
