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
        padding: var(--space-md) var(--space-lg);
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

      .callout__dismiss {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: opacity var(--transition-fast), background var(--transition-fast);
        flex-shrink: 0;
      }

      .callout__dismiss:hover {
        opacity: 1;
        background: rgba(var(--_status-rgb), 0.08);
      }

      .callout__dismiss:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
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
            <button class="callout__dismiss" @click=${this._dismiss} aria-label="Dismiss" part="dismiss">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="callout__content" part="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
