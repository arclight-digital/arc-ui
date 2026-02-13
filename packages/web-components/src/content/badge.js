import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcBadge extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        padding: var(--space-xs) var(--space-sm);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: var(--bg-hover);
        transition: box-shadow 200ms ease, border-color 200ms ease;
        line-height: 1.4;
      }

      :host([variant="primary"]) .badge {
        border-color: var(--accent-primary-border);
        color: var(--accent-primary);
        background: rgba(var(--accent-primary-rgb), 0.06);
      }

      :host([variant="secondary"]) .badge {
        border-color: var(--accent-secondary-border);
        color: var(--accent-secondary);
        background: rgba(var(--accent-secondary-rgb), 0.06);
      }

      :host([variant="success"]) .badge {
        border-color: rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
        background: rgba(var(--color-success-rgb), 0.06);
      }

      :host([variant="warning"]) .badge {
        border-color: rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
        background: rgba(var(--color-warning-rgb), 0.06);
      }

      :host([variant="error"]) .badge {
        border-color: rgba(var(--color-error-rgb), 0.2);
        color: var(--color-error);
        background: rgba(var(--color-error-rgb), 0.06);
      }

      :host([variant="info"]) .badge {
        border-color: rgba(var(--color-info-rgb), 0.2);
        color: var(--color-info);
        background: rgba(var(--color-info-rgb), 0.06);
      }

      :host(:hover) .badge { border-color: var(--border-bright); }
      :host([variant="primary"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.15); }
      :host([variant="secondary"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--accent-secondary-rgb), 0.15); }
      :host([variant="success"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--color-success-rgb), 0.15); }
      :host([variant="warning"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--color-warning-rgb), 0.15); }
      :host([variant="error"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--color-error-rgb), 0.15); }
      :host([variant="info"]:hover) .badge { box-shadow: 0 0 12px rgba(var(--color-info-rgb), 0.15); }

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
  }

  render() {
    return html`<span class="badge" part="badge"><slot></slot></span>`;
  }
}

customElements.define('arc-badge', ArcBadge);
