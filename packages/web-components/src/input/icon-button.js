import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import '../content/icon.js';

export class ArcIconButton extends LitElement {
  static properties = {
    name:     { type: String, reflect: true },
    text:     { type: String },
    variant:  { type: String, reflect: true },
    size:     { type: String, reflect: true },
    label:    { type: String },
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
        gap: var(--space-xs);
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
        box-sizing: border-box;
        color: inherit;
      }

      /* Icon-only (square) */
      .btn:not(.btn--has-text) { aspect-ratio: 1; }

      /* With text */
      .btn--has-text {
        font-family: var(--font-accent);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        white-space: nowrap;
      }

      .btn__text {
        line-height: 1;
      }

      /* Sizes — icon-only */
      :host([size="xs"]) .btn:not(.btn--has-text) { width: 28px; height: 28px; border-radius: var(--radius-sm); }
      :host([size="sm"]) .btn:not(.btn--has-text) { width: 32px; height: 32px; }
      :host(:not([size])) .btn:not(.btn--has-text),
      :host([size="md"]) .btn:not(.btn--has-text) { width: 36px; height: 36px; }
      :host([size="lg"]) .btn:not(.btn--has-text) { width: 44px; height: 44px; }

      /* Sizes — with text */
      :host([size="xs"]) .btn--has-text { padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs); }
      :host([size="sm"]) .btn--has-text { padding: calc(var(--space-xs) + 2px) calc(var(--space-sm) + 2px); font-size: var(--text-xs); }
      :host(:not([size])) .btn--has-text,
      :host([size="md"]) .btn--has-text { padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs); }
      :host([size="lg"]) .btn--has-text { padding: var(--space-sm) var(--space-md); font-size: var(--text-xs); }

      /* Ghost (default) */
      :host(:not([variant])) .btn,
      :host([variant="ghost"]) .btn {
        background: transparent;
        color: var(--text-muted);
        border-color: transparent;
      }
      :host(:not([variant])) .btn:hover,
      :host([variant="ghost"]) .btn:hover {
        color: var(--text-primary);
        background: var(--bg-hover);
      }
      :host(:not([variant])) .btn:active,
      :host([variant="ghost"]) .btn:active {
        transform: scale(0.93);
        background: var(--bg-elevated);
      }

      /* Secondary */
      :host([variant="secondary"]) .btn {
        background: transparent;
        color: var(--text-secondary);
        border-color: var(--border-default);
      }
      :host([variant="secondary"]) .btn:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        box-shadow: 0 0 16px var(--accent-primary-ring);
      }
      :host([variant="secondary"]) .btn:active {
        transform: scale(0.93);
        background: rgba(var(--accent-primary-rgb), 0.05);
      }

      /* Primary */
      :host([variant="primary"]) .btn {
        background: var(--accent-primary);
        color: var(--bg-deep);
        border-color: var(--accent-primary);
      }
      :host([variant="primary"]) .btn:hover {
        box-shadow: var(--glow-primary);
      }
      :host([variant="primary"]) .btn:active {
        transform: scale(0.93);
        box-shadow: 0 0 8px rgba(var(--accent-primary-rgb), 0.5);
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
    this.name = '';
    this.text = '';
    this.variant = 'ghost';
    this.size = 'md';
    this.label = '';
    this.href = '';
    this.disabled = false;
    this.type = 'button';
  }

  /** Map icon-button size to arc-icon size */
  get _iconSize() {
    const map = { xs: 'xs', sm: 'sm', md: 'sm', lg: 'md' };
    return map[this.size] || 'sm';
  }

  render() {
    const hasText = !!this.text;
    const icon = this.name
      ? html`<arc-icon name=${this.name} size=${this._iconSize}></arc-icon>`
      : html`<slot></slot>`;
    const textEl = hasText ? html`<span class="btn__text">${this.text}</span>` : null;
    const classes = `btn${hasText ? ' btn--has-text' : ''}`;

    if (this.href) {
      return html`<a class=${classes} href=${this.href} aria-label=${this.label || this.text || ''} part="button">${icon}${textEl}</a>`;
    }
    return html`
      <button
        class=${classes}
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${this.label || this.text || ''}
        part="button"
      >${icon}${textEl}</button>
    `;
  }
}

customElements.define('arc-icon-button', ArcIconButton);
