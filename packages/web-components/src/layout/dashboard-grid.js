import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

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
          minmax(var(--min-col, 280px), 1fr)
        );
        gap: var(--gap, var(--space-lg));
        padding: var(--space-lg);
      }

      :host([data-explicit-columns]) .dashboard-grid {
        grid-template-columns: repeat(var(--columns, 3), 1fr);
      }
    `,
  ];

  constructor() {
    super();
    this.columns = 3;
    this.gap = 'var(--space-lg)';
    this.minColumnWidth = '280px';
    this._explicitColumns = false;
  }

  updated(changedProperties) {
    this.style.setProperty('--min-col', this.minColumnWidth);
    this.style.setProperty('--columns', this.columns);
    this.style.setProperty('--gap', this.gap);

    if (changedProperties.has('columns') && this.hasAttribute('columns')) {
      this.setAttribute('data-explicit-columns', '');
    }
  }

  render() {
    return html`
      <div class="dashboard-grid" part="grid">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('arc-dashboard-grid', ArcDashboardGrid);
