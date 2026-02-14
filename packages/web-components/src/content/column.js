import { LitElement, html, css } from 'lit';

/**
 * @tag arc-column
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
