import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { ClickOutsideController } from '../shared/click-outside.js';
import '../shared/option.js';

/**
 * Searchable dropdown with type-ahead filtering.
 *
 * @tag arc-combobox
 * @prop {string} value - The currently selected option value. Reflected as an attribute so it can be read from the DOM. Updated automatically when the user selects an option.
 * @prop {string} placeholder - Placeholder text shown in the input when no value is entered.
 * @prop {string} label - Visible label rendered above the input. Also used as the accessible label for the combobox.
 * @prop {boolean} disabled - Disables the input and prevents interaction. The host element receives reduced opacity and pointer-events: none.
 * @fires arc-change - Fired when an option is selected. `event.detail.value` contains the selected option value.
 * @slot - Default content.
 * @csspart label
 * @csspart wrapper
 * @csspart input
 * @csspart listbox
 * @csspart option
 */
export class ArcCombobox extends FormControlMixin(LitElement) {
  static properties = {
    value:        { type: String, reflect: true },
    placeholder:  { type: String },
    label:        { type: String },
    name:         { type: String, reflect: true },
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
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-shadow: var(--shadow-inset);
      }

      .combobox__input::placeholder {
        color: var(--text-muted);
      }

      .combobox__input:hover:not(:focus) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .combobox__input:focus {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      @keyframes dropdown-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .combobox__listbox {
        position: absolute;
        top: calc(100% + 4px);
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

      .combobox__listbox--open {
        display: block;
        animation: dropdown-in var(--transition-fast);
      }

      .combobox__listbox::before {
        content: '';
        display: block;
        height: 1px;
        background: var(--divider-glow);
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
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .combobox__option--selected {
        color: var(--interactive);
      }

      .combobox__option:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
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
    this.name = '';
    this.disabled = false;
    this._query = '';
    this._open = false;
    this._activeIndex = -1;
    this._options = [];
    this._comboId = `combobox-${++ArcCombobox._idCounter}`;
    this._clickOutside = new ClickOutsideController(this, {
      onClickOutside: () => { this._open = false; },
    });
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
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
      case 'Home':
        if (this._open && items.length > 0 && !this._query) {
          e.preventDefault();
          this._activeIndex = 0;
        }
        break;
      case 'End':
        if (this._open && items.length > 0 && !this._query) {
          e.preventDefault();
          this._activeIndex = items.length - 1;
        }
        break;
    }
  }

  updated(changed) {
    if (changed.has('value')) {
      this._updateFormValue();
      if (!this._open) {
        const item = this._normalizedItems.find(i => i.value === this.value);
        if (item) this._query = item.label;
      }
    }
    if (changed.has('_open')) {
      if (this._open) this._clickOutside.activate();
      else this._clickOutside.deactivate();
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
