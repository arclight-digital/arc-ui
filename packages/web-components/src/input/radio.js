import { LitElement, html, css } from 'lit';

/**
 * @tag arc-radio
 */
export class ArcRadio extends LitElement {
  static properties = {
    value:    { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
