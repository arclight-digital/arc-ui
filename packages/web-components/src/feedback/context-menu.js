import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../shared/menu-item.js';
import '../shared/menu-divider.js';
import '../content/icon.js';
import '../content/separator.js';

/**
 * @tag arc-context-menu
 */
export class ArcContextMenu extends LitElement {
  static properties = {
    open:           { type: Boolean, reflect: true },
    _x:             { state: true },
    _y:             { state: true },
    _activeIndex:   { state: true },
    _children:      { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-max);
      }

      .menu {
        position: fixed;
        z-index: var(--z-max);
        min-width: 180px;
        max-width: 280px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        padding: var(--space-xs) 0;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        animation: menu-in 100ms ease-out;
        outline: none;
      }

      @keyframes menu-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--touch-pad) var(--space-md);
        min-height: var(--touch-min);
        color: var(--text-secondary);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-family: inherit;
        font-size: inherit;
        line-height: 1.5;
      }

      .menu-item:hover,
      .menu-item.active {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .menu-item:focus-visible {
        outline: none;
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .menu-item.disabled {
        color: var(--text-muted);
        opacity: 0.5;
        cursor: default;
      }

      .menu-item.disabled:hover {
        background: none;
        color: var(--text-muted);
      }

      .item-icon {
        flex-shrink: 0;
        width: 16px;
        text-align: center;
        font-size: var(--text-sm);
      }

      .item-label {
        flex: 1;
      }

      .item-shortcut {
        flex-shrink: 0;
        font-size: var(--text-sm);
        color: var(--text-muted);
        font-family: var(--font-mono);
      }

      arc-separator {
        margin: var(--space-xs) 0;
      }

      .slot-host { display: none; }

      @media (prefers-reduced-motion: reduce) {
        .menu { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this._x = 0;
    this._y = 0;
    this._activeIndex = -1;
    this._children = [];

    this._handleContextMenu = this._handleContextMenu.bind(this);
    this._parentRef = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._parentRef = this.parentElement;
    if (this._parentRef) {
      this._parentRef.addEventListener('contextmenu', this._handleContextMenu);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._parentRef) {
      this._parentRef.removeEventListener('contextmenu', this._handleContextMenu);
      this._parentRef = null;
    }
  }

  _onSlotChange(e) {
    this._children = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-MENU-ITEM' || el.tagName === 'ARC-MENU-DIVIDER');
  }

  get _menuItems() {
    return this._children.filter(el => el.tagName === 'ARC-MENU-ITEM' && !el.disabled);
  }

  get _selectableItems() {
    return this._menuItems.map((item, i) => ({ item, index: this._children.indexOf(item) }));
  }

  _handleContextMenu(e) {
    e.preventDefault();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const menuWidth = 220;
    const menuHeight = this._children.length * 32;

    this._x = e.clientX + menuWidth > vw ? vw - menuWidth - 8 : e.clientX;
    this._y = e.clientY + menuHeight > vh ? vh - menuHeight - 8 : e.clientY;
    this._activeIndex = -1;

    this.open = true;

    this.dispatchEvent(new CustomEvent('arc-open', {
      bubbles: true,
      composed: true,
    }));

    this.updateComplete.then(() => {
      this.shadowRoot.querySelector('.menu')?.focus();
    });
  }

  _close() {
    this.open = false;
    this._activeIndex = -1;

    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _selectItem(item, index) {
    if (item.disabled || item.tagName === 'ARC-MENU-DIVIDER') return;

    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { item: { label: item.label, shortcut: item.shortcut, icon: item.icon }, index },
      bubbles: true,
      composed: true,
    }));

    this._close();
  }

  _handleKeydown(e) {
    const selectable = this._selectableItems;
    if (selectable.length === 0) return;

    const currentSelectableIdx = selectable.findIndex(s => s.index === this._activeIndex);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = currentSelectableIdx < selectable.length - 1 ? currentSelectableIdx + 1 : 0;
        this._activeIndex = selectable[next].index;
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = currentSelectableIdx > 0 ? currentSelectableIdx - 1 : selectable.length - 1;
        this._activeIndex = selectable[prev].index;
        break;
      }
      case 'Home': {
        e.preventDefault();
        this._activeIndex = selectable[0].index;
        break;
      }
      case 'End': {
        e.preventDefault();
        this._activeIndex = selectable[selectable.length - 1].index;
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (this._activeIndex >= 0) {
          this._selectItem(this._children[this._activeIndex], this._activeIndex);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        this._close();
        break;
      }
    }
  }

  render() {
    if (!this.open) {
      return html`
        <div class="slot-host"><slot @slotchange=${this._onSlotChange}></slot></div>
        <slot name="content"></slot>
      `;
    }

    return html`
      <div class="slot-host"><slot @slotchange=${this._onSlotChange}></slot></div>
      <slot name="content"></slot>
      <div class="backdrop" @click=${this._close}></div>
      <div
        class="menu"
        part="menu"
        role="menu"
        tabindex="-1"
        style="left: ${this._x}px; top: ${this._y}px"
        @keydown=${this._handleKeydown}
      >
        ${this._children.map((child, i) => {
          if (child.tagName === 'ARC-MENU-DIVIDER') {
            return html`<arc-separator part="divider"></arc-separator>`;
          }

          return html`
            <button
              class="menu-item ${child.disabled ? 'disabled' : ''} ${i === this._activeIndex ? 'active' : ''}"
              role="menuitem"
              ?disabled=${child.disabled}
              aria-disabled=${child.disabled ? 'true' : 'false'}
              tabindex="-1"
              @click=${() => this._selectItem(child, i)}
              @pointerenter=${() => { this._activeIndex = i; }}
            >
              ${child.icon ? html`<arc-icon name=${child.icon} size="16" class="item-icon" aria-hidden="true"></arc-icon>` : ''}
              <span class="item-label">${child.label}</span>
              ${child.shortcut ? html`<span class="item-shortcut">${child.shortcut}</span>` : ''}
            </button>
          `;
        })}
      </div>
    `;
  }
}
