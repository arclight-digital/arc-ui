import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcTag extends LitElement {
  static properties = {
    variant:   { type: String, reflect: true },
    removable: { type: Boolean, reflect: true },
    disabled:  { type: Boolean, reflect: true },
    color:     { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; opacity: 0.4; }

      .tag {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: var(--space-sm) calc(var(--space-sm) + var(--space-xs));
        border: 1px solid var(--border-default);
        border-radius: var(--radius-full);
        background: var(--bg-hover);
        transition: box-shadow var(--transition-base), border-color var(--transition-base);
        line-height: 1.4;
      }

      :host([variant="primary"]) .tag {
        border-color: var(--accent-primary-border);
        color: var(--accent-primary);
        background: var(--accent-primary-subtle);
      }

      :host([variant="secondary"]) .tag {
        border-color: var(--accent-secondary-border);
        color: var(--accent-secondary);
        background: var(--accent-secondary-subtle);
      }

      :host([variant="success"]) .tag {
        border-color: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
        background: rgba(var(--color-success-rgb), 0.06);
      }

      :host([variant="warning"]) .tag {
        border-color: rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
        background: rgba(var(--color-warning-rgb), 0.06);
      }

      :host([variant="danger"]) .tag {
        border-color: rgba(var(--color-error-rgb), 0.2);
        color: var(--color-error);
        background: rgba(var(--color-error-rgb), 0.06);
      }

      .tag:hover { border-color: var(--border-bright); }
      :host([variant="primary"]) .tag:hover { box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.15); }
      :host([variant="secondary"]) .tag:hover { box-shadow: 0 0 12px rgba(var(--accent-secondary-rgb), 0.15); }
      :host([variant="success"]) .tag:hover { box-shadow: 0 0 12px rgba(var(--color-success-rgb), 0.15); }
      :host([variant="warning"]) .tag:hover { box-shadow: 0 0 12px rgba(var(--color-warning-rgb), 0.15); }
      :host([variant="danger"]) .tag:hover { box-shadow: 0 0 12px rgba(var(--color-error-rgb), 0.15); }

      .tag__label {
        display: inline-flex;
        align-items: center;
      }

      .tag__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: var(--space-xs);
        margin-left: var(--space-xs);
        width: 24px;
        height: 24px;
        min-width: 24px;
        border-radius: var(--radius-full);
        opacity: 0.6;
        transition: opacity var(--transition-fast), background var(--transition-fast);
      }

      .tag__remove:hover {
        opacity: 1;
        background: var(--bg-elevated);
      }

      .tag__remove:focus-visible {
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
    this.variant = 'default';
    this.removable = false;
    this.disabled = false;
    this.color = '';
  }

  _remove(e) {
    e.stopPropagation();
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent('arc-remove', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const colorStyle = this.color
      ? `border-color: rgba(${this.color}, 0.2); color: rgb(${this.color}); background: rgba(${this.color}, 0.06);`
      : '';

    return html`
      <span class="tag" part="tag" style=${colorStyle}
        @mouseenter=${this.color ? (e) => { e.currentTarget.style.boxShadow = `0 0 12px rgba(${this.color}, 0.15)`; } : null}
        @mouseleave=${this.color ? (e) => { e.currentTarget.style.boxShadow = ''; } : null}
      >
        <span class="tag__label" part="label"><slot></slot></span>
        ${this.removable ? html`
          <button
            class="tag__remove"
            @click=${this._remove}
            aria-label="Remove tag"
            tabindex=${this.disabled ? '-1' : '0'}
            part="remove"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        ` : ''}
      </span>
    `;
  }
}

customElements.define('arc-tag', ArcTag);
