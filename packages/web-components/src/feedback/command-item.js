import { LitElement, html, css } from 'lit';

/**
 * @tag arc-command-item
 */
export class ArcCommandItem extends LitElement {
  static properties = {
    shortcut: { type: String, reflect: true },
    icon:     { type: String },
    keywords: { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.shortcut = '';
    this.icon = '';
    this.keywords = '';
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
