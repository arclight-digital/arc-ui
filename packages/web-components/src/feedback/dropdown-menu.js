import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../shared/menu-item.js';
import '../shared/menu-divider.js';

/**
 * @tag arc-dropdown-menu
 */
export class ArcDropdownMenu extends LitElement {
  static properties = {
    open:          { type: Boolean, reflect: true },
    _focusedIndex: { state: true },
    _children:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }

      .dropdown__trigger {
        display: inline-block;
        cursor: pointer;
      }

      .dropdown__panel {
        position: absolute;
        z-index: 100;
        top: calc(100% + var(--space-xs));
        left: 0;
        min-width: 200px;
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs) 0;
        box-shadow: var(--shadow-overlay);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-4px);
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base),
          transform var(--transition-base);
      }

      :host([open]) .dropdown__panel {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        cursor: pointer;
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
        outline: none;
      }

      .dropdown__item:hover,
      .dropdown__item.is-focused {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      .dropdown__item:focus-visible {
        box-shadow: inset var(--focus-glow);
      }

      .dropdown__item-label {
        flex: 1;
      }

      .dropdown__item-shortcut {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--text-muted);
        opacity: 0.6;
      }

      .dropdown__divider {
        height: 1px;
        background: var(--border-default);
        margin: var(--space-xs) 0;
      }

      .dropdown__slot-host { display: none; }

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
    this.open = false;
    this._focusedIndex = -1;
    this._children = [];
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  _onSlotChange(e) {
    this._children = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-MENU-ITEM' || el.tagName === 'ARC-MENU-DIVIDER');
  }

  get _menuItems() {
    return this._children.filter(el => el.tagName === 'ARC-MENU-ITEM');
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._focusedIndex = -1;
        requestAnimationFrame(() => {
          document.addEventListener('click', this._onDocumentClick);
          document.addEventListener('keydown', this._onKeyDown);
        });
      } else {
        document.removeEventListener('click', this._onDocumentClick);
        document.removeEventListener('keydown', this._onKeyDown);
        this._focusedIndex = -1;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onDocumentClick(e) {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._close();
    }
  }

  _onKeyDown(e) {
    if (!this.open) return;

    const selectable = this._menuItems;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._focusedIndex = this._focusedIndex < selectable.length - 1
          ? this._focusedIndex + 1
          : 0;
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._focusedIndex = this._focusedIndex > 0
          ? this._focusedIndex - 1
          : selectable.length - 1;
        break;
      case 'Enter':
        e.preventDefault();
        if (this._focusedIndex >= 0 && this._focusedIndex < selectable.length) {
          this._selectItem(selectable[this._focusedIndex], this._focusedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this._close();
        break;
    }
  }

  _toggle() {
    this.open = !this.open;
  }

  _close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _selectItem(item, index) {
    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { item: { label: item.label, shortcut: item.shortcut }, index },
      bubbles: true,
      composed: true,
    }));
    this._close();
  }

  _renderChild(child, globalIndex) {
    if (child.tagName === 'ARC-MENU-DIVIDER') {
      return html`<div class="dropdown__divider" role="separator" part="divider"></div>`;
    }

    const selectableIndex = this._menuItems.indexOf(child);

    return html`
      <button
        class="dropdown__item ${selectableIndex === this._focusedIndex ? 'is-focused' : ''}"
        role="menuitem"
        tabindex="-1"
        @click=${() => this._selectItem(child, globalIndex)}
        @mouseenter=${() => { this._focusedIndex = selectableIndex; }}
        part="item"
      >
        <span class="dropdown__item-label">${child.label || ''}</span>
        ${child.shortcut ? html`<span class="dropdown__item-shortcut" part="shortcut">${child.shortcut}</span>` : ''}
      </button>
    `;
  }

  render() {
    return html`
      <div class="dropdown__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div
        class="dropdown__trigger"
        @click=${this._toggle}
        aria-haspopup="menu"
        aria-expanded=${this.open ? 'true' : 'false'}
        part="trigger"
      >
        <slot name="trigger"></slot>
      </div>
      <div
        class="dropdown__panel"
        role="menu"
        aria-hidden=${this.open ? 'false' : 'true'}
        part="panel"
      >
        ${this._children.map((child, i) => this._renderChild(child, i))}
      </div>
    `;
  }
}
