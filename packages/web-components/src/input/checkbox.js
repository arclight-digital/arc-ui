import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Multi-select form control supporting checked, indeterminate, and disabled states. Ideal for
 * preferences, bulk-selection patterns, and consent forms where users need to toggle one or more
 * independent options.
 *
 * @tag arc-checkbox
 * @prop {boolean} checked - Controls whether the checkbox is in its checked (selected) state. When true, a checkmark icon is rendered inside the box. Bind to this property for two-way state management in frameworks that support it.
 * @prop {boolean} indeterminate - When true, displays a horizontal dash instead of a checkmark, representing a mixed or partially-selected state. Commonly used on a parent "select all" checkbox when only some children are checked. Clicking an indeterminate checkbox resolves it to fully checked.
 * @prop {boolean} disabled - Prevents all pointer and keyboard interaction and applies a dimmed visual treatment. Use this for options that are unavailable due to unmet prerequisites. Pair with a tooltip or helper text to explain why the option is locked.
 * @prop {string} label - Visible text rendered beside the checkbox. Clicking the label toggles the checkbox, matching native HTML behaviour. Keep labels short, affirmative, and action-oriented for the best readability.
 * @prop {string} size - Controls the checkbox size. Options: 'sm', 'md', 'lg'.
 * @prop {string} name - The form field name submitted when the checkbox lives inside a <form>. Required for native form submission and useful for serializing checkbox group values on the server.
 * @prop {string} value - The value sent with the form when the checkbox is checked. Defaults to "on" if omitted, matching native checkbox behaviour. Set explicit values when multiple checkboxes share the same name to distinguish them in the submitted data.
 * @fires {CustomEvent<{ checked: boolean }>} arc-change - Fired when the checked state changes
 * @csspart checkbox
 * @csspart box
 * @csspart label
 */
export class ArcCheckbox extends FormControlMixin(LitElement) {
  static properties = {
    checked:       { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled:      { type: Boolean, reflect: true },
    size:          { type: String, reflect: true },
    label:         { type: String },
    name:          { type: String },
    value:         { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .checkbox {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        cursor: pointer;
        min-height: var(--touch-min);
      }

      .checkbox__box {
        position: relative;
        width: 18px;
        height: 18px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-bright);
        background: var(--surface-primary);
        transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .checkbox__box:hover {
        border-color: var(--text-muted);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.1);
      }

      :host([checked]) .checkbox__box,
      :host([indeterminate]) .checkbox__box {
        background: var(--interactive);
        border-color: var(--interactive);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.3);
      }

      @keyframes check-pop {
        0%   { transform: scale(0.5); opacity: 0; }
        70%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); }
      }

      .checkbox__icon {
        position: absolute;
        width: 12px;
        height: 12px;
        fill: none;
        stroke: var(--surface-base);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0;
        transform: scale(0.5);
        transition: opacity var(--transition-fast), transform var(--transition-fast);
      }

      :host([checked]) .checkbox__icon--check,
      :host([indeterminate]) .checkbox__icon--dash {
        opacity: 1;
        transform: scale(1);
        animation: check-pop 200ms var(--ease-out-expo);
      }

      .checkbox__label {
        font-family: var(--font-body);
        font-size: var(--body-size);
        font-weight: 400;
        color: var(--text-muted);
        user-select: none;
      }

      /* Sizes */
      :host([size="sm"]) .checkbox__box { width: 14px; height: 14px; }
      :host([size="sm"]) .checkbox__icon { width: 10px; height: 10px; }
      :host([size="sm"]) .checkbox__label { font-size: var(--text-sm); }
      :host([size="lg"]) .checkbox__box { width: 22px; height: 22px; }
      :host([size="lg"]) .checkbox__icon { width: 14px; height: 14px; }
      :host([size="lg"]) .checkbox__label { font-size: var(--text-md); }

      .checkbox__box:focus-visible {
        outline: none;
        box-shadow: var(--interactive-focus);
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
    this.checked = false;
    this.indeterminate = false;
    this.disabled = false;
    this.size = 'md';
    this.label = '';
    this.name = '';
    this.value = '';
  }

  _formValue() {
    return this.checked ? (this.value || 'on') : null;
  }

  _formResetState() {
    return { checked: this.checked };
  }

  _applyFormState(state) {
    this.checked = state.checked;
  }

  updated(changed) {
    if (changed.has('checked') || changed.has('value')) {
      this._updateFormValue();
    }
  }

  _toggle() {
    if (this.disabled) return;
    this.indeterminate = false;
    this.checked = !this.checked;
    this._updateFormValue();
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e) {
    if (e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  render() {
    return html`
      <label class="checkbox" part="checkbox">
        <div
          class="checkbox__box"
          role="checkbox"
          aria-checked=${this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false'}
          aria-label=${this.label || ''}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this._toggle}
          @keydown=${this._handleKeydown}
          part="box"
        >
          <svg class="checkbox__icon checkbox__icon--check" viewBox="0 0 12 12">
            <polyline points="2.5,6 5,8.5 9.5,3.5"></polyline>
          </svg>
          <svg class="checkbox__icon checkbox__icon--dash" viewBox="0 0 12 12">
            <line x1="3" y1="6" x2="9" y2="6"></line>
          </svg>
        </div>
        ${this.label ? html`<span class="checkbox__label" part="label">${this.label}</span>` : ''}
      </label>
    `;
  }
}
