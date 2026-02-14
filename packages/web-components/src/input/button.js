import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { buttonVariantStyles } from '../button-styles.js';

export class ArcButton extends LitElement {
  static properties = {
    variant:    { type: String, reflect: true },
    size:       { type: String, reflect: true },
    href:       { type: String },
    disabled:   { type: Boolean, reflect: true },
    loading:    { type: Boolean, reflect: true },
    type:       { type: String },
    _hasPrefix: { state: true },
    _hasSuffix: { state: true },
  };

  static styles = [
    tokenStyles,
    buttonVariantStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]),
      :host([loading]) { pointer-events: none; }

      :host([loading]) .btn { opacity: 0.7; }

      .btn__spinner {
        display: none;
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: var(--radius-full);
        animation: arc-btn-spin 600ms linear infinite;
      }

      :host([loading]) .btn__spinner { display: inline-block; }
      :host([loading]) .btn__label { opacity: 0.6; }

      @keyframes arc-btn-spin {
        to { transform: rotate(360deg); }
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        font-family: var(--font-accent);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 2px;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base),
          color var(--transition-base),
          transform var(--transition-fast);
        text-decoration: none;
        white-space: nowrap;
        box-sizing: border-box;
        min-height: var(--touch-min);
      }

      /* Sizes */
      :host([size="sm"]) .btn { font-size: var(--text-xs); padding: var(--space-xs) var(--space-md); }
      :host(:not([size])) .btn,
      :host([size="md"]) .btn { font-size: var(--text-xs); padding: var(--space-sm) var(--space-lg); }
      :host([size="lg"]) .btn { font-size: var(--text-xs); padding: var(--space-md) var(--space-xl); letter-spacing: 3px; }

      /* Default → primary */
      :host(:not([variant])) .btn {
        background: var(--accent-primary);
        color: var(--bg-deep);
        border-color: var(--accent-primary);
      }
      :host(:not([variant])) .btn:hover { box-shadow: var(--glow-primary); }

      /* :active scale */
      :host(:not([variant])) .btn:active,
      :host([variant="primary"]) .btn:active { transform: scale(0.97); box-shadow: 0 0 8px rgba(var(--accent-primary-rgb),0.5); }
      :host([variant="secondary"]) .btn:active {
        transform: scale(0.97);
        background: rgba(var(--accent-primary-rgb),0.05);
      }
      :host([variant="ghost"]) .btn:active {
        transform: scale(0.97);
        background: var(--bg-elevated);
      }

      /* Prefix / Suffix */
      .btn__prefix,
      .btn__suffix {
        display: inline-flex;
        align-items: center;
      }

      .btn__prefix--empty,
      .btn__suffix--empty { display: none; }

      ::slotted([slot="prefix"]),
      ::slotted([slot="suffix"]) {
        display: flex;
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
    this.variant = 'primary';
    this.size = 'md';
    this.href = '';
    this.disabled = false;
    this.loading = false;
    this.type = 'button';
    this._hasPrefix = false;
    this._hasSuffix = false;
  }

  _onPrefixSlotChange(e) {
    this._hasPrefix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onSuffixSlotChange(e) {
    this._hasSuffix = e.target.assignedNodes({ flatten: true }).length > 0;
  }

  _renderContent() {
    return html`
      ${this.loading ? html`<span class="btn__spinner" aria-hidden="true"></span>` : ''}
      <span class="btn__prefix ${this._hasPrefix ? '' : 'btn__prefix--empty'}">
        <slot name="prefix" @slotchange=${this._onPrefixSlotChange}></slot>
      </span>
      <span class="btn__label"><slot></slot></span>
      <span class="btn__suffix ${this._hasSuffix ? '' : 'btn__suffix--empty'}">
        <slot name="suffix" @slotchange=${this._onSuffixSlotChange}></slot>
      </span>
    `;
  }

  render() {
    if (this.href) {
      return html`<a class="btn" href=${this.href} part="button">${this._renderContent()}</a>`;
    }
    return html`<button class="btn" type=${this.type} ?disabled=${this.disabled || this.loading} aria-busy=${this.loading ? 'true' : 'false'} part="button">${this._renderContent()}</button>`;
  }
}

customElements.define('arc-button', ArcButton);
