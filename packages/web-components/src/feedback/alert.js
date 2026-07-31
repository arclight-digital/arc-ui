import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';

/**
 * Contextual alert banner with four semantic variants and optional dismiss button for delivering
 * timely, prominent feedback to users.
 *
 * @tag arc-alert
 * @requires arc-icon-button
 * @prop {'info' | 'success' | 'warning' | 'error'} variant - Controls the semantic color palette and icon. Use "info" for neutral guidance, "success" for confirmations, "warning" for caution states, and "error" for failures or blocking issues.
 * @prop {boolean} dismissible - When true, renders a close button in the top-right corner. Clicking it removes the alert from the DOM and fires an "arc-close" event that parent components can listen to.
 * @prop {string} heading - Optional bold heading rendered above the body slot. Use it for a scannable one-line summary so users can quickly gauge the alert's importance before reading the full message.
 * @prop {'default' | 'compact'} density - Visual density. 'compact' reduces padding and font sizes for inline or space-constrained usage.
 * @fires {CustomEvent<void>} arc-close - Fired when a dismissible alert is closed
 * @slot - Default content.
 * @csspart alert
 * @csspart icon
 * @csspart heading
 * @csspart content
 * @csspart dismiss
 */
export class ArcAlert extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    density: { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    heading: { type: String },
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
        background: var(--surface-raised);
        overflow: hidden;
      }

      /* Top gradient rule */
      .alert::before {
        content: '';
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--_status-color), transparent);
        box-shadow: var(--glow-status);
      }

      .alert__icon-wrap {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        font-size: var(--_text-md);
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
        font-size: var(--_text-md);
        color: var(--text-primary);
        margin: 0 0 var(--space-xs);
      }

      .alert__content {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      /* Compact variant */
      :host([density="compact"]) .alert { padding: var(--space-sm) var(--space-md); gap: var(--space-sm); }
      :host([density="compact"]) .alert__icon-wrap { width: 24px; height: 24px; font-size: var(--_text-sm); }
      :host([density="compact"]) .alert__heading { font-size: var(--_text-sm); margin-bottom: 2px; }
      :host([density="compact"]) .alert__content { font-size: var(--_text-xs); }
    `,
  ];

  constructor() {
    super();
    this.variant = 'info';
    this.density = 'default';
    this.dismissible = false;
    this.heading = '';
  }

  _dismiss() {
    if (
      !this.dispatchEvent(
        new CustomEvent('arc-close', { bubbles: true, composed: true, cancelable: true }),
      )
    )
      return;
    this.style.display = 'none';
  }

  render() {
    return html`
      <div class="alert" role=${this.variant === 'error' || this.variant === 'warning' ? 'alert' : 'status'} part="alert">
        <div class="alert__icon-wrap" aria-hidden="true" part="icon">${getStatusIcon(this.variant)}</div>
        <div class="alert__body">
          ${this.heading ? html`<p class="alert__heading" part="heading">${this.heading}</p>` : ''}
          <div class="alert__content" part="content"><slot></slot></div>
        </div>
        ${
          this.dismissible
            ? html`
          <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
        `
            : ''
        }
      </div>
    `;
  }
}
