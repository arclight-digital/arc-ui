import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { FormControlMixin } from '../shared/form-control-mixin.js';

/**
 * Single-select option group with arrow-key navigation and ARIA radiogroup semantics. Ideal for
 * pricing tiers, settings panels, and any context where exactly one choice must be made from a
 * visible set of options.
 *
 * @tag arc-radio-group
 * @requires arc-radio
 * @prop {string} value - The currently selected value. Must match one of the child arc-radio value attributes. Setting this property programmatically updates the visual selection and the internal aria-checked state.
 * @prop {string} name - The form field name submitted with the selected value. Required for native form integration — without it, the selection will not appear in FormData.
 * @prop {boolean} disabled - When true, disables all options in the group. The component becomes non-interactive: arrow-key navigation is suppressed, click events are ignored, and the group is excluded from the Tab order.
 * @prop {'vertical' | 'horizontal'} orientation - Controls the layout direction of the radio options. Vertical stacks options top-to-bottom and maps Arrow Up/Down to navigation. Horizontal places options in a row and maps Arrow Left/Right.
 * @prop {string} size - Controls the radio button and label size. Options: 'sm', 'md', 'lg'.
 * @fires {CustomEvent<{ value: string }>} arc-change - Fired when the selected radio value changes
 * @slot - Default content.
 * @csspart group
 * @csspart circle
 * @csspart label
 */
export class ArcRadioGroup extends FormControlMixin(LitElement) {
  static properties = {
    value:       { type: String, reflect: true },
    name:        { type: String },
    disabled:    { type: Boolean, reflect: true },
    size:        { type: String, reflect: true },
    orientation: { type: String, reflect: true },
    _radios:     { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }
      :host([disabled]) { pointer-events: none; opacity: 0.5; }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      :host([orientation="horizontal"]) .radio-group {
        flex-direction: row;
        gap: var(--space-lg);
      }

      .radio {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm);
        cursor: pointer;
        min-height: var(--touch-min);
      }

      .radio__circle {
        position: relative;
        width: 18px;
        height: 18px;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-bright);
        background: var(--surface-primary);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .radio__dot {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        background: var(--interactive);
        opacity: 0;
        transform: scale(0);
        transition: opacity var(--transition-fast), transform var(--transition-fast);
      }

      .radio:hover .radio__circle {
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.1);
        border-color: var(--text-muted);
      }

      .radio[aria-checked="true"] .radio__circle {
        border-color: var(--interactive);
        box-shadow: 0 0 8px rgba(var(--interactive-rgb), 0.3);
      }

      .radio[aria-checked="true"] .radio__dot {
        opacity: 1;
        transform: scale(1);
      }

      .radio__label {
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        user-select: none;
      }

      .radio:focus-visible {
        outline: none;
      }

      .radio:focus-visible .radio__circle {
        box-shadow: var(--interactive-focus);
      }

      /* Sizes */
      :host([size="sm"]) .radio__circle { width: 14px; height: 14px; }
      :host([size="sm"]) .radio__dot { width: 6px; height: 6px; }
      :host([size="sm"]) .radio__label { font-size: var(--text-sm); }
      :host([size="lg"]) .radio__circle { width: 22px; height: 22px; }
      :host([size="lg"]) .radio__dot { width: 10px; height: 10px; }
      :host([size="lg"]) .radio__label { font-size: var(--text-md); }

      .radio-group__slot-host { display: none; }

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
    this.name = '';
    this.disabled = false;
    this.size = 'md';
    this.orientation = 'vertical';
    this._radios = [];
  }

  updated(changed) {
    if (changed.has('value')) {
      this._updateFormValue();
    }
  }

  _onSlotChange(e) {
    this._radios = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-RADIO');
  }

  _select(val) {
    if (this.disabled) return;
    this.value = val;
    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  _handleKeydown(e, index) {
    const opts = this._radios;
    let next;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % opts.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index - 1 + opts.length) % opts.length;
    else if (e.key === ' ') {
      e.preventDefault();
      this._select(opts[index].value);
      return;
    }
    else return;

    e.preventDefault();
    this._select(opts[next].value);
    this.updateComplete.then(() => {
      const radios = this.shadowRoot.querySelectorAll('.radio');
      radios[next]?.focus();
    });
  }

  render() {
    return html`
      <div class="radio-group__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <div class="radio-group" role="radiogroup" aria-label=${this.name} part="group">
        ${this._radios.map((opt, i) => html`
          <div
            class="radio"
            role="radio"
            aria-checked=${opt.value === this.value ? 'true' : 'false'}
            tabindex=${opt.value === this.value || (!this.value && i === 0) ? '0' : '-1'}
            @click=${() => this._select(opt.value)}
            @keydown=${(e) => this._handleKeydown(e, i)}
          >
            <div class="radio__circle" part="circle">
              <div class="radio__dot"></div>
            </div>
            <span class="radio__label" part="label">${opt.label}</span>
          </div>
        `)}
      </div>
    `;
  }
}
