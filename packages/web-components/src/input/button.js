import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcButton extends LitElement {
  static properties = {
    variant:  { type: String, reflect: true },
    size:     { type: String, reflect: true },
    href:     { type: String },
    disabled: { type: Boolean, reflect: true },
    type:     { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }
      :host([disabled]) { pointer-events: none; }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        font-family: var(--font-accent);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 2px;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition:
          background var(--transition-base),
          border-color var(--transition-base),
          box-shadow var(--transition-base),
          color var(--transition-base),
          transform var(--transition-fast);
        text-decoration: none;
        white-space: nowrap;
        box-sizing: border-box;
        min-height: var(--touch-min);
      }

      /* Sizes */
      :host([size="sm"]) .btn { font-size: var(--text-xs); padding: var(--space-xs) var(--space-md); }
      :host(:not([size])) .btn,
      :host([size="md"]) .btn { font-size: var(--text-xs); padding: var(--space-sm) var(--space-lg); }
      :host([size="lg"]) .btn { font-size: var(--text-xs); padding: var(--space-md) var(--space-xl); letter-spacing: 3px; }

      /* Primary */
      :host(:not([variant])) .btn,
      :host([variant="primary"]) .btn {
        background: var(--accent-primary);
        color: var(--bg-deep);
        border-color: var(--accent-primary);
      }
      :host(:not([variant])) .btn:hover,
      :host([variant="primary"]) .btn:hover { box-shadow: var(--glow-primary); }
      :host(:not([variant])) .btn:active,
      :host([variant="primary"]) .btn:active { transform: scale(0.97); box-shadow: 0 0 8px rgba(var(--accent-primary-rgb),0.5); }

      /* Secondary */
      :host([variant="secondary"]) .btn {
        background: transparent;
        color: var(--text-primary);
        border-color: var(--border-default);
      }
      :host([variant="secondary"]) .btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        box-shadow: 0 0 20px var(--accent-primary-ring);
      }
      :host([variant="secondary"]) .btn:active {
        transform: scale(0.97);
        background: rgba(var(--accent-primary-rgb),0.05);
      }

      /* Ghost */
      :host([variant="ghost"]) .btn {
        background: transparent;
        color: var(--text-muted);
        border-color: transparent;
      }
      :host([variant="ghost"]) .btn:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
      }
      :host([variant="ghost"]) .btn:active {
        transform: scale(0.97);
        background: var(--bg-elevated);
      }

      /* Focus */
      .btn:focus-visible { outline: none; box-shadow: var(--focus-glow); }

      /* Disabled */
      :host([disabled]) .btn { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

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
    this.variant = 'primary';
    this.size = 'md';
    this.href = '';
    this.disabled = false;
    this.type = 'button';
  }

  render() {
    if (this.href) {
      return html`<a class="btn" href=${this.href} part="button"><slot></slot></a>`;
    }
    return html`<button class="btn" type=${this.type} ?disabled=${this.disabled} part="button"><slot></slot></button>`;
  }
}

customElements.define('arc-button', ArcButton);
