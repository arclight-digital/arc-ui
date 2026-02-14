import { LitElement, html, css } from 'lit';

/**
 * @tag arc-step
 */
export class ArcStep extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
