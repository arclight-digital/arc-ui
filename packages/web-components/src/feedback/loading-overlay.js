import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../content/spinner.js';

/**
 * Semi-transparent surface-overlay with backdrop blur covering a container or page. Centers a
 * spinner with optional progress text.
 *
 * @tag arc-loading-overlay
 * @requires arc-spinner
 * @prop {boolean} active - Controls whether the loading overlay is visible. When true, the overlay fades in and blocks interaction with the content behind it.
 * @prop {string} message - Optional text displayed below the spinner. Use it to communicate what is loading or the current progress step.
 * @prop {boolean} global - When true, the overlay uses fixed positioning to cover the entire viewport instead of just its parent container. Includes a focus trap in this mode.
 * @csspart overlay
 * @csspart spinner
 * @csspart message
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
        background: var(--overlay-backdrop);
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

      .loading-overlay__message {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      @media (prefers-reduced-motion: reduce) {
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
        <arc-spinner size="lg" part="spinner"></arc-spinner>
        ${this.message ? html`<span class="loading-overlay__message" part="message">${this.message}</span>` : ''}
      </div>
    `;
  }
}
