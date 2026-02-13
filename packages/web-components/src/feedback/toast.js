import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcToast extends LitElement {
  static properties = {
    position: { type: String, reflect: true },
    duration: { type: Number },
    _toasts:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .toast-container {
        position: fixed;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        pointer-events: none;
        max-width: 400px;
        width: 100%;
      }

      /* Positions */
      :host([position="top-right"]) .toast-container,
      :host(:not([position])) .toast-container {
        top: var(--space-lg); right: var(--space-lg);
      }
      :host([position="top-left"]) .toast-container {
        top: var(--space-lg); left: var(--space-lg);
      }
      :host([position="top-center"]) .toast-container {
        top: var(--space-lg); left: 50%; transform: translateX(-50%);
      }
      :host([position="bottom-right"]) .toast-container {
        bottom: var(--space-lg); right: var(--space-lg);
      }
      :host([position="bottom-left"]) .toast-container {
        bottom: var(--space-lg); left: var(--space-lg);
      }
      :host([position="bottom-center"]) .toast-container {
        bottom: var(--space-lg); left: 50%; transform: translateX(-50%);
      }

      .toast {
        pointer-events: auto;
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-overlay);
        animation: toast-in 300ms var(--ease-out-expo);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        overflow: hidden;
      }

      /* Bottom gradient indicator */
      .toast::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--gradient-divider);
      }

      .toast--info::after {
        background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
      }
      .toast--success::after {
        background: linear-gradient(90deg, transparent, var(--color-success), transparent);
      }
      .toast--warning::after {
        background: linear-gradient(90deg, transparent, var(--color-warning), transparent);
      }
      .toast--error::after {
        background: linear-gradient(90deg, transparent, var(--color-error), transparent);
      }

      .toast__icon {
        font-size: var(--text-sm);
        flex-shrink: 0;
        line-height: 1;
      }

      .toast--info .toast__icon    { color: var(--accent-primary); }
      .toast--success .toast__icon { color: var(--color-success); }
      .toast--warning .toast__icon { color: var(--color-warning); }
      .toast--error .toast__icon   { color: var(--color-error); }

      .toast__message { flex: 1; }

      .toast__dismiss {
        background: none;
        border: none;
        color: var(--text-ghost);
        cursor: pointer;
        font-size: var(--text-sm);
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast);
        line-height: 1;
      }

      .toast__dismiss:hover { color: var(--text-primary); }

      .toast.is-exiting {
        animation: toast-out 200ms ease-in forwards;
      }

      @keyframes toast-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes toast-out {
        to { opacity: 0; transform: translateY(-8px) scale(0.96); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast, .toast.is-exiting { animation: none; }
      }

      @media (max-width: 640px) {
        .toast-container {
          right: var(--space-sm);
          left: var(--space-sm);
          max-width: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.position = 'top-right';
    this.duration = 4000;
    this._toasts = [];
    this._counter = 0;
  }

  _getIcon(variant) {
    switch (variant) {
      case 'success': return '\u2713';
      case 'warning': return '\u26A0';
      case 'error':   return '\u2717';
      default:        return '\u2139';
    }
  }

  show({ message, variant = 'info', duration }) {
    const id = ++this._counter;
    const dur = duration ?? this.duration;
    this._toasts = [...this._toasts, { id, message, variant }];

    if (dur > 0) {
      setTimeout(() => this._dismiss(id), dur);
    }
  }

  _dismiss(id) {
    if (!this._toasts.some(t => t.id === id)) return;
    const el = this.shadowRoot.querySelector(`[data-toast-id="${id}"]`);
    if (el) {
      el.classList.add('is-exiting');
      const cleanup = () => {
        this._toasts = this._toasts.filter(t => t.id !== id);
        this.dispatchEvent(new CustomEvent('arc-dismiss', {
          detail: { id },
          bubbles: true,
          composed: true,
        }));
      };
      el.addEventListener('animationend', cleanup, { once: true });
      // Safety fallback if animation doesn't fire (e.g. prefers-reduced-motion)
      setTimeout(cleanup, 300);
    } else {
      this._toasts = this._toasts.filter(t => t.id !== id);
    }
  }

  render() {
    return html`
      <div class="toast-container" role="status" aria-live="polite" aria-atomic="false" part="container">
        ${this._toasts.map(t => html`
          <div class="toast toast--${t.variant}" data-toast-id=${t.id} part="toast">
            <span class="toast__icon" aria-hidden="true">${this._getIcon(t.variant)}</span>
            <span class="toast__message">${t.message}</span>
            <button class="toast__dismiss" @click=${() => this._dismiss(t.id)} aria-label="Dismiss">&times;</button>
          </div>
        `)}
      </div>
    `;
  }
}

customElements.define('arc-toast', ArcToast);
