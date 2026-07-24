import { LitElement, html, css } from 'lit';

/**
 * Navigation anchor that highlights when its target section is in view.
 *
 * @tag arc-spy-link
 * @prop {string} target - ID of the section to observe
 * @prop {number} level - Nesting depth for visual indentation. Level 0 links render at default size; level 1+ links are indented and use a smaller font size.
 * @slot - Default content.
 */
export class ArcSpyLink extends LitElement {
  static properties = {
    target: { type: String, reflect: true },
    level:  { type: Number, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.target = '';
    this.level = 0;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
