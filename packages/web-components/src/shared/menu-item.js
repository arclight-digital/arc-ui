import { LitElement, html, css } from 'lit';

/**
 * A single action entry inside the context menu.
 *
 * @tag arc-menu-item
 * @prop {string} label - Display text for the menu item.
 * @prop {string} shortcut - Keyboard shortcut hint displayed on the right side.
 * @prop {string} icon - Name of the icon to display before the label.
 * @prop {boolean} disabled - Disables the item, preventing interaction.
 * @slot - Default content.
 */
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
