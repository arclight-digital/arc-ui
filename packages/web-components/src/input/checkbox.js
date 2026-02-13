import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcCheckbox extends LitElement {
  static formAssociated = true;

  static properties = {
    checked:       { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    disabled:      { type: Boolean, reflect: true },
    label:         { type: String },
    name:          { type: String },
    value:         { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

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
        background: var(--bg-surface);
        transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :host([checked]) .checkbox__box,
      :host([indeterminate]) .checkbox__box {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.3);
      }

      .checkbox__icon {
        position: absolute;
        width: 12px;
        height: 12px;
        fill: none;
        stroke: var(--bg-deep);
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0;
        transform: scale(0.5);
        transition: opacity var(--transition-fast), transform var(--transition-fast);
      }

      :host([checked]) .checkbox__icon--check,
      :host([indeterminate]) .checkbox__icon--dash {
        transform: scale(1);
      }

      :host([checked]) .checkbox__icon--check,
      :host([indeterminate]) .checkbox__icon--dash { opacity: 1; }

      .checkbox__label {
        font-family: var(--font-body);
        font-size: var(--body-size);
        color: var(--text-secondary);
        user-select: none;
      }

      .checkbox__box:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
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
    this.checked = false;
    this.indeterminate = false;
    this.disabled = false;
    this.label = '';
    this.name = '';
    this.value = '';
  }

  updated(changed) {
    if (changed.has('checked') || changed.has('value')) {
      this._internals.setFormValue(this.checked ? (this.value || 'on') : null);
    }
  }

  _toggle() {
    if (this.disabled) return;
    this.indeterminate = false;
    this.checked = !this.checked;
    this._internals.setFormValue(this.checked ? (this.value || 'on') : null);
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

customElements.define('arc-checkbox', ArcCheckbox);
