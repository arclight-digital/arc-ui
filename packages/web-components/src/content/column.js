import { LitElement, html, css } from 'lit';

/**
 * Defines a single column within a DataTable. Each Column maps a data field key to a visible table
 * column with a header label. Columns are invisible DOM elements that act as declarative
 * configuration — they do not render any visible content themselves.
 *
 * @tag arc-column
 * @prop {string} key - The property name on each row object whose value should be displayed in this column. Must match a key present in the objects passed to the parent DataTable's `rows` array.
 * @prop {string} label - The human-readable header text displayed in the table's `<th>` element. This is what users see at the top of the column.
 * @prop {boolean} sortable - When true (and the parent DataTable also has `sortable`), clicking this column's header toggles ascending/descending sort on the corresponding data field. A sort indicator arrow appears next to the label.
 * @prop {string} width - Sets a fixed CSS width on the column (e.g., "100px", "20%"). Useful for constraining narrow columns like status badges or actions so they do not stretch unnecessarily.
 * @slot - Default content.
 */
export class ArcColumn extends LitElement {
  static properties = {
    key:      { type: String, reflect: true },
    label:    { type: String, reflect: true },
    sortable: { type: Boolean, reflect: true },
    width:    { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.key = '';
    this.label = '';
    this.sortable = false;
    this.width = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
