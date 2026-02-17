import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-snackbar
 */
export class ArcSnackbar extends LitElement {
  static properties = {
    position:   { type: String, reflect: true },
    duration:   { type: Number },
    _snackbars: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .snackbar-container {
        position: fixed;
        z-index: var(--z-toast);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        pointer-events: none;
      }

      :host([position="bottom-center"]) .snackbar-container,
      :host(:not([position])) .snackbar-container {
        bottom: var(--space-lg);
        left: 50%;
        transform: translateX(-50%);
      }

      :host([position="bottom-left"]) .snackbar-container {
        bottom: var(--space-lg);
        left: var(--space-lg);
      }

      :host([position="bottom-right"]) .snackbar-container {
        bottom: var(--space-lg);
        right: var(--space-lg);
      }

      .snackbar {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm);
        border-radius: var(--radius-md);
        background: var(--surface-primary);
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-overlay);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        min-width: 300px;
        max-width: 560px;
        animation: snackbar-in 300ms var(--ease-out-expo);
      }

      .snackbar.is-exiting {
        animation: snackbar-out 200ms ease-in forwards;
      }

      .snackbar__message { flex: 1; }


      @keyframes snackbar-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes snackbar-out {
        to { opacity: 0; transform: translateY(8px); }
      }

      @media (prefers-reduced-motion: reduce) {
        .snackbar, .snackbar.is-exiting { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.position = 'bottom-center';
    this.duration = 5000;
    this._snackbars = [];
    this._counter = 0;
  }

  show({ message, action, actionLabel }) {
    const id = ++this._counter;
    this._snackbars = [...this._snackbars, { id, message, action, actionLabel }];

    if (this.duration > 0) {
      setTimeout(() => this._dismiss(id), this.duration);
    }
  }

  _handleAction(snackbar) {
    if (snackbar.action) snackbar.action();
    this.dispatchEvent(new CustomEvent('arc-action', {
      detail: { id: snackbar.id },
      bubbles: true,
      composed: true,
    }));
    this._dismiss(snackbar.id);
  }

  _dismiss(id) {
    if (!this._snackbars.some(s => s.id === id)) return;
    const el = this.shadowRoot.querySelector(`[data-snackbar-id="${id}"]`);
    if (el) {
      el.classList.add('is-exiting');
      const cleanup = () => {
        this._snackbars = this._snackbars.filter(s => s.id !== id);
        this.dispatchEvent(new CustomEvent('arc-dismiss', {
          detail: { id },
          bubbles: true,
          composed: true,
        }));
      };
      el.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 300);
    } else {
      this._snackbars = this._snackbars.filter(s => s.id !== id);
    }
  }

  render() {
    return html`
      <div class="snackbar-container" role="status" aria-live="polite" aria-atomic="false" part="container">
        ${this._snackbars.map(s => html`
          <div class="snackbar" data-snackbar-id=${s.id} part="snackbar">
            <span class="snackbar__message">${s.message}</span>
            ${s.actionLabel ? html`
              <arc-button variant="ghost" size="sm" @click=${() => this._handleAction(s)} part="action">${s.actionLabel}</arc-button>
            ` : ''}
            <arc-icon-button name="x" label="Dismiss" variant="ghost" size="sm" @click=${() => this._dismiss(s.id)} part="dismiss"></arc-icon-button>
          </div>
        `)}
      </div>
    `;
  }
}
