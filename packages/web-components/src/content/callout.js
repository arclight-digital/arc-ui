import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import './icon.js';

export class ArcCallout extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .callout {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-card);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.7;
        color: var(--text-secondary);
      }

      .callout__header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      .callout__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .callout__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }

      .callout__content {
        min-width: 0;
      }

      /* ── Info ── */
      :host([variant="info"]) .callout {
        border-color: rgba(var(--accent-primary-rgb), 0.12);
        background: rgba(var(--accent-primary-rgb), 0.04);
      }
      :host([variant="info"]) .callout__icon { color: var(--accent-primary); }
      :host([variant="info"]) .callout__label { color: var(--accent-primary); }

      /* ── Warning ── */
      :host([variant="warning"]) .callout {
        border-color: rgba(var(--color-warning-rgb), 0.15);
        background: rgba(var(--color-warning-rgb), 0.04);
      }
      :host([variant="warning"]) .callout__icon { color: var(--color-warning); }
      :host([variant="warning"]) .callout__label { color: var(--color-warning); }

      /* ── Tip ── */
      :host([variant="tip"]) .callout {
        border-color: rgba(var(--color-success-rgb), 0.15);
        background: rgba(var(--color-success-rgb), 0.04);
      }
      :host([variant="tip"]) .callout__icon { color: var(--color-success); }
      :host([variant="tip"]) .callout__label { color: var(--color-success); }

      /* ── Danger ── */
      :host([variant="danger"]) .callout {
        border-color: rgba(var(--color-error-rgb), 0.15);
        background: rgba(var(--color-error-rgb), 0.04);
      }
      :host([variant="danger"]) .callout__icon { color: var(--color-error); }
      :host([variant="danger"]) .callout__label { color: var(--color-error); }

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
  }

  /** @private */
  _getDefaultIcon() {
    const icons = {
      info:    'info',
      warning: 'warning',
      tip:     'lightbulb',
      danger:  'x-circle',
    };
    return icons[this.variant] || icons.info;
  }

  /** @private */
  _getLabel() {
    const labels = {
      info:    'Note',
      warning: 'Warning',
      tip:     'Tip',
      danger:  'Danger',
    };
    return labels[this.variant] || labels.info;
  }

  render() {
    return html`
      <div class="callout" part="callout" role="note">
        <div class="callout__header" part="header">
          <span class="callout__icon" part="icon" aria-hidden="true">
            <slot name="icon"><arc-icon name=${this._getDefaultIcon()} size="sm"></arc-icon></slot>
          </span>
          <span class="callout__label" part="label">${this._getLabel()}</span>
        </div>
        <div class="callout__content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-callout', ArcCallout);
