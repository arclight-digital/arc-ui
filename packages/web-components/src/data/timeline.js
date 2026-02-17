import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-timeline
 * @requires arc-timeline-item
 */
export class ArcTimeline extends LitElement {
  static properties = {
    _items: { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; }

      .timeline {
        display: flex;
        flex-direction: column;
        gap: 0;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .timeline__item {
        display: flex;
        gap: var(--space-lg);
        position: relative;
        padding-bottom: var(--space-xl);
      }

      .timeline__item:last-child { padding-bottom: 0; }

      .timeline__marker {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        width: 24px;
        position: relative;
      }

      .timeline__dot {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
        background: var(--accent-primary);
        border: 2px solid var(--surface-base);
        box-shadow:
          0 0 0 1px rgba(var(--accent-primary-rgb), 0.3),
          0 0 8px rgba(var(--accent-primary-rgb), 0.25);
        flex-shrink: 0;
        z-index: 1;
        position: relative;
        transition: box-shadow var(--transition-fast), transform var(--transition-fast);
      }

      .timeline__item:hover .timeline__dot {
        box-shadow:
          0 0 0 2px rgba(var(--accent-primary-rgb), 0.4),
          0 0 14px rgba(var(--accent-primary-rgb), 0.4);
        transform: scale(1.2);
      }

      .timeline__line {
        position: absolute;
        top: 12px;
        bottom: calc(-1 * var(--space-xl));
        left: 50%;
        width: 1px;
        transform: translateX(-50%);
        background: linear-gradient(180deg, rgba(var(--accent-primary-rgb), 0.4), var(--border-default) 40%);
      }

      .timeline__item:last-child .timeline__line { display: none; }

      .timeline__content {
        flex: 1;
        min-width: 0;
        padding-top: 0;
      }

      .timeline__title {
        margin: 0;
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-primary);
        line-height: 1.4;
        transition: color var(--transition-fast);
      }

      .timeline__item:hover .timeline__title {
        color: var(--accent-primary);
      }

      .timeline__desc {
        margin: var(--space-sm) 0 0;
        font-family: var(--font-body);
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--text-muted);
      }

      .timeline__date {
        margin: var(--space-sm) 0 0;
        font-family: var(--font-accent);
        font-size: var(--text-xs);
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
      }

      .timeline__slot-host { display: none; }

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
    this._items = [];
  }

  _onSlotChange(e) {
    this._items = e.target.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'ARC-TIMELINE-ITEM');
  }

  render() {
    return html`
      <div class="timeline__slot-host">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
      <ol class="timeline" part="timeline" role="list">
        ${this._items.map(
          (item) => html`
            <li class="timeline__item" part="item">
              <div class="timeline__marker" part="marker">
                <span class="timeline__dot" part="dot"></span>
                <span class="timeline__line" part="line"></span>
              </div>
              <div class="timeline__content" part="content">
                <h4 class="timeline__title" part="title">${item.heading || ''}</h4>
                ${item.description
                  ? html`<p class="timeline__desc" part="description">${item.description}</p>`
                  : ''}
                ${item.date
                  ? html`<time class="timeline__date" part="date">${item.date}</time>`
                  : ''}
              </div>
            </li>
          `
        )}
      </ol>
    `;
  }
}
