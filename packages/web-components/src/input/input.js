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
    multiline:   { type: Boolean },
    rows:        { type: Number },
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

      .input-group__field {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 300;
        color: var(--text-primary);
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
        width: 100%;
      }

      textarea.input-group__field { resize: vertical; }

      .input-group__field::placeholder { color: var(--text-ghost); }
      .input-group__field:hover:not(:focus) { border-color: var(--border-bright); }
      .input-group__field:focus {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
        background: var(--bg-card);
      }
      .input-group__field:disabled { opacity: 0.4; cursor: not-allowed; }

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
    this.multiline = false;
    this.rows = 5;
    this._fieldId = `arc-input-${++inputIdCounter}`;
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

    return html`
      <div class="input-group">
        ${this.label ? html`<label class="input-group__label" for=${id} part="label">${this.label}</label>` : ''}
        ${field}
      </div>
    `;
  }
}

customElements.define('arc-input', ArcInput);
