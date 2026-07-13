import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { tokenStyles } from '../shared-styles.js';
import './tag.js';

/**
 * @tag arc-kanban
 * @requires arc-tag
 */
export class ArcKanban extends LitElement {
  static properties = {
    columns:      { type: Array },
    disabled:     { type: Boolean, reflect: true },
    _cols:        { state: true },
    _drag:        { state: true },
    _dropTarget:  { state: true },
    _kbCard:      { state: true },
    _activeIdx:   { state: true },
    _announcement:{ state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .kanban {
        display: flex;
        align-items: flex-start;
        gap: var(--space-md);
        overflow-x: auto;
        padding-bottom: var(--space-sm);
      }

      .kanban__column {
        flex: 0 0 auto;
        width: 280px;
        min-width: 280px;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-sm);
        background: var(--surface-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
      }

      .kanban__column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        padding: var(--space-xs) var(--space-xs) 0;
      }

      .kanban__column-title {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .kanban__count {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        line-height: 1.4;
        color: var(--text-muted);
        background: var(--surface-hover);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-full);
        padding: 1px var(--space-sm);
        flex-shrink: 0;
      }

      .kanban__count--over {
        color: var(--color-error);
        border-color: rgba(var(--color-error-rgb), 0.3);
        background: var(--color-error-subtle);
      }

      .kanban__list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        min-height: var(--touch-min);
      }

