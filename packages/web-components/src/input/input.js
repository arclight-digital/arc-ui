import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

let inputIdCounter = 0;

export class ArcInput extends LitElement {
  static formAssociated = true;

  static properties = {
    type:        { type: String },
    name:        { type: String },
    label:       { type: String },
    placeholder: { type: String },
    value:       { type: String },
    disabled:    { type: Boolean, reflect: true },
    required:    { type: Boolean },
    error:       { type: String },
    size:        { type: String, reflect: true },
    multiline:   { type: Boolean },
    rows:        { type: Number },
    _hasPrefix:  { state: true },
    _hasSuffix:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .input-group__label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .input-group__wrapper {
        display: flex;
        align-items: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
        width: 100%;
      }

      .input-group__wrapper:hover:not(:focus-within) { border-color: var(--border-bright); }
      .input-group__wrapper:focus-within {
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
        background: var(--bg-card);
      }

      :host([disabled]) .input-group__wrapper { opacity: 0.4; cursor: not-allowed; }

      /* Error state */
      .input-group--error .input-group__wrapper {
        border-color: var(--color-error);
      }

      .input-group--error .input-group__wrapper:focus-within {
        border-color: var(--color-error);
        box-shadow: 0 0 0 2px var(--bg-deep), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2);
      }

      .input-group__error {
        font-size: var(--text-xs);
        color: var(--color-error);
        line-height: 1.4;
      }

      /* Sizes */
      :host([size="sm"]) .input-group__field { padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); }
      :host([size="sm"]) .input-group__label { font-size: calc(var(--label-inline-size) - 1px); }
      :host([size="lg"]) .input-group__field { padding: var(--space-md) var(--space-lg); font-size: var(--text-md); }

      .input-group__field {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 300;
        color: var(--text-primary);
        background: transparent;
        border: none;
        padding: var(--space-sm) var(--space-md);
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
      }

      .input-group__field:focus { outline: none; }
      .input-group__field::placeholder { color: var(--text-ghost); }
      .input-group__field:disabled { cursor: not-allowed; }

      textarea.input-group__field { resize: vertical; }

      .input-group__prefix,
      .input-group__suffix {
        display: flex;
        align-items: center;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .input-group__prefix { padding-left: var(--space-md); }
      .input-group__suffix { padding-right: var(--space-md); }

      .input-group__prefix--empty,
      .input-group__suffix--empty { display: none; }

      ::slotted([slot="prefix"]),
      ::slotted([slot="suffix"]) {
        width: 20px;
        height: 20px;
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
    this._internals = this.attachInternals();
    this.type = 'text';
    this.name = '';
    this.label = '';
    this.placeholder = '';
    this.value = '';
    this.disabled = false;
    this.required = false;
    this.error = '';
    this.size = 'md';
    this.multiline = false;
    this.rows = 5;
    this._fieldId = `arc-input-${++inputIdCounter}`;
    this._hasPrefix = false;
    this._hasSuffix = false;
  }

  updated(changed) {
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
    }
  }

  _handleInput(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('arc-input', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('arc-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  render() {
    const id = this.name || this._fieldId;
    const field = this.multiline
      ? html`<textarea
          class="input-group__field"
          id=${id}
          name=${this.name}
          placeholder=${this.placeholder}
          rows=${this.rows}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-required=${this.required ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          .value=${this.value}
          @input=${this._handleInput}
          @change=${this._handleChange}
          part="field"
        ></textarea>`
      : html`<input
          class="input-group__field"
          type=${this.type}
          id=${id}
          name=${this.name}
          placeholder=${this.placeholder}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-required=${this.required ? 'true' : 'false'}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          .value=${this.value}
          @input=${this._handleInput}
          @change=${this._handleChange}
          part="field"
        />`;

    const hasError = !!this.error;

    return html`
      <div class="input-group ${hasError ? 'input-group--error' : ''}">
        ${this.label ? html`<label class="input-group__label" for=${id} part="label">${this.label}</label>` : ''}
        <div class="input-group__wrapper" part="wrapper">
          <div class="input-group__prefix ${this._hasPrefix ? '' : 'input-group__prefix--empty'}" part="prefix">
            <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
          </div>
          ${field}
          <div class="input-group__suffix ${this._hasSuffix ? '' : 'input-group__suffix--empty'}" part="suffix">
            <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
          </div>
        </div>
        ${hasError ? html`<span class="input-group__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}

customElements.define('arc-input', ArcInput);
