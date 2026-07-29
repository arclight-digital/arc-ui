import { LitElement, html, css } from 'lit';

/**
 * An individual tab panel within a Tabs group. Each Tab renders a button in the tab bar and owns
 * its associated content panel. Use this sub-component when you need fine-grained control over
 * individual tab behavior, such as disabling a specific tab or attaching per-tab event listeners.
 *
 * @tag arc-tab
 * @prop {string} label - Text displayed on the tab button. Keep labels concise — one or two words — to prevent the tab bar from overflowing.
 * @slot - Default content.
 */
export class ArcTab extends LitElement {
  static properties = {
    label: { type: String, reflect: true },
  };

  static styles = css`
    :host { display: block; }
    :host([hidden]) { display: none; }
  `;

  constructor() {
    super();
    this.label = '';
  }

  render() {
    return html`<slot></slot>`;
  }
}
