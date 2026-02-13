import { LitElement, html, css } from 'lit';

export class ArcMenuItem extends LitElement {
  static properties = {
    shortcut: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    icon:     { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.shortcut = '';
    this.disabled = false;
    this.icon = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-menu-item', ArcMenuItem);
