import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';

/**
 * @tag arc-alert
 */
export class ArcAlert extends LitElement {
  static properties = {
    variant:     { type: String, reflect: true },
    compact:     { type: Boolean, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    heading:     { type: String },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: block; }

      .alert {
        position: relative;
        display: flex;
        gap: var(--space-md);
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        background: var(--bg-card);
        overflow: hidden;
      }

      /* Top gradient rule */
      .alert::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--_status-color), transparent);
        box-shadow: 0 0 12px rgba(var(--_status-rgb), 0.15);
      }

      .alert__icon-wrap {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        font-size: var(--text-md);
        transition: box-shadow var(--transition-base);
        background: rgba(var(--_status-rgb), 0.08);
        border: 1px solid rgba(var(--_status-rgb), 0.15);
        color: var(--_status-color);
        box-shadow: 0 0 16px rgba(var(--_status-rgb), 0.1);
      }

      .alert__body { flex: 1; min-width: 0; }

      .alert__heading {
        font-family: var(--font-body);
        font-weight: 600;
        font-size: var(--text-md);
        color: var(--text-primary);
        margin: 0 0 var(--space-xs);
      }

      .alert__content {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      /* Compact variant */
      :host([compact]) .alert { padding: var(--space-sm) var(--space-md); gap: var(--space-sm); }
      :host([compact]) .alert__icon-wrap { width: 24px; height: 24px; font-size: var(--text-sm); }
      :host([compact]) .alert__heading { font-size: var(--text-sm); margin-bottom: 2px; }
      :host([compact]) .alert__content { font-size: var(--text-xs); }


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
    this.variant = 'info';
    this.compact = false;
    this.dismissible = false;
    this.heading = '';
  }

  _dismiss() {
    this.dispatchEvent(new CustomEvent('arc-dismiss', { bubbles: true, composed: true }));
    this.style.display = 'none';
  }

  render() {
    return html`
      <div class="alert" role="alert" part="alert">
        <div class="alert__icon-wrap" part="icon">${getStatusIcon(this.variant)}</div>
        <div class="alert__body">
          ${this.heading ? html`<p class="alert__heading" part="heading">${this.heading}</p>` : ''}
          <div class="alert__content" part="content"><slot></slot></div>
        </div>
        ${this.dismissible ? html`
          <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
        ` : ''}
      </div>
    `;
  }
}
