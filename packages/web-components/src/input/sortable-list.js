import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-sortable-list
 */
export class ArcSortableList extends LitElement {
  static properties = {
    disabled:      { type: Boolean, reflect: true },
    _items:        { state: true },
    _dragIndex:    { state: true },
    _overIndex:    { state: true },
    _kbSelected:   { state: true },
    _kbMoving:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .sortable {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sortable__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        background: var(--surface-raised, var(--surface-primary));
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        transition: box-shadow var(--transition-fast),
                    opacity var(--transition-fast),
                    background var(--transition-fast),
                    border-color var(--transition-fast);
        cursor: default;
        user-select: none;
        position: relative;
      }

      .sortable__item:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .sortable__item--dragging {
        opacity: 0.5;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      }

      .sortable__item--kb-selected {
        border-color: var(--interactive);
        box-shadow: 0 0 0 1px var(--interactive);
      }

      .sortable__item--kb-moving {
        border-color: var(--interactive);
        box-shadow: 0 0 0 2px var(--interactive), 0 4px 16px rgba(0, 0, 0, 0.12);
        background: var(--surface-overlay);
      }

      .sortable__item--over-before::before,
      .sortable__item--over-after::after {
        content: '';
        position: absolute;
        left: var(--space-sm);
        right: var(--space-sm);
        height: 2px;
        background: var(--interactive);
        border-radius: var(--radius-full);
      }

      .sortable__item--over-before::before { top: -2px; }
      .sortable__item--over-after::after   { bottom: -2px; }

      .sortable__handle {
        display: flex;
        flex-direction: column;
        gap: 2px;
        cursor: grab;
        padding: var(--space-xs);
        flex-shrink: 0;
        color: var(--text-ghost);
        transition: color var(--transition-fast);
      }

      .sortable__handle:hover { color: var(--text-muted); }
      .sortable__handle:active { cursor: grabbing; }

      .sortable__grip-row {
        display: flex;
        gap: 2px;
      }

      .sortable__grip-dot {
        width: 3px;
        height: 3px;
        border-radius: var(--radius-full);
        background: currentColor;
      }

      .sortable__content {
        flex: 1;
        min-width: 0;
      }

      /* Hidden default slot for collecting children */
      .sortable__slot-host { display: none; }

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
    this.disabled = false;
    this._items = [];
    this._dragIndex = -1;
    this._overIndex = -1;
    this._kbSelected = -1;
    this._kbMoving = false;
  }

  /* ---- Slot management ---- */

  _onSlotChange(e) {
    const children = e.target.assignedElements({ flatten: true });
    this._items = children.map((el, i) => ({
      node: el,
      originalIndex: i,
    }));
  }

  /* ---- Drag and drop ---- */

  _onDragStart(e, index) {
    if (this.disabled) return;
    this._dragIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }

  _onDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index === this._dragIndex) {
      this._overIndex = -1;
      return;
    }
    this._overIndex = index;
  }

  _onDragLeave() {
    this._overIndex = -1;
  }

  _onDrop(e, dropIndex) {
    e.preventDefault();
    this._overIndex = -1;
    const from = this._dragIndex;
    if (from < 0 || from === dropIndex) return;
    this._moveItem(from, dropIndex);
  }

  _onDragEnd() {
    this._dragIndex = -1;
    this._overIndex = -1;
  }

  /* ---- Keyboard reorder ---- */

  _onKeydown(e, index) {
    if (this.disabled) return;

    switch (e.key) {
      case ' ':
      case 'Space':
        e.preventDefault();
        if (this._kbMoving) {
          // Confirm placement
          this._kbMoving = false;
          this._kbSelected = -1;
          this._fireOrderChange();
        } else {
          // Select item for moving
          this._kbSelected = index;
          this._kbMoving = false;
        }
        break;

      case 'Enter':
        if (this._kbSelected === index && !this._kbMoving) {
          e.preventDefault();
          this._kbMoving = true;
        } else if (this._kbMoving) {
          e.preventDefault();
          this._kbMoving = false;
          this._kbSelected = -1;
          this._fireOrderChange();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this._kbMoving = false;
        this._kbSelected = -1;
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (this._kbMoving && this._kbSelected > 0) {
          const from = this._kbSelected;
          this._moveItemInPlace(from, from - 1);
          this._kbSelected = from - 1;
          this._focusItem(this._kbSelected);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (this._kbMoving && this._kbSelected < this._items.length - 1) {
          const from = this._kbSelected;
          this._moveItemInPlace(from, from + 1);
          this._kbSelected = from + 1;
          this._focusItem(this._kbSelected);
        }
        break;

      default:
        break;
    }
  }

  /* ---- Reordering helpers ---- */

  _moveItem(from, to) {
    const items = [...this._items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    this._items = items;
    this._dragIndex = -1;
    this._fireOrderChange();
  }

  _moveItemInPlace(from, to) {
    const items = [...this._items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    this._items = items;
  }

  _fireOrderChange() {
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { order: this._items.map(item => item.originalIndex) },
      bubbles: true,
      composed: true,
    }));
  }

  _focusItem(index) {
    this.updateComplete.then(() => {
      const items = this.shadowRoot.querySelectorAll('.sortable__item');
      items[index]?.focus();
    });
  }

  /* ---- Render ---- */

  _renderGripDots() {
    // 3 rows x 2 dots = 6-dot grip icon
    return html`
      ${[0, 1, 2].map(() => html`
        <div class="sortable__grip-row">
          <span class="sortable__grip-dot"></span>
          <span class="sortable__grip-dot"></span>
        </div>
      `)}
    `;
  }

  render() {
    return html`
      <div class="sortable__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div
        class="sortable"
        part="list"
        role="listbox"
        aria-roledescription="sortable list"
        aria-label="Sortable list"
      >
        ${this._items.map((item, i) => {
          const isDragging = i === this._dragIndex;
          const isOverBefore = i === this._overIndex && this._dragIndex > i;
          const isOverAfter = i === this._overIndex && this._dragIndex < i;
          const isKbSelected = i === this._kbSelected && !this._kbMoving;
          const isKbMoving = i === this._kbSelected && this._kbMoving;

          return html`
            <div
              class="sortable__item
                ${isDragging ? 'sortable__item--dragging' : ''}
                ${isOverBefore ? 'sortable__item--over-before' : ''}
                ${isOverAfter ? 'sortable__item--over-after' : ''}
                ${isKbSelected ? 'sortable__item--kb-selected' : ''}
                ${isKbMoving ? 'sortable__item--kb-moving' : ''}"
              part="item"
              role="option"
              tabindex="0"
              aria-grabbed=${isDragging || isKbMoving ? 'true' : 'false'}
              aria-roledescription="sortable item"
              draggable="true"
              @dragstart=${(e) => this._onDragStart(e, i)}
              @dragover=${(e) => this._onDragOver(e, i)}
              @dragleave=${this._onDragLeave}
              @drop=${(e) => this._onDrop(e, i)}
              @dragend=${this._onDragEnd}
              @keydown=${(e) => this._onKeydown(e, i)}
            >
              <div class="sortable__handle" part="handle" aria-hidden="true">
                ${this._renderGripDots()}
              </div>
              <div class="sortable__content" part="content">
                ${item.node?.textContent ?? ''}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}
