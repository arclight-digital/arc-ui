import { LitElement, html, css } from 'lit';

/**
 * Action item inside a CommandPalette.
 *
 * @tag arc-command-item
 * @prop {string} shortcut - Keyboard shortcut hint
 * @prop {string} icon - Name of the icon to display before the item label.
 * @prop {string} keywords - Extra space-separated terms the search filter matches against but never displays — e.g. keywords="dialog popup" on a Modal item.
 * @prop {string} description - Secondary line shown under the label and matched by search. Use it for the sentence that tells two similar results apart; a docs site can put the matching passage here so a query finds page content rather than only page titles.
 * @prop {string} value - Stable identifier carried on the arc-select detail. Defaults to the label, which is fine until two items share one — give anything a handler must act on its own value rather than matching against display text.
 * @slot - Default content.
 */
export class ArcCommandItem extends LitElement {
  static properties = {
    shortcut: { type: String, reflect: true },
    icon: { type: String },
    keywords: { type: String },
    description: { type: String },
    value: { type: String },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.shortcut = '';
    this.icon = '';
    this.keywords = '';
    this.description = '';
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
