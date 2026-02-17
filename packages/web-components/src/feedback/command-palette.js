import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { MenuKeyboardController } from '../shared/menu-keyboard.js';
import '../content/icon.js';

/**
 * @tag arc-command-palette
 * @requires arc-command-item
 */
export class ArcCommandPalette extends LitElement {
  static properties = {
    open:          { type: Boolean, reflect: true },
    placeholder:   { type: String },
    _query:        { state: true },
    _items:        { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .palette__backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-modal);
        background: var(--overlay-backdrop);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base);
      }

      :host([open]) .palette__backdrop {
        opacity: 1;
        visibility: visible;
      }

      .palette__dialog {
        position: fixed;
        z-index: var(--z-modal);
        top: 20%;
        left: 50%;
        transform: translateX(-50%) scale(0.95);
        width: 90%;
        max-width: 520px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base),
          transform var(--transition-base);
      }

      :host([open]) .palette__dialog {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) scale(1);
      }

      .palette__search {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-md);
        border-bottom: 1px solid var(--border-default);
      }

      .palette__search-icon {
        flex-shrink: 0;
        color: var(--text-muted);
      }

      .palette__input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-body);
        font-size: var(--text-md);
        color: var(--text-primary);
        caret-color: var(--accent-primary);
      }

      .palette__input::placeholder {
        color: var(--text-muted);
      }

      .palette__results {
        max-height: 300px;
        overflow-y: auto;
        padding: var(--space-xs) 0;
      }

      .palette__results:empty::after {
        content: 'No results found';
        display: block;
        padding: var(--space-lg);
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .palette__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm);
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

      .palette__item:hover,
      .palette__item.is-focused {
        background: rgba(var(--interactive-rgb), 0.08);
        color: var(--text-primary);
      }

      .palette__item-icon {
        flex-shrink: 0;
        color: var(--text-muted);
      }

      .palette__item-label {
        flex: 1;
      }

      .palette__item-shortcut {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-muted);
        opacity: 0.6;
      }

      .palette__footer {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm);
        border-top: 1px solid var(--border-default);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      .palette__footer kbd {
        display: inline-flex;
        align-items: center;
        padding: 2px calc(var(--space-xs) + 2px); /* cosmetic 2px vertical for kbd badge */
        background: var(--surface-hover);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: var(--text-xs);
      }

      .palette__slot-host { display: none; }

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
    this.placeholder = 'Type a command...';
    this._query = '';
    this._items = [];
    this._menuKb = new MenuKeyboardController(this, {
      getItemCount: () => this._filteredItems.length,
      onSelect: (i) => this._selectItem(this._filteredItems[i]),
      onClose: () => this._close(),
    });
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-COMMAND-ITEM');
  }

  get _filteredItems() {
    if (!this._query) return this._items;
    const q = this._query.toLowerCase();
    return this._items.filter(item =>
      (item.label || '').toLowerCase().includes(q)
    );
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._query = '';
        this._menuKb.reset();
        this._menuKb.focusedIndex = 0;
        this._menuKb.attach();
        document.body.style.overflow = 'hidden';
        this.updateComplete.then(() => {
          const input = this.shadowRoot.querySelector('.palette__input');
          if (input) input.focus();
        });
      } else {
        this._menuKb.detach();
        document.body.style.overflow = '';
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = '';
  }

  _onInput(e) {
    this._query = e.target.value;
    this._menuKb.focusedIndex = 0;
  }

  _selectItem(item) {
    this.dispatchEvent(new CustomEvent('arc-select', {
      detail: { item: { label: item.label, shortcut: item.shortcut } },
      bubbles: true,
      composed: true,
    }));
    this._close();
  }

  _close() {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _backdropClick() {
    this._close();
  }

  render() {
    const filtered = this._filteredItems;

    return html`
      <div class="palette__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="palette__backdrop" @click=${this._backdropClick} part="backdrop"></div>
      <div
        class="palette__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        part="dialog"
      >
        <div class="palette__search" part="search">
          <svg class="palette__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"/>
          </svg>
          <input
            class="palette__input"
            type="text"
            .value=${this._query}
            @input=${this._onInput}
            placeholder=${this.placeholder}
            aria-label="Search commands"
            autocomplete="off"
            spellcheck="false"
            part="input"
          />
        </div>
        <div class="palette__results" role="listbox" part="results">
          ${filtered.map((item, i) => html`
            <button
              class="palette__item ${i === this._menuKb.focusedIndex ? 'is-focused' : ''}"
              role="option"
              aria-selected=${i === this._menuKb.focusedIndex ? 'true' : 'false'}
              tabindex="-1"
              @click=${() => this._selectItem(item)}
              @mouseenter=${() => { this._menuKb.focusedIndex = i; }}
              part="item"
            >
              ${item.icon ? html`<arc-icon name=${item.icon} size="16" class="palette__item-icon" aria-hidden="true"></arc-icon>` : ''}
              <span class="palette__item-label">${item.label || ''}</span>
              ${item.shortcut ? html`<span class="palette__item-shortcut">${item.shortcut}</span>` : ''}
            </button>
          `)}
        </div>
        <div class="palette__footer" part="footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
  }
}
