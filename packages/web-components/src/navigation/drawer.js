import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayMixin } from '../shared/overlay-mixin.js';

/**
 * @tag arc-drawer
 */
export class ArcDrawer extends OverlayMixin(LitElement) {
  static properties = {
    open:     { type: Boolean, reflect: true },
    position: { type: String, reflect: true },
    heading:  { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .drawer__backdrop {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: var(--overlay-backdrop);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity var(--transition-base),
          visibility var(--transition-base);
      }

      :host([open]) .drawer__backdrop {
        opacity: 1;
        visibility: visible;
      }

      .drawer__panel {
        position: fixed;
        top: 0;
        bottom: 0;
        z-index: 201;
        width: 300px;
        max-width: 85vw;
        background: var(--bg-surface);
        border-right: 1px solid var(--border-subtle);
        display: flex;
        flex-direction: column;
        transition: transform var(--transition-base) var(--ease-out-expo);
      }

      :host(:not([position])) .drawer__panel,
      :host([position="left"]) .drawer__panel {
        left: 0;
        transform: translateX(-100%);
      }

      :host([position="right"]) .drawer__panel {
        right: 0;
        left: auto;
        border-right: none;
        border-left: 1px solid var(--border-subtle);
        transform: translateX(100%);
      }

      :host([open]) .drawer__panel {
        transform: translateX(0);
      }

      .drawer__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--border-subtle);
        flex-shrink: 0;
      }

      .drawer__title {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-sm);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-primary);
      }


      .drawer__body {
        flex: 1;
        overflow-y: auto;
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
    this.open = false;
    this.position = 'left';
    this.heading = '';
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <div class="drawer__backdrop" @click=${this._handleBackdropClick} part="backdrop"></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label=${this.heading || 'Drawer'} part="panel">
        <div class="drawer__header" part="header">
          <span class="drawer__title" part="title">${this.heading}</span>
          <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
        </div>
        <div class="drawer__body" part="body">
          <slot></slot>
        </div>
      </aside>
    `;
  }
}
