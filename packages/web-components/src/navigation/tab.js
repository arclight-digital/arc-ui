import { LitElement, html, css } from 'lit';

/**
 * @arc-prism interactive — tab panel, child of arc-tabs
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

customElements.define('arc-tab', ArcTab);
