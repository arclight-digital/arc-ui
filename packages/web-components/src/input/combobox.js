import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../shared/option.js';

/**
 * @tag arc-combobox
 */
export class ArcCombobox extends LitElement {
  static properties = {
    value:        { type: String, reflect: true },
    placeholder:  { type: String },
    label:        { type: String },
    disabled:     { type: Boolean, reflect: true },
    _query:       { state: true },
    _open:        { state: true },
    _activeIndex: { state: true },
    _options:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        position: relative;
        font-family: var(--font-body);
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      .combobox__label {
        display: block;
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--space-xs);
        letter-spacing: 0.5px;
      }

      .combobox__wrapper {
        position: relative;
      }

      .combobox__input {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .combobox__input::placeholder {
        color: var(--text-muted);
      }

      .combobox__input:focus {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      .combobox__listbox {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        max-height: 220px;
        overflow-y: auto;
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        z-index: 1000;
        padding: var(--space-xs) 0;
        display: none;
      }

      .combobox__listbox--open {
        display: block;
      }

      .combobox__option {
        display: block;
        width: 100%;
        text-align: left;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: none;
        border: none;
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .combobox__option:hover,
      .combobox__option--active {
        background: rgba(var(--accent-primary-rgb), 0.1);
      }

      .combobox__option--selected {
        color: var(--accent-primary);
      }

      .combobox__option:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .combobox__empty {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .combobox__slot-host { display: none; }

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

  static _idCounter = 0;

  constructor() {
    super();
    this.value = '';
    this.placeholder = '';
    this.label = '';
    this.disabled = false;
    this._query = '';
    this._open = false;
    this._activeIndex = -1;
    this._options = [];
    this._comboId = `combobox-${++ArcCombobox._idCounter}`;
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onDocClick, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocClick, true);
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
  }

  _onDocClick(e) {
    if (!e.composedPath().includes(this)) {
      this._open = false;
    }
  }

  get _normalizedItems() {
    return this._options.map(opt => ({ label: opt.label, value: opt.value }));
  }

  get _filteredItems() {
    const q = this._query.toLowerCase();
    if (!q) return this._normalizedItems;
    return this._normalizedItems.filter(item =>
      item.label.toLowerCase().includes(q)
    );
  }

  _onInput(e) {
    this._query = e.target.value;
    this._open = true;
    this._activeIndex = -1;
  }

  _onFocus() {
    this._open = true;
  }

  _selectItem(item) {
    this.value = item.value;
    this._query = item.label;
    this._open = false;
    this._activeIndex = -1;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: item.value, item },
      bubbles: true,
      composed: true,
    }));
  }

  _onKeyDown(e) {
    const items = this._filteredItems;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this._open) { this._open = true; return; }
        this._activeIndex = Math.min(this._activeIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._activeIndex = Math.max(this._activeIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (this._activeIndex >= 0 && items[this._activeIndex]) {
          this._selectItem(items[this._activeIndex]);
        }
        break;
      case 'Escape':
        this._open = false;
        this._activeIndex = -1;
        break;
    }
  }

  updated(changed) {
    if (changed.has('value') && !this._open) {
      const item = this._normalizedItems.find(i => i.value === this.value);
      if (item) this._query = item.label;
    }
  }

  render() {
    const filtered = this._filteredItems;
    const listboxId = `${this._comboId}-listbox`;
    const activeId = this._activeIndex >= 0 ? `${this._comboId}-opt-${this._activeIndex}` : undefined;

    return html`
      <div class="combobox__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this.label ? html`<label class="combobox__label" for="${this._comboId}-input" part="label">${this.label}</label>` : ''}
      <div class="combobox__wrapper" part="wrapper">
        <input
          id="${this._comboId}-input"
          class="combobox__input"
          type="text"
          role="combobox"
          autocomplete="off"
          .value=${this._query}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-expanded=${String(this._open)}
          aria-controls=${listboxId}
          aria-activedescendant=${activeId || ''}
          aria-autocomplete="list"
          @input=${this._onInput}
          @focus=${this._onFocus}
          @keydown=${this._onKeyDown}
          part="input"
        />
        <div
          id=${listboxId}
          class="combobox__listbox ${this._open ? 'combobox__listbox--open' : ''}"
          role="listbox"
          part="listbox"
        >
          ${filtered.length > 0
            ? filtered.map((item, i) => html`
                <button
                  id="${this._comboId}-opt-${i}"
                  class="combobox__option ${i === this._activeIndex ? 'combobox__option--active' : ''} ${item.value === this.value ? 'combobox__option--selected' : ''}"
                  role="option"
                  aria-selected=${item.value === this.value ? 'true' : 'false'}
                  @click=${() => this._selectItem(item)}
                  part="option"
                >${item.label}</button>
              `)
            : html`<div class="combobox__empty">No results found</div>`
          }
        </div>
      </div>
    `;
  }
}
