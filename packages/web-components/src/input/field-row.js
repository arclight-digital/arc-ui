import { LitElement, html, css, svg, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../input/icon-button.js';

/**
 * One row of an `arc-field-list`: your inputs, with a handle to reorder the row
 * and a button to remove it.
 *
 * The handle moves the row with the arrow keys (Up and Down) or by dragging.
 * Neither moves anything by itself: the parent list tells your application,
 * which owns the rows. See `arc-field-list`.
 *
 * @tag arc-field-row
 * @status stable
 * @requires arc-icon-button
 * @prop {string} label - What this row is called in its controls' names, such as "Option 2". Defaults to "Row" and its position.
 * @slot - The row's inputs.
 * @csspart base - The root element.
 * @csspart handle - The reorder handle.
 * @csspart fields - The container of your inputs.
 * @csspart remove - The Remove button.
 */
export class ArcFieldRow extends LitElement {
  static properties = {
    label: { type: String },
    _index: { state: true },
    _count: { state: true },
    _removable: { state: true },
    _dragging: { state: true },
    // Set by the parent list. Reactive, because the controls render only once
    // a row knows its list, and index and count alone may not change on adoption.
    _list: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([dragging]) { opacity: 0.6; position: relative; z-index: 1; }

      .row {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }

      .handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: var(--touch-min);
        min-height: var(--touch-min);
        padding: 0;
        border: none;
        border-radius: var(--radius-sm);
        background: none;
        color: var(--text-muted);
        cursor: grab;
        touch-action: none;
      }
      .handle:hover { color: var(--text-primary); background: var(--surface-hover); }
      .handle:focus-visible { outline: none; box-shadow: var(--interactive-focus); }
      :host([dragging]) .handle { cursor: grabbing; }
      .handle svg { width: 16px; height: 16px; }

      .fields {
        flex: 1;
        min-width: 0;
        display: flex;
        gap: var(--space-sm);
        align-items: center;
      }
    `,
  ];

  constructor() {
    super();
    this.label = '';
    this._index = 0;
    this._count = 1;
    this._removable = true;
    this._dragging = false;
    this._list = null;
    this._drag = null;
  }

  get _name() {
    return this.label || `Row ${this._index + 1}`;
  }

  /**
   * Focus the first field in the row, as after it was just added.
   * @returns {void}
   */
  focusFirstField() {
    const field = [...this.children].find((el) => typeof el.focus === 'function');
    (field ?? this.shadowRoot.querySelector('.handle'))?.focus();
  }

  /**
   * Focus the handle, as after the row was moved.
   * @returns {void}
   */
  focusHandle() {
    this.shadowRoot.querySelector('.handle')?.focus();
  }

  _onHandleKeydown(e) {
    const to = {
      ArrowUp: this._index - 1,
      ArrowDown: this._index + 1,
      Home: 0,
      End: this._count - 1,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    this._list?._requestMove(this._index, to);
  }

  _onHandleDown(e) {
    if (!this._list) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    this._drag = { y: e.clientY };
    this._dragging = true;
    this.toggleAttribute('dragging', true);
  }

  _onHandleMove(e) {
    if (!this._drag) return;
    this.style.transform = `translateY(${e.clientY - this._drag.y}px)`;
  }

  _onHandleUp(e) {
    if (!this._drag) return;
    this._drag = null;
    this._dragging = false;
    this.toggleAttribute('dragging', false);
    this.style.transform = '';
    const to = this._list?._dropIndex(this._index, e.clientY);
    if (to != null) this._list._requestMove(this._index, to);
  }

  render() {
    const grip = svg`<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="6" cy="3.5" r="1.25"/><circle cx="10" cy="3.5" r="1.25"/>
      <circle cx="6" cy="8" r="1.25"/><circle cx="10" cy="8" r="1.25"/>
      <circle cx="6" cy="12.5" r="1.25"/><circle cx="10" cy="12.5" r="1.25"/></svg>`;
    return html`
      <div class="row" part="base">
        ${
          this._list
            ? html`<button
              class="handle"
              part="handle"
              type="button"
              aria-label=${`Move ${this._name}, position ${this._index + 1} of ${this._count}`}
              aria-describedby="hint"
              @keydown=${this._onHandleKeydown}
              @pointerdown=${this._onHandleDown}
              @pointermove=${this._onHandleMove}
              @pointerup=${this._onHandleUp}
              @pointercancel=${this._onHandleUp}
            >${grip}</button>`
            : nothing
        }
        <span id="hint" hidden>Use the up and down arrow keys to move</span>
        <div class="fields" part="fields"><slot></slot></div>
        ${
          this._list
            ? html`<arc-icon-button
              part="remove"
              name="x"
              variant="ghost"
              size="sm"
              label=${`Remove ${this._name}`}
              ?disabled=${!this._removable}
              @click=${() => this._list._requestRemove(this._index)}
            ></arc-icon-button>`
            : nothing
        }
      </div>
    `;
  }
}
