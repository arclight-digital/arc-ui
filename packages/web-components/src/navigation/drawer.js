import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcDrawer extends LitElement {
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
        padding: var(--space-md) var(--space-lg);
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

      .drawer__close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .drawer__close:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
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
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this._onKeyDown);
        document.body.style.overflow = 'hidden';
      } else {
        document.removeEventListener('keydown', this._onKeyDown);
        document.body.style.overflow = '';
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeyDown);
    document.body.style.overflow = '';
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this._close();
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', {
      bubbles: true,
      composed: true,
    }));
  }

  _backdropClick() {
    this._close();
  }

  render() {
    return html`
      <div class="drawer__backdrop" @click=${this._backdropClick} part="backdrop"></div>
      <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label=${this.heading || 'Drawer'} part="panel">
        <div class="drawer__header" part="header">
          <span class="drawer__title" part="title">${this.heading}</span>
          <button class="drawer__close" @click=${this._close} aria-label="Close" part="close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>
        <div class="drawer__body" part="body">
          <slot></slot>
        </div>
      </aside>
    `;
  }
}

customElements.define('arc-drawer', ArcDrawer);
