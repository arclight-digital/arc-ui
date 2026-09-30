import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { styleMap } from 'lit/directives/style-map.js';
import { DeclaredPropsMixin, int } from '../shared/props.js';

/**
 * Responsive grid for dashboard metric cards.
 *
 * @tag arc-dashboard-grid
 * @status stable
 * @prop {number} columns - Number of columns when using explicit column mode. When this attribute is set on the element, the grid switches from auto-fill to a fixed repeat(N, 1fr) layout.
 * @prop {string} gap - Gap between grid cells. Accepts any CSS length value or spacing token. Maps to the --gap CSS custom property.
 * @prop {string} minColumnWidth - Minimum column width in auto-fill mode. Controls the minmax() threshold at which columns wrap to the next row. Maps to the --min-col CSS custom property.
 * @slot - Default content.
 * @csspart base - The root element.
 * @csspart grid
 */
export class ArcDashboardGrid extends DeclaredPropsMixin(LitElement) {
  static properties = {
    columns: int({ default: 0, min: 0, clamp: 'toRange' }),
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
    this.gap = 'var(--space-lg)';
    this.minColumnWidth = '280px';
  }

  /**
   * The column minimum. With explicit columns, the max() of the absolute
   * minimum and the column-derived one: on wide viewports the column fraction
   * is larger, capping at N columns; on narrow ones the absolute minimum wins
   * and items wrap.
   */
  get _minCol() {
    return this.columns > 0
      ? `max(${this.minColumnWidth}, (100% - ${this.columns - 1} * ${this.gap}) / ${this.columns})`
      : this.minColumnWidth;
  }

  // On the host, where it has always been and where a page can read it.
  updated() {
    this.style.setProperty('--min-col', this._minCol);
    this.style.setProperty('--gap', this.gap);
  }

  render() {
    // In the template too: the server renders it and never runs updated(), so
    // a grid with columns or a gap of its own drew with the defaults and
    // reflowed when its script arrived.
    return html`
      <div class="dashboard-grid" part="base grid" style=${styleMap({ '--min-col': this._minCol, '--gap': this.gap })}>
        <slot></slot>
      </div>
    `;
  }
}
