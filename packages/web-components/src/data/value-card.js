import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-value-card
 */
export class ArcValueCard extends LitElement {
  static properties = {
    icon:        { type: String },
    heading:     { type: String },
    description: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: flex; flex-direction: column; height: 100%; }

      .card {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--space-lg);
        padding: var(--space-lg);
        flex: 1;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        transition: border-color var(--transition-base), box-shadow var(--transition-base);
      }

      .card:hover {
        border-color: var(--border-bright);
        box-shadow: 0 0 20px rgba(var(--accent-secondary-rgb),0.06);
      }

      .card__icon {
        flex-shrink: 0;
        color: var(--accent-secondary);
        font-size: 24px; /* icon size, not text */
        line-height: 1;
        padding-top: 2px;
      }

      .card__text {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .card__title {
        font-size: 17px; /* heading size, keep hardcoded */
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .card__desc {
        color: var(--text-secondary);
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.7;
        margin: 0;
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
  }

  render() {
    return html`
      <div class="card" part="card">
        <div class="card__icon" part="icon"><slot name="icon">${this.icon}</slot></div>
        <div class="card__text">
          <h3 class="card__title" part="title">${this.heading}</h3>
          <p class="card__desc" part="description">${this.description}</p>
        </div>
      </div>
    `;
  }
}
