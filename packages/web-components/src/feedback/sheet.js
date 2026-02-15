import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { OverlayMixin } from '../shared/overlay-mixin.js';

/**
 * @tag arc-sheet
 */
export class ArcSheet extends OverlayMixin(LitElement) {
  static properties = {
    open:    { type: Boolean, reflect: true },
    side:    { type: String, reflect: true },
    heading: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .sheet__backdrop {
        position: fixed;
        inset: 0;
        background: var(--overlay-backdrop);
        backdrop-filter: blur(4px);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity var(--duration-exit) ease,
          visibility var(--duration-exit) ease;
      }

      :host([open]) .sheet__backdrop {
        opacity: 1;
        visibility: visible;
        transition-duration: var(--duration-enter);
      }

      .sheet__panel {
        position: fixed;
        z-index: 1001;
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        box-shadow: var(--shadow-overlay);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        transition: transform var(--duration-exit) var(--ease-out-expo);
      }

      :host([open]) .sheet__panel {
        transition-duration: var(--duration-enter);
      }

      /* Bottom sheet */
      :host(:not([side])) .sheet__panel,
      :host([side="bottom"]) .sheet__panel {
        bottom: 0;
        left: 0;
        right: 0;
        max-height: 80vh;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        transform: translateY(100%);
      }

      :host([open]:not([side])) .sheet__panel,
      :host([open][side="bottom"]) .sheet__panel {
        transform: translateY(0);
      }

      /* Right sheet */
      :host([side="right"]) .sheet__panel {
        top: 0;
        right: 0;
        bottom: 0;
        width: 400px;
        max-width: 90vw;
        border-radius: var(--radius-xl) 0 0 var(--radius-xl);
        transform: translateX(100%);
      }

      :host([open][side="right"]) .sheet__panel {
        transform: translateX(0);
      }

      .sheet__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        border-bottom: 1px solid var(--border-subtle);
        flex-shrink: 0;
      }

      .sheet__heading {
        font-family: var(--font-body);
        font-size: var(--text-md);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }


      .sheet__body {
        padding: var(--space-lg);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        flex: 1;
        overflow-y: auto;
      }

      .sheet__footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--border-subtle);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        flex-shrink: 0;
      }

      /* Handle for bottom sheet */
      :host(:not([side])) .sheet__handle,
      :host([side="bottom"]) .sheet__handle {
        display: flex;
        justify-content: center;
        padding: var(--space-sm) 0 0;
      }

      :host([side="right"]) .sheet__handle { display: none; }

      .sheet__handle-bar {
        width: 40px;
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--border-bright);
      }

      @media (prefers-reduced-motion: reduce) {
        .sheet__backdrop,
        .sheet__panel { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.side = 'bottom';
    this.heading = '';
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', { bubbles: true, composed: true }));
  }

  updated(changed) {
    super.updated(changed);
    if (changed.has('open') && this.open) {
      this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
      this.updateComplete.then(() => {
        this.shadowRoot.querySelector('arc-icon-button[part="close"]')?.focus();
      });
    }
  }

  render() {
    return html`
      <div
        class="sheet__backdrop"
        @click=${this._handleBackdropClick}
        part="backdrop"
      ></div>
      <div
        class="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label=${this.heading || 'Sheet'}
        part="panel"
      >
        <div class="sheet__handle" part="handle">
          <div class="sheet__handle-bar"></div>
        </div>
        <div class="sheet__header" part="header">
          <slot name="header">
            <h2 class="sheet__heading">${this.heading}</h2>
          </slot>
          <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
        </div>
        <div class="sheet__body" part="body">
          <slot></slot>
        </div>
        <div class="sheet__footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
