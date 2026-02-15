import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-aspect-grid
 */
export class ArcAspectGrid extends LitElement {
  static properties = {
    columns: { type: Number, reflect: true },
    ratio:   { type: String, reflect: true },
    gap:     { type: String, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(var(--_cols, 3), 1fr);
        gap: var(--space-md);
      }

      :host([gap="sm"]) .grid {
        gap: var(--space-sm);
      }

      :host([gap="md"]) .grid {
        gap: var(--space-md);
      }

      :host([gap="lg"]) .grid {
        gap: var(--space-lg);
      }

      ::slotted(*) {
        aspect-ratio: var(--_ratio, 1 / 1);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
    `,
  ];

  constructor() {
    super();
    this.columns = 3;
    this.ratio = '1/1';
    this.gap = 'md';
  }

  updated(changed) {
    if (changed.has('columns')) {
      this.style.setProperty('--_cols', String(this.columns));
    }
    if (changed.has('ratio')) {
      const r = this.ratio.replace('/', ' / ');
      this.style.setProperty('--_ratio', r);
    }
  }

  render() {
    return html`
      <div class="grid" part="grid">
        <slot></slot>
      </div>
    `;
  }
}
