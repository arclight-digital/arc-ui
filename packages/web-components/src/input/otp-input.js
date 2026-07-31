import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * A one-time password input that renders a row of individual character boxes with auto-advance,
 * paste support, and configurable length and input type.
 *
 * @tag arc-otp-input
 * @prop {number} length - Number of individual character boxes to render. Reflected as an attribute.
 * @prop {string} value - The concatenated value of all boxes. Reflected as an attribute and updated on every input.
 * @prop {boolean} disabled - Disables all input boxes, reducing opacity to 40% and blocking pointer events.
 * @prop {boolean} readonly - Prevents typing, pasting, and clearing digits while the boxes stay focusable and the value still submits.
 * @prop {'number' | 'text'} type - Input mode. `number` filters non-digits and uses the numeric keyboard; `text` allows any character.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the digit boxes.
 * @fires {CustomEvent<{ value: string }>} arc-input - Fired on every digit entered or deleted, with the partial value.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the code is complete — every box filled. That is the commit for a fixed-length code.
 * @slot none
 * @csspart otp
 * @csspart box
 */
export class ArcOtpInput extends FormControlMixin(LitElement) {
  static properties = {
    size: { type: String, reflect: true },
    length:   { type: Number, reflect: true },
    value:    { type: String, reflect: true },
    name:     { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    type:     { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .otp {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .otp__box {
        width: 44px;
        height: 52px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: var(--_text-md);
        font-weight: 600;
        color: var(--text-primary);
        background: var(--surface-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 0;
        caret-color: var(--interactive);
        transition:
          border-color var(--transition-fast),
          box-shadow var(--transition-fast),
          background var(--transition-fast);
        box-sizing: border-box;
      }

      /* Sizes. md is the base rule above, so an unrecognised value lands on it. */
      :host([size="sm"]) .otp__box { width: 36px; height: 42px; font-size: var(--_text-sm); }
      :host([size="lg"]) .otp__box { width: 52px; height: 62px; font-size: var(--_text-lg); }

      .otp__box::placeholder {
        color: var(--text-ghost);
      }

      .otp__box:hover:not(:focus) {
        border-color: var(--border-bright);
        box-shadow: var(--shadow-inset), var(--interactive-hover);
      }

      .otp__box:focus-visible {
        outline: none;
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--interactive-focus);
        background: var(--surface-primary);
      }

      .otp__box:disabled {
        cursor: not-allowed;
      }
    `,
  ];

  constructor() {
    super();
    this.size = 'md';
    this.length = 6;
    this.value = '';
    this.name = '';
    this.disabled = false;
    this.type = 'number';
  }

  get _chars() {
    const chars = (this.value || '').split('');
    while (chars.length < this.length) chars.push('');
    return chars.slice(0, this.length);
  }

  _getInputs() {
    return this.shadowRoot.querySelectorAll('.otp__box');
  }

  _focusBox(index) {
    const inputs = this._getInputs();
    if (index >= 0 && index < inputs.length) {
      inputs[index].focus();
      inputs[index].select();
    }
  }

  _updateValue() {
    const inputs = this._getInputs();
    const chars = [];
    inputs.forEach(input => chars.push(input.value));
    this.value = chars.join('');
    this._updateFormValue();
    // Every digit is an edit; only a full code is a committed value. Firing
    // arc-change per keystroke — which this did — meant a consumer that
    // submitted on arc-change submitted five incomplete codes first.
    this.dispatchEvent(new CustomEvent('arc-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
    if (this.value.length === this.length) {
      this.dispatchEvent(new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _onInput(e, index) {
    const input = e.target;
    let char = input.value;

    // For number type, filter non-digits
    if (this.type === 'number') {
      char = char.replace(/[^0-9]/g, '');
    }

    // Take only the last character typed
    if (char.length > 1) {
      char = char.slice(-1);
    }

    input.value = char;
    this._updateValue();

    // Auto-advance to next box
    if (char && index < this.length - 1) {
      this._focusBox(index + 1);
    }
  }

  _onKeydown(e, index) {
    switch (e.key) {
      case 'Backspace':
        if (!e.target.value && index > 0) {
          e.preventDefault();
          this._focusBox(index - 1);
          if (!this.readonly) {
            const inputs = this._getInputs();
            inputs[index - 1].value = '';
            this._updateValue();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) this._focusBox(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < this.length - 1) this._focusBox(index + 1);
        break;
      case 'Home':
        e.preventDefault();
        this._focusBox(0);
        break;
      case 'End':
        e.preventDefault();
        this._focusBox(this.length - 1);
        break;
    }
  }

  _onPaste(e, index) {
    e.preventDefault();
    if (this.readonly) return;
    const pasted = (e.clipboardData.getData('text') || '').trim();
    let chars = pasted.split('');

    if (this.type === 'number') {
      chars = chars.filter(c => /[0-9]/.test(c));
    }

    const inputs = this._getInputs();
    for (let i = 0; i < chars.length && (index + i) < this.length; i++) {
      inputs[index + i].value = chars[i];
    }

    this._updateValue();

    // Focus the box after the last pasted character, or the last box
    const nextIndex = Math.min(index + chars.length, this.length - 1);
    this._focusBox(nextIndex);
  }

  _onFocus(e) {
    e.target.select();
  }

  render() {
    const chars = this._chars;
    const inputMode = this.type === 'number' ? 'numeric' : 'text';
    const pattern = this.type === 'number' ? '[0-9]*' : undefined;

    return html`
      <div class="otp" role="group" aria-label="One-time password input" part="otp">
        ${chars.map((char, i) => html`
          <input
            class="otp__box"
            type="text"
            inputmode=${inputMode}
            pattern=${pattern || '.*'}
            maxlength="2"
            autocomplete="one-time-code"
            .value=${char}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            aria-label=${`Digit ${i + 1} of ${this.length}`}
            @input=${(e) => this._onInput(e, i)}
            @keydown=${(e) => this._onKeydown(e, i)}
            @paste=${(e) => this._onPaste(e, i)}
            @focus=${this._onFocus}
            part="box"
          />
        `)}
      </div>
    `;
  }
}
