import { LitElement, html, css } from 'lit';

export class ArcCommandItem extends LitElement {
  static properties = {
    shortcut: { type: String, reflect: true },
    icon:     { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.shortcut = '';
    this.icon = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('arc-command-item', ArcCommandItem);
