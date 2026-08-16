import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * A single term/detail pair within a description list. The term is rendered as an uppercase label,
 * and the default slot holds the detail content.
 *
 * @tag arc-description-item
 * @status stable
 * @prop {string} term - The key or label for this description entry, displayed as an uppercase heading.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart item
 * @csspart term
 * @csspart detail
 */
export class ArcDescriptionItem extends LitElement {
  static properties = {
    term: { type: String },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      /* Stacked by default; a parent arc-description-list[layout="horizontal"]
         sets these four properties to put the term beside the detail. They are
         read with fallbacks so an item used on its own still lays out — the
         parent is the only writer, and it may not be there. */
      .item {
        display: grid;
        grid-template-columns: var(--_dl-item-columns, 1fr);
        gap: var(--_dl-item-gap, 0);
        align-items: var(--_dl-item-align, initial);
      }

      .item__term {
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: var(--label-spacing);
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--_dl-term-margin, var(--space-xs));
      }

      .item__detail {
        font-family: var(--font-body);
        font-size: var(--_text-sm);
        color: var(--text-primary);
        line-height: var(--body-lh);
        margin: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.term = '';
  }

  render() {
    return html`
      <div class="item" part="base item" role="listitem">
        <div class="item__term" part="term">${this.term}</div>
        <div class="item__detail" part="detail"><slot></slot></div>
      </div>
    `;
  }
}
