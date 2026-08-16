import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';
import { DeclaredPropsMixin, flag, oneOf } from '../shared/props.js';

/**
 * Data-driven table with striped and compact-density variants, powered by columns and rows props.
 *
 * @tag arc-table
 * @status stable
 * @prop {string[]} columns - Array of column header strings.
 * @prop {string[][]} rows - Array of row arrays. Each inner array contains cell values in column order.
 * @prop {boolean} striped - Alternating row backgrounds for improved scanability.
 * @prop {'default' | 'compact'} density - Row density. 'compact' reduces cell padding for dense data displays.
 * @slot none
 * @csspart table-wrap
 * @csspart table
 * @csspart head
 * @csspart body
 * @csspart row
 * @csspart cell
 */
export class ArcTable extends DeclaredPropsMixin(LitElement) {
  static properties = {
    columns: { type: Array },
    rows: { type: Array },
    striped: flag(false),
    density: oneOf(['default', 'compact']),
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
        font-size: var(--_text-sm);
        color: var(--text-primary);
      }

      thead {
        background: var(--surface-overlay);
      }

      th {
        text-align: start;
        padding: var(--space-sm) var(--space-md);
        font-family: var(--font-label);
        font-weight: var(--font-label-weight, 600);
        font-size: var(--_text-xs);
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--text-ghost);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
      }

      :host([density="compact"]) th {
        padding: var(--space-xs) var(--space-sm);
      }

      td {
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--divider);
        color: var(--text-secondary);
        line-height: 1.5;
        font-size: var(--_text-sm);
      }

      :host([density="compact"]) td {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--_text-sm);
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
    `,
  ];

  constructor() {
    super();
    this.columns = [];
    this.rows = [];
  }

  render() {
    if (!this.columns.length) return '';

    return html`
      <div class="table-wrap" part="table-wrap">
        <table part="table">
          <thead part="head">
            <tr>
              ${this.columns.map((col) => html`<th>${col}</th>`)}
            </tr>
          </thead>
          <tbody part="body">
            ${this.rows.map(
              (row) => html`
              <tr part="row">
                ${(Array.isArray(row) ? row : this.columns.map((_, i) => row[i])).map(
                  (cell) => html`<td part="cell">${cell ?? ''}</td>`,
                )}
              </tr>
            `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}
