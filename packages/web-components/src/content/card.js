import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcCard extends LitElement {
  static properties = {
    href: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .card {
        position: relative;
        border-radius: var(--radius-lg);
        padding: 1px;
        background: var(--border-subtle);
        transition: background var(--transition-slow);
        text-decoration: none;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      :host([href]) .card:hover {
        background: linear-gradient(135deg, rgba(var(--accent-primary-rgb),0.3), rgba(var(--accent-secondary-rgb),0.15), var(--border-default));
      }

      .card__inner {
        position: relative;
        background: var(--bg-card);
        border-radius: calc(var(--radius-lg) - 1px);
        padding: var(--space-xl) var(--space-lg);
        flex: 1;
        min-height: 0;
        transition: box-shadow var(--transition-slow);
      }

      .card:hover .card__inner {
        box-shadow: inset 0 1px 0 var(--bg-hover), var(--glow-card-hover);
      }

      .card:focus-visible { outline: none; box-shadow: var(--focus-glow); border-radius: var(--radius-lg); }

      @media (max-width: 768px) {
        .card__inner { padding: var(--space-lg) var(--space-md); }
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
    this.href = '';
  }

  render() {
    if (this.href) {
      return html`<a class="card" href=${this.href} part="card"><div class="card__inner" part="inner"><slot></slot></div></a>`;
    }
    return html`<div class="card" part="card"><div class="card__inner" part="inner"><slot></slot></div></div>`;
  }
}

customElements.define('arc-card', ArcCard);
