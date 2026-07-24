import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * Responsive grid for dashboard metric cards.
 *
 * @tag arc-dashboard-grid
 * @prop {number} columns - Number of columns when using explicit column mode. When this attribute is set on the element, the grid switches from auto-fill to a fixed repeat(N, 1fr) layout.
 * @prop {string} gap - Gap between grid cells. Accepts any CSS length value or spacing token. Maps to the --gap CSS custom property.
 * @prop {string} minColumnWidth - Minimum column width in auto-fill mode. Controls the minmax() threshold at which columns wrap to the next row. Maps to the --min-col CSS custom property.
 * @slot - Default content.
 * @csspart grid
 */
export class ArcDashboardGrid extends LitElement {
  static properties = {
    columns: { type: Number },
    gap: { type: String },
    minColumnWidth: { type: String, attribute: 'min-column-width' },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        box-sizing: border-box;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--min-col, 280px), 100%), 1fr)
        );
        gap: var(--gap, var(--space-lg));
        padding: var(--space-lg);
      }
    `,
  ];

  constructor() {
    super();
    this.columns = 0;
    this.gap = 'var(--space-lg)';
    this.minColumnWidth = '280px';
  }

  updated() {
    // When explicit columns are set, use max() of the absolute minimum and
    // the column-derived minimum. On wide viewports the column fraction is
    // larger, capping at N columns. On narrow viewports the absolute minimum
    // wins, forcing items to wrap.
    const minCol = this.columns > 0
      ? `max(${this.minColumnWidth}, (100% - ${this.columns - 1} * ${this.gap}) / ${this.columns})`
      : this.minColumnWidth;

    this.style.setProperty('--min-col', minCol);
    this.style.setProperty('--gap', this.gap);
  }

  render() {
    return html`
      <div class="dashboard-grid" part="grid">
        <slot></slot>
      </div>
    `;
  }
}
