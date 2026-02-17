import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../shared/option.js';

/**
 * @tag arc-multi-select
 */
export class ArcMultiSelect extends LitElement {
  static properties = {
    value:        { type: Array },
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

      .ms__label {
        display: block;
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .ms__control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-xs);
        min-height: 38px;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-xs) var(--space-sm);
        cursor: text;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-inset);
      }

      .ms__control:hover:not(.ms__control--focused) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .ms__control--focused {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      .ms__tag {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--text-primary);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        padding: 2px calc(var(--space-xs) + 2px) 2px calc(var(--space-sm) + 2px); /* cosmetic 2px vertical for inline tag */
        white-space: nowrap;
      }

      .ms__tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border: none;
        background: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--radius-full);
        font-size: var(--text-sm);
        line-height: 1;
        padding: 0;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .ms__tag-remove:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ms__input {
        flex: 1;
        min-width: 60px;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        background: none;
        border: none;
        outline: none;
        padding: var(--space-xs) 0;
      }

      .ms__input::placeholder {
        color: var(--text-muted);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .ms__dropdown {
        position: absolute;
        top: calc(100% + var(--space-xs));
        left: 0;
        right: 0;
        max-height: 220px;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        z-index: var(--z-dropdown);
        padding: var(--space-xs) 0;
        display: none;
      }

      .ms__dropdown--open {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .ms__dropdown::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
      }

      .ms__option {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
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

      .ms__option:hover,
      .ms__option--active {
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .ms__option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      .ms__check {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: var(--interactive);
        opacity: 0;
      }

      .ms__check--visible {
        opacity: 1;
      }

      .ms__empty {
        padding: var(--space-sm) var(--space-md);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .ms__slot-host { display: none; }

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
    this.value = [];
    this.placeholder = '';
    this.label = '';
    this.disabled = false;
    this._query = '';
    this._open = false;
    this._activeIndex = -1;
    this._focused = false;
    this._options = [];
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
      this._focused = false;
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

  _isSelected(item) {
    return (this.value || []).includes(item.value);
  }

  _toggleItem(item) {
    const current = [...(this.value || [])];
    const idx = current.indexOf(item.value);

    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(item.value);
    }

    this.value = current;
    this._query = '';
    this._activeIndex = -1;

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _removeItem(val, e) {
    e.stopPropagation();
    this.value = (this.value || []).filter(v => v !== val);

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onInput(e) {
    this._query = e.target.value;
    this._open = true;
    this._activeIndex = -1;
  }

  _onFocusIn() {
    this._focused = true;
    this._open = true;
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
          this._toggleItem(items[this._activeIndex]);
        }
        break;
      case 'Escape':
        this._open = false;
        this._activeIndex = -1;
        break;
      case 'Backspace':
        if (!this._query && this.value && this.value.length > 0) {
          this._removeItem(this.value[this.value.length - 1], e);
        }
        break;
    }
  }

  _getLabel(val) {
    const item = this._normalizedItems.find(i => i.value === val);
    return item ? item.label : val;
  }

  render() {
    const filtered = this._filteredItems;
    const selected = this.value || [];
    const showPlaceholder = selected.length === 0 && !this._query;

    return html`
      <div class="ms__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      ${this.label ? html`<label class="ms__label" part="label">${this.label}</label>` : ''}
      <div
        class="ms__control ${this._focused ? 'ms__control--focused' : ''}"
        @click=${() => this.shadowRoot.querySelector('.ms__input')?.focus()}
        part="control"
      >
        ${selected.map(val => html`
          <span class="ms__tag" part="tag">
            ${this._getLabel(val)}
            <button
              class="ms__tag-remove"
              @click=${(e) => this._removeItem(val, e)}
              aria-label="Remove ${this._getLabel(val)}"
              tabindex="-1"
            >&times;</button>
          </span>
        `)}
        <input
          class="ms__input"
          type="text"
          .value=${this._query}
          placeholder=${showPlaceholder ? this.placeholder : ''}
          ?disabled=${this.disabled}
          aria-expanded=${String(this._open)}
          @input=${this._onInput}
          @focus=${this._onFocusIn}
          @keydown=${this._onKeyDown}
          part="input"
        />
      </div>
      <div
        class="ms__dropdown ${this._open ? 'ms__dropdown--open' : ''}"
        role="listbox"
        aria-multiselectable="true"
        part="dropdown"
      >
        ${filtered.length > 0
          ? filtered.map((item, i) => {
              const checked = this._isSelected(item);
              return html`
                <button
                  class="ms__option ${i === this._activeIndex ? 'ms__option--active' : ''}"
                  role="option"
                  aria-selected=${String(checked)}
                  @click=${() => this._toggleItem(item)}
                  part="option"
                >
                  <svg class="ms__check ${checked ? 'ms__check--visible' : ''}" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${item.label}
                </button>
              `;
            })
          : html`<div class="ms__empty">No results found</div>`
        }
      </div>
    `;
  }
}
