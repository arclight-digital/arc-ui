import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

/**
 * @tag arc-table
 */
export class ArcTable extends LitElement {
  static properties = {
    columns: { type: Array },
    rows:    { type: Array },
    striped: { type: Boolean, reflect: true },
    compact: { type: Boolean, reflect: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host {
        display: block;
        font-family: var(--font-body);
        font-size: var(--body-size);
      }

      .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm);
        color: var(--text-primary);
      }

      thead {
        background: var(--surface-overlay);
      }

      th {
        text-align: left;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-accent);
        font-weight: 600;
        font-size: var(--text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
      }

      :host([compact]) th {
        padding: var(--space-xs) var(--space-sm);
      }

      td {
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        color: var(--text-secondary);
        line-height: 1.5;
        font-size: var(--text-sm);
      }

      :host([compact]) td {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--text-sm);
      }

      tr:last-child td {
        border-bottom: none;
      }

      :host([striped]) tbody tr:nth-child(odd) {
        background: var(--surface-primary);
      }

      :host([striped]) tbody tr:nth-child(even) {
        background: var(--surface-raised);
      }

      tbody tr {
        transition: background var(--transition-fast);
      }

      tbody tr:hover {
        background: var(--surface-hover);
      }

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
    this.columns = [];
    this.rows = [];
    this.striped = false;
    this.compact = false;
  }

  render() {
    if (!this.columns.length) return '';

    return html`
      <div class="table-wrap" part="table-wrap">
        <table part="table">
          <thead part="head">
            <tr>
              ${this.columns.map(col => html`<th>${col}</th>`)}
            </tr>
          </thead>
          <tbody part="body">
            ${this.rows.map(row => html`
              <tr part="row">
                ${(Array.isArray(row) ? row : this.columns.map((_, i) => row[i])).map(
                  cell => html`<td part="cell">${cell ?? ''}</td>`
                )}
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}
