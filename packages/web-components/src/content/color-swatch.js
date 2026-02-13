import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcColorSwatch extends LitElement {
  static properties = {
    color: { type: String },
    label: { type: String },
    size:  { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: inline-flex; }

      .swatch {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
      }

      .swatch__color {
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        transition: border-color var(--transition-base), box-shadow var(--transition-base);
      }

      .swatch__color:hover {
        border-color: var(--border-bright);
        box-shadow: 0 0 12px rgba(var(--accent-primary-rgb), 0.1);
      }

      :host([size="sm"]) .swatch__color { width: 32px; height: 32px; border-radius: var(--radius-sm); }
      :host([size="md"]) .swatch__color { width: 48px; height: 48px; }
      :host([size="lg"]) .swatch__color { width: 64px; height: 64px; border-radius: var(--radius-lg); }

      .swatch__label {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        color: var(--text-muted);
        text-align: center;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

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
    this.color = '#4d7ef7';
    this.label = '';
    this.size = 'md';
  }

  render() {
    const displayLabel = this.label || this.color;

    return html`
      <div class="swatch" part="swatch">
        <div
          class="swatch__color"
          part="color"
          style="background-color:${this.color}"
          role="img"
          aria-label=${`Color: ${displayLabel}`}
        ></div>
        <span class="swatch__label" part="label">${displayLabel}</span>
      </div>
    `;
  }
}

customElements.define('arc-color-swatch', ArcColorSwatch);
