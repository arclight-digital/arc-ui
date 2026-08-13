import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

let numberInputIdCounter = 0;

/**
 * A numeric stepper input with decrement and increment buttons flanking a central text field,
 * supporting min/max clamping, step increments, and keyboard shortcuts.
 *
 * @tag arc-number-input
 * @prop {number} value - Current numeric value. Reflected as an attribute and updated on user interaction.
 * @prop {number} min - Minimum allowed value. The decrement button is disabled when the value reaches this limit.
 * @prop {number} max - Maximum allowed value. The increment button is disabled when the value reaches this limit.
 * @prop {number} step - Increment and decrement step size. Arrow keys use this value, Shift+Arrow uses 10x this value.
 * @prop {string} label - Label text displayed above the control in uppercase accent font.
 * @prop {boolean} disabled - Disables interaction, reducing opacity to 40% and blocking pointer events.
 * @prop {boolean} readonly - Prevents value changes from typing, stepper buttons, and arrow keys while keeping the field focusable and its value submitted.
 * @prop {'sm' | 'md' | 'lg'} size - Control size. `md` is the default; `sm` and `lg` scale the field padding.
 * @fires {CustomEvent<{ value: number }>} arc-input - Fired on every edit, including each keystroke while typing. Use for live previews.
 * @fires {CustomEvent<{ value: number }>} arc-change - Fired when the value is committed: blur or Enter after typing, or immediately on a stepper click or arrow key, which are edit and commit in one gesture.
 * @slot none
 * @csspart wrapper
 * @csspart label
 * @csspart controls
 * @csspart decrement
 * @csspart field
 * @csspart increment
 */
export class ArcNumberInput extends DeclaredPropsMixin(FormControlMixin(LitElement)) {
  static properties = {
    size: oneOf(['sm', 'md', 'lg'], { default: 'md' }),

    value: { type: Number, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    label: { type: String },
    name: { type: String, reflect: true },
    // NOT flag(): a form-associated custom element whose `disabled` content
    // attribute is merely *present* is "actually disabled" per the HTML spec,
    // so the platform calls formDisabledCallback(true) and the mixin sets the
    // property back. `disabled="false"` is a disabled control here for exactly
    // the reason it is on a native <input>. Native semantics win; see
    // shared/props.js.
    disabled: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .number-input {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }

      .number-input__label {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
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
        background: var(--surface-primary);
        overflow: hidden;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .number-input__controls:focus-within {
        border-color: rgba(var(--interactive-rgb), 0.4);
        box-shadow: var(--interactive-focus);
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
        font-size: var(--_text-md);
        font-family: var(--font-body);
        font-weight: 600;
        line-height: 1;
        transition:
          background var(--transition-fast),
          color var(--transition-fast);
        flex-shrink: 0;
      }

      .number-input__btn:hover:not(:disabled) {
        background: var(--surface-hover);
        color: var(--text-primary);
      }

      .number-input__btn:active:not(:disabled) {
        background: var(--surface-overlay);
      }

      .number-input__btn:disabled {
        color: var(--text-ghost);
        cursor: not-allowed;
      }

      .number-input__btn:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
        z-index: 1;
        position: relative;
      }

      /* The bordered control is a block-level flex child, so it takes the host's
         full width. The field grows to absorb whatever that is — without this
         the buttons and field total 128px and everything past that is empty
         bordered box, which is what any form column wider than 128px produced.
         56px stays the flex basis so the control keeps its natural size when
         the host is sized to content. */
      .number-input__field {
        flex: 1 1 56px;
        /* min-width:0 lets the field shrink, but an input's *intrinsic* width
           still comes from the UA's size=20 default (~215px), and that is what
           the host reports as its min-content. So arc-number-input advertised
           a 287px minimum it did not actually need: in any 1fr grid column or
           flex row it demanded that much and pushed everything around it
           wider, while shrinking happily when given an explicit width.
           Declaring the width makes the advertised minimum match the real one;
           flex-grow still fills whatever space there is. */
        width: 56px;
        min-width: 0;
        text-align: center;
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: var(--field-weight, 400);
        color: var(--text-primary);
        background: transparent;
        border: none;
        border-inline-start: 1px solid var(--divider);
        border-inline-end: 1px solid var(--divider);
        padding: var(--space-sm) var(--space-xs);
        box-sizing: border-box;
        -moz-appearance: textfield;
      }

      /* Sizes. md is the base rule above, so an unrecognized value lands on it. */
      :host([size="sm"]) .number-input__field { padding: var(--space-xs); font-size: var(--_text-sm); }
      :host([size="lg"]) .number-input__field { padding: var(--space-md) var(--space-sm); font-size: var(--_text-md); }

      .number-input__field::-webkit-inner-spin-button,
      .number-input__field::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      .number-input__field:focus-visible {
        outline: none;
        border-color: var(--interactive);
        box-shadow: var(--interactive-focus);
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
    this.name = '';
    this.disabled = false;
    this._fieldId = `arc-number-input-${++numberInputIdCounter}`;
  }

  _formValue() {
    return this.value == null ? null : String(this.value);
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

  /**
   * @param {number} newValue
   * @param {{ commit?: boolean }} [opts] - `commit: false` while the user is
   *   still typing, so only arc-input fires.
   *
   * Mirrors the native control: typing emits `input` alone, while a spinner
   * click or an arrow key emits `input` *and* `change`, because each of those
   * is both an edit and a commit in one gesture.
   */
  _setValue(newValue, { commit = true } = {}) {
    const clamped = this._clamp(newValue);
    if (clamped === this.value) return;
    this.value = clamped;
    this._updateFormValue();
    this.dispatchEvent(
      new CustomEvent('arc-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    if (!commit) return;
    this.dispatchEvent(
      new CustomEvent('arc-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _decrement() {
    if (this.readonly) return;
    this._setValue(this.value - this.step);
  }

  _increment() {
    if (this.readonly) return;
    this._setValue(this.value + this.step);
  }

  /** The field's `change` — blur or Enter. A commit. */
  _handleInput(e) {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      this._setValue(parsed);
    }
  }

  /** The field's `input` — every keystroke. Not a commit. */
  _handleTyping(e) {
    if (this.readonly) return;
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      this._setValue(parsed, { commit: false });
    }
  }

  _handleKeydown(e) {
    if (this.readonly) return;
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
        ${
          this.label
            ? html`
          <label class="number-input__label" for=${this._fieldId} part="label">${this.label}</label>
        `
            : ''
        }
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
            ?readonly=${this.readonly}
            @input=${this._handleTyping}
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
