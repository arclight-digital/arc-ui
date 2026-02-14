import { LitElement, html, css } from 'lit';

/**
 * @tag arc-option
 */
export class ArcOption extends LitElement {
  static properties = {
    value:    { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.value = '';
    this.disabled = false;
    this.selected = false;
  }

  /** Expose text content as label */
  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
