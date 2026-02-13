import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcSkeleton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    width:   { type: String },
    height:  { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .skeleton {
        background: linear-gradient(
          90deg,
          var(--bg-elevated) 25%,
          var(--border-subtle) 37%,
          var(--bg-elevated) 63%
        );
        background-size: 200% 100%;
        animation: shimmer 1.8s ease-in-out infinite;
      }

      :host([variant="text"]) .skeleton {
        width: 100%;
        height: 1em;
        border-radius: var(--radius-sm);
      }

      :host([variant="circle"]) .skeleton {
        border-radius: var(--radius-full);
      }

      :host([variant="rect"]) .skeleton {
        border-radius: var(--radius-md);
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
    this.variant = 'text';
    this.width = '';
    this.height = '';
  }

  render() {
    const styles = [
      this.width ? `width:${this.width}` : '',
      this.height ? `height:${this.height}` : '',
      this.variant === 'circle' && !this.height && this.width ? `height:${this.width}` : '',
    ].filter(Boolean).join(';');

    return html`
      <div
        class="skeleton"
        part="skeleton"
        role="status"
        aria-label="Loading"
        aria-busy="true"
        style=${styles}
      ></div>
    `;
  }
}

customElements.define('arc-skeleton', ArcSkeleton);
