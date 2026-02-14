import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-dashboard-grid
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
