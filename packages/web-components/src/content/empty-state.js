import { LitElement, html, css, nothing } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Placeholder for empty lists or search results.
 *
 * @tag arc-empty-state
 * @status stable
 * @prop {string} heading - Main heading text displayed below the icon
 * @prop {string} description - Supporting text displayed below the heading, max-width 360px
 * @prop {boolean} announce - Makes the empty state a polite live region (`role="status"`), so a screen reader reads it when it appears, as for "No results" after a search the user just ran. Off by default: an empty list on page load is not news, and a live region reads out everything that changes inside it.
 * @slot icon
 * @slot actions
 * @csspart base - The root element.
 * @csspart container
 * @csspart icon
 * @csspart heading
 * @csspart description
 * @csspart actions
 */
export class ArcEmptyState extends DeclaredPropsMixin(LitElement) {
  static properties = {
    heading: { type: String },
    description: { type: String },
    announce: flag(false),
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
        background: var(--surface-raised);
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

  /**
   * A live region only on request. It used to be unconditional, so a countdown
   * inside the empty state was read out on every tick (finding #123).
   */
  render() {
    return html`
      <div class="empty" part="base container" role=${this.announce ? 'status' : nothing}>
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
