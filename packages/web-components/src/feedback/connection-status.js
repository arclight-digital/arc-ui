import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-connection-status
 */
export class ArcConnectionStatus extends LitElement {
  static properties = {
    online:   { state: true },
    _visible: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .connection-status {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        transition: all var(--transition-base);
        overflow: hidden;
        max-height: 0;
        opacity: 0;
      }

      .connection-status.is-visible {
        max-height: 48px;
        opacity: 1;
      }

      .connection-status.is-offline {
        background: rgba(var(--color-warning-rgb), 0.08);
        border-bottom: 1px solid rgba(var(--color-warning-rgb), 0.2);
        color: var(--color-warning);
      }

      .connection-status.is-online {
        background: rgba(var(--color-success-rgb), 0.08);
        border-bottom: 1px solid rgba(var(--color-success-rgb), 0.2);
        color: var(--color-success);
      }

      .connection-status__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .connection-status.is-offline .connection-status__dot {
        background: var(--color-warning);
        animation: cs-pulse 2s ease-in-out infinite;
      }

      .connection-status.is-online .connection-status__dot {
        background: var(--color-success);
      }

      @keyframes cs-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

      @media (prefers-reduced-motion: reduce) {
        .connection-status { transition: none; }
        .connection-status__dot { animation: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.online = navigator.onLine;
    this._visible = false;
    this._onOnline = this._onOnline.bind(this);
    this._onOffline = this._onOffline.bind(this);
    this._hideTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);

    if (!navigator.onLine) {
      this.online = false;
      this._visible = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('online', this._onOnline);
    window.removeEventListener('offline', this._onOffline);
    if (this._hideTimer) clearTimeout(this._hideTimer);
  }

  _onOnline() {
    this.online = true;
    this._visible = true;
    this.dispatchEvent(new CustomEvent('arc-online', { bubbles: true, composed: true }));

    if (this._hideTimer) clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => {
      this._visible = false;
    }, 3000);
  }

  _onOffline() {
    this.online = false;
    this._visible = true;
    if (this._hideTimer) clearTimeout(this._hideTimer);
    this.dispatchEvent(new CustomEvent('arc-offline', { bubbles: true, composed: true }));
  }

  render() {
    const stateClass = this.online ? 'is-online' : 'is-offline';
    const visibleClass = this._visible ? 'is-visible' : '';
    const label = this.online ? 'Connection restored' : 'You are offline';

    return html`
      <div class="connection-status ${stateClass} ${visibleClass}" role="status" aria-live="polite" part="status">
        <span class="connection-status__dot" part="dot"></span>
        <span part="label">${label}</span>
      </div>
    `;
  }
}
