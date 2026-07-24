import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { statusVars } from '../status-styles.js';
import { getStatusIcon } from '../status-utils.js';

/**
 * Full-width persistent strip pinned to viewport or section top. Uses semantic variants like alert
 * but edge-to-edge with no border-radius and a subtle gradient wash.
 *
 * @tag arc-banner
 * @prop {'info' | 'success' | 'warning' | 'error'} variant - Controls the semantic colour palette and icon. Use "info" for neutral announcements, "success" for positive confirmations, "warning" for caution states, and "error" for outages or critical failures.
 * @prop {boolean} dismissible - When true, renders a close button on the right side. Clicking it collapses the banner and fires an "arc-dismiss" event.
 * @prop {boolean} sticky - When true, pins the banner to the top of the viewport with position: sticky so it remains visible as the user scrolls.
 * @fires {CustomEvent<void>} arc-dismiss - Fired when a dismissible banner is closed by the user
 * @slot - Default content.
 * @csspart banner
 * @csspart icon
 * @csspart message
 * @csspart dismiss
 */
export class ArcBanner extends LitElement {
  static properties = {
    variant:     { type: String, reflect: true },
    dismissible: { type: Boolean, reflect: true },
    sticky:      { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    statusVars,
    css`
      :host { display: block; }

      :host([sticky]) {
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .banner {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md);
        background: linear-gradient(90deg, rgba(var(--_status-rgb), 0.06), transparent 60%);
        border: 1px solid rgba(var(--_status-rgb), 0.2);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .banner::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--_status-color), transparent);
      }

      .banner__icon {
        color: var(--_status-color);
        flex-shrink: 0;
        font-size: var(--text-md);
        line-height: 1;
      }

      .banner__message {
        flex: 1;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }


      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.variant = 'info';
    this.dismissible = false;
    this.sticky = false;
  }

  _dismiss() {
    this.dispatchEvent(new CustomEvent('arc-dismiss', { bubbles: true, composed: true }));
    this.style.display = 'none';
  }

  render() {
    return html`
      <div class="banner" role="alert" part="banner">
        <span class="banner__icon" aria-hidden="true" part="icon">${getStatusIcon(this.variant)}</span>
        <span class="banner__message" part="message"><slot></slot></span>
        ${this.dismissible ? html`
          <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${this._dismiss} part="dismiss"></arc-icon-button>
        ` : ''}
      </div>
    `;
  }
}
