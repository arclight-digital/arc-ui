import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { cardHoverStyles } from '../card-styles.js';

/**
 * @tag arc-feature-card
 */
export class ArcFeatureCard extends LitElement {
  static properties = {
    icon:        { type: String },
    heading:     { type: String },
    description: { type: String },
    href:        { type: String },
    action:      { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    cardHoverStyles,
    css`
      :host { display: block; height: 100%; }

      .card { height: 100%; }

      .card__inner {
        padding: var(--space-lg);
        gap: var(--space-md);
        z-index: 1;
      }

      .card__icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        background: var(--accent-primary-subtle);
        border: 1px solid var(--accent-primary-border);
        color: var(--accent-primary);
        font-size: 20px; /* icon size, not text */
        transition: box-shadow var(--transition-slow), border-color var(--transition-slow), transform var(--transition-slow);
      }

      .card:hover .card__icon {
        border-color: rgba(var(--accent-primary-rgb),0.3);
        box-shadow: 0 0 20px var(--accent-primary-glow), 0 0 6px var(--accent-primary-border);
        transform: translateY(-2px);
      }

      .card__title {
        font-size: 17px; /* heading size, keep hardcoded */
        font-weight: 600;
        color: var(--text-primary);
        transition: color var(--transition-slow);
        margin: 0;
      }

      .card:hover .card__title { color: var(--text-primary); }

      .card__desc {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.7;
        flex: 1;
        margin: 0;
      }

      .card__action {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-ghost);
        transition: color var(--transition-fast), gap var(--transition-fast);
      }

      .card:hover .card__action {
        color: var(--accent-primary);
        gap: 10px;
      }

      .card__action-arrow {
        display: inline-block;
        width: 14px;
        height: 14px;
        transition: transform var(--transition-fast);
      }

      .card:hover .card__action-arrow {
        transform: translateX(2px);
      }

      .card__rule {
        width: 32px;
        height: 1px;
        background: linear-gradient(90deg, var(--accent-primary), transparent);
        opacity: 0;
        transition: opacity var(--transition-slow), width var(--transition-slow);
      }

      .card:hover .card__rule { opacity: 0.5; width: 48px; }

      @media (max-width: 768px) { /* --breakpoint-md */
        .card__inner { padding: var(--space-md); }
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
    this.icon = '';
    this.heading = '';
    this.description = '';
    this.href = '';
    this.action = '';
  }

  render() {
    const inner = html`
      <div class="card__inner" part="inner">
        <div class="card__icon" part="icon"><slot name="icon">${this.icon}</slot></div>
        <h3 class="card__title" part="title">${this.heading}</h3>
        <p class="card__desc" part="description">${this.description}</p>
        ${this.action && this.href ? html`
          <span class="card__action" part="action">
            ${this.action}
            <svg class="card__action-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        ` : ''}
        <span class="card__rule"></span>
      </div>
    `;

    if (this.href) {
      return html`<a class="card" href=${this.href} part="card">${inner}</a>`;
    }
    return html`<div class="card" part="card">${inner}</div>`;
  }
}
