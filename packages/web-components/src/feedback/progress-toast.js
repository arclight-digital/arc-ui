import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-progress-toast
 */
export class ArcProgressToast extends LitElement {
  static properties = {
    position: { type: String, reflect: true },
    _toasts:  { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .progress-toast-container {
        position: fixed;
        z-index: var(--z-toast);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        pointer-events: none;
        max-width: 360px;
        width: 100%;
      }

      :host([position="bottom-right"]) .progress-toast-container,
      :host(:not([position])) .progress-toast-container {
        bottom: var(--space-lg);
        right: var(--space-lg);
      }

      :host([position="top-right"]) .progress-toast-container {
        top: var(--space-lg);
        right: var(--space-lg);
      }

      .progress-toast {
        pointer-events: auto;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        background: var(--surface-overlay);
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-overlay);
        animation: pt-in 300ms var(--ease-out-expo);
      }

      .progress-toast.is-exiting {
        animation: pt-out 200ms ease-in forwards;
      }

      .progress-toast__message {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--space-sm);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .progress-toast__track {
        height: 4px;
        border-radius: var(--radius-full);
        background: var(--border-subtle);
        overflow: hidden;
      }

      .progress-toast__fill {
        height: 100%;
        border-radius: var(--radius-full);
        background: var(--gradient-accent-text);
        transition: width var(--transition-base);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.3);
      }


      @keyframes pt-in {
        from { opacity: 0; transform: translateY(8px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes pt-out {
        to { opacity: 0; transform: translateY(8px) scale(0.96); }
      }

      @media (prefers-reduced-motion: reduce) {
        .progress-toast, .progress-toast.is-exiting { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.position = 'bottom-right';
    this._toasts = [];
    this._counter = 0;
  }

  show({ message, progress = 0, onCancel }) {
    const id = ++this._counter;
    this._toasts = [...this._toasts, { id, message, progress, onCancel }];
    return id;
  }

  update(changedProps) {
    super.update(changedProps);
  }

  updateToast(id, { progress, message }) {
    this._toasts = this._toasts.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        progress: progress !== undefined ? progress : t.progress,
        message: message !== undefined ? message : t.message,
      };
    });
  }

  complete(id) {
    const el = this.shadowRoot.querySelector(`[data-toast-id="${id}"]`);
    if (el) {
      el.classList.add('is-exiting');
      const cleanup = () => {
        this._toasts = this._toasts.filter(t => t.id !== id);
        this.dispatchEvent(new CustomEvent('arc-complete', {
          detail: { id },
          bubbles: true,
          composed: true,
        }));
      };
      el.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 300);
    } else {
      this._toasts = this._toasts.filter(t => t.id !== id);
    }
  }

  _cancel(toast) {
    if (toast.onCancel) toast.onCancel();
    this.dispatchEvent(new CustomEvent('arc-cancel', {
      detail: { id: toast.id },
      bubbles: true,
      composed: true,
    }));
    this._toasts = this._toasts.filter(t => t.id !== toast.id);
  }

  render() {
    return html`
      <div class="progress-toast-container" role="status" aria-live="polite" part="container">
        ${this._toasts.map(t => html`
          <div class="progress-toast" data-toast-id=${t.id} part="toast">
            <div class="progress-toast__message">
              <span>${t.message}</span>
              ${t.onCancel ? html`
                <arc-icon-button name="x" label="Cancel" variant="ghost" size="sm" @click=${() => this._cancel(t)} part="cancel"></arc-icon-button>
              ` : ''}
            </div>
            <div class="progress-toast__track" part="track">
              <div class="progress-toast__fill" style="width:${Math.min(100, Math.max(0, t.progress))}%" part="fill"></div>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}
