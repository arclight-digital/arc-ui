import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Pinterest-style vertical-pack grid using CSS columns for efficient masonry layout without
 * JavaScript.
 *
 * @tag arc-masonry
 * @prop {number} columns - Number of columns in the masonry grid. The browser distributes children across columns to minimize overall height difference.
 * @prop {'sm' | 'md' | 'lg'} gap - Spacing between columns and rows, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg).
 * @slot - Default content.
 * @csspart masonry
 */
export class ArcMasonry extends LitElement {
  static properties = {
    columns: { type: Number, reflect: true },
    gap:     { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .masonry {
        column-count: var(--_cols, 3);
        column-gap: var(--space-md);
      }

      :host([gap="sm"]) .masonry {
        column-gap: var(--space-sm);
      }

      :host([gap="md"]) .masonry {
        column-gap: var(--space-md);
      }

      :host([gap="lg"]) .masonry {
        column-gap: var(--space-lg);
      }

      ::slotted(*) {
        break-inside: avoid;
        margin-bottom: var(--space-md);
      }

      :host([gap="sm"]) ::slotted(*) {
        margin-bottom: var(--space-sm);
      }

      :host([gap="lg"]) ::slotted(*) {
        margin-bottom: var(--space-lg);
      }
    `,
  ];

  constructor() {
    super();
    this.columns = 3;
    this.gap = 'md';
  }

  updated(changed) {
    if (changed.has('columns')) {
      this.style.setProperty('--_cols', String(this.columns));
    }
  }

  render() {
    return html`
      <div class="masonry" part="masonry">
        <slot></slot>
      </div>
    `;
  }
}
