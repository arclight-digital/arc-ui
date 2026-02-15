import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';

/**
 * @tag arc-callout
 * @requires arc-icon
 */
export class ArcCallout extends LitElement {
  static properties = {
    variant:     { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    _dismissed:  { state: true },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: block; }

      .callout {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid rgba(var(--_status-rgb), 0.12);
        background: rgba(var(--_status-rgb), 0.04);
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
        color: var(--_status-color);
      }

      .callout__label {
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--_status-color);
      }

      .callout__content {
        min-width: 0;
      }


      :host(.dismissed) {
        display: none;
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
    this.variant = 'info';
    this.dismissible = false;
    this._dismissed = false;
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

  _dismiss() {
    this._dismissed = true;
    this.classList.add('dismissed');
    this.dispatchEvent(new CustomEvent('arc-dismiss', { bubbles: true, composed: true }));
  }

  render() {
    if (this._dismissed) return html``;

    return html`
      <div class="callout" part="callout" role="note">
        <div class="callout__header" part="header">
          <span class="callout__icon" part="icon" aria-hidden="true">
            <slot name="icon"><arc-icon name=${this._getDefaultIcon()} size="sm"></arc-icon></slot>
          </span>
          <span class="callout__label" part="label">${this._getLabel()}</span>
          ${this.dismissible ? html`
            <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
          ` : ''}
        </div>
        <div class="callout__content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
