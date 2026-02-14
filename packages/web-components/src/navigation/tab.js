import { LitElement, html, css } from 'lit';

/**
 * @arc-prism interactive — tab panel, child of arc-tabs
 */
/**
 * @tag arc-tab
 */
export class ArcTab extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
