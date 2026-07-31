import { LitElement, html, css } from 'lit';

/**
 * A single action entry inside the context menu.
 *
 * @tag arc-menu-item
 * @prop {string} label - Display text for the menu item.
 * @prop {string} shortcut - Keyboard shortcut hint displayed on the right side.
 * @prop {string} icon - Name of the icon to display before the label.
 * @prop {boolean} disabled - Disables the item, preventing interaction.
 * @prop {string} value - Stable identifier carried on the arc-select detail. Defaults to the label, which is fine until two items share one — give anything a handler must act on its own value rather than matching against display text.
 * @slot - Default content.
 */
export class ArcMenuItem extends LitElement {
  static properties = {
    shortcut: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    icon: { type: String },
    value: { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.shortcut = '';
    this.disabled = false;
    this.icon = '';
    this.value = '';
  }

  get label() {
    return this.textContent.trim();
  }

  /**
   * What arc-select reports. Falls back to the label so an item that never sets
   * `value` behaves as it always did.
   */
  get selectionValue() {
    return this.value || this.label;
  }

  render() {
    return html`<slot></slot>`;
  }
}
