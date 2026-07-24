import { LitElement, html, css } from 'lit';

/**
 * Action item inside a CommandPalette.
 *
 * @tag arc-command-item
 * @prop {string} shortcut - Keyboard shortcut hint
 * @prop {string} icon - Name of the icon to display before the item label.
 * @prop {string} keywords - Extra space-separated terms the search filter matches against but never displays — e.g. keywords="dialog popup" on a Modal item.
 * @slot - Default content.
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