      .kanban__card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-xs);
        min-height: var(--touch-min);
        padding: var(--space-sm) calc(var(--space-sm) + var(--space-xs));
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        cursor: grab;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
        transition: box-shadow var(--transition-fast),
                    border-color var(--transition-fast),
                    opacity var(--transition-fast),
                    background var(--transition-fast);
      }

      .kanban__card:hover {
        border-color: var(--border-default);
        box-shadow: var(--shadow-sm);
      }

      .kanban__card:active { cursor: grabbing; }

      .kanban__card:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus-ring);
      }

      .kanban__card--dragging { opacity: 0.4; }

      .kanban__card--kb-moving {
        border-color: var(--interactive);
        box-shadow: 0 0 0 2px var(--interactive), var(--shadow-md);
        background: var(--surface-overlay);
      }

      /* Horizontal drop indicator line rendered in the gap between cards */
      .kanban__card--over-before::before,
      .kanban__card--over-after::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--interactive);
        border-radius: var(--radius-full);
        pointer-events: none;
      }

      .kanban__card--over-before::before { top: calc(-1px - var(--space-sm) / 2); }
      .kanban__card--over-after::after   { bottom: calc(-1px - var(--space-sm) / 2); }

      .kanban__card-label {
        font-size: var(--text-sm);
        font-weight: 500;
        line-height: 1.4;
        color: var(--text-primary);
      }

      .kanban__card-desc {
        margin: 0;
        font-size: var(--text-sm);
        line-height: 1.5;
        color: var(--text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .kanban__dropzone {
        min-height: 64px;
        border: 1px dashed var(--border-subtle);
        border-radius: var(--radius-md);
        transition: border-color var(--transition-fast), background var(--transition-fast);
      }

      .kanban__dropzone--active {
        border-color: var(--interactive);
        background: rgba(var(--interactive-rgb), 0.05);
      }

      .kanban__ghost {
        position: fixed;
        top: 0;
        left: 0;
        z-index: var(--z-max);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-xs);
        padding: var(--space-sm) calc(var(--space-sm) + var(--space-xs));
        background: var(--surface-overlay);
        border: 1px solid var(--interactive);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        opacity: 0.9;
        pointer-events: none;
        will-change: transform;
      }

      .kanban__sr {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
      }

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
    this.disabled = false;
    this._cols = [];
    this._drag = null;
    this._dropTarget = null;
    this._kbCard = null;
    this._activeIdx = {};
    this._announcement = '';
    // Non-reactive pointer bookkeeping
    this._pd = null;
    this._lastX = 0;
    this._lastY = 0;
    this._ghostX = 0;
    this._ghostY = 0;
    this._scrollDir = 0;
    this._scrollRaf = null;
  }

  willUpdate(changed) {
    if (changed.has('columns')) {
      // Internal working copy: mutated for immediate feedback, consumer syncs via events
      this._cols = (this.columns || []).map((c) => ({ ...c, items: [...(c.items || [])] }));
      this._drag = null;
      this._dropTarget = null;
      this._kbCard = null;
      this._pd = null;
      this._stopAutoScroll();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoScroll();
  }

  /* ---- Data helpers ---- */

  _findCard(cardId) {
    for (let c = 0; c < this._cols.length; c++) {
      const index = this._cols[c].items.findIndex((it) => it.id === cardId);
      if (index !== -1) return { colIndex: c, col: this._cols[c], index, item: this._cols[c].items[index] };
    }
    return null;
  }

  /** Moves a card in the internal copy. Returns null when it is a no-op. */
  _moveCard(cardId, toColumnId, index) {
    const from = this._findCard(cardId);
    // Pointer drops read the column id from dataset (string); tolerate numeric ids
    const toColIndex = this._cols.findIndex((c) => String(c.id) === String(toColumnId));
    if (!from || toColIndex === -1) return null;
    const cols = this._cols.map((c) => ({ ...c, items: [...c.items] }));
    const [item] = cols[from.colIndex].items.splice(from.index, 1);
    const target = cols[toColIndex];
    const clamped = Math.max(0, Math.min(index, target.items.length));
    if (target.id === from.col.id && clamped === from.index) return null;
    target.items.splice(clamped, 0, item);
    this._cols = cols;
    return { fromColumn: from.col.id, toColumn: target.id, index: clamped };
  }

  _fireMove(cardId, fromColumn, toColumn, index) {
    this.dispatchEvent(new CustomEvent('arc-card-move', {
      detail: { cardId, fromColumn, toColumn, index },
      bubbles: true,
      composed: true,
    }));
  }

  _announce(message) {
    this._announcement = message;
  }

  /* ---- Pointer drag ---- */

  _onCardPointerDown(e, card, col) {
    if (this.disabled || e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    this._pd = {
      id: card.id,
      colId: col.id,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      rect: el.getBoundingClientRect(),
    };
  }

  _onCardPointerMove(e) {
    const pd = this._pd;
    if (!pd || e.pointerId !== pd.pointerId) return;
    if (!this._drag) {
      // Small threshold so plain clicks never start a drag
      if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) < 5) return;
      const found = this._findCard(pd.id);
      if (!found) return;
      this._drag = {
        cardId: pd.id,
        fromColumn: pd.colId,
        fromIndex: found.index,
        width: pd.rect.width,
        offsetX: pd.x - pd.rect.left,
        offsetY: pd.y - pd.rect.top,
      };
    }
    this._lastX = e.clientX;
    this._lastY = e.clientY;
    this._positionGhost(e.clientX, e.clientY);
    this._updateDropTarget(e.clientX, e.clientY);
    this._updateAutoScroll(e.clientX);
  }

  _onCardPointerUp(e) {
    const pd = this._pd;
    if (!pd || e.pointerId !== pd.pointerId) return;
    this._pd = null;
    this._stopAutoScroll();
    if (!this._drag) {
      this.dispatchEvent(new CustomEvent('arc-card-click', {
        detail: { cardId: pd.id, columnId: pd.colId },
        bubbles: true,
        composed: true,
      }));
      return;
    }
    const drag = this._drag;
    const target = this._dropTarget;
    this._drag = null;
    this._dropTarget = null;
    if (!target) return;
    const moved = this._moveCard(drag.cardId, target.columnId, target.index);
    if (moved) {
      this._fireMove(drag.cardId, moved.fromColumn, moved.toColumn, moved.index);
      const found = this._findCard(drag.cardId);
      if (found) {
        this._announce(`${found.item.label} dropped. Position ${found.index + 1} of ${found.col.items.length} in ${found.col.title}.`);
      }
    }
  }

  _onCardPointerCancel() {
    this._pd = null;
    this._drag = null;
    this._dropTarget = null;
    this._stopAutoScroll();
  }

  _positionGhost(x, y) {
    const d = this._drag;
    if (!d) return;
    this._ghostX = x - d.offsetX;
    this._ghostY = y - d.offsetY;
    const ghost = this.shadowRoot.querySelector('.kanban__ghost');
    if (ghost) ghost.style.transform = `translate3d(${this._ghostX}px, ${this._ghostY}px, 0)`;
  }

  _updateDropTarget(x, y) {
    if (!this._drag) return;
    const hit = this.shadowRoot.elementFromPoint(x, y);
    const colEl = hit && hit.closest ? hit.closest('.kanban__column') : null;
    if (!colEl) {
      this._dropTarget = null;
      return;
    }
    const columnId = colEl.dataset.columnId;
    const cards = [...colEl.querySelectorAll('.kanban__card')]
      .filter((el) => el.dataset.cardId !== String(this._drag.cardId));
    let index = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) { index = i; break; }
    }
    const t = this._dropTarget;
    if (!t || t.columnId !== columnId || t.index !== index) {
      this._dropTarget = { columnId, index };
    }
  }

  /* ---- Horizontal auto-scroll near board edges ---- */

  _updateAutoScroll(x) {
    const board = this.shadowRoot.querySelector('.kanban');
    if (!board) return;
    const r = board.getBoundingClientRect();
    const edge = 48;
    let dir = 0;
    if (x < r.left + edge) dir = -1;
    else if (x > r.right - edge) dir = 1;
    this._scrollDir = dir;
    if (dir && !this._scrollRaf) {
      this._scrollRaf = requestAnimationFrame(this._autoScrollTick);
    }
  }

  _autoScrollTick = () => {
    this._scrollRaf = null;
    if (!this._scrollDir || !this._drag) return;
    const board = this.shadowRoot.querySelector('.kanban');
    if (!board) return;
    board.scrollLeft += this._scrollDir * 12;
    this._updateDropTarget(this._lastX, this._lastY);
    this._scrollRaf = requestAnimationFrame(this._autoScrollTick);
  };

  _stopAutoScroll() {
    this._scrollDir = 0;
    if (this._scrollRaf) {
      cancelAnimationFrame(this._scrollRaf);
      this._scrollRaf = null;
    }
  }

  /* ---- Keyboard move protocol ---- */

  _onCardKeydown(e, card, col, colIndex, index) {
    if (this.disabled) return;
    const grabbed = this._kbCard && this._kbCard.cardId === card.id;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (grabbed) this._kbDrop(card);
      else if (!this._kbCard) this._kbGrab(card, col, index);
      return;
    }
    if (e.key === 'Escape') {
      if (grabbed) {
        e.preventDefault();
        this._kbCancel(card);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (grabbed) this._kbMoveWithin(card, colIndex, index - 1);
        else this._focusSibling(col, index - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (grabbed) this._kbMoveWithin(card, colIndex, index + 1);
        else this._focusSibling(col, index + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (grabbed) this._kbMoveAcross(card, colIndex, -1, index);
        else this._focusColumn(colIndex, -1, index);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (grabbed) this._kbMoveAcross(card, colIndex, 1, index);
        else this._focusColumn(colIndex, 1, index);
        break;
      case 'Home':
        e.preventDefault();
        if (grabbed) this._kbMoveWithin(card, colIndex, 0);
        else this._focusSibling(col, 0);
        break;
      case 'End':
        e.preventDefault();
        if (grabbed) this._kbMoveWithin(card, colIndex, col.items.length - 1);
        else this._focusSibling(col, col.items.length - 1);
        break;
      default:
        break;
    }
  }

  _kbGrab(card, col, index) {
    this._kbCard = { cardId: card.id, originColumn: col.id, originIndex: index };
    this._announce(
      `${card.label} grabbed. Position ${index + 1} of ${col.items.length} in ${col.title}. ` +
      `Use arrow keys to move, Enter to drop, Escape to cancel.`
    );
  }

  _kbDrop(card) {
    const kb = this._kbCard;
    this._kbCard = null;
    const found = this._findCard(card.id);
    if (!found) return;
    this._announce(`${card.label} dropped. Position ${found.index + 1} of ${found.col.items.length} in ${found.col.title}.`);
    if (found.col.id !== kb.originColumn || found.index !== kb.originIndex) {
      this._fireMove(card.id, kb.originColumn, found.col.id, found.index);
    }
  }

  _kbCancel(card) {
    const kb = this._kbCard;
    this._kbCard = null;
    this._moveCard(card.id, kb.originColumn, kb.originIndex);
    this._setActive(kb.originColumn, kb.originIndex);
    this._focusCard(card.id);
    const origin = this._cols.find((c) => c.id === kb.originColumn);
    this._announce(`Move cancelled. ${card.label} returned to position ${kb.originIndex + 1} in ${origin ? origin.title : ''}.`);
  }

  _kbMoveWithin(card, colIndex, newIndex) {
    const col = this._cols[colIndex];
    if (!col) return;
    const clamped = Math.max(0, Math.min(newIndex, col.items.length - 1));
    const moved = this._moveCard(card.id, col.id, clamped);
    if (!moved) return;
    this._setActive(col.id, clamped);
    this._focusCard(card.id);
    this._announce(`${card.label}, position ${clamped + 1} of ${col.items.length} in ${col.title}.`);
  }

  _kbMoveAcross(card, colIndex, dir, index) {
    const target = this._cols[colIndex + dir];
    if (!target) return;
    const insertAt = Math.min(index, target.items.length);
    const moved = this._moveCard(card.id, target.id, insertAt);
    if (!moved) return;
    this._setActive(target.id, insertAt);
    this._focusCard(card.id);
    this._announce(`${card.label}, position ${insertAt + 1} of ${target.items.length + 1} in ${target.title}.`);
  }

  /* ---- Roving focus (one tab stop per column) ---- */

  _setActive(colId, index) {
    if ((this._activeIdx[colId] ?? 0) === index) return;
    this._activeIdx = { ...this._activeIdx, [colId]: index };
  }

  _focusSibling(col, index) {
    const clamped = Math.max(0, Math.min(index, col.items.length - 1));
    const item = col.items[clamped];
    if (!item) return;
    this._setActive(col.id, clamped);
    this._focusCard(item.id);
  }

  _focusColumn(colIndex, dir, index) {
    for (let c = colIndex + dir; c >= 0 && c < this._cols.length; c += dir) {
      const col = this._cols[c];
      if (col.items.length > 0) {
        const target = Math.min(index, col.items.length - 1);
        this._setActive(col.id, target);
        this._focusCard(col.items[target].id);
        return;
      }
    }
  }

  _focusCard(cardId) {
    this.updateComplete.then(() => {
      const el = this.shadowRoot.querySelector(`.kanban__card[data-card-id="${CSS.escape(String(cardId))}"]`);
      if (el) {
        el.focus();
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
  }

  /* ---- Render ---- */

  _renderCardContent(card) {
    return html`
      <span class="kanban__card-label" part="card-label">${card.label}</span>
      ${card.description
        ? html`<p class="kanban__card-desc" part="card-description">${card.description}</p>`
        : null}
      ${card.tag
        ? html`<arc-tag size="sm" variant=${card.variant || 'default'}>${card.tag}</arc-tag>`
        : null}
    `;
  }

  _renderCard(card, index, col, colIndex, ctx) {
    const grabbed = this._kbCard && this._kbCard.cardId === card.id;
    const classes = [
      'kanban__card',
      ctx.dragId === card.id ? 'kanban__card--dragging' : '',
      grabbed ? 'kanban__card--kb-moving' : '',
      ctx.beforeId === card.id ? 'kanban__card--over-before' : '',
      ctx.afterId === card.id ? 'kanban__card--over-after' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div
        class=${classes}
        part="card"
        role="listitem"
        tabindex=${index === ctx.activeIdx ? '0' : '-1'}
        data-card-id=${card.id}
        aria-roledescription="draggable card"
        aria-describedby="kb-instructions"
        @pointerdown=${(e) => this._onCardPointerDown(e, card, col)}
        @pointermove=${(e) => this._onCardPointerMove(e)}
        @pointerup=${(e) => this._onCardPointerUp(e)}
        @pointercancel=${() => this._onCardPointerCancel()}
        @keydown=${(e) => this._onCardKeydown(e, card, col, colIndex, index)}
        @focus=${() => this._setActive(col.id, index)}
      >
        ${this._renderCardContent(card)}
      </div>
    `;
  }

  _renderColumn(col, colIndex) {
    const items = col.items || [];
    const count = items.length;
    const over = col.limit != null && count > col.limit;
    const dragId = this._drag ? this._drag.cardId : null;
    const t = this._dropTarget;

    let beforeId = null;
    let afterId = null;
    let zoneActive = false;
    if (this._drag && t && t.columnId === String(col.id)) {
      const noop = t.columnId === String(this._drag.fromColumn) && t.index === this._drag.fromIndex;
      if (!noop) {
        const ids = items.map((i) => i.id).filter((id) => id !== dragId);
        if (ids.length === 0) zoneActive = true;
        else if (t.index < ids.length) beforeId = ids[t.index];
        else afterId = ids[ids.length - 1];
      }
    }

    const activeIdx = Math.min(this._activeIdx[col.id] ?? 0, Math.max(0, count - 1));

    return html`
      <div
        class="kanban__column"
        part="column"
        role="group"
        aria-label=${col.title}
        data-column-id=${col.id}
      >
        <div class="kanban__column-header" part="column-header">
          <span class="kanban__column-title" part="column-title">${col.title}</span>
          <span
            class="kanban__count ${over ? 'kanban__count--over' : ''}"
            part="column-count"
          >${col.limit != null ? `${count}/${col.limit}` : count}</span>
        </div>
        <div class="kanban__list" part="list" role="list" aria-label=${col.title}>
          ${count === 0
            ? html`<div
                class="kanban__dropzone ${zoneActive ? 'kanban__dropzone--active' : ''}"
                part="dropzone"
                aria-hidden="true"
              ></div>`
            : null}
          ${repeat(items, (i) => i.id, (card, i) =>
            this._renderCard(card, i, col, colIndex, { dragId, beforeId, afterId, activeIdx }))}
        </div>
      </div>
    `;
  }

  _renderGhost() {
    const d = this._drag;
    if (!d) return null;
    const found = this._findCard(d.cardId);
    if (!found) return null;
    return html`
      <div
        class="kanban__ghost"
        style="width:${d.width}px; transform: translate3d(${this._ghostX}px, ${this._ghostY}px, 0)"
      >
        ${this._renderCardContent(found.item)}
      </div>
    `;
  }

  render() {
    return html`
      <div class="kanban" part="board">
        ${repeat(this._cols, (c) => c.id, (col, i) => this._renderColumn(col, i))}
      </div>
      ${this._renderGhost()}
      <div class="kanban__sr" id="kb-instructions">
        Press Enter or Space to pick up a card, arrow keys to move it, Enter to drop, Escape to cancel.
      </div>
      <div class="kanban__sr" role="status" aria-live="polite">${this._announcement}</div>
    `;
  }
}
