import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcDialog extends LitElement {
  static properties = {
    open:           { type: Boolean, reflect: true },
    heading:        { type: String },
    message:        { type: String },
    'confirm-label': { type: String, attribute: 'confirm-label' },
    'cancel-label':  { type: String, attribute: 'cancel-label' },
    variant:        { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .dialog__backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
        padding-left: var(--space-lg);
        padding-right: var(--space-lg);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--transition-fast), visibility var(--transition-fast);
      }

      :host([open]) .dialog__backdrop {
        opacity: 1;
        visibility: visible;
      }

      .dialog__card {
        position: relative;
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg) var(--radius-lg) var(--radius-md) var(--radius-md);
        box-shadow: var(--shadow-overlay);
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: translateY(-8px);
        transition: transform var(--transition-fast);
      }

      :host([open]) .dialog__card {
        transform: translateY(0);
      }

      /* Top accent line */
      .dialog__accent {
        height: 3px;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary, var(--accent-primary)));
      }

      :host([variant="danger"]) .dialog__accent {
        background: linear-gradient(90deg, var(--color-error), var(--color-warning, var(--color-error)));
      }

      :host([variant="danger"]) .dialog__card {
        border-color: rgba(var(--color-error-rgb, 239, 68, 68), 0.25);
        box-shadow: var(--shadow-overlay), 0 0 20px rgba(var(--color-error-rgb, 239, 68, 68), 0.12);
      }

      .dialog__header {
        padding: var(--space-md) var(--space-lg) 0;
      }

      .dialog__heading {
        font-size: var(--text-md);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .dialog__body {
        padding: var(--space-sm) var(--space-lg);
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--body-size);
        line-height: var(--body-lh);
      }

      .dialog__footer {
        padding: var(--space-sm) var(--space-lg) var(--space-md);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
      }

      .dialog__btn {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-sm);
        letter-spacing: 1px;
        text-transform: uppercase;
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background var(--transition-fast), border-color var(--transition-fast),
                    color var(--transition-fast), box-shadow var(--transition-fast);
        border: 1px solid transparent;
        line-height: 1;
      }

      .dialog__btn:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }

      .dialog__btn--cancel {
        background: transparent;
        border-color: var(--border-default);
        color: var(--text-secondary);
      }

      .dialog__btn--cancel:hover {
        background: var(--bg-hover);
        border-color: var(--border-bright);
        color: var(--text-primary);
      }

      .dialog__btn--confirm {
        background: var(--accent-primary);
        border-color: var(--accent-primary);
        color: var(--text-on-accent, #fff);
      }

      .dialog__btn--confirm:hover {
        box-shadow: 0 0 16px rgba(var(--accent-primary-rgb), 0.4);
      }

      :host([variant="danger"]) .dialog__btn--confirm {
        background: var(--color-error);
        border-color: var(--color-error);
      }

      :host([variant="danger"]) .dialog__btn--confirm:hover {
        box-shadow: 0 0 16px rgba(var(--color-error-rgb, 239, 68, 68), 0.4);
      }

      @media (prefers-reduced-motion: reduce) {
        .dialog__backdrop,
        .dialog__card { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.heading = '';
    this.message = '';
    this['confirm-label'] = 'Confirm';
    this['cancel-label'] = 'Cancel';
    this.variant = 'default';
    this._handleKeydown = this._handleKeydown.bind(this);
    this._resolvePromise = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
    document.body.style.overflow = '';
  }

  /**
   * Opens the dialog and returns a Promise that resolves to `true` on confirm
   * or `false` on cancel (including Escape and backdrop click).
   */
  confirm() {
    this.open = true;
    return new Promise((resolve) => {
      this._resolvePromise = resolve;
    });
  }

  _handleKeydown(e) {
    if (e.key === 'Escape') {
      this._cancel();
      return;
    }
    // Focus trap
    if (e.key === 'Tab') {
      if (!this._focusableEls) {
        this._focusableEls = this.shadowRoot.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      }
      const focusable = this._focusableEls;
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

  _doConfirm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-confirm', { bubbles: true, composed: true }));
    if (this._resolvePromise) {
      this._resolvePromise(true);
      this._resolvePromise = null;
    }
  }

  _cancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('arc-cancel', { bubbles: true, composed: true }));
    if (this._resolvePromise) {
      this._resolvePromise(false);
      this._resolvePromise = null;
    }
  }

  _backdropClick(e) {
    if (e.target === e.currentTarget) {
      this._cancel();
    }
  }

  updated(changed) {
    if (changed.has('open')) {
      if (this.open) {
        this._focusableEls = null;
        document.addEventListener('keydown', this._handleKeydown);
        document.body.style.overflow = 'hidden';
        this.updateComplete.then(() => {
          const confirmBtn = this.shadowRoot.querySelector('.dialog__btn--confirm');
          confirmBtn?.focus();
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
        class="dialog__backdrop"
        @click=${this._backdropClick}
        part="backdrop"
      >
        <div
          class="dialog__card"
          role="alertdialog"
          aria-modal="true"
          aria-label=${this.heading || 'Dialog'}
          part="card"
        >
          <div class="dialog__accent" part="accent"></div>
          ${this.heading ? html`
            <div class="dialog__header" part="header">
              <h2 class="dialog__heading">${this.heading}</h2>
            </div>
          ` : ''}
          ${this.message ? html`
            <div class="dialog__body" part="body">
              ${this.message}
            </div>
          ` : ''}
          <div class="dialog__footer" part="footer">
            <button
              class="dialog__btn dialog__btn--cancel"
              @click=${this._cancel}
              part="cancel"
            >${this['cancel-label']}</button>
            <button
              class="dialog__btn dialog__btn--confirm"
              @click=${this._doConfirm}
              part="confirm"
            >${this['confirm-label']}</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('arc-dialog', ArcDialog);
