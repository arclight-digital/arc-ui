import { LitElement, html, css } from 'lit';

/**
 * @tag arc-spy-link
 */
export class ArcSpyLink extends LitElement {
  static properties = {
    target: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.target = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
