import { LitElement, html, css } from 'lit';

/**
 * @tag arc-sidebar-link
 */
export class ArcSidebarLink extends LitElement {
  static properties = {
    href:   { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    level:  { type: Number, reflect: true },
  };

  static styles = css`
    :host { display: none; }
  `;

  constructor() {
    super();
    this.href = '';
    this.active = false;
    this.level = 0;
  }

  get label() {
    return this.textContent.trim();
  }

  render() {
    return html`<slot></slot>`;
  }
}
