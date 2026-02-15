import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-empty-state
 */
export class ArcEmptyState extends LitElement {
  static properties = {
    heading:     { type: String },
    description: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: var(--space-2xl) var(--space-xl);
        border: 1px dashed var(--border-default);
        border-radius: var(--radius-lg);
        background: var(--bg-card);
      }

      .empty__icon {
        margin-bottom: var(--space-lg);
        color: var(--text-ghost);
        font-size: 40px; /* icon size, not text */
      }

      .empty__heading {
        margin: 0 0 var(--space-sm);
        font-family: var(--font-body);
        font-size: var(--heading-size);
        font-weight: var(--heading-weight);
        color: var(--text-primary);
      }

      .empty__desc {
        margin: 0 0 var(--space-lg);
        font-family: var(--font-body);
        font-size: var(--body-size);
        line-height: var(--body-lh);
        color: var(--text-muted);
        max-width: 360px;
      }

      .empty__actions {
        display: flex;
        gap: var(--space-sm);
      }
    `,
  ];

  constructor() {
    super();
    this.heading = '';
    this.description = '';
  }

  render() {
    return html`
      <div class="empty" part="container" role="status">
        <div class="empty__icon" part="icon" aria-hidden="true">
          <slot name="icon"></slot>
        </div>
        ${this.heading ? html`<h3 class="empty__heading" part="heading">${this.heading}</h3>` : ''}
        ${this.description ? html`<p class="empty__desc" part="description">${this.description}</p>` : ''}
        <div class="empty__actions" part="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}
