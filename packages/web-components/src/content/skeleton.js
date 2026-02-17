import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-skeleton
 */
export class ArcSkeleton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    width:   { type: String },
    height:  { type: String },
    count:   { type: Number },
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
          var(--surface-overlay) 25%,
          rgba(var(--accent-primary-rgb), 0.04) 37%,
          var(--surface-overlay) 63%
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

      .skeleton-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
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
    this.count = 1;
  }

  _renderOne() {
    const styles = [
      this.width ? `width:${this.width}` : '',
      this.height ? `height:${this.height}` : '',
      this.variant === 'circle' && !this.height && this.width ? `height:${this.width}` : '',
    ].filter(Boolean).join(';');

    return html`<div class="skeleton" part="skeleton" style=${styles}></div>`;
  }

  render() {
    const n = Math.max(1, this.count);
    if (n === 1) {
      return html`<div role="status" aria-label="Loading" aria-busy="true">${this._renderOne()}</div>`;
    }
    return html`
      <div class="skeleton-group" role="status" aria-label="Loading" aria-busy="true">
        ${Array.from({ length: n }, () => this._renderOne())}
      </div>
    `;
  }
}
