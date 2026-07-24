import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Multi-line text input with integrated label, placeholder, resize control, and live character
 * count that turns red at the limit.
 *
 * @tag arc-textarea
 * @prop {string} label - Visible label rendered above the textarea in uppercase. Automatically linked to the field via `aria-labelledby`, ensuring screen readers announce it correctly.
 * @prop {string} value - The current text content of the textarea. Updated on every keystroke and emitted via `arc-input` and `arc-change` events.
 * @prop {string} placeholder - Hint text displayed inside the field when it is empty. Use it to show example input -- never as a substitute for the label.
 * @prop {number} rows - The number of visible text rows that set the initial height of the textarea. Does not limit content length -- the user can scroll or resize beyond this height.
 * @prop {number} maxlength - Maximum number of characters allowed. When set to a value greater than 0, a live counter appears below the field showing current length vs. limit, turning red when the limit is reached.
 * @prop {'none' | 'vertical' | 'horizontal' | 'both'} resize - Controls whether and in which direction the user can drag to resize the textarea. Defaults to vertical-only resizing.
 * @prop {boolean} disabled - Prevents user interaction and applies a muted visual treatment at 40% opacity. The field value is excluded from form submission when disabled.
 * @prop {boolean} readonly - Allows the user to select and copy text but prevents editing. The field has a subtle background change to indicate its read-only state.
 * @prop {string} error - Error message string. When non-empty, the textarea border turns red and the message is displayed below the field with `role="alert"` for screen reader announcement.
 * @prop {'sm' | 'md' | 'lg'} size - Controls the textarea size. Options: 'sm', 'md', 'lg'.
 * @prop {boolean} autoResize - Automatically grows the textarea height to fit its content. Disables manual resize when enabled.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired on each keystroke with { value } detail
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired on blur when value has changed
 * @csspart wrapper
 * @csspart label
 * @csspart textarea
 * @csspart error
 * @csspart counter
 */
export class ArcTextarea extends FormControlMixin(LitElement) {
  static properties = {
    value:       { type: String },
    placeholder: { type: String },
    label:       { type: String },
    rows:        { type: Number },
    maxlength:   { type: Number },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    resize:      { type: String, reflect: true },
    size:        { type: String, reflect: true },
    autoResize:  { type: Boolean, attribute: 'auto-resize', reflect: true },
    error:       { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }
      :host([disabled]) { opacity: 0.5; pointer-events: none; }

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
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
        box-shadow: var(--shadow-inset);
      }

      /* Sizes */
      :host([size="sm"]) textarea { font-size: var(--text-xs); padding: var(--space-xs) var(--space-sm); }
      :host([size="sm"]) label { font-size: calc(var(--text-xs) - 1px); }
      :host([size="lg"]) textarea { font-size: var(--text-md); padding: var(--space-md) var(--space-lg); }

      :host([auto-resize]) textarea { resize: none; overflow: hidden; }

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
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      textarea:focus {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
      }

      :host([readonly]) textarea {
        cursor: default;
        background: var(--surface-primary);
      }

      .error textarea {
        border-color: var(--color-error);
      }

      .error textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--surface-base), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2);
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
    this.value = '';
    this.placeholder = '';
    this.label = '';
    this.rows = 4;
    this.maxlength = 0;
    this.disabled = false;
    this.readonly = false;
    this.resize = 'vertical';
    this.size = 'md';
    this.autoResize = false;
    this.error = '';
  }

  _onInput(e) {
    this.value = e.target.value;
    this._updateFormValue();
    if (this.autoResize) this._autoGrow(e.target);
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  updated(changed) {
    super.updated?.(changed);
    if (changed.has('value')) {
      this._updateFormValue();
    }
    if (this.autoResize && (changed.has('value') || changed.has('autoResize'))) {
      const ta = this.shadowRoot?.querySelector('textarea');
      if (ta) this._autoGrow(ta);
    }
  }

  _onChange(e) {
    this.value = e.target.value;
    this._updateFormValue();
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
