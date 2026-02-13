import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcTextarea extends LitElement {
  static formAssociated = true;

  static properties = {
    value:       { type: String },
    placeholder: { type: String },
    label:       { type: String },
    rows:        { type: Number },
    maxlength:   { type: Number },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    resize:      { type: String, reflect: true },
    error:       { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }
      :host([disabled]) { opacity: 0.4; pointer-events: none; }

      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      textarea {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.5;
        color: var(--text-primary);
        background: var(--bg-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
      }

      :host([resize="none"]) textarea { resize: none; }
      :host([resize="vertical"]) textarea { resize: vertical; }
      :host([resize="horizontal"]) textarea { resize: horizontal; }
      :host([resize="both"]) textarea { resize: both; }
      :host(:not([resize])) textarea { resize: vertical; }

      textarea::placeholder {
        color: var(--text-muted);
      }

      textarea:hover:not(:disabled):not(:read-only):not(:focus) {
        border-color: var(--border-bright);
      }

      textarea:focus {
        outline: none;
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      :host([readonly]) textarea {
        cursor: default;
        background: var(--bg-surface);
      }

      .error textarea {
        border-color: var(--color-error);
      }

      .error textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--bg-deep), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2);
      }

      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 20px;
      }

      .error-message {
        font-size: var(--text-xs);
        color: var(--color-error);
        line-height: 1.4;
      }

      .char-count {
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-left: auto;
      }

      .char-count.at-limit {
        color: var(--color-error);
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
    this.value = '';
    this.placeholder = '';
    this.label = '';
    this.rows = 4;
    this.maxlength = 0;
    this.disabled = false;
    this.readonly = false;
    this.resize = 'vertical';
    this.error = '';
  }

  updated(changed) {
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
    }
  }

  _onInput(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _onChange(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const hasError = !!this.error;
    const showCounter = this.maxlength > 0;
    const atLimit = showCounter && this.value.length >= this.maxlength;

    return html`
      <div class="textarea-wrapper ${hasError ? 'error' : ''}" part="wrapper">
        ${this.label ? html`
          <label part="label" id="textarea-label">${this.label}</label>
        ` : ''}
        <textarea
          part="textarea"
          .value=${this.value}
          placeholder=${this.placeholder}
          rows=${this.rows}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          maxlength=${this.maxlength > 0 ? this.maxlength : undefined}
          aria-labelledby=${this.label ? 'textarea-label' : undefined}
          aria-invalid=${hasError ? 'true' : 'false'}
          aria-describedby=${hasError ? 'error-msg' : undefined}
          @input=${this._onInput}
          @change=${this._onChange}
        ></textarea>
        <div class="footer">
          ${hasError ? html`
            <span class="error-message" id="error-msg" role="alert" part="error">${this.error}</span>
          ` : html`<span></span>`}
          ${showCounter ? html`
            <span class="char-count ${atLimit ? 'at-limit' : ''}" part="counter" aria-live="polite">
              ${this.value.length}/${this.maxlength}
            </span>
          ` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('arc-textarea', ArcTextarea);
