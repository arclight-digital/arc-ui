import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

let passwordInputIdCounter = 0;

const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567',
  'qwerty', 'abc123', 'password1', '111111', 'iloveyou', 'admin',
  'letmein', 'welcome', 'monkey', 'dragon', '654321', 'superman',
  'qazwsx', 'football',
]);

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/** True when the password contains a 4+ run of consecutive chars (abcd, 4321). */
function hasSequentialRun(pw) {
  const s = pw.toLowerCase();
  let asc = 1;
  let desc = 1;
  for (let i = 1; i < s.length; i++) {
    const d = s.charCodeAt(i) - s.charCodeAt(i - 1);
    asc = d === 1 ? asc + 1 : 1;
    desc = d === -1 ? desc + 1 : 1;
    if (asc >= 4 || desc >= 4) return true;
  }
  return false;
}

/** Self-contained heuristic: 0 = empty, 1–4 = Weak…Strong. */
function scorePassword(pw) {
  if (!pw) return 0;
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) return 1;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16) score += 1;
  const classes =
    (/[a-z]/.test(pw) ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (classes >= 2) score += 1;
  if (classes >= 4) score += 1;
  if (/(.)\1\1/.test(pw)) score -= 1;
  if (hasSequentialRun(pw)) score -= 1;
  return Math.min(4, Math.max(1, score));
}

/**
 * @tag arc-password-input
 */
export class ArcPasswordInput extends FormControlMixin(LitElement) {
  static properties = {
    name:         { type: String },
    label:        { type: String },
    placeholder:  { type: String },
    value:        { type: String },
    disabled:     { type: Boolean, reflect: true },
    required:     { type: Boolean, reflect: true },
    error:        { type: String },
    size:         { type: String, reflect: true },
    autocomplete: { type: String },
    showStrength: { type: Boolean, reflect: true, attribute: 'show-strength' },
    _visible:     { state: true },
    _score:       { state: true },
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
        min-height: var(--touch-min);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
        width: 100%;
        box-shadow: var(--shadow-inset);
      }

      .input-group__wrapper:hover:not(:focus-within) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }
      .input-group__wrapper:focus-within {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--shadow-inset), var(--interactive-focus);
        background: var(--surface-raised);
      }

      :host([disabled]) .input-group__wrapper { opacity: 0.5; cursor: not-allowed; }

      /* Error state */
      .input-group--error .input-group__wrapper {
        border-color: var(--color-error);
      }

      .input-group--error .input-group__wrapper:focus-within {
        border-color: var(--color-error);
        box-shadow: 0 0 0 2px var(--surface-base), 0 0 0 4px var(--color-error), 0 0 16px rgba(var(--color-error-rgb), 0.2);
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

      .input-group__toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        margin-right: var(--space-sm);
        border: none;
        background: none;
        padding: 0;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .input-group__toggle:hover {
        color: var(--text-primary);
        background: rgba(var(--interactive-rgb), 0.1);
      }

      .input-group__toggle:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
      }

      :host([disabled]) .input-group__toggle { cursor: not-allowed; pointer-events: none; }

      /* Strength meter */
      .strength {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .strength__segments {
        display: flex;
        gap: var(--space-xs);
      }

      .strength__segment {
        flex: 1;
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--border-default);
        transition: background var(--transition-fast);
      }

      .strength--1 .strength__segment--on { background: var(--color-error); }
      .strength--2 .strength__segment--on { background: var(--color-warning); }
      .strength--3 .strength__segment--on { background: var(--color-info); }
      .strength--4 .strength__segment--on { background: var(--color-success); }

      .strength__label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        line-height: 1.4;
        min-height: 1.4em;
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
    this.name = '';
    this.label = '';
    this.placeholder = '';
    this.value = '';
    this.disabled = false;
    this.required = false;
    this.error = '';
    this.size = 'md';
    this.autocomplete = 'current-password';
    this.showStrength = false;
    this._visible = false;
    this._score = 0;
    this._fieldId = `arc-password-input-${++passwordInputIdCounter}`;
  }

  updated(changed) {
    if (changed.has('value')) {
      this._updateFormValue();
      const score = scorePassword(this.value);
      if (score !== this._score) {
        this._score = score;
        if (this.showStrength) {
          this.dispatchEvent(new CustomEvent('arc-strength-change', { detail: { score }, bubbles: true, composed: true }));
        }
      }
    }
    if (changed.has('value') || changed.has('required')) {
      this._syncValidity();
    }
  }

  _syncValidity() {
    const control = this.shadowRoot?.querySelector('.input-group__field') ?? undefined;
    if (this.required && !this.value) {
      this._setValidity({ valueMissing: true }, 'Please fill out this field.', control);
    } else {
      this._setValidity({});
    }
  }

  _handleInput(e) {
    this.value = e.target.value;
    this._updateFormValue();
    this.dispatchEvent(new CustomEvent('arc-input', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  _handleChange(e) {
    this.value = e.target.value;
    this._updateFormValue();
    this.dispatchEvent(new CustomEvent('arc-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  /** Visibility persists until toggled again — no revert on blur. */
  _toggleVisibility() {
    this._visible = !this._visible;
  }

  _renderEyeIcon() {
    return this._visible
      ? html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10.6 5.6c.46-.07.93-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.2 3.1M6.4 6.4C4 8.2 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.35 4.1-1M9.9 9.9a3 3 0 1 0 4.2 4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 4l16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`
      : html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
        </svg>`;
  }

  _renderStrength() {
    const score = this._score;
    const label = STRENGTH_LABELS[score];
    const labelId = `${this._fieldId}-strength`;
    return html`
      <div class="strength strength--${score}" part="strength">
        <div
          class="strength__segments"
          role="meter"
          aria-label="Password strength"
          aria-valuemin="0"
          aria-valuemax="4"
          aria-valuenow=${score}
          aria-valuetext=${label || 'Empty'}
          aria-describedby=${labelId}
        >
          ${[1, 2, 3, 4].map((i) => html`
            <span class="strength__segment ${i <= score ? 'strength__segment--on' : ''}"></span>
          `)}
        </div>
        <span class="strength__label" id=${labelId} aria-live="polite">${label}</span>
      </div>
    `;
  }

  render() {
    const id = this.name || this._fieldId;
    const hasError = !!this.error;

    return html`
      <div class="input-group ${hasError ? 'input-group--error' : ''}">
        ${this.label ? html`<label class="input-group__label" for=${id} part="label">${this.label}</label>` : ''}
        <div class="input-group__wrapper" part="field">
          <input
            class="input-group__field"
            type=${this._visible ? 'text' : 'password'}
            id=${id}
            name=${this.name}
            placeholder=${this.placeholder}
            autocomplete=${this.autocomplete}
            ?required=${this.required}
            ?disabled=${this.disabled}
            aria-required=${this.required ? 'true' : 'false'}
            aria-disabled=${this.disabled ? 'true' : 'false'}
            .value=${this.value}
            @input=${this._handleInput}
            @change=${this._handleChange}
            part="input"
          />
          <button
            class="input-group__toggle"
            type="button"
            aria-label=${this._visible ? 'Hide password' : 'Show password'}
            aria-pressed=${this._visible ? 'true' : 'false'}
            ?disabled=${this.disabled}
            @click=${this._toggleVisibility}
            part="toggle"
          >${this._renderEyeIcon()}</button>
        </div>
        ${this.showStrength ? this._renderStrength() : ''}
        ${hasError ? html`<span class="input-group__error" role="alert" part="error">${this.error}</span>` : ''}
      </div>
    `;
  }
}
