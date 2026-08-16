import { LitElement, html, css } from 'lit';
import { DeclaredPropsMixin, flag } from '../shared/props.js';

/**
 * Defines a single column within a DataTable. Each Column maps a data field key to a visible table
 * column with a header label. Columns are invisible DOM elements that act as declarative
 * configuration — they do not render any visible content themselves.
 *
 * @tag arc-column
 * @status stable
 * @prop {string} field - The property name on each row object whose value should be displayed in this column. Must match a key present in the objects passed to the parent DataTable's `rows` array. Prefer this over `key`, which React and Preact intercept before the component sees it.
 * @prop {string} key - Alias of `field`, kept for compatibility. Works in HTML, Vue, Svelte, Angular and Solid, but **not** in React or Preact: both reserve `key` for list reconciliation and strip it before the component receives it. `field` takes precedence when both are set.
 * @prop {string} label - The human-readable header text displayed in the table's `<th>` element. This is what users see at the top of the column.
 * @prop {boolean} sortable - When true (and the parent DataTable also has `sortable`), clicking this column's header toggles ascending/descending sort on the corresponding data field. A sort indicator arrow appears next to the label.
 * @prop {string} width - Sets a fixed CSS width on the column (e.g., "100px", "20%"). Useful for constraining narrow columns like status badges or actions so they do not stretch unnecessarily.
 * @slot - Default content.
 */
export class ArcColumn extends DeclaredPropsMixin(LitElement) {
  static properties = {
    field: { type: String, reflect: true },
    key: { type: String, reflect: true },
    label: { type: String, reflect: true },
    sortable: flag(false),
    width: { type: String },
  };

  /**
   * The row property this column reads, from whichever alias was supplied.
   * React and Preact strip `key` in the reconciler, so a React consumer can
   * only ever reach this through `field`.
   */
  get fieldName() {
    return this.field || this.key;
  }

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.field = '';
    this.key = '';
    this.label = '';
    this.width = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
