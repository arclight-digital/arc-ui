import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

let numberInputIdCounter = 0;

/**
 * @tag arc-number-input
 */
export class ArcNumberInput extends LitElement {
  static properties = {
    value:    { type: Number, reflect: true },
    min:      { type: Number },
    max:      { type: Number },
    step:     { type: Number },
    label:    { type: String },
    disabled: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .number-input {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .number-input__label {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--label-inline-size);
        letter-spacing: var(--label-inline-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .number-input__controls {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        overflow: hidden;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .number-input__controls:focus-within {
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        box-shadow: var(--focus-glow);
      }

      .number-input__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: var(--text-md);
        font-family: var(--font-body);
        font-weight: 600;
        line-height: 1;
        transition:
          background var(--transition-fast),
          color var(--transition-fast);
        flex-shrink: 0;
      }

      .number-input__btn:hover:not(:disabled) {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      .number-input__btn:active:not(:disabled) {
        background: var(--bg-elevated);
      }

      .number-input__btn:disabled {
        color: var(--text-ghost);
        cursor: not-allowed;
      }

      .number-input__btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
        z-index: 1;
        position: relative;
      }

      .number-input__field {
        width: 56px;
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 500;
        color: var(--text-primary);
        background: transparent;
        border: none;
        border-left: 1px solid var(--border-subtle);
        border-right: 1px solid var(--border-subtle);
        padding: var(--space-sm) var(--space-xs);
        box-sizing: border-box;
        -moz-appearance: textfield;
      }

      .number-input__field::-webkit-inner-spin-button,
      .number-input__field::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .number-input__field:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: var(--focus-glow);
      }

      @media (prefers-reduced-motion: reduce) {
        .number-input__btn,
        .number-input__controls { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.min = undefined;
    this.max = undefined;
    this.step = 1;
    this.label = '';
    this.disabled = false;
    this._fieldId = `arc-number-input-${++numberInputIdCounter}`;
  }

  get _atMin() {
    return this.min !== undefined && this.min !== null && this.value <= this.min;
  }

  get _atMax() {
    return this.max !== undefined && this.max !== null && this.value >= this.max;
  }

  _clamp(val) {
    let clamped = val;
    if (this.min !== undefined && this.min !== null) clamped = Math.max(this.min, clamped);
    if (this.max !== undefined && this.max !== null) clamped = Math.min(this.max, clamped);
    return clamped;
  }

  _setValue(newValue) {
    const clamped = this._clamp(newValue);
    if (clamped === this.value) return;
    this.value = clamped;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _decrement() {
    this._setValue(this.value - this.step);
  }

  _increment() {
    this._setValue(this.value + this.step);
  }

  _handleInput(e) {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      this._setValue(parsed);
    }
  }

  _handleKeydown(e) {
    const multiplier = e.shiftKey ? 10 : 1;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._setValue(this.value + this.step * multiplier);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._setValue(this.value - this.step * multiplier);
    }
  }

  render() {
    return html`
      <div class="number-input" part="wrapper">
        ${this.label ? html`
          <label class="number-input__label" for=${this._fieldId} part="label">${this.label}</label>
        ` : ''}
        <div class="number-input__controls" part="controls">
          <button
            class="number-input__btn"
            type="button"
            tabindex="-1"
            aria-label="Decrease"
            ?disabled=${this.disabled || this._atMin}
            @click=${this._decrement}
            part="decrement"
          >&minus;</button>
          <input
            class="number-input__field"
            id=${this._fieldId}
            type="number"
            role="spinbutton"
            aria-valuemin=${this.min ?? ''}
            aria-valuemax=${this.max ?? ''}
            aria-valuenow=${this.value}
            aria-label=${this.label || 'Number'}
            .value=${String(this.value)}
            ?disabled=${this.disabled}
            @change=${this._handleInput}
            @keydown=${this._handleKeydown}
            part="field"
          />
          <button
            class="number-input__btn"
            type="button"
            tabindex="-1"
            aria-label="Increase"
            ?disabled=${this.disabled || this._atMax}
            @click=${this._increment}
            part="increment"
          >&plus;</button>
        </div>
      </div>
    `;
  }
}
