import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-modal
 */
export class ArcModal extends LitElement {
  static properties = {
    open:       { type: Boolean, reflect: true },
    heading:    { type: String },
    size:       { type: String, reflect: true },
    fullscreen: { type: Boolean, reflect: true },
    closable:   { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .modal__backdrop {
        position: fixed;
        inset: 0;
        background: var(--overlay-backdrop);
        backdrop-filter: blur(4px);
        z-index: var(--z-modal);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--transition-base), visibility var(--transition-base);
      }

      :host([open]) .modal__backdrop {
        opacity: 1;
        visibility: visible;
      }

      .modal__dialog {
        position: relative;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-overlay);
        width: 100%;
        max-height: calc(100vh - var(--space-2xl) * 2);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        transform: translateY(16px);
        transition: transform var(--transition-base);
      }

      :host([open]) .modal__dialog {
        transform: translateY(0);
      }

      :host([size="sm"]) .modal__dialog { max-width: 400px; }
      :host(:not([size])) .modal__dialog,
      :host([size="md"]) .modal__dialog { max-width: 560px; }
      :host([size="lg"]) .modal__dialog { max-width: 720px; }

      :host([fullscreen]) .modal__dialog {
        max-width: none;
        max-height: none;
        width: 100%;
        height: 100%;
        border-radius: 0;
        border: none;
      }

      :host([fullscreen]) .modal__backdrop {
        padding: 0;
      }

      .modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-lg);
        position: relative;
      }

      .modal__header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: var(--space-lg);
        right: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      .modal__heading {
        font-size: var(--text-md);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }


      .modal__body {
        padding: var(--space-lg);
        color: var(--text-secondary);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        flex: 1;
      }

      .modal__footer {
        padding: var(--space-lg);
        position: relative;
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
      }

      .modal__footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: var(--space-lg);
        right: var(--space-lg);
        height: 1px;
        background: var(--divider-glow);
        opacity: 0.5;
      }

      @media (prefers-reduced-motion: reduce) {
        .modal__backdrop,
        .modal__dialog { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.heading = '';
    this.size = 'md';
    this.fullscreen = false;
    this.closable = true;
    this._handleKeydown = this._handleKeydown.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
    document.body.style.overflow = '';
  }

  _handleKeydown(e) {
    if (e.key === 'Escape' && this.closable) {
      this._close();
      return;
    }
    // Focus trap
    if (e.key === 'Tab') {
      const focusable = this.shadowRoot.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = this.shadowRoot.activeElement;

      if (e.shiftKey && (!active || active === first)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-close', { bubbles: true, composed: true }));
  }

  _backdropClick(e) {
    if (e.target === e.currentTarget && this.closable) {
      this._close();
    }
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this._handleKeydown);
        document.body.style.overflow = 'hidden';
        this.dispatchEvent(new CustomEvent('arc-open', { bubbles: true, composed: true }));
        this.updateComplete.then(() => {
          const closeBtn = this.shadowRoot.querySelector('.modal__close');
          closeBtn?.focus();
        });
      } else {
        document.removeEventListener('keydown', this._handleKeydown);
        document.body.style.overflow = '';
      }
    }
  }

  render() {
    return html`
      <div
        class="modal__backdrop"
        @click=${this._backdropClick}
        part="backdrop"
      >
        <div
          class="modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.heading || 'Dialog'}
          part="dialog"
        >
          <div class="modal__header" part="header">
            <slot name="header">
              <h2 class="modal__heading">${this.heading}</h2>
            </slot>
            ${this.closable ? html`
              <arc-icon-button name="x" label="Close" variant="ghost" size="sm" @click=${this._close} part="close"></arc-icon-button>
            ` : ''}
          </div>
          <div class="modal__body" part="body">
            <slot></slot>
          </div>
          <div class="modal__footer" part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
