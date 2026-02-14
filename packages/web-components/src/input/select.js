import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../shared/option.js';

/**
 * @tag arc-select
 */
export class ArcSelect extends LitElement {
  static formAssociated = true;

  static properties = {
    value:       { type: String, reflect: true },
    placeholder: { type: String },
    label:       { type: String },
    name:        { type: String },
    disabled:    { type: Boolean, reflect: true },
    size:        { type: String, reflect: true },
    error:       { type: String },
    open:        { type: Boolean, reflect: true },
    _options:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; position: relative; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .select__label {
        display: block;
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
      }

      .select__trigger:hover:not(:focus-visible) { border-color: var(--border-bright); }
      .select__trigger:focus-visible {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      :host([open]) .select__trigger {
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      .select__placeholder { color: var(--text-ghost); }

      .select__chevron {
        font-size: var(--text-xs);
        color: var(--text-muted);
        transition: transform var(--transition-fast);
      }
      :host([open]) .select__chevron { transform: rotate(180deg); }

      .select__dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: var(--space-xs);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-overlay);
        max-height: 240px;
        overflow-y: auto;
        z-index: 100;
        display: none;
      }

      :host([open]) .select__dropdown { display: block; }

      .select__option {
        display: block;
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .select__option:hover,
      .select__option:focus-visible {
        background: rgba(var(--accent-primary-rgb), 0.08);
        color: var(--text-primary);
        outline: none;
      }

      .select__option[aria-selected="true"] {
        color: var(--accent-primary);
      }

      /* Sizes */
      :host([size="sm"]) .select__trigger { padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); }
      :host([size="sm"]) .select__label { font-size: calc(var(--label-inline-size) - 1px); }
      :host([size="lg"]) .select__trigger { padding: var(--space-md) var(--space-lg); font-size: var(--text-md); }

      /* Error state */
      .select--error .select__trigger {
        border-color: var(--color-error);
      }

      .select--error .select__trigger:focus-visible,
      :host([open]) .select--error .select__trigger {
        border-color: var(--color-error);
        box-shadow: 0 0 0 2px var(--bg-deep), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2);
      }

      .select__error {
        font-size: var(--text-xs);
        color: var(--color-error);
        line-height: 1.4;
        margin-top: var(--space-xs);
      }

      .select__slot-host { display: none; }

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
    this._internals = this.attachInternals();
    this.value = '';
    this.placeholder = 'Select...';
    this.label = '';
    this.name = '';
    this.disabled = false;
    this.size = 'md';
    this.error = '';
    this.open = false;
    this._options = [];
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleOutsideClick);
  }

  updated(changed) {
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
    }
    if (changed.has('open')) {
      if (this.open) {
        requestAnimationFrame(() => {
          document.addEventListener('click', this._handleOutsideClick);
        });
      } else {
        document.removeEventListener('click', this._handleOutsideClick);
      }
    }
  }

  _onSlotChange(e) {
    this._options = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-OPTION');
  }

  _handleOutsideClick(e) {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  _toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
  }

  _selectOption(opt) {
    this.value = opt.value;
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: opt.value, label: opt.label },
      bubbles: true,
      composed: true,
    }));
  }

  _handleTriggerKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.open = true;
      this.updateComplete.then(() => {
        this.shadowRoot.querySelector('.select__option')?.focus();
      });
    } else if (e.key === 'Escape') {
      this.open = false;
    }
  }

  _handleOptionKeydown(e, opt, index) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = this.shadowRoot.querySelectorAll('.select__option')[index + 1];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = this.shadowRoot.querySelectorAll('.select__option')[index - 1];
      if (prev) prev.focus();
      else this.shadowRoot.querySelector('.select__trigger')?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._selectOption(opt);
    } else if (e.key === 'Escape') {
      this.open = false;
      this.shadowRoot.querySelector('.select__trigger')?.focus();
    }
  }

  get _selectedLabel() {
    const selected = this._options.find(o => o.value === this.value);
    return selected ? selected.label : '';
  }

  render() {
    const display = this._selectedLabel;

    const hasError = !!this.error;

    return html`
      <div class="select ${hasError ? 'select--error' : ''}" part="select">
        <div class="select__slot-host">
          <slot @slotchange=${this._onSlotChange}></slot>
        </div>
        ${this.label ? html`<span class="select__label" part="label">${this.label}</span>` : ''}
        <button
          class="select__trigger"
          role="combobox"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-haspopup="listbox"
          @click=${this._toggleOpen}
          @keydown=${this._handleTriggerKeydown}
          part="trigger"
        >
          ${display
            ? html`<span>${display}</span>`
            : html`<span class="select__placeholder">${this.placeholder}</span>`
          }
          <span class="select__chevron">&#9662;</span>
        </button>
        <div class="select__dropdown" role="listbox" part="dropdown">
          ${this._options.map((opt, i) => html`
            <button
              class="select__option"
              role="option"
              aria-selected=${opt.value === this.value ? 'true' : 'false'}
              tabindex="-1"
              @click=${() => this._selectOption(opt)}
              @keydown=${(e) => this._handleOptionKeydown(e, opt, i)}
            >${opt.label}</button>
          `)}
        </div>
        ${hasError ? html`<span class="select__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}
