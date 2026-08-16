import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, oneOf } from '../shared/props.js';

/**
 * Uniform aspect-ratio cell grid with configurable columns and ratio.
 *
 * @tag arc-aspect-grid
 * @status stable
 * @prop {number} columns - Number of columns in the grid. Each column is equal width (1fr).
 * @prop {'1/1' | '16/9' | '4/3'} ratio - Aspect ratio applied to every cell. 1/1 for squares, 16/9 for widescreen, 4/3 for classic landscape.
 * @prop {'sm' | 'md' | 'lg'} gap - Spacing between grid cells, mapped to design system spacing tokens (--space-sm, --space-md, --space-lg).
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart grid
 */
export class ArcAspectGrid extends DeclaredPropsMixin(LitElement) {
  static properties = {
    columns: { type: Number, reflect: true },
    ratio: oneOf(['1/1', '16/9', '4/3']),
    gap: oneOf(['sm', 'md', 'lg'], { default: 'md' }),
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
      <div class="grid" part="base grid">
        <slot></slot>
      </div>
    `;
  }
}
