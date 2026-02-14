import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-radio-group
 * @requires arc-radio
 */
export class ArcRadioGroup extends LitElement {
  static formAssociated = true;

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
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

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
        background: var(--bg-surface);
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
        background: var(--accent-primary);
        opacity: 0;
        transform: scale(0);
        transition: opacity var(--transition-fast), transform var(--transition-fast);
      }

      .radio[aria-checked="true"] .radio__circle {
        border-color: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.3);
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

      .radio__circle:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
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
    this._internals = this.attachInternals();
    this.value = '';
    this.name = '';
    this.disabled = false;
    this.size = 'md';
    this.orientation = 'vertical';
    this._radios = [];
  }

  updated(changed) {
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
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
    else return;

    e.preventDefault();
    this._select(opts[next].value);
    this.updateComplete.then(() => {
      const radios = this.shadowRoot.querySelectorAll('.radio__circle');
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
            @click=${() => this._select(opt.value)}
          >
            <div
              class="radio__circle"
              tabindex=${opt.value === this.value || (!this.value && i === 0) ? '0' : '-1'}
              @keydown=${(e) => this._handleKeydown(e, i)}
              part="circle"
            >
              <div class="radio__dot"></div>
            </div>
            <span class="radio__label" part="label">${opt.label}</span>
          </div>
        `)}
      </div>
    `;
  }
}
