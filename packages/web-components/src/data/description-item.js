import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * A single term/detail pair within a description list. The term is rendered as an uppercase label,
 * and the default slot holds the detail content.
 *
 * @tag arc-description-item
 * @prop {string} term - The key or label for this description entry, displayed as an uppercase heading.
 * @slot - Default content.
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

      .item__term {
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: var(--space-xs);
      }

      .item__detail {
        font-family: var(--font-body);
        font-size: var(--text-sm);
        color: var(--text-primary);
        line-height: 1.6;
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
      <div class="item" part="item" role="listitem">
        <div class="item__term" part="term">${this.term}</div>
        <div class="item__detail" part="detail"><slot></slot></div>
      </div>
    `;
  }
}
