import { LitElement, html, css } from 'lit';

/**
 * Groups CommandItems under a small uppercase heading in the results list. Items inside a group
 * still filter and keyboard-navigate as one flat list; headings disappear when none of their items
 * match.
 *
 * @tag arc-command-group
 * @prop {string} heading - Heading text displayed above the group’s items.
 * @slot - Default content.
 */
export class ArcCommandGroup extends LitElement {
  static properties = {
    heading: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.heading = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
