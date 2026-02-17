import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-loading-overlay
 */
export class ArcLoadingOverlay extends LitElement {
  static properties = {
    active:  { type: Boolean, reflect: true },
    message: { type: String },
    global:  { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: contents; }

      .loading-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        background: rgba(var(--bg-surface-rgb, 0,0,0), 0.6);
        backdrop-filter: blur(4px);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--transition-base), visibility var(--transition-base);
      }

      :host([active]) .loading-overlay {
        opacity: 1;
        visibility: visible;
      }

      :host([global]) .loading-overlay {
        position: fixed;
        z-index: var(--z-overlay);
      }

      .loading-overlay__spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--border-subtle);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: lo-spin 0.8s linear infinite;
      }

      .loading-overlay__message {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      @keyframes lo-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .loading-overlay__spinner { animation-duration: 1.5s; }
        .loading-overlay { transition: none; }
      }
    `,
  ];

  constructor() {
    super();
    this.active = false;
    this.message = '';
    this.global = false;
  }

  render() {
    return html`
      <div class="loading-overlay" role="status" aria-live="polite" part="overlay">
        <div class="loading-overlay__spinner" part="spinner"></div>
        ${this.message ? html`<span class="loading-overlay__message" part="message">${this.message}</span>` : ''}
      </div>
    `;
  }
}
